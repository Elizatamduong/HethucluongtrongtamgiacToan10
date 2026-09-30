import React from 'react';
import {
  AppMode,
  AreaSubMode,
  CosineVariant,
  TriangleMetrics,
} from '../types/geometry';

interface DataFormulaResultCardProps {
  mode: AppMode;
  areaSubMode: AreaSubMode;
  cosVariant: CosineVariant;
  sinSelectedPair: 'A' | 'B' | 'C' | 'all';
  metrics: TriangleMetrics;
}

export const DataFormulaResultCard: React.FC<DataFormulaResultCardProps> = ({
  mode,
  areaSubMode,
  cosVariant,
  sinSelectedPair,
  metrics,
}) => {
  const { a, b, c, angleA, angleB, angleC, radA, radB, radC, area, ha, p, R, r, sinRatioA, sinRatioB, sinRatioC } = metrics;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md border-l border-slate-800 p-4 overflow-y-auto">
      {/* Title */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dữ kiện · Công thức · Kết quả
          </h2>
          <span className="text-[10px] font-mono-math text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            Realtime
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 py-4">
        {/* Section 1: DỮ KIỆN HIỆN TẠI (GIVEN DATA) */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wide">
            1. Dữ kiện tam giác
          </span>

          <div className="grid grid-cols-3 gap-2">
            {/* a = BC */}
            <div
              className={`p-2 rounded-lg border transition-all ${
                (mode === 'cos-theorem' && (cosVariant === 'C' || cosVariant === 'B')) ||
                (mode === 'sin-theorem' && (sinSelectedPair === 'A' || sinSelectedPair === 'all')) ||
                (mode === 'area-formulas' && areaSubMode === 'base-height')
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-amber-400/90 font-medium">Cạnh a (BC)</div>
              <div className="text-sm font-mono-math font-bold text-amber-300">{a}</div>
            </div>

            {/* b = CA */}
            <div
              className={`p-2 rounded-lg border transition-all ${
                (mode === 'cos-theorem' && (cosVariant === 'C' || cosVariant === 'A')) ||
                (mode === 'sin-theorem' && (sinSelectedPair === 'B' || sinSelectedPair === 'all')) ||
                (mode === 'area-formulas' && areaSubMode === 'two-sides-angle')
                  ? 'bg-cyan-500/10 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-cyan-400/90 font-medium">Cạnh b (CA)</div>
              <div className="text-sm font-mono-math font-bold text-cyan-300">{b}</div>
            </div>

            {/* c = AB */}
            <div
              className={`p-2 rounded-lg border transition-all ${
                (mode === 'cos-theorem' && (cosVariant === 'A' || cosVariant === 'B')) ||
                (mode === 'sin-theorem' && (sinSelectedPair === 'C' || sinSelectedPair === 'all')) ||
                (mode === 'area-formulas' && areaSubMode === 'two-sides-angle')
                  ? 'bg-purple-500/10 border-purple-500/60 shadow-[0_0_12px_rgba(139,92,246,0.15)] ring-1 ring-purple-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-purple-400/90 font-medium">Cạnh c (AB)</div>
              <div className="text-sm font-mono-math font-bold text-purple-300">{c}</div>
            </div>

            {/* Angle A */}
            <div
              className={`p-2 rounded-lg border transition-all ${
                (mode === 'cos-theorem' && cosVariant === 'A') ||
                (mode === 'sin-theorem' && (sinSelectedPair === 'A' || sinSelectedPair === 'all')) ||
                (mode === 'area-formulas' && areaSubMode === 'two-sides-angle')
                  ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-amber-400/90 font-medium">Góc A</div>
              <div className="text-sm font-mono-math font-bold text-amber-300">{angleA}°</div>
            </div>

            {/* Angle B */}
            <div
              className={`p-2 rounded-lg border transition-all ${
                (mode === 'cos-theorem' && cosVariant === 'B') ||
                (mode === 'sin-theorem' && (sinSelectedPair === 'B' || sinSelectedPair === 'all'))
                  ? 'bg-cyan-500/10 border-cyan-500/60 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-cyan-400/90 font-medium">Góc B</div>
              <div className="text-sm font-mono-math font-bold text-cyan-300">{angleB}°</div>
            </div>

            {/* Angle C */}
            <div
              className={`p-2 rounded-lg border transition-all ${
                (mode === 'cos-theorem' && cosVariant === 'C') ||
                (mode === 'sin-theorem' && (sinSelectedPair === 'C' || sinSelectedPair === 'all'))
                  ? 'bg-purple-500/10 border-purple-500/60 ring-1 ring-purple-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-purple-400/90 font-medium">Góc C</div>
              <div className="text-sm font-mono-math font-bold text-purple-300">{angleC}°</div>
            </div>
          </div>
        </div>

        {/* Section 2: CÔNG THỨC ÁP DỤNG (ACTIVE FORMULA) */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wide">
            2. Công thức áp dụng
          </span>

          <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 font-mono-math text-xs">
            {mode === 'cos-theorem' && (
              <div className="space-y-1">
                {cosVariant === 'C' && (
                  <>
                    <div className="text-purple-300 font-bold text-sm">
                      c² = a² + b² − 2ab · cos C
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Biết hai cạnh a, b và góc xen giữa C, tính cạnh c
                    </div>
                  </>
                )}
                {cosVariant === 'A' && (
                  <>
                    <div className="text-amber-300 font-bold text-sm">
                      a² = b² + c² − 2bc · cos A
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Biết hai cạnh b, c và góc xen giữa A, tính cạnh a
                    </div>
                  </>
                )}
                {cosVariant === 'B' && (
                  <>
                    <div className="text-cyan-300 font-bold text-sm">
                      b² = a² + c² − 2ac · cos B
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Biết hai cạnh a, c và góc xen giữa B, tính cạnh b
                    </div>
                  </>
                )}
              </div>
            )}

            {mode === 'sin-theorem' && (
              <div className="space-y-1.5">
                <div className="text-cyan-300 font-bold text-sm tracking-wide">
                  <span className="text-amber-400">a/sin A</span> = <span className="text-cyan-400">b/sin B</span> = <span className="text-purple-400">c/sin C</span> = 2R
                </div>
                <div className="text-slate-400 text-[11px]">
                  Tỉ số giữa mỗi cạnh và sin của góc đối diện luôn bằng đường kính đường tròn ngoại tiếp (2R).
                </div>
              </div>
            )}

            {mode === 'area-formulas' && (
              <div className="space-y-1">
                {areaSubMode === 'base-height' && (
                  <>
                    <div className="text-pink-300 font-bold text-sm">S = ½ · a · hₐ</div>
                    <div className="text-slate-400 text-[11px]">Nửa tích đáy và chiều cao tương ứng</div>
                  </>
                )}
                {areaSubMode === 'two-sides-angle' && (
                  <>
                    <div className="text-emerald-300 font-bold text-sm">S = ½ · b · c · sin A</div>
                    <div className="text-slate-400 text-[11px]">Nửa tích hai cạnh nhân sin góc xen giữa</div>
                  </>
                )}
                {areaSubMode === 'heron' && (
                  <>
                    <div className="text-amber-300 font-bold text-sm">S = √[p(p − a)(p − b)(p − c)]</div>
                    <div className="text-slate-400 text-[11px]">Với nửa chu vi p = (a + b + c) / 2</div>
                  </>
                )}
                {areaSubMode === 'in-radius' && (
                  <>
                    <div className="text-emerald-300 font-bold text-sm">S = p · r</div>
                    <div className="text-slate-400 text-[11px]">Tích nửa chu vi và bán kính đường tròn nội tiếp</div>
                  </>
                )}
                {areaSubMode === 'circum-radius' && (
                  <>
                    <div className="text-sky-300 font-bold text-sm">S = (a · b · c) / (4R)</div>
                    <div className="text-slate-400 text-[11px]">Tích ba cạnh chia cho 4 lần bán kính ngoại tiếp</div>
                  </>
                )}
              </div>
            )}

            {(mode === 'practical-problems' || mode === 'free-explore') && (
              <div className="text-slate-300 text-[11px]">
                Tổng hợp các hệ thức lượng giải tam giác và ứng dụng.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: THAY SỐ VÀ TÍNH TOÁN CHI TIẾT (STEP-BY-STEP CALCULATION) */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wide">
            3. Thay số & Tính toán chi tiết
          </span>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono-math text-xs space-y-2">
            {mode === 'cos-theorem' && (
              <>
                {cosVariant === 'C' && (
                  <>
                    <div className="text-slate-300">
                      c² = {a}² + {b}² − 2·({a})·({b})·cos({angleC}°)
                    </div>
                    <div className="text-slate-400">
                      = {(a * a).toFixed(2)} + {(b * b).toFixed(2)} − {(2 * a * b).toFixed(2)} · {Math.cos(radC).toFixed(4)}
                    </div>
                    <div className="text-slate-300">
                      = {(a * a + b * b - 2 * a * b * Math.cos(radC)).toFixed(2)}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">⇒ Cạnh c:</span>
                      <span className="text-sm font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                        c = {c}
                      </span>
                    </div>
                  </>
                )}
                {cosVariant === 'A' && (
                  <>
                    <div className="text-slate-300">
                      a² = {b}² + {c}² − 2·({b})·({c})·cos({angleA}°)
                    </div>
                    <div className="text-slate-400">
                      = {(b * b).toFixed(2)} + {(c * c).toFixed(2)} − {(2 * b * c).toFixed(2)} · {Math.cos(radA).toFixed(4)}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">⇒ Cạnh a:</span>
                      <span className="text-sm font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                        a = {a}
                      </span>
                    </div>
                  </>
                )}
                {cosVariant === 'B' && (
                  <>
                    <div className="text-slate-300">
                      b² = {a}² + {c}² − 2·({a})·({c})·cos({angleB}°)
                    </div>
                    <div className="text-slate-400">
                      = {(a * a).toFixed(2)} + {(c * c).toFixed(2)} − {(2 * a * c).toFixed(2)} · {Math.cos(radB).toFixed(4)}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">⇒ Cạnh b:</span>
                      <span className="text-sm font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                        b = {b}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}

            {mode === 'sin-theorem' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 px-2 rounded bg-amber-950/20 border border-amber-900/30">
                  <span className="text-amber-300">a / sin A = {a} / sin({angleA}°)</span>
                  <span className="font-bold text-amber-400">{sinRatioA}</span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded bg-cyan-950/20 border border-cyan-900/30">
                  <span className="text-cyan-300">b / sin B = {b} / sin({angleB}°)</span>
                  <span className="font-bold text-cyan-400">{sinRatioB}</span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded bg-purple-950/20 border border-purple-900/30">
                  <span className="text-purple-300">c / sin C = {c} / sin({angleC}°)</span>
                  <span className="font-bold text-purple-400">{sinRatioC}</span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded bg-sky-950/40 border border-sky-800/50 font-bold">
                  <span className="text-sky-300">Đường kính 2R = 2 · {R}</span>
                  <span className="text-sky-400">{(2 * R).toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 text-center font-sans font-medium">
                  ✓ Cả 4 giá trị đồng nhất bằng nhau: 2R ≈ {(2 * R).toFixed(2)}
                </div>
              </div>
            )}

            {mode === 'area-formulas' && (
              <>
                {areaSubMode === 'base-height' && (
                  <>
                    <div className="text-slate-300">
                      S = ½ · {a} · {ha}
                    </div>
                    <div className="text-slate-400">
                      = 0.5 · {a} · {ha}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">⇒ Diện tích S:</span>
                      <span className="text-sm font-bold text-pink-400">{area} đvdt</span>
                    </div>
                  </>
                )}
                {areaSubMode === 'two-sides-angle' && (
                  <>
                    <div className="text-slate-300">
                      S = ½ · {b} · {c} · sin({angleA}°)
                    </div>
                    <div className="text-slate-400">
                      = 0.5 · {b} · {c} · {Math.sin(radA).toFixed(4)}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">⇒ Diện tích S:</span>
                      <span className="text-sm font-bold text-emerald-400">{area} đvdt</span>
                    </div>
                  </>
                )}
                {areaSubMode === 'heron' && (
                  <>
                    <div className="text-slate-300">
                      p = ({a} + {b} + {c}) / 2 = {p}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      p − a = {(p - a).toFixed(2)}, p − b = {(p - b).toFixed(2)}, p − c = {(p - c).toFixed(2)}
                    </div>
                    <div className="text-slate-300">
                      S = √[{p} · {(p - a).toFixed(2)} · {(p - b).toFixed(2)} · {(p - c).toFixed(2)}]
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">⇒ Diện tích Heron S:</span>
                      <span className="text-sm font-bold text-amber-400">{area} đvdt</span>
                    </div>
                  </>
                )}
                {areaSubMode === 'in-radius' && (
                  <>
                    <div className="text-slate-300">
                      Nửa chu vi p = {p}
                    </div>
                    <div className="text-slate-300">
                      Bán kính r = S / p = {area} / {p} = {r}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">⇒ S = p · r = {p} · {r}:</span>
                      <span className="text-sm font-bold text-emerald-400">{area} đvdt</span>
                    </div>
                  </>
                )}
                {areaSubMode === 'circum-radius' && (
                  <>
                    <div className="text-slate-300">
                      abc = {a} · {b} · {c} = {(a * b * c).toFixed(2)}
                    </div>
                    <div className="text-slate-300">
                      4R = 4 · {R} = {(4 * R).toFixed(2)}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">⇒ S = abc / 4R:</span>
                      <span className="text-sm font-bold text-sky-400">{area} đvdt</span>
                    </div>
                  </>
                )}
              </>
            )}

            {mode === 'practical-problems' && (
              <div className="space-y-1.5 text-slate-300">
                <div className="text-[11px] text-slate-400">
                  Xem bảng tương tác tại khu vực điều khiển bên trái để tham gia giải bài toán thực tế theo từng bước.
                </div>
              </div>
            )}

            {mode === 'free-explore' && (
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span>Chu vi 2p:</span> <span className="font-bold text-white">{(2 * p).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Nửa chu vi p:</span> <span className="font-bold text-white">{p}</span></div>
                <div className="flex justify-between"><span>Diện tích S:</span> <span className="font-bold text-emerald-400">{area}</span></div>
                <div className="flex justify-between"><span>Bán kính ngoại tiếp R:</span> <span className="font-bold text-sky-400">{R}</span></div>
                <div className="flex justify-between"><span>Bán kính nội tiếp r:</span> <span className="font-bold text-emerald-300">{r}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
