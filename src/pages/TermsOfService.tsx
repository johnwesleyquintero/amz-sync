// src/pages/TermsOfService.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { FileText } from 'lucide-react'; // Using FileText icon for Terms

const TermsOfService = () => {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> {/* Icon added */}
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Legal terms governing the use of our platform and services
          </p>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Introduction Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              1. Introduction & Acceptance
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Welcome to AmzSync. These Terms of Service ("Terms") govern your access to and use of
              our website, services, and applications (collectively, the "Service"). By accessing or
              using the Service, you agree to be bound by these Terms. If you disagree with any part
              of the terms, then you may not access the Service.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Please read these Terms carefully before using our Service.
            </p>
          </section>

          {/* Use of Service Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              2. Use of Our Service
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to use the Service only for lawful purposes and in accordance with these
              Terms. You are responsible for ensuring that your use of the Service complies with all
              applicable laws, regulations, and third-party agreements (including Amazon's terms of
              service).
            </p>
            {/* Add more details about permitted/prohibited uses */}
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              [Placeholder: Detail specific permitted uses, prohibited actions like scraping,
              reverse engineering, etc.]
            </p>
          </section>

          {/* User Accounts Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              3. User Accounts
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              To access certain features of the Service, you may be required to create an account.
              You are responsible for safeguarding your account credentials and for any activities
              or actions under your account. You agree to provide accurate, current, and complete
              information during the registration process and to update such information to keep it
              accurate, current, and complete. You agree to notify us immediately upon becoming
              aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          {/* Intellectual Property Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              4. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              The Service and its original content (excluding Content provided by users), features,
              and functionality are and will remain the exclusive property of AmzSync and its
              licensors. The Service is protected by copyright, trademark, and other laws of both
              the [Your Country] and foreign countries. Our trademarks and trade dress may not be
              used in connection with any product or service without the prior written consent of
              AmzSync.
            </p>
          </section>

          {/* Termination Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              5. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may terminate or suspend your account and bar access to the Service immediately,
              without prior notice or liability, under our sole discretion, for any reason
              whatsoever and without limitation, including but not limited to a breach of the Terms.
              If you wish to terminate your account, you may simply discontinue using the Service.
              All provisions of the Terms which by their nature should survive termination shall
              survive termination, including, without limitation, ownership provisions, warranty
              disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          {/* Disclaimers Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              6. Disclaimers
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS"
              and "AS AVAILABLE" basis. The Service is provided without warranties of any kind,
              whether express or implied, including, but not limited to, implied warranties of
              merchantability, fitness for a particular purpose, non-infringement, or course of
              performance. AmzSync, its subsidiaries, affiliates, and its licensors do not warrant
              that a) the Service will function uninterrupted, secure or available at any particular
              time or location; b) any errors or defects will be corrected; c) the Service is free
              of viruses or other harmful components; or d) the results of using the Service will
              meet your requirements.
            </p>
          </section>

          {/* Limitation of Liability Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              In no event shall AmzSync, nor its directors, employees, partners, agents, suppliers,
              or affiliates, be liable for any indirect, incidental, special, consequential or
              punitive damages, including without limitation, loss of profits, data, use, goodwill,
              or other intangible losses, resulting from (i) your access to or use of or inability
              to access or use the Service; (ii) any conduct or content of any third party on the
              Service; (iii) any content obtained from the Service; and (iv) unauthorized access,
              use or alteration of your transmissions or content, whether based on warranty,
              contract, tort (including negligence) or any other legal theory, whether or not we
              have been informed of the possibility of such damage, and even if a remedy set forth
              herein is found to have failed of its essential purpose.
            </p>
          </section>

          {/* Governing Law Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              8. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms shall be governed and construed in accordance with the laws of [Your
              Jurisdiction, e.g., State of California, USA], without regard to its conflict of law
              provisions. Our failure to enforce any right or provision of these Terms will not be
              considered a waiver of those rights. If any provision of these Terms is held to be
              invalid or unenforceable by a court, the remaining provisions of these Terms will
              remain in effect.
            </p>
          </section>

          {/* Changes to Terms Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              9. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any
              time. If a revision is material we will provide at least 30 days' notice prior to any
              new terms taking effect by posting the new Terms on this site. What constitutes a
              material change will be determined at our sole discretion. By continuing to access or
              use our Service after any revisions become effective, you agree to be bound by the
              revised terms.
            </p>
          </section>

          {/* Contact Information Section */}
          <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              10. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms, please contact us at [Your Contact Email
              or Link to Contact Page].
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">Last Updated: [Date]</p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfService;
