import React from 'react';
import { TriangleMetrics } from '../types/geometry';
import { CheckCircle2, CircleDot } from 'lucide-react';

interface SinTheoremPanelProps {
  selectedPair: 'A' | 'B' | 'C' | 'all';
  onSelectPair: (pair: 'A' | 'B' | 'C' | 'all') => void;
  metrics: TriangleMetrics;
}

export const SinTheoremPanel: React.FC<SinTheoremPanelProps> = ({
  selectedPair,
  onSelectPair,
  metrics,
}) => {
  const { a, b, c, angleA, angleB, angleC, R, sinRatioA, sinRatioB, sinRatioC } = metrics;
  const diameter = (2 * R).toFixed(2);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-4 overflow-y-auto space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Định lý Sin
          </h2>
          <span className="text-[10px] text-sky-400 font-mono-math bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
            R = {R}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Mối liên hệ giữa cạnh, góc đối diện và đường tròn ngoại tiếp.
        </p>
      </div>

      {/* Main Formula Highlight Card */}
      <div className="p-3 bg-sky-950/40 rounded-lg border border-sky-800/40 text-center">
        <div className="text-[11px] text-sky-300 font-medium mb-1">
          Định lý Sin toàn cảnh
        </div>
        <div className="text-base font-mono-math font-bold text-white tracking-wide flex items-center justify-center gap-1.5">
          <span className="text-amber-400">a/sin A</span>
          <span className="text-slate-500">=</span>
          <span className="text-cyan-400">b/sin B</span>
          <span className="text-slate-500">=</span>
          <span className="text-purple-400">c/sin C</span>
          <span className="text-slate-500">=</span>
          <span className="text-sky-300">2R</span>
        </div>
      </div>

      {/* Opposite Pairs Selector (A ↔ a, B ↔ b, C ↔ c, All) */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Chọn cặp cạnh - góc đối diện để soi sáng:</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
          <button
            onClick={() => onSelectPair('A')}
            className={`py-1.5 px-1 text-xs font-semibold rounded transition-all text-center ${
              selectedPair === 'A'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-amber-400 hover:bg-slate-800'
            }`}
          >
            A ↔ a
          </button>
          <button
            onClick={() => onSelectPair('B')}
            className={`py-1.5 px-1 text-xs font-semibold rounded transition-all text-center ${
              selectedPair === 'B'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-cyan-400 hover:bg-slate-800'
            }`}
          >
            B ↔ b
          </button>
          <button
            onClick={() => onSelectPair('C')}
            className={`py-1.5 px-1 text-xs font-semibold rounded transition-all text-center ${
              selectedPair === 'C'
                ? 'bg-purple-500 text-white font-bold shadow-sm'
                : 'text-purple-400 hover:bg-slate-800'
            }`}
          >
            C ↔ c
          </button>
          <button
            onClick={() => onSelectPair('all')}
            className={`py-1.5 px-1 text-xs font-semibold rounded transition-all text-center ${
              selectedPair === 'all'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tất cả
          </button>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          {selectedPair === 'A' && 'Đang làm nổi góc A và cạnh đối diện a = BC.'}
          {selectedPair === 'B' && 'Đang làm nổi góc B và cạnh đối diện b = CA.'}
          {selectedPair === 'C' && 'Đang làm nổi góc C và cạnh đối diện c = AB.'}
          {selectedPair === 'all' && 'Đang hiển thị đồng thời cả 3 tỉ số cùng đường tròn ngoại tiếp.'}
        </div>
      </div>

      {/* Comparison Table with Live Confirmation */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300">
          Bảng kiểm chứng tỉ số thời gian thực:
        </div>

        <div className="space-y-2">
          {/* Ratio A */}
          <div
            className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
              selectedPair === 'A' || selectedPair === 'all'
                ? 'bg-amber-950/20 border-amber-500/50'
                : 'bg-slate-950/50 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <div className="text-[10px] text-amber-400 font-medium">Tỉ số A ↔ a</div>
              <div className="text-xs font-mono-math text-slate-300">
                {a} / sin({angleA}°)
              </div>
            </div>
            <div className="text-sm font-mono-math font-bold text-amber-300">
              = {sinRatioA}
            </div>
          </div>

          {/* Ratio B */}
          <div
            className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
              selectedPair === 'B' || selectedPair === 'all'
                ? 'bg-cyan-950/20 border-cyan-500/50'
                : 'bg-slate-950/50 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <div className="text-[10px] text-cyan-400 font-medium">Tỉ số B ↔ b</div>
              <div className="text-xs font-mono-math text-slate-300">
                {b} / sin({angleB}°)
              </div>
            </div>
            <div className="text-sm font-mono-math font-bold text-cyan-300">
              = {sinRatioB}
            </div>
          </div>

          {/* Ratio C */}
          <div
            className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
              selectedPair === 'C' || selectedPair === 'all'
                ? 'bg-purple-950/20 border-purple-500/50'
                : 'bg-slate-950/50 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <div className="text-[10px] text-purple-400 font-medium">Tỉ số C ↔ c</div>
              <div className="text-xs font-mono-math text-slate-300">
                {c} / sin({angleC}°)
              </div>
            </div>
            <div className="text-sm font-mono-math font-bold text-purple-300">
              = {sinRatioC}
            </div>
          </div>

          {/* 2R Circumdiameter */}
          <div className="p-2.5 rounded-lg border bg-sky-950/30 border-sky-500/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CircleDot className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] text-sky-400 font-medium">Đường kính 2R</div>
                <div className="text-xs font-mono-math text-slate-300">2 · {R}</div>
              </div>
            </div>
            <div className="text-sm font-mono-math font-bold text-sky-300">
              = {diameter}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Card */}
      <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/40 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Xác nhận hình học đồng nhất</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Hãy dùng chuột kéo bất kỳ đỉnh nào của tam giác trên không gian 3D. Dù tam giác biến đổi thành nhọn, tù hay vuông thì <b>cả 3 tỉ số luôn tự động cân bằng chính xác với 2R</b> của đường tròn ngoại tiếp!
        </p>
      </div>
    </div>
  );
};
