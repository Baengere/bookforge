import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import FeaturedBook from "@/components/sections/FeaturedBook";
import About from "@/components/sections/About";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] p-10 text-white">
      <Navbar />
      <Hero />
      <FeaturedBook />
      <About />
      <Footer />
    </main>
  );
}