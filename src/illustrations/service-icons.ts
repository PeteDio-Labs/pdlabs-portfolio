// Small hand-drawn icons for the services section. Each is one inline SVG on a 48 px grid:
// ink outlines, flat fills, and a hard ink shadow 2 px right and 2 px down.
// Every animated part carries an `svc-*` class; src/service-icons.css holds the motion.

export type ServiceIconKey =
  | 'identity' | 'secrets' | 'delivery' | 'iac' | 'monitoring' | 'agents'
  | 'tools' | 'work' | 'data' | 'ai' | 'cloud';

const INK = '#0a0a1f';
const YEL = '#f2c94c';
const BLUE = '#5f8dff';
const RED = '#f2706a';
const VIO = '#a995f0';
const WHITE = '#ffffff';

/** The shadow: the same geometry in ink, drawn first and offset by 2 px. */
const shadow = (shapes: string) => `<g transform="translate(2 2)" fill="${INK}">${shapes}</g>`;
const r = (geo: string, fill?: string) => `<rect ${geo}${fill ? ` fill="${fill}"` : ''}/>`;
const c = (geo: string, fill?: string) => `<circle ${geo}${fill ? ` fill="${fill}"` : ''}/>`;
const p = (d: string, fill?: string) => `<path d="${d}"${fill ? ` fill="${fill}"` : ' fill="none"'}/>`;
const ps = (d: string) => `<path d="${d}"/>`; // path for a shadow, filled by the group

