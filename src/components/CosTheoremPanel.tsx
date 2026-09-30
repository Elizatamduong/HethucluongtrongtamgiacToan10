import React, { useState } from 'react';
import {
  CosineVariant,
  PredictionAnswer,
  TriangleMetrics,
} from '../types/geometry';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

interface CosTheoremPanelProps {
  variant: CosineVariant;
  onSelectVariant: (v: CosineVariant) => void;
  metrics: TriangleMetrics;
  onAngleSliderChange: (deg: number) => void;
  onSideSliderChange?: (side: 'a' | 'b', val: number) => void;
}

export const CosTheoremPanel: React.FC<CosTheoremPanelProps> = ({
  variant,
  onSelectVariant,
  metrics,
  onAngleSliderChange,
}) => {
  const [activeStep, setActiveStep] = useState<number>(2);
  const [userPrediction, setUserPrediction] = useState<PredictionAnswer>(null);
  const [predictionSubmitted, setPredictionSubmitted] = useState<boolean>(false);
  const [baselineAngle, setBaselineAngle] = useState<number>(metrics.angleC);
  const [baselineOppositeSide, setBaselineOppositeSide] = useState<number>(metrics.c);

  // Quick angle presets
  const anglePresets = [30, 60, 90, 120, 150];

  // Dynamic variable names depending on variant
  const getVariantDetails = () => {
    switch (variant) {
      case 'A':
        return {
          includedAngleName: 'A',
          includedAngleVal: metrics.angleA,
          side1Name: 'b (CA)',
          side1Val: metrics.b,
          side2Name: 'c (AB)',
          side2Val: metrics.c,
          oppositeName: 'a (BC)',
          oppositeVal: metrics.a,
          formulaStr: 'a² = b² + c² − 2bc · cos A',
          cosVal: Math.cos(metrics.radA),
        };
      case 'B':
        return {
          includedAngleName: 'B',
          includedAngleVal: metrics.angleB,
          side1Name: 'a (BC)',
          side1Val: metrics.a,
          side2Name: 'c (AB)',
          side2Val: metrics.c,
          oppositeName: 'b (CA)',
          oppositeVal: metrics.b,
          formulaStr: 'b² = a² + c² − 2ac · cos B',
          cosVal: Math.cos(metrics.radB),
        };
      case 'C':
      default:
        return {
          includedAngleName: 'C',
          includedAngleVal: metrics.angleC,
          side1Name: 'a (BC)',
          side1Val: metrics.a,
          side2Name: 'b (CA)',
          side2Val: metrics.b,
          oppositeName: 'c (AB)',
          oppositeVal: metrics.c,
          formulaStr: 'c² = a² + b² − 2ab · cos C',
          cosVal: Math.cos(metrics.radC),
        };
    }
  };

  const details = getVariantDetails();

  const handleStartPredict = () => {
    setBaselineAngle(details.includedAngleVal);
    setBaselineOppositeSide(details.oppositeVal);
    setUserPrediction(null);
    setPredictionSubmitted(false);
  };

  const checkPrediction = () => {
    setPredictionSubmitted(true);
  };

  // Determine correctness
  const angleDelta = details.includedAngleVal - baselineAngle;
  const isAngleIncreased = angleDelta > 0.5;
  const isAngleDecreased = angleDelta < -0.5;
  let actualTrend: 'increase' | 'decrease' | 'constant' = 'constant';
  if (isAngleIncreased) actualTrend = 'increase';
  else if (isAngleDecreased) actualTrend = 'decrease';

  const isPredictionCorrect = userPrediction === actualTrend;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-4 overflow-y-auto space-y-4">
      {/* Title & Variant Switcher */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Định lý Cosin
          </h2>
          <span className="text-[11px] text-slate-500">Biến thể góc:</span>
        </div>

        {/* Variant Buttons (A, B, C) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
          {(['C', 'A', 'B'] as CosineVariant[]).map((v) => {
            const isSelected = variant === v;
            return (
              <button
                key={v}
                onClick={() => {
                  onSelectVariant(v);
                  setUserPrediction(null);
                  setPredictionSubmitted(false);
                }}
                className={`py-1.5 px-2 text-xs font-semibold rounded transition-all flex items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>Góc {v}</span>
                <span className="text-[10px] opacity-75">
                  ({v === 'C' ? 'c²' : v === 'A' ? 'a²' : 'b²'})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Formula Highlight Card */}
      <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-800/40 text-center">
        <div className="text-[11px] text-purple-300 font-medium mb-1">
          Hệ thức cosin cho góc {details.includedAngleName}
        </div>
        <div className="text-sm font-mono-math font-bold text-white tracking-wide">
          {details.formulaStr}
        </div>
      </div>

      {/* Step by Step Visual Guide (Bước 1 -> Bước 4) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Quy trình trực quan hóa:</span>
          <span className="text-cyan-400 text-[11px]">Bước {activeStep}/4</span>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((stepNum) => (
            <button
              key={stepNum}
              onClick={() => setActiveStep(stepNum)}
              className={`py-1 text-[11px] font-medium rounded transition-all text-center ${
                activeStep === stepNum
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              B.{stepNum}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 text-xs">
          {activeStep === 1 && (
            <div className="space-y-2">
              <div className="font-semibold text-amber-300">
                Bước 1: Làm nổi hai cạnh kề và góc xen giữa
              </div>
              <p className="text-slate-400 leading-relaxed">
                Quan sát tam giác trên mô hình 3D: Cạnh <b>{details.side1Name}</b> = {details.side1Val} và cạnh <b>{details.side2Name}</b> = {details.side2Val} ôm lấy góc xen giữa <b>{details.includedAngleName}</b> = {details.includedAngleVal}°.
              </p>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-3">
              <div className="font-semibold text-cyan-300">
                Bước 2: Kéo thanh trượt thay đổi góc {details.includedAngleName}
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Góc {details.includedAngleName}:</span>
                  <span className="font-bold text-white font-mono-math">
                    {details.includedAngleVal}°
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="165"
                  step="1"
                  value={Math.round(details.includedAngleVal)}
                  onChange={(e) => onAngleSliderChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Angle preset buttons: 30°, 60°, 90°, 120°, 150° */}
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Các góc đặc biệt:</span>
                <div className="flex gap-1 justify-between">
                  {anglePresets.map((deg) => (
                    <button
                      key={deg}
                      onClick={() => onAngleSliderChange(deg)}
                      className={`px-2 py-1 text-[11px] font-mono-math rounded border transition-colors ${
                        Math.round(details.includedAngleVal) === deg
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-2">
              <div className="font-semibold text-purple-300">
                Bước 3: Cập nhật cạnh đối diện theo thời gian thực
              </div>
              <p className="text-slate-400 leading-relaxed">
                Khi góc <b>{details.includedAngleName}</b> thay đổi, cạnh đối diện <b>{details.oppositeName}</b> co giãn liên tục:
              </p>
              <div className="p-2 bg-slate-900 rounded font-mono-math text-center text-sm font-bold text-purple-400">
                {details.oppositeName} = {details.oppositeVal}
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-2">
              <div className="font-semibold text-emerald-300">
                Bước 4: Nhận xét hình học bản chất
              </div>
              <ul className="text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>
                  Khi góc {details.includedAngleName} tăng (từ nhọn sang tù), cos {details.includedAngleName} giảm từ dương sang âm, làm cho số trừ <b>−2ab cos {details.includedAngleName}</b> thành số dương cộng thêm, do đó cạnh đối diện {details.oppositeName} <b>càng dài ra</b>.
                </li>
                <li>
                  Khi góc {details.includedAngleName} = 90°, cos 90° = 0 ⇒ Định lý cosin trở về chính là <b>Định lý Pythagoras</b>!
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* "DỰ ĐOÁN TRƯỚC KHI TÍNH" (Interactive Prediction Module) */}
      <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Dự đoán trước khi tính</span>
          </div>
          <button
            onClick={handleStartPredict}
            className="text-[10px] text-slate-400 hover:text-white underline"
          >
            Làm lại
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Hiện tại góc <b>{details.includedAngleName} = {details.includedAngleVal}°</b>, cạnh <b>{details.oppositeName} = {details.oppositeVal}</b>.
          Nếu ta <b>TĂNG góc {details.includedAngleName}</b>, theo bạn cạnh đối diện <b>{details.oppositeName}</b> sẽ:
        </p>

        {/* Prediction Choices */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setUserPrediction('increase')}
            className={`py-1.5 text-xs font-semibold rounded border transition-all ${
              userPrediction === 'increase'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Tăng
          </button>
          <button
            onClick={() => setUserPrediction('decrease')}
            className={`py-1.5 text-xs font-semibold rounded border transition-all ${
              userPrediction === 'decrease'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Giảm
          </button>
          <button
            onClick={() => setUserPrediction('constant')}
            className={`py-1.5 text-xs font-semibold rounded border transition-all ${
              userPrediction === 'constant'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Không đổi
          </button>
        </div>

        {userPrediction && !predictionSubmitted && (
          <button
            onClick={checkPrediction}
            className="w-full py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
          >
            Kiểm tra dự đoán
          </button>
        )}

        {/* Prediction Result Display */}
        {predictionSubmitted && (
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
              userPrediction === 'increase'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            {userPrediction === 'increase' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">
                {userPrediction === 'increase'
                  ? 'Chính xác! Cạnh đối diện sẽ TĂNG.'
                  : 'Chưa chính xác! Cạnh đối diện sẽ TĂNG.'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Kéo thanh trượt ở Bước 2 để tận mắt quan sát cạnh {details.oppositeName} nở rộng ra trên mô hình 3D!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
