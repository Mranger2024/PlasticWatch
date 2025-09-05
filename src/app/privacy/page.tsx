import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Plastic Watch - Your Data Protection',
  description: 'Learn how Plastic Watch collects, uses, and protects your personal information. We are committed to safeguarding your privacy and being transparent about our data practices.',
  keywords: 'privacy policy, data protection, personal information, GDPR, CCPA, data collection, user privacy',
  openGraph: {
    title: 'Privacy Policy - Plastic Watch Data Protection',
    description: 'Your privacy matters. Learn how we collect, use, and protect your data while you help us fight plastic pollution.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
              At Plastic Watch, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">1. Information We Collect</h2>
            <p>We collect several types of information from and about users of our website, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Personal Information:</strong> Name, email address, phone number, and other contact details.</li>
              <li><strong>Account Information:</strong> Username, password, and profile information.</li>
              <li><strong>Contribution Data:</strong> Photos, locations, and descriptions of plastic waste you report.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">2. How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide, operate, and maintain our services</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. Your Data Protection Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>The right to access, update, or delete your information</li>
              <li>The right to rectification</li>
              <li>The right to object</li>
              <li>The right of restriction</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. Third-Party Services</h2>
            <p>We may employ third-party companies and individuals to facilitate our services, provide services on our behalf, or assist us in analyzing how our services are used. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">6. Children's Privacy</h2>
            <p>Our services are not intended for individuals under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">7. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this policy.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-4">
              <strong>Email:</strong> privacy@plasticwatch.org<br />
              <strong>Address:</strong> 123 Ocean View Drive, San Francisco, CA 94105, USA
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
