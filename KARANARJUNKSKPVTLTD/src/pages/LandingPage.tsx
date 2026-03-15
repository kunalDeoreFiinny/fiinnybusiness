import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
    return (
        <div style={{
            background: 'var(--bg-color)',
            color: 'var(--text-primary)',
            minHeight: '100vh',
            overflowX: 'hidden'
        }}>
            <Navbar />

            <main>
                <Hero />

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    <Features />
                    <HowItWorks />
                    <Pricing />
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
