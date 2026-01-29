import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Menu, 
  X, 
  Ticket, 
  Calendar, 
  Users, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories = [
    { name: "Konser", icon: Sparkles },
    { name: "Festival", icon: Calendar },
    { name: "Seminar", icon: Users },
    { name: "Workshop", icon: Ticket },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container flex items-center justify-between h-10 text-xs">
          <div className="hidden md:flex items-center gap-4">
            <span className="text-secondary-foreground/80">🎉 Promo Spesial! Diskon 20% untuk event pertamamu</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Link to="/help" className="hover:text-primary transition-colors">Bantuan</Link>
            <Link to="/about" className="hover:text-primary transition-colors">Tentang Kami</Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-card/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                <Ticket className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">D-tix</span>
                <span className="text-[10px] text-muted-foreground -mt-1">Ticketing System</span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className={`hidden md:flex flex-1 max-w-xl mx-4 transition-all duration-300 ${isSearchFocused ? 'max-w-2xl' : ''}`}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari event, konser, festival..."
                  className="pl-10 pr-4 h-11 rounded-xl border-2 border-muted focus:border-primary bg-muted/50 transition-all"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    Kategori
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat.name} className="gap-2 cursor-pointer">
                      <cat.icon className="w-4 h-4" />
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to="/events">
                <Button variant="ghost">Jelajahi Event</Button>
              </Link>
              <Link to="/creators">
                <Button variant="ghost">Creator</Button>
              </Link>
              <Link to="/organizer">
                <Button variant="ghost">Buat Event</Button>
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Masuk</Button>
              </Link>
              <Link to="/register">
                <Button variant="coral" size="sm">Daftar</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari event..."
                className="pl-10 h-10 rounded-xl border-2 border-muted focus:border-primary bg-muted/50"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card animate-fade-in">
            <div className="container py-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/category/${cat.name.toLowerCase()}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                  >
                    <cat.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </Link>
                ))}
              </div>
              <div className="pt-2 space-y-2">
                <Link to="/events" className="block">
                  <Button variant="ghost" className="w-full justify-start">Jelajahi Event</Button>
                </Link>
                <Link to="/creators" className="block">
                  <Button variant="ghost" className="w-full justify-start">Creator</Button>
                </Link>
                <Link to="/organizer" className="block">
                  <Button variant="ghost" className="w-full justify-start">Buat Event</Button>
                </Link>
              </div>
              <div className="pt-4 flex gap-2">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Masuk</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button variant="coral" className="w-full">Daftar</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;