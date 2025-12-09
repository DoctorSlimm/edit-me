"use client";

import { useState, useEffect } from "react";

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
}

export default function ChatWoot() {
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const startProcessing = async () => {
    setIsProcessing(true);

    try {
      // Use environment variable or fallback to detecting dev/prod
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:3000'
          : 'https://sourcewizard.ai');

      const response = await fetch(`${apiUrl}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          prompt: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setShowPrompt(false);
      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !input.trim() || isProcessing) return;

    startProcessing();
  };

  const handleReset = () => {
    setEmail("");
    setInput("");
    setIsProcessing(false);
    setProgressSteps([]);
    setIsComplete(false);
    setShowPrompt(true);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Collapsed view - just the gear icon
  if (!isExpanded) {
    return (
      <button
        onClick={toggleExpanded}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gray-800 border-2 border-gray-900 shadow-2xl flex items-center justify-center cursor-pointer hover:bg-gray-900"
        style={{ fontFamily: "monospace", zIndex: 9999 }}
        aria-label="Open SourceWizard Agent"
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    );
  }

  // Expanded view - full form
  return (
    <div
      className="fixed bottom-6 right-6 w-[500px] bg-gray-200 border-2 border-gray-800 shadow-2xl flex flex-col"
      style={{ fontFamily: "monospace", zIndex: 9999 }}
    >
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 text-sm font-bold border-b-2 border-black flex items-center justify-between">
        <span>{isComplete ? "Thanks!" : "How would you change our app?"}</span>
        <button
          onClick={toggleExpanded}
          className="text-white hover:text-gray-300 cursor-pointer"
          aria-label="Minimize"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {showPrompt ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2"
                style={{
                  fontFamily: "var(--font-chikarego)",
                  fontSize: "24px",
                }}
              >
                How do you want to update this app?
                <p className="text-gray-600" style={{
                  fontSize: "16px",
                }}>
                  (Explain it in a format of a Cursor prompt)
                </p>
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add dark mode toggle to settings..."
                className="w-full p-3 text-sm text-black bg-white border-2 border-gray-400 resize-none focus:outline-none focus:border-gray-600"
                rows={6}
                style={{
                  fontFamily: "var(--font-chikarego)",
                  fontSize: "16px",
                }}
                disabled={isProcessing}
              />
              <p className="text-gray-500">
                Tip: hold Ctrl+C to select element to add to context
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2"
                style={{
                  fontFamily: "var(--font-chikarego)",
                  fontSize: "24px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 text-sm text-black bg-white border-2 border-gray-400 focus:outline-none focus:border-gray-600"
                style={{
                  fontFamily: "var(--font-chikarego)",
                  fontSize: "16px",
                }}
                disabled={isProcessing}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!email.trim() || !input.trim() || isProcessing}
              className="w-full px-4 py-2 bg-gray-800 text-white font-bold text-sm border-2 border-gray-900 disabled:bg-gray-400 disabled:border-gray-500 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-900"
            >
              Apply
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative w-64 h-24 overflow-visible">
              <style jsx>{`
                @keyframes heartToClaude {
                  0%, 12.5% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                  }
                  25% {
                    transform: translateX(85px) scale(0.6);
                    opacity: 0.5;
                  }
                  37.5%, 100% {
                    transform: translateX(95px) scale(0.3);
                    opacity: 0;
                  }
                }

                @keyframes claudeToGithub {
                  0%, 37.5% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                  }
                  50% {
                    opacity: 0.5;
                    transform: translateX(75px) scale(0.6);
                  }
                  62.5%, 100% {
                    opacity: 0;
                    transform: translateX(85px) scale(0.3);
                  }
                }

                @keyframes githubToCenter {
                  0%, 62.5% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                  }
                  75% {
                    opacity: 1;
                    transform: translateX(-96px) scale(1.1);
                  }
                  87.5%, 100% {
                    opacity: 1;
                    transform: translateX(-96px) scale(1);
                  }
                }

                .heart-moving {
                  animation: heartToClaude 8s ease-in-out infinite;
                }

                .claude-container {
                  animation: claudeToGithub 8s ease-in-out infinite;
                }

                .github-final {
                  animation: githubToCenter 8s ease-in-out infinite;
                }
              `}</style>

              {/* Heart moving right (starts left) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 heart-moving">
                <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              {/* Claude logo in middle-left */}
              <div className="absolute left-24 top-1/2 -translate-y-1/2 claude-container">
                <img src="/claude.png" alt="Claude" className="w-16 h-16" />
              </div>

              {/* GitHub logo - starts right, moves slightly left */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 github-final">
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="#1f2937">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
            </div>

            <p className="text-gray-800 text-sm text-center px-4"
              style={{
                fontFamily: "var(--font-chikarego)",
                fontSize: "26px",
              }}
            >
              Your request was submitted. We'll notify you once PR would land in production.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-800 text-white font-bold text-sm border-2 border-gray-900 cursor-pointer hover:bg-gray-900"
            >
              New Request
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white px-4 py-2 text-xs text-center border-t-2 border-black">
        Powered by <a href="https://sourcewizard.ai" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-gray-300 underline">SourceWizard</a>
      </div>
    </div>
  );
}
