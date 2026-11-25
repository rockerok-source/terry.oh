const TIMEFRAMES = {
  LIVE: { label: "실시간", vol: 0.004, mult: 0.65 },
  "1m": { label: "1분봉", vol: 0.006, mult: 0.72 },
  "3m": { label: "3분봉", vol: 0.008, mult: 0.78 },
  "5m": { label: "5분봉", vol: 0.010, mult: 0.84 },
  "10m": { label: "10분봉", vol: 0.012, mult: 0.90 },
  "15m": { label: "15분봉", vol: 0.015, mult: 1.00 },
  "30m": { label: "30분봉", vol: 0.019, mult: 1.12 },
  "60m": { label: "60분봉", vol: 0.024, mult: 1.25 },
  "240m": { label: "240분봉", vol: 0.032, mult: 1.45 },
  "1D": { label: "일봉", vol: 0.045, mult: 1.75 },
  "1W": { label: "주봉", vol: 0.075, mult: 2.30 },
  "1M": { label: "월봉", vol: 0.120, mult: 3.10 }
};

const TICKER_PRESETS = {
  NVDA: { base: 155.38, prevClose: 165.05, sector: "AI 반도체 · 선도 수급", bias: 0.45, pcr: 0.64, shortPct: 1.18, sns: 78 },
  SOXL: { base: 32.50, prevClose: 34.20, sector: "반도체 3X 레버리지", bias: 0.42, pcr: 0.74, shortPct: 6.40, sns: 76 },
  TQQQ: { base: 78.40, prevClose: 80.10, sector: "나스닥100 3X 레버리지", bias: 0.50, pcr: 0.71, shortPct: 4.85, sns: 74 },
  TSLA: { base: 348.20, prevClose: 342.00, sector: "전기차 · 자율주행/로봇", bias: 0.25, pcr: 0.86, shortPct: 2.95, sns: 79 },
  PLTR: { base: 64.90, prevClose: 62.80, sector: "AI 국방·엔터프라이즈", bias: 0.72, pcr: 0.58, shortPct: 4.10, sns: 85 },
  AAPL: { base: 229.40, prevClose: 227.50, sector: "빅테크 · 온디바이스 AI", bias: 0.30, pcr: 0.79, shortPct: 0.68, sns: 68 },
  MSFT: { base: 424.10, prevClose: 421.00, sector: "클라우드 · 코파일럿 AI", bias: 0.35, pcr: 0.73, shortPct: 0.72, sns: 71 },
  SPY: { base: 596.50, prevClose: 599.50, sector: "S&P 500 대형주 벤치마크", bias: 0.28, pcr: 0.92, shortPct: 1.45, sns: 65 }
};

const state = {
  ticker: "NVDA",
  timeframe: "15m",
  showMdd: true,
  showEnv: true,
  showSr: true,
  prices: [],
  mddSeries: [],
  oscSeries: [],
  macro: { fg: 17, vix: 26.36, gpr: 138.6 }
};

function getProfile(ticker) {
  if (TICKER_PRESETS[ticker]) return TICKER_PRESETS[ticker];
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  const base = +(45 + (Math.abs(hash) % 260) + ((Math.abs(hash) % 99) / 100)).toFixed(2);
  const prevClose = +(base * 1.015).toFixed(2);
  const bias = +(((hash % 100) / 100) * 0.8).toFixed(2);
  const pcr = +(0.55 + (Math.abs(hash) % 70) / 100).toFixed(2);
  const shortPct = +(1.5 + (Math.abs(hash) % 90) / 10).toFixed(2);
  const sns = 45 + (Math.abs(hash) % 45);
  return { base, prevClose, sector: "미국 증시 · 퀀트 유니버스", bias, pcr, shortPct, sns };
}

