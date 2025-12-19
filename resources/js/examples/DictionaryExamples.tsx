/**
 * Dictionary API Integration Examples
 * Practical examples for using the API integration in components
 */

// ============================================================================
// EXAMPLE 1: Basic Dictionary Lookup
// ============================================================================

import { useState } from 'react';
import { 
  fetchDictionaryDefinition, 
  SUPPORTED_LANGUAGES,
  DictionaryApiResponse
} from '../services/dictionaryApi';

function BasicDictionaryExample() {
  const [word, setWord] = useState('');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState<DictionaryApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const definitions = await fetchDictionaryDefinition(word, language);
      setResult(definitions[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Enter word" />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div>
          <h3>{result.word}</h3>
          <p>{result.pronunciation?.text}</p>
          {result.entries?.[0]?.definitions?.map((def: any, i: number) => (
            <p key={i}>{def.definition}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Using Custom Hooks
// ============================================================================

import { useDictionaryDefinition, useTranslation, useVoiceInput, useTextToSpeech } from '../hooks/useDictionary';

function DictionaryWithHooksExample() {
  const dictionaryHook = useDictionaryDefinition({
    onSuccess: () => console.log('Definition fetched!'),
    onError: (error) => console.error('Error:', error),
  });

  const translationHook = useTranslation();
  const voiceHook = useVoiceInput();
  const speechHook = useTextToSpeech();

  const [word, setWord] = useState('');
  const [language, setLanguage] = useState('en');

  const handleSearch = async () => {
    await dictionaryHook.fetch(word, language);
  };

  const handleTranslate = async () => {
    if (!dictionaryHook.data || dictionaryHook.data.length === 0) return;
    const targetLang = language === 'en' ? 'es' : 'en';
    const translationResult = await translationHook.translate(word, language, targetLang);
    console.log('Translation:', translationResult);
  };

  const handleVoiceInput = async () => {
    try {
      const transcript = await voiceHook.startListening(language);
      setWord(transcript);
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  const handleSpeak = () => {
    if (!dictionaryHook.data) return;
    if (speechHook.isSpeaking) {
      speechHook.stop();
    } else {
      speechHook.speak(word, language);
    }
  };

  return (
    <div>
      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter word or use microphone"
      />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>

      <button onClick={handleSearch} disabled={dictionaryHook.loading}>
        Search
      </button>
      <button onClick={handleVoiceInput} disabled={voiceHook.loading}>
        {voiceHook.loading ? 'Listening...' : '🎤 Voice Input'}
      </button>
      <button onClick={handleSpeak} disabled={!dictionaryHook.data}>
        {speechHook.isSpeaking ? '🔊 Stop' : '🔊 Speak'}
      </button>
      <button onClick={handleTranslate} disabled={translationHook.loading || !dictionaryHook.data}>
        {translationHook.loading ? 'Translating...' : 'Translate'}
      </button>

      {dictionaryHook.error && <p style={{ color: 'red' }}>{dictionaryHook.error.message}</p>}
      {translationHook.error && <p style={{ color: 'red' }}>{translationHook.error.message}</p>}
      {voiceHook.error && <p style={{ color: 'red' }}>{voiceHook.error.message}</p>}

      {dictionaryHook.data && dictionaryHook.data.length > 0 && (
        <div>
          <h3>{dictionaryHook.data[0]?.word}</h3>
          <p>{dictionaryHook.data[0]?.pronunciation?.text}</p>
        </div>
      )}

      {translationHook.data && (
        <div>
          <h4>Translation ({translationHook.data.source})</h4>
          <p>{translationHook.data.translatedText}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Translation with Automatic Fallback
// ============================================================================

import { translateText } from '../services/dictionaryApi';

async function demonstrateTranslationFallback() {
  try {
    // This will try My Memory first, then fall back to LibreTranslate if needed
    const result = await translateText('hello', 'en', 'es');
    console.log('Translated text:', result.translatedText);
    console.log('Used API:', result.source); // Will log 'mymemory' or 'libretranslate'
  } catch (error) {
    console.error('Translation failed completely:', error);
  }
}

// ============================================================================
// EXAMPLE 4: Speech Features
// ============================================================================

import { speakText, getSpeechVoice, speechSupport, startVoiceInput, stopSpeech } from '../services/dictionaryApi';

async function demonstrateSpeechFeatures() {
  // Check if browser supports speech synthesis
  if (!speechSupport.synthesis) {
    console.log('Text-to-Speech not supported');
    return;
  }

  // Get the voice for a specific language
  const voice = getSpeechVoice('en');
  console.log('Available voice:', voice?.name);

  // Speak text
  speakText('Hello, how are you?', 'en');

  // For speech recognition, check support
  if (!speechSupport.recognition) {
    console.log('Speech Recognition not supported');
    return;
  }

  // Start voice input
  try {
    const transcript = await startVoiceInput('en');
    console.log('You said:', transcript);
  } catch (error) {
    console.error('Voice recognition error:', error);
  }
}

// ============================================================================
// EXAMPLE 5: Complete Integration in a Component
// ============================================================================

function CompleteIntegrationExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [definition, setDefinition] = useState<DictionaryApiResponse | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Handle word search
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoadingDefinition(true);
    setDefinition(null);
    setTranslation(null);

    try {
      const results = await fetchDictionaryDefinition(searchTerm, selectedLanguage);
      setDefinition(results[0]);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingDefinition(false);
    }
  };

  // Handle translation
  const handleTranslate = async () => {
    if (!definition) return;

    setIsLoadingTranslation(true);

    try {
      const targetLang = selectedLanguage === 'en' ? 'es' : 'en';
      const result = await translateText(definition.word, selectedLanguage, targetLang);
      setTranslation(result.translatedText);
    } catch (error) {
      alert(`Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  // Handle voice input
  const handleVoiceSearch = async () => {
    if (!speechSupport.recognition) {
      alert('Speech recognition not supported');
      return;
    }

    try {
      const transcript = await startVoiceInput(selectedLanguage);
      if (transcript) {
        setSearchTerm(transcript);
        // Trigger search with the transcript
        setTimeout(() => {
          const form = document.getElementById('search-form');
          if (form instanceof HTMLFormElement) form.requestSubmit();
        }, 100);
      }
    } catch (error) {
      alert(`Voice input error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle text-to-speech
  const handleSpeak = () => {
    if (!definition) return;

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(definition.word, selectedLanguage);
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  };

  return (
    <div className="dictionary-container">
      <form id="search-form" onSubmit={handleSearch}>
        <div className="search-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a word..."
            disabled={isLoadingDefinition}
          />

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isLoadingDefinition}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>

          <button type="submit" disabled={isLoadingDefinition}>
            {isLoadingDefinition ? 'Searching...' : 'Search'}
          </button>

          {speechSupport.recognition && (
            <button type="button" onClick={handleVoiceSearch}>
              🎤 Voice
            </button>
          )}
        </div>
      </form>

      {definition && (
        <div className="result">
          <div className="word-header">
            <h2>{definition.word}</h2>
            {speechSupport.synthesis && (
              <button onClick={handleSpeak} className={isSpeaking ? 'speaking' : ''}>
                {isSpeaking ? '⏹️ Stop' : '🔊 Speak'}
              </button>
            )}
          </div>

          <p className="pronunciation">{definition.pronunciation?.text}</p>

          <div className="definitions">
            {definition.entries?.map((entry: any, idx: number) => (
              <div key={idx}>
                <h4>{entry.partOfSpeech}</h4>
                {entry.definitions?.map((def: any, defIdx: number) => (
                  <div key={defIdx}>
                    <p>{def.definition}</p>
                    {def.example && <p className="example">"{def.example}"</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button onClick={handleTranslate} disabled={isLoadingTranslation}>
            {isLoadingTranslation ? 'Translating...' : 'Translate'}
          </button>

          {translation && (
            <div className="translation">
              <h4>Translation</h4>
              <p>{translation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export {
  BasicDictionaryExample,
  DictionaryWithHooksExample,
  demonstrateTranslationFallback,
  demonstrateSpeechFeatures,
  CompleteIntegrationExample,
};
