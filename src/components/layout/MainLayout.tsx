// c:\Users\johnw\OneDrive\Desktop\my-amazon-analytics\src\components\layout\MainLayout.tsx
import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils'; // Import cn if needed

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout Component
 * Provides the core application structure with Sidebar, TopBar,
 * and a scrollable main content area, styled using theme variables.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { toggle } = useSidebar(); // Removed isOpen as it's handled within Sidebar

  return (
    // Main container: Full height, flex row, use theme background
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Container: Relative positioning for potential overlays, flex-shrink-0 prevents shrinking */}
      <div className="relative flex-shrink-0">
        {/* Sidebar component handles its own background, border, and transitions */}
        <Sidebar />
      </div>

      {/* Content Area: Takes remaining space */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Mobile menu button: Positioned absolutely, uses ghost variant which adapts to theme */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 md:hidden z-40 text-foreground" // Ensure icon color contrasts, z-index above sidebar overlay
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* TopBar: Fixed height (defined internally), uses theme variables */}
        <TopBar />

        {/* Main Content: Scrollable area, use theme background, standard padding */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {/* Content passed to the layout */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