function generateSeries() {
  const prof = getProfile(state.ticker);
  const tf = TIMEFRAMES[state.timeframe];
  const len = 54;
  const arr = [];
  let cur = prof.prevClose || prof.base;

  for (let i = 0; i < len - 1; i++) {
    const wave = Math.sin(i * 0.32) * tf.vol * 0.7 + (Math.random() - 0.5 + prof.bias * 0.05) * tf.vol;
    cur = Math.max(1, cur * (1 + wave));
    arr.push(+cur.toFixed(2));
  }
  arr.push(+prof.base.toFixed(2));
  state.prices = arr;
  recomputeDerived();
}

function setCurrentPrice(newPrice) {
  const clean = Math.max(0.01, +Number(newPrice).toFixed(2));
  const prof = getProfile(state.ticker);
  prof.base = clean;
  if (state.prices.length < 2) {
    generateSeries();
  } else {
    state.prices[state.prices.length - 1] = clean;
    recomputeDerived();
  }
}

function recomputeDerived() {
  let peak = -Infinity;
  state.mddSeries = state.prices.map((p) => {
    if (p > peak) peak = p;
    return +(((p - peak) / peak) * 100).toFixed(2);
  });

  state.oscSeries = state.prices.map((p, idx) => {
    const prev = state.prices[Math.max(0, idx - 4)];
    const raw = ((p - prev) / prev) * 18 + Math.sin(idx * 0.45) * 0.35;
    return Math.max(-1, Math.min(1, +raw.toFixed(2)));
  });
}

function computeIndicators() {
  const p = state.prices;
  const last = p[p.length - 1];
  const prof = getProfile(state.ticker);
  const refClose = prof.prevClose || p[0];
  const tf = TIMEFRAMES[state.timeframe];

  const sliceRange = (n) => {
    const sub = p.slice(-n);
    const hi = Math.max(...sub);
    const lo = Math.min(...sub);
    return hi === lo ? 50 : ((last - lo) / (hi - lo)) * 100;
  };

  const sk5 = +sliceRange(5).toFixed(1);
  const sk12 = +sliceRange(12).toFixed(1);
  const sk20 = +sliceRange(20).toFixed(1);

  const sma20 = p.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const ema12 = p.slice(-12).reduce((a, b) => a + b, 0) / 12;
  const macd = +((ema12 - sma20) * (10 / tf.mult)).toFixed(2);
  const rsi = +Math.max(15, Math.min(88, 50 + ((last - sma20) / sma20) * 420)).toFixed(1);
  const mfi = +Math.max(18, Math.min(90, rsi + prof.bias * 6)).toFixed(1);
  const momentum = +(((last - p[Math.max(0, p.length - 10)]) / p[Math.max(0, p.length - 10)]) * 100).toFixed(2);
  const vr = +Math.max(65, Math.min(240, 118 + momentum * 11)).toFixed(0);
  const obvTrend = momentum >= 0 ? "매집 유입 (+)" : "분산 유출 (-)";
  const envPct = +(((last - sma20) / sma20) * 100).toFixed(2);

  const techScore = (rsi * 0.35 + sk12 * 0.35 + (macd >= 0 ? 72 : 36) * 0.3);
  const flowScore = Math.max(20, Math.min(95, (1.2 - prof.pcr) * 75 + prof.sns * 0.45));
  const macroScore = Math.max(20, Math.min(90, state.macro.fg * 0.55 + (35 - state.macro.vix) * 1.3));
  const totalScore = Math.round(Math.max(1, Math.min(100, techScore * 0.35 + flowScore * 0.4 + macroScore * 0.25)));

  const currentMdd = Math.min(...state.mddSeries);
  const oscNow = state.oscSeries[state.oscSeries.length - 1] || 0;

  return {
    last,
    refClose,
    sma20,
    macd,
    rsi,
    mfi,
    sk5,
    sk12,
    sk20,
    momentum,
    vr,
    obvTrend,
    envPct,
    totalScore,
    currentMdd,
    oscNow,
    prof,
    tf
  };
}

