import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

// Local Video Assets
import vid1 from '@/assets/havefun01.mp4';
import vid2 from '@/assets/havefun02.mp4';
import vid3 from '@/assets/havefun03.mp4';

const LOCAL_VIDEOS = [
    { src: vid1, views: "15.2K" },
    { src: vid2, views: "10.8K" },
    { src: vid3, views: "9.4K" }
];

function LazyVideo({ src, className }: { src: string; className?: string }) {
    const [shouldLoad, setShouldLoad] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <video
            ref={videoRef}
            src={shouldLoad ? src : undefined}
            className={className}
            autoPlay={shouldLoad}
            muted
            loop
            playsInline
            preload="none"
        />
    );
}

const Testimonials = () => {
    return (
        <section className="py-16 sm:py-24 md:py-28 bg-background overflow-hidden relative" id="community">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="w-full lg:w-1/4 lg:sticky lg:top-32 space-y-6 sm:space-y-10"
                    >
                        <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-primary tracking-[0.4em] uppercase text-[10px] font-black bg-primary/10 px-5 py-2.5 rounded-full inline-block border border-primary/20"
                            >
                                LIVE ENERGY
                            </motion.span>
                            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[0.95] sm:leading-[0.85]">
                                The <span className="text-primary italic">Vibe</span> <br />Only
                            </h2>
                            <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                                Experience the raw, unfiltered energy of HavFun through our latest highlights.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 max-w-xs mx-auto lg:mx-0">
                            <a
                                href="https://www.instagram.com/havfun_trampolinepark"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <PremiumButton className="h-12 sm:h-14 px-6 sm:px-8 text-xs sm:text-sm group w-full">
                                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="ml-2 sm:ml-3">FOLLOW OUR JOURNEY</span>
                                </PremiumButton>
                            </a>
                        </div>
                    </motion.div>

                    <div className="w-full lg:w-3/4 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                            {/* Local Video Cards - Responsive Height */}
                            {LOCAL_VIDEOS.map((video, idx) => (
                                <motion.div
                                    key={`video-${idx}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="group relative h-[420px] sm:h-[480px] md:h-[550px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-premium bg-black"
                                >
                                    <LazyVideo 
                                        src={video.src} 
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                                    
                                    <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                                            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#A3FF00]" />
                                            <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                                                {video.views} VIEWS
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Hover Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Decorative Background Glows */}
                        <div className="overflow-hidden absolute inset-0 -z-10 pointer-events-none">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full" 
                            />
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
