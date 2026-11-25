:root {
\--bg-main: #060913;
\--bg-card: #0c1220;
\--bg-elevated: #11192d;
\--bg-soft: rgba(15, 23, 42, 0.72);
\--border-subtle: rgba(148, 163, 184, 0.16);
\--border-strong: rgba(96, 165, 250, 0.36);

\--text-primary: #f8fafc;
\--text-secondary: #cbd5e1;
\--text-muted: #94a3b8;

\--accent-blue: #3b82f6;
\--accent-cyan: #22d3ee;
\--accent-green: #10b981;
\--accent-red: #f43f5e;
\--accent-amber: #f59e0b;
\--accent-violet: #a78bfa;

\--radius-card: 16px;
\--radius-sm: 10px;
}

\*,
\*::before,
\*::after {
box-sizing: border-box;
}

html,
body {
margin: 0;
padding: 0;
background-color: var(--bg-main);
color: var(--text-primary);
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
\-webkit-font-smoothing: antialiased;
\-webkit-text-size-adjust: 100%;
overflow-x: hidden;
}

.tabular-nums {
font-variant-numeric: tabular-nums;
}

.hidden {
display: none !important;
}

.error-banner {
position: fixed;
left: max(12px, env(safe-area-inset-left));
right: max(12px, env(safe-area-inset-right));
bottom: max(14px, env(safe-area-inset-bottom));
z-index: 100;
background: rgba(127, 29, 29, 0.95);
border: 1px solid rgba(251, 113, 133, 0.55);
color: #ffe4e6;
border-radius: 12px;
padding: 10px 14px;
font-size: 12px;
line-height: 1.45;
box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
}

.container-shell {
width: 100%;
max-width: 1680px;
margin: 0 auto;
padding-left: max(14px, env(safe-area-inset-left));
padding-right: max(14px, env(safe-area-inset-right));
}

.glass-header {
position: sticky;
top: 0;
z-index: 40;
background: rgba(9, 15, 29, 0.88);
backdrop-filter: blur(16px);
\-webkit-backdrop-filter: blur(16px);
padding-top: env(safe-area-inset-top);
border-bottom: 1px solid var(--border-subtle);
}

.header-top {
display: flex;
flex-wrap: wrap;
align-items: center;
justify-content: space-between;
gap: 12px;
padding-top: 10px;
padding-bottom: 10px;
}

.brand-group {
display: flex;
align-items: center;
gap: 10px;
}

