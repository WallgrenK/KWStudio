type SectionHeaderProps = {
    eyebrow: string;
    title: string;
    text?: string;
};

export function SectionHeader({ eyebrow, title, text }: SectionHeaderProps) {
    return (
        <div className="shared-section-header">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            {text ? <p>{text}</p> : null}
        </div>
    );
}
