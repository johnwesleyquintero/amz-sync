// c:\Users\johnw\OneDrive\Desktop\my-amazon-analytics\src\components\layout\TopBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import standard Input component

const TopBar = () => {
  return (
    <header
      // Use theme variables for background and border
      // Using card background for a slight contrast, or use bg-background if preferred
      className="border-b border-border bg-card dark:bg-card h-16 px-6 flex items-center justify-between flex-shrink-0 shadow-sm rounded-b-lg"
    >
      {/* Left Section - Can be used for current page title or breadcrumbs */}
      <div className="flex items-center">
        {/* Placeholder for dynamic title or breadcrumbs if needed later */}
        {/* <h2 className="text-xl font-semibold text-foreground">Dashboard</h2> */}
      </div>

      {/* Right Section - Search, Actions, User */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block">
          {' '}
          {/* Hide search on small screens */}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search..."
            // Use theme input background and ring color
            className="pl-10 pr-4 h-9 w-64 bg-input focus:ring-ring"
          />
        </div>

        {/* Notification Button */}
        <Button variant="ghost" size="icon" className="relative rounded-full text-foreground">
          {' '}
          {/* Ensure icon color uses foreground */}
          <Bell className="h-5 w-5" />
          {/* Notification indicator dot - Use error color for attention */}
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-error ring-2 ring-card dark:ring-card" />{' '}
          {/* Ring uses card background */}
          <span className="sr-only">View notifications</span>
        </Button>

        {/* Seller Tools Button */}
        <Link to="/tools">
          {/* Use accent color */}
          <Button
            variant="outline"
            className="bg-accent text-accent-foreground hover:bg-accent-hover"
          >
            <Wrench className="mr-2 h-4 w-4" />
            Seller Tools
          </Button>
        </Link>

        {/* Connect Google Sheets Button */}
        <Link to="/sheets-integration">
          {/* Use primary color */}
          <Button
            variant="outline"
            className="bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            Connect Google Sheets
          </Button>
        </Link>

        {/* Link back to Landing Page */}
        <Link to="/">
          {/* Use a secondary/outline style for less emphasis */}
          <Button variant="outline">Landing Page</Button>
        </Link>

        {/* Placeholder for User Menu/Avatar - Matches Sidebar footer */}
        {/* <div className="flex items-center gap-3 ml-2">
          <div className="w-8 h-8 rounded-full bg-background-muted flex items-center justify-center flex-shrink-0">
            <span className="font-medium text-sm text-muted-foreground">JD</span>
          </div>
        </div> */}
      </div>
    </header>
  );
};

export default TopBar;
