import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react'; // Import React for lazy loading if used

// UI Providers and Components
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster'; // shadcn/ui toaster
import { Toaster as Sonner } from '@/components/ui/sonner'; // Sonner toaster

// Page Components
import Index from './pages/Index'; // Main dashboard page
import Landing from './pages/Landing'; // Landing/Home page
import NotFound from './pages/NotFound'; // 404 Error page
import Tools from './pages/Tools'; // Amazon Seller Tools page
import Legal from './pages/Legal';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Security from './pages/Security';
import Resources from './pages/Resources';
import AboutUs from './pages/AboutUs';
import Documentation from './pages/Documentation';
import Blog from './pages/Blog';

// --- Import the TODO Dashboard ---
import TODODashboard from './pages/TODO-dashboard.tsx'; // Adjust path if you saved it elsewhere

// --- OR: Lazy Load the TODO Dashboard (Optional, for better performance) ---
// const TODODashboard = React.lazy(() => import('./pages/TODO-dashboard'));

// Initialize React Query client
const queryClient = new QueryClient();

/**
 * Main Application Component
 * Sets up providers (React Query, Tooltip, Toasters) and defines application routes.
 */
const App = () => (
  // Provide React Query client to the app
  <QueryClientProvider client={queryClient}>
    {/* Provide tooltip functionality */}
    <TooltipProvider>
      {/* Render shadcn/ui Toaster component */}
      <Toaster />
      {/* Render Sonner Toaster component */}
      <Sonner />
      {/* Set up client-side routing */}
      <BrowserRouter>
        {/* --- Optional: Add Suspense for Lazy Loading --- */}
        {/* <React.Suspense fallback={<div>Loading Page...</div>}> */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/security" element={<Security />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/blog" element={<Blog />} />

          {/* Main Application Routes */}
          <Route path="/dashboard" element={<Index />} />
          <Route path="/tools" element={<Tools />} />

          {/* --- Add the Route for the TODO Dashboard --- */}
          <Route path="/todo-dashboard" element={<TODODashboard />} />
          {/* --- End TODO Dashboard Route --- */}


          {/* Placeholder Routes - Currently point to the main dashboard (Index) */}
          {/* These can be updated later to point to specific components or pages */}
          <Route path="/search-analytics" element={<Index />} />
          <Route path="/campaign-manager" element={<Index />} />
          <Route path="/products" element={<Index />} />
          <Route path="/sheets-integration" element={<Index />} />
          <Route path="/team" element={<Index />} />
          <Route path="/settings" element={<Index />} />

          {/* Catch-all route for 404 Not Found pages */}
          {/* IMPORTANT: This must be the last route defined */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* </React.Suspense> */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
