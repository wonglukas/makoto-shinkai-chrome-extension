import { startClock } from "./js/clock.js";
import {
  loadSettings,
  applySettings,
  initSettingsUI,
  saveSettings,
  initFolderPickerUI,
  initWallpapersToggleUI,
} from "./js/settings.js";
import { loadImagesIndex, pickFolderAndImage, setWallpaper } from "./js/wallpaper.js";

const LAST_FOLDER_KEY = "lastFolder";

(async () => {
  startClock();

  const index = await loadImagesIndex();
  const folders = Object.keys(index).filter((f) => (index[f] || []).length > 0);
  if (folders.length === 0) return;

  const settings = await loadSettings();
  applySettings(settings);
  initSettingsUI(settings);
  initWallpapersToggleUI();

  const sourceEl = document.getElementById("sourceLabel");

  const stored = await chrome.storage.local.get(LAST_FOLDER_KEY);
  let lastFolder = stored[LAST_FOLDER_KEY] || null;

  const applyWallpaperPick = async (nextSettings = settings) => {
    const picked = pickFolderAndImage(index, lastFolder, nextSettings.selectedFolders);
    if (!picked) return;

    setWallpaper(picked.image);

    lastFolder = picked.folder;
    await chrome.storage.local.set({ [LAST_FOLDER_KEY]: lastFolder });

    if (sourceEl) sourceEl.textContent = picked.folder;
  };

  initFolderPickerUI({
    folders,
    settings,
    onChange: async (nextSelectedFolders) => {
      const next = { ...settings, selectedFolders: nextSelectedFolders };
      settings.selectedFolders = nextSelectedFolders; // keep local copy in sync
      await saveSettings(next);
      await applyWallpaperPick(next);
    },
  });

  await applyWallpaperPick(settings);
})();
