import { useI18n } from "~/i18n";
import { interpolateBusinessIdentity } from "~/settings/interpolateBusinessIdentity";
import { getPortalBrandInitials } from "~/settings/portalHelpers";
import { usePublicWebsiteSettings } from "~/settings/usePublicWebsiteSettings";

export function MaintenancePage() {
  const { t } = useI18n();
  const website = usePublicWebsiteSettings();
  const brandInitials = getPortalBrandInitials(website.companyName);
  const identity = { companyName: website.companyName, contactEmail: website.contactEmail };
  const localize = (text: string) => interpolateBusinessIdentity(text, identity);

  return (
    <main className="maintenance-page" aria-labelledby="maintenance-title">
      <section className="maintenance-shell">
        <div className="maintenance-brand" aria-label={website.companyName}>
          <span>{brandInitials}</span>
          <strong>{website.companyName}</strong>
        </div>

        <div className="maintenance-content">
          <p className="eyebrow">{t("maintenance.eyebrow")}</p>
          <h1 id="maintenance-title">{t("maintenance.title")}</h1>
          <p>{localize(t("maintenance.body"))}</p>
          <p className="maintenance-secondary">
            {localize(t("maintenance.secondary"))}
          </p>
          <a className="btn btn-primary" href={`mailto:${website.contactEmail}`}>
            {localize(t("maintenance.button"))}
          </a>
        </div>

        <p className="maintenance-note">{t("maintenance.note")}</p>
      </section>
    </main>
  );
}
