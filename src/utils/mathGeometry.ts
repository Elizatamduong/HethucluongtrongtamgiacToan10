import { Point2D, TriangleMetrics, TriangleState } from '../types/geometry';

export const EPSILON = 1e-5;

// Distance between two points
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// Clamp helper
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Radian to Degree and vice versa
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Compute foot of altitude from point P to line segment (V1 - V2)
export function getAltitudeFoot(P: Point2D, V1: Point2D, V2: Point2D): Point2D {
  const dx = V2.x - V1.x;
  const dz = V2.z - V1.z;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < EPSILON) return { x: V1.x, z: V1.z };

  const t = ((P.x - V1.x) * dx + (P.z - V1.z) * dz) / lenSq;
  return {
    x: V1.x + t * dx,
    z: V1.z + t * dz,
  };
}

// Calculate comprehensive triangle metrics
export function computeTriangleMetrics(A: Point2D, B: Point2D, C: Point2D): TriangleMetrics {
  const a = distance(B, C); // BC
  const b = distance(C, A); // CA
  const c = distance(A, B); // AB

  // Check triangle inequality and degeneracy
  const isValid = 
    a > 0.05 && b > 0.05 && c > 0.05 &&
    (a + b > c + EPSILON) &&
    (b + c > a + EPSILON) &&
    (c + a > b + EPSILON);

  if (!isValid) {
    return {
      a: Number(a.toFixed(2)),
      b: Number(b.toFixed(2)),
      c: Number(c.toFixed(2)),
      angleA: 0,
      angleB: 0,
      angleC: 0,
      radA: 0,
      radB: 0,
      radC: 0,
      perimeter: Number((a + b + c).toFixed(2)),
      p: Number(((a + b + c) / 2).toFixed(2)),
      area: 0,
      ha: 0,
      hb: 0,
      hc: 0,
      footHa: { x: (B.x + C.x) / 2, z: (B.z + C.z) / 2 },
      circumcenter: { x: 0, z: 0 },
      R: 0,
      sinRatioA: 0,
      sinRatioB: 0,
      sinRatioC: 0,
      incenter: { x: 0, z: 0 },
      r: 0,
      isValid: false,
      validationMessage: "Ba độ dài này chưa tạo thành một tam giác. Hãy điều chỉnh dữ kiện.",
    };
  }

  // Calculate angles using Law of Cosines
  // cos A = (b^2 + c^2 - a^2) / (2bc)
  const cosA = clamp((b * b + c * c - a * a) / (2 * b * c), -1, 1);
  const cosB = clamp((a * a + c * c - b * b) / (2 * a * c), -1, 1);
  const cosC = clamp((a * a + b * b - c * c) / (2 * a * b), -1, 1);

  const radA = Math.acos(cosA);
  const radB = Math.acos(cosB);
  const radC = Math.acos(cosC);

  const angleA = radToDeg(radA);
  const angleB = radToDeg(radB);
  const angleC = radToDeg(radC);

  const perimeter = a + b + c;
  const p = perimeter / 2;

  // Area using Heron's formula / 1/2 b c sin A
  const area = 0.5 * b * c * Math.sin(radA);

  // Altitudes: ha = 2S / a
  const ha = a > EPSILON ? (2 * area) / a : 0;
  const hb = b > EPSILON ? (2 * area) / b : 0;
  const hc = c > EPSILON ? (2 * area) / c : 0;

  const footHa = getAltitudeFoot(A, B, C);

  // Circumradius R = abc / (4S)
  const R = area > EPSILON ? (a * b * c) / (4 * area) : 0;

  // Sin ratios: a / sin A, b / sin B, c / sin C
  const sinRatioA = Math.sin(radA) > EPSILON ? a / Math.sin(radA) : 2 * R;
  const sinRatioB = Math.sin(radB) > EPSILON ? b / Math.sin(radB) : 2 * R;
  const sinRatioC = Math.sin(radC) > EPSILON ? c / Math.sin(radC) : 2 * R;

  // Circumcenter O
  // Using barycentric coordinates:
  // sin(2A) * A + sin(2B) * B + sin(2C) * C
  const sin2A = Math.sin(2 * radA);
  const sin2B = Math.sin(2 * radB);
  const sin2C = Math.sin(2 * radC);
  const sumSin2 = sin2A + sin2B + sin2C;

  let circumcenter: Point2D = { x: 0, z: 0 };
  if (Math.abs(sumSin2) > EPSILON) {
    circumcenter = {
      x: (sin2A * A.x + sin2B * B.x + sin2C * C.x) / sumSin2,
      z: (sin2A * A.z + sin2B * B.z + sin2C * C.z) / sumSin2,
    };
  }

  // Incenter I = (a*A + b*B + c*C) / (a + b + c)
  const incenter: Point2D = {
    x: (a * A.x + b * B.x + c * C.x) / perimeter,
    z: (a * A.z + b * B.z + c * C.z) / perimeter,
  };

  // Inradius r = S / p
  const r = p > EPSILON ? area / p : 0;

  return {
    a: Number(a.toFixed(2)),
    b: Number(b.toFixed(2)),
    c: Number(c.toFixed(2)),
    angleA: Number(angleA.toFixed(1)),
    angleB: Number(angleB.toFixed(1)),
    angleC: Number(angleC.toFixed(1)),
    radA,
    radB,
    radC,
    perimeter: Number(perimeter.toFixed(2)),
    p: Number(p.toFixed(2)),
    area: Number(area.toFixed(2)),
    ha: Number(ha.toFixed(2)),
    hb: Number(hb.toFixed(2)),
    hc: Number(hc.toFixed(2)),
    footHa,
    circumcenter,
    R: Number(R.toFixed(2)),
    sinRatioA: Number(sinRatioA.toFixed(2)),
    sinRatioB: Number(sinRatioB.toFixed(2)),
    sinRatioC: Number(sinRatioC.toFixed(2)),
    incenter,
    r: Number(r.toFixed(2)),
    isValid: true,
  };
}

