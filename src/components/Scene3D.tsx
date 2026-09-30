import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Point2D,
  TriangleState,
  TriangleMetrics,
  AppMode,
  AreaSubMode,
  CosineVariant,
  PracticalScenarioId,
} from '../types/geometry';
import { getAltitudeFoot } from '../utils/mathGeometry';

interface Scene3DProps {
  mode: AppMode;
  areaSubMode: AreaSubMode;
  cosVariant: CosineVariant;
  sinSelectedPair: 'A' | 'B' | 'C' | 'all';
  practicalScenario: PracticalScenarioId;
  practicalViewMode: 'realistic' | 'geometric';
  triangleState: TriangleState;
  metrics: TriangleMetrics;
  onVertexDrag: (vertex: 'A' | 'B' | 'C', newPos: Point2D) => void;
  // Free explore toggles
  showCosines?: boolean;
  showSines?: boolean;
  showAltitude?: boolean;
  showCircumcircle?: boolean;
  showIncircle?: boolean;
  showAreaFill?: boolean;
}

export const Scene3D: React.FC<Scene3DProps> = ({
  mode,
  areaSubMode,
  cosVariant,
  sinSelectedPair,
  practicalScenario,
  practicalViewMode,
  triangleState,
  metrics,
  onVertexDrag,
  showCosines = false,
  showSines = false,
  showAltitude = false,
  showCircumcircle = false,
  showIncircle = false,
  showAreaFill = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Screen projections for sharp HTML label overlay
  const [screenLabels, setScreenLabels] = useState<{
    A: { x: number; y: number; visible: boolean };
    B: { x: number; y: number; visible: boolean };
    C: { x: number; y: number; visible: boolean };
    midBC: { x: number; y: number; visible: boolean }; // side a
    midCA: { x: number; y: number; visible: boolean }; // side b
    midAB: { x: number; y: number; visible: boolean }; // side c
    circumcenter: { x: number; y: number; visible: boolean };
    incenter: { x: number; y: number; visible: boolean };
    footHa: { x: number; y: number; visible: boolean };
    midHa: { x: number; y: number; visible: boolean };
    obsO?: { x: number; y: number; visible: boolean };
  }>({
    A: { x: 0, y: 0, visible: false },
    B: { x: 0, y: 0, visible: false },
    C: { x: 0, y: 0, visible: false },
    midBC: { x: 0, y: 0, visible: false },
    midCA: { x: 0, y: 0, visible: false },
    midAB: { x: 0, y: 0, visible: false },
    circumcenter: { x: 0, y: 0, visible: false },
    incenter: { x: 0, y: 0, visible: false },
    footHa: { x: 0, y: 0, visible: false },
    midHa: { x: 0, y: 0, visible: false },
  });

  // Dragging state
  const draggingVertexRef = useRef<'A' | 'B' | 'C' | null>(null);
  const isOrbitingRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera spherical coordinates
  const cameraSphericalRef = useRef({
    radius: 13,
    theta: 0, // azimuthal angle (around Y)
    phi: Math.PI / 4.2, // polar angle (~42° from top, gives clean 25-35° elevation)
  });

  // References to dynamic meshes
  const triangleMeshRef = useRef<THREE.Mesh | null>(null);
  const edgesGroupRef = useRef<THREE.Group | null>(null);
  const verticesGroupRef = useRef<THREE.Group | null>(null);
  const altitudeGroupRef = useRef<THREE.Group | null>(null);
  const circumcircleMeshRef = useRef<THREE.Mesh | null>(null);
  const circumcenterMeshRef = useRef<THREE.Mesh | null>(null);
  const circumRadiusLineRef = useRef<THREE.Line | null>(null);
  const incircleMeshRef = useRef<THREE.Mesh | null>(null);
  const incenterMeshRef = useRef<THREE.Mesh | null>(null);
  const incircleRadiusLineRef = useRef<THREE.Line | null>(null);
  const angleArcsGroupRef = useRef<THREE.Group | null>(null);
  const practicalPropsGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16); // Deep modern classroom slate
    scene.fog = new THREE.FogExp2(0x090d16, 0.025);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting (Studio classroom 3-point lighting + soft GI)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(10, 20, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    fillLight.position.set(-12, 10, -10);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.8);
    rimLight.position.set(0, -5, -15);
    scene.add(rimLight);

    // Mathematical Table Grid Surface
    const groundGroup = new THREE.Group();

    // Base subtle matte plane
    const planeGeo = new THREE.PlaneGeometry(28, 28);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.15,
    });
    const groundPlane = new THREE.Mesh(planeGeo, planeMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.02;
    groundPlane.receiveShadow = true;
    groundGroup.add(groundPlane);

    // Subtle coordinate grid
    const gridHelper = new THREE.GridHelper(26, 26, 0x1e293b, 0x172136);
    gridHelper.position.y = 0;
    groundGroup.add(gridHelper);

    // Faint concentric circle rings for radial distance reference
    for (let r = 2; r <= 8; r += 2) {
      const ringGeo = new THREE.RingGeometry(r - 0.015, r + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1e293b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.005;
      groundGroup.add(ringMesh);
    }
    scene.add(groundGroup);

    // Groups for dynamic geometry
    const edgesGroup = new THREE.Group();
    edgesGroupRef.current = edgesGroup;
    scene.add(edgesGroup);

    const verticesGroup = new THREE.Group();
    verticesGroupRef.current = verticesGroup;
    scene.add(verticesGroup);

    const altitudeGroup = new THREE.Group();
    altitudeGroupRef.current = altitudeGroup;
    scene.add(altitudeGroup);

    const angleArcsGroup = new THREE.Group();
    angleArcsGroupRef.current = angleArcsGroup;
    scene.add(angleArcsGroup);

    const practicalPropsGroup = new THREE.Group();
    practicalPropsGroupRef.current = practicalPropsGroup;
    scene.add(practicalPropsGroup);

    // Triangle Area Fill Mesh (Semi-transparent with subtle top specular)
    const triGeo = new THREE.BufferGeometry();
    const triMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const triangleMesh = new THREE.Mesh(triGeo, triMat);
    triangleMesh.receiveShadow = true;
    triangleMeshRef.current = triangleMesh;
    scene.add(triangleMesh);

    // Circumcircle Mesh (Torus ring)
    const circumGeo = new THREE.TorusGeometry(1, 0.03, 16, 120);
    const circumMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const circumcircleMesh = new THREE.Mesh(circumGeo, circumMat);
    circumcircleMesh.rotation.x = Math.PI / 2;
    circumcircleMesh.position.y = 0.12;
    circumcircleMesh.visible = false;
    circumcircleMeshRef.current = circumcircleMesh;
    scene.add(circumcircleMesh);

    // Circumcenter O node
    const oNodeGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const oNodeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const circumcenterMesh = new THREE.Mesh(oNodeGeo, oNodeMat);
    circumcenterMesh.position.y = 0.14;
    circumcenterMesh.visible = false;
    circumcenterMeshRef.current = circumcenterMesh;
    scene.add(circumcenterMesh);

    // Circumradius line R
    const rLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.14, 0),
      new THREE.Vector3(1, 0.14, 0),
    ]);
    const rLineMat = new THREE.LineDashedMaterial({
      color: 0x7dd3fc,
      dashSize: 0.2,
      gapSize: 0.1,
    });
    const circumRadiusLine = new THREE.Line(rLineGeo, rLineMat);
    circumRadiusLine.computeLineDistances();
    circumRadiusLine.visible = false;
    circumRadiusLineRef.current = circumRadiusLine;
    scene.add(circumRadiusLine);

    // Incircle Mesh (Torus ring)
    const inGeo = new THREE.TorusGeometry(1, 0.03, 16, 120);
    const inMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85,
    });
    const incircleMesh = new THREE.Mesh(inGeo, inMat);
    incircleMesh.rotation.x = Math.PI / 2;
    incircleMesh.position.y = 0.12;
    incircleMesh.visible = false;
    incircleMeshRef.current = incircleMesh;
    scene.add(incircleMesh);

    // Incenter I node
    const iNodeGeo = new THREE.SphereGeometry(0.1, 24, 24);
    const iNodeMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const incenterMesh = new THREE.Mesh(iNodeGeo, iNodeMat);
    incenterMesh.position.y = 0.14;
    incenterMesh.visible = false;
    incenterMeshRef.current = incenterMesh;
    scene.add(incenterMesh);

    // Inradius line r
    const inrLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.14, 0),
      new THREE.Vector3(1, 0.14, 0),
    ]);
    const inrLineMat = new THREE.LineDashedMaterial({
      color: 0x6ee7b7,
      dashSize: 0.15,
      gapSize: 0.08,
    });
    const incircleRadiusLine = new THREE.Line(inrLineGeo, inrLineMat);
    incircleRadiusLine.computeLineDistances();
    incircleRadiusLine.visible = false;
    incircleRadiusLineRef.current = incircleRadiusLine;
    scene.add(incircleRadiusLine);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        updateScreenLabels();
      }
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update Camera Spherical Position
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0.2, 0);
  };

  // Adjust camera distance softly when switching to Sin Theorem (circumcircle needs wider FOV)
  useEffect(() => {
    let targetRadius = 13.5;
    if (mode === 'sin-theorem') {
      targetRadius = 16.5;
    } else if (mode === 'practical-problems') {
      targetRadius = 15.0;
    } else {
      targetRadius = 13.5;
    }

    // Smooth lerp
    let startRadius = cameraSphericalRef.current.radius;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const t = step / 15;
      cameraSphericalRef.current.radius = THREE.MathUtils.lerp(startRadius, targetRadius, t);
      updateCameraPosition();
      if (step >= 15) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [mode]);

  // Project 3D vector to Screen Coordinates for sharp HTML Labels
  const projectToScreen = useCallback((vec3: THREE.Vector3) => {
    if (!cameraRef.current || !containerRef.current) return { x: 0, y: 0, visible: false };
    const clone = vec3.clone();
    clone.project(cameraRef.current);

    const isBehind = clone.z > 1;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    return {
      x: ((clone.x + 1) * w) / 2,
      y: ((-clone.y + 1) * h) / 2,
      visible: !isBehind,
    };
  }, []);

  // Recalculate 2D screen positions for all labels
  const updateScreenLabels = useCallback(() => {
    const { A, B, C } = triangleState;
    const vA = new THREE.Vector3(A.x, 0.4, A.z);
    const vB = new THREE.Vector3(B.x, 0.4, B.z);
    const vC = new THREE.Vector3(C.x, 0.4, C.z);

    const midBC = new THREE.Vector3((B.x + C.x) / 2, 0.25, (B.z + C.z) / 2);
    const midCA = new THREE.Vector3((C.x + A.x) / 2, 0.25, (C.z + A.z) / 2);
    const midAB = new THREE.Vector3((A.x + B.x) / 2, 0.25, (A.z + B.z) / 2);

    const vCircum = new THREE.Vector3(metrics.circumcenter.x, 0.25, metrics.circumcenter.z);
    const vIn = new THREE.Vector3(metrics.incenter.x, 0.25, metrics.incenter.z);
    const vFootHa = new THREE.Vector3(metrics.footHa.x, 0.2, metrics.footHa.z);
    const vMidHa = new THREE.Vector3((A.x + metrics.footHa.x) / 2, 0.25, (A.z + metrics.footHa.z) / 2);

    setScreenLabels({
      A: projectToScreen(vA),
      B: projectToScreen(vB),
      C: projectToScreen(vC),
      midBC: projectToScreen(midBC),
      midCA: projectToScreen(midCA),
      midAB: projectToScreen(midAB),
      circumcenter: projectToScreen(vCircum),
      incenter: projectToScreen(vIn),
      footHa: projectToScreen(vFootHa),
      midHa: projectToScreen(vMidHa),
      obsO: projectToScreen(new THREE.Vector3(0, 0.4, 0)),
    });
  }, [triangleState, metrics, projectToScreen]);

  // Render/Update 3D Triangle Geometry, Edges, Altitudes, Rings
  useEffect(() => {
    if (!sceneRef.current) return;
    const { A, B, C } = triangleState;

    // Height offset above the floor
    const yLevel = 0.15;
    const vA = new THREE.Vector3(A.x, yLevel, A.z);
    const vB = new THREE.Vector3(B.x, yLevel, B.z);
    const vC = new THREE.Vector3(C.x, yLevel, C.z);

    // 1. Update Area Fill Triangle
    if (triangleMeshRef.current) {
      if (metrics.isValid && (showAreaFill || mode === 'area-formulas' || mode === 'cos-theorem')) {
        const vertices = new Float32Array([
          vA.x, vA.y - 0.01, vA.z,
          vB.x, vB.y - 0.01, vB.z,
          vC.x, vC.y - 0.01, vC.z,
        ]);
        triangleMeshRef.current.geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(vertices, 3)
        );
        triangleMeshRef.current.geometry.computeVertexNormals();
        triangleMeshRef.current.visible = true;

        // Tint area fill based on mode
        const mat = triangleMeshRef.current.material as THREE.MeshStandardMaterial;
        if (mode === 'area-formulas') {
          mat.color.setHex(0x10b981); // Emerald
          mat.opacity = 0.3;
        } else if (mode === 'practical-problems' && practicalScenario === 'land-area') {
          mat.color.setHex(0x22c55e); // Land parcel green
          mat.opacity = 0.4;
        } else {
          mat.color.setHex(0x0ea5e9); // Sky blue
          mat.opacity = 0.2;
        }
      } else {
        triangleMeshRef.current.visible = false;
      }
    }

    // 2. Build Smooth Cylinder Edges
    if (edgesGroupRef.current) {
      // Clear old edges
      while (edgesGroupRef.current.children.length > 0) {
        const obj = edgesGroupRef.current.children[0];
        edgesGroupRef.current.remove(obj);
      }

      // Helper to build 3D cylindrical edge
      const createCylinderEdge = (
        p1: THREE.Vector3,
        p2: THREE.Vector3,
        colorHex: number,
        radius: number = 0.055,
        glow: boolean = false
      ) => {
        const dir = new THREE.Vector3().subVectors(p2, p1);
        const len = dir.length();
        const halfLen = len / 2;
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const geo = new THREE.CylinderGeometry(radius, radius, len, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: glow ? 0.8 : 0.25,
          roughness: 0.25,
          metalness: 0.3,
        });
        const cylinder = new THREE.Mesh(geo, mat);
        cylinder.position.copy(mid);

        // Align cylinder to edge direction
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
        cylinder.quaternion.copy(quaternion);
        cylinder.castShadow = true;
        return cylinder;
      };

      // Determine edge colors based on focus
      // Edge a = BC, opposite A (Color A: Amber #F59E0B)
      // Edge b = CA, opposite B (Color B: Cyan #06B6D4)
      // Edge c = AB, opposite C (Color C: Violet #8B5CF6)
      let colorBC = 0xf59e0b; // a
      let colorCA = 0x06b6d4; // b
      let colorAB = 0x8b5cf6; // c
      let glowBC = false;
      let glowCA = false;
      let glowAB = false;
      let rBC = 0.055;
      let rCA = 0.055;
      let rAB = 0.055;

      if (mode === 'cos-theorem') {
        if (cosVariant === 'C') {
          // c^2 = a^2 + b^2 - 2ab cos C
          // Highlight a (BC), b (CA), and c (AB)
          glowBC = true;
          glowCA = true;
          glowAB = true;
          rAB = 0.085; // side c is the focus result
        } else if (cosVariant === 'A') {
          glowCA = true;
          glowAB = true;
          glowBC = true;
          rBC = 0.085;
        } else if (cosVariant === 'B') {
          glowBC = true;
          glowAB = true;
          glowCA = true;
          rCA = 0.085;
        }
      } else if (mode === 'sin-theorem') {
        if (sinSelectedPair === 'A') {
          glowBC = true;
          rBC = 0.08;
          colorCA = 0x334155; // dim others
          colorAB = 0x334155;
        } else if (sinSelectedPair === 'B') {
          glowCA = true;
          rCA = 0.08;
          colorBC = 0x334155;
          colorAB = 0x334155;
        } else if (sinSelectedPair === 'C') {
          glowAB = true;
          rAB = 0.08;
          colorBC = 0x334155;
          colorCA = 0x334155;
        } else {
          glowBC = true;
          glowCA = true;
          glowAB = true;
        }
      } else if (mode === 'area-formulas') {
        if (areaSubMode === 'base-height') {
          glowBC = true; // base a
          rBC = 0.08;
        } else if (areaSubMode === 'two-sides-angle') {
          glowCA = true; // b
          glowAB = true; // c
          rCA = 0.075;
          rAB = 0.075;
        }
      }

      edgesGroupRef.current.add(createCylinderEdge(vB, vC, colorBC, rBC, glowBC));
      edgesGroupRef.current.add(createCylinderEdge(vC, vA, colorCA, rCA, glowCA));
      edgesGroupRef.current.add(createCylinderEdge(vA, vB, colorAB, rAB, glowAB));
    }

    // 3. Build Vertex Spheres
    if (verticesGroupRef.current) {
      while (verticesGroupRef.current.children.length > 0) {
        const obj = verticesGroupRef.current.children[0];
        verticesGroupRef.current.remove(obj);
      }

      const createVertexSphere = (pos: THREE.Vector3, colorHex: number, name: 'A' | 'B' | 'C') => {
        const group = new THREE.Group();

        // Main polished sphere
        const geo = new THREE.SphereGeometry(0.18, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.65,
          roughness: 0.15,
          metalness: 0.4,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.castShadow = true;
        mesh.name = name;
        group.add(mesh);

        // Soft halo ring at floor level for interactive affordance
        const haloGeo = new THREE.RingGeometry(0.24, 0.32, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = -Math.PI / 2;
        halo.position.set(pos.x, 0.01, pos.z);
        group.add(halo);

        return group;
      };

      verticesGroupRef.current.add(createVertexSphere(vA, 0xf59e0b, 'A')); // Amber A
      verticesGroupRef.current.add(createVertexSphere(vB, 0x06b6d4, 'B')); // Cyan B
      verticesGroupRef.current.add(createVertexSphere(vC, 0x8b5cf6, 'C')); // Violet C
    }

    // 4. Altitude line & foot marker
    if (altitudeGroupRef.current) {
      while (altitudeGroupRef.current.children.length > 0) {
        const obj = altitudeGroupRef.current.children[0];
        altitudeGroupRef.current.remove(obj);
      }

      const shouldShowAlt =
        (mode === 'area-formulas' && areaSubMode === 'base-height') ||
        (mode === 'free-explore' && showAltitude);

      if (shouldShowAlt && metrics.isValid) {
        const vFoot = new THREE.Vector3(metrics.footHa.x, yLevel, metrics.footHa.z);

        // Dashed altitude line from A to footHa
        const lineGeo = new THREE.BufferGeometry().setFromPoints([vA, vFoot]);
        const lineMat = new THREE.LineDashedMaterial({
          color: 0xec4899, // Pink/Rose
          dashSize: 0.25,
          gapSize: 0.12,
        });
        const altLine = new THREE.Line(lineGeo, lineMat);
        altLine.computeLineDistances();
        altitudeGroupRef.current.add(altLine);

        // Foot marker sphere
        const footGeo = new THREE.SphereGeometry(0.09, 16, 16);
        const footMat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xbe185d,
          emissiveIntensity: 0.6,
        });
        const footMesh = new THREE.Mesh(footGeo, footMat);
        footMesh.position.copy(vFoot);
        altitudeGroupRef.current.add(footMesh);

        // Right angle indicator at foot
        const dirBC = new THREE.Vector3().subVectors(vC, vB).normalize();
        const dirHA = new THREE.Vector3().subVectors(vA, vFoot).normalize();
        const sqSize = 0.25;
        const p1 = vFoot.clone().add(dirBC.clone().multiplyScalar(sqSize));
        const p2 = p1.clone().add(dirHA.clone().multiplyScalar(sqSize));
        const p3 = vFoot.clone().add(dirHA.clone().multiplyScalar(sqSize));

        const sqGeo = new THREE.BufferGeometry().setFromPoints([vFoot, p1, p2, p3]);
        const sqMat = new THREE.LineBasicMaterial({ color: 0xf472b6 });
        const sqLine = new THREE.Line(sqGeo, sqMat);
        altitudeGroupRef.current.add(sqLine);
      }
    }

    // 5. Circumcircle & Circumcenter
    const shouldShowCircum =
      mode === 'sin-theorem' ||
      (mode === 'area-formulas' && areaSubMode === 'circum-radius') ||
      (mode === 'free-explore' && showCircumcircle);

    if (circumcircleMeshRef.current && circumcenterMeshRef.current && circumRadiusLineRef.current) {
      if (shouldShowCircum && metrics.isValid && metrics.R < 25) {
        circumcircleMeshRef.current.position.set(
          metrics.circumcenter.x,
          0.12,
          metrics.circumcenter.z
        );
        const scale = Math.max(0.1, metrics.R);
        circumcircleMeshRef.current.scale.set(scale, scale, 1);
        circumcircleMeshRef.current.visible = true;

        circumcenterMeshRef.current.position.set(
          metrics.circumcenter.x,
          0.14,
          metrics.circumcenter.z
        );
        circumcenterMeshRef.current.visible = true;

        // Radius line from O to A
        const rPoints = [
          new THREE.Vector3(metrics.circumcenter.x, 0.14, metrics.circumcenter.z),
          new THREE.Vector3(A.x, 0.14, A.z),
        ];
        circumRadiusLineRef.current.geometry.setFromPoints(rPoints);
        circumRadiusLineRef.current.computeLineDistances();
        circumRadiusLineRef.current.visible = true;
      } else {
        circumcircleMeshRef.current.visible = false;
        circumcenterMeshRef.current.visible = false;
        circumRadiusLineRef.current.visible = false;
      }
    }

    // 6. Incircle & Incenter
    const shouldShowIn =
      (mode === 'area-formulas' && areaSubMode === 'in-radius') ||
      (mode === 'free-explore' && showIncircle);

    if (incircleMeshRef.current && incenterMeshRef.current && incircleRadiusLineRef.current) {
      if (shouldShowIn && metrics.isValid && metrics.r > 0.05) {
        incircleMeshRef.current.position.set(
          metrics.incenter.x,
          0.12,
          metrics.incenter.z
        );
        const scale = Math.max(0.05, metrics.r);
        incircleMeshRef.current.scale.set(scale, scale, 1);
        incircleMeshRef.current.visible = true;

        incenterMeshRef.current.position.set(
          metrics.incenter.x,
          0.14,
          metrics.incenter.z
        );
        incenterMeshRef.current.visible = true;

        // Inradius line from I perpendicular to BC
        const footI_BC = getAltitudeFoot(metrics.incenter, B, C);
        const rPoints = [
          new THREE.Vector3(metrics.incenter.x, 0.14, metrics.incenter.z),
          new THREE.Vector3(footI_BC.x, 0.14, footI_BC.z),
        ];
        incircleRadiusLineRef.current.geometry.setFromPoints(rPoints);
        incircleRadiusLineRef.current.computeLineDistances();
        incircleRadiusLineRef.current.visible = true;
      } else {
        incircleMeshRef.current.visible = false;
        incircleMeshRef.current.visible = false;
        incircleRadiusLineRef.current.visible = false;
      }
    }

    // 7. Angle Arcs in 3D
    if (angleArcsGroupRef.current) {
      while (angleArcsGroupRef.current.children.length > 0) {
        const obj = angleArcsGroupRef.current.children[0];
        angleArcsGroupRef.current.remove(obj);
      }

      // Draw angle arc sector
      const createAngleSector = (
        vertex: THREE.Vector3,
        arm1: THREE.Vector3,
        arm2: THREE.Vector3,
        colorHex: number,
        radius: number = 0.65
      ) => {
        const v1 = new THREE.Vector3().subVectors(arm1, vertex).normalize();
        const v2 = new THREE.Vector3().subVectors(arm2, vertex).normalize();

        const angle = Math.acos(clamp(v1.dot(v2), -1, 1));
        const segments = 24;
        const points: THREE.Vector3[] = [vertex];

        // Cross product for rotation axis
        const axis = new THREE.Vector3(0, 1, 0);

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          // Slerp or rotate around Y
          const p = v1.clone().applyAxisAngle(axis, -t * angle).multiplyScalar(radius).add(vertex);
          points.push(p);
        }

        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
        // Triangle fan indices
        const indices: number[] = [];
        for (let i = 1; i < points.length - 1; i++) {
          indices.push(0, i, i + 1);
        }
        arcGeo.setIndex(indices);
        arcGeo.computeVertexNormals();

        const arcMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
        });
        const arcMesh = new THREE.Mesh(arcGeo, arcMat);
        arcMesh.position.y = 0.02;

        // Outline
        const outlinePoints = points.slice(1);
        const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePoints);
        const outlineMat = new THREE.LineBasicMaterial({ color: colorHex });
        const outlineLine = new THREE.Line(outlineGeo, outlineMat);
        outlineLine.position.y = 0.02;

        const group = new THREE.Group();
        group.add(arcMesh);
        group.add(outlineLine);
        return group;
      };

      // Always show angle C in Cosine mode if cosVariant === 'C', etc.
      if (mode === 'cos-theorem') {
        if (cosVariant === 'C') {
          angleArcsGroupRef.current.add(createAngleSector(vC, vA, vB, 0x8b5cf6, 0.75));
        } else if (cosVariant === 'A') {
          angleArcsGroupRef.current.add(createAngleSector(vA, vB, vC, 0xf59e0b, 0.75));
        } else if (cosVariant === 'B') {
          angleArcsGroupRef.current.add(createAngleSector(vB, vC, vA, 0x06b6d4, 0.75));
        }
      } else if (mode === 'sin-theorem') {
        if (sinSelectedPair === 'A' || sinSelectedPair === 'all') {
          angleArcsGroupRef.current.add(createAngleSector(vA, vB, vC, 0xf59e0b, 0.65));
        }
        if (sinSelectedPair === 'B' || sinSelectedPair === 'all') {
          angleArcsGroupRef.current.add(createAngleSector(vB, vC, vA, 0x06b6d4, 0.65));
        }
        if (sinSelectedPair === 'C' || sinSelectedPair === 'all') {
          angleArcsGroupRef.current.add(createAngleSector(vC, vA, vB, 0x8b5cf6, 0.65));
        }
      } else if (mode === 'area-formulas' && areaSubMode === 'two-sides-angle') {
        angleArcsGroupRef.current.add(createAngleSector(vA, vB, vC, 0xf59e0b, 0.75));
      }
    }

    // 8. Build Practical Props (River scene, surveyor stakes, observation post)
    const practicalGroup = practicalPropsGroupRef.current;
    if (practicalGroup) {
      while (practicalGroup.children.length > 0) {
        const obj = practicalGroup.children[0];
        practicalGroup.remove(obj);
      }

      if (mode === 'practical-problems') {
        if (practicalScenario === 'river-width') {
          // River surface between near bank (A, B) and far bank (C)
          const riverGeo = new THREE.PlaneGeometry(24, 2.8);
          const riverMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.65,
          });
          const riverMesh = new THREE.Mesh(riverGeo, riverMat);
          riverMesh.rotation.x = -Math.PI / 2;
          riverMesh.position.set(0, 0.01, (A.z + C.z) / 2);
          practicalGroup.add(riverMesh);

          // Stylized tree/monument at point C across the river
          const treeTrunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.12, 0.8, 12),
            new THREE.MeshStandardMaterial({ color: 0x78350f })
          );
          treeTrunk.position.set(C.x, 0.4, C.z);
          practicalGroup.add(treeTrunk);

          const treeTop = new THREE.Mesh(
            new THREE.ConeGeometry(0.45, 1.1, 16),
            new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 })
          );
          treeTop.position.set(C.x, 1.1, C.z);
          practicalGroup.add(treeTop);

          // Survey theodolite tripod at A and B
          [A, B].forEach((pt) => {
            const stake = new THREE.Mesh(
              new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8),
              new THREE.MeshStandardMaterial({ color: 0xf59e0b })
            );
            stake.position.set(pt.x, 0.3, pt.z);
            practicalGroup.add(stake);
          });
        } else if (practicalScenario === 'distance-ab') {
          // Observation tower/post at (0, 0)
          const tower = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.25, 0.9, 16),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5 })
          );
          tower.position.set(0, 0.45, 0);
          practicalGroup.add(tower);

          // Landmarks at A and B
          [
            { pt: A, color: 0xf59e0b },
            { pt: B, color: 0x10b981 },
          ].forEach(({ pt, color }) => {
            const beacon = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.15, 0.7, 12),
              new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4 })
            );
            beacon.position.set(pt.x, 0.35, pt.z);
            practicalGroup.add(beacon);
          });
        } else if (practicalScenario === 'land-area') {
          // Surveyor boundary pegs at A, B, C
          [A, B, C].forEach((pt) => {
            const peg = new THREE.Mesh(
              new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8),
              new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
            );
            peg.position.set(pt.x, 0.25, pt.z);
            practicalGroup.add(peg);
          });
        }
      }
    }
  }, [
    triangleState,
    metrics,
    mode,
    areaSubMode,
    cosVariant,
    sinSelectedPair,
    practicalScenario,
    practicalViewMode,
    showCosines,
    showSines,
    showAltitude,
    showCircumcircle,
    showIncircle,
    showAreaFill,
  ]);

  // Pointer Interaction (Vertex dragging + Camera Orbiting)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast against vertices A, B, C
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    if (verticesGroupRef.current) {
      // Find meshes in vertices group
      const vertexMeshes: THREE.Mesh[] = [];
      verticesGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
          vertexMeshes.push(child);
        }
      });

      const intersects = raycaster.intersectObjects(vertexMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.name === 'A' || hit.name === 'B' || hit.name === 'C') {
          draggingVertexRef.current = hit.name as 'A' | 'B' | 'C';
          canvasRef.current.setPointerCapture(e.pointerId);
          return;
        }
      }
    }

    // If not dragging vertex, start orbiting camera
    isOrbitingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    canvasRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current) return;

    if (draggingVertexRef.current) {
      // Dragging a vertex on ground plane (y = 0)
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

      if (intersectionPoint) {
        // Clamp to safe bounds
        const clampedX = clamp(Number(intersectionPoint.x.toFixed(2)), -6, 6);
        const clampedZ = clamp(Number(intersectionPoint.z.toFixed(2)), -5.5, 5.5);
        onVertexDrag(draggingVertexRef.current, { x: clampedX, z: clampedZ });
      }
    } else if (isOrbitingRef.current) {
      // Orbiting camera
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      const spherical = cameraSphericalRef.current;
      spherical.theta -= dx * 0.007;
      spherical.phi = clamp(spherical.phi - dy * 0.007, 0.25, Math.PI / 2.1); // Keep 25-35° tilt
      updateCameraPosition();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingVertexRef.current) {
      draggingVertexRef.current = null;
    }
    isOrbitingRef.current = false;
    if (canvasRef.current) {
      try {
        canvasRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const spherical = cameraSphericalRef.current;
    spherical.radius = clamp(spherical.radius + e.deltaY * 0.012, 6, 25);
    updateCameraPosition();
  };

  // Helper function to clamp
  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  // Camera reset buttons
  const resetCamera = () => {
    cameraSphericalRef.current = {
      radius: mode === 'sin-theorem' ? 16.5 : 13.5,
      theta: 0,
      phi: Math.PI / 4.2,
    };
    updateCameraPosition();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Camera & Visual Controls HUD (top-right of canvas) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-800 text-xs text-slate-300 shadow-md">
        <button
          onClick={() => {
            cameraSphericalRef.current.radius = clamp(cameraSphericalRef.current.radius - 2, 6, 25);
            updateCameraPosition();
          }}
          title="Phóng to"
          className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
        >
          <span className="font-semibold text-sm leading-none">+</span>
        </button>
        <button
          onClick={() => {
            cameraSphericalRef.current.radius = clamp(cameraSphericalRef.current.radius + 2, 6, 25);
            updateCameraPosition();
          }}
          title="Thu nhỏ"
          className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
        >
          <span className="font-semibold text-sm leading-none">−</span>
        </button>
        <div className="w-[1px] h-4 bg-slate-800 my-auto" />
        <button
          onClick={resetCamera}
          title="Đặt lại góc nhìn chuẩn (25° - 35°)"
          className="px-2 py-1 hover:bg-slate-800 rounded transition-colors text-[11px] font-medium text-slate-300 hover:text-white"
        >
          Góc nhìn chuẩn
        </button>
      </div>

      {/* Floating 3D Razor-Sharp Screen Labels */}
      {/* Vertex A Label */}
      {screenLabels.A.visible && (
        <div
          style={{
            transform: `translate(${screenLabels.A.x}px, ${screenLabels.A.y}px) translate(-50%, -130%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <div className="flex flex-col items-center">
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/90 text-slate-950 rounded shadow-md border border-amber-300/40">
              A ({metrics.angleA}°)
            </span>
          </div>
        </div>
      )}

      {/* Vertex B Label */}
      {screenLabels.B.visible && (
        <div
          style={{
            transform: `translate(${screenLabels.B.x}px, ${screenLabels.B.y}px) translate(-50%, -130%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <div className="flex flex-col items-center">
            <span className="px-2 py-0.5 text-xs font-bold bg-cyan-500/90 text-slate-950 rounded shadow-md border border-cyan-300/40">
              B ({metrics.angleB}°)
            </span>
          </div>
        </div>
      )}

      {/* Vertex C Label */}
      {screenLabels.C.visible && (
        <div
          style={{
            transform: `translate(${screenLabels.C.x}px, ${screenLabels.C.y}px) translate(-50%, -130%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <div className="flex flex-col items-center">
            <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/90 text-white rounded shadow-md border border-purple-300/40">
              C ({metrics.angleC}°)
            </span>
          </div>
        </div>
      )}

      {/* Side a (BC) Label */}
      {screenLabels.midBC.visible && (
        <div
          style={{
            transform: `translate(${screenLabels.midBC.x}px, ${screenLabels.midBC.y}px) translate(-50%, -50%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <span className="px-1.5 py-0.5 text-[11px] font-mono-math font-semibold bg-slate-900/90 text-amber-300 rounded border border-amber-500/40 shadow-sm backdrop-blur-sm">
            a = {metrics.a}
          </span>
        </div>
      )}

      {/* Side b (CA) Label */}
      {screenLabels.midCA.visible && (
        <div
          style={{
            transform: `translate(${screenLabels.midCA.x}px, ${screenLabels.midCA.y}px) translate(-50%, -50%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <span className="px-1.5 py-0.5 text-[11px] font-mono-math font-semibold bg-slate-900/90 text-cyan-300 rounded border border-cyan-500/40 shadow-sm backdrop-blur-sm">
            b = {metrics.b}
          </span>
        </div>
      )}

      {/* Side c (AB) Label */}
      {screenLabels.midAB.visible && (
        <div
          style={{
            transform: `translate(${screenLabels.midAB.x}px, ${screenLabels.midAB.y}px) translate(-50%, -50%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <span className="px-1.5 py-0.5 text-[11px] font-mono-math font-semibold bg-slate-900/90 text-purple-300 rounded border border-purple-500/40 shadow-sm backdrop-blur-sm">
            c = {metrics.c}
          </span>
        </div>
      )}

      {/* Altitude ha label & Foot H */}
      {screenLabels.midHa.visible && (mode === 'area-formulas' && areaSubMode === 'base-height') && (
        <div
          style={{
            transform: `translate(${screenLabels.midHa.x}px, ${screenLabels.midHa.y}px) translate(-50%, -50%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <span className="px-1.5 py-0.5 text-[11px] font-mono-math font-semibold bg-pink-950/90 text-pink-300 rounded border border-pink-500/50 shadow-sm">
            hₐ = {metrics.ha}
          </span>
        </div>
      )}

      {/* Foot H label */}
      {screenLabels.footHa.visible && (mode === 'area-formulas' && areaSubMode === 'base-height') && (
        <div
          style={{
            transform: `translate(${screenLabels.footHa.x}px, ${screenLabels.footHa.y}px) translate(-50%, 40%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <span className="text-[10px] font-bold text-pink-400 bg-slate-950/80 px-1 rounded border border-pink-500/30">
            H
          </span>
        </div>
      )}

      {/* Circumcenter O and R Label */}
      {screenLabels.circumcenter.visible && (mode === 'sin-theorem' || (mode === 'area-formulas' && areaSubMode === 'circum-radius')) && (
        <div
          style={{
            transform: `translate(${screenLabels.circumcenter.x}px, ${screenLabels.circumcenter.y}px) translate(-50%, -120%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <span className="px-1.5 py-0.5 text-[11px] font-mono-math font-semibold bg-sky-950/95 text-sky-300 rounded border border-sky-400/50 shadow-md">
            Tâm O · R = {metrics.R}
          </span>
        </div>
      )}

      {/* Incenter I and r Label */}
      {screenLabels.incenter.visible && (mode === 'area-formulas' && areaSubMode === 'in-radius') && (
        <div
          style={{
            transform: `translate(${screenLabels.incenter.x}px, ${screenLabels.incenter.y}px) translate(-50%, -120%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <span className="px-1.5 py-0.5 text-[11px] font-mono-math font-semibold bg-emerald-950/95 text-emerald-300 rounded border border-emerald-400/50 shadow-md">
            Tâm I · r = {metrics.r}
          </span>
        </div>
      )}

      {/* Practical Observation Point O label */}
      {mode === 'practical-problems' && practicalScenario === 'distance-ab' && screenLabels.obsO?.visible && (
        <div
          style={{
            transform: `translate(${screenLabels.obsO.x}px, ${screenLabels.obsO.y}px) translate(-50%, -120%)`,
          }}
          className="absolute pointer-events-none transition-transform duration-75"
        >
          <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-slate-900 text-sky-300 rounded border border-sky-500/40">
            Điểm quan sát O
          </span>
        </div>
      )}

      {/* Interactive Helper Banner at Bottom of Canvas */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Kéo các đỉnh <b>A</b>, <b>B</b>, <b>C</b> để biến đổi tam giác · Kéo chuột để xoay 3D</span>
        </div>
      </div>
    </div>
  );
};
