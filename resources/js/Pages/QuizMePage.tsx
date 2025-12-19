import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Brain, ArrowRight, Zap } from 'lucide-react';

interface LanguageQuiz {
  code: string;
  name: string;
  flag: string;
  description: string;
  color: string;
  borderColor: string;
}

const quizzes: LanguageQuiz[] = [
  {
    code: 'french',
    name: 'French',
    flag: '🇫🇷',
    description: 'Test your French vocabulary',
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-600',
  },
  {
    code: 'spanish',
    name: 'Spanish',
    flag: '🇪🇸',
    description: 'Challenge yourself with Spanish',
    color: 'from-red-400 to-orange-500',
    borderColor: 'border-orange-600',
  },
  {
    code: 'german',
    name: 'German',
    flag: '🇩🇪',
    description: 'Learn German vocabulary',
    color: 'from-gray-600 to-gray-800',
    borderColor: 'border-gray-800',
  },
  {
    code: 'japanese',
    name: 'Japanese',
    flag: '🇯🇵',
    description: 'Master Japanese characters',
    color: 'from-pink-400 to-rose-600',
    borderColor: 'border-rose-600',
  },
  {
    code: 'italian',
    name: 'Italian',
    flag: '🇮🇹',
    description: 'Practice Italian words',
    color: 'from-green-400 to-emerald-600',
    borderColor: 'border-emerald-600',
  },
  {
    code: 'portuguese',
    name: 'Portuguese',
    flag: '🇵🇹',
    description: 'Improve your Portuguese',
    color: 'from-teal-400 to-cyan-600',
    borderColor: 'border-cyan-600',
  },
];

interface QuizMePageProps {
  bestScore?: number;
}

export default function QuizMePage({ bestScore = 0 }: QuizMePageProps) {
  const page = usePage();
  const auth = (page.props as any).auth as { user: { name: string; email: string | null } | null } | undefined;

  if (!auth?.user) {
    return null; // Should not happen due to AllowGuests middleware, but safety check
  }

  return (
    <AuthenticatedLayout user={auth.user}>
      <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-5 py-3 bg-orange-200 rounded-full border-[5px] border-orange-600 mb-4 shadow-[4px_4px_0px_0px_#ea580c] animate-[bounce-gentle_2s_ease-in-out_infinite]">
          <Brain className="w-6 h-6 text-orange-700" />
          <span className="text-orange-800 logo-font text-lg">Test Your Skills</span>
        </div>
        <div className="relative inline-block">
          <h1 className="text-5xl lg:text-6xl text-black logo-font mb-3" style={{
            textShadow: '4px 4px 0px #f97316'
          }}>
            QuizMe 🧠
          </h1>
          <div className="absolute -top-8 -right-10 text-6xl animate-[bounce-gentle_2.5s_ease-in-out_infinite]">🎯</div>
          <div className="absolute -bottom-6 -left-10 text-5xl animate-[wiggle_3s_ease-in-out_infinite]">💡</div>
        </div>
        <p className="text-gray-700 text-xl logo-font">
          Choose a language and test your knowledge with fun quizzes!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 rounded-[3rem] bg-white shadow-[8px_8px_0px_0px_#000] border-[6px] border-black hover:shadow-[10px_10px_0px_0px_#000] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 mb-1 logo-font">Available Quizzes</p>
              <p className="text-5xl text-black logo-font">{quizzes.length}</p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-blue-200 flex items-center justify-center border-[4px] border-blue-600 animate-[wiggle_3s_ease-in-out_infinite]">
              <span className="text-4xl">📝</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[3rem] bg-white shadow-[8px_8px_0px_0px_#000] border-[6px] border-black hover:shadow-[10px_10px_0px_0px_#000] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 mb-1 logo-font">Questions Each</p>
              <p className="text-5xl text-black logo-font">10</p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-purple-200 flex items-center justify-center border-[4px] border-purple-600 animate-[wiggle_3.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
              <span className="text-4xl">❓</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[3rem] bg-white shadow-[8px_8px_0px_0px_#000] border-[6px] border-black hover:shadow-[10px_10px_0px_0px_#000] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 mb-1 logo-font">Your Best Score</p>
              <p className="text-5xl text-black logo-font">{bestScore > 0 ? bestScore : '--'}</p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-yellow-200 flex items-center justify-center border-[4px] border-yellow-600 animate-[wiggle_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
              <span className="text-4xl">🏆</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quizzes.map((quiz, index) => (
          <Card
            key={quiz.code}
            className="p-6 rounded-[3rem] bg-white shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-[6px] border-black hover:rotate-2 relative overflow-hidden"
            onClick={() => router.visit(`/quiz/${quiz.code}/levels`)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="absolute top-4 right-4 text-7xl opacity-10 animate-[spin_15s_linear_infinite]">⭐</div>
            
            <div className="space-y-4 relative z-10">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${quiz.color} flex items-center justify-center text-6xl shadow-[6px_6px_0px_0px_#000] border-[5px] ${quiz.borderColor} group-hover:scale-110 group-hover:animate-[wiggle_0.5s_ease-in-out] transition-transform`}>
                {quiz.flag}
              </div>

              <div>
                <h3 className="text-3xl text-black logo-font mb-2">{quiz.name}</h3>
                <p className="text-gray-700 text-lg">{quiz.description}</p>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-full border-[4px] border-black group-hover:bg-yellow-200 group-hover:border-orange-500 transition-all py-7 shadow-[4px_4px_0px_0px_#000] group-hover:shadow-[6px_6px_0px_0px_#000] logo-font text-lg"
              >
                Start Quiz 🚀
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <Card className="p-10 rounded-[4rem] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-[12px_12px_0px_0px_#000] border-[6px] border-black relative overflow-hidden">
        <div className="absolute top-10 right-10 text-9xl opacity-20 animate-[spin_20s_linear_infinite]">🎯</div>
        <div className="absolute bottom-10 left-10 text-8xl opacity-20 animate-[spin_15s_linear_infinite_reverse]">⚡</div>
        <div className="absolute top-1/2 left-1/4 text-7xl opacity-15 animate-[bounce-gentle_3s_ease-in-out_infinite]">💫</div>
        
        <div className="text-center space-y-6 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-[4px] border-white animate-[wiggle_2s_ease-in-out_infinite]">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-[4px] border-white animate-[wiggle_2s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }}>
              <Zap className="w-10 h-10 text-yellow-300" />
            </div>
          </div>
          <h2 className="text-5xl text-white logo-font drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">How It Works 🎮</h2>
          <p className="text-white text-2xl max-w-2xl mx-auto logo-font drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
            Each quiz contains 10 questions. You'll be shown a word in English and need to select
            the correct translation. Track your progress and improve your vocabulary! Let's go! 🚀
          </p>
        </div>
      </Card>
    </div>
    </AuthenticatedLayout>
  );
}