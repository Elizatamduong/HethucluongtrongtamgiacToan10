import React, { useState } from 'react';
import { PracticalScenarioId } from '../types/geometry';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  MapPin,
  Compass,
} from 'lucide-react';

interface PracticalProblemsPanelProps {
  currentScenario: PracticalScenarioId;
  onSelectScenario: (id: PracticalScenarioId) => void;
  viewMode: 'realistic' | 'geometric';
  onToggleViewMode: (mode: 'realistic' | 'geometric') => void;
  onApplyScenarioPreset: (id: PracticalScenarioId) => void;
}

export const PracticalProblemsPanel: React.FC<PracticalProblemsPanelProps> = ({
  currentScenario,
  onSelectScenario,
  viewMode,
  onToggleViewMode,
  onApplyScenarioPreset,
}) => {
  // Step in learning workflow: 1. Observe -> 2. Select formula -> 3. Calculate -> 4. Result verified
  const [learningStep, setLearningStep] = useState<number>(1);
  const [selectedFormulaChoice, setSelectedFormulaChoice] = useState<string | null>(null);
  const [formulaCheckResult, setFormulaCheckResult] = useState<boolean | null>(null);
  const [studentInput, setStudentInput] = useState<string>('');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0); // 0: none, 1, 2, 3
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);

  // Scenario 3 sub-case (Case 1: two sides & angle vs Case 2: three sides)
  const [landCase, setLandCase] = useState<'two-sides-angle' | 'three-sides'>('two-sides-angle');

  // Scenario descriptions
  const scenariosData = {
    'distance-ab': {
      title: 'Tình huống 1: Tính khoảng cách giữa hai địa điểm',
      subtitle: 'Đứng tại điểm quan sát O, đo khoảng cách đến A và B qua góc xen giữa',
      problemStatement:
        'Từ đài quan sát O, một trinh sát viên ngắm hai vị trí A và B. Thiết bị đo cho biết: khoảng cách OA = 500 m, OB = 800 m và góc ngắm ∠AOB = 60°. Hãy xác định khoảng cách thẳng giữa hai địa điểm A và B.',
      given: [
        'OA = 500 m',
        'OB = 800 m',
        'Góc xen giữa ∠AOB = 60°',
      ],
      target: 'Tìm khoảng cách AB = ?',
      correctFormula: 'cosin',
      correctValue: 700,
      unit: 'm',
      formulaChoices: [
        { id: 'cosin', label: 'Định lý Cosin (c² = a² + b² − 2ab cos C)' },
        { id: 'sin', label: 'Định lý Sin (a / sin A = 2R)' },
        { id: 'area', label: 'Công thức diện tích tam giác' },
      ],
      hint1: 'Bài toán cho biết hai cạnh kề (OA, OB) và góc kẹp giữa hai cạnh đó (∠AOB = 60°).',
      hint2: 'Khi biết 2 cạnh và góc xen giữa, ta luôn có thể tính trực tiếp cạnh thứ 3 đối diện góc đó.',
      hint3: 'Áp dụng định lý Cosin trong tam giác OAB: AB² = OA² + OB² − 2·OA·OB·cos(∠AOB).',
      solution: [
        '1. Áp dụng định lý cosin trong tam giác OAB:',
        '   AB² = OA² + OB² − 2 · OA · OB · cos(∠AOB)',
        '2. Thay số đo thực tế vào hệ thức:',
        '   AB² = 500² + 800² − 2 · 500 · 800 · cos(60°)',
        '   AB² = 250.000 + 640.000 − 800.000 · 0.5',
        '   AB² = 890.000 − 400.000 = 490.000',
        '3. Khai căn:',
        '   AB = √490.000 = 700 m.',
        'Kết luận: Khoảng cách giữa hai địa điểm A và B là 700 mét.',
      ],
    },
    'river-width': {
      title: 'Tình huống 2: Đo khoảng cách tới một điểm bên kia sông',
      subtitle: 'Xác định khoảng cách tới vật thể C mà không cần bơi qua sông',
      problemStatement:
        'Để đo khoảng cách từ bờ sông đến cột mốc C ở bờ đối diện, người ta chọn hai mốc A và B trên cùng bờ với khoảng cách AB = 100 m. Sử dụng giác kế đo được góc ∠CAB = 75° và ∠CBA = 45°. Tính khoảng cách AC từ điểm đặt máy A đến cột mốc C.',
      given: [
        'Đoạn cơ sở trên bờ AB = 100 m',
        'Góc quan sát ∠CAB = 75°',
        'Góc quan sát ∠CBA = 45°',
      ],
      target: 'Tìm khoảng cách AC = ?',
      correctFormula: 'sin',
      correctValue: 81.65,
      unit: 'm',
      formulaChoices: [
        { id: 'sin', label: 'Định lý Sin (a / sin A = b / sin B = c / sin C)' },
        { id: 'cosin', label: 'Định lý Cosin' },
        { id: 'heron', label: 'Công thức Heron' },
      ],
      hint1: 'Trong tam giác ABC, ta đã biết độ dài 1 cạnh đáy AB và hai góc kề đáy là ∠A và ∠B.',
      hint2: 'Tổng ba góc của tam giác luôn bằng 180°, nên dễ dàng tính được góc đối diện ∠C = 180° − (75° + 45°) = 60°.',
      hint3: 'Đã biết 1 cạnh và tất cả các góc, ta áp dụng Định lý Sin: AC / sin(∠B) = AB / sin(∠C).',
      solution: [
        '1. Tính góc ngắm còn lại tại đỉnh C:',
        '   ∠C = 180° − (∠CAB + ∠CBA) = 180° − (75° + 45°) = 60°',
        '2. Áp dụng định lý sin trong tam giác ABC:',
        '   AC / sin(∠CBA) = AB / sin(∠ACB)',
        '   ⇒ AC = AB · sin(45°) / sin(60°)',
        '3. Thay số:',
        '   AC = 100 · (√2/2) / (√3/2) = 100 · √6 / 3 ≈ 81.65 m.',
        'Kết luận: Khoảng cách từ điểm A đến cột mốc C là xấp xỉ 81.65 mét.',
      ],
    },
    'land-area': {
      title: 'Tình huống 3: Tính diện tích mảnh đất tam giác',
      subtitle: 'Tính diện tích khuôn viên đất có cọc ranh giới tại các mốc A, B, C',
      problemStatement:
        landCase === 'two-sides-angle'
          ? 'Một mảnh đất hình tam giác ABC được cắm mốc khảo sát. Người đo đạc ghi lại hai cạnh ranh giới: AB = 40 m, AC = 60 m và góc mở ranh giới ∠A = 45°. Hãy tính diện tích khuôn viên mảnh đất này.'
          : 'Một thửa ruộng hình tam giác có ranh giới đo được 3 cạnh: a = 50 m, b = 60 m, c = 70 m. Hãy tính diện tích thửa đất theo công thức Heron.',
      given:
        landCase === 'two-sides-angle'
          ? ['Cạnh AB = 40 m', 'Cạnh AC = 60 m', 'Góc xen giữa ∠A = 45°']
          : ['Cạnh a = 50 m', 'Cạnh b = 60 m', 'Cạnh c = 70 m'],
      target: 'Tính diện tích S = ? m²',
      correctFormula: landCase === 'two-sides-angle' ? 'area-angle' : 'heron',
      correctValue: landCase === 'two-sides-angle' ? 848.53 : 1469.69,
      unit: 'm²',
      formulaChoices: [
        { id: 'area-angle', label: 'S = ½ · b · c · sin A (Hai cạnh và góc xen giữa)' },
        { id: 'heron', label: 'Công thức Heron: S = √[p(p−a)(p−b)(p−c)]' },
        { id: 'sin-law', label: 'Định lý Sin' },
      ],
      hint1:
        landCase === 'two-sides-angle'
          ? 'Đề bài cung cấp độ dài 2 cạnh biên và góc kẹp giữa 2 cạnh đó.'
          : 'Đề bài cung cấp độ dài cả 3 cạnh đường bao thửa đất mà không cho góc.',
      hint2:
        landCase === 'two-sides-angle'
          ? 'Khi biết 2 cạnh và góc kẹp, công thức nhanh nhất là S = 1/2 · b · c · sin A.'
          : 'Khi biết 3 cạnh, công thức tiêu chuẩn tối ưu nhất là công thức Heron.',
      hint3:
        landCase === 'two-sides-angle'
          ? 'S = 0.5 · 40 · 60 · sin(45°).'
          : 'Tính p = (50+60+70)/2 = 90 m, sau đó tính S = √[90·40·30·20].',
      solution:
        landCase === 'two-sides-angle'
          ? [
              '1. Áp dụng công thức diện tích tam giác qua hai cạnh và góc kẹp giữa:',
              '   S = ½ · AB · AC · sin(∠A)',
              '2. Thay số:',
              '   S = ½ · 40 · 60 · sin(45°) = 1200 · (√2 / 2) ≈ 848.53 m²',
              'Kết luận: Diện tích mảnh đất là khoảng 848.53 mét vuông.',
            ]
          : [
              '1. Tính nửa chu vi p:',
              '   p = (50 + 60 + 70) / 2 = 90 m',
              '2. Áp dụng công thức Heron:',
              '   S = √[p(p − a)(p − b)(p − c)]',
              '   S = √[90 · (90 − 50) · (90 − 60) · (90 − 70)]',
              '   S = √[90 · 40 · 30 · 20] = √2.160.000 ≈ 1469.69 m²',
              'Kết luận: Diện tích thửa ruộng là khoảng 1469.69 mét vuông.',
            ],
    },
  };

  const current = scenariosData[currentScenario];

  const handleSwitchScenario = (id: PracticalScenarioId) => {
    onSelectScenario(id);
    onApplyScenarioPreset(id);
    setLearningStep(1);
    setSelectedFormulaChoice(null);
    setFormulaCheckResult(null);
    setStudentInput('');
    setIsCalculated(false);
    setActiveHintLevel(0);
    setShowFullSolution(false);
  };

  const handleCheckFormula = (choiceId: string) => {
    setSelectedFormulaChoice(choiceId);
    const isCorrect = choiceId === current.correctFormula;
    setFormulaCheckResult(isCorrect);
    if (isCorrect) {
      setLearningStep(3); // move to calculation
    }
  };

  const handleVerifyStudentCalc = () => {
    setIsCalculated(true);
  };

  const inputVal = parseFloat(studentInput);
  const isInputClose =
    !isNaN(inputVal) && Math.abs(inputVal - current.correctValue) / current.correctValue < 0.03;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-4 overflow-y-auto space-y-4">
      {/* Header Banner */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Toán học quanh ta
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            Toán 10 Ứng dụng
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Vận dụng định lý cosin, định lý sin và diện tích vào thực tiễn đo đạc.
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
        {[
          { id: 'distance-ab', label: '1. Khoảng cách' },
          { id: 'river-width', label: '2. Bên kia sông' },
          { id: 'land-area', label: '3. Diện tích đất' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleSwitchScenario(item.id as PracticalScenarioId)}
            className={`py-1.5 px-1 text-[11px] font-semibold rounded transition-all text-center ${
              currentScenario === item.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* View Toggle: Realistic vs Geometric */}
      <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
        <span className="text-[11px] font-medium text-slate-300">Góc nhìn mô hình:</span>
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => onToggleViewMode('realistic')}
            className={`px-2 py-1 text-[11px] rounded transition-colors ${
              viewMode === 'realistic'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cảnh thực tế
          </button>
          <button
            onClick={() => onToggleViewMode('geometric')}
            className={`px-2 py-1 text-[11px] rounded transition-colors ${
              viewMode === 'geometric'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mô hình tam giác
          </button>
        </div>
      </div>

      {/* If scenario 3: Allow choosing Case 1 vs Case 2 */}
      {currentScenario === 'land-area' && (
        <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800 space-y-1.5">
          <span className="text-[11px] text-slate-400 block font-medium">Trường hợp dữ kiện:</span>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => {
                setLandCase('two-sides-angle');
                setSelectedFormulaChoice(null);
                setFormulaCheckResult(null);
                setIsCalculated(false);
              }}
              className={`py-1 px-1.5 text-[11px] rounded border transition-colors ${
                landCase === 'two-sides-angle'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              2 cạnh & góc kẹp
            </button>
            <button
              onClick={() => {
                setLandCase('three-sides');
                setSelectedFormulaChoice(null);
                setFormulaCheckResult(null);
                setIsCalculated(false);
              }}
              className={`py-1 px-1.5 text-[11px] rounded border transition-colors ${
                landCase === 'three-sides'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Ba cạnh (Heron)
            </button>
          </div>
        </div>
      )}

      {/* Problem Statement Box */}
      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
        <div className="font-semibold text-white flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{current.title}</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {current.problemStatement}
        </p>

        {/* Given data list */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Dữ kiện cho trước:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {current.given.map((g, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] font-mono-math bg-slate-900 text-emerald-300 rounded border border-emerald-800/40"
              >
                {g}
              </span>
            ))}
          </div>
          <div className="text-[11px] font-semibold text-amber-400 mt-1">
            Mục tiêu: {current.target}
          </div>
        </div>
      </div>

      {/* Pedagogical Step 1: Chọn công thức phù hợp */}
      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200">
            Bước 1: Chọn công thức giải quyết
          </span>
          {formulaCheckResult === true && (
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng công thức
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {current.formulaChoices.map((choice) => {
            const isSelected = selectedFormulaChoice === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleCheckFormula(choice.id)}
                className={`w-full p-2 rounded text-left transition-all text-xs flex items-center justify-between border ${
                  isSelected
                    ? formulaCheckResult
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold'
                      : 'bg-rose-950/40 border-rose-500 text-rose-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{choice.label}</span>
                {isSelected && (
                  <span>
                    {formulaCheckResult ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {formulaCheckResult === false && (
          <div className="text-[11px] text-rose-400">
            Chưa tối ưu! Hãy xem kỹ dữ kiện (2 cạnh + góc xen giữa, hay 1 cạnh + 2 góc) để chọn công thức thích hợp hơn.
          </div>
        )}
      </div>

      {/* Pedagogical Step 2: Tính toán và kiểm tra kết quả */}
      {formulaCheckResult === true && (
        <div className="p-3 bg-slate-950/80 rounded-lg border border-emerald-800/40 space-y-2 text-xs">
          <span className="font-semibold text-slate-200 block">
            Bước 2: Thay số và nhập kết quả dự đoán
          </span>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder={`Nhập kết quả (${current.unit})`}
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono-math focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleVerifyStudentCalc}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded transition-colors text-xs whitespace-nowrap"
            >
              Kiểm tra
            </button>
          </div>

          {isCalculated && (
            <div
              className={`p-2.5 rounded border text-xs ${
                isInputClose
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
              }`}
            >
              {isInputClose ? (
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Chính xác! Đáp số đúng: {current.correctValue} {current.unit}.
                  </span>
                </div>
              ) : (
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Kết quả gần đúng là: ~{current.correctValue} {current.unit}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Hãy kiểm tra lại phép tính lũy thừa hoặc căn bậc hai.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3-Tier Hints System (Gợi ý 1 -> 2 -> 3) & Full Solution */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Hệ thống gợi ý sư phạm:</span>
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveHintLevel(1)}
            className={`py-1 text-[11px] rounded transition-colors ${
              activeHintLevel >= 1
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Gợi ý 1
          </button>
          <button
            onClick={() => setActiveHintLevel(2)}
            className={`py-1 text-[11px] rounded transition-colors ${
              activeHintLevel >= 2
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Gợi ý 2
          </button>
          <button
            onClick={() => setActiveHintLevel(3)}
            className={`py-1 text-[11px] rounded transition-colors ${
              activeHintLevel >= 3
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Gợi ý 3
          </button>
          <button
            onClick={() => setShowFullSolution(!showFullSolution)}
            className={`py-1 text-[11px] rounded transition-colors ${
              showFullSolution
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-cyan-400 border border-cyan-800/40'
            }`}
          >
            Lời giải
          </button>
        </div>

        {/* Hint Box Content */}
        {activeHintLevel > 0 && (
          <div className="p-2.5 bg-amber-950/20 rounded border border-amber-800/40 text-[11px] text-amber-200/90 space-y-1">
            {activeHintLevel >= 1 && (
              <div>
                <b>Gợi ý 1 (Làm nổi dữ kiện):</b> {current.hint1}
              </div>
            )}
            {activeHintLevel >= 2 && (
              <div className="border-t border-amber-900/40 pt-1">
                <b>Gợi ý 2 (Quan hệ dữ kiện):</b> {current.hint2}
              </div>
            )}
            {activeHintLevel >= 3 && (
              <div className="border-t border-amber-900/40 pt-1">
                <b>Gợi ý 3 (Công thức phù hợp):</b> {current.hint3}
              </div>
            )}
          </div>
        )}

        {/* Full Solution (Only on demand) */}
        {showFullSolution && (
          <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/60 font-mono-math text-xs space-y-1 text-slate-300">
            <div className="font-bold text-cyan-300 font-sans mb-1">
              Lời giải chi tiết bài toán:
            </div>
            {current.solution.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
