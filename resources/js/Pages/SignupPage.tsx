import { FormEventHandler } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/signup');
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-purple-300 rounded-full opacity-60 blur-2xl animate-[float_7s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-blue-300 rounded-full opacity-60 blur-3xl animate-[float_9s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/4 left-1/4 text-8xl opacity-15 animate-[spin_15s_linear_infinite]">🎨</div>
      <div className="absolute bottom-1/3 right-1/3 text-7xl opacity-15 animate-[wiggle_3.5s_ease-in-out_infinite]">🌟</div>
      <div className="absolute top-1/2 right-1/4 text-6xl opacity-10 animate-[bounce-gentle_2.5s_ease-in-out_infinite]">🎉</div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-pink-400 rounded-full border-[5px] border-black animate-pulse"></div>
          <div className="relative">
            <div className="inline-flex items-center gap-3 mb-4">
              <h1 className="text-6xl text-black logo-font" style={{
                textShadow: '4px 4px 0px #FFD89B'
              }}>Lyrin</h1>
              <span className="text-5xl animate-[wiggle_2s_ease-in-out_infinite]">✨</span>
            </div>
            <div className="absolute -left-12 top-0 text-4xl animate-[spin_10s_linear_infinite]">🚀</div>
          </div>
          <p className="text-gray-800 text-xl logo-font">Create your account and start learning! 🎓</p>
        </div>

        {/* Signup Card */}
        <Card className="p-8 rounded-[3rem] shadow-[10px_10px_0px_0px_#000] bg-white border-[6px] border-black relative overflow-hidden">
          <div className="absolute top-6 right-6 text-6xl opacity-10 animate-[wiggle_4s_ease-in-out_infinite]">💡</div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-gray-900 text-lg logo-font">Name 👤</Label>
              <Input
                id="name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="rounded-3xl border-[4px] border-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 h-16 px-5 bg-[#FFFBF0] text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.2)]"
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-900 text-lg logo-font">Email 📧</Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="your.email@example.com"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="rounded-3xl border-[4px] border-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 h-16 px-5 bg-[#FFFBF0] text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.2)]"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-900 text-lg logo-font">Password 🔑</Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="rounded-3xl border-[4px] border-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 h-16 px-5 bg-[#FFFBF0] text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.2)]"
              />
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password_confirmation" className="text-gray-900 text-lg logo-font">Confirm Password ✅</Label>
              <Input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                className="rounded-3xl border-[4px] border-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 h-16 px-5 bg-[#FFFBF0] text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.2)]"
              />
            </div>

            <Button
              type="submit"
              disabled={processing}
              className="w-full py-8 text-xl rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-[6px_6px_0px_0px_#6b21a8] border-[5px] border-black hover:scale-105 transition-all hover:shadow-[8px_8px_0px_0px_#6b21a8] active:translate-x-1 active:translate-y-1 logo-font"
            >
              <UserPlus className="w-6 h-6 mr-2" />
              {processing ? 'Signing up...' : 'Sign Up 🎉'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t-[4px] border-dashed border-gray-400 space-y-5">
            <p className="text-center text-gray-800 text-lg logo-font">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-purple-600 hover:text-purple-800 underline decoration-wavy decoration-2 underline-offset-4 hover:scale-105 transition-transform inline-block"
              >
                Log in now 🔐
              </Link>
            </p>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-gray-800 hover:text-black text-xl logo-font hover:scale-110 transition-transform inline-flex items-center gap-2 px-6 py-3 rounded-full hover:bg-white/50 border-[3px] border-transparent hover:border-black"
          >
            <span className="text-2xl">←</span> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