function drawCharts(ind) {
  const pCanvas = document.getElementById("priceChartCanvas");
  const mCanvas = document.getElementById("mddChartCanvas");
  const oCanvas = document.getElementById("oscillatorCanvas");

  [pCanvas, mCanvas, oCanvas].forEach((c) => {
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  });

  const pCtx = pCanvas.getContext("2d");
  const pw = pCanvas.getBoundingClientRect().width;
  const ph = pCanvas.getBoundingClientRect().height;
  pCtx.clearRect(0, 0, pw, ph);

  const envBand = 0.025 * ind.tf.mult;
  const upperEnv = state.prices.map((v) => v * (1 + envBand));
  const lowerEnv = state.prices.map((v) => v * (1 - envBand));
  const allVals = [...state.prices, ...(state.showEnv ? [...upperEnv, ...lowerEnv] : [])];
  const minP = Math.min(...allVals) * 0.996;
  const maxP = Math.max(...allVals) * 1.004;
  const toX = (i) => (i / (state.prices.length - 1)) * (pw - 12) + 6;
  const toY = (v) => ph - 8 - ((v - minP) / (maxP - minP || 1)) * (ph - 16);

  if (state.showSr) {
    const r1 = ind.last * (1 + 0.018 * ind.tf.mult);
    const s1 = ind.last * (1 - 0.018 * ind.tf.mult);
    [
      { y: toY(r1), color: "rgba(244, 63, 94, 0.55)" },
      { y: toY(s1), color: "rgba(16, 185, 129, 0.55)" }
    ].forEach((line) => {
      if (line.y >= 4 && line.y <= ph - 4) {
        pCtx.save();
        pCtx.setLineDash([4, 4]);
        pCtx.strokeStyle = line.color;
        pCtx.lineWidth = 1;
        pCtx.beginPath();
        pCtx.moveTo(0, line.y);
        pCtx.lineTo(pw, line.y);
        pCtx.stroke();
        pCtx.restore();
      }
    });
  }

  if (state.showEnv) {
    [upperEnv, lowerEnv].forEach((band) => {
      pCtx.strokeStyle = "rgba(167, 139, 250, 0.45)";
      pCtx.lineWidth = 1;
      pCtx.beginPath();
      band.forEach((v, i) => (i === 0 ? pCtx.moveTo(toX(i), toY(v)) : pCtx.lineTo(toX(i), toY(v))));
      pCtx.stroke();
    });
  }

  const isUp = ind.last >= ind.refClose;
  pCtx.strokeStyle = isUp ? "#10b981" : "#f43f5e";
  pCtx.lineWidth = 2;
  pCtx.beginPath();
  state.prices.forEach((v, i) => (i === 0 ? pCtx.moveTo(toX(i), toY(v)) : pCtx.lineTo(toX(i), toY(v))));
  pCtx.stroke();

  const mCtx = mCanvas.getContext("2d");
  const mw = mCanvas.getBoundingClientRect().width;
  const mh = mCanvas.getBoundingClientRect().height;
  mCtx.clearRect(0, 0, mw, mh);

  if (state.showMdd) {
    const minMdd = Math.min(-2, Math.min(...state.mddSeries) * 1.15);
    const mToY = (v) => 4 + (v / minMdd) * (mh - 8);
    mCtx.fillStyle = "rgba(244, 63, 94, 0.18)";
    mCtx.strokeStyle = "#f43f5e";
    mCtx.lineWidth = 1.4;
    mCtx.beginPath();
    mCtx.moveTo(toX(0), 2);
    state.mddSeries.forEach((v, i) => mCtx.lineTo(toX(i), mToY(v)));
    mCtx.lineTo(toX(state.mddSeries.length - 1), 2);
    mCtx.closePath();
    mCtx.fill();
    mCtx.stroke();
  }

  const oCtx = oCanvas.getContext("2d");
  const ow = oCanvas.getBoundingClientRect().width;
  const oh = oCanvas.getBoundingClientRect().height;
  oCtx.clearRect(0, 0, ow, oh);
  const midY = oh / 2;

  oCtx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  oCtx.beginPath();
  oCtx.moveTo(0, midY);
  oCtx.lineTo(ow, midY);
  oCtx.stroke();

  const barW = Math.max(2, (ow - 12) / state.oscSeries.length - 1.5);
  state.oscSeries.forEach((val, i) => {
    const x = 6 + (i / state.oscSeries.length) * (ow - 12);
    const h = Math.abs(val) * (midY - 4);
    oCtx.fillStyle = val >= 0 ? "#10b981" : "#f43f5e";
    oCtx.fillRect(x, val >= 0 ? midY - h : midY, barW, Math.max(2, h));
  });
}

