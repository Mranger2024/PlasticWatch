import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us | Plastic Watch - Fighting Ocean Plastic Pollution',
  description: 'Learn about Plastic Watch, our mission to combat plastic pollution, and how we empower communities to protect our oceans through data-driven solutions.',
  keywords: 'plastic pollution, ocean conservation, environmental protection, beach cleanup, plastic waste tracking',
  openGraph: {
    title: 'About Plastic Watch - Our Mission to Combat Ocean Plastic',
    description: 'Discover how Plastic Watch is making a difference in the fight against ocean plastic pollution through community-driven data collection and awareness.',
  },
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-cyan-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Mission: A Plastic-Free Ocean</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            At Plastic Watch, we're building a global movement to track, analyze, and reduce plastic pollution in our oceans and waterways.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg text-gray-700">
              <p className="mb-6">
                Founded in 2023, Plastic Watch began as a small initiative by a group of environmental scientists and technologists who were frustrated by the growing plastic pollution crisis. What started as a local beach cleanup project has evolved into a global platform that empowers communities to monitor and reduce plastic waste.
              </p>
              <p className="mb-6">
                Today, we work with thousands of volunteers, researchers, and organizations worldwide to collect data on plastic pollution, identify pollution hotspots, and hold corporations accountable for their environmental impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How Plastic Watch Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: '1. Data Collection',
                description: 'Citizen scientists and volunteers collect data on plastic waste using our mobile app, documenting types, quantities, and locations of plastic pollution.'
              },
              {
                title: '2. Analysis',
                description: 'Our team of environmental scientists analyzes the data to identify trends, pollution sources, and high-impact intervention points.'
              },
              {
                title: '3. Action',
                description: 'We use our findings to advocate for policy changes, corporate responsibility, and community-led cleanup initiatives.'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
            {[
              { number: '10,000+', label: 'Beaches Monitored' },
              { number: '2.5M+', label: 'Pieces of Plastic Tracked' },
              { number: '50+', label: 'Countries Engaged' },
            ].map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Dr. Sarah Chen',
                role: 'Founder & Lead Scientist',
                bio: 'Marine biologist with 15+ years of experience in ocean conservation and plastic pollution research.'
              },
              {
                name: 'James Wilson',
                role: 'CTO',
                bio: 'Technology leader specializing in data platforms for environmental monitoring and citizen science.'
              },
              {
                name: 'Maria Garcia',
                role: 'Community Director',
                bio: 'Environmental activist with expertise in community engagement and volunteer coordination.'
              }
            ].map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                  <Image
                    src={`/team/team-${index + 1}.jpg`}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Become part of our global community working to end plastic pollution in our oceans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contribute" 
              className="px-8 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Contributing
            </a>
            <a 
              href="/contact" 
              className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
