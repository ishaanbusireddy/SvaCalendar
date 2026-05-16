@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: #06060f;
  color: #e2e2ff;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Noise texture overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}

/* Hide scrollbars */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Shimmer animation */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Slide up animation */
@keyframes slideUp {
  0%   { opacity: 0; transform: translateY(12px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Fade in */
@keyframes fadeIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

/* Thinking dots */
@keyframes thinking {
  0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
  30%           { opacity: 1;   transform: scale(1); }
}

/* Glow pulse */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(124,58,237,0.3); }
  50%       { box-shadow: 0 0 24px rgba(124,58,237,0.7); }
}

/* New event slide in */
@keyframes eventAppear {
  0%   { opacity: 0; transform: scaleY(0.5) translateY(-8px); }
  100% { opacity: 1; transform: scaleY(1) translateY(0); }
}

.animate-thinking {
  animation: thinking 1.4s ease-in-out infinite;
}

.animate-slide-up {
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-fade-in {
  animation: fadeIn 0.25s ease;
}

.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

.event-appear {
  animation: eventAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Custom selection */
::selection {
  background: rgba(124, 58, 237, 0.4);
  color: #fff;
}
