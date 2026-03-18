import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { PrizeShowcase } from '@/components/PrizeShowcase';
import { Pricing } from '@/components/Pricing';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <PrizeShowcase />
      <Pricing />
    </>
  );
}
