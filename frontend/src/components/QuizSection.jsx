import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';

/**
 * ============================================================================
 * QuizSection Component
 * ============================================================================
 * 
 * A comprehensive quiz feature for testing language knowledge.
 * 
 * Features:
 * - Multiple language support (Filipino, English, Japanese, Spanish, French, Korean)
 * - 20+ predefined questions per language
 * - Random selection of 10 questions per attempt
 * - One question at a time with progress indicator
 * - Score revealed only at the end
 * - Try Again functionality with re-randomization
 * - Score persistence for logged-in users
 * 
 * @component
 */

// ============================================================================
// QUIZ QUESTIONS DATABASE
// ============================================================================

const QUIZ_DATA = {
  filipino: {
    name: 'Filipino',
    flag: '🇵🇭',
    questions: [
      { id: 1, question: 'What is "Thank you" in Filipino?', choices: ['Paalam', 'Salamat', 'Kumusta', 'Oo'], correctAnswer: 1 },
      { id: 2, question: 'What is "Good morning" in Filipino?', choices: ['Magandang gabi', 'Magandang hapon', 'Magandang umaga', 'Maayong buntag'], correctAnswer: 2 },
      { id: 3, question: 'What is "Hello" in Filipino?', choices: ['Salamat', 'Paalam', 'Kumusta', 'Opo'], correctAnswer: 2 },
      { id: 4, question: 'What is "Goodbye" in Filipino?', choices: ['Paalam', 'Salamat', 'Kumusta', 'Tuloy'], correctAnswer: 0 },
      { id: 5, question: 'What is "Yes" in Filipino?', choices: ['Hindi', 'Oo', 'Wala', 'Ayaw'], correctAnswer: 1 },
      { id: 6, question: 'What is "No" in Filipino?', choices: ['Oo', 'Ayaw', 'Hindi', 'Wala'], correctAnswer: 2 },
      { id: 7, question: 'What is "I love you" in Filipino?', choices: ['Mahal kita', 'Salamat po', 'Kumusta ka', 'Paalam na'], correctAnswer: 0 },
      { id: 8, question: 'What is "Water" in Filipino?', choices: ['Pagkain', 'Tubig', 'Hangin', 'Apoy'], correctAnswer: 1 },
      { id: 9, question: 'What is "Food" in Filipino?', choices: ['Tubig', 'Bahay', 'Pagkain', 'Kotse'], correctAnswer: 2 },
      { id: 10, question: 'What is "House" in Filipino?', choices: ['Paaralan', 'Bahay', 'Ospital', 'Palengke'], correctAnswer: 1 },
      { id: 11, question: 'What is "Beautiful" in Filipino?', choices: ['Pangit', 'Mabait', 'Maganda', 'Matalino'], correctAnswer: 2 },
      { id: 12, question: 'What is "Friend" in Filipino?', choices: ['Kaaway', 'Kaibigan', 'Kapitbahay', 'Kasama'], correctAnswer: 1 },
      { id: 13, question: 'What is "Happy" in Filipino?', choices: ['Malungkot', 'Masaya', 'Galit', 'Takot'], correctAnswer: 1 },
      { id: 14, question: 'What is "Mother" in Filipino?', choices: ['Tatay', 'Nanay', 'Kuya', 'Ate'], correctAnswer: 1 },
      { id: 15, question: 'What is "Father" in Filipino?', choices: ['Nanay', 'Lola', 'Tatay', 'Lolo'], correctAnswer: 2 },
      { id: 16, question: 'What does "Mabuhay" mean?', choices: ['Goodbye', 'Welcome/Long live', 'Thank you', 'Sorry'], correctAnswer: 1 },
      { id: 17, question: 'What is "School" in Filipino?', choices: ['Bahay', 'Simbahan', 'Paaralan', 'Ospital'], correctAnswer: 2 },
      { id: 18, question: 'What is "Sun" in Filipino?', choices: ['Buwan', 'Araw', 'Bituin', 'Ulap'], correctAnswer: 1 },
      { id: 19, question: 'What is "Moon" in Filipino?', choices: ['Araw', 'Bituin', 'Buwan', 'Langit'], correctAnswer: 2 },
      { id: 20, question: 'What is "Book" in Filipino?', choices: ['Papel', 'Lapis', 'Aklat', 'Mesa'], correctAnswer: 2 },
      { id: 21, question: 'What is "Sorry" in Filipino?', choices: ['Salamat', 'Pasensya na', 'Paalam', 'Teka'], correctAnswer: 1 },
      { id: 22, question: 'What is "How are you?" in Filipino?', choices: ['Ano yan?', 'Kumusta ka?', 'Saan ka?', 'Sino siya?'], correctAnswer: 1 },
    ],
  },

  english: {
    name: 'English',
    flag: '🇺🇸',
    questions: [
      { id: 1, question: 'What is the past tense of "go"?', choices: ['goed', 'went', 'gone', 'going'], correctAnswer: 1 },
      { id: 2, question: 'Which word is a synonym for "happy"?', choices: ['sad', 'angry', 'joyful', 'tired'], correctAnswer: 2 },
      { id: 3, question: 'What is the plural of "child"?', choices: ['childs', 'childes', 'children', 'childen'], correctAnswer: 2 },
      { id: 4, question: 'Which is the correct spelling?', choices: ['recieve', 'receive', 'receeve', 'receve'], correctAnswer: 1 },
      { id: 5, question: 'What is an antonym for "ancient"?', choices: ['old', 'modern', 'antique', 'vintage'], correctAnswer: 1 },
      { id: 6, question: 'Which sentence is grammatically correct?', choices: ['He don\'t like it', 'He doesn\'t like it', 'He not like it', 'He no like it'], correctAnswer: 1 },
      { id: 7, question: 'What is the past participle of "write"?', choices: ['wrote', 'writed', 'written', 'writing'], correctAnswer: 2 },
      { id: 8, question: 'Which word means "to make something smaller"?', choices: ['expand', 'reduce', 'increase', 'enlarge'], correctAnswer: 1 },
      { id: 9, question: 'What is a noun in this sentence: "The cat sat on the mat"?', choices: ['sat', 'on', 'the', 'cat'], correctAnswer: 3 },
      { id: 10, question: 'Which word is an adverb?', choices: ['quickly', 'quick', 'quickness', 'quicken'], correctAnswer: 0 },
      { id: 11, question: 'What does "benevolent" mean?', choices: ['evil', 'kind', 'angry', 'lazy'], correctAnswer: 1 },
      { id: 12, question: 'Which is the correct form: "I ___ to the store yesterday"?', choices: ['go', 'gone', 'went', 'going'], correctAnswer: 2 },
      { id: 13, question: 'What is a simile?', choices: ['A type of poem', 'A comparison using "like" or "as"', 'A repeated sound', 'An exaggeration'], correctAnswer: 1 },
      { id: 14, question: 'Which word is spelled correctly?', choices: ['accomodate', 'accommodate', 'acommodate', 'acomodate'], correctAnswer: 1 },
      { id: 15, question: 'What is the comparative form of "good"?', choices: ['gooder', 'more good', 'better', 'best'], correctAnswer: 2 },
      { id: 16, question: 'Which sentence uses a comma correctly?', choices: ['I like, apples', 'Before dinner, I read a book', 'The dog, ran fast', 'She said hello, to me'], correctAnswer: 1 },
      { id: 17, question: 'What part of speech is "beautiful"?', choices: ['noun', 'verb', 'adjective', 'adverb'], correctAnswer: 2 },
      { id: 18, question: 'What is a synonym for "begin"?', choices: ['end', 'start', 'stop', 'finish'], correctAnswer: 1 },
      { id: 19, question: 'Which is correct: "Their/There/They\'re going to the park"?', choices: ['Their', 'There', 'They\'re', 'Thier'], correctAnswer: 2 },
      { id: 20, question: 'What does "ambiguous" mean?', choices: ['clear', 'uncertain', 'bright', 'loud'], correctAnswer: 1 },
      { id: 21, question: 'What is the opposite of "optimistic"?', choices: ['hopeful', 'cheerful', 'pessimistic', 'positive'], correctAnswer: 2 },
      { id: 22, question: 'Which word contains a prefix?', choices: ['running', 'unhappy', 'happiness', 'walked'], correctAnswer: 1 },
    ],
  },

  japanese: {
    name: 'Japanese',
    flag: '🇯🇵',
    questions: [
      { id: 1, question: 'What is "Hello" in Japanese?', choices: ['Sayonara', 'Konnichiwa', 'Arigatou', 'Sumimasen'], correctAnswer: 1 },
      { id: 2, question: 'What is "Thank you" in Japanese?', choices: ['Gomen', 'Hai', 'Arigatou', 'Iie'], correctAnswer: 2 },
      { id: 3, question: 'What is "Goodbye" in Japanese?', choices: ['Konnichiwa', 'Sayonara', 'Ohayou', 'Konbanwa'], correctAnswer: 1 },
      { id: 4, question: 'What is "Good morning" in Japanese?', choices: ['Konbanwa', 'Konnichiwa', 'Ohayou gozaimasu', 'Oyasumi'], correctAnswer: 2 },
      { id: 5, question: 'What is "Yes" in Japanese?', choices: ['Iie', 'Hai', 'Dame', 'Nai'], correctAnswer: 1 },
      { id: 6, question: 'What is "No" in Japanese?', choices: ['Hai', 'Iie', 'Nani', 'Demo'], correctAnswer: 1 },
      { id: 7, question: 'What does "Kawaii" mean?', choices: ['Scary', 'Cute', 'Big', 'Fast'], correctAnswer: 1 },
      { id: 8, question: 'What is "Water" in Japanese?', choices: ['Sake', 'Ocha', 'Mizu', 'Gyuunyuu'], correctAnswer: 2 },
      { id: 9, question: 'What is "I love you" in Japanese?', choices: ['Aishiteru', 'Sumimasen', 'Ganbatte', 'Daijoubu'], correctAnswer: 0 },
      { id: 10, question: 'What does "Oishii" mean?', choices: ['Beautiful', 'Delicious', 'Expensive', 'Cheap'], correctAnswer: 1 },
      { id: 11, question: 'What is "Cat" in Japanese?', choices: ['Inu', 'Neko', 'Tori', 'Sakana'], correctAnswer: 1 },
      { id: 12, question: 'What is "Dog" in Japanese?', choices: ['Neko', 'Usagi', 'Inu', 'Uma'], correctAnswer: 2 },
      { id: 13, question: 'What is "One" in Japanese?', choices: ['Ni', 'San', 'Ichi', 'Yon'], correctAnswer: 2 },
      { id: 14, question: 'What does "Sugoi" mean?', choices: ['Boring', 'Amazing', 'Slow', 'Quiet'], correctAnswer: 1 },
      { id: 15, question: 'What is "Good night" in Japanese?', choices: ['Ohayou', 'Oyasumi', 'Konbanwa', 'Sayonara'], correctAnswer: 1 },
      { id: 16, question: 'What is "Friend" in Japanese?', choices: ['Sensei', 'Tomodachi', 'Kazoku', 'Koibito'], correctAnswer: 1 },
      { id: 17, question: 'What does "Nani" mean?', choices: ['Who', 'What', 'Where', 'When'], correctAnswer: 1 },
      { id: 18, question: 'What is "Book" in Japanese?', choices: ['Enpitsu', 'Hon', 'Kaban', 'Tsukue'], correctAnswer: 1 },
      { id: 19, question: 'What is "Sorry" in Japanese?', choices: ['Arigatou', 'Sumimasen', 'Hai', 'Iie'], correctAnswer: 1 },
      { id: 20, question: 'What does "Genki" mean?', choices: ['Tired', 'Healthy/Energetic', 'Hungry', 'Sleepy'], correctAnswer: 1 },
      { id: 21, question: 'What is "School" in Japanese?', choices: ['Byouin', 'Gakkou', 'Eki', 'Mise'], correctAnswer: 1 },
      { id: 22, question: 'What is "Food" in Japanese?', choices: ['Nomimono', 'Tabemono', 'Norimono', 'Kimono'], correctAnswer: 1 },
    ],
  },

  spanish: {
    name: 'Spanish',
    flag: '🇪🇸',
    questions: [
      { id: 1, question: 'What is "Hello" in Spanish?', choices: ['Adiós', 'Hola', 'Gracias', 'Por favor'], correctAnswer: 1 },
      { id: 2, question: 'What is "Thank you" in Spanish?', choices: ['De nada', 'Perdón', 'Gracias', 'Lo siento'], correctAnswer: 2 },
      { id: 3, question: 'What is "Goodbye" in Spanish?', choices: ['Hola', 'Buenos días', 'Adiós', 'Buenas noches'], correctAnswer: 2 },
      { id: 4, question: 'What is "Good morning" in Spanish?', choices: ['Buenas noches', 'Buenas tardes', 'Buenos días', 'Hola'], correctAnswer: 2 },
      { id: 5, question: 'What is "Yes" in Spanish?', choices: ['No', 'Sí', 'Quizás', 'Nunca'], correctAnswer: 1 },
      { id: 6, question: 'What is "No" in Spanish?', choices: ['Sí', 'No', 'Tal vez', 'Siempre'], correctAnswer: 1 },
      { id: 7, question: 'What is "I love you" in Spanish?', choices: ['Te quiero', 'Lo siento', 'Gracias', 'De nada'], correctAnswer: 0 },
      { id: 8, question: 'What is "Water" in Spanish?', choices: ['Leche', 'Jugo', 'Agua', 'Café'], correctAnswer: 2 },
      { id: 9, question: 'What is "Food" in Spanish?', choices: ['Bebida', 'Comida', 'Casa', 'Coche'], correctAnswer: 1 },
      { id: 10, question: 'What is "House" in Spanish?', choices: ['Escuela', 'Casa', 'Hospital', 'Tienda'], correctAnswer: 1 },
      { id: 11, question: 'What is "Beautiful" in Spanish?', choices: ['Feo', 'Hermoso', 'Pequeño', 'Grande'], correctAnswer: 1 },
      { id: 12, question: 'What is "Friend" in Spanish?', choices: ['Enemigo', 'Amigo', 'Vecino', 'Hermano'], correctAnswer: 1 },
      { id: 13, question: 'What is "Cat" in Spanish?', choices: ['Perro', 'Gato', 'Pájaro', 'Pez'], correctAnswer: 1 },
      { id: 14, question: 'What is "Dog" in Spanish?', choices: ['Gato', 'Caballo', 'Perro', 'Ratón'], correctAnswer: 2 },
      { id: 15, question: 'What is "Book" in Spanish?', choices: ['Mesa', 'Silla', 'Libro', 'Lápiz'], correctAnswer: 2 },
      { id: 16, question: 'What is "One" in Spanish?', choices: ['Dos', 'Tres', 'Uno', 'Cuatro'], correctAnswer: 2 },
      { id: 17, question: 'What is "Red" in Spanish?', choices: ['Azul', 'Verde', 'Amarillo', 'Rojo'], correctAnswer: 3 },
      { id: 18, question: 'What is "Big" in Spanish?', choices: ['Pequeño', 'Grande', 'Mediano', 'Corto'], correctAnswer: 1 },
      { id: 19, question: 'What is "Happy" in Spanish?', choices: ['Triste', 'Enojado', 'Feliz', 'Cansado'], correctAnswer: 2 },
      { id: 20, question: 'What is "Family" in Spanish?', choices: ['Amigos', 'Familia', 'Trabajo', 'Escuela'], correctAnswer: 1 },
      { id: 21, question: 'What is "Please" in Spanish?', choices: ['Gracias', 'De nada', 'Por favor', 'Perdón'], correctAnswer: 2 },
      { id: 22, question: 'What is "Sun" in Spanish?', choices: ['Luna', 'Estrella', 'Sol', 'Nube'], correctAnswer: 2 },
    ],
  },

  french: {
    name: 'French',
    flag: '🇫🇷',
    questions: [
      { id: 1, question: 'What is "Hello" in French?', choices: ['Au revoir', 'Bonjour', 'Merci', 'S\'il vous plaît'], correctAnswer: 1 },
      { id: 2, question: 'What is "Thank you" in French?', choices: ['De rien', 'Pardon', 'Merci', 'Excusez-moi'], correctAnswer: 2 },
      { id: 3, question: 'What is "Goodbye" in French?', choices: ['Bonjour', 'Bonsoir', 'Au revoir', 'Salut'], correctAnswer: 2 },
      { id: 4, question: 'What is "Good morning" in French?', choices: ['Bonne nuit', 'Bonsoir', 'Bonjour', 'Salut'], correctAnswer: 2 },
      { id: 5, question: 'What is "Yes" in French?', choices: ['Non', 'Oui', 'Peut-être', 'Jamais'], correctAnswer: 1 },
      { id: 6, question: 'What is "No" in French?', choices: ['Oui', 'Non', 'Parfois', 'Toujours'], correctAnswer: 1 },
      { id: 7, question: 'What is "I love you" in French?', choices: ['Je t\'aime', 'Merci beaucoup', 'Au revoir', 'S\'il vous plaît'], correctAnswer: 0 },
      { id: 8, question: 'What is "Water" in French?', choices: ['Lait', 'Jus', 'Eau', 'Café'], correctAnswer: 2 },
      { id: 9, question: 'What is "Food" in French?', choices: ['Boisson', 'Nourriture', 'Maison', 'Voiture'], correctAnswer: 1 },
      { id: 10, question: 'What is "House" in French?', choices: ['École', 'Maison', 'Hôpital', 'Magasin'], correctAnswer: 1 },
      { id: 11, question: 'What is "Beautiful" in French?', choices: ['Laid', 'Beau/Belle', 'Petit', 'Grand'], correctAnswer: 1 },
      { id: 12, question: 'What is "Friend" in French?', choices: ['Ennemi', 'Ami', 'Voisin', 'Frère'], correctAnswer: 1 },
      { id: 13, question: 'What is "Cat" in French?', choices: ['Chien', 'Chat', 'Oiseau', 'Poisson'], correctAnswer: 1 },
      { id: 14, question: 'What is "Dog" in French?', choices: ['Chat', 'Cheval', 'Chien', 'Souris'], correctAnswer: 2 },
      { id: 15, question: 'What is "Book" in French?', choices: ['Table', 'Chaise', 'Livre', 'Crayon'], correctAnswer: 2 },
      { id: 16, question: 'What is "One" in French?', choices: ['Deux', 'Trois', 'Un', 'Quatre'], correctAnswer: 2 },
      { id: 17, question: 'What is "Red" in French?', choices: ['Bleu', 'Vert', 'Jaune', 'Rouge'], correctAnswer: 3 },
      { id: 18, question: 'What is "Big" in French?', choices: ['Petit', 'Grand', 'Moyen', 'Court'], correctAnswer: 1 },
      { id: 19, question: 'What is "Happy" in French?', choices: ['Triste', 'En colère', 'Heureux', 'Fatigué'], correctAnswer: 2 },
      { id: 20, question: 'What is "Family" in French?', choices: ['Amis', 'Famille', 'Travail', 'École'], correctAnswer: 1 },
      { id: 21, question: 'What is "Please" in French?', choices: ['Merci', 'De rien', 'S\'il vous plaît', 'Pardon'], correctAnswer: 2 },
      { id: 22, question: 'What is "Good night" in French?', choices: ['Bonjour', 'Bonsoir', 'Bonne nuit', 'Au revoir'], correctAnswer: 2 },
    ],
  },

  korean: {
    name: 'Korean',
    flag: '🇰🇷',
    questions: [
      { id: 1, question: 'What is "Hello" in Korean?', choices: ['Annyeong', 'Kamsahamnida', 'Annyeonghaseyo', 'Mianhae'], correctAnswer: 2 },
      { id: 2, question: 'What is "Thank you" in Korean?', choices: ['Mianhae', 'Kamsahamnida', 'Annyeong', 'Jal ga'], correctAnswer: 1 },
      { id: 3, question: 'What is "Goodbye" in Korean?', choices: ['Annyeong', 'Annyeonghi gaseyo', 'Kamsahamnida', 'Saranghae'], correctAnswer: 1 },
      { id: 4, question: 'What is "I love you" in Korean?', choices: ['Saranghae', 'Kamsahamnida', 'Mianhae', 'Annyeong'], correctAnswer: 0 },
      { id: 5, question: 'What is "Yes" in Korean?', choices: ['Aniyo', 'Ne/Ye', 'Molla', 'Jinjja'], correctAnswer: 1 },
      { id: 6, question: 'What is "No" in Korean?', choices: ['Ne', 'Aniyo', 'Gamsahamnida', 'Jal ga'], correctAnswer: 1 },
      { id: 7, question: 'What is "Sorry" in Korean?', choices: ['Kamsahamnida', 'Mianhae', 'Annyeong', 'Saranghae'], correctAnswer: 1 },
      { id: 8, question: 'What is "Water" in Korean?', choices: ['Bap', 'Mul', 'Cha', 'Sul'], correctAnswer: 1 },
      { id: 9, question: 'What is "Food" in Korean?', choices: ['Mul', 'Eumsik', 'Jip', 'Hakkyo'], correctAnswer: 1 },
      { id: 10, question: 'What is "Friend" in Korean?', choices: ['Gajok', 'Chingu', 'Seonsaeng', 'Dongsaeng'], correctAnswer: 1 },
      { id: 11, question: 'What does "Daebak" mean?', choices: ['Bad', 'Amazing/Awesome', 'Boring', 'Slow'], correctAnswer: 1 },
      { id: 12, question: 'What is "Cat" in Korean?', choices: ['Gae', 'Goyangi', 'Sae', 'Mulgogi'], correctAnswer: 1 },
      { id: 13, question: 'What is "Dog" in Korean?', choices: ['Goyangi', 'Gae', 'Tokki', 'Mal'], correctAnswer: 1 },
      { id: 14, question: 'What is "School" in Korean?', choices: ['Jip', 'Hakkyo', 'Byeongwon', 'Gage'], correctAnswer: 1 },
      { id: 15, question: 'What is "Book" in Korean?', choices: ['Yeonpil', 'Chaek', 'Gabang', 'Chaeksang'], correctAnswer: 1 },
      { id: 16, question: 'What does "Aigoo" express?', choices: ['Joy', 'Frustration/Surprise', 'Hunger', 'Love'], correctAnswer: 1 },
      { id: 17, question: 'What is "One" in Korean?', choices: ['Dul', 'Set', 'Hana', 'Net'], correctAnswer: 2 },
      { id: 18, question: 'What is "Happy" in Korean?', choices: ['Seulpeum', 'Haengbok', 'Hwana', 'Pigon'], correctAnswer: 1 },
      { id: 19, question: 'What is "Family" in Korean?', choices: ['Chingu', 'Gajok', 'Hakgyo', 'Hoesa'], correctAnswer: 1 },
      { id: 20, question: 'What does "Jinjja" mean?', choices: ['Never', 'Really', 'Maybe', 'Always'], correctAnswer: 1 },
      { id: 21, question: 'What is "Delicious" in Korean?', choices: ['Masseopda', 'Masisseoyo', 'Molla', 'Mianhae'], correctAnswer: 1 },
      { id: 22, question: 'What is "Good night" in Korean?', choices: ['Annyeong', 'Jal ja', 'Jal ga', 'Annyeonghaseyo'], correctAnswer: 1 },
    ],
  },
};

