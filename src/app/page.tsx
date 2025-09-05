import HeroSection from '@/components/home/hero-section';
import StatsSection from '@/components/home/stats-section';
import LeaderboardSection from '@/components/home/leaderboard-section';
import MapSection from '@/components/home/map-section';
import BeachesSection from '@/components/home/beaches-section';
import CtaSection from '@/components/home/cta-section';
import HowItWorksSection from '@/components/home/how-it-works-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <div id="learn-more" className="scroll-mt-20">
        <HowItWorksSection />
      </div>
      <div className="container space-y-16 py-16 md:py-24 lg:py-32">
        <LeaderboardSection />
        <MapSection />
        <BeachesSection />
      </div>
     
    </>
  );
}
