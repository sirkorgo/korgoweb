// Function to toggle theme
function setTheme() {
  const html = document.documentElement;
  const btn = document.getElementById("btn");

  html.classList.add("theme-transition");
  const isLight = html.classList.contains("light");
  const newTheme = isLight ? "dark" : "light";

  html.classList.remove("light", "dark");
  html.classList.add(newTheme);

  if (btn) {
    btn.innerHTML = `<img src="/img/${newTheme}.svg" alt="Theme Toggle">`;
  }

  localStorage.setItem("theme", newTheme);
  setTimeout(() => html.classList.remove("theme-transition"), 200);
}

// Wrap DOM manipulation in DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const btn = document.getElementById("btn");

  // Init theme
  html.classList.remove("light", "dark");
  const saved = localStorage.getItem("theme");
  const theme = saved || "light";
  html.classList.add(theme);

  if (btn) {
    btn.innerHTML = `<img src="/img/${theme}.svg" alt="Theme Toggle">`;
    btn.addEventListener("click", setTheme);
  }

  // Mobile Support
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("links");
  const navbar = document.getElementById("nav");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      if (navbar) navbar.classList.toggle("combinedNav");
    });
  }

  // Stats visitor display
  const site = location.hostname.replace(/^www\./, "");
  const visitorsEl = document.getElementById("visitors");

  fetch("https://stats.sirkorgo.com/count?site=" + site)
    .then((r) => r.json())
    .then((d) => {
      if (visitorsEl) visitorsEl.innerHTML = "# " + d.count;
    })
    .catch((err) => console.error("Stats count error:", err));
});

// WebSocket for online counter (can safely run at module load)
const ws = new WebSocket("wss://korgoviewer.sirkorgo.partykit.dev/parties/main/room");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "users") {
    const onlineEl = document.getElementById("online");
    if (onlineEl) onlineEl.innerHTML = "🟢 " + data.count;
  }
};

// Analytics track call
const site = location.hostname.replace(/^www\./, "");
fetch("https://stats.sirkorgo.com/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    site,
    page: location.pathname,
    referrer: document.referrer,
  }),
}).catch((err) => console.error("Track error:", err));
