import "./styles.css";

/**
 * Temperatura e bulbit të lagësht (Wet-Bulb Temperature, WBT)
 * sipas formulës empirike të Stull (2011).
 *
 * Stull, R. (2011): "Wet-Bulb Temperature from Relative Humidity
 * and Air Temperature." Journal of Applied Meteorology and Climatology.
 *
 * E vlefshme për lagështi relative 5–99% dhe temperaturë ajri
 * rreth −20 °C deri në 50 °C, në presion afër nivelit të detit.
 *
 * @param T  Temperatura e ajrit në °C
 * @param RH Lagështia relative në % (0–100)
 * @returns  Temperatura e bulbit të lagësht në °C
 */
export function wetBulbStull(T: number, RH: number): number {
  return (
    T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035
  );
}

/** Një interval rreziku i bazuar te WBT-ja rezultuese. */
interface RiskBand {
  /** Kufiri i poshtëm i WBT-së (°C), përfshirës. */
  min: number;
  /** Emërtimi i shkurtër për distinktivin (badge). */
  label: string;
  /** Çelësi i ngjyrës (përdoret edhe në CSS). */
  tone: "safe" | "ok" | "caution" | "high" | "extreme" | "lethal";
  /** Përshkrim i shkurtër i ndikimit te njerëzit. */
  desc: string;
}

/**
 * Intervalet janë renditur nga më i larti te më i ulëti, që përputhja
 * të bëhet me të parin që plotësohet.
 */
const RISK_BANDS: RiskBand[] = [
  {
    min: 35,
    label: "Kufiri i mbijetesës",
    tone: "lethal",
    desc: "Mbi 35 °C WBT trupi i njeriut nuk arrin dot të ftohet me djersë. Edhe një person i shëndetshëm, në hije e në qetësi, nuk mbijeton dot për shumë orë. Kushte fatale.",
  },
  {
    min: 31,
    label: "Rrezik ekstrem",
    tone: "extreme",
    desc: "Goditje nga nxehtësia e mundshme edhe pa aktivitet fizik. Të rrezikuar veçanërisht të moshuarit, fëmijët dhe të sëmurët. Kërkohet ftohje urgjente dhe hidratim.",
  },
  {
    min: 28,
    label: "Rrezik i lartë",
    tone: "high",
    desc: "Stres i fortë nga nxehtësia. Aktiviteti fizik bëhet i rrezikshëm; ndaloni punën në natyrë, kërkoni hije, ujë dhe ftohje aktive.",
  },
  {
    min: 23,
    label: "Kujdes",
    tone: "caution",
    desc: "Mundësi për stres nga nxehtësia gjatë përpjekjeve fizike. Bëni pushime të shpeshta, pini ujë dhe shmangni mesditën e nxehtë.",
  },
  {
    min: 18,
    label: "E pranueshme",
    tone: "ok",
    desc: "Kushte përgjithësisht të rehatshme. Kujdes vetëm gjatë aktivitetit intensiv ose të zgjatur në diell.",
  },
  {
    min: -100,
    label: "Komode",
    tone: "safe",
    desc: "Kushte komode dhe të sigurta. Pa rrezik nga nxehtësia — performancë e mirë fizike dhe mendore.",
  },
];

