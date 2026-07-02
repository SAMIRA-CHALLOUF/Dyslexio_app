/* ROLE DU FICHIER: Service contenant la logique NLP pour deviner les prochains mots ou le mot en cours. */

import { Injectable } from '@nestjs/common';

// Configuration de l'accès à l'API Groq (inference ultra rapide, gratuite)
// Compatible avec le format OpenAI /chat/completions
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Clé API Groq (à mettre de préférence dans une variable d'environnement GROQ_API_KEY)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
// Modèle plus intelligent chez Groq, meilleure compréhension du contexte de la phrase
// (un peu plus lent que le 8b-instant mais reste très rapide grâce aux LPU Groq)
const MODEL = 'llama-3.3-70b-versatile';

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
      systemPrompt = `You are a smart text prediction engine for an assistive communication app.
The user is typing and has NOT pressed space yet after their last word fragment.

STEP 1 — Decide the mode:
- If the last word fragment is INCOMPLETE (not a real standalone word, e.g. "bonj", "mang", "ordinat"), you are in AUTOCOMPLETE mode: finish that exact word.
- If the last word fragment is ALREADY a complete, valid, standalone word in the target language (e.g. "je", "the", "il", "avec"), you are in NEXT-WORD mode: do NOT modify or complete it — instead predict the NEXT word(s) that would naturally follow it, as if the user had already pressed space.

RULES:
1. In AUTOCOMPLETE mode: the output MUST start exactly with the typed fragment, and must be a real full word.
2. In NEXT-WORD mode: the output must be a NEW word/short phrase that comes after, NEVER the same word or its variants.
3. ALWAYS use the full sentence context written so far to choose the most natural, contextually likely options — not generic filler.
4. ${langInstructions}
5. Give EXACTLY 4 different possibilities, ordered from MOST to least likely.
6. Max 1-3 words per possibility.
7. Return YOUR ENTIRE RESPONSE as a valid JSON object with a "predictions" array. NO markdown, NO explanations.

Example: If user types "Je man" (incomplete fragment) -> AUTOCOMPLETE mode
{ "predictions": ["mange", "mangerai", "mangeais", "mangeons"] }

Example: If user types "je" (already a complete, valid word) -> NEXT-WORD mode
{ "predictions": ["vais", "mange", "suis", "pense"] }

Example: If user types "Bonjour, je" (already complete word, with prior context) -> NEXT-WORD mode
{ "predictions": ["vais", "voudrais", "suis", "pense"] }`;
    } else {
      systemPrompt = `You are a smart text prediction engine. 
The user has finished their last word (indicated by a trailing space).
Your job is to predict the NEXT logical new words to continue the sentence, based on the FULL MEANING of everything written so far.

RULES:
1. DO NOT repeat the user's sentence. ONLY provide the NEW words that come logically next.
2. READ the whole sentence carefully and understand its topic/intent before suggesting anything. Each suggestion must be a plausible, natural continuation a native speaker would actually say in THIS exact context — not a generic filler.
3. ${langInstructions}
4. The prediction MUST make grammatically perfect sense when appended to the user's text.
5. Give EXACTLY 4 different possibilities, ordered from MOST to least contextually likely.
6. Max 1-3 words per possibility.
7. Return YOUR ENTIRE RESPONSE as a valid JSON object with a "predictions" array. NO markdown, NO explanations.

Example: If user types "Je voudrais "
{ "predictions": ["manger", "un verre d'eau", "dormir", "vous voir"] }

Example: If user types "Bonjour, je vais a l'ecole avec ma "
{ "predictions": ["mère", "soeur", "voiture", "meilleure amie"] } (people/things that plausibly accompany someone to school, not random nouns)`;
    };

    try {
      // Appel HTTP vers l'API Groq (cloud, ultra rapide grâce aux LPU dédiés)
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullText }, // On passe fullText tel quel pour que le modèle sache si un espace est présent en fin !
          ],
          response_format: { type: 'json_object' }, // Force le LLM à répondre exclusivement en JSON valide
          stream: false,
          // Paramètres d'inférence agressifs pour optimiser le temps de réponse
          temperature: 0.3, // Faible créativité = favorise les prédictions logiques et probabilistes
          top_p: 0.8, // Restreint le champ lexical pour éviter les mots hors-sujet
          max_tokens: 60, // Limite stricte de la longueur de réponse
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errText}`);
      }

      const data = await res.json();
      const raw = (data.choices?.[0]?.message?.content || '').trim();

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
        '[PredictionsService] Erreur lors de la prédiction Groq:',
        err,
      );
      // En cas de panne de l'API (clé invalide, quota dépassé, réseau...), on renvoie des prédictions bidons (mock)
      // pour éviter de laisser le panneau vide.
      return [
        "exemple",
        "test",
        "manger",
        "dormir"
      ];
    }
  }
}