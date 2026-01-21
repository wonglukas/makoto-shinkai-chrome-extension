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
  // Core UI
  startClock();

  const sourceEl = document.getElementById("sourceLabel");

  // Load wallpapers index + folders once
  const index = await loadImagesIndex();
  const folders = Object.keys(index).filter((f) => (index[f]?.length ?? 0) > 0);
  if (folders.length === 0) return;

  // Settings
  const settings = await loadSettings();
  applySettings(settings);
  initSettingsUI(settings);
  initWallpapersToggleUI();

  // Restore last folder (avoid repeating)
  const { [LAST_FOLDER_KEY]: storedLastFolder = null } =
    await chrome.storage.local.get(LAST_FOLDER_KEY);
  let lastFolder = storedLastFolder;

  const applyWallpaperPick = async (activeSettings = settings) => {
    const picked = pickFolderAndImage(index, lastFolder, activeSettings.selectedFolders);
    if (!picked) return;

    setWallpaper(picked.image);

    lastFolder = picked.folder;
    await chrome.storage.local.set({ [LAST_FOLDER_KEY]: lastFolder });

    if (sourceEl) sourceEl.textContent = picked.folder;
  };

  // Folder picker (in settings)
  initFolderPickerUI({
    folders,
    settings,
    onChange: async (nextSelectedFolders) => {
      settings.selectedFolders = nextSelectedFolders; // keep local copy in sync
      await saveSettings({ ...settings });
      await applyWallpaperPick(settings);
    },
  });

  // Initial wallpaper
  await applyWallpaperPick();
})();
