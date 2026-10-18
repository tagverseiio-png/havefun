import { useEffect, useState, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  type User 
} from 'firebase/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, 
  LogOut, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  XCircle, 
  Trash2, 
  CheckCircle,
  Copy,
  Check,
  Search,
  MessageCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { isAdminEmail } from '@/lib/admin';
import {
  listBookings,
  listContactMessages,
  listWaivers,
  cancelBooking,
  updateBooking,
  deleteBooking,
  type WithMeta,
  type BookingInput,
} from '@/lib/submissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PremiumButton from '@/components/ui/PremiumButton';
import ContentManager from '@/components/admin/ContentManager';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';

const fmtDate = (ts: WithMeta['createdAt']): string => {
  if (!ts) return '—';
  const anyTs = ts as unknown as { toDate?: () => Date; seconds?: number };
  const ms =
    typeof anyTs.toDate === 'function'
      ? anyTs.toDate().getTime()
      : (anyTs.seconds ?? 0) * 1000;
  return new Date(ms).toLocaleString();
};

function LoginForm({ error }: { error: string | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setLocalError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setLocalError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setLocalError(err.message || 'Google sign-in failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-premium w-full max-w-sm p-8 rounded-3xl border border-border/40 space-y-6 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">HavFun Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to view submissions</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-card hover:bg-card/80 border border-border/80 hover:border-primary/50 text-foreground font-semibold text-sm transition-all shadow-md group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
          <span>Sign In with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-border/40 flex-1" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">OR EMAIL</span>
          <div className="h-px bg-border/40 flex-1" />
        </div>

        <div className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {(localError || error) && (
          <p className="text-sm text-destructive text-center">{localError || error}</p>
        )}
        <PremiumButton type="submit" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In with Password'}
        </PremiumButton>
      </form>
    </div>
  );
}

function NotAuthorized({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 text-center">
      <div className="space-y-4 max-w-sm">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Not authorized</h1>
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-mono">{email}</span> is not on the admin allowlist.
        </p>
        <PremiumButton variant="secondary" onClick={() => signOut(auth)}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </PremiumButton>
      </div>
    </div>
  );
}

function Section<T extends { 
  date?: string; 
  time?: string;
  paymentStatus?: string; 
  paymentId?: string; 
  id: string;
  bookingId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  phone?: string;
  amount?: number;
  failureReason?: string;
}>({
  queryKey,
  queryFn,
  columns,
  empty,
  isBookings = false,
}: {
  queryKey: string;
  queryFn: () => Promise<T[]>;
  columns: { header: string; cell: (row: T) => React.ReactNode }[];
  empty: string;
  isBookings?: boolean;
}) {
  const { data, isLoading, error } = useQuery({ queryKey: [queryKey], queryFn });
  const [page, setPage] = useState(1);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED_REFUNDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 20;

  // Real-time booking metrics
  const stats = useMemo(() => {
    if (!isBookings || !data) return null;
    const all = data.length;
    const confirmed = data.filter(d => d.paymentStatus === 'SUCCESS' || d.paymentStatus === 'COMPLETED');
    const pending = data.filter(d => d.paymentStatus === 'PENDING' || !d.paymentStatus);
    const failed = data.filter(d => d.paymentStatus === 'FAILED');
    const refunded = data.filter(d => d.paymentStatus === 'CANCELLED_REFUNDED');
    const revenue = confirmed.reduce((acc, cur) => acc + (cur.amount || 0), 0);
    return {
      all,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      refundedCount: refunded.length,
      revenue,
    };
  }, [data, isBookings]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = data;

    // Filter by status for bookings
    if (isBookings && statusFilter !== 'ALL') {
      if (statusFilter === 'SUCCESS') {
        result = result.filter(item => item.paymentStatus === 'SUCCESS' || item.paymentStatus === 'COMPLETED');
      } else if (statusFilter === 'PENDING') {
        result = result.filter(item => item.paymentStatus === 'PENDING' || !item.paymentStatus);
      } else {
        result = result.filter(item => item.paymentStatus === statusFilter);
      }
    }

    // Filter by date
    if (isBookings && filterDate) {
      result = result.filter((item) => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return isSameDay(itemDate, filterDate);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const idMatch = item.id?.toLowerCase().includes(q) || item.bookingId?.toLowerCase().includes(q);
        const nameMatch = item.userName?.toLowerCase().includes(q);
        const emailMatch = item.userEmail?.toLowerCase().includes(q);
        const phoneMatch = (item.userPhone || item.phone)?.toLowerCase().includes(q);
        return idMatch || nameMatch || emailMatch || phoneMatch;
      });
    }

    return result;
  }, [data, filterDate, isBookings, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [filterDate, statusFilter, searchQuery]);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </div>
    );
  if (error) {
    console.error("Section query error:", error);
    return <p className="text-destructive py-10 text-center text-sm">Failed to load. {(error as Error).message || JSON.stringify(error)}</p>;
  }

  return (
    <div className="space-y-5">
      {/* Bookings Metrics Cards */}
      {isBookings && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-premium border border-border/40 backdrop-blur-md">
            <span className="text-xs text-muted-foreground font-medium">Total Attempts</span>
            <p className="text-2xl font-black text-foreground mt-1">{stats.all}</p>
          </div>
          <div className="p-4 rounded-2xl glass-premium border border-green-500/30 bg-green-500/5 backdrop-blur-md">
            <span className="text-xs text-green-400 font-medium">Confirmed (₹{stats.revenue.toLocaleString('en-IN')})</span>
            <p className="text-2xl font-black text-green-400 mt-1">{stats.confirmedCount}</p>
          </div>
          <div className="p-4 rounded-2xl glass-premium border border-amber-500/30 bg-amber-500/5 backdrop-blur-md">
            <span className="text-xs text-amber-400 font-medium">Incomplete / Abandoned</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{stats.pendingCount}</p>
          </div>
          <div className="p-4 rounded-2xl glass-premium border border-destructive/30 bg-destructive/5 backdrop-blur-md">
            <span className="text-xs text-destructive font-medium">Failed Transactions</span>
            <p className="text-2xl font-black text-destructive mt-1">{stats.failedCount}</p>
          </div>
        </div>
      )}

      {/* Bookings Filter Bar */}
      {isBookings && stats && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card/60 border border-border/40 overflow-x-auto max-w-full">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === 'ALL'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({stats.all})
            </button>
            <button
              onClick={() => setStatusFilter('SUCCESS')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === 'SUCCESS'
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Confirmed ({stats.confirmedCount})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === 'PENDING'
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pending / Dropped ({stats.pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('FAILED')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === 'FAILED'
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Failed ({stats.failedCount})
            </button>
            {stats.refundedCount > 0 && (
              <button
                onClick={() => setStatusFilter('CANCELLED_REFUNDED')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  statusFilter === 'CANCELLED_REFUNDED'
                    ? "bg-muted-foreground text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Refunded ({stats.refundedCount})
              </button>
            )}
          </div>

          {/* Date Filter & Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, phone, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border/40 rounded-xl pl-9 pr-3 py-2 sm:py-1.5 text-xs outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <PremiumButton variant="secondary" className="gap-2 h-9 px-3 shrink-0 text-xs flex-1 sm:flex-initial">
                    <CalendarIcon className="w-3.5 h-3.5" /> 
                    {filterDate ? format(filterDate, 'PPP') : 'Filter Date'}
                  </PremiumButton>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(filterDate || searchQuery) && (
                <button 
                  onClick={() => { setFilterDate(undefined); setSearchQuery(''); }} 
                  className="text-xs text-muted-foreground hover:text-foreground underline shrink-0 px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      {!filteredData || filteredData.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/40 text-sm text-muted-foreground">
          {empty}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/40">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.header} className="text-xs">{c.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, i) => (
                <TableRow key={row.id || i}>
                  {columns.map((c) => (
                    <TableCell key={c.header}>{c.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({filteredData.length} total)
          </span>
          <div className="flex items-center gap-2">
            <PremiumButton 
              variant="secondary" 
              className="h-8 px-3"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </PremiumButton>
            <PremiumButton 
              variant="secondary" 
              className="h-8 px-3"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </PremiumButton>
          </div>
        </div>
      )}
    </div>
  );
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'submissions' | 'content'>('submissions');
  const qc = useQueryClient();
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (booking: any) => {
    if (!window.confirm(`Are you sure you want to permanently delete booking ${booking.bookingId}?`)) return;
    setDeletingId(booking.id);
    try {
      await deleteBooking(booking.id);
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(`Booking ${booking.bookingId} deleted.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete booking");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (booking: any, newStatus: string) => {
    try {
      await updateBooking(booking.id, { paymentStatus: newStatus as any });
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(`Booking ${booking.bookingId} status updated to ${newStatus}.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };


  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);
  }), []);

  const handleRefund = async (booking: any) => {
    if (!booking.paymentId) {
      toast.error("No Payment ID found. Cannot refund.");
      return;
    }
    const confirmRefund = window.confirm(`Are you sure you want to cancel and refund booking ${booking.bookingId}?`);
    if (!confirmRefund) return;

    setRefundingId(booking.id);
    try {
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refundPayment',
          payload: { payment_id: booking.paymentId }
        })
      });

      if (!res.ok) {
        throw new Error('Refund API failed');
      }

      await cancelBooking(booking.id);
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(`Booking ${booking.bookingId} cancelled and refunded successfully.`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to refund payment");
    } finally {
      setRefundingId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  if (!user) return <LoginForm error={null} />;
  if (!isAdminEmail(user.email)) return <NotAuthorized email={user.email ?? ''} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 px-6 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <div>
            <h1 className="font-bold leading-tight">HavFun Admin</h1>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <PremiumButton variant="secondary" onClick={() => signOut(auth)}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </PremiumButton>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="inline-flex p-1 rounded-2xl border border-border/40 bg-card/30">
          {(['submissions', 'content'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                view === v ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v === 'content' ? 'Site Content' : 'Submissions'}
            </button>
          ))}
        </div>

        {view === 'content' ? (
          <ContentManager />
        ) : (
          <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="waivers">Waivers</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Section
              queryKey="admin-bookings"
              queryFn={listBookings}
              empty="No bookings yet."
              isBookings={true}
              columns={[
                { 
                  header: 'Booking ID', 
                  cell: (r: any) => (
                    <span className="font-mono text-xs font-bold text-primary">
                      {r.bookingId || `#${r.id.slice(0, 8).toUpperCase()}`}
                    </span>
                  )
                },
                { 
                  header: 'Customer', 
                  cell: (r: any) => (
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold text-foreground">{r.userName || 'Guest'}</p>
                      {r.userEmail && <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">{r.userEmail}</p>}
                      {(r.userPhone || r.phone) && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[11px] font-mono text-muted-foreground">{r.userPhone || r.phone}</span>
                          <a
                            href={`https://wa.me/91${(r.userPhone || r.phone).replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-400 p-0.5"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  )
                },
                { 
                  header: 'Session', 
                  cell: (r: any) => (
                    <div className="text-xs">
                      <p className="font-medium text-foreground">{r.date} @ {r.time}</p>
                      <p className="text-[11px] text-muted-foreground">{r.duration || 60} mins • {r.participantsCount || 1} Jumpers</p>
                    </div>
                  )
                },
                { 
                  header: 'Amount', 
                  cell: (r: any) => (
                    <span className="font-mono font-bold text-xs text-foreground">
                      ₹{r.amount?.toLocaleString('en-IN') || 0}
                    </span>
                  )
                },
                { 
                  header: 'Status', 
                  cell: (r: any) => {
                    const isSuccess = r.paymentStatus === 'SUCCESS' || r.paymentStatus === 'COMPLETED';
                    const isPending = r.paymentStatus === 'PENDING' || !r.paymentStatus;
                    const isFailed = r.paymentStatus === 'FAILED';
                    const isRefunded = r.paymentStatus === 'CANCELLED_REFUNDED';
                    return (
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1.5",
                        isSuccess ? "bg-green-500/20 text-green-400 border border-green-500/30" : 
                        isFailed ? "bg-destructive/20 text-destructive border border-destructive/30" :
                        isRefunded ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : 
                        "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      )}>
                        {isSuccess && <CheckCircle className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        {isFailed && <AlertTriangle className="w-3 h-3" />}
                        {isRefunded && <XCircle className="w-3 h-3" />}
                        {isSuccess ? 'CONFIRMED' : isFailed ? 'FAILED' : isRefunded ? 'REFUNDED' : 'PENDING'}
                      </span>
                    );
                  }
                },
                {
                  header: 'Failure Reason / Notes',
                  cell: (r: any) => (
                    r.failureReason ? (
                      <div className="max-w-[200px] p-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-[11px] text-destructive leading-tight">
                        <span className="font-semibold block truncate" title={r.failureReason}>
                          {r.failureReason}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )
                  )
                },
                { header: 'Submitted', cell: (r: any) => <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span> },
                { 
                  header: 'Actions', 
                  cell: (r: any) => (
                    <div className="flex items-center gap-2">
                      {r.paymentStatus === 'SUCCESS' && (
                        <PremiumButton 
                          variant="secondary" 
                          className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 border border-destructive/30 bg-destructive/5"
                          onClick={() => handleRefund(r)}
                          disabled={refundingId === r.id}
                        >
                          {refundingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><XCircle className="w-3 h-3 mr-1" /> Refund</>}
                        </PremiumButton>
                      )}
                      
                      {(r.paymentStatus === 'FAILED' || r.paymentStatus === 'PENDING' || !r.paymentStatus) && (
                        <PremiumButton
                          variant="secondary"
                          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive border border-border/40 hover:border-destructive/30"
                          onClick={() => handleDelete(r)}
                          disabled={deletingId === r.id}
                          title="Delete Attempt"
                        >
                          {deletingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </PremiumButton>
                      )}
                    </div>
                  )
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="waivers">
            <Section
              queryKey="admin-waivers"
              queryFn={listWaivers}
              empty="No waivers yet."
              columns={[
                { header: 'Name', cell: (r: any) => r.name },
                { header: 'Email', cell: (r: any) => r.email },
                { header: 'Phone', cell: (r: any) => r.phone },
                { header: 'Participants', cell: (r: any) => r.participants?.map((p: any) => p.name).join(', ') },
                { header: 'Visit', cell: (r: any) => `${r.visitDate?.slice(0, 10)} ${r.visitTime}` },
                { header: 'Total', cell: (r: any) => `₹${r.pricing?.total?.toFixed(0) ?? '—'}` },
                {
                  header: 'Signature',
                  cell: (r: any) =>
                    r.signature ? (
                      <img src={r.signature} alt="signature" className="h-10 bg-white/5 rounded" />
                    ) : (
                      '—'
                    ),
                },
                { header: 'Submitted', cell: (r: any) => fmtDate(r.createdAt) },
              ]}
            />
          </TabsContent>

          <TabsContent value="contacts">
            <Section
              queryKey="admin-contacts"
              queryFn={listContactMessages}
              empty="No messages yet."
              columns={[
                { header: 'Name', cell: (r: any) => r.name },
                { header: 'Email', cell: (r: any) => r.email },
                { header: 'Phone', cell: (r: any) => r.phone || '—' },
                { header: 'Message', cell: (r: any) => <span className="max-w-xs block whitespace-pre-wrap">{r.message}</span> },
                { header: 'Submitted', cell: (r: any) => fmtDate(r.createdAt) },
              ]}
            />
          </TabsContent>
          </Tabs>
        )}
        {editingBooking && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-premium p-6 rounded-3xl max-w-md w-full border border-border/40 space-y-4">
              <h2 className="text-xl font-bold">Edit Booking {editingBooking.bookingId}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-card/40 border border-border/40 rounded-xl px-4 py-2 outline-none"
                    value={editingBooking.date}
                    onChange={e => setEditingBooking({...editingBooking, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-card/40 border border-border/40 rounded-xl px-4 py-2 outline-none"
                    value={editingBooking.time}
                    onChange={e => setEditingBooking({...editingBooking, time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Status</label>
                  <select
                    className="w-full bg-card/40 border border-border/40 rounded-xl px-4 py-2 outline-none"
                    value={editingBooking.paymentStatus}
                    onChange={e => setEditingBooking({...editingBooking, paymentStatus: e.target.value})}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED_REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <PremiumButton variant="ghost" onClick={() => setEditingBooking(null)}>Cancel</PremiumButton>
                <PremiumButton onClick={async () => {
                  try {
                    await updateBooking(editingBooking.id, {
                      date: editingBooking.date,
                      time: editingBooking.time,
                      paymentStatus: editingBooking.paymentStatus
                    });
                    qc.invalidateQueries({ queryKey: ['admin-bookings'] });
                    toast.success('Booking updated!');
                    setEditingBooking(null);
                  } catch (e: any) {
                    toast.error(e.message || 'Failed to update');
                  }
                }}>Save Changes</PremiumButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
