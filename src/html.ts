// Tiny HTML helpers. Every interpolated string goes through esc() unless it is already markup.

const ENT: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ENT[c]);

/** Inline Markdown subset for content: `code` and **bold**. Input is escaped first. */
export const md = (s: string): string =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code class="rounded bg-toon-ink/10 px-1 font-mono text-[0.9em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
