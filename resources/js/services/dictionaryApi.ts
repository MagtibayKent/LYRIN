/**
 * Dictionary API Integration Service
 * Handles word definitions, translations, and multilingual support
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
];

export interface DictionaryApiResponse {
  word: string;
  pronunciation?: {
    text?: string;
    audio?: string;
  };
  entries?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{
      definition?: string;
      example?: string;
      synonyms?: string[];
    }>;
  }>;
  source?: {
    url?: string;
  };
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  source: 'mymemory' | 'libretranslate';
}

/**
 * Fetch word definitions from Free Dictionary API
 * Supports multiple languages
 * API: https://freedictionaryapi.com/api/v1/entries/{language}/{word}
 */
export async function fetchDictionaryDefinition(
  word: string,
  language: string
): Promise<DictionaryApiResponse[]> {
  if (!word.trim()) {
    throw new Error('Word cannot be empty');
  }

  const url = `https://freedictionaryapi.com/api/v1/entries/${language}/${word.toLowerCase()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Word "${word}" not found in ${language} dictionary`);
      }
      throw new Error(`Dictionary API error: ${response.status}`);
    }

    const data = await response.json();

    // Log the response for debugging
    console.log('Dictionary API Response:', { word, language, data });

    // Free Dictionary API can return either an object or an array
    if (Array.isArray(data)) {
      // Return all results - don't filter, let the UI handle empty entries
      return data;
    } else if (data && typeof data === 'object' && 'word' in data) {
      // If it's a single object, wrap it in an array
      return [data as DictionaryApiResponse];
    }

    throw new Error('Invalid API response format');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch dictionary definition');
  }
}

// Map language codes to MyMemory API format
const mapLanguageCode = (code: string): string => {
  const langMap: Record<string, string> = {
    'zh': 'zh-CN',
    'tl': 'fil', // Filipino
  };
  return langMap[code] || code;
};

/**
 * Translate text using My Memory Translation API
 * Primary translation service
 */
export async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.append('q', text);
  // Map language codes for MyMemory API
  const mappedSource = mapLanguageCode(sourceLang);
  const mappedTarget = mapLanguageCode(targetLang);
  url.searchParams.append('langpair', `${mappedSource}|${mappedTarget}`);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return {
        originalText: text,
        translatedText: data.responseData.translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        source: 'mymemory',
      };
    }

    throw new Error('My Memory translation failed');
  } catch (error) {
    throw new Error(`My Memory API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Translate text using LibreTranslate API
 * Fallback translation service
 */
export async function translateWithLibreTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  const url = 'https://api.libretranslate.de/translate';

  // Map language codes for LibreTranslate
  const mapLibreLang = (code: string): string => {
    const langMap: Record<string, string> = {
      'zh': 'zh',
      'tl': 'tl', // LibreTranslate might not support Filipino, try 'tl' or 'en' as fallback
      'hi': 'hi',
      'ar': 'ar',
      'ja': 'ja',
      'ko': 'ko',
    };
    return langMap[code] || code;
  };

  try {
    const mappedSource = mapLibreLang(sourceLang);
    const mappedTarget = mapLibreLang(targetLang);
    
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        source: mappedSource,
        target: mappedTarget,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.translatedText) {
      return {
        originalText: text,
        translatedText: data.translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        source: 'libretranslate',
      };
    }

    throw new Error('LibreTranslate translation failed');
  } catch (error) {
    throw new Error(`LibreTranslate API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Translate with automatic fallback
 * Tries My Memory first, falls back to LibreTranslate if it fails
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  // Skip translation if source and target are the same
  if (sourceLang === targetLang) {
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      source: 'mymemory',
    };
  }

  try {
    // Try My Memory first (primary)
    return await translateWithMyMemory(text, sourceLang, targetLang);
  } catch (error) {
    console.warn('My Memory translation failed, trying LibreTranslate:', error);
    try {
      // Fallback to LibreTranslate
      return await translateWithLibreTranslate(text, sourceLang, targetLang);
    } catch (fallbackError) {
      console.error('Both translation APIs failed:', fallbackError);
      throw new Error('Translation service unavailable. Please try again later.');
    }
  }
}

/**
 * Get supported voice for Text-to-Speech
 * Returns the closest matching language voice
 */
export function getSpeechVoice(languageCode: string): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech Synthesis not supported');
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  
  // Map language codes to speech voice language patterns
  const voiceLanguageMap: Record<string, string[]> = {
    en: ['en-US', 'en-GB', 'en'],
    es: ['es-ES', 'es-MX', 'es'],
    fr: ['fr-FR', 'fr-CA', 'fr'],
    de: ['de-DE', 'de'],
    it: ['it-IT', 'it'],
    pt: ['pt-BR', 'pt-PT', 'pt'],
    ru: ['ru-RU', 'ru'],
    hi: ['hi-IN', 'hi'],
    ar: ['ar-SA', 'ar-AE', 'ar'],
    ja: ['ja-JP', 'ja'],
    ko: ['ko-KR', 'ko'],
    zh: ['zh-CN', 'zh-TW', 'zh'],
    tl: ['fil-PH', 'tl', 'fil'],
  };

  const targetLanguages = voiceLanguageMap[languageCode] || [languageCode];

  // Find first matching voice
  for (const targetLang of targetLanguages) {
    const voice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(targetLang.toLowerCase())
    );
    if (voice) return voice;
  }

  // Fallback to any available voice
  return voices.length > 0 ? voices[0] : null;
}

/**
 * Speak text using Web Speech API
 */
export function speakText(text: string, languageCode: string): void {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-Speech is not supported in your browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getSpeechVoice(languageCode);

  if (voice) {
    utterance.voice = voice;
  }

  utterance.lang = languageCode;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop ongoing speech
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Start listening for voice input using Web Speech API
 * Returns a promise that resolves with the recognized text
 */
export async function startVoiceInput(languageCode: string): Promise<string> {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error('Speech Recognition is not supported in your browser');
  }

  return new Promise((resolve, reject) => {
    const recognition = new SpeechRecognition();
    
    recognition.lang = languageCode;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Voice input started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      console.log('Voice input ended');
    };

    recognition.start();
  });
}

/**
 * Check if browser supports speech-related APIs
 */
export const speechSupport = {
  synthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
  recognition: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
};
