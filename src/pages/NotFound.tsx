import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Import Button component
import { AlertTriangle } from 'lucide-react'; // Import an icon

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Keep the console error logging for debugging
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Use theme background and center content */}
      <div className="bg-card p-8 rounded-lg shadow-lg text-center max-w-md w-full border dark:border-border">
        {/* Card-like container */}
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />{' '}
        {/* Icon with destructive color */}
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>{' '}
        {/* Larger heading with primary color */}
        <p className="text-xl text-foreground mb-2">Page Not Found</p>{' '}
        {/* Main message */}
        <p className="text-muted-foreground mb-8">
          Sorry, the page you requested (<code>{location.pathname}</code>) could
          not be found. It might have been removed or moved.
        </p>{' '}
        {/* Descriptive text using muted color */}
        <Button asChild>
          {' '}
          {/* Use Button component for the link */}
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
