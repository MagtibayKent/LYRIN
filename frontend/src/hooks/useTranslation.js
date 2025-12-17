import { useState, useEffect, useCallback, useRef } from 'react';
import { translationAPI } from '../services/api';

export const useTranslation = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('fil');
  const [languages, setLanguages] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  
  const debounceRef = useRef(null);

  // Fetch available languages on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await translationAPI.getLanguages();
        setLanguages(response.data.data.languages);
      } catch (err) {
        console.error('Failed to fetch languages:', err);
        // Fallback languages
        setLanguages([
          { code: 'en', name: 'English' },
          { code: 'fil', name: 'Filipino' },
          { code: 'es', name: 'Spanish' },
          { code: 'fr', name: 'French' },
          { code: 'de', name: 'German' },
          { code: 'ja', name: 'Japanese' },
          { code: 'ko', name: 'Korean' },
          { code: 'zh', name: 'Chinese' },
        ]);
      }
    };
    fetchLanguages();
  }, []);

  // Translate function
  const translate = useCallback(async (text, source, target) => {
    if (!text?.trim()) {
      setTargetText('');
      return;
    }

    if (source === target) {
      setTargetText(text);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await translationAPI.translate(text, source, target);
      if (response.data.success) {
        setTargetText(response.data.data.translated);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError('Translation failed. Please try again.');
      // Fallback to MyMemory API directly
      try {
        const sourceLang = source === 'fil' ? 'tl' : source;
        const targetLang = target === 'fil' ? 'tl' : target;
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data.responseStatus === 200) {
          setTargetText(data.responseData.translatedText);
          setError(null);
        }
      } catch (fallbackErr) {
        console.error('Fallback translation failed:', fallbackErr);
      }
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Debounced translate
  const debouncedTranslate = useCallback((text) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      translate(text, sourceLanguage, targetLanguage);
    }, 500);
  }, [translate, sourceLanguage, targetLanguage]);

  // Handle source text change
  const handleSourceTextChange = (text) => {
    setSourceText(text);
    debouncedTranslate(text);
  };

  // Swap languages
  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  // Handle language changes
  const handleSourceLanguageChange = (lang) => {
    setSourceLanguage(lang);
    if (sourceText) {
      translate(sourceText, lang, targetLanguage);
    }
  };

  const handleTargetLanguageChange = (lang) => {
    setTargetLanguage(lang);
    if (sourceText) {
      translate(sourceText, sourceLanguage, lang);
    }
  };

  return {
    sourceText,
    targetText,
    sourceLanguage,
    targetLanguage,
    languages,
    isTranslating,
    error,
    setSourceText: handleSourceTextChange,
    setTargetText,
    setSourceLanguage: handleSourceLanguageChange,
    setTargetLanguage: handleTargetLanguageChange,
    swapLanguages,
    translate,
  };
};
