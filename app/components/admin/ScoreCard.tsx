type ScoreCardProps = {
  label: string;
  score: number;
  detail?: string;
};

export function ScoreCard({ label, score, detail }: ScoreCardProps) {
  const tone = score >= 90 ? "text-green-600" : score >= 80 ? "text-amber-600" : "text-red-600";

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{label}</h2>
          {detail ? <p className="mt-1 text-sm text-gray-500">{detail}</p> : null}
        </div>
        <strong className={`text-3xl font-bold ${tone}`}>{score}</strong>
      </div>
      <div className="mt-5 h-2 rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-kw-brand" style={{ width: `${score}%` }} />
      </div>
    </article>
  );
}
