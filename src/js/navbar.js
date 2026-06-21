  function setTheme() {
      html.classList.add("theme-transition");
      const isLight = html.classList.contains("light");
      const newTheme = isLight ? "dark" : "light";
      html.classList.remove("light", "dark");
      html.classList.add(newTheme);
      btn.innerHTML = `<img src="/src/img/${newTheme}.svg" alt="Theme Toggle">`;
      localStorage.setItem("theme", newTheme);
      setTimeout(() => html.classList.remove("theme-transition"), 200);
    }

    // Init theme
    html.classList.remove("light");
    html.classList.remove("dark");
    const saved = localStorage.getItem("theme");
    const theme =
      saved ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    html.classList.add(theme);
    btn.innerHTML = `<img src="/src/img/${theme}.svg" alt="Theme Toggle">`;

    // Mobile Support
  document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("links");
  const navbar = document.getElementById("nav");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      navbar.classList.toggle("combinedNav");
    });
  }
});    

    // init online counter
    const ws = new WebSocket(
      "wss://korgoviewer.sirkorgo.partykit.dev/parties/main/room",
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "users") {
        document.getElementById("online").innerHTML = "🟢 " + data.count;
      }
    };

    // get stats
    const site = location.hostname.replace(/^www\./, '');

    fetch('https://stats.sirkorgo.com/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site,
        page: location.pathname,
        referrer: document.referrer
      })
    });

    fetch('https://stats.sirkorgo.com/count?site=' + site)
      .then(r => r.json())
      .then(d => document.getElementById('visitors').innerHTML = '# ' + d.count);