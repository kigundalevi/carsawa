"use client";

import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Camera, Loader, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { carAPI } from '@/services/api';

interface CarFormData {
  name: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: 'New' | 'Used' | 'Certified Pre-Owned';
  transmission: 'Automatic' | 'Manual' | 'CVT' | 'Semi-Automatic';
  engineSize: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG' | 'LPG';
  bodyType: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Wagon' | 'Van' | 'Truck';
  color: string;
  safetyFeatures: string[];
  comfortFeatures: string[];
  images: File[];
  status: 'Available' | 'Sold' | 'Reserved';
}

export default function ListCarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CarFormData>({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    condition: 'New',
    transmission: 'Automatic',
    engineSize: '',
    fuelType: 'Petrol',
    bodyType: 'Sedan',
    color: '',
    safetyFeatures: [],
    comfortFeatures: [],
    images: [],
    status: 'Available',
  });
  const [safetyFeatureInput, setSafetyFeatureInput] = useState('');
  const [comfortFeatureInput, setComfortFeatureInput] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'mileage' || name === 'year' ? Number(value) : value,
    }));
  };

  const handleFeatureKeyDown = (e: KeyboardEvent<HTMLInputElement>, type: 'safety' | 'comfort') => {
    const inputValue = (type === 'safety' ? safetyFeatureInput : comfortFeatureInput).trim();
    const features = type === 'safety' ? formData.safetyFeatures : formData.comfortFeatures;
    const setFeatures = (newFeatures: string[]) =>
      setFormData(prev => ({ ...prev, [type === 'safety' ? 'safetyFeatures' : 'comfortFeatures']: newFeatures }));

    if ((e.key === 'Enter' || e.key === ',') && inputValue) {
      e.preventDefault();
      if (!features.includes(inputValue)) {
        setFeatures([...features, inputValue]);
      }
      type === 'safety' ? setSafetyFeatureInput('') : setComfortFeatureInput('');
    }

    if (e.key === 'Backspace' && inputValue === '' && features.length > 0) {
      setFeatures(features.slice(0, -1));
    }
  };

  const removeFeature = (featureToRemove: string, type: 'safety' | 'comfort') => {
    const features = type === 'safety' ? formData.safetyFeatures : formData.comfortFeatures;
    setFormData(prev => ({
      ...prev,
      [type === 'safety' ? 'safetyFeatures' : 'comfortFeatures']: features.filter(f => f !== featureToRemove),
    }));
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Please select only image files (JPEG, PNG, etc.)');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Some images exceed the maximum file size of 5MB');
      return;
    }

    if (formData.images.length + files.length > 10) {
      setError('You can upload a maximum of 10 images');
      return;
    }

    setError(null);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      setError('Please add at least one image of the car');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          (value as File[]).forEach((image: File) => formDataToSend.append('images', image));
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, (value as any).toString());
        }
      });

      await carAPI.createCar(formDataToSend);
      router.push('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">List Your Car</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Car Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Toyota Land Cruiser"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Make</label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. Land Cruiser"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (KSh)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 4500000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mileage (km)</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="e.g. 45000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Certified Pre-Owned">Certified Pre-Owned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Transmission</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Engine Size</label>
            <input
              type="text"
              name="engineSize"
              value={formData.engineSize}
              onChange={handleChange}
              placeholder="e.g. 2.0L"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fuel Type</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
              <option value="LPG">LPG</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Body Type</label>
            <select
              name="bodyType"
              value={formData.bodyType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Coupe">Coupe</option>
              <option value="Convertible">Convertible</option>
              <option value="Wagon">Wagon</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g. Black"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
        </div>

        {/* Safety Features Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Safety Features</label>
          <div className="relative">
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg flex flex-wrap items-center gap-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
              {formData.safetyFeatures.map(feature => (
                <span key={feature} className="flex items-center bg-primary text-sm px-2 py-1 rounded-full">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(feature, 'safety')}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={safetyFeatureInput}
                onChange={e => setSafetyFeatureInput(e.target.value)}
                onKeyDown={e => handleFeatureKeyDown(e, 'safety')}
                placeholder={formData.safetyFeatures.length === 0 ? 'Add safety features (Press Enter to add)' : ''}
                className="flex-grow outline-none bg-transparent ml-1"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Add safety features by typing and pressing Enter or comma.</p>
        </div>

        {/* Comfort Features Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Comfort Features</label>
          <div className="relative">
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg flex flex-wrap items-center gap-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
              {formData.comfortFeatures.map(feature => (
                <span key={feature} className="flex items-center bg-primary text-sm px-2 py-1 rounded-full">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(feature, 'comfort')}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={comfortFeatureInput}
                onChange={e => setComfortFeatureInput(e.target.value)}
                onKeyDown={e => handleFeatureKeyDown(e, 'comfort')}
                placeholder={formData.comfortFeatures.length === 0 ? 'Add comfort features (Press Enter to add)' : ''}
                className="flex-grow outline-none bg-transparent ml-1"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Add comfort features by typing and pressing Enter or comma.</p>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img src={url} alt={`Car preview ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-gray-500" />
              <span className="mt-2 text-sm text-gray-500">Add Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                multiple
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">Upload up to 10 images. Max 5MB per image. Supported formats: JPEG, PNG, GIF.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover text-black font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'List Car'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
