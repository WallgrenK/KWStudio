import { useEffect, useState } from "react";
import { CtaSection } from "~/components/ctasection";
import { Footer } from "~/components/footer";
import { JsonLd } from "~/components/jsonld";
import { MoveRight } from "lucide-react";
import { Navigation } from "~/components/navigation";
import { PageHero } from "~/components/pagehero";
import { ProjectCard } from "~/components/projectcard";
import { SectionHeader } from "~/components/sectionheader";
import { projects as conceptProjects } from "~/data/projects";
import { useI18n } from "~/i18n";
import { breadcrumbSchema, buildMeta, webPageSchema } from "~/lib/seo";
import { supabase } from "~/utils/supabase";

const pageTitle = "Website Concepts & Case Studies | KWStudio";
const pageDescription =
    "View KWStudio website concepts, case studies and premium website design directions built around trust, clarity and conversion.";

export function meta() {
    // TODO: Future locale-aware metadata generation.
    // TODO: Future localized routing support. Example: /en/work and /sv/projekt.
    return buildMeta({
        title: pageTitle,
        description: pageDescription,
        path: "/work",
    });
}

type Project = {
  id?: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  tags: string[] | null;
  image_url: string | null;
  featuredImage?: string | null;
  featured: boolean | null;
  published: boolean | null;
  created_at?: string;
};

function getConceptProjects(): Project[] {
    return conceptProjects.map((project, index) => ({
        id: project.slug,
        title: project.title,
        slug: project.slug,
        category: project.category,
        description: project.description,
        tags: project.tags,
        image_url: project.featuredImage,
        featuredImage: project.featuredImage,
        featured: index === 0,
        published: true,
        created_at: "",
    }));
}

export default function PortfolioPage() {
    const { t } = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const conceptPortfolio = getConceptProjects();
    const hasPublishedProjects = featuredProjects.length > 0 || projects.length > 0;
    const displayFeaturedProjects = hasPublishedProjects ? featuredProjects : conceptPortfolio.slice(0, 1);
    const displayProjects = hasPublishedProjects ? projects : conceptPortfolio.slice(1);
    const showSelectedProjects = !loading && displayProjects.length > 0;

    useEffect(() => {
        async function loadProjects() {
            try {
                const { data: featuredProjects } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("published", true)
                    .eq("featured", true)
                    .order("created_at", { ascending: false });

                if (featuredProjects) {
                    setFeaturedProjects(featuredProjects ?? []);
                }

                const { data: projects } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("published", true)
                    .eq("featured", false)
                    .order("created_at", { ascending: false });

                if (projects) {
                    setProjects(projects ?? []);
                }
            } finally {
                setLoading(false);
            }
        }

        loadProjects();
    }, []);

    return (
        <>
            <JsonLd
                data={[
                    webPageSchema({ path: "/work", title: pageTitle, description: pageDescription }),
                    breadcrumbSchema([
                        { name: t("nav.home"), path: "/" },
                        { name: t("nav.work"), path: "/work" },
                    ]),
                ]}
            />
            <Navigation />
            <main>
                <PageHero
                    eyebrow={t("work.hero.eyebrow")}
                    title={t("work.hero.title")}
                    text={t("work.hero.text")}
                />

                <section className="portfolio-proof-strip" aria-label={t("work.stats.aria")}>
                    <div className="container portfolio-proof-grid">
                        <article>
                            <span>{t("work.stats.strategy.value")}</span>
                            <p>{t("work.stats.strategy.label")}</p>
                        </article>
                        <article>
                            <span>{t("work.stats.build.value")}</span>
                            <p>{t("work.stats.build.label")}</p>
                        </article>
                        <article>
                            <span>{t("work.stats.focus.value")}</span>
                            <p>{t("work.stats.focus.label")}</p>
                        </article>
                    </div>
                </section>

                <section className="page-section featured-work-page">
                    <div className="container">
                        <div className="portfolio-section-heading">
                            <SectionHeader
                                eyebrow={t("work.featured.eyebrow")}
                                title={t("work.featured.title")}
                                text={t("work.featured.text")}
                            />
                            <p>{t("work.featured.note")}</p>
                        </div>

                        {loading ? (
                            <div className="portfolio-loading-grid" aria-live="polite">
                                <span>{t("work.loading")}</span>
                                <span />
                            </div>
                        ) : displayFeaturedProjects.length > 0 ? (
                            <div className="featured-showcase-list">
                                {displayFeaturedProjects.map((project, index) => (
                                    <a className="featured-project-showcase" href={`/work/${project.slug}`} key={project.slug}>
                                        {project.image_url ? (
                                            <img
                                                src={project.image_url}
                                                alt={`${project.title} ${project.category ?? "project"} ${t("work.card.preview")}`}
                                                loading={index === 0 ? "eager" : "lazy"}
                                            />
                                        ) : (
                                            <div className="project-card-placeholder" aria-hidden="true" />
                                        )}
                                        <div className="featured-project-showcase-copy">
                                            <div>
                                                {project.category ? <p>{project.category}</p> : null}
                                                <h3>{project.title}</h3>
                                                {project.description ? <span>{project.description}</span> : null}
                                            </div>
                                            <strong>
                                                {t("common.viewProject")} <MoveRight size={18} aria-hidden="true" />
                                            </strong>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="portfolio-empty-state">
                                <p>{t("work.empty")}</p>
                            </div>
                        )}
                    </div>
                </section>

                {showSelectedProjects ? (
                    <section className="page-section selected-projects-page">
                        <div className="container">
                            <SectionHeader
                                eyebrow={t("work.selected.eyebrow")}
                                title={t("work.selected.title")}
                                text={t("work.selected.text")}
                            />
                            <div className="project-grid-page">
                                {displayProjects.map((project) => (
                                    <ProjectCard key={project.id ?? project.slug} project={project} />
                                ))}
                            </div>
                        </div>
                    </section>
                ) : null}

                <section className="page-section portfolio-method">
                    <div className="container portfolio-method-inner">
                        <SectionHeader
                            eyebrow={t("work.method.eyebrow")}
                            title={t("work.method.title")}
                            text={t("work.method.text")}
                        />
                        <div className="portfolio-method-list">
                            <article>
                                <span>01</span>
                                <h3>{t("work.method.items.0.title")}</h3>
                                <p>{t("work.method.items.0.text")}</p>
                            </article>
                            <article>
                                <span>02</span>
                                <h3>{t("work.method.items.1.title")}</h3>
                                <p>{t("work.method.items.1.text")}</p>
                            </article>
                            <article>
                                <span>03</span>
                                <h3>{t("work.method.items.2.title")}</h3>
                                <p>{t("work.method.items.2.text")}</p>
                            </article>
                        </div>
                    </div>
                </section>

                <CtaSection />
            </main>
            <Footer hideCta />
        </>
    );
}
