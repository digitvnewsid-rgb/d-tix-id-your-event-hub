import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Flame, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "./EventCard";

const FeaturedEvents = () => {
  // Fetch featured/published events from database
  const { data: events, isLoading } = useQuery({
    queryKey: ["featured-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          categories(name, slug),
          price_tiers(price)
        `)
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("event_date", { ascending: true })
        .limit(6);

      if (error) throw error;

      // Fetch profiles separately to avoid foreign key issues
      const eventsWithProfiles = await Promise.all(
        data.map(async (event) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", event.organizer_id)
            .maybeSingle();
          
          return {
            ...event,
            profiles: profile,
          };
        })
      );

      return eventsWithProfiles;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLowestPrice = (priceTiers: { price: number }[] | null) => {
    if (!priceTiers || priceTiers.length === 0) return 0;
    return Math.min(...priceTiers.map((t) => t.price));
  };

  // Sample events for demo (when no real events exist)
  const sampleEvents = [
    {
      id: "sample-1",
      title: "Jakarta Music Festival 2025",
      cover_image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
      event_date: "2025-03-15T18:00:00",
      location: "Gelora Bung Karno, Jakarta",
      city: "Jakarta",
      categories: { name: "Festival", slug: "festival" },
      profiles: { full_name: "Live Nation ID" },
      price_tiers: [{ price: 350000 }],
      is_published: true,
      is_featured: true,
    },
    {
      id: "sample-2",
      title: "Stand Up Comedy: Raditya Dika Live",
      cover_image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop",
      event_date: "2025-03-21T19:30:00",
      location: "The Pallas, SCBD Jakarta",
      city: "Jakarta",
      categories: { name: "Comedy", slug: "comedy" },
      profiles: { full_name: "Narasi TV" },
      price_tiers: [{ price: 250000 }],
      is_published: true,
    },
    {
      id: "sample-3",
      title: "Tech Conference Indonesia 2025",
      cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      event_date: "2025-04-07T09:00:00",
      location: "ICE BSD, Tangerang",
      city: "Tangerang",
      categories: { name: "Conference", slug: "conference" },
      profiles: { full_name: "Tech in Asia" },
      price_tiers: [{ price: 1500000 }],
      is_published: true,
    },
    {
      id: "sample-4",
      title: "Dewa 19 Reunion Concert",
      cover_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      event_date: "2025-03-22T19:00:00",
      location: "Istora Senayan, Jakarta",
      city: "Jakarta",
      categories: { name: "Konser", slug: "konser" },
      profiles: { full_name: "Rajawali Indonesia" },
      price_tiers: [{ price: 500000 }],
      is_published: true,
      is_featured: true,
    },
    {
      id: "sample-5",
      title: "Food Festival Jakarta 2025",
      cover_image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
      event_date: "2025-03-28T10:00:00",
      location: "Senayan Park, Jakarta",
      city: "Jakarta",
      categories: { name: "Kuliner", slug: "kuliner" },
      profiles: { full_name: "Jakarta Good Food" },
      price_tiers: [{ price: 50000 }],
      is_published: true,
    },
    {
      id: "sample-6",
      title: "Indonesian Gaming Convention",
      cover_image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
      event_date: "2025-04-05T09:00:00",
      location: "JCC, Jakarta",
      city: "Jakarta",
      categories: { name: "Gaming", slug: "gaming" },
      profiles: { full_name: "ESL Indonesia" },
      price_tiers: [{ price: 150000 }],
      is_published: true,
    },
  ];

  const displayEvents = events && events.length > 0 ? events : sampleEvents;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Event Populer
              </h2>
              <p className="text-muted-foreground">
                {events && events.length > 0 
                  ? "Event terbaru dari database" 
                  : "Event yang paling banyak dicari minggu ini"}
              </p>
            </div>
          </div>
          <Link to="/events">
            <Button variant="outline" className="group">
              Lihat Semua Event
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EventCard
                    id={event.id}
                    title={event.title}
                    image={event.cover_image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop"}
                    date={formatDate(event.event_date)}
                    location={event.location}
                    price={getLowestPrice(event.price_tiers)}
                    organizer={event.profiles?.full_name || "Organizer"}
                    category={event.categories?.name || "Event"}
                    isAvailable={true}
                    isFeatured={event.is_featured || false}
                  />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Link to="/events">
                <Button variant="coral" size="lg">
                  Jelajahi Semua Event
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;