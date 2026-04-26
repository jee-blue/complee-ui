import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Check, Info, Lightbulb, Scale, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Chrome } from "@/components/complee/Chrome";
import { useAssessment } from "@/store/assessment";
import {
  REGULATORS,
  getRegulatorByCountry,
  type CountryCode,
  type InstitutionType,
} from "@/data/requirements";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Company profile — Complee" }] }),
  component: Profile,
});

const SERVICE_GROUPS: { title: string; description: string; options: string[] }[] = [
  {
    title: "Money & accounts",
    description: "Core financial products you offer to customers.",
    options: ["E-money issuance", "Payment accounts", "Safeguarded customer funds"],
  },
  {
    title: "Payments & cards",
    description: "How money moves in and out of your platform.",
    options: ["Card issuing", "Payment initiation", "Cross-border transfers", "Merchant acquiring"],
  },
  {
    title: "Open banking",
    description: "Data and account access services.",
    options: ["Account information"],
  },
];

const INSTITUTION_TYPES: { value: InstitutionType; label: string }[] = [
  { value: "EMI", label: "E-Money Institution (EMI)" },
  { value: "Small EMI", label: "Small EMI" },
  { value: "PI", label: "Payment Institution (PI)" },
  { value: "AISP", label: "Account Information Service Provider (AISP)" },
];

const REGULATION_GROUPS: { title: string; description: string; options: string[] }[] = [
  {
    title: "Payments regulation",
    description: "Core frameworks governing payment services and electronic money.",
    options: ["PSD2", "PSD3 / PSR", "SCA / RTS", "EMD2"],
  },
  {
    title: "Operational resilience",
    description: "ICT risk, incident reporting, and third-party controls.",
    options: ["DORA", "ICT risk controls", "Incident reporting"],
  },
  {
    title: "Financial crime",
    description: "Anti-money laundering and customer due diligence.",
    options: ["AMLD6", "MLR 2017", "KYC / CDD"],
  },
  {
    title: "Data & consumer",
    description: "Data protection and consumer-facing obligations.",
    options: ["GDPR", "Consumer Duty", "Outsourcing / TPR"],
  },
];

// Lightweight service → regulation suggestions
const SERVICE_TO_REG_HINTS: Record<string, string[]> = {
  "Payment initiation": ["PSD3 / PSR", "SCA / RTS"],
  "Account information": ["PSD2", "PSD3 / PSR"],
  "Cross-border transfers": ["PSD3 / PSR", "DORA"],
  "Card issuing": ["SCA / RTS", "PSD2"],
  "E-money issuance": ["EMD2", "PSD2"],
  "Safeguarded customer funds": ["EMD2"],
  "Merchant acquiring": ["PSD2", "SCA / RTS"],
  "Payment accounts": ["PSD2", "GDPR"],
};

