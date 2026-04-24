import { Hero } from '@/components/home/Hero';
import { TrustStrip } from '@/components/home/TrustStrip';
import { MenuCards } from '@/components/home/MenuCards';
import { ApproachPreview } from '@/components/home/ApproachPreview';

/**
 * 홈 페이지.
 * 층층이 리듬이 바뀌도록 배경 톤 변화:
 *   Hero(light mesh) → TrustStrip(brand-950) → MenuCards(paper) → ApproachPreview(white) → Footer(brand-950)
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <MenuCards />
      <ApproachPreview />
    </>
  );
}
