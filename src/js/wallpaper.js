// wallpaper.js

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const pickRandomDifferent = (arr, notThis) => {
  if (arr.length <= 1) return arr[0];
  let x = pickRandom(arr);
  while (x === notThis) x = pickRandom(arr);
  return x;
};

export async function loadImagesIndex() {
  const res = await fetch(chrome.runtime.getURL("images.json"));
  if (!res.ok) return {};
  const data = await res.json();
  return data && typeof data === "object" ? data : {};
}

export function pickFolderAndImage(index, lastFolder, selectedFolders) {
  const allFolders = Object.keys(index).filter((f) => (index[f]?.length ?? 0) > 0);
  if (allFolders.length === 0) return null;

  // null/empty => allow all folders
  const allowed =
    Array.isArray(selectedFolders) && selectedFolders.length
      ? new Set(selectedFolders)
      : null;

  const candidates = allowed
    ? allFolders.filter((f) => allowed.has(f))
    : allFolders;

  // If user unchecks everything, fallback to all
  const folders = candidates.length ? candidates : allFolders;

  const folder = pickRandomDifferent(folders, lastFolder);
  const images = index[folder];
  const image = pickRandom(images);

  return { folder, image };
}

export function setWallpaper(relativePath) {
  const bg = document.getElementById("bg");
  if (!bg || !relativePath) return;
  bg.style.backgroundImage = `url("${chrome.runtime.getURL(relativePath)}")`;
}
