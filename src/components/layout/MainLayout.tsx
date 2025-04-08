import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

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
  return (
    // Main container: Full height, flex row, hide overflow
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar: Fixed width (defined internally), prevents shrinking */}
      <Sidebar />
      {/* Content Area: Takes remaining space, flex column, hide overflow */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* TopBar: Fixed height (defined internally), prevents shrinking */}
        <TopBar />
        {/* Main Content: Takes remaining vertical space, allows vertical scrolling, standard padding */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
