type FaqItem = {
    question: string;
    answer: string;
};

export function FaqList({ items }: { items: FaqItem[] }) {
    return (
        <div className="faq-list">
            {items.map((item) => (
                <details key={item.question}>
                    <summary>{item.question}</summary>
                    <div className="faq-answer">
                        <p>{item.answer}</p>
                    </div>
                </details>
            ))}
        </div>
    );
}
