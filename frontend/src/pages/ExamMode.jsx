// src/pages/ExamMode.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import ReactQuill from 'react-quill-new'; // Removed as not used in exam mode
import { Clock, Flag } from 'lucide-react';


const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ExamMode({ user, onUserUpdate }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examContent, setExamContent] = useState('');


  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerInterval = useRef(null);

  // Handle exam end - wrapped in useCallback to avoid dependency issues
  const handleExamEnd = useCallback(async (userData, examContent, updateUserFunc, navigateFunc) => {
    if (!userData?.id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND}/eleves/${userData.id}/exam/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: examContent }),
      });
      if (!res.ok) {
        const errMsg = await res.text();
        console.error('Exam close error:', errMsg);
        alert(t('exam.endError', errMsg || 'Erreur lors de la fermeture de l\'examen'));
        return; // stop further processing on error
      }
      const data = await res.json();

      // Update user context
      if (updateUserFunc) updateUserFunc({ ...userData, ...data });

      // Clear localStorage
      localStorage.removeItem('examEndTime');
      localStorage.removeItem('examInProgress');

      // Show completion message and redirect
      alert(t('exam.completed', 'Examen terminé! Merci de votre participation.'));
      setExamContent('');
      navigateFunc('/editor');
    } catch (err) {
      console.error(err);
      alert(t('exam.endError', 'Erreur lors de la fermeture de l\'examen'));
    }
  }, [t]);

  // Initialize exam timer
  useEffect(() => {
    // Block access for non-eleve users
    if (user && user.typeCompte !== 'eleve') {
      navigate('/editor');
      return;
    }

    const examEndTime = user?.examEndTime || localStorage.getItem('examEndTime');
    if (!examEndTime) {
      navigate('/editor');
      return;
    }

    const calculateTimeRemaining = () => {
      const endTime = new Date(examEndTime).getTime();
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(Math.floor(remaining / 1000));
      return remaining;
    };

    // Initial calculation
    calculateTimeRemaining();

    // Set up interval for countdown
    timerInterval.current = setInterval(() => {
      const remaining = calculateTimeRemaining();
      if (remaining <= 0) {
        clearInterval(timerInterval.current);
        setIsTimeUp(true);
        handleExamEnd(user, examContent, onUserUpdate, navigate);
      }
    }, 1000);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [user?.examEndTime, navigate, onUserUpdate, handleExamEnd, t]);

  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle early exit
  const handleEarlyExit = async () => {
    if (!window.confirm(t('exam.confirmExit', 'Êtes-vous sûr de vouloir terminer l\'examen maintenant ?'))) {
      return;
    }
    await handleExamEnd(user, examContent, onUserUpdate, navigate);
  };

  // Removed quill read-only enforcement; exam mode now uses a plain textarea for input.

  // Get color for timer based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-600'; // < 1 minute
    if (timeRemaining <= 300) return 'text-orange-600'; // < 5 minutes
    return 'text-teal-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Exam Header */}
      <div className="bg-white border-b-4 border-teal-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-xl">
              ⏱️
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{t('exam.title', 'Mode Examen')}</h1>
              <p className="text-xs text-slate-500">{user?.prenom} {user?.nom}</p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-4">
            <div className={`text-center ${getTimerColor()}`}>
              <Clock size={24} className="mx-auto mb-1" />
              <div className="text-3xl font-black font-mono">{formatTime(timeRemaining)}</div>
              <div className="text-xs font-semibold">{t('exam.timeRemaining', 'Temps restant')}</div>
            </div>

            {isTimeUp && (
              <div className="ml-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
                <p className="text-red-700 font-bold text-sm">⏰ {t('exam.timeUp', 'Temps écoulé!')}</p>
              </div>
            )}
          </div>

          {/* Early Exit Button */}
          <button
            onClick={handleEarlyExit}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2 shadow-md"
          >
            <Flag size={18} />
            {t('exam.endExam', 'Terminer')}
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-teal-50 border-t border-teal-200 px-6 py-3">
          <p className="text-sm text-slate-700 font-semibold">
            ✏️ {t('exam.editMode', "Mode édition – Vous pouvez écrire votre texte")}
          </p>
        </div>
      </div>

      {/* Exam Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 overflow-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 overflow-hidden">
            {/* Display exam content as plain textarea (read‑only editing) */}
            <div className="w-full">
              <textarea
                value={examContent}
                onChange={(e) => setExamContent(e.target.value)}
                className="w-full h-96 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-sans text-lg"
                placeholder={t('exam.placeholder', "Contenu de l'examen...")}
              />
            </div>


        </div>
      </main>

      {/* Footer - Warning */}
      <div className="bg-amber-50 border-t border-amber-200 px-6 py-3">
        <p className="text-xs text-amber-700 font-semibold text-center">
          ⚠️ {t('exam.warningMessage', 'Ne fermez pas cette fenêtre. Si vous vous déconnectez, l\'examen continuera lors de votre reconnexion.')}
        </p>
      </div>

      {/* Custom Quill styles for exam mode */}
      <style>{`
        .editor-quill-wrapper .ql-toolbar.ql-snow {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px;
        }
        
        .editor-quill-wrapper .ql-container.ql-snow {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-family: 'Atkinson Hyperlegible', sans-serif;
          font-size: 16px;
          line-height: 1.75;
        }

        .editor-quill-wrapper .ql-editor {
          min-height: 300px;
          padding: 20px;
          color: #0f172a;
          background-color: #ffffff;
        }

        .editor-quill-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: italic;
        }

        /* Disable pointer events on toolbar in exam mode */
        .editor-quill-wrapper .ql-toolbar button,
        .editor-quill-wrapper .ql-toolbar .ql-picker-label {
          pointer-events: none;
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
