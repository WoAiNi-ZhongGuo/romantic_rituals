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
    <div className="flex flex-col h-screen bg-love-50">
      <header className="bg-love-500 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 fill-white" />
          <span className="font-semibold text-lg">Lover</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg hover:bg-love-600 transition-colors"
          title="退出登录"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-love-200 safe-area-bottom">
        <div className="flex justify-around py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-love-600'
                    : 'text-gray-400 hover:text-love-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
