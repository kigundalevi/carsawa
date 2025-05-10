import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Loader, ArrowLeft, X } from 'lucide-react';
import { carAPI } from '../../services/api';

interface CarFormData {
  title: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  condition: 'Excellent' | 'Good' | 'Fair';
  description: string;
  status: 'active' | 'sold' | 'archived';
}

interface ImageData {
  id?: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

export function EditCarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<CarFormData>({
    title: '',
    year: new Date().getFullYear(),
    price: 0,
    location: '',
    mileage: 0,
    condition: 'Good',
    description: '',
    status: 'active'
  });
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for image handling
  const [images, setImages] = useState<ImageData[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    // Load car data from API
    const fetchCarData = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const car = await carAPI.getCarById(id);
        console.log('Fetched car data:', car);

        setFormData({
          title: car.title,
          year: car.year,
          price: car.price,
          location: car.location,
          mileage: car.mileage,
          condition: car.condition,
          description: car.description || '',
          status: car.status
        });

        // Set images from API response
        if (car.images && car.images.length > 0) {
          setImages(car.images.map((img: any) => ({
            id: img.id,
            url: img.url
          })));
        }
      } catch (err) {
        console.error('Error fetching car:', err);
        setNotFound(true);
        setError(err instanceof Error ? err.message : 'Failed to load car details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarData();
  }, [id]);

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

      // Create new image objects with preview URLs
      const newImages = files.map(file => ({
        url: URL.createObjectURL(file),
        file,
        isNew: true
      }));

      setImages(prev => [...prev, ...newImages]);
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    const imageToRemove = images[index];

    // If it's a new image with a created object URL, revoke it to prevent memory leaks
    if (imageToRemove.isNew && imageToRemove.file) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    // If it's an existing image with an ID, add it to the list of images to delete
    if (imageToRemove.id) {
      setImagesToDelete(prev => [...prev, imageToRemove.id!]);
    }

    // Remove the image from the list
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate that at least one image is present or at least one is scheduled for upload
    if (images.length === 0) {
      setError('Please add at least one image of the car');
      return;
    }

    // Basic form validation
    if (!formData.title.trim()) {
      setError('Car title is required');
      return;
    }

    if (formData.price <= 0) {
      setError('Please enter a valid price');
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

      // Append new images
      const newImages = images.filter(img => img.isNew && img.file);
      newImages.forEach(img => {
        if (img.file) {
          formDataToSend.append('newImages', img.file);
        }
      });

      // Append existing image IDs to keep
      const existingImageIds = images
        .filter(img => img.id && !img.isNew)
        .map(img => img.id);
      formDataToSend.append('existingImages', JSON.stringify(existingImageIds));

      // Append image IDs to delete
      formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));

      // Send data to API
      await carAPI.updateCar(id!, formDataToSend);

      // Navigate to inventory page on success
      navigate('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update car listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader className="w-8 h-8 animate-spin mr-2" />
          <h1 className="text-2xl font-bold">Loading Car Details...</h1>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
        <p className="mb-6">The car listing you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/inventory')}
          className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/inventory')}
          className="mr-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Edit Car Listing</h1>
      </div>
      
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
          
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="archived">Archived</option>
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
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img src={img.url} alt={`Car preview ${index + 1}`} className="w-full h-full object-cover" />
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
        
        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary-hover text-black font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}