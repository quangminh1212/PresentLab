import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";

import { humanizeStyleName, styleGroups, stylePresetCss } from "./style-presets.mjs";
import {
  createDiversityProfile,
  decorateSlides,
  diversifyContent,
  diversityCss,
} from "./template-diversity.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = join(root, "templates");
const themesRoot = join(root, "resources", "themes");
const paletteRepositoryRoot = join(templatesRoot, "palettes");
const paletteResourceRoot = join(root, "resources", "palettes");
const artifactsRoot = join(root, ".artifacts", "template-gallery");
const coreTemplateCount = 100;
const stylePresetCount = styleGroups.reduce((total, group) => total + group.names.length, 0);
const galleryTemplateCount = coreTemplateCount + stylePresetCount;
const gallerySlideCount = galleryTemplateCount * 45;
const renderConcurrency = Math.max(
  1,
  Number.parseInt(process.env.PRESENTLAB_GALLERY_CONCURRENCY ?? "3", 10) || 3,
);

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

const additionalCss = `
.slide > *:not(.cover-art) { position: relative; z-index: 1; }
.layout-statement { justify-content: center; }
.layout-statement .statement-grid { display: grid; grid-template-columns: 1.35fr .65fr; gap: 54px; align-items: end; margin-top: 36px; }
.layout-statement .statement { max-width: 980px; font-size: 72px; font-weight: 850; letter-spacing: -.065em; line-height: .98; }
.layout-statement .statement em { color: var(--accent); font-style: normal; }
.layout-statement .statement-rail { padding: 22px 0 22px 26px; border-left: 4px solid var(--accent); color: var(--muted); font-size: 20px; line-height: 1.42; }
.layout-statement .statement-rail strong { display: block; margin-bottom: 12px; color: var(--ink); font-size: 28px; letter-spacing: -.03em; }
.layout-agenda .agenda-list { margin-top: 42px; border-top: 1px solid var(--line); }
.layout-agenda .agenda-row { display: grid; grid-template-columns: 86px 1fr 1.15fr; gap: 22px; align-items: center; min-height: 82px; padding: 0 18px; border-bottom: 1px solid var(--line); }
.layout-agenda .agenda-row.active { background: var(--accent-soft); }
.layout-agenda .agenda-no { color: var(--accent); font-size: 32px; font-weight: 900; letter-spacing: -.06em; }
.layout-agenda .agenda-row h2 { font-size: 25px; letter-spacing: -.03em; }
.layout-agenda .agenda-row p { color: var(--muted); font-size: 17px; line-height: 1.3; }
.layout-timeline .timeline-track { display: grid; grid-template-columns: repeat(5, 1fr); margin-top: 86px; border-top: 2px solid var(--accent); }
.layout-timeline .timeline-item { position: relative; min-height: 250px; padding: 34px 22px 0 0; border-right: 1px solid var(--line); }
.layout-timeline .timeline-item:not(:first-child) { padding-left: 22px; }
.layout-timeline .timeline-item:last-child { border-right: 0; }
.layout-timeline .timeline-item::before { position: absolute; top: -11px; left: 0; width: 18px; height: 18px; border: 4px solid var(--paper); border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 1px var(--accent); content: ""; }
.layout-timeline .timeline-item h2 { margin-top: 16px; font-size: 24px; letter-spacing: -.03em; }
.layout-timeline .timeline-item p { margin-top: 10px; color: var(--muted); font-size: 17px; line-height: 1.38; }
.layout-timeline .timeline-date { color: var(--accent); font-size: 14px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
.layout-matrix .matrix-wrap { display: grid; grid-template-columns: 34px 1fr; grid-template-rows: 24px 1fr; gap: 12px; margin-top: 32px; }
.layout-matrix .matrix-y { display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 13px; letter-spacing: .14em; text-transform: uppercase; writing-mode: vertical-rl; transform: rotate(180deg); }
.layout-matrix .matrix-x { display: grid; grid-template-columns: 1fr 1fr; color: var(--muted); font-size: 13px; letter-spacing: .14em; text-align: center; text-transform: uppercase; }
.layout-matrix .matrix { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; min-height: 410px; }
.layout-matrix .matrix-cell { display: flex; flex-direction: column; justify-content: space-between; min-height: 195px; padding: 22px; border: 1px solid var(--line); background: var(--panel); }
.layout-matrix .matrix-cell:nth-child(2), .layout-matrix .matrix-cell:nth-child(3) { background: var(--accent-soft); }
.layout-matrix .matrix-cell h2 { font-size: 24px; letter-spacing: -.03em; }
.layout-matrix .matrix-cell p { max-width: 360px; color: var(--muted); font-size: 16px; line-height: 1.35; }
.layout-matrix .matrix-cell .tag { color: var(--accent-deep); font-size: 13px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
.layout-table .data-table { width: 100%; margin-top: 32px; border-collapse: collapse; font-size: 17px; }
.layout-table .data-table th { padding: 14px 16px; border-bottom: 2px solid var(--ink); color: var(--muted); font-size: 13px; letter-spacing: .13em; text-align: left; text-transform: uppercase; }
.layout-table .data-table td { padding: 17px 16px; border-bottom: 1px solid var(--line); }
.layout-table .data-table tbody tr:nth-child(even) { background: var(--accent-soft); }
.layout-table .data-table td:first-child { color: var(--ink); font-weight: 800; }
.layout-table .data-table .signal { color: var(--accent-deep); font-weight: 900; }
.layout-funnel .funnel-stack { display: flex; flex-direction: column; gap: 8px; align-items: center; margin-top: 34px; }
.layout-funnel .funnel-step { display: flex; min-height: 66px; align-items: center; justify-content: space-between; padding: 0 24px; border: 1px solid var(--line-strong); background: var(--accent-soft); color: var(--ink); }
.layout-funnel .funnel-step:nth-child(1) { width: 100%; background: var(--panel); }
.layout-funnel .funnel-step:nth-child(2) { width: 82%; }
.layout-funnel .funnel-step:nth-child(3) { width: 64%; background: var(--accent); color: var(--quote-ink); }
.layout-funnel .funnel-step:nth-child(4) { width: 46%; background: var(--accent-deep); color: var(--quote-ink); }
.layout-funnel .funnel-step:nth-child(5) { width: 30%; background: var(--ink); color: var(--paper); }
.layout-funnel .funnel-step strong { font-size: 22px; letter-spacing: -.03em; }
.layout-funnel .funnel-step span { font-size: 15px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.layout-personas .persona-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 38px; }
.layout-personas .persona { min-height: 360px; padding: 26px; border: 1px solid var(--line); background: var(--panel); }
.layout-personas .persona:nth-child(2) { transform: translateY(28px); }
.layout-personas .persona-mark { display: flex; width: 64px; height: 64px; align-items: center; justify-content: center; border-radius: 50%; background: var(--accent); color: var(--quote-ink); font-size: 22px; font-weight: 900; }
.layout-personas .persona h2 { margin-top: 26px; font-size: 28px; letter-spacing: -.04em; }
.layout-personas .persona p { margin-top: 12px; color: var(--muted); font-size: 17px; line-height: 1.38; }
.layout-personas .persona .persona-need { display: block; margin-top: 28px; padding-top: 13px; border-top: 1px solid var(--line); color: var(--accent-deep); font-size: 14px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.layout-before-after .before-after { display: grid; grid-template-columns: 1fr 110px 1fr; gap: 22px; align-items: center; margin-top: 44px; }
.layout-before-after .state-card { min-height: 360px; padding: 32px; border: 1px solid var(--line); background: var(--panel); }
.layout-before-after .state-card.after { border-color: var(--accent); background: var(--accent-soft); }
.layout-before-after .state-card h2 { margin-top: 18px; font-size: 34px; letter-spacing: -.045em; }
.layout-before-after .state-card p { margin-top: 16px; color: var(--muted); font-size: 18px; line-height: 1.4; }
.layout-before-after .state-label { color: var(--accent-deep); font-size: 14px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
.layout-before-after .state-arrow { display: flex; align-items: center; justify-content: center; color: var(--accent); font-size: 54px; font-weight: 900; }
.layout-swimlane .swimlane { display: grid; grid-template-columns: 148px 1fr; margin-top: 34px; border-top: 1px solid var(--line); }
.layout-swimlane .lane-name { display: flex; align-items: center; padding-right: 18px; border-right: 1px solid var(--line); color: var(--accent-deep); font-size: 15px; font-weight: 900; letter-spacing: .11em; text-transform: uppercase; }
.layout-swimlane .lane { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; min-height: 92px; padding: 12px 0 12px 18px; border-bottom: 1px solid var(--line); }
.layout-swimlane .lane-block { display: flex; align-items: center; min-height: 62px; padding: 14px; border-left: 4px solid var(--accent); background: var(--panel); color: var(--muted); font-size: 15px; line-height: 1.25; }
.layout-swimlane .lane-block.strong { border-color: var(--accent-deep); background: var(--accent-soft); color: var(--ink); font-weight: 800; }
.layout-decision .decision-tree { display: grid; grid-template-columns: 1fr 1.1fr 1fr; gap: 22px; align-items: center; margin-top: 40px; }
.layout-decision .decision-branch { display: grid; gap: 16px; }
.layout-decision .decision-node { padding: 22px; border: 1px solid var(--line); background: var(--panel); }
.layout-decision .decision-node h2 { font-size: 23px; letter-spacing: -.03em; }
.layout-decision .decision-node p { margin-top: 9px; color: var(--muted); font-size: 16px; line-height: 1.32; }
.layout-decision .decision-core { display: flex; min-height: 210px; align-items: center; justify-content: center; padding: 34px; border: 3px solid var(--accent); border-radius: var(--radius); background: var(--accent-soft); color: var(--ink); font-size: 34px; font-weight: 850; letter-spacing: -.05em; line-height: 1.02; text-align: center; }
.layout-decision .decision-branch:last-child .decision-node { border-color: var(--accent); }
.layout-scorecard .scorecard { margin-top: 36px; border-top: 2px solid var(--ink); }
.layout-scorecard .score-row { display: grid; grid-template-columns: 1.2fr .6fr .6fr 1.4fr; gap: 18px; align-items: center; min-height: 72px; padding: 0 14px; border-bottom: 1px solid var(--line); }
.layout-scorecard .score-row:nth-child(odd) { background: var(--accent-soft); }
.layout-scorecard .score-row strong { font-size: 21px; letter-spacing: -.03em; }
.layout-scorecard .score-value { color: var(--accent-deep); font-size: 27px; font-weight: 900; }
.layout-scorecard .score-status { display: inline-flex; width: max-content; padding: 7px 10px; border: 1px solid var(--line-strong); color: var(--accent-deep); font-size: 12px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.layout-scorecard .score-note { color: var(--muted); font-size: 15px; line-height: 1.25; }
.layout-quote-wall .quote-wall { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 38px; }
.layout-quote-wall .mini-quote { min-height: 330px; padding: 28px; border-top: 6px solid var(--accent); background: var(--panel); }
.layout-quote-wall .mini-quote:nth-child(2) { border-color: var(--accent-deep); transform: translateY(24px); }
.layout-quote-wall .mini-quote:nth-child(3) { border-color: var(--ink); }
.layout-quote-wall .mini-quote-mark { color: var(--accent); font-family: Georgia, serif; font-size: 70px; line-height: .65; }
.layout-quote-wall .mini-quote p { margin-top: 24px; font-family: var(--serif); font-size: 25px; letter-spacing: -.03em; line-height: 1.14; }
.layout-quote-wall .mini-quote cite { display: block; margin-top: 26px; color: var(--muted); font-size: 13px; font-style: normal; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.layout-horizons .horizon-rail { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 42px; }
.layout-horizons .horizon { min-height: 340px; padding: 26px; border-top: 9px solid var(--accent); background: var(--panel); }
.layout-horizons .horizon:nth-child(2) { border-color: var(--accent-deep); }
.layout-horizons .horizon:nth-child(3) { border-color: var(--ink); }
.layout-horizons .horizon .horizon-no { color: var(--accent-deep); font-size: 48px; font-weight: 900; letter-spacing: -.08em; }
.layout-horizons .horizon h2 { margin-top: 24px; font-size: 27px; letter-spacing: -.04em; }
.layout-horizons .horizon p { margin-top: 12px; color: var(--muted); font-size: 17px; line-height: 1.38; }
.layout-horizons .horizon small { display: block; margin-top: 28px; color: var(--accent-deep); font-size: 13px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.layout-architecture .architecture-stack { display: grid; gap: 10px; margin-top: 34px; }
.layout-architecture .architecture-layer { display: grid; grid-template-columns: 200px 1fr 160px; gap: 20px; align-items: center; min-height: 74px; padding: 0 22px; border: 1px solid var(--line); background: var(--panel); }
.layout-architecture .architecture-layer:nth-child(2), .layout-architecture .architecture-layer:nth-child(4) { background: var(--accent-soft); }
.layout-architecture .architecture-layer strong { color: var(--accent-deep); font-size: 16px; letter-spacing: .1em; text-transform: uppercase; }
.layout-architecture .architecture-layer span { color: var(--muted); font-size: 17px; line-height: 1.3; }
.layout-architecture .architecture-layer em { color: var(--ink); font-size: 14px; font-style: normal; font-weight: 900; text-align: right; }
.layout-storyboard .storyboard { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 40px; }
.layout-storyboard .story-frame { min-height: 360px; padding: 20px; border: 1px solid var(--line); background: var(--panel); }
.layout-storyboard .story-frame:nth-child(even) { transform: translateY(28px); }
.layout-storyboard .story-frame .frame-mark { display: flex; height: 160px; align-items: center; justify-content: center; border: 1px solid var(--line-strong); background: var(--accent-soft); color: var(--accent-deep); font-size: 56px; font-weight: 900; }
.layout-storyboard .story-frame h2 { margin-top: 22px; font-size: 23px; letter-spacing: -.03em; }
.layout-storyboard .story-frame p { margin-top: 9px; color: var(--muted); font-size: 15px; line-height: 1.32; }
.layout-signal .signal-board { display: grid; grid-template-columns: 1.15fr .85fr; gap: 28px; align-items: stretch; margin-top: 38px; }
.layout-signal .signal-main { display: flex; flex-direction: column; justify-content: center; min-height: 340px; padding: 34px; background: var(--accent); color: var(--quote-ink); }
.layout-signal .signal-main .signal-value { font-size: 142px; font-weight: 900; letter-spacing: -.11em; line-height: .82; }
.layout-signal .signal-main .signal-caption { max-width: 500px; margin-top: 28px; font-size: 22px; line-height: 1.2; }
.layout-signal .signal-side { display: flex; flex-direction: column; justify-content: space-between; min-height: 340px; padding: 26px; border: 1px solid var(--line); background: var(--panel); }
.layout-signal .signal-ribbon { display: flex; height: 84px; align-items: end; gap: 8px; border-bottom: 2px solid var(--line); }
.layout-signal .signal-ribbon i { display: block; flex: 1; min-width: 20px; background: var(--accent-deep); }
.layout-signal .signal-side p { color: var(--muted); font-size: 18px; line-height: 1.35; }
.layout-risk-map .risk-layout { display: grid; grid-template-columns: 1fr 1.15fr; gap: 42px; align-items: center; margin-top: 34px; }
.layout-risk-map .risk-map { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; min-height: 350px; }
.layout-risk-map .risk-cell { display: flex; align-items: center; justify-content: center; border: 1px solid var(--line); background: var(--panel); color: var(--muted); font-size: 13px; font-weight: 800; }
.layout-risk-map .risk-cell:nth-child(7), .layout-risk-map .risk-cell:nth-child(13), .layout-risk-map .risk-cell:nth-child(19) { background: var(--accent-soft); color: var(--accent-deep); }
.layout-risk-map .risk-cell:nth-child(20), .layout-risk-map .risk-cell:nth-child(24), .layout-risk-map .risk-cell:nth-child(25) { background: var(--accent); color: var(--quote-ink); }
.layout-risk-map .risk-legend { display: grid; gap: 18px; }
.layout-risk-map .risk-band { padding: 18px 22px; border-left: 5px solid var(--accent); background: var(--panel); }
.layout-risk-map .risk-band strong { display: block; margin-bottom: 7px; font-size: 22px; }
.layout-risk-map .risk-band p { color: var(--muted); font-size: 16px; line-height: 1.32; }
.layout-equation .equation { display: grid; grid-template-columns: 1fr 70px 1fr 70px 1.2fr; gap: 12px; align-items: center; margin-top: 54px; }
.layout-equation .equation-card { min-height: 250px; padding: 26px; border: 1px solid var(--line); background: var(--panel); }
.layout-equation .equation-card.solution { border-color: var(--accent); background: var(--accent-soft); }
.layout-equation .equation-card.result { border: 3px solid var(--accent); }
.layout-equation .equation-card .equation-label { color: var(--accent-deep); font-size: 13px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
.layout-equation .equation-card h2 { margin-top: 22px; font-size: 28px; letter-spacing: -.04em; }
.layout-equation .equation-card p { margin-top: 12px; color: var(--muted); font-size: 16px; line-height: 1.33; }
.layout-equation .equation-symbol { color: var(--accent); font-size: 52px; font-weight: 900; text-align: center; }
.layout-case-study .case-study { display: grid; grid-template-columns: 280px 1fr; gap: 40px; margin-top: 34px; }
.layout-case-study .case-facts { padding-right: 28px; border-right: 1px solid var(--line); }
.layout-case-study .case-facts strong { display: block; color: var(--accent); font-size: 62px; letter-spacing: -.09em; line-height: .9; }
.layout-case-study .case-facts h2 { margin-top: 22px; font-size: 25px; letter-spacing: -.04em; }
.layout-case-study .case-facts p { margin-top: 10px; color: var(--muted); font-size: 16px; line-height: 1.35; }
.layout-case-study .case-story { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.layout-case-study .case-step { padding-top: 14px; border-top: 5px solid var(--accent); }
.layout-case-study .case-step:nth-child(2) { border-color: var(--accent-deep); }
.layout-case-study .case-step:nth-child(3) { border-color: var(--ink); }
.layout-case-study .case-step .step-no { color: var(--accent-deep); font-size: 15px; font-weight: 900; letter-spacing: .1em; }
.layout-case-study .case-step h2 { margin-top: 22px; font-size: 25px; letter-spacing: -.04em; }
.layout-case-study .case-step p { margin-top: 12px; color: var(--muted); font-size: 17px; line-height: 1.38; }
.layout-appendix .appendix { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; margin-top: 38px; }
.layout-appendix .appendix-column { border-top: 2px solid var(--ink); }
.layout-appendix .appendix-row { display: grid; grid-template-columns: 58px 1fr; gap: 14px; align-items: start; min-height: 66px; padding: 16px 0; border-bottom: 1px solid var(--line); }
.layout-appendix .appendix-no { color: var(--accent); font-size: 25px; font-weight: 900; }
.layout-appendix .appendix-row h2 { font-size: 20px; letter-spacing: -.03em; }
.layout-appendix .appendix-row p { margin-top: 4px; color: var(--muted); font-size: 15px; line-height: 1.28; }
.family-swiss .layout-matrix .matrix-cell, .family-datanoir .layout-matrix .matrix-cell { border-radius: 0; }
.family-brutalist .layout-statement .statement-rail, .family-retrofuture .layout-statement .statement-rail { border-left-width: 8px; }
.family-organic .layout-personas .persona, .family-aurora .layout-personas .persona { border-radius: var(--radius); }
.family-midnight .layout-signal .signal-main, .family-retrofuture .layout-signal .signal-main { box-shadow: 0 0 48px rgb(0 0 0 / 22%); }
.family-luxury .layout-table .data-table th, .family-luxury .layout-scorecard .score-row { font-family: var(--serif); }
.family-datanoir .layout-table .data-table, .family-datanoir .layout-scorecard .scorecard { font-family: var(--sans); }
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

const cinematicPalette = {
  name: "cinematic",
  label: "Cinematic",
  description:
    "Deep navy, teal light, and ember orange for film-led storytelling and premium launches.",
  tokens: {
    paper: "#0b1020",
    ink: "#edf4ff",
    muted: "#9aaac2",
    accent: "#55e0d0",
    accentDeep: "#1e9994",
    accentSoft: "#183d4a",
    line: "rgb(237 244 255 / 16%)",
    lineStrong: "rgb(85 224 208 / 52%)",
    panel: "#111a2b",
    radius: "12px",
    artOne: "#173d70",
    artTwo: "#d86d49",
    quoteInk: "#081018",
    quoteMark: "#b9fff3",
    artLabel: "#9aaac2",
    overlay:
      "linear-gradient(135deg, rgb(85 224 208 / 8%), transparent 38%), radial-gradient(circle at 92% 8%, #183d4a 0 14%, var(--paper) 15%)",
  },
};

const paletteCatalogMetadata = {
  cinematic: {
    category: "Cinematic",
    mood: "Night, tension, and warm release",
    recommendedFor: "Film, premium launches, brand stories, and keynote moments",
  },
  cobalt: {
    category: "Product",
    mood: "Clear and confident",
    recommendedFor: "Strategy, technology, product, and B2B narratives",
  },
  coral: {
    category: "Warm",
    mood: "Human and energetic",
    recommendedFor: "Community, brand, people, and launch stories",
  },
  forest: {
    category: "Natural",
    mood: "Grounded and steady",
    recommendedFor: "Sustainability, operations, growth, and impact narratives",
  },
  saffron: {
    category: "Warm",
    mood: "Optimistic and open",
    recommendedFor: "Education, change, opportunity, and future planning",
  },
  plum: {
    category: "Expressive",
    mood: "Creative and premium",
    recommendedFor: "Culture, editorial, fashion, and creative work",
  },
  ocean: {
    category: "Cool",
    mood: "Fresh and exploratory",
    recommendedFor: "Research, customer insight, service design, and discovery",
  },
  sand: {
    category: "Earth",
    mood: "Considered and tactile",
    recommendedFor: "Consulting, hospitality, architecture, and heritage stories",
  },
  mono: {
    category: "Neutral",
    mood: "Focused and precise",
    recommendedFor: "Legal, finance, governance, and information-heavy reviews",
  },
  mint: {
    category: "Fresh",
    mood: "Luminous and collaborative",
    recommendedFor: "Product growth, wellness, collaboration, and service launches",
  },
  copper: {
    category: "Warm",
    mood: "Crafted and confident",
    recommendedFor: "Architecture, craft, food, and product storytelling",
  },
  violet: {
    category: "Digital",
    mood: "Modern and imaginative",
    recommendedFor: "AI, innovation, creative technology, and future products",
  },
  ice: {
    category: "Cool",
    mood: "Calm and evidence-led",
    recommendedFor: "Enterprise, governance, research, and decision support",
  },
};

const paletteCatalog = [cinematicPalette, ...paletteVariants].map((palette) => ({
  ...palette,
  ...paletteCatalogMetadata[palette.name],
}));

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

function layoutSlide(id, layout, body) {
  return `<section class="slide ${layout}" data-pl-slide data-slide-id="${id}" data-template-layout="${layout}">${body}</section>`;
}

const paletteSwatchRoles = [
  { key: "paper", label: "Canvas", role: "surface" },
  { key: "ink", label: "Text", role: "type" },
  { key: "accent", label: "Signal", role: "action" },
  { key: "accentDeep", label: "Depth", role: "emphasis" },
  { key: "accentSoft", label: "Soft", role: "context" },
  { key: "artOne", label: "Visual A", role: "visual" },
  { key: "artTwo", label: "Visual B", role: "visual" },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const paletteCatalogCss = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #060a13; color: #edf4ff; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { width: 1280px; }
  .slide { position: relative; width: 1280px; height: 720px; overflow: hidden; padding: 68px 82px 54px; background: #0b1020; color: #edf4ff; page-break-after: always; }
  .slide::before { position: absolute; inset: 0; background: linear-gradient(135deg, rgb(85 224 208 / 7%), transparent 35%), radial-gradient(circle at 95% 8%, rgb(216 109 73 / 20%), transparent 25%); content: ""; pointer-events: none; }
  .slide > * { position: relative; z-index: 1; }
  .catalog-kicker, .catalog-footer, .catalog-page, .palette-category, .swatch-label, .swatch-hex, .preview-kicker { color: #55e0d0; font-size: 14px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
  .catalog-page { color: #9aaac2; letter-spacing: .08em; }
  .catalog-footer { position: absolute; left: 82px; bottom: 30px; color: #9aaac2; font-size: 12px; }
  .catalog-cover { display: flex; min-height: 590px; flex-direction: column; justify-content: center; max-width: 900px; }
  .catalog-title { margin: 22px 0 22px; font-size: 76px; line-height: .98; letter-spacing: -.065em; }
  .catalog-title em { color: #55e0d0; font-style: normal; }
  .catalog-subtitle { max-width: 700px; color: #9aaac2; font-size: 22px; line-height: 1.4; }
  .cover-rail { display: flex; width: 720px; height: 70px; margin-top: 54px; border: 1px solid rgb(237 244 255 / 18%); }
  .cover-rail span { flex: 1; }
  .cover-meta { display: flex; gap: 34px; margin-top: 20px; color: #9aaac2; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
  .catalog-header { display: flex; align-items: flex-start; justify-content: space-between; }
  .catalog-heading { max-width: 920px; margin: 16px 0 0; font-size: 54px; line-height: 1.02; letter-spacing: -.055em; }
  .catalog-lede { max-width: 730px; margin: 16px 0 0; color: #9aaac2; font-size: 18px; line-height: 1.45; }
  .choice-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-top: 40px; }
  .choice-card { min-height: 168px; padding: 24px 26px; border: 1px solid rgb(237 244 255 / 18%); background: #111a2b; }
  .choice-card h2 { margin: 10px 0 8px; font-size: 25px; letter-spacing: -.03em; }
  .choice-card p { max-width: 480px; margin: 0; color: #9aaac2; font-size: 16px; line-height: 1.4; }
  .choice-card small { color: #55e0d0; font-size: 13px; letter-spacing: .04em; }
  .palette-layout { display: grid; grid-template-columns: .95fr 1.05fr; gap: 48px; margin-top: 36px; }
  .palette-copy { min-width: 0; }
  .palette-category { margin-bottom: 14px; }
  .palette-title { margin: 0; font-size: 48px; line-height: 1; letter-spacing: -.055em; }
  .palette-description { max-width: 500px; margin: 16px 0 0; color: #9aaac2; font-size: 17px; line-height: 1.42; }
  .palette-meta { display: grid; grid-template-columns: 120px 1fr; gap: 9px 18px; margin-top: 22px; font-size: 14px; line-height: 1.35; }
  .palette-meta dt { color: #55e0d0; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .palette-meta dd { margin: 0; color: #d7e0ef; }
  .swatch-rail { display: grid; grid-template-columns: repeat(7, 1fr); gap: 7px; margin-top: 30px; }
  .swatch { display: flex; min-height: 104px; flex-direction: column; justify-content: flex-end; padding: 9px; border: 1px solid rgb(237 244 255 / 24%); }
  .swatch-label { margin-bottom: 5px; font-size: 10px; letter-spacing: .08em; }
  .swatch-hex { font-size: 10px; letter-spacing: .03em; opacity: .85; }
  .palette-preview { position: relative; min-height: 430px; overflow: hidden; padding: 38px 40px; border: 1px solid var(--preview-accent); background: var(--preview-paper); color: var(--preview-ink); }
  .palette-preview::before { position: absolute; top: -100px; right: -80px; width: 330px; height: 330px; border-radius: 50%; background: var(--preview-art); opacity: .72; content: ""; }
  .palette-preview::after { position: absolute; right: 0; bottom: 0; width: 52%; height: 10px; background: var(--preview-accent); content: ""; }
  .palette-preview > * { position: relative; z-index: 1; }
  .preview-kicker { color: var(--preview-accent); }
  .preview-title { max-width: 480px; margin: 30px 0 16px; font-size: 41px; line-height: 1; letter-spacing: -.055em; }
  .preview-lede { max-width: 470px; margin: 0; color: var(--preview-muted); font-size: 17px; line-height: 1.42; }
  .preview-rule { width: 100%; height: 1px; margin-top: 50px; background: var(--preview-accent); opacity: .55; }
  .preview-data { display: flex; gap: 34px; margin-top: 18px; color: var(--preview-deep); font-size: 13px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
`;

