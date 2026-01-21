// settings.js

const SETTINGS_KEY = "wallpaperSettings";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const dimLevelToAlpha = (level) => clamp(level, 0, 10) * 0.05;

const blurLevelToPx = (level) => {
  const maxPx = 20;
  return Math.round((clamp(level, 0, 10) / 10) * maxPx);
};

const blurLevelToScale = (level) => 1 + (clamp(level, 0, 10) / 10) * 0.12;

export function applySettings({ dimLevel, blurLevel }) {
  const root = document.documentElement.style;
  root.setProperty("--dim-alpha", String(dimLevelToAlpha(dimLevel)));
  root.setProperty("--bg-blur", `${blurLevelToPx(blurLevel)}px`);
  root.setProperty("--bg-scale", String(blurLevelToScale(blurLevel)));
}

export async function loadSettings() {
  const defaults = { dimLevel: 4, blurLevel: 0, selectedFolders: null }; // null => all
  const { [SETTINGS_KEY]: saved = {} } = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...defaults, ...saved };
}

export function saveSettings(settings) {
  return chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export function initSettingsUI(settings) {
  const btn = document.getElementById("settingsBtn");
  const panel = document.getElementById("settingsPanel");
  const close = document.getElementById("settingsClose");

  const dimSlider = document.getElementById("dimSlider");
  const blurSlider = document.getElementById("blurSlider");
  const dimLabel = document.getElementById("dimLabel");
  const blurLabel = document.getElementById("blurLabel");

  if (!btn || !panel || !close || !dimSlider || !blurSlider || !dimLabel || !blurLabel) return;

  const setPanelOpen = (open) => {
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  };

  btn.addEventListener("click", () => setPanelOpen(panel.hidden));
  close.addEventListener("click", () => setPanelOpen(false));

  const syncUI = ({ dimLevel, blurLevel }) => {
    dimSlider.value = String(dimLevel);
    blurSlider.value = String(blurLevel);
    dimLabel.textContent = String(dimLevel);
    blurLabel.textContent = String(blurLevel);
  };

  syncUI(settings);

  let saveTimer;
  const onInput = () => {
    const next = {
      dimLevel: Number(dimSlider.value),
      blurLevel: Number(blurSlider.value),
    };

    dimLabel.textContent = String(next.dimLevel);
    blurLabel.textContent = String(next.blurLevel);

    applySettings(next);

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveSettings({ ...settings, ...next }), 150);
  };

  dimSlider.addEventListener("input", onInput);
  blurSlider.addEventListener("input", onInput);

  // start closed by default (optional)
  setPanelOpen(false);
}

export function initWallpapersToggleUI() {
  const btn = document.getElementById("wallpapersBtn");
  const panel = document.getElementById("wallpapersPanel");
  if (!btn || !panel) return;

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));

    const chev = btn.querySelector(".chev");
    if (chev) chev.textContent = open ? "▴" : "▾";

    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("is-open"));
    } else {
      panel.classList.remove("is-open");
      const onEnd = (e) => {
        if (e.propertyName !== "max-height") return;
        panel.hidden = true;
        panel.removeEventListener("transitionend", onEnd);
      };
      panel.addEventListener("transitionend", onEnd);
    }
  };

  btn.addEventListener("click", () => setOpen(panel.hidden));
  setOpen(false);
}

export function initFolderPickerUI({ folders, settings, onChange }) {
  const list = document.getElementById("folderList");
  if (!list) return;

  // null => all selected
  const selected = new Set(settings.selectedFolders ?? folders);

  list.textContent = "";

  for (const folder of folders) {
    const row = document.createElement("label");
    row.className = "folderItem";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = selected.has(folder);

    const name = document.createElement("span");
    name.className = "folderName";
    name.textContent = folder;

    cb.addEventListener("change", () => {
      if (cb.checked) selected.add(folder);
      else selected.delete(folder);

      // store null if all selected (future-proof when new folders added)
      const nextSelected = selected.size === folders.length ? null : Array.from(selected);
      onChange?.(nextSelected);
    });

    row.append(cb, name);
    list.appendChild(row);
  }
}
