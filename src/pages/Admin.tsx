import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, LogOut, ShieldAlert, ShieldCheck, Calendar as CalendarIcon, ChevronLeft, ChevronRight, XCircle, Edit, Trash2, CheckCircle } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-premium w-full max-w-sm p-8 rounded-3xl border border-border/40 space-y-6"
      >
        <div className="text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">HavFun Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to view submissions</p>
        </div>
        <div className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {(localError || error) && (
          <p className="text-sm text-destructive text-center">{localError || error}</p>
        )}
        <PremiumButton type="submit" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
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
          <span className="text-foreground">{email}</span> is not an admin account.
        </p>
        <PremiumButton variant="secondary" onClick={() => signOut(auth)}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </PremiumButton>
      </div>
    </div>
  );
}

function Section<T extends { date?: string; paymentStatus?: string; paymentId?: string; id: string }>({
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
  const itemsPerPage = 20;

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (isBookings && filterDate) {
      result = result.filter((item) => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return isSameDay(itemDate, filterDate);
      });
    }
    return result;
  }, [data, filterDate, isBookings]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [filterDate]);

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
    <div className="space-y-4">
      {isBookings && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <PremiumButton variant="secondary" className="gap-2 h-9 px-3">
                  <CalendarIcon className="w-4 h-4" /> 
                  {filterDate ? format(filterDate, 'PPP') : 'Filter by Date'}
                </PremiumButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDate}
                  onSelect={setFilterDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {filterDate && (
               <button onClick={() => setFilterDate(undefined)} className="text-xs text-muted-foreground hover:text-foreground underline">
                 Clear filter
               </button>
            )}
          </div>
          <span className="text-sm text-muted-foreground">Total: {filteredData.length}</span>
        </div>
      )}

      {!filteredData || filteredData.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">{empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/40">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.header}>{c.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.header}>{c.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
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
                { header: 'Booking ID', cell: (r: any) => <span className="font-mono text-primary">{r.bookingId}</span> },
                { header: 'Name', cell: (r: any) => r.userName || '—' },
                { header: 'Date/Time', cell: (r: any) => `${r.date} ${r.time}` },
                { header: 'Guests', cell: (r: any) => r.participantsCount || 1 },
                { header: 'Amount', cell: (r: any) => r.amount ? `₹${r.amount}` : '—' },
                { header: 'Status', cell: (r: any) => (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                    r.paymentStatus === 'SUCCESS' ? "bg-green-500/20 text-green-500 border border-green-500/30" : 
                    r.paymentStatus === 'FAILED' ? "bg-destructive/20 text-destructive border border-destructive/30" :
                    r.paymentStatus === 'CANCELLED_REFUNDED' ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : 
                    r.paymentStatus === 'COMPLETED' ? "bg-primary/20 text-primary border border-primary/30" :
                    "bg-muted text-muted-foreground border border-border"
                  )}>
                    {r.paymentStatus === 'CANCELLED_REFUNDED' ? 'REFUNDED' : r.paymentStatus || 'PENDING'}
                  </span>
                )},
                { header: 'Submitted', cell: (r: any) => fmtDate(r.createdAt) },
                { header: 'Actions', cell: (r: any) => (
                  r.paymentStatus === 'SUCCESS' ? (
                     <PremiumButton 
                        variant="secondary" 
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 border border-destructive/30 bg-destructive/5"
                        onClick={() => handleRefund(r)}
                        disabled={refundingId === r.id}
                     >
                        {refundingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><XCircle className="w-3 h-3 mr-1" /> Refund</>}
                     </PremiumButton>
                  ) : <span className="text-muted-foreground text-xs">—</span>
                )},
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
