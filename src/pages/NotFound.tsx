import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        {/* Logo mark */}
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Zap className="h-7 w-7 text-white" />
        </div>

        {/* 404 number */}
        <p className="text-8xl font-display font-bold tracking-tight bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent leading-none mb-4">
          404
        </p>

        <h1 className="text-xl font-display font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page at{' '}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded border border-border">
            {location.pathname}
          </code>{' '}
          doesn't exist or has been moved.
        </p>

        <Link to="/dashboard">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
