import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import Shell from './components/layout/Shell';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1b2b] via-[#134b70] to-[#0f766e] text-slate-50">
      <div className="min-h-screen bg-white/5 backdrop-blur-md">
        <Shell>
          <RouterProvider router={router} />
        </Shell>
      </div>
    </div>
  );
}
