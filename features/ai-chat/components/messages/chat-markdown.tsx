"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Components } from "react-markdown";

const REMARK_PLUGINS = [remarkGfm];

const BORDER = { borderColor: "var(--ac-color-border)" };

const COMPONENTS: Components = {
  p: ({ children }) => <div className="my-3 first:mt-0 last:mb-0">{children}</div>,
  h1: ({ children }) => <h1 className="mt-5 mb-2 text-xl font-semibold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-5 mb-2 text-lg font-semibold first:mt-0">{children}</h2>,
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => <h4 className="mt-3 mb-1 text-sm font-semibold first:mt-0">{children}</h4>,
  ul: ({ children }) => <ul className="my-2 list-disc ps-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal ps-6">{children}</ol>,
  li: ({ children }) => <li className="my-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="mx-0 my-3 border-s-4 ps-3"
      style={{ ...BORDER, color: "var(--ac-color-text-secondary)" }}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-t" style={BORDER} />,
  pre: ({ children }) => (
    <pre
      className="my-3 overflow-x-auto rounded-lg p-3 text-[13px] leading-5 [&_code]:bg-transparent! [&_code]:p-0 [&_code]:text-inherit"
      style={{
        background: "var(--ac-color-bg-spotlight)",
        color: "var(--ac-color-text-light-solid)",
      }}
    >
      {children}
    </pre>
  ),
  code: ({ className, children }) => (
    <code
      className={`rounded bg-[var(--ac-color-fill-tertiary)] px-1 py-0.5 font-mono text-[13px] ${className ?? ""}`}
    >
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-start">{children}</table>
    </div>
  ),
  th: ({ style, children }) => (
    <th
      style={{ ...style, ...BORDER, background: "var(--ac-color-fill-tertiary)" }}
      className="border px-3 py-1.5 font-semibold"
    >
      {children}
    </th>
  ),
  td: ({ style, children }) => (
    <td style={{ ...style, ...BORDER }} className="border px-3 py-1.5 align-top">
      {children}
    </td>
  ),
};

/** Nội dung trả lời của agent: markdown kiểu GFM (bảng, danh sách việc, gạch ngang...). */
export function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="break-words">
      <Markdown remarkPlugins={REMARK_PLUGINS} components={COMPONENTS}>
        {content}
      </Markdown>
    </div>
  );
}
