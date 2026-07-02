/**
 * @file correction.service.ts
 * Correction grammaticale, orthographique et CONTEXTUELLE
 * Utilise Groq API (100% gratuit) — ultra rapide ~0.5s
 * Clé gratuite sur https://console.groq.com
 */

import { Injectable } from '@nestjs/common';
import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.1-8b-instant'; // rapide + gratuit

@Injectable()
export class CorrectionService {
  private cache = new Map<string, { correctedText: string; corrections: any[] }>();

  async correct(text: string, lang: string = 'fr') {
    if (!text?.trim()) {
      return { originalText: text, correctedText: text, changed: false, corrections: [] };
    }

    if (/^[\d\s.,!?\"'-]+$/.test(text)) {
      return { originalText: text, correctedText: text, changed: false, corrections: [] };
    }

    const cacheKey = `${lang}:${text}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return {
        originalText: text,
        correctedText: cached.correctedText,
        changed: cached.correctedText !== text,
        language: lang,
        cached: true,
        corrections: cached.corrections,
      };
    }

    if (!GROQ_API_KEY) {
      console.error('[CorrectionService] GROQ_API_KEY manquante dans .env');
      return {
        originalText: text,
        correctedText: text,
        changed: false,
        error: 'Clé API Groq manquante. Ajoutez GROQ_API_KEY dans votre fichier .env (gratuit sur https://console.groq.com)',
      };
    }

    try {
      const systemPrompt = this.getPrompt(lang);

      const response = await axios.post(
        GROQ_URL,
        {
          model: MODEL,
          temperature: 0.0,
          max_tokens: 1024,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Corrige ce texte et réponds UNIQUEMENT en JSON valide, rien d'autre :\n\n${text}`,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15_000,
        },
      );

      const rawContent = response.data?.choices?.[0]?.message?.content?.trim() || '{}';

