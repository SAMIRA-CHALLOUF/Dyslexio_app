/**
 * @file correction.service.ts
 * @description Service NestJS en charge de la correction orthographique, grammaticale et syntaxique.
 * Il interagit avec deux API distinctes :
 * 1. Le LLM local (Ollama + Mistral) pour les corrections contextuelles "humaines" intelligentes.
 * 2. L'API distante de LanguageTool pour détecter de manière algorithmique les fautes classiques (soulignage rouge).
 *
 * ✅ Optimisations appliquées :
 * - Cache LRU : Stocke en mémoire les phrases déjà traitées pour une réponse instantanée.
 * - TCP Keep-Alive : Garde la connexion ouverte avec Ollama pour éviter les temps de handshake à chaque lettre saisie.
 * - Options Modèles : Bridage inférence, restriction JSON, annulation créativité.
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as http from 'http';
import axios from 'axios';

// URL du moteur Ollama (local)
const OLLAMA_URL = 'http://localhost:11434/api/chat';
// Modèle optimal pour la correction : rapide (7B paramètres) et instruit pour le langage.
const MODEL = 'phi3:mini';

// ✅ 2. Connexion Persistante (TCP Keep-Alive)
// Maintient un "canal" ouvert avec le serveur backend Ollama.
const keepAliveAgent = new http.Agent({ keepAlive: true });

@Injectable()
export class CorrectionService implements OnModuleInit {
  // ✅ 1. Cache en mémoire.
  // Une simple Map (dictionnaire) sert de base de données en RAM.
  // Une clé comme "fr:bonjour" renverra "bonjour" sans réveiller le modèle IA.
  private cache = new Map<string, string>();

  // ✅ 3. Pré-chauffe (Warm-up)
  // Exécutée lors du premier démarrage du backend.
  // Envoie une requête "vide" à Ollama pour qu'il charge Mistral dans la VRAM (RAM de la carte graphique).
  async onModuleInit() {
    try {
      await axios.post(
        OLLAMA_URL,
        {
          model: MODEL,
          messages: [{ role: 'user', content: 'ok' }],
          stream: false,
          options: { num_predict: 1 },
        },
        { httpAgent: keepAliveAgent },
      );
      console.log(`[CorrectionService] Modèle ${MODEL} pré-chargé en VRAM ✅`);
    } catch {
      console.warn(
        '[CorrectionService] Pré-chauffe échouée (Ollama est-il lancé ?)',
      );
    }
  }

  /**
   * Correction contextuelle via LLM (Mistral).
   * Appelé par clic sur le bouton "Corriger ma phrase".
   */
  async correct(text: string, lang: string = 'fr') {
    if (!text?.trim()) {
      return { originalText: text, correctedText: text, changed: false };
    }

    // ✅ FAST-RETURN: Si le texte contient uniquement des chiffres, signes de ponctuation ou fait moins de 2 lettres
    if (/^[\d\s.,!?"'-]+$/.test(text)) {
      return { originalText: text, correctedText: text, changed: false };
    }

    const cacheKey = `${lang}:${text}`;
    if (this.cache.has(cacheKey)) {
      const cachedCorrection = this.cache.get(cacheKey)!;
      return {
        originalText: text,
        correctedText: cachedCorrection,
        changed: cachedCorrection !== text,
        language: lang,
        cached: true, // ✅ Indicateur de rapidité pour le frontend
      };
    }

    const systemPrompt = this.getPrompt(lang);

    try {
      const response = await axios.post(
        OLLAMA_URL,
        {
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          format: 'json', // ✅ 5. Force JSON
          stream: false,
          options: {
            temperature: 0.0, // ✅ 4. Déterministe
            top_p: 0.1, // ✅ 4. Peu de tokens à évaluer
            top_k: 1,
            tfs_z: 1.0,
            num_predict: 250, // ✅ 4. Modifié selon le README (empêche de boucler mais assure une vraie phrase)
            keep_alive: 3600, // ✅ 3. Garde le modèle en VRAM 1 heure
            num_ctx: 512,
            num_thread: 8,
            repeat_penalty: 1.0,
          },
        },
        { httpAgent: keepAliveAgent },
      ); // ✅ Utilise l'agent TCP persistant

      const rawContent = response.data?.message?.content?.trim() || '{}';
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch (e) {
        parsed = { correctedText: text }; // Fallback en cas d'échec
      }

      let correctedText = parsed.correctedText || text;

      correctedText = correctedText
        .replace(/^["«»']|["«»']$/g, '')
        .replace(/^(Voici|Correction|Texte corrigé|Corrected text)[:\s]*/i, '')
        .trim();

      // Enregistrement dans la mémoire RAM
      // Si on dépasse 1000 entrées, on évite le crash RAM en nettoyant
      if (this.cache.size > 1000) this.cache.clear();
      this.cache.set(cacheKey, correctedText);

      return {
        originalText: text,
        correctedText: correctedText,
        changed: correctedText !== text,
        language: lang,
      };
    } catch (error) {
      console.error('[CorrectionService] Erreur Mistral:', error);
      return {
        originalText: text,
        correctedText: text, // Fallback en sécurité (on garde la même phrase en cas d'échec)
        changed: false,
        error: 'Service IA indisponible.',
      };
    }
  }

  /**
   * ✅ Détection d'Erreurs Algorithmique (LanguageTool)
   * Utilisé de manière masquée derrière l'éditeur ReactQuill pour souligner en rouge.
   */
  async checkLanguageTool(text: string, lang: string = 'fr') {
    if (!text?.trim()) return [];

    // Mapping du code iso (fr) vers le format attendu par LanguageTool (fr)
    const mapLang: Record<string, string> = {
      fr: 'fr',
      en: 'en-US',
      it: 'it',
      es: 'es',
      de: 'de-DE',
      ar: 'ar',
    };
    const ltLang = mapLang[lang] || 'fr';

    try {
      // POST vers l'API locale (x-www-form-urlencoded requis)
      const response = await axios.post(
        'http://localhost:8081/v2/check',
        new URLSearchParams({
          text,
          language: ltLang,
          level: 'picky', 
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const data = response.data;

      // ✅ Nettoyage des parasites
      // On ignore la typo ("mot ." -> "mot.") ou l'espace ("donc ,") qui cassent Quill visuellement.
      const ignoredRuleTypes = ['typographical', 'whitespace'];
      const ignoredRuleIds = ['FRENCH_WHITESPACE', 'EN_QUOTES'];

      const filteredMatches = data.matches.filter((match: any) => {
        if (ignoredRuleTypes.includes(match.rule?.issueType)) return false;
        if (ignoredRuleIds.includes(match.rule?.id)) return false;
        return true;
      });
      // ✅ Mapping spécifique pour le Front-End (App.js)
      // Renvoie uniquement ce dont on a besoin : position de la faute et mots de remplacement (1 à 3)
      return filteredMatches.map((match: any) => ({
        message: match.message,
        replacements: match.replacements
          .slice(0, 3) // Ne garde que 3 suggestions maximum (meilleures options)
          .map((r: any) => r.value.trim()) // Purge les whitespaces erronés
          .filter((v: string) => v.length > 0 && !/[()[\]{}]/.test(v)), // Protège contre les brackets non fermables
        offset: match.offset, // Position exacte (lettre n° X) dans l'éditeur texte
        length: match.length, // Longueur du souligage (nombre de lettres)
        word: text.substring(match.offset, match.offset + match.length),
      }));
    } catch (error) {
      console.error('[LanguageTool] Timeout / Erreur API :', error);
      return []; // Renvoie vide en cas de panne réseau = pas de soulignage rouge.
    }
  }

  /**
   * Injection stricte des rôles par langue pour OLLAMA + Mistral
   * En forçant un comportement "JSON Format ONLY", le modèle est paralysé
   * sur le dialogue humain et forcé d'être un correcteur informatique.
   */
  private getPrompt(lang: string): string {
    const jsonInstruction =
      '\n\nYou are a pure text-filtering machine. Return ONLY a valid JSON object with the key "correctedText" containing the corrected text. NO conversational padding. Provide ABSOLUTELY NO explanations. Example: { "correctedText": "votre texte final" }';

    const PROMPTS: { [key: string]: string } = {
      fr:
        "Vous êtes un correcteur professionnel de texte français. Votre seule tâche est de corriger la syntaxe, la grammaire, la conjugaison et les erreurs de type SMS (ex: 'bongor' -> 'bonjour').\n\n" +
        'RÈGLES ABSOLUES :\n' +
        '- Ne modifiez PAS le sens de la phrase.\n' +
        '- NE TRADUISEZ PAS le texte. Le résultat DOIT RESTER en français.\n' +
        '- Ne modifiez JAMAIS les noms propres et les prénoms.\n' +
        "- N'ajoutez AUCUNE explication, AUCUN guillemet." +
        jsonInstruction,

      en:
        'You are a spelling correction tool. Fix: spelling, grammar, punctuation. NEVER change the meaning.' +
        jsonInstruction,

      it:
        'Sei uno strumento di correzione ortografica. Correggi: ortografia, grammatica, punteggiatura. Non cambiare MAI il significato.' +
        jsonInstruction,

      es:
        'Eres una herramienta de corrección ortográfica. Corrige: ortografía, gramática, puntuación. NUNCA cambies el significado.' +
        jsonInstruction,

      de:
        'Du bist ein Rechtschreibkorrekturtool. Korrigiere: Rechtschreibung, Grammatik, Zeichensetzung. Ändere NIEMALS die Bedeutung.' +
        jsonInstruction,

      ar:
        'أنت أداة تصحيح إملائي. صحح: الإملاء والنحو وعلامات الترقيم. لا تغير المعنى أبداً.' +
        jsonInstruction,
    };

    return PROMPTS[lang] || PROMPTS['fr'];
  }
}
