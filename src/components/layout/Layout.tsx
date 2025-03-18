import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // Save preference to localStorage
    localStorage.setItem('sidebarCollapsed', String(!isCollapsed));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleMobileMenu} />
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      ></div>
      <div className={`md:hidden fixed inset-0 z-40 transition-transform transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar isCollapsed={false} toggleCollapse={toggleCollapse} />
      </div>
      <div className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      </div>
      <main className={`transition-all duration-300 pt-16 ${
        isCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}