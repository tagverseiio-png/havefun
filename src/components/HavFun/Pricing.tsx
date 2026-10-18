import { motion } from 'framer-motion';
import { Clock, Tag, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRICING_CONFIG as STATIC_PRICING, calculateBasePrice } from '@/lib/pricing-config';
import { usePricing } from '@/hooks/useContent';

const Pricing = () => {
    const { data } = usePricing();
    const PRICING_CONFIG = data ?? STATIC_PRICING;
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const isWeekend = day === 0 || day === 6;
    const isWeekdayOfferTime = !isWeekend && hour >= PRICING_CONFIG.hours.weekdayOfferStart && hour < PRICING_CONFIG.hours.weekdayOfferEnd;

    const base30 = PRICING_CONFIG.basic[30];
    const base60 = PRICING_CONFIG.basic[60];

    const getPrice = (duration: 30 | 60) => {
        return calculateBasePrice(duration, now, hour, PRICING_CONFIG);
    };

    const formatPercent = (dec: number) => Math.round(dec * 100);

    return (
        <section id="pricing" className="py-16 sm:py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        Investment in Joy
                    </motion.div>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">Flexible <span className="text-primary italic">Pricing</span></h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-2">
                        Choose the duration that fits your energy level. All prices inclusive of an experience beyond boundaries.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
                    {/* 30 Minutes Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-premium p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-border/40 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 flex flex-col justify-between"
                    >
                        {isWeekdayOfferTime && (
                            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold animate-pulse">
                                SPECIAL OFFER
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-4 mb-6 sm:mb-8">
                                <div className="p-3 sm:p-4 bg-primary/10 rounded-2xl text-primary">
                                    <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold">30 Minutes</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Quick Burst of Energy</p>
                                </div>
                            </div>

                            <div className="mb-6 sm:mb-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl sm:text-5xl font-bold">₹{getPrice(30)}</span>
                                    {getPrice(30) < base30 && (
                                        <span className="text-lg sm:text-xl text-muted-foreground line-through">₹{base30}</span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">+{formatPercent(PRICING_CONFIG.gst)}% GST Additional</p>
                            </div>

                            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                                {[
                                    "Access to all Zones",
                                    "Complimentary Safety Gear",
                                    "Expert Supervision",
                                    "Locker Access"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs sm:text-sm">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link 
                            to="/booking"
                            className="w-full block"
                        >
                            <button className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground text-sm sm:text-base font-bold hover:shadow-neon transition-all">
                                Book 30 Mins
                            </button>
                        </Link>
                    </motion.div>

                    {/* 60 Minutes Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-card/40 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border-2 border-primary relative overflow-hidden group shadow-2xl flex flex-col justify-between"
                    >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
                        <div className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">
                            MOST POPULAR
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-4 mb-6 sm:mb-8">
                                <div className="p-3 sm:p-4 bg-primary rounded-2xl text-primary-foreground shadow-neon">
                                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold">60 Minutes</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">The Full Experience</p>
                                </div>
                            </div>

                            <div className="mb-6 sm:mb-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl sm:text-5xl font-bold">₹{getPrice(60)}</span>
                                    {getPrice(60) < base60 && (
                                        <span className="text-lg sm:text-xl text-muted-foreground line-through">₹{base60}</span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">+{formatPercent(PRICING_CONFIG.gst)}% GST Additional</p>
                            </div>

                            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                                {[
                                    "Access to all Zones",
                                    "Complimentary Safety Gear",
                                    "Expert Supervision",
                                    "Locker Access",
                                    "Best Value for Money"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs sm:text-sm">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link 
                            to="/booking"
                            className="w-full block"
                        >
                            <button className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground text-sm sm:text-base font-bold shadow-neon hover:scale-[1.02] transition-all">
                                Book 60 Mins
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Additional Info Cards */}
                <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                    <div className="p-5 sm:p-6 bg-muted/40 rounded-2xl sm:rounded-3xl border border-border/40 flex items-start gap-4">
                        <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm sm:text-base mb-1">Weekday Offer</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">₹{PRICING_CONFIG.offers.weekdaySpecial} only from {PRICING_CONFIG.hours.weekdayOfferStart > 12 ? PRICING_CONFIG.hours.weekdayOfferStart - 12 + 'pm' : PRICING_CONFIG.hours.weekdayOfferStart + 'am'} to {PRICING_CONFIG.hours.weekdayOfferEnd > 12 ? PRICING_CONFIG.hours.weekdayOfferEnd - 12 + 'pm' : PRICING_CONFIG.hours.weekdayOfferEnd + 'am'} (Mon-Fri). Grab the daylight deals!</p>
                        </div>
                    </div>
                    <div className="p-5 sm:p-6 bg-muted/40 rounded-2xl sm:rounded-3xl border border-border/40 flex items-start gap-4">
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm sm:text-base mb-1">Grip Socks</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">₹{PRICING_CONFIG.gripSocks} mandatory for all jumpers. Safety first, style second.</p>
                        </div>
                    </div>
                    <div className="p-5 sm:p-6 bg-muted/40 rounded-2xl sm:rounded-3xl border border-border/40 flex items-start gap-4">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm sm:text-base mb-1">Weekend Specials</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{formatPercent(PRICING_CONFIG.offers.offPeakDiscount)}% OFF on all bookings after {PRICING_CONFIG.hours.offPeakStartDay > 12 ? PRICING_CONFIG.hours.offPeakStartDay - 12 + 'pm' : PRICING_CONFIG.hours.offPeakStartDay + 'am'} weekdays and full days on weekends.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
