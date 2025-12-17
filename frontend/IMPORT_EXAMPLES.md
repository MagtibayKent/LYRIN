/**
 * LYRIN - Import Examples & Quick Reference
 * Copy-paste ready examples for using translator and images
 */

// ============================================
// 📦 TRANSLATOR - Import Examples
// ============================================

// ✅ Option 1: Import specific functions (Recommended)
import { translateText, getSupportedLanguages } from '../utils/translator';

// ✅ Option 2: Import from utils index (Cleanest)
import { translateText, getSupportedLanguages } from '../utils';

// ✅ Option 3: Import all as namespace
import * as Translator from '../utils/translator';
// Usage: Translator.translateText('Hello', 'en', 'tl');

// ✅ Option 4: In a hook for better component logic
import { useCallback } from 'react';
import { translateText } from '../utils';

export function useTranslator() {
  const translate = useCallback((text, source, target) => {
    return translateText(text, source, target);
  }, []);
  
  return { translate };
}

// ============================================
// 🖼️  IMAGES - Import Examples  
// ============================================

// ✅ Logo Image
import lyrinLogo from '../assets/images/Heading - Copy.png';
// Usage: <img src={lyrinLogo} alt="Logo" />

// ✅ Alternative Logo
import appLogo from '../assets/images/logo.png';

// ✅ Background Image
import bgImage from '../assets/images/bg pic.png';
// Usage: style={{ backgroundImage: `url(${bgImage})` }}

// ✅ Team Photos
import photo1 from '../assets/images/2.png';
import photo2 from '../assets/images/3.png';
import photo3 from '../assets/images/4.png';
import photo4 from '../assets/images/5.png';
import photo5 from '../assets/images/6.png';

// ✅ Heading Image
import heading from '../assets/images/Heading.png';

// ============================================
// 🔧 PRACTICAL COMPONENT EXAMPLES
// ============================================

// Example 1: Simple Translator Component
function SimpleTranslator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const handleTranslate = async () => {
    const translated = await translateText(text, 'en', 'tl');
    setResult(translated);
  };

  return (
    <div>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to translate"
      />
      <button onClick={handleTranslate}>Translate to Filipino</button>
      <p>Result: {result}</p>
    </div>
  );
}

