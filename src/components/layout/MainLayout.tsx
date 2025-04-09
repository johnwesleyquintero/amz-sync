import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout Component
 * Provides the core application structure with a fixed Sidebar, fixed TopBar,
 * and a scrollable main content area.
 * - Uses Flexbox for layout.
 * - Manages overflow to ensure proper scrolling behavior.
 * - Integrates Sidebar and TopBar components.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { toggle, isOpen } = useSidebar();
  return (
    // Main container: Full height, flex row, hide overflow
    <div className="flex h-screen overflow-hidden bg-gradient-to-r from-sidebar/5 to-background/30 dark:from-sidebar/20 dark:to-background/50">
      {/* Sidebar: Fixed width with gradient and shadow */}
      <div className="relative">
        <Sidebar className="h-full border-r border-border/20 bg-gradient-to-b from-background via-sidebar/5 to-background shadow-xl transition-all duration-300" />
      </div>

      {/* Content Area: Takes remaining space with smooth transitions */}
      <div className="flex flex-col flex-1 overflow-hidden relative transition-all duration-300 ease-in-out">
        {/* Mobile menu button with hover animation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 md:hidden z-30 \
            transition-transform duration-300 hover:scale-105 \
            shadow-sm hover:shadow-md"
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {/* TopBar: Fixed height (defined internally), prevents shrinking */}
        <TopBar />
        {/* Main Content: Enhanced scroll area with subtle texture */}
        <main
          className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-background/70 via-background/30 to-background/70 \
          shadow-inner-xl dark:shadow-neutral-900/30 \
          transition-all duration-300"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
