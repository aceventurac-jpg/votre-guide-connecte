import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Share2, ExternalLink } from "lucide-react";
import { findOfficialLink } from "@/lib/official-links";

/**
 * Découpe le markdown en (résumé avant le premier ## , reste).
 * Le "résumé" = tout ce qui précède la 1ère section ##.
 */
function splitSummary(md: string): { summary: string; rest: string } {
  const idx = md.search(/^##\s/m);
  if (idx === -1) return { summary: md, rest: "" };
  return { summary: md.slice(0, idx).trim(), rest: md.slice(idx).trim() };
}

const mdComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80" />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} className="text-base font-semibold mt-3 mb-1.5" />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className="text-sm font-semibold mt-2 mb-1" />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul {...props} className="list-disc pl-5 space-y-1 my-1" />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol {...props} className="list-decimal pl-5 space-y-1 my-1" />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props} className="my-1" />,
  em: (props: React.HTMLAttributes<HTMLElement>) => <em {...props} className="text-muted-foreground text-xs" />,
};

export function MarkdownBlock({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function AssistantMessage({
  content,
  onShare,
}: {
  content: string;
  onShare?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { summary, rest } = splitSummary(content);

  return (
    <div className="space-y-2">
      <MarkdownBlock>{summary || content}</MarkdownBlock>
      {rest && (
        <>
          {open && (
            <div className="border-l-2 border-accent/40 pl-3 mt-2">
              <MarkdownBlock>{rest}</MarkdownBlock>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen((o) => !o)}
            className="h-7 px-2 text-xs text-accent hover:text-accent"
          >
            {open ? (
              <>
                <ChevronUp className="size-3.5 mr-1" /> Masquer le détail
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5 mr-1" /> Voir le détail complet
              </>
            )}
          </Button>
        </>
      )}
      {onShare && (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onShare} className="h-7 px-2 text-xs">
            <Share2 className="size-3.5 mr-1" /> Partager avec la communauté
          </Button>
        </div>
      )}
    </div>
  );
}