.brand-badge {
width: 38px;
height: 38px;
border-radius: 11px;
display: grid;
place-items: center;
font-weight: 800;
font-size: 14px;
letter-spacing: 0.04em;
color: #ffffff;
background: linear-gradient(135deg, #2563eb, #06b6d4);
box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
}

.brand-title-row {
display: flex;
align-items: center;
gap: 8px;
}

.brand-title {
margin: 0;
font-size: 17px;
font-weight: 800;
letter-spacing: -0.02em;
}

.brand-subtitle {
margin: 2px 0 0;
font-size: 11px;
color: var(--text-muted);
}

.live-pill {
display: inline-flex;
align-items: center;
gap: 5px;
padding: 2px 8px;
border-radius: 999px;
font-size: 10px;
font-weight: 700;
color: #34d399;
background: rgba(16, 185, 129, 0.14);
border: 1px solid rgba(16, 185, 129, 0.35);
}

.live-dot {
width: 6px;
height: 6px;
border-radius: 50%;
background: #34d399;
animation: pulseDot 1.5s infinite ease-in-out;
}

@keyframes pulseDot {
0%, 100% { opacity: 1; transform: scale(1); }
50% { opacity: 0.4; transform: scale(0.8); }
}

.search-cluster {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 8px;
width: 100%;
}

@media (min-width: 900px) {
.search-cluster {
width: auto;
}
}

.search-form {
display: flex;
align-items: center;
gap: 6px;
background: var(--bg-elevated);
border: 1px solid var(--border-subtle);
border-radius: 12px;
padding: 4px 6px 4px 10px;
flex: 1;
min-width: 210px;
}

.search-icon {
font-size: 13px;
}

.ticker-input {
background: transparent;
border: none;
color: #ffffff;
font-size: 16px;
font-weight: 700;
text-transform: uppercase;
width: 100%;
min-width: 84px;
outline: none;
touch-action: manipulation;
}

.btn-primary {
border: none;
border-radius: 9px;
padding: 7px 13px;
min-height: 34px;
background: linear-gradient(135deg, #2563eb, #3b82f6);
color: #ffffff;
font-size: 12px;
font-weight: 700;
cursor: pointer;
touch-action: manipulation;
}

.btn-primary:active {
transform: scale(0.97);
}

.quick-tickers {
display: flex;
gap: 5px;
overflow-x: auto;
\-webkit-overflow-scrolling: touch;
scrollbar-width: none;
padding-bottom: 2px;
}

.quick-tickers::-webkit-scrollbar {
display: none;
}

.quick-btn {
border: 1px solid var(--border-subtle);
background: var(--bg-soft);
color: var(--text-secondary);
border-radius: 9px;
padding: 6px 10px;
min-height: 32px;
font-size: 11px;
font-weight: 700;
cursor: pointer;
white-space: nowrap;
touch-action: manipulation;
}

.quick-btn.active {
color: #93c5fd;
border-color: var(--border-strong);
background: rgba(59, 130, 246, 0.22);
}

.macro-strip {
background: rgba(6, 9, 19, 0.72);
border-top: 1px solid rgba(148, 163, 184, 0.1);
padding-top: 7px;
padding-bottom: 7px;
}

.macro-grid {
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 8px;
}

@media (min-width: 768px) {
.macro-grid {
grid-template-columns: repeat(4, minmax(0, 1fr));
}
}

.macro-item {
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
background: rgba(15, 23, 42, 0.65);
border: 1px solid rgba(148, 163, 184, 0.12);
border-radius: 10px;
padding: 6px 10px;
}

.macro-label {
font-size: 11px;
color: var(--text-muted);
white-space: nowrap;
}

.macro-value-wrap {
display: flex;
align-items: center;
gap: 6px;
}

.macro-value {
font-size: 13px;
font-weight: 800;
font-variant-numeric: tabular-nums;
}

.macro-tf {
font-size: 11px;
font-weight: 700;
color: #60a5fa;
}

.macro-time {
font-size: 11px;
color: var(--text-muted);
font-variant-numeric: tabular-nums;
}

.badge {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 2px 7px;
border-radius: 999px;
font-size: 10px;
font-weight: 700;
white-space: nowrap;
}

.badge.pos {
color: #34d399;
background: rgba(16, 185, 129, 0.15);
border: 1px solid rgba(16, 185, 129, 0.35);
}

.badge.neg {
color: #fb7185;
background: rgba(244, 63, 94, 0.15);
border: 1px solid rgba(244, 63, 94, 0.35);
}

.badge.warn {
color: #fbbf24;
background: rgba(245, 158, 11, 0.16);
border: 1px solid rgba(245, 158, 11, 0.36);
}

.badge.info {
color: #93c5fd;
background: rgba(59, 130, 246, 0.16);
border: 1px solid rgba(59, 130, 246, 0.36);
}

.badge.neutral {
color: var(--text-secondary);
background: rgba(148, 163, 184, 0.14);
border: 1px solid rgba(148, 163, 184, 0.25);
}

.main-shell {
padding-top: 12px;
padding-bottom: max(28px, env(safe-area-inset-bottom));
display: flex;
flex-direction: column;
gap: 12px;
}

.card {
background: linear-gradient(180deg, rgba(16, 24, 43, 0.94), rgba(11, 17, 31, 0.96));
border: 1px solid var(--border-subtle);
border-radius: var(--radius-card);
padding: 14px;
box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}

.card-head {
display: flex;
align-items: flex-start;
justify-content: space-between;
gap: 10px;
margin-bottom: 10px;
}

.section-kicker {
display: block;
font-size: 10px;
font-weight: 700;
letter-spacing: 0.08em;
color: #60a5fa;
text-transform: uppercase;
}

.card-title {
margin: 2px 0 0;
font-size: 15px;
font-weight: 800;
}

.card-sub {
margin: 4px 0 0;
font-size: 11px;
color: var(--text-muted);
}

.mini-label {
display: block;
font-size: 11px;
color: var(--text-muted);
}

.tf-header-row {
display: flex;
flex-wrap: wrap;
align-items: center;
justify-content: space-between;
gap: 8px;
margin-bottom: 10px;
}

.tf-title-group {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 8px;
}

.tf-active-pill {
font-size: 11px;
font-weight: 700;
color: #67e8f9;
background: rgba(34, 211, 238, 0.12);
border: 1px solid rgba(34, 211, 238, 0.3);
padding: 3px 9px;
border-radius: 999px;
}

.overlay-toggles {
display: flex;
flex-wrap: wrap;
gap: 6px;
}

.overlay-btn {
border: 1px solid var(--border-subtle);
background: var(--bg-soft);
color: var(--text-muted);
border-radius: 8px;
padding: 5px 9px;
min-height: 30px;
font-size: 11px;
font-weight: 700;
cursor: pointer;
touch-action: manipulation;
}

.overlay-btn.active {
color: #e0f2fe;
border-color: rgba(56, 189, 248, 0.55);
background: rgba(14, 165, 233, 0.2);
}

.tf-scroll-row {
display: flex;
gap: 6px;
overflow-x: auto;
\-webkit-overflow-scrolling: touch;
scrollbar-width: none;
padding-bottom: 2px;
}

.tf-scroll-row::-webkit-scrollbar {
display: none;
}

.tf-btn {
border: 1px solid var(--border-subtle);
background: var(--bg-soft);
color: var(--text-secondary);
border-radius: 9px;
padding: 7px 11px;
min-height: 34px;
font-size: 12px;
font-weight: 700;
cursor: pointer;
white-space: nowrap;
touch-action: manipulation;
}

.tf-btn.active {
color: #ffffff;
border-color: #60a5fa;
background: linear-gradient(135deg, rgba(37, 99, 235, 0.55), rgba(79, 70, 229, 0.5));
}

.top-tri-grid {
display: grid;
grid-template-columns: 1fr;
gap: 12px;
}

@media (min-width: 1100px) {
.top-tri-grid {
grid-template-columns: repeat(3, minmax(0, 1fr));
}
}

.ticker-heading-row {
display: flex;
flex-wrap: wrap;
align-items: baseline;
gap: 7px;
}

.ticker-heading {
margin: 0;
font-size: 20px;
font-weight: 900;
}

.price-readout {
font-size: 17px;
font-weight: 800;
font-variant-numeric: tabular-nums;
}

.change-readout {
font-size: 12px;
font-weight: 700;
font-variant-numeric: tabular-nums;
}

.change-readout.pos { color: #34d399; }
.change-readout.neg { color: #fb7185; }

.mdd-box {
text-align: right;
background: rgba(244, 63, 94, 0.12);
border: 1px solid rgba(244, 63, 94, 0.32);
border-radius: 10px;
padding: 6px 10px;
}

.mdd-val {
font-size: 14px;
font-weight: 800;
color: #fb7185;
font-variant-numeric: tabular-nums;
}

.chart-stage {
position: relative;
height: 250px;
width: 100%;
}

.chart-legend-strip {
display: flex;
flex-wrap: wrap;
gap: 10px;
margin-top: 8px;
font-size: 11px;
color: var(--text-muted);
}

.dot {
display: inline-block;
width: 8px;
height: 8px;
border-radius: 50%;
margin-right: 4px;
}

.price-dot { background: #38bdf8; }
.env-dot { background: #a78bfa; }
.res-dot { background: #f59e0b; }
.sup-dot { background: #10b981; }
.mdd-dot { background: #f43f5e; }

.signal-badge {
padding: 4px 10px;
border-radius: 999px;
font-size: 11px;
font-weight: 800;
}

.signal-badge.buy {
color: #10b981;
background: rgba(16, 185, 129, 0.16);
border: 1px solid rgba(16, 185, 129, 0.45);
}

.signal-badge.sell {
color: #fb7185;
background: rgba(244, 63, 94, 0.16);
border: 1px solid rgba(244, 63, 94, 0.45);
}

.signal-badge.hold {
color: #fbbf24;
background: rgba(245, 158, 11, 0.16);
border: 1px solid rgba(245, 158, 11, 0.4);
}

.osc-metric-row {
display: flex;
align-items: center;
justify-content: space-between;
gap: 12px;
margin-bottom: 8px;
}

.osc-score-num {
font-size: 22px;
font-weight: 900;
font-variant-numeric: tabular-nums;
}

.osc-bar-wrap {
flex: 1;
}

.osc-bar-labels {
display: flex;
justify-content: space-between;
font-size: 10px;
color: var(--text-muted);
margin-bottom: 4px;
}

.osc-bar-track {
position: relative;
height: 8px;
border-radius: 999px;
background: rgba(148, 163, 184, 0.18);
overflow: hidden;
}

.osc-bar-fill {
height: 100%;
width: 50%;
border-radius: 999px;
transition: width 0.25s ease, background 0.25s ease;
}

.osc-chart-stage {
position: relative;
height: 118px;
width: 100%;
margin-bottom: 10px;
}

.indicator-grid {
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 6px;
}

@media (min-width: 520px) {
.indicator-grid {
grid-template-columns: repeat(3, minmax(0, 1fr));
}
}

.ind-chip {
background: var(--bg-soft);
border: 1px solid rgba(148, 163, 184, 0.14);
border-radius: 9px;
padding: 6px 8px;
display: flex;
flex-direction: column;
gap: 2px;
}

.ind-name {
font-size: 10px;
color: var(--text-muted);
}

.ind-val {
font-size: 12px;
font-weight: 800;
font-variant-numeric: tabular-nums;
}

.score-hero {
display: flex;
align-items: center;
gap: 14px;
margin-bottom: 12px;
}

.score-circle {
width: 84px;
height: 84px;
border-radius: 50%;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
border: 3px solid #3b82f6;
background: radial-gradient(circle at top, rgba(59, 130, 246, 0.22), rgba(15, 23, 42, 0.9));
flex-shrink: 0;
}

.score-num {
font-size: 26px;
font-weight: 900;
line-height: 1;
font-variant-numeric: tabular-nums;
}

.score-den {
font-size: 11px;
color: var(--text-muted);
}

.score-action {
font-size: 15px;
font-weight: 800;
margin-bottom: 4px;
}

.score-desc {
margin: 0;
font-size: 11px;
line-height: 1.45;
color: var(--text-muted);
}

.breakdown-list {
display: flex;
flex-direction: column;
gap: 8px;
}

.breakdown-row {
background: var(--bg-soft);
border: 1px solid rgba(148, 163, 184, 0.14);
border-radius: 10px;
padding: 8px 10px;
}

.breakdown-top {
display: flex;
justify-content: space-between;
font-size: 12px;
font-weight: 700;
margin-bottom: 5px;
}

.mid-tri-grid {
display: grid;
grid-template-columns: 1fr;
gap: 12px;
}

@media (min-width: 1024px) {
.mid-tri-grid {
grid-template-columns: repeat(3, minmax(0, 1fr));
}
}

.kv-grid {
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 8px;
}

.kv-box {
background: var(--bg-soft);
border: 1px solid rgba(148, 163, 184, 0.14);
border-radius: 11px;
padding: 9px 10px;
}

.kv-val {
display: block;
font-size: 17px;
font-weight: 900;
margin: 3px 0;
font-variant-numeric: tabular-nums;
}

.kv-sub {
font-size: 11px;
color: var(--text-secondary);
}

.sns-hero {
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 8px;
}

.sns-score-row {
display: flex;
align-items: baseline;
gap: 4px;
margin-top: 2px;
}

.sns-score-num {
font-size: 26px;
font-weight: 900;
font-variant-numeric: tabular-nums;
}

.progress-track {
height: 9px;
border-radius: 999px;
background: rgba(148, 163, 184, 0.18);
overflow: hidden;
margin-bottom: 10px;
}

.progress-fill {
height: 100%;
border-radius: 999px;
background: linear-gradient(90deg, #f43f5e, #f59e0b, #10b981);
transition: width 0.25s ease;
}

.sns-channel-list {
display: flex;
flex-direction: column;
gap: 6px;
}

.sns-channel-item {
display: flex;
align-items: center;
justify-content: space-between;
background: var(--bg-soft);
border: 1px solid rgba(148, 163, 184, 0.12);
border-radius: 9px;
padding: 7px 10px;
font-size: 12px;
}

.sr-list {
display: flex;
flex-direction: column;
gap: 6px;
}

.sr-item {
display: flex;
align-items: center;
justify-content: space-between;
background: var(--bg-soft);
border: 1px solid rgba(148, 163, 184, 0.14);
border-radius: 10px;
padding: 8px 10px;
font-size: 12px;
}

.sr-tag {
font-weight: 800;
font-size: 11px;
padding: 2px 7px;
border-radius: 6px;
}

.sr-tag.res {
color: #fbbf24;
background: rgba(245, 158, 11, 0.16);
}

.sr-tag.piv {
color: #93c5fd;
background: rgba(59, 130, 246, 0.16);
}

.sr-tag.sup {
color: #34d399;
background: rgba(16, 185, 129, 0.16);
}

.bottom-split-grid {
display: grid;
grid-template-columns: 1fr;
gap: 12px;
}

@media (min-width: 1024px) {
.bottom-split-grid {
grid-template-columns: 1.15fr 0.85fr;
}
}

.flow-macro-grid {
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 8px;
margin-bottom: 12px;
}

.flow-card {
background: var(--bg-soft);
border: 1px solid rgba(148, 163, 184, 0.14);
border-radius: 10px;
padding: 9px 10px;
}

.flow-val {
display: block;
font-size: 14px;
font-weight: 800;
margin-top: 3px;
font-variant-numeric: tabular-nums;
}

.sub-section-title {
margin: 0 0 8px;
font-size: 12px;
font-weight: 800;
color: var(--text-secondary);
}

.news-list {
list-style: none;
margin: 0;
padding: 0;
display: flex;
flex-direction: column;
gap: 7px;
}

.news-item {
background: var(--bg-soft);
border: 1px solid rgba(148, 163, 184, 0.12);
border-radius: 10px;
padding: 8px 10px;
display: flex;
align-items: flex-start;
justify-content: space-between;
gap: 8px;
font-size: 12px;
line-height: 1.4;
}

.sector-list {
display: flex;
flex-direction: column;
gap: 7px;
}

.sector-row {
background: var(--bg-soft);
border: 1px solid rgba(148, 163, 184, 0.14);
border-radius: 10px;
padding: 8px 10px;
}

.sector-top {
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
font-size: 12px;
font-weight: 700;
margin-bottom: 5px;
}

.sector-bar-bg {
height: 6px;
border-radius: 999px;
background: rgba(148, 163, 184, 0.16);
overflow: hidden;
}

.sector-bar-fill {
height: 100%;
border-radius: 999px;
}