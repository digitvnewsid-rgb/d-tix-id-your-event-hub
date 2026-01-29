import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "./EventCard";

const FeaturedEvents = () => {
  const events = [
    {
      id: "1",
      title: "Jakarta Music Festival 2025",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
      date: "Sabtu, 15 Mar 2025 • 18:00 WIB",
      location: "Gelora Bung Karno, Jakarta",
      price: 350000,
      organizer: "Live Nation ID",
      category: "Festival",
      isAvailable: true,
      isFeatured: true,
    },
    {
      id: "2",
      title: "Stand Up Comedy: Raditya Dika Live",
      image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop",
      date: "Jumat, 21 Mar 2025 • 19:30 WIB",
      location: "The Pallas, SCBD Jakarta",
      price: 250000,
      organizer: "Narasi TV",
      category: "Comedy",
      isAvailable: true,
    },
    {
      id: "3",
      title: "Tech Conference Indonesia 2025",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      date: "Senin-Selasa, 7-8 Apr 2025",
      location: "ICE BSD, Tangerang",
      price: 1500000,
      organizer: "Tech in Asia",
      category: "Conference",
      isAvailable: true,
    },
    {
      id: "4",
      title: "Dewa 19 Reunion Concert",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      date: "Sabtu, 22 Mar 2025 • 19:00 WIB",
      location: "Istora Senayan, Jakarta",
      price: 500000,
      organizer: "Rajawali Indonesia",
      category: "Konser",
      isAvailable: true,
      isFeatured: true,
    },
    {
      id: "5",
      title: "Food Festival Jakarta 2025",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
      date: "Jumat-Minggu, 28-30 Mar 2025",
      location: "Senayan Park, Jakarta",
      price: 50000,
      organizer: "Jakarta Good Food",
      category: "Kuliner",
      isAvailable: true,
    },
    {
      id: "6",
      title: "Indonesian Gaming Convention",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
      date: "Sabtu-Minggu, 5-6 Apr 2025",
      location: "JCC, Jakarta",
      price: 150000,
      organizer: "ESL Indonesia",
      category: "Gaming",
      isAvailable: false,
    },
  ];

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
                Event yang paling banyak dicari minggu ini
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

        {/* Events Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <EventCard {...event} />
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
      </div>
    </section>
  );
};

export default FeaturedEvents;