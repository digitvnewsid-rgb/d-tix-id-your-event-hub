import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventCard from "@/components/home/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Calendar, Loader2 } from "lucide-react";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch published events
  const { data: events, isLoading } = useQuery({
    queryKey: ["events", selectedCategory, selectedCity, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          categories(name, slug),
          profiles!events_organizer_id_fkey(full_name),
          price_tiers(price)
        `)
        .eq("is_published", true)
        .order("event_date", { ascending: true });

      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedCity && selectedCity !== "all") {
        query = query.ilike("city", `%${selectedCity}%`);
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Get unique cities from events
  const cities = events
    ? [...new Set(events.map((e) => e.city).filter(Boolean))]
    : [];

  // Sample events for demo (when no real events exist)
  const sampleEvents = [
    {
      id: "1",
      title: "Jakarta Music Festival 2025",
      cover_image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
      event_date: "2025-03-15T18:00:00",
      location: "Gelora Bung Karno, Jakarta",
      city: "Jakarta",
      categories: { name: "Festival", slug: "festival" },
      profiles: { full_name: "Live Nation ID" },
      price_tiers: [{ price: 350000 }],
      is_published: true,
    },
    {
      id: "2",
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
      id: "3",
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
      id: "4",
      title: "Dewa 19 Reunion Concert",
      cover_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      event_date: "2025-03-22T19:00:00",
      location: "Istora Senayan, Jakarta",
      city: "Jakarta",
      categories: { name: "Konser", slug: "konser" },
      profiles: { full_name: "Rajawali Indonesia" },
      price_tiers: [{ price: 500000 }],
      is_published: true,
    },
    {
      id: "5",
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
      id: "6",
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

  const getLowestPrice = (priceTiers: { price: number }[]) => {
    if (!priceTiers || priceTiers.length === 0) return 0;
    return Math.min(...priceTiers.map((t) => t.price));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-16">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Jelajahi Semua Event
              </h1>
              <p className="text-primary-foreground/70">
                Temukan event menarik sesuai minatmu
              </p>
            </div>

            {/* Search & Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari event..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <MapPin className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Kota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kota</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city!}>
                          {city}
                        </SelectItem>
                      ))}
                      {cities.length === 0 && (
                        <>
                          <SelectItem value="Jakarta">Jakarta</SelectItem>
                          <SelectItem value="Bandung">Bandung</SelectItem>
                          <SelectItem value="Surabaya">Surabaya</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>

                  <Button variant="coral" className="shrink-0">
                    <Calendar className="w-4 h-4 mr-2" />
                    Filter Tanggal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-12">
          <div className="container">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : displayEvents.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  Tidak ada event ditemukan
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">
                  Menampilkan {displayEvents.length} event
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <EventCard
                        id={event.id}
                        title={event.title}
                        image={event.cover_image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop"}
                        date={formatDate(event.event_date)}
                        location={event.location}
                        price={getLowestPrice(event.price_tiers || [])}
                        organizer={event.profiles?.full_name || "Organizer"}
                        category={event.categories?.name || "Event"}
                        isAvailable={true}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Events;