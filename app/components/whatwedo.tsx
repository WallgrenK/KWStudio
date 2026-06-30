import { Box, Code, Diamond, MoveRight, Rocket, Settings } from "lucide-react";
import { useI18n } from "~/i18n";

const serviceIcons = [Rocket, Code, Diamond, Box, Settings];

export function WhatWeDo() {
    const { t, dictionary } = useI18n();
    const services = (dictionary.home.whatWeDo.services as Array<{ title: string; text: string }>).map((service, index) => ({
        ...service,
        icon: serviceIcons[index],
        number: String(index + 1).padStart(2, "0"),
    }));

    return (
        <section id="services" className="what-we-do">
            <div className="container what-we-do-inner">
                <div className="service-intro">
                    <p className="eyebrow">{t("home.whatWeDo.eyebrow")}</p>
                    <h2>{t("home.whatWeDo.title").split("\n").map((line, index, lines) => (
                        <span key={line}>{line}{index < lines.length - 1 ? <br /> : null}</span>
                    ))}</h2>
                </div>

                <div className="service-grid">
                    {services.map((service) => {
                        const Icon = service.icon;

                        return (
                            <article className="service-card" key={service.title}>
                                <span className="service-number">{service.number}</span>
                                <Icon size={32} strokeWidth={1.8} />
                                <h3>{service.title}</h3>
                                <p>{service.text}</p>
                                <a href="/services" aria-label={`${t("home.whatWeDo.readMore")} ${service.title}`}>
                                    <MoveRight size={18} />
                                </a>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
