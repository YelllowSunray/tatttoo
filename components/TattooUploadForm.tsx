'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadTattoo, getArtistByUserId } from '@/lib/artist';
import { uploadImage, getTattooImagePath } from '@/lib/storage';
import { Tattoo } from '@/types';

interface TattooUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TattooUploadForm({ onSuccess, onCancel }: TattooUploadFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    description: '',
    price: '',
    location: '',
    style: '',
    tags: '',
    bodyPart: '',
    color: true,
    size: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) {
      setError('Please select an image and ensure you are logged in');
      return;
    }

    // Validate required fields
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price is required and must be greater than 0');
      return;
    }
    if (!formData.size.trim()) {
      setError('Size is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get or verify artist profile
      const artist = await getArtistByUserId(user.uid);
      if (!artist) {
        setError('Please set up your artist profile first');
        setLoading(false);
        return;
      }

      // Upload image first (we'll use a temp ID for the path)
      const tempTattooId = `temp_${Date.now()}`;
      const imagePath = getTattooImagePath(user.uid, tempTattooId, selectedFile.name);
      const imageUrl = await uploadImage(selectedFile, imagePath);

      // Create tattoo document (this will generate the actual ID)
      const tattooData: Omit<Tattoo, 'id' | 'createdAt' | 'updatedAt'> = {
        artistId: artist.id,
        imageUrl,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        location: formData.location.trim() || undefined,
        size: formData.size.trim(),
        style: formData.style || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        bodyPart: formData.bodyPart || undefined,
        color: formData.color,
      };

      await uploadTattoo(tattooData);

      // Reset form
      setFormData({
        description: '',
        price: '',
        location: '',
        style: '',
        tags: '',
        bodyPart: '',
        color: true,
        size: '',
      });
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload tattoo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="mb-3 block text-xs font-medium text-black/60 uppercase tracking-wider">
          Tattoo Image <span className="text-black">*</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-black file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-medium file:text-white file:uppercase file:tracking-wider hover:file:bg-black/90 focus:border-black focus:outline-none transition-colors"
        />
        {preview && (
          <div className="mt-6 border border-black/10">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-3 block text-xs font-medium text-black/60 uppercase tracking-wider">
          Description <span className="text-black">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
          className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-black placeholder-black/30 focus:border-black focus:outline-none transition-colors resize-none"
          placeholder="Describe this tattoo..."
        />
      </div>

      <div>
        <label htmlFor="price" className="mb-3 block text-xs font-medium text-black/60 uppercase tracking-wider">
          Price (€) <span className="text-black">*</span>
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
          className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-black placeholder-black/30 focus:border-black focus:outline-none transition-colors"
          placeholder="0.00"
        />
      </div>

      <div>
        <label htmlFor="location" className="mb-3 block text-xs font-medium text-black/60 uppercase tracking-wider">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-black placeholder-black/30 focus:border-black focus:outline-none transition-colors"
          placeholder="City, Country (optional)"
        />
        <p className="mt-2 text-xs text-black/40">
          If not specified, your artist location will be used
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <label htmlFor="style" className="mb-3 block text-xs font-medium text-black/60 uppercase tracking-wider">
            Style
          </label>
          <input
            id="style"
            type="text"
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
            className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-black placeholder-black/30 focus:border-black focus:outline-none transition-colors"
            placeholder="Realism, Traditional, etc."
          />
        </div>

        <div>
          <label htmlFor="bodyPart" className="mb-3 block text-xs font-medium text-black/60 uppercase tracking-wider">
            Body Part
          </label>
          <select
            id="bodyPart"
            value={formData.bodyPart}
            onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
            className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-black focus:border-black focus:outline-none transition-colors"
          >
            <option value="">Select...</option>
            <option value="Arm">Arm</option>
            <option value="Leg">Leg</option>
            <option value="Back">Back</option>
            <option value="Chest">Chest</option>
            <option value="Hand">Hand</option>
            <option value="Foot">Foot</option>
            <option value="Neck">Neck</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <label htmlFor="size" className="mb-3 block text-xs font-medium text-black/60 uppercase tracking-wider">
            Size <span className="text-black">*</span>
          </label>
          <input
            id="size"
            type="text"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
            className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-black placeholder-black/30 focus:border-black focus:outline-none transition-colors"
            placeholder="Small, Medium, Large, or dimensions"
          />
        </div>

        <div>
          <label htmlFor="tags" className="mb-3 block text-xs font-medium text-black/60 uppercase tracking-wider">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-black placeholder-black/30 focus:border-black focus:outline-none transition-colors"
            placeholder="blackwork, nature, geometric"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.checked })}
            className="h-4 w-4 border-black/20 text-black focus:ring-black"
          />
          <span className="text-xs font-medium text-black/60 uppercase tracking-wider">Color tattoo</span>
        </label>
      </div>

      {error && (
        <div className="border border-black/20 bg-black/5 p-4 text-sm text-black">
          {error}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading || !selectedFile || !formData.description.trim() || !formData.price || !formData.size.trim()}
          className="flex-1 rounded-full bg-black px-6 py-4 text-xs font-medium text-white transition-all hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {loading ? 'Uploading...' : 'Upload Tattoo'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-black px-6 py-4 text-xs font-medium text-black transition-all hover:bg-black hover:text-white disabled:opacity-50 uppercase tracking-wider"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

