import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CalculatorIndex from "@/components/CalculatorIndex";
import AnalysisSection from "@/components/AnalysisSection";
import EducationIndex from "@/components/ui/EducationIndex";
import Footer from "@/components/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CalculatorIndex />
      <AnalysisSection />
      <EducationIndex />
       <Footer/>
    <footer/>
    </div>
  );
};

export default Index;
