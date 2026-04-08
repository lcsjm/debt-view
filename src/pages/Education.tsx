import EducationSection from "@/components/EducationSection";
import MaslowSection from "@/components/MaslowSection";
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";

export default function Education() {
  const [activeSection, setActiveSection] = useState("painel");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <EducationSection />
      {/* Componente adicionado logo abaixo da seção de Educação */}
      <MaslowSection />
    </>
  );
}