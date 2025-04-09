// src/pages/Documentation.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BookOpen } from 'lucide-react'; // Optional: Add an icon

const Documentation = () => {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> {/* Optional Icon */}
            Documentation
          </h1>
          <p className="text-muted-foreground">
            Technical documentation, guides, and API references
          </p>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Placeholder Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Coming Soon
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We are currently preparing comprehensive documentation for our platform, including
              setup guides, tool explanations, API details, and integration instructions.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Please check back soon for detailed resources to help you get the most out of My
              Amazon Analytics.
            </p>
          </section>

          {/* Potential Future Sections (Example Structure) */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Getting Started
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Installation Guide</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Set up the development environment and install dependencies using npm or yarn.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Configuration</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Environment variables and runtime configuration options.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tool Guides</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">ACOS Analyzer</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Detailed instructions for analyzing Advertising Cost of Sales metrics.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Keyword Deduplicator</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Guide for optimizing PPC campaigns through keyword management.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">API Reference</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Authentication</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    JWT-based authentication flow and token management.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Data Endpoints</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    REST API endpoints for sales data and analytics.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Documentation;
