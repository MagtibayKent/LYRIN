/**
 * LYRIN Translator Utility Module
 * ES6 module for text translation using MyMemory API
 * 
 * @module translator
 * @description Translation utility for the LYRIN application
 */

/**
 * Translates text between two languages using MyMemory API
 * @param {string} sourceText - The text to translate
 * @param {string} sourceLang - Source language code (e.g., 'en')
 * @param {string} targetLang - Target language code (e.g., 'tl')
 * @returns {Promise<string>} - Translated text or error message
 * @throws {Error} - Throws error with descriptive message
 * 
 * @example
 * const result = await translateText('Hello world', 'en', 'tl');
 * console.log(result); // "Kamusta mundo"
 */
export async function translateText(sourceText, sourceLang, targetLang) {
  try {
    // Validate input parameters
    if (!sourceText || typeof sourceText !== 'string') {
      throw new Error('Source text is required and must be a string');
    }

    if (!sourceLang || !targetLang) {
      throw new Error('Both source and target language codes are required');
    }

    // Clean and encode the text
    const cleanText = sourceText.trim();
    if (cleanText.length === 0) {
      throw new Error('Source text cannot be empty');
    }

    // Create the API URL
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      cleanText
    )}&langpair=${sourceLang}|${targetLang}`;

    // Make the API request
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if translation was successful
    if (data.responseStatus === 200 && data.responseData) {
      const translatedText = data.responseData.translatedText;

      // Validate the translated text
      if (translatedText && translatedText.trim().length > 0) {
        return translatedText.trim();
      } else {
        throw new Error('Translation returned empty result');
      }
    } else {
      throw new Error(
        `Translation failed: ${data.responseDetails || 'Unknown error'}`
      );
    }
  } catch (error) {
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Error: Network connection failed. Please check your internet connection.';
    } else if (error.message.includes('HTTP error')) {
      return 'Error: Translation service is temporarily unavailable. Please try again later.';
    } else if (error.message.includes('Translation failed')) {
      return 'Error: Could not translate this text. Please try with different words.';
    } else {
      return `Error: ${error.message}`;
    }
  }
}

/**
 * Get supported language codes and names
 * @returns {Object} - Object with language codes as keys and names as values
 * 
 * @example
 * const languages = getSupportedLanguages();
 * console.log(languages.en); // "English"
 * console.log(languages.tl); // "Filipino"
 */
export function getSupportedLanguages() {
  return {
    en: 'English',
    tl: 'Filipino',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ru: 'Russian',
    ar: 'Arabic',
    hi: 'Hindi',
    id: 'Indonesian',
    th: 'Thai',
    vi: 'Vietnamese',
    nl: 'Dutch',
    el: 'Greek',
    tr: 'Turkish',
    sv: 'Swedish',
  };
}

/**
 * Validate language code against supported languages
 * @param {string} langCode - Language code to validate
 * @returns {boolean} - True if valid, false otherwise
 * 
 * @example
 * console.log(isValidLanguageCode('en'));  // true
 * console.log(isValidLanguageCode('xx'));  // false
 */
export function isValidLanguageCode(langCode) {
  const supportedLanguages = getSupportedLanguages();
  return supportedLanguages.hasOwnProperty(langCode);
}

/**
 * Get language name from language code
 * @param {string} langCode - Language code
 * @returns {string} - Language name or 'Unknown'
 * 
 * @example
 * console.log(getLanguageName('en'));  // "English"
 * console.log(getLanguageName('xx'));  // "Unknown"
 */
export function getLanguageName(langCode) {
  const supportedLanguages = getSupportedLanguages();
  return supportedLanguages[langCode] || 'Unknown';
}

/**
 * Convert language name to language code
 * @param {string} languageName - Language name
 * @returns {string|null} - Language code or null if not found
 * 
 * @example
 * console.log(getLanguageCode('English'));   // "en"
 * console.log(getLanguageCode('Filipino'));  // "tl"
 */
export function getLanguageCode(languageName) {
  const languages = getSupportedLanguages();
  for (const [code, name] of Object.entries(languages)) {
    if (name.toLowerCase() === languageName.toLowerCase()) {
      return code;
    }
  }
  return null;
}

/**
 * Batch translate multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {Promise<string[]>} - Array of translated texts
 * 
 * @example
 * const results = await batchTranslate(
 *   ['Hello', 'Good morning'],
 *   'en',
 *   'tl'
 * );
 */
export async function batchTranslate(texts, sourceLang, targetLang) {
  try {
    const translations = await Promise.all(
      texts.map((text) => translateText(text, sourceLang, targetLang))
    );
    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    throw error;
  }
}
