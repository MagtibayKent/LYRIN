import { useState, useCallback } from 'react';
import { dictionaryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * ============================================================================
 * DictionarySection Component
 * ============================================================================
 * 
 * A React component that integrates with the Wiktionary API
 * to look up word definitions, pronunciations, and translations.
 * 
 * Features:
 * - Multi-language support (12 languages)
 * - Definitions with part of speech
 * - Pronunciation (IPA) when available
 * - Etymology information
 * - Fallback to English Wiktionary for foreign words
 * - Loading states and error handling
 * 
 * @component
 */

// ============================================================================
// SUPPORTED LANGUAGES
// ============================================================================
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', wikiPrefix: 'en' },
  { code: 'es', name: 'Spanish', wikiPrefix: 'es' },
  { code: 'fr', name: 'French', wikiPrefix: 'fr' },
  { code: 'de', name: 'German', wikiPrefix: 'de' },
  { code: 'it', name: 'Italian', wikiPrefix: 'it' },
  { code: 'pt', name: 'Portuguese', wikiPrefix: 'pt' },
  { code: 'ja', name: 'Japanese', wikiPrefix: 'ja' },
  { code: 'ru', name: 'Russian', wikiPrefix: 'ru' },
  { code: 'zh', name: 'Chinese', wikiPrefix: 'zh' },
  { code: 'ko', name: 'Korean', wikiPrefix: 'ko' },
  { code: 'ar', name: 'Arabic', wikiPrefix: 'ar' },
  { code: 'hi', name: 'Hindi', wikiPrefix: 'hi' },
];

// ============================================================================
// WIKTIONARY API SERVICE
// ============================================================================

/**
 * Cleans wiki markup from text
 */
