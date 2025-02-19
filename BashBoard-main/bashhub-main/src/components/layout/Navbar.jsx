import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Menu, User, LogOut } from 'lucide-react'; // Import icons from lucide-react
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <nav className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
      {/* Left side of navbar */}
      <div className="text-white text-xl font-semibold">
        <span>My App</span>
      </div>

      {/* Centered Navbar items */}
      <div className="flex space-x-4">
        <Button
          variant={location.pathname === '/' ? 'secondary' : 'link'}
          onClick={() => navigate('/')}
          className="text-white"
        >
          Home
        </Button>
        <Button
          variant={location.pathname === '/tasks' ? 'secondary' : 'link'}
          onClick={() => navigate('`https://server-bashboard.vercel.app/apis/tasks')}
          className="text-white"
        >
          Tasks
        </Button>
        <Button
          variant={location.pathname === '/reports' ? 'secondary' : 'link'}
          onClick={() => navigate('/reports')}
          className="text-white"
        >
          Reports
        </Button>
      </div>

      {/* Right side of navbar (User info and logout) */}
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="text-white">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

export default Navbar;
