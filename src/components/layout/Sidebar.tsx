// c:\Users\johnw\OneDrive\Desktop\my-amazon-analytics\src\components\layout\Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/use-sidebar';
import {
  BarChart3,
  FileSpreadsheet,
  Settings,
  Users,
  LayoutDashboard,
  Search,
  ShoppingBag,
  Wrench,
  Menu, // Keep Menu for potential future use if needed
  X,
  ClipboardList,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { isOpen, toggle } = useSidebar();

  // Navigation items remain the same
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'TODO Dashboard', href: '/TODO-dashboard', icon: ClipboardList },
    { name: 'Search Analytics', href: '/search-analytics', icon: Search },
    { name: 'Campaign Manager', href: '/campaign-manager', icon: BarChart3 },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'Tools', href: '/tools', icon: Wrench },
    { name: 'Google Sheets', href: '/sheets-integration', icon: FileSpreadsheet },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'fixed md:relative z-30 h-full transition-all duration-300 ease-in-out',
        // Use theme variables for background and border
        'border-r border-border bg-sidebar dark:bg-sidebar flex-shrink-0',
        isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-16 md:translate-x-0'
      )}
    >
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20" // Ensure overlay is below sidebar content (z-30)
          onClick={toggle}
          aria-hidden="true"
        />
      )}
      <div className="flex flex-col h-full relative z-10">
        {' '}
        {/* Ensure content is above overlay */}
        {/* Header Section */}
        <div className="p-4 border-b border-border">
          {' '}
          {/* Use theme border */}
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <img src="/logo.svg" className="h-8 w-8" alt="Amazon Analytics Logo" />
              <h1
                className={cn(
                  // Use theme foreground, hover with primary
                  'text-xl font-bold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors duration-200',
                  !isOpen && 'md:hidden'
                )}
              >
                AmzSync
              </h1>
            </Link>
            {/* Use theme foreground for close button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-sidebar-foreground"
              onClick={toggle}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map(item => (
            <Link key={item.name} to={item.href} className="block">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start items-center gap-3 px-3 py-2 text-sm font-medium h-auto rounded-md',
                  location.pathname === item.href ||
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                    ? // Active state: Use primary-light background and primary text
                      'bg-primary-light text-primary dark:bg-primary/20 dark:text-primary' // Adjusted dark mode active state
                    : // Default/hover state: Use muted text, hover with muted background and foreground text
                      'text-muted-foreground hover:bg-background-muted hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    // Ensure icon color matches text color state
                    location.pathname === item.href ||
                      (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                      ? 'text-primary' // Active icon color
                      : 'text-muted-foreground group-hover:text-foreground' // Default/hover icon color
                  )}
                />
                <span className={cn('truncate', !isOpen && 'md:hidden')}>
                  {item.name}
                </span>{' '}
                {/* Hide text when collapsed on md+ */}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Footer/User Section */}
        <div className="p-4 border-t border-border mt-auto">
          {' '}
          {/* Use theme border */}
          <div className={cn('flex items-center gap-3', !isOpen && 'md:justify-center')}>
            {' '}
            {/* Center avatar when collapsed */}
            <div className="w-8 h-8 rounded-full bg-background-muted flex items-center justify-center flex-shrink-0">
              {' '}
              {/* Use muted background */}
              {/* Use muted foreground for initials */}
              <span className="font-medium text-sm text-muted-foreground">WQ</span>
            </div>
            <div className={cn('flex-1 min-w-0', !isOpen && 'md:hidden')}>
              {' '}
              {/* Hide text when collapsed */}
              {/* Use theme foreground */}
              <p className="text-sm font-medium truncate text-sidebar-foreground">Wesley Q</p>
              {/* Use muted foreground */}
              <p className="text-xs text-muted-foreground truncate">info.wescode@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