const svg = (key: ServiceIconKey, body: string) =>
  `<svg class="svc-ico svc-ico-${key}" viewBox="0 0 48 48" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

// identity: an ID badge with a face, and a check seal that pops.
const idCard = 'x="5" y="11" width="31" height="25" rx="3"';
const idSeal = 'cx="36" cy="34" r="8"';
const identity = svg('identity',
  shadow(r(idCard) + c(idSeal)) +
  r(idCard, BLUE) +
  r('x="5" y="11" width="31" height="6" rx="2"', YEL) +
  c('cx="14" cy="24" r="3.5"', WHITE) +
  p('M8.5 33q5.5-7 11 0', WHITE) +
  p('M24 23h7M24 29h5') +
  `<g class="svc-seal">${c(idSeal, YEL)}${p('M32.5 34l2.5 2.5 4.5-5')}</g>`);

// secrets: a vault door with hinges, a handle and a dial that turns.
const door = 'x="6" y="7" width="34" height="33" rx="3"';
const secrets = svg('secrets',
  shadow(r(door)) +
  r(door, VIO) +
  r('x="3.5" y="13" width="4" height="6" rx="1"', YEL) +
  r('x="3.5" y="28" width="4" height="6" rx="1"', YEL) +
  c('cx="22" cy="23.5" r="10"', WHITE) +
  p('M35 18v11') +
  `<g class="svc-dial">${c('cx="22" cy="23.5" r="5.5"', YEL)}${p('M22 18v-4M22 29v4M16.5 23.5h-4M27.5 23.5h4')}</g>`);

// delivery: a rocket leaving the pipeline, with a flickering flame.
const body = 'M24 5c7 6 7 18 5 25H19c-2-7-2-19 5-25z';
const delivery = svg('delivery',
  p('M5 44h9M19 44h10M34 44h9') +
  `<g class="svc-rocket">` +
  `<g class="svc-flame">${p('M20.5 31.5q3.5 11 3.5 11t3.5-11z', YEL)}</g>` +
  shadow(ps(body)) +
  p('M19 23l-5 6v5l6-3z', RED) + p('M29 23l5 6v5l-6-3z', RED) +
  p(body, WHITE) +
  c('cx="24" cy="17" r="3.5"', BLUE) +
  `</g>`);

// iac: two foundation blocks, and a third that drops into place.
const b1 = 'x="5" y="30" width="18" height="12" rx="2"';
const b2 = 'x="25" y="30" width="18" height="12" rx="2"';
const b3 = 'x="14" y="14" width="20" height="13" rx="2"';
const iac = svg('iac',
  shadow(r(b1) + r(b2)) +
  r(b1, BLUE) + r(b2, VIO) +
  p('M10 36h8M30 36h8') +
  `<g class="svc-block">${shadow(r(b3))}${r(b3, YEL)}${p('M19 20.5l3 3 6-6')}</g>`);

// monitoring: a screen on a stand with a heartbeat that beats.
const screen = 'x="5" y="7" width="38" height="27" rx="3"';
const monitoring = svg('monitoring',
  shadow(r(screen) + r('x="13" y="38" width="22" height="5" rx="2"')) +
  r('x="20" y="33" width="8" height="6"', VIO) +
  r('x="13" y="38" width="22" height="5" rx="2"', YEL) +
  r(screen, BLUE) +
  r('x="9" y="11" width="30" height="19" rx="1.5"', WHITE) +
  `<g class="svc-pulse">${p('M11 21h6l2.5-6 4 12 3.5-9 2 3h8')}</g>` +
  c('cx="37" cy="21" r="1.6"', RED));

// agents: a friendly robot head that blinks.
const head = 'x="9" y="14" width="30" height="25" rx="6"';
const agents = svg('agents',
  shadow(r(head)) +
  p('M24 14V8') + c('cx="24" cy="6.5" r="2.8"', RED) +
  r('x="4.5" y="22" width="5" height="9" rx="1.5"', YEL) +
  r('x="38.5" y="22" width="5" height="9" rx="1.5"', YEL) +
  r(head, VIO) +
  r('x="13" y="19" width="22" height="11" rx="4"', WHITE) +
  `<g class="svc-eyes">${c('cx="19" cy="24.5" r="2"', INK)}${c('cx="29" cy="24.5" r="2"', INK)}</g>` +
  p('M20 34h8'));

// tools: a wrench that rocks beside a plug.
const wrench = 'M21 5.6V11h6V5.6A8 8 0 1 1 21 5.6z';
const handle = 'x="20.5" y="19" width="7" height="22" rx="3.5"';
const plug = 'x="30" y="27" width="13" height="10" rx="2"';
const tools = svg('tools',
  p('M36.5 37q0 5 6 7') +
  shadow(r(plug)) +
  p('M33.5 27v-5M39.5 27v-5') +
  r(plug, RED) +
  `<g class="svc-wrench"><g transform="translate(-9 -3) scale(0.95) rotate(-40 24 24)">` +
  shadow(r(handle) + ps(wrench)) + r(handle, YEL) + p(wrench, YEL) + `</g></g>`);

// work: a kanban board with a card that slides to the next column.
const board = 'x="5" y="8" width="38" height="33" rx="3"';
const work = svg('work',
  shadow(r(board)) +
  r(board, WHITE) +
  r('x="5" y="8" width="38" height="7" rx="2"', VIO) +
  p('M17.5 15v26M30.5 15v26') +
  r('x="8" y="19" width="7" height="6" rx="1"', YEL) +
  r('x="8" y="29" width="7" height="6" rx="1"', YEL) +
  r('x="33.5" y="19" width="7" height="6" rx="1"', BLUE) +
  `<g class="svc-card">${r('x="20.5" y="29" width="7" height="6" rx="1"', RED)}</g>`);

// data: a database cylinder that drops a record into a storage bucket.
const cyl = 'M5 13v20a9 4 0 0 0 18 0V13z';
const bucket = 'M26 24h18l-2.5 17h-13z';
const data = svg('data',
  shadow(ps(cyl) + ps(bucket)) +
  p(cyl, BLUE) +
  `<ellipse cx="14" cy="13" rx="9" ry="4" fill="${VIO}"/>` +
  p('M5 23a9 4 0 0 0 18 0') +
  `<g class="svc-drop">${r('x="31.5" y="9" width="7" height="7" rx="1.5"', RED)}</g>` +
  p(bucket, YEL) +
  p('M29 30h12'));

// ai: a model chip with pins and a spark that twinkles.
const chip = 'x="12" y="12" width="24" height="24" rx="3"';
const ai = svg('ai',
  p('M18 12V7M24 12V7M30 12V7M18 36v5M24 36v5M30 36v5M12 18H7M12 24H7M12 30H7M36 24h5M36 30h5') +
  shadow(r(chip)) +
  r(chip, VIO) +
  r('x="18" y="18" width="12" height="12" rx="2"', BLUE) +
  c('cx="24" cy="24" r="2"', WHITE) +
  `<g class="svc-spark">${p('M40 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z', YEL)}</g>`);

// cloud: a cloud over swap arrows, for the Lab and Cloud failover.
const cloudPath = 'M13 29h23a6 6 0 0 0 1-12a9 9 0 0 0-17-3a7 7 0 0 0-8 8a4 4 0 0 0 1 7z';
const cloud = svg('cloud',
  shadow(ps(cloudPath)) +
  p(cloudPath, BLUE) +
  `<path d="M17 20q3-3 7-2" fill="none" stroke="${WHITE}"/>` +
  `<g class="svc-swap">${p('M12 34h22l-4-3.5')}${p('M36 41H14l4 3.5')}</g>`);

export const SERVICE_ICONS: Record<ServiceIconKey, string> = {
  identity, secrets, delivery, iac, monitoring, agents, tools, work, data, ai, cloud,
};
