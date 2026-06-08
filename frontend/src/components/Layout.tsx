import React from 'react';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-indigo-600">TaskFlow MVP</h1>
          <p className="text-sm text-gray-500 mt-1">Simple local task list — no login, no database</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};
