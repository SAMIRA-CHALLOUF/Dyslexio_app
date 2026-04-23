/* ROLE DU FICHIER: Service contenant la logique NLP pour deviner les prochains mots ou le mot en cours. */

import { Injectable } from '@nestjs/common';

// Configuration de l'accès à l'API locale Ollama (Moteur d'inférence LLM)
const OLLAMA_URL = 'http://localhost:11434/api/chat';
// Utilisation du modèle Qwen2.5 optimisé (1.5b de paramètres) pour des réponses ultra-rapides compatibles temps réel
const MODEL = 'qwen2.5:1.5b';

// Dictionnaire de correspondances pour forcer le modèle à répondre dans la bonne langue
const LANG_MAP: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  de: 'Deutsch',
  ar: 'العربية',
};

@Injectable()
export class PredictionsService {
  /**
   * Fonction principale permettant de prédire la suite d'une phrase.
   * @param fullText Le texte saisi par l'utilisateur jusqu'à présent.
   * @param forcedLang (Optionnel) La langue forcée par l'interface utilisateur.
   * @returns Un tableau contenant les 4 meilleures prédictions de mots restants.
   */
  async getPredictions(
    fullText: string,
    forcedLang?: string,
  ): Promise<string[]> {
    // Évite de faire des requêtes inutiles si le texte est vide ou trop court
    if (!fullText || fullText.trim().length < 2) {
      return [];
    }

    // Conditionnement contextuel : oblige le modèle à respecter la langue cible ou à l'auto-détecter
    const langInstructions = forcedLang
      ? `You MUST output your predictions EXCLUSIVELY in ${LANG_MAP[forcedLang] || forcedLang}.`
      : `Detect the language of the provided text and output your predictions EXCLUSIVELY in that exact language.`;

    const isAutocomplete = !fullText.endsWith(' ');
    let systemPrompt = '';

    if (isAutocomplete) {
      systemPrompt = `You are a strict autocomplete engine. 
The user is currently typing a word and HAS NOT pressed space.
Your ONLY job is to guess how to finish the current partial word based on the sentence context.

RULES:
1. DO NOT predict the next word. You MUST ONLY autocomplete the CURRENT partial word.
2. The output word MUST start exactly with the last partial word the user is typing.
3. ${langInstructions}
4. Give EXACTLY 4 different possibilities of the full word.
5. Return YOUR ENTIRE RESPONSE as a valid JSON object with a "predictions" array. NO markdown.

Example: If user types "Je man"
{ "predictions": ["mange", "manger", "mangeais", "mangeons"] }`;
    } else {
      systemPrompt = `You are a smart text prediction engine. 
The user has finished their last word (indicated by a trailing space).
Your job is to predict the NEXT logical new words to continue the sentence.

RULES:
1. DO NOT repeat the user's sentence. ONLY provide the NEW words that come logically next.
2. ${langInstructions}
3. The prediction MUST make grammatically perfect sense when appended to the user's text.
4. Give EXACTLY 4 different possibilities.
5. Max 1-3 words per possibility.
6. Return YOUR ENTIRE RESPONSE as a valid JSON object with a "predictions" array. NO markdown, NO explanations.

Example: If user types "Je voudrais "
{ "predictions": ["manger", "un verre d'eau", "dormir", "vous voir"] }`;
    };

    try {
      // Appel HTTP vers l'API locale d'Ollama
      const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullText }, // We pass fullText exactly as it is without trimming so the model knows if a space is at the end!
          ],
          format: 'json', // Force le LLM à répondre exclusivement avec un formalisme JSON valide
          stream: false, // On attend la réponse complète au lieu d'un flux (streaming)
          // Paramètres d'inférence agressifs pour optimiser le temps de réponse (inférieur à 300ms visé)
          options: {
            temperature: 0.3, // Faible créativité = favorise les prédictions logiques et probabilistes
            top_p: 0.8, // Restreint le champ lexical pour éviter les mots hors-sujet
            num_predict: 50, // Limite stricte de la longueur de réponse (pour économiser des calculs)
            num_ctx: 256, // Petite fenêtre de contexte amplement suffisante pour de la complétion de phrase
            repeat_penalty: 1.15, // Empêche le modèle de boucler sur les mêmes mots
            num_thread: 8, // Exploite le multithreading du processeur pour accélérer l'inférence
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const raw = (data.message?.content || '').trim();

      // On parse d'abord le JSON brut renvoyé par le modèle
      let parsed;
      try {
        parsed = JSON.parse(raw);
        if (parsed.predictions) {
          parsed = parsed.predictions; // On extrait le tableau attendu
        }
      } catch (e) {
        // Fallback de sécurité (Mécanisme de résilience) : si le LLM n'a pas respecté
        // le format JSON à 100%, on utilise une expression régulière pour capturer le premier tableau trouvé.
        const match = raw.match(/\[[\s\S]*?\]/);
        if (!match)
          throw new Error('JSON array introuvable dans la réponse: ' + raw);
        parsed = JSON.parse(match[0]);
      }

      if (!Array.isArray(parsed))
        throw new Error('La réponse ne contient pas de tableau JSON');

      // Nettoyage final des données (Sanitization) : suppression des espaces,
      // filtrage des mots trop longs (anomalies) et limitation stricte à 4 résultats.
      const cleaned = parsed
        .map((w: any) => String(w).trim())
        .filter((w: string) => w.length > 0 && w.length < 40)
        .slice(0, 4);

      return cleaned;
    } catch (err) {
      console.error(
        '[PredictionsService] Erreur lors de la prédiction Ollama:',
        err,
      );
      // En cas de panne de l'IA locale, on renvoie silencieusement un tableau vide
      // pour ne pas crasher l'interface utilisateur.
      return [];
    }
  }
}


