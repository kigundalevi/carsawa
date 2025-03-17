import React from 'react';
import { CarCard } from '../components/listings/CarCard';
import { ListingsFilter } from '../components/listings/ListingsFilter';

// Sample data - In a real app, this would come from an API
const cars = [
  {
    id: '1',
    title: '2020 Toyota Land Cruiser V8',
    year: 2020,
    price: 12500000,
    location: 'Nairobi, Kenya',
    mileage: 45000,
    condition: 'Excellent' as const,
    image: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: '2019 Mercedes-Benz C200',
    year: 2019,
    price: 4800000,
    location: 'Mombasa, Kenya',
    mileage: 62000,
    condition: 'Good' as const,
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: '2018 BMW X5',
    year: 2018,
    price: 5500000,
    location: 'Nairobi, Kenya',
    mileage: 78000,
    condition: 'Good' as const,
    image: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: '2021 Audi Q7',
    year: 2021,
    price: 9800000,
    location: 'Nairobi, Kenya',
    mileage: 25000,
    condition: 'Excellent' as const,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'
  }
];

export function Listings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Car Listings</h1>
        <p className="text-gray-600 mt-1">Browse and filter available cars</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ListingsFilter />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}