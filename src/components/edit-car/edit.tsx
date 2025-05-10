import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Loader, ArrowLeft, X } from 'lucide-react';
import { carAPI } from '../../services/api';

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
  status: 'Available' | 'Sold' | 'Reserved';
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
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    condition: 'Used',
    transmission: 'Automatic',
    engineSize: '',
    fuelType: 'Petrol',
    bodyType: 'Sedan',
    color: '',
    status: 'Available'
  });
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for image handling
  const [images, setImages] = useState<ImageData[]>([]);
  // We're not using imagesToDelete for API requests currently, but we use setImagesToDelete in removeImage function
  const [, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    // Load car data from API
    const fetchCarData = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const car = await carAPI.getCarById(id);
        console.log('Fetched car data:', car);
        console.log('Image data structure:', car.images ? JSON.stringify(car.images, null, 2) : 'No images');
        
        // Log each image object/format to understand the structure
        if (car.images && car.images.length > 0) {
          car.images.forEach((img: any, index: number) => {
            console.log(`Image ${index} structure:`, img);
            console.log(`Image ${index} keys:`, img ? Object.keys(img) : 'Not an object');
          });
        }

        setFormData({
          name: car.name || '',
          make: car.make || '',
          model: car.model || '',
          year: car.year || new Date().getFullYear(),
          price: car.price || 0,
          mileage: car.mileage || 0,
          condition: car.condition || 'Used',
          transmission: car.transmission || 'Automatic',
          engineSize: car.engineSize || '',
          fuelType: car.fuelType || 'Petrol',
          bodyType: car.bodyType || 'Sedan',
          color: car.color || '',
          status: car.status || 'Available'
        });

        // Set images from API response
        if (car.images && car.images.length > 0) {
          console.log('Raw car images data:', JSON.stringify(car.images));
          
          const processedImages = car.images.map((img: any) => {
            // Handle different image data structures
            const imageId = img.id || img._id || '';
            let imageUrl = '';
            
            // Handle different possible URL formats in the database
            if (typeof img === 'string') {
              imageUrl = img;
            } else if (img.url) {
              imageUrl = img.url;
            } else if (img.path) {
              imageUrl = img.path;
            } else if (img.secure_url) {
              imageUrl = img.secure_url;
            }
            
            // If image URL doesn't start with http, prepend the backend URL
            if (imageUrl && !imageUrl.startsWith('http')) {
              // Make sure we don't duplicate slashes
              if (imageUrl.startsWith('/')) {
                imageUrl = `https://carsawa-backend-6zf3.onrender.com${imageUrl}`;
              } else {
                imageUrl = `https://carsawa-backend-6zf3.onrender.com/${imageUrl}`;
              }
            }
            
            console.log(`Processing image ID: ${imageId}, URL: ${imageUrl}`);
            
            return {
              id: imageId,
              url: imageUrl
            };
          });
          
          console.log('Processed images:', processedImages);
          setImages(processedImages);
        } else {
          console.log('No images found for this car');
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
    if (!formData.name.trim()) {
      setError('Car name is required');
      return;
    }
    
    if (!formData.make.trim()) {
      setError('Car make is required');
      return;
    }
    
    if (!formData.model.trim()) {
      setError('Car model is required');
      return;
    }
    
    if (formData.price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!formData.engineSize.trim()) {
      setError('Engine size is required');
      return;
    }
    
    if (!formData.color.trim()) {
      setError('Car color is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData object to send files and form data
      const formDataToSend = new FormData();
      
      // Append car details
      console.log('Submitting form data:', formData);
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Append new images - NOTE: Backend expects 'images' not 'newImages'
      const newImages = images.filter(img => img.isNew && img.file);
      console.log('New images to upload:', newImages.length);
      
      // When uploading multiple files with the same field name,
      // they should all be included in the request as separate parts
      newImages.forEach((img, index) => {
        if (img.file) {
          console.log(`Adding image ${index + 1} to form data`);
          formDataToSend.append('images', img.file);
        }
      });
      
      // IMPORTANT: Always keep existing images to prevent overwriting
      // This ensures new uploads ADD to existing images instead of replacing them
      formDataToSend.append('keepExistingImages', 'true');
      
      // Log how many existing images we're keeping
      const existingImagesCount = images.filter(img => img.id && !img.isNew).length;
      console.log(`Keeping ${existingImagesCount} existing images`);
      
      // Log the total expected image count after update
      console.log(`Total expected images after update: ${existingImagesCount + newImages.length}`);
      
      // Log what we're doing with existing images
      if (existingImagesCount > 0) {
        console.log('Keeping existing images from the database');
        
        // Since we're already appending new image files with the field name 'images',
        // we don't need to explicitly list the existing ones - the backend will preserve
        // them based on the keepExistingImages flag
      } else {
        console.log('No existing images to keep');
      }
      
      // We don't handle imagesToDelete right now as the backend doesn't seem to process them
      // Instead we're just including the images we want to keep
      
      // Debug what we're sending to the API
      console.log('Submitting update to car ID:', id);
      console.log('FormData fields being sent:', Array.from(formDataToSend.keys()));
      
      try {
        // Send data to API
        const result = await carAPI.updateCar(id!, formDataToSend);
        console.log('Car updated successfully, response:', result);
        
        // Clear any error and navigate to inventory page on success
        setError(null);
        navigate('/inventory');
      } catch (updateErr) {
        console.error('API Error when updating car:', updateErr);
        setError(`Error updating car: ${updateErr instanceof Error ? updateErr.message : 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating car:', err);
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
            <label className="block text-sm font-medium mb-2">Car Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Toyota Land Cruiser V8"
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


        
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={img.url} 
                  alt={`Car preview ${index + 1}`} 
                  className="w-full h-full object-cover" 
                  onLoad={() => console.log(`Image loaded successfully: ${img.url}`)}
                  onError={(e) => {
                    // Handle image loading errors
                    console.error(`Failed to load image at ${img.url}`);
                    
                    // Try an alternative URL format
                    if (img.url.includes('carsawa-backend')) {
                      // Try without the /api prefix that might be missing
                      const altUrl = img.url.replace('carsawa-backend-6zf3.onrender.com', 'carsawa-backend-6zf3.onrender.com/api');
                      console.log(`Trying alternative URL: ${altUrl}`);
                      e.currentTarget.src = altUrl;
                      
                      // Add a second error handler for the alternative URL
                      e.currentTarget.onerror = () => {
                        console.error(`Alternative URL also failed: ${altUrl}`);
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                        e.currentTarget.onerror = null; // Prevent infinite loop
                      };
                    } else {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    }
                  }}
                />
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