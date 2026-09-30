import React, { useState, useMemo, useCallback } from 'react';
import {
  AppMode,
  AreaSubMode,
  CosineVariant,
  PracticalScenarioId,
  TriangleState,
  Point2D,
} from './types/geometry';
import {
  computeTriangleMetrics,
  constructTriangleFromSidesAndAngle,
  TRIANGLE_PRESETS,
  degToRad,
} from './utils/mathGeometry';
import { FormulaHeader } from './components/FormulaHeader';
import { Scene3D } from './components/Scene3D';
import { DataFormulaResultCard } from './components/DataFormulaResultCard';
import { CosTheoremPanel } from './components/CosTheoremPanel';
import { SinTheoremPanel } from './components/SinTheoremPanel';
import { AreaFormulasPanel } from './components/AreaFormulasPanel';
import { PracticalProblemsPanel } from './components/PracticalProblemsPanel';
import { FreeExplorePanel } from './components/FreeExplorePanel';

export default function App() {
  // Main app state
  const [currentMode, setCurrentMode] = useState<AppMode>('cos-theorem');

  // Triangle vertices in 3D ground plane (x, z)
  const [triangleState, setTriangleState] = useState<TriangleState>(
    TRIANGLE_PRESETS.acute.state
  );

  // Mode 1: Cosine Theorem state
  const [cosVariant, setCosVariant] = useState<CosineVariant>('C');

  // Mode 2: Sine Theorem state
  const [sinSelectedPair, setSinSelectedPair] = useState<'A' | 'B' | 'C' | 'all'>('all');

  // Mode 3: Area formulas submode
  const [areaSubMode, setAreaSubMode] = useState<AreaSubMode>('base-height');

  // Mode 4: Practical problems state
  const [practicalScenario, setPracticalScenario] = useState<PracticalScenarioId>('distance-ab');
  const [practicalViewMode, setPracticalViewMode] = useState<'realistic' | 'geometric'>('realistic');

  // Free explore toggles
  const [showCosines, setShowCosines] = useState<boolean>(true);
  const [showSines, setShowSines] = useState<boolean>(true);
  const [showAltitude, setShowAltitude] = useState<boolean>(false);
  const [showCircumcircle, setShowCircumcircle] = useState<boolean>(false);
  const [showIncircle, setShowIncircle] = useState<boolean>(false);
  const [showAreaFill, setShowAreaFill] = useState<boolean>(true);

  // Compute live geometric metrics
  const metrics = useMemo(() => {
    return computeTriangleMetrics(triangleState.A, triangleState.B, triangleState.C);
  }, [triangleState]);

  // Vertex Drag handler from 3D scene
  const handleVertexDrag = useCallback((vertex: 'A' | 'B' | 'C', newPos: Point2D) => {
    setTriangleState((prev) => ({
      ...prev,
      [vertex]: newPos,
    }));
  }, []);

  // Handle angle slider adjustment (recalculates vertex position while preserving side lengths)
  const handleAngleSliderChange = useCallback(
    (newAngleDeg: number) => {
      if (currentMode === 'cos-theorem') {
        if (cosVariant === 'C') {
          // Adjust position of A based on angle C, keeping a and b constant
          const sideA = metrics.a;
          const sideB = metrics.b;
          const reconstructed = constructTriangleFromSidesAndAngle(sideA, sideB, newAngleDeg);
          setTriangleState(reconstructed);
        } else if (cosVariant === 'A') {
          const sideB = metrics.b;
          const sideC = metrics.c;
          const reconstructed = constructTriangleFromSidesAndAngle(sideC, sideB, newAngleDeg);
          setTriangleState({
            A: reconstructed.C,
            B: reconstructed.B,
            C: reconstructed.A,
          });
        } else if (cosVariant === 'B') {
          const sideA = metrics.a;
          const sideC = metrics.c;
          const reconstructed = constructTriangleFromSidesAndAngle(sideA, sideC, newAngleDeg);
          setTriangleState({
            A: reconstructed.A,
            B: reconstructed.C,
            C: reconstructed.B,
          });
        }
      } else if (currentMode === 'area-formulas') {
        // Adjust angle A, keeping b and c constant
        const sideB = metrics.b;
        const sideC = metrics.c;
        const rad = degToRad(newAngleDeg);
        const { A } = triangleState;
        // B at A + (c, 0), C at A + (b*cos A, b*sin A)
        const newB = { x: A.x - sideC * 0.5, z: A.z + 2.5 };
        const newC = {
          x: newB.x + sideB * Math.cos(rad),
          z: newB.z + sideB * Math.sin(rad),
        };
        setTriangleState({ A, B: newB, C: newC });
      }
    },
    [currentMode, cosVariant, metrics, triangleState]
  );

  // Reset triangle to default preset
  const handleResetTriangle = useCallback(() => {
    if (currentMode === 'practical-problems') {
      applyPracticalPreset(practicalScenario);
    } else {
      setTriangleState(TRIANGLE_PRESETS.acute.state);
    }
  }, [currentMode, practicalScenario]);

  // Mode selection & automatic preset initialization
  const handleSelectMode = useCallback((mode: AppMode) => {
    setCurrentMode(mode);
    if (mode === 'practical-problems') {
      applyPracticalPreset('distance-ab');
    } else if (mode === 'sin-theorem') {
      setSinSelectedPair('all');
      setTriangleState({
        A: { x: 0, z: -2.6 },
        B: { x: -2.8, z: 2.0 },
        C: { x: 3.0, z: 1.8 },
      });
    } else if (mode === 'cos-theorem') {
      setCosVariant('C');
      setTriangleState(TRIANGLE_PRESETS.acute.state);
    }
  }, []);

  // Presets for Practical Scenarios
  const applyPracticalPreset = useCallback((scenarioId: PracticalScenarioId) => {
    if (scenarioId === 'distance-ab') {
      // O at origin (0,0), A at (-2.5, -2.5), B at (3.5, 0.5)
      setTriangleState({
        A: { x: -2.8, z: -2.0 },
        B: { x: 3.2, z: 0.8 },
        C: { x: 0, z: 2.2 },
      });
    } else if (scenarioId === 'river-width') {
      // Near bank A, B at z = 1.6; far bank tree C at z = -2.2
      setTriangleState({
        A: { x: -2.6, z: 1.8 },
        B: { x: 2.4, z: 1.8 },
        C: { x: -0.4, z: -2.2 },
      });
    } else if (scenarioId === 'land-area') {
      // Land plot ABC
      setTriangleState({
        A: { x: -2.2, z: -2.0 },
        B: { x: -2.0, z: 2.4 },
        C: { x: 3.2, z: 1.2 },
      });
    }
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 1. Header with Mode Tabs */}
      <FormulaHeader
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        onResetTriangle={handleResetTriangle}
      />

      {/* 2. Main 3-Column Interactive Workspace */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Column: Interactive Control Panel */}
        <section className="w-[360px] xl:w-[400px] shrink-0 h-full overflow-hidden flex flex-col z-10 shadow-xl">
          {currentMode === 'cos-theorem' && (
            <CosTheoremPanel
              variant={cosVariant}
              onSelectVariant={setCosVariant}
              metrics={metrics}
              onAngleSliderChange={handleAngleSliderChange}
            />
          )}

          {currentMode === 'sin-theorem' && (
            <SinTheoremPanel
              selectedPair={sinSelectedPair}
              onSelectPair={setSinSelectedPair}
              metrics={metrics}
            />
          )}

          {currentMode === 'area-formulas' && (
            <AreaFormulasPanel
              currentSubMode={areaSubMode}
              onSelectSubMode={setAreaSubMode}
              metrics={metrics}
              onAngleSliderChange={handleAngleSliderChange}
            />
          )}

          {currentMode === 'practical-problems' && (
            <PracticalProblemsPanel
              currentScenario={practicalScenario}
              onSelectScenario={setPracticalScenario}
              viewMode={practicalViewMode}
              onToggleViewMode={setPracticalViewMode}
              onApplyScenarioPreset={applyPracticalPreset}
            />
          )}

          {currentMode === 'free-explore' && (
            <FreeExplorePanel
              metrics={metrics}
              triangleState={triangleState}
              onApplyPreset={setTriangleState}
              showCosines={showCosines}
              setShowCosines={setShowCosines}
              showSines={showSines}
              setShowSines={setShowSines}
              showAltitude={showAltitude}
              setShowAltitude={setShowAltitude}
              showCircumcircle={showCircumcircle}
              setShowCircumcircle={setShowCircumcircle}
              showIncircle={showIncircle}
              setShowIncircle={setShowIncircle}
              showAreaFill={showAreaFill}
              setShowAreaFill={setShowAreaFill}
            />
          )}
        </section>

        {/* Center Column: 3D Interactive Stage */}
        <section className="flex-1 h-full relative overflow-hidden bg-slate-950">
          <Scene3D
            mode={currentMode}
            areaSubMode={areaSubMode}
            cosVariant={cosVariant}
            sinSelectedPair={sinSelectedPair}
            practicalScenario={practicalScenario}
            practicalViewMode={practicalViewMode}
            triangleState={triangleState}
            metrics={metrics}
            onVertexDrag={handleVertexDrag}
            showCosines={showCosines}
            showSines={showSines}
            showAltitude={showAltitude}
            showCircumcircle={showCircumcircle}
            showIncircle={showIncircle}
            showAreaFill={showAreaFill}
          />
        </section>

        {/* Right Column: Data - Formula - Result Live Card */}
        <aside className="w-[330px] xl:w-[360px] shrink-0 h-full overflow-hidden flex flex-col z-10 shadow-xl">
          <DataFormulaResultCard
            mode={currentMode}
            areaSubMode={areaSubMode}
            cosVariant={cosVariant}
            sinSelectedPair={sinSelectedPair}
            metrics={metrics}
          />
        </aside>
      </main>

      {/* 3. Footer with Copyright Attribution */}
      <footer className="h-7 border-t border-slate-800/90 bg-slate-950/95 px-6 flex items-center justify-between text-xs text-slate-400 shrink-0 z-20">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500">Mô phỏng 3D Giáo dục Toán 10</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400">Hệ thức lượng trong tam giác</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span>Bản quyền: <strong className="text-slate-200 font-semibold">Cô giáo Eliza Tâm Dương</strong></span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>SĐT: <a href="tel:0962571826" className="font-mono-math text-cyan-400 hover:text-cyan-300 hover:underline">0962571826</a></span>
        </div>
      </footer>
    </div>
  );
}
