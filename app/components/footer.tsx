import { MoveUpRight } from "lucide-react";
import { CtaSection } from "~/components/ctasection";
import LogoUrl from "~/assets/logo.svg";
import { useI18n } from "~/i18n";
import { usePublicWebsiteSettings } from "~/settings/usePublicWebsiteSettings";

export function Footer({ hideCta = false }: { hideCta?: boolean }) {
    const { t, dictionary } = useI18n();
    const website = usePublicWebsiteSettings();
    const capabilities = dictionary.footer.capabilitiesList as string[];
    const copyright = t("footer.copyright").replace("KWStudio", website.companyName);

    return (
        <>
            {hideCta ? null : <CtaSection />}

            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div>
                            <a href="/" className="footer-brand" aria-label={t("common.kwstudioHome")}>
                                <img src={website.logoUrl ?? LogoUrl} alt="" aria-hidden="true" />
                                <span>{website.companyName}</span>
                            </a>

                            <p className="footer-copy">{t("footer.copy")}</p>

                            <div className="footer-socials" aria-label={t("common.socialLinks")}>
                                <a href="#" aria-label="LinkedIn">in</a>
                                <a href="#" aria-label="X">X</a>
                                <a href="#" aria-label="Behance">Be</a>
                                <a href="#" aria-label="Instagram">ig</a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold">{t("footer.studio")}</h4>
                            <nav className="footer-links" aria-label={t("common.studioLinks")}>
                                <a href="#">{t("footer.about")}</a>
                                <a href="/services">{t("nav.services")}</a>
                                <a href="/work">{t("nav.work")}</a>
                                <a href="/process">{t("nav.process")}</a>
                                <a href="/contact">{t("nav.contact")}</a>
                            </nav>
                        </div>

                        <div>
                            <h4 className="font-bold">{t("footer.capabilities")}</h4>
                            <nav className="footer-links" aria-label={t("common.capabilityLinks")}>
                                {capabilities.map((item) => <a href="#" key={item}>{item}</a>)}
                            </nav>
                        </div>

                        <div>
                            <h4 className="font-bold">{t("footer.contact")}</h4>
                            <div className="footer-links">
                                <a href={`mailto:${website.contactEmail}`}>{website.contactEmail}</a>
                                <p>{website.address || t("footer.location")}</p>
                                <a href="/start-a-project" className="footer-project-link">{t("footer.footerCta")} <MoveUpRight size={16} /></a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>{copyright}</p>
                        <div>
                            <a href="#">{t("footer.privacy")}</a>
                            <a href="#">{t("footer.terms")}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
