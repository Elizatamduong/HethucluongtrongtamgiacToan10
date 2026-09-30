import React from 'react';
import { AppMode } from '../types/geometry';
import { RotateCcw, Compass } from 'lucide-react';

interface FormulaHeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onResetTriangle: () => void;
}

export const FormulaHeader: React.FC<FormulaHeaderProps> = ({
  currentMode,
  onSelectMode,
  onResetTriangle,
}) => {
  const modes: { id: AppMode; label: string; number: string }[] = [
    { id: 'cos-theorem', label: 'Định lý cosin', number: '1' },
    { id: 'sin-theorem', label: 'Định lý sin', number: '2' },
    { id: 'area-formulas', label: 'Diện tích tam giác', number: '3' },
    { id: 'practical-problems', label: 'Bài toán thực tế', number: '4' },
  ];

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0 z-20">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <h1 className="text-base font-bold tracking-tight text-white uppercase">
            HỆ THỨC LƯỢNG TRONG TAM GIÁC
          </h1>
        </div>
        <span className="text-xs text-slate-500 hidden lg:inline">Toán 10</span>
      </div>

      {/* Zone 2: 4 Main Mode Tabs */}
      <nav className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-lg border border-slate-800/80">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  isActive ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {m.number}
              </span>
              <span>{m.label}</span>
            </button>
          );
        })}

        <div className="w-[1px] h-4 bg-slate-800 my-auto mx-0.5" />

        {/* Free Explore Tab */}
        <button
          onClick={() => onSelectMode('free-explore')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentMode === 'free-explore'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Tự tạo tam giác</span>
        </button>
      </nav>

      {/* Zone 3: Actions & Author Attribution */}
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/80">
          <span>Bản quyền: <strong className="text-slate-200 font-semibold">Cô giáo Eliza Tâm Dương</strong></span>
          <span className="text-slate-600">·</span>
          <a href="tel:0962571826" className="text-cyan-400 hover:text-cyan-300 font-mono-math">0962571826</a>
        </div>

        <button
          onClick={onResetTriangle}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors whitespace-nowrap"
          title="Đặt lại tam giác về vị trí chuẩn ban đầu"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>
    </header>
  );
};
