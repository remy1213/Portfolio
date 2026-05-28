import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturedWork } from "@/components/landing/featured-work";
import { AboutMe } from "@/components/landing/about-me";
import { ContactSection } from "@/components/landing/contact-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturedWork />
      <AboutMe />
      <ContactSection />
      <FooterSection />
    </main>
  );
}