function Profile() {
  const navigate = useNavigate();
  const {
    profile,
    selectedServices,
    selectedRegulations,
    setCompanyName,
    setHomeCountry,
    setTargetCountry,
    setInstitutionType,
    toggleService,
    toggleRegulation,
  } = useAssessment();
  const home = getRegulatorByCountry(profile.homeCountry);
  const target = getRegulatorByCountry(profile.targetCountry);
  const sameCountry = profile.homeCountry === profile.targetCountry;
  const canContinue =
    !sameCountry &&
    selectedServices.length > 0 &&
    selectedRegulations.length > 0 &&
    profile.companyName.trim().length > 0;

  // Suggested regulations based on selected services (not yet picked)
  const suggestedRegulations = useMemo(() => {
    const set = new Set<string>();
    selectedServices.forEach((svc) => {
      (SERVICE_TO_REG_HINTS[svc] ?? []).forEach((r) => {
        if (!selectedRegulations.includes(r)) set.add(r);
      });
    });
    return Array.from(set);
  }, [selectedServices, selectedRegulations]);

  const handleContinue = () => {
    if (sameCountry) {
      toast.error("Choose a different target country.");
      return;
    }
    if (selectedServices.length === 0) {
      toast.error("Select at least one service to assess.");
      return;
    }
    if (selectedRegulations.length === 0) {
      toast.error("Select at least one regulation to scope the assessment.");
      return;
    }
    navigate({ to: "/documents" });
  };

  return (
    <Chrome>
      <div className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-16 sm:pb-20">
        {/* Context header */}
        <div className="mb-16 sm:mb-20">
          <p className="text-[12px] uppercase tracking-[0.16em] text-brand font-semibold mb-6">
            Step 1 of 4 — Company scope
          </p>
          <h1 className="text-[32px] sm:text-[42px] font-semibold tracking-tight text-navy leading-[1.15]">
            Tell us about your company
          </h1>
          <p className="mt-7 sm:mt-8 text-[16px] sm:text-[17px] text-muted-foreground max-w-[620px] leading-relaxed">
            We'll use this to scope the regulatory requirements that apply to your expansion.
            Pre-filled with the FlowPay demo — adjust any field to match your business.
          </p>
        </div>

        {/* Profile section */}
        <section className="mb-12 sm:mb-14">
          <SectionHeader
            icon={<Building2 className="h-4 w-4" />}
            title="Company profile"
            description="The basics about your business and where you operate."
          />
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Field label="Company name">
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. FlowPay"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3.5 text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                />
              </Field>

              <Field label="Institution type">
                <select
                  value={profile.institutionType}
                  onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3.5 text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                >
                  {INSTITUTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Home country" hint="Where you're licensed today.">
                <select
                  value={profile.homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value as CountryCode)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3.5 text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                >
                  {REGULATORS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.flag} {r.country} — {r.authority}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Target country" hint="Where you want to expand.">
                <select
                  value={profile.targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value as CountryCode)}
                  className={`w-full h-11 rounded-lg border bg-background px-3.5 text-[14px] outline-none focus:ring-2 transition ${
                    sameCountry
                      ? "border-danger focus:border-danger focus:ring-danger/20"
                      : "border-input focus:border-brand focus:ring-brand/20"
                  }`}
                >
                  {REGULATORS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.flag} {r.country} — {r.authority}
                    </option>
                  ))}
                </select>
                {sameCountry && (
                  <p className="mt-2 text-[12px] text-danger">
                    Choose a different target country to run an expansion assessment.
                  </p>
                )}
              </Field>
            </div>
          </div>
        </section>

        {/* Services section */}
        <section className="mb-12 sm:mb-14">
          <SectionHeader
            icon={<Check className="h-4 w-4" />}
            title="Services offered"
            description="Select everything you provide today — we'll map each to its regulatory obligations."
            badge={
              selectedServices.length > 0
                ? `${selectedServices.length} selected`
                : "None selected"
            }
            badgeActive={selectedServices.length > 0}
          />
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8 space-y-7">
            {SERVICE_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-3">
                  <h3 className="text-[13px] font-semibold text-navy uppercase tracking-[0.06em]">
                    {group.title}
                  </h3>
                  <p className="text-[12.5px] text-muted-foreground mt-0.5">
                    {group.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.options.map((opt) => {
                    const active = selectedServices.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleService(opt)}
                        className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all text-[13.5px] ${
                          active
                            ? "bg-brand-soft/60 border-brand text-navy shadow-sm"
                            : "bg-card border-border text-foreground hover:border-brand/50 hover:bg-muted/30"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors shrink-0 ${
                            active
                              ? "bg-brand border-brand text-white"
                              : "border-border bg-background"
                          }`}
                        >
                          {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                        <span className="font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Regulations section */}
        <section className="mb-12 sm:mb-14">
          <SectionHeader
            icon={<Scale className="h-4 w-4" />}
            title="Regulations in scope"
            description="Choose the frameworks you want assessed against. Your services and target country drive what's recommended."
            badge={
              selectedRegulations.length > 0
                ? `${selectedRegulations.length} selected`
                : "None selected"
            }
            badgeActive={selectedRegulations.length > 0}
          />

          {suggestedRegulations.length > 0 && (
            <div className="mb-3 rounded-xl border border-brand/20 bg-brand-soft/30 p-3.5 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-brand mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-navy mb-1.5">
                  <span className="font-semibold">Suggested for your services:</span> based on
                  what you selected, these frameworks usually apply.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedRegulations.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRegulation(r)}
                      className="inline-flex items-center gap-1 rounded-full bg-card border border-brand/30 text-brand text-[12px] font-medium px-2.5 py-1 hover:bg-brand hover:text-white transition-colors"
                    >
                      + {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8 space-y-7">
            {REGULATION_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-3">
                  <h3 className="text-[13px] font-semibold text-navy uppercase tracking-[0.06em]">
                    {group.title}
                  </h3>
                  <p className="text-[12.5px] text-muted-foreground mt-0.5">
                    {group.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.options.map((opt) => {
                    const active = selectedRegulations.includes(opt);
                    const enabled = opt === "PSD3 / PSR";
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => enabled && toggleRegulation(opt)}
                        disabled={!enabled}
                        aria-disabled={!enabled || undefined}
                        title={!enabled ? "Coming soon" : undefined}
                        className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all text-[13.5px] ${
                          active
                            ? "bg-brand-soft/60 border-brand text-navy shadow-sm"
                            : enabled
                              ? "bg-card border-border text-foreground hover:border-brand/50 hover:bg-muted/30"
                              : "bg-muted/30 border-border text-muted-foreground cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors shrink-0 ${
                            active
                              ? "bg-brand border-brand text-white"
                              : "border-border bg-background"
                          }`}
                        >
                          {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                        <span className="font-medium flex-1">{opt}</span>
                        {!enabled && (
                          <span className="text-[10.5px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
                            Soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contextual guidance */}
        {home && target && !sameCountry && (
          <div className="mb-10 rounded-2xl border border-brand/20 bg-brand-soft/40 p-5 sm:p-6 flex gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand shrink-0">
              <Lightbulb className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[13px] font-semibold text-navy uppercase tracking-[0.06em]">
                Did you know?
              </p>
              <p className="text-[14px] leading-relaxed text-navy">
                Expanding from{" "}
                <span className="font-semibold">
                  {home.flag} {home.country}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {target.flag} {target.country}
                </span>{" "}
                typically takes <span className="font-semibold">12–18 months</span> and{" "}
                <span className="font-semibold">€200–500k</span> in advisory fees. Complee
                compresses the readiness assessment into about 5 minutes.
              </p>
            </div>
          </div>
        )}

        {/* CTA bar */}
        <div className="flex items-center justify-end gap-4 flex-wrap pt-2">
          {!canContinue && (
            <span className="text-[12.5px] text-muted-foreground hidden sm:inline">
              {sameCountry
                ? "Pick a different target country"
                : selectedServices.length === 0
                  ? "Select at least one service"
                  : selectedRegulations.length === 0
                    ? "Select at least one regulation"
                    : "Add a company name"}
            </span>
          )}
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            aria-disabled={!canContinue || undefined}
            className="inline-flex items-center gap-2 rounded-lg bg-navy text-navy-foreground px-5 py-3 min-h-[44px] text-[14px] font-semibold hover:bg-navy/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Continue to documents
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Chrome>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  badge,
  badgeActive,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeActive?: boolean;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 flex-wrap">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-brand mt-0.5">
          {icon}
        </span>
        <div>
          <h2 className="text-[16px] font-semibold text-navy leading-tight">{title}</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {badge && (
        <span
          className={`text-[12px] font-medium px-2.5 py-1 rounded-full border ${
            badgeActive
              ? "bg-brand-soft/60 border-brand/30 text-brand"
              : "bg-muted/50 border-border text-muted-foreground"
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-navy mb-1.5 uppercase tracking-[0.06em]">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
          <Info className="h-3 w-3" aria-hidden="true" />
          {hint}
        </span>
      )}
    </label>
  );
}
