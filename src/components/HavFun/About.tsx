import { motion } from 'framer-motion';
import { useSite } from '@/hooks/useContent';

const About = () => {
    const { data: site } = useSite();
    return (
        <section className="py-24 md:py-40 bg-background relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-primary tracking-[0.3em] uppercase text-xs font-black bg-primary/10 px-4 py-2 rounded-full inline-block"
                            >
                                Our Atmosphere
                            </motion.span>
                            <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                                Destination for <br /> <span className="text-primary italic">Fun and Adventure!</span>
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-muted-foreground text-xl leading-relaxed font-light"
                            >
                                Welcome to HavFun Trampoline, the ultimate destination for high-flying fun and unforgettable experiences. Whether you’re looking to soar across trampolines or enjoy family-friendly activities, we’ve got something for everyone.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="text-muted-foreground text-lg leading-relaxed"
                            >
                                At HavFun Park, we’re dedicated to providing a fun and safe environment where everyone can jump, flip, and play. With exciting attractions like trampoline courts, and foam pits, there’s something for everyone.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.9 }}
                            className="pt-8 flex items-center gap-12"
                        >
                            <div className="group">
                                <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">10AM - 10PM</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Daily Operations</div>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="group">
                                <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">100% SAFE</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Certified Park</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative group"
                    >
                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden glass-premium p-3 shadow-2xl relative z-10">
                            <img
                                src={site?.aboutImage}
                                alt="HavFun Park Action"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover rounded-[2.5rem] transition-transform duration-[2s] group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />
                        </div>

                        {/* Interactive Elements Overlay */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 backdrop-blur-xl border border-primary/20 rounded-full z-20 flex items-center justify-center p-6 text-center"
                        >
                            <span className="text-xs font-bold text-primary tracking-tighter line-clamp-2">SKY HIGH ENERGY</span>
                        </motion.div>

                        {/* Floating Background Element */}
                        <div className="absolute -z-10 -bottom-12 -left-12 w-full h-full border-2 border-primary/20 rounded-[3rem] group-hover:-translate-x-4 group-hover:translate-y-4 transition-transform duration-700"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
