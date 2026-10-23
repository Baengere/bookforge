
import Hero from "@/components/sections/Hero";
import FeaturedBook from "@/components/sections/FeaturedBook";
import About from "@/components/sections/About";
import NewsletterSignup from "@/components/sections/NewsletterSignup";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] p-10 text-white">
      <Hero />
      <FeaturedBook />
      <About />
      <NewsletterSignup />
    </main>
  );
}