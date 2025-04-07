
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-butterfly-bush to-slate-900 text-white">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white hover:text-burnt-sienna transition-colors">
            My Amazon Analytics
          </div>
          <div>
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
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            Powerful analytics dashboard for monitoring and optimizing your Amazon advertising
            performance. Get started today and unlock the potential of your data.
          </p>
          <Link to="/dashboard">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold/90 text-black font-bold px-8 py-6 text-lg"
            >
              Open Dashboard <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-iceberg bg-opacity-10 p-8 rounded-xl hover:bg-opacity-20 transition-colors duration-300 border border-iceberg border-opacity-30">
            <h3 className="text-xl font-bold text-shakespeare mb-4">Real-time Analytics</h3>
            <p className="text-gray-200">
              Monitor your Amazon advertising performance metrics in real-time with our intuitive
              dashboard.
            </p>
          </div>
          <div className="bg-hampton bg-opacity-10 p-8 rounded-xl hover:bg-opacity-20 transition-colors duration-300 border border-hampton border-opacity-30">
            <h3 className="text-xl font-bold text-jaffa mb-4">Custom Reports</h3>
            <p className="text-gray-200">
              Generate detailed reports and export them in multiple formats for deeper insights.
            </p>
          </div>
          <div className="bg-butterfly-bush bg-opacity-10 p-8 rounded-xl hover:bg-opacity-20 transition-colors duration-300 border border-butterfly-bush border-opacity-30">
            <h3 className="text-xl font-bold text-apricot mb-4">Data Integration</h3>
            <p className="text-gray-200">
              Seamlessly integrate with your Amazon Ads data sources for comprehensive analysis.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-white/10">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-shakespeare mb-8">
              Start Optimizing Your Amazon Ads Today
            </h2>
            <Link to="/dashboard">
              <Button className="bg-burnt-sienna hover:bg-burnt-sienna/90 text-white font-bold px-6 py-3 text-lg">
                Launch Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
