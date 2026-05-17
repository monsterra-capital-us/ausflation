// Ausflation — main app composition
// Header · Hero · Trend chart · Categories · Sources · Methodology · Footer

const fmtRate = (v, parens = true) => {
  if (v < 0 && parens) return `(${Math.abs(v).toFixed(2)}%)`;
  return `${v >= 0 ? "" : "−"}${Math.abs(v).toFixed(2)}%`;
};
const fmtDelta = (v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}pp`;
const fmtInt = (v) => v.toLocaleString("en-AU");

// ─────────────────── Sparkline (category cards) ───────────────────
function Sparkline({ series, accent = "var(--capital-500)" }) {
  const W = 120,H = 36,P = 2;
  const min = Math.min(...series),max = Math.max(...series);
  const span = Math.max(0.001, max - min);
  const pts = series.map((v, i) => {
    const x = P + i / (series.length - 1) * (W - 2 * P);
    const y = P + (1 - (v - min) / span) * (H - 2 * P);
    return [x, y];
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = d + ` L ${pts[pts.length - 1][0].toFixed(1)} ${H - P} L ${pts[0][0].toFixed(1)} ${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark" preserveAspectRatio="none">
      <path d={area} fill={accent} opacity="0.10" />
      <path d={d} fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={accent} />
    </svg>);

}

// ─────────────────── Header / Nav ───────────────────
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      onClick={onToggle}
      title={dark ? "Light mode" : "Dark mode"}>
      
      {dark ?
      // Sun glyph — shown in dark mode (click to go light)
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M3.3 12.7l1.4-1.4M11.3 4.7l1.4-1.4" />
        </svg> :

      // Moon glyph — shown in light mode (click to go dark)
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.2 9.4A5.5 5.5 0 0 1 6.6 2.8a.5.5 0 0 0-.66-.58 6.5 6.5 0 1 0 8 8 .5.5 0 0 0-.58-.66 5.5 5.5 0 0 1-.16-.16Z" />
        </svg>
      }
    </button>);

}

function Header({ dark, onToggleDark }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="#top">
          <span className="wm">Ausflation</span>
          <span className="brand-sep">·</span>
          <span className="brand-by" style={{ fontFamily: "system-ui" }}>a research benchmark by <b style={{ fontFamily: "system-ui" }}>MonsterraCapital</b></span>
        </a>
        <nav className="nav-links">
          <a href="#index">Index</a>
          <a href="#categories">Categories</a>
          <a href="#sources">Sources</a>
          <a href="#method">Methodology</a>
        </nav>
        <div className="nav-actions">
          <span className="live-pill" style={{ fontFamily: "system-ui" }}><i className="pulse" /> LIVE</span>
          <ThemeToggle dark={dark} onToggle={onToggleDark} />
          <a className="btn-ghost" href="#download">Download CSV</a>
        </div>
      </div>
    </header>);

}

// ─────────────────── Hero ───────────────────
function Hero() {
  const d = window.AUSFLATION_HEADLINE;
  const dayDelta = d.rate - d.rateYesterday;
  const weekDelta = d.rate - d.rate7dAgo;
  const vsAbs = d.rate - d.abs.rate;

  return (
    <section id="index" className="hero">
      <div className="hero-row">
        <div className="hero-left">
          <p className="eyebrow">Ausflation index</p>
          <h1 className="hero-title">
            Australian inflation,<br />marked-to-market <em>daily</em>.
          </h1>
          <p className="hero-kicker">
            An independent, high-frequency reading of Australian consumer prices.
            Tracking <span className="mono">{fmtInt(d.pricesTracked)}</span> live prices across{" "}
            <span className="mono">{d.sourcesActive}</span> Australian sources, mapped to the ABS basket.
          </p>
        </div>

        <aside className="hero-meta">
          <div className="meta-row"><span className="k">As of</span><span className="v">{d.asOf}</span></div>
          <div className="meta-row"><span className="k">Last refresh</span><span className="v mono">{d.lastUpdated}</span></div>
          <div className="meta-row"><span className="k">Index level</span><span className="v mono">{d.indexLevel.toFixed(2)}</span></div>
          <div className="meta-row"><span className="k">Base</span><span className="v mono">May 2024 = 100</span></div>
        </aside>
      </div>

      <div className="hero-stage">
        <div className="big-rate">
          <p className="lbl">Annual headline inflation · year-over-year</p>
          <div className="rate-row">
            <span className="rate-num">{d.rate.toFixed(2)}</span>
            <span className="rate-pct">%</span>
            <span className="live-tag"><i className="pulse" />UPDATED 09:14 AEST</span>
          </div>
          <div className="rate-deltas">
            <div className="delta-pair">
              <span className="dk">24-hour</span>
              <span className={`dv ${dayDelta >= 0 ? "up" : "down"}`}>{fmtDelta(dayDelta)}</span>
            </div>
            <div className="delta-pair">
              <span className="dk">7-day</span>
              <span className={`dv ${weekDelta >= 0 ? "up" : "down"}`}>{fmtDelta(weekDelta)}</span>
            </div>
            <div className="delta-pair">
              <span className="dk">vs ABS {d.abs.period}</span>
              <span className={`dv ${vsAbs >= 0 ? "up" : "down"}`}>{fmtDelta(vsAbs)}</span>
            </div>
          </div>
        </div>

        <div className="benchmark-stack">
          <div className="bench-card">
            <p className="bench-eyebrow">ABS CPI · official</p>
            <p className="bench-rate">{d.abs.rate.toFixed(2)}%</p>
            <p className="bench-foot"><span className="mono">{d.abs.period}</span> · released <span className="mono">{d.abs.releaseDate}</span> · next <span className="mono">{d.abs.nextRelease}</span></p>
          </div>
          <div className="bench-card">
            <p className="bench-eyebrow">RBA target band</p>
            <p className="bench-rate">{d.rba.target[0].toFixed(1)}–{d.rba.target[1].toFixed(1)}%</p>
            <p className="bench-foot">Cash rate <span className="mono">{d.rba.cashRate.toFixed(2)}%</span> · last move{" "}<span className="mono">6 May 2026 (+25 bp)</span></p>
          </div>
        </div>
      </div>
    </section>);

}

