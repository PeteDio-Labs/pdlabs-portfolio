// Local preview of dist/. Serves path.html for /path, and 404.html for anything missing.
const root = `${import.meta.dir}/dist`;
const port = Number(process.env.PORT ?? 8080);

Bun.serve({
  port,
  async fetch(req) {
    let path = decodeURIComponent(new URL(req.url).pathname);
    if (path.includes('..')) return new Response('Bad request', { status: 400 });
    if (path.endsWith('/')) path += 'index.html';
    for (const p of [path, `${path}.html`]) {
      const file = Bun.file(root + p);
      if (await file.exists()) return new Response(file);
    }
    return new Response(Bun.file(`${root}/404.html`), { status: 404, headers: { 'content-type': 'text/html' } });
  },
});
console.log(`serving dist/ on http://localhost:${port}`);
