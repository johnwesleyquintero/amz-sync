import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import standard Input component

const TopBar = () => {
  return (
    <header className="border-b border-border bg-white dark:bg-sidebar h-16 px-6 flex items-center justify-between flex-shrink-0">
      {/* Left Section - Can be used for current page title or breadcrumbs */}
      <div className="flex items-center">
        {/* Placeholder for dynamic title or breadcrumbs if needed later */}
        {/* <h2 className="text-xl font-semibold">Dashboard</h2> */}
      </div>

      {/* Right Section - Search, Actions, User */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block"> {/* Hide search on small screens */}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search..."
            // Use standard input styling, rely on theme/global styles
            // Added h-9 for standard height consistency
            className="pl-10 pr-4 h-9 w-64 bg-background focus:ring-primary/20"
          />
        </div>

        {/* Notification Button */}
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {/* Notification indicator dot */}
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-burnt-sienna ring-2 ring-white dark:ring-sidebar" />
          <span className="sr-only">View notifications</span>
        </Button>

        {/* Seller Tools Button */}
        <Link to="/tools">
          {/* Consistent button styling with Landing page */}
          <Button variant="outline" className="bg-gold text-black hover:bg-gold/90">
            <Wrench className="mr-2 h-4 w-4" />
            Seller Tools
          </Button>
        </Link>

        {/* Connect Google Sheets Button */}
        <Link to="/sheets-integration">
          {/* Consistent button styling with Landing page */}
          <Button variant="outline" className="bg-shakespeare text-white hover:bg-shakespeare/90">
            Connect Google Sheets
          </Button>
        </Link>

        {/* Link back to Landing Page */}
        <Link to="/">
          {/* Consistent button styling with Landing page */}
          <Button variant="outline" className="bg-burnt-sienna text-white hover:bg-burnt-sienna/90">
            Landing Page
          </Button>
        </Link>

        {/* Placeholder for User Menu/Avatar - Matches Sidebar footer */}
        {/* <div className="flex items-center gap-3 ml-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="font-medium text-sm">JD</span>
          </div>
        </div> */}
      </div>
    </header>
  );
};

export default TopBar;
