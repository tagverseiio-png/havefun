import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    Users,
    PenTool,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    Crown,
    ScrollText,
    Sparkles,
    Loader2
} from 'lucide-react';

import { toast } from 'sonner';
import ProgressBar from '@/components/ui/ProgressBar';
import PremiumButton from '@/components/ui/PremiumButton';
import SignaturePad from '@/components/ui/SignaturePad';
import ImageGallery from '@/components/ui/ImageGallery';
import FloatingImages from '@/components/ui/FloatingImages';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { PRICING_CONFIG as STATIC_PRICING, calculateBasePrice } from '@/lib/pricing-config';
import { usePricing, useSite, useWaiverImages } from '@/hooks/useContent';
import { submitWaiver } from '@/lib/submissions';

const SECTIONS = [
    {
        id: 'welcome',
        title: 'Embrace the Leap',
        subtitle: 'A Covenant of Joy',
        icon: <ShieldCheck />,
        content: "This elegant agreement affirms your discerning choice to engage in HavFun's curated experiences. We invite you into a realm of movement and vitality.",
    },
    {
        id: 'risks',
        title: 'Vigilant Harmony',
        subtitle: 'Risk Acknowledgment',
        icon: <AlertCircle />,
        content: "With poise, I recognize the symphony of risks in these pursuits—falls, collisions, and the inherent nature of gravity.",
    },
    {
        id: 'eligibility',
        title: 'Lineage of Authority',
        subtitle: 'Sovereign Certification',
        icon: <Crown />,
        content: "I avow my station: of age or kin, wielding the quill with rightful sovereignty for myself or those within my sacred care.",
    },
    {
        id: 'medical',
        title: "Guardian's Grace",
        subtitle: 'Legacy of Care',
        icon: <Users />,
        content: "Should fortune waver, I entrust HavFun's stewards to summon healing arts. I bear the ledger of such benevolence myself.",
    },
    {
        id: 'signature',
        title: 'Eternal Seal',
        subtitle: 'Ratification',
        icon: <PenTool />,
        content: "Having perused this tome with clarity, my mark seals an enduring alliance—from this dawn to all tomorrows.",
    }
];

interface Participant {
    name: string;
    dob: string;
    id: number;
}

interface FormData {
    acknowledged: boolean;
    liabilityAccepted: boolean;
    medicalConsent: boolean;
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
    signed: boolean;
    signature: string | null;
    participants: Participant[];
    duration: 30 | 60;
    needsSocks: boolean;
    visitDate: Date;
    visitTime: string;
}



