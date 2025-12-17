/**
 * LYRIN Assets Structure Documentation
 * 
 * This document explains the refactored assets structure for the React application
 */

## ✅ Refactored Project Structure

```
src/
├── assets/
│   └── images/
│       ├── 2.png                    # Team member images
│       ├── 3.png
│       ├── 4.png
│       ├── 5.png
│       ├── 6.png
│       ├── bg pic.png               # Background image
│       ├── Heading.png              # App heading
│       ├── Heading - Copy.png       # Lyrin logo (PRIMARY)
│       └── logo.png                 # Main app logo
├── utils/
│   ├── index.js                     # Central export point
│   └── translator.js                # Translation API utilities
├── components/
├── pages/
├── styles/
├── context/
├── hooks/
└── App.jsx
```

---

## 📁 Folder Structure Rationale

### 1. **src/assets/images/**
**Purpose**: Store all static image assets
**Why placed here**:
- Vite automatically optimizes images in `src/assets`
- Images are bundled and cached efficiently
- Supports tree-shaking of unused images
- Enables proper image path resolution in production builds

**Files**:
- `Heading - Copy.png` - Main logo for the translator app
- `logo.png` - Alternative logo variant
- `2.png - 6.png` - Team member photos
- `bg pic.png` - Background decorative image

---

### 2. **src/utils/translator.js**
**Purpose**: Reusable translation utility functions
**Why placed here**:
- `utils/` is the standard React convention for utility functions
- Translator functions are stateless and reusable
- Can be imported anywhere in the app (components, hooks, pages)
- Separates business logic from components
- Easy to unit test

**Exported Functions**:
- `translateText(text, sourceLang, targetLang)` - Core translation API call
- `getSupportedLanguages()` - Returns all supported language codes
- `isValidLanguageCode(code)` - Validates language codes
- `getLanguageName(code)` - Gets readable language name
- `getLanguageCode(name)` - Reverse lookup from name to code
- `batchTranslate(texts, sourceLang, targetLang)` - Translate multiple texts

---

## 🔄 Migration Guide

### Before (Old Structure - Not Used in React)
```javascript
// Old way - Direct HTML file reference
<script src="assets/js/translator.js"></script>
<img src="assets/images/logo.png" alt="Logo" />
```

### After (New Structure - React/ES Modules)
```javascript
// ✅ Import translator as ES module
import { translateText, getSupportedLanguages } from '../utils/translator';

// ✅ Import images as ES modules
import lyrinLogo from '../assets/images/Heading - Copy.png';

// ✅ Use in JSX
function MyComponent() {
  const handleTranslate = async () => {
    const result = await translateText('Hello', 'en', 'tl');
    console.log(result);
  };

  return (
    <>
      <img src={lyrinLogo} alt="Lyrin Logo" />
      <button onClick={handleTranslate}>Translate</button>
    </>
  );
}
```

---

## 📚 Usage Examples

### Example 1: Using Translator in a Component
```javascript
import { useState } from 'react';
import { translateText, getSupportedLanguages } from '../utils/translator';

export default function TranslateComponent() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const handleTranslate = async () => {
    const translated = await translateText(text, 'en', 'tl');
    setResult(translated);
  };

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleTranslate}>Translate to Filipino</button>
      <p>{result}</p>
    </div>
  );
}
```

### Example 2: Using Translator in a Custom Hook
```javascript
import { useState, useCallback } from 'react';
import { translateText } from '../utils/translator';

export function useTranslator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translate = useCallback(async (text, source, target) => {
    setLoading(true);
    setError(null);
    try {
      const result = await translateText(text, source, target);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return { translate, loading, error };
}
```

### Example 3: Using Images
```javascript
import logo from '../assets/images/Heading - Copy.png';
import bgImage from '../assets/images/bg pic.png';

export default function AppLayout() {
  return (
    <div style={{ backgroundImage: `url(${bgImage})` }}>
      <img src={logo} alt="App Logo" />
    </div>
  );
}
```

---

## ✨ Benefits of This Structure

| Aspect | Benefit |
|--------|---------|
| **Module Imports** | Images and utils are bundled with code, cacheable as one unit |
| **Tree Shaking** | Unused images/functions automatically removed from production build |
| **Type Safety** | Better IDE autocomplete and import suggestions |
| **Vite Optimization** | Images are optimized, hashed, and served efficiently |
| **Testability** | Utilities can be easily unit tested in isolation |
| **Scalability** | Easy to add more utilities (e.g., `formatters.js`, `validators.js`) |
| **Performance** | Lazy load utilities and code-split images as needed |

---

## ⚠️ Common Mistakes Avoided

### ❌ Mistake 1: Using absolute paths with `/`
```javascript
// DON'T DO THIS
<img src="/images/logo.png" alt="Logo" />
// Problem: Won't work in nested routes, conflicts with public folder
```

### ❌ Mistake 2: Using relative paths incorrectly
```javascript
// DON'T DO THIS
import translator from './translator.js';  // Wrong relative path
// Problem: Import resolution fails in different directories
```

### ❌ Mistake 3: Mixing CommonJS and ES modules
```javascript
// DON'T DO THIS
module.exports = { translateText };  // Old way
// Problem: Breaks Vite's bundling and ES module support
```

### ✅ Correct Way: Use ES module imports everywhere
```javascript
// DO THIS
import { translateText } from '../utils/translator';
import logo from '../assets/images/logo.png';
// Consistent, works everywhere, Vite optimizes it
```

---

## 🚀 Next Steps

1. **Review the imports** in all components that need images
2. **Update image references** to use ES module imports
3. **Test in development**: `npm run dev`
4. **Test in production**: `npm run build` then verify dist folder
5. **Remove old assets folder** after confirming all imports work

---

## 📋 File Checklist

✅ Image files copied to `src/assets/images/`
✅ `translator.js` created in `src/utils/`
✅ `utils/index.js` created for centralized exports
✅ `AppPage.jsx` updated to use image imports
✅ All imports use ES modules
✅ Vite configuration supports image imports
✅ No breaking changes to existing functionality

---

## 🔗 References

- [Vite Assets Documentation](https://vitejs.dev/guide/assets.html)
- [React Best Practices](https://react.dev/learn)
- [ES Modules in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
