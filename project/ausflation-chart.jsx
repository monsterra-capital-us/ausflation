// Ausflation — trend chart
// Two lines (Ausflation + ABS quarterly) over an RBA target band.
// Hover crosshair reveals values + date.

function TrendChart({ timeframe, showAbs, dark }) {
  const { labels, ausflation, abs, cashRate } = window.AUSFLATION_SERIES;
  const [hover, setHover] = React.useState(null);

  // Slice by timeframe (data is monthly, 36 points ending May 26)
  const idxRange = React.useMemo(() => {
    const total = labels.length;
    const m = { "1M": 2, "3M": 4, "6M": 7, "1Y": 13, "5Y": total, "All": total }[timeframe] ?? total;
    return [Math.max(0, total - m), total];
  }, [timeframe, labels.length]);

  const view = React.useMemo(() => {
    const [a, b] = idxRange;
    return {
      labels: labels.slice(a, b),
      ausflation: ausflation.slice(a, b),
      abs: abs.slice(a, b),
      cashRate: cashRate.slice(a, b),
    };
  }, [idxRange, labels, ausflation, abs, cashRate]);

  // Layout
  const W = 1180, H = 360;
  const PAD = { t: 24, r: 56, b: 36, l: 44 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  // Y domain
  const all = [...view.ausflation, ...(showAbs ? view.abs : []), ...view.cashRate, 2, 3];
  let yMin = Math.min(...all, 0);
  let yMax = Math.max(...all);
  yMin = Math.floor(yMin - 0.5);
  yMax = Math.ceil(yMax + 0.5);
  const yScale = (v) => PAD.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const xScale = (i) => PAD.l + (view.labels.length === 1 ? innerW / 2 : (i / (view.labels.length - 1)) * innerW);

  const path = (arr) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(2)} ${yScale(v).toFixed(2)}`).join(" ");

  // Stepped line path (for cash rate — policy changes on meeting dates)
  const stepPath = (arr) => {
    let d = "";
    arr.forEach((v, i) => {
      const x = xScale(i).toFixed(2);
      const y = yScale(v).toFixed(2);
      if (i === 0) { d += `M ${x} ${y}`; return; }
      const prevY = yScale(arr[i - 1]).toFixed(2);
      d += ` L ${x} ${prevY} L ${x} ${y}`;
    });
    return d;
  };

  const areaPath = (() => {
    const top = view.ausflation.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(2)} ${yScale(v).toFixed(2)}`).join(" ");
    const last = view.ausflation.length - 1;
    const bot = `L ${xScale(last).toFixed(2)} ${yScale(yMin).toFixed(2)} L ${xScale(0).toFixed(2)} ${yScale(yMin).toFixed(2)} Z`;
    return top + " " + bot;
  })();

  // Y ticks
  const ticks = [];
  for (let v = yMin; v <= yMax; v += (yMax - yMin) <= 4 ? 0.5 : 1) ticks.push(v);

  // X ticks — show ~6 labels
  const xTickIdx = (() => {
    const n = view.labels.length;
    const step = Math.max(1, Math.floor(n / 6));
    const out = [];
    for (let i = 0; i < n; i += step) out.push(i);
    if (out[out.length - 1] !== n - 1) out.push(n - 1);
    return out;
  })();

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (px < PAD.l || px > PAD.l + innerW) return setHover(null);
    const t = (px - PAD.l) / innerW;
    const i = Math.round(t * (view.labels.length - 1));
    setHover(i);
  };

  // RBA target band (2-3%)
  const bandTop = yScale(3);
  const bandBottom = yScale(2);

  const fmtDate = (d) => d.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
  const fmtPct = (v) => `${v >= 0 ? "" : "("}${Math.abs(v).toFixed(2)}${v < 0 ? ")" : ""}%`;

  // Theme
  const c = {
    grid: dark ? "rgba(255,255,255,0.08)" : "var(--slate-200)",
    axis: dark ? "rgba(255,255,255,0.55)" : "var(--slate-600)",
    aus: "var(--capital-500)",
    abs: dark ? "rgba(255,255,255,0.55)" : "var(--slate-600)",
    cash: dark ? "#E89B5A" : "#C46A1F",  // amber — distinct from blue
    band: dark ? "rgba(92,149,255,0.10)" : "rgba(0,89,255,0.06)",
    bandLine: dark ? "rgba(92,149,255,0.30)" : "rgba(0,89,255,0.25)",
    area: dark ? "rgba(92,149,255,0.18)" : "rgba(0,89,255,0.06)",
    text: dark ? "var(--bone-50)" : "var(--capital-950)",
  };

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" onMouseMove={onMove} onMouseLeave={() => setHover(null)} preserveAspectRatio="none">
        {/* RBA band */}
        <rect x={PAD.l} y={bandTop} width={innerW} height={bandBottom - bandTop} fill={c.band} />
        <line x1={PAD.l} x2={PAD.l + innerW} y1={bandTop} y2={bandTop} stroke={c.bandLine} strokeDasharray="2 4" />
        <line x1={PAD.l} x2={PAD.l + innerW} y1={bandBottom} y2={bandBottom} stroke={c.bandLine} strokeDasharray="2 4" />
        <text x={PAD.l + innerW - 6} y={bandTop - 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill={c.bandLine} letterSpacing="0.18em">RBA TARGET 2–3%</text>

        {/* Grid */}
        {ticks.map((v, i) => (
          <g key={"t" + i}>
            <line x1={PAD.l} x2={PAD.l + innerW} y1={yScale(v)} y2={yScale(v)} stroke={c.grid} strokeWidth={v === 0 ? 1.5 : 1} />
            <text x={PAD.l + innerW + 8} y={yScale(v) + 4} fontFamily="var(--font-mono)" fontSize="10" fill={c.axis} letterSpacing="0.08em">{v.toFixed(1)}%</text>
          </g>
        ))}

        {/* Area under Ausflation */}
        <path d={areaPath} fill={c.area} />

        {/* RBA cash rate — stepped line */}
        <path
          d={stepPath(view.cashRate)}
          fill="none"
          stroke={c.cash}
          strokeWidth="1.75"
          strokeLinecap="square"
          strokeLinejoin="miter"
          opacity="0.9"
        />

        {/* ABS line — stepped, dashed */}
        {showAbs && (
          <path
            d={path(view.abs)}
            fill="none"
            stroke={c.abs}
            strokeWidth="1.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Ausflation line */}
        <path d={path(view.ausflation)} fill="none" stroke={c.aus} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />

        {/* X axis labels */}
        {xTickIdx.map((i, idx) => {
          const anchor = idx === 0 ? "start" : idx === xTickIdx.length - 1 ? "end" : "middle";
          return (
            <text key={"x" + i} x={xScale(i)} y={H - 12} fontFamily="var(--font-mono)" fontSize="10" fill={c.axis} textAnchor={anchor} letterSpacing="0.08em">{fmtDate(view.labels[i]).toUpperCase()}</text>
          );
        })}

        {/* End cap — Ausflation */}
        {(() => {
          const i = view.ausflation.length - 1;
          return (
            <g>
              <circle cx={xScale(i)} cy={yScale(view.ausflation[i])} r="4" fill={c.aus} />
              <circle cx={xScale(i)} cy={yScale(view.ausflation[i])} r="8" fill={c.aus} opacity="0.18" />
            </g>
          );
        })()}

        {/* Hover crosshair */}
        {hover !== null && (() => {
          const x = xScale(hover);
          const yA = yScale(view.ausflation[hover]);
          const yB = yScale(view.abs[hover]);
          const yC = yScale(view.cashRate[hover]);
          return (
            <g>
              <line x1={x} x2={x} y1={PAD.t} y2={PAD.t + innerH} stroke={c.text} strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
              <circle cx={x} cy={yA} r="4" fill={c.aus} stroke="white" strokeWidth="1.5" />
              {showAbs && <circle cx={x} cy={yB} r="3.5" fill={dark ? "var(--bone-50)" : "white"} stroke={c.abs} strokeWidth="1.5" />}
              <rect x={x - 4} y={yC - 4} width="8" height="8" fill={c.cash} stroke={dark ? "var(--capital-950)" : "white"} strokeWidth="1.5" />
            </g>
          );
        })()}
      </svg>

      {/* Hover readout */}
      <div className="chart-readout">
        {hover !== null ? (
          <React.Fragment>
            <span className="rk">{fmtDate(view.labels[hover]).toUpperCase()}</span>
            <span className="rv"><i className="dot aus" /> Ausflation <b>{fmtPct(view.ausflation[hover])}</b></span>
            {showAbs && <span className="rv"><i className="dot abs" /> ABS CPI <b>{fmtPct(view.abs[hover])}</b></span>}
            <span className="rv"><i className="dot cash" /> RBA cash <b>{view.cashRate[hover].toFixed(2)}%</b></span>
            <span className="rv delta">Δ <b>{fmtPct(view.ausflation[hover] - view.abs[hover])}</b></span>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <span className="rk">HOVER FOR DETAIL</span>
            <span className="rv"><i className="dot aus" /> Ausflation</span>
            {showAbs && <span className="rv"><i className="dot abs" /> ABS CPI (monthly)</span>}
            <span className="rv"><i className="dot cash" /> RBA cash rate</span>
            <span className="rv band-key"><i className="bandk" /> RBA target band</span>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

window.TrendChart = TrendChart;
