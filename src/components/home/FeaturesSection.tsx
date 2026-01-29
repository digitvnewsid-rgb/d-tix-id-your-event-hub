import { Ticket, Shield, Zap, CreditCard, Users, BarChart3 } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Ticket,
      title: "E-Ticket Instan",
      description: "Dapatkan tiket langsung via email & WhatsApp. Cukup tunjukkan QR code di venue.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "100% Aman",
      description: "Transaksi terenkripsi dan dilindungi. Garansi refund jika event dibatalkan.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Proses Cepat",
      description: "Checkout dalam hitungan detik. Berbagai metode pembayaran tersedia.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: CreditCard,
      title: "Bayar Mudah",
      description: "Terima semua kartu, e-wallet, transfer bank, dan cicilan 0%.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Komunitas Creator",
      description: "Bergabung dengan ribuan creator sukses. Monetisasi konten dengan mudah.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: BarChart3,
      title: "Dashboard Lengkap",
      description: "Pantau penjualan, analitik, dan kelola event dari satu tempat.",
      color: "from-red-500 to-pink-500",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Kenapa D-tix?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Semua yang Kamu Butuhkan
          </h2>
          <p className="text-muted-foreground text-lg">
            Platform lengkap untuk pengalaman event yang tak terlupakan
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover decoration */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;