      let parsed: any;
      try {
        let cleaned = rawContent;
        const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (jsonMatch) cleaned = jsonMatch[1];
        const start = cleaned.indexOf('{');
        const end   = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) cleaned = cleaned.substring(start, end + 1);
        parsed = JSON.parse(cleaned);
      } catch (e) {
        console.error('[CorrectionService] Erreur parsing JSON:', rawContent);
        parsed = { correctedText: text, corrections: [] };
      }

      let correctedText: string = parsed.correctedText || text;
      correctedText = correctedText
        .replace(/^["«»']|["«»']$/g, '')
        .replace(/^(Voici|Correction|Texte corrigé|Corrected text)[:\s]*/i, '')
        .trim();

      const finalCorrections = parsed.corrections || [];

      if (this.cache.size > 1000) this.cache.clear();
      this.cache.set(cacheKey, { correctedText, corrections: finalCorrections });

      return {
        originalText: text,
        correctedText,
        changed: correctedText !== text,
        language: lang,
        corrections: finalCorrections,
        source: 'groq',
      };

    } catch (error: any) {
      const status  = error?.response?.status;
      const message = error?.response?.data?.error?.message || error?.message;
      console.error('[CorrectionService] Erreur API Groq:', status, message);

      let errorMsg = 'Erreur lors de la correction.';
      if (status === 401) errorMsg = 'Clé API Groq invalide. Vérifiez GROQ_API_KEY dans votre .env';
      else if (status === 429) errorMsg = 'Limite atteinte. Réessayez dans quelques secondes.';
      else if (error?.code === 'ECONNABORTED') errorMsg = 'Timeout : réessayez avec un texte plus court.';

      return { originalText: text, correctedText: text, changed: false, error: errorMsg };
    }
  }

  private getPrompt(lang: string): string {
    const jsonInstruction = `
Tu es une machine JSON pure. Réponds UNIQUEMENT avec un objet JSON valide.
AUCUN markdown, AUCUN bloc \`\`\`json, AUCUNE explication en dehors du JSON.

Structure EXACTE :
{
  "correctedText": "le texte corrigé ici",
  "corrections": [
    {
      "original": "mot fautif",
      "corrected": "version corrigée",
      "rule": "explication simple en 1-2 phrases",
      "type": "orthographe|grammaire|conjugaison|ponctuation|contexte"
    }
  ]
}

Si aucune correction nécessaire : { "correctedText": "...", "corrections": [] }`;

    const PROMPTS: Record<string, string> = {
      fr: `Tu es un correcteur de texte français expert, spécialisé pour les personnes DYS.

TON RÔLE :
- Corriger les fautes d'orthographe, de grammaire ET les incohérences de sens.
- Correction contextuelle : "je mange l'iset" → le mot "iset" n'existe pas, propose la correction logique selon le contexte.
- Expliquer chaque correction simplement et avec bienveillance.
- Respecter le style et le niveau de langue de l'auteur.

CORRECTIONS PAR PRIORITÉ :
1. Erreurs contextuelles : mots inexistants ou incohérents dans le contexte de la phrase
2. Fautes phonétiques DYS : "bongor" → "bonjour", "suis aler" → "suis allé"
3. Confusions visuelles DYS : b/d, p/q, m/n, on/an, ou/u
4. Grammaire : accord sujet-verbe, genre, nombre
5. Conjugaison : temps, modes, personnes
6. Orthographe : homophones (a/à, ce/se, son/sont)
7. Ponctuation manquante
8. SMS/abréviations : "pr" → "pour", "ms" → "mais"

RÈGLES ABSOLUES :
- Ne JAMAIS changer le sens intentionnel.
- Ne JAMAIS traduire. Rester en français.
- Ne JAMAIS modifier les noms propres.
- Si le texte est correct, retourner exactement le même texte.
${jsonInstruction}`,

      en: `You are an expert English text corrector for people with dyslexia.

YOUR ROLE:
- Fix spelling, grammar AND contextual/logical errors.
- Contextual: "I eat the iset" → "iset" doesn't exist, suggest the logical word.
- Explain each fix simply and encouragingly.

CORRECTIONS BY PRIORITY:
1. Contextual errors: non-existent or incoherent words in context
2. Phonetic DYS errors: "wud" → "would", "becoz" → "because"
3. Visual confusion: b/d swaps, p/q swaps
4. Grammar: subject-verb agreement, articles
5. Spelling: homophones (their/there/they're)
6. Conjugation: tense consistency
7. Punctuation
8. SMS shortcuts: "u" → "you"

ABSOLUTE RULES:
- NEVER change the intended meaning.
- NEVER translate.
- NEVER modify proper nouns.
${jsonInstruction}`,

      it: `Sei un correttore di testi italiani esperto per persone con dislessia.
Correggi errori ortografici, grammaticali E contestuali.
Esempio contestuale: una parola inesistente va corretta con la parola logica nel contesto.
REGOLE: non cambiare il significato, non tradurre, non modificare nomi propri.
${jsonInstruction}`,

      es: `Eres un corrector experto de textos españoles para personas con dislexia.
Corrige errores ortográficos, gramaticales Y contextuales.
Ejemplo contextual: una palabra inexistente debe corregirse con la palabra lógica en contexto.
REGLAS: no cambiar el significado, no traducir, no modificar nombres propios.
${jsonInstruction}`,

      de: `Du bist ein Textkorrektor für Deutsch, spezialisiert auf Legasthenie.
Korrigiere Rechtschreib-, Grammatik- UND Kontextfehler.
Kontextbeispiel: ein nicht existierendes Wort durch das logische Wort im Kontext ersetzen.
REGELN: Bedeutung nie ändern, nie übersetzen, Eigennamen nie ändern.
${jsonInstruction}`,

      ar: `أنت مصحح نصوص عربية خبير للأشخاص الذين يعانون من عسر القراءة.
صحح أخطاء الإملاء والنحو وأخطاء السياق.
مثال سياقي: كلمة غير موجودة يجب تصحيحها بالكلمة المنطقية في السياق.
القواعد: لا تغير المعنى أبداً، لا تترجم، لا تعدّل الأسماء الخاصة.
${jsonInstruction}`,
    };

    return PROMPTS[lang] || PROMPTS['fr'];
  }

  async checkHealth() {
    return {
      apiKey: GROQ_API_KEY ? 'présente ✅' : 'manquante ❌',
      model: MODEL,
      provider: 'Groq (100% gratuit)',
      ready: !!GROQ_API_KEY,
    };
  }
}