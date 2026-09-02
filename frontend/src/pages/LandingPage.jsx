import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import {
  AboutSection,
  BenefitsSection,
  TrainersSection,
  PlansSection,
  ReviewsSection,
  FAQSection,
  ContactSection,
} from '../components/landing/LandingSections';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />
      <Hero />
      <AboutSection />
      <BenefitsSection />
      <TrainersSection />
      <PlansSection />
      <ReviewsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
