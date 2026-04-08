import { useEffect, useState, ReactNode } from "react";
import supabase from "../../utils/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Rocket, Code, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ContentProtection({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Corrigido para supabase.auth (instância minúscula, auth minúsculo)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Always prevent context menu (to block "Inspect")
      e.preventDefault();
      if (!isLoggedIn) setShowPopup(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Always block dev tools, console and view-source (shortcuts vary by OS and browser)
      const isInspectKey = 
        e.key === "F12" || 
        ((e.ctrlKey || e.metaKey) && (
          e.key.toLowerCase() === "u" || // View Source
          (e.shiftKey && (
            e.key.toLowerCase() === "i" || // Inspect
            e.key.toLowerCase() === "j" || // Console (Chrome/Edge)
            e.key.toLowerCase() === "c" || // Inspect Element (Chrome/Edge)
            e.key.toLowerCase() === "k"    // Console (Firefox)
          ))
        ));

      if (isInspectKey) {
        e.preventDefault();
        return;
      }

      // Print screen blocking
      if (e.key === "PrintScreen" || e.key === "Snapshot") {
        if (isLoggedIn) return; // Allow for logged users
        e.preventDefault();
        setShowPopup(true);
        return;
      }

      // Ctrl+P (print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        if (isLoggedIn) return; // Allow for logged users
        e.preventDefault();
        setShowPopup(true);
        return;
      }

      // Copy/cut
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "c" || e.key.toLowerCase() === "x")) {
        if (isLoggedIn) return; // Allow for logged users
        e.preventDefault();
        setShowPopup(true);
        return;
      }
    };

    // Block print screen via visibility change (common workaround)
    const handleVisibilityChange = () => {
      // Can't fully block but we can detect
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoggedIn]);

  const handleSignup = (type: string) => {
    setShowPopup(false);
    navigate(`/auth?tab=signup&type=${type}`);
  };

  return (
    <>
      {children}

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <DialogTitle className="text-xl">Ação Restrita</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Esta ação é bloqueada para usuários anônimos. Cadastre-se gratuitamente para acessar todos os recursos da plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <p className="text-sm font-medium text-muted-foreground">Como deseja se cadastrar?</p>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14 text-left"
              onClick={() => handleSignup("startup")}
            >
              <Rocket className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="font-semibold">Startup</div>
                <div className="text-xs text-muted-foreground">Acelere sua ideia com nossas ferramentas</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14 text-left"
              onClick={() => handleSignup("software_house")}
            >
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="font-semibold">Software House</div>
                <div className="text-xs text-muted-foreground">Gerencie projetos e clientes</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14 text-left"
              onClick={() => handleSignup("programmer")}
            >
              <Code className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="font-semibold">Programador</div>
                <div className="text-xs text-muted-foreground">Aprenda e conecte-se ao ecossistema</div>
              </div>
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={() => { setShowPopup(false); navigate("/auth"); }}
            >
              Já tenho uma conta — Entrar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}