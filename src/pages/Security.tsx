// src/pages/Security.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Shield } from 'lucide-react'; // Using Shield icon for Security

const Security = () => {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> {/* Icon added */}
            Security
          </h1>
          <p className="text-muted-foreground">
            Our security practices and infrastructure protections
          </p>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Introduction/Commitment Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Our Commitment to Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              At My Amazon Analytics, the security of your data is a top priority. We understand the sensitivity of your business information and are committed to implementing robust security measures to protect it.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              This page outlines some of the key practices and technologies we employ to safeguard your account and data integrity.
            </p>
          </section>

          {/* Data Encryption Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Data Encryption
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We utilize industry-standard encryption protocols to protect your data. Information is encrypted both in transit (using TLS/SSL between your browser and our servers) and at rest (when stored in our databases). Sensitive credentials, like API keys, are handled with additional layers of security.
            </p>
          </section>

          {/* Infrastructure Security Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Infrastructure Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our platform is hosted on secure, reliable cloud infrastructure (e.g., AWS, Google Cloud, Azure - *specify if known*) that provides robust physical security, network security, and redundancy. We employ firewalls, intrusion detection systems, and regular vulnerability scanning to protect our systems.
            </p>
          </section>

          {/* Access Control Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Access Control & Authentication
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Access to user data within our systems is strictly limited based on the principle of least privilege. We enforce strong password policies and recommend enabling multi-factor authentication (MFA) for your account (*if applicable*). Internal access requires secure authentication and is logged.
            </p>
          </section>

          {/* Compliance and Best Practices Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Compliance and Best Practices
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We strive to adhere to industry best practices for security and data privacy. Our development lifecycle includes security reviews, and we regularly assess and update our security posture to address emerging threats. (*Mention specific compliance if applicable, e.g., GDPR, SOC 2*).
            </p>
          </section>

          {/* Reporting Vulnerabilities Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Reporting Vulnerabilities
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We value the security community. If you believe you have discovered a security vulnerability in our platform, please report it responsibly to us at{' '}
              <a href="mailto:info.wescode@gmail.com" className="text-primary hover:underline">
                info.wescode@gmail.com
              </a>
              . We are committed to investigating all reports promptly.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Security;
