import { motion } from 'framer-motion';
import { ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import PremiumButton from '@/components/ui/PremiumButton';
import { useSite, usePricing } from '@/hooks/useContent';

const to12h = (h: number) => (h > 12 ? `${h - 12}pm` : `${h}am`);

const Hero = () => {
    const { data: site } = useSite();
    const { data: pricing } = usePricing();

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image from HavFun */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 scale-105 animate-slow-zoom"
                style={{
                    backgroundImage: site?.banner ? `url("${site.banner}")` : undefined,
                }}
            ></div>
            <div className="absolute inset-0 bg-black/60 z-10" />

            <div className="relative z-20 container mx-auto px-4 pt-24 pb-12 sm:pt-28 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {site?.logo && (
                        <img
                            src={site.logo}
                            alt="HavFun Logo"
                            className="h-28 sm:h-36 md:h-48 mx-auto mb-6 sm:mb-8 drop-shadow-neon"
                        />
                    )}

                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-[1.1]">
                        Where Thrills, Laughter, <br className="hidden sm:inline" /> and Memories <span className="text-primary italic">Take Flight</span>.
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 max-w-2xl mx-auto leading-relaxed px-2">
                        Welcome to HavFun Trampoline, the ultimate destination for high-flying fun and unforgettable experiences.
                    </p>

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 border border-primary/40 text-primary-foreground text-xs sm:text-sm font-bold mb-8 sm:mb-10 backdrop-blur-md max-w-full"
                    >
                        <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> 
                        <span className="truncate">
                            Weekday Special: ₹{pricing?.offers.weekdaySpecial ?? 99} ({pricing ? `${to12h(pricing.hours.weekdayOfferStart)} - ${to12h(pricing.hours.weekdayOfferEnd)}` : '10am - 5pm'})
                        </span>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto">
                        <Link to="/booking" className="w-full sm:w-auto">
                            <PremiumButton className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base sm:text-lg">
                                Book Now <ArrowRight className="ml-2 w-5 h-5" />
                            </PremiumButton>
                        </Link>
                        <a href="#attractions" className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl glass-premium text-white font-medium hover:bg-white/10 transition-colors text-center text-sm sm:text-base">
                            View Attractions
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent z-20"></div>
        </div>
    );
};

export default Hero;
