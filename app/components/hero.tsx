import { MoveRight, MoveUpRight } from "lucide-react";
import LogoUrl from "~/assets/logo.svg";
import { useI18n } from "~/i18n";

export function Hero() {
    const { t, dictionary } = useI18n();
    const trustSignals = dictionary.home.hero.trust as string[];
    const specs = dictionary.home.hero.specs as string[];

    return (
        <section className="hero">
            <div className="container hero-inner">
                <div className="hero-copy">
                    <span className="eyebrow">{t("home.hero.eyebrow")}</span>
                    <h1>{t("home.hero.titleBefore")} <span>{t("home.hero.titleAccent")}</span></h1>
                    <p>{t("home.hero.subtitle")}</p>

                    <div className="hero-actions">
                        <a href="/start-a-project" className="btn btn-primary">
                            {t("common.startProject")} <MoveUpRight size={20} />
                        </a>

                        <a href="/work" className="btn btn-ghost">
                            {t("home.hero.viewWork")} <MoveRight size={20} />
                        </a>
                    </div>

                    <div className="hero-trust" aria-label={t("common.qualitySignals")}>
                        {trustSignals.map((signal) => <span key={signal}>{signal}</span>)}
                    </div>
                </div>

                <div className="hero-visual" aria-hidden="true">
                    <img className="hero-watermark" src={LogoUrl} alt="" aria-hidden="true" />
                    <div className="hero-panel">
                        <div className="hero-panel-top">
                            <span>KWStudio</span>
                            <span>{t("home.hero.panelTop")}</span>
                        </div>

                        <div className="hero-browser">
                            <div className="hero-browser-nav">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className="hero-browser-grid">
                                <div>
                                    <span className="hero-mini-label">{t("home.hero.miniLabel")}</span>
                                    <strong>{t("home.hero.miniTitle")}</strong>
                                </div>
                                <div className="hero-metric">
                                    <span>{t("home.hero.metricLabel")}</span>
                                    <strong>01</strong>
                                </div>
                            </div>
                            <div className="hero-lines">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className="hero-annotation">
                                <span>{t("home.hero.noteLabel")}</span>
                                <p>{t("home.hero.noteText")}</p>
                            </div>
                        </div>

                        <div className="hero-side-panel">
                            <span>{t("home.hero.buildSystem")}</span>
                            <strong>{t("home.hero.buildSystemValue")}</strong>
                        </div>

                        <div className="hero-specs">
                            {specs.map((spec) => <span key={spec}>{spec}</span>)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
