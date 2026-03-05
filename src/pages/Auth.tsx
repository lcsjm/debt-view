import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check } from "lucide-react";

const STEPS = [
  { key: "email", label: "Email", required: true },
  { key: "password", label: "Senha", required: true },
  { key: "name", label: "Nome", required: false },
  { key: "cpf", label: "CPF", required: false },
  { key: "cep", label: "CEP", required: false },
  { key: "birthdate", label: "Data de Nascimento", required: true },
  { key: "gender", label: "Sexo", required: true },
  { key: "race", label: "Cor e Raça", required: true },
] as const;

const GENDER_OPTIONS = ["Masculino", "Feminino", "Não-binário"];
const RACE_OPTIONS = ["Parda", "Preta", "Branca", "Indígena", "Amarela"];

function maskCPF(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCEP(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

const MagneticButton = ({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      setOffset({ x: dx, y: dy });
    },
    [disabled]
  );

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  const base =
    variant === "primary"
      ? "bg-gradient-to-r from-[#E80070] to-[#C1188B] text-white shadow-lg shadow-[#E80070]/30"
      : "bg-white/10 border border-white/30 text-white/90 hover:bg-white/20";

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${base} ${className}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      {children}
    </button>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [entered, setEntered] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [animating, setAnimating] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    cpf: "",
    cep: "",
    birthdate: "",
    gender: "",
    race: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  const updateField = (key: string, value: string) => {
    let v = value;
    if (key === "cpf") v = maskCPF(value);
    if (key === "cep") v = maskCEP(value);
    setFormData((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const s = STEPS[step];
    const val = formData[s.key as keyof typeof formData];
    if (s.required && !val.trim()) {
      setErrors({ [s.key]: "Este campo é obrigatório" });
      return false;
    }
    if (s.key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setErrors({ email: "Email inválido" });
      return false;
    }
    if (s.key === "password" && val.length < 6) {
      setErrors({ password: "Mínimo 6 caracteres" });
      return false;
    }
    return true;
  };

  const goTo = (next: number) => {
    if (animating) return;
    setSlideDir(next > step ? "left" : "right");
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setTimeout(() => setAnimating(false), 50);
    }, 300);
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) {
      goTo(step + 1);
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Sua conta foi criada com sucesso.",
      });
      setTimeout(() => navigate("/"), 1500);
    }
  };

  const handleBack = () => {
    if (step > 0) goTo(step - 1);
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const currentStep = STEPS[step];
  const currentVal = formData[currentStep.key as keyof typeof formData];
  const error = errors[currentStep.key];

  const inputClass =
    "w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#E80070]/60 focus:border-transparent backdrop-blur-sm transition-all";

  const renderField = () => {
    const slideClass = animating
      ? slideDir === "left"
        ? "opacity-0 translate-x-8"
        : "opacity-0 -translate-x-8"
      : "opacity-100 translate-x-0";

    return (
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${slideClass}`}
        key={step}
      >
        <label
          className="block text-white/70 text-sm font-medium mb-2"
          style={{ fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)" }}
        >
          {currentStep.label}
          {currentStep.required && (
            <span className="text-[#E80070] ml-1">*</span>
          )}
        </label>

        {currentStep.key === "email" && (
          <input
            type="email"
            className={inputClass}
            placeholder="seu@email.com"
            value={currentVal}
            onChange={(e) => updateField("email", e.target.value)}
            autoFocus
          />
        )}

        {currentStep.key === "password" && (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
              value={currentVal}
              onChange={(e) => updateField("password", e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}

        {currentStep.key === "name" && (
          <input
            type="text"
            className={inputClass}
            placeholder="Seu nome completo"
            value={currentVal}
            onChange={(e) => updateField("name", e.target.value)}
            autoFocus
          />
        )}

        {currentStep.key === "cpf" && (
          <input
            type="text"
            className={inputClass}
            placeholder="000.000.000-00"
            value={currentVal}
            onChange={(e) => updateField("cpf", e.target.value)}
            autoFocus
          />
        )}

        {currentStep.key === "cep" && (
          <input
            type="text"
            className={inputClass}
            placeholder="00000-000"
            value={currentVal}
            onChange={(e) => updateField("cep", e.target.value)}
            autoFocus
          />
        )}

        {currentStep.key === "birthdate" && (
          <input
            type="date"
            className={`${inputClass} [color-scheme:dark]`}
            value={currentVal}
            onChange={(e) => updateField("birthdate", e.target.value)}
            autoFocus
          />
        )}

        {currentStep.key === "gender" && (
          <div className="flex flex-col gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                  currentVal === opt
                    ? "bg-[#E80070]/20 border-[#E80070]/60 text-white"
                    : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    currentVal === opt
                      ? "border-[#E80070] bg-[#E80070]"
                      : "border-white/40"
                  }`}
                >
                  {currentVal === opt && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <input
                  type="radio"
                  name="gender"
                  value={opt}
                  checked={currentVal === opt}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="sr-only"
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {currentStep.key === "race" && (
          <div className="flex flex-col gap-3">
            {RACE_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                  currentVal === opt
                    ? "bg-[#E80070]/20 border-[#E80070]/60 text-white"
                    : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    currentVal === opt
                      ? "border-[#E80070] bg-[#E80070]"
                      : "border-white/40"
                  }`}
                >
                  {currentVal === opt && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <input
                  type="radio"
                  name="race"
                  value={opt}
                  checked={currentVal === opt}
                  onChange={(e) => updateField("race", e.target.value)}
                  className="sr-only"
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {error && (
          <p className="text-[#E80070] text-sm mt-2 animate-fade-in">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative">
      {/* Animated dark gradient background */}
      <div className="absolute inset-0 auth-gradient-bg" />

      {/* Subtle floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-[#77127B]/20 blur-3xl -top-48 -left-48 animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute w-80 h-80 rounded-full bg-[#1D4F91]/20 blur-3xl -bottom-40 -right-40 animate-[float_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute w-64 h-64 rounded-full bg-[#E80070]/10 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[float_15s_ease-in-out_infinite]" />
      </div>

      {/* Glassmorphism card with spring entry */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          entered
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90"
        }`}
      >
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="font-bold text-white mb-2"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}
            >
              Criar Conta
            </h1>
            <p
              className="text-white/50"
              style={{ fontSize: "clamp(0.8rem, 2vw, 0.95rem)" }}
            >
              Passo {step + 1} de {STEPS.length}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E80070] to-[#C1188B] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Step dots */}
            <div className="flex justify-between mt-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i <= step
                      ? "bg-[#E80070] scale-100"
                      : "bg-white/20 scale-75"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Field area */}
          <div className="min-h-[180px] flex flex-col justify-center">
            {renderField()}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 gap-4">
            {step > 0 ? (
              <MagneticButton variant="secondary" onClick={handleBack}>
                <ArrowLeft size={18} />
                Voltar
              </MagneticButton>
            ) : (
              <MagneticButton
                variant="secondary"
                onClick={() => navigate("/")}
              >
                <ArrowLeft size={18} />
                Início
              </MagneticButton>
            )}

            <MagneticButton onClick={handleNext}>
              {step === STEPS.length - 1 ? (
                <>
                  Finalizar
                  <Check size={18} />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight size={18} />
                </>
              )}
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

