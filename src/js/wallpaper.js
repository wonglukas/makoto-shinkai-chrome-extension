
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomDifferent(arr, notThis) {
  if (arr.length <= 1) return arr[0];
  let x = pickRandom(arr);
  while (x === notThis) x = pickRandom(arr);
  return x;
}

// get image
export async function loadImagesIndex() {
  const res = await fetch(chrome.runtime.getURL("images.json"));
  return res.ok ? res.json() : {};
}

// pick different image folder
export function pickFolderAndImage(index, lastFolder) {
  const folders = Object.keys(index).filter((f) => (index[f] || []).length > 0);
  if (folders.length === 0) return null;

  const folder = pickRandomDifferent(folders, lastFolder);
  const images = index[folder];
  const image = pickRandom(images);

  return { folder, image };
}

// set the image as wallpaper
export function setWallpaper(relativePath) {
  const bg = document.getElementById("bg");
  if (!bg || !relativePath) return;
  bg.style.backgroundImage = `url("${chrome.runtime.getURL(relativePath)}")`;
}
