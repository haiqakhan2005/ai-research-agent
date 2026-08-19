import { Fragment, ReactNode } from "react";

function formatInline(line: string, keyPrefix: string): ReactNode[] {
  const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ivory">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={`${keyPrefix}-${i}`}
          className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[0.85em] text-facet-gold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{token}</Fragment>;
  });
}

/** Renders plain text with **bold**, `code`, and paragraph/line breaks — no HTML injection. */
export function formatMessageContent(text: string): ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, pIdx) => (
    <p key={pIdx} className={pIdx > 0 ? "mt-3" : undefined}>
      {para.split("\n").map((line, lIdx, arr) => (
        <Fragment key={lIdx}>
          {formatInline(line, `${pIdx}-${lIdx}`)}
          {lIdx < arr.length - 1 && <br />}
        </Fragment>
      ))}
    </p>
  ));
}
