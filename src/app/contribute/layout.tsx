import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contribute - Plastic Watch',
  description: 'Contribute to our plastic pollution tracking efforts',
};

export default function ContributeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="contribute-page min-h-screen bg-gray-50">
      <main className="container mx-auto px-3 py-6">
        {children}
      </main>
    </div>
  );
}
