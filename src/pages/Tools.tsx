
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import AmazonSellerTools from '@/components/tools/AmazonSellerTools';

const Tools = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-butterfly-bush to-slate-900 text-white">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white hover:text-burnt-sienna transition-colors">
            Amazon Analytics
          </div>
          <div className="space-x-4">
            <Link to="/dashboard">
              <Button className="bg-shakespeare hover:bg-shakespeare/90 text-white font-bold">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-burnt-sienna">
            Amazon Seller Tools Suite
          </h1>
          <div className="flex justify-center gap-2">
            <Badge className="bg-green-500">Status: Active</Badge>
            <Badge className="bg-blue-500">Version: 2.0</Badge>
          </div>
          <p className="text-lg text-gray-200 leading-relaxed mt-4">
            A comprehensive suite of tools designed to help Amazon sellers optimize their listings, 
            analyze performance, and maximize profitability.
          </p>
        </div>

        {/* Use the AmazonSellerTools component with all features enabled */}
        <AmazonSellerTools 
          showCategories={true}
          showTable={true}
          showDetails={true}
          showCTA={true}
        />
      </main>
    </div>
  );
};

export default Tools;
