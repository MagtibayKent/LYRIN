import { useState, useEffect, useRef, FormEventHandler } from 'react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, BookOpen, Volume2, Sparkles, Loader2, Mic, MicOff, Globe } from 'lucide-react';
import {
  fetchDictionaryDefinition,
  translateText,
  speakText,
  stopSpeech,
  startVoiceInput,
  speechSupport,
  SUPPORTED_LANGUAGES,
} from '../services/dictionaryApi';

interface DictionaryEntry {
  word: string;
  pronunciation?: {
    text?: string;
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

interface DictionaryResult {
  auth?: {
    user?: {
      name: string;
      email: string | null;
    } | null;
  };
  [key: string]: any;
}

const languages = SUPPORTED_LANGUAGES;

export default function DictionaryPage() {
  const page = usePage<DictionaryResult>();
  const pageProps = page.props;
  const auth = pageProps.auth || { user: null };

  const [word, setWord] = useState('');
  const [language, setLanguage] = useState('en');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dictionaryResult, setDictionaryResult] = useState<DictionaryEntry[] | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationTargetLang, setTranslationTargetLang] = useState('es');
  const [voiceInputLoading, setVoiceInputLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSavedRef = useRef<{ word: string; language: string } | null>(null);

  /**
   * Fetch translation for the word
   */
  const handleTranslation = async () => {
    if (!word.trim() || !result) return;

    setTranslationLoading(true);
    setTranslation(null);

    try {
      const translationResult = await translateText(
        result.word,
        language,
        translationTargetLang
      );
      setTranslation(translationResult.translatedText);
    } catch (error) {
      setTranslation(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTranslationLoading(false);
    }
  };

  /**
   * Save dictionary search to history
   */
  const saveDictionaryHistory = async (word: string, language: string) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      await fetch('/dictionary/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          word: word,
          language: language,
        }),
      });
    } catch (error) {
      // Silently fail - history saving shouldn't block the user experience
    }
  };

  /**
   * Check if a word is a borrowed word (anglicism, loanword, etc.) in the target language
   */
  const checkIfBorrowedWord = (results: DictionaryEntry[], targetLanguage: string, word: string): boolean => {
    if (targetLanguage === 'en') {
      // English is the source language, so no need to check
      return false;
    }

    // First, check if it's a common English word being searched in non-English dictionaries
    // These should be rejected immediately
    const commonEnglishWords = ['hello', 'hi', 'ok', 'okay', 'yes', 'no', 'bye', 'thanks', 'please', 'sorry', 'wow', 'hey', 'yeah', 'yep', 'nope'];
    if (commonEnglishWords.includes(word.toLowerCase()) && targetLanguage !== 'en') {
      return true;
    }

    // Check all entries and definitions for indicators of borrowed words
    for (const result of results) {
      // Check raw structure first
      const rawDefText = JSON.stringify(result).toLowerCase();
      if (rawDefText.includes('anglicism') || rawDefText.includes('borrowed from') || rawDefText.includes('loanword')) {
        return true;
      }

      const entries = result.entries || (result as any).meanings || [];
      
      for (const entry of entries) {
        const definitions = entry.definitions || [];
        
        for (const def of definitions) {
          const defText = (def.definition || def.text || def.meaning || def.value || def.content || '').toLowerCase();
          
          // Check for common indicators of borrowed words
          const borrowedIndicators = [
            'anglicism',
            'borrowed from',
            'loanword',
            'from english',
            'from french',
            'from spanish',
            'from german',
            'from italian',
            'from latin',
            'from greek',
            'imported from',
            'adopted from',
            'taken from',
            'derived from english',
            'english word',
            'english term',
            '(anglicism)',
            '[anglicism]',
          ];
          
          // If definition contains any borrowed word indicators, it's likely a borrowed word
          if (borrowedIndicators.some(indicator => defText.includes(indicator))) {
            return true;
          }
        }
      }
    }

    return false;
  };

  /**
   * Search for word definition using Free Dictionary API
   */
  // Validate that input contains only letters (no numbers, symbols, or spaces)
  const isValidWord = (word: string): boolean => {
    // Allow only letters (including accented characters), no spaces, numbers, or symbols
    const validPattern = /^[a-zA-ZÀ-ÿ]+$/;
    return validPattern.test(word.trim());
  };

  const handleWordChange = (value: string) => {
    // Filter out numbers, symbols, and spaces - keep only letters
    const filtered = value.replace(/[^a-zA-ZÀ-ÿ]/g, '');
    setWord(filtered);
  };

  const searchWord = async (searchWord: string, searchLanguage: string) => {
    if (!searchWord.trim()) return;

    // Validate input contains only letters
    if (!isValidWord(searchWord)) {
      setSearchError('Please enter only letters. Numbers, symbols, and spaces are not allowed.');
      setSearched(true);
      setDictionaryResult(null);
      return;
    }

    setSearching(true);
    setSearched(false);
    setSearchError(null);
    setDictionaryResult(null);
    setTranslation(null);
    // Reset last saved ref for new search
    lastSavedRef.current = null;

    try {
      const results = await fetchDictionaryDefinition(searchWord, searchLanguage);
      
      if (results && results.length > 0) {
        // Check if the word is actually in this language or just a borrowed word
        const isBorrowedWord = checkIfBorrowedWord(results, searchLanguage, searchWord);
        
        if (isBorrowedWord) {
          // Word is a borrowed word (anglicism, etc.) - not native to this language
          const langName = languages.find(l => l.code === searchLanguage)?.name || searchLanguage.toUpperCase();
          setSearchError(`Word "${searchWord}" is not a native ${langName} word. It appears to be borrowed from another language. Please try searching in the original language dictionary.`);
          setSearched(true);
          setDictionaryResult(null);
        } else {
          // Set results and let formatResult handle validation
          setDictionaryResult(results);
          setSearched(true);
          setSearchError(null);
        }
      } else {
        // No results returned
        const langName = languages.find(l => l.code === searchLanguage)?.name || searchLanguage.toUpperCase();
        setSearchError(`Word "${searchWord}" not found in ${langName} dictionary. Please try a different language or check the spelling.`);
        setSearched(true);
        setDictionaryResult(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch word definition';
      
      // Check if it's a 404 error (word not found)
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        const langName = languages.find(l => l.code === searchLanguage)?.name || searchLanguage.toUpperCase();
        setSearchError(`Word "${searchWord}" not found in ${langName} dictionary. Please try a different language or check the spelling.`);
      } else {
        setSearchError(errorMessage);
      }
      
      setSearched(true);
      setDictionaryResult(null);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Handle voice input
   */
  const handleVoiceInput = async () => {
    if (!speechSupport.recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    setVoiceInputLoading(true);

    try {
      const transcript = await startVoiceInput(language);
      if (transcript.trim()) {
        // Filter transcript to only letters
        const filteredTranscript = transcript.replace(/[^a-zA-ZÀ-ÿ]/g, '');
        if (filteredTranscript) {
          setWord(filteredTranscript);
          // Trigger search after voice input
          setTimeout(() => {
            searchWord(filteredTranscript, language);
          }, 100);
        }
      }
    } catch (error) {
      alert(`Voice input error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVoiceInputLoading(false);
    }
  };

  /**
   * Handle text-to-speech
   */
  const handleSpeak = () => {
    if (!speechSupport.synthesis) {
      alert('Text-to-Speech is not supported in your browser');
      return;
    }

    if (!result) return;

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(result.word, language);
      // Reset speaking state after 5 seconds (safety timeout)
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  };

  const handleSearch: FormEventHandler = (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    searchWord(word, language);
  };

  const formatResult = (apiResult: DictionaryEntry[] | undefined) => {
    if (!apiResult || apiResult.length === 0) return null;

    const entry = apiResult[0];
    
    // Must have a word to proceed
    if (!entry.word) {
      return null;
    }
    
    // Handle different API response structures
    // Support both 'entries' and 'meanings' field names
    let entries = entry.entries || (entry as any).meanings || [];
    
    // If entries is empty, check for alternative structures
    if (!entries || entries.length === 0) {
      // Check if definitions are directly in the entry
      if ((entry as any).definitions && Array.isArray((entry as any).definitions)) {
        entries = [{
          partOfSpeech: (entry as any).partOfSpeech || '',
          definitions: (entry as any).definitions
        }];
      }
      // Check for 'senses' or other alternative structures
      else if ((entry as any).senses && Array.isArray((entry as any).senses)) {
        entries = (entry as any).senses.map((sense: any) => ({
          partOfSpeech: sense.partOfSpeech || (entry as any).partOfSpeech || '',
          definitions: sense.definitions || (sense.definition ? [{ definition: sense.definition }] : [])
        }));
      }
      // Check if the entry itself has a definition field
      else if ((entry as any).definition) {
        entries = [{
          partOfSpeech: (entry as any).partOfSpeech || '',
          definitions: [{ definition: (entry as any).definition }]
        }];
      }
    }
    
    // Ensure entries have proper structure - normalize definitions
    entries = entries.map((ent: any) => {
      // If definitions is empty or missing, try to find them
      if (!ent.definitions || ent.definitions.length === 0) {
        // Check if definition is a string
        if (ent.definition && typeof ent.definition === 'string') {
          ent.definitions = [{ definition: ent.definition }];
        }
        // Check if there's a 'definitions' field that's not an array
        else if (ent.definitions && !Array.isArray(ent.definitions)) {
          ent.definitions = [{ definition: ent.definitions }];
        }
        // Check for 'senses' within the entry
        else if (ent.senses && Array.isArray(ent.senses)) {
          ent.definitions = ent.senses.map((sense: any) => ({
            definition: sense.definition || sense.text || '',
            example: sense.example,
            synonyms: sense.synonyms
          })).filter((def: any) => def.definition);
        }
      }
      
      // Ensure definitions array items have the right structure
      if (ent.definitions && Array.isArray(ent.definitions)) {
        ent.definitions = ent.definitions.map((def: any) => {
          // If definition is a string, wrap it in an object
          if (typeof def === 'string') {
            return { definition: def };
          }
          // If definition object doesn't have 'definition' property, check for 'text' or 'meaning'
          if (def && !def.definition) {
            return {
              definition: def.text || def.meaning || def.value || def.content || '',
              example: def.example,
              synonyms: def.synonyms
            };
          }
          return def;
        }).filter((def: any) => def.definition && def.definition.trim() !== '');
      } else if (!ent.definitions) {
        // If no definitions array, check for other possible fields
        if (ent.definition && typeof ent.definition === 'string') {
          ent.definitions = [{ definition: ent.definition }];
        } else if (ent.text) {
          ent.definitions = [{ definition: ent.text }];
        } else if (ent.meaning) {
          ent.definitions = [{ definition: ent.meaning }];
        }
      }
      
      return ent;
    });
    
    // Note: We don't return null here even if no definitions found
    // This allows the UI to display the word and show appropriate error message
    // The validation for "word not in language" happens in the render logic
    
    // Extract pronunciation - could be string or object
    let pronunciation = '';
    if (typeof entry.pronunciation === 'string') {
      pronunciation = entry.pronunciation;
    } else if (entry.pronunciation?.text) {
      pronunciation = entry.pronunciation.text;
    } else if (Array.isArray(entry.pronunciation)) {
      pronunciation = entry.pronunciation[0] || '';
    } else if ((entry as any).phonetic) {
      pronunciation = (entry as any).phonetic;
    }

    // If we have entries, extract the first definition
    let partOfSpeech = '';
    let definition = '';
    let example = '';
    let synonyms: string[] = [];
    
    if (entries && entries.length > 0) {
      const firstMeaning = entries[0];
      
      // Handle different definition structures
      let firstDefinition = null;
      if (firstMeaning?.definitions && Array.isArray(firstMeaning.definitions) && firstMeaning.definitions.length > 0) {
        firstDefinition = firstMeaning.definitions[0];
      } else if (firstMeaning?.definition) {
        // Single definition object
        firstDefinition = firstMeaning;
      } else if (typeof firstMeaning === 'string') {
        // Definition is a string
        firstDefinition = { definition: firstMeaning };
      }
      
      partOfSpeech = firstMeaning?.partOfSpeech || '';
      definition = firstDefinition?.definition || '';
      example = firstDefinition?.example || '';
      synonyms = firstDefinition?.synonyms || [];
    }

    const result = {
      word: entry.word,
      pronunciation: pronunciation,
      partOfSpeech: partOfSpeech,
      definition: definition,
      example: example,
      synonyms: synonyms,
      allEntries: entries || [],
      source: entry.source?.url || '',
    };
    
    return result;
  };

  const result = formatResult(dictionaryResult || undefined);

  // Save to history when we have a valid result with definitions
  // Only save after a search is completed (searched=true, searching=false)
  useEffect(() => {
    // Only save when search is complete and we have valid results
    if (result && result.allEntries && result.allEntries.length > 0 && !searchError && searched && !searching) {
      const hasValidDefinitions = result.allEntries.some((ent: any) => {
        const defs = ent.definitions || [];
        return defs.length > 0 && defs.some((def: any) => {
          const defText = def.definition || def.text || def.meaning || '';
          return defText && defText.trim() !== '';
        });
      });
      
      // Only save if we have valid definitions and haven't already saved this exact search
      // Use result.word instead of state word to ensure we save the actual searched word
      if (hasValidDefinitions && result.word && language) {
        const searchKey = `${result.word.toLowerCase()}_${language.toLowerCase()}`;
        const lastSaved = lastSavedRef.current;
        const lastSavedKey = lastSaved ? `${lastSaved.word.toLowerCase()}_${lastSaved.language.toLowerCase()}` : null;
        
        if (searchKey !== lastSavedKey) {
          saveDictionaryHistory(result.word, language);
          lastSavedRef.current = { word: result.word, language };
        }
      }
    }
  }, [result, searchError, searched, searching, language]); // Removed 'word' from dependencies to prevent saving on every keystroke

  const popularWords = [
    { word: 'hello', lang: 'en' },
    { word: 'bonjour', lang: 'fr' },
    { word: 'hola', lang: 'es' },
    { word: 'water', lang: 'en' },
    { word: 'friend', lang: 'en' },
    { word: 'amigo', lang: 'es' },
  ];

  if (!auth.user) {
    return null; // Should not happen due to AllowGuests middleware, but safety check
  }

  return (
    <AuthenticatedLayout user={auth.user}>
      <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-5 py-3 bg-purple-200 rounded-full border-[5px] border-purple-600 mb-4 shadow-[4px_4px_0px_0px_#7c3aed] animate-[bounce-gentle_2s_ease-in-out_infinite]">
          <BookOpen className="w-6 h-6 text-purple-700" />
          <span className="text-purple-800 logo-font text-lg">Word Definitions</span>
        </div>
        <div className="relative inline-block">
          <h1 className="text-5xl lg:text-6xl text-black logo-font mb-3" style={{
            textShadow: '4px 4px 0px #a855f7'
          }}>
            Dictionary 📚
          </h1>
          <div className="absolute -top-8 -right-10 text-6xl animate-[spin_10s_linear_infinite]">📖</div>
          <div className="absolute -bottom-4 -left-8 text-5xl animate-[wiggle_3s_ease-in-out_infinite]">✏️</div>
        </div>
        <p className="text-gray-700 text-xl logo-font">
          Search for word definitions and meanings across different languages
        </p>
      </div>

      <div className="space-y-6">
        {/* Search Section */}
        <Card className="p-8 rounded-[3rem] shadow-[12px_12px_0px_0px_#000] bg-white border-[6px] border-black relative overflow-hidden">
          <div className="absolute top-8 right-8 text-9xl opacity-10 animate-[wiggle_4s_ease-in-out_infinite]">🔍</div>
          
          <form onSubmit={handleSearch} className="space-y-4 relative z-10">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <div className="flex gap-2 items-center">
                  <Input
                    id="word-search"
                    name="word"
                    autoComplete="off"
                    value={word}
                    onChange={(e) => handleWordChange(e.target.value)}
                    placeholder="Search for a word..."
                    className="rounded-3xl border-[4px] border-gray-800 h-16 bg-[#FFFBF0] px-5 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.3)] focus:border-purple-500 transition-all flex-1"
                    disabled={searching || voiceInputLoading}
                  />
                  {speechSupport.recognition && (
                    <Button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={searching || voiceInputLoading}
                      className="rounded-full border-[4px] border-black hover:bg-blue-200 w-16 h-16 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all p-0 flex items-center justify-center"
                      title="Click to start voice input"
                    >
                      {voiceInputLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      ) : (
                        <Mic className="w-6 h-6 text-blue-600" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <Select 
                value={language} 
                onValueChange={(value) => {
                  setLanguage(value);
                  setTranslation(null);
                }}
                disabled={searching || voiceInputLoading}
                name="language"
              >
                <SelectTrigger className="rounded-3xl border-[4px] border-gray-800 h-16 bg-[#FFFBF0] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">
                      {languages.find(l => l.code === language)?.flag || '🌍'}
                    </span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-3xl border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_#000] max-h-[400px] overflow-y-auto">
                  {languages.map((lang) => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code} 
                      className="text-lg cursor-pointer hover:bg-purple-50 focus:bg-purple-100 rounded-2xl mx-2 my-1 transition-all"
                    >
                      <div className="flex items-center gap-3 py-2">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="logo-font">{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={searching || voiceInputLoading}
              className="w-full md:w-auto px-10 py-8 text-xl rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-[6px_6px_0px_0px_#6b21a8] border-[5px] border-black hover:scale-105 transition-all hover:shadow-[8px_8px_0px_0px_#6b21a8] active:translate-x-1 active:translate-y-1 logo-font disabled:opacity-50"
            >
              {searching ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6 mr-2" />
                  Search 🔍
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results Section */}
        {searched && (
          <Card className="p-8 rounded-[3rem] shadow-[12px_12px_0px_0px_#000] bg-white border-[6px] border-black relative overflow-hidden">
            {result && result.allEntries && result.allEntries.length > 0 && result.allEntries.some((ent: any) => {
              const defs = ent.definitions || [];
              return defs.length > 0 && defs.some((def: any) => {
                const defText = def.definition || def.text || def.meaning || '';
                return defText && defText.trim() !== '';
              });
            }) ? (
              <div className="space-y-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h2 className="text-4xl text-black logo-font capitalize" style={{
                        textShadow: '2px 2px 0px #FFD89B'
                      }}>{result.word}</h2>
                      {speechSupport.synthesis && (
                        <Button
                          onClick={handleSpeak}
                          variant="ghost"
                          size="icon"
                          className={`rounded-full border-[3px] transition-all w-14 h-14 hover:scale-110 ${
                            isSpeaking
                              ? 'bg-red-200 border-red-500 hover:bg-red-300'
                              : 'hover:bg-purple-200 border-transparent hover:border-purple-500'
                          }`}
                          title={isSpeaking ? 'Stop speaking' : 'Pronounce word'}
                        >
                          {isSpeaking ? (
                            <MicOff className="w-7 h-7 text-red-600" />
                          ) : (
                            <Volume2 className="w-7 h-7 text-purple-600" />
                          )}
                        </Button>
                      )}
                    </div>
                    {result.pronunciation && (
                      <p className="text-gray-700 text-xl mb-3 logo-font">{result.pronunciation}</p>
                    )}
                    {result.partOfSpeech && (
                      <div className="inline-block px-5 py-3 rounded-full bg-purple-200 text-purple-800 border-[3px] border-purple-600 logo-font shadow-[3px_3px_0px_0px_#7c3aed] capitalize">
                        {result.partOfSpeech}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 text-xl logo-font">
                      {languages.find(l => l.code === language)?.name || language.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="space-y-5 pt-6 border-t-[4px] border-dashed border-gray-400">
                  {/* Translation Section */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 border-[4px] border-green-400 shadow-[4px_4px_0px_0px_#10b981]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-6 h-6 text-green-600" />
                        <h3 className="text-2xl text-black logo-font">Translation 🌐</h3>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Select value={translationTargetLang} onValueChange={setTranslationTargetLang} name="translationTargetLang">
                          <SelectTrigger className="w-32 rounded-full border-[3px] border-green-600 bg-white text-sm shadow-[3px_3px_0px_0px_#16a34a] hover:shadow-[4px_4px_0px_0px_#16a34a] transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-[3px] border-green-600 bg-white shadow-[6px_6px_0px_0px_#16a34a] max-h-[300px] overflow-y-auto">
                            {languages.filter(lang => lang.code !== language).map((lang) => (
                              <SelectItem 
                                key={lang.code} 
                                value={lang.code} 
                                className="text-sm cursor-pointer hover:bg-green-50 focus:bg-green-100 rounded-xl mx-1 my-0.5 transition-all"
                              >
                                <div className="flex items-center gap-2 py-1">
                                  <span className="text-lg">{lang.flag}</span>
                                  <span className="logo-font">{lang.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleTranslation}
                          disabled={translationLoading}
                          variant="outline"
                          className="px-4 py-2 text-sm rounded-full border-[2px] border-green-600 hover:bg-green-200 transition-all"
                        >
                          {translationLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Translating...
                            </>
                          ) : (
                            <>
                              {translation ? 'Translate Again' : 'Translate'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    {translation ? (
                      <p className="text-gray-800 text-xl font-semibold">{translation}</p>
                    ) : (
                      <p className="text-gray-700 text-lg italic">Click "Translate" to see translation in another language</p>
                    )}
                  </div>
                  {/* Show message if word found but no definitions available */}
                  {result.word && (!result.allEntries || result.allEntries.length === 0) && !result.definition && (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 border-[4px] border-blue-400 shadow-[4px_4px_0px_0px_#3b82f6]">
                      <h3 className="text-2xl text-black logo-font mb-3">Definition 📖</h3>
                      <p className="text-gray-800 text-xl italic">No definition available for this word in the selected language dictionary.</p>
                    </div>
                  )}
                  
                  {result.allEntries && result.allEntries.length > 0 && result.allEntries.map((entry: { partOfSpeech?: string; definitions?: Array<{ definition?: string; example?: string; synonyms?: string[]; }>; }, entryIndex: number) => (
                    <div key={entryIndex} className="space-y-4">
                      {entry.partOfSpeech && (
                        <div className="inline-block px-5 py-3 rounded-full bg-purple-200 text-purple-800 border-[3px] border-purple-600 logo-font shadow-[3px_3px_0px_0px_#7c3aed] capitalize">
                          {entry.partOfSpeech}
                        </div>
                      )}
                      {entry.definitions && entry.definitions.length > 0 ? (
                        <>
                          {entry.definitions.slice(0, 3).map((def: { definition?: string; example?: string; synonyms?: string[]; }, defIndex: number) => (
                            <div key={defIndex} className="space-y-4">
                              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 border-[4px] border-blue-400 shadow-[4px_4px_0px_0px_#3b82f6]">
                                <h3 className="text-2xl text-black logo-font mb-3">
                                  {entryIndex === 0 && defIndex === 0 ? 'Definition 📖' : `Definition ${defIndex + 1}`}
                                </h3>
                                <p className="text-gray-800 text-xl">{def.definition || ''}</p>
                              </div>

                              {def.example && (
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-100 to-orange-100 border-[4px] border-yellow-400 shadow-[4px_4px_0px_0px_#f59e0b]">
                                  <h4 className="text-xl text-black logo-font mb-3">Example 💬</h4>
                                  <p className="text-gray-800 text-lg italic">"{def.example}"</p>
                                </div>
                              )}

                              {def.synonyms && def.synonyms.length > 0 && (
                                <div>
                                  <h4 className="text-xl text-black logo-font mb-4">Synonyms ✨</h4>
                                  <div className="flex flex-wrap gap-3">
                                    {def.synonyms.map((synonym: string, synIndex: number) => (
                                      <span
                                        key={synIndex}
                                        className="px-5 py-3 rounded-full bg-yellow-200 text-yellow-800 border-[3px] border-yellow-500 logo-font shadow-[3px_3px_0px_0px_#eab308] hover:scale-105 transition-transform cursor-pointer"
                                      >
                                        {synonym}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 border-[4px] border-blue-400 shadow-[4px_4px_0px_0px_#3b82f6]">
                          <h3 className="text-2xl text-black logo-font mb-3">Definition 📖</h3>
                          <p className="text-gray-800 text-xl italic">No definition available for this part of speech.</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {result.definition && (
                    <>
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 border-[4px] border-blue-400 shadow-[4px_4px_0px_0px_#3b82f6]">
                        <h3 className="text-2xl text-black logo-font mb-3">Definition 📖</h3>
                        <p className="text-gray-800 text-xl">{result.definition}</p>
                      </div>

                      {result.example && (
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-100 to-orange-100 border-[4px] border-yellow-400 shadow-[4px_4px_0px_0px_#f59e0b]">
                          <h4 className="text-xl text-black logo-font mb-3">Example 💬</h4>
                          <p className="text-gray-800 text-lg italic">"{result.example}"</p>
                        </div>
                      )}

                      {result.synonyms.length > 0 && (
                        <div>
                          <h4 className="text-xl text-black logo-font mb-4">Synonyms ✨</h4>
                          <div className="flex flex-wrap gap-3">
                            {result.synonyms.map((synonym: string, index: number) => (
                              <span
                                key={index}
                                className="px-5 py-3 rounded-full bg-yellow-200 text-yellow-800 border-[3px] border-yellow-500 logo-font shadow-[3px_3px_0px_0px_#eab308] hover:scale-105 transition-transform cursor-pointer"
                              >
                                {synonym}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {result.source && (
                    <div className="pt-4 border-t-[4px] border-dashed border-gray-400">
                      <p className="text-sm text-gray-600">
                        Source: <a href={result.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {result.source}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 relative z-10">
                <div className="text-8xl mb-4 animate-[wiggle_2s_ease-in-out_infinite]">😕</div>
                <h3 className="text-3xl text-black logo-font mb-3">Word not found</h3>
                <p className="text-gray-700 text-xl mb-2">
                  {searchError || (dictionaryResult && dictionaryResult.length > 0 
                    ? `Word "${word}" not found in ${languages.find(l => l.code === language)?.name || language.toUpperCase()} dictionary. Please try a different language or check the spelling.`
                    : 'Try searching for another word or select a different language')}
                </p>
                <p className="text-sm text-gray-600">
                  The word might not exist in the selected language dictionary, or there might be a spelling error.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Popular Searches */}
        {!searched && (
          <Card className="p-8 rounded-[3rem] shadow-[12px_12px_0px_0px_#000] bg-white border-[6px] border-black relative overflow-hidden">
            <div className="absolute bottom-8 right-8 text-9xl opacity-10 animate-[float_6s_ease-in-out_infinite]">📝</div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h3 className="text-3xl text-black logo-font">Popular searches 🌟</h3>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
              {popularWords.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => {
                    setWord(item.word);
                    setLanguage(item.lang);
                    setTimeout(() => {
                      searchWord(item.word, item.lang);
                    }, 100);
                  }}
                  disabled={searching}
                  className="justify-start rounded-3xl border-[4px] border-black hover:bg-purple-200 hover:scale-105 transition-all py-7 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] bg-white logo-font text-lg active:translate-x-1 active:translate-y-1"
                >
                  <BookOpen className="w-6 h-6 mr-2" />
                  {item.word}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
    </AuthenticatedLayout>
  );
}