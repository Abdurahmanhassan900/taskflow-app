import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded transition-colors ${
      isActive ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border shadow-sm flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Taskflow</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/dashboard" className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={navLinkClasses}>
            Tasks
          </NavLink>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-4 text-sm">
            <p className="text-gray-500">Logged in as</p>
            <p className="font-medium truncate">{user?.email || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
