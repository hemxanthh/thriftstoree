import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/Product';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          setError(`Failed to load product: ${error.message}`);
        } else if (data) {
          setProduct(data);
          setImagePreview(data.image);
        }
        setLoading(false);
      };
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setError(null);
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setProduct({ ...product, [name]: checked });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      // Validate required fields
      if (!product.name?.trim()) {
        throw new Error('Product name is required');
      }
      if (!product.price || product.price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      if (!product.category) {
        throw new Error('Category is required');
      }

      // Require at least one image source: URL or uploaded file
      if (!imageFile && !product.image) {
        throw new Error('Please add an image or upload a file');
      }

      let imageUrl = product.image || '';

      // If a local image file is selected, upload it to Supabase Storage
      if (imageFile) {
        setUploadProgress(30);
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          if (uploadError.message?.includes('row-level security policy')) {
            throw new Error('Admin access required. Please contact the administrator or check your admin permissions in the database.');
          }
          throw uploadError;
        }

        setUploadProgress(70);
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const productData = {
        ...product,
        image: imageUrl,
        price: Number(product.price),
      };

      setUploadProgress(80);
      let response;
      if (isEditing) {
        response = await supabase.from('products').update(productData).eq('id', id);
      } else {
        response = await supabase.from('products').insert(productData);
      }

      if (response.error) {
        if (response.error.message?.includes('row-level security policy')) {
          throw new Error('You don\'t have permission to add products. Check the setup guide to enable admin access.');
        }
        throw response.error;
      }

      setUploadProgress(100);
      setSuccess(true);
      window.dispatchEvent(new Event('products:changed'));
      
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save product', err);
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border border-white/30 border-t-white"></div>
          <p className="mt-4 text-white/60 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-white/50">Manage your thrift store inventory</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur">
            <p className="text-red-300 font-medium">⚠️ {error}</p>
            {error.includes('admin') && (
              <p className="text-red-200/70 text-sm mt-2">
                See setup-user-profiles.sql for admin setup instructions, or ask your administrator.
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 backdrop-blur">
            <p className="text-green-300 font-medium">✓ Product {isEditing ? 'updated' : 'created'} successfully!</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden shadow-2xl">
          <div className="p-8 space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white mb-3">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={product.name}
                onChange={handleChange}
                placeholder="e.g., Vintage Denim Jacket"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-white/40 focus:bg-white/10 outline-none transition text-white placeholder-white/40 backdrop-blur"
              />
            </div>

            {/* Price & Category Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-white mb-3">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={product.price}
                  onChange={handleChange}
                  placeholder="999"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-white/40 focus:bg-white/10 outline-none transition text-white placeholder-white/40 backdrop-blur"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-white mb-3">
                  Category *
                </label>
                <select
                  name="category"
                  id="category"
                  value={product.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-white/40 focus:bg-white/10 outline-none transition text-white backdrop-blur"
                >
                  <option value="">Select category</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="shoes">Shoes</option>
                  <option value="bags">Bags</option>
                  <option value="men">Men Wears</option>
                  <option value="women">Women</option>
                  <option value="ethnic">Ethnic Wears</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-white mb-3">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-white/40 focus:bg-white/10 outline-none transition text-white placeholder-white/40 backdrop-blur resize-none"
              />
            </div>

            {/* Image Section */}
            <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur">
              <h3 className="text-sm font-semibold text-white">Product Image *</h3>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-white/20 group-hover:border-white/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(imageFile ? imagePreview : null);
                      setImageFile(null);
                      setProduct({ ...product, image: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-2 transition backdrop-blur"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Upload Input */}
              <div>
                <label htmlFor="image-file" className="block text-sm font-medium text-white/80 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  id="image-file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-white/60
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg
                    file:border-0 file:text-sm file:font-semibold
                    file:bg-cyan-500/20 file:text-cyan-300
                    hover:file:bg-cyan-500/30 file:transition file:backdrop-blur"
                />
                <p className="text-xs text-white/40 mt-2">PNG, JPG up to 5MB</p>
              </div>

              {/* URL Input */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-white/80 mb-2">
                  Or Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  value={product.image && !imageFile ? product.image : ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-white/40 focus:bg-white/10 outline-none transition text-white placeholder-white/40 backdrop-blur"
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    {/* Dynamic width calculated in real-time - inline style necessary for real-time progress */}
                    {/* eslint-disable-next-line react/no-unknown-property */}
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white/5 px-8 py-4 flex justify-end gap-3 border-t border-white/10 backdrop-blur">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 rounded-lg border border-white/20 text-white/80 font-medium hover:bg-white/5 hover:border-white/40 transition backdrop-blur"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white font-medium hover:from-cyan-500/40 hover:to-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition backdrop-blur border border-cyan-500/30 hover:border-cyan-500/50 flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border border-white/30 border-t-white" />}
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
