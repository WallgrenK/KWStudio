import { MoveRight } from "lucide-react";
import { useI18n } from "~/i18n";

const projectImages = [
    {
        client: "Palo House",
        image: "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?auto=format&fit=crop&w=900&q=80",
    },
    {
        client: "Northbound",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    },
    {
        client: "Maison Vala",
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
    },
];

export function SelectedWork() {
    const { t, dictionary } = useI18n();
    const projects = (dictionary.home.selectedWork.projects as Array<{ client: string; title: string; labels: string[] }>)
        .map((project, index) => ({ ...project, image: projectImages[index]?.image ?? "" }));

    return (
        <section id="work" className="selected-work section">
            <div className="container">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">{t("home.selectedWork.eyebrow")}</p>
                        <h2>{t("home.selectedWork.title")}</h2>
                        <p className="section-subtitle">{t("home.selectedWork.subtitle")}</p>
                    </div>

                    <a href="/work" className="section-link">
                        {t("home.selectedWork.link")} <MoveRight size={18} />
                    </a>
                </div>

                <div className="work-grid">
                    {projects.map((project) => (
                        <article className="work-card" key={project.client}>
                            <img src={project.image} alt={`${project.client} ${t("home.selectedWork.preview")}`} />
                            <div className="work-card-content">
                                <p>{project.client}</p>
                                <h3>{project.title}</h3>
                                <div className="work-labels">
                                    {project.labels.map((label) => (
                                        <span key={label}>{label}</span>
                                    ))}
                                </div>
                                <MoveRight size={18} aria-hidden="true" />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
