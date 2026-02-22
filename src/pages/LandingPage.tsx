import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { MiniDemo } from "@/components/landing/MiniDemo"
import { Testimonials } from "@/components/landing/Testimonials"
import { Footer } from "@/components/landing/Footer"
import { Header } from "@/components/landing/Header"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-cyan)] selection:text-black">
            <Header />
            <Hero />
            <Features />
            <HowItWorks />
            <MiniDemo />
            <Testimonials />
            <Footer />
        </div>
    )
}
