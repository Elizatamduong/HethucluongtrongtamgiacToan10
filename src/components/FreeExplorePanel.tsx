import React from 'react';
import { TriangleMetrics, TriangleState } from '../types/geometry';
import { TRIANGLE_PRESETS } from '../utils/mathGeometry';
import { Sliders, AlertTriangle } from 'lucide-react';

interface FreeExplorePanelProps {
  metrics: TriangleMetrics;
  triangleState: TriangleState;
  onApplyPreset: (state: TriangleState) => void;
  // Toggles
  showCosines: boolean;
  setShowCosines: (val: boolean) => void;
  showSines: boolean;
  setShowSines: (val: boolean) => void;
  showAltitude: boolean;
  setShowAltitude: (val: boolean) => void;
  showCircumcircle: boolean;
  setShowCircumcircle: (val: boolean) => void;
  showIncircle: boolean;
  setShowIncircle: (val: boolean) => void;
  showAreaFill: boolean;
  setShowAreaFill: (val: boolean) => void;
}

export const FreeExplorePanel: React.FC<FreeExplorePanelProps> = ({
  metrics,
  triangleState,
  onApplyPreset,
  showCosines,
  setShowCosines,
  showSines,
  setShowSines,
  showAltitude,
  setShowAltitude,
  showCircumcircle,
  setShowCircumcircle,
  showIncircle,
  setShowIncircle,
  showAreaFill,
  setShowAreaFill,
}) => {
  const { a, b, c, angleA, angleB, angleC, perimeter, area, R, r, isValid, validationMessage } = metrics;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-4 overflow-y-auto space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Khám phá tự do
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            Sandbox 3D
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Kéo thả tự do 3 đỉnh A, B, C để quan sát tức thời toàn bộ các hệ thức lượng.
        </p>
      </div>

      {/* Validation Alert */}
      {!isValid && (
        <div className="p-2.5 bg-rose-950/40 rounded-lg border border-rose-800 flex items-start gap-2 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Cảnh báo hình học:</div>
            <div>{validationMessage || 'Ba độ dài này chưa tạo thành một tam giác. Hãy điều chỉnh dữ kiện.'}</div>
          </div>
        </div>
      )}

      {/* Presets */}
      <div>
        <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
          Tam giác mẫu nhanh:
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(TRIANGLE_PRESETS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => onApplyPreset(val.state)}
              className="py-1 px-2 text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded transition-colors text-left truncate"
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Metric Dashboard */}
      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs font-mono-math">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 block">
          Bảng thông số thời gian thực
        </span>

        {/* Sides */}
        <div className="grid grid-cols-3 gap-1">
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-amber-400 block font-sans">Cạnh a</span>
            <span className="text-xs font-bold text-white">{a}</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-cyan-400 block font-sans">Cạnh b</span>
            <span className="text-xs font-bold text-white">{b}</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-purple-400 block font-sans">Cạnh c</span>
            <span className="text-xs font-bold text-white">{c}</span>
          </div>
        </div>

        {/* Angles */}
        <div className="grid grid-cols-3 gap-1">
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-amber-400 block font-sans">Góc A</span>
            <span className="text-xs font-bold text-white">{angleA}°</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-cyan-400 block font-sans">Góc B</span>
            <span className="text-xs font-bold text-white">{angleB}°</span>
          </div>
          <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-purple-400 block font-sans">Góc C</span>
            <span className="text-xs font-bold text-white">{angleC}°</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-1 pt-1 border-t border-slate-800/80 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Chu vi (2p):</span>
            <span className="text-white font-bold">{perimeter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Diện tích (S):</span>
            <span className="text-emerald-400 font-bold">{area}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Bán kính ngoại tiếp (R):</span>
            <span className="text-sky-400 font-bold">{R}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Bán kính nội tiếp (r):</span>
            <span className="text-emerald-300 font-bold">{r}</span>
          </div>
        </div>
      </div>

      {/* Six Visual Toggles specified in prompt */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-300 block">
          Tùy chọn hiển thị hệ thức trên 3D:
        </span>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 p-2 bg-slate-950/70 hover:bg-slate-950 rounded border border-slate-800 cursor-pointer text-xs transition-colors">
            <input
              type="checkbox"
              checked={showCosines}
              onChange={(e) => setShowCosines(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300">Hiện định lý cosin</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950/70 hover:bg-slate-950 rounded border border-slate-800 cursor-pointer text-xs transition-colors">
            <input
              type="checkbox"
              checked={showSines}
              onChange={(e) => setShowSines(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300">Hiện định lý sin</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950/70 hover:bg-slate-950 rounded border border-slate-800 cursor-pointer text-xs transition-colors">
            <input
              type="checkbox"
              checked={showAltitude}
              onChange={(e) => setShowAltitude(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300">Hiện đường cao (hₐ)</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950/70 hover:bg-slate-950 rounded border border-slate-800 cursor-pointer text-xs transition-colors">
            <input
              type="checkbox"
              checked={showCircumcircle}
              onChange={(e) => setShowCircumcircle(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300">Hiện đường tròn ngoại tiếp (tâm O, R)</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950/70 hover:bg-slate-950 rounded border border-slate-800 cursor-pointer text-xs transition-colors">
            <input
              type="checkbox"
              checked={showIncircle}
              onChange={(e) => setShowIncircle(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300">Hiện đường tròn nội tiếp (tâm I, r)</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-950/70 hover:bg-slate-950 rounded border border-slate-800 cursor-pointer text-xs transition-colors">
            <input
              type="checkbox"
              checked={showAreaFill}
              onChange={(e) => setShowAreaFill(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300">Hiện diện tích tam giác (vùng tô)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
