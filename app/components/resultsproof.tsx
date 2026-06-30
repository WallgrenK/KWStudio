import { useI18n } from "~/i18n";

export function ResultsProof() {
    const { t, dictionary } = useI18n();
    const principles = dictionary.home.proof.principles as string[];

    return (
        <section className="dark-section">
            <div className="container dark-section-inner">
                <div className="dark-section-copy">
                    <p className="eyebrow">{t("home.proof.eyebrow")}</p>
                    <h2>{t("home.proof.title")}</h2>
                    <p>{t("home.proof.text")}</p>
                </div>

                <div className="dark-section-grid">
                    {principles.map((principle, index) => (
                        <article key={principle} className="proof-item">
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <h3>{principle}</h3>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
