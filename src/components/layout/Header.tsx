import React from 'react';
import { Car } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-black fixed top-0 left-0 right-0 z-50 flex items-center px-4">
      <div className="flex items-center gap-2 ml-2">
        <Car className="w-8 h-8 text-primary" />
        <span className="text-primary text-xl font-bold">Carsawa</span>
      </div>
      
      <div className="flex items-center ml-auto gap-4">
        <button className="text-primary hover:text-primary-hover transition-colors">
          Notifications
        </button>
        <button className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors">
          List Your Car
        </button>
      </div>
    </header>
  );
}