// Generate point C for given side a, side b, and angle C at origin
export function constructTriangleFromSidesAndAngle(
  a: number,
  b: number,
  angleCdeg: number
): TriangleState {
  // Place C at (0, 0)
  // Place B along positive X axis at distance a: (a, 0)
  // Place A at angle C with distance b: (b * cos(C), b * sin(C))
  const rad = degToRad(angleCdeg);
  const C: Point2D = { x: 0, z: 1.5 };
  const B: Point2D = { x: a, z: 1.5 };
  const A: Point2D = {
    x: b * Math.cos(rad),
    z: 1.5 - b * Math.sin(rad),
  };

  // Re-center around (0,0)
  const centerX = (A.x + B.x + C.x) / 3;
  const centerZ = (A.z + B.z + C.z) / 3;

  return {
    A: { x: Number((A.x - centerX).toFixed(2)), z: Number((A.z - centerZ).toFixed(2)) },
    B: { x: Number((B.x - centerX).toFixed(2)), z: Number((B.z - centerZ).toFixed(2)) },
    C: { x: Number((C.x - centerX).toFixed(2)), z: Number((C.z - centerZ).toFixed(2)) },
  };
}

// Preset standard triangles
export const TRIANGLE_PRESETS: Record<string, { label: string; state: TriangleState }> = {
  acute: {
    label: "Tam giác nhọn (chuẩn)",
    state: {
      A: { x: 0.2, z: -2.3 },
      B: { x: -3.0, z: 1.8 },
      C: { x: 3.2, z: 1.8 },
    },
  },
  equilateral: {
    label: "Tam giác đều (60°)",
    state: {
      A: { x: 0, z: -2.5 },
      B: { x: -2.6, z: 2.0 },
      C: { x: 2.6, z: 2.0 },
    },
  },
  right: {
    label: "Tam giác vuông (A = 90°)",
    state: {
      A: { x: -2.5, z: -1.5 },
      B: { x: -2.5, z: 2.5 },
      C: { x: 2.5, z: -1.5 },
    },
  },
  obtuse: {
    label: "Tam giác tù (C > 90°)",
    state: {
      A: { x: -2.0, z: -2.2 },
      B: { x: 3.8, z: 1.5 },
      C: { x: -1.2, z: 0.8 },
    },
  },
  isosceles: {
    label: "Tam giác cân",
    state: {
      A: { x: 0, z: -2.8 },
      B: { x: -2.5, z: 1.8 },
      C: { x: 2.5, z: 1.8 },
    },
  },
};
