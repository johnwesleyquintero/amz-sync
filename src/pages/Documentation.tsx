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
          {/*
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Getting Started</h2>
            <p className="text-gray-700 dark:text-gray-300">...</p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tool Guides</h2>
            <p className="text-gray-700 dark:text-gray-300">...</p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">API Reference</h2>
            <p className="text-gray-700 dark:text-gray-300">...</p>
          </section>
          */}
        </div>
      </div>
    </MainLayout>
  );
};

export default Documentation;
