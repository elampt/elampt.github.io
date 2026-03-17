const toggleBtn = document.getElementById("chat-toggle")
const panel = document.getElementById("chat-panel")

toggleBtn?.addEventListener("click", () => {
  if (!panel || !toggleBtn) return

  const isOpen = panel.classList.toggle("chat-open")
  toggleBtn.textContent = isOpen ? "\u2715" : "\uD83D\uDCAC"
  toggleBtn.setAttribute("aria-label", isOpen ? "Close chat" : "Open chat")

  // Lazy load: only set iframe src on first open
  const iframe = panel.querySelector("iframe") as HTMLIFrameElement
  if (isOpen && iframe && !iframe.src && iframe.dataset.src) {
    iframe.src = iframe.dataset.src
  }
})
