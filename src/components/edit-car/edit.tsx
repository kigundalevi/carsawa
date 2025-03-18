import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Loader, ArrowLeft } from 'lucide-react';

interface CarFormData {
  title: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  condition: 'Excellent' | 'Good' | 'Fair';
  description: string;
  images: string[];
  status: 'active' | 'sold' | 'archived';
}

export function EditCarPage() {
  const { id } = useParams<{ id: string }>();
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
    images: ['https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80'],
    status: 'active'
  });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Load car data from localStorage
    const inventory = JSON.parse(localStorage.getItem('carInventory') || '[]');
    const car = inventory.find((car: any) => car.id === id);
    
    if (car) {
      setFormData({
        title: car.title,
        year: car.year,
        price: car.price,
        location: car.location,
        mileage: car.mileage,
        condition: car.condition,
        description: car.description || '',
        images: car.images ? car.images : [car.image],
        status: car.status
      });
    } else {
      setNotFound(true);
    }
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'mileage' || name === 'year' ? Number(value) : value
    }));
  };

  const handleAddImage = () => {
    // In a real implementation, this would handle image upload
    // For now, we'll just add a placeholder
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80']
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Get current inventory
      const inventory = JSON.parse(localStorage.getItem('carInventory') || '[]');
      
      // Update the car listing
      const updatedInventory = inventory.map((car: any) => {
        if (car.id === id) {
          return {
            ...car,
            title: formData.title,
            year: formData.year,
            price: formData.price,
            location: formData.location,
            mileage: formData.mileage,
            condition: formData.condition,
            description: formData.description,
            image: formData.images[0],
            images: formData.images,
            status: formData.status
          };
        }
        return car;
      });
      
      localStorage.setItem('carInventory', JSON.stringify(updatedInventory));
      
      // Add to recent activities
      const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      const newActivity = {
        id: Date.now().toString(),
        message: `Updated car listing: ${formData.title}`,
        time: 'Just now',
        type: 'listing'
      };
      localStorage.setItem('recentActivities', JSON.stringify([newActivity, ...recentActivities]));
      
      setIsSubmitting(false);
      navigate('/inventory');
    }, 1000);
  };

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
            {formData.images.map((img, index) => (
              <div key={index} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img src={img} alt={`Car preview ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddImage}
              className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors"
            >
              <Camera className="w-8 h-8 text-gray-500" />
              <span className="mt-2 text-sm text-gray-500">Add Image</span>
            </button>
          </div>
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