import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=800&fit=crop"
              alt="Concert crowd"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:py-24 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                Bergabung dengan 500K+ pengguna aktif
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-6 animate-fade-in-up">
                Siap Memulai Petualangan
                <span className="block text-gradient-gold">Event Terbaikmu?</span>
              </h2>

              <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Daftar gratis sekarang dan nikmati kemudahan membeli tiket, 
                mengikuti creator favorit, atau mulai jual tiket eventmu sendiri.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <Link to="/register">
                  <Button variant="hero" size="xl" className="min-w-[200px]">
                    Daftar Gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/organizer">
                  <Button variant="hero-outline" size="xl" className="min-w-[200px]">
                    Buat Event
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-primary animate-pulse delay-300" />
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-accent animate-pulse delay-500" />
        </div>
      </div>
    </section>
  );
};

export default CTASection;