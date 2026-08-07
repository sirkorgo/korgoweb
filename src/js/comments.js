const box = document.getElementById("box");
const f = document.getElementById("f");
const u = document.getElementById("u");
const m = document.getElementById("m");
const count = document.getElementById("count");
const P = location.pathname;

const escapeHTML = (str) =>
  (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const log = async (d) => {
  try {
    const res = await fetch("/api/social/moderator");

    if (!res.ok) throw new Error(`Moderator check returned status ${res.status}`);

    const { blocked } = await res.json();

    if (blocked) {
      f.style.display = "none";
      box.innerHTML = `
          <span class="fallback-state" style="display: flex; gap: 10px; justify-content: center; align-items: center; padding: 20px 0;">
            <img src="/src/img/wget-dead.webp" width="200px" height="200px">
            <span style="max-width: 50%;">
              <h2>Service Unavailable</h2>
              <p><b>You can't post or view comments right now.</b> Unfortunately, someone on your current network was misusing the guestbook and/or comment section, resulting in a permanent IP ban.<br>To appeal this ban, please contact sirkorgo from the About page.<br>
              <small style="color: gray;"><i>Reference Code: ACCESS_RESTRICTED</i></small>
              </p>
            </span>
          </span>`;
      return;
    }

    if (!d || d.length === 0) {
      box.innerHTML = `<p style="color: gray; font-style: italic; margin-top: 10px; text-align: center;">No comments on this post yet, be the first!</p>`;
      return;
    }

    box.innerHTML = d
      .map((c) => {
        const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "";
        const safeUser = escapeHTML(c.username);
        const safeMsg = escapeHTML(c.message);
        return `<span class="comment"><p><b><i>${safeUser}</i></b> <small style="color: gray; margin-left: 8px;">${dateStr}</small><br>${safeMsg}</p></span>`;
      })
      .join("");
  } catch (err) {
    // FALLBACK 1: Moderator Endpoint Failure Layout
    console.error("Moderator API check failed: ", err);
    f.style.display = "none";
    box.innerHTML = `
        <span class="fallback-state" style="display: flex; gap: 10px; justify-content: center; align-items: center; padding: 20px 0;">
          <img src="/img/emblems/srkgo-dizzy.webp" width="200px" height="200px">
          <span style="max-width: 50%;">
            <h2>Something went wrong.</h2>
            <p><b>You can't post or view comments right now.</b> Your device could not be verified. This may be because the moderation service is experiencing disruptions.<br>If this error persists, please contact Sirkorgo from the About page.<br>
            <small style="color: gray;"><i>Reference Code: MODERATION_FAIL</i></small>
            </p>
          </span>
        </span>`;
  }
};

const load = () => {
  fetch(`/api/social/read?page=${P}`)
    .then((r) => {
      if (!r.ok) throw new Error(`Read server returned status ${r.status}`);
      return r.json();
    })
    .then(log)
    .catch((err) => {
      // FALLBACK 2: Database / Feed Read Failure Layout
      console.error("Failed to load comments:", err);
      box.innerHTML = `
          <span class="fallback-state" style="display: flex; gap: 10px; justify-content: center; align-items: center; padding: 20px 0;">
            <img src="/img/emblems/srkgo-dizzy.webp" width="200px" height="200px">
            <span style="max-width: 50%;">
              <h2>Something went wrong.</h2>
              <p><b>You can't view comments right now.</b> The comment stream could not be loaded because the database server could not be reached. Please check your internet connection or try refreshing the page.<br>If this issue persists, please report it to Sirkorgo via the About page.<br>
              <small style="color: gray;"><i>Reference Code: READ_FAIL</i></small>
              </p>
            </span>
          </span>`;
    });
};

load();

m.oninput = function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";

  const remaining = 250 - this.value.length;
  count.textContent = `${remaining} characters remaining`;
};

f.onsubmit = async (e) => {
  e.preventDefault();

  // Clear out any previous submission error subtext if it exists
  const oldErr = document.getElementById("submit-err");
  if (oldErr) oldErr.remove();

  try {
    const res = await fetch("/api/social/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageUrl: P, username: u.value, message: m.value }),
    });

    if (res.ok) {
      m.value = "";
      m.style.height = "auto";
      count.textContent = "250 characters remaining";
      load();
    } else if (res.status === 403) {
      f.style.display = "none";
      box.innerHTML = `
          <span class="fallback-state" style="display: flex; gap: 10px; justify-content: center; align-items: center; padding: 20px 0;">
            <img src="/src/img/wget-dead.webp" width="200px" height="200px">
            <span style="max-width: 50%;">
              <h2>Access Denied</h2>
              <p><b>Your submission was rejected by the server.</b> Access from your current network routing has been restricted.<br>
              <small style="color: gray;"><i>Reference Code: ACCESS_RESTRICTED</i></small>
              </p>
            </span>
          </span>`;
    } else {
      throw new Error(`Server status ${res.status}`);
    }
  } catch (err) {
    // FALLBACK 3: Compact submission subtext error string
    console.error("Network error during submission:", err);

    const errSubtext = document.createElement("div");
    errSubtext.id = "submit-err";
    errSubtext.style =
      'font-size: 11px; font-family: "Cabin"; color: #ff5555; margin: 4px 0 0 2px; line-height: 1.3;';
    errSubtext.innerHTML = `Something went wrong. Failed to post comment. Please try again.<br><i>Reference Code: SUBMIT_FAIL</i>`;

    count.parentNode.appendChild(errSubtext);
  }
};
