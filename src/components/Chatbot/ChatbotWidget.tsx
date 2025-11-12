import { useState } from 'react';

type ChatbotMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const defaultMessages: ChatbotMessage[] = [
  {
    role: 'system',
    content: 'Welcome to the Boreal Staff Assistant. Choose an option to get started.',
  },
];

const quickActions = [
  { id: 'human', label: 'Talk to a Human', placeholder: 'Connecting you with support...' },
  { id: 'issue', label: 'Report an Issue', placeholder: 'Please describe the issue you are facing.' },
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>(defaultMessages);

  const handleAction = (actionId: string) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: quickActions.find((a) => a.id === actionId)?.label ?? '' },
      {
        role: 'assistant',
        content: quickActions.find((a) => a.id === actionId)?.placeholder ?? 'Processing...'
      },
    ]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const prompt = String(formData.get('prompt') ?? '').trim();
    if (!prompt) return;
    setMessages((prev) => [...prev, { role: 'user', content: prompt }, { role: 'assistant', content: 'Thanks! A specialist will review this.' }]);
    event.currentTarget.reset();
  };

  return (
    <div className={`chatbot ${isOpen ? 'chatbot--open' : ''}`}>
      <button className="chatbot__toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '×' : 'Need Help?'}
      </button>
      {isOpen && (
        <div className="chatbot__panel">
          <header>
            <strong>Staff Assistant</strong>
            <p>AI/Ops co-pilot with escalation options</p>
          </header>
          <div className="chatbot__messages" role="log">
            {messages.map((message, index) => (
              <div key={index} className={`chatbot__message chatbot__message--${message.role}`}>
                {message.content}
              </div>
            ))}
          </div>
          <div className="chatbot__actions">
            {quickActions.map((action) => (
              <button key={action.id} onClick={() => handleAction(action.id)}>
                {action.label}
              </button>
            ))}
          </div>
          <form className="chatbot__form" onSubmit={handleSubmit}>
            <label htmlFor="chatbot-prompt">Ask a question</label>
            <textarea id="chatbot-prompt" name="prompt" placeholder="Describe your request" />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
