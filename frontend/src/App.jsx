import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const personas = {
  anshuman: {
    key: 'anshuman',
    name: 'Anshuman Singh',
    role: 'Direct, high-performance mentor',
    tone: 'Practical, ambitious, disciplined',
    accent: 'var(--persona-anshuman)',
    glow: 'rgba(64, 224, 208, 0.2)',
    welcome:
      'Ask about discipline, execution, career growth, or fundamentals. This version keeps the answers crisp and outcome-focused.',
    chips: [
      'What happens if I get caught cheating in exams',
      'How do I stop procrastinating while learning DSA?',
      'Can I succeed without working very hard?',
    ],
  },
  abhimanyu: {
    key: 'abhimanyu',
    name: 'Abhimanyu Saxena',
    role: 'Strict, strategic, founder-like',
    tone: 'Focused, direct, no-nonsense',
    accent: 'var(--persona-abhimanyu)',
    glow: 'rgba(255, 184, 77, 0.2)',
    welcome:
      'Use this persona for hard truths, structured advice, and long-term thinking. It will keep the conversation grounded and sharp.',
    chips: [
      'What happens if I get caught cheating in exams',
      'How should I prepare for interviews with weak fundamentals?',
      'Why is consistency more valuable than motivation?',
    ],
  },
  kshitij: {
    key: 'kshitij',
    name: 'Kshitij Mishra',
    role: 'Sarcastic but practical professor',
    tone: 'Witty, blunt, encouraging',
    accent: 'var(--persona-kshitij)',
    glow: 'rgba(162, 91, 255, 0.22)',
    welcome:
      'This persona can tease a little, but the answer will still stay useful, grounded, and straight to the point.',
    chips: [
      'What happens if I get caught cheating in exams',
      'I keep losing motivation while studying. What now?',
      'Should I learn many technologies at once?',
    ],
  },
}

const initialMessages = (personaKey) => [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      personas[personaKey].welcome +
      ' Start a conversation below and the chatbot will answer in character.',
  },
]

function App() {
  const [activePersona, setActivePersona] = useState('anshuman')
  const [messages, setMessages] = useState(() => initialMessages('anshuman'))
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const messageIdRef = useRef(0)

  const activePersonaConfig = useMemo(
    () => personas[activePersona],
    [activePersona],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handlePersonaChange = (personaKey) => {
    setActivePersona(personaKey)
    setMessages(initialMessages(personaKey))
    setInputValue('')
    setError('')
    setIsLoading(false)
  }

  const sendMessage = async (messageText) => {
    const trimmedMessage = messageText.trim()

    if (!trimmedMessage || isLoading) {
      return
    }

    const priorMessages = messages
      .filter((entry) => entry.id !== 'welcome')
      .map(({ role, content }) => ({ role, content }))

    const userMessage = {
      id: `message-${messageIdRef.current++}-user`,
      role: 'user',
      content: trimmedMessage,
    }

    const conversation = [...messages, userMessage]

    setMessages(conversation)
    setInputValue('')
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:411'}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            persona: activePersona,
            message: trimmedMessage,
            history: priorMessages,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to get a reply right now.')
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: data.reply,
        },
      ])
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong while sending your message.')
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          content:
            'I could not reach the backend just now. Check the server and try again in a moment.',
          variant: 'error',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Persona-Based AI Chatbot</p>
          <h1>Three mentors, one chat surface, zero starter-template energy.</h1>
          <p className="hero-text">
            Switch between the Scaler personalities, keep the active persona visible,
            and reset the conversation whenever the context changes.
          </p>
        </div>

        <div
          className="persona-snapshot"
          style={{
            '--accent': activePersonaConfig.accent,
            '--glow': activePersonaConfig.glow,
          }}
        >
          <span className="persona-badge">Active persona</span>
          <h2>{activePersonaConfig.name}</h2>
          <p>{activePersonaConfig.role}</p>
          <div className="persona-tone">{activePersonaConfig.tone}</div>
        </div>
      </section>

      <section className="persona-tabs" aria-label="Persona switcher">
        {Object.values(personas).map((persona) => (
          <button
            key={persona.key}
            type="button"
            className={`persona-tab ${activePersona === persona.key ? 'is-active' : ''}`}
              onClick={() => handlePersonaChange(persona.key)}
            style={{ '--tab-accent': persona.accent }}
          >
            <span className="tab-name">{persona.name}</span>
            <span className="tab-role">{persona.role}</span>
          </button>
        ))}
      </section>

      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <p className="chat-kicker">Conversation</p>
            <h2>{activePersonaConfig.name}</h2>
          </div>
          <div className="chat-status">
            <span className={`status-dot ${isLoading ? 'live' : ''}`}></span>
            {isLoading ? 'Typing' : 'Ready'}
          </div>
        </header>

        <div className="chat-stream" role="log" aria-live="polite">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`message-bubble ${message.role} ${message.variant || ''}`.trim()}
            >
              <div className="message-meta">
                <span>{message.role === 'user' ? 'You' : activePersonaConfig.name}</span>
                {message.role === 'assistant' && message.variant !== 'error' ? (
                  <span>Persona reply</span>
                ) : null}
              </div>
              <p>{message.content}</p>
            </article>
          ))}

          {isLoading ? (
            <article className="message-bubble assistant typing">
              <div className="message-meta">
                <span>{activePersonaConfig.name}</span>
                <span>Thinking</span>
              </div>
              <div className="typing-indicator" aria-label="Assistant is typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </article>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div className="chip-row" aria-label="Quick start prompts">
          {activePersonaConfig.chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`chip ${chip === 'What happens if I get caught cheating in exams' ? 'is-warning' : ''}`}
              onClick={() => sendMessage(chip)}
              disabled={isLoading}
            >
              {chip}
            </button>
          ))}
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <form className="composer" onSubmit={handleSubmit}>
          <label className="composer-label" htmlFor="prompt-input">
            Ask {activePersonaConfig.name}
          </label>
          <textarea
            id="prompt-input"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Type your question here. Shift + Enter adds a line break."
            rows={4}
            disabled={isLoading}
          />
          <div className="composer-actions">
            <p className="composer-hint">Persona changes clear the conversation automatically.</p>
            <button type="submit" className="send-button" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default App
