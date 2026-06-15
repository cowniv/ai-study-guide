import { createElement, Fragment, type ReactNode } from "react";

/** Inline **bold**, _italic_ and `code`. No HTML is ever injected. */
function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("_") && p.endsWith("_") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2)
      return (
        <code key={i} className="rounded bg-stone-100 px-1 text-[0.9em]">
          {p.slice(1, -1)}
        </code>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}

/** A tiny Markdown renderer for streamed text: headings, lists, paragraphs. */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={blocks.length} className="ml-5 list-disc space-y-1">
          {list.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const li = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)/);
    if (li) {
      list.push(li[1]);
      continue;
    }
    flush();
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      const cls = h[1].length === 1 ? "text-xl" : h[1].length === 2 ? "text-lg" : "text-base";
