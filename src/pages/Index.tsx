import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import CreatorsSection from "@/components/home/CreatorsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";
import PromoBannerCarousel from "@/components/home/PromoBannerCarousel";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        
        {/* Top Promo Banner Carousel */}
        <section className="py-6 container">
          <PromoBannerCarousel position="top" />
        </section>
        
        <FeaturedEvents />
        
        {/* Middle Promo Banner Carousel */}
        <section className="py-6 container">
          <PromoBannerCarousel position="middle" />
        </section>
        
        <CreatorsSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;