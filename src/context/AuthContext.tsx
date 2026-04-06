import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { hasSupabaseEnv, supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, userData: { fullName: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: { fullName?: string; phone?: string; avatarUrl?: string }) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Detect mobile device for faster timeouts
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  useEffect(() => {
    // Set shorter loading timeout for mobile devices
    const mobileTimeout = setTimeout(() => {
      if (isLoading && isMobile) {
        console.log('Mobile: Auth loading timeout, finishing early');
        setIsLoading(false);
      }
    }, 3000); // 3 seconds for mobile vs 10+ for desktop

    return () => clearTimeout(mobileTimeout);
  }, [isLoading, isMobile]);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      console.warn('Auth disabled: missing Supabase environment variables.');
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const fetchAndSetAdmin = async (userId: string) => {
      try {
        console.log('Checking admin status for user:', userId);
        
        // Offline admin emails - works even without Supabase
        const adminEmails = [
          'jupitervalorant15@gmail.com',
          'hemxanthh@gmail.com',
          'admin@test.com'
        ];
        
        // Check for temporary admin override (for testing)
        const adminOverride = localStorage.getItem('temp-admin-mode');
        if (adminOverride === 'true') {
          console.log('User is admin via temporary override');
          setIsAdmin(true);
          return;
        }
        
        // Try to get user email with timeout protection (shorter for mobile)
        try {
          const userPromise = supabase.auth.getUser();
          const mobileTimeout = isMobile ? 1000 : 2000; // 1s mobile, 2s desktop
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), mobileTimeout)
          );
          
          const { data: { user: currentUser } } = await Promise.race([userPromise, timeoutPromise]) as any;
          
          if (currentUser && adminEmails.includes(currentUser.email || '')) {
            console.log('User is admin by email check (online):', currentUser.email);
            setIsAdmin(true);
            return; // Skip database check if email-based admin
          }
        } catch (authError) {
          console.warn('Supabase auth unavailable, checking localStorage:', authError);
          
          // Fallback: Check localStorage for logged in user email
          const storedSession = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
          if (storedSession) {
            try {
              const session = JSON.parse(storedSession);
              const userEmail = session?.user?.email;
              if (userEmail && adminEmails.includes(userEmail)) {
                console.log('User is admin by localStorage check (offline):', userEmail);
                setIsAdmin(true);
                return;
              }
            } catch (parseError) {
              console.warn('Could not parse stored session:', parseError);
            }
          }
        }
        
        // Only check database for non-admin emails (optional secondary check)
        console.log('Email not in admin list, checking database...');
        try {
          const dbCheckPromise = supabase
            .from('user_profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();
            
          const timeoutDuration = isMobile ? 2000 : (window.location.hostname === 'localhost' ? 5000 : 15000);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), timeoutDuration)
          );
          
          const { data, error } = await Promise.race([dbCheckPromise, timeoutPromise]) as any;
          
          if (error) {
            console.error('Error fetching admin status:', error);
            setIsAdmin(false);
          } else {
            console.log('Admin check result from database:', { data });
            setIsAdmin(Boolean(data?.is_admin));
          }
        } catch (dbError) {
          console.warn('Database admin check failed, defaulting to false:', dbError);
          setIsAdmin(false);
        }
      } catch (e) {
        console.error('Exception fetching admin status:', e);
        setIsAdmin(false);
      }
    };

    const bootstrap = async () => {
      try {
        console.log('AuthProvider: Starting bootstrap...');
        
        let session = null;
        let currentUser = null;
        
        // Mobile optimization: Check localStorage first for faster loading
        if (isMobile) {
          try {
            console.log('Mobile: Checking localStorage first for faster loading...');
            const storedSession = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
            if (storedSession) {
              const parsed = JSON.parse(storedSession);
              if (parsed?.user && parsed?.access_token) {
                console.log('Mobile: Found stored session, using immediately');
                currentUser = parsed.user;
                session = {
                  user: parsed.user,
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token,
                  expires_at: parsed.expires_at,
                  expires_in: parsed.expires_in,
                  token_type: parsed.token_type
                };
                
                // Set user immediately for mobile
                setSession(session);
                setUser(currentUser);
                
                // Quick admin check for mobile
                const adminEmails = ['jupitervalorant15@gmail.com', 'hemxanthh@gmail.com', 'admin@test.com'];
                if (currentUser && adminEmails.includes(currentUser.email || '')) {
                  console.log('Mobile: Quick admin check passed:', currentUser.email);
                  setIsAdmin(true);
                }
                
                setIsLoading(false);
                return; // Skip online check for mobile if localStorage works
              }
            }
          } catch (storageError) {
            console.warn('Mobile: localStorage check failed, falling back to online:', storageError);
          }
        }
        
        try {
          // Try to get session with mobile-optimized timeout
          const mobileConnectionTimeout = isMobile ? 1500 : 3000; // 1.5s mobile, 3s desktop
          const connectionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Supabase connection timeout')), mobileConnectionTimeout)
          );
          
          const sessionPromise = supabase.auth.getSession();
          const result = await Promise.race([sessionPromise, connectionTimeout]) as any;
          session = result.data?.session;
          currentUser = session?.user ?? null;
          
          console.log('AuthProvider: Online session retrieved');
        } catch (sessionError) {
          console.warn('AuthProvider: Cannot get session from Supabase, checking localStorage:', sessionError);
          
          // Fallback: Try to get user from localStorage
          try {
            const storedSession = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
            if (storedSession) {
              const parsed = JSON.parse(storedSession);
              if (parsed?.user && parsed?.access_token) {
                console.log('AuthProvider: Found stored session, creating offline user');
                currentUser = parsed.user;
                // Create a mock session for offline use
                session = {
                  user: parsed.user,
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token,
                  expires_at: parsed.expires_at,
                  expires_in: parsed.expires_in,
                  token_type: parsed.token_type
                };
              }
            }
          } catch (storageError) {
            console.warn('AuthProvider: Could not parse stored session:', storageError);
          }
        }
        
        setSession(session);
        setUser(currentUser);
        
        if (currentUser) {
          console.log('AuthProvider: User found, checking admin status...');
          try {
            // Add timeout to prevent hanging - mobile-optimized
            const adminTimeout = isMobile ? 3000 : (window.location.hostname === 'localhost' ? 8000 : 20000);
            await Promise.race([
              fetchAndSetAdmin(currentUser.id),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Admin check timeout')), adminTimeout)
              )
            ]);
          } catch (adminError) {
            console.error('AuthProvider: Admin check failed:', adminError);
            setIsAdmin(false);
          }
        } else {
          console.log('AuthProvider: No user found');
          setIsAdmin(false);
        }
        
        console.log('AuthProvider: Bootstrap completed');
        setIsLoading(false);
      } catch (error) {
        console.error('AuthProvider: Bootstrap failed:', error);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    // Initialize auth without overall timeout (let individual operations timeout)
    bootstrap().catch((error) => {
      console.error('AuthProvider: Bootstrap failed:', error);
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await fetchAndSetAdmin(nextUser.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: { fullName: string }) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (data: { fullName?: string; phone?: string; avatarUrl?: string }) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updates = {
        id: user.id,
        updated_at: new Date().toISOString(),
        ...data,
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(updates);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
