import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowRightLeft, Volume2, Zap, Sparkles, Mic, Loader2 } from 'lucide-react';
import { speakText, stopSpeech, startVoiceInput, speechSupport, SUPPORTED_LANGUAGES } from '../services/dictionaryApi';

// Mock translation data
const translations: Record<string, Record<string, string>> = {
  en: {
    hello: 'hello',
    goodbye: 'goodbye',
    thanks: 'thank you',
    please: 'please',
    yes: 'yes',
    no: 'no',
    water: 'water',
    food: 'food',
    friend: 'friend',
    love: 'love',
  },
  fr: {
    hello: 'bonjour',
    goodbye: 'au revoir',
    thanks: 'merci',
    please: 's\'il vous plaît',
    yes: 'oui',
    no: 'non',
    water: 'eau',
    food: 'nourriture',
    friend: 'ami',
    love: 'amour',
  },
  es: {
    hello: 'hola',
    goodbye: 'adiós',
    thanks: 'gracias',
    please: 'por favor',
    yes: 'sí',
    no: 'no',
    water: 'agua',
    food: 'comida',
    friend: 'amigo',
    love: 'amor',
  },
  de: {
    hello: 'hallo',
    goodbye: 'auf wiedersehen',
    thanks: 'danke',
    please: 'bitte',
    yes: 'ja',
    no: 'nein',
    water: 'wasser',
    food: 'essen',
    friend: 'freund',
    love: 'liebe',
  },
  ja: {
    hello: 'こんにちは',
    goodbye: 'さようなら',
    thanks: 'ありがとう',
    please: 'お願いします',
    yes: 'はい',
    no: 'いいえ',
    water: '水',
    food: '食べ物',
    friend: '友達',
    love: '愛',
  },
};

const languages = SUPPORTED_LANGUAGES;

