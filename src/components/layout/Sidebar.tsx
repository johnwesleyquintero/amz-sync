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
  Menu,
  X,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { isOpen, toggle } = useSidebar();

  // Navigation items remain the same
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'TODO Dashboard', href: '/TODO-dashboard', icon: LayoutDashboard },
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
        'border-r border-border bg-white dark:bg-sidebar flex-shrink-0',
        isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-16 md:translate-x-0'
      )}
    >
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={toggle}
          aria-hidden="true"
        />
      )}
      {' '}
      {/* Added flex-shrink-0 */}
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-4 border-b border-border">
          {/* Wrap logo/title in a link to the dashboard */}
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <img src="/logo.svg" className="h-8 w-8" alt="Amazon Analytics Logo" />
              <h1
                className={cn(
                  'text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-burnt-sienna transition-colors duration-200',
                  !isOpen && 'md:hidden'
                )}
              >
                My Amazon Analytics
              </h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggle}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {' '}
          {/* Added overflow-y-auto */}
          {navigation.map(item => (
            <Link key={item.name} to={item.href} className="block">
              {' '}
              {/* Link as block */}
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start items-center gap-3 px-3 py-2 text-sm font-medium h-auto rounded-md', // Base styles from AmazonSellerTools sidebar
                  location.pathname === item.href ||
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href)) // Active state logic (handle sub-routes)
                    ? 'bg-primary/10 text-primary dark:bg-primary/20' // Active styles
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground' // Default/hover styles
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" /> {/* Consistent icon size */}
                <span className="truncate">{item.name}</span> {/* Truncate long names */}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Footer/User Section */}
        <div className="p-4 border-t border-border mt-auto">
          {' '}
          {/* Added mt-auto to push to bottom */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {/* Placeholder Initials - Replace with dynamic data if available */}
              <span className="font-medium text-sm">WQ</span>
            </div>
            <div className="flex-1 min-w-0">
              {/* Placeholder Name/Email - Replace with dynamic data */}
              <p className="text-sm font-medium truncate text-foreground dark:text-gray-200">
                Wesley Q
              </p>
              <p className="text-xs text-muted-foreground truncate">info.wescode@gmail.com</p>
            </div>
            {/* Optional: Add a settings/logout icon button here */}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
