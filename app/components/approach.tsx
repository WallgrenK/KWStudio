import { useI18n } from "~/i18n";

export function Approach() {
    const { t, dictionary } = useI18n();
    const steps = (dictionary.home.approach.steps as Array<{ title: string; text: string }>).map((step, index) => ({
        ...step,
        number: String(index + 1).padStart(2, "0"),
    }));

    return (
        <section id="process" className="approach">
            <div className="container approach-inner">
                <div className="approach-intro">
                    <p className="eyebrow">{t("home.approach.eyebrow")}</p>
                    <h2>{t("home.approach.title").split("\n").map((line, index, lines) => (
                        <span key={line}>{line}{index < lines.length - 1 ? <br /> : null}</span>
                    ))}</h2>
                </div>

                <div className="approach-grid">
                    {steps.map((step) => (
                        <article className="approach-step" key={step.number}>
                            <span>{step.number}</span>
                            <h3>{step.title}</h3>
                            <p>{step.text}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
