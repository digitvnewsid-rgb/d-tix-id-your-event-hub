import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle2,
} from "lucide-react";

const Overview = () => {
  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: eventsCount },
        { count: ticketsCount },
        { data: recentTickets },
        { data: recentEvents },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("tickets").select("*", { count: "exact", head: true }),
        supabase
          .from("tickets")
          .select(`
            *,
            events(title),
            price_tiers(name, price)
          `)
          .order("purchased_at", { ascending: false })
          .limit(5),
        supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Calculate total revenue
      const { data: allTickets } = await supabase
        .from("tickets")
        .select("price_tiers(price)");

      const totalRevenue = allTickets?.reduce(
        (sum, t) => sum + (t.price_tiers?.price || 0),
        0
      ) || 0;

      return {
        usersCount: usersCount || 0,
        eventsCount: eventsCount || 0,
        ticketsCount: ticketsCount || 0,
        totalRevenue,
        recentTickets: recentTickets || [],
        recentEvents: recentEvents || [],
      };
    },
  });

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats?.usersCount || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Event",
      value: stats?.eventsCount || 0,
      icon: Calendar,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Tiket Terjual",
      value: stats?.ticketsCount || 0,
      icon: Ticket,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Total Pendapatan",
      value: `Rp ${(stats?.totalRevenue || 0).toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout
      title="Dashboard Overview"
      description="Ringkasan statistik dan aktivitas terbaru"
    >
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">
                    {isLoading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Tiket Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : stats?.recentTickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Belum ada tiket terjual
              </p>
            ) : (
              <div className="space-y-3">
                {stats?.recentTickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {ticket.events?.title || "Unknown Event"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.price_tiers?.name} • Rp{" "}
                        {ticket.price_tiers?.price?.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          ticket.status === "active"
                            ? "bg-green-500/10 text-green-600"
                            : ticket.status === "used"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-gray-500/10 text-gray-600"
                        }`}
                      >
                        {ticket.status === "active" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {ticket.status}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(ticket.purchased_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : stats?.recentEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Belum ada event
              </p>
            ) : (
              <div className="space-y-3">
                {stats?.recentEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {event.cover_image ? (
                      <img
                        src={event.cover_image}
                        alt={event.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.city || event.location}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          event.is_published
                            ? "bg-green-500/10 text-green-600"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        {event.is_published ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Published
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Draft
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Overview;
