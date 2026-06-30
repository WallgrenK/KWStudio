import LogoUrl from "~/assets/logo.svg";
import { useI18n } from "~/i18n";

export function BuiltByFounder() {
    const { t, dictionary } = useI18n();
    const body = dictionary.home.founder.body as string[];
    const details = dictionary.home.founder.details as string[];

    return (
        <section className="built-by-kim">
            <div className="container built-by-kim-inner">
                <div className="kim-mark" aria-hidden="true">
                    <img src={LogoUrl} alt="" aria-hidden="true" />
                    <span>{t("home.founder.mark")}</span>
                </div>

                <div className="kim-copy">
                    <p className="eyebrow">{t("home.founder.eyebrow")}</p>
                    <h2>{t("home.founder.title")}</h2>
                    <div className="kim-body">
                        {body.map((item) => <p key={item}>{item}</p>)}
                    </div>
                </div>

                <ul className="kim-list">
                    {details.map((detail) => (
                        <li key={detail}>{detail}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