const Waiver = () => {
    const [step, setStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userType, setUserType] = useState<'sovereign' | 'guardian'>('sovereign');
    const { data: pricing } = usePricing();
    const { data: site } = useSite();
    const { data: waiverImages = [] } = useWaiverImages();
    const PRICING_CONFIG = pricing ?? STATIC_PRICING;
    const sectionImage = (id: string) => waiverImages.find((w) => w.id === id)?.image ?? '';

    const [formData, setFormData] = useState<FormData>({
        acknowledged: false,
        liabilityAccepted: false,
        medicalConsent: false,
        name: '',
        email: '',
        phone: '',
        emergencyContact: '',
        signed: false,
        signature: null,
        participants: [{ name: '', dob: '', id: Math.random() }],
        duration: 30,
        needsSocks: true,
        visitDate: new Date(),
        visitTime: '10:00'
    });
    const calculateTotal = () => {
        const [hourStr] = formData.visitTime.split(':');
        const hour = parseInt(hourStr);
        
        const pricePerPerson = calculateBasePrice(formData.duration, formData.visitDate, hour, PRICING_CONFIG);
        const socksPrice = formData.needsSocks ? PRICING_CONFIG.gripSocks : 0;
        const subtotal = (pricePerPerson + socksPrice) * formData.participants.length;
        const gst = subtotal * PRICING_CONFIG.gst;
        const total = subtotal + gst;

        return { pricePerPerson, socksPrice, subtotal, gst, total };
    };

    const nextStep = async () => {
        if (step < SECTIONS.length - 1) {
            setStep(prev => prev + 1);
        } else {
            setIsSubmitting(true);
            try {
                const totals = calculateTotal();
                await submitWaiver({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    emergencyContact: formData.emergencyContact,
                    userType,
                    participants: formData.participants.map((p) => ({ name: p.name, dob: p.dob })),
                    duration: formData.duration,
                    needsSocks: formData.needsSocks,
                    visitDate: formData.visitDate.toISOString(),
                    visitTime: formData.visitTime,
                    acknowledged: formData.acknowledged,
                    liabilityAccepted: formData.liabilityAccepted,
                    medicalConsent: formData.medicalConsent,
                    signed: formData.signed,
                    signature: formData.signature,
                    pricing: { subtotal: totals.subtotal, gst: totals.gst, total: totals.total },
                });
                toast.success('Waiver archived successfully!');
                setIsComplete(true);
            } catch (error) {
                console.error('Submission error:', error);
                toast.error('Could not save your waiver. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(prev => prev - 1);
    };

    const addParticipant = () => {
        setFormData(prev => ({
            ...prev,
            participants: [...prev.participants, { name: '', dob: '', id: Math.random() }]
        }));
    };

    const removeParticipant = (id: number) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== id)
        }));
    };

    const isStepValid = () => {
        if (step === 0) return true;
        if (step === 1) return formData.acknowledged;
        if (step === 2) {
            const partsValid = formData.participants.every(p => p.name && p.dob);
            return formData.liabilityAccepted && partsValid;
        }
        if (step === 3) return formData.name && formData.email && formData.medicalConsent && formData.phone;
        if (step === 4) return formData.signed;
        return false;
    };

    if (isComplete) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 20, repeat: Infinity }}
                    />
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-xl space-y-10 relative z-10"
                >
                    <div className="relative">
                        <motion.div
                            className="absolute -inset-16 bg-gradient-radial from-primary/30 via-secondary/20 to-transparent rounded-full blur-3xl"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="relative"
                        >
                            <CheckCircle2 className="w-32 h-32 text-primary mx-auto" />
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                animate={{
                                    boxShadow: [
                                        '0 0 20px hsl(var(--neon-lime) / 0.3)',
                                        '0 0 60px hsl(var(--neon-lime) / 0.5)',
                                        '0 0 20px hsl(var(--neon-lime) / 0.3)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-serif text-foreground">Booking Confirmed</h1>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed">
                            Your waiver is sealed and your booking is archived, <span className="text-primary font-medium">{formData.name}</span>.
                            <br />Proceed below to complete your payment.
                        </p>
                    </div>

                    <div className="bg-card/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 space-y-4 text-left max-w-sm mx-auto">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Base Price ({formData.duration} mins × {formData.participants.length})</span>
                            <span>₹{calculateTotal().pricePerPerson * formData.participants.length}</span>
                        </div>
                        {formData.needsSocks && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Grip Socks (₹{PRICING_CONFIG.gripSocks} × {formData.participants.length})</span>
                                <span>₹{PRICING_CONFIG.gripSocks * formData.participants.length}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">GST ({Math.round(PRICING_CONFIG.gst * 100)}%)</span>
                            <span>₹{calculateTotal().gst.toFixed(2)}</span>
                        </div>
                        <div className="pt-4 border-t border-primary/30 flex justify-between items-center">
                            <span className="text-lg font-bold">Total Amount</span>
                            <span className="text-2xl font-bold text-primary">₹{calculateTotal().total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center">
                        <a href={site?.razorpayLink ?? 'https://razorpay.me/@vvpsentertainmentandadventure'} target="_blank" rel="noopener noreferrer" className="w-full max-w-xs">
                            <PremiumButton className="w-full">
                                <Sparkles className="w-5 h-5" /> Pay ₹{calculateTotal().total.toFixed(0)} Now
                            </PremiumButton>
                        </a>
                        <PremiumButton variant="secondary" onClick={() => window.print()} className="w-full max-w-xs">
                            <ScrollText className="w-5 h-5" /> Archive as PDF
                        </PremiumButton>
                        <p className="text-xs uppercase tracking-[0.4em] text-primary pt-4">Safety • Joy • Legacy</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground relative">
            <ProgressBar currentStep={step} totalSteps={SECTIONS.length} />
            <FloatingImages />

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] border border-primary/10 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] border border-secondary/10 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/80" />
            </div>

            <main className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 sm:py-20 min-h-screen flex flex-col z-10">
                {/* Header */}
                <header className="mb-8 sm:mb-12 md:mb-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 sm:gap-4"
                    >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-neon rounded-2xl flex items-center justify-center text-primary-foreground shadow-neon rotate-3 shrink-0">
                            <span className="text-xl sm:text-2xl font-serif font-bold">H</span>
                        </div>
                        <div>
                            <h2 className="text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground font-bold mb-0.5 sm:mb-1">HavFun Trampoline Park</h2>
                            <p className="text-xs sm:text-sm font-serif italic text-primary">The Eternal Waiver</p>
                        </div>
                    </motion.div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                        <div className="flex gap-1.5 sm:gap-2 mb-0 sm:mb-2">
                            {SECTIONS.map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`h-1 w-6 sm:w-8 rounded-full transition-all duration-700 ${idx <= step ? 'bg-gradient-neon' : 'bg-muted'
                                        }`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Step {step + 1} of 5</p>
                    </div>
                </header>

                {/* Form Content */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.section
                            key={step}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                                {/* Left Column - Section Info */}
                                <div className="lg:col-span-5 space-y-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex p-4 bg-card/60 backdrop-blur-xl rounded-2xl border border-primary/20 text-primary shadow-neon"
                                    >
                                        {React.cloneElement(SECTIONS[step].icon, { className: "w-8 h-8" })}
                                    </motion.div>

                                    <div>
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-3"
                                        >
                                            {SECTIONS[step].subtitle}
                                        </motion.p>
                                        <motion.h1
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground leading-[1.1]"
                                        >
                                            {SECTIONS[step].title}
                                        </motion.h1>
                                    </div>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-lg text-muted-foreground font-light leading-relaxed"
                                    >
                                        {SECTIONS[step].content}
                                    </motion.p>

                                    {/* Step Image - Mobile Only */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="lg:hidden relative rounded-2xl overflow-hidden aspect-video shadow-premium"
                                    >
                                        <img
                                            src={sectionImage(SECTIONS[step].id)}
                                            alt={SECTIONS[step].title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                                        <div className="absolute inset-0 border border-primary/20 rounded-2xl" />
                                    </motion.div>
                                </div>

                                {/* Right Column - Form Card */}
                                <div className="lg:col-span-7">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="glass-premium p-6 md:p-10 rounded-[2rem] shadow-premium space-y-8"
                                    >

                                        {/* Welcome Section */}
                                        {step === 0 && (
                                            <div className="space-y-8">
                                                <ImageGallery />
                                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                                                    <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
                                                    <p className="text-sm text-foreground/80">
                                                        Scroll through our facilities and proceed when ready to begin your covenant.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Risk Section */}
                                        {step === 1 && (
                                            <div className="space-y-8">
                                                <div className="relative rounded-2xl overflow-hidden aspect-video shadow-premium mb-6 hidden lg:block">
                                                    <img
                                                        src={sectionImage('risks')}
                                                        alt="Basketball Zone"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                                    <div className="absolute inset-0 border border-primary/20 rounded-2xl" />
                                                </div>

                                                <div className="space-y-4 p-6 bg-muted/30 rounded-2xl border border-border/40">
                                                    <p className="text-xs uppercase tracking-widest text-secondary font-bold">Nature of the Experience</p>
                                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                                        {['Inherent gravity-based activities', 'Proximity to fellow participants', 'Voluntary physical exertion'].map((item, idx) => (
                                                            <motion.li
                                                                key={idx}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.1 * idx }}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <div className="w-2 h-2 bg-gradient-neon rounded-full shadow-neon" />
                                                                {item}
                                                            </motion.li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <label className="flex items-start gap-5 cursor-pointer group p-6 rounded-2xl transition-all hover:bg-muted/20 border border-transparent hover:border-primary/20">
                                                    <div className="relative mt-1">
                                                        <input
                                                            type="checkbox"
                                                            className="peer sr-only"
                                                            checked={formData.acknowledged}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, acknowledged: e.target.checked }))}
                                                        />
                                                        <div className="w-7 h-7 border-2 border-border rounded-lg flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-all">
                                                            {formData.acknowledged && <CheckCircle2 className="w-5 h-5 text-primary-foreground" />}
                                                        </div>
                                                    </div>
                                                    <span className="text-lg font-serif italic text-foreground group-hover:text-primary transition-colors">
                                                        I Attest to This Awareness with a clear and focused mind.
                                                    </span>
                                                </label>
                                            </div>
                                        )}

                                        {/* Eligibility & Participants */}
                                        {step === 2 && (
                                            <div className="space-y-8">
                                                <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border/40">
                                                    <button
                                                        onClick={() => setUserType('sovereign')}
                                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${userType === 'sovereign'
                                                            ? 'bg-gradient-neon text-primary-foreground shadow-neon'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                    >
                                                        Sovereign (Self)
                                                    </button>
                                                    <button
                                                        onClick={() => setUserType('guardian')}
                                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${userType === 'guardian'
                                                            ? 'bg-gradient-neon text-primary-foreground shadow-neon'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                    >
                                                        Noble Guardian
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Visit Date</p>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button className="flex h-14 w-full items-center justify-between rounded-2xl border-2 border-border/40 bg-card/40 px-6 py-4 text-left font-serif transition-all hover:border-primary/40">
                                                                    <div className="flex items-center gap-3">
                                                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                                                        <span>{format(formData.visitDate, "PPP")}</span>
                                                                    </div>
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 rounded-[1.5rem]" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={formData.visitDate}
                                                                    onSelect={(date) => date && setFormData(prev => ({ ...prev, visitDate: date }))}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Arrival Time</p>
                                                        <input 
                                                            type="time" 
                                                            className="flex h-14 w-full rounded-2xl border-2 border-border/40 bg-card/40 px-6 py-4 text-lg font-serif outline-none transition-all focus:border-primary/40"
                                                            value={formData.visitTime}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, visitTime: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Select Duration</p>
                                                    <div className="flex gap-4">
                                                        {[30, 60].map((d) => (
                                                            <button
                                                                key={d}
                                                                onClick={() => setFormData(prev => ({ ...prev, duration: d as 30 | 60 }))}
                                                                className={`flex-1 py-4 rounded-2xl border-2 transition-all ${formData.duration === d
                                                                    ? 'border-primary bg-primary/10 text-primary shadow-neon'
                                                                    : 'border-border/40 hover:border-primary/30'
                                                                    }`}
                                                            >
                                                                <span className="text-xl font-bold">{d} Minutes</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Participants Under Your Vigil</p>
                                                    {formData.participants.map((p, idx) => (
                                                        <motion.div
                                                            key={p.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/20 p-5 rounded-2xl border border-border/40"
                                                        >
                                                            <div className="md:col-span-7 space-y-2">
                                                                <label className="text-[10px] uppercase tracking-widest text-secondary font-bold">Name</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Participant Name"
                                                                    className="w-full bg-transparent border-b-2 border-border py-2 outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                                                                    value={p.name}
                                                                    onChange={(e) => {
                                                                        setFormData(prev => {
                                                                            const newParts = [...prev.participants];
                                                                            newParts[idx].name = e.target.value;
                                                                            return { ...prev, participants: newParts };
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="md:col-span-4 space-y-2">
                                                                <label className="text-[10px] uppercase tracking-widest text-secondary font-bold">Date of Birth</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full bg-transparent border-b-2 border-border py-2 outline-none focus:border-primary transition-colors text-foreground"
                                                                    value={p.dob}
                                                                    onChange={(e) => {
                                                                        setFormData(prev => {
                                                                            const newParts = [...prev.participants];
                                                                            newParts[idx].dob = e.target.value;
                                                                            return { ...prev, participants: newParts };
                                                                        });
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="md:col-span-1 flex justify-end">
                                                                {formData.participants.length > 1 && (
                                                                    <button onClick={() => removeParticipant(p.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2">
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))}

                                                    <button
                                                        onClick={addParticipant}
                                                        className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold hover:gap-4 transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add Kin
                                                    </button>
                                                </div>

                                                <div className="p-6 rounded-[2rem] bg-secondary/5 border border-secondary/20 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-bold">Mandatory Grip Socks</h4>
                                                            <p className="text-xs text-muted-foreground italic">Required for all participants. Select if you need to buy them.</p>
                                                        </div>
                                                        <div 
                                                            onClick={() => setFormData(prev => ({ ...prev, needsSocks: !prev.needsSocks }))}
                                                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${formData.needsSocks ? 'bg-primary' : 'bg-muted'}`}
                                                        >
                                                            <motion.div 
                                                                animate={{ x: formData.needsSocks ? 24 : 0 }}
                                                                className="w-6 h-6 bg-white rounded-full shadow-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                    {formData.needsSocks && (
                                                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">₹80 per person will be added</p>
                                                    )}
                                                </div>

                                                <label className="flex items-start gap-4 cursor-pointer mt-6 p-4 rounded-xl hover:bg-muted/20 transition-all">
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1 w-5 h-5 accent-primary"
                                                        checked={formData.liabilityAccepted}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, liabilityAccepted: e.target.checked }))}
                                                    />
                                                    <span className="text-sm text-muted-foreground leading-relaxed italic">
                                                        I yield all claims gracefully and pledge my vigilance to the rules of the realm for all participants listed.
                                                    </span>
                                                </label>
                                            </div>
                                        )}

                                        {/* Medical Contact */}
                                        {step === 3 && (
                                            <div className="space-y-10">
                                                <div className="relative rounded-2xl overflow-hidden aspect-video shadow-premium mb-6 hidden lg:block">
                                                    <img
                                                        src={sectionImage('medical')}
                                                        alt="Bubble Balls"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                                    <div className="absolute inset-0 border border-primary/20 rounded-2xl" />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                                    <div className="space-y-2">
                                                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Guardian Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Noble Signatory"
                                                            className="w-full bg-transparent border-b-2 border-border py-3 outline-none focus:border-primary transition-colors font-serif text-xl text-foreground placeholder:text-muted-foreground"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Phone Connection</label>
                                                        <input
                                                            type="tel"
                                                            placeholder="+1 (555) 000-0000"
                                                            className="w-full bg-transparent border-b-2 border-border py-3 outline-none focus:border-primary transition-colors text-lg text-foreground placeholder:text-muted-foreground"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Digital Post (Email)</label>
                                                        <input
                                                            type="email"
                                                            placeholder="honor@legacy.com"
                                                            className="w-full bg-transparent border-b-2 border-border py-3 outline-none focus:border-primary transition-colors text-lg text-foreground placeholder:text-muted-foreground"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="pt-6 border-t border-border/40">
                                                    <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl hover:bg-muted/20 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 accent-primary"
                                                            checked={formData.medicalConsent}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, medicalConsent: e.target.checked }))}
                                                        />
                                                        <span className="text-sm text-muted-foreground italic">I bestow the mandate for emergency care and assume stewardship of the ledger.</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {/* Final Signature */}
                                        {step === 4 && (
                                            <div className="space-y-10">
                                                <SignaturePad
                                                    onSign={(val) => setFormData(prev => ({ ...prev, signed: val }))}
                                                    onSignatureChange={(dataUrl) => setFormData(prev => ({ ...prev, signature: dataUrl }))}
                                                />

                                                <div className="flex justify-center h-28">
                                                    <AnimatePresence>
                                                        {formData.signed && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                                                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                                className="w-28 h-28 bg-gradient-neon rounded-full flex items-center justify-center shadow-neon border-4 border-card relative"
                                                            >
                                                                <div className="text-primary-foreground font-serif font-bold text-4xl">HF</div>
                                                                <motion.div
                                                                    className="absolute inset-0 rounded-full border-2 border-primary/50"
                                                                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground px-8">
                                                    By affixing your mark, you bind yourself and your kin to this eternal covenant perpetually for all visits.
                                                </p>
                                            </div>
                                        )}

                                    </motion.div>
                                </div>
                            </div>
                        </motion.section>
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <footer className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex gap-4">
                        <AnimatePresence>
                            {step > 0 && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <PremiumButton variant="secondary" onClick={prevStep}>
                                        <ChevronLeft className="w-5 h-5" /> Reflect
                                    </PremiumButton>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex flex-col items-end">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold mb-1">Authenticated via</p>
                            <p className="text-xs text-secondary font-medium">HavFun Security Protocols</p>
                        </div>
                        <PremiumButton onClick={nextStep} disabled={!isStepValid() || isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Archiving...
                                </>
                            ) : (
                                <>
                                    {step === SECTIONS.length - 1 ? 'Affix My Seal' : 'Next Chapter'}
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </PremiumButton>
                    </div>
                </footer>
            </main>

            {/* Background Brand Text */}
            <div className="fixed top-1/2 left-6 -translate-y-1/2 pointer-events-none opacity-[0.02] rotate-90 origin-left hidden xl:block">
                <p className="text-[160px] font-serif leading-none select-none text-foreground whitespace-nowrap tracking-wider">ETERNAL HARMONY</p>
            </div>
        </div>
    );
};

export default Waiver;
