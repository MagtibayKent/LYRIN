/**
 * Dictionary API Hooks for React Components
 * Provides custom hooks for managing API calls and state
 */

import { useState, useCallback } from 'react';
import {
  fetchDictionaryDefinition,
  translateText,
  DictionaryApiResponse,
  TranslationResult,
  startVoiceInput,
  speakText,
  stopSpeech as stopSpeechAPI,
} from '../services/dictionaryApi';

export interface UseDictionaryOptions {
  onSuccess?: (result: DictionaryApiResponse[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for fetching dictionary definitions
 */
export function useDictionaryDefinition(options?: UseDictionaryOptions) {
  const [data, setData] = useState<DictionaryApiResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (word: string, language: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchDictionaryDefinition(word, language);
        setData(result);
        options?.onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options?.onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetch, reset };
}

/**
 * Hook for translating text
 */
export function useTranslation() {
  const [data, setData] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const translate = useCallback(
    async (text: string, sourceLang: string, targetLang: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await translateText(text, sourceLang, targetLang);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, translate, reset };
}

/**
 * Hook for speech-to-text functionality
 */
export function useVoiceInput() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startListening = useCallback(async (language: string) => {
    setLoading(true);
    setError(null);

    try {
      const transcript = await startVoiceInput(language);
      setLoading(false);
      return transcript;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, startListening, reset };
}

/**
 * Hook for text-to-speech functionality
 */
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const speak = useCallback((text: string, language: string) => {
    try {
      setIsSpeaking(true);
      speakText(text, language);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    stopSpeechAPI();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, error, speak, stop };
}
