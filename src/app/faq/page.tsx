import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Plastic Watch',
  description: 'Find answers to common questions about Plastic Watch and our mission to combat plastic pollution.',
};

const faqs = [
  {
    question: 'What is Plastic Watch?',
    answer: 'Plastic Watch is a community-driven platform that tracks and monitors plastic pollution in our oceans and beaches. We collect data from contributors worldwide to identify pollution hotspots and hold companies accountable.'
  },
  {
    question: 'How can I contribute data?',
    answer: 'You can contribute by visiting our Contribute page and submitting information about plastic waste you find. Simply take photos, note the location, and provide details about the waste you found.'
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes, we take your privacy seriously. We only collect necessary information and never share your personal data without your consent. Please review our Privacy Policy for more details.'
  },
  {
    question: 'How is the data used?',
    answer: 'The data is used to create awareness, inform policy decisions, and work with companies to reduce plastic waste. We also share our findings with environmental organizations and researchers.'
  },
  {
    question: 'Can I volunteer with Plastic Watch?',
    answer: 'Yes! We welcome volunteers to help with data collection, community outreach, and more. Please visit our Contact page to get in touch about volunteer opportunities.'
  },
  {
    question: 'How can I report an issue with the website?',
    answer: 'If you encounter any technical issues or have suggestions, please contact our support team through the Contact page. We appreciate your feedback!'
  }
];

export default function FAQPage() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about our platform and how you can help combat plastic pollution.</p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <CardContent className="px-6 pb-6 pt-0 text-gray-600">
                  <p>{faq.answer}</p>
                </CardContent>
              </details>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a 
            href="/contact" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
