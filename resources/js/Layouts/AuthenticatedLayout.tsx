import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Languages, BookOpen, Brain, LogOut, Menu, X } from 'lucide-react';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string | null;
  };
}

export default function AuthenticatedLayout({ children, user }: AuthenticatedLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { url } = usePage();

  const navItems = [
    { path: '/translator', label: 'Translator', icon: Languages, emoji: '🌍' },
    { path: '/dictionary', label: 'Dictionary', icon: BookOpen, emoji: '📚' },
    { path: '/quizme', label: 'QuizMe', icon: Brain, emoji: '🧠' },
  ];

  const handleLogout = () => {
    router.post('/logout');
  };

  const isActivePath = (path: string) => url === path;

  const getInitial = () => {
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-blue-300 rounded-full opacity-40 blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-40 left-20 w-48 h-48 bg-purple-300 rounded-full opacity-40 blur-3xl animate-[float_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/3 text-9xl opacity-5 animate-[spin_30s_linear_infinite]">⭐</div>

      {/* Header/Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b-[6px] border-black sticky top-0 z-50 shadow-[0_6px_0_0_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 relative group cursor-pointer">
              <h2 className="text-4xl text-black logo-font hover:scale-110 transition-transform" style={{
                textShadow: '3px 3px 0px #FFD89B'
              }}>Lyrin</h2>
              <span className="text-3xl animate-[wiggle_2s_ease-in-out_infinite]">✨</span>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-[3px] border-black opacity-0 group-hover:opacity-100 group-hover:animate-[bounce_1s_ease-in-out_infinite] transition-opacity"></div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActivePath(item.path) ? "default" : "ghost"}
                    className={`rounded-full px-6 py-7 transition-all logo-font text-lg ${
                      isActivePath(item.path)
                        ? 'bg-blue-600 text-white border-[4px] border-black shadow-[4px_4px_0px_0px_#000] scale-105'
                        : 'hover:bg-yellow-200 border-[3px] border-transparent hover:border-black hover:scale-105 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                    }`}
                  >
                    <span className="mr-2 text-xl">{item.emoji}</span>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/profile">
                <Button
                  variant="ghost"
                  className={`rounded-full px-4 py-7 border-[3px] transition-all hover:scale-105 ${
                    isActivePath('/profile') 
                      ? 'bg-purple-200 border-purple-600 shadow-[4px_4px_0px_0px_#7c3aed]' 
                      : 'border-transparent hover:bg-yellow-200 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                  }`}
                >
                  <Avatar className="w-12 h-12 mr-2 border-[4px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl logo-font">
                      {getInitial()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-black logo-font text-lg">{user.name}</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-full border-[4px] border-black hover:bg-red-200 hover:border-red-600 transition-all py-7 hover:scale-105 bg-white shadow-[4px_4px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#dc2626] logo-font text-lg"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-4 rounded-3xl hover:bg-yellow-200 border-[4px] border-black shadow-[4px_4px_0px_0px_#000] bg-white hover:scale-105 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7 text-gray-900" />
              ) : (
                <Menu className="w-7 h-7 text-gray-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 space-y-4 border-t-[4px] border-dashed border-gray-400 bg-white rounded-b-[2rem]">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActivePath(item.path) ? "default" : "ghost"}
                    className={`w-full justify-start rounded-full py-7 text-lg logo-font ${
                      isActivePath(item.path)
                        ? 'bg-blue-600 text-white border-[4px] border-black shadow-[4px_4px_0px_0px_#000]'
                        : 'hover:bg-yellow-200 border-[3px] border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                    }`}
                  >
                    <span className="mr-2 text-xl">{item.emoji}</span>
                    {item.label}
                  </Button>
                </Link>
              ))}

              <div className="pt-4 border-t-[4px] border-dashed border-gray-400 space-y-4">
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-full py-7 hover:bg-yellow-200 border-[3px] border-transparent hover:border-black text-lg logo-font hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                  >
                    <Avatar className="w-12 h-12 mr-3 border-[4px] border-black">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl logo-font">
                        {getInitial()}
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start rounded-full border-[4px] border-black hover:bg-red-200 hover:border-red-600 py-7 shadow-[4px_4px_0px_0px_#000] bg-white logo-font text-lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}

