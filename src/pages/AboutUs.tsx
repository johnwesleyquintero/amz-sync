import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const AboutUs = () => {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">About Us</h1>
          <p className="text-muted-foreground">Learn about our company and mission</p>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700">
              At AmzSync, our mission is to empower Amazon sellers with the tools and
              insights they need to succeed in the competitive e-commerce landscape. We strive to
              simplify complex data, provide actionable recommendations, and foster a community of
              informed and successful sellers.
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-700">
              Founded by a team of experienced e-commerce professionals and data analysts, My Amazon
              Analytics was born out of a shared passion for helping businesses thrive on Amazon. We
              recognized the challenges sellers face in navigating the vast amounts of data and the
              need for user-friendly, powerful tools.
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Our Team</h2>
            <p className="text-gray-700">
              Our team is composed of dedicated individuals with diverse backgrounds in e-commerce,
              data science, software development, and customer support. We are committed to
              continuous improvement and innovation, ensuring our platform evolves with the
              ever-changing needs of Amazon sellers.
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Our Values</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>
                Data-Driven Insights: We believe in the power of data to drive informed decisions.
              </li>
              <li>
                User-Centric Design: We prioritize user experience and strive to make our tools
                intuitive and accessible.
              </li>
              <li>
                Continuous Innovation: We are committed to staying ahead of the curve and delivering
                cutting-edge solutions.
              </li>
              <li>Community Focus: We aim to build a supportive community of Amazon sellers.</li>
            </ul>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutUs;
