import { useState, FormEvent, ChangeEvent } from 'react';
import { Camera, Loader, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { carAPI } from '../../services/api';

interface CarFormData {
  title: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  condition: 'Excellent' | 'Good' | 'Fair';
  description: string;
}

export function ListCarForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CarFormData>({
    title: '',
    year: new Date().getFullYear(),
    price: 0,
    location: '',
    mileage: 0,
    condition: 'Good',
    description: '',
  });
  
  // State for image uploads
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'mileage' || name === 'year' ? Number(value) : value
    }));
  };

  // Handle image selection
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Validate file types
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setError('Please select only image files (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB per file)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('Some images exceed the maximum file size of 5MB');
        return;
      }
      
      setError(null);
      
      // Update selected files
      setSelectedImages(prev => [...prev, ...files]);
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    // Remove the image and its preview
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one image is selected
    if (selectedImages.length === 0) {
      setError('Please add at least one image of the car');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData object to send files and form data
      const formDataToSend = new FormData();
      
      // Append car details
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      // Append images
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      // Send data to API
      await carAPI.createCar(formDataToSend);
      
      // Navigate to inventory page on success
      navigate('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">List Your Car</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Car Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 2020 Toyota Land Cruiser V8"
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
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Nairobi, Kenya"
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
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide details about your car..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
            required
          ></textarea>
        </div>
        
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
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Upload up to 10 images. Max 5MB per image. Supported formats: JPEG, PNG, GIF.
          </p>
        </div>
        
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
              'List Your Car'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}