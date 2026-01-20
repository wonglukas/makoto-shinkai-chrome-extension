// date suffix
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// clock
export function startClock() {
  const timeEl = document.getElementById("time");
  const ampmEl = document.getElementById("ampm");
  const dateEl = document.getElementById("date");
  if (!timeEl || !ampmEl || !dateEl) return;

  let lastText = "";

  const render = () => {
    const d = new Date();

    // 12 hr clock
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

    //time and date 
    timeEl.textContent = `${hh}:${mm}`;
    ampmEl.textContent = ampm;
    dateEl.textContent = `${weekday}, ${month} ${day}, ${year}`;
  };

  render();
  
  // update every min
  setInterval(render, 60_000);
}
