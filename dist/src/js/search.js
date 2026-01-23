export function initSearch() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    chrome.search.query({ text, disposition: "CURRENT_TAB" });
    input.value = "";
  });
}
