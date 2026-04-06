import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { FinancialCards } from "@/components/FinancialCards";
import { ChartsSection } from "@/components/ChartsSection";
import { ChallengerSection } from "@/components/ChallengerSection";
import TransactionsSection from "@/components/TransactionsSection";
import CalculatorSection from "@/components/CalculatorSection";
import AssistentSection from "@/components/AssistentSection";
import SerasaSection from "@/components/SerasaSection";
import supabase from "../../utils/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/footer";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("painel");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [financialData, setFinancialData] = useState<any>(undefined); // undefined = loading
  const { profile } = useProfile();
  const { user } = useAuth();

  useEffect(() => {
    async function loadFinancialData() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('financial')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (data) {
        setFinancialData({
          divida: 0,
          rendaFixa: [data.fixedIncome || 0],
          rendaVariavel: [data.variableIncome || 0],
          gastosFixos: [data.fixedExpenses || 0],
          gastosVariaveis: [data.variableExpenses || 0],
          investimentos: [data.investments || 0]
        });
      } else {
        setFinancialData(null);
      }
    }
    
    loadFinancialData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Wrapper principal que cresce para ocupar a tela e posicionar o footer */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[72px] md:ml-[260px]'}`}>
        
        {/* Área de conteúdo com o padding original */}
        <main className="flex-1 p-4 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Bem-vindo de volta, {profile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Visitante'} 👋
              </p>
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                 Aproveite nosso site!
              </h2>
            </div>
          </div>

          <CalculatorSection />
          <TransactionsSection />

          {/* Serasa Mock Debts */}
          <SerasaSection />

          <div className="rounded-[20px] overflow-hidden shadow-sm border border-border">
            <AssistentSection
              financialData={financialData}
              isDashboard={true}
            />
          </div>
        </main>

        {/* Footer agora fora do <main> para ocupar 100% da largura da área visível */}
        <Footer />
      </div>
    </div>
  );
}