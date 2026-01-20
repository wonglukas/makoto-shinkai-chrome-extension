const SETTINGS_KEY = "wallpaperSettings";
const LAST_FOLDER_KEY = "lastFolder";

function dimLevelToAlpha(level) {
  const l = Math.max(0, Math.min(10, level));
  return l * 0.05;
}

function blurLevelToPx(level) {
  const maxPx = 20;
  const l = Math.max(0, Math.min(10, level));
  return Math.round((l / 10) * maxPx);
}

function blurLevelToScale(level) {
  const l = Math.max(0, Math.min(10, level));
  return 1 + (l / 10) * 0.12;
}

function applySettings({ dimLevel, blurLevel }) {
  document.documentElement.style.setProperty("--dim-alpha", String(dimLevelToAlpha(dimLevel)));
  document.documentElement.style.setProperty("--bg-blur", `${blurLevelToPx(blurLevel)}px`);
  document.documentElement.style.setProperty("--bg-scale", String(blurLevelToScale(blurLevel)));
}

async function loadSettings() {
  const defaults = { dimLevel: 4, blurLevel: 0 };
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  const saved = data[SETTINGS_KEY] || {};
  return { ...defaults, ...saved };
}

function saveSettings(settings) {
  return chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

function initSettingsUI(settings) {
  const btn = document.getElementById("settingsBtn");
  const panel = document.getElementById("settingsPanel");
  const close = document.getElementById("settingsClose");
  const dimSlider = document.getElementById("dimSlider");
  const blurSlider = document.getElementById("blurSlider");
  const dimLabel = document.getElementById("dimLabel");
  const blurLabel = document.getElementById("blurLabel");

  if (!btn || !panel || !close || !dimSlider || !blurSlider || !dimLabel || !blurLabel) return;

  btn.addEventListener("click", () => (panel.hidden = !panel.hidden));
  close.addEventListener("click", () => (panel.hidden = true));

  dimSlider.value = String(settings.dimLevel);
  blurSlider.value = String(settings.blurLevel);
  dimLabel.textContent = String(settings.dimLevel);
  blurLabel.textContent = String(settings.blurLevel);

  let t;
  const onChange = () => {
    const next = {
      dimLevel: Number(dimSlider.value),
      blurLevel: Number(blurSlider.value),
    };

    dimLabel.textContent = String(next.dimLevel);
    blurLabel.textContent = String(next.blurLevel);

    applySettings(next);

    clearTimeout(t);
    t = setTimeout(() => saveSettings(next), 150);
  };

  dimSlider.addEventListener("input", onChange);
  blurSlider.addEventListener("input", onChange);
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function startClock() {
  const timeEl = document.getElementById("time");
  const ampmEl = document.getElementById("ampm");
  const dateEl = document.getElementById("date");
  if (!timeEl || !ampmEl || !dateEl) return;

  let lastText = "";

  const render = () => {
    const d = new Date();

    let h = d.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;

    const hh = String(h).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
    const month = d.toLocaleDateString(undefined, { month: "long" });
    const day = ordinal(d.getDate());
    const year = d.getFullYear();

    const nextText = `${hh}:${mm}|${ampm}|${weekday}, ${month} ${day}, ${year}`;
    if (nextText === lastText) return;
    lastText = nextText;

    timeEl.textContent = `${hh}:${mm}`;
    ampmEl.textContent = ampm;
    dateEl.textContent = `${weekday}, ${month} ${day}, ${year}`;
  };

  render();
  setInterval(render, 60_000);
}

async function loadImagesIndex() {
  const res = await fetch(chrome.runtime.getURL("images.json"));
  return res.ok ? res.json() : {};
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomDifferent(arr, notThis) {
  if (arr.length <= 1) return arr[0];
  let x = pickRandom(arr);
  while (x === notThis) x = pickRandom(arr);
  return x;
}

function pickFolderAndImage(index, lastFolder) {
  const folders = Object.keys(index).filter(f => (index[f] || []).length > 0);
  if (folders.length === 0) return null;

  const folder = pickRandomDifferent(folders, lastFolder);
  const images = index[folder];
  const image = pickRandom(images);

  return { folder, image };
}

function setWallpaper(relativePath) {
  const bg = document.getElementById("bg");
  if (!bg || !relativePath) return;
  bg.style.backgroundImage = `url("${chrome.runtime.getURL(relativePath)}")`;
}

(async () => {
  startClock();

  const settings = await loadSettings();
  applySettings(settings);
  initSettingsUI(settings);

  const index = await loadImagesIndex();

  const { [LAST_FOLDER_KEY]: lastFolder } = await chrome.storage.local.get(LAST_FOLDER_KEY);

  const picked = pickFolderAndImage(index, lastFolder);
  if (!picked) return;

  setWallpaper(picked.image);

  await chrome.storage.local.set({ [LAST_FOLDER_KEY]: picked.folder });
})();