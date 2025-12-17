import { useTranslation } from '../hooks/useTranslation';
import { useSpeech } from '../hooks/useSpeech';

const TranslatorSection = () => {
  const {
    sourceText,
    targetText,
    sourceLanguage,
    targetLanguage,
    languages,
    isTranslating,
    error,
    setSourceText,
    setSourceLanguage,
    setTargetLanguage,
    swapLanguages,
  } = useTranslation();

  const {
    isListening,
    isSpeaking,
    startListening,
    speak,
    copyToClipboard,
  } = useSpeech();

  const handleMicClick = () => {
    startListening(sourceLanguage, (transcript) => {
      setSourceText(transcript);
    });
  };

  const handleCopy = async () => {
    const result = await copyToClipboard(targetText);
    if (result.success) {
      // You could add a toast notification here
      console.log(result.message);
    }
  };

  return (
    <section id="section-translator" className="translation-container">
      <div className="translation-box">
        {/* Source Language Panel */}
        <div className="language-panel">
          <div className="language-selector">
            <select
              id="sourceLanguage"
              className="language-dropdown"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-area-container">
            <div className="text-area-wrapper">
              <textarea
                id="sourceText"
                className="text-area"
                placeholder="Type here..."
                rows="8"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
              />
              <div className="text-controls">
                <button
                  id="sourceMic"
                  className={`control-btn mic-btn ${isListening ? 'active' : ''}`}
                  title="Voice Input"
                  onClick={handleMicClick}
                  style={isListening ? { background: '#ef4444', color: 'white' } : {}}
                >
                  <iconify-icon icon="mdi:microphone"></iconify-icon>
                </button>
                <button
                  id="sourceSpeaker"
                  className={`control-btn speaker-btn ${isSpeaking ? 'active' : ''}`}
                  title="Listen"
                  onClick={() => speak(sourceText, sourceLanguage)}
                >
                  <iconify-icon icon="mdi:volume-high"></iconify-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="swap-container">
          <button
            id="swapButton"
            className="swap-button"
            title="Swap Languages"
            onClick={swapLanguages}
          >
            <iconify-icon icon="mdi:swap-horizontal"></iconify-icon>
          </button>
        </div>

        {/* Target Language Panel */}
        <div className="language-panel">
          <div className="language-selector">
            <select
              id="targetLanguage"
              className="language-dropdown"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-area-container">
            <div className="text-area-wrapper">
              <textarea
                id="targetText"
                className={`text-area text-area-output ${isTranslating ? 'translating' : ''}`}
                placeholder={isTranslating ? 'Translating...' : 'Translation will appear here...'}
                rows="8"
                readOnly
                value={targetText}
              />
              <div className="text-controls">
                <button
                  id="targetSpeaker"
                  className="control-btn speaker-btn"
                  title="Listen to Translation"
                  onClick={() => speak(targetText, targetLanguage)}
                >
                  <iconify-icon icon="mdi:volume-high"></iconify-icon>
                </button>
                <button
                  id="targetCopy"
                  className="control-btn copy-btn"
                  title="Copy Translation"
                  onClick={handleCopy}
                >
                  <iconify-icon icon="mdi:content-copy"></iconify-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="error-message" style={{ display: 'block', marginTop: '10px' }}>
          <iconify-icon icon="mdi:alert-circle"></iconify-icon>
          <span>{error}</span>
        </div>
      )}
    </section>
  );
};

export default TranslatorSection;
