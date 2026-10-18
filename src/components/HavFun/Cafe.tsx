import { motion } from 'framer-motion';
import { Coffee, Pizza, ArrowRight, Play } from 'lucide-react';
import { useCafe, useCafeImages } from '@/hooks/useContent';

const CATEGORY_ICONS = [<Pizza className="w-8 h-8" />, <Coffee className="w-8 h-8" />];

const Cafe = () => {
    const { data: cafe } = useCafe();
    const { data: cafeImages = [] } = useCafeImages();
    const categories = cafe?.categories ?? [];
    const img = (i: number) => cafeImages[i]?.image ?? '';

    return (
        <section className="py-28 bg-muted/30 relative overflow-hidden">
            {/* Coffee Steam Decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="space-y-10"
                    >
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-primary tracking-[0.3em] uppercase text-xs font-black bg-primary/10 px-4 py-2 rounded-full inline-block"
                            >
                                THE SNACK LOUNGE
                            </motion.span>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tight">HavFun <span className="text-primary italic">Cafe</span></h2>
                        </div>

                        <p className="text-muted-foreground text-xl leading-relaxed font-light">
                            {cafe?.intro}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {categories.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 + i * 0.2 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="p-8 rounded-[2rem] bg-card/60 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all flex flex-col gap-4 shadow-xl"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-4 ring-primary/5`}>
                                        {CATEGORY_ICONS[i] ?? CATEGORY_ICONS[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 tracking-tight">{item.title}</h4>
                                        <p className="text-muted-foreground text-sm font-light leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ x: 10 }}
                            className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-xs pt-4 group"
                        >
                            View Full Menu
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </motion.button>
                    </motion.div>

                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="grid grid-cols-2 gap-6"
                        >
                            <div className="space-y-6 pt-12">
                                <motion.div
                                    whileHover={{ scale: 0.98, rotate: -1 }}
                                    className="rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl relative group"
                                >
                                    <img src={img(0)} alt="Cafe Drink" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                                            <Play className="fill-white text-white ml-1" />
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 0.98, rotate: 1 }}
                                    className="rounded-[2.5rem] overflow-hidden aspect-square shadow-2xl group"
                                >
                                    <img src={img(1)} alt="Cafe Food" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                </motion.div>
                            </div>
                            <div className="space-y-6">
                                <motion.div
                                    whileHover={{ scale: 0.98, rotate: 1 }}
                                    className="rounded-[2.5rem] overflow-hidden aspect-square shadow-2xl group"
                                >
                                    <img src={img(2)} alt="Cafe Burger" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 0.98, rotate: -1 }}
                                    className="rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl group"
                                >
                                    <img src={img(3)} alt="Cafe Seating" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Floating elements background */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Cafe;
