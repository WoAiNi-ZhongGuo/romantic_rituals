import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-love-400 to-love-600 flex items-center justify-center px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-love-500 rounded-full p-4 mb-4">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-love-700">Lover</h1>
          <p className="text-sm text-gray-500 mt-1">我们的故事</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-love-400 focus:border-transparent"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-love-500 text-white py-3 rounded-xl font-semibold hover:bg-love-600 transition-colors active:scale-[0.98]"
          >
            进入
          </button>
        </form>
      </div>
    </div>
  );
}
