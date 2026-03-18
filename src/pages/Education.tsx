import EducationSection from "@/components/EducationSection";
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
    </>
  );
}
