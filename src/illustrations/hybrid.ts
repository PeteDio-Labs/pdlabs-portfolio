// The hybrid diagram on the home page: the lab and the cloud, joined by one pipeline.
import { INK, PAPER, GROUND, BLUE, RED, YEL, VIO, box, circ, line } from './shapes.ts';

/** The hybrid diagram: the lab and the cloud, joined by one pipeline. */
export function hybridDiagram(): string {
  const cloud = 'M470 120a44 44 0 0 1 82-20a52 52 0 0 1 98 20a40 40 0 0 1-6 80H492a40 40 0 0 1-22-80z';
  return `<svg viewBox="0 0 720 300" role="img" aria-label="The homelab, three Proxmox nodes, connects through Terraform and GitOps to AWS, which serves this site from S3 and CloudFront">
<style>.t{font-family:Bangers,Impact,sans-serif;letter-spacing:1px}.s{font-family:ui-sans-serif,system-ui,sans-serif;font-weight:700}</style>
<rect width="720" height="300" fill="${GROUND}"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
${box(46, 62, 206, 196, BLUE, YEL)}<g fill="${PAPER}"><rect x="64" y="82" width="170" height="40"/><rect x="64" y="134" width="170" height="40"/><rect x="64" y="186" width="170" height="40"/></g>
<g stroke="none">${circ(82, 102, 6, BLUE)}${circ(102, 102, 6, RED)}${circ(82, 154, 6, BLUE)}${circ(102, 154, 6, YEL)}${circ(82, 206, 6, BLUE)}${circ(102, 206, 6, VIO)}</g>
<path d="${cloud}" fill="${RED}" transform="translate(8 8)" stroke="none"/><path d="${cloud}" fill="${PAPER}"/>
<rect x="500" y="204" width="60" height="44" fill="${VIO}"/><rect x="568" y="204" width="106" height="44" fill="${YEL}"/>
<path d="M270 150h130v-24l50 40l-50 40v-24H270z" fill="${YEL}"/></g>
<g class="s" font-size="22" fill="${INK}"><text x="124" y="110">pve01</text><text x="124" y="162">pve02</text><text x="124" y="214">pve03</text></g>
<g class="s" font-size="17" fill="${INK}" text-anchor="middle"><text x="530" y="232">S3</text><text x="621" y="232">CloudFront</text></g>
<text class="t" x="50" y="44" font-size="32" fill="${YEL}" stroke="${INK}" stroke-width="6" paint-order="stroke">THE LAB</text>
<text class="t" x="560" y="44" font-size="32" fill="${RED}" stroke="${INK}" stroke-width="6" paint-order="stroke">THE CLOUD</text>
<text class="t" x="520" y="164" font-size="38" fill="${INK}" text-anchor="middle">AWS</text>
<text class="t" x="338" y="171" font-size="26" fill="${INK}" text-anchor="middle">GITOPS</text>
<g class="s" font-size="20" fill="${PAPER}" text-anchor="middle"><text x="364" y="226">Terraform + Ansible</text><text x="364" y="250">same code,</text><text x="364" y="274">swap the provider</text></g>
</svg>`;
}

/** The same diagram stacked top to bottom, for widths where the wide drawing would shrink its labels too far. */
export function hybridDiagramTall(): string {
  // The wide drawing's cloud, scaled to fit and centered on x=180.
  const cloud = 'M470 120a44 44 0 0 1 82-20a52 52 0 0 1 98 20a40 40 0 0 1-6 80H492a40 40 0 0 1-22-80z';
  const place = 'translate(-154 322) scale(.6)';
  return `<svg viewBox="0 0 360 512" role="img" aria-label="The homelab, three Proxmox nodes, connects through Terraform and GitOps to AWS, which serves this site from S3 and CloudFront">
<style>.t{font-family:Bangers,Impact,sans-serif;letter-spacing:1px}.s{font-family:ui-sans-serif,system-ui,sans-serif;font-weight:700}</style>
<rect width="360" height="512" fill="${GROUND}"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
${box(80, 44, 200, 124, BLUE, YEL)}<g fill="${PAPER}"><rect x="94" y="54" width="172" height="32"/><rect x="94" y="90" width="172" height="32"/><rect x="94" y="126" width="172" height="32"/></g>
<g stroke="none">${circ(110, 70, 6, BLUE)}${circ(128, 70, 6, RED)}${circ(110, 106, 6, BLUE)}${circ(128, 106, 6, YEL)}${circ(110, 142, 6, BLUE)}${circ(128, 142, 6, VIO)}</g>
<path d="M130 178h100v34h26l-76 36l-76-36h26z" fill="${YEL}"/>
<g transform="${place}"><path d="${cloud}" fill="${RED}" transform="translate(10 10)" stroke="none"/><path d="${cloud}" fill="${PAPER}"/></g>
<rect x="70" y="460" width="80" height="44" fill="${VIO}"/><rect x="166" y="460" width="124" height="44" fill="${YEL}"/>
</g>
<g class="s" font-size="22" fill="${INK}"><text x="146" y="78">pve01</text><text x="146" y="114">pve02</text><text x="146" y="150">pve03</text></g>
<g class="s" font-size="18" fill="${INK}" text-anchor="middle"><text x="110" y="488">S3</text><text x="228" y="488">CloudFront</text></g>
<text class="t" x="180" y="32" font-size="32" fill="${YEL}" stroke="${INK}" stroke-width="6" paint-order="stroke" text-anchor="middle">THE LAB</text>
<text class="t" x="180" y="206" font-size="28" fill="${INK}" text-anchor="middle">GITOPS</text>
<g class="s" font-size="17" fill="${PAPER}" text-anchor="middle"><text x="180" y="276">Terraform + Ansible</text><text x="180" y="298">same code, swap the provider</text></g>
<text class="t" x="180" y="352" font-size="32" fill="${RED}" stroke="${INK}" stroke-width="6" paint-order="stroke" text-anchor="middle">THE CLOUD</text>
<text class="t" x="180" y="416" font-size="34" fill="${INK}" text-anchor="middle">AWS</text>
</svg>`;
}
