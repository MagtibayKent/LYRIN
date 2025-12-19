// NOTE: This component is not used - AuthenticatedLayout is the active layout for Inertia
// Keeping this file for reference but it uses react-router-dom which is not compatible with Inertia
// This file should be deleted or kept only for reference purposes

import { useState } from 'react';
// import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // NOT USED - Inertia doesn't use react-router
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Languages, BookOpen, Brain, LogOut, Menu, X } from 'lucide-react';
import { User as UserType } from '../app.tsx';

interface MainLayoutProps {
  user: UserType;
  onLogout: () => void;
}

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
  // const navigate = useNavigate(); // NOT USED - Use Inertia's router.visit() instead
  // const location = useLocation(); // NOT USED - Use Inertia's usePage().url instead
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/translator', label: 'Translator', icon: Languages, emoji: '🌍' },
    { path: '/dictionary', label: 'Dictionary', icon: BookOpen, emoji: '📚' },
    { path: '/quizme', label: 'QuizMe', icon: Brain, emoji: '🧠' },
  ];

  const handleLogout = () => {
    onLogout();
    // navigate('/login'); // NOT USED - Use Inertia's router.post('/logout') instead
  };

  const isActivePath = (_path: string) => {
    // location.pathname === path; // NOT USED - Use Inertia's usePage().url instead
    return false; // Placeholder since this component is not actively used
  };

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
            <div className="flex items-center space-x-2 relative group cursor-pointer" onClick={() => {/* navigate('/'); // NOT USED */}}>
              <h2 className="text-4xl text-black logo-font hover:scale-110 transition-transform" style={{
                textShadow: '3px 3px 0px #FFD89B'
              }}>Lyrin</h2>
              <span className="text-3xl animate-[wiggle_2s_ease-in-out_infinite]">✨</span>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-[3px] border-black opacity-0 group-hover:opacity-100 group-hover:animate-[bounce_1s_ease-in-out_infinite] transition-opacity"></div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActivePath(item.path) ? "default" : "ghost"}
                  onClick={() => {/* navigate(item.path); // NOT USED - Use Inertia's Link component instead */}}
                  className={`rounded-full px-6 py-7 transition-all logo-font text-lg ${
                    isActivePath(item.path)
                      ? 'bg-blue-600 text-white border-[4px] border-black shadow-[4px_4px_0px_0px_#000] scale-105'
                      : 'hover:bg-yellow-200 border-[3px] border-transparent hover:border-black hover:scale-105 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                  }`}
                >
                  <span className="mr-2 text-xl">{item.emoji}</span>
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => {/* navigate('/profile'); // NOT USED - Use Inertia's Link component instead */}}
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
                <Button
                  key={item.path}
                  variant={isActivePath(item.path) ? "default" : "ghost"}
                  onClick={() => {
                    // navigate(item.path); // NOT USED - Use Inertia's Link component instead
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full justify-start rounded-full py-7 text-lg logo-font ${
                    isActivePath(item.path)
                      ? 'bg-blue-600 text-white border-[4px] border-black shadow-[4px_4px_0px_0px_#000]'
                      : 'hover:bg-yellow-200 border-[3px] border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                  }`}
                >
                  <span className="mr-2 text-xl">{item.emoji}</span>
                  {item.label}
                </Button>
              ))}

              <div className="pt-4 border-t-[4px] border-dashed border-gray-400 space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    // navigate('/profile'); // NOT USED - Use Inertia's Link component instead
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start rounded-full py-7 hover:bg-yellow-200 border-[3px] border-transparent hover:border-black text-lg logo-font hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  <Avatar className="w-12 h-12 mr-3 border-[4px] border-black">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl logo-font">
                      {getInitial()}
                    </AvatarFallback>
                  </Avatar>
                  {user.name}
                </Button>

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
        {/* <Outlet /> NOT USED - Use children prop instead (see AuthenticatedLayout) */}
      </main>
    </div>
  );
}