function paletteCatalogHtml() {
  const coverRail = paletteCatalog
    .slice(0, 7)
    .map((palette) => `<span style="background:${palette.tokens.accent}"></span>`)
    .join("");
  const choiceCards = [
    [
      "Dark and cinematic",
      "Cinematic",
      "Deep surfaces, teal signal, and warm ember for tension and release.",
    ],
    [
      "Cool and precise",
      "Cobalt / Ocean / Ice / Mono",
      "A clear starting point for evidence, products, and decisions.",
    ],
    [
      "Warm and human",
      "Coral / Saffron / Copper / Sand",
      "More warmth for brands, communities, craft, and change.",
    ],
    [
      "Natural and expressive",
      "Forest / Mint / Plum / Violet",
      "Distinctive color without losing a calm reading hierarchy.",
    ],
  ]
    .map(
      ([title, names, description]) =>
        `<article class="choice-card"><small>${title}</small><h2>${names}</h2><p>${description}</p></article>`,
    )
    .join("");
  const paletteSlides = paletteCatalog
    .map((palette, index) => {
      const page = String(index + 3).padStart(2, "0");
      const previewStyle = [
        `--preview-paper:${palette.tokens.paper}`,
        `--preview-ink:${palette.tokens.ink}`,
        `--preview-muted:${palette.tokens.muted}`,
        `--preview-accent:${palette.tokens.accent}`,
        `--preview-deep:${palette.tokens.accentDeep}`,
        `--preview-art:${palette.tokens.artTwo}`,
      ].join(";");
      const swatches = paletteSwatchRoles
        .map((swatch) => {
          const textColor = ["paper", "accentSoft"].includes(swatch.key)
            ? palette.tokens.ink
            : palette.tokens.quoteInk;
          return `<div class="swatch" style="background:${palette.tokens[swatch.key]};color:${textColor}"><span class="swatch-label">${swatch.label}</span><span class="swatch-hex">${palette.tokens[swatch.key]}</span></div>`;
        })
        .join("");
      return `<section class="slide" data-pl-slide data-slide-id="palette-${palette.name}" id="palette-${palette.name}"><div class="catalog-header"><div><p class="catalog-kicker">${page} / Palette</p><h1 class="palette-title">${escapeHtml(palette.label)}</h1></div><span class="catalog-page">${page}</span></div><div class="palette-layout"><div class="palette-copy"><p class="palette-category">${escapeHtml(palette.category)}</p><p class="palette-description">${escapeHtml(palette.description)}</p><dl class="palette-meta"><dt>Mood</dt><dd>${escapeHtml(palette.mood)}</dd><dt>Use it for</dt><dd>${escapeHtml(palette.recommendedFor)}</dd></dl><div class="swatch-rail">${swatches}</div></div><div class="palette-preview" style="${previewStyle}"><p class="preview-kicker">PresentLab / Sample narrative</p><h2 class="preview-title">One clear claim gives the slide its shape.</h2><p class="preview-lede">Use the signal color for the decision, the soft tone for context, and the second visual color for emphasis.</p><div class="preview-rule"></div><div class="preview-data"><span>Signal</span><span>Evidence</span><span>Action</span></div></div></div><p class="catalog-footer">${page} / ${escapeHtml(palette.label)} palette</p></section>`;
    })
    .join("\n");
  return `<!doctype html><html lang="en" data-pl-format="16:9" data-pl-title="PresentLab color palette catalog" data-pl-theme="palette-catalog"><head><meta charset="utf-8" /><meta name="description" content="PresentLab color palette catalog with cinematic, product, warm, natural, and expressive slide color systems." /><style>${paletteCatalogCss}</style></head><body><section class="slide" data-pl-slide data-slide-id="palette-cover"><div class="catalog-cover"><p class="catalog-kicker">PresentLab / Palette catalog</p><h1 class="catalog-title">Choose the atmosphere<br /><em>before the slide.</em></h1><p class="catalog-subtitle">Thirteen curated color systems for clients, designers, and AI agents. Start with the mood, then match the palette to the story.</p><div class="cover-rail">${coverRail}</div><div class="cover-meta"><span>13 color systems</span><span>7 named roles per palette</span><span>16:9 slide canvas</span></div></div><p class="catalog-footer">01 / Color palette catalog</p></section><section class="slide" data-pl-slide data-slide-id="palette-guide"><div class="catalog-header"><div><p class="catalog-kicker">02 / Choose a direction</p><h1 class="catalog-heading">Pick by mood, then match the story.</h1><p class="catalog-lede">Every palette names its canvas, text, signal, depth, soft surface, and visual accents so the choice stays practical and easy to brief.</p></div><span class="catalog-page">02</span></div><div class="choice-grid">${choiceCards}</div><p class="catalog-footer">02 / Palette selection guide</p></section>${paletteSlides}</body></html>`;
}

