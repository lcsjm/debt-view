import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { FinancialCards } from "@/components/FinancialCards";
import { ChartsSection } from "@/components/ChartsSection";
import { ChallengerSection } from "@/components/ChallengerSection";
import TransactionsSection from "@/components/TransactionsSection";
import DashAnalysis from "@/components/DashAnalysis";
import AssistentSection from "@/components/AssistentSection";
import SerasaSection from "@/components/SerasaSection";
import EducationSection from "@/components/EducationSection";

import { useProfile } from "@/hooks/useProfile";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("painel");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const { profile } = useProfile();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* A margem principal agora reage ao estado 'collapsed' */}
      <main className={`transition-all duration-300 p-4 md:p-8 space-y-8 ${collapsed ? 'ml-[72px]' : 'ml-[72px] md:ml-[260px]'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo de volta, {profile?.name || 'Visitante'} 👋</p>
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
              Dashboard DebtView
            </h2>
          </div>
        </div>
        <DashAnalysis />

        {/* Serasa Mock Debts */}
        <SerasaSection />

        <AssistentSection
          financialData={null}
          isChatbotFloating={false}
          onFloatChatbot={() => { }}
        />



        {/* TransactionsSection Section */}
        <TransactionsSection />

        <EducationSection />
      </main>
    </div>
  );
}