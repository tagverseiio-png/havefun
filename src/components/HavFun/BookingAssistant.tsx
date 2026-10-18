import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { format, addDays, isSameDay, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import PremiumButton from '@/components/ui/PremiumButton';
import { submitBooking } from '@/lib/submissions';
import { usePricing } from '@/hooks/useContent';

interface BookingSlot {
  time: string;
  capacity: number;
  booked: number;
}

const GENERATED_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", 
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

// Helper to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const BookingAssistant = () => {
  const { data: pricingData } = usePricing();
  const durations = [
    { label: '30 Minutes', value: 30, price: pricingData?.basic[30] || 500 },
    { label: '1 Hour', value: 60, price: pricingData?.basic[60] || 800 },
  ];

  // State for booking steps
  const [duration, setDuration] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // State for user details
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    participantsCount: 1,
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Mock slot data generation based on date
  useEffect(() => {
    if (date) {
      const newSlots = GENERATED_SLOTS.map(time => ({
        time,
        capacity: 30,
        booked: Math.floor(Math.random() * 35) > 25 ? 30 : Math.floor(Math.random() * 25)
      }));
      setSlots(newSlots);
      setSelectedTime(null);
    }
  }, [date]);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const calculateAmount = () => {
    const selectedDuration = durations.find(d => d.value === duration);
    if (!selectedDuration) return 0;
    return selectedDuration.price * userDetails.participantsCount;
  };

  const handleBooking = async () => {
    if (!(duration && date && selectedTime && userDetails.name && userDetails.email && userDetails.phone)) return;
    
    setIsSaving(true);
    const amount = calculateAmount();
    const generatedBookingId = 'HF-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createOrder', payload: { amount } })
      });
      
      let order;
      try {
        order = await orderRes.json();
      } catch (e) {
        throw new Error(`Server returned status ${orderRes.status}. Please check Vercel logs.`);
      }

      if (!orderRes.ok || order.error) {
        throw new Error(order.error || `Failed to create order (${orderRes.status})`);
      }

      if (!order.id) {
        throw new Error('Invalid order response from server');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TpNGPYfWSxfON0', // Key ID
        amount: order.amount,
        currency: order.currency,
        name: 'HavFun Trampoline Park',
        description: `Ticket Booking - ${userDetails.participantsCount} Participants`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            toast.loading('Verifying payment...', { id: 'payment-verify' });
            // 3. Verify payment
            const verifyRes = await fetch('/api/razorpay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'verifyPayment', payload: response })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              // 4. Save to Firestore
              await submitBooking({
                duration: duration as 30 | 60,
                date: format(date, 'yyyy-MM-dd'),
                time: selectedTime,
                bookingId: generatedBookingId,
                userName: userDetails.name,
                userEmail: userDetails.email,
                userPhone: userDetails.phone,
                participantsCount: userDetails.participantsCount,
                amount: amount,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                paymentStatus: 'SUCCESS'
              });
              
              setBookingId(generatedBookingId);
              setBookingConfirmed(true);
              toast.success('Payment verified and booking confirmed!', { id: 'payment-verify' });
            } else {
              toast.error('Payment verification failed.', { id: 'payment-verify' });
            }
          } catch (error) {
             toast.error('Error confirming booking.', { id: 'payment-verify' });
          } finally {
             setIsSaving(false);
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone
        },
        theme: {
          color: '#E11D48' // primary color
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
         console.error('Payment failed:', response.error);
         toast.error(`Payment failed: ${response.error?.description || 'Transaction cancelled.'}`);
         setIsSaving(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Could not initiate payment. Please try again.');
      setIsSaving(false);
    }
  };

  const getNextAvailableSlot = () => {
    return slots.find(s => s.booked < s.capacity);
  };

  const renderUserDetails = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
        <Users className="w-4 h-4" /> Guest Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          placeholder="Full Name" 
          required
          className="w-full bg-card/40 border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
          value={userDetails.name}
          onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          required
          className="w-full bg-card/40 border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
          value={userDetails.email}
          onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
        />
        <input 
          type="tel" 
          placeholder="Phone Number" 
          required
          className="w-full bg-card/40 border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
          value={userDetails.phone}
          onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
        />
        <div className="flex items-center gap-4 bg-card/40 border border-border/40 rounded-xl px-4 py-2">
          <span className="text-sm font-bold text-muted-foreground flex-1">Participants:</span>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-full hover:bg-primary/30"
            onClick={() => setUserDetails(prev => ({ ...prev, participantsCount: Math.max(1, prev.participantsCount - 1) }))}
          >
            -
          </button>
          <span className="font-bold w-4 text-center">{userDetails.participantsCount}</span>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-full hover:bg-primary/30"
            onClick={() => setUserDetails(prev => ({ ...prev, participantsCount: prev.participantsCount + 1 }))}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  const renderDurationSelection = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
        <Clock className="w-4 h-4" /> Select Duration
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {durations.map((d) => (
          <motion.button
            key={d.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDuration(d.value)}
            className={cn(
              "p-6 rounded-3xl border-2 transition-all text-center group",
              duration === d.value 
                ? "border-primary bg-primary/10 text-primary shadow-neon" 
                : "border-border/40 hover:border-primary/30 bg-card/40"
            )}
          >
            <span className={cn(
              "text-xl font-bold block mb-1",
              duration === d.value ? "text-primary" : "text-foreground"
            )}>{d.label}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-primary/70 transition-colors">
              ₹{d.price} / person
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderDateSelection = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
        <CalendarIcon className="w-4 h-4" /> Select Date
      </h3>
      <Popover>
        <PopoverTrigger asChild>
          <motion.button 
            whileHover={{ scale: 1.01 }}
            className={cn(
              "w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group",
              date ? "border-primary bg-primary/10" : "border-border/40 bg-card/40"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-2xl transition-colors",
                date ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold block">
                  {date ? format(date, "PPP") : "Choose a Date"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Available Tomorrow & Beyond
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
          </motion.button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-[2rem] border-primary/20 bg-card/90 backdrop-blur-xl" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => isBefore(d, startOfDay(new Date()))}
            initialFocus
            className="p-4"
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderTimeSelection = () => {
    if (!date) return null;

    const nextAvailable = getNextAvailableSlot();
    const allFull = slots.length > 0 && slots.every(s => s.booked >= s.capacity);
    
    if (allFull) {
      return (
        <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 space-y-4">
          <div className="flex items-center gap-3 text-secondary">
            <AlertCircle className="w-6 h-6" />
            <h4 className="font-bold">Date Fully Booked</h4>
          </div>
          <p className="text-sm text-foreground/70">
            Apologies, but this date is currently at peak capacity. Would you like to try <strong>{format(addDays(date, 1), "PPP")}</strong> instead?
          </p>
          <PremiumButton 
            variant="secondary" 
            className="w-full"
            onClick={() => setDate(addDays(date, 1))}
          >
            Check Next Day <ChevronRight className="w-4 h-4 ml-2" />
          </PremiumButton>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
          <Clock className="w-4 h-4" /> Select Time
        </h3>
        
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {slots.map((slot) => {
            const isFull = slot.booked >= slot.capacity;
            const isSelected = selectedTime === slot.time;
            
            return (
              <motion.button
                key={slot.time}
                disabled={isFull}
                whileHover={!isFull ? { scale: 1.05 } : {}}
                whileTap={!isFull ? { scale: 0.95 } : {}}
                onClick={() => setSelectedTime(slot.time)}
                className={cn(
                  "p-3 rounded-2xl border transition-all text-center relative overflow-hidden",
                  isSelected 
                    ? "border-primary bg-primary text-primary-foreground shadow-neon" 
                    : isFull 
                      ? "border-muted-foreground/10 bg-muted/20 opacity-50 cursor-not-allowed" 
                      : "border-border/40 hover:border-primary/40 bg-card/40"
                )}
              >
                <span className="text-sm font-bold block">{slot.time}</span>
                <span className={cn(
                  "text-[8px] uppercase tracking-tighter opacity-70",
                  isSelected ? "text-primary-foreground" : isFull ? "text-destructive" : "text-muted-foreground"
                )}>
                  {isFull ? "Full" : `${slot.capacity - slot.booked} spots`}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  const isFormComplete = duration && date && selectedTime && userDetails.name && userDetails.email && userDetails.phone;
  const totalAmount = calculateAmount();

  if (bookingConfirmed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium p-10 rounded-[2.5rem] border border-primary/30 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto shadow-neon">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground">Your adventure at HavFun starts soon.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-card/40 p-4 rounded-2xl border border-border/40">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Name</span>
            <span className="font-bold">{userDetails.name}</span>
          </div>
          <div className="bg-card/40 p-4 rounded-2xl border border-border/40">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Participants</span>
            <span className="font-bold">{userDetails.participantsCount} Explorer(s)</span>
          </div>
          <div className="bg-card/40 p-4 rounded-2xl border border-border/40">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Date & Time</span>
            <span className="font-bold">{date && format(date, "MMM dd")} at {selectedTime}</span>
          </div>
          <div className="bg-card/40 p-4 rounded-2xl border border-border/40">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Booking ID</span>
            <span className="font-bold text-primary">{bookingId}</span>
          </div>
        </div>

        <PremiumButton 
          className="w-full"
          onClick={() => {
            setBookingConfirmed(false);
            setDuration(null);
            setDate(undefined);
            setSelectedTime(null);
          }}
        >
          Book Another Session
        </PremiumButton>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Sparkles className="w-3 h-3" /> Smart Assistant
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Reserve Your <span className="text-primary italic">Flight</span></h2>
        <p className="text-muted-foreground text-sm">Quick, clear, and secure booking experience.</p>
      </div>

      <div className="glass-premium p-8 md:p-10 rounded-[2.5rem] border border-border/40 space-y-10">
        
        {renderUserDetails()}
        
        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        {renderDurationSelection()}
        
        <AnimatePresence>
          {duration && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-10"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
              {renderDateSelection()}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {date && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-10"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
              {renderTimeSelection()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4">
            <PremiumButton
                className="w-full h-16 text-lg group"
                disabled={!isFormComplete || isSaving}
                onClick={handleBooking}
            >
                {isSaving ? 'Processing…' : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" /> 
                    Pay ₹{totalAmount} & Book 
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
            </PremiumButton>
            <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em]">
                Secure Payment via Razorpay
            </p>
        </div>
      </div>
    </div>
  );
};

export default BookingAssistant;
