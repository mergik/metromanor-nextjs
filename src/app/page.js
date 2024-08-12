import HeroSection from "@/components/hero/HeroSection";
import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col  justify-between p-8">
      <Navbar/>
      <HeroSection/>
    </main>
  );
}
