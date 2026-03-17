// Persistent chat panel — lives on document.documentElement (outside body)
// so micromorph's body morphing never touches it.
let persistentPanel: HTMLDivElement | null = null

document.addEventListener("nav", () => {
  const toggleBtn = document.getElementById("chat-toggle")
  // Hide the template panel from afterBody
  const templatePanel = document.getElementById("chat-panel")
  if (templatePanel) templatePanel.style.display = "none"

  if (!toggleBtn) return

  const chatUrl =
    templatePanel?.querySelector("iframe")?.dataset.src ??
    "https://elam-bubble-bot.streamlit.app/?embed=true"

  // Check if persistent panel already exists
  persistentPanel = document.getElementById("chat-panel-persistent") as HTMLDivElement

  // Restore button state if panel is open
  if (persistentPanel?.classList.contains("chat-open")) {
    toggleBtn.textContent = "\u2715"
    toggleBtn.setAttribute("aria-label", "Close chat")
  }

  function onClick() {
    // Create panel on first click, append to <html> not <body>
    if (!persistentPanel) {
      persistentPanel = document.createElement("div")
      persistentPanel.id = "chat-panel-persistent"
      persistentPanel.className = "chat-panel"
      persistentPanel.innerHTML = `
        <div class="chat-panel-header"><span>Bubble — Ask me anything!</span></div>
        <iframe src="${chatUrl}" title="Bubble Chat" class="chat-iframe"></iframe>
      `
      document.documentElement.appendChild(persistentPanel)
    }

    if (!toggleBtn) return
    const isOpen = persistentPanel.classList.toggle("chat-open")
    toggleBtn.textContent = isOpen ? "\u2715" : "\uD83D\uDCAC"
    toggleBtn.setAttribute("aria-label", isOpen ? "Close chat" : "Open chat")
  }

  toggleBtn.addEventListener("click", onClick)
  window.addCleanup(() => toggleBtn.removeEventListener("click", onClick))
})
