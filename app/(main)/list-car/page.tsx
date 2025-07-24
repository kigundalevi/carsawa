"use client";

import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Camera, Loader, X, Plus } from 'lucide-react';
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

  // Predefined feature options for quick selection
  const commonSafetyFeatures = [
    'ABS', 'Airbags', 'Electronic Stability Control', 'Traction Control',
    'Blind Spot Monitoring', 'Lane Departure Warning', 'Parking Sensors',
    'Backup Camera', 'Anti-theft System', 'Central Locking'
  ];

  const commonComfortFeatures = [
    'Air Conditioning', 'Power Steering', 'Power Windows', 'Leather Seats',
    'Heated Seats', 'Sunroof', 'Navigation System', 'Bluetooth',
    'USB Ports', 'Premium Sound System', 'Cruise Control', 'Keyless Entry'
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'mileage' || name === 'year' ? Number(value) : value,
    }));
  };

  // Enhanced feature adding function that handles multiple separators
  const addFeature = (feature: string, type: 'safety' | 'comfort') => {
    const trimmedFeature = feature.trim();
    if (!trimmedFeature) return;

    const currentFeatures = type === 'safety' ? formData.safetyFeatures : formData.comfortFeatures;
    
    // Split by common separators and clean up
    const newFeatures = trimmedFeature
      .split(/[,;|\n]+/)
      .map(f => f.trim())
      .filter(f => f && !currentFeatures.includes(f));

    if (newFeatures.length > 0) {
      setFormData(prev => ({
        ...prev,
        [type === 'safety' ? 'safetyFeatures' : 'comfortFeatures']: [...currentFeatures, ...newFeatures]
      }));
    }

    // Clear input
    if (type === 'safety') {
      setSafetyFeatureInput('');
    } else {
      setComfortFeatureInput('');
    }
  };

  const handleFeatureKeyDown = (e: KeyboardEvent<HTMLInputElement>, type: 'safety' | 'comfort') => {
    const inputValue = type === 'safety' ? safetyFeatureInput : comfortFeatureInput;
    const features = type === 'safety' ? formData.safetyFeatures : formData.comfortFeatures;

    // Handle Enter, comma, semicolon, or pipe as separators
    if (['Enter', ',', ';', '|'].includes(e.key)) {
      e.preventDefault();
      addFeature(inputValue, type);
    }

    // Handle backspace to remove last feature when input is empty
    if (e.key === 'Backspace' && inputValue.trim() === '' && features.length > 0) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        [type === 'safety' ? 'safetyFeatures' : 'comfortFeatures']: features.slice(0, -1)
      }));
    }
  };

  // Handle input blur to add feature when user clicks away
  const handleFeatureBlur = (type: 'safety' | 'comfort') => {
    const inputValue = type === 'safety' ? safetyFeatureInput : comfortFeatureInput;
    if (inputValue.trim()) {
      addFeature(inputValue, type);
    }
  };

  // Add feature from predefined list
  const addPredefinedFeature = (feature: string, type: 'safety' | 'comfort') => {
    const currentFeatures = type === 'safety' ? formData.safetyFeatures : formData.comfortFeatures;
    if (!currentFeatures.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        [type === 'safety' ? 'safetyFeatures' : 'comfortFeatures']: [...currentFeatures, feature]
      }));
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

        {/* Enhanced Safety Features Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Safety Features</label>
          
          {/* Custom Input with Add Button */}
          <div className="mb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg flex flex-wrap items-center gap-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent min-h-[42px]">
                  {formData.safetyFeatures.map(feature => (
                    <span key={feature} className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature, 'safety')}
                        className="ml-1 text-blue-600 hover:text-red-500"
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
                    onBlur={() => handleFeatureBlur('safety')}
                    placeholder={formData.safetyFeatures.length === 0 ? 'Type safety feature...' : ''}
                    className="flex-grow outline-none bg-transparent min-w-[120px]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => addFeature(safetyFeatureInput, 'safety')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                disabled={!safetyFeatureInput.trim()}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Quick Select Options */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Quick select common features:</p>
            <div className="flex flex-wrap gap-2">
              {commonSafetyFeatures
                .filter(feature => !formData.safetyFeatures.includes(feature))
                .map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => addPredefinedFeature(feature, 'safety')}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    + {feature}
                  </button>
                ))
              }
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Type features and click "Add" button, or use quick select options above. You can also separate multiple features with commas.
          </p>
        </div>

        {/* Enhanced Comfort Features Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Comfort Features</label>
          
          {/* Custom Input with Add Button */}
          <div className="mb-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg flex flex-wrap items-center gap-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent min-h-[42px]">
                  {formData.comfortFeatures.map(feature => (
                    <span key={feature} className="flex items-center bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature, 'comfort')}
                        className="ml-1 text-green-600 hover:text-red-500"
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
                    onBlur={() => handleFeatureBlur('comfort')}
                    placeholder={formData.comfortFeatures.length === 0 ? 'Type comfort feature...' : ''}
                    className="flex-grow outline-none bg-transparent min-w-[120px]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => addFeature(comfortFeatureInput, 'comfort')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                disabled={!comfortFeatureInput.trim()}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Quick Select Options */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Quick select common features:</p>
            <div className="flex flex-wrap gap-2">
              {commonComfortFeatures
                .filter(feature => !formData.comfortFeatures.includes(feature))
                .map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => addPredefinedFeature(feature, 'comfort')}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    + {feature}
                  </button>
                ))
              }
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Type features and click "Add" button, or use quick select options above. You can also separate multiple features with commas.
          </p>
        </div>

        {/* Images Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Car Images</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Click to upload images</p>
              <p className="text-sm text-gray-500">Maximum 10 images, 5MB each</p>
            </label>
          </div>
          
          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin w-5 h-5" />
              Listing Car...
            </>
          ) : (
            'List Car'
          )}
        </button>
      </form>
    </div>
  );
}