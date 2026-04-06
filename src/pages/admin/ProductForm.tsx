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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border border-rose-200 border-t-rose-500"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-600">Manage your thrift store inventory</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50/90 border border-red-200 backdrop-blur">
            <p className="text-red-700 font-medium">⚠️ {error}</p>
            {error.includes('admin') && (
              <p className="text-red-600 text-sm mt-2">
                See setup-user-profiles.sql for admin setup instructions, or ask your administrator.
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 backdrop-blur">
            <p className="text-emerald-700 font-medium">✓ Product {isEditing ? 'updated' : 'created'} successfully!</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white/80 backdrop-blur-xl border border-rose-200/70 overflow-hidden shadow-[0_20px_60px_rgba(244,114,182,0.14)]">
          <div className="p-8 space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800 mb-3">
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
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-rose-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition text-slate-900 placeholder-slate-400 backdrop-blur"
              />
            </div>

            {/* Price & Category Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-slate-800 mb-3">
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
                  className="w-full px-4 py-3 rounded-lg bg-white/90 border border-rose-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition text-slate-900 placeholder-slate-400 backdrop-blur"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-800 mb-3">
                  Category *
                </label>
                <select
                  name="category"
                  id="category"
                  value={product.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/90 border border-rose-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition text-slate-900 backdrop-blur"
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
              <label htmlFor="description" className="block text-sm font-semibold text-slate-800 mb-3">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-rose-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition text-slate-900 placeholder-slate-400 backdrop-blur resize-none"
              />
            </div>

            {/* Image Section */}
            <div className="space-y-4 bg-rose-50/70 p-6 rounded-xl border border-rose-200 backdrop-blur">
              <h3 className="text-sm font-semibold text-slate-800">Product Image *</h3>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-rose-200 group-hover:border-rose-300 transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(imageFile ? imagePreview : null);
                      setImageFile(null);
                      setProduct({ ...product, image: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Upload Input */}
              <div>
                <label htmlFor="image-file" className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  id="image-file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg
                    file:border-0 file:text-sm file:font-semibold
                    file:bg-rose-100 file:text-rose-700
                    hover:file:bg-rose-200 file:transition"
                />
                <p className="text-xs text-slate-500 mt-2">PNG, JPG up to 5MB</p>
              </div>

              {/* URL Input */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-2">
                  Or Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  value={product.image && !imageFile ? product.image : ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/90 border border-rose-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition text-slate-900 placeholder-slate-400 backdrop-blur"
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <progress
                  value={uploadProgress}
                  max={100}
                  className="w-full h-2 rounded-full overflow-hidden accent-rose-500"
                />
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white/70 px-8 py-4 flex justify-end gap-3 border-t border-rose-200/70 backdrop-blur">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 rounded-lg border border-rose-200 text-slate-700 font-medium hover:bg-rose-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-rose-200/60 flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border border-white/40 border-t-white" />}
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
