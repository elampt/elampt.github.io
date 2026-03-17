// @ts-ignore
import script from "./scripts/chatwidget.inline"
import styles from "./styles/chatwidget.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

interface Options {
  chatUrl: string
}

export default ((opts?: Options) => {
  const url = opts?.chatUrl ?? "https://elam-bubble-bot.streamlit.app/?embed=true"

  const ChatWidget: QuartzComponent = () => {
    return (
      <div class="chat-widget-container">
        <button id="chat-toggle" class="chat-toggle-btn" aria-label="Open chat">
          💬
        </button>

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
  ChatWidget.css = styles

  return ChatWidget
}) satisfies QuartzComponentConstructor
