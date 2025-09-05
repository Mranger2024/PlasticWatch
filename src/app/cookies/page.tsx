import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Plastic Watch - Our Use of Cookies',
  description: 'Learn how Plastic Watch uses cookies and similar tracking technologies to enhance your experience, analyze usage, and improve our services.',
  keywords: 'cookie policy, website cookies, tracking technologies, privacy settings, GDPR, CCPA, data collection',
  openGraph: {
    title: 'Cookie Policy - How We Use Cookies | Plastic Watch',
    description: 'Understand how we use cookies and similar technologies to provide and improve our services while respecting your privacy choices.',
  },
};

export default function CookiePolicy() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4.02 4.02 0 00-.6-2.04m-.96 3.68c.33.4.745.765 1.229 1.08M12 11a15.58 15.58 0 01-1.5 6.571m5.75-6.57a1.5 1.5 0 013 0m-3 0V3m0 0h-3m3 0h3m-3 18a18.45 18.45 0 01-3.388-9.5" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
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
              This Cookie Policy explains how Plastic Watch ("we," "us," or "our") uses cookies and similar tracking technologies when you visit our website. By using our website, you consent to the use of cookies in accordance with this policy.
            </p>
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the site owners.
              </p>
            </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">
              We use cookies for several purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> These are necessary for the website to function and cannot be switched off.</li>
              <li><strong>Analytics Cookies:</strong> We use these to understand how visitors interact with our website.</li>
              <li><strong>Preference Cookies:</strong> These remember your preferences and settings.</li>
              <li><strong>Marketing Cookies:</strong> We use these to deliver relevant advertising.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="mb-4">
              We may use third-party services that place cookies on your device. These services help us analyze how our website is used and provide additional functionality.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
            <p className="mb-4">
              You can control and manage cookies in various ways. Please note that removing or blocking cookies can impact your user experience.
            </p>
            <p className="mb-4">
              Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" className="text-blue-600 hover:underline">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" className="text-blue-600 hover:underline">www.allaboutcookies.org</a>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Cookie Policy, please contact us at <a href="mailto:privacy@plasticwatch.org" className="text-blue-600 hover:underline">privacy@plasticwatch.org</a>.
            </p>
          </section>
        </div>
      </div>
      </section>
    </div>
  );
}
