import { Search } from 'lucide-react';

export function ListingsFilter() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search cars..."
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
              placeholder="Min"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Year</h3>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="">Any year</option>
            {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Condition</h3>
          <div className="space-y-2">
            {['Excellent', 'Good', 'Fair'].map(condition => (
              <label key={condition} className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span>{condition}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button className="w-full bg-primary hover:bg-primary-hover text-black font-medium py-2 rounded-lg transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
}