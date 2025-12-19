import { Link, router } from '@inertiajs/react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Languages, BookOpen, Brain, Sparkles, Star, Zap } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function Homepage() {

  const features = [
    {
      icon: Languages,
      title: 'Translate Words',
      description: 'Instantly translate words between different languages with ease.',
      emoji: '🌍',
      color: 'from-blue-400 to-blue-600',
    },
    {
      icon: BookOpen,
      title: 'Dictionary Search',
      description: 'Explore comprehensive word definitions and meanings.',
      emoji: '📚',
      color: 'from-amber-400 to-orange-500',
    },
    {
      icon: Brain,
      title: 'Quiz-Based Learning',
      description: 'Test your knowledge with interactive quizzes and track your progress.',
      emoji: '🧠',
      color: 'from-purple-400 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-blue-300 rounded-full opacity-50 blur-2xl animate-[float_6s_ease-in-out_infinite]"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-amber-300 rounded-full opacity-50 blur-3xl animate-[float_8s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-purple-300 rounded-full opacity-50 blur-2xl animate-[float_7s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/4 text-8xl opacity-10 animate-[wiggle_3s_ease-in-out_infinite]">⭐</div>
      <div className="absolute bottom-1/3 left-1/3 text-7xl opacity-10 animate-[wiggle_4s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }}>💡</div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 lg:py-20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-blue-200 rounded-full border-[5px] border-blue-600 shadow-lg shadow-blue-300 animate-[bounce-gentle_2s_ease-in-out_infinite]">
                  <Sparkles className="w-6 h-6 text-blue-700" />
                  <span className="text-blue-800 logo-font">Welcome to language learning!</span>
                </div>
                
                <div className="relative inline-block">
                  <h1 className="text-6xl lg:text-8xl text-black logo-font relative z-10" style={{
                    textShadow: '4px 4px 0px #FFD89B, 8px 8px 0px rgba(0,0,0,0.1)'
                  }}>
                    Lyrin
                  </h1>
                  <div className="absolute -top-8 -right-8 text-6xl animate-[spin_3s_linear_infinite]">✨</div>
                  <div className="absolute -bottom-4 -left-6 text-5xl animate-[bounce_2s_ease-in-out_infinite]">🎨</div>
                </div>
                
                <p className="text-2xl lg:text-3xl text-gray-800 max-w-xl logo-font">
                  Learn, translate, and quiz yourself on words from different languages. Make learning fun! 🎉
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button 
                    className="px-10 py-8 text-xl rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-[6px_6px_0px_0px_#1e40af] hover:shadow-[8px_8px_0px_0px_#1e40af] transition-all hover:scale-105 border-[5px] border-black active:translate-x-1 active:translate-y-1 active:shadow-[4px_4px_0px_0px_#1e40af]"
                  >
                    <Zap className="w-6 h-6 mr-2" />
                    Get Started 🚀
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="outline"
                    className="px-10 py-8 text-xl rounded-full border-[5px] border-black hover:bg-yellow-200 transition-all hover:scale-105 shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[4px_4px_0px_0px_#000] bg-white"
                  >
                    Learn More 📖
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-[4rem] rotate-6 opacity-40 blur-sm"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-[4rem] -rotate-3 opacity-30"></div>
              <div className="relative rounded-[4rem] overflow-hidden shadow-[12px_12px_0px_0px_#000] border-[6px] border-black hover:scale-105 transition-transform">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1565022536102-f7645c84354a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGxlYXJuaW5nJTIwYm9va3N8ZW58MXx8fHwxNzY1ODgzMjMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Language learning"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              {/* Floating decorations */}
              <div className="absolute -top-8 -right-8 text-7xl animate-[bounce-gentle_2s_ease-in-out_infinite]">📖</div>
              <div className="absolute -bottom-6 -left-6 text-6xl animate-[wiggle_3s_ease-in-out_infinite]">✨</div>
              <div className="absolute top-10 -left-10 text-5xl animate-[spin_10s_linear_infinite]">🌟</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block relative mb-6">
              <h2 className="text-5xl lg:text-6xl text-black logo-font relative z-10" style={{
                textShadow: '4px 4px 0px #FFE5B4'
              }}>
                Why Choose Lyrin? 🌟
              </h2>
              <div className="absolute -top-6 -right-8 w-16 h-16 bg-yellow-400 rounded-full border-[4px] border-black animate-[bounce_2s_ease-in-out_infinite]"></div>
            </div>
            <p className="text-gray-700 text-xl logo-font">Everything you need to master new languages</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-8 rounded-[3rem] border-[6px] border-black bg-white hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-300 hover:-translate-y-3 hover:rotate-2 cursor-pointer relative overflow-hidden shadow-[6px_6px_0px_0px_#000]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-4 right-4 text-8xl opacity-15 animate-[wiggle_4s_ease-in-out_infinite]">{feature.emoji}</div>
                <div className="space-y-5 relative z-10">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-[6px_6px_0px_0px_#000] border-[5px] border-black hover:animate-[wiggle_0.5s_ease-in-out]`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl text-black logo-font">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-lg">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Fun Stats Section */}
      <div className="container mx-auto px-4 py-12 mb-12">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-yellow-400 rounded-full border-[5px] border-black animate-[bounce-gentle_3s_ease-in-out_infinite]"></div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-pink-400 rounded-full border-[5px] border-black animate-[bounce-gentle_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>
          
          <Card className="rounded-[4rem] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-12 text-center shadow-[12px_12px_0px_0px_#000] border-[6px] border-black relative overflow-hidden">
            <div className="absolute top-10 left-10 text-8xl opacity-20 animate-[spin_20s_linear_infinite]">🎯</div>
            <div className="absolute bottom-10 right-10 text-8xl opacity-20 animate-[spin_15s_linear_infinite_reverse]">🏆</div>
            <div className="absolute top-1/2 right-20 text-6xl opacity-15 animate-[bounce-gentle_2.5s_ease-in-out_infinite]">⭐</div>
            <div className="absolute bottom-1/3 left-16 text-6xl opacity-15 animate-[wiggle_3s_ease-in-out_infinite]">💫</div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-10 h-10 text-yellow-300 fill-yellow-300 animate-[wiggle_2s_ease-in-out_infinite]" />
                <Star className="w-10 h-10 text-yellow-300 fill-yellow-300 animate-[wiggle_2s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                <Star className="w-10 h-10 text-yellow-300 fill-yellow-300 animate-[wiggle_2s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
              </div>
              
              <h2 className="text-white text-5xl lg:text-6xl logo-font drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
                Start Your Language Journey Today! 🚀
              </h2>
              <p className="text-white text-2xl max-w-2xl mx-auto logo-font drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                Join thousands of learners expanding their vocabulary and mastering new languages with Lyrin.
              </p>
              <Link href="/login">
                <Button 
                  className="px-12 py-8 text-2xl rounded-full bg-white text-blue-600 hover:bg-yellow-200 shadow-[8px_8px_0px_0px_#000] border-[5px] border-black hover:scale-110 transition-all hover:shadow-[10px_10px_0px_0px_#000] active:translate-x-1 active:translate-y-1 logo-font"
                >
                  Get Started Free 🎉
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
