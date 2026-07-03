import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ===== DOM Refs =====
const canvas = document.querySelector('canvas.webgl');
const loaderEl = document.getElementById('loader');

// ===== Scene Setup =====
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// ===== Lighting =====
const ambientLight = new THREE.AmbientLight('#ffffff', 2.0);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight('#ffffff', 2.5);
dirLight1.position.set(4, 5, 3);
scene.add(dirLight1);

// ===== Camera =====
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 5);
scene.add(camera);

// ===== Renderer =====
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ===== Resize =====
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ScrollTrigger.refresh();
});

// ===== Helper: Create Dummy Models (Fallback) =====
function createDummyModel(type) {
  let geometry, material, mesh;

  switch (type) {
    case 'sunglasses':
      geometry = new THREE.TorusKnotGeometry(0.4, 0.15, 64, 8);
      material = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.8,
        roughness: 0.2,
      });
      mesh = new THREE.Mesh(geometry, material);
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.3,
        roughness: 0.1,
        transparent: true,
        opacity: 0.6,
      });
      const lens1 = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), lensMat);
      lens1.position.set(-0.45, 0.1, 0.35);
      lens1.rotation.y = -0.3;
      mesh.add(lens1);
      const lens2 = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), lensMat);
      lens2.position.set(0.45, 0.1, 0.35);
      lens2.rotation.y = 0.3;
      mesh.add(lens2);
      break;

    case 'lipstick':
      const group = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xd81b60,
        metalness: 0.1,
        roughness: 0.3,
      });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.7, 32), bodyMat);
      body.position.y = 0;
      group.add(body);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x880e4f,
        metalness: 0.5,
        roughness: 0.2,
      });
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 32), capMat);
      cap.position.y = 0.5;
      group.add(cap);
      const tipMat = new THREE.MeshStandardMaterial({
        color: 0xf06292,
        metalness: 0.0,
        roughness: 0.4,
      });
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.2, 16), tipMat);
      tip.position.y = 0.6;
      group.add(tip);
      mesh = group;
      break;

    case 'serum':
      const bottleGroup = new THREE.Group();
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xff80ab,
        metalness: 0.0,
        roughness: 0.05,
        transparent: true,
        opacity: 0.7,
        clearcoat: 0.9,
      });
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 0.6, 32), glassMat);
      bottle.position.y = 0;
      bottleGroup.add(bottle);
      const capMat2 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.6,
        roughness: 0.2,
      });
      const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.15, 16), capMat2);
      cap2.position.y = 0.4;
      bottleGroup.add(cap2);
      const liquidMat = new THREE.MeshPhysicalMaterial({
        color: 0xf48fb1,
        metalness: 0.0,
        roughness: 0.0,
        transparent: true,
        opacity: 0.5,
      });
      const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.3, 32), liquidMat);
      liquid.position.y = -0.1;
      bottleGroup.add(liquid);
      mesh = bottleGroup;
      break;

    default:
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x9c27b0, metalness: 0.5, roughness: 0.3 })
      );
  }
  return mesh;
}

// ===== Load Models (with Fallback) =====
const loader = new GLTFLoader();
const models = { sunglasses: null, lipstick: null, serum: null };

let loadedCount = 0;
const totalModels = 3;

function checkAllLoaded() {
  loadedCount++;
  if (loadedCount === totalModels) {
    setupAnimationsAndUI();
  }
}

function assignModel(type, asset) {
  const model = asset || createDummyModel(type);
  models[type] = model;

  if (type === 'sunglasses') model.scale.set(0.2, 0.2, 0.2);
  else if (type === 'lipstick') model.scale.set(1.0, 1.0, 1.0);
  else if (type === 'serum') model.scale.set(1.0, 1.0, 1.0);

  if (type === 'sunglasses') {
    model.position.set(2.2, 1.0, 0);
  } else if (type === 'lipstick') {
    model.position.set(2.2, 0.0, 0);
  } else if (type === 'serum') {
    model.position.set(2.2, -1.0, 0);
  }

  scene.add(model);
  checkAllLoaded();
}

function tryLoadModel(type, path) {
  loader.load(
    path,
    (gltf) => {
      console.log(`✅ Loaded: ${type}`);
      assignModel(type, gltf.scene);
    },
    undefined,
    (err) => {
      console.warn(`⚠️ Failed to load ${type} from "${path}". Using fallback dummy.`, err);
      assignModel(type, null);
    }
  );
}

