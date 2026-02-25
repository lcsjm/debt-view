import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CalculatorSection from "@/components/CalculatorSection";
import AnalysisSection from "@/components/AnalysisSection";
import EducationSection from "@/components/EducationSection";

const Index = () => {
  // Parallax effect for the logo in hero
  useEffect(() => {
    const handleScroll = () => {
      const logo = document.getElementById("parallax-logo");
      if (logo) {
        const scrollY = window.scrollY;
        logo.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CalculatorSection />
      <AnalysisSection />
      <EducationSection />

      {/* Footer */}
      <footer className="bg-primary py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2026 DebtView Experian. Todos os direitos reservados.
          </p>
          <p className="text-primary-foreground/40 text-xs mt-2">
            Powered by Serasa Experian
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
