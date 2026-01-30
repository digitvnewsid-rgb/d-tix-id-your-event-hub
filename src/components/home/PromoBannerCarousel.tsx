import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  display_order: number;
}

interface PromoBannerCarouselProps {
  position: "top" | "middle";
  className?: string;
}

const PromoBannerCarousel = ({ position, className }: PromoBannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["promo-banners", position],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .eq("position", position)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as PromoBanner[];
    },
  });

  const nextSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  }, [banners.length]);

  // Auto-advance carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [banners.length, nextSlide]);

  if (isLoading) {
    return (
      <div className={cn("w-full h-[200px] md:h-[280px] bg-muted animate-pulse rounded-xl", className)} />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const handleBannerClick = (linkUrl: string | null) => {
    if (linkUrl) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl", className)}>
      {/* Banners Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative min-w-full cursor-pointer"
            onClick={() => handleBannerClick(banner.link_url)}
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-[200px] md:h-[280px] object-cover"
            />
            {/* Optional overlay with title */}
            {banner.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl md:text-2xl font-bold">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm md:text-base opacity-90">{banner.subtitle}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoBannerCarousel;
