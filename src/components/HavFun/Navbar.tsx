import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/hooks/useContent';
import { isAdminEmail } from '@/lib/admin';
import { 
  User as UserIcon, 
  LogOut, 
  Ticket, 
  Shield, 
  Menu, 
  X, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PremiumButton from '@/components/ui/PremiumButton';

const Navbar = () => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const { data: site } = useSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="glass-premium rounded-2xl md:rounded-full border border-border/40 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-2xl backdrop-blur-xl bg-background/70">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            {site?.logo ? (
              <img 
                src={site.logo} 
                alt="HavFun" 
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-black text-primary text-base">
                H
              </div>
            )}
            <span className="font-extrabold tracking-tight text-foreground text-base md:text-lg hidden sm:inline-block">
              Hav<span className="text-primary italic">Fun</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <a href="/#attractions" className="text-muted-foreground hover:text-foreground transition-colors">
              Attractions
            </a>
            <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link to="/waiver" className="text-muted-foreground hover:text-foreground transition-colors">
              Waiver
            </Link>
            <Link to="/booking" className="text-muted-foreground hover:text-foreground transition-colors">
              Book Tickets
            </Link>
          </nav>

          {/* Right Section: Auth & CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 md:pr-3 rounded-full bg-card/60 border border-border/60 hover:border-primary/40 transition-all">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'Profile'} 
                        className="w-7 h-7 rounded-full object-cover border border-primary/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-foreground max-w-[90px] truncate hidden md:inline">
                      {user.displayName?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-56 p-2 rounded-2xl glass-premium border border-border/40 backdrop-blur-2xl shadow-xl space-y-1"
                >
                  <div className="px-3 py-2 border-b border-border/30 mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user.displayName || 'Guest User'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <Link 
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-primary" />
                    My Bookings & Profile
                  </Link>

                  {isAdminEmail(user.email) && (
                    <Link 
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button 
                    onClick={() => signOutUser()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="px-3.5 py-1.5 rounded-full bg-card/60 hover:bg-card border border-border/60 hover:border-primary/50 text-xs font-bold flex items-center gap-2 transition-all hover:scale-[1.02] shadow-sm text-foreground"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Sign In
              </button>
            )}

            <Link to="/booking" className="hidden sm:inline-block">
              <PremiumButton size="sm" className="px-4 py-1.5 text-xs">
                Book Now
              </PremiumButton>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl md:hidden text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown & Backdrop */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay to close menu on outside tap */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <div className="relative z-50 md:hidden mt-2 p-4 rounded-2xl glass-premium border border-border/40 backdrop-blur-2xl shadow-2xl space-y-3 animate-scale-in">
              <nav className="flex flex-col gap-2 text-sm font-medium">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-card/40 transition-colors"
                >
                  Home
                </Link>
                <a 
                  href="/#attractions" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-card/40 transition-colors"
                >
                  Attractions
                </a>
                <a 
                  href="/#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-card/40 transition-colors"
                >
                  Pricing
                </a>
                <Link 
                  to="/waiver" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-card/40 transition-colors"
                >
                  Sign Waiver
                </Link>
                <Link 
                  to="/booking" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-primary font-bold hover:bg-primary/10 transition-colors flex items-center justify-between"
                >
                  <span>Book Tickets</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-extrabold">Instant</span>
                </Link>
                {user && (
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-foreground font-semibold flex items-center gap-2 hover:bg-card/40 transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-primary" />
                    My Bookings & Profile
                  </Link>
                )}
                {user && isAdminEmail(user.email) && (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-amber-400 font-semibold flex items-center gap-2 hover:bg-card/40 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    Admin Dashboard
                  </Link>
                )}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
