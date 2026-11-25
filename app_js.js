(() => {
  'use strict';

  const QUICK_TICKERS = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'PLTR', 'TQQQ', 'SPY'];

  const TIMEFRAMES = [
    { id: 'LIVE', label: '실시간', volScale: 0.35, driftScale: 0.4, srFactor: 0.012, mddScale: 0.65, oscShift: 0 },
    { id: '1m', label: '1분봉', volScale: 0.45, driftScale: 0.5, srFactor: 0.015, mddScale: 0.72, oscShift: 1.2 },
    { id: '3m', label: '3분봉', volScale: 0.58, driftScale: 0.65, srFactor: 0.019, mddScale: 0.78, oscShift: 2.1 },
    { id: '5m', label: '5분봉', volScale: 0.72, driftScale: 0.8, srFactor: 0.024, mddScale: 0.85, oscShift: 3.0 },
    { id: '10m', label: '10분봉', volScale: 0.88, driftScale: 0.95, srFactor: 0.030, mddScale: 0.92, oscShift: 3.8 },
    { id: '15m', label: '15분봉', volScale: 1.0, driftScale: 1.0, srFactor: 0.036, mddScale: 1.0, oscShift: 4.5 },
    { id: '30m', label: '30분봉', volScale: 1.2, driftScale: 1.15, srFactor: 0.045, mddScale: 1.08, oscShift: 5.4 },
    { id: '60m', label: '60분봉', volScale: 1.45, driftScale: 1.35, srFactor: 0.058, mddScale: 1.18, oscShift: 6.5 },
    { id: '240m', label: '240분봉', volScale: 1.8, driftScale: 1.6, srFactor: 0.075, mddScale: 1.3, oscShift: 7.8 },
    { id: '1D', label: '일봉', volScale: 2.2, driftScale: 1.9, srFactor: 0.095, mddScale: 1.45, oscShift: 9.0 },
    { id: '1W', label: '주봉', volScale: 2.9, driftScale: 2.3, srFactor: 0.14, mddScale: 1.65, oscShift: 10.5 },
    { id: '1M', label: '월봉', volScale: 3.6, driftScale: 2.8, srFactor: 0.21, mddScale: 1.85, oscShift: 12.0 }
  ];

  const SECTOR_BASE = [
    { name: '반도체 & AI 인프라 (XLK/SMH)', flowB: 2.45, deltaPct: 1.82 },
    { name: '빅테크 & 클라우드 (IGV)', flowB: 1.38, deltaPct: 0.94 },
    { name: '금융 & 월가 IB (XLF)', flowB: 0.86, deltaPct: 0.61 },
    { name: '헬스케어 & 바이오 (XLV)', flowB: 0.42, deltaPct: 0.35 },
    { name: '방산 & 항공우주 (ITA)', flowB: 0.94, deltaPct: 1.12 },
    { name: '에너지 & 원자재 (XLE)', flowB: -0.58, deltaPct: -0.49 },
    { name: '경기소비재 & EV (XLY)', flowB: 0.29, deltaPct: 0.22 },
    { name: '부동산 & 리츠 (XLRE)', flowB: -0.74, deltaPct: -0.67 }
  ];

  const state = {
    ticker: 'NVDA',
    timeframeId: 'LIVE',
    showMdd: true,
    showEnvelope: true,
    showSr: true,
    macro: {
      fearGreed: 64,
      vix: 15.8,
      gpr: 108.4
    },
    profiles: {},
    seriesByKey: {},
    sectors: SECTOR_BASE.map((s) => ({ ...s })),
    charts: {
      priceMdd: null,
      oscillator: null
    }
  };

  function getTfConfig(tfId = state.timeframeId) {
    return TIMEFRAMES.find((t) => t.id === tfId) || TIMEFRAMES[0];
  }

  function hashTicker(ticker) {
    let h = 2166136261;
    for (let i = 0; i < ticker.length; i += 1) {
      h ^= ticker.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function getOrCreateProfile(ticker) {
    const upper = ticker.toUpperCase();
    if (state.profiles[upper]) return state.profiles[upper];

    const seed = hashTicker(upper);
    const basePrice = Number((38 + (seed % 460) + ((seed % 99) / 100)).toFixed(2));
    const bias = (((seed % 100) - 50) / 50) * 0.65;

    const profile = {
      ticker: upper,
      basePrice,
      bias,
      shortInterest: Number((3.2 + ((seed % 180) / 10)).toFixed(1)),
      coverDays: Number((1.1 + ((seed % 45) / 10)).toFixed(1)),
      pcRatio: Number((0.58 + ((seed % 78) / 100)).toFixed(2)),
      darkPoolShare: Number((36.5 + ((seed % 240) / 10)).toFixed(1)),
      smartMoneyFlowM: Number((((seed % 900) - 320) * 1.4).toFixed(1)),
      instFlowM: Number((((seed % 700) - 240) * 1.8).toFixed(1)),
      snsScore: clamp(Math.round(52 + bias * 24 + ((seed % 19) - 9)), 12, 95),
      snsDeltaPct: Number((((seed % 80) - 25) / 10).toFixed(1)),
      xSentiment: clamp(Math.round(54 + bias * 22 + ((seed % 15) - 7)), 10, 96),
      redditSentiment: clamp(Math.round(50 + bias * 26 + ((seed % 21) - 10)), 10, 96),
      stocktwitsSentiment: clamp(Math.round(53 + bias * 20 + ((seed % 17) - 8)), 10, 96)
    };

    state.profiles[upper] = profile;
    return profile;
  }

  function seriesKey(ticker, tfId) {
    return `${ticker.toUpperCase()}__${tfId}`;
  }

  function ensureSeries(ticker, tfId) {
    const upper = ticker.toUpperCase();
    const key = seriesKey(upper, tfId);
    if (state.seriesByKey[key]) return state.seriesByKey[key];

    const profile = getOrCreateProfile(upper);
    const tf = getTfConfig(tfId);
    const points = 42;
    const prices = [];
    const mddSeries = [];
    const oscSeries = [];
    const labels = [];

    let cur = profile.basePrice * (0.94 + ((hashTicker(upper + tfId) % 12) / 100));
    let peak = cur;

    for (let i = 0; i < points; i += 1) {
      const wave = Math.sin(i * 0.34 + (hashTicker(upper) % 7)) * profile.basePrice * 0.008 * tf.volScale;
      const step = wave + profile.bias * profile.basePrice * 0.0014 * tf.driftScale;
      cur = Math.max(2, Number((cur + step).toFixed(2)));
      if (cur > peak) peak = cur;

      const ddPct = Number((((cur - peak) / peak) * 100 * tf.mddScale).toFixed(2));
      const oscVal = Number(
        clamp(Math.sin(i * 0.28 + profile.bias * 2) * 58 + profile.bias * 28 + tf.oscShift, -95, 95).toFixed(1)
      );

      prices.push(cur);
      mddSeries.push(ddPct);
      oscSeries.push(oscVal);
      labels.push(formatSlotLabel(i, tfId));
    }

    const entry = {
      labels,
      prices,
      mddSeries,
      oscSeries,
      prevClose: prices[0],
      tickCounter: points
    };
    state.seriesByKey[key] = entry;
    return entry;
  }

  function formatSlotLabel(index, tfId) {
    if (tfId === 'LIVE') return `T-${Math.max(0, 41 - index)}`;
    if (tfId.endsWith('m')) return `${index * parseInt(tfId, 10)}m`;
    if (tfId === '1D') return `D-${41 - index}`;
    if (tfId === '1W') return `W-${41 - index}`;
    if (tfId === '1M') return `M-${41 - index}`;
    return `#${index + 1}`;
  }

  function computeIndicators(profile, series, tf) {
    const prices = series.prices;
    const last = prices[prices.length - 1];
    const lookbackShort = prices.slice(-6);
    const lookbackMid = prices.slice(-14);
    const lookbackLong = prices.slice(-24);

    const minS = Math.min(...lookbackShort);
    const maxS = Math.max(...lookbackShort);
    const slowK5 = clamp(
      Math.round((((last - minS) / Math.max(0.01, maxS - minS)) * 75 + 15 + profile.bias * 12 + tf.oscShift)),
      5,
      98
    );

    const minM = Math.min(...lookbackMid);
    const maxM = Math.max(...lookbackMid);
    const slowK12 = clamp(
      Math.round((((last - minM) / Math.max(0.01, maxM - minM)) * 72 + 16 + profile.bias * 14 + tf.oscShift * 0.8)),
      6,
      97
    );

    const minL = Math.min(...lookbackLong);
    const maxL = Math.max(...lookbackLong);
    const slowK20 = clamp(
      Math.round((((last - minL) / Math.max(0.01, maxL - minL)) * 70 + 18 + profile.bias * 16 + tf.oscShift * 0.6)),
      8,
      96
    );

    const macd = Number(((profile.bias * 1.45 + Math.sin(series.tickCounter * 0.25) * 0.65) * tf.driftScale).toFixed(2));
    const rsi = clamp(Math.round(52 + profile.bias * 19 + Math.cos(series.tickCounter * 0.3) * 8 + tf.oscShift * 0.5), 14, 88);
    const mfi = clamp(Math.round(54 + (profile.instFlowM / 450) * 18 + Math.sin(series.tickCounter * 0.2) * 7), 15, 89);
    const obvTrend = profile.instFlowM + profile.smartMoneyFlowM >= 0 ? '순유입 상승' : '순유출 압력';
    const momentumPct = Number((((last - prices[Math.max(0, prices.length - 8)]) / Math.max(1, prices[Math.max(0, prices.length - 8)])) * 100).toFixed(2));
    const envHalf = last * tf.srFactor * 0.75;
    const vr = clamp(Math.round(108 + profile.bias * 34 + (profile.darkPoolShare - 45) * 1.2), 45, 240);

    return {
      macd,
      rsi,
      mfi,
      obvTrend,
      slowK5,
      slowK12,
      slowK20,
      momentumPct,
      envUpper: Number((last + envHalf).toFixed(2)),
      envLower: Number(Math.max(0.5, last - envHalf).toFixed(2)),
      vr
    };
  }

  function computeQuantAndRisk(profile, ind, tf) {
    const oscLast = state.seriesByKey[seriesKey(profile.ticker, tf.id)].oscSeries.slice(-1)[0] || 0;

    const techScore = clamp(
      Math.round(
        50 +
          clamp(ind.macd * 10, -16, 16) +
          (ind.rsi - 50) * 0.35 +
          (ind.mfi - 50) * 0.3 +
          ((ind.slowK5 + ind.slowK12 + ind.slowK20) / 3 - 50) * 0.25 +
          clamp(ind.momentumPct * 3, -12, 12)
      ),
      1,
      100
    );

    const flowScore = clamp(
      Math.round(
        52 +
          clamp(profile.instFlowM / 22, -16, 16) +
          clamp(profile.smartMoneyFlowM / 20, -16, 16) +
          (1.0 - profile.pcRatio) * 28 +
          (profile.darkPoolShare - 45) * 0.55
      ),
      1,
      100
    );

    const avgSectorDelta =
      state.sectors.reduce((acc, s) => acc + s.deltaPct, 0) / Math.max(1, state.sectors.length);
    const macroScore = clamp(
      Math.round(
        50 +
          (state.macro.fearGreed - 50) * 0.38 -
          (state.macro.vix - 16) * 1.35 -
          (state.macro.gpr - 105) * 0.45 +
          avgSectorDelta * 9
      ),
      1,
      100
    );

    const totalScore = clamp(Math.round(techScore * 0.35 + flowScore * 0.4 + macroScore * 0.25), 1, 100);

    const optionDominance =
      profile.pcRatio < 0.85
        ? '콜 옵션 우위 (상방 베팅)'
        : profile.pcRatio > 1.15
        ? '풋 옵션 우위 (하방 헷지)'
        : '콜/풋 균형 구간';

    const riskPoints = clamp(
      Math.round(
        24 +
          profile.shortInterest * 1.4 +
          Math.max(0, profile.pcRatio - 0.8) * 26 +
          Math.max(0, state.macro.vix - 15) * 1.8 +
          Math.max(0, state.macro.gpr - 100) * 0.35
      ),
      8,
      96
    );
    const var95Pct = Number((1.15 + riskPoints * 0.042 * tf.mddScale).toFixed(2));

    return {
      oscLast,
      techScore,
      flowScore,
      macroScore,
      totalScore,
      optionDominance,
      riskPoints,
      var95Pct
    };
  }

  function stepStream() {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const syncEl = document.getElementById('lastSyncTime');
    if (syncEl) syncEl.textContent = timeStr;

    state.macro.fearGreed = clamp(
      Math.round(state.macro.fearGreed + (Math.random() - 0.49) * 2.2),
      10,
      92
    );
    state.macro.vix = Number(
      clamp(state.macro.vix + (Math.random() - 0.5) * 0.35, 11.2, 42.0).toFixed(1)
    );
    state.macro.gpr = Number(
      clamp(state.macro.gpr + (Math.random() - 0.48) * 1.6, 75.0, 185.0).toFixed(1)
    );

    state.sectors.forEach((sec) => {
      sec.flowB = Number((sec.flowB + (Math.random() - 0.48) * 0.08).toFixed(2));
      sec.deltaPct = Number(clamp(sec.deltaPct + (Math.random() - 0.49) * 0.14, -4.5, 5.5).toFixed(2));
    });

    const profile = getOrCreateProfile(state.ticker);
    const tf = getTfConfig(state.timeframeId);
    const series = ensureSeries(state.ticker, state.timeframeId);

    const prevPrice = series.prices[series.prices.length - 1];
    const shock = (Math.random() - 0.49) * prevPrice * 0.0045 * tf.volScale;
    const drift = profile.bias * prevPrice * 0.0012 * tf.driftScale;
    const nextPrice = Math.max(2, Number((prevPrice + shock + drift).toFixed(2)));

    const peak = Math.max(...series.prices, nextPrice);
    const nextMdd = Number((((nextPrice - peak) / peak) * 100 * tf.mddScale).toFixed(2));

    const nextOsc = Number(
      clamp(
        series.oscSeries[series.oscSeries.length - 1] * 0.75 +
          (Math.random() - 0.47) * 28 +
          profile.bias * 12,
        -98,
        98
      ).toFixed(1)
    );

    series.tickCounter += 1;
    series.prices.push(nextPrice);
    series.mddSeries.push(nextMdd);
    series.oscSeries.push(nextOsc);
    series.labels.push(formatSlotLabel(series.tickCounter, state.timeframeId));

    if (series.prices.length > 42) {
      series.prices.shift();
      series.mddSeries.shift();
      series.oscSeries.shift();
      series.labels.shift();
    }

    profile.snsScore = clamp(Math.round(profile.snsScore + (Math.random() - 0.48) * 3), 5, 99);
    profile.smartMoneyFlowM = Number((profile.smartMoneyFlowM + (Math.random() - 0.47) * 18).toFixed(1));
    profile.instFlowM = Number((profile.instFlowM + (Math.random() - 0.47) * 22).toFixed(1));

    renderDashboard();
  }

  function renderMacroBar() {
    const { fearGreed, vix, gpr } = state.macro;
    const tf = getTfConfig(state.timeframeId);

    const fgVal = document.getElementById('fgValue');
    const fgBadge = document.getElementById('fgBadge');
    if (fgVal && fgBadge) {
      fgVal.textContent = `${fearGreed}점`;
      if (fearGreed >= 65) {
        fgBadge.textContent = '탐욕 우위';
        fgBadge.className = 'badge pos';
      } else if (fearGreed <= 35) {
        fgBadge.textContent = '공포 구간';
        fgBadge.className = 'badge neg';
      } else {
        fgBadge.textContent = '중립';
        fgBadge.className = 'badge neutral';
      }
    }

    const vixVal = document.getElementById('vixValue');
    const vixBadge = document.getElementById('vixBadge');
    if (vixVal && vixBadge) {
      vixVal.textContent = vix.toFixed(1);
      if (vix >= 25) {
        vixBadge.textContent = '고변동 경계';
        vixBadge.className = 'badge neg';
      } else if (vix >= 18) {
        vixBadge.textContent = '주의';
        vixBadge.className = 'badge warn';
      } else {
        vixBadge.textContent = '안정';
        vixBadge.className = 'badge pos';
      }
    }

    const gprVal = document.getElementById('gprValue');
    const gprBadge = document.getElementById('gprBadge');
    if (gprVal && gprBadge) {
      gprVal.textContent = gpr.toFixed(1);
      if (gpr >= 130) {
        gprBadge.textContent = '위기 고조';
        gprBadge.className = 'badge neg';
      } else if (gpr >= 110) {
        gprBadge.textContent = '긴장 주시';
        gprBadge.className = 'badge warn';
      } else {
        gprBadge.textContent = '평온';
        gprBadge.className = 'badge info';
      }
    }

    const activeTfMacro = document.getElementById('activeTfMacro');
    if (activeTfMacro) activeTfMacro.textContent = tf.label;
  }

  function renderTimeframeBar() {
    const container = document.getElementById('timeframeBar');
    if (!container) return;

    const currentTf = getTfConfig(state.timeframeId);
    const summaryEl = document.getElementById('tfSummaryBadge');
    if (summaryEl) {
      summaryEl.textContent = `현재 주기: ${currentTf.label} · 변동스케일 ${currentTf.volScale.toFixed(2)}x · 지표/MDD 동기화`;
    }

    container.innerHTML = '';
    TIMEFRAMES.forEach((tf) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tf-btn ${tf.id === state.timeframeId ? 'active' : ''}`;
      btn.textContent = tf.label;
      btn.setAttribute('aria-selected', String(tf.id === state.timeframeId));
      btn.addEventListener('click', () => {
        state.timeframeId = tf.id;
        ensureSeries(state.ticker, tf.id);
        renderDashboard();
      });
      container.appendChild(btn);
    });

    const mddBtn = document.getElementById('toggleMddBtn');
    const envBtn = document.getElementById('toggleEnvBtn');
    const srBtn = document.getElementById('toggleSrBtn');
    if (mddBtn) mddBtn.classList.toggle('active', state.showMdd);
    if (envBtn) envBtn.classList.toggle('active', state.showEnvelope);
    if (srBtn) srBtn.classList.toggle('active', state.showSr);
  }

  function renderQuickTickers() {
    const wrap = document.getElementById('quickTickers');
    if (!wrap) return;
    wrap.innerHTML = '';

    const list = QUICK_TICKERS.includes(state.ticker)
      ? QUICK_TICKERS
      : [state.ticker, ...QUICK_TICKERS];

    list.forEach((sym) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `quick-btn ${sym === state.ticker ? 'active' : ''}`;
      btn.textContent = sym;
      btn.addEventListener('click', () => selectTicker(sym));
      wrap.appendChild(btn);
    });
  }

  function ensureCharts() {
    if (typeof window.Chart === 'undefined') return;

    const priceCtx = document.getElementById('priceMddChart');
    if (priceCtx && !state.charts.priceMdd) {
      state.charts.priceMdd = new window.Chart(priceCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: '종가',
              yAxisID: 'yPrice',
              data: [],
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              borderWidth: 2.2,
              pointRadius: 0,
              tension: 0.25,
              fill: false
            },
            {
              label: 'Envelope 상단',
              yAxisID: 'yPrice',
              data: [],
              borderColor: 'rgba(167, 139, 250, 0.7)',
              borderDash: [4, 4],
              borderWidth: 1.3,
              pointRadius: 0,
              tension: 0.2
            },
            {
              label: 'Envelope 하단',
              yAxisID: 'yPrice',
              data: [],
              borderColor: 'rgba(167, 139, 250, 0.7)',
              borderDash: [4, 4],
              borderWidth: 1.3,
              pointRadius: 0,
              tension: 0.2
            },
            {
              label: '저항(R1)',
              yAxisID: 'yPrice',
              data: [],
              borderColor: 'rgba(245, 158, 11, 0.75)',
              borderDash: [2, 3],
              borderWidth: 1.2,
              pointRadius: 0
            },
            {
              label: '지지(S1)',
              yAxisID: 'yPrice',
              data: [],
              borderColor: 'rgba(16, 185, 129, 0.75)',
              borderDash: [2, 3],
              borderWidth: 1.2,
              pointRadius: 0
            },
            {
              label: 'MDD (%)',
              yAxisID: 'yMdd',
              data: [],
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.16)',
              borderWidth: 1.6,
              pointRadius: 0,
              tension: 0.2,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              ticks: { color: '#94a3b8', maxTicksLimit: 7, font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.08)' }
            },
            yPrice: {
              position: 'left',
              ticks: { color: '#e2e8f0', maxTicksLimit: 5, font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            yMdd: {
              position: 'right',
              suggestedMax: 0,
              suggestedMin: -12,
              ticks: {
                color: '#fb7185',
                maxTicksLimit: 4,
                font: { size: 10 },
                callback: (v) => `${v}%`
              },
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }

    const oscCtx = document.getElementById('oscillatorChart');
    if (oscCtx && !state.charts.oscillator) {
      state.charts.oscillator = new window.Chart(oscCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            {
              label: '시그널 오실레이터',
              data: [],
              backgroundColor: [],
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: {
              min: -100,
              max: 100,
              ticks: { color: '#94a3b8', stepSize: 50, font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.12)' }
            }
          }
        }
      });
    }
  }

  function renderChartAndOscillator(profile, series, ind, calc) {
    ensureCharts();
    const tf = getTfConfig(state.timeframeId);
    const lastPrice = series.prices[series.prices.length - 1];
    const diffPct = (((lastPrice - series.prevClose) / Math.max(0.01, series.prevClose)) * 100).toFixed(2);
    const isPos = Number(diffPct) >= 0;

    const titleEl = document.getElementById('chartTickerTitle');
    const tfTagEl = document.getElementById('chartTfTag');
    const priceEl = document.getElementById('chartPrice');
    const chgEl = document.getElementById('chartChange');
    const mddEl = document.getElementById('currentMddVal');

    if (titleEl) titleEl.textContent = profile.ticker;
    if (tfTagEl) tfTagEl.textContent = tf.label;
    if (priceEl) priceEl.textContent = `$${lastPrice.toFixed(2)}`;
    if (chgEl) {
      chgEl.textContent = `${isPos ? '+' : ''}${diffPct}%`;
      chgEl.className = `change-readout ${isPos ? 'pos' : 'neg'}`;
    }

    const lastMdd = series.mddSeries[series.mddSeries.length - 1];
    if (mddEl) mddEl.textContent = `${lastMdd.toFixed(2)}%`;

    const r1Price = Number((lastPrice * (1 + tf.srFactor * 0.65)).toFixed(2));
    const s1Price = Number(Math.max(0.5, lastPrice * (1 - tf.srFactor * 0.65)).toFixed(2));
    const len = series.prices.length;

    if (state.charts.priceMdd) {
      const ch = state.charts.priceMdd;
      ch.data.labels = series.labels;
      ch.data.datasets[0].data = series.prices;
      ch.data.datasets[1].data = state.showEnvelope
        ? series.prices.map((p) => Number((p * (1 + tf.srFactor * 0.55)).toFixed(2)))
        : [];
      ch.data.datasets[2].data = state.showEnvelope
        ? series.prices.map((p) => Number(Math.max(0.5, p * (1 - tf.srFactor * 0.55)).toFixed(2)))
        : [];
      ch.data.datasets[3].data = state.showSr ? Array(len).fill(r1Price) : [];
      ch.data.datasets[4].data = state.showSr ? Array(len).fill(s1Price) : [];
      ch.data.datasets[5].data = state.showMdd ? series.mddSeries : [];
      ch.update();
    }

    const sigBadge = document.getElementById('oscSignalBadge');
    const oscScoreEl = document.getElementById('oscScoreVal');
    const oscFill = document.getElementById('oscBarFill');

    if (oscScoreEl) {
      oscScoreEl.textContent = `${calc.oscLast >= 0 ? '+' : ''}${calc.oscLast.toFixed(1)}`;
      oscScoreEl.style.color = calc.oscLast >= 18 ? '#34d399' : calc.oscLast <= -18 ? '#fb7185' : '#fbbf24';
    }

    if (sigBadge) {
      if (calc.oscLast >= 18) {
        sigBadge.textContent = '매수 시그널 (BUY)';
        sigBadge.className = 'signal-badge buy';
      } else if (calc.oscLast <= -18) {
        sigBadge.textContent = '매도 시그널 (SELL)';
        sigBadge.className = 'signal-badge sell';
      } else {
        sigBadge.textContent = '중립/관망 (HOLD)';
        sigBadge.className = 'signal-badge hold';
      }
    }

    if (oscFill) {
      const pct = clamp(((calc.oscLast + 100) / 200) * 100, 4, 96);
      oscFill.style.width = `${pct}%`;
      oscFill.style.background =
        calc.oscLast >= 0
          ? 'linear-gradient(90deg, #3b82f6, #10b981)'
          : 'linear-gradient(90deg, #f43f5e, #f59e0b)';
    }

    if (state.charts.oscillator) {
      const oc = state.charts.oscillator;
      oc.data.labels = series.labels;
      oc.data.datasets[0].data = series.oscSeries;
      oc.data.datasets[0].backgroundColor = series.oscSeries.map((v) =>
        v >= 0 ? 'rgba(16, 185, 129, 0.78)' : 'rgba(244, 63, 94, 0.78)'
      );
      oc.update();
    }

    const indGrid = document.getElementById('indicatorGrid');
    if (indGrid) {
      const items = [
        { k: 'MACD', v: `${ind.macd >= 0 ? '+' : ''}${ind.macd}` },
        { k: 'RSI (14)', v: `${ind.rsi}` },
        { k: 'MFI', v: `${ind.mfi}` },
        { k: 'OBV', v: ind.obvTrend },
        { k: 'Slow %K (5,3,3)', v: `${ind.slowK5}%` },
        { k: 'Slow %K (12,5,5)', v: `${ind.slowK12}%` },
        { k: 'Slow %K (20,12,12)', v: `${ind.slowK20}%` },
        { k: 'Momentum', v: `${ind.momentumPct >= 0 ? '+' : ''}${ind.momentumPct}%` },
        { k: 'VR / Env', v: `${ind.vr}% · $${ind.envLower}~$${ind.envUpper}` }
      ];

      indGrid.innerHTML = items
        .map(
          (it) => `
          <div class="ind-chip">
            <span class="ind-name">${it.k}</span>
            <span class="ind-val">${it.v}</span>
          </div>
        `
        )
        .join('');
    }
  }

  function renderQuantScore(calc) {
    const scoreNum = document.getElementById('quantScoreNum');
    const scoreCircle = document.getElementById('quantScoreCircle');
    const gradeBadge = document.getElementById('quantGradeBadge');
    const actionEl = document.getElementById('quantActionText');
    const breakdownEl = document.getElementById('factorBreakdown');

    const s = calc.totalScore;
    if (scoreNum) scoreNum.textContent = String(s);

    let color = '#60a5fa';
    let grade = 'TIER B';
    let action = '균형 수급 · 분할 접근 유효';

    if (s >= 72) {
      color = '#10b981';
      grade = 'STRONG BUY';
      action = '강한 퀀트 매수 우위 (모멘텀+수급 동반)';
    } else if (s >= 56) {
      color = '#38bdf8';
      grade = 'BUY BIAS';
      action = '상방 퀀트 우위 · 눌림목 매수 관찰';
    } else if (s <= 36) {
      color = '#f43f5e';
      grade = 'SELL / RISK';
      action = '하방 압력 우위 · 리스크 축소 권고';
    } else if (s <= 46) {
      color = '#f59e0b';
      grade = 'CAUTIOUS';
      action = '보수적 관망 · 변동성/수급 확인 필요';
    }

    if (scoreCircle) scoreCircle.style.borderColor = color;
    if (gradeBadge) {
      gradeBadge.textContent = grade;
      gradeBadge.className = `badge ${s >= 56 ? 'pos' : s <= 40 ? 'neg' : 'info'}`;
    }
    if (actionEl) {
      actionEl.textContent = action;
      actionEl.style.color = color;
    }

    if (breakdownEl) {
      const rows = [
        { label: '기술적 팩터 (35%) · MACD/RSI/MFI/OBV/Slow%K/VR', score: calc.techScore, barColor: '#38bdf8' },
        { label: '수급·옵션 팩터 (40%) · 다크풀/기관/스마트머니/P-C', score: calc.flowScore, barColor: '#10b981' },
        { label: '매크로·지정학·섹터 (25%) · F&G/VIX/GPR/섹터', score: calc.macroScore, barColor: '#a78bfa' }
      ];

      breakdownEl.innerHTML = rows
        .map(
          (r) => `
          <div class="breakdown-row">
            <div class="breakdown-top">
              <span>${r.label}</span>
              <span>${r.score}점</span>
            </div>
            <div class="sector-bar-bg">
              <div class="sector-bar-fill" style="width:${r.score}%; background:${r.barColor};"></div>
            </div>
          </div>
        `
        )
        .join('');
    }
  }

  function renderShortOptionsAndRisk(profile, calc) {
    const pcVal = document.getElementById('pcRatioVal');
    const optDom = document.getElementById('optionDominanceText');
    const shortVal = document.getElementById('shortInterestVal');
    const coverEl = document.getElementById('shortCoverDays');
    const dpVal = document.getElementById('darkPoolShareVal');
    const dpBias = document.getElementById('darkPoolBias');
    const varVal = document.getElementById('varRiskVal');
    const riskSub = document.getElementById('riskScoreSub');
    const riskBadge = document.getElementById('riskLevelBadge');

    if (pcVal) pcVal.textContent = profile.pcRatio.toFixed(2);
    if (optDom) optDom.textContent = calc.optionDominance;
    if (shortVal) shortVal.textContent = `${profile.shortInterest.toFixed(1)}%`;
    if (coverEl) coverEl.textContent = `커버링 추정 ${profile.coverDays.toFixed(1)}일`;
    if (dpVal) dpVal.textContent = `${profile.darkPoolShare.toFixed(1)}%`;
    if (dpBias) {
      dpBias.textContent = profile.darkPoolShare >= 48 ? '다크풀 블록 활동 활발' : '일반 거래소 비중 우세';
    }
    if (varVal) varVal.textContent = `-${calc.var95Pct.toFixed(2)}%`;
    if (riskSub) riskSub.textContent = `위험점수 ${calc.riskPoints} / 100`;

    if (riskBadge) {
      if (calc.riskPoints >= 65) {
        riskBadge.textContent = '위험도 높음';
        riskBadge.className = 'badge neg';
      } else if (calc.riskPoints >= 42) {
        riskBadge.textContent = '위험도 보통';
        riskBadge.className = 'badge warn';
      } else {
        riskBadge.textContent = '위험도 낮음';
        riskBadge.className = 'badge pos';
      }
    }
  }

  function renderSnsAndSupportResistance(profile, series) {
    const snsScoreEl = document.getElementById('snsScoreVal');
    const snsFill = document.getElementById('snsProgressFill');
    const snsBadge = document.getElementById('snsMoodBadge');
    const snsDelta = document.getElementById('snsMentionDelta');
    const snsChannels = document.getElementById('snsChannels');

    const sc = clamp(profile.snsScore, 1, 100);
    if (snsScoreEl) snsScoreEl.textContent = String(sc);
    if (snsFill) snsFill.style.width = `${sc}%`;

    if (snsBadge) {
      if (sc >= 65) {
        snsBadge.textContent = '강한 낙관 (1~100)';
        snsBadge.className = 'badge pos';
      } else if (sc <= 35) {
        snsBadge.textContent = '비관 우위 (1~100)';
        snsBadge.className = 'badge neg';
      } else {
        snsBadge.textContent = '중립 관망 (1~100)';
        snsBadge.className = 'badge info';
      }
    }

    if (snsDelta) {
      const d = profile.snsDeltaPct;
      snsDelta.textContent = `멘션 ${d >= 0 ? '+' : ''}${d.toFixed(1)}%`;
      snsDelta.className = `badge ${d >= 0 ? 'pos' : 'neg'}`;
    }

    if (snsChannels) {
      const chList = [
        { name: 'X (금융 트위터)', val: `${profile.xSentiment}/100` },
        { name: 'Reddit (r/stocks · r/wallstreetbets)', val: `${profile.redditSentiment}/100` },
        { name: 'StockTwits 리테일 스트림', val: `${profile.stocktwitsSentiment}/100` }
      ];
      snsChannels.innerHTML = chList
        .map(
          (c) => `
          <div class="sns-channel-item">
            <span>${c.name}</span>
            <strong>${c.val}</strong>
          </div>
        `
        )
        .join('');
    }

    const tf = getTfConfig(state.timeframeId);
    const srTfBadge = document.getElementById('srTfBadge');
    const srListEl = document.getElementById('srLevelsList');
    if (srTfBadge) srTfBadge.textContent = `${tf.label} 기준`;

    const last = series.prices[series.prices.length - 1];
    const step = last * tf.srFactor;
    const levels = [
      { type: 'res', label: '2차 저항선 (R2)', price: last + step * 1.35 },
      { type: 'res', label: '1차 저항선 (R1)', price: last + step * 0.68 },
      { type: 'piv', label: '피봇 기준선 (Pivot)', price: last },
      { type: 'sup', label: '1차 지지선 (S1)', price: Math.max(0.5, last - step * 0.68) },
      { type: 'sup', label: '2차 지지선 (S2)', price: Math.max(0.5, last - step * 1.35) }
    ];

    if (srListEl) {
      srListEl.innerHTML = levels
        .map((lv) => {
          const gapPct = (((lv.price - last) / Math.max(0.01, last)) * 100).toFixed(2);
          return `
            <div class="sr-item">
              <span class="sr-tag ${lv.type}">${lv.label}</span>
              <strong>$${lv.price.toFixed(2)}</strong>
              <span class="macro-time">${Number(gapPct) >= 0 ? '+' : ''}${gapPct}%</span>
            </div>
          `;
        })
        .join('');
    }
  }

  function renderFlowMacroAndSectors(profile) {
    const flowGrid = document.getElementById('flowMacroGrid');
    if (flowGrid) {
      const cards = [
        {
          label: '기관 순수급 (Institutional)',
          val: `${profile.instFlowM >= 0 ? '+' : ''}$${profile.instFlowM.toFixed(1)}M`,
          cls: profile.instFlowM >= 0 ? 'pos' : 'neg'
        },
        {
          label: '스마트머니 포지션',
          val: `${profile.smartMoneyFlowM >= 0 ? '+' : ''}$${profile.smartMoneyFlowM.toFixed(1)}M`,
          cls: profile.smartMoneyFlowM >= 0 ? 'pos' : 'neg'
        },
        {
          label: '거시경제 금리·유동성 기조',
          val: state.macro.vix < 20 ? '유동성 우호적' : '변동성 경계',
          cls: state.macro.vix < 20 ? 'pos' : 'neg'
        },
        {
          label: '지정학·매크로 리스크',
          val: `GPR ${state.macro.gpr.toFixed(1)} · F&G ${state.macro.fearGreed}`,
          cls: state.macro.gpr < 125 ? 'pos' : 'neg'
        }
      ];

      flowGrid.innerHTML = cards
        .map(
          (c) => `
          <div class="flow-card">
            <span class="mini-label">${c.label}</span>
            <span class="flow-val ${c.cls === 'pos' ? 'change-readout pos' : 'change-readout neg'}">${c.val}</span>
          </div>
        `
        )
        .join('');
    }

    const newsList = document.getElementById('macroNewsList');
    if (newsList) {
      const headlines = [
        {
          tag: '수급',
          cls: 'pos',
          text: `${profile.ticker} 다크풀 블록 거래 비중 ${profile.darkPoolShare.toFixed(1)}% 포착, 기관·스마트머니 루프 모니터링 진행`
        },
        {
          tag: '거시',
          cls: 'info',
          text: `미 국채금리·달러 인덱스 및 연준 유동성 경로 점검 · VIX ${state.macro.vix.toFixed(1)}, 공포탐욕 ${state.macro.fearGreed}점`
        },
        {
          tag: '지정학',
          cls: state.macro.gpr >= 120 ? 'warn' : 'neutral',
          text: `글로벌 지정학적 위기 지수(GPR) ${state.macro.gpr.toFixed(1)} 기록 · 원자재/방산/반도체 공급망 민감도 반영`
        }
      ];

      newsList.innerHTML = headlines
        .map(
          (h) => `
          <li class="news-item">
            <span>${h.text}</span>
            <span class="badge ${h.cls}">${h.tag}</span>
          </li>
        `
        )
        .join('');
    }

    const sectorEl = document.getElementById('sectorFlowList');
    if (sectorEl) {
      const sorted = [...state.sectors].sort((a, b) => b.flowB - a.flowB);
      sectorEl.innerHTML = sorted
        .map((s) => {
          const isIn = s.flowB >= 0;
          const widthPct = clamp(Math.round(Math.abs(s.flowB) * 28), 8, 100);
          return `
            <div class="sector-row">
              <div class="sector-top">
                <span>${s.name}</span>
                <span class="${isIn ? 'change-readout pos' : 'change-readout neg'}">
                  ${isIn ? '+' : ''}${s.flowB.toFixed(2)}B (${s.deltaPct >= 0 ? '+' : ''}${s.deltaPct.toFixed(2)}%)
                </span>
              </div>
              <div class="sector-bar-bg">
                <div class="sector-bar-fill" style="width:${widthPct}%; background:${isIn ? '#10b981' : '#f43f5e'};"></div>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  function renderDashboard() {
    const profile = getOrCreateProfile(state.ticker);
    const tf = getTfConfig(state.timeframeId);
    const series = ensureSeries(state.ticker, state.timeframeId);
    const ind = computeIndicators(profile, series, tf);
    const calc = computeQuantAndRisk(profile, ind, tf);

    renderQuickTickers();
    renderMacroBar();
    renderTimeframeBar();
    renderChartAndOscillator(profile, series, ind, calc);
    renderQuantScore(calc);
    renderShortOptionsAndRisk(profile, calc);
    renderSnsAndSupportResistance(profile, series);
    renderFlowMacroAndSectors(profile);
  }

  function selectTicker(rawTicker) {
    const clean = String(rawTicker || '').trim().toUpperCase().replace(/[^A-Z0-9.-]/g, '');
    if (!clean) return;
    state.ticker = clean;
    const input = document.getElementById('tickerInput');
    if (input) input.value = clean;
    ensureSeries(clean, state.timeframeId);
    renderDashboard();
  }

  function bindEvents() {
    const form = document.getElementById('tickerForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('tickerInput');
        selectTicker(input ? input.value : state.ticker);
      });
    }

    const mddBtn = document.getElementById('toggleMddBtn');
    const envBtn = document.getElementById('toggleEnvBtn');
    const srBtn = document.getElementById('toggleSrBtn');

    if (mddBtn) {
      mddBtn.addEventListener('click', () => {
        state.showMdd = !state.showMdd;
        renderDashboard();
      });
    }
    if (envBtn) {
      envBtn.addEventListener('click', () => {
        state.showEnvelope = !state.showEnvelope;
        renderDashboard();
      });
    }
    if (srBtn) {
      srBtn.addEventListener('click', () => {
        state.showSr = !state.showSr;
        renderDashboard();
      });
    }

    window.addEventListener('error', (ev) => {
      const banner = document.getElementById('iosErrorBanner');
      if (banner) {
        banner.textContent = `실행 알림: ${ev.message || '화면 업데이트 중 오류가 발생했습니다.'}`;
        banner.classList.remove('hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      bindEvents();
      ensureSeries(state.ticker, state.timeframeId);
      renderDashboard();
      setInterval(() => {
        try {
          stepStream();
        } catch (err) {
          console.error('Loop step error:', err);
        }
      }, 1500);
    } catch (initErr) {
      console.error('Dashboard init error:', initErr);
    }
  });
})();