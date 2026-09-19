import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = join(root, "templates");
const themesRoot = join(root, "resources", "themes");
const artifactsRoot = join(root, ".artifacts", "template-gallery");

const baseCss = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; background: var(--paper); color: var(--ink); }
body { overflow-x: hidden; font-family: var(--sans); }
h1, h2, h3, p { margin: 0; }
.slide { position: relative; display: flex; flex-direction: column; width: 1600px; height: 900px; min-height: 900px; padding: 76px 88px; overflow: hidden; isolation: isolate; background: var(--paper); color: var(--ink); }
.slide::before { position: absolute; inset: 0; z-index: -2; pointer-events: none; content: ""; background: var(--slide-overlay, none); }
.cover { justify-content: center; }
.cover-copy { position: relative; z-index: 2; max-width: 980px; }
.kicker { margin-bottom: 20px; color: var(--accent); font-size: 17px; font-weight: 800; letter-spacing: .18em; line-height: 1.1; text-transform: uppercase; }
.title { max-width: 1120px; font-size: 76px; font-weight: 800; letter-spacing: -.055em; line-height: .98; }
.title em { color: var(--accent); font-style: normal; }
.lede { max-width: 820px; margin-top: 24px; color: var(--muted); font-size: 26px; line-height: 1.35; }
.footer { margin-top: auto; color: var(--muted); font-size: 15px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.meta-line { display: flex; gap: 28px; margin-top: 38px; color: var(--muted); font-size: 15px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.cover-art { position: absolute; right: 70px; top: 70px; width: 560px; height: 760px; }
.orb { position: absolute; border-radius: 50%; }
.orb-a { width: 430px; height: 430px; right: 0; top: 90px; background: var(--art-one); box-shadow: var(--art-shadow, none); }
.orb-b { width: 260px; height: 260px; left: 20px; bottom: 90px; background: var(--art-two); mix-blend-mode: multiply; }
.orb-c { width: 150px; height: 150px; left: 160px; top: 40px; border: 2px solid var(--accent); background: transparent; }
.art-label { position: absolute; right: 36px; bottom: 40px; color: var(--art-label, var(--ink)); font-size: 14px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; transform: rotate(-90deg); transform-origin: bottom right; }
.section-head { display: flex; justify-content: space-between; align-items: start; gap: 28px; }
.page-no { color: var(--accent); font-size: 17px; font-weight: 900; letter-spacing: .12em; }
.section-title { max-width: 1120px; margin-top: 12px; font-size: 62px; font-weight: 800; letter-spacing: -.05em; line-height: 1; }
.section-lede { max-width: 760px; margin-top: 18px; color: var(--muted); font-size: 21px; line-height: 1.4; }
.hero-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 26px; margin-top: 46px; }
.panel { min-height: 230px; padding: 30px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); box-shadow: var(--shadow); }
.panel h2 { margin-bottom: 15px; font-size: 25px; letter-spacing: -.03em; }
.panel p { color: var(--muted); font-size: 19px; line-height: 1.45; }
.panel strong { color: var(--ink); }
.panel .label { display: block; margin-bottom: 26px; color: var(--accent); font-size: 14px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
.list { display: grid; gap: 13px; margin-top: 24px; padding: 0; list-style: none; }
.list li { display: flex; gap: 12px; align-items: start; color: var(--muted); font-size: 18px; line-height: 1.35; }
.list li::before { flex: 0 0 auto; width: 9px; height: 9px; margin-top: 7px; border-radius: 50%; background: var(--accent); content: ""; }
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 48px; }
.stat { min-height: 198px; padding: 26px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); box-shadow: var(--shadow); }
.stat .value { color: var(--accent); font-size: 58px; font-weight: 850; letter-spacing: -.08em; line-height: .95; }
.stat .label { display: block; margin-top: 18px; color: var(--muted); font-size: 16px; line-height: 1.25; }
.bar-layout { display: grid; grid-template-columns: 1fr .9fr; gap: 38px; align-items: end; margin-top: 38px; }
.bar-chart { display: flex; align-items: end; gap: 20px; height: 260px; padding: 24px; border-bottom: 1px solid var(--line); border-left: 1px solid var(--line); }
.bar { display: flex; flex: 1; flex-direction: column; justify-content: end; gap: 10px; min-width: 44px; height: 100%; }
.bar i { display: block; min-height: 14px; border-radius: 12px 12px 0 0; background: linear-gradient(180deg, var(--accent), var(--accent-deep)); }
.bar span { color: var(--muted); font-size: 14px; font-weight: 800; text-align: center; }
.bar-note { padding: 28px; border-left: 4px solid var(--accent); color: var(--muted); font-size: 21px; line-height: 1.38; }
.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 48px; }
.compare .panel { min-height: 310px; }
.compare .panel:first-child { border-color: var(--line-strong); }
.compare .panel:last-child { background: var(--accent-soft); border-color: transparent; }
.compare h2 { font-size: 35px; }
.compare .panel:last-child h2 { color: var(--accent-deep); }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 56px; border-top: 1px solid var(--line); }
.step { min-height: 245px; padding: 25px 20px 0 0; border-right: 1px solid var(--line); }
.step:not(:first-child) { padding-left: 20px; }
.step:last-child { border-right: 0; }
.step .number { color: var(--accent); font-size: 48px; font-weight: 900; letter-spacing: -.08em; }
.step h2 { margin-top: 24px; font-size: 23px; }
.step p { margin-top: 10px; color: var(--muted); font-size: 17px; line-height: 1.4; }
.quote-layout { display: grid; grid-template-columns: 1.3fr .7fr; gap: 34px; align-items: stretch; margin-top: 42px; }
.quote { position: relative; min-height: 370px; padding: 48px; border-radius: var(--radius); background: var(--accent); color: var(--quote-ink); box-shadow: var(--shadow); }
.quote-mark { color: var(--quote-mark); font-family: Georgia, serif; font-size: 130px; line-height: .5; }
.quote p { max-width: 800px; margin-top: 20px; font-family: var(--serif); font-size: 39px; font-weight: 700; letter-spacing: -.04em; line-height: 1.08; }
.quote cite { display: block; margin-top: 26px; font-family: var(--sans); font-size: 15px; font-style: normal; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
.quote-aside { display: flex; flex-direction: column; justify-content: end; padding: 26px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); }
.quote-aside .value { color: var(--accent); font-size: 70px; font-weight: 900; letter-spacing: -.08em; }
.quote-aside p { margin-top: 10px; color: var(--muted); font-size: 18px; line-height: 1.35; }
.closing { justify-content: end; background: var(--accent); color: var(--quote-ink); }
.closing::before { opacity: .35; background: radial-gradient(circle at 85% 15%, var(--accent-soft) 0 16%, var(--accent) 17%), radial-gradient(circle at 10% 95%, var(--art-two) 0 18%, var(--accent) 19%); }
.closing .kicker, .closing .footer { color: var(--quote-mark); }
.closing .title { max-width: 880px; }
.closing .title em { color: var(--quote-mark); }
.closing .lede { color: color-mix(in srgb, var(--quote-ink) 72%, transparent); }
.closing .meta-line { color: var(--quote-mark); }
@media print { .slide { break-after: page; page-break-after: always; } .slide:last-of-type { break-after: auto; page-break-after: auto; } }
`;

const styleCss = {
  aurora: `
    :root { --paper: #f7f8fc; --ink: #172033; --muted: #647086; --accent: #5b6cf2; --accent-deep: #3847c9; --accent-soft: #dfe4ff; --line: rgb(23 32 51 / 13%); --line-strong: rgb(23 32 51 / 23%); --panel: #ffffff; --radius: 28px; --shadow: 0 24px 60px rgb(23 32 51 / 13%); --sans: Inter, ui-sans-serif, system-ui, sans-serif; --serif: Georgia, serif; --art-one: #c6ccff; --art-two: #ffbd9e; --quote-ink: #ffffff; --quote-mark: #bec6ff; --slide-overlay: radial-gradient(circle at 92% 8%, #e4e7ff 0 14%, var(--paper) 15%); }
    .slide:not(.closing)::after { position: absolute; right: -160px; bottom: -190px; z-index: -1; width: 460px; height: 460px; border: 1px solid rgb(91 108 242 / 18%); border-radius: 50%; content: ""; }
    .panel, .stat { backdrop-filter: blur(10px); }
  `,
  midnight: `
    :root { --paper: #080b14; --ink: #f3f6ff; --muted: #aab4ca; --accent: #6ce5dc; --accent-deep: #24aaa6; --accent-soft: #173d45; --line: rgb(227 235 255 / 18%); --line-strong: rgb(108 229 220 / 45%); --panel: rgb(18 25 42 / 88%); --radius: 18px; --shadow: 0 28px 72px rgb(0 0 0 / 35%); --sans: Inter, ui-sans-serif, system-ui, sans-serif; --serif: Georgia, serif; --art-one: #273a83; --art-two: #ef765e; --quote-ink: #071118; --quote-mark: #baf8f0; --art-label: #aab4ca; --slide-overlay: linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px); }
    .slide { background-size: 52px 52px; }
    .slide:not(.closing)::after { position: absolute; right: 70px; top: 62px; z-index: -1; width: 420px; height: 420px; border: 1px solid rgb(108 229 220 / 35%); border-radius: 50%; box-shadow: 0 0 80px rgb(108 229 220 / 15%); content: ""; }
    .orb-a { background: radial-gradient(circle at 35% 30%, #f9a18a, #4d3a83 57%, #11162a); box-shadow: 0 0 90px rgb(108 229 220 / 30%); }
    .orb-b { background: #6ce5dc; mix-blend-mode: screen; opacity: .45; }
    .panel, .stat { backdrop-filter: blur(14px); }
    .kicker, .page-no, .footer { letter-spacing: .2em; }
    .bar i { border-radius: 3px 3px 0 0; box-shadow: 0 0 24px rgb(108 229 220 / 36%); }
    .quote { border: 1px solid rgb(7 17 24 / 22%); }
  `,
  swiss: `
    :root { --paper: #f2efe9; --ink: #121212; --muted: #56534e; --accent: #ef4e3f; --accent-deep: #b62920; --accent-soft: #f8c9c2; --line: #b7b2aa; --line-strong: #121212; --panel: #f8f6f1; --radius: 0px; --shadow: none; --sans: Arial, Helvetica, sans-serif; --serif: Georgia, serif; --art-one: #121212; --art-two: #ef4e3f; --quote-ink: #f2efe9; --quote-mark: #f8c9c2; --slide-overlay: linear-gradient(90deg, var(--paper) 0 11%, rgb(18 18 18 / 9%) 11% 11.1%, var(--paper) 11.1% 100%); }
    .slide { padding: 74px 92px 64px; }
    .slide:not(.closing)::after { position: absolute; right: 92px; bottom: 62px; width: 185px; height: 9px; background: var(--accent); content: ""; }
    .title, .section-title { font-weight: 900; text-transform: none; }
    .kicker { color: var(--accent); }
    .cover-art { right: 90px; width: 470px; }
    .orb-a { border-radius: 0; transform: rotate(45deg); }
    .orb-b { border-radius: 0; transform: rotate(15deg); }
    .orb-c { border-radius: 0; border-width: 8px; transform: rotate(45deg); }
    .panel, .stat { border-width: 2px; }
    .panel .label, .step .number { color: var(--accent); }
    .step { padding-top: 19px; }
    .bar i { border-radius: 0; }
    .quote { border-radius: 0; }
    .closing { background: var(--ink); }
  `,
  brutalist: `
    :root { --paper: #f4e94c; --ink: #111111; --muted: #333333; --accent: #f15bb5; --accent-deep: #c5328b; --accent-soft: #ffffff; --line: #111111; --line-strong: #111111; --panel: #ffffff; --radius: 0px; --shadow: 10px 10px 0 #111111; --sans: Arial Black, Arial, Helvetica, sans-serif; --serif: Georgia, serif; --art-one: #111111; --art-two: #f15bb5; --quote-ink: #ffffff; --quote-mark: #f4e94c; --art-label: #111111; --slide-overlay: radial-gradient(circle at 100% 0%, #f15bb5 0 13%, var(--paper) 13.2%); }
    .slide { border: 6px solid var(--ink); padding: 68px 80px 58px; }
    .slide:not(.closing)::after { position: absolute; left: 62px; bottom: 48px; width: 92px; height: 18px; background: var(--accent); content: ""; transform: rotate(-4deg); }
    .title { font-size: 79px; text-transform: uppercase; }
    .kicker, .footer { color: var(--ink); font-weight: 900; }
    .cover-art { right: 92px; top: 100px; width: 480px; height: 650px; transform: rotate(3deg); }
    .orb-a { border: 6px solid var(--ink); border-radius: 0; box-shadow: 18px 18px 0 var(--accent); transform: rotate(8deg); }
    .orb-b { border: 6px solid var(--ink); border-radius: 0; box-shadow: 12px 12px 0 #ffffff; transform: rotate(-14deg); }
    .orb-c { border: 6px solid var(--ink); border-radius: 0; background: var(--accent); }
    .panel, .stat { border-width: 5px; box-shadow: var(--shadow); }
    .panel h2, .stat .value, .step .number { font-weight: 900; text-transform: uppercase; }
    .compare .panel:last-child { background: var(--accent); }
    .quote { border: 5px solid var(--ink); border-radius: 0; box-shadow: 14px 14px 0 var(--ink); }
    .closing { background: var(--accent); }
  `,
  organic: `
    :root { --paper: #f3ecdf; --ink: #26372e; --muted: #687066; --accent: #c96545; --accent-deep: #91422e; --accent-soft: #d9e0c8; --line: rgb(38 55 46 / 17%); --line-strong: rgb(38 55 46 / 33%); --panel: #faf6ef; --radius: 38px; --shadow: 0 24px 55px rgb(67 61 46 / 12%); --sans: Inter, ui-sans-serif, system-ui, sans-serif; --serif: Georgia, serif; --art-one: #b8c9a6; --art-two: #d98765; --quote-ink: #f7f0e4; --quote-mark: #edb095; --slide-overlay: radial-gradient(ellipse at 88% 12%, #d9e0c8 0 15%, var(--paper) 15.2%); }
    .slide { padding-left: 104px; padding-right: 104px; }
    .slide:not(.closing)::after { position: absolute; right: -120px; bottom: -160px; width: 430px; height: 360px; border: 1px solid rgb(201 101 69 / 28%); border-radius: 48% 52% 45% 55%; content: ""; transform: rotate(-20deg); }
    .title, .section-title { font-family: var(--serif); font-weight: 700; letter-spacing: -.055em; }
    .lede, .section-lede { max-width: 700px; }
    .cover-art { right: 80px; top: 85px; }
    .orb-a { border-radius: 58% 42% 62% 38%; transform: rotate(20deg); }
    .orb-b { border-radius: 45% 55% 35% 65%; }
    .orb-c { border-color: var(--accent); border-radius: 52% 48% 66% 34%; transform: rotate(-24deg); }
    .panel, .stat { background: rgb(250 246 239 / 84%); }
    .panel .label, .step .number { color: var(--accent); }
    .quote { border-radius: 58px 20px 58px 20px; }
    .closing { background: var(--ink); }
  `,
  datanoir: `
    :root { --paper: #07100c; --ink: #d4f7d5; --muted: #8dad91; --accent: #b6f36a; --accent-deep: #74ba37; --accent-soft: #1b3a23; --line: rgb(182 243 106 / 26%); --line-strong: rgb(182 243 106 / 56%); --panel: #0b1810; --radius: 4px; --shadow: 0 18px 45px rgb(0 0 0 / 35%); --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; --serif: Georgia, serif; --art-one: #163b20; --art-two: #b6f36a; --quote-ink: #07100c; --quote-mark: #d4f7d5; --art-label: #8dad91; --slide-overlay: linear-gradient(rgb(182 243 106 / 4%) 1px, transparent 1px), linear-gradient(90deg, rgb(182 243 106 / 4%) 1px, transparent 1px); }
    .slide { background-size: 34px 34px; }
    .slide:not(.closing)::after { position: absolute; right: 88px; top: 72px; width: 280px; height: 8px; border: 1px solid var(--accent); content: ""; box-shadow: 0 0 18px rgb(182 243 106 / 34%); }
    .title, .section-title { font-family: var(--sans); font-weight: 700; letter-spacing: -.08em; }
    .title { font-size: 69px; }
    .kicker, .footer, .page-no { font-family: var(--sans); letter-spacing: .08em; }
    .panel, .stat { border-radius: 4px; box-shadow: none; }
    .panel .label { color: var(--accent); }
    .list li::before { border-radius: 0; box-shadow: 0 0 10px var(--accent); }
    .bar i { border-radius: 0; box-shadow: 0 0 15px rgb(182 243 106 / 36%); }
    .quote { border: 1px solid var(--accent); border-radius: 4px; box-shadow: 0 0 34px rgb(182 243 106 / 12%); }
    .closing { background: #0b1b12; }
  `,
  luxury: `
    :root { --paper: #f6f0e6; --ink: #27231e; --muted: #756c5f; --accent: #a3824f; --accent-deep: #765a32; --accent-soft: #e7dac2; --line: rgb(39 35 30 / 20%); --line-strong: rgb(163 130 79 / 52%); --panel: #fbf8f2; --radius: 2px; --shadow: 0 20px 48px rgb(69 56 38 / 10%); --sans: Arial, Helvetica, sans-serif; --serif: "Baskerville", Georgia, serif; --art-one: #d6c4a5; --art-two: #b68a4e; --quote-ink: #f6f0e6; --quote-mark: #eadcc5; --art-label: #756c5f; --slide-overlay: linear-gradient(135deg, transparent 0 70%, rgb(163 130 79 / 10%) 70% 70.3%, transparent 70.3%); }
    .slide { padding: 82px 100px 68px; }
    .slide:not(.closing)::after { position: absolute; left: 100px; right: 100px; bottom: 48px; border-bottom: 1px solid var(--line); content: ""; }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.045em; }
    .title { font-size: 82px; }
    .kicker, .footer, .page-no { font-weight: 500; letter-spacing: .24em; }
    .cover-art { right: 80px; top: 65px; }
    .orb-a { border: 1px solid var(--accent); background: transparent; box-shadow: inset 0 0 0 18px rgb(163 130 79 / 12%); }
    .orb-b { background: var(--art-one); mix-blend-mode: multiply; }
    .orb-c { border-color: var(--ink); }
    .panel, .stat { background: rgb(251 248 242 / 70%); }
    .panel .label, .step .number { font-family: var(--serif); color: var(--accent); font-size: 18px; letter-spacing: .04em; text-transform: none; }
    .quote { border: 1px solid rgb(246 240 230 / 38%); }
    .closing { background: var(--ink); }
  `,
  retrofuture: `
    :root { --paper: #12072b; --ink: #fbf7ff; --muted: #c0b3de; --accent: #ff5bc8; --accent-deep: #a546ff; --accent-soft: #33205f; --line: rgb(255 255 255 / 18%); --line-strong: rgb(255 91 200 / 56%); --panel: rgb(35 18 69 / 88%); --radius: 18px; --shadow: 0 24px 70px rgb(0 0 0 / 35%); --sans: "Arial Narrow", Arial, sans-serif; --serif: Georgia, serif; --art-one: #5631b8; --art-two: #41e7ff; --quote-ink: #12072b; --quote-mark: #b9fbff; --art-label: #c0b3de; --slide-overlay: linear-gradient(rgb(65 231 255 / 7%) 1px, transparent 1px), linear-gradient(90deg, rgb(65 231 255 / 7%) 1px, transparent 1px); }
    .slide { background-size: 48px 48px; }
    .slide:not(.closing)::after { position: absolute; right: -60px; bottom: -90px; width: 420px; height: 420px; border: 2px solid rgb(65 231 255 / 42%); border-radius: 50%; box-shadow: 0 0 60px rgb(65 231 255 / 22%); content: ""; }
    .title, .section-title { font-weight: 900; letter-spacing: -.07em; text-transform: uppercase; }
    .title em { color: #41e7ff; }
    .kicker, .footer, .page-no { letter-spacing: .22em; }
    .orb-a { background: radial-gradient(circle at 35% 30%, #ff5bc8, #a546ff 48%, #20104d); box-shadow: 0 0 100px rgb(255 91 200 / 34%); }
    .orb-b { background: #41e7ff; mix-blend-mode: screen; opacity: .48; }
    .orb-c { border-color: #41e7ff; box-shadow: 0 0 24px rgb(65 231 255 / 45%); }
    .panel, .stat { border-color: rgb(65 231 255 / 28%); backdrop-filter: blur(14px); }
    .bar i { background: linear-gradient(180deg, #41e7ff, #a546ff); box-shadow: 0 0 22px rgb(65 231 255 / 34%); }
    .quote { background: linear-gradient(135deg, #ff5bc8, #a546ff); }
    .closing { background: linear-gradient(135deg, #a546ff, #ff5bc8); }
  `,
};

const templateDescriptions = {
  aurora: "Light editorial system with spacious cards, indigo accents, and calm narrative pacing.",
  midnight:
    "Dark cinematic system with luminous cyan highlights, grid structure, and contrast-led storytelling.",
  swiss:
    "Swiss-inspired grid with hard edges, red signal color, and disciplined information hierarchy.",
  brutalist:
    "Neo-brutalist system with yellow canvas, ink borders, offset shadows, and playful emphasis.",
  organic: "Warm studio system with earthy colors, serif headlines, and soft organic geometry.",
  datanoir: "Terminal-inspired dark system for product, engineering, and operational narratives.",
  luxury:
    "Quiet luxury system with ivory paper, hairline rules, serif typography, and restrained gold.",
  retrofuture:
    "Neon retro-future system with synthwave gradients, luminous grids, and energetic pacing.",
};

const themeTokens = {
  aurora: { paper: "#f7f8fc", ink: "#172033", accent: "#5b6cf2", muted: "#647086", radius: "28px" },
  midnight: {
    paper: "#080b14",
    ink: "#f3f6ff",
    accent: "#6ce5dc",
    muted: "#aab4ca",
    radius: "18px",
  },
  swiss: { paper: "#f2efe9", ink: "#121212", accent: "#ef4e3f", muted: "#56534e", radius: "0px" },
  brutalist: {
    paper: "#f4e94c",
    ink: "#111111",
    accent: "#f15bb5",
    muted: "#333333",
    radius: "0px",
  },
  organic: {
    paper: "#f3ecdf",
    ink: "#26372e",
    accent: "#c96545",
    muted: "#687066",
    radius: "38px",
  },
  datanoir: {
    paper: "#07100c",
    ink: "#d4f7d5",
    accent: "#b6f36a",
    muted: "#8dad91",
    radius: "4px",
  },
  luxury: { paper: "#f6f0e6", ink: "#27231e", accent: "#a3824f", muted: "#756c5f", radius: "2px" },
  retrofuture: {
    paper: "#12072b",
    ink: "#fbf7ff",
    accent: "#ff5bc8",
    muted: "#c0b3de",
    radius: "18px",
  },
};

const paletteVariants = [
  {
    name: "cobalt",
    label: "Cobalt",
    description: "Clear blue product palette for confident strategy and technology stories.",
    tokens: {
      paper: "#f4f7ff",
      ink: "#14213d",
      muted: "#5c6a83",
      accent: "#315efb",
      accentDeep: "#2340b4",
      accentSoft: "#dbe5ff",
      line: "rgb(20 33 61 / 16%)",
      lineStrong: "rgb(20 33 61 / 28%)",
      panel: "#ffffff",
      radius: "24px",
      artOne: "#b5c6ff",
      artTwo: "#ffb29c",
      quoteInk: "#ffffff",
      quoteMark: "#c9d5ff",
      artLabel: "#5c6a83",
      overlay: "radial-gradient(circle at 92% 8%, #dbe5ff 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "coral",
    label: "Coral",
    description:
      "Warm coral palette for human-centered launches, brands, and community narratives.",
    tokens: {
      paper: "#fff7f4",
      ink: "#321c24",
      muted: "#735861",
      accent: "#ed5d52",
      accentDeep: "#b73a34",
      accentSoft: "#ffd7d1",
      line: "rgb(50 28 36 / 15%)",
      lineStrong: "rgb(50 28 36 / 28%)",
      panel: "#ffffff",
      radius: "30px",
      artOne: "#ffc2b8",
      artTwo: "#f5b45f",
      quoteInk: "#ffffff",
      quoteMark: "#ffe6de",
      artLabel: "#735861",
      overlay: "radial-gradient(circle at 92% 8%, #ffd7d1 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "forest",
    label: "Forest",
    description:
      "Grounded green palette for sustainability, operations, and long-term growth stories.",
    tokens: {
      paper: "#f2f7f1",
      ink: "#1b3327",
      muted: "#5e7264",
      accent: "#1f8a62",
      accentDeep: "#126044",
      accentSoft: "#cae8d7",
      line: "rgb(27 51 39 / 16%)",
      lineStrong: "rgb(27 51 39 / 28%)",
      panel: "#fbfffc",
      radius: "26px",
      artOne: "#a5cdb3",
      artTwo: "#e7ae77",
      quoteInk: "#ffffff",
      quoteMark: "#bfe7cc",
      artLabel: "#5e7264",
      overlay: "radial-gradient(circle at 92% 8%, #cae8d7 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "saffron",
    label: "Saffron",
    description:
      "Optimistic golden palette for education, change management, and opportunity maps.",
    tokens: {
      paper: "#fff9e8",
      ink: "#3b2a14",
      muted: "#806d4e",
      accent: "#e3a316",
      accentDeep: "#9d6b05",
      accentSoft: "#f9e5a8",
      line: "rgb(59 42 20 / 16%)",
      lineStrong: "rgb(59 42 20 / 28%)",
      panel: "#fffdf6",
      radius: "20px",
      artOne: "#f7cf68",
      artTwo: "#e57b52",
      quoteInk: "#261a0c",
      quoteMark: "#fff1b9",
      artLabel: "#806d4e",
      overlay: "radial-gradient(circle at 92% 8%, #f9e5a8 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "plum",
    label: "Plum",
    description: "Expressive plum palette for culture, editorial, and premium creative work.",
    tokens: {
      paper: "#fbf7fc",
      ink: "#291a33",
      muted: "#745e7f",
      accent: "#9c4fd4",
      accentDeep: "#6e2e9f",
      accentSoft: "#ead8f7",
      line: "rgb(41 26 51 / 16%)",
      lineStrong: "rgb(41 26 51 / 28%)",
      panel: "#ffffff",
      radius: "32px",
      artOne: "#d3a9ee",
      artTwo: "#f6b5cc",
      quoteInk: "#ffffff",
      quoteMark: "#f1dfff",
      artLabel: "#745e7f",
      overlay: "radial-gradient(circle at 92% 8%, #ead8f7 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "ocean",
    label: "Ocean",
    description:
      "Fresh cyan palette for research, customer insight, and service design narratives.",
    tokens: {
      paper: "#eefaff",
      ink: "#12303e",
      muted: "#5e7782",
      accent: "#0f9ec7",
      accentDeep: "#057493",
      accentSoft: "#c8f0fa",
      line: "rgb(18 48 62 / 16%)",
      lineStrong: "rgb(18 48 62 / 28%)",
      panel: "#faffff",
      radius: "24px",
      artOne: "#a8dfea",
      artTwo: "#ffcc9b",
      quoteInk: "#05303c",
      quoteMark: "#d8f8ff",
      artLabel: "#5e7782",
      overlay: "radial-gradient(circle at 92% 8%, #c8f0fa 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "sand",
    label: "Sand",
    description:
      "Natural terracotta palette for consulting, hospitality, and considered brand stories.",
    tokens: {
      paper: "#f7f0e5",
      ink: "#3d3125",
      muted: "#796c5d",
      accent: "#bd7043",
      accentDeep: "#875034",
      accentSoft: "#ead4bd",
      line: "rgb(61 49 37 / 16%)",
      lineStrong: "rgb(61 49 37 / 28%)",
      panel: "#fffaf3",
      radius: "34px",
      artOne: "#ddbe9b",
      artTwo: "#c2a773",
      quoteInk: "#fffaf2",
      quoteMark: "#f4d8bd",
      artLabel: "#796c5d",
      overlay: "radial-gradient(circle at 92% 8%, #ead4bd 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "mono",
    label: "Mono",
    description:
      "Neutral monochrome palette for legal, finance, and highly focused information design.",
    tokens: {
      paper: "#f5f5f3",
      ink: "#171717",
      muted: "#626262",
      accent: "#2c2c2c",
      accentDeep: "#0f0f0f",
      accentSoft: "#dededb",
      line: "rgb(23 23 23 / 16%)",
      lineStrong: "rgb(23 23 23 / 32%)",
      panel: "#ffffff",
      radius: "8px",
      artOne: "#bababa",
      artTwo: "#eeeeee",
      quoteInk: "#ffffff",
      quoteMark: "#d2d2d2",
      artLabel: "#626262",
      overlay: "linear-gradient(135deg, transparent 0 70%, #dededb 70% 70.3%, transparent 70.3%)",
    },
  },
  {
    name: "mint",
    label: "Mint",
    description: "Bright mint palette for product growth, wellness, and collaborative planning.",
    tokens: {
      paper: "#effcf7",
      ink: "#15372e",
      muted: "#5a766b",
      accent: "#20a97f",
      accentDeep: "#117256",
      accentSoft: "#c9f0e1",
      line: "rgb(21 55 46 / 16%)",
      lineStrong: "rgb(21 55 46 / 28%)",
      panel: "#fbfffd",
      radius: "28px",
      artOne: "#9addc5",
      artTwo: "#f3c28a",
      quoteInk: "#ffffff",
      quoteMark: "#c4f4e0",
      artLabel: "#5a766b",
      overlay: "radial-gradient(circle at 92% 8%, #c9f0e1 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "copper",
    label: "Copper",
    description: "Confident copper palette for architecture, craft, and product storytelling.",
    tokens: {
      paper: "#fff5ed",
      ink: "#3f2318",
      muted: "#7c5d4e",
      accent: "#c46b35",
      accentDeep: "#8f4520",
      accentSoft: "#f4d0b6",
      line: "rgb(63 35 24 / 16%)",
      lineStrong: "rgb(63 35 24 / 28%)",
      panel: "#fffaf5",
      radius: "14px",
      artOne: "#e6ab7f",
      artTwo: "#8ec4b8",
      quoteInk: "#ffffff",
      quoteMark: "#f9dac2",
      artLabel: "#7c5d4e",
      overlay: "radial-gradient(circle at 92% 8%, #f4d0b6 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "violet",
    label: "Violet",
    description: "Modern violet palette for AI, innovation, and future-facing product narratives.",
    tokens: {
      paper: "#f6f4ff",
      ink: "#241d45",
      muted: "#716b91",
      accent: "#7357ef",
      accentDeep: "#4c35ba",
      accentSoft: "#ddd7ff",
      line: "rgb(36 29 69 / 16%)",
      lineStrong: "rgb(36 29 69 / 28%)",
      panel: "#ffffff",
      radius: "26px",
      artOne: "#bcb3fb",
      artTwo: "#f7a3c7",
      quoteInk: "#ffffff",
      quoteMark: "#e5e0ff",
      artLabel: "#716b91",
      overlay: "radial-gradient(circle at 92% 8%, #ddd7ff 0 14%, var(--paper) 15%)",
    },
  },
  {
    name: "ice",
    label: "Ice",
    description: "Cool blue-grey palette for enterprise, governance, and evidence-led decisions.",
    tokens: {
      paper: "#f1faff",
      ink: "#153148",
      muted: "#617f91",
      accent: "#3e9bd4",
      accentDeep: "#276b99",
      accentSoft: "#cfeaf8",
      line: "rgb(21 49 72 / 16%)",
      lineStrong: "rgb(21 49 72 / 28%)",
      panel: "#fbfeff",
      radius: "18px",
      artOne: "#a7d7f0",
      artTwo: "#edbd93",
      quoteInk: "#ffffff",
      quoteMark: "#d9f0ff",
      artLabel: "#617f91",
      overlay: "radial-gradient(circle at 92% 8%, #cfeaf8 0 14%, var(--paper) 15%)",
    },
  },
];

const variantModifiers = [
  {
    name: "airy",
    label: "Airy",
    description: "More breathing room and a quieter surface for reflective narratives.",
    css: `
      .slide { padding: 84px 100px 68px; }
      .panel, .stat { box-shadow: none; }
    `,
  },
  {
    name: "signal",
    label: "Signal",
    description: "Larger type and stronger labels for high-attention executive moments.",
    css: `
      .title { font-size: 84px; }
      .section-title { font-size: 68px; }
      .panel .label { letter-spacing: .22em; }
    `,
  },
  {
    name: "grid",
    label: "Grid",
    description: "A visible modular grid for systems thinking and operational storytelling.",
    css: `
      .slide { background-size: 44px 44px; }
      .slide::before { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 44px 44px; }
    `,
  },
  {
    name: "poster",
    label: "Poster",
    description: "Poster-like capitalization and borders for campaigns and bold announcements.",
    css: `
      .title, .section-title { text-transform: uppercase; }
      .panel, .stat { border-width: 2px; }
      .kicker { letter-spacing: .24em; }
    `,
  },
  {
    name: "soft",
    label: "Soft",
    description: "Rounded surfaces and translucent panels for friendly collaborative work.",
    css: `
      :root { --radius: 44px; }
      .panel, .stat, .quote { backdrop-filter: blur(12px); }
      .slide:not(.closing)::after { opacity: .6; }
    `,
  },
  {
    name: "frame",
    label: "Frame",
    description: "A strong outer frame that gives every page a distinct poster boundary.",
    css: `
      .slide { border: 2px solid var(--line-strong); }
      .slide:not(.closing)::after { border-width: 3px; }
    `,
  },
  {
    name: "mono",
    label: "Mono",
    description: "Monospace-led typography for technical, analytical, and product narratives.",
    css: `
      :root { --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
      .title, .section-title { font-family: var(--sans); letter-spacing: -.08em; }
      .panel h2, .step h2 { letter-spacing: .02em; }
    `,
  },
  {
    name: "glow",
    label: "Glow",
    description: "A luminous accent treatment for launches, demos, and future-facing concepts.",
    css: `
      .panel, .stat { box-shadow: 0 0 42px color-mix(in srgb, var(--accent) 16%, transparent); }
      .quote { box-shadow: 0 0 48px color-mix(in srgb, var(--accent) 22%, transparent); }
    `,
  },
  {
    name: "editorial",
    label: "Editorial",
    description: "Serif-led hierarchy for essays, research, portfolios, and considered proposals.",
    css: `
      .title, .section-title { font-family: var(--serif); font-weight: 600; }
      .lede, .section-lede { font-family: var(--serif); }
    `,
  },
  {
    name: "compact",
    label: "Compact",
    description:
      "Denser spacing for information-rich reviews where every page must carry more detail.",
    css: `
      .slide { padding: 64px 72px 54px; }
      .section-title { font-size: 56px; }
      .hero-grid, .compare { margin-top: 32px; }
    `,
  },
];

const familyLabels = {
  aurora: "Aurora",
  midnight: "Midnight",
  swiss: "Swiss",
  brutalist: "Brutalist",
  organic: "Organic",
  datanoir: "Data Noir",
  luxury: "Luxury",
  retrofuture: "Retro Future",
};

function paletteCss(tokens) {
  return `
    :root {
      --paper: ${tokens.paper};
      --ink: ${tokens.ink};
      --muted: ${tokens.muted};
      --accent: ${tokens.accent};
      --accent-deep: ${tokens.accentDeep};
      --accent-soft: ${tokens.accentSoft};
      --line: ${tokens.line};
      --line-strong: ${tokens.lineStrong};
      --panel: ${tokens.panel};
      --radius: ${tokens.radius};
      --art-one: ${tokens.artOne};
      --art-two: ${tokens.artTwo};
      --quote-ink: ${tokens.quoteInk};
      --quote-mark: ${tokens.quoteMark};
      --art-label: ${tokens.artLabel};
      --slide-overlay: ${tokens.overlay};
    }
  `;
}

function slide(id, body) {
  return `<section class="slide" data-pl-slide data-slide-id="${id}">${body}</section>`;
}

function commonSlides(name, label) {
  return [
    slide(
      "cover",
      `<div class="cover-art" aria-hidden="true"><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="orb orb-c"></div><span class="art-label">${label} / 01</span></div>
       <div class="cover-copy"><p class="kicker">PresentLab / ${label}</p><h1 class="title">A strong visual system makes the <em>story easier to follow.</em></h1><p class="lede">A reusable HTML-first template for AI agents that need polished slides, printable pages, and reliable handoff artifacts.</p><div class="meta-line"><span>16:9 canvas</span><span>Template ${name.toUpperCase()}</span></div></div><p class="footer">01 / Cover composition</p>`,
    ),
    slide(
      "thesis",
      `<div class="section-head"><div><p class="kicker">01 / Narrative</p><h1 class="section-title">One clear claim gives the slide its shape.</h1><p class="section-lede">The layout keeps the main idea visible while the supporting detail stays close enough to scan.</p></div><span class="page-no">02</span></div><div class="hero-grid"><article class="panel"><span class="label">Signal</span><h2>Lead with the point</h2><p>Use a direct title that names the subject or the finding. The audience should know what to look at before they read the detail.</p><ul class="list"><li>Short title with a visible subject</li><li>One visual priority per page</li><li>Evidence close to the claim</li></ul></article><article class="panel"><span class="label">System</span><h2>Keep the rhythm stable</h2><p>Repeat margins, type scale, and page markers so the deck feels intentional even when an agent creates new content.</p><ul class="list"><li>Consistent spacing tokens</li><li>Accessible text hierarchy</li><li>Local, deterministic assets</li></ul></article></div><p class="footer">02 / Thesis layout</p>`,
    ),
    slide(
      "metrics",
      `<div class="section-head"><div><p class="kicker">02 / Evidence</p><h1 class="section-title">A small set of metrics can anchor a large idea.</h1><p class="section-lede">The same component can present a scorecard, a benchmark, or a design-system health check.</p></div><span class="page-no">03</span></div><div class="stat-grid"><article class="stat"><span class="value">100</span><span class="label">distinct visual systems in this gallery</span></article><article class="stat"><span class="value">1200</span><span class="label">sample slides rendered from HTML sources</span></article><article class="stat"><span class="value">3</span><span class="label">handoff formats per template folder</span></article></div><div class="bar-layout"><div class="bar-chart"><div class="bar"><i style="height: 42%"></i><span>Brief</span></div><div class="bar"><i style="height: 66%"></i><span>Design</span></div><div class="bar"><i style="height: 84%"></i><span>Render</span></div><div class="bar"><i style="height: 100%"></i><span>Review</span></div></div><p class="bar-note">The workflow gets stronger when validation and visual review happen before delivery.</p></div><p class="footer">03 / Metric board</p>`,
    ),
    slide(
      "comparison",
      `<div class="section-head"><div><p class="kicker">03 / Choice</p><h1 class="section-title">The right template changes how the audience reads.</h1><p class="section-lede">Style is a communication decision. Match the visual grammar to the audience, topic, and level of urgency.</p></div><span class="page-no">04</span></div><div class="compare"><article class="panel"><span class="label">Quiet narrative</span><h2>Make space for reflection</h2><p>Use generous margins, low contrast, and a restrained accent when the story depends on trust, nuance, or a considered decision.</p><ul class="list"><li>Editorial, portfolio, or strategy work</li><li>Longer reading moments</li><li>Subtle hierarchy</li></ul></article><article class="panel"><span class="label">High signal</span><h2>Make the change visible</h2><p>Use contrast, strong alignment, and a clear focal point when the deck must help a group act quickly.</p><ul class="list"><li>Launch, operating review, or product work</li><li>Short attention windows</li><li>Decisive visual cues</li></ul></article></div><p class="footer">04 / Comparison layout</p>`,
    ),
    slide(
      "process",
      `<div class="section-head"><div><p class="kicker">04 / Workflow</p><h1 class="section-title">From brief to handoff, the system stays inspectable.</h1><p class="section-lede">The template gives an AI agent a stable surface for content while the renderer protects output quality.</p></div><span class="page-no">05</span></div><div class="steps"><article class="step"><span class="number">01</span><h2>Frame</h2><p>Choose a style and write a direct narrative outline.</p></article><article class="step"><span class="number">02</span><h2>Compose</h2><p>Place content into an HTML slide contract with local tokens.</p></article><article class="step"><span class="number">03</span><h2>Validate</h2><p>Check metadata, ids, readability, and image accessibility.</p></article><article class="step"><span class="number">04</span><h2>Deliver</h2><p>Render PDF and PPTX, then review the actual pages.</p></article></div><p class="footer">05 / Four-step workflow</p>`,
    ),
    slide(
      "audience",
      `<div class="section-head"><div><p class="kicker">05 / Audience</p><h1 class="section-title">A system can feel distinctive without becoming difficult to use.</h1><p class="section-lede">The gallery gives both decision-makers and makers a shared visual language for moving from idea to action.</p></div><span class="page-no">06</span></div><div class="hero-grid"><article class="panel"><span class="label">For decision-makers</span><h2>Scan the signal</h2><p>Strong hierarchy makes the recommendation, risk, or opportunity visible before the detail asks for attention.</p><ul class="list"><li>Clear claim at the top</li><li>Evidence grouped by meaning</li><li>Next action easy to find</li></ul></article><article class="panel"><span class="label">For builders</span><h2>Reuse the structure</h2><p>Stable HTML sections let an AI agent vary the voice and palette while preserving the page contract.</p><ul class="list"><li>Named slide patterns</li><li>Predictable local tokens</li><li>Portable source and exports</li></ul></article></div><p class="footer">06 / Audience alignment</p>`,
    ),
    slide(
      "system",
      `<div class="section-head"><div><p class="kicker">06 / System</p><h1 class="section-title">Tokens carry the visual logic across every page.</h1><p class="section-lede">A template becomes reusable when typography, spacing, color, and shape are explicit enough for an agent to preserve.</p></div><span class="page-no">07</span></div><div class="stat-grid"><article class="stat"><span class="value">08</span><span class="label">structural families for different narrative moods</span></article><article class="stat"><span class="value">12</span><span class="label">pages that form a complete sample story</span></article><article class="stat"><span class="value">01</span><span class="label">source of truth for each generated handoff</span></article></div><div class="hero-grid"><article class="panel"><span class="label">Palette</span><h2>Make contrast intentional</h2><p>Use one primary accent, one supporting surface, and a readable muted tone so content remains the loudest element.</p></article><article class="panel"><span class="label">Type</span><h2>Make hierarchy predictable</h2><p>Keep the title, section lead, body, and metadata at stable levels so a new page still feels like part of the same system.</p></article></div><p class="footer">07 / Design tokens</p>`,
    ),
    slide(
      "roadmap",
      `<div class="section-head"><div><p class="kicker">07 / Roadmap</p><h1 class="section-title">Move from a good first draft to a dependable release.</h1><p class="section-lede">The same four checkpoints work for an AI-generated presentation, catalog, or printable report.</p></div><span class="page-no">08</span></div><div class="steps"><article class="step"><span class="number">01</span><h2>Discover</h2><p>Choose the family, palette, and narrative job for the deck.</p></article><article class="step"><span class="number">02</span><h2>Compose</h2><p>Write semantic HTML with stable ids and meaningful headings.</p></article><article class="step"><span class="number">03</span><h2>Review</h2><p>Inspect the rendered pages for rhythm, contrast, and overflow.</p></article><article class="step"><span class="number">04</span><h2>Ship</h2><p>Commit the source and handoff formats as one portable unit.</p></article></div><p class="footer">08 / Release roadmap</p>`,
    ),
    slide(
      "quality",
      `<div class="section-head"><div><p class="kicker">08 / Quality</p><h1 class="section-title">Quality is visible in the small details.</h1><p class="section-lede">Automated checks protect the contract; visual review protects the experience that the audience actually receives.</p></div><span class="page-no">09</span></div><div class="compare"><article class="panel"><span class="label">Contract checks</span><h2>Make it inspectable</h2><p>Every generated deck should be easy for a toolchain to understand and safe for an agent to extend.</p><ul class="list"><li>Metadata and format are declared</li><li>Slide ids are unique and stable</li><li>Assets stay local and deterministic</li></ul></article><article class="panel"><span class="label">Visual checks</span><h2>Make it believable</h2><p>Rendered pages should hold together at a glance and remain useful when exported to PDF or PowerPoint.</p><ul class="list"><li>Contrast and spacing remain calm</li><li>Headlines do not collide or wrap badly</li><li>All handoff formats contain every page</li></ul></article></div><p class="footer">09 / Quality review</p>`,
    ),
    slide(
      "voice",
      `<div class="section-head"><div><p class="kicker">05 / Voice</p><h1 class="section-title">Good design makes precise writing easier to trust.</h1></div><span class="page-no">06</span></div><div class="quote-layout"><blockquote class="quote"><span class="quote-mark">“</span><p>When each slide has one job, the audience spends less time decoding the layout and more time considering the idea.</p><cite>PresentLab design principle</cite></blockquote><aside class="quote-aside"><span class="value">1 job</span><p>per slide keeps the narrative legible and gives the next slide room to move.</p></aside></div><p class="footer">06 / Editorial quote</p>`,
    ),
    slide(
      "handoff",
      `<div class="section-head"><div><p class="kicker">10 / Handoff</p><h1 class="section-title">A template becomes useful when the next person can pick it up.</h1><p class="section-lede">Keep the editable source and the rendered examples together so an agent, designer, or reviewer can continue the work without guessing.</p></div><span class="page-no">11</span></div><div class="hero-grid"><article class="panel"><span class="label">Source</span><h2>deck.html</h2><p>Semantic markup, local styles, metadata, and named slide ids make the starting point inspectable and adaptable.</p><ul class="list"><li>Easy to diff and review</li><li>Safe for deterministic rendering</li><li>Ready for agent composition</li></ul></article><article class="panel"><span class="label">Handoff</span><h2>deck.pdf + deck.pptx</h2><p>Rendered artifacts show exactly how the source behaves when shared, printed, or opened in a presentation viewer.</p><ul class="list"><li>One folder, three portable files</li><li>Same page order in every format</li><li>Fast visual comparison</li></ul></article></div><p class="footer">11 / Portable handoff</p>`,
    ),
    slide(
      "close",
      `<div class="cover-copy"><p class="kicker">PresentLab / Handoff</p><h1 class="title">Choose a style.<br /><em>Keep the story clear.</em></h1><p class="lede">Every folder in this gallery contains the HTML source plus rendered PDF and PPTX outputs for a fast, inspectable starting point.</p><div class="meta-line"><span>Validate first</span><span>Review every page</span></div></div><p class="footer">12 / Closing frame</p>`,
    ),
  ];
}

function htmlForTemplate(template) {
  const normalizeDisplayText = (value) =>
    value
      .replaceAll(String.fromCodePoint(0xc2, 0xb7), " / ")
      .replaceAll(String.fromCodePoint(0xe2, 0x20ac, 0x153), "&ldquo;");
  const title = `PresentLab ${normalizeDisplayText(template.label)} template gallery`;
  const slides = commonSlides(
    template.name,
    normalizeDisplayText(template.visualLabel ?? template.label),
  )
    .join("\n")
    .replaceAll("05 / Voice", "09 / Voice")
    .replace(
      '<span class="page-no">06</span></div><div class="quote-layout">',
      '<span class="page-no">10</span></div><div class="quote-layout">',
    )
    .replaceAll("06 / Editorial quote", "10 / Editorial quote")
    .replaceAll(String.fromCodePoint(0xe2, 0x20ac, 0x153), "&ldquo;");
  return `<!doctype html>
<html lang="en" data-pl-format="16:9" data-pl-title="${title}" data-pl-theme="${template.name}">
<head>
  <meta charset="utf-8" />
  <meta name="description" content="${template.description}" />
  <style>${baseCss}
${template.css}</style>
</head>
<body class="theme-${template.name}">
${slides}
</body>
</html>
`;
}

const baseTemplates = Object.keys(styleCss).map((name) => ({
  name,
  label: familyLabels[name],
  visualLabel: familyLabels[name],
  description: templateDescriptions[name],
  family: name,
  palette: "base",
  modifier: "base",
  css: styleCss[name],
  theme: themeTokens[name],
}));

const variantTemplates = [];
for (const palette of paletteVariants) {
  for (const family of baseTemplates) {
    if (variantTemplates.length >= 92) {
      break;
    }
    const modifier = variantModifiers[variantTemplates.length % variantModifiers.length];
    const name = `${family.name}-${palette.name}`;
    variantTemplates.push({
      name,
      label: `${family.label} / ${palette.label} / ${modifier.label}`,
      visualLabel: `${family.label} · ${palette.label}`,
      description: `${palette.description} ${family.description} ${modifier.description}`,
      family: family.name,
      palette: palette.name,
      modifier: modifier.name,
      css: `${family.css}\n${paletteCss(palette.tokens)}\n${modifier.css}`,
      theme: {
        ...family.theme,
        ...palette.tokens,
        family: family.name,
        palette: palette.name,
        modifier: modifier.name,
      },
    });
  }
}

const templates = [...baseTemplates, ...variantTemplates];

await mkdir(templatesRoot, { recursive: true });
await mkdir(themesRoot, { recursive: true });
await mkdir(artifactsRoot, { recursive: true });
const prettierOptions = (await prettier.resolveConfig(join(root, "package.json"))) ?? {};

for (const template of templates) {
  const templateDir = join(templatesRoot, template.name);
  const artifactDir = join(artifactsRoot, template.name);
  await mkdir(templateDir, { recursive: true });
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(artifactDir, { recursive: true });
  const htmlPath = join(templateDir, "deck.html");
  const formattedHtml = await prettier.format(htmlForTemplate(template), {
    ...prettierOptions,
    filepath: htmlPath,
  });
  await writeFile(htmlPath, formattedHtml, "utf8");
  await writeFile(
    join(themesRoot, template.name + ".json"),
    `${JSON.stringify({ name: template.name, title: template.label, description: template.description, format: "16:9", tokens: template.theme }, null, 2)}\n`,
    "utf8",
  );

  execFileSync(
    process.execPath,
    [
      join(root, "dist", "cli.js"),
      "render",
      "--input",
      "templates/" + template.name + "/deck.html",
      "--output",
      ".artifacts/template-gallery/" + template.name,
      "--format",
      "png,pdf,pptx",
    ],
    { cwd: root, stdio: "inherit" },
  );
  await copyFile(join(artifactDir, "deck.pdf"), join(templateDir, "deck.pdf"));
  await copyFile(join(artifactDir, "deck.pptx"), join(templateDir, "deck.pptx"));
  console.log("Built " + template.name + ": HTML + PDF + PPTX");
}

const templateIndex = templates.map(({ name, label, description, family, palette, modifier }) => ({
  name,
  title: label + " template",
  description,
  family,
  palette,
  modifier,
  path: "templates/" + name + "/deck.html",
}));
const repositoryTemplateIndex = templateIndex.map(
  ({ name, title, description, family, palette, modifier }) => ({
    name,
    title,
    description,
    family,
    palette,
    modifier,
    path: name + "/deck.html",
  }),
);
await writeFile(
  join(templatesRoot, "index.json"),
  `${JSON.stringify(repositoryTemplateIndex, null, 2)}\n`,
  "utf8",
);
await writeFile(
  join(root, "resources", "templates", "index.json"),
  `${JSON.stringify(templateIndex, null, 2)}\n`,
  "utf8",
);
await writeFile(
  join(themesRoot, "index.json"),
  `${JSON.stringify(
    templates.map(({ name, label, description, family, palette, modifier }) => ({
      name,
      title: label,
      description,
      family,
      palette,
      modifier,
      path: "resources/themes/" + name + ".json",
    })),
    null,
    2,
  )}\n`,
  "utf8",
);

console.log("Built " + templates.length + " template folders under " + templatesRoot + ".");