function additionalSlides(label) {
  const head = (kicker, title, lede, page) =>
    `<div class="section-head"><div><p class="kicker">${kicker}</p><h1 class="section-title">${title}</h1><p class="section-lede">${lede}</p></div><span class="page-no">${page}</span></div>`;
  const foot = (page, title) => `<p class="footer">${page} / ${title}</p>`;

  return [
    layoutSlide(
      "statement",
      "layout-statement",
      `${head("24 / Point of view", "A useful template makes the next decision visible.", "Use a single sentence when the audience needs a memorable claim before the detail.", "25")}<div class="statement-grid"><p class="statement">Make the important thing <em>easy to see.</em></p><aside class="statement-rail"><strong>${label}</strong>One focal point gives the audience a place to begin, then lets evidence earn the next moment of attention.</aside></div>${foot("25", "Statement layout")}`,
    ),
    layoutSlide(
      "agenda",
      "layout-agenda",
      `${head("25 / Orientation", "The story has five deliberate turns.", "An agenda can show movement without becoming a navigation bar. Each line names the job of the next section.", "26")}<div class="agenda-list"><div class="agenda-row"><span class="agenda-no">01</span><h2>Frame</h2><p>Set the subject, audience, and decision.</p></div><div class="agenda-row"><span class="agenda-no">02</span><h2>Signal</h2><p>Make the important change visible.</p></div><div class="agenda-row active"><span class="agenda-no">03</span><h2>Evidence</h2><p>Bring the proof close to the claim.</p></div><div class="agenda-row"><span class="agenda-no">04</span><h2>Decide</h2><p>Name the trade-off and the next move.</p></div><div class="agenda-row"><span class="agenda-no">05</span><h2>Handoff</h2><p>Leave the reader with something usable.</p></div></div>${foot("26", "Agenda layout")}`,
    ),
    layoutSlide(
      "timeline",
      "layout-timeline",
      `${head("26 / Progression", "A change is easier to understand when its sequence is visible.", "Use a timeline for launches, research phases, operating cycles, or any story where order changes the meaning.", "27")}<div class="timeline-track"><article class="timeline-item"><span class="timeline-date">Week 01</span><h2>Brief</h2><p>Agree on the question before collecting more detail.</p></article><article class="timeline-item"><span class="timeline-date">Week 02</span><h2>Shape</h2><p>Turn raw material into a small set of useful claims.</p></article><article class="timeline-item"><span class="timeline-date">Week 03</span><h2>Compose</h2><p>Give every claim a visual form that helps it travel.</p></article><article class="timeline-item"><span class="timeline-date">Week 04</span><h2>Review</h2><p>Check the story at the same scale as the audience.</p></article><article class="timeline-item"><span class="timeline-date">Week 05</span><h2>Release</h2><p>Package the source and the rendered handoff together.</p></article></div>${foot("27", "Timeline layout")}`,
    ),
    layoutSlide(
      "matrix",
      "layout-matrix",
      `${head("27 / Prioritization", "A two-by-two grid turns a long list into a conversation.", "Name the axes plainly, then use each quadrant to support a different kind of decision.", "28")}<div class="matrix-wrap"><span class="matrix-y">Impact</span><div class="matrix-x"><span>Lower effort</span><span>Higher effort</span></div><div></div><div class="matrix"><article class="matrix-cell"><span class="tag">Start here</span><h2>Quick wins</h2><p>Useful moves that improve the experience without waiting for a major dependency.</p></article><article class="matrix-cell"><span class="tag">Plan carefully</span><h2>Big bets</h2><p>High-value changes that need ownership, sequencing, and a clear measure.</p></article><article class="matrix-cell"><span class="tag">Keep visible</span><h2>Maintenance</h2><p>Small tasks that protect quality even when they do not create a headline.</p></article><article class="matrix-cell"><span class="tag">Question first</span><h2>Reframe</h2><p>Work that looks urgent until the underlying decision becomes clearer.</p></article></div></div>${foot("28", "Priority matrix")}`,
    ),
    layoutSlide(
      "table",
      "layout-table",
      `${head("28 / Operating view", "A table is useful when every row answers the same question.", "Use a consistent row grammar so a dense page remains scannable rather than becoming a wall of prose.", "29")}<table class="data-table"><thead><tr><th>Workstream</th><th>Owner</th><th>Signal</th><th>Next move</th></tr></thead><tbody><tr><td>Audience</td><td>Research</td><td class="signal">Ready</td><td>Confirm the primary reader</td></tr><tr><td>Story</td><td>Strategy</td><td class="signal">Open</td><td>Reduce the claim to one sentence</td></tr><tr><td>Visual system</td><td>Design</td><td class="signal">Stable</td><td>Reuse the strongest contrast</td></tr><tr><td>Handoff</td><td>Delivery</td><td class="signal">Check</td><td>Review the rendered artifact</td></tr><tr><td>Archive</td><td>Operations</td><td class="signal">Next</td><td>Record the source path</td></tr></tbody></table>${foot("29", "Table layout")}`,
    ),
    layoutSlide(
      "funnel",
      "layout-funnel",
      `${head("29 / Selection", "The strongest story narrows the field without hiding the evidence.", "A funnel shows how a broad input becomes a smaller, more useful decision set.", "30")}<div class="funnel-stack"><div class="funnel-step"><strong>All inputs</strong><span>Many signals</span></div><div class="funnel-step"><strong>Shared context</strong><span>Common frame</span></div><div class="funnel-step"><strong>Chosen evidence</strong><span>Relevant proof</span></div><div class="funnel-step"><strong>Agreed decision</strong><span>One direction</span></div><div class="funnel-step"><strong>Next action</strong><span>Move</span></div></div>${foot("30", "Funnel layout")}`,
    ),
    layoutSlide(
      "personas",
      "layout-personas",
      `${head("30 / Audience map", "Different readers need different evidence at the same moment.", "Use a persona strip to keep the page grounded in what each reader must understand or do.", "31")}<div class="persona-row"><article class="persona"><span class="persona-mark">M</span><h2>Maker</h2><p>Needs a reusable structure that makes the next page easier to author.</p><span class="persona-need">Needs: clear rules</span></article><article class="persona"><span class="persona-mark">R</span><h2>Reviewer</h2><p>Needs visible evidence that the page has a job and the handoff is complete.</p><span class="persona-need">Needs: fast proof</span></article><article class="persona"><span class="persona-mark">A</span><h2>Audience</h2><p>Needs the claim, implication, and next question without decoding the system.</p><span class="persona-need">Needs: low friction</span></article></div>${foot("31", "Persona layout")}`,
    ),
    layoutSlide(
      "before-after",
      "layout-before-after",
      `${head("31 / Transformation", "The visual system earns its place when the reading experience improves.", "A before-and-after layout makes the benefit concrete without pretending that the system solves every content problem.", "32")}<div class="before-after"><article class="state-card"><span class="state-label">Before</span><h2>Fragmented story</h2><p>Several equal-weight elements compete for the first glance. The reader must build the hierarchy alone.</p></article><div class="state-arrow">→</div><article class="state-card after"><span class="state-label">After</span><h2>One clear thread</h2><p>The title names the point, the evidence sits beside it, and the next move has a visible place.</p></article></div>${foot("32", "Before and after")}`,
    ),
    layoutSlide(
      "swimlane",
      "layout-swimlane",
      `${head("32 / Coordination", "A shared process becomes clearer when ownership stays visible.", "Use swimlanes when several groups contribute to one outcome and handoffs matter as much as tasks.", "33")}<div class="swimlane"><span class="lane-name">Research</span><div class="lane"><span class="lane-block strong">Frame question</span><span class="lane-block">Collect signal</span><span class="lane-block">Test pattern</span><span class="lane-block">Share proof</span></div><span class="lane-name">Design</span><div class="lane"><span class="lane-block">Set grammar</span><span class="lane-block strong">Compose page</span><span class="lane-block">Check rhythm</span><span class="lane-block">Package source</span></div><span class="lane-name">Delivery</span><div class="lane"><span class="lane-block">Confirm scope</span><span class="lane-block">Render outputs</span><span class="lane-block strong">Review pages</span><span class="lane-block">Publish handoff</span></div></div>${foot("33", "Swimlane layout")}`,
    ),
    layoutSlide(
      "decision",
      "layout-decision",
      `${head("33 / Decision", "A decision page should show the question and the consequence together.", "Use the center node for the question that must be answered, then place the meaningful paths on either side.", "34")}<div class="decision-tree"><div class="decision-branch"><article class="decision-node"><h2>Keep the system</h2><p>Use the current grammar when consistency is the main value.</p></article><article class="decision-node"><h2>Change the system</h2><p>Introduce a new pattern when the old one obscures the message.</p></article></div><div class="decision-core">What does the audience need to decide?</div><div class="decision-branch"><article class="decision-node"><h2>Shorten the path</h2><p>Remove context that does not change the reading.</p></article><article class="decision-node"><h2>Strengthen the proof</h2><p>Bring the missing evidence into the focal area.</p></article></div></div>${foot("34", "Decision tree")}`,
    ),
    layoutSlide(
      "scorecard",
      "layout-scorecard",
      `${head("34 / Quality signal", "A scorecard keeps review criteria visible while the work is still changeable.", "Use one row per criterion and reserve status labels for decisions that need attention.", "35")}<div class="scorecard"><div class="score-row"><strong>Clarity</strong><span class="score-value">92</span><span class="score-status">Ready</span><span class="score-note">The title names the subject and the decision.</span></div><div class="score-row"><strong>Contrast</strong><span class="score-value">84</span><span class="score-status">Review</span><span class="score-note">The signal is visible, but the muted text needs checking.</span></div><div class="score-row"><strong>Rhythm</strong><span class="score-value">88</span><span class="score-status">Stable</span><span class="score-note">The sequence changes density without losing the rail.</span></div><div class="score-row"><strong>Handoff</strong><span class="score-value">96</span><span class="score-status">Ready</span><span class="score-note">Source and rendered outputs remain together.</span></div></div>${foot("35", "Scorecard layout")}`,
    ),
    layoutSlide(
      "quote-wall",
      "layout-quote-wall",
      `${head("35 / Voice", "A small set of voices can reveal what the system should protect.", "Use short quotations as evidence about the experience, not as decoration that floats free of the decision.", "36")}<div class="quote-wall"><blockquote class="mini-quote"><span class="mini-quote-mark">&ldquo;</span><p>The strongest page told me where to look before I knew why.</p><cite>Reader / review</cite></blockquote><blockquote class="mini-quote"><span class="mini-quote-mark">&ldquo;</span><p>The rhythm changed, but the rules stayed recognizable.</p><cite>Designer / handoff</cite></blockquote><blockquote class="mini-quote"><span class="mini-quote-mark">&ldquo;</span><p>I could repeat the decision after one pass.</p><cite>Lead / discussion</cite></blockquote></div>${foot("36", "Quote wall")}`,
    ),
    layoutSlide(
      "horizons",
      "layout-horizons",
      `${head("36 / Planning", "The horizon matters as much as the destination.", "Split near-term action from longer-term possibility so the page can be ambitious without becoming vague.", "37")}<div class="horizon-rail"><article class="horizon"><span class="horizon-no">01</span><h2>Now</h2><p>Make the next review easier by naming the primary claim and the evidence it needs.</p><small>Next 2 weeks</small></article><article class="horizon"><span class="horizon-no">02</span><h2>Next</h2><p>Extend the strongest pattern to adjacent pages and audiences without losing its purpose.</p><small>Next quarter</small></article><article class="horizon"><span class="horizon-no">03</span><h2>Later</h2><p>Turn the validated system into a maintained resource that can support new stories.</p><small>Future option</small></article></div>${foot("37", "Planning horizons")}`,
    ),
    layoutSlide(
      "architecture",
      "layout-architecture",
      `${head("37 / System map", "A dependable handoff has layers, and each layer has a job.", "Use a stack when the audience needs to see how intent travels from an abstract decision to a concrete artifact.", "38")}<div class="architecture-stack"><div class="architecture-layer"><strong>Intent</strong><span>The audience, question, and decision the work must support.</span><em>Why</em></div><div class="architecture-layer"><strong>Narrative</strong><span>The sequence that turns context into evidence and evidence into action.</span><em>What</em></div><div class="architecture-layer"><strong>Layout</strong><span>The visual grammar that makes each part legible at a glance.</span><em>How</em></div><div class="architecture-layer"><strong>Artifact</strong><span>The source and rendered files that make the work portable.</span><em>Handoff</em></div></div>${foot("38", "Architecture layout")}`,
    ),
    layoutSlide(
      "storyboard",
      "layout-storyboard",
      `${head("38 / Storyboard", "Four frames can show the emotional rhythm of a longer deck.", "Use a storyboard to test the sequence before polishing every page.", "39")}<div class="storyboard"><article class="story-frame"><div class="frame-mark">01</div><h2>Open</h2><p>Give the audience a reason to care.</p></article><article class="story-frame"><div class="frame-mark">02</div><h2>Orient</h2><p>Make the context and the stakes concrete.</p></article><article class="story-frame"><div class="frame-mark">03</div><h2>Prove</h2><p>Put the evidence where the claim can use it.</p></article><article class="story-frame"><div class="frame-mark">04</div><h2>Close</h2><p>Leave a next move that can survive the meeting.</p></article></div>${foot("39", "Storyboard layout")}`,
    ),
    layoutSlide(
      "signal",
      "layout-signal",
      `${head("39 / Signal", "One number can orient the room when its meaning is stated plainly.", "Use a large signal for the current state, then give the surrounding trend just enough space to explain it.", "40")}<div class="signal-board"><div class="signal-main"><span class="signal-value">45</span><span class="signal-caption">distinct layouts give the gallery room to adapt without losing its visual grammar.</span></div><div class="signal-side"><div class="signal-ribbon"><i style="height: 28%"></i><i style="height: 42%"></i><i style="height: 38%"></i><i style="height: 64%"></i><i style="height: 78%"></i><i style="height: 92%"></i></div><p>The trend matters less than the reason for the change: more options, clearer jobs, and fewer look-alike pages.</p></div></div>${foot("40", "Signal layout")}`,
    ),
    layoutSlide(
      "risk-map",
      "layout-risk-map",
      `${head("40 / Risk", "A risk map makes uncertainty discussable before it becomes a surprise.", "Plot likelihood against impact, then name the few items that deserve action rather than labeling everything urgent.", "41")}<div class="risk-layout"><div class="risk-map">${Array.from({ length: 25 }, (_, index) => `<span class="risk-cell">${index + 1}</span>`).join("")}</div><div class="risk-legend"><article class="risk-band"><strong>Watch</strong><p>Low-impact issues that can stay visible without changing the plan.</p></article><article class="risk-band"><strong>Act</strong><p>Patterns that could weaken trust if the team does not assign an owner.</p></article><article class="risk-band"><strong>Escalate</strong><p>High-impact risks that need a decision before the next handoff.</p></article></div></div>${foot("41", "Risk map")}`,
    ),
    layoutSlide(
      "equation",
      "layout-equation",
      `${head("41 / Synthesis", "The final message is a relationship, not a list.", "Use an equation when the audience needs to remember how the parts combine to create the outcome.", "42")}<div class="equation"><article class="equation-card"><span class="equation-label">Input</span><h2>Clear claim</h2><p>Name the subject and the point in language people can repeat.</p></article><span class="equation-symbol">+</span><article class="equation-card solution"><span class="equation-label">Support</span><h2>Right evidence</h2><p>Bring the proof close enough to change the reading.</p></article><span class="equation-symbol">=</span><article class="equation-card result"><span class="equation-label">Outcome</span><h2>Confident decision</h2><p>The audience can see what matters and what should happen next.</p></article></div>${foot("42", "Equation layout")}`,
    ),
    layoutSlide(
      "case-study",
      "layout-case-study",
      `${head("42 / Case study", "A concrete example gives the system something to prove.", "Use a case-study frame to connect the abstract rule to a specific change, result, or lesson.", "43")}<div class="case-study"><aside class="case-facts"><strong>3×</strong><h2>More useful choices</h2><p>One family, three distinct jobs: orientation, evidence, and action.</p></aside><div class="case-story"><article class="case-step"><span class="step-no">01 / Before</span><h2>Too many options</h2><p>Every page asked the reader to decide how to read it.</p></article><article class="case-step"><span class="step-no">02 / Change</span><h2>Name the layout</h2><p>Each pattern received a clear purpose and a stable visual cue.</p></article><article class="case-step"><span class="step-no">03 / After</span><h2>Faster selection</h2><p>The next author could choose a starting point without guessing.</p></article></div></div>${foot("43", "Case study layout")}`,
    ),
    layoutSlide(
      "appendix",
      "layout-appendix",
      `${head("43 / Reference", "The appendix should make the work easier to continue.", "Use a reference page for definitions, source notes, or the next set of practical questions.", "44")}<div class="appendix"><div class="appendix-column"><div class="appendix-row"><span class="appendix-no">A1</span><div><h2>Family</h2><p>The structural direction that sets the visual grammar.</p></div></div><div class="appendix-row"><span class="appendix-no">A2</span><div><h2>Palette</h2><p>The color system that changes the atmosphere and contrast.</p></div></div><div class="appendix-row"><span class="appendix-no">A3</span><div><h2>Modifier</h2><p>The spacing, type, or surface treatment that sharpens the job.</p></div></div></div><div class="appendix-column"><div class="appendix-row"><span class="appendix-no">B1</span><div><h2>Source</h2><p>HTML remains the inspectable starting point for the template.</p></div></div><div class="appendix-row"><span class="appendix-no">B2</span><div><h2>Review</h2><p>Rendered pages reveal issues the source alone cannot show.</p></div></div><div class="appendix-row"><span class="appendix-no">B3</span><div><h2>Next</h2><p>Choose a layout by the job it needs to perform.</p></div></div></div></div>${foot("44", "Appendix layout")}`,
    ),
  ];
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
      `<div class="section-head"><div><p class="kicker">02 / Evidence</p><h1 class="section-title">A small set of metrics can anchor a large idea.</h1><p class="section-lede">The same component can present a scorecard, a benchmark, or a design-system health check.</p></div><span class="page-no">03</span></div><div class="stat-grid"><article class="stat"><span class="value">${galleryTemplateCount}</span><span class="label">distinct visual systems in this gallery</span></article><article class="stat"><span class="value">${gallerySlideCount}</span><span class="label">sample slides rendered from HTML sources</span></article><article class="stat"><span class="value">01</span><span class="label">inspectable HTML source per template</span></article></div><div class="bar-layout"><div class="bar-chart"><div class="bar"><i style="height: 42%"></i><span>Brief</span></div><div class="bar"><i style="height: 66%"></i><span>Design</span></div><div class="bar"><i style="height: 84%"></i><span>Render</span></div><div class="bar"><i style="height: 100%"></i><span>Review</span></div></div><p class="bar-note">The workflow gets stronger when validation and visual review happen before delivery.</p></div><p class="footer">03 / Metric board</p>`,
    ),
    slide(
      "comparison",
      `<div class="section-head"><div><p class="kicker">03 / Choice</p><h1 class="section-title">The right template changes how the audience reads.</h1><p class="section-lede">Style is a communication decision. Match the visual grammar to the audience, topic, and level of urgency.</p></div><span class="page-no">04</span></div><div class="compare"><article class="panel"><span class="label">Quiet narrative</span><h2>Make space for reflection</h2><p>Use generous margins, low contrast, and a restrained accent when the story depends on trust, nuance, or a considered decision.</p><ul class="list"><li>Editorial, portfolio, or strategy work</li><li>Longer reading moments</li><li>Subtle hierarchy</li></ul></article><article class="panel"><span class="label">High signal</span><h2>Make the change visible</h2><p>Use contrast, strong alignment, and a clear focal point when the deck must help a group act quickly.</p><ul class="list"><li>Launch, operating review, or product work</li><li>Short attention windows</li><li>Decisive visual cues</li></ul></article></div><p class="footer">04 / Comparison layout</p>`,
    ),
    slide(
      "process",
      `<div class="section-head"><div><p class="kicker">04 / Workflow</p><h1 class="section-title">From brief to review, the system stays inspectable.</h1><p class="section-lede">The template gives an AI agent a stable surface for content while the renderer protects output quality.</p></div><span class="page-no">05</span></div><div class="steps"><article class="step"><span class="number">01</span><h2>Frame</h2><p>Choose a style and write a direct narrative outline.</p></article><article class="step"><span class="number">02</span><h2>Compose</h2><p>Place content into an HTML slide contract with local tokens.</p></article><article class="step"><span class="number">03</span><h2>Validate</h2><p>Check metadata, ids, readability, and image accessibility.</p></article><article class="step"><span class="number">04</span><h2>Review</h2><p>Inspect the rendered pages and keep the HTML source ready for the next edit.</p></article></div><p class="footer">05 / Four-step workflow</p>`,
    ),
    slide(
      "audience",
      `<div class="section-head"><div><p class="kicker">05 / Audience</p><h1 class="section-title">A system can feel distinctive without becoming difficult to use.</h1><p class="section-lede">The gallery gives both decision-makers and makers a shared visual language for moving from idea to action.</p></div><span class="page-no">06</span></div><div class="hero-grid"><article class="panel"><span class="label">For decision-makers</span><h2>Scan the signal</h2><p>Strong hierarchy makes the recommendation, risk, or opportunity visible before the detail asks for attention.</p><ul class="list"><li>Clear claim at the top</li><li>Evidence grouped by meaning</li><li>Next action easy to find</li></ul></article><article class="panel"><span class="label">For builders</span><h2>Reuse the structure</h2><p>Stable HTML sections let an AI agent vary the voice and palette while preserving the page contract.</p><ul class="list"><li>Named slide patterns</li><li>Predictable local tokens</li><li>Portable source and exports</li></ul></article></div><p class="footer">06 / Audience alignment</p>`,
    ),
    slide(
      "system",
      `<div class="section-head"><div><p class="kicker">06 / System</p><h1 class="section-title">Tokens carry the visual logic across every page.</h1><p class="section-lede">A template becomes reusable when typography, spacing, color, and shape are explicit enough for an agent to preserve.</p></div><span class="page-no">07</span></div><div class="stat-grid"><article class="stat"><span class="value">${styleGroups.length}</span><span class="label">researched style movements with distinct visual rules</span></article><article class="stat"><span class="value">45</span><span class="label">layouts that form a complete sample story</span></article><article class="stat"><span class="value">01</span><span class="label">source of truth for each generated handoff</span></article></div><div class="hero-grid"><article class="panel"><span class="label">Palette</span><h2>Make contrast intentional</h2><p>Use one primary accent, one supporting surface, and a readable muted tone so content remains the loudest element.</p></article><article class="panel"><span class="label">Type</span><h2>Make hierarchy predictable</h2><p>Keep the title, section lead, body, and metadata at stable levels so a new page still feels like part of the same system.</p></article></div><p class="footer">07 / Design tokens</p>`,
    ),
    slide(
      "roadmap",
      `<div class="section-head"><div><p class="kicker">07 / Roadmap</p><h1 class="section-title">Move from a good first draft to a dependable release.</h1><p class="section-lede">The same four checkpoints work for an AI-generated presentation, catalog, or printable report.</p></div><span class="page-no">08</span></div><div class="steps"><article class="step"><span class="number">01</span><h2>Discover</h2><p>Choose the family, palette, and narrative job for the deck.</p></article><article class="step"><span class="number">02</span><h2>Compose</h2><p>Write semantic HTML with stable ids and meaningful headings.</p></article><article class="step"><span class="number">03</span><h2>Review</h2><p>Inspect the rendered pages for rhythm, contrast, and overflow.</p></article><article class="step"><span class="number">04</span><h2>Publish</h2><p>Keep the categorized HTML source portable and ready to render on demand.</p></article></div><p class="footer">08 / Release roadmap</p>`,
    ),
    slide(
      "quality",
      `<div class="section-head"><div><p class="kicker">08 / Quality</p><h1 class="section-title">Quality is visible in the small details.</h1><p class="section-lede">Automated checks protect the contract; visual review protects the experience that the audience actually receives.</p></div><span class="page-no">09</span></div><div class="compare"><article class="panel"><span class="label">Contract checks</span><h2>Make it inspectable</h2><p>Every generated deck should be easy for a toolchain to understand and safe for an agent to extend.</p><ul class="list"><li>Metadata and format are declared</li><li>Slide ids are unique and stable</li><li>Assets stay local and deterministic</li></ul></article><article class="panel"><span class="label">Visual checks</span><h2>Make it believable</h2><p>Rendered pages should hold together at a glance and remain useful when opened in a presentation viewer.</p><ul class="list"><li>Contrast and spacing remain calm</li><li>Headlines do not collide or wrap badly</li><li>All handoff formats contain every page</li></ul></article></div><p class="footer">09 / Quality review</p>`,
    ),
    slide(
      "principles",
      `<div class="section-head"><div><p class="kicker">09 / Principles</p><h1 class="section-title">A template should make the next decision easier.</h1><p class="section-lede">A useful system narrows the choices without flattening the story or the personality of the team using it.</p></div><span class="page-no">10</span></div><div class="hero-grid"><article class="panel"><span class="label">Clarity</span><h2>Show the important thing first</h2><p>Let the title, focal point, and evidence agree about what deserves attention right now.</p><ul class="list"><li>One primary claim</li><li>One supporting visual</li><li>One obvious next move</li></ul></article><article class="panel"><span class="label">Flexibility</span><h2>Leave room for a different story</h2><p>Keep the structure stable while allowing content, density, and tone to change with the brief.</p><ul class="list"><li>Composable sections</li><li>Named layout patterns</li><li>Local style tokens</li></ul></article></div><p class="footer">10 / Design principles</p>`,
    ),
    slide(
      "content-model",
      `<div class="section-head"><div><p class="kicker">10 / Content</p><h1 class="section-title">Content has a shape before it has a style.</h1><p class="section-lede">Define the job of a block first; then choose the visual treatment that lets the audience understand it quickly.</p></div><span class="page-no">11</span></div><div class="steps"><article class="step"><span class="number">01</span><h2>Claim</h2><p>State the conclusion in a sentence the audience can repeat.</p></article><article class="step"><span class="number">02</span><h2>Proof</h2><p>Add the number, quote, example, or comparison that earns belief.</p></article><article class="step"><span class="number">03</span><h2>Context</h2><p>Explain the boundary, trade-off, or audience that changes the reading.</p></article><article class="step"><span class="number">04</span><h2>Action</h2><p>Close with the decision, owner, or next question that keeps momentum.</p></article></div><p class="footer">11 / Content model</p>`,
    ),
    slide(
      "layout-rules",
      `<div class="section-head"><div><p class="kicker">11 / Layout</p><h1 class="section-title">Reliable rhythm comes from a few visible rules.</h1><p class="section-lede">A consistent grid gives agents a safe boundary for experimentation and gives readers a pattern they can trust.</p></div><span class="page-no">12</span></div><div class="compare"><article class="panel"><span class="label">Anchor</span><h2>Align to a shared edge</h2><p>Keep titles, charts, and panels connected to the same content rail so the eye knows where the story begins.</p><ul class="list"><li>Stable outer margins</li><li>Predictable section heads</li><li>Clear reading direction</li></ul></article><article class="panel"><span class="label">Release</span><h2>Give the page some air</h2><p>Use whitespace to separate ideas instead of adding decoration that competes with the evidence.</p><ul class="list"><li>Comfortable line lengths</li><li>Room around focal elements</li><li>Intentional density changes</li></ul></article></div><p class="footer">12 / Layout rules</p>`,
    ),
    slide(
      "typography",
      `<div class="section-head"><div><p class="kicker">12 / Typography</p><h1 class="section-title">Type is the quietest navigation system.</h1><p class="section-lede">A dependable scale lets the audience move from claim to context without needing to decode every new page.</p></div><span class="page-no">13</span></div><div class="hero-grid"><article class="panel"><span class="label">Display</span><h2>Use the title to make a promise</h2><p>Keep the headline short enough to scan and specific enough to tell the audience why this page exists.</p><ul class="list"><li>Strong subject and verb</li><li>Line breaks that support meaning</li><li>Minimal decorative emphasis</li></ul></article><article class="panel"><span class="label">Reading</span><h2>Use body text to remove friction</h2><p>Prefer plain language, visible labels, and short paragraphs that help a busy reader find the useful detail.</p><ul class="list"><li>Readable contrast</li><li>Consistent measure</li><li>Descriptive labels</li></ul></article></div><p class="footer">13 / Type hierarchy</p>`,
    ),
    slide(
      "palette",
      `<div class="section-head"><div><p class="kicker">13 / Palette</p><h1 class="section-title">Color should explain the hierarchy, not decorate it.</h1><p class="section-lede">A small, deliberate palette is easier to maintain across generated pages and safer to export into different viewers.</p></div><span class="page-no">14</span></div><div class="stat-grid"><article class="stat"><span class="value">01</span><span class="label">primary accent for the main action</span></article><article class="stat"><span class="value">02</span><span class="label">surfaces for depth and grouping</span></article><article class="stat"><span class="value">AA</span><span class="label">contrast target for essential text</span></article></div><div class="hero-grid"><article class="panel"><span class="label">Signal</span><h2>Reserve the accent</h2><p>When every element is loud, no element is useful. Let the accent mark decisions, changes, and selected evidence.</p></article><article class="panel"><span class="label">Surface</span><h2>Let grouping do the work</h2><p>Use paper, panel, and line colors to create order before reaching for another visual effect.</p></article></div><p class="footer">14 / Palette logic</p>`,
    ),
    slide(
      "accessibility",
      `<div class="section-head"><div><p class="kicker">14 / Access</p><h1 class="section-title">A polished page is still useful when more people can read it.</h1><p class="section-lede">Accessibility is part of the template contract: semantic headings, meaningful labels, and enough contrast to survive the real world.</p></div><span class="page-no">15</span></div><div class="steps"><article class="step"><span class="number">01</span><h2>Structure</h2><p>Use one clear heading and an ordered reading flow for every slide.</p></article><article class="step"><span class="number">02</span><h2>Describe</h2><p>Label charts, controls, and visual groupings so context is not trapped in decoration.</p></article><article class="step"><span class="number">03</span><h2>Contrast</h2><p>Check text, lines, and accents against their actual background surfaces.</p></article><article class="step"><span class="number">04</span><h2>Test</h2><p>Review the rendered page, not just the source, before handing it over.</p></article></div><p class="footer">15 / Accessible composition</p>`,
    ),
    slide(
      "data",
      `<div class="section-head"><div><p class="kicker">15 / Data</p><h1 class="section-title">The chart is only useful when the comparison is obvious.</h1><p class="section-lede">Make the question, unit, baseline, and takeaway visible before asking the audience to inspect a mark or number.</p></div><span class="page-no">16</span></div><div class="bar-layout"><div class="bar-chart"><div class="bar"><i style="height: 38%"></i><span>Q1</span></div><div class="bar"><i style="height: 56%"></i><span>Q2</span></div><div class="bar"><i style="height: 74%"></i><span>Q3</span></div><div class="bar"><i style="height: 92%"></i><span>Q4</span></div></div><p class="bar-note">A visible progression gives the viewer a starting point for the story; a short note gives them the intended interpretation.</p></div><div class="hero-grid"><article class="panel"><span class="label">Before</span><h2>Name the question</h2><p>Say what is being compared and why the answer matters to this audience.</p></article><article class="panel"><span class="label">After</span><h2>Name the implication</h2><p>Translate the pattern into a decision, a risk, or a next experiment.</p></article></div><p class="footer">16 / Data narrative</p>`,
    ),
    slide(
      "narrative",
      `<div class="section-head"><div><p class="kicker">16 / Narrative</p><h1 class="section-title">A deck earns momentum by changing the question at the right time.</h1><p class="section-lede">Move from orientation to evidence, then from evidence to a decision the audience can own.</p></div><span class="page-no">17</span></div><div class="steps"><article class="step"><span class="number">01</span><h2>Orient</h2><p>Give the audience the subject, stakes, and destination.</p></article><article class="step"><span class="number">02</span><h2>Prove</h2><p>Show the evidence that makes the claim credible.</p></article><article class="step"><span class="number">03</span><h2>Complicate</h2><p>Surface the constraint or trade-off that deserves an honest answer.</p></article><article class="step"><span class="number">04</span><h2>Decide</h2><p>Make the next move concrete enough to discuss and assign.</p></article></div><p class="footer">17 / Narrative arc</p>`,
    ),
    slide(
      "review",
      `<div class="section-head"><div><p class="kicker">17 / Review</p><h1 class="section-title">Review the page the way the audience will experience it.</h1><p class="section-lede">Source-level confidence is not enough. Render early, inspect the rhythm, and fix what the exported artifact reveals.</p></div><span class="page-no">18</span></div><div class="compare"><article class="panel"><span class="label">At a glance</span><h2>Does the page have a job?</h2><p>Read only the title, labels, and focal elements. The intended takeaway should still be visible.</p><ul class="list"><li>Claim is specific</li><li>Visual priority is clear</li><li>Page belongs in the sequence</li></ul></article><article class="panel"><span class="label">Up close</span><h2>Can the detail carry trust?</h2><p>Check the line lengths, contrast, labels, and exported page order before the deck becomes a dependency.</p><ul class="list"><li>No collisions or clipping</li><li>Evidence has context</li><li>HTML source remains deterministic</li></ul></article></div><p class="footer">18 / Review checklist</p>`,
    ),
    slide(
      "implementation",
      `<div class="section-head"><div><p class="kicker">18 / Build</p><h1 class="section-title">Implementation should preserve intent from source to render.</h1><p class="section-lede">The renderer is part of the design system: it translates semantic HTML into artifacts that people can share and review.</p></div><span class="page-no">19</span></div><div class="hero-grid"><article class="panel"><span class="label">Source contract</span><h2>Keep the input explicit</h2><p>Declare format, title, theme, and slide ids so tooling can inspect the deck without guessing.</p><ul class="list"><li>Local CSS and fonts</li><li>Stable identifiers</li><li>Readable source order</li></ul></article><article class="panel"><span class="label">Render contract</span><h2>Keep the output reviewable</h2><p>Render pages on demand in the format needed for the next review, while the categorized HTML source remains the source of truth.</p><ul class="list"><li>HTML for agents</li><li>PNG/PDF/PPTX on demand</li></ul></article></div><p class="footer">19 / Implementation contract</p>`,
    ),
    slide(
      "operations",
      `<div class="section-head"><div><p class="kicker">19 / Operate</p><h1 class="section-title">A resource library becomes valuable when it stays easy to refresh.</h1><p class="section-lede">Treat templates as maintained assets: version the source, verify the renders, and make the catalog searchable for the next agent.</p></div><span class="page-no">20</span></div><div class="steps"><article class="step"><span class="number">01</span><h2>Index</h2><p>Record the family, palette, layout modifier, and categorized source path.</p></article><article class="step"><span class="number">02</span><h2>Build</h2><p>Regenerate HTML metadata and render formats on demand from one deterministic command.</p></article><article class="step"><span class="number">03</span><h2>Verify</h2><p>Count pages, inspect backgrounds, and test the contract across the gallery.</p></article><article class="step"><span class="number">04</span><h2>Publish</h2><p>Push the template repository and update the parent submodule pointer.</p></article></div><p class="footer">20 / Library operations</p>`,
    ),
    slide(
      "risks",
      `<div class="section-head"><div><p class="kicker">20 / Risk</p><h1 class="section-title">The safest template is one that makes failure visible.</h1><p class="section-lede">Name the common breakpoints early so an agent or reviewer can correct them before the artifact reaches an audience.</p></div><span class="page-no">21</span></div><div class="compare"><article class="panel"><span class="label">Content risk</span><h2>Too much, too late</h2><p>When the title is vague or the evidence is buried, the page asks the audience to do the organizing.</p><ul class="list"><li>Rewrite the claim</li><li>Reduce competing elements</li><li>Move context nearer the proof</li></ul></article><article class="panel"><span class="label">System risk</span><h2>Looks right, exports wrong</h2><p>Overflow, missing fonts, or an incomplete page can appear only after rendering into the handoff format.</p><ul class="list"><li>Render every change</li><li>Check all output types</li><li>Review representative pages</li></ul></article></div><p class="footer">21 / Risk controls</p>`,
    ),
    slide(
      "voice",
      `<div class="section-head"><div><p class="kicker">05 / Voice</p><h1 class="section-title">Good design makes precise writing easier to trust.</h1></div><span class="page-no">06</span></div><div class="quote-layout"><blockquote class="quote"><span class="quote-mark">“</span><p>When each slide has one job, the audience spends less time decoding the layout and more time considering the idea.</p><cite>PresentLab design principle</cite></blockquote><aside class="quote-aside"><span class="value">1 job</span><p>per slide keeps the narrative legible and gives the next slide room to move.</p></aside></div><p class="footer">06 / Editorial quote</p>`,
    ),
    slide(
      "handoff",
      `<div class="section-head"><div><p class="kicker">10 / Handoff</p><h1 class="section-title">A template becomes useful when the next person can pick it up.</h1><p class="section-lede">Keep the categorized HTML source and render examples on demand so an agent, designer, or reviewer can continue the work without guessing.</p></div><span class="page-no">11</span></div><div class="hero-grid"><article class="panel"><span class="label">Source</span><h2>style/template.html</h2><p>Semantic markup, local styles, metadata, and named slide ids make the starting point inspectable and adaptable.</p><ul class="list"><li>Easy to diff and review</li><li>Safe for deterministic rendering</li><li>Ready for agent composition</li></ul></article><article class="panel"><span class="label">On demand</span><h2>Render when needed</h2><p>Generate PNG, PDF, or PPTX only for the selected source and review the actual pages before handoff.</p><ul class="list"><li>One categorized source of truth</li><li>Same page order in every format</li><li>Fast visual comparison</li></ul></article></div><p class="footer">11 / Portable handoff</p>`,
    ),
    slide(
      "catalog",
      `<div class="section-head"><div><p class="kicker">23 / Catalog</p><h1 class="section-title">The library is easier to use when every choice is named.</h1><p class="section-lede">Family, palette, and layout modifiers turn a large gallery into a set of understandable starting points for an agent or a designer.</p></div><span class="page-no">24</span></div><div class="hero-grid"><article class="panel"><span class="label">Browse</span><h2>Start with the mood</h2><p>Choose editorial, cinematic, brutalist, data-led, or another structural direction that fits the story.</p><ul class="list"><li>Clear family names</li><li>Distinct visual rhythm</li><li>Useful first-page preview</li></ul></article><article class="panel"><span class="label">Compose</span><h2>Refine with the system</h2><p>Use palette and layout metadata to narrow the search while preserving the underlying slide contract.</p><ul class="list"><li>Searchable index</li><li>Portable source paths</li><li>Predictable output files</li></ul></article></div><p class="footer">24 / Template catalog</p>`,
    ),
    slide(
      "close",
      `<div class="cover-copy"><p class="kicker">PresentLab / Handoff</p><h1 class="title">Choose a style.<br /><em>Keep the story clear.</em></h1><p class="lede">Every category folder in this gallery contains an inspectable HTML source for a fast, reliable starting point.</p><div class="meta-line"><span>Validate first</span><span>Render on demand</span></div></div><p class="footer">12 / Closing frame</p>`,
    ),
  ];
}