// ============================================================================
// CONSTANTS
// ============================================================================
const QUESTIONS_PER_QUIZ = 10;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get performance feedback based on score
 */
const getPerformanceFeedback = (percentage) => {
  if (percentage === 100) return { message: 'Perfect! 🎉', color: '#16a34a' };
  if (percentage >= 80) return { message: 'Excellent work! 🌟', color: '#22c55e' };
  if (percentage >= 60) return { message: 'Good job! Keep practicing! 👍', color: '#eab308' };
  if (percentage >= 40) return { message: 'Nice try! Review and try again! 📚', color: '#f97316' };
  return { message: 'Keep studying! You can do it! 💪', color: '#ef4444' };
};

// ============================================================================
// QUIZ STATES
// ============================================================================
const QUIZ_STATE = {
  SELECT_LANGUAGE: 'SELECT_LANGUAGE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const QuizSection = () => {
  // Auth context for score persistence
  const { user, isAuthenticated } = useAuth();
  
  // State Management
  const [quizState, setQuizState] = useState(QUIZ_STATE.SELECT_LANGUAGE);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Computed values
  const currentQuestion = questions[currentQuestionIndex];
  const score = useMemo(() => {
    return answers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;
  }, [answers, questions]);

  const percentage = useMemo(() => {
    return questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  }, [score, questions.length]);

  const feedback = useMemo(() => getPerformanceFeedback(percentage), [percentage]);

  /**
   * Save score when quiz is completed and user is authenticated
   */
  useEffect(() => {
    const saveScore = async () => {
      if (quizState === QUIZ_STATE.COMPLETED && isAuthenticated && !scoreSaved) {
        try {
          await quizAPI.saveScore({
            language: selectedLanguage?.key || 'unknown',
            score: score,
            total: questions.length,
            percentage: percentage
          });
          setScoreSaved(true);
          setSaveError(null);
        } catch (error) {
          console.error('Failed to save score:', error);
          setSaveError('Failed to save score. Please try again.');
        }
      }
    };

    saveScore();
  }, [quizState, isAuthenticated, scoreSaved, selectedLanguage, score, questions.length, percentage]);

  /**
   * Start quiz with selected language
   */
  const startQuiz = useCallback((langKey) => {
    const langData = QUIZ_DATA[langKey];
    if (!langData) return;

    // Randomly select 10 questions
    const shuffled = shuffleArray(langData.questions);
    const selected = shuffled.slice(0, QUESTIONS_PER_QUIZ);

    setSelectedLanguage({ key: langKey, ...langData });
    setQuestions(selected);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setScoreSaved(false);
    setSaveError(null);
    setQuizState(QUIZ_STATE.IN_PROGRESS);
  }, []);

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = useCallback((answerIndex) => {
    if (isAnswering || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setIsAnswering(true);

    // Store answer and move to next question after delay
    setTimeout(() => {
      setAnswers(prev => [...prev, answerIndex]);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setQuizState(QUIZ_STATE.COMPLETED);
      }
      setIsAnswering(false);
    }, 800);
  }, [isAnswering, selectedAnswer, currentQuestionIndex, questions.length]);

  /**
   * Try again with same language
   */
  const handleTryAgain = useCallback(() => {
    if (selectedLanguage) {
      startQuiz(selectedLanguage.key);
    }
  }, [selectedLanguage, startQuiz]);

  /**
   * Go back to language selection
   */
  const handleChangeLanguage = useCallback(() => {
    setQuizState(QUIZ_STATE.SELECT_LANGUAGE);
    setSelectedLanguage(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
  }, []);

  // =========================================================================
  // RENDER: Language Selection
  // =========================================================================
  if (quizState === QUIZ_STATE.SELECT_LANGUAGE) {
    return (
      <section id="section-quiz" className="feature-container">
        <div className="feature-box">
          <h2 className="feature-title">Quiz Me</h2>
          <p className="feature-subtitle">
            Test your language knowledge with 10 random questions
          </p>

          <div className="quiz-language-selection">
            <h3>Choose a Language</h3>
            <div className="language-grid">
              {Object.entries(QUIZ_DATA).map(([key, lang]) => (
                <button
                  key={key}
                  className="language-card"
                  onClick={() => startQuiz(key)}
                >
                  <span className="language-flag">{lang.flag}</span>
                  <span className="language-name">{lang.name}</span>
                  <span className="language-questions">
                    {lang.questions.length} questions
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // RENDER: Quiz Completed
  // =========================================================================
  if (quizState === QUIZ_STATE.COMPLETED) {
    return (
      <section id="section-quiz" className="feature-container">
        <div className="feature-box">
          <h2 className="feature-title">Quiz Complete!</h2>
          
          <div className="quiz-results">
            <div className="results-header">
              <span className="results-flag">{selectedLanguage?.flag}</span>
              <span className="results-language">{selectedLanguage?.name}</span>
            </div>

            <div className="score-display">
              <div className="score-circle" style={{ borderColor: feedback.color }}>
                <span className="score-number">{score}</span>
                <span className="score-total">/ {questions.length}</span>
              </div>
              <p className="score-percentage" style={{ color: feedback.color }}>
                {percentage}%
              </p>
            </div>

            <p className="feedback-message" style={{ color: feedback.color }}>
              {feedback.message}
            </p>

            {/* Score Save Status */}
            {isAuthenticated ? (
              <div className="save-status">
                {scoreSaved ? (
                  <p className="save-success">✓ Score saved to your profile</p>
                ) : saveError ? (
                  <p className="save-error">{saveError}</p>
                ) : (
                  <p className="save-loading">Saving score...</p>
                )}
              </div>
            ) : (
              <div className="save-status">
                <p className="save-hint">
                  <a href="/login">Login</a> to save your quiz scores
                </p>
              </div>
            )}

            <div className="results-actions">
              <button className="quiz-btn primary" onClick={handleTryAgain}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Try Again
              </button>
              <button className="quiz-btn secondary" onClick={handleChangeLanguage}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Change Language
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // RENDER: Quiz In Progress
  // =========================================================================
  return (
    <section id="section-quiz" className="feature-container">
      <div className="feature-box">
        <div className="quiz-header">
          <div className="quiz-info">
            <span className="quiz-language-badge">
              {selectedLanguage?.flag} {selectedLanguage?.name}
            </span>
            <button className="quit-btn" onClick={handleChangeLanguage} title="Quit Quiz">
              ✕
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="progress-container">
            <div className="progress-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <p className="question-text">{currentQuestion?.question}</p>
          
          <div className="choices-list">
            {currentQuestion?.choices.map((choice, index) => {
              let choiceClass = 'choice-btn';
              if (selectedAnswer !== null) {
                if (index === currentQuestion.correctAnswer) {
                  choiceClass += ' correct';
                } else if (index === selectedAnswer) {
                  choiceClass += ' incorrect';
                }
              }
              
              return (
                <button
                  key={index}
                  className={choiceClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="choice-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="choice-text">{choice}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Dots */}
        <div className="question-dots">
          {questions.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${
                index < currentQuestionIndex ? 'answered' : 
                index === currentQuestionIndex ? 'current' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuizSection;