export default function TranslatorPage() {
  const page = usePage();
  const auth = (page.props as any).auth as { user: { name: string; email: string | null } | null } | undefined;
  const [inputText, setInputText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('fr');
  const [translation, setTranslation] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [voiceInputLoading, setVoiceInputLoading] = useState(false);
  const [isSpeakingInput, setIsSpeakingInput] = useState(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);

  if (!auth?.user) {
    return null; // Should not happen due to AllowGuests middleware, but safety check
  }

  // Validate that input contains only letters and spaces (no numbers or symbols)
  const isValidText = (text: string): boolean => {
    // Allow letters (including accented characters), spaces, apostrophes, and hyphens
    const validPattern = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return validPattern.test(text.trim());
  };

  const handleInputChange = (value: string) => {
    // Filter out numbers and invalid symbols, keep only letters, spaces, apostrophes, and hyphens
    const filtered = value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
    setInputText(filtered);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setTranslation('');
      setTranslationError(null);
      return;
    }

    // Validate input contains only valid characters
    if (!isValidText(inputText)) {
      setTranslationError('Please enter only letters and spaces. Numbers and symbols are not allowed.');
      setTranslation('');
      return;
    }

    setTranslating(true);
    setTranslationError(null);
    setTranslation('');

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      const response = await fetch('/translator/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          from: fromLang,
          to: toLang,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranslation(data.translated);
      } else {
        setTranslationError(data.error || 'Translation failed. Please try again.');
        setTranslation('');
      }
    } catch (error) {
      setTranslationError('Network error. Please check your connection and try again.');
      setTranslation('');
    } finally {
      setTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    // Swap languages
    const tempLang = fromLang;
    setFromLang(toLang);
    setToLang(tempLang);
    
    // Swap text content (filter translation to ensure it's valid)
    const tempText = inputText;
    const tempTranslation = translation;
    
    // Filter swapped translation to ensure it only contains valid characters
    const filteredTranslation = tempTranslation ? tempTranslation.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '') : '';
    setInputText(filteredTranslation);
    setTranslation(tempText);
    setTranslationError(null);
    
    // Auto-translate if there's text in the input after swap
    if (tempTranslation.trim()) {
      // Use a small delay to ensure state updates are complete
      setTimeout(() => {
        handleTranslate();
      }, 100);
    } else {
      // Clear translation if no input text
      setTranslation('');
    }
  };

  const fromFlag = languages.find(l => l.code === fromLang)?.flag || '🌍';
  const toFlag = languages.find(l => l.code === toLang)?.flag || '🌍';

  /**
   * Handle voice input for the input text field
   */
  const handleVoiceInput = async () => {
    if (!speechSupport.recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    setVoiceInputLoading(true);

    try {
      const transcript = await startVoiceInput(fromLang);
      if (transcript.trim()) {
        // Filter transcript to only letters, spaces, apostrophes, and hyphens
        const filteredTranscript = transcript.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
        if (filteredTranscript) {
          setInputText(filteredTranscript);
          // Optionally auto-translate after voice input
          setTimeout(() => {
            handleTranslate();
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
   * Handle text-to-speech for input text
   */
  const handleSpeakInput = () => {
    if (!speechSupport.synthesis) {
      alert('Text-to-Speech is not supported in your browser');
      return;
    }

    if (!inputText.trim()) return;

    if (isSpeakingInput) {
      stopSpeech();
      setIsSpeakingInput(false);
    } else {
      setIsSpeakingInput(true);
      speakText(inputText, fromLang);
      // Reset speaking state after 5 seconds (safety timeout)
      setTimeout(() => setIsSpeakingInput(false), 5000);
    }
  };

  /**
   * Handle text-to-speech for translation
   */
  const handleSpeakTranslation = () => {
    if (!speechSupport.synthesis) {
      alert('Text-to-Speech is not supported in your browser');
      return;
    }

    if (!translation.trim()) return;

    if (isSpeakingTranslation) {
      stopSpeech();
      setIsSpeakingTranslation(false);
    } else {
      setIsSpeakingTranslation(true);
      speakText(translation, toLang);
      // Reset speaking state after 5 seconds (safety timeout)
      setTimeout(() => setIsSpeakingTranslation(false), 5000);
    }
  };

  return (
    <AuthenticatedLayout user={auth?.user || null}>
      <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-5 py-3 bg-blue-200 rounded-full border-[5px] border-blue-600 mb-4 shadow-[4px_4px_0px_0px_#1e40af] animate-[bounce-gentle_2s_ease-in-out_infinite]">
          <Zap className="w-6 h-6 text-blue-700" />
          <span className="text-blue-800 logo-font text-lg">Instant Translation</span>
        </div>
        <div className="relative inline-block">
          <h1 className="text-5xl lg:text-6xl text-black logo-font mb-3" style={{
            textShadow: '4px 4px 0px #3b82f6'
          }}>
            Translator 🌍
          </h1>
          <div className="absolute -top-6 -right-8 text-5xl animate-[wiggle_3s_ease-in-out_infinite]">💬</div>
        </div>
        <p className="text-gray-700 text-xl logo-font">
          Translate words and phrases between different languages
        </p>
      </div>

      <Card className="p-8 rounded-[3rem] shadow-[12px_12px_0px_0px_#000] bg-white border-[6px] border-black relative overflow-hidden">
        <div className="absolute top-8 right-8 text-8xl opacity-10 animate-[spin_20s_linear_infinite]">🗣️</div>
        
        {/* Language Selectors */}
        <div className="grid md:grid-cols-3 gap-4 mb-6 relative z-10">
          <Select value={fromLang} onValueChange={setFromLang}>
            <SelectTrigger className="rounded-3xl border-[4px] border-gray-800 h-16 bg-[#FFFBF0] shadow-[4px_4px_0px_0px_rgb    a(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] transition-all">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{fromFlag}</span>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_#000] max-h-[400px] overflow-y-auto">
              {languages.map((lang) => (
                <SelectItem 
                  key={lang.code} 
                  value={lang.code} 
                  className="text-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-100 rounded-2xl mx-2 my-1 transition-all"
                >
                  <div className="flex items-center gap-3 py-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="logo-font">{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              disabled={translating}
              className="rounded-full w-16 h-16 border-[5px] border-black hover:bg-yellow-200 hover:rotate-180 transition-all duration-500 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:scale-110 bg-white disabled:opacity-50"
            >
              <ArrowRightLeft className="w-7 h-7" />
            </Button>
          </div>

          <Select value={toLang} onValueChange={setToLang}>
            <SelectTrigger className="rounded-3xl border-[4px] border-gray-800 h-16 bg-[#FFFBF0] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] transition-all">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{toFlag}</span>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_#000] max-h-[400px] overflow-y-auto">
              {languages.map((lang) => (
                <SelectItem 
                  key={lang.code} 
                  value={lang.code} 
                  className="text-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-100 rounded-2xl mx-2 my-1 transition-all"
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

        {/* Translation Input/Output */}
        <div className="grid md:grid-cols-2 gap-6 mb-6 relative z-10">
          <div className="space-y-3">
            <label className="text-gray-900 logo-font text-lg">Enter text 📝</label>
            <div className="relative">
              <Textarea
                id="translation-input"
                name="translation-input"
                autoComplete="off"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Type a word or phrase..."
                className="rounded-3xl border-[4px] border-gray-800 h-36 resize-none p-5 bg-[#FFFBF0] text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-[6px_6px_0px_0px_rgba(37,99,235,0.3)] focus:border-blue-500 transition-all pr-24"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                disabled={translating}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceInput}
                  disabled={voiceInputLoading || translating}
                  className="rounded-full hover:bg-blue-200 border-[3px] border-transparent hover:border-blue-500 w-12 h-12"
                  title="Voice input"
                >
                  {voiceInputLoading ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Mic className="w-5 h-5 text-blue-600" />
                  )}
                </Button>
                {inputText.trim() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSpeakInput}
                    disabled={translating}
                    className={`rounded-full hover:bg-green-200 border-[3px] border-transparent hover:border-green-500 w-12 h-12 ${isSpeakingInput ? 'bg-green-200 border-green-500' : ''}`}
                    title="Speak input text"
                  >
                    <Volume2 className="w-5 h-5 text-green-600" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-gray-900 logo-font text-lg">Translation ✨</label>
              <div className="relative">
                <div className="rounded-3xl border-[4px] border-blue-500 h-36 p-5 bg-gradient-to-br from-blue-100 to-purple-100 shadow-[4px_4px_0px_0px_#2563eb] relative overflow-hidden pr-20">
                  <div className="absolute top-2 right-2 text-4xl opacity-20 animate-[wiggle_3s_ease-in-out_infinite]">💫</div>
                  <p className="text-gray-900 text-2xl logo-font relative z-10">
                    {translating ? 'Translating...' : translation || 'Translation will appear here'}
                  </p>
                </div>
              {translation && translationError === null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSpeakTranslation}
                  className={`absolute top-2 right-2 rounded-full hover:bg-blue-200 border-[3px] border-transparent hover:border-blue-500 w-12 h-12 ${isSpeakingTranslation ? 'bg-blue-200 border-blue-500' : ''}`}
                  title="Speak translation"
                >
                  <Volume2 className="w-6 h-6 text-blue-600" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleTranslate}
          disabled={translating || !inputText.trim()}
          className="w-full md:w-auto px-10 py-8 text-xl rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-[6px_6px_0px_0px_#1e40af] border-[5px] border-black hover:scale-105 transition-all hover:shadow-[8px_8px_0px_0px_#1e40af] active:translate-x-1 active:translate-y-1 logo-font disabled:opacity-50"
        >
          <Zap className="w-6 h-6 mr-2" />
          {translating ? 'Translating...' : 'Translate ⚡'}
        </Button>
        
        {translationError && (
          <div className="mt-4 p-4 bg-yellow-100 border-[3px] border-yellow-400 rounded-2xl text-yellow-800 logo-font text-center">
            ⚠️ {translationError}
          </div>
        )}

        {/* Common Phrases - Only show for supported languages */}
        {translations[fromLang] && (
          <div className="mt-8 pt-8 border-t-[4px] border-dashed border-gray-400 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-7 h-7 text-purple-600" />
              <h3 className="text-2xl text-gray-900 logo-font">Try these common words 👇</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.keys(translations.en).map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => {
                    setInputText(translations[fromLang]?.[key] || translations.en[key]);
                    setTimeout(() => handleTranslate(), 100);
                  }}
                  disabled={translating}
                  className="rounded-full border-[4px] border-black hover:bg-purple-200 hover:scale-110 transition-all shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] bg-white logo-font text-lg active:translate-x-1 active:translate-y-1"
                >
                  {translations[fromLang]?.[key] || translations.en[key]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
    </AuthenticatedLayout>
  );
}
