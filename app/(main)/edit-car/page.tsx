"use client";

import { useState, useEffect, FormEvent, ChangeEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Camera, Loader, ArrowLeft, X } from 'lucide-react';
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
  status: 'Available' | 'Sold' | 'Reserved';
}

interface ImageData {
  id?: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

// Create a separate component for the edit form that uses useSearchParams
function EditCarForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get the ID from query parameters instead of dynamic route
  const id = searchParams.get('id');
  

  
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
  const [images, setImages] = useState<ImageData[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    const fetchCarData = async () => {
      console.log('fetchCarData called with ID:', id);
      if (!id) {
        console.log('No ID provided in query params');
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Calling carAPI.getCarById with ID:', id);
        const car = await carAPI.getCarById(id);
        console.log('Car data received:', car);
        
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

        if (car.images && car.images.length > 0) {
          const processedImages = car.images.map((img: any) => {
            const imageId = img.id || img._id || '';
            let imageUrl = typeof img === 'string' ? img : img.url || img.path || img.secure_url || '';
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `https://carsawa-backend-6zf3.onrender.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
            return { id: imageId, url: imageUrl };
          });
          setImages(processedImages);
        }
      } catch (err) {
        console.error('Error fetching car:', err);
        console.log('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
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

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
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
      setError(null);
      const newImages = files.map(file => ({
        url: URL.createObjectURL(file),
        file,
        isNew: true
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove.isNew && imageToRemove.file) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    if (!imageToRemove.isNew) {
      setImagesToDelete(prev => [...prev, imageToRemove.url]);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) {
      setError('No car ID provided');
      return;
    }
    
    if (images.length === 0) {
      setError('Please add at least one image of the car');
      return;
    }
    if (!formData.name.trim() || !formData.make.trim() || !formData.model.trim() ||
        formData.price <= 0 || !formData.engineSize.trim() || !formData.color.trim()) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, (value as any).toString());
      });
      const newImages = images.filter(img => img.isNew && img.file);
      newImages.forEach(img => {
        if (img.file) formDataToSend.append('images', img.file);
      });
      if (imagesToDelete.length > 0) {
        formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      await carAPI.updateCar(id, formDataToSend);
      router.push('/inventory');
    } catch (err) {
      console.error('Error updating car:', err);
      setError(err instanceof Error ? err.message : 'Failed to update car listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DEBUG: Log current state
  console.log('Current state:', { isLoading, notFound, error, id });

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader className="w-8 h-8 animate-spin mr-2" />
          <h1 className="text-2xl font-bold">Loading Car Details...</h1>
        </div>
        <p className="text-sm text-gray-500">DEBUG: Loading car with ID: {id}</p>
      </div>
    );
  }

  if (notFound || !id) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
        <p className="mb-6">
          {!id 
            ? 'No car ID was provided in the URL.' 
            : 'The car listing you\'re looking for doesn\'t exist or has been removed.'
          }
        </p>
        <button
          onClick={() => router.push('/inventory')}
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
        <button onClick={() => router.push('/inventory')} className="mr-4 p-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Edit Car Listing</h1>
        <span className="ml-4 text-sm text-gray-500">DEBUG: ID: {id}</span>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium mb-2">Car Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Toyota Land Cruiser V8" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required /></div>
          <div><label className="block text-sm font-medium mb-2">Make</label><input type="text" name="make" value={formData.make} onChange={handleChange} placeholder="e.g. Toyota" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required /></div>
          <div><label className="block text-sm font-medium mb-2">Model</label><input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Land Cruiser" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required /></div>
          <div><label className="block text-sm font-medium mb-2">Year</label><select name="year" value={formData.year} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required>{Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => <option key={year} value={year}>{year}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-2">Price (KSh)</label><input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 4500000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required min="0" /></div>
          <div><label className="block text-sm font-medium mb-2">Mileage (km)</label><input type="number" name="mileage" value={formData.mileage} onChange={handleChange} placeholder="e.g. 45000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required min="0" /></div>
          <div><label className="block text-sm font-medium mb-2">Condition</label><select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required><option value="New">New</option><option value="Used">Used</option><option value="Certified Pre-Owned">Certified Pre-Owned</option></select></div>
          <div><label className="block text-sm font-medium mb-2">Transmission</label><select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required><option value="Automatic">Automatic</option><option value="Manual">Manual</option><option value="CVT">CVT</option><option value="Semi-Automatic">Semi-Automatic</option></select></div>
          <div><label className="block text-sm font-medium mb-2">Engine Size</label><input type="text" name="engineSize" value={formData.engineSize} onChange={handleChange} placeholder="e.g. 2.0L" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required /></div>
          <div><label className="block text-sm font-medium mb-2">Fuel Type</label><select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option><option value="CNG">CNG</option><option value="LPG">LPG</option></select></div>
          <div><label className="block text-sm font-medium mb-2">Body Type</label><select name="bodyType" value={formData.bodyType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required><option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="Hatchback">Hatchback</option><option value="Coupe">Coupe</option><option value="Convertible">Convertible</option><option value="Wagon">Wagon</option><option value="Van">Van</option><option value="Truck">Truck</option></select></div>
          <div><label className="block text-sm font-medium mb-2">Color</label><input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Black" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required /></div>
          <div><label className="block text-sm font-medium mb-2">Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required><option value="Available">Available</option><option value="Sold">Sold</option><option value="Reserved">Reserved</option></select></div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img src={img.url} alt={`Car preview ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Available'; }} />
                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <label className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-gray-500" />
              <span className="mt-2 text-sm text-gray-500">Add Image</span>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">Upload up to 10 images. Max 5MB per image. Supported formats: JPEG, PNG, GIF.</p>
        </div>
        <div className="pt-4 flex gap-4">
          <button type="button" onClick={() => router.push('/inventory')} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary-hover text-black font-medium py-3 rounded-lg transition-colors flex items-center justify-center">
            {isSubmitting ? (<><Loader className="w-5 h-5 mr-2 animate-spin" />Saving Changes...</>) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Loading component for Suspense fallback
function EditCarPageLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <div className="flex items-center justify-center mb-4">
        <Loader className="w-8 h-8 animate-spin mr-2" />
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function EditCarPage() {
  return (
    <Suspense fallback={<EditCarPageLoading />}>
      <EditCarForm />
    </Suspense>
  );
}