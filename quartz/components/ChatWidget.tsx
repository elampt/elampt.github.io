// @ts-ignore
import script from "./scripts/chatwidget.inline"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

interface Options {
  chatUrl: string
}

export default ((opts?: Options) => {
  const url = opts?.chatUrl ?? "https://elam-bubble-bot.streamlit.app/?embed=true"

  const ChatWidget: QuartzComponent = () => {
    return (
      <div class="chat-widget-container">
        {/* Floating button */}
        <button id="chat-toggle" class="chat-toggle-btn" aria-label="Open chat">
          💬
        </button>

        {/* Chat panel with iframe */}
        <div id="chat-panel" class="chat-panel">
          <div class="chat-panel-header">
            <span>Bubble — Ask me anything!</span>
          </div>
          <iframe data-src={url} title="Bubble Chat" class="chat-iframe"></iframe>
        </div>
      </div>
    )
  }

  ChatWidget.afterDOMLoaded = script

  ChatWidget.css = `
    .chat-toggle-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: var(--secondary);
      color: var(--darkgray);
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .chat-toggle-btn:hover {
      transform: scale(1.1);
      background: var(--tertiary);
    }

    .chat-panel {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 400px;
      height: 550px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
      z-index: 999;
      display: none;
      flex-direction: column;
      background: var(--light);
      border: 1px solid var(--lightgray);
    }

    .chat-panel.chat-open {
      display: flex;
    }

    .chat-panel-header {
      padding: 12px 16px;
      background: var(--secondary);
      color: var(--darkgray);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .chat-iframe {
      flex: 1;
      border: none;
      width: 100%;
      height: 100%;
    }

    @media (max-width: 600px) {
      .chat-panel {
        width: calc(100vw - 32px);
        height: calc(100vh - 140px);
        right: 16px;
        bottom: 88px;
      }

      .chat-toggle-btn {
        bottom: 16px;
        right: 16px;
      }
    }
  `

  return ChatWidget
}) satisfies QuartzComponentConstructor