const cleanWikiMarkup = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\{\{impropia\|([^}]+)\}\}/gi, '$1')
    .replace(/\{\{plm\|([^}|]+)(?:\|[^}]*)?\}\}/gi, '$1')
    .replace(/\{\{l\|[^|]+\|([^}|]+)(?:\|[^}]*)?\}\}/gi, '$1')
    .replace(/\{\{(?:sinónimo|relacionado|antónimo)[^}]*\}\}/gi, '')
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
    .replace(/'''([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Parses Wiktionary wikitext to extract definitions
 * Handles multiple formats (English, Spanish, French, German, etc.)
 */
const parseWikitext = (wikitext, langCode = 'en') => {
  const result = {
    pronunciations: [],
    etymology: null,
    partsOfSpeech: [],
    rawExtract: null,
  };

  if (!wikitext) return result;

  // Extract pronunciation (IPA)
  const ipaPatterns = [
    /\{\{IPA\|[^}]*\|([^}|]+)\}\}/g,
    /\/[^\/\n]{2,20}\//g,
  ];

  ipaPatterns.forEach(pattern => {
    const matches = wikitext.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const ipaMatch = match.match(/\/[^\/]+\//);
        if (ipaMatch && !result.pronunciations.includes(ipaMatch[0])) {
          result.pronunciations.push(ipaMatch[0]);
        }
      });
    }
  });

  // Extract etymology
  const etymologyPatterns = [
    /===?\s*Etimolog[ií]a\s*\d*\s*===?\s*\n([\s\S]*?)(?=\n===|$)/i,
    /===?\s*Etymology\s*\d*\s*===?\s*\n([\s\S]*?)(?=\n===|$)/i,
    /===?\s*Étymologie\s*===?\s*\n([\s\S]*?)(?=\n===|$)/i,
  ];

  for (const pattern of etymologyPatterns) {
    const match = wikitext.match(pattern);
    if (match) {
      const etymology = cleanWikiMarkup(match[1]);
      if (etymology.length > 10) {
        result.etymology = etymology.substring(0, 500);
        break;
      }
    }
  }

  // Parts of speech mapping
  const posMapping = {
    'Noun': 'noun', 'Verb': 'verb', 'Adjective': 'adjective', 'Adverb': 'adverb',
    'Pronoun': 'pronoun', 'Preposition': 'preposition', 'Conjunction': 'conjunction',
    'Interjection': 'interjection', 'Article': 'article', 'Determiner': 'determiner',
    'sustantivo': 'noun', 'verbo': 'verb', 'adjetivo': 'adjective', 'adverbio': 'adverb',
    'pronombre': 'pronoun', 'preposición': 'preposition', 'conjunción': 'conjunction',
    'interjección': 'interjection', 'artículo': 'article',
    'nom': 'noun', 'verbe': 'verb', 'adjectif': 'adjective',
  };

  // Method 1: Spanish/Portuguese format with {{pos|lang}} templates
  const templatePosRegex = /====?\s*\{\{(\w+)\|[^}]+\}\}\s*====?\s*\n([\s\S]*?)(?=\n====?|\n==\s|$)/gi;
  let templateMatch;
  while ((templateMatch = templatePosRegex.exec(wikitext)) !== null) {
    const posRaw = templateMatch[1].toLowerCase();
    const posType = posMapping[posRaw] || posRaw;
    const section = templateMatch[2];
    
    // Spanish format: ;1: definition text
    const spanishDefs = section.match(/^;(\d+):\s*(.+)$/gm);
    if (spanishDefs) {
      const definitions = spanishDefs.map(def => {
        return cleanWikiMarkup(def.replace(/^;\d+:\s*/, ''));
      }).filter(d => d.length > 0);
      
      if (definitions.length > 0) {
        result.partsOfSpeech.push({
          type: posType,
          definitions: definitions.slice(0, 5),
        });
      }
    }
  }

  // Method 2: English format with === Part of Speech ===
  if (result.partsOfSpeech.length === 0) {
    const englishPosPatterns = Object.keys(posMapping).filter(p => /^[A-Z]/.test(p));
    
    englishPosPatterns.forEach(pos => {
      const posRegex = new RegExp(`===\\s*${pos}\\s*===\\s*\\n([\\s\\S]*?)(?=\\n===|$)`, 'gi');
      let match;
      while ((match = posRegex.exec(wikitext)) !== null) {
        const section = match[1];
        const defMatches = section.match(/^#\s*[^#*:].+$/gm);
        
        if (defMatches) {
          const definitions = defMatches.map(def => {
            return cleanWikiMarkup(def.replace(/^#\s*/, ''));
          }).filter(d => d.length > 0);

          if (definitions.length > 0) {
            result.partsOfSpeech.push({
              type: posMapping[pos] || pos.toLowerCase(),
              definitions: definitions.slice(0, 5),
            });
          }
        }
      }
    });
  }

  // Method 3: Fallback - look for any numbered definitions
  if (result.partsOfSpeech.length === 0) {
    const anyDefs = wikitext.match(/^#\s*[^#*:].{10,}$/gm);
    if (anyDefs) {
      const definitions = anyDefs.map(def => cleanWikiMarkup(def.replace(/^#\s*/, '')))
        .filter(d => d.length > 5);
      
      if (definitions.length > 0) {
        result.partsOfSpeech.push({
          type: 'definition',
          definitions: definitions.slice(0, 5),
        });
      }
    }
  }

  // Fallback: Extract raw content if no structured definitions
  if (result.partsOfSpeech.length === 0) {
    const meaningfulContent = wikitext
      .split('\n')
      .filter(line => {
        return line.length > 20 && 
               !line.startsWith('==') && 
               !line.startsWith('{{') &&
               !line.startsWith('|') &&
               !line.startsWith('*') &&
               !line.startsWith(':');
      })
      .slice(0, 3)
      .map(line => cleanWikiMarkup(line))
      .filter(line => line.length > 10)
      .join(' ');
    
    if (meaningfulContent.length > 20) {
      result.rawExtract = meaningfulContent.substring(0, 300);
    }
  }

  return result;
};

/**
 * Fetches word definition from Wiktionary API
 */
const fetchWiktionaryDefinition = async (word, languageCode = 'en') => {
  const trimmedWord = word.trim();
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
  const wikiPrefix = lang?.wikiPrefix || 'en';
  
  const apiUrl = `https://${wikiPrefix}.wiktionary.org/w/api.php?` + new URLSearchParams({
    action: 'query',
    titles: trimmedWord,
    prop: 'revisions|extracts',
    rvprop: 'content',
    rvslots: 'main',
    exintro: '1',
    explaintext: '1',
    format: 'json',
    origin: '*',
  });

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages) {
      return { success: false, error: 'INVALID_RESPONSE' };
    }

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1' || pages[pageId].missing !== undefined) {
      if (languageCode !== 'en') {
        return fetchEnglishFallback(trimmedWord, lang?.name);
      }
      return { success: false, error: 'WORD_NOT_FOUND' };
    }

    const page = pages[pageId];
    const wikitext = page.revisions?.[0]?.slots?.main?.['*'];
    const extract = page.extract;
    
    if (!wikitext) {
      return { success: false, error: 'NO_CONTENT' };
    }

    const parsed = parseWikitext(wikitext, languageCode);
    
    const resultData = {
      word: page.title,
      language: lang?.name || 'English',
      pronunciations: parsed.pronunciations,
      etymology: parsed.etymology,
      meanings: parsed.partsOfSpeech,
      sourceUrl: `https://${wikiPrefix}.wiktionary.org/wiki/${encodeURIComponent(trimmedWord)}`,
    };

    if (parsed.partsOfSpeech.length > 0) {
      return { success: true, data: resultData };
    }

    if (parsed.rawExtract) {
      resultData.rawExtract = parsed.rawExtract;
      return { success: true, data: resultData };
    }

    if (extract && extract.length > 20) {
      resultData.rawExtract = extract;
      return { success: true, data: resultData };
    }

    if (languageCode !== 'en') {
      return fetchEnglishFallback(trimmedWord, lang?.name);
    }

    return { success: false, error: 'NO_DEFINITIONS' };

  } catch (error) {
    if (error.message === 'Failed to fetch') {
      return { success: false, error: 'NETWORK_ERROR' };
    }
    return { success: false, error: error.message };
  }
};

/**
 * Fallback: Search English Wiktionary for foreign words
 */
const fetchEnglishFallback = async (word, originalLanguage) => {
  const apiUrl = `https://en.wiktionary.org/w/api.php?` + new URLSearchParams({
    action: 'query',
    titles: word,
    prop: 'revisions|extracts',
    rvprop: 'content',
    rvslots: 'main',
    exintro: '1',
    explaintext: '1',
    format: 'json',
    origin: '*',
  });

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return { success: false, error: 'WORD_NOT_FOUND' };
    }

    const data = await response.json();
    const pages = data.query?.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === '-1' || pages[pageId].missing !== undefined) {
      return { success: false, error: 'WORD_NOT_FOUND' };
    }

    const page = pages[pageId];
    const wikitext = page.revisions?.[0]?.slots?.main?.['*'];
    const extract = page.extract;

    if (!wikitext) {
      return { success: false, error: 'NO_CONTENT' };
    }

    const parsed = parseWikitext(wikitext, 'en');

    const resultData = {
      word: page.title,
      language: `${originalLanguage} (via English Wiktionary)`,
      pronunciations: parsed.pronunciations,
      etymology: parsed.etymology,
      meanings: parsed.partsOfSpeech,
      rawExtract: parsed.rawExtract || (extract?.length > 20 ? extract : null),
      sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
      isFallback: true,
    };

    if (parsed.partsOfSpeech.length > 0 || resultData.rawExtract) {
      return { success: true, data: resultData };
    }

    return { success: false, error: 'NO_DEFINITIONS' };

  } catch {
    return { success: false, error: 'WORD_NOT_FOUND' };
  }
};

// ============================================================================
// HELPER: Highlight searched word in text
// ============================================================================
const highlightWord = (text, word) => {
  if (!text || !word) return text;
  const regex = new RegExp(`(${word})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    part.toLowerCase() === word.toLowerCase() 
      ? <mark key={i} className="highlight-word">{part}</mark>
      : part
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const DictionarySection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const getLanguageName = useCallback((code) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : 'Unknown';
  }, []);

  // Save search to history (backend) when user is logged in
  const saveSearchToHistory = async (word, phonetic, found) => {
    if (!user) return; // Only save if logged in
    
    try {
      // Call the backend API to save search history
      await dictionaryAPI.saveHistory(word, phonetic, found);
    } catch (err) {
      // Silently fail - history saving shouldn't break the search
      console.log('History save skipped:', err.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    const trimmedWord = searchTerm.trim();
    if (!trimmedWord) {
      setError('Please enter a word to search');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    
    const response = await fetchWiktionaryDefinition(trimmedWord, language);
    
    if (response.success) {
      setResult(response.data);
      // Save successful search to history
      saveSearchToHistory(trimmedWord, response.data?.pronunciations?.[0] || null, true);
    } else {
      // Save failed search to history too
      saveSearchToHistory(trimmedWord, null, false);
      
      switch (response.error) {
        case 'WORD_NOT_FOUND':
          setError(`"${trimmedWord}" was not found in the ${getLanguageName(language)} Wiktionary. Try a different word or spelling.`);
          break;
        case 'NO_DEFINITIONS':
          setError(`No definitions found for "${trimmedWord}". The entry may exist but lacks structured definitions.`);
          break;
        case 'NETWORK_ERROR':
          setError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setError('An error occurred while searching. Please try again later.');
      }
    }
    
    setLoading(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setResult(null);
    setError('');
  };

  return (
    <section id="section-dictionary" className="feature-container">
      <div className="feature-box">
        <h2 className="feature-title">Dictionary</h2>
        <p className="feature-subtitle">
          Look up word definitions, pronunciations, and etymology
        </p>
        
        <div className="dictionary-layout">
          {/* Search Form */}
          <form className="dictionary-search" onSubmit={handleSearch}>
            <div className="search-input-group">
              <input
                className="dict-input"
                type="text"
                placeholder="Enter a word..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Word to search"
                disabled={loading}
              />
              
              <select
                className="dict-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select language"
                disabled={loading}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="search-buttons">
              <button 
                className="dict-button" 
                type="submit" 
                disabled={loading || !searchTerm.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
              
              {(result || error) && (
                <button 
                  className="dict-button dict-button-secondary" 
                  type="button"
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Results Container */}
          <div className="dictionary-results">
            
            {/* Loading State */}
            {loading && (
              <div className="dict-card loading">
                <div className="loading-spinner"></div>
                <p>Searching Wiktionary...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="dict-card error">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <p className="error-hint">
                  Tip: Try checking the spelling or searching in a different language.
                </p>
              </div>
            )}

            {/* Success: Display Result */}
            {result && !loading && (
              <div className="dict-card">
                {/* Word Header */}
                <div className="dict-word-header">
                  <h3 className="dict-word">{result.word}</h3>
                  
                  {result.pronunciations.length > 0 && (
                    <span className="phonetic">
                      {result.pronunciations[0]}
                    </span>
                  )}
                </div>

                {/* Language Badge */}
                <span className={`language-badge ${result.isFallback ? 'fallback' : ''}`}>
                  {result.language}
                </span>

                {/* Fallback Notice */}
                {result.isFallback && (
                  <p className="fallback-notice">
                    ℹ️ Definition retrieved from English Wiktionary
                  </p>
                )}

                {/* Etymology */}
                {result.etymology && (
                  <div className="etymology-section">
                    <h4>Etymology</h4>
                    <p>{result.etymology}</p>
                  </div>
                )}
                
                {/* Structured Definitions */}
                {result.meanings && result.meanings.length > 0 && (
                  result.meanings.map((meaning, mIndex) => (
                    <div key={mIndex} className="meaning-section">
                      <p className="part-of-speech">{meaning.type}</p>
                      
                      <ol className="definitions-list">
                        {meaning.definitions.map((def, dIndex) => (
                          <li key={dIndex} className="definition-item">
                            <p className="definition-text">
                              {highlightWord(def, searchTerm)}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))
                )}

                {/* Raw Extract (fallback when no structured definitions) */}
                {result.rawExtract && (!result.meanings || result.meanings.length === 0) && (
                  <div className="raw-extract-section">
                    <h4>Description</h4>
                    <p>{highlightWord(result.rawExtract, searchTerm)}</p>
                  </div>
                )}
                
                {/* Source Link */}
                <div className="source-links">
                  <strong>Source:</strong>{' '}
                  <a 
                    href={result.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    Wiktionary
                  </a>
                </div>
              </div>
            )}

            {/* Initial State: Instructions */}
            {!result && !error && !loading && (
              <div className="dict-card dict-card-placeholder">
                <h3>How to Use</h3>
                <ol className="instructions-list">
                  <li>Type a word in the search box above</li>
                  <li>Select your preferred language</li>
                  <li>Click "Search" or press Enter</li>
                </ol>
                
                <div className="example-section">
                  <h4>Example Searches:</h4>
                  <p>
                    <strong>English:</strong> hello, world, computer<br />
                    <strong>Spanish:</strong> hola, amor, casa<br />
                    <strong>French:</strong> bonjour, maison, chat
                  </p>
                </div>
                
                <p className="api-credit">
                  Powered by{' '}
                  <a 
                    href="https://www.wiktionary.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Wiktionary
                  </a>
                  {' '}— the free dictionary
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DictionarySection;
