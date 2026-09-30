export type Point2D = { x: number; z: number };

export type Point3D = { x: number; y: number; z: number };

export type AppMode = 
  | 'cos-theorem'       // 1. Định lý cosin
  | 'sin-theorem'       // 2. Định lý sin
  | 'area-formulas'     // 3. Diện tích tam giác
  | 'practical-problems'// 4. Bài toán thực tế
  | 'free-explore';     // Khám phá tự do / Tự tạo tam giác

export type AreaSubMode = 
  | 'base-height'       // A. Đáy - đường cao (1/2 a ha)
  | 'two-sides-angle'   // B. Hai cạnh và góc xen giữa (1/2 bc sin A)
  | 'heron'             // C. Công thức Heron
  | 'in-radius'         // D. Bán kính đường tròn nội tiếp (S = p.r)
  | 'circum-radius';    // E. Bán kính đường tròn ngoại tiếp (S = abc / 4R)

export type CosineVariant = 'C' | 'A' | 'B';

export type PredictionAnswer = 'increase' | 'decrease' | 'constant' | null;

export interface TriangleState {
  A: Point2D;
  B: Point2D;
  C: Point2D;
}

export interface TriangleMetrics {
  // Side lengths
  a: number; // BC
  b: number; // CA
  c: number; // AB

  // Angles in degrees
  angleA: number;
  angleB: number;
  angleC: number;

  // Angles in radians
  radA: number;
  radB: number;
  radC: number;

  // Perimeter and semiperimeter
  perimeter: number;
  p: number; // semiperimeter

  // Area
  area: number;

  // Altitudes
  ha: number; // from A to BC
  hb: number; // from B to CA
  hc: number; // from C to AB
  footHa: Point2D;

  // Circumcircle (ngoại tiếp)
  circumcenter: Point2D;
  R: number; // circumradius
  sinRatioA: number; // a / sin A
  sinRatioB: number; // b / sin B
  sinRatioC: number; // c / sin C

  // Incircle (nội tiếp)
  incenter: Point2D;
  r: number; // inradius

  // Triangle validity
  isValid: boolean;
  validationMessage?: string;
}

export type PracticalScenarioId = 'distance-ab' | 'river-width' | 'land-area';

export interface PracticalScenario {
  id: PracticalScenarioId;
  title: string;
  subtitle: string;
  problemStatement: string;
  givenDataText: string[];
  recommendedFormula: string;
  correctAnswer: number;
  unit: string;
  hint1: string; // Làm nổi dữ kiện
  hint2: string; // Chỉ ra quan hệ giữa các dữ kiện
  hint3: string; // Gợi ý công thức
  fullSolution: string[];
}
