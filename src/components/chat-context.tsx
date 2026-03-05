import { createContext, useContext, useState, type ReactNode } from "react";

export interface FinancialData {
    divida: number;
    rendaFixa: number[];
    rendaVariavel: number[];
    gastosFixos: number[];
    gastosVariaveis: number[];
}

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggle: () => void;
    financialData: FinancialData | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({
    children,
    financialData = null
}: {
    children: ReactNode;
    financialData?: FinancialData | null;
}) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, toggle: () => setIsOpen((v) => !v), financialData }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used within ChatProvider");
    return ctx;
}