const basePath = './';
tryLoadModel('sunglasses', `${basePath}sunglasses.glb`);
tryLoadModel('lipstick', `${basePath}lipstick.glb`);
tryLoadModel('serum', `${basePath}beauty_serum.glb`);

// ===== Setup Animations & UI =====
function setupAnimationsAndUI() {
  let mm = gsap.matchMedia();

  // LAPTOP/DESKTOP VIEW: Pristine, untouched original positions
  mm.add("(min-width: 769px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'main',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
        invalidateOnRefresh: true,
      },
    });

    tl.to(models.sunglasses.position, { x: -0.8, y: 0, z: 0 }, 0)
      .to(models.sunglasses.rotation, { x: 0.2, y: 1.2, z: 0 }, 0)
      .to(models.lipstick.position, { x: 2.2, y: -5, z: 0 }, 0)
      .to(models.serum.position, { x: 2.2, y: -6, z: 0 }, 0)

      .to(models.sunglasses.position, { x: -6, y: 6, z: -2 }, 1)
      .to(models.lipstick.position, { x: 1.0, y: 0, z: 0.5 }, 1)
      .to(models.lipstick.rotation, { x: 0.4, y: 2.5, z: -0.2 }, 1)
      .to(models.serum.position, { x: 1.8, y: -5, z: 0 }, 1)

      .to(models.lipstick.position, { x: 6, y: 6, z: -2 }, 2)
      .to(models.serum.position, { x: 0.8, y: 0, z: 0.5 }, 2)
      .to(models.serum.rotation, { x: 0, y: 6.28, z: 0 }, 2);
  });

  // PHONE/MOBILE VIEW: Fully isolated layout changes
  mm.add("(max-width: 768px)", () => {
    // Bring assets down in size and center horizontally so they are fully visible
    gsap.set(models.sunglasses.scale, { x: 0.13, y: 0.13, z: 0.13 });
    gsap.set(models.lipstick.scale, { x: 0.65, y: 0.65, z: 0.65 });
    gsap.set(models.serum.scale, { x: 0.65, y: 0.65, z: 0.65 });

    gsap.set(models.sunglasses.position, { x: 0.0, y: 1.3, z: 0 });
    gsap.set(models.lipstick.position, { x: -0.5, y: 0.4, z: 0 });
    gsap.set(models.serum.position, { x: 0.5, y: 0.4, z: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'main',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
        invalidateOnRefresh: true,
      },
    });

    tl.to(models.sunglasses.position, { x: 0.0, y: 0.2, z: 0 }, 0)
      .to(models.sunglasses.rotation, { x: 0.2, y: 1.2, z: 0 }, 0)
      .to(models.lipstick.position, { x: 0.0, y: -4, z: 0 }, 0)
      .to(models.serum.position, { x: 0.0, y: -5, z: 0 }, 0)

      .to(models.sunglasses.position, { x: -5, y: 5, z: -2 }, 1)
      .to(models.lipstick.position, { x: 0.0, y: 0.2, z: 0.5 }, 1)
      .to(models.lipstick.rotation, { x: 0.4, y: 2.5, z: -0.2 }, 1)
      .to(models.serum.position, { x: 0.0, y: -4, z: 0 }, 1)

      .to(models.lipstick.position, { x: 5, y: 5, z: -2 }, 2)
      .to(models.serum.position, { x: 0.0, y: 0.2, z: 0.5 }, 2)
      .to(models.serum.rotation, { x: 0, y: 6.28, z: 0 }, 2);
  });

  // --- Content Reveal Animations ---
  gsap.utils.toArray('.content').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 60,
      duration: 1.2,
      delay: i * 0.15,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (loaderEl) {
    setTimeout(() => {
      loaderEl.classList.add('hidden');
    }, 400);
  }

  animate();
}

// ===== Render Loop =====
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  if (models.sunglasses) {
    models.sunglasses.rotation.y += 0.002;
    models.sunglasses.position.y += Math.sin(elapsedTime * 1.5) * 0.001;
  }
  if (models.lipstick) {
    models.lipstick.rotation.y += 0.003;
    models.lipstick.position.y += Math.cos(elapsedTime * 1.2) * 0.001;
  }
  if (models.serum) {
    models.serum.rotation.y += 0.002;
    models.serum.position.y += Math.sin(elapsedTime * 1.8) * 0.001;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

setTimeout(() => {
  if (loaderEl && !loaderEl.classList.contains('hidden')) {
    loaderEl.classList.add('hidden');
  }
}, 5000);