// Example 2: Language Selector with Translator
function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState('en');
  const languages = getSupportedLanguages();

  return (
    <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
      {Object.entries(languages).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}

// Example 3: Header with Logo and Background
function AppHeader() {
  return (
    <header style={{ backgroundImage: `url(${bgImage})` }}>
      <img src={lyrinLogo} alt="Lyrin Logo" className="logo" />
      <h1>LYRIN Translator</h1>
    </header>
  );
}

// Example 4: Team Member Gallery
function TeamGallery() {
  const teamPhotos = [photo1, photo2, photo3, photo4, photo5];
  
  return (
    <div className="team-gallery">
      {teamPhotos.map((photo, index) => (
        <img key={index} src={photo} alt={`Team member ${index + 1}`} />
      ))}
    </div>
  );
}

// Example 5: Advanced Translator Hook
function useAdvancedTranslator(autoDelay = 500) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const translate = useCallback(async (text, source, target) => {
    setLoading(true);
    setError(null);

    try {
      const result = await translateText(text, source, target);
      
      if (result.startsWith('Error:')) {
        setError(result);
        return null;
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      setError('Translation failed');
      setLoading(false);
      return null;
    }
  }, []);

  return { translate, loading, error };
}

// Example 6: Batch Translator
function BatchTranslatorComponent() {
  const [texts, setTexts] = useState(['Hello', 'Good morning', 'Thank you']);
  const [results, setResults] = useState([]);
  const [targetLang, setTargetLang] = useState('tl');

  const handleBatchTranslate = async () => {
    const translations = await Promise.all(
      texts.map(text => translateText(text, 'en', targetLang))
    );
    setResults(translations);
  };

  return (
    <div>
      <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
        <option value="tl">Filipino</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
      
      <button onClick={handleBatchTranslate}>Translate All</button>
      
      <ul>
        {results.map((result, index) => (
          <li key={index}>{texts[index]} → {result}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// 🎯 QUICK DOS AND DON'Ts
// ============================================

/* 
✅ DO:
  - import { translateText } from '../utils';
  - import logo from '../assets/images/logo.png';
  - Use relative paths that resolve from file location
  - Keep translator functions reusable
  - Test image imports in nested routes

❌ DON'T:
  - <img src="/images/logo.png" /> (absolute path)
  - require('../assets/images/logo.png') (CommonJS in React)
  - <img src="../../assets/images/logo.png" /> (too many ../)
  - Put business logic in components
  - Import images in CSS directly from old assets folder

⚠️  COMMON ISSUES:
  - Images not showing: Check import path and file existence
  - Path errors: Ensure relative paths use ../ correctly
  - Build errors: Make sure all imports are in src/ folder
  - Module errors: Never use CommonJS require() in React
*/

// ============================================
// 📊 IMPORT PATH CHEAT SHEET
// ============================================

/*
From: components/MyComponent.jsx
  To translator: import { translateText } from '../utils';
  To images: import logo from '../assets/images/logo.png';

From: pages/AppPage.jsx
  To translator: import { translateText } from '../utils';
  To images: import logo from '../assets/images/logo.png';

From: hooks/useTranslator.js
  To translator: import { translateText } from '../utils';
  To images: Can't use here (hooks don't render images)

From: services/api.js
  To translator: import { translateText } from '../utils';
  To images: Can't use here (services are logic only)

From: utils/index.js
  To translator: import { translateText } from './translator';
  To images: Can't use here (utils are logic only)

Key: Use ../ to go up one folder level
     Use ./ to reference current folder
     Images must be in components/pages that render them
*/

// ============================================
// 🚀 TESTING IMPORTS
// ============================================

// Add this to App.jsx or a test component to verify everything works:
function ImportTest() {
  const [testResults, setTestResults] = useState({
    translatorLoaded: false,
    imageLoaded: false,
    testComplete: false,
  });

  useEffect(() => {
    // Test translator import
    console.log('Translator functions available:', {
      translateText: typeof translateText,
      getSupportedLanguages: typeof getSupportedLanguages,
    });

    setTestResults(prev => ({
      ...prev,
      translatorLoaded: true,
      imageLoaded: !!lyrinLogo,
      testComplete: true,
    }));
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid green' }}>
      <h3>Import Test Results</h3>
      <p>✅ Translator Loaded: {testResults.translatorLoaded ? 'YES' : 'NO'}</p>
      <p>✅ Image Loaded: {testResults.imageLoaded ? 'YES' : 'NO'}</p>
      <p>✅ Test Complete: {testResults.testComplete ? 'YES' : 'NO'}</p>
      {testResults.testComplete && (
        <img src={lyrinLogo} alt="Test" style={{ width: '100px' }} />
      )}
    </div>
  );
}

// ============================================
// 📚 LEARNING PATH
// ============================================

/*
1. Start with simple image imports in components
   import logo from '../assets/images/logo.png';
   <img src={logo} alt="Logo" />

2. Move to translator in components
   import { translateText } from '../utils';
   const result = await translateText('text', 'en', 'tl');

3. Create custom hooks for translator
   Create useTranslator hook that wraps translator functions

4. Use translator in multiple components
   Import and reuse the translator anywhere

5. Optimize with Vite
   Run `npm run build` and check dist folder
   Verify images are optimized with hashes

6. Scale with more utilities
   Add formatters.js, validators.js, etc.
*/

export { 
  SimpleTranslator,
  LanguageSelector,
  AppHeader,
  TeamGallery,
  useAdvancedTranslator,
  BatchTranslatorComponent,
  ImportTest,
};
