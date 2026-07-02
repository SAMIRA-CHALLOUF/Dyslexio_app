// pages/Editor.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';


import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';
import WordPredictor, { LANGUAGES } from '../components/WordPredictor';
import { TEAL, AMBER, CREAM } from "../constants/colors";


const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:3001';


// ─── Font + Global Styles ─────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

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

  .tts-btn.btn-mic         { background: #16a34a; color: #fff; }
  .tts-btn.btn-mic.rec     { background: #ef4444; color: #fff; animation: recordPulse 1.5s infinite; }
  .tts-btn.btn-mic.loading { background: #6b7280; color: #fff; }
  .tts-btn.btn-speak       { background: #2563eb; color: #fff; }
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

  .grammar-popup.ai-correction {
    border-color: #8b5cf6;
    min-width: 220px;
    max-width: 320px;
  }
  .grammar-popup-type {
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 8px;
    border-radius: 20px;
    background: #ede9fe;
    color: #6d28d9;
    margin-bottom: 6px;
    font-family: 'Nunito', sans-serif;
  }
  .grammar-popup-original {
    font-size: 13px;
    color: #dc2626;
    text-decoration: line-through;
    font-weight: 600;
    margin-right: 6px;
  }
  .grammar-popup-arrow { color: #94a3b8; margin-right: 6px; }
  .grammar-popup-corrected {
    font-size: 13px;
    color: #16a34a;
    font-weight: 700;
  }
  .grammar-repl-btn.ai { background: #f5f3ff; border-color: #ddd6fe; color: #5b21b6; }
  .grammar-repl-btn.ai:hover { background: #ede9fe; }
  .grammar-explanation-text {
    margin: 0 0 8px;
    font-size: 12px;
    line-height: 1.5;
    color: #475569;
    font-family: 'Atkinson Hyperlegible', sans-serif;
  }
  .ai-panel-hint {
    font-size: 11px;
    color: #94a3b8;
    margin: -8px 0 14px;
    font-style: italic;
  }
  .ai-no-change {
    margin: 0;
    font-size: 14px;
    color: #16a34a;
    font-weight: 700;
  }

  .ai-correction-panel {
    margin-top: 14px;
    padding: 18px 20px;
    background: #faf5ff;
    border: 1.5px solid #ddd6fe;
    border-radius: 14px;
    font-family: 'Nunito', sans-serif;
  }
  .ai-correction-panel h4 {
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 800;
    color: #5b21b6;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ai-corrected-preview {
    padding: 12px 14px;
    background: #fff;
    border: 1.5px dashed #c4b5fd;
    border-radius: 10px;
    font-size: 15px;
    line-height: 1.6;
    color: #1A1A2E;
    font-family: 'Atkinson Hyperlegible', sans-serif;
    cursor: pointer;
    margin-bottom: 14px;
    transition: background 0.15s, border-color 0.15s;
  }
  .ai-corrected-preview:hover {
    background: #f5f3ff;
    border-color: #8b5cf6;
  }
  .ai-explanations-title {
    font-size: 12px;
    font-weight: 800;
    color: #7c3aed;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }
  .ai-explanation-item {
    padding: 10px 12px;
    background: #fff;
    border-radius: 10px;
    border-left: 3px solid #8b5cf6;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .ai-explanation-item:last-child { margin-bottom: 0; }
  .ai-explanation-words { margin-bottom: 4px; }
  .ai-explanation-rule {
    font-size: 12px;
    color: #64748b;
    line-height: 1.45;
    font-family: 'Atkinson Hyperlegible', sans-serif;
  }
  .ai-apply-all-btn {
    margin-top: 12px;
    padding: 10px 18px;
    background: #7c3aed;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    transition: background 0.15s, transform 0.15s;
  }
  .ai-apply-all-btn:hover { background: #6d28d9; transform: translateY(-1px); }
  .ai-apply-all-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;
document.head.appendChild(globalStyle);

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_AUDIO = { speed: 1.0, pitch: 1.0, volume: 1.0, voice: 'female' };

const CORRECTION_TYPE_LABELS = {
  orthographe: 'Orthographe',
  grammaire: 'Grammaire',
  conjugaison: 'Conjugaison',
  ponctuation: 'Ponctuation',
  style: 'Style',
  spelling: 'Spelling',
  grammar: 'Grammar',
  punctuation: 'Punctuation',
};

function buildAiGrammarErrors(text, corrections) {
  const newErrors = [];
  let searchStart = 0;
  (corrections || []).forEach((c) => {
    if (!c?.original) return;
    const idx = text.indexOf(c.original, searchStart);
    if (idx === -1) return;
    newErrors.push({
      message: c.rule || c.type || 'Correction suggérée',
      replacements: c.corrected ? [c.corrected] : [],
      offset: idx,
      length: c.original.length,
      source: 'ai',
      type: c.type,
      original: c.original,
      corrected: c.corrected,
      rule: c.rule,
    });
    searchStart = idx + c.original.length;
  });
  return newErrors;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Editor() {
  
  // ── cursorBounds est maintenant en coordonnées PAGE (fixed/viewport)
  const [cursorBounds, setCursorBounds] = useState({ top: 0, left: 0, bottom: 0 });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
const user = auth?.user;
const updateUser = auth?.updateUser;
  const [value, setValue] = useState('');
  const [plainText, setPlainText] = useState('');
  const [lastWord, setLastWord] = useState('');

  // Exam mode detection and timer
  const [isExamMode, setIsExamMode] = useState(false);
  const [remainingSec, setRemainingSec] = useState(0);

  // Manual exam mode for etablissement / client users
  const [isManualExamMode, setIsManualExamMode] = useState(false);
  const [manualExamSec, setManualExamSec] = useState(0);
  const [examDurationSec, setExamDurationSec] = useState(0);   
  const [showExamModal, setShowExamModal] = useState(false);  
  const [examDurationInput, setExamDurationInput] = useState(45); 
  const manualExamTimerRef = useRef(null);

const handleStartManualExam = () => {
  setShowExamModal(true);
};


const handleConfirmExam = (durationMinutes) => {
  const totalSec = durationMinutes * 60;
  setExamDurationSec(totalSec);
  setManualExamSec(totalSec);        
  setIsManualExamMode(true);
  setIsPredictionPanelVisible(true);
  setShowExamModal(false);
  manualExamTimerRef.current = setInterval(() => {
    setManualExamSec(s => {
      if (s <= 1) {
        clearInterval(manualExamTimerRef.current);
        manualExamTimerRef.current = null;
        setIsManualExamMode(false);
        return 0;
      }
      return s - 1;
    });
  }, 1000);
};

  const handleEndManualExam = () => {
    clearInterval(manualExamTimerRef.current);
    manualExamTimerRef.current = null;
    setIsManualExamMode(false);
    setManualExamSec(0);
  };

  useEffect(() => {
    return () => { if (manualExamTimerRef.current) clearInterval(manualExamTimerRef.current); };
  }, []);

  useEffect(() => {
    // Only enable exam mode for students (eleve)
    const localExam = localStorage.getItem('examInProgress') === 'true' ? localStorage.getItem('examEndTime') : null;
    const examSource = user?.examEndTime || localExam;
    if (examSource && user?.typeCompte === 'eleve') {
      const end = new Date(examSource);
      const now = new Date();
      if (now < end) {
        setIsExamMode(true);
        setRemainingSec(Math.max(0, Math.floor((end - now) / 1000)));
        const timer = setInterval(() => {
          const left = Math.max(0, Math.floor((end - new Date()) / 1000));
          setRemainingSec(left);
          if (left <= 0) {
            clearInterval(timer);
            setIsExamMode(false);
          }
        }, 1000);
        return () => clearInterval(timer);
      }
    }
    setIsExamMode(false);
  }, [user]);

  const handleEndExam = async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND}/eleves/${user.id}/exam/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error('Erreur fin d\'examen');
      await res.json();
      // Clear examEndTime in user context
      updateUser({ ...user, examEndTime: null });
      setIsExamMode(false);
    } catch (e) {
      console.error(e);
    }
  };

  const [selectedLang, setSelectedLang] = useState('fr');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [audio, setAudio] = useState(DEFAULT_AUDIO);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [autoRead, setAutoRead] = useState(true);

  const [isPredictionPanelVisible, setIsPredictionPanelVisible] = useState(false);

  const audioRef = useRef(null);
  const stopRequestedRef = useRef(false);
  const quillRef = useRef(null);
  const editorCardRef = useRef(null); // ← référence sur la carte éditeur

  const [grammarErrors, setGrammarErrors] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(null);
  const [correctionSource, setCorrectionSource] = useState('languagetool');
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [aiCorrectionResult, setAiCorrectionResult] = useState(null);
  const [showCorrectionPanel, setShowCorrectionPanel] = useState(false);
  const debounceLT = useRef(null);

  const [isRecording, setIsRecording]       = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const socketRef        = useRef(null);
  const audioContextRef  = useRef(null);
  const processorRef     = useRef(null);

  // ── STT ──────────────────────────────────────────────────────────────────────
  const handleMicrophone = async () => {
    // Stop recording
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      if (socketRef.current) {
        try { socketRef.current.disconnect(); } catch {}
        socketRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    // Start recording and stream chunks to realtime STT via socket.io
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const socket = io(BACKEND, { transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        setTtsError('');
        socket.emit('set_language', selectedLang);
      });

      socket.on('connect_error', (err) => {
        setTtsError(`STT : impossible de se connecter au serveur (${err.message}).`);
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      });

      socket.on('server_error', (msg) => {
        setTtsError(String(msg || 'Erreur serveur STT'));
      });

      socket.on('transcription', ({ text }) => {
        console.log('[STT] transcription finale reçue:', text);
        if (!text?.trim()) return;
        try {
          const editor = quillRef.current?.getEditor();
          if (!editor) return;
          editor.focus();
          const sel = editor.getSelection();
          const idx = sel ? sel.index : editor.getLength() - 1;
          const txt = text.trim() + ' ';
          editor.insertText(idx, txt);
          editor.setSelection(idx + txt.length);
          setPlainText(editor.getText().replace(/\n$/, ''));
        } catch (e) {
          console.error('[STT] insertion error:', e);
        }
      });

      // Résultat partiel — affiche dans la console pour debug
      socket.on('transcription_partial', ({ text }) => {
        console.log('[STT] partiel:', text);
      });

      socket.on('disconnect', (reason) => {
        if (reason !== 'io client disconnect') {
          setTtsError(`STT déconnecté : ${reason}`);
        }
        setIsRecording(false);
        setIsTranscribing(false);
      });

      // ── PCM 16-bit 16kHz via AudioWorklet → AssemblyAI v3 ──────────────────
      // AssemblyAI v3 exige du PCM brut (16-bit little-endian, 16kHz, mono).
      // MediaRecorder produit du WebM/Opus → incompatible. On utilise un
      // ScriptProcessor (compatible tous navigateurs) pour extraire les samples.

      const TARGET_SAMPLE_RATE = 16000;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: TARGET_SAMPLE_RATE,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // ScriptProcessor : 4096 samples (~256ms à 16kHz), mono
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!socketRef.current?.connected) return;

        // Float32 → Int16 PCM
        const float32 = e.inputBuffer.getChannelData(0);
        const int16    = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        try {
          // Envoi en ArrayBuffer — socket.io le transmet en binaire natif
          socketRef.current.emit('audio_chunk', int16.buffer);
        } catch (err) {
          console.error('[STT] chunk send error:', err);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Cleanup sur stop
      mediaRecorderRef.current = {
        stop: () => {
          try { processor.disconnect(); source.disconnect(); } catch {}
          try { audioContext.close(); } catch {}
          stream.getTracks().forEach(t => t.stop());
          setIsTranscribing(true);
          setTimeout(() => setIsTranscribing(false), 1500);
        },
        state: 'recording',
      };

      setIsRecording(true);
      setTtsError('');
    } catch (err) {
      const msg = err?.name === 'NotAllowedError'
        ? "Microphone refusé — autorisez l'accès dans les paramètres du navigateur."
        : "Accès impossible au microphone.";
      setTtsError(msg);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try { if (processorRef.current) processorRef.current.disconnect(); } catch {}
      try { if (audioContextRef.current) audioContextRef.current.close(); } catch {}
      try { if (mediaRecorderRef.current) mediaRecorderRef.current.stop(); } catch {}
      try { if (socketRef.current) socketRef.current.disconnect(); } catch {}
    };
  }, []);

  // Update socket language when lang changes mid-session
  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('set_language', lang);
    }
  };

  // ── LanguageTool ─────────────────────────────────────────────────────────────
  const fetchLanguageToolErrors = useCallback(async (text, lang) => {
    if (!text || text.trim().length < 3) { setGrammarErrors([]); return; }
    try {
      const { data } = await axios.post(`${BACKEND}/correction/languagetool`, {
        text: text.trim(), lang: lang || 'fr'
      });
      if (correctionSource === 'ai') return;
      setGrammarErrors((data || []).map((e) => ({ ...e, source: 'languagetool' })));
    } catch { console.error('[LanguageTool] erreur'); }
  }, [correctionSource]);

  const handleContextualCorrection = async () => {
    const text = plainText?.trim() || '';
    if (text.length < 3) {
      setTtsError('Écrivez au moins quelques mots pour lancer la correction.');
      return;
    }
    setIsCorrecting(true);
    setTtsError('');
    setShowCorrectionPanel(false);
    setAiCorrectionResult(null);
    try {
      const { data } = await axios.post(`${BACKEND}/correction`, {
        text,
        lang: selectedLang || 'fr',
      });
      if (data?.error) {
        setTtsError(data.error);
        return;
      }
      setAiCorrectionResult(data);
      setShowCorrectionPanel(true);
      setCorrectionSource('ai');
      if (data.corrections?.length > 0) {
        setGrammarErrors(buildAiGrammarErrors(text, data.corrections));
      } else {
        setGrammarErrors([]);
      }
    } catch (e) {
      console.error('[ContextualCorrection] erreur', e);
      setTtsError('Service de correction indisponible. Vérifiez qu\'Ollama (Mistral) est lancé.');
    } finally {
      setIsCorrecting(false);
    }
  };

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
      const color = err.source === 'ai' ? '#7c3aed' : '#ef4444';
      editor.formatText(err.offset, err.length, 'color', color);
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
    const updatedText = editor.getText().replace(/\n$/, '');
    setPlainText(updatedText);
    setValue(editor.root.innerHTML);
    setGrammarErrors((prev) =>
      prev
        .filter((e) => e.offset !== err.offset || e.length !== err.length)
        .map((e) =>
          e.offset > err.offset
            ? { ...e, offset: e.offset + replacement.length - err.length }
            : e,
        ),
    );
  };

  // ── TTS ──────────────────────────────────────────────────────────────────────
  // voiceOverride permet de forcer une voix précise (utilisé par le mode dialogue multi-voix)
  const speakWord = useCallback(async (wordText, voiceOverride) => {
    if (!wordText?.trim()) return;
    setTtsError(''); setTtsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wordText.trim(), lang: selectedLang ?? 'en',
          speed: audio.speed, pitch: audio.pitch, volume: audio.volume,
          voice: voiceOverride || audio.voice,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); }
      const player = new Audio(url);
      player.volume = Math.min(1.0, audio.volume);
      audioRef.current = player;
      // On attend la fin réelle de la lecture (nécessaire pour enchaîner les répliques d'un dialogue dans l'ordre)
      await new Promise((resolve) => {
        player.onended = resolve;
        player.onerror = resolve;
        player.play().catch(resolve);
      });
    } catch { setTtsError('❌ Lecture échouée'); }
    finally { setTtsLoading(false); }
  }, [selectedLang, audio]);

  // ── Détection de dialogue ("Nom : texte Nom2 : texte ...") ───────────────────
  // Renvoie null si ce n'est pas un dialogue, sinon { segments, speakers }
  const parseDialogue = useCallback((text) => {
    // Capture des étiquettes du type "Marco :" ou "Sara :" (1 mot capitalisé suivi de ":")
    const regex = /([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’-]{1,24})\s*:\s*/g;
    const matches = [...text.matchAll(regex)];
    if (matches.length < 2) return null;

    const segments = [];
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const speaker = m[1];
      const start = m.index + m[0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const segText = text.slice(start, end).trim();
      if (segText) segments.push({ speaker, text: segText });
    }

    // On vérifie qu'il y a bien au moins 2 interlocuteurs différents
    // ET qu'au moins l'un d'eux parle plusieurs fois (= vraie alternance, pas juste un "Note :" isolé)
    const counts = {};
    segments.forEach((s) => { counts[s.speaker] = (counts[s.speaker] || 0) + 1; });
    const uniqueSpeakers = Object.keys(counts);
    const isRealDialogue = uniqueSpeakers.length >= 2 && Object.values(counts).some((c) => c >= 2);
    if (!isRealDialogue) return null;

    return { segments, speakers: uniqueSpeakers };
  }, []);

  // Attribue une voix alternée (homme/femme) à chaque interlocuteur, par ordre d'apparition
  const assignDialogueVoices = useCallback((speakers) => {
    const voices = ['male', 'female'];
    const map = {};
    speakers.forEach((sp, idx) => { map[sp] = voices[idx % 2]; });
    return map;
  }, []);

  // Lecture "intelligente" : détecte automatiquement si c'est un dialogue (2 voix) ou un texte normal (1 voix)
  const speakSmart = useCallback(async (text) => {
    if (!text?.trim()) return;
    stopRequestedRef.current = false;
    const dialogue = parseDialogue(text);
    if (dialogue) {
      const voiceMap = assignDialogueVoices(dialogue.speakers);
      for (const seg of dialogue.segments) {
        if (stopRequestedRef.current) break;
        await speakWord(seg.text, voiceMap[seg.speaker]);
      }
    } else {
      await speakWord(text);
    }
  }, [speakWord, parseDialogue, assignDialogueVoices]);

  // ── handleChange : cursorBounds en coordonnées PAGE absolues ─────────────────
  const handleChange = useCallback((content, delta, source, editor) => {
    setValue(content);
    const fullText = editor.getText().replace(/\n$/, '');
    setPlainText(fullText);
    const match = fullText.match(/([^\s]+)$/);
    setLastWord(match ? match[1] : '');
    if (source !== 'user') return;

    if (correctionSource === 'ai') {
      setCorrectionSource('languagetool');
      setShowCorrectionPanel(false);
      setAiCorrectionResult(null);
    }

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
            top: rect.top + window.scrollY + b.top,
            left: rect.left + window.scrollX + b.left,
            bottom: rect.top + window.scrollY + b.top + b.height,
          });
        }
      } catch { }
    }

    const spaceInserted = delta.ops?.some(op => op.insert === ' ');
    if (spaceInserted && autoRead) {
      const words = fullText.split(/\s+/).filter(Boolean);
      if (words.length) speakWord(words[words.length - 1]);
    }
  }, [speakWord, autoRead, correctionSource]);

  const handleSelectWord = useCallback((word) => {
    const editor = quillRef.current.getEditor();
    const sel = editor.getSelection();
    const idx = sel ? sel.index : editor.getLength();
    const full = editor.getText().substring(0, idx);
    const match = full.match(/([^\s]+)$/);
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

  const applyAllAiCorrections = useCallback(() => {
    if (!aiCorrectionResult?.correctedText) return;
    handleReplaceText(aiCorrectionResult.correctedText);
    setShowCorrectionPanel(false);
    setAiCorrectionResult(null);
    setGrammarErrors([]);
    setShowErrorPopup(null);
    setCorrectionSource('languagetool');
  }, [aiCorrectionResult, handleReplaceText]);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const handleMouseUp = () => {
      const range = editor.getSelection();
      if (range?.length > 1) {
        const sel = editor.getText(range.index, range.length).trim();
        if (sel) speakSmart(sel);
      }
    };
    editor.root.addEventListener('mouseup', handleMouseUp);
    return () => editor.root.removeEventListener('mouseup', handleMouseUp);
  }, [speakSmart]);

  const speakText = () => {
    const editor = quillRef.current.getEditor();
    const sel = editor.getSelection();
    if (!sel?.length) { setTtsError("⚠️ Sélectionnez du texte d'abord"); return; }
    const txt = editor.getText(sel.index, sel.length).trim();
    if (txt) speakSmart(txt);
  };

  const stopAudio = () => {
    stopRequestedRef.current = true;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--bg-primary, #f0f2f5)',
      transition: 'background-color 0.3s ease',
    }}>
      {showExamModal && (
  <ExamDurationModal
    onConfirm={handleConfirmExam}
    onCancel={() => setShowExamModal(false)}
    defaultMinutes={examDurationInput}
    onChangeDefault={setExamDurationInput}
  />
)}
      {/* ══ CADRE NOIR ══ */}
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: '1200px',
        background: 'var(--card-bg, #fff)',
        border: '3px solid var(--border-color, #111)',
        borderRadius: 8,
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px',
        padding: '2.5rem 2rem',
        fontFamily: 'var(--font-family)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
      }}
      >

        {/* ── RETOUR À L'ACCUEIL ────────────────────────── */}
        <button
          onClick={() => navigate('/')}
          className="fade-in-1"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: '50%',
            background: '#1d9e75', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            marginBottom: 20,
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,163,74,0.5)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.35)'; }}
          title="Retour à l'accueil"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M11 18l-6-6 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

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
              }}>{t('editor.title', 'Aide à la Communication')}</h1>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', paddingLeft: 54 }}>
              {t('editor.hintShort', 'Tapez un mot → prédiction en temps réel · espace = lecture · sélection = lecture')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {LANGUAGES.map(l => (
              <button key={l.code}
                className={`lang-btn${selectedLang === l.code ? ' active' : ''}`}
                onClick={() => handleLangChange(l.code)}
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

              placeholder={t('editor.quillPlaceholder', 'Commencez à écrire ou utilisez la dictée vocale…')}
            />

            {/* Grammar popup — z-index 8000, EN DESSOUS du WordPredictor (9999) */}
            {showErrorPopup && (
              <div
                className={`grammar-popup${showErrorPopup.error.source === 'ai' ? ' ai-correction' : ''}`}
                style={{
                  top: showErrorPopup.top,
                  left: showErrorPopup.left,
                  zIndex: 8000,
                }}>
                {showErrorPopup.error.source === 'ai' ? (
                  <>
                    {showErrorPopup.error.type && (
                      <span className="grammar-popup-type">
                        {CORRECTION_TYPE_LABELS[showErrorPopup.error.type] || showErrorPopup.error.type}
                      </span>
                    )}
                    <div className="grammar-popup-words">
                      <span className="grammar-popup-original">{showErrorPopup.error.original}</span>
                      <span className="grammar-popup-arrow">→</span>
                      <span className="grammar-popup-corrected">
                        {showErrorPopup.error.corrected || showErrorPopup.error.replacements[0]}
                      </span>
                    </div>
                    <p className="grammar-explanation-text">
                      {showErrorPopup.error.rule || showErrorPopup.error.message}
                    </p>
                    <button
                      className="grammar-repl-btn ai"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        applyGrammarCorrection(
                          showErrorPopup.error,
                          showErrorPopup.error.corrected || showErrorPopup.error.replacements[0],
                        );
                      }}
                    >
                      Appliquer cette correction
                    </button>
                  </>
                ) : (
                  <>
                    <p className="grammar-popup-label">💡 {showErrorPopup.error.message}</p>
                    {showErrorPopup.error.replacements.map((repl, i) => (
                      <button
                        key={i}
                        className="grammar-repl-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          applyGrammarCorrection(showErrorPopup.error, repl);
                        }}
                      >
                        {repl}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Barre d'état ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '7px 16px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
            color: '#64748b', borderRadius: '0 0 20px 20px',
          }}>
            <span style={{ background: TEAL, color: '#fff', padding: '1px 8px', borderRadius: 20, fontSize: 11 }}>
              {selectedLang.toUpperCase()}
            </span>
            <span>{t('editor.stats.words', 'Mots :')} <strong style={{ color: '#1A1A2E' }}>{plainText.split(/\s+/).filter(Boolean).length}</strong></span>
            <span>{t('editor.stats.chars', 'Caractères :')} <strong style={{ color: '#1A1A2E' }}>{plainText.length}</strong></span>
            <span style={{ color: grammarErrors.length > 0 ? '#dc2626' : '#16a34a' }}>
              {grammarErrors.length > 0 ? `⚠ ${grammarErrors.length} ${t('editor.stats.corrections', 'correction(s)')}` : `✓ ${t('editor.stats.noErrors', 'Aucune erreur')}`}
            </span>
          </div>
        </div>
        {(!isExamMode && isPredictionPanelVisible) || isManualExamMode ? (
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
        ) : null}

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
          <button onClick={handleMicrophone} disabled={isTranscribing || isExamMode || isManualExamMode}
            className={`tts-btn btn-mic${isTranscribing ? ' loading' : isRecording ? ' rec' : ''}`}>
            {(isExamMode || isManualExamMode) ? t('editor.tts.disabled', 'Bouton désactivé en mode examen') : (isTranscribing ? <><SpinnerIcon /> {t('editor.tts.transcription', 'Transcription…')}</> : isRecording ? t('editor.tts.recordingStop', '🛑 Stopper') : t('editor.tts.dictation', '🎙️ Dictée vocale'))}
          </button>
          <button onClick={speakText} disabled={ttsLoading || isExamMode || isManualExamMode} className="tts-btn btn-speak">
            {(isExamMode || isManualExamMode) ? t('editor.tts.disabled', 'Bouton désactivé en mode examen') : (ttsLoading ? <><SpinnerIcon /> {t('editor.tts.reading', 'Lecture…')}</> : t('editor.tts.readSelection', '🔊 Lire la sélection'))}
          </button>
          <button
            onClick={handleContextualCorrection}
            disabled={isCorrecting || !plainText.trim() || isExamMode || isManualExamMode}
            className="tts-btn btn-speak"
            style={{ background: '#8b5cf6' }}
          >
            {(isExamMode || isManualExamMode) ? t('editor.tts.disabled', 'Bouton désactivé en mode examen') : (isCorrecting ? <><SpinnerIcon /> {t('editor.ai.analyzing', 'Analyse en cours…')}</> : t('editor.ai.button', '✨ Correction intelligente'))}
          </button>
          <button onClick={stopAudio} disabled={isManualExamMode} className="tts-btn btn-stop">{t('editor.tts.stop', '⏹ Stop')}</button>
          <button onClick={() => setAutoRead(p => !p)} disabled={isManualExamMode}
            className={`tts-btn ${autoRead ? 'btn-auto-on' : 'btn-auto-off'}`}>
            {autoRead ? t('editor.tts.autoOn', '🔊 Auto : ON') : t('editor.tts.autoOff', '🔇 Auto : OFF')}
          </button>
          <button onClick={() => !isManualExamMode && setIsPanelOpen(p => !p)} disabled={isManualExamMode}
            className="tts-btn btn-settings" style={{ marginLeft: 'auto' }}>
            🎛️ {isPanelOpen ? t('editor.settings.close', 'Fermer') : t('editor.settings.title', 'Paramètres')}
          </button>
          <button onClick={() => !isManualExamMode && setIsPredictionPanelVisible(p => !p)}
            className="tts-btn btn-settings" disabled={isManualExamMode}>
            {isPredictionPanelVisible ? t('editor.ai.hidePredictions', 'Masquer les prédictions') : t('editor.ai.showPredictions', 'Afficher les prédictions')}
          </button>

          {/* ── Mode Examen button for etablissement / client ── */}
          {!isManualExamMode && (
            <button
              onClick={handleStartManualExam}
              className="tts-btn"
              style={{ background: '#f59e0b', color: '#fff', fontWeight: 800 }}
            >
              📝 Mode Examen
            </button>
          )}
        </div>

        {/* ── Chronometer bar for manual exam mode ── */}
        {isManualExamMode && (
          <div className="fade-in" style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
            border: '2px solid #f59e0b',
            borderRadius: 14,
            fontFamily: "'Nunito', sans-serif",
          }}>
            <span style={{ fontSize: 20 }}>📝</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#92400e' }}>Mode Examen</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fff', border: '1.5px solid #fcd34d',
              borderRadius: 10, padding: '4px 14px',
              fontWeight: 800, fontSize: 17, color: '#b45309',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
            }}>
            ⏱ {String(Math.floor(manualExamSec / 3600)).padStart(2, '0')}:{String(Math.floor((manualExamSec % 3600) / 60)).padStart(2, '0')}:{String(manualExamSec % 60).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 13, color: '#92400e', fontStyle: 'italic' }}>
              Seule la prédiction est disponible
            </span>
            <button
              onClick={handleEndManualExam}
              className="tts-btn"
              style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontWeight: 800 }}
            >
              🏁 Fin d'examen
            </button>
          </div>
        )}

        {/* Exam Mode Overlay */}
        {isExamMode && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            zIndex: 2000,
          }}>
            <h2 style={{ marginBottom: 20, fontSize: 24 }}>Mode Examen</h2>
            <p style={{ marginBottom: 10 }}>Temps restant: {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}</p>
            <button onClick={handleEndExam} style={{ padding: '10px 20px', background: '#ff5555', border: 'none', borderRadius: 6, color: '#fff' }}>Fin d'examen</button>
          </div>
        )}

        {/* ── PANNEAU CORRECTION INTELLIGENTE ─────────────── */}
        {showCorrectionPanel && aiCorrectionResult && (
          <div className="ai-correction-panel fade-in">
            <h4>{t('editor.ai.button', '✨ Correction intelligente')}</h4>
            {(aiCorrectionResult.changed || aiCorrectionResult.corrections?.length > 0) ? (
              <>
                <p className="ai-explanations-title">{t('editor.ai.correctedText', 'Texte corrigé')}</p>
                <div
                  className="ai-corrected-preview"
                  onClick={applyAllAiCorrections}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && applyAllAiCorrections()}
                >
                  {aiCorrectionResult.correctedText}
                </div>
                <p className="ai-panel-hint">{t('editor.ai.clickToApply', 'Cliquez sur le texte pour appliquer toutes les corrections')}</p>
                {aiCorrectionResult.corrections?.length > 0 && (
                  <>
                    <p className="ai-explanations-title">{t('editor.ai.explanations', '')}</p>
                    {aiCorrectionResult.corrections.map((c, i) => (
                      <div key={i} className="ai-explanation-item">
                        <div className="ai-explanation-words">
                          {c.type && (
                            <span className="grammar-popup-type" style={{ marginRight: 8 }}>
                              {CORRECTION_TYPE_LABELS[c.type] || c.type}
                            </span>
                          )}
                          <span className="grammar-popup-original">{c.original}</span>
                          <span className="grammar-popup-arrow"> → </span>
                          <span className="grammar-popup-corrected">{c.corrected}</span>
                        </div>
                        {c.rule && <p className="ai-explanation-rule">{c.rule}</p>}
                      </div>
                    ))}
                  </>
                )}
                <button
                  type="button"
                  className="ai-apply-all-btn"
                  onClick={applyAllAiCorrections}
                  disabled={isCorrecting}
                >
                  {t('editor.ai.applyAll', 'Appliquer toutes les corrections')}
                </button>
              </>
            ) : (
              <p className="ai-no-change">{t('editor.ai.noChange', '✓ Votre texte est correct — aucune modification nécessaire.')}</p>
            )}
          </div>
        )}

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
            }}>{t('editor.voiceSettings.title', '🎛️ Paramètres de la voix')}</h3>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: '#334155', fontSize: 13, marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontFamily: "'Nunito', sans-serif" }}>
                <span>{t('editor.voiceSettings.voice', '🗣️ Voix')}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setAudio(a => ({ ...a, voice: 'female' }))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${audio.voice === 'female' ? '#1D9E75' : '#cbd5e1'}`,
                    background: audio.voice === 'female' ? 'rgba(29,158,117,0.1)' : '#fff',
                    color: audio.voice === 'female' ? '#1D9E75' : '#64748b',
                    fontWeight: audio.voice === 'female' ? 700 : 600,
                    fontSize: 13, fontFamily: "'Nunito', sans-serif",
                    transition: 'all 0.2s'
                  }}
                >{t('editor.voiceSettings.female', '👩 Femme')}</button>
                <button
                  onClick={() => setAudio(a => ({ ...a, voice: 'male' }))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${audio.voice === 'male' ? '#1D9E75' : '#cbd5e1'}`,
                    background: audio.voice === 'male' ? 'rgba(29,158,117,0.1)' : '#fff',
                    color: audio.voice === 'male' ? '#1D9E75' : '#64748b',
                    fontWeight: audio.voice === 'male' ? 700 : 600,
                    fontSize: 13, fontFamily: "'Nunito', sans-serif",
                    transition: 'all 0.2s'
                  }}
                >{t('editor.voiceSettings.male', '👨 Homme')}</button>
              </div>
            </div>

            <SliderRow label={t('editor.voiceSettings.speed', '🏃 Vitesse')} value={audio.speed} display={`${audio.speed.toFixed(1)}×`}
              min={0.5} max={2.0} step={0.1} onChange={v => setAudio(a => ({ ...a, speed: v }))} />
            <SliderRow label={t('editor.voiceSettings.pitch', '🎵 Tonalité')} value={audio.pitch} display={audio.pitch.toFixed(1)}
              min={0.5} max={2.0} step={0.1} onChange={v => setAudio(a => ({ ...a, pitch: v }))} />
            <SliderRow label={t('editor.voiceSettings.volume', '🔈 Volume')} value={audio.volume} display={`${Math.round(audio.volume * 100)}%`}
              min={0.1} max={1.0} step={0.05} onChange={v => setAudio(a => ({ ...a, volume: v }))} last />
            <button onClick={() => setAudio(DEFAULT_AUDIO)}
              className="tts-btn btn-settings" style={{ marginTop: 14 }}>{t('editor.voiceSettings.reset', '↺ Réinitialiser')}</button>
          </div>
        )}

        {/* ── HINT ───────────────────────────────────────── */}
        <p style={{
          marginTop: 18, color: '#94a3b8', fontSize: 12.5,
          textAlign: 'center', letterSpacing: '0.01em',
        }}>
          {t('editor.hint', '💡 Espace = lit le mot · Sélection souris = lit la phrase · Clic sur prédiction = audition')}
        </p>
      </div>{/* fin cadre noir */}
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
function ExamDurationModal({ onConfirm, onCancel, defaultMinutes, onChangeDefault }) {
  const PRESETS = [15, 30, 45, 60, 90, 120];
  const [selected, setSelected] = useState(defaultMinutes);
  const [custom, setCustom] = useState('');

  const effectiveMin = custom ? parseInt(custom) || 0 : selected;

  const h = String(Math.floor(effectiveMin / 60)).padStart(2, '0');
  const m = String(effectiveMin % 60).padStart(2, '0');

  const handlePreset = (min) => {
    setSelected(min);
    setCustom('');
    onChangeDefault(min);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '2rem',
        width: '100%', maxWidth: 420, margin: '0 1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        fontFamily: "'Nunito', sans-serif",
      }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 8 }}>
          📝 Mode examen
        </h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: 13, color: '#64748b' }}>
          Choisissez la durée de l'examen avant de démarrer.
        </p>

        {/* Préréglages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1.5rem' }}>
          {PRESETS.map(min => (
            <button key={min}
              onClick={() => handlePreset(min)}
              style={{
                padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                border: selected === min && !custom ? '2px solid #1D9E75' : '1.5px solid #e2e8f0',
                background: selected === min && !custom ? '#E1F5EE' : '#fff',
                color: selected === min && !custom ? '#0F6E56' : '#374151',
                fontWeight: 700, fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.15s',
              }}
            >
              {min < 60 ? `${min} min` : min === 60 ? '1 h' : `${Math.floor(min/60)} h ${min%60 ? min%60+' min' : ''}`}
            </button>
          ))}
        </div>

        {/* Durée personnalisée */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
          <label style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>Durée personnalisée :</label>
          <input
            type="number" min={1} max={300}
            value={custom}
            placeholder="ex : 50"
            onChange={e => { setCustom(e.target.value); if (e.target.value) setSelected(null); }}
            style={{
              width: 80, padding: '7px 10px', borderRadius: 8,
              border: '1.5px solid #e2e8f0', fontSize: 14,
              fontFamily: "'Nunito', sans-serif",
            }}
          />
          <span style={{ fontSize: 13, color: '#64748b' }}>min</span>
        </div>

        {/* Affichage durée */}
        <div style={{
          background: '#f8fafc', borderRadius: 12, padding: '12px 16px',
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>⏱</span>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#1A1A2E', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
              {h}:{m}:00
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>durée sélectionnée</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer',
            border: '1.5px solid #e2e8f0', background: '#fff',
            color: '#64748b', fontWeight: 700, fontSize: 14,
            fontFamily: "'Nunito', sans-serif",
          }}>
            Annuler
          </button>
          <button
            onClick={() => effectiveMin > 0 && onConfirm(effectiveMin)}
            disabled={effectiveMin <= 0}
            style={{
              flex: 2, padding: '11px', borderRadius: 10, cursor: effectiveMin > 0 ? 'pointer' : 'not-allowed',
              border: 'none', background: effectiveMin > 0 ? '#f59e0b' : '#e2e8f0',
              color: effectiveMin > 0 ? '#78350f' : '#9ca3af',
              fontWeight: 800, fontSize: 14,
              fontFamily: "'Nunito', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            ▶ Lancer l'examen
          </button>
        </div>
      </div>
    </div>
  );
}