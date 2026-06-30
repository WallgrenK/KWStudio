import { useI18n } from "~/i18n";

export function TrustedBy() {
  const { t } = useI18n();
  const trustedBy = [
    "Polio House",
    "Northbound",
    "Maison Vala",
    "Mosswork",
    "Atrium",
    "Ledder & Co.",
  ];
  return (
    <section className="logo-strip">
      <div className="logo-strip-inner max-w-7xl mx-auto">
        <p className="logo-strip-label">{t("home.trustedBy.label")}</p>
        <div className="logo-strip-logos" aria-label={t("home.trustedBy.aria")}>
          {trustedBy.map((company) => (
            <span key={company}>{company}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
