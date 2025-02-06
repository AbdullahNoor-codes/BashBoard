import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckSquare, Target, FileText, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    toast.error('Failed to update toast');
    
    // localStorage.removeItem('isLoggedIn');
    // navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { path: '/', label: 'Tasks', icon: CheckSquare },
    { path: '/sessions', label: 'Sessions', icon: Target },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static w-[280px] lg:w-64 h-screen bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          z-40
        `}
      >
        {/* Logo and Logout/Login */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-semibold">DeepWork</span>
          <Button
            className="ml-auto"
            onClick={handleLogout}
            size="sm"
          >
            Logout
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
}

export default Sidebar;