// src/pages/Legal.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { FileText } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export default function Legal() {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Legal Information
          </h1>
          <p className="text-muted-foreground">
            Legal disclosures and compliance documents
          </p>
        </div>

        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-left">Privacy Policy</AccordionTrigger>
              <AccordionContent>
                <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                  {/* Privacy policy content placeholder */}
                </section>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="terms">
              <AccordionTrigger className="text-left">Terms of Service</AccordionTrigger>
              <AccordionContent>
                <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                  {/* Terms of service content placeholder */}
                </section>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="compliance">
              <AccordionTrigger className="text-left">Compliance Documentation</AccordionTrigger>
              <AccordionContent>
                <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                  {/* Compliance documentation placeholder */}
                </section>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </MainLayout>
  );
}
