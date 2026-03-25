import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CalculatorIndex from "@/components/CalculatorIndex";
import AnalysisSection from "@/components/AnalysisSection";
import EducationSection from "@/components/EducationSection";
import Footer from "@/components/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CalculatorIndex />
      <AnalysisSection />
      <EducationSection />
       <Footer/>
    <footer/>
    </div>
  );
};

export default Index;
