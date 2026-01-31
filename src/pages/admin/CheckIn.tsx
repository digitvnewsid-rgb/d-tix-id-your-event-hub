import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  XCircle, 
  Ticket, 
  User, 
  Calendar,
  MapPin,
  Search,
  RefreshCw,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TicketInfo {
  id: string;
  qr_code: string;
  status: string;
  checked_in_at: string | null;
  purchased_at: string;
  event: {
    id: string;
    title: string;
    event_date: string;
    venue_name: string | null;
    location: string;
  };
  price_tier: {
    id: string;
    name: string;
    price: number;
  };
  user: {
    id: string;
    full_name: string | null;
  };
}

type ScanResult = {
  status: "idle" | "scanning" | "success" | "error" | "already_checked_in";
  message: string;
  ticket?: TicketInfo;
};

const CheckIn = () => {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult>({
    status: "idle",
    message: "Siap untuk scan tiket",
  });
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch recent check-ins
  const { data: recentCheckIns, refetch: refetchCheckIns } = useQuery({
    queryKey: ["recent-checkins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          qr_code,
          status,
          checked_in_at,
          event:events(title),
          price_tier:price_tiers(name),
          user_id
        `)
        .not("checked_in_at", "is", null)
        .order("checked_in_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get profiles for users
      const userIds = [...new Set(data.map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return data.map(ticket => ({
        ...ticket,
        user_name: profileMap.get(ticket.user_id) || "Unknown User"
      }));
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      // Find ticket by QR code
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          id,
          qr_code,
          status,
          checked_in_at,
          purchased_at,
          user_id,
          event:events(id, title, event_date, venue_name, location),
          price_tier:price_tiers(id, name, price)
        `)
        .eq("qr_code", qrCode)
        .single();

      if (ticketError || !ticket) {
        throw new Error("Tiket tidak ditemukan");
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", ticket.user_id)
        .single();

      const ticketInfo: TicketInfo = {
        id: ticket.id,
        qr_code: ticket.qr_code,
        status: ticket.status,
        checked_in_at: ticket.checked_in_at,
        purchased_at: ticket.purchased_at,
        event: ticket.event as TicketInfo["event"],
        price_tier: ticket.price_tier as TicketInfo["price_tier"],
        user: {
          id: ticket.user_id,
          full_name: profile?.full_name || null,
        },
      };

      // Check if already checked in
      if (ticket.checked_in_at) {
        return { alreadyCheckedIn: true, ticket: ticketInfo };
      }

      // Check ticket status
      if (ticket.status !== "active") {
        throw new Error(`Tiket berstatus: ${ticket.status}`);
      }

      // Perform check-in
      const { error: updateError } = await supabase
        .from("tickets")
        .update({
          checked_in_at: new Date().toISOString(),
          status: "used",
        })
        .eq("id", ticket.id);

      if (updateError) throw updateError;

      return { alreadyCheckedIn: false, ticket: { ...ticketInfo, status: "used", checked_in_at: new Date().toISOString() } };
    },
    onSuccess: (result) => {
      if (result.alreadyCheckedIn) {
        setScanResult({
          status: "already_checked_in",
          message: `Tiket sudah di-check-in pada ${format(new Date(result.ticket.checked_in_at!), "dd MMM yyyy, HH:mm", { locale: id })}`,
          ticket: result.ticket,
        });
        toast.warning("Tiket sudah digunakan!");
      } else {
        setScanResult({
          status: "success",
          message: "Check-in berhasil!",
          ticket: result.ticket,
        });
        toast.success("Check-in berhasil!");
        refetchCheckIns();
      }
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: (error: Error) => {
      setScanResult({
        status: "error",
        message: error.message,
      });
      toast.error(error.message);
    },
  });

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      scannerRef.current = new Html5Qrcode("qr-reader");
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {} // Ignore errors during scanning
      );
      
      setIsScanning(true);
      setScanResult({ status: "scanning", message: "Arahkan kamera ke QR Code tiket" });
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScan = async (qrCode: string) => {
    // Stop scanning while processing
    await stopScanner();
    checkInMutation.mutate(qrCode);
  };

  const handleManualCheckIn = () => {
    if (!manualCode.trim()) {
      toast.error("Masukkan kode tiket");
      return;
    }
    checkInMutation.mutate(manualCode.trim());
    setManualCode("");
  };

  const resetScanner = () => {
    setScanResult({ status: "idle", message: "Siap untuk scan tiket" });
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Check-in Berhasil</Badge>;
      case "already_checked_in":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Sudah Check-in</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Check-in Tiket" description="Scan QR Code untuk validasi tiket di venue">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                QR Scanner
              </CardTitle>
              <CardDescription>
                Scan QR Code dari tiket peserta untuk melakukan check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scanner Container */}
              <div 
                ref={containerRef}
                className="relative aspect-square max-w-sm mx-auto bg-muted rounded-xl overflow-hidden"
              >
                <div id="qr-reader" className="w-full h-full" />
                
                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-center px-4">
                      Klik tombol di bawah untuk mulai scan
                    </p>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              <div className="flex gap-2 justify-center">
                {!isScanning ? (
                  <Button onClick={startScanner} size="lg" className="gap-2">
                    <Camera className="w-5 h-5" />
                    Mulai Scan
                  </Button>
                ) : (
                  <Button onClick={stopScanner} variant="destructive" size="lg" className="gap-2">
                    <CameraOff className="w-5 h-5" />
                    Stop Scan
                  </Button>
                )}
              </div>

              {/* Manual Input */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Atau masukkan kode tiket manual:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode tiket..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualCheckIn()}
                  />
                  <Button onClick={handleManualCheckIn} disabled={checkInMutation.isPending}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className={`border-2 transition-colors ${
            scanResult.status === "success" ? "border-green-500 bg-green-500/5" :
            scanResult.status === "already_checked_in" ? "border-yellow-500 bg-yellow-500/5" :
            scanResult.status === "error" ? "border-destructive bg-destructive/5" :
            ""
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {scanResult.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {scanResult.status === "already_checked_in" && <Clock className="h-5 w-5 text-yellow-500" />}
                  {scanResult.status === "error" && <XCircle className="h-5 w-5 text-destructive" />}
                  {(scanResult.status === "idle" || scanResult.status === "scanning") && <Ticket className="h-5 w-5" />}
                  Hasil Scan
                </CardTitle>
                {getStatusBadge(scanResult.status)}
              </div>
              <CardDescription>{scanResult.message}</CardDescription>
            </CardHeader>
            <CardContent>
              {scanResult.ticket ? (
                <div className="space-y-4">
                  {/* Event Info */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-lg">{scanResult.ticket.event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(scanResult.ticket.event.event_date), "EEEE, dd MMMM yyyy - HH:mm", { locale: id })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{scanResult.ticket.event.venue_name || scanResult.ticket.event.location}</p>
                        {scanResult.ticket.event.venue_name && (
                          <p className="text-sm text-muted-foreground">{scanResult.ticket.event.location}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ticket & User Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Tier Tiket</p>
                      <p className="font-semibold">{scanResult.ticket.price_tier.name}</p>
                      <p className="text-sm text-primary font-medium">
                        Rp {scanResult.ticket.price_tier.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Pemilik Tiket</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold truncate">{scanResult.ticket.user.full_name || "Unknown"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={resetScanner} 
                    variant="outline" 
                    className="w-full gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scan Tiket Lain
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Ticket className="w-8 h-8" />
                  </div>
                  <p>Belum ada tiket yang di-scan</p>
                  <p className="text-sm mt-1">Mulai scan atau masukkan kode manual</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Check-in Terbaru
            </CardTitle>
            <CardDescription>10 tiket terakhir yang berhasil di-check-in</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCheckIns && recentCheckIns.length > 0 ? (
              <div className="space-y-2">
                {recentCheckIns.map((checkin) => (
                  <div 
                    key={checkin.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{checkin.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {checkin.event?.title} • {checkin.price_tier?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {checkin.checked_in_at && format(new Date(checkin.checked_in_at), "HH:mm", { locale: id })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">Belum ada check-in hari ini</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CheckIn;