function classify(wbt: number): RiskBand {
  return RISK_BANDS.find((b) => wbt >= b.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/** Tekste shpjeguese për pjesën edukative të faqes. */
const RANGE_INFO = [
  { range: "< 18 °C", tone: "safe", title: "Komode", text: "Kushte ideale. Trupi ftohet lehtë, performanca kognitive dhe fizike janë në kulm." },
  { range: "18–23 °C", tone: "ok", title: "E pranueshme", text: "Pa rrezik për shumicën; kujdes vetëm gjatë sforcimeve të gjata." },
  { range: "23–28 °C", tone: "caution", title: "Kujdes", text: "Stres i mundshëm nga nxehtësia gjatë aktivitetit. Hidratim dhe pushime." },
  { range: "28–31 °C", tone: "high", title: "Rrezik i lartë", text: "Aktiviteti fizik i rrezikshëm. Ndaloni punën në natyrë." },
  { range: "31–35 °C", tone: "extreme", title: "Rrezik ekstrem", text: "Goditje nxehtësie edhe në qetësi. Grupet e cenueshme në rrezik fatal." },
  { range: "≥ 35 °C", tone: "lethal", title: "Kufiri i mbijetesës", text: "Kufiri teorik i mbijetesës njerëzore. Fatale brenda pak orësh." },
];

const fmt = (n: number) => n.toLocaleString("sq-AL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = /* html */ `
  <main class="page">
    <header class="hero">
      <div class="hero__icon">🌡️</div>
      <h1>Llogaritësi i Temperaturës së Bulbit të Lagësht</h1>
      <p class="hero__sub">
        Temperatura e bulbit të lagësht (<strong>WBT</strong>) tregon sa mund të ftohet trupi
        nëpërmjet djersës. Kur nxehtësia <em>dhe</em> lagështia janë të larta,
        djersa nuk avullon dot — dhe kjo bëhet vdekjeprurëse.
      </p>
    </header>

    <section class="card calc" aria-label="Llogaritësi">
      <div class="controls">
        <div class="field">
          <label for="temp">Temperatura e ajrit</label>
          <div class="input-row">
            <input id="temp" type="range" min="-10" max="55" step="0.5" value="43" />
            <output id="temp-out" class="value">43 °C</output>
          </div>
          <input id="temp-num" class="num" type="number" min="-20" max="55" step="0.5" value="43" inputmode="decimal" />
        </div>

        <div class="field">
          <label for="rh">Lagështia relative</label>
          <div class="input-row">
            <input id="rh" type="range" min="5" max="100" step="1" value="55" />
            <output id="rh-out" class="value">55 %</output>
          </div>
          <input id="rh-num" class="num" type="number" min="5" max="100" step="1" value="55" inputmode="numeric" />
        </div>
      </div>

      <div id="result" class="result">
        <div class="result__label">Temperatura e bulbit të lagësht</div>
        <div id="wbt" class="result__value">—</div>
        <div id="badge" class="badge">—</div>
        <p id="result-desc" class="result__desc"></p>
      </div>
    </section>

    <section class="card info">
      <h2>Çfarë është WBT-ja?</h2>
      <p>
        Termometri i zakonshëm mat temperaturën e <strong>bulbit të thatë</strong>.
        Nëse e mbështjellim bulbin e termometrit me një leckë të lagësht, avullimi e ftoh —
        dhe leximi quhet temperatura e <strong>bulbit të lagësht</strong>. Sa më e lartë lagështia,
        aq më pak avullon uji, aq më afër janë dy temperaturat. Po ky avullim ftoh edhe trupin tonë;
        ndaj WBT-ja është treguesi më i mirë i rrezikut real nga nxehtësia.
      </p>
      <h3>Intervalet e rrezikut</h3>
      <ul id="ranges" class="ranges"></ul>
      <p class="note">
        Llogaritja përdor formulën empirike të <strong>Stull (2011)</strong>, e vlefshme për lagështi
        5–99% dhe temperaturë rreth −20 °C deri 50 °C, në presion afër nivelit të detit.
        Vlerat janë të përafërta dhe nuk zëvendësojnë këshillat zyrtare të mbrojtjes shëndetësore.
      </p>
    </section>

    <footer class="foot">
      <p class="foot__ref">
        Referenca shkencore: Stull, R. (2011).
        <em>“Wet-Bulb Temperature from Relative Humidity and Air Temperature.”</em>
        <span>Journal of Applied Meteorology and Climatology</span>, 50(11), 2267–2269.
        <a href="https://doi.org/10.1175/JAMC-D-11-0143.1" target="_blank" rel="noopener noreferrer"
          >DOI: 10.1175/JAMC-D-11-0143.1</a>
      </p>
      <p class="foot__credit">
        Autor: <strong>Valonis “TheVaLo” Ramadani</strong> · 26 qershor 2026
      </p>
    </footer>
  </main>
`;

// Mbush listën e intervaleve
const rangesEl = document.querySelector<HTMLUListElement>("#ranges")!;
rangesEl.innerHTML = RANGE_INFO.map(
  (r) => /* html */ `
    <li class="range range--${r.tone}">
      <span class="range__chip">${r.range}</span>
      <div>
        <strong>${r.title}</strong>
        <span class="range__text">${r.text}</span>
      </div>
    </li>`
).join("");

const tempRange = document.querySelector<HTMLInputElement>("#temp")!;
const tempNum = document.querySelector<HTMLInputElement>("#temp-num")!;
const tempOut = document.querySelector<HTMLOutputElement>("#temp-out")!;
const rhRange = document.querySelector<HTMLInputElement>("#rh")!;
const rhNum = document.querySelector<HTMLInputElement>("#rh-num")!;
const rhOut = document.querySelector<HTMLOutputElement>("#rh-out")!;
const wbtEl = document.querySelector<HTMLDivElement>("#wbt")!;
const badgeEl = document.querySelector<HTMLDivElement>("#badge")!;
const descEl = document.querySelector<HTMLParagraphElement>("#result-desc")!;
const resultEl = document.querySelector<HTMLDivElement>("#result")!;

function update() {
  const T = Number(tempNum.value);
  const RH = Number(rhNum.value);

  tempOut.textContent = `${fmt(T)} °C`;
  rhOut.textContent = `${Math.round(RH)} %`;

  if (!Number.isFinite(T) || !Number.isFinite(RH) || RH < 1) {
    wbtEl.textContent = "—";
    badgeEl.textContent = "—";
    badgeEl.className = "badge";
    descEl.textContent = "";
    return;
  }

  const wbt = wetBulbStull(T, RH);
  const band = classify(wbt);

  wbtEl.textContent = `${fmt(wbt)} °C`;
  badgeEl.textContent = band.label;
  badgeEl.className = `badge badge--${band.tone}`;
  descEl.textContent = band.desc;
  resultEl.dataset.tone = band.tone;
}

// Mban rrëshqitësin dhe fushën numerike të sinkronizuara
function bindPair(range: HTMLInputElement, num: HTMLInputElement) {
  range.addEventListener("input", () => {
    num.value = range.value;
    update();
  });
  num.addEventListener("input", () => {
    const v = Number(num.value);
    if (Number.isFinite(v)) range.value = String(v);
    update();
  });
}

bindPair(tempRange, tempNum);
bindPair(rhRange, rhNum);

update();
