// The build's page writer: the head, then the app shell rendered to HTML inside #root. The browser hydrates that tree.
import { renderToString } from 'preact-render-to-string';
import { buildBadge } from 'toonish-ui/markup';
import { esc } from './html.ts';
import { site } from './content.ts';
import { analytics, fullTitle, type Page } from './pages.ts';
import { App } from './app.tsx';

/** The build chip: the environment and short commit on a staging build, nothing on production. The staging host sets BUILD_ENV and BUILD_SHA; a malformed value fails the build. */
// The site already has a footer landmark, so the chip is a labelled aside here: a second footer would be a second contentinfo.
const chip = buildBadge({ env: process.env.BUILD_ENV, sha: process.env.BUILD_SHA });

export function document(page: Page): string {
  const t = fullTitle(page);
  const url = `https://${site.domain}${page.path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0c1240">
<title>${esc(t)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${page.path.startsWith('/work/') ? 'article' : 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(t)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="https://${site.domain}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="pdlab: systems built with AI, in comic-book style">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(t)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="https://${site.domain}/og.png">
${page.noindex ? '<meta name="robots" content="noindex">\n' : ''}${page.jsonLd ? `<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>\n` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">
<link rel="manifest" href="/site.webmanifest">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/ibm-plex-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/toonish.css">
<script src="/motion.js"></script>
</head>
<body class="toon-dots">
<div id="root">${renderToString(<App page={page} />)}</div>
${chip}
<script src="/app.js" defer></script>
${analytics ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${esc(analytics)}", "spa": true}'></script>\n` : ''}</body>
</html>
`;
}
