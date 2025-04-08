// src/pages/Resources.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Library } from 'lucide-react'; // Using Library icon as it fits 'Resources'

const Resources = () => {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" /> {/* Icon added */}
            Resources
          </h1>
          <p className="text-muted-foreground">
            Helpful resources, guides, and links for Amazon sellers
          </p>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Placeholder/Introductory Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Curated Resources Coming Soon
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We are compiling a collection of valuable resources to help you succeed on Amazon. This section will include links to official Amazon documentation, helpful third-party tools, insightful articles, case studies, and best practice guides.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Stay tuned for curated content designed to support your e-commerce journey. Check back soon!
            </p>
          </section>

          {/* Potential Future Sections (Example Structure) */}
          {/*
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Seller Guides</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><a href="#" className="text-primary hover:underline">Amazon Advertising Best Practices</a></li>
              <li><a href="#" className="text-primary hover:underline">Understanding FBA Fees</a></li>
              <li><a href="#" className="text-primary hover:underline">Guide to Product Listing Optimization</a></li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recommended Tools</h2>
            <p className="text-gray-700 dark:text-gray-300">A list of useful third-party tools and services for keyword research, competitor analysis, inventory management, etc...</p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Industry Articles & News</h2>
            <p className="text-gray-700 dark:text-gray-300">Links to relevant articles and updates in the e-commerce space...</p>
          </section>
          */}
        </div>
      </div>
    </MainLayout>
  );
};

export default Resources;
