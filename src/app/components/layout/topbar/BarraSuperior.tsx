import { Bell, Share2, Upload, ChevronDown } from 'lucide-react';

interface BarraSuperiorProps {
  onPublish: () => void;
  onShare: () => void;
}

export function BarraSuperior({ onPublish, onShare }: BarraSuperiorProps) {
  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left - Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">Generador de Software</span>
          <span className="text-slate-400">/</span>
          <span className="font-medium text-slate-900">Dashboard</span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Share Button */}
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-all text-slate-700 font-medium"
          >
            <Share2 size={18} />
            <span>Compartir</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={onPublish}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-500/30"
          >
            <Upload size={18} />
            <span>Publicar</span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-200">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-slate-900">John Doe</div>
                <div className="text-xs text-slate-500">Admin</div>
              </div>
              <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
