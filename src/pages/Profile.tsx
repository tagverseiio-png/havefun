import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { listUserBookings, type BookingInput, type WithMeta } from '@/lib/submissions';
import { useSite } from '@/hooks/useContent';
import Navbar from '@/components/HavFun/Navbar';
import PremiumButton from '@/components/ui/PremiumButton';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  LogOut, 
  Printer, 
  Sparkles, 
  HelpCircle,
  X,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { user, loading: authLoading, signInWithGoogle, signOutUser } = useAuth();
  const { data: site } = useSite();
  const [bookings, setBookings] = useState<WithMeta<BookingInput>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<WithMeta<BookingInput> | null>(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listUserBookings(user.uid, user.email || undefined);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success('Booking ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'SUCCESS') return b.paymentStatus === 'SUCCESS' || b.paymentStatus === 'COMPLETED';
    if (activeTab === 'PENDING') return b.paymentStatus === 'PENDING' || !b.paymentStatus;
    if (activeTab === 'FAILED') return b.paymentStatus === 'FAILED' || b.paymentStatus === 'CANCELLED_REFUNDED';
    return true;
  });

  const confirmedCount = bookings.filter(b => b.paymentStatus === 'SUCCESS' || b.paymentStatus === 'COMPLETED').length;
  const pendingCount = bookings.filter(b => b.paymentStatus === 'PENDING' || !b.paymentStatus).length;
  const failedCount = bookings.filter(b => b.paymentStatus === 'FAILED' || b.paymentStatus === 'CANCELLED_REFUNDED').length;
  const totalJumpers = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'SUCCESS' ? (b.participantsCount || 1) : 0), 0);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/15 blur-[140px] rounded-full" />
      </div>

      {/* Global Navbar */}
      <Navbar />

      <main className="relative z-10 container max-w-6xl mx-auto px-4 pt-28 pb-20">
        {/* Not Logged In View */}
        {!authLoading && !user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto my-12 p-8 rounded-3xl glass-premium border border-border/40 text-center space-y-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-neon">
              <Ticket className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Customer Portal</h1>
              <p className="text-sm text-muted-foreground">
                Sign in with your Google account to view your bookings, digital entry passes, and ticket history.
              </p>
            </div>

            <button
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-card hover:bg-card/80 border border-border/80 hover:border-primary/50 text-foreground font-semibold text-sm transition-all shadow-md group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="pt-4 border-t border-border/30 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Instant access • No password needed</span>
            </div>
          </motion.div>
        )}

        {/* User Logged In View */}
        {user && (
          <div className="space-y-8">
            {/* User Profile Header Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 rounded-3xl glass-premium border border-border/40 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/50 shadow-neon"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 text-primary border-2 border-primary/40 flex items-center justify-center font-bold text-2xl shadow-neon">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-black text-foreground">
                      {user.displayName || 'HavFun Guest'}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                      Customer
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link to="/booking" className="flex-1 md:flex-initial">
                  <PremiumButton className="w-full h-11 px-6 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 mr-2" /> Book New Session
                  </PremiumButton>
                </Link>
                <button
                  onClick={() => signOutUser()}
                  title="Sign Out"
                  className="p-2.5 rounded-xl bg-card/60 hover:bg-card border border-border/60 hover:border-destructive/40 text-muted-foreground hover:text-destructive transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl glass-premium border border-border/30 backdrop-blur-xl">
                <p className="text-xs text-muted-foreground font-medium">Total Bookings</p>
                <p className="text-2xl font-black text-foreground mt-1">{bookings.length}</p>
              </div>
              <div className="p-4 rounded-2xl glass-premium border border-green-500/20 bg-green-500/5 backdrop-blur-xl">
                <p className="text-xs text-green-400 font-medium">Confirmed Passes</p>
                <p className="text-2xl font-black text-green-400 mt-1">{confirmedCount}</p>
              </div>
              <div className="p-4 rounded-2xl glass-premium border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl">
                <p className="text-xs text-amber-400 font-medium">Pending / Incomplete</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
              </div>
              <div className="p-4 rounded-2xl glass-premium border border-primary/20 bg-primary/5 backdrop-blur-xl">
                <p className="text-xs text-primary font-medium">Total Jumpers Hosted</p>
                <p className="text-2xl font-black text-primary mt-1">{totalJumpers}</p>
              </div>
            </div>

            {/* Filter Tabs & Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-md overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    activeTab === 'ALL'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('SUCCESS')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    activeTab === 'SUCCESS'
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Confirmed ({confirmedCount})
                </button>
                <button
                  onClick={() => setActiveTab('PENDING')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    activeTab === 'PENDING'
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setActiveTab('FAILED')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    activeTab === 'FAILED'
                      ? "bg-destructive text-destructive-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Failed ({failedCount})
                </button>
              </div>

              <button
                onClick={fetchBookings}
                disabled={loading}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/40 hover:bg-card/40"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-primary")} />
                <span>Refresh Bookings</span>
              </button>
            </div>

            {/* Bookings List */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Loading your passes & booking history...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 px-6 text-center rounded-3xl border border-dashed border-border/50 bg-card/20 space-y-4">
                <Ticket className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground">No bookings found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {activeTab === 'ALL'
                      ? "You haven't made any bookings with HavFun yet. Book your high-flying session now!"
                      : `No bookings matching "${activeTab.toLowerCase()}" status.`}
                  </p>
                </div>
                <Link to="/booking">
                  <PremiumButton className="h-10 px-6 text-xs mt-2">
                    Book Tickets Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </PremiumButton>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredBookings.map((b) => {
                  const isSuccess = b.paymentStatus === 'SUCCESS' || b.paymentStatus === 'COMPLETED';
                  const isPending = b.paymentStatus === 'PENDING' || !b.paymentStatus;
                  const isFailed = b.paymentStatus === 'FAILED';
                  const isCancelled = b.paymentStatus === 'CANCELLED_REFUNDED';

                  return (
                    <motion.div
                      key={b.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-6 rounded-3xl glass-premium border transition-all duration-300 relative overflow-hidden flex flex-col justify-between space-y-5",
                        isSuccess && "border-green-500/30 hover:border-green-500/60 bg-green-500/[0.02]",
                        isPending && "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/[0.02]",
                        isFailed && "border-destructive/30 hover:border-destructive/60 bg-destructive/[0.02]",
                        isCancelled && "border-border/40 hover:border-border/60"
                      )}
                    >
                      {/* Top Bar: Reference ID & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {b.bookingId || `#${b.id.slice(0, 8).toUpperCase()}`}
                          </span>
                          <button
                            onClick={() => copyToClipboard(b.bookingId || b.id)}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card/60 transition-colors"
                            title="Copy Booking ID"
                          >
                            {copiedId === (b.bookingId || b.id) ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                            isSuccess && "bg-green-500/20 text-green-400 border border-green-500/40",
                            isPending && "bg-amber-500/20 text-amber-400 border border-amber-500/40",
                            isFailed && "bg-destructive/20 text-destructive border border-destructive/40",
                            isCancelled && "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isFailed && <AlertTriangle className="w-3 h-3" />}
                          {isCancelled && <XCircle className="w-3 h-3" />}
                          <span>{isSuccess ? 'Confirmed' : isPending ? 'Pending Payment' : isFailed ? 'Failed' : 'Refunded'}</span>
                        </div>
                      </div>

                      {/* Main Details */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Calendar className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{b.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Clock className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{b.time}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/20">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>{b.participantsCount || 1} {b.participantsCount === 1 ? 'Jumper' : 'Jumpers'}</span>
                            <span>•</span>
                            <span>{b.duration || 60} Mins</span>
                          </div>
                          <span className="font-extrabold text-foreground text-sm">
                            ₹{b.amount?.toLocaleString('en-IN') || 0}
                          </span>
                        </div>

                        {/* If Failed: Show Reason */}
                        {isFailed && b.failureReason && (
                          <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-bold">Payment could not be completed</p>
                              <p className="text-[11px] opacity-90">{b.failureReason}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer / Actions */}
                      <div className="pt-2 border-t border-border/20 flex items-center justify-between gap-3">
                        {isSuccess ? (
                          <>
                            <button
                              onClick={() => setSelectedTicket(b)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View / Print Pass</span>
                            </button>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                              Entry Ready
                            </span>
                          </>
                        ) : isPending ? (
                          <>
                            <span className="text-xs text-muted-foreground">Checkout was not finished</span>
                            <Link to="/booking">
                              <PremiumButton variant="secondary" className="h-8 px-3 text-xs">
                                Complete Booking <ArrowRight className="w-3 h-3 ml-1" />
                              </PremiumButton>
                            </Link>
                          </>
                        ) : isFailed ? (
                          <>
                            <span className="text-xs text-muted-foreground">Need help with payment?</span>
                            <Link to="/booking">
                              <PremiumButton variant="secondary" className="h-8 px-3 text-xs">
                                Try Again <ArrowRight className="w-3 h-3 ml-1" />
                              </PremiumButton>
                            </Link>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Order was refunded</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Ticket Pass Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl glass-premium border border-primary/40 bg-card p-6 md:p-8 space-y-6 shadow-2xl relative text-foreground"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-card/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Pass Header */}
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mx-auto mb-2 font-black text-xl">
                  H
                </div>
                <h3 className="text-xl font-black tracking-tight">HAVFUN ENTRY PASS</h3>
                <p className="text-xs text-muted-foreground">HavFun Trampoline Park • Madurai</p>
              </div>

              {/* Ticket Details Box */}
              <div className="p-4 rounded-2xl bg-background/60 border border-border/40 space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-muted-foreground">Booking Ref</span>
                  <span className="font-bold text-primary">{selectedTicket.bookingId || selectedTicket.id}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-muted-foreground">Guest Name</span>
                  <span className="font-bold text-foreground">{selectedTicket.userName || user?.displayName || 'Guest'}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-muted-foreground">Date & Slot</span>
                  <span className="font-bold text-foreground">{selectedTicket.date} @ {selectedTicket.time}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-muted-foreground">Jumpers & Duration</span>
                  <span className="font-bold text-foreground">{selectedTicket.participantsCount || 1} Jumpers • {selectedTicket.duration || 60}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-bold text-green-400">₹{selectedTicket.amount?.toLocaleString('en-IN') || 0} (PAID)</span>
                </div>
              </div>

              {/* Mock Barcode / QR display */}
              <div className="p-4 rounded-2xl bg-white text-black text-center space-y-2">
                <div className="flex items-center justify-center gap-1 font-mono text-[9px] tracking-[0.2em] uppercase">
                  {selectedTicket.bookingId || selectedTicket.id}
                </div>
                <div className="h-10 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_5px)] w-4/5 mx-auto rounded-sm" />
                <p className="text-[10px] text-zinc-600 font-sans">Present this barcode at the reception counter</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <PremiumButton 
                  onClick={() => window.print()}
                  className="w-full h-11 text-xs font-bold"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
                </PremiumButton>
                <PremiumButton 
                  variant="secondary"
                  onClick={() => setSelectedTicket(null)}
                  className="w-full h-11 text-xs font-bold"
                >
                  Close
                </PremiumButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
