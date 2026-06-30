import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Heart, CalendarDays, BookHeart, CheckSquare, Images, LogOut } from 'lucide-react';
import { logout } from '../lib/auth';

const navItems = [
  { to: '/', icon: Heart, label: '首页' },
  { to: '/anniversaries', icon: CalendarDays, label: '纪念日' },
  { to: '/diary', icon: BookHeart, label: '日记' },
  { to: '/missions', icon: CheckSquare, label: '打卡' },
  { to: '/photos', icon: Images, label: '相册' },
];

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #fdf2f8 50%, #fff1f2 100%)' }}>
      <header className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-love-500 to-rose-400 flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-base text-gray-800 tracking-wide">Lover</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-white transition-all card-hover"
          title="退出登录"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24 scroll-smooth">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 safe-area-bottom">
        <div className="mx-3 mb-3 glass-strong rounded-2xl shadow-lg flex justify-around py-2 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-love-600 bg-love-50/80 shadow-sm'
                    : 'text-gray-400 hover:text-love-400 hover:bg-love-50/40'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="text-[9px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
