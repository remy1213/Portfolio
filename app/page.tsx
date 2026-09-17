import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { WordsMarquee } from "@/components/landing/words-marquee";
import { FeaturedWork } from "@/components/landing/featured-work";
import { GalleryTeaser } from "@/components/landing/gallery-teaser";
import { PhotoZoomSection } from "@/components/landing/photo-zoom-section";
import { ReelSection } from "@/components/landing/reel-section";
import { BrandsSection } from "@/components/landing/brands-section";
import { SkillsSection } from "@/components/landing/skills-section";
import { AboutMe } from "@/components/landing/about-me";
import { ContactSection } from "@/components/landing/contact-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <WordsMarquee />
      <FeaturedWork />
      <PhotoZoomSection />
      <GalleryTeaser />
      <ReelSection />
      <BrandsSection />
      <SkillsSection />
      <AboutMe />
      <ContactSection />
      <FooterSection />
    </main>
  );
}
