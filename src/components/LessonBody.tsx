import type { ReactNode } from "react";

/** **bold** inside a line. */
function inline(line: string): ReactNode[] {
  return line.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

/** Lesson text: lines starting with "- " are bullet points, other lines are paragraphs. */
export function LessonBody({ body }: { body: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={blocks.length} className="list-disc space-y-1 pl-5">
          {bullets.map((b, i) => (
            <li key={i}>{inline(b)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
    } else {
      flush();
      if (line) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
    }
  }
  flush();
  return <div className="space-y-2 text-slate-800">{blocks}</div>;
}
