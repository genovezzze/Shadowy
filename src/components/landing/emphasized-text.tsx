type EmphasizedTextProps = {
  text: string;
  phrases: readonly string[];
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function EmphasizedText({ text, phrases }: EmphasizedTextProps) {
  if (phrases.length === 0) return <>{text}</>;

  const orderedPhrases = [...phrases].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `(${orderedPhrases.map(escapeRegExp).join("|")})`,
    "gi",
  );
  const emphasized = new Set(
    orderedPhrases.map((phrase) => phrase.toLocaleLowerCase("lv-LV")),
  );

  return (
    <>
      {text.split(pattern).map((part, index) =>
        emphasized.has(part.toLocaleLowerCase("lv-LV")) ? (
          <strong
            key={`${part}-${index}`}
            className="font-bold text-white/82 [font-synthesis:weight]"
          >
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
