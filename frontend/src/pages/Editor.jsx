// pages/Editor.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';

import WordPredictor, { LANGUAGES } from '../components/WordPredictor';
import { TEAL, AMBER, CREAM } from "../constants/colors";

// ─── Font + Global Styles ─────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: ${CREAM};
    font-family: 'Atkinson Hyperlegible', sans-serif;
    color: #1A1A2E;
  }

  @keyframes floatUp  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes fadeSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes waveIn   { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
  @keyframes recordPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 70%{box-shadow:0 0 0 10px rgba(239,68,68,0)} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }

  .float  { animation: floatUp 4s ease-in-out infinite; }
  .float2 { animation: floatUp 5.5s ease-in-out infinite 1s; }
  .fade-in   { animation: fadeSlideUp 0.7s ease both; }
  .fade-in-1 { animation: fadeSlideUp 0.7s ease 0.1s both; }
  .fade-in-2 { animation: fadeSlideUp 0.7s ease 0.25s both; }
  .fade-in-3 { animation: fadeSlideUp 0.7s ease 0.4s both; }
  .fade-in-4 { animation: fadeSlideUp 0.7s ease 0.55s both; }
  .pulse-btn:hover { animation: pulse 0.6s ease; }

  .feature-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .feature-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(29,158,117,0.12); }

  ::-webkit-scrollbar       { width: 6px; }
  ::-webkit-scrollbar-track { background: ${CREAM}; }
  ::-webkit-scrollbar-thumb { background: ${TEAL}; border-radius: 3px; }

  /* ── Quill overrides ── */
  .editor-quill-wrapper .ql-toolbar.ql-snow {
    border: none;
    border-bottom: 2px solid rgba(29,158,117,0.15);
    padding: 10px 16px;
    background: rgba(255,255,255,0.6);
    border-radius: 16px 16px 0 0;
    font-family: 'Nunito', sans-serif;
  }
  .editor-quill-wrapper .ql-container.ql-snow {
    border: none;
    border-radius: 0 0 16px 16px;
    font-family: 'Atkinson Hyperlegible', sans-serif;
    font-size: 17px;
    line-height: 1.75;
    background: rgba(255,255,255,0.85);
    min-height: 220px;
  }
  .editor-quill-wrapper .ql-editor {
    min-height: 200px;
    padding: 20px 24px;
    color: #1A1A2E;
  }
  .editor-quill-wrapper .ql-editor.ql-blank::before {
    color: #a1aab8;
    font-style: italic;
    font-size: 16px;
  }
  .editor-quill-wrapper .ql-toolbar .ql-stroke { stroke: #4a5568; }
  .editor-quill-wrapper .ql-toolbar .ql-fill   { fill:   #4a5568; }
  .editor-quill-wrapper .ql-toolbar button:hover .ql-stroke { stroke: ${TEAL}; }
  .editor-quill-wrapper .ql-toolbar button:hover .ql-fill   { fill:   ${TEAL}; }
  .editor-quill-wrapper .ql-toolbar button.ql-active .ql-stroke { stroke: ${TEAL}; }

  /* ── Lang buttons ── */
  .lang-btn {
    padding: 6px 14px;
    border: 2px solid transparent;
    border-radius: 24px;
    font-size: 13px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #eef2f7;
    color: #4a5568;
  }
  .lang-btn:hover  { border-color: ${TEAL}; color: ${TEAL}; background: #fff; }
  .lang-btn.active { background: ${TEAL}; color: #fff; border-color: ${TEAL}; }

  /* ── TTS buttons ── */
  .tts-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .tts-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.13); }
  .tts-btn:active { transform: translateY(0); }
  .tts-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .tts-btn.btn-mic         { background: #10b981; color: #fff; }
  .tts-btn.btn-mic.rec     { background: #ef4444; color: #fff; animation: recordPulse 1.5s infinite; }
  .tts-btn.btn-mic.loading { background: #6b7280; color: #fff; }
  .tts-btn.btn-speak       { background: ${TEAL}; color: #fff; }
  .tts-btn.btn-stop        { background: #dc2626; color: #fff; }
  .tts-btn.btn-auto-on     { background: #16a34a; color: #fff; }
  .tts-btn.btn-auto-off    { background: #9ca3af; color: #fff; }
  .tts-btn.btn-settings    { background: #fff; color: #374151; border: 2px solid #e2e8f0; box-shadow: none; }
  .tts-btn.btn-settings:hover:not(:disabled) { border-color: ${TEAL}; color: ${TEAL}; }

  /* ── Slider ── */
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e2e8f0;
    outline: none;
    cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: ${TEAL};
    box-shadow: 0 2px 8px rgba(29,158,117,0.35);
    transition: transform 0.15s;
  }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }

  /* ── Grammar popup ── */
  .grammar-popup {
    position: absolute;
    z-index: 8000;
    background: #fff;
    border: 2px solid #ef4444;
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.13);
    padding: 10px;
    min-width: 160px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .grammar-popup-label {
    margin: 0 0 4px;
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
  }
  .grammar-repl-btn {
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 5px 10px;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: #b91c1c;
    font-family: 'Atkinson Hyperlegible', sans-serif;
    transition: background 0.15s;
  }
  .grammar-repl-btn:hover { background: #fee2e2; }
`;
document.head.appendChild(globalStyle);

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_AUDIO = { speed: 1.0, pitch: 1.0, volume: 1.0 };

// ─── Component ────────────────────────────────────────────────────────────────
export default function Editor() {
  const [value, setValue]               = useState('');
  const [plainText, setPlainText]       = useState('');
  const [lastWord, setLastWord]         = useState('');

  // ── cursorBounds est maintenant en coordonnées PAGE (fixed/viewport)
  const [cursorBounds, setCursorBounds] = useState({ top: 0, left: 0, bottom: 0 });

  const [selectedLang, setSelectedLang] = useState(null);
  const [ttsLoading, setTtsLoading]     = useState(false);
  const [ttsError, setTtsError]         = useState('');
  const [audio, setAudio]               = useState(DEFAULT_AUDIO);
  const [isPanelOpen, setIsPanelOpen]   = useState(false);
  const [autoRead, setAutoRead]         = useState(true);

  const audioRef   = useRef(null);
  const quillRef   = useRef(null);
  const editorCardRef = useRef(null); // ← référence sur la carte éditeur

  const [grammarErrors, setGrammarErrors]   = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(null);
  const debounceLT = useRef(null);

  const [isRecording, setIsRecording]       = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);

  // ── STT ──────────────────────────────────────────────────────────────────────
  const handleMicrophone = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          if (selectedLang) formData.append('language', selectedLang);
          formData.append('audio', audioBlob, 'recording.webm');
          const response = await axios.post('http://localhost:3001/stt/transcribe', formData);
          if (response.data?.text?.trim()) {
            const editor = quillRef.current?.getEditor();
            if (editor) {
              const sel = editor.getSelection();
              const idx = sel ? sel.index : editor.getLength();
              const txt = response.data.text.trim() + ' ';
              editor.insertText(idx, txt);
              editor.setSelection(idx + txt.length);
            }
          }
        } catch { setTtsError('Erreur STT : Impossible de transcrire'); }
        finally   { setIsTranscribing(false); }
      };
      mediaRecorder.start();
      setIsRecording(true);
      setTtsError('');
    } catch { setTtsError("Accès impossible au microphone"); }
  };

  // ── LanguageTool ─────────────────────────────────────────────────────────────
  const fetchLanguageToolErrors = useCallback(async (text, lang) => {
    if (!text || text.trim().length < 3) { setGrammarErrors([]); return; }
    try {
      const { data } = await axios.post('http://localhost:3001/correction/languagetool', {
        text: text.trim(), lang: lang || 'fr'
      });
      setGrammarErrors(data);
    } catch { console.error('[LanguageTool] erreur'); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceLT.current);
    debounceLT.current = setTimeout(() => fetchLanguageToolErrors(plainText, selectedLang), 1000);
    return () => clearTimeout(debounceLT.current);
  }, [plainText, selectedLang, fetchLanguageToolErrors]);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    editor.formatText(0, editor.getLength(), 'color', false);
    editor.formatText(0, editor.getLength(), 'underline', false);
    grammarErrors.forEach(err => {
      editor.formatText(err.offset, err.length, 'color', '#ef4444');
      editor.formatText(err.offset, err.length, 'underline', true);
    });
  }, [grammarErrors]);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const handleClick = () => {
      const sel = editor.getSelection();
      if (!sel) return;
      const found = grammarErrors.find(e => sel.index >= e.offset && sel.index <= e.offset + e.length);
      if (found?.replacements?.length > 0) {
        try {
          const b = editor.getBounds(found.offset, found.length);
          setShowErrorPopup({ error: found, top: b.top + b.height + 10, left: b.left });
        } catch { setShowErrorPopup(null); }
      } else { setShowErrorPopup(null); }
    };
    editor.root.addEventListener('click', handleClick);
    return () => editor.root.removeEventListener('click', handleClick);
  }, [grammarErrors]);

  const applyGrammarCorrection = (err, replacement) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    editor.deleteText(err.offset, err.length);
    editor.insertText(err.offset, replacement);
    setShowErrorPopup(null);
    setPlainText(editor.getText().trim());
  };

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speakWord = useCallback(async (wordText) => {
    if (!wordText?.trim()) return;
    setTtsError(''); setTtsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wordText.trim(), lang: selectedLang ?? 'en',
          speed: audio.speed, pitch: audio.pitch, volume: audio.volume,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); }
      const player = new Audio(url);
      player.volume = Math.min(1.0, audio.volume);
      audioRef.current = player;
      await player.play();
    } catch { setTtsError('❌ Lecture échouée'); }
    finally   { setTtsLoading(false); }
  }, [selectedLang, audio]);

  // ── handleChange : cursorBounds en coordonnées PAGE absolues ─────────────────
  const handleChange = useCallback((content, delta, source, editor) => {
    setValue(content);
    const fullText = editor.getText().replace(/\n$/, '');
    setPlainText(fullText);
    const match = fullText.match(/([^\s]+)$/);
    setLastWord(match ? match[1] : '');
    if (source !== 'user') return;

    const sel = editor.getSelection();
    if (sel) {
      try {
        // getBounds() retourne des coords relatives au conteneur Quill
        const b = editor.getBounds(sel.index);

        // On récupère la position absolue du conteneur Quill dans la page
        const quillContainer = quillRef.current?.getEditor()?.root;
        if (quillContainer) {
          const rect = quillContainer.getBoundingClientRect();
          // On convertit en coordonnées absolues (scroll inclus)
          setCursorBounds({
            top   : rect.top  + window.scrollY + b.top,
            left  : rect.left + window.scrollX + b.left,
            bottom: rect.top  + window.scrollY + b.top + b.height,
          });
        }
      } catch {}
    }

    const spaceInserted = delta.ops?.some(op => op.insert === ' ');
    if (spaceInserted && autoRead) {
      const words = fullText.split(/\s+/).filter(Boolean);
      if (words.length) speakWord(words[words.length - 1]);
    }
  }, [speakWord, autoRead]);

  const handleSelectWord = useCallback((word) => {
    const editor = quillRef.current.getEditor();
    const sel    = editor.getSelection();
    const idx    = sel ? sel.index : editor.getLength();
    const full   = editor.getText().substring(0, idx);
    const match  = full.match(/([^\s]+)$/);
    if (match) {
      editor.deleteText(idx - match[1].length, match[1].length);
      editor.insertText(idx - match[1].length, word + ' ');
      editor.setSelection(idx - match[1].length + word.length + 1);
    } else {
      editor.insertText(idx, word + ' ');
      editor.setSelection(idx + word.length + 1);
    }
  }, []);

  const handleReplaceText = useCallback((newText) => {
    const editor = quillRef.current?.getEditor();
    if (!editor || !newText) return;
    editor.setText(newText.trim());
    setValue(newText.trim());
    setPlainText(newText.trim());
    setLastWord(newText.trim().split(/\s+/).filter(Boolean).pop() || '');
    editor.setSelection(editor.getLength(), 0);
  }, []);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const handleMouseUp = () => {
      const range = editor.getSelection();
      if (range?.length > 1) {
        const sel = editor.getText(range.index, range.length).trim();
        if (sel) speakWord(sel);
      }
    };
    editor.root.addEventListener('mouseup', handleMouseUp);
    return () => editor.root.removeEventListener('mouseup', handleMouseUp);
  }, [speakWord]);

  const speakText = () => {
    const editor = quillRef.current.getEditor();
    const sel    = editor.getSelection();
    if (!sel?.length) { setTtsError("⚠️ Sélectionnez du texte d'abord"); return; }
    const txt = editor.getText(sel.index, sel.length).trim();
    if (txt) speakWord(txt);
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{
      padding: '2.5rem 2rem',
      maxWidth: '860px',
      margin: '0 auto',
      fontFamily: "'Atkinson Hyperlegible', sans-serif",
    }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="fade-in-1" style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', flexWrap: 'wrap',
        gap: 16, marginBottom: 28,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `linear-gradient(135deg, ${TEAL}, #0d9488)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: `0 4px 14px rgba(29,158,117,0.35)`,
            }}>🗣️</div>
            <h1 style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 24, fontWeight: 900, color: '#1A1A2E', lineHeight: 1.1,
            }}>Aide à la Communication</h1>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', paddingLeft: 54 }}>
            Tapez un mot → prédiction en temps réel · espace = lecture · sélection = lecture
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className={`lang-btn${selectedLang === null ? ' active' : ''}`}
            onClick={() => setSelectedLang(null)}>🌐 Auto</button>
          {LANGUAGES.map(l => (
            <button key={l.code}
              className={`lang-btn${selectedLang === l.code ? ' active' : ''}`}
              onClick={() => setSelectedLang(l.code)}
            >{l.flag} {l.label}</button>
          ))}
        </div>
      </div>

      {/* ── EDITOR CARD ────────────────────────────────── */}
      <div
        ref={editorCardRef}
        className="fade-in-2"
        style={{
          borderRadius: 20,
          boxShadow: '0 4px 32px rgba(29,158,117,0.10), 0 1px 4px rgba(0,0,0,0.06)',
          border: `1.5px solid rgba(29,158,117,0.18)`,
          overflow: 'visible',
          position: 'relative',
          background: '#fff',
        }}
      >
        <div style={{
          height: 4, borderRadius: '20px 20px 0 0',
          background: `linear-gradient(90deg, ${TEAL} 0%, ${AMBER} 60%, #f9a826 100%)`,
        }} />

        <div className="editor-quill-wrapper" style={{ position: 'relative' }}>
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={handleChange}
            theme="snow"
            placeholder="Commencez à écrire ou utilisez la dictée vocale…"
          />

          {/* Grammar popup — z-index 8000, EN DESSOUS du WordPredictor (9999) */}
          {showErrorPopup && (
            <div className="grammar-popup" style={{
              top : showErrorPopup.top,
              left: showErrorPopup.left,
              zIndex: 8000,
            }}>
              <p className="grammar-popup-label">💡 {showErrorPopup.error.message}</p>
              {showErrorPopup.error.replacements.map((repl, i) => (
                <button key={i} className="grammar-repl-btn"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); applyGrammarCorrection(showErrorPopup.error, repl); }}
                >{repl}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── WORD PREDICTOR ─────────────────────────────────────────────────────
          IMPORTANT : positionné ICI, hors du wrapper Quill,
          dans un portail fixe sur document.body via position:fixed.
          Il apparaît TOUJOURS au-dessus du grammar popup (z-index 9999 > 8000)
          et JAMAIS caché par overflow:hidden du wrapper.
      ─────────────────────────────────────────────────────────────────────── */}
      <WordPredictor
        fullText={plainText}
        lastWord={lastWord}
        cursorBounds={cursorBounds}
        lang={selectedLang}
        onSelectWord={handleSelectWord}
        onAudition={speakWord}
        ttsLoading={ttsLoading}
        onReplaceText={handleReplaceText}
      />

      {/* ── ERROR ──────────────────────────────────────── */}
      {ttsError && (
        <div style={{
          marginTop: 10, padding: '10px 16px', borderRadius: 10,
          background: '#fef2f2', border: '1.5px solid #fecaca',
          color: '#dc2626', fontSize: 14, fontWeight: 600,
        }}>{ttsError}</div>
      )}

      {/* ── TTS CONTROLS ───────────────────────────────── */}
      <div className="fade-in-3" style={{
        display: 'flex', gap: 10, marginTop: 20,
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <button onClick={handleMicrophone} disabled={isTranscribing}
          className={`tts-btn btn-mic${isTranscribing ? ' loading' : isRecording ? ' rec' : ''}`}>
          {isTranscribing ? <><SpinnerIcon /> Transcription…</> : isRecording ? '🛑 Stopper' : '🎙️ Dictée vocale'}
        </button>
        <button onClick={speakText} disabled={ttsLoading} className="tts-btn btn-speak">
          {ttsLoading ? <><SpinnerIcon /> Lecture…</> : '🔊 Lire la sélection'}
        </button>
        <button onClick={stopAudio} className="tts-btn btn-stop">⏹ Stop</button>
        <button onClick={() => setAutoRead(p => !p)}
          className={`tts-btn ${autoRead ? 'btn-auto-on' : 'btn-auto-off'}`}>
          {autoRead ? '🔊 Auto : ON' : '🔇 Auto : OFF'}
        </button>
        <button onClick={() => setIsPanelOpen(p => !p)}
          className="tts-btn btn-settings" style={{ marginLeft: 'auto' }}>
          🎛️ {isPanelOpen ? 'Fermer' : 'Paramètres'}
        </button>
      </div>

      {/* ── VOICE SETTINGS ─────────────────────────────── */}
      {isPanelOpen && (
        <div className="fade-in" style={{
          marginTop: 14, padding: '22px 24px', background: '#fff',
          border: `1.5px solid rgba(29,158,117,0.18)`, borderRadius: 16,
          boxShadow: '0 4px 20px rgba(29,158,117,0.08)',
        }}>
          <h3 style={{
            fontFamily: "'Nunito', sans-serif", fontWeight: 800,
            fontSize: 16, color: '#1e293b', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>🎛️ Paramètres de la voix</h3>
          <SliderRow label="🏃 Vitesse" value={audio.speed} display={`${audio.speed.toFixed(1)}×`}
            min={0.5} max={2.0} step={0.1} onChange={v => setAudio(a => ({ ...a, speed: v }))} />
          <SliderRow label="🎵 Tonalité" value={audio.pitch} display={audio.pitch.toFixed(1)}
            min={0.5} max={2.0} step={0.1} onChange={v => setAudio(a => ({ ...a, pitch: v }))} />
          <SliderRow label="🔈 Volume" value={audio.volume} display={`${Math.round(audio.volume * 100)}%`}
            min={0.1} max={1.0} step={0.05} onChange={v => setAudio(a => ({ ...a, volume: v }))} last />
          <button onClick={() => setAudio(DEFAULT_AUDIO)}
            className="tts-btn btn-settings" style={{ marginTop: 14 }}>↺ Réinitialiser</button>
        </div>
      )}

      {/* ── HINT ───────────────────────────────────────── */}
      <p style={{
        marginTop: 18, color: '#94a3b8', fontSize: 12.5,
        textAlign: 'center', letterSpacing: '0.01em',
      }}>
        💡 Espace = lit le mot · Sélection souris = lit la phrase · Clic sur prédiction = audition
      </p>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SliderRow({ label, value, display, min, max, step, onChange, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 8,
        fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700, color: '#374151',
      }}>
        <span>{label}</span>
        <span style={{ color: TEAL }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

function SpinnerIcon() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid rgba(255,255,255,0.4)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}