import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="bg-secondary">
      <div className="container py-16 md:py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Ready to Make an Impact?
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
          Every piece of plastic you document helps build a clearer picture of pollution and drives change.
        </p>
        <div className="mt-8">
          <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl" asChild>
            <Link href="/contribute">Join the Effort Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
