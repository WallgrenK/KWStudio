import LogoUrl from "~/assets/logo.svg";

type PageHeroProps = {
    eyebrow: string;
    title: string;
    text: string;
    dark?: boolean;
};

export function PageHero({ eyebrow, title, text, dark = false }: PageHeroProps) {
    return (
        <section className={dark ? "page-hero page-hero-dark" : "page-hero"}>
            <div className="container page-hero-inner">
                <div>
                    <p className="eyebrow">{eyebrow}</p>
                    <h1>{title}</h1>
                </div>
                <p>{text}</p>
                <img src={LogoUrl} alt="" aria-hidden="true" />
            </div>
        </section>
    );
}
