// c:\Users\johnw\OneDrive\Desktop\my-amazon-analytics\src\pages\Landing.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wrench, Github, Twitter, Linkedin, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn if needed for conditional classes

const Landing = () => {
  return (
    // Use theme background and foreground
    <div className="min-h-screen bg-background text-foreground">
      {/* --- Navigation --- */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" className="h-8 w-8" alt="Amazon Analytics Logo" />
            {/* Use foreground, hover with primary */}
            <span className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              AmzSync
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/johnwesleyquintero/my-amazon-analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* Use foreground/background for dark contrast button */}
              <Button className="bg-foreground text-background hover:bg-foreground/90 font-bold">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </a>
            <Link to="/tools">
              {/* Use accent color for Seller Tools button */}
              <Button className="bg-accent text-accent-foreground hover:bg-accent-hover font-bold">
                <Wrench className="mr-2 h-4 w-4" />
                Seller Tools
              </Button>
            </Link>
            <Link to="/dashboard">
              {/* Use primary color for Dashboard button */}
              <Button className="bg-primary text-primary-foreground hover:bg-primary-hover font-bold">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Use primary color for main heading */}
          <h1 className="text-6xl font-bold mb-6 text-primary">Transform Your Amazon Ads Data</h1>
          {/* Use muted foreground for paragraph */}
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Powerful analytics dashboard for monitoring and optimizing your Amazon advertising
            performance. Get started today and unlock the potential of your data.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard">
              {/* Use accent color for primary CTA */}
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent-hover font-bold px-8 py-6 text-lg"
              >
                Open Dashboard <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <Link to="/tools">
              {/* Use primary color for secondary CTA */}
              <Button
                size="lg"
                variant="outline" // Keep outline, border will use theme border color
                className="border-primary text-primary hover:bg-primary-light hover:text-primary font-bold px-6 py-3 text-lg" // Adjusted hover for outline
              >
                Explore Seller Tools <Wrench className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>

        {/* --- Features Section --- */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Use card background/foreground/border */}
          <div className="bg-card p-8 rounded-xl hover:bg-muted transition-colors duration-300 border border-border shadow-lg">
            {/* Use primary color for heading */}
            <h3 className="text-xl font-bold text-primary mb-4">Real-time Analytics</h3>
            {/* Use card foreground for text */}
            <p className="text-card-foreground">
              Monitor your Amazon advertising performance metrics in real-time with our intuitive
              dashboard.
            </p>
          </div>
          {/* Use card background/foreground/border */}
          <div className="bg-card p-8 rounded-xl hover:bg-muted transition-colors duration-300 border border-border shadow-lg">
            {/* Use accent color for heading */}
            <h3 className="text-xl font-bold text-accent mb-4">Custom Reports</h3>
            {/* Use card foreground for text */}
            <p className="text-card-foreground">
              Generate detailed reports and export them in multiple formats for deeper insights.
            </p>
          </div>
          {/* Use card background/foreground/border */}
          <div className="bg-card p-8 rounded-xl hover:bg-muted transition-colors duration-300 border border-border shadow-lg">
            {/* Use primary color for heading */}
            <h3 className="text-xl font-bold text-primary mb-4">Seller Tools Suite</h3>
            {/* Use card foreground for text */}
            <p className="text-card-foreground">
              Access our comprehensive suite of 11 specialized tools for Amazon sellers to optimize
              listings and increase profits.
            </p>
          </div>
        </div>

        {/* --- Final CTA Section --- */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center">
            {/* Use primary color for heading */}
            <h2 className="text-4xl font-bold text-primary mb-8">
              Start Optimizing Your Amazon Ads Today
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/dashboard">
                {/* Use primary color for button */}
                <Button className="bg-primary text-primary-foreground hover:bg-primary-hover font-bold px-6 py-3 text-lg">
                  Launch Dashboard
                </Button>
              </Link>
              <Link to="/tools">
                {/* Use accent color for button */}
                <Button className="bg-accent text-accent-foreground hover:bg-accent-hover font-bold px-6 py-3 text-lg">
                  View Seller Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      {/* Use muted background and border */}
      <footer className="bg-muted border-t border-border mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Resources */}
            <div className="space-y-4">
              {/* Use primary color for heading */}
              <h4 className="text-lg font-semibold text-primary">Resources</h4>
              <nav className="space-y-2">
                {/* Use muted text, hover with primary */}
                <Link
                  to="/about"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="/documentation"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Documentation
                </Link>
                <Link
                  to="/blog"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </nav>
            </div>

            {/* Connect */}
            <div className="space-y-4">
              {/* Use primary color for heading */}
              <h4 className="text-lg font-semibold text-primary">Connect</h4>
              <div className="flex space-x-4">
                {/* Use muted text, hover with primary */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              {/* Use accent color for heading */}
              <h4 className="text-lg font-semibold text-accent">Legal</h4>
              <nav className="space-y-2">
                {/* Use muted text, hover with accent */}
                <Link
                  to="/privacy-policy"
                  className="block text-muted-foreground hover:text-accent transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms-of-service"
                  className="block text-muted-foreground hover:text-accent transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/security"
                  className="block text-muted-foreground hover:text-accent transition-colors"
                >
                  Security
                </Link>
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-8 text-center">
            {/* Use muted text */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AmzSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
