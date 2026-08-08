function getActiveTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function updateToggleButton(theme) {
  const btn = document.getElementById("btn");
  if (btn) {
    btn.innerHTML = `<img src="/img/${theme}.svg" alt="${theme} mode">`;
  }
}

function setTheme() {
  const html = document.documentElement;
  const currentTheme = getActiveTheme();
  const newTheme = currentTheme === "light" ? "dark" : "light";

  // Add transition class temporarily for smooth toggle
  html.classList.add("theme-transition");

  html.classList.remove("light", "dark");
  html.classList.add(newTheme);

  updateToggleButton(newTheme);
  localStorage.setItem("theme", newTheme);

  setTimeout(() => {
    html.classList.remove("theme-transition");
  }, 200);
}

document.addEventListener("DOMContentLoaded", () => {
  // Sync toggle button with theme initialized by <head> script
  const currentTheme = getActiveTheme();
  updateToggleButton(currentTheme);

  const btn = document.getElementById("btn");
  if (btn) {
    btn.addEventListener("click", setTheme);
  }

  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("links");
  const navbar = document.getElementById("nav");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      if (navbar) navbar.classList.toggle("combinedNav");
    });
  }

  const site = location.hostname.replace(/^www\./, "");
  const visitorsEl = document.getElementById("visitors");

  fetch(`https://stats.sirkorgo.com/count?site=${site}`)
    .then((r) => r.json())
    .then((d) => {
      if (visitorsEl) visitorsEl.innerHTML = "# " + d.count;
    })
    .catch((err) => console.error("Stats count error:", err));
});

const site = location.hostname.replace(/^www\./, "");

const ws = new WebSocket("wss://korgoviewer.sirkorgo.partykit.dev/parties/main/room");

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.type === "users") {
      const onlineEl = document.getElementById("online");
      if (onlineEl) onlineEl.innerHTML = "🟢 " + data.count;
    }
  } catch (err) {
    console.error("WebSocket message parse error:", err);
  }
};

fetch("https://stats.sirkorgo.com/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    site,
    page: location.pathname,
    referrer: document.referrer,
  }),
}).catch((err) => console.error("Track error:", err));
