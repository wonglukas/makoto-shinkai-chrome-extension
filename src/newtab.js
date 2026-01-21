import { startClock } from "./js/clock.js";
import { loadSettings, applySettings, initSettingsUI } from "./js/settings.js";
import { loadImagesIndex, pickFolderAndImage, setWallpaper } from "./js/wallpaper.js";

const LAST_FOLDER_KEY = "lastFolder";

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

  const label = document.getElementById("sourceLabel");
  if (label) label.textContent = picked.folder;

  await chrome.storage.local.set({ [LAST_FOLDER_KEY]: picked.folder });
})();
