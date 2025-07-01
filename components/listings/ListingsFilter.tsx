import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface FilterProps {
  filters: {
    make: string;
    minPrice: string;
    maxPrice: string;
    minYear: string;
    maxYear: string;
    condition: string;
  };
  onFilterChange: (filters: any) => void;
}

export function ListingsFilter({ filters, onFilterChange }: FilterProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setSelectedConditions(filters.condition ? [filters.condition] : []);
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { ...localFilters, [name]: value };
    setLocalFilters(updatedFilters);
    
    // If it's a search input, apply filter immediately
    if (name === 'make') {
      onFilterChange(updatedFilters);
    }
  };

  const handleConditionChange = (condition: string) => {
    let newConditions: string[];
    
    // For simplicity, we'll only allow one condition at a time
    if (selectedConditions.includes(condition)) {
      newConditions = [];
    } else {
      newConditions = [condition];
    }
    
    setSelectedConditions(newConditions);
    
    const updatedFilters = {
      ...localFilters,
      condition: newConditions.length > 0 ? newConditions[0] : ''
    };
    
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      make: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      condition: ''
    };
    
    setLocalFilters(clearedFilters);
    setSelectedConditions([]);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="relative mb-6">
        <input
          type="text"
          name="make"
          placeholder="Search cars..."
          value={localFilters.make}
          onChange={handleInputChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="flex-col gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={localFilters.minPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={localFilters.maxPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Year</h3>
          <div className="flex-col gap-2">
            <input
              type="number"
              name="minYear"
              placeholder="Min Year"
              value={localFilters.minYear}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="number"
              name="maxYear"
              placeholder="Max Year"
              value={localFilters.maxYear}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Condition</h3>
          <div className="space-y-2">
            {['Excellent', 'Good', 'Fair'].map(condition => (
              <label key={condition} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={selectedConditions.includes(condition)}
                  onChange={() => handleConditionChange(condition)}
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span>{condition}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleApplyFilters}
            className="flex-1 bg-primary hover:bg-primary-hover text-black font-medium py-2 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
          <button 
            onClick={handleClearFilters}
            className="px-3 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}