function htmlForTemplate(template) {
  const normalizeDisplayText = (value) =>
    value
      .replaceAll(String.fromCodePoint(0xc2, 0xb7), " / ")
      .replaceAll(String.fromCodePoint(0xe2, 0x20ac, 0x153), "&ldquo;");
  const title = `PresentLab ${normalizeDisplayText(template.label)} template gallery`;
  const profile = createDiversityProfile(template, template.galleryIndex);
  const common = commonSlides(
    template.name,
    normalizeDisplayText(template.visualLabel ?? template.label),
  );
  const closing = common.pop();
  const slides = [
    ...common,
    ...additionalSlides(normalizeDisplayText(template.visualLabel ?? template.label)),
    closing,
  ]
    .join("\n")
    .replaceAll("05 / Voice", "21 / Voice")
    .replace(
      '<span class="page-no">06</span></div><div class="quote-layout">',
      '<span class="page-no">22</span></div><div class="quote-layout">',
    )
    .replaceAll("06 / Editorial quote", "22 / Editorial quote")
    .replaceAll("10 / Handoff", "22 / Handoff")
    .replace(
      '<span class="page-no">11</span></div><div class="hero-grid"><article class="panel"><span class="label">Source</span>',
      '<span class="page-no">23</span></div><div class="hero-grid"><article class="panel"><span class="label">Source</span>',
    )
    .replaceAll("11 / Portable handoff", "23 / Portable handoff")
    .replaceAll("12 / Closing frame", "45 / Closing frame")
    .replaceAll(String.fromCodePoint(0xe2, 0x20ac, 0x153), "&ldquo;");
  const diversifiedSlides = decorateSlides(diversifyContent(slides, profile), profile);
  return `<!doctype html>
<html lang="en" data-pl-format="16:9" data-pl-title="${escapeHtml(title)}" data-pl-theme="${escapeHtml(template.name)}" data-pl-style-category="${escapeHtml(template.styleCategory ?? "Core systems")}" data-pl-style-treatment="${escapeHtml(template.styleTreatment ?? template.modifier)}">
<head>
  <meta charset="utf-8" />
  <meta name="description" content="${escapeHtml(template.description)}" />
  <style>${baseCss}
${additionalCss}
${template.css}
${diversityCss(profile)}</style>
</head>
<body class="theme-${template.name} family-${template.baseFamily ?? template.family} style-group-${template.styleGroup ?? "core"} composition-${profile.mode.key}" data-pl-profile="${profile.id}" data-pl-diversity-signature="${escapeHtml(profile.signature)}" data-pl-composition="${profile.mode.key}" data-pl-background-id="${profile.background.id}" data-pl-background-mode="${profile.background.mode}" data-pl-background-signature="${escapeHtml(profile.backgroundSignature)}">
${diversifiedSlides}
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
  baseFamily: name,
  palette: name === "midnight" ? "cinematic" : "base",
  modifier: "base",
  css:
    name === "midnight"
      ? `${styleCss[name]}\n${paletteCss(cinematicPalette.tokens)}`
      : styleCss[name],
  theme:
    name === "midnight" ? { ...themeTokens[name], ...cinematicPalette.tokens } : themeTokens[name],
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
      baseFamily: family.name,
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

const paletteTokensByName = new Map(
  [cinematicPalette, ...paletteVariants].map((palette) => [palette.name, palette.tokens]),
);
const baseTemplateByName = new Map(baseTemplates.map((template) => [template.name, template]));
const styleTemplates = styleGroups.flatMap((group) => {
  const baseTemplate = baseTemplateByName.get(group.baseFamily);
  const paletteTokens = paletteTokensByName.get(group.palette);
  if (!baseTemplate || !paletteTokens) {
    throw new Error(`Style group ${group.key} references an unknown family or palette.`);
  }
  return group.names.map((name, index) => {
    const styleName = humanizeStyleName(name);
    return {
      name,
      label: `${group.label} / ${styleName}`,
      visualLabel: `${group.label} / ${styleName}`,
      description: `${group.description} ${baseTemplate.description}`,
      family: name,
      baseFamily: group.baseFamily,
      palette: group.palette,
      modifier: group.treatment,
      styleGroup: group.key,
      styleCategory: group.label,
      styleTreatment: group.treatment,
      stylePalette: group.palette,
      css: `${styleCss[group.baseFamily]}\n${paletteCss(paletteTokens)}\n${stylePresetCss(group, index)}`,
      theme: {
        ...baseTemplate.theme,
        ...paletteTokens,
        baseFamily: group.baseFamily,
        styleGroup: group.key,
        styleCategory: group.label,
        styleTreatment: group.treatment,
        stylePalette: group.palette,
      },
    };
  });
});

const templates = [...baseTemplates, ...variantTemplates, ...styleTemplates].map(
  (template, index) => ({ ...template, galleryIndex: index }),
);
const requestedGalleryStart = Number.parseInt(process.env.PRESENTLAB_GALLERY_START ?? "0", 10);
const requestedGalleryEnd = Number.parseInt(
  process.env.PRESENTLAB_GALLERY_END ?? String(templates.length),
  10,
);
const galleryStart = Number.isInteger(requestedGalleryStart)
  ? Math.max(0, Math.min(templates.length, requestedGalleryStart))
  : 0;
const galleryEnd = Number.isInteger(requestedGalleryEnd)
  ? Math.max(galleryStart, Math.min(templates.length, requestedGalleryEnd))
  : templates.length;
const renderTemplates = templates.slice(galleryStart, galleryEnd);

await mkdir(templatesRoot, { recursive: true });
await mkdir(themesRoot, { recursive: true });
await mkdir(artifactsRoot, { recursive: true });

const buildLockRoot = join(root, ".template-gallery-build-lock");
let ownsBuildLock = false;
try {
  await mkdir(buildLockRoot);
  writeFileSync(join(buildLockRoot, "owner.json"), JSON.stringify({ pid: process.pid }));
  ownsBuildLock = true;
} catch (error) {
  if (error?.code !== "EEXIST") {
    throw error;
  }
  let activeOwner = false;
  try {
    const owner = JSON.parse(readFileSync(join(buildLockRoot, "owner.json"), "utf8"));
    process.kill(owner.pid, 0);
    activeOwner = true;
  } catch {
    await rm(buildLockRoot, { recursive: true, force: true });
  }
  if (activeOwner) {
    console.log("Template gallery build already running; this duplicate process is exiting.");
    process.exit(0);
  }
  await mkdir(buildLockRoot);
  writeFileSync(join(buildLockRoot, "owner.json"), JSON.stringify({ pid: process.pid }));
  ownsBuildLock = true;
}
process.on("exit", () => {
  if (ownsBuildLock) {
    rmSync(buildLockRoot, { recursive: true, force: true });
  }
});
const prettierOptions = (await prettier.resolveConfig(join(root, "package.json"))) ?? {};

const templateCategory = (template) => template.styleGroup ?? template.family;
const templateDirectory = (template) => join(templatesRoot, templateCategory(template));
const templateSourceName = (template) => {
  const category = templateCategory(template);
  const name =
    template.name === category || template.name.startsWith(`${category}-`)
      ? template.name
      : `${category}-${template.name}`;
  return `${name}.html`;
};
const templateSourcePath = (template) =>
  join(templateDirectory(template), templateSourceName(template));
const repositoryTemplatePath = (template) =>
  `${templateCategory(template)}/${templateSourceName(template)}`;

const templateNames = new Set(templates.map((template) => template.name));
const templateCategories = new Set(templates.map(templateCategory));

for (const entry of await readdir(templatesRoot, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name !== "palettes" && !templateCategories.has(entry.name)) {
    await rm(join(templatesRoot, entry.name), { recursive: true, force: true });
  }
  if (entry.isFile() && entry.name.endsWith(".html")) {
    await rm(join(templatesRoot, entry.name), { force: true });
  }
}

for (const entry of await readdir(themesRoot, { withFileTypes: true })) {
  const themeName = entry.name.endsWith(".json") ? entry.name.slice(0, -5) : entry.name;
  if (entry.name !== "index.json" && !templateNames.has(themeName)) {
    await rm(join(themesRoot, entry.name), { recursive: true, force: true });
  }
}

for (const entry of await readdir(artifactsRoot, { withFileTypes: true })) {
  if (entry.isDirectory() && !templateNames.has(entry.name)) {
    await rm(join(artifactsRoot, entry.name), { recursive: true, force: true });
  }
}

function sourceHash(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function removeGeneratedBinaryOutputs(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await removeGeneratedBinaryOutputs(entryPath);
      continue;
    }
    if (/^(?:deck|catalog)\.(?:pdf|pptx)$/i.test(entry.name)) {
      await rm(entryPath, { force: true });
    }
  }
}

await Promise.all([
  removeGeneratedBinaryOutputs(templatesRoot),
  removeGeneratedBinaryOutputs(paletteResourceRoot),
  removeGeneratedBinaryOutputs(artifactsRoot),
]);

async function hasCompleteArtifact(artifactDir, expectedSourceHash) {
  const keepRenderedSlides = process.env.PRESENTLAB_GALLERY_KEEP_SLIDES !== "0";
  try {
    const [manifest, slideEntries] = await Promise.all([
      readFile(join(artifactDir, "render-manifest.json"), "utf8").then(JSON.parse),
      keepRenderedSlides
        ? readdir(join(artifactDir, "slides"), { withFileTypes: true })
        : Promise.resolve([]),
    ]);
    return (
      manifest.sourceHash === expectedSourceHash &&
      Number.isSafeInteger(manifest.slideCount) &&
      manifest.slideCount > 0 &&
      (!keepRenderedSlides ||
        slideEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".png")).length ===
          manifest.slideCount)
    );
  } catch {
    return false;
  }
}

const preparedTemplates = [];
const resumeExistingSources = process.env.PRESENTLAB_GALLERY_RESUME === "1";

for (const template of renderTemplates) {
  const artifactDir = join(artifactsRoot, template.name);
  const htmlPath = templateSourcePath(template);
  await mkdir(templateDirectory(template), { recursive: true });
  let formattedHtml;
  let canReuseArtifact = false;
  if (resumeExistingSources) {
    try {
      const existingHtml = await readFile(htmlPath, "utf8");
      if (existingHtml.includes('data-pl-background-signature="')) {
        formattedHtml = existingHtml;
        canReuseArtifact = await hasCompleteArtifact(artifactDir, sourceHash(existingHtml));
      }
    } catch {
      canReuseArtifact = false;
    }
  }
  if (!formattedHtml) {
    formattedHtml = await prettier.format(htmlForTemplate(template), {
      ...prettierOptions,
      filepath: htmlPath,
    });
    canReuseArtifact = await hasCompleteArtifact(artifactDir, sourceHash(formattedHtml));
  }
  if (!canReuseArtifact) {
    await rm(artifactDir, { recursive: true, force: true });
  }
  await mkdir(artifactDir, { recursive: true });
  await writeFile(htmlPath, formattedHtml, "utf8");
  await writeFile(
    join(themesRoot, template.name + ".json"),
    `${JSON.stringify({ name: template.name, title: template.label, description: template.description, format: "16:9", tokens: template.theme }, null, 2)}\n`,
    "utf8",
  );

  preparedTemplates.push({ artifactDir, canReuseArtifact, template });
  if (preparedTemplates.length % 25 === 0 || preparedTemplates.length === renderTemplates.length) {
    console.log(`Prepared ${preparedTemplates.length}/${renderTemplates.length} gallery sources`);
  }
}

async function renderArtifact(template) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await new Promise((resolveRender, rejectRender) => {
        const stderrChunks = [];
        const child = spawn(
          process.execPath,
          [
            join(root, "dist", "cli.js"),
            "render",
            "--input",
            "templates/" + repositoryTemplatePath(template),
            "--output",
            ".artifacts/template-gallery/" + template.name,
            "--format",
            "png",
          ],
          { cwd: root, stdio: ["ignore", "ignore", "pipe"], windowsHide: true },
        );

        child.stderr?.on("data", (chunk) => stderrChunks.push(chunk.toString()));
        child.once("error", rejectRender);
        child.once("close", (code, signal) => {
          if (code === 0) {
            resolveRender();
            return;
          }
          rejectRender(
            new Error(
              `Rendering ${template.name} failed with ${signal ? `signal ${signal}` : `exit code ${code}`}${stderrChunks.length ? `: ${stderrChunks.join("").trim()}` : ""}`,
            ),
          );
        });
      });
      return;
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }
      console.warn(`Retrying ${template.name} after render attempt ${attempt} failed.`);
      await new Promise((resolveRetry) => setTimeout(resolveRetry, 3000));
    }
  }
}

const renderTemplate = ({ artifactDir, canReuseArtifact, template }) =>
  (canReuseArtifact ? Promise.resolve() : renderArtifact(template)).then(async () => {
    if (process.env.PRESENTLAB_GALLERY_COMPACT_ARTIFACTS === "1") {
      await rm(join(artifactDir, "slides"), { recursive: true, force: true });
    }
    console.log((canReuseArtifact ? "Reused " : "Built ") + template.name + ": HTML source");
  });

for (let offset = 0; offset < preparedTemplates.length; offset += renderConcurrency) {
  const batch = preparedTemplates.slice(offset, offset + renderConcurrency);
  await Promise.all(batch.map(renderTemplate));
}

const templateMetadata = ({
  name,
  label,
  description,
  family,
  baseFamily,
  palette,
  modifier,
  styleGroup,
  styleCategory,
  styleTreatment,
  stylePalette,
}) => ({
  name,
  title: label + " template",
  description,
  family,
  baseFamily,
  palette,
  modifier,
  ...(styleGroup ? { styleGroup, styleCategory, styleTreatment, stylePalette } : {}),
});
const templateIndex = templates.map((template) => ({
  ...templateMetadata(template),
  path: `templates/${repositoryTemplatePath(template)}`,
}));
const repositoryTemplateIndex = templates.map((template) => ({
  ...templateMetadata(template),
  path: repositoryTemplatePath(template),
}));
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
    templates.map((template) => ({
      ...templateMetadata(template),
      title: template.label,
      path: "resources/themes/" + template.name + ".json",
    })),
    null,
    2,
  )}\n`,
  "utf8",
);

