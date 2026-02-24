"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ReactNode } from "react"

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function getTextContent(children: ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map(getTextContent).join("")
  if (children && typeof children === "object" && "props" in children) {
    return getTextContent((children as { props: { children: ReactNode } }).props.children)
  }
  return ""
}

interface GuideMDXContentProps {
  content: string
}

export function GuideMDXContent({ content }: GuideMDXContentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold tracking-tight mb-6">{children}</h1>
          ),
          h2: ({ children }) => {
            const id = slugify(getTextContent(children))
            return (
              <h2 id={id} className="text-2xl font-semibold tracking-tight mt-10 mb-4 border-b pb-2 scroll-mt-24">
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const id = slugify(getTextContent(children))
            return (
              <h3 id={id} className="text-xl font-semibold tracking-tight mt-8 mb-3 scroll-mt-24">
                {children}
              </h3>
            )
          },
          p: ({ children }) => (
            <p className="leading-7 mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-4 border-primary pl-6 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 w-full overflow-auto">
              <table className="w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  {children}
                </code>
              )
            }
            return (
              <code className="block bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-lg bg-muted p-4">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-8 border-border" />,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          a: ({ href, children }) => {
            const resolvedHref = href?.replace(/^\/conhecimento\//, "/guias/")
            return (
              <a
                href={resolvedHref}
                className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                target={resolvedHref?.startsWith("http") ? "_blank" : undefined}
                rel={resolvedHref?.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
