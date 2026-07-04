/* eslint-disable @next/next/no-img-element */

import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

type PostDetailMarkdownProps = {
  content: string;
};

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizeCssLength(value: string) {
  const normalized = value.trim();

  if (/^\d+$/.test(normalized)) {
    return `${normalized}px`;
  }

  if (/^\d*\.?\d+(px|%|rem|em|vw|vh)$/.test(normalized)) {
    return normalized;
  }

  return null;
}

function parseImageAttributeBlock(attributeBlock: string) {
  const attributes = Array.from(
    attributeBlock.matchAll(/([a-zA-Z-]+)=(".*?"|'.*?'|[^\s]+)/g),
  );
  const imageAttributes: Record<string, string> = {};

  for (const [, rawKey, rawValue] of attributes) {
    const key = rawKey.toLowerCase();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (key === "width" || key === "height") {
      const normalized = normalizeCssLength(value);

      if (normalized) {
        imageAttributes[key] = normalized;
      }
    }
  }

  return imageAttributes;
}

function preprocessMarkdown(content: string) {
  return content.replaceAll(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\{([^}]+)\}/g,
    (_match, altText: string, src: string, title: string | undefined, attrs) => {
      const imageAttributes = parseImageAttributeBlock(attrs);
      const dataWidth = imageAttributes.width
        ? ` data-width="${escapeHtmlAttribute(imageAttributes.width)}"`
        : "";
      const dataHeight = imageAttributes.height
        ? ` data-height="${escapeHtmlAttribute(imageAttributes.height)}"`
        : "";
      const htmlTitle = title
        ? ` title="${escapeHtmlAttribute(title)}"`
        : "";

      return `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(altText)}"${htmlTitle}${dataWidth}${dataHeight} />`;
    },
  );
}

function getYoutubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const id = url.pathname.slice(1);

      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");

        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (url.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com${url.pathname}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "iframe"],
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className", /^language-[\w#+-]+$/],
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "width",
      "height",
      "align",
      "data-width",
      "data-height",
    ],
    div: [...(defaultSchema.attributes?.div ?? []), "align"],
    p: [...(defaultSchema.attributes?.p ?? []), "align"],
    span: [...(defaultSchema.attributes?.span ?? []), "align"],
    h1: [...(defaultSchema.attributes?.h1 ?? []), "align"],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "align"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "align"],
    h4: [...(defaultSchema.attributes?.h4 ?? []), "align"],
    h5: [...(defaultSchema.attributes?.h5 ?? []), "align"],
    h6: [...(defaultSchema.attributes?.h6 ?? []), "align"],
    blockquote: [...(defaultSchema.attributes?.blockquote ?? []), "align"],
    li: [...(defaultSchema.attributes?.li ?? []), "align"],
    td: [...(defaultSchema.attributes?.td ?? []), "align"],
    th: [...(defaultSchema.attributes?.th ?? []), "align"],
    iframe: [
      ["src", /^https:\/\/www\.youtube\.com\/embed\/[\w-]+(?:\?.*)?$/],
      "title",
      "width",
      "height",
      "allow",
      "allowFullScreen",
      "frameBorder",
      "referrerPolicy",
    ],
  },
};

const markdownComponents: Components = {
  a({ href, children, ...props }) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  },
  img({ src, alt, ...props }) {
    const rawProps = props as Record<string, unknown>;
    const dataWidth =
      typeof rawProps["data-width"] === "string"
        ? normalizeCssLength(rawProps["data-width"])
        : null;
    const dataHeight =
      typeof rawProps["data-height"] === "string"
        ? normalizeCssLength(rawProps["data-height"])
        : null;

    return (
      <img
        src={src ?? ""}
        alt={alt ?? ""}
        loading="lazy"
        {...props}
        style={{
          width: dataWidth ?? undefined,
          height: dataHeight ?? undefined,
        }}
      />
    );
  },
  iframe({ src, title }) {
    const embedUrl = typeof src === "string" ? getYoutubeEmbedUrl(src) : null;

    if (!embedUrl) {
      return null;
    }

    return (
      <span className="post-detail-youtube">
        <iframe
          src={embedUrl}
          title={typeof title === "string" ? title : "YouTube video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </span>
    );
  },
  p({ node, children, ...props }) {
    const firstChild = node?.children?.[0];
    const href =
      firstChild?.type === "element" &&
      firstChild.tagName === "a" &&
      typeof firstChild.properties?.href === "string"
        ? firstChild.properties.href
        : null;
    const isYoutubeOnlyParagraph =
      node?.children?.length === 1 &&
      href !== null;

    if (isYoutubeOnlyParagraph) {
      const embedUrl = getYoutubeEmbedUrl(href);

      if (embedUrl) {
        return (
          <span className="post-detail-youtube">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </span>
        );
      }
    }

    return <p {...props}>{children}</p>;
  },
};

export default function PostDetailMarkdown({
  content,
}: PostDetailMarkdownProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          rehypeKatex,
          [rehypeHighlight, { detect: false, ignoreMissing: true }],
        ]}
        components={markdownComponents}
      >
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
