// src/pages/PrivacyPolicy.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ShieldCheck } from 'lucide-react'; // Optional: Add an icon

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> {/* Optional Icon */}
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Our privacy practices and how we protect your data
          </p>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Introduction Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Welcome to AmzSync. We are committed to protecting your personal
              information and your right to privacy. If you have any questions or concerns about
              this privacy notice, or our practices with regards to your personal information,
              please contact us.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              This privacy notice describes how we might use your information if you visit our
              website, use our services, or otherwise communicate with us.
            </p>
          </section>

          {/* Information We Collect Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Information We Collect
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We collect personal information that you voluntarily provide to us when you register
              on the Services, express an interest in obtaining information about us or our products
              and Services, when you participate in activities on the Services, or otherwise when
              you contact us.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              We also collect certain information automatically when you visit, use, or navigate the
              Services. This information does not reveal your specific identity but may include
              device and usage information.
            </p>
            {/* Add more details about specific data collected */}
          </section>

          {/* How We Use Your Information Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We use personal information collected via our Services for a variety of business
              purposes described below. We process your personal information for these purposes in
              reliance on our legitimate business interests, in order to enter into or perform a
              contract with you, with your consent, and/or for compliance with our legal
              obligations.
            </p>
            {/* Add bullet points or details on usage */}
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li>To facilitate account creation and logon process.</li>
              <li>To manage user accounts.</li>
              <li>To send administrative information to you.</li>
              <li>To protect our Services.</li>
              <li>To respond to user inquiries/offer support to users.</li>
              {/* Add more specific uses */}
            </ul>
          </section>

          {/* Data Security Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We have implemented appropriate technical and organizational security measures
              designed to protect the security of any personal information we process. However,
              despite our safeguards and efforts to secure your information, no electronic
              transmission over the Internet or information storage technology can be guaranteed to
              be 100% secure.
            </p>
          </section>

          {/* Your Privacy Rights Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Your Privacy Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              In some regions (like the EEA, UK, and Canada), you have certain rights under
              applicable data protection laws. These may include the right (i) to request access and
              obtain a copy of your personal information, (ii) to request rectification or erasure;
              (iii) to restrict the processing of your personal information; and (iv) if applicable,
              to data portability.
            </p>
            {/* Add details on how users can exercise rights */}
          </section>

          {/* Contact Us Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions or comments about this notice, you may email us at [Your Contact
              Email] or by post to: [Your Company Address].
            </p>
          </section>

          {/* Placeholder for future content or more detailed sections */}
          {/*
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Updates to This Notice
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.
            </p>
          </section>
          */}
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
