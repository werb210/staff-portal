import type { RouteObject } from 'react-router-dom';
import StaffLayout from '../layouts/StaffLayout';
import Dashboard from '../pages/Dashboard';
import ContactsPage from '../pages/Contacts';
import PipelinePage from '../pages/Pipeline';
import DocumentsPage from '../pages/Documents';
import CommunicationLayout from '../pages/Communication';
import SmsPage from '../pages/Communication/SMS';
import CallsPage from '../pages/Communication/Calls';
import EmailPage from '../pages/Communication/Email';
import TemplatesPage from '../pages/Communication/Templates';
import LenderProductsPage from '../pages/LenderProducts';
import LenderProductEditPage from '../pages/LenderProducts/Edit';
import SettingsPage from '../pages/Settings';
import Login from '../pages/Login';
import CRMPage from '../pages/CRM/CRM';
import { ProtectedRoute } from './ProtectedRoute';

export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
];

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <StaffLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'contacts', element: <ContactsPage /> },
          { path: 'crm', element: <CRMPage /> },
          { path: 'pipeline', element: <PipelinePage /> },
          { path: 'documents', element: <DocumentsPage /> },
          {
            path: 'communication',
            element: <CommunicationLayout />,
            children: [
              { index: true, element: <SmsPage /> },
              { path: 'sms', element: <SmsPage /> },
              { path: 'calls', element: <CallsPage /> },
              { path: 'email', element: <EmailPage /> },
              { path: 'templates', element: <TemplatesPage /> },
            ],
          },
          { path: 'lender-products', element: <LenderProductsPage /> },
          { path: 'lender-products/:productId', element: <LenderProductEditPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
];

export const appRoutes: RouteObject[] = [...publicRoutes, ...protectedRoutes];
