import { TEAL, AMBER, CREAM } from "../constants/colors";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${CREAM}; font-family: 'Atkinson Hyperlegible', sans-serif; color: #1A1A2E; }
  @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes fadeSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes waveIn { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
  .float { animation: floatUp 4s ease-in-out infinite; }
  .float2 { animation: floatUp 5.5s ease-in-out infinite 1s; }
  .fade-in { animation: fadeSlideUp 0.7s ease both; }
  .fade-in-1 { animation: fadeSlideUp 0.7s ease 0.1s both; }
  .fade-in-2 { animation: fadeSlideUp 0.7s ease 0.25s both; }
  .fade-in-3 { animation: fadeSlideUp 0.7s ease 0.4s both; }
  .fade-in-4 { animation: fadeSlideUp 0.7s ease 0.55s both; }
  .pulse-btn:hover { animation: pulse 0.6s ease; }
  .feature-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(29,158,117,0.12); }
  .feature-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .step-dot { transition: background 0.3s; }
  .nav-link:hover { color: ${TEAL}; }
  .underline-anim { position: relative; }
  .underline-anim::after {
    content: '';
    position: absolute; bottom: -4px; left: 0;
    width: 100%; height: 4px;
    background: ${AMBER};
    border-radius: 2px;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${CREAM}; }
  ::-webkit-scrollbar-thumb { background: ${TEAL}; border-radius: 3px; }
`;
document.head.appendChild(globalStyle);
