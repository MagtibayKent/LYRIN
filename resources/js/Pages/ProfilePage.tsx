import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Trash2, Trophy, BookOpen, Calendar, Award, Star, Languages } from 'lucide-react';

interface QuizHistory {
  id: number;
  language: string;
  score: number;
  totalQuestions: number;
  date: string;
}

interface DictionaryHistory {
  id: number;
  word: string;
  language: string;
  date: string;
}

interface TranslationHistory {
  id: number;
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  date: string;
}

interface ProfilePageProps {
  quizHistory: QuizHistory[];
  dictionaryHistory: DictionaryHistory[];
  translationHistory: TranslationHistory[];
  cumulativeBestScore: number;
  totalPossibleScore: number;
}

export default function ProfilePage({
  quizHistory = [],
  dictionaryHistory = [],
  translationHistory = [],
  cumulativeBestScore = 0,
  totalPossibleScore = 0,
}: ProfilePageProps) {
  const page = usePage();
  const auth = (page.props as any).auth as { user: { name: string; email: string } | null } | undefined;

  if (!auth?.user) {
    return null;
  }

  const user = auth.user;
  const getInitial = () => {
    return user.name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const averageScore = quizHistory.length > 0
    ? quizHistory.reduce((acc, q) => acc + (q.score / q.totalQuestions) * 100, 0) / quizHistory.length
    : 0;

  const totalQuizzesTaken = quizHistory?.length || 0;
  const totalWordsSearched = dictionaryHistory?.length || 0;

  const handleDeleteQuiz = (id: number) => {
    if (confirm('Are you sure you want to delete this quiz history?')) {
      router.delete(`/profile/quiz/${id}`, {
        preserveScroll: true,
      });
    }
  };

  const handleDeleteDictionary = (id: number) => {
    if (confirm('Are you sure you want to delete this dictionary history?')) {
      router.delete(`/profile/dictionary/${id}`, {
        preserveScroll: true,
      });
    }
  };

  const handleClearQuizHistory = () => {
    if (confirm('Are you sure you want to delete ALL quiz history? This action cannot be undone.')) {
      router.delete('/profile/quiz/clear-all', {
        preserveScroll: true,
      });
    }
  };

  const handleClearDictionaryHistory = () => {
    if (confirm('Are you sure you want to delete ALL dictionary search history? This action cannot be undone.')) {
      router.delete('/profile/dictionary/clear-all', {
        preserveScroll: true,
      });
    }
  };

  const handleDeleteTranslation = (id: number) => {
    if (confirm('Are you sure you want to delete this translation history?')) {
      router.delete(`/profile/translation/${id}`, {
        preserveScroll: true,
      });
    }
  };

  const handleClearTranslationHistory = () => {
    if (confirm('Are you sure you want to delete ALL translation history? This action cannot be undone.')) {
      router.delete('/profile/translation/clear-all', {
        preserveScroll: true,
      });
    }
  };

  return (
    <AuthenticatedLayout user={user}>
      <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <Card className="p-8 rounded-[2rem] shadow-2xl bg-white mb-8 border-4 border-gray-800 relative overflow-hidden">
        <div className="absolute top-10 right-10 text-7xl opacity-10">👤</div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <Avatar className="w-28 h-28 border-4 border-gray-800 shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-5xl logo-font">
              {getInitial()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl text-black logo-font mb-2">{user.name}</h1>
            <p className="text-gray-600 text-lg mb-4">{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-[2rem] shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white border-4 border-blue-700 relative overflow-hidden hover:scale-105 transition-transform">
          <div className="absolute bottom-4 right-4 text-7xl opacity-20">🏆</div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <Trophy className="w-10 h-10" />
          </div>
          <p className="text-5xl logo-font mb-1">{totalQuizzesTaken}</p>
          <p className="text-blue-100 text-lg">Quizzes Taken 🎯</p>
        </Card>

        <Card className="p-6 rounded-[2rem] shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white border-4 border-purple-700 relative overflow-hidden hover:scale-105 transition-transform">
          <div className="absolute bottom-4 right-4 text-7xl opacity-20">⭐</div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <Award className="w-10 h-10" />
          </div>
          <p className="text-5xl logo-font mb-1">{averageScore.toFixed(0)}%</p>
          <p className="text-purple-100 text-lg">Average Score 📈</p>
        </Card>

        <Card className="p-6 rounded-[2rem] shadow-lg bg-gradient-to-br from-orange-400 to-orange-500 text-white border-4 border-orange-600 relative overflow-hidden hover:scale-105 transition-transform">
          <div className="absolute bottom-4 right-4 text-7xl opacity-20">📚</div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <BookOpen className="w-10 h-10" />
          </div>
          <p className="text-5xl logo-font mb-1">{totalWordsSearched}</p>
          <p className="text-orange-100 text-lg">Words Searched 🔍</p>
        </Card>

        <Card className="p-6 rounded-[2rem] shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white border-4 border-green-700 relative overflow-hidden hover:scale-105 transition-transform">
          <div className="absolute bottom-4 right-4 text-7xl opacity-20">🌟</div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <Star className="w-10 h-10" />
          </div>
          <p className="text-5xl logo-font mb-1">{cumulativeBestScore}</p>
          <p className="text-green-100 text-lg">Best Score 🏅</p>
          <p className="text-green-200 text-sm mt-1">Total: {cumulativeBestScore}/{totalPossibleScore}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quiz History */}
        <Card className="p-6 rounded-[2rem] shadow-2xl bg-white border-4 border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl text-black logo-font">Quiz History</h2>
            </div>
            {quizHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearQuizHistory}
                className="rounded-2xl border-3 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <Separator className="mb-6" />

          {quizHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-7xl mb-4">🎮</div>
              <p className="text-gray-700 text-lg logo-font mb-2">No quiz history yet</p>
              <p className="text-gray-500">Take a quiz to see your results here!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {quizHistory.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-5 rounded-2xl border-3 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl text-black logo-font mb-2 capitalize">
                        {quiz.language} Quiz 🌍
                      </h3>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(quiz.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl logo-font mb-1 ${
                        (quiz.score / quiz.totalQuestions) >= 0.8 ? 'text-green-600' :
                        (quiz.score / quiz.totalQuestions) >= 0.6 ? 'text-blue-600' :
                        'text-orange-600'
                      }`}>
                        {quiz.score}/{quiz.totalQuestions}
                      </div>
                      <div className="flex items-center gap-1 text-gray-700">
                        {(quiz.score / quiz.totalQuestions) >= 0.8 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        <span>{((quiz.score / quiz.totalQuestions) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="rounded-2xl border-3 border-gray-800 hover:bg-red-100 hover:border-red-500 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dictionary Search History */}
        <Card className="p-6 rounded-[2rem] shadow-2xl bg-white border-4 border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-purple-600" />
              <h2 className="text-2xl text-black logo-font">Search History</h2>
            </div>
            {dictionaryHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearDictionaryHistory}
                className="rounded-2xl border-3 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <Separator className="mb-6" />

          {dictionaryHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-7xl mb-4">📖</div>
              <p className="text-gray-700 text-lg logo-font mb-2">No search history yet</p>
              <p className="text-gray-500">Search words in the dictionary to see them here!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {dictionaryHistory.map((search) => (
                <div
                  key={search.id}
                  className="p-5 rounded-2xl border-3 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl text-black logo-font mb-2">
                        {search.word} 📚
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 border-2 border-purple-300">
                          {search.language}
                        </span>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(search.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDictionary(search.id)}
                      className="rounded-2xl border-3 border-gray-800 hover:bg-red-100 hover:border-red-500 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Translation History */}
        <Card className="p-6 rounded-[2rem] shadow-2xl bg-white border-4 border-gray-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Languages className="w-7 h-7 text-green-600" />
              <h2 className="text-2xl text-black logo-font">Translation History</h2>
            </div>
            {translationHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearTranslationHistory}
                className="rounded-2xl border-3 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <Separator className="mb-6" />

          {translationHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-7xl mb-4">🌐</div>
              <p className="text-gray-700 text-lg logo-font mb-2">No translation history yet</p>
              <p className="text-gray-500">Translate text to see your translations here!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {translationHistory.map((translation) => (
                <div
                  key={translation.id}
                  className="p-5 rounded-2xl border-3 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 border-2 border-blue-300 text-xs font-semibold uppercase">
                            {translation.fromLanguage}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 border-2 border-green-300 text-xs font-semibold uppercase">
                            {translation.toLanguage}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span className="text-sm">{formatDate(translation.date)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Original:</p>
                          <p className="text-base text-black logo-font bg-gray-50 p-2 rounded-lg border border-gray-200">
                            {translation.originalText}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Translated:</p>
                          <p className="text-base text-black logo-font bg-green-50 p-2 rounded-lg border border-green-200">
                            {translation.translatedText}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTranslation(translation.id)}
                      className="rounded-2xl border-3 border-gray-800 hover:bg-red-100 hover:border-red-500 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      </div>
    </AuthenticatedLayout>
  );
}
