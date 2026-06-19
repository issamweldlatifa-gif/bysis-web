import { useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type View = "home" | "google" | "apple" | "email" | "forgot" | "success";
type EmailStep = "address" | "code";
type ResetStep = "address" | "reset";
type Field = "email" | "forgotEmail" | "newPassword";

type Values = {
  email: string;
  emailCode: string[];
  forgotEmail: string;
  resetCode: string[];
  newPassword: string;
};

type Errors = Partial<Record<Field | "emailCode" | "resetCode", string>>;

const emptyValues: Values = {
  email: "",
  emailCode: Array(6).fill(""),
  forgotEmail: "",
  resetCode: Array(6).fill(""),
  newPassword: "",
};

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [view, setView] = useState<View>("home");
  const [emailStep, setEmailStep] = useState<EmailStep>("address");
  const [resetStep, setResetStep] = useState<ResetStep>("address");
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [hideAppleEmail, setHideAppleEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Vous êtes maintenant connecté à Bysis.");

  const emailCode = values.emailCode.join("");
  const resetCode = values.resetCode.join("");

  const open_view = (next: View) => {
    setErrors({});
    setLoading(false);
    setView(next);
  };

  const update = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateCode = (name: "emailCode" | "resetCode", next: string[]) => {
    setValues((current) => ({ ...current, [name]: next }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const resetInterface = () => {
    setValues(emptyValues);
    setErrors({});
    setEmailStep("address");
    setResetStep("address");
    setHideAppleEmail(true);
    setShowPassword(false);
    setLoading(false);
    setView("home");
    onOpenChange(false);
  };

  const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

  const finish = (message: string) => {
    setLoading(true);
    window.setTimeout(() => {
      setSuccessMessage(message);
      setLoading(false);
      setView("success");
    }, 900);
  };

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (emailStep === "address") {
      if (!isEmail(values.email)) {
        setErrors({ email: "Saisissez une adresse e-mail valide." });
        return;
      }

      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        setEmailStep("code");
      }, 650);
      return;
    }

    if (emailCode.length !== 6) {
      setErrors({ emailCode: "Entrez les 6 chiffres du code." });
      return;
    }

    finish("Votre e-mail est vérifié. Bienvenue dans Bysis.");
  };

  const submitForgot = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (resetStep === "address") {
      if (!isEmail(values.forgotEmail)) {
        setErrors({ forgotEmail: "Saisissez l'adresse liée au compte." });
        return;
      }

      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        setResetStep("reset");
      }, 650);
      return;
    }

    const next: Errors = {};
    if (resetCode.length !== 6) next.resetCode = "Entrez les 6 chiffres du code.";
    if (values.newPassword.length < 8) next.newPassword = "Utilisez au moins 8 caractères.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    finish("Votre mot de passe a été mis à jour avec succès.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-0 rounded-2xl shadow-xl p-0">
        <div
          className="w-full px-6 py-8"
          style={{
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {view === "home" && (
            <HomeView
              onGoogle={() => open_view("google")}
              onApple={() => open_view("apple")}
              onEmail={() => open_view("email")}
              onForgot={() => open_view("forgot")}
            />
          )}

          {view === "google" && (
            <ProviderView
              title="Continuer avec Google"
              description="Bysis utilisera Google uniquement pour confirmer votre identité."
              icon={<GoogleIcon />}
              loading={loading}
              onBack={() => open_view("home")}
              onContinue={() => finish("Votre compte Google est lié à Bysis.")}
            />
          )}

          {view === "apple" && (
            <ProviderView
              title="Continuer avec Apple"
              description="Choisissez si Bysis reçoit votre adresse réelle ou une adresse privée."
              icon={<AppleIcon />}
              loading={loading}
              onBack={() => open_view("home")}
              onContinue={() => finish("Votre compte Apple est lié à Bysis.")}
            >
              <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-semibold tracking-tight text-neutral-900">Adresse privée</p>
                    <p className="mt-1 text-[12px] leading-5 text-neutral-500">Masquer mon adresse e-mail.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHideAppleEmail((current) => !current)}
                    className={`relative h-7 w-12 rounded-full transition ${hideAppleEmail ? "bg-[#0066FF]" : "bg-neutral-300"}`}
                    aria-label="Adresse privée"
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${hideAppleEmail ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              </div>
            </ProviderView>
          )}

          {view === "email" && (
            <EmailView
              step={emailStep}
              values={values}
              errors={errors}
              loading={loading}
              onBack={() => (emailStep === "code" ? setEmailStep("address") : open_view("home"))}
              onChange={update}
              onCodeChange={(next) => updateCode("emailCode", next)}
              onSubmit={submitEmail}
            />
          )}

          {view === "forgot" && (
            <ForgotView
              step={resetStep}
              values={values}
              errors={errors}
              loading={loading}
              showPassword={showPassword}
              onShowPassword={() => setShowPassword((current) => !current)}
              onBack={() => (resetStep === "reset" ? setResetStep("address") : open_view("home"))}
              onChange={update}
              onCodeChange={(next) => updateCode("resetCode", next)}
              onSubmit={submitForgot}
            />
          )}

          {view === "success" && <SuccessView message={successMessage} onReset={resetInterface} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HomeView({
  onGoogle,
  onApple,
  onEmail,
  onForgot,
}: {
  onGoogle: () => void;
  onApple: () => void;
  onEmail: () => void;
  onForgot: () => void;
}) {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Accès Bysis</p>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-neutral-900">
          Se connecter ou s'inscrire
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-neutral-500">
          Choisissez votre méthode préférée pour accéder à Bysis.
        </p>
      </div>

      <div className="space-y-3">
        <PrimaryAppleButton onClick={onApple}>
          Continuer avec Apple
        </PrimaryAppleButton>
        <SecondaryButton icon={<GoogleIcon />} onClick={onGoogle}>
          Continuer avec Google
        </SecondaryButton>
        <SecondaryButton onClick={onEmail}>Se connecter ou s'inscrire</SecondaryButton>
      </div>

      <button
        type="button"
        onClick={onForgot}
        className="mt-6 w-full text-center text-[13px] font-medium text-neutral-600 transition hover:text-neutral-900"
      >
        Mot de passe oublié ?
      </button>
    </div>
  );
}

function ProviderView({
  title,
  description,
  icon,
  children,
  loading,
  onBack,
  onContinue,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
  loading: boolean;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="w-full">
      <BackButton onClick={onBack} />

      <div className="mt-6 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-neutral-900 ring-1 ring-neutral-200">
        {icon}
      </div>

      <h2 className="text-[24px] font-bold leading-tight tracking-tight text-neutral-900">{title}</h2>
      <p className="mt-2 text-[14px] leading-6 text-neutral-500">{description}</p>

      {children}

      <PrimaryBlueButton className="mt-7" loading={loading} onClick={onContinue}>
        Autoriser et continuer
      </PrimaryBlueButton>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 h-12 w-full rounded-full border border-neutral-200 bg-white text-[14px] font-medium text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-900"
      >
        Choisir une autre méthode
      </button>
    </div>
  );
}

function EmailView({
  step,
  values,
  errors,
  loading,
  onBack,
  onChange,
  onCodeChange,
  onSubmit,
}: {
  step: EmailStep;
  values: Values;
  errors: Errors;
  loading: boolean;
  onBack: () => void;
  onChange: (field: Field, value: string) => void;
  onCodeChange: (next: string[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="w-full">
      <BackButton onClick={onBack} />

      <div className="mt-5 mb-6">
        <h2 className="text-[24px] font-bold leading-tight tracking-tight text-neutral-900">
          {step === "address" ? "Inscription par e-mail" : "Vérifiez votre e-mail"}
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-neutral-500">
          {step === "address"
            ? "Recevez un code unique pour activer votre accès."
            : `Entrez le code envoyé à ${values.email}.`}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {step === "address" ? (
          <TextField
            label="Adresse e-mail"
            value={values.email}
            error={errors.email}
            onChange={(value) => onChange("email", value)}
            placeholder="nom@domaine.com"
            type="email"
          />
        ) : (
          <OtpInput value={values.emailCode} error={errors.emailCode} onChange={onCodeChange} />
        )}

        <PrimaryBlueButton type="submit" loading={loading}>
          {step === "address" ? "Recevoir un code" : "Vérifier le code"}
        </PrimaryBlueButton>
      </form>
    </div>
  );
}

function ForgotView({
  step,
  values,
  errors,
  loading,
  showPassword,
  onShowPassword,
  onBack,
  onChange,
  onCodeChange,
  onSubmit,
}: {
  step: ResetStep;
  values: Values;
  errors: Errors;
  loading: boolean;
  showPassword: boolean;
  onShowPassword: () => void;
  onBack: () => void;
  onChange: (field: Field, value: string) => void;
  onCodeChange: (next: string[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="w-full">
      <BackButton onClick={onBack} />

      <div className="mt-5 mb-6">
        <h2 className="text-[24px] font-bold leading-tight tracking-tight text-neutral-900">
          {step === "address" ? "Réinitialiser l'accès" : "Nouveau mot de passe"}
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-neutral-500">
          {step === "address"
            ? "Recevez un code de récupération sur l'adresse liée à votre compte."
            : `Confirmez le code envoyé à ${values.forgotEmail}.`}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {step === "address" ? (
          <TextField
            label="Adresse du compte"
            value={values.forgotEmail}
            error={errors.forgotEmail}
            onChange={(value) => onChange("forgotEmail", value)}
            placeholder="nom@domaine.com"
            type="email"
          />
        ) : (
          <>
            <OtpInput value={values.resetCode} error={errors.resetCode} onChange={onCodeChange} />
            <TextField
              label="Nouveau mot de passe"
              value={values.newPassword}
              error={errors.newPassword}
              onChange={(value) => onChange("newPassword", value)}
              placeholder="8 caractères minimum"
              type={showPassword ? "text" : "password"}
              trailing={
                <button
                  type="button"
                  onClick={onShowPassword}
                  className="text-neutral-400 transition hover:text-neutral-700"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
          </>
        )}

        <PrimaryBlueButton type="submit" loading={loading}>
          {step === "address" ? "Envoyer un code" : "Mettre à jour"}
        </PrimaryBlueButton>
      </form>
    </div>
  );
}

function SuccessView({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="flex w-full flex-col items-center py-6 text-center">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0066FF] shadow-[0_0_40px_rgba(0,102,255,.35)]">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#0066FF]/25" />
        <CheckIcon />
      </div>
      <h2 className="text-[24px] font-bold leading-tight tracking-tight text-neutral-900">Accès confirmé</h2>
      <p className="mt-2 max-w-xs text-[14px] leading-6 text-neutral-500">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 h-12 rounded-full border border-neutral-200 bg-white px-6 text-[14px] font-medium text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-900"
      >
        Revenir à l'accueil
      </button>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-neutral-500 transition hover:text-neutral-900"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </span>
      Retour
    </button>
  );
}

function PrimaryBlueButton({
  children,
  loading,
  type = "button",
  onClick,
  className = "",
}: {
  children: ReactNode;
  loading: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`group relative flex h-[54px] w-full items-center justify-center overflow-hidden rounded-full bg-[#0066FF] px-6 text-[15px] font-semibold tracking-tight text-white shadow-[0_8px_24px_-8px_rgba(0,102,255,.45)] transition duration-200 hover:bg-[#0052CC] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75 ${className}`}
    >
      <span className="relative flex items-center gap-2">
        {loading && <Spinner />}
        {loading ? "Veuillez patienter" : children}
      </span>
    </button>
  );
}

function PrimaryAppleButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 text-[15px] font-semibold tracking-tight text-white transition duration-200 hover:bg-black active:scale-[0.99]"
    >
      <AppleIcon />
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  icon,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 text-[15px] font-semibold tracking-tight text-neutral-900 transition duration-200 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.99]"
    >
      {icon}
      {children}
    </button>
  );
}

function TextField({
  label,
  value,
  error,
  onChange,
  placeholder,
  icon,
  type = "text",
  trailing,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: ReactNode;
  type?: string;
  trailing?: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{label}</label>
      <div
        className={`relative flex h-[54px] items-center rounded-2xl border bg-white px-4 transition ${
          error ? "border-red-500" : "border-neutral-200 focus-within:border-[#0066FF] focus-within:ring-4 focus-within:ring-[#0066FF]/10"
        }`}
      >
        {icon && <span className="mr-3 text-neutral-400">{icon}</span>}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          dir="ltr"
          className="min-w-0 flex-1 bg-transparent text-left text-[15px] tracking-tight text-neutral-900 outline-none placeholder:text-neutral-400"
        />
        {trailing}
      </div>
      {error && <p className="mt-1.5 text-[12px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

function OtpInput({ value, error, onChange }: { value: string[]; error?: string; onChange: (next: string[]) => void }) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const filled = useMemo(() => value.filter(Boolean).length, [value]);

  const setDigit = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "").split("");
    const next = [...value];

    if (digits.length > 1) {
      digits.slice(0, 6 - index).forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      onChange(next);
      inputs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }

    next[index] = digits[0] ?? "";
    onChange(next);
    if (digits[0] && index < 5) inputs.current[index + 1]?.focus();
  };

  const onKey = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !value[index] && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  };

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Code de sécurité</label>
        <span className="text-[11px] text-neutral-400">{filled}/6</span>
      </div>
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {value.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputs.current[index] = node;
            }}
            value={digit}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => onKey(event, index)}
            inputMode="numeric"
            maxLength={1}
            dir="ltr"
            className={`h-[56px] rounded-2xl border bg-white text-center text-[18px] font-semibold tracking-[0.06em] text-neutral-900 outline-none transition sm:h-[60px] ${
              error ? "border-red-500" : digit ? "border-[#0066FF]/60" : "border-neutral-200 focus-within:border-[#0066FF] focus-within:ring-4 focus-within:ring-[#0066FF]/10"
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-[12px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.4-81.5-106-210.4-106-333.1 0-190.8 124.1-292.1 246.3-292.1 65 0 119.1 42.7 159.7 42.7 38.8 0 99.3-45.2 173.6-45.2 28 0 128.8 2.6 195.2 99.1zm-169.5-145c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.7 32.5-54.5 83.7-54.5 135.5 0 7.8.7 15.6 1.3 18.1 2.5.3 6.5.6 10.5.6 45.8 0 104.1-30.3 138.6-70.6z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c7 0 10 7 10 7a13.5 13.5 0 0 1-2.7 3.8" />
      <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
      <path d="M6.6 6.6C3.6 8.5 2 12 2 12s3 7 10 7c1.6 0 3-.4 4.2-1" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="relative h-9 w-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
    </svg>
  );
}
