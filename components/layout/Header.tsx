import { Plus, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="h-16 bg-secondary fixed top-0 left-0 right-0 z-50 flex items-center px-4 shadow-md">
      <button 
        onClick={toggleSidebar}
        className="text-gray-300 hover:text-primary transition-colors mr-2 md:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex items-center gap-2 ml-2">
        <Image 
          src="/icons/carsawaicon.png" 
          alt="Carsawa Logo" 
          width={40} 
          height={40}
          className="object-contain"
        />
        {/* <span className="text-primary text-xl font-bold">Carsawa</span> */}
      </div>
      
      <div className="flex items-center ml-auto gap-4">
        <Link 
          href="/list-car" 
          className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">List Your Car</span>
        </Link>
      </div>
    </header>
  );
}
