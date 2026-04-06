    import { Apple, Play } from 'lucide-react';
    
    export default function Footer (){
return (
 <footer className="bg-gradient-to-r from-[#1D4F91] via-[#426DA9] to-[#77127B] py-6 border-t-2 border-[#E80070]">
  <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
    
    {/* Canto Esquerdo - Copyright Slim */}
    <div className="text-center md:text-left">
      <p className="text-white font-bold text-base tracking-tight leading-none">
        Debt<span className="text-[#E80070]">View</span>
      </p>
      <p className="text-white/70 text-[10px] mt-1">
        © 2026 Todos os direitos reservados.
      </p>
    </div>

    {/* Canto Direito - Download com Links */}
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <span className="text-white/90 text-xs font-medium uppercase tracking-wider">
        Baixar aplicativo Serasa
      </span>
      
      <div className="flex gap-3">
        {/* Botão Play Store */}
        <a 
          href="https://play.google.com/store/apps/details?id=br.com.serasaexperian.consumidor" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white/10 hover:bg-[#C1188B] text-white px-3 py-1.5 rounded-lg border border-white/20 transition-all duration-300 group shadow-sm"
        >
          <Play size={14} fill="currentColor" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[8px] opacity-70">Disponível no</span>
            <span className="text-xs font-semibold">Google Play</span>
          </div>
        </a>

        {/* Botão App Store */}
        <a 
          href="https://apps.apple.com/br/app/serasa-consulta-cpf-e-score/id1102452668" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white/10 hover:bg-[#E80070] text-white px-3 py-1.5 rounded-lg border border-white/20 transition-all duration-300 group shadow-sm"
        >
          <Apple size={14} />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[8px] opacity-70">Baixar na</span>
            <span className="text-xs font-semibold">App Store</span>
          </div>
        </a>
      </div>
    </div>

  </div>
</footer>
        )   
    } 
   