function syncOverrideInputs(ind) {
  const priceEl = document.getElementById("ovPrice");
  const vixEl = document.getElementById("ovVix");
  const fgEl = document.getElementById("ovFg");
  if (document.activeElement !== priceEl) priceEl.value = ind.last.toFixed(2);
  if (document.activeElement !== vixEl) vixEl.value = state.macro.vix.toFixed(2);
  if (document.activeElement !== fgEl) fgEl.value = Math.round(state.macro.fg);
}

function renderDashboard() {
  const ind = computeIndicators();
  const chgPct = (((ind.last - ind.refClose) / (ind.refClose || 1)) * 100).toFixed(2);

  document.getElementById("activeTfPill").textContent = `${ind.tf.label} · LIVE`;
  document.getElementById("indTfLabel").textContent = ind.tf.label;
  document.getElementById("dispTicker").textContent = state.ticker;
  document.getElementById("dispSector").textContent = ind.prof.sector;
  document.getElementById("dispPrice").textContent = `$${ind.last.toFixed(2)}`;

  const chgEl = document.getElementById("dispChange");
  chgEl.textContent = `${Number(chgPct) >= 0 ? "+" : ""}${chgPct}%`;
  chgEl.className = `chg-badge ${Number(chgPct) >= 0 ? "up" : "down"}`;
  document.getElementById("dispMdd").textContent = `${ind.currentMdd.toFixed(2)}%`;

  const step1 = 0.018 * ind.tf.mult;
  const step2 = 0.036 * ind.tf.mult;
  document.getElementById("r2Val").textContent = `$${(ind.last * (1 + step2)).toFixed(2)}`;
  document.getElementById("r1Val").textContent = `$${(ind.last * (1 + step1)).toFixed(2)}`;
  document.getElementById("s1Val").textContent = `$${(ind.last * (1 - step1)).toFixed(2)}`;
  document.getElementById("s2Val").textContent = `$${(ind.last * (1 - step2)).toFixed(2)}`;

  const scoreEl = document.getElementById("quantScoreVal");
  const ringEl = document.getElementById("scoreRing");
  const gradeEl = document.getElementById("quantGrade");
  scoreEl.textContent = ind.totalScore;
  if (ind.totalScore >= 70) {
    ringEl.style.borderColor = "#10b981";
    gradeEl.textContent = "강력 매수 우위";
    gradeEl.style.color = "#10b981";
  } else if (ind.totalScore >= 45) {
    ringEl.style.borderColor = "#f59e0b";
    gradeEl.textContent = "중립 · 분할 접근";
    gradeEl.style.color = "#f59e0b";
  } else {
    ringEl.style.borderColor = "#f43f5e";
    gradeEl.textContent = "매도 우위 · 리스크 경계";
    gradeEl.style.color = "#f43f5e";
  }

  const oscBadge = document.getElementById("oscSignalBadge");
  const isBuyOsc = ind.oscNow >= 0;
  oscBadge.textContent = `${isBuyOsc ? "BUY" : "SELL"} ${ind.oscNow >= 0 ? "+" : ""}${ind.oscNow.toFixed(2)}`;
  oscBadge.className = `sig-pill ${isBuyOsc ? "buy" : "sell"}`;

  const pcr = ind.prof.pcr;
  const domEl = document.getElementById("optDominance");
  const callDom = pcr <= 0.85;
  domEl.textContent = callDom ? "콜(CALL) 우위" : "풋(PUT) 우위";
  domEl.className = `dom-badge ${callDom ? "call" : "put"}`;
  document.getElementById("pcrVal").textContent = pcr.toFixed(2);
  document.getElementById("shortVal").textContent = `${ind.prof.shortPct.toFixed(2)}%`;
  const varPct = (1.6 * ind.tf.mult).toFixed(1);
  document.getElementById("riskLevelVal").textContent =
    ind.prof.shortPct > 5 ? `높음 (VaR ${varPct}%)` : `적정 (VaR ${varPct}%)`;

  const sns = Math.min(99, Math.max(12, Math.round(ind.prof.sns + ind.oscNow * 6)));
  document.getElementById("snsScoreVal").textContent = sns;
  document.getElementById("snsBar").style.width = `${sns}%`;
  document.getElementById("snsLabel").textContent = sns >= 65 ? "낙관적 매수심리" : sns >= 45 ? "관망·혼조세" : "공포·매도심리";

  const indicators = [
    { name: "Slow %K (5,3,3)", val: `${ind.sk5}`, sig: ind.sk5 < 25 ? "매수" : ind.sk5 > 78 ? "과열" : "중립" },
    { name: "Slow %K (12,5,5)", val: `${ind.sk12}`, sig: ind.sk12 >= 50 ? "매수" : "매도" },
    { name: "Slow %K (20,12,12)", val: `${ind.sk20}`, sig: ind.sk20 >= 50 ? "상승추세" : "하락추세" },
    { name: "MACD (12,26,9)", val: `${ind.macd >= 0 ? "+" : ""}${ind.macd}`, sig: ind.macd >= 0 ? "골든우위" : "데드우위" },
    { name: "RSI (14)", val: `${ind.rsi}`, sig: ind.rsi < 32 ? "과매도" : ind.rsi > 70 ? "과매수" : "안정" },
    { name: "MFI (자금유입)", val: `${ind.mfi}`, sig: ind.mfi >= 50 ? "유입우위" : "유출우위" },
    { name: "Momentum (10)", val: `${ind.momentum >= 0 ? "+" : ""}${ind.momentum}%`, sig: ind.momentum >= 0 ? "상방탄력" : "하방압력" },
    { name: "VR (거래량비율)", val: `${ind.vr}%`, sig: ind.vr >= 120 ? "수급활발" : "침체" },
    { name: "OBV (누적거래량)", val: ind.obvTrend, sig: ind.momentum >= 0 ? "매집" : "이탈" },
    { name: "Envelope 이격", val: `${ind.envPct >= 0 ? "+" : ""}${ind.envPct}%`, sig: Math.abs(ind.envPct) > 3 ? "밴드이탈" : "밴드내" }
  ];

  document.getElementById("indicatorGrid").innerHTML = indicators
    .map((item) => {
      const cls =
        item.sig.includes("매수") || item.sig.includes("골든") || item.sig.includes("유입") || item.sig.includes("상방") || item.sig.includes("매집") || item.sig.includes("상승") || item.sig.includes("활발")
          ? "tag-buy"
          : item.sig.includes("매도") || item.sig.includes("데드") || item.sig.includes("유출") || item.sig.includes("하방") || item.sig.includes("이탈") || item.sig.includes("하락") || item.sig.includes("과매수")
          ? "tag-sell"
          : "tag-neu";
      return `
        <div class="ind-item">
          <div>
            <span class="ind-name">${item.name}</span>
            <strong class="ind-val">${item.val}</strong>
          </div>
          <span class="ind-tag ${cls}">${item.sig}</span>
        </div>
      `;
    })
    .join("");

  const dpPct = (41.5 + (ind.totalScore % 14) * 0.7).toFixed(1);
  const instFlow = ind.totalScore >= 55 ? `+$${(ind.totalScore * 3.4).toFixed(0)}M 순매수` : `-$${((100 - ind.totalScore) * 2.8).toFixed(0)}M 순매도`;
  const smartPos = ind.totalScore >= 60 ? "기관 콜 스프레드 · 순매집" : "헤지 풋 비중 확대 · 관망";
  const sectorFlow = "반도체·AI 인프라 ▲ / 유틸리티·필수소비 ▼";

  document.getElementById("flowGrid").innerHTML = `
    <div class="flow-item"><span>다크풀 거래 비중</span><strong>${dpPct}% (블록딜 활성)</strong></div>
    <div class="flow-item"><span>기관 수급 (5D)</span><strong>${instFlow}</strong></div>
    <div class="flow-item"><span>스마트머니 포지션</span><strong>${smartPos}</strong></div>
    <div class="flow-item"><span>미국 섹터 수급 이동</span><strong>${sectorFlow}</strong></div>
  `;

  const fgNum = Math.round(state.macro.fg);
  const fgLabel = fgNum <= 25 ? "극단적 공포" : fgNum < 45 ? "공포" : fgNum <= 55 ? "중립" : fgNum < 75 ? "탐욕" : "극단적 탐욕";
  document.getElementById("fgVal").textContent = `${fgNum} (${fgLabel})`;
  document.getElementById("vixVal").textContent = state.macro.vix.toFixed(2);
  document.getElementById("gprVal").textContent = `${state.macro.gpr.toFixed(1)} (${state.macro.gpr >= 120 ? "경계" : "주의"})`;

  syncOverrideInputs(ind);
  drawCharts(ind);
}

