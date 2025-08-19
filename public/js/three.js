import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import TWEEN from "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Points, PointsMaterial, BufferGeometry, Float32BufferAttribute } from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

function Scene3D(path, element) {
    const canvas = document.getElementById(element);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.setClearAlpha(0);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.set(4, 2.5, 5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableRotate = true;

    // Post-processing composer with alpha
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        depthBuffer: true
    });
    const composer = new EffectComposer(renderer, renderTarget);
    composer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);


    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 6);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.005;
    scene.add(keyLight);



    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);
    // Point lights
    [
        { x: 0, y: 300, z: 500 },
        { x: 500, y: 100, z: 0 },
        { x: 0, y: 100, z: -500 },
        { x: -500, y: 300, z: 500 }
    ].forEach(p => {
        const light = new THREE.PointLight(0xffffff, 0.5, 100);
        light.position.set(p.x, p.y, p.z);
        scene.add(light);
    });

    let object;
    const loader = new GLTFLoader();
    loader.load(
        path,
        gltf => {
            object = gltf.scene;
            object.scale.set(1, 1, 1);

            object.traverse(child => { if (child.isMesh) child.castShadow = true; });
            object.traverse(child => {
                if (child.isMesh) {
                    child.material.emissive = new THREE.Color(0xffffff);
                    child.material.emissiveIntensity = 0.5;
                    child.material.color = new THREE.Color(0x0044ff);
                }
            });

            // Center model
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);

            // Sparkles inside model
            const sparkleCount = 500;
            const sparkleGeometry = new BufferGeometry();
            const positions = [];
            for (let i = 0; i < sparkleCount; i++) {
                positions.push((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 10, Math.random() * 0.5 + 0.5);
            }
            sparkleGeometry.setAttribute('position', new Float32BufferAttribute(positions, 4));

            const sparkleMaterial = new PointsMaterial({
                color: 0x002fff,
                size: 0.03,
                transparent: true,
                opacity: 0.9
            });

            const sparkles = new Points(sparkleGeometry, sparkleMaterial);
            object.add(sparkles);

            scene.add(object);
        },
        xhr => console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`),
        error => console.error("Failed to load model:", error)
    );

    let clock = new THREE.Clock();

    function animate(time) {
        requestAnimationFrame(animate);
        TWEEN.update(time);
        controls.update();
if (object) {
    const t = clock.getElapsedTime();
    object.rotation.x = Math.sin(t * 0.3) * 0.05 + (Math.random() - 0.5) * 0.002;
    object.rotation.y = t * 0.15 + (Math.random() - 0.5) * 0.001;
    object.rotation.z = (Math.random() - 0.5) * 0.002;
}
        composer.render(); // render via composer (bloom + transparent)
    }
    animate();
}

window.addEventListener("DOMContentLoaded", () => {
    Scene3D("../model/skelt/scene.gltf", "canvas");
});
