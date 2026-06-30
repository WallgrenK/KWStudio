import { MoveUpRight } from "lucide-react";
import { useI18n } from "~/i18n";

type CtaSectionProps = {
    eyebrow?: string;
    title?: string;
    text?: string;
    href?: string;
    label?: string;
};

export function CtaSection({
    eyebrow,
    title,
    text,
    href = "/start-a-project",
    label,
}: CtaSectionProps) {
    const { t } = useI18n();

    return (
        <section id="contact" className="footer-cta">
            <div className="container footer-cta-inner">
                <div>
                    <p className="eyebrow">{eyebrow ?? t("cta.eyebrow")}</p>
                    <h2>{title ?? t("cta.title")}</h2>
                    <p className="footer-cta-copy">{text ?? t("cta.text")}</p>
                </div>

                <a href={href} className="btn btn-outline">
                    {label ?? t("cta.label")} <MoveUpRight size={18} />
                </a>
            </div>
        </section>
    );
}
