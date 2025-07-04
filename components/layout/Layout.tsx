import { useState, useEffect, useRef } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // Save preference to localStorage
    localStorage.setItem('sidebarCollapsed', String(!isCollapsed));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Handle clicks outside the sidebar to collapse/close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // For desktop: collapse expanded sidebar when clicking outside
      if (!isCollapsed && window.innerWidth >= 768) {
        if (
          sidebarRef.current && 
          !sidebarRef.current.contains(target) &&
          toggleButtonRef.current && 
          !toggleButtonRef.current.contains(target)
        ) {
          setIsCollapsed(true);
          localStorage.setItem('sidebarCollapsed', 'true');
        }
      }
      
      // For mobile: close sidebar when clicking outside
      if (isMobileMenuOpen && window.innerWidth < 768) {
        // Check if click is outside the sidebar
        if (sidebarRef.current && !sidebarRef.current.contains(target)) {
          closeMobileMenu();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed, isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleMobileMenu} />
      
      {/* Desktop sidebar */}
      <div className="hidden md:block" ref={sidebarRef}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleCollapse={toggleCollapse} 
          toggleButtonRef={toggleButtonRef}
        />
      </div>
      
      {/* Mobile sidebar */}
      <div 
        ref={sidebarRef}
        className={`md:hidden fixed inset-y-0 left-0 z-40 transition-transform transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '80%', maxWidth: '300px' }}
      >
        <Sidebar 
          isCollapsed={false} 
          toggleCollapse={toggleCollapse} 
          toggleButtonRef={toggleButtonRef}
        />
      </div>
      
      {/* Dark overlay for mobile - visible when sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          aria-hidden="true"
        />
      )}
      
      <main className={`transition-all duration-300 pt-16 ${
        isCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}