// ─────────────────── Chart section ───────────────────
function ChartSection({ tweaks, setTweak }) {
  const frames = ["1M", "3M", "6M", "1Y", "5Y", "All"];
  return (
    <section className="chart-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Trend</p>
          <h2>Ausflation index vs ABS CPI · 36 months</h2>
        </div>
        <div className="chart-controls">
          <label className="check">
            <input type="checkbox" checked={tweaks.showAbs} onChange={(e) => setTweak("showAbs", e.target.checked)} />
            <span>Overlay ABS CPI</span>
          </label>
          <div className="seg">
            {frames.map((f) =>
            <button key={f} className={"seg-b " + (tweaks.timeframe === f ? "on" : "")} onClick={() => setTweak("timeframe", f)}>{f}</button>
            )}
          </div>
        </div>
      </div>
      <TrendChart timeframe={tweaks.timeframe} showAbs={tweaks.showAbs} dark={tweaks.dark} />
    </section>);

}

// ─────────────────── Categories ───────────────────
function Categories({ tweaks }) {
  const cats = window.AUSFLATION_CATEGORIES;
  const [sortBy, setSortBy] = React.useState("weight");
  const sorted = React.useMemo(() => {
    const c = [...cats];
    if (sortBy === "weight") c.sort((a, b) => b.weight - a.weight);
    if (sortBy === "rate") c.sort((a, b) => b.rate - a.rate);
    if (sortBy === "delta") c.sort((a, b) => Math.abs(b.rate - b.abs) - Math.abs(a.rate - a.abs));
    return c;
  }, [sortBy, cats]);

  return (
    <section id="categories" className="cats-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Components</p>
          <h2>All 11 ABS expenditure groups</h2>
          <p className="section-sub">Weighted to the ABS 17-series basket. Each component re-anchored to its own live feeds. Hover any card.</p>
        </div>
        <div className="seg">
          <button className={"seg-b " + (sortBy === "weight" ? "on" : "")} onClick={() => setSortBy("weight")}>By weight</button>
          <button className={"seg-b " + (sortBy === "rate" ? "on" : "")} onClick={() => setSortBy("rate")}>By rate</button>
          <button className={"seg-b " + (sortBy === "delta" ? "on" : "")} onClick={() => setSortBy("delta")}>By Δ vs ABS</button>
        </div>
      </div>

      <div className="cat-grid">
        {sorted.map((c) => {
          const delta = c.rate - c.abs;
          const negative = c.rate < 0;
          return (
            <article key={c.id} className="cat-card">
              <header className="cat-head">
                <p className="cat-eyebrow">Weight <span className="mono">{c.weight.toFixed(1)}%</span></p>
                <h3 className="cat-name">{c.name}</h3>
              </header>

              <div className="cat-rate-row">
                <div className="cat-rate">
                  <span className={"num " + (negative ? "neg" : "")}>{fmtRate(c.rate)}</span>
                  <span className="cat-rate-lbl">YoY</span>
                </div>
                {tweaks.showSparklines && <Sparkline series={c.series} />}
              </div>

              <dl className="cat-stats">
                <div>
                  <dt>ABS</dt>
                  <dd className="mono">{fmtRate(c.abs)}</dd>
                </div>
                <div>
                  <dt>Δ vs ABS</dt>
                  <dd className={"mono " + (delta >= 0 ? "up" : "down")}>{fmtDelta(delta)}</dd>
                </div>
                <div>
                  <dt>30-day</dt>
                  <dd className={"mono " + (c.delta30d >= 0 ? "up" : "down")}>{fmtDelta(c.delta30d)}</dd>
                </div>
              </dl>

              <footer className="cat-foot">
                <span className="ft-k">Top contributor</span>
                <span className="ft-v">{c.top.item} <span className={"mono " + (c.top.change >= 0 ? "up" : "down")}>{c.top.change >= 0 ? "+" : ""}{c.top.change.toFixed(1)}%</span></span>
              </footer>

              <div className="cat-sources">
                {c.sources.map((s) => <span key={s} className="src-chip">{s}</span>)}
              </div>
            </article>);

        })}
      </div>
    </section>);

}