document.getElementById("tickerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const val = document.getElementById("tickerInput").value.trim().toUpperCase();
  if (!val) return;
  state.ticker = val;
  document.querySelectorAll(".q-chip").forEach((b) => b.classList.toggle("active", b.dataset.ticker === val));
  generateSeries();
  renderDashboard();
});

document.getElementById("quickTickers").addEventListener("click", (e) => {
  const btn = e.target.closest(".q-chip");
  if (!btn) return;
  state.ticker = btn.dataset.ticker;
  document.getElementById("tickerInput").value = state.ticker;
  document.querySelectorAll(".q-chip").forEach((b) => b.classList.toggle("active", b === btn));
  generateSeries();
  renderDashboard();
});

document.getElementById("tfSelector").addEventListener("click", (e) => {
  const btn = e.target.closest(".tf-btn");
  if (!btn) return;
  state.timeframe = btn.dataset.tf;
  document.querySelectorAll(".tf-btn").forEach((b) => b.classList.toggle("active", b === btn));
  generateSeries();
  renderDashboard();
});

document.getElementById("ovPrice").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  if (Number.isFinite(val) && val > 0) {
    setCurrentPrice(val);
    renderDashboard();
  }
});

document.getElementById("ovVix").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  if (Number.isFinite(val) && val >= 0) {
    state.macro.vix = val;
    renderDashboard();
  }
});

document.getElementById("ovFg").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  if (Number.isFinite(val)) {
    state.macro.fg = Math.max(0, Math.min(100, val));
    renderDashboard();
  }
});

["toggleMdd", "toggleEnv", "toggleSr"].forEach((id) => {
  document.getElementById(id).addEventListener("change", (e) => {
    if (id === "toggleMdd") state.showMdd = e.target.checked;
    if (id === "toggleEnv") state.showEnv = e.target.checked;
    if (id === "toggleSr") state.showSr = e.target.checked;
    renderDashboard();
  });
});

setInterval(() => {
  const tf = TIMEFRAMES[state.timeframe];
  const prof = getProfile(state.ticker);
  const last = state.prices[state.prices.length - 1];
  const delta = (Math.random() - 0.48 + prof.bias * 0.04) * tf.vol * 0.35;
  const next = Math.max(1, +(last * (1 + delta)).toFixed(2));
  state.prices.shift();
  state.prices.push(next);
  prof.base = next;
  recomputeDerived();
  renderDashboard();
}, 2000);

window.addEventListener("resize", renderDashboard);

generateSeries();
renderDashboard();
