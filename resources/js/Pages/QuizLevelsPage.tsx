import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Star, Zap, Trophy, Crown, Sparkles, Flame } from 'lucide-react';

interface QuizLevelsPageProps {
  language: string;
}

const levelData = [
  {
    level: 1,
    name: 'Beginner',
    icon: '🌱',
    description: 'Basic greetings and common words',
    color: 'from-green-400 to-green-600',
    borderColor: 'border-green-600',
    difficulty: 'Easy',
  },
  {
    level: 2,
    name: 'Elementary',
    icon: '📚',
    description: 'Numbers, colors, and family',
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-600',
    difficulty: 'Easy',
  },
  {
    level: 3,
    name: 'Intermediate',
    icon: '🎯',
    description: 'Food, animals, and body parts',
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-600',
    difficulty: 'Medium',
  },
  {
    level: 4,
    name: 'Upper Intermediate',
    icon: '⚡',
    description: 'Actions, emotions, and time',
    color: 'from-orange-400 to-orange-600',
    borderColor: 'border-orange-600',
    difficulty: 'Medium',
  },
  {
    level: 5,
    name: 'Advanced',
    icon: '🔥',
    description: 'Places, professions, and travel',
    color: 'from-red-400 to-red-600',
    borderColor: 'border-red-600',
    difficulty: 'Hard',
  },
  {
    level: 6,
    name: 'Expert',
    icon: '👑',
    description: 'Complex phrases and expressions',
    color: 'from-yellow-400 to-amber-600',
    borderColor: 'border-amber-600',
    difficulty: 'Very Hard',
  },
];

const languageInfo: Record<string, { name: string; flag: string }> = {
  french: { name: 'French', flag: '🇫🇷' },
  spanish: { name: 'Spanish', flag: '🇪🇸' },
  german: { name: 'German', flag: '🇩🇪' },
  japanese: { name: 'Japanese', flag: '🇯🇵' },
  italian: { name: 'Italian', flag: '🇮🇹' },
  portuguese: { name: 'Portuguese', flag: '🇵🇹' },
};

export default function QuizLevelsPage({ language }: QuizLevelsPageProps) {
  const page = usePage();
  const auth = (page.props as any).auth as { user: { name: string; email: string | null } | null } | undefined;

  if (!auth?.user) {
    return null;
  }

  const langInfo = languageInfo[language] || { name: language, flag: '🌍' };

  const handleLevelSelect = (level: number) => {
    router.visit(`/quiz/${language}/${level}`);
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.visit('/quizme')}
          className="mb-6 rounded-full border-[4px] border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all logo-font text-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Quizzes
        </Button>

        {/* Header */}
        <div className="mb-8 text-center relative">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-200 rounded-full border-[5px] border-blue-600 mb-4 shadow-[4px_4px_0px_0px_#3b82f6]">
            <span className="text-6xl">{langInfo.flag}</span>
            <span className="text-blue-800 logo-font text-2xl">{langInfo.name}</span>
          </div>
          <h1 className="text-5xl lg:text-6xl text-black logo-font mb-3" style={{ textShadow: '4px 4px 0px #f97316' }}>
            Choose Your Level 🎮
          </h1>
          <p className="text-gray-700 text-xl logo-font">
            Select a difficulty level to start your quiz!
          </p>
        </div>

        {/* Level Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {levelData.map((levelInfo, index) => (
            <Card
              key={levelInfo.level}
              className="p-6 rounded-[3rem] bg-white shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-[6px] border-black relative overflow-hidden"
              onClick={() => handleLevelSelect(levelInfo.level)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background decoration */}
              <div className="absolute top-4 right-4 text-7xl opacity-10 group-hover:animate-spin">
                {levelInfo.icon}
              </div>

              {/* Level badge */}
              <div className="absolute top-4 left-4">
                <div className="px-4 py-2 bg-black text-white rounded-full logo-font text-sm shadow-[2px_2px_0px_0px_#fff]">
                  Level {levelInfo.level}
                </div>
              </div>

              <div className="space-y-4 relative z-10 mt-12">
                {/* Icon */}
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-6xl shadow-[6px_6px_0px_0px_#000] border-[5px] ${levelInfo.borderColor} group-hover:scale-110 transition-transform`}>
                  {levelInfo.icon}
                </div>

                {/* Level info */}
                <div className="text-center">
                  <h3 className="text-2xl text-black logo-font mb-2">{levelInfo.name}</h3>
                  <p className="text-gray-700 text-base mb-3">{levelInfo.description}</p>
                  
                  {/* Difficulty badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-[3px] ${
                    levelInfo.difficulty === 'Easy' ? 'bg-green-100 border-green-600 text-green-800' :
                    levelInfo.difficulty === 'Medium' ? 'bg-yellow-100 border-yellow-600 text-yellow-800' :
                    levelInfo.difficulty === 'Hard' ? 'bg-orange-100 border-orange-600 text-orange-800' :
                    'bg-red-100 border-red-600 text-red-800'
                  } logo-font text-sm`}>
                    {levelInfo.difficulty === 'Easy' && <Star className="w-4 h-4" />}
                    {levelInfo.difficulty === 'Medium' && <Zap className="w-4 h-4" />}
                    {levelInfo.difficulty === 'Hard' && <Flame className="w-4 h-4" />}
                    {levelInfo.difficulty === 'Very Hard' && <Crown className="w-4 h-4" />}
                    {levelInfo.difficulty}
                  </div>
                </div>

                {/* Start button */}
                <Button
                  variant="outline"
                  className="w-full rounded-full border-[4px] border-black group-hover:bg-yellow-200 group-hover:border-orange-500 transition-all py-6 shadow-[4px_4px_0px_0px_#000] group-hover:shadow-[6px_6px_0px_0px_#000] logo-font text-lg"
                >
                  Start Level {levelInfo.level} 🚀
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="p-8 rounded-[4rem] bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 shadow-[12px_12px_0px_0px_#000] border-[6px] border-black relative overflow-hidden">
          <div className="absolute top-10 right-10 text-9xl opacity-20 animate-bounce">💡</div>
          <div className="text-center space-y-4 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-12 h-12 text-yellow-300" />
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl text-white logo-font drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
              Challenge Yourself! 🎯
            </h2>
            <p className="text-white text-xl max-w-2xl mx-auto logo-font drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
              Each level contains 10 questions. Start with Level 1 if you're new, or jump to a higher level to test your skills! 
              Complete all 6 levels to become a master! 🏆
            </p>
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
