import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzdkyyba';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'thrift-store-contact-page',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitStatus('success');
      setSubmitMessage('Message sent successfully. We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form submit error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Unable to send message right now. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="pt-16 bg-neutral-950 text-white">
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(148,163,184,0.16),transparent_30%),linear-gradient(145deg,#050507_0%,#0f172a_65%,#0a1120_100%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] px-7 py-12 sm:px-12 sm:py-14">
            <p className="text-[11px] tracking-[0.26em] uppercase text-neutral-300 mb-6">Private Concierge</p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight mb-7">Let’s Talk</h1>
            <p className="text-lg sm:text-2xl text-neutral-200/90 leading-relaxed max-w-3xl mx-auto">
              Reach us for sizing support, sourcing requests, or order assistance.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-[linear-gradient(180deg,#0b1020_0%,#0a0f1a_100%)] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 lg:gap-11">
            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_10px_60px_rgba(0,0,0,0.35)]">
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-7">Send a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-200 mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-200 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-neutral-200 mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-200 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-white/90 text-neutral-950 text-sm font-medium tracking-[0.08em] hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                </button>

                {submitStatus && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      submitStatus === 'success'
                        ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
                        : 'border-red-300/40 bg-red-500/10 text-red-100'
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl p-7 sm:p-9 text-white shadow-[0_10px_60px_rgba(0,0,0,0.35)]">
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-7">Contact Information</h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4 rounded-xl border border-white/15 bg-white/10 p-4">
                  <div className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-neutral-100" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-100 mb-1">Email</h3>
                    <p className="text-neutral-300 text-sm">hello@vintage.com</p>
                    <p className="text-neutral-300 text-sm">support@vintage.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/15 bg-white/10 p-4">
                  <div className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-neutral-100" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-100 mb-1">Phone</h3>
                    <p className="text-neutral-300 text-sm">(555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/15 bg-white/10 p-4">
                  <div className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-neutral-100" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-100 mb-1">Address</h3>
                    <p className="text-neutral-300 text-sm">
                      123 Vintage Street<br />
                      Fashion District<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/15 bg-white/10 p-4">
                  <div className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-neutral-100" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-100 mb-1">Hours</h3>
                    <p className="text-neutral-300 text-sm">
                      Monday - Friday: 10am - 8pm<br />
                      Saturday: 10am - 6pm<br />
                      Sunday: 12pm - 5pm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;