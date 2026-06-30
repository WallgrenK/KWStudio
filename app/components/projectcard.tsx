import { MoveRight } from "lucide-react";
import { useI18n } from "~/i18n";

type Project = {
  id?: string;
  slug: string;
  title: string;
  category?: string | null;
  description?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  featuredImage?: string | null;
};

export function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const { t } = useI18n();
  const image = project.image_url ?? project.featuredImage ?? "";
  const category = project.category ?? t("work.card.fallbackCategory");
  const description = project.description ?? "";
  const tags = project.tags ?? [];

  return (
    <a
      href={`/work/${project.slug}`}
      className={featured ? "project-card project-card-featured" : "project-card"}
    >
      {image ? (
        <img
          src={image}
          alt={`${project.title} ${category} ${t("work.card.preview")}`}
          loading="lazy"
        />
      ) : (
        <div className="project-card-placeholder" aria-hidden="true" />
      )}

      <div className="project-card-content">
        <p>{category}</p>
        <h3>{project.title}</h3>
        <span>{description}</span>

        {featured && tags.length > 0 ? (
          <div className="project-card-proof">
            <small>{t("work.card.focus")}</small>
            <strong>{tags.slice(0, 2).join(" / ")}</strong>
          </div>
        ) : null}

        {!featured && tags.length > 0 ? (
          <div className="work-labels">
            {tags.map((tag) => (
              <em key={tag}>{tag}</em>
            ))}
          </div>
        ) : null}

        <MoveRight size={18} aria-hidden="true" />
      </div>
    </a>
  );
}
