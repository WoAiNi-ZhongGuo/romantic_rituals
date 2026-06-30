import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Lock, Sparkles } from 'lucide-react';
import { login } from '../lib/auth';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/');
    } else {
      setError('密码错误');
      setPassword('');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-love-900 via-love-700 to-rose-500" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-love-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

      {/* 装饰粒子 */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            top: `${15 + i * 14}%`,
            left: `${10 + i * 16}%`,
            animation: `fadeInUp ${0.8 + i * 0.2}s ease ${i * 0.1}s forwards`,
            opacity: 0,
          }}
        />
      ))}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/20 glow mb-5">
              <Heart className="w-9 h-9 text-white animate-heartbeat" />
            </div>
            <h1 className="text-3xl font-light tracking-wider text-white mb-1">
              Lover
            </h1>
            <p className="text-white/60 text-sm tracking-wider">我们的故事</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/15 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/15 rounded-2xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-rose-300 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-white/20 hover:bg-white/30 text-white py-3.5 rounded-2xl font-medium text-sm tracking-wider transition-all active:scale-[0.98] border border-white/20"
              >
                进入
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-white/20 text-xs tracking-widest">
            <Sparkles className="w-3 h-3 inline mr-1" />
            FOR US
          </p>
        </div>
      </div>
    </div>
  );
}
