import React, { useState } from 'react';
import { AreaSubMode, TriangleMetrics } from '../types/geometry';

interface AreaFormulasPanelProps {
  currentSubMode: AreaSubMode;
  onSelectSubMode: (subMode: AreaSubMode) => void;
  metrics: TriangleMetrics;
  onAngleSliderChange: (deg: number) => void;
}

export const AreaFormulasPanel: React.FC<AreaFormulasPanelProps> = ({
  currentSubMode,
  onSelectSubMode,
  metrics,
  onAngleSliderChange,
}) => {
  const { a, b, c, angleA, ha, p, area, r, R, radA } = metrics;
  const [heronStep, setHeronStep] = useState<number>(3); // 1: semiperimeter p, 2: factors, 3: full calculation

  const subModes: { id: AreaSubMode; code: string; label: string; formula: string }[] = [
    { id: 'base-height', code: 'A', label: 'Đáy - đường cao', formula: 'S = ½ · a · hₐ' },
    { id: 'two-sides-angle', code: 'B', label: 'Hai cạnh & góc xen giữa', formula: 'S = ½ · b · c · sin A' },
    { id: 'heron', code: 'C', label: 'Công thức Heron', formula: 'S = √[p(p−a)(p−b)(p−c)]' },
    { id: 'in-radius', code: 'D', label: 'Bán kính nội tiếp (r)', formula: 'S = p · r' },
    { id: 'circum-radius', code: 'E', label: 'Bán kính ngoại tiếp (R)', formula: 'S = abc / (4R)' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-4 overflow-y-auto space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3. Các công thức diện tích
          </h2>
          <span className="text-[10px] text-emerald-400 font-mono-math bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            S = {area} đvdt
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Chọn công thức phù hợp với dữ kiện đã cho của tam giác.
        </p>
      </div>

      {/* Submenu A -> E */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-300">
          Chọn nhóm công thức diện tích:
        </span>
        <div className="flex flex-col gap-1">
          {subModes.map((item) => {
            const isSelected = currentSubMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSubMode(item.id)}
                className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800/90 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.code}
                  </span>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <span className="text-[11px] font-mono-math text-emerald-400/90">
                  {item.formula}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submode Detail Content */}
      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-3 text-xs">
        {currentSubMode === 'base-height' && (
          <div className="space-y-2">
            <div className="font-semibold text-pink-300 flex items-center justify-between">
              <span>A. Đáy và đường cao tương ứng</span>
              <span className="font-mono-math">hₐ = {ha}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Từ đỉnh <b>A</b> hạ đường cao <b>hₐ</b> vuông góc xuống đáy <b>a = BC</b> tại chân đường cao <b>H</b>. Khi bạn kéo đỉnh A lên/xuống trên không gian 3D, độ dài đường cao và diện tích tam giác thay đổi tức thời.
            </p>
            <div className="p-2.5 bg-slate-900 rounded font-mono-math space-y-1">
              <div className="text-slate-300">Đáy a = {a}</div>
              <div className="text-slate-300">Đường cao hₐ = {ha}</div>
              <div className="text-emerald-400 font-bold border-t border-slate-800 pt-1">
                S = ½ · {a} · {ha} = {area}
              </div>
            </div>
          </div>
        )}

        {currentSubMode === 'two-sides-angle' && (
          <div className="space-y-3">
            <div className="font-semibold text-emerald-300">
              B. Hai cạnh và sin góc xen giữa
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Biết độ dài hai cạnh <b>b</b>, <b>c</b> và góc xen giữa <b>A</b>. Vùng tô màu xanh ngọc bên trong tam giác 3D biểu diễn trực quan diện tích.
            </p>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Thay đổi góc A:</span>
                <span className="font-bold text-white font-mono-math">{angleA}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="165"
                step="1"
                value={Math.round(angleA)}
                onChange={(e) => onAngleSliderChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-2.5 bg-slate-900 rounded font-mono-math space-y-1">
              <div className="text-slate-300">b = {b} · c = {c} · sin({angleA}°) = {Math.sin(radA).toFixed(4)}</div>
              <div className="text-emerald-400 font-bold border-t border-slate-800 pt-1">
                S = ½ · {b} · {c} · sin({angleA}°) = {area}
              </div>
            </div>
          </div>
        )}

        {currentSubMode === 'heron' && (
          <div className="space-y-3">
            <div className="font-semibold text-amber-300 flex items-center justify-between">
              <span>C. Công thức Heron qua ba cạnh</span>
              <span className="text-slate-400 text-[11px]">3 bước thay số</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Dùng khi bài toán cho biết độ dài cả ba cạnh <b>a, b, c</b> mà không biết bất kỳ góc nào hay đường cao.
            </p>

            {/* Step selector */}
            <div className="flex gap-1">
              <button
                onClick={() => setHeronStep(1)}
                className={`flex-1 py-1 text-[11px] rounded transition-colors ${
                  heronStep === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                1. Tính p
              </button>
              <button
                onClick={() => setHeronStep(2)}
                className={`flex-1 py-1 text-[11px] rounded transition-colors ${
                  heronStep === 2 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                2. Tính hiệu
              </button>
              <button
                onClick={() => setHeronStep(3)}
                className={`flex-1 py-1 text-[11px] rounded transition-colors ${
                  heronStep === 3 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                3. Khai căn S
              </button>
            </div>

            <div className="p-2.5 bg-slate-900 rounded font-mono-math space-y-1.5">
              <div>
                <span className="text-slate-400">Nửa chu vi p:</span>{' '}
                <span className="text-white font-bold">({a} + {b} + {c}) / 2 = {p}</span>
              </div>
              {heronStep >= 2 && (
                <div className="text-slate-300 border-t border-slate-800 pt-1 space-y-0.5">
                  <div>p − a = {p} − {a} = {(p - a).toFixed(2)}</div>
                  <div>p − b = {p} − {b} = {(p - b).toFixed(2)}</div>
                  <div>p − c = {p} − {c} = {(p - c).toFixed(2)}</div>
                </div>
              )}
              {heronStep >= 3 && (
                <div className="text-amber-400 font-bold border-t border-slate-800 pt-1">
                  S = √[{p} · {(p - a).toFixed(2)} · {(p - b).toFixed(2)} · {(p - c).toFixed(2)}] = {area}
                </div>
              )}
            </div>
          </div>
        )}

        {currentSubMode === 'in-radius' && (
          <div className="space-y-2">
            <div className="font-semibold text-emerald-300 flex items-center justify-between">
              <span>D. Bán kính đường tròn nội tiếp</span>
              <span className="font-mono-math">r = {r}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Đường tròn nội tiếp màu xanh lá tiếp xúc với 3 cạnh tam giác tại tâm <b>I</b> và bán kính <b>r</b>.
            </p>
            <div className="p-2.5 bg-slate-900 rounded font-mono-math space-y-1">
              <div className="text-slate-300">Nửa chu vi p = {p}</div>
              <div className="text-slate-300">Bán kính nội tiếp r = {r}</div>
              <div className="text-emerald-400 font-bold border-t border-slate-800 pt-1">
                S = p · r = {p} · {r} = {area}
              </div>
            </div>
          </div>
        )}

        {currentSubMode === 'circum-radius' && (
          <div className="space-y-2">
            <div className="font-semibold text-sky-300 flex items-center justify-between">
              <span>E. Bán kính đường tròn ngoại tiếp</span>
              <span className="font-mono-math">R = {R}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Đường tròn ngoại tiếp đi qua 3 đỉnh A, B, C có tâm <b>O</b> và bán kính <b>R</b>.
            </p>
            <div className="p-2.5 bg-slate-900 rounded font-mono-math space-y-1">
              <div className="text-slate-300">Tích ba cạnh abc = {(a * b * c).toFixed(2)}</div>
              <div className="text-slate-300">Mẫu số 4R = 4 · {R} = {(4 * R).toFixed(2)}</div>
              <div className="text-sky-400 font-bold border-t border-slate-800 pt-1">
                S = abc / (4R) = {area}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
