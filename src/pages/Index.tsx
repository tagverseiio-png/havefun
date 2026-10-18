import Navbar from '@/components/HavFun/Navbar';
import Hero from '@/components/HavFun/Hero';
import About from '@/components/HavFun/About';
import Attractions from '@/components/HavFun/Attractions';
import Safety from '@/components/HavFun/Safety';
import Cafe from '@/components/HavFun/Cafe';
import Testimonials from '@/components/HavFun/Testimonials';
import GalleryContainer from '@/components/HavFun/GalleryContainer';
import FAQ from '@/components/HavFun/FAQ';
import Pricing from '@/components/HavFun/Pricing';
import Contact from '@/components/HavFun/Contact';

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />

      <main>
        <section id="home">
          <Hero />
        </section>

        <section id="about">
          <About />
        </section>

        <section id="attractions">
          <Attractions />
        </section>

        <Safety />

        <Cafe />

        <section id="gallery">
          <GalleryContainer />
        </section>

        <Testimonials />

        <section id="pricing">
          <Pricing />
        </section>

        <FAQ />

        <section id="contact">
          <Contact />
        </section>
      </main>

      <footer className="py-12 bg-background border-t border-border/20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Spend Your Holiday at HavFun Park</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Don’t hesitate! Spend your holidays making beautiful memories with us and create an unforgettable experience.
            </p>
          </div>

          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} HavFun Trampoline Park. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs mt-4">
            Developed by <span className="text-primary font-bold">TAGVERSE</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