const styleCatalog = {
  count: styleTemplates.length,
  description:
    "Curated visual style presets researched across historical movements, publishing, culture, technology, and cinematic storytelling.",
  categories: styleGroups.map((group) => ({
    key: group.key,
    label: group.label,
    count: group.names.length,
    baseFamily: group.baseFamily,
    palette: group.palette,
    treatment: group.treatment,
    description: group.description,
  })),
  styles: styleTemplates.map((template) => ({
    name: template.name,
    label: template.label,
    description: template.description,
    styleGroup: template.styleGroup,
    category: template.styleCategory,
    baseFamily: template.baseFamily,
    treatment: template.styleTreatment,
    palette: template.stylePalette,
    path: `${templateCategory(template)}/${templateSourceName(template)}`,
  })),
};
await writeFile(
  join(templatesRoot, "style-catalog.json"),
  `${JSON.stringify(styleCatalog, null, 2)}\n`,
  "utf8",
);
const stylesResourceRoot = join(root, "resources", "styles");
await mkdir(stylesResourceRoot, { recursive: true });
await writeFile(
  join(stylesResourceRoot, "index.json"),
  `${JSON.stringify(styleCatalog, null, 2)}\n`,
  "utf8",
);

await mkdir(paletteRepositoryRoot, { recursive: true });
await mkdir(paletteResourceRoot, { recursive: true });
const paletteRecords = paletteCatalog.map((palette, index) => ({
  name: palette.name,
  title: palette.label,
  description: palette.description,
  category: palette.category,
  mood: palette.mood,
  recommendedFor: palette.recommendedFor,
  catalogSlide: index + 3,
  swatches: paletteSwatchRoles.map((swatch) => ({
    name: swatch.label,
    role: swatch.role,
    hex: palette.tokens[swatch.key],
  })),
  tokens: palette.tokens,
}));
if (process.env.PRESENTLAB_GALLERY_SKIP_CATALOG === "1") {
  console.log(
    `Built ${renderTemplates.length} template sources for range ${galleryStart}-${galleryEnd} under ${templatesRoot}.`,
  );
  process.exit(0);
}
const repositoryPaletteIndex = {
  catalog: {
    title: "PresentLab color palette catalog",
    description:
      "Thirteen curated color systems for clients, designers, and AI agents choosing a slide direction.",
    slideCount: paletteRecords.length + 2,
    html: "palettes/catalog.html",
  },
  palettes: paletteRecords.map((palette) => ({
    ...palette,
    path: `palettes/${palette.name}.json`,
  })),
};
const resourcePaletteIndex = {
  ...repositoryPaletteIndex,
  catalog: {
    ...repositoryPaletteIndex.catalog,
    html: "resources/palettes/catalog.html",
  },
  palettes: repositoryPaletteIndex.palettes.map((palette) => ({
    ...palette,
    path: `resources/palettes/${palette.name}.json`,
  })),
};
for (const palette of repositoryPaletteIndex.palettes) {
  const paletteJson = `${JSON.stringify(palette, null, 2)}\n`;
  await writeFile(join(paletteRepositoryRoot, `${palette.name}.json`), paletteJson, "utf8");
  await writeFile(
    join(paletteResourceRoot, `${palette.name}.json`),
    `${JSON.stringify(
      resourcePaletteIndex.palettes.find((entry) => entry.name === palette.name),
      null,
      2,
    )}\n`,
    "utf8",
  );
}
await writeFile(
  join(paletteRepositoryRoot, "index.json"),
  `${JSON.stringify(repositoryPaletteIndex, null, 2)}\n`,
  "utf8",
);
await writeFile(
  join(paletteResourceRoot, "index.json"),
  `${JSON.stringify(resourcePaletteIndex, null, 2)}\n`,
  "utf8",
);
const paletteCatalogHtmlPath = join(paletteRepositoryRoot, "catalog.html");
const formattedPaletteCatalog = await prettier.format(paletteCatalogHtml(), {
  ...prettierOptions,
  filepath: paletteCatalogHtmlPath,
});
await writeFile(paletteCatalogHtmlPath, formattedPaletteCatalog, "utf8");
await writeFile(join(paletteResourceRoot, "catalog.html"), formattedPaletteCatalog, "utf8");

console.log("Built " + renderTemplates.length + " template sources under " + templatesRoot + ".");
