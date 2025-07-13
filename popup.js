const ui = document.createElement("div");
ui.innerHTML = `
  <div id="yt-bookmark-ui" style="
    position: fixed;
    bottom: 100px;
    right: 30px;
    background: white;
    border: 1px solid #ccc;
    padding: 10px;
    z-index: 10000;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(0,0,0,0.2);
    font-family: sans-serif;
  ">
    <button id="bookmark-current" style="margin-bottom: 6px;">📌 Bookmark</button><br/>
    <button id="bookmark-view" style="margin-bottom: 6px;">📂 View Bookmarks</button><br/>
    <button id="bookmark-remove" style="margin-bottom: 6px;">❌ Hide Bookmarks</button><br/>
    <textarea id="bookmark-note" placeholder="Add a note..." style="width: 200px; height: 50px; margin-bottom: 8px;"></textarea>
    <div id="bookmark-list" style="max-height: 200px; overflow-y: auto;"></div>
  </div>
`;
document.body.appendChild(ui);

// 🧽 Hide bookmarks section
document.getElementById("bookmark-remove").addEventListener("click", () => {
  const container = document.getElementById("bookmark-list");
  container.innerHTML = "";
  container.style.display = "none";
});

// 📌 Add a bookmark
document.getElementById("bookmark-current").addEventListener("click", () => {
  try {
    const video = document.querySelector("video");
    if (!video) {
      alert("⚠️ No video element found!");
      return;
    }

    const time = video.currentTime;
    const note = document.getElementById("bookmark-note").value.trim();
    const url = window.location.href;

    const bookmark = {
      url,
      time,
      note,
      title: document.title,
      createdAt: new Date().toISOString()
    };

    chrome.storage.local.get(["bookmarks"], (data) => {
      const bookmarks = data.bookmarks || [];
      bookmarks.push(bookmark);

      chrome.storage.local.set({ bookmarks }, () => {
        alert("🔖 Bookmark saved!");
        document.getElementById("bookmark-note").value = "";
      });
    });
  } catch (err) {
    console.error("Failed to bookmark:", err);
  }
});

// 📂 View bookmarks
document.getElementById("bookmark-view").addEventListener("click", () => {
  const container = document.getElementById("bookmark-list");
  container.innerHTML = "";
  container.style.display = "block";

  const currentUrl = window.location.href;

  chrome.storage.local.get(["bookmarks"], (data) => {

      const bookmarks = data.bookmarks || [];
      const filtered = bookmarks.filter(b => b.url === currentUrl);

      if (filtered.length === 0) {
        container.innerHTML = "<p style='font-size: 14px; color: gray;'>No bookmarks for this video.</p>";
        return;
      }

     filtered.forEach((bookmark, index) => {
  const wrapper = document.createElement("div");
  wrapper.style.borderBottom = "1px solid #ddd";
  wrapper.style.padding = "6px 0";

  const p = document.createElement("p");
  p.style.margin = "0";
  p.style.fontSize = "14px";

  const timeFormatted = new Date(bookmark.time * 1000).toISOString().substr(11, 8);
  p.innerHTML = `🔹 ${timeFormatted} — ${bookmark.note || "No note"}`;

  const btn = document.createElement("button");
  btn.textContent = "⏩ Go to timestamp";
  btn.style.marginLeft = "10px";
  btn.style.fontSize = "12px";

  // ✅ Attach time to button click
  btn.addEventListener("click", () => {
    const video = document.querySelector("video");
    if (video) {
      video.currentTime = bookmark.time;
      video.play(); // Optional: auto play
    }
  });

  wrapper.appendChild(p);
  wrapper.appendChild(btn);
  container.appendChild(wrapper);
});
})});