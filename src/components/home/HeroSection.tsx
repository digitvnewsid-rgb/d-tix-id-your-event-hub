import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, Sparkles, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const stats = [
    { value: "10K+", label: "Event", icon: Sparkles },
    { value: "500K+", label: "Tiket Terjual", icon: TrendingUp },
    { value: "50K+", label: "Creator", icon: Users },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-accent animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-primary animate-pulse delay-300" />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-accent animate-pulse delay-500" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground/90 text-sm font-medium animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Platform Ticketing #1 di Indonesia
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight animate-fade-in-up">
              Temukan Event
              <span className="block text-gradient-gold">Impianmu</span>
              Disini
            </h1>

            <p className="text-lg text-primary-foreground/70 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Jelajahi ribuan event menarik, dukung creator favoritmu, 
              atau mulai jual tiket eventmu sendiri dengan mudah.
            </p>

            {/* Search Box */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Cari konser, festival, workshop..."
                  className="pl-12 h-14 rounded-xl bg-card/95 border-0 text-foreground placeholder:text-muted-foreground shadow-xl"
                />
              </div>
              <Button variant="hero" size="xl" className="shrink-0">
                Cari Event
              </Button>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <span className="text-sm text-primary-foreground/60">Populer:</span>
              {["Konser", "Festival", "Stand Up", "Seminar"].map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${tag}`}
                  className="px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-sm hover:bg-primary-foreground/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-accent" />
                    <span className="text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</span>
                  </div>
                  <span className="text-sm text-primary-foreground/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Featured Cards */}
          <div className="hidden lg:block relative">
            <div className="relative w-full h-[500px]">
              {/* Main Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-96 rounded-2xl overflow-hidden shadow-2xl animate-float z-20">
                <img
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=600&fit=crop"
                  alt="Concert"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-1 rounded-full bg-emerald text-primary-foreground text-xs font-medium mb-2">
                    Tiket Tersedia
                  </span>
                  <h3 className="text-primary-foreground font-bold">Jakarta Music Festival</h3>
                  <p className="text-primary-foreground/70 text-sm">Sabtu, 15 Mar 2025</p>
                  <p className="text-accent font-bold mt-2">Rp350.000</p>
                </div>
              </div>

              {/* Secondary Card 1 */}
              <div className="absolute top-8 left-0 w-48 h-64 rounded-xl overflow-hidden shadow-xl opacity-80 rotate-[-8deg] z-10" style={{ animationDelay: "0.5s" }}>
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop"
                  alt="Live Music"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-secondary/40" />
              </div>

              {/* Secondary Card 2 */}
              <div className="absolute bottom-8 right-0 w-48 h-64 rounded-xl overflow-hidden shadow-xl opacity-80 rotate-[8deg] z-10">
                <img
                  src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=400&fit=crop"
                  alt="Festival"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-secondary/40" />
              </div>

              {/* Play Button Overlay */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-glow animate-pulse-glow z-30 hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-primary-foreground ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;