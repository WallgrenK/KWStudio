import { useI18n } from "~/i18n";

export function MaintenancePage() {
  const { t } = useI18n();

  return (
    <main className="maintenance-page" aria-labelledby="maintenance-title">
      <section className="maintenance-shell">
        <div className="maintenance-brand" aria-label="KWStudio">
          <span>KW</span>
          <strong>KWStudio</strong>
        </div>

        <div className="maintenance-content">
          <p className="eyebrow">{t("maintenance.eyebrow")}</p>
          <h1 id="maintenance-title">{t("maintenance.title")}</h1>
          <p>{t("maintenance.body")}</p>
          <p className="maintenance-secondary">
            {t("maintenance.secondary")}
          </p>
          <a className="btn btn-primary" href="mailto:hello@kwstudio.se">
            {t("maintenance.button")}
          </a>
        </div>

        <p className="maintenance-note">{t("maintenance.note")}</p>
      </section>
    </main>
  );
}
