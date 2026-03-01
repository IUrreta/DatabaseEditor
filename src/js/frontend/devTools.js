import { Command } from "../backend/command.js";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

if (isLocalhost) {
  let windowEl = null;
  let isOpen = false;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function createWindow() {
    windowEl = document.createElement("div");
    windowEl.className = "devtools-window";
    windowEl.innerHTML = `
      <div class="devtools-header">
        <div class="devtools-title">Developer</div>
        <button class="devtools-close" type="button" aria-label="Close">×</button>
      </div>
      <div class="devtools-body">
        <button class="devtools-action" type="button">Set all drivers stats to 85</button>
      </div>
    `;

    document.body.appendChild(windowEl);

    windowEl.querySelector(".devtools-close").addEventListener("click", () => {
      closeWindow();
    });

    windowEl.querySelector(".devtools-action").addEventListener("click", () => {
      const btn = windowEl.querySelector(".devtools-action");
      btn.disabled = true;
      btn.textContent = "Working...";

      const command = new Command("devSetAllDriversStats85", {});
      command.execute();

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Set all drivers stats to 85";
      }, 1200);
    });

    const headerEl = windowEl.querySelector(".devtools-header");
    headerEl.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      isDragging = true;

      const rect = windowEl.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;

      windowEl.style.left = `${rect.left}px`;
      windowEl.style.top = `${rect.top}px`;
      windowEl.style.transform = "none";
      windowEl.classList.add("dragging");

      headerEl.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    headerEl.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      windowEl.style.left = `${x}px`;
      windowEl.style.top = `${y}px`;
    });

    headerEl.addEventListener("pointerup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      windowEl.classList.remove("dragging");
      try {
        headerEl.releasePointerCapture(e.pointerId);
      } catch (err) {}
    });
  }

  function openWindow() {
    if (!windowEl) createWindow();
    windowEl.classList.add("show");
    isOpen = true;
  }

  function closeWindow() {
    if (!windowEl) return;
    windowEl.classList.remove("show");
    isOpen = false;
  }

  function toggleWindow() {
    if (isOpen) closeWindow();
    else openWindow();
  }

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.repeat) return;
      if (!e.ctrlKey) return;
      if (e.altKey || e.shiftKey) return;
      if (e.code !== "KeyD") return;
      e.preventDefault();
      toggleWindow();
    },
    true
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeWindow();
  });
}
