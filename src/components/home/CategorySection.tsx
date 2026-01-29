import { Link } from "react-router-dom";
import { 
  Music, 
  Mic2, 
  GraduationCap, 
  Palette, 
  Film, 
  Gamepad2,
  Utensils,
  Heart,
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CategorySection = () => {
  const categories = [
    { 
      name: "Konser", 
      icon: Music, 
      count: 234,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10"
    },
    { 
      name: "Festival", 
      icon: Mic2, 
      count: 89,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500/10"
    },
    { 
      name: "Seminar", 
      icon: GraduationCap, 
      count: 456,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      name: "Seni & Teater", 
      icon: Palette, 
      count: 78,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10"
    },
    { 
      name: "Film", 
      icon: Film, 
      count: 123,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-500/10"
    },
    { 
      name: "Gaming", 
      icon: Gamepad2, 
      count: 67,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    },
    { 
      name: "Kuliner", 
      icon: Utensils, 
      count: 145,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500/10"
    },
    { 
      name: "Charity", 
      icon: Heart, 
      count: 34,
      color: "from-rose-500 to-red-500",
      bgColor: "bg-rose-500/10"
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Jelajahi Kategori
            </h2>
            <p className="text-muted-foreground">
              Temukan event sesuai minat dan passionmu
            </p>
          </div>
          <Link to="/categories">
            <Button variant="ghost" className="group">
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/category/${category.name.toLowerCase()}`}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${category.bgColor}`} />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.count} Event
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;