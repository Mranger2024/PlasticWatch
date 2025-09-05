import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Plastic Watch - Legal Agreement',
  description: 'Review the terms and conditions that govern your use of Plastic Watch services. By using our platform, you agree to these terms and conditions.',
  keywords: 'terms and conditions, terms of service, user agreement, legal terms, website terms',
  openGraph: {
    title: 'Terms & Conditions - Plastic Watch Legal Agreement',
    description: 'Understand the terms that govern your use of Plastic Watch and your rights and responsibilities as a user of our platform.',
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-xl text-gray-600">
            Last Updated: September 5, 2024
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg text-gray-700 max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              Welcome to Plastic Watch. These Terms and Conditions ("Terms") govern your access to and use of our website and services. By accessing or using our services, you agree to be bound by these Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">1. Acceptance of Terms</h2>
            <p>By accessing or using the Plastic Watch platform, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">2. User Accounts</h2>
            <p>To access certain features of our services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3. User Contributions</h2>
            <p>By submitting content to our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content.</p>
            <p className="mt-4">You agree not to submit content that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Is illegal, harmful, or promotes illegal activities</li>
              <li>Infringes on any patent, trademark, trade secret, copyright, or other intellectual property rights</li>
              <li>Contains false or misleading information</li>
              <li>Contains viruses or other harmful components</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. Intellectual Property</h2>
            <p>The content, organization, graphics, design, and other matters related to our services are protected under applicable copyrights, trademarks, and other proprietary rights. The copying, redistribution, use, or publication by you of any such matters is strictly prohibited.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. Limitation of Liability</h2>
            <p>In no event shall Plastic Watch, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the services.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">6. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless Plastic Watch and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses resulting from your use and access of the services, or a breach of these Terms.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">7. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">8. Changes to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Last Updated" date.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">9. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p className="mt-4">
              <strong>Email:</strong> legal@plasticwatch.org<br />
              <strong>Address:</strong> 123 Ocean View Drive, San Francisco, CA 94105, USA
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
