import React from 'react';
import BookingAssistant from '@/components/HavFun/BookingAssistant';
import Navbar from '@/components/HavFun/Navbar';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const Booking = () => {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full" />
            </div>

            <Navbar />

            <main className="relative z-10 container mx-auto px-4 pt-28 pb-20 min-h-[calc(100vh-84px)] flex flex-col items-center justify-center">
                <BookingAssistant />
                
                <div className="mt-16 flex items-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black">
                        <ShieldCheck className="w-4 h-4" /> Secure Booking
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="text-[10px] uppercase tracking-widest font-black">Instant Confirmation</div>
                </div>
            </main>

            <footer className="relative z-10 py-10 opacity-60 text-center">
                <p className="text-[10px] uppercase tracking-[0.4em]">Safety • Joy • Legacy</p>
            </footer>
        </div>
    );
};

export default Booking;
