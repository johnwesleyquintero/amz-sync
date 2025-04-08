import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wrench, Github, Twitter, Linkedin, Facebook } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" className="h-8 w-8" alt="Amazon Analytics Logo" />
            <span className="text-2xl font-bold text-gray-900 hover:text-burnt-sienna transition-colors">
              My Amazon Analytics
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/johnwesleyquintero/my-amazon-analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-gray-900 text-white hover:bg-gray-800 font-bold">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </a>
            <Link to="/tools">
              <Button className="bg-gold text-black hover:bg-gold/90 font-bold">
                <Wrench className="mr-2 h-4 w-4" />
                Seller Tools
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button className="bg-shakespeare hover:bg-shakespeare/90 text-white font-bold">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-6xl font-bold mb-6 text-burnt-sienna">
            Transform Your Amazon Ads Data
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Powerful analytics dashboard for monitoring and optimizing your Amazon advertising
            performance. Get started today and unlock the potential of your data.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold/90 text-black font-bold px-8 py-6 text-lg"
              >
                Open Dashboard <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <Link to="/tools">
              <Button
                size="lg"
                variant="outline"
                className="bg-burnt-sienna hover:bg-burnt-sienna/90 text-white font-bold px-6 py-3 text-lg"
              >
                Explore Seller Tools <Wrench className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-300 shadow-lg">
            <h3 className="text-xl font-bold text-shakespeare mb-4">Real-time Analytics</h3>
            <p className="text-gray-700">
              Monitor your Amazon advertising performance metrics in real-time with our intuitive
              dashboard.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-300 shadow-lg">
            <h3 className="text-xl font-bold text-jaffa mb-4">Custom Reports</h3>
            <p className="text-gray-700">
              Generate detailed reports and export them in multiple formats for deeper insights.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-300 shadow-lg">
            <h3 className="text-xl font-bold text-apricot mb-4">Seller Tools Suite</h3>
            <p className="text-gray-700">
              Access our comprehensive suite of 11 specialized tools for Amazon sellers to optimize
              listings and increase profits.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-shakespeare mb-8">
              Start Optimizing Your Amazon Ads Today
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/dashboard">
                <Button className="bg-burnt-sienna hover:bg-burnt-sienna/90 text-white font-bold px-6 py-3 text-lg">
                  Launch Dashboard
                </Button>
              </Link>
              <Link to="/tools">
                <Button className="bg-gold hover:bg-gold/90 text-black font-bold px-6 py-3 text-lg">
                  View Seller Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-burnt-sienna">Resources</h4>
              <nav className="space-y-2">
                <Link to="/about" className="block text-gray-600 hover:text-burnt-sienna transition-colors">
                  About Us
                </Link>
                <Link to="/documentation" className="block text-gray-600 hover:text-burnt-sienna transition-colors">
                  Documentation
                </Link>
                <Link to="/blog" className="block text-gray-600 hover:text-burnt-sienna transition-colors">
                  Blog
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-shakespeare">Connect</h4>
              <div className="flex space-x-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-shakespeare transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-shakespeare transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-shakespeare transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-jaffa">Legal</h4>
              <nav className="space-y-2">
                <Link to="/privacy-policy" className="block text-gray-600 hover:text-jaffa transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="block text-gray-600 hover:text-jaffa transition-colors">
                  Terms of Service
                </Link>
                <Link to="/security" className="block text-gray-600 hover:text-jaffa transition-colors">
                  Security
                </Link>
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Amazon Insights Sync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
