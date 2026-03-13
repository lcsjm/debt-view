import { useState, useRef, useCallback, useEffect } from "react";
import { Minimize2, X, MessageCircle, GripHorizontal } from "lucide-react";
import Chatbot from "./ChatBot"

interface FinancialData {
  divida: number;
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
}

const ChatbotWidget = ({
  financialData,
  onDock,
}: {
  financialData: FinancialData | null;
  onDock: () => void;
}) => {
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 620 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 380, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y)),
      });
    };
    const handleMouseUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
        style={{
          bottom: 24,
          right: 24,
          background: "linear-gradient(135deg, #1D4F91, #C1188B)",
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
      style={{
        left: pos.x,
        top: pos.y,
        width: 370,
        height: 550,
        animation: "scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
        style={{ background: "linear-gradient(135deg, #1D4F91, #77127B)" }}
      >
        <div className="flex items-center gap-2 text-white text-xs">
          <GripHorizontal className="w-4 h-4 opacity-60" />
          <span className="font-medium">Assistente Financeiro</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onDock}
            className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Reencaixar"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimizar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Chatbot financialData={financialData} compact />
      </div>
    </div>
  );
};

export default ChatbotWidget;
