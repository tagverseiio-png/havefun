import { MapPin, Phone, Mail, Clock, Send, Loader2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import PremiumButton from '@/components/ui/PremiumButton';
import { useSite } from '@/hooks/useContent';
import { submitContactMessage } from '@/lib/submissions';

const Contact = () => {
    const { data: site } = useSite();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitContactMessage(formData);
            toast.success('Message sent! We will get back to you soon.');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 bg-background border-t border-border/40">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <span className="text-primary tracking-widest uppercase text-sm font-bold">Get In Touch</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-8">Contact Us</h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1">Our Location</h4>
                                    <a
                                        href={site?.mapsUrl || "https://maps.app.goo.gl/Yer8udFFQVCq5obz9"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary transition-colors block leading-relaxed"
                                    >
                                        {site?.address}
                                    </a>
                                    <a
                                        href={site?.mapsUrl || "https://maps.app.goo.gl/Yer8udFFQVCq5obz9"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold mt-2 hover:underline"
                                    >
                                        Get Directions <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1">Working Hours</h4>
                                    <p className="text-muted-foreground">{site?.hours}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1">Phone</h4>
                                    <a href={`tel:${site?.phoneE164 ?? ''}`} className="text-muted-foreground hover:text-primary transition-colors">{site?.phone}</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1">Email</h4>
                                    <a href={`mailto:${site?.email ?? ''}`} className="text-muted-foreground hover:text-primary transition-colors">{site?.email}</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="glass-premium p-8 rounded-3xl border border-border/40 shadow-premium">
                            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                            placeholder="Your Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                            placeholder="Your Email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                        placeholder="Your Phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                                <PremiumButton type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </PremiumButton>
                            </form>
                        </div>

                        <div className="rounded-3xl overflow-hidden h-[300px] border border-border/40 shadow-premium">
                            <iframe
                                src={site?.mapsEmbed}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
