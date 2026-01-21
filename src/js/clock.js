// clock.js

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const pad2 = (n) => String(n).padStart(2, "0");

export function startClock() {
  const timeEl = document.getElementById("time");
  const ampmEl = document.getElementById("ampm");
  const dateEl = document.getElementById("date");
  if (!timeEl || !ampmEl || !dateEl) return;

  let lastText = "";

  const render = () => {
    const d = new Date();

    // 12-hour time
    let h = d.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    const hh = pad2(h);
    const mm = pad2(d.getMinutes());

    // Date text
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
  setInterval(render, 60_000); // update every minute
}
