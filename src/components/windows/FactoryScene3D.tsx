import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FactoryState, PRODUCT_INTERVAL } from '../../lib/factory';
import { productVisual } from '../../lib/factory-visual';

type Props = { game: FactoryState; active: boolean; sensorOn: boolean; onUnavailable: () => void };
type Rig = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  products: THREE.Group[];
  colors: THREE.MeshStandardMaterial[];
  piston: THREE.Mesh;
  sensorLight: THREE.MeshStandardMaterial;
  beltMarks: THREE.Mesh[];
};

export function FactoryScene3D({ game, active, sensorOn, onUnavailable }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const rig = useRef<Rig | null>(null);
  const unavailable = useRef(onUnavailable);
  unavailable.current = onUnavailable;
  useEffect(() => {
    const element = container.current;
    if (!element || typeof window.WebGLRenderingContext === 'undefined') {
      unavailable.current();
      return;
    }
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      unavailable.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0xdce5e1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    const contextLost = (event: Event) => {
      event.preventDefault();
      unavailable.current();
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 3.1, -3.1, 0.1, 100);
    camera.position.set(8, 7.5, 11);
    camera.lookAt(0, 0.7, 0);
    scene.add(new THREE.HemisphereLight(0xf4faf5, 0x728f88, 2));
    const sunlight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunlight.position.set(-3, 8, 5);
    scene.add(sunlight);
    const mat = (color: number, metalness = 0, roughness = 0.7) =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness });
    const metal = mat(0x82918c, 0.5);
    const dark = mat(0x344c4d, 0.35);
    const frame = mat(0x566f69, 0.4);
    const yellow = mat(0xe5ad47);
    const rubber = mat(0x384a47);
    const pale = mat(0xecefe6);
    const glass = mat(0x73b8bc, 0.15, 0.25);
    const box = (
      w: number,
      h: number,
      d: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = scene
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    const cylinder = (
      radius: number,
      height: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number
    ) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 18), material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };
    // Floor and conveyor frame.
    box(12, 0.08, 7, mat(0xc8d6d0), 0, -0.08, 0);
    box(8.5, 0.28, 2.05, frame, 0, 0.68, 0);
    box(8.1, 0.08, 1.65, rubber, 0, 0.86, 0);
    for (const z of [-1.02, 1.02]) {
      box(8.5, 0.12, 0.1, metal, 0, 0.92, z);
      for (const x of [-3.5, 0, 3.5]) box(0.12, 0.7, 0.12, dark, x, 0.3, z);
    }
    for (const x of [-3.6, -1.8, 0, 1.8, 3.6]) {
      const roller = cylinder(0.075, 1.75, metal, x, 0.84, 0);
      roller.rotation.x = Math.PI / 2;
    }
    const beltMarks = Array.from({ length: 18 }, (_, i) =>
      box(0.035, 0.012, 1.55, mat(0x6d8179), -4 + i * 0.47, 0.91, 0)
    );
    // Optical inspection head and indicator at 20% of the belt.
    const sensorX = -2.4;
    box(0.13, 2.15, 0.13, metal, sensorX, 1.72, -1.16);
    box(0.12, 0.12, 1.2, metal, sensorX, 2.75, -0.62);
    box(0.58, 0.28, 0.5, yellow, sensorX, 2.53, 0);
    box(0.28, 0.04, 0.22, glass, sensorX, 2.37, 0);
    const sensorLight = new THREE.MeshStandardMaterial({ color: 0x4a6258, emissive: 0x000000 });
    box(0.11, 0.11, 0.06, sensorLight, sensorX, 2.57, 0.28);
    // Pneumatic reject actuator at 60%; piston pushes toward the bin.
    const gateX = 0.8;
    box(0.18, 1.25, 0.18, metal, gateX, 1.42, -1.45);
    box(0.65, 0.35, 0.66, frame, gateX, 1.2, -1.45);
    const piston = box(0.16, 0.16, 0.7, metal, gateX, 1.2, -0.95);
    box(0.45, 0.37, 0.12, yellow, 0, 0, 0.37, piston);
    // Collection bin and motor housing.
    box(1.6, 0.1, 1.25, dark, gateX, 0.09, 1.85);
    box(1.6, 0.55, 0.08, frame, gateX, 0.38, 2.44);
    box(0.08, 0.55, 1.25, frame, gateX - 0.76, 0.38, 1.85);
    box(0.08, 0.55, 1.25, frame, gateX + 0.76, 0.38, 1.85);
    const motor = cylinder(0.3, 0.8, dark, 3.7, 0.44, -1.35);
    motor.rotation.x = Math.PI / 2;
    box(0.3, 0.16, 0.3, yellow, 3.7, 0.35, -1.75);
    // Products are kept in sync with the simulation, not the render loop.
    const colors: THREE.MeshStandardMaterial[] = [];
    const products = game.products.map(() => {
      const group = new THREE.Group();
      const body = mat(0xc5a275);
      colors.push(body);
      box(0.48, 0.42, 0.45, body, 0, 0, 0, group);
      box(0.05, 0.425, 0.455, pale, 0, 0, 0, group);
      box(0.2, 0.08, 0.01, dark, 0.06, 0.05, 0.231, group);
      group.visible = false;
      scene.add(group);
      return group;
    });
    const resize = () => {
      const width = Math.max(1, element.clientWidth);
      const height = Math.max(1, element.clientHeight);
      const aspect = width / height;
      const viewHeight = Math.max(6.4, 10.5 / aspect);
      camera.left = (-viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(element);
    if (!observer) window.addEventListener('resize', resize);
    rig.current = { renderer, scene, camera, products, colors, piston, sensorLight, beltMarks };
    resize();
    return () => {
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', resize);
      rig.current = null;
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const list = Array.isArray(object.material) ? object.material : [object.material];
          list.forEach((material) => materials.add(material));
        }
      });
      materials.forEach((material) => material.dispose());
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  useEffect(() => {
    const state = rig.current;
    if (!state) return;
    game.products.forEach((product, index) => {
      const age = game.elapsed - (product.id - 1) * PRODUCT_INTERVAL;
      const visual = productVisual(age, product.outcome);
      const group = state.products[index];
      group.visible = visual.visible;
      group.position.set(
        -4 + visual.progress * 8,
        1.13 - visual.diversion * 0.4,
        visual.diversion * 1.65
      );
      state.colors[index].color.set(product.defect && product.detected ? 0xc46751 : 0xc5a275);
    });
    state.piston.position.z = active ? -0.1 : -0.95;
    state.sensorLight.emissive.set(sensorOn ? 0xf9b73e : 0x000000);
    state.beltMarks.forEach((mark, index) => {
      mark.position.x = -4 + ((index * 0.47 + game.elapsed * 0.00267) % 8);
    });
    state.renderer.render(state.scene, state.camera);
  }, [game, active, sensorOn]);
  return (
    <div
      className="factory-three"
      ref={container}
      role="img"
      aria-label="3D view of the conveyor, inspection sensor and reject actuator"
    />
  );
}
