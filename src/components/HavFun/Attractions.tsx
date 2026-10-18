import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAttractions } from '@/hooks/useContent';

const Attractions = () => {
    const { data: attractions = [] } = useAttractions();

    return (
        <section id="attractions" className="py-16 sm:py-24 md:py-28 bg-muted/30 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 sm:mb-20 space-y-3 sm:space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        Explore the Fun
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight"
                    >
                        Jump, <span className="text-primary italic">Flip</span> & Play
                    </motion.h2>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="h-1 w-20 sm:w-24 bg-primary mx-auto rounded-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {attractions.map((attraction, idx) => (
                        <motion.div
                            key={attraction.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: idx * 0.1,
                                duration: 0.7,
                                ease: [0.215, 0.61, 0.355, 1]
                            }}
                            whileHover={{ y: -10 }}
                            className="group relative flex flex-col rounded-[2rem] sm:rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-all duration-500 shadow-xl overflow-hidden"
                        >
                            <div className="aspect-[4/3] overflow-hidden relative">
                                <img
                                    src={attraction.image}
                                    alt={attraction.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 brightness-90 group-hover:brightness-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] opacity-0 transition-opacity flex items-center justify-center"
                                >
                                    <span className="text-white font-bold tracking-widest text-xs border border-white/40 px-6 py-2 rounded-full uppercase">Details</span>
                                </motion.div>
                            </div>
                            <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                                <div>
                                    <motion.div
                                        className="w-10 h-1 bg-primary/30 mb-4 sm:mb-6 group-hover:w-20 transition-all duration-500"
                                    />
                                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 tracking-tight">
                                        {attraction.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 font-light">
                                        {attraction.description}
                                    </p>
                                </div>
                                <Link
                                    to="/booking"
                                    className="text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors flex items-center gap-2 group/btn pt-2"
                                >
                                    BOOK FOR {attraction.title}
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform shrink-0" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Attractions;