// ─────────────────── Data sources ───────────────────
function Sources() {
  const srcs = window.AUSFLATION_SOURCES;
  return (
    <section id="sources" className="src-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Inputs</p>
          <h2>Live Australian data sources</h2>
          <p className="section-sub">12 feeds, refreshed in real time. Where a price changes, the basket sees it within minutes.</p>
        </div>
        <a className="link-arrow" href="#method">Read the methodology →</a>
      </div>

      <table className="src-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Coverage</th>
            <th>Region</th>
            <th className="num">Items</th>
            <th className="num">Last sync</th>
            <th className="num">Lag</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {srcs.map((s) =>
          <tr key={s.id}>
              <td><span className="src-name">{s.name}</span></td>
              <td className="muted">{s.kind}</td>
              <td className="muted">{s.region}</td>
              <td className="num">{fmtInt(s.items)}</td>
              <td className="num">{s.sync}</td>
              <td className="num">{s.lag}</td>
              <td>
                <span className={"status status-" + s.status}>
                  <i className={"dot " + (s.status === "live" ? "pulse" : "")} />
                  {s.status === "live" ? "Streaming" : "OK"}
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>);

}

// ─────────────────── Methodology ───────────────────
function Methodology() {
  const items = window.AUSFLATION_METHOD;
  return (
    <section id="method" className="method-section">
      <div className="section-head"><div>
        <p className="eyebrow">Methodology</p>
        <h2>How Ausflation is built.</h2>
      </div></div>
      <div className="method-grid">
        {items.map((m, i) =>
        <article key={i} className="method-card">
            <p className="m-eyebrow">{m.eyebrow}</p>
            <h3>{m.head}</h3>
            <p>{m.body}</p>
          </article>
        )}
      </div>

      <div className="callout">
        <h4>What would prove us wrong.</h4>
        <p>
          If Ausflation diverges from ABS CPI by more than <span className="mono">±50bp</span> for two consecutive quarters, we publish a reconciliation memo within ten business days, identify the components driving the gap, and reweight or replace the offending feeds. This convention is non-negotiable.
        </p>
      </div>
    </section>);

}

// ─────────────────── Footer ───────────────────
function Footer() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-brand">
          <span className="foot-wm">MonsterraCapital</span>
          <span className="foot-sub">Ausflation — a research benchmark.</span>
        </div>
        <dl className="foot-meta">
          <div><dt>Generated</dt><dd className="mono">17 May 2026 · 09:14 AEST</dd></div>
          <div><dt>Licence</dt><dd className="mono">CC BY-NC 4.0</dd></div>
          <div><dt>Status</dt><dd className="mono">Research benchmark · not endorsed by ABS or RBA</dd></div>
        </dl>
      </div>
      <div className="foot-fine">
        Ausflation is a private research benchmark produced by Monsterra Capital. It is not financial advice and is not an official statistic. The ABS Consumer Price Index remains the official measure of inflation in Australia.
      </div>
    </footer>);

}

// ─────────────────── App ───────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "timeframe": "1Y",
  "showAbs": true,
  "showSparklines": true,
  "dark": false,
  "compact": false
} /*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.dataset.theme = t.dark ? "dark" : "light";
    document.documentElement.dataset.density = t.compact ? "compact" : "regular";
  }, [t.dark, t.compact]);

  return (
    <div className="ausflation" data-screen-label="Ausflation dashboard">
      <Header dark={t.dark} onToggleDark={() => setTweak("dark", !t.dark)} />
      <main className="main">
        <Hero />
        <ChartSection tweaks={t} setTweak={setTweak} />
        <Categories tweaks={t} />
        <Sources />
        <Methodology />
      </main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Chart" />
        <TweakRadio label="Default timeframe" value={t.timeframe}
        options={["1M", "3M", "6M", "1Y", "5Y", "All"]}
        onChange={(v) => setTweak("timeframe", v)} />
        <TweakToggle label="Overlay ABS CPI" value={t.showAbs} onChange={(v) => setTweak("showAbs", v)} />

        <TweakSection label="Components" />
        <TweakToggle label="Show sparklines" value={t.showSparklines} onChange={(v) => setTweak("showSparklines", v)} />
        <TweakToggle label="Compact density" value={t.compact} onChange={(v) => setTweak("compact", v)} />

        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
      </TweaksPanel>
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);