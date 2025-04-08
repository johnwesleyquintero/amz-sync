import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// UI Providers and Components
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster'; // shadcn/ui toaster
import { Toaster as Sonner } from '@/components/ui/sonner'; // Sonner toaster

// Page Components
import Index from './pages/Index'; // Main dashboard page
import Landing from './pages/Landing'; // Landing/Home page
import NotFound from './pages/NotFound'; // 404 Error page
import Tools from './pages/Tools'; // Amazon Seller Tools page

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
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />

          {/* Main Application Routes */}
          <Route path="/dashboard" element={<Index />} />
          <Route path="/tools" element={<Tools />} />

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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
