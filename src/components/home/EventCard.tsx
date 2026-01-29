import { Link } from "react-router-dom";
import { Calendar, MapPin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  price: number;
  organizer: string;
  category: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
}

const EventCard = ({
  id,
  title,
  image,
  date,
  location,
  price,
  organizer,
  category,
  isAvailable = true,
  isFeatured = false,
}: EventCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link
      to={`/event/${id}`}
      className={`group block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl ${
        isFeatured ? "ring-2 ring-accent" : ""
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={isAvailable ? "default" : "secondary"}
            className={isAvailable ? "bg-emerald text-primary-foreground" : "bg-destructive text-destructive-foreground"}
          >
            {isAvailable ? "Tiket Tersedia" : "Sold Out"}
          </Badge>
        </div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-accent text-accent-foreground">
              ⭐ Featured
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            // Handle wishlist
          }}
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <span className="text-xs font-medium text-primary uppercase tracking-wider">
          {category}
        </span>

        {/* Title */}
        <h3 className="font-bold text-foreground mt-1 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Date & Location */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            {/* Organizer */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {organizer.charAt(0)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {organizer}
              </span>
            </div>

            {/* Price */}
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Mulai dari</span>
              <p className="font-bold text-primary">{formatPrice(price)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;