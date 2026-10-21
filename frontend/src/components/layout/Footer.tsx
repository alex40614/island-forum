import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, TrendingUp, Calendar, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">島</span>
              </div>
              <span className="text-2xl font-bold text-white">Island</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              讓好奇心，有地方停靠
            </p>
            <p className="text-slate-500 text-xs">
              每一種聲音，都是一座島。在這裡，你可以與有趣的人分享想法、探索未知、建立真誠的連結。
            </p>
          </div>

          {/* 快速連結 */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速連結</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/discussions" className="text-slate-400 hover:text-cyan-400 transition text-sm flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>討論區</span>
                </Link>
              </li>
              <li>
                <Link to="/hot" className="text-slate-400 hover:text-cyan-400 transition text-sm flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>熱門話題</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-slate-400 hover:text-cyan-400 transition text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>活動</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 社群規範 */}
          <div>
            <h3 className="text-white font-semibold mb-4">社群</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/guidelines" className="text-slate-400 hover:text-cyan-400 transition text-sm flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>社群守則</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-cyan-400 transition text-sm">
                  關於我們
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-slate-400 hover:text-cyan-400 transition text-sm">
                  意見回饋
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 Island. Made with ❤️ for curious minds.
          </p>
        </div>
      </div>
    </footer>
  );
};
