import { Hero } from "@/components/home/Hero";
import { SubjectShowcase } from "@/components/home/SubjectShowcase";
import { Features } from "@/components/home/Features";

export default function Home() {
  return (
    <main>
      <Hero />
      <SubjectShowcase />
      <Features />
    </main>
  );
}
