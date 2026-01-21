const SETTINGS_KEY = "wallpaperSettings";

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

//apply css changes
export function applySettings({ dimLevel, blurLevel }) {
  document.documentElement.style.setProperty("--dim-alpha", String(dimLevelToAlpha(dimLevel)));
  document.documentElement.style.setProperty("--bg-blur", `${blurLevelToPx(blurLevel)}px`);
  document.documentElement.style.setProperty("--bg-scale", String(blurLevelToScale(blurLevel)));
}

// default settings
export async function loadSettings() {
  const defaults = { dimLevel: 4, blurLevel: 0, selectedFolders: null }; // null => all
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  const saved = data[SETTINGS_KEY] || {};
  return { ...defaults, ...saved };
}

// save settings
export function saveSettings(settings) {
  return chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export function initFolderPickerUI({ folders, settings, onChange }) {
  const list = document.getElementById("folderList");
  if (!list) return;

  // If settings.selectedFolders is null => treat as "all selected"
  const selected = new Set(settings.selectedFolders ?? folders);

  list.innerHTML = "";

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

      // If user checks everything, store null (lighter + future-proof)
      const nextSelected =
        selected.size === folders.length ? null : Array.from(selected);

      onChange?.(nextSelected);
    });

    row.appendChild(cb);
    row.appendChild(name);
    list.appendChild(row);
  }
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
