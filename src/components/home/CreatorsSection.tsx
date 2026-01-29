import { Link } from "react-router-dom";
import { ArrowRight, Star, Users, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CreatorsSection = () => {
  const creators = [
    {
      id: "1",
      name: "Raditya Dika",
      username: "@radityadika",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
      category: "Comedy",
      followers: "2.5M",
      rating: 4.9,
      isVerified: true,
    },
    {
      id: "2",
      name: "Fiersa Besari",
      username: "@fiersabesari",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      category: "Music",
      followers: "1.8M",
      rating: 4.8,
      isVerified: true,
    },
    {
      id: "3",
      name: "Ria SW",
      username: "@riasw",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      cover: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
      category: "Food",
      followers: "890K",
      rating: 4.7,
      isVerified: true,
    },
    {
      id: "4",
      name: "Gita Savitri",
      username: "@gitasav",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      category: "Education",
      followers: "1.2M",
      rating: 4.9,
      isVerified: true,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Creator Pilihan
            </h2>
            <p className="text-muted-foreground">
              Dukung dan ikuti creator favoritmu
            </p>
          </div>
          <Link to="/creators">
            <Button variant="ghost" className="group">
              Lihat Semua Creator
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Creators Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((creator, index) => (
            <Link
              key={creator.id}
              to={`/creator/${creator.id}`}
              className="group block animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                {/* Cover */}
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={creator.cover}
                    alt={creator.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>

                {/* Avatar */}
                <div className="relative px-4 -mt-10">
                  <div className="relative inline-block">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-20 h-20 rounded-xl object-cover border-4 border-card shadow-lg"
                    />
                    {creator.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky flex items-center justify-center">
                        <BadgeCheck className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 pt-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {creator.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {creator.username}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {creator.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{creator.followers}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-medium">{creator.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 relative rounded-3xl overflow-hidden bg-gradient-hero p-8 md:p-12">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-[400px] h-[400px] rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[300px] h-[300px] rounded-full bg-accent/30 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                Jadi Creator D-tix
              </h3>
              <p className="text-primary-foreground/70 max-w-md">
                Monetisasi karyamu, bangun komunitas, dan dapatkan penghasilan dari passion-mu.
              </p>
            </div>
            <Button variant="hero" size="xl">
              Mulai Sekarang
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorsSection;