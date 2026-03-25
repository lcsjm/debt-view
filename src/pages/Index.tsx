import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CalculatorSection from "@/components/CalculatorSection";
import AnalysisSection from "@/components/AnalysisSection";
import EducationSection from "@/components/EducationSection";
import Footer from "@/components/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CalculatorSection />
      <AnalysisSection />
      <EducationSection />
       <Footer/>
    <footer/>
    </div>
  );
};

export default Index;
