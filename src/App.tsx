import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import Shell from './components/layout/Shell';

export default function App() {
  return (
    <Shell>
      <RouterProvider router={router} />
    </Shell>
  );
}
