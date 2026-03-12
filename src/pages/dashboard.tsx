import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { FinancialCards } from "@/components/FinancialCards";
import { ChartsSection } from "@/components/ChartsSection";
import { ChallengerSection } from "@/components/ChallengerSection";
import  TransactionsSection  from "@/components/TransactionsSection";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("painel");

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="ml-[72px] md:ml-[260px] p-4 md:p-8 space-y-8 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo de volta 👋</p>
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
              Dashboard DebtView
            </h2>
          </div>
        </div>

        {/* Financial Cards */}
        <FinancialCards />

        {/* Charts */}
        <ChartsSection />

         {/* Challenger Section */}
        <ChallengerSection />

        {/* TransactionsSection Section */}
        <TransactionsSection />
      </main>
    </div>
  );
}