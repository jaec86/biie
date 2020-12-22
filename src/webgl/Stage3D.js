import {
  Clock,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector2,
  WebGLRenderer,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import Human from './Human';
import OutlinePass from './OutlinePass';

export default class Stage3D {
  constructor(container, gltf) {
    this.container = container;
    this.createEngine();
    this.createLights();
    this.initPostProcessing();
    this.human = new Human(gltf);
    this.scene.add(this.human.mesh);
    this.outlinePass.selectedObjects = [this.human.mesh];
    this.floor = new Mesh(
      new PlaneGeometry(1000, 1000, 1, 1),
      new ShadowMaterial({ color: 0x000066 }),
    );
    this.floor.rotateX(-Math.PI / 2);
    this.floor.castShadow = false;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
    this.clock = new Clock();
    this.camera.position.x = 0;
    this.camera.position.y = 2;
    this.camera.position.z = 20;
    this.camera.lookAt(
      this.human.mesh.position.x,
      this.human.mesh.position.y,
      this.human.mesh.position.z,
    );
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.scene.rotation.y = 1;
    this.scene.position.setY(-2);
    this.handleWindowResize();
    this.loop();
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.outlinePass = new OutlinePass(
      new Vector2(window.innerWidth * 0.96, window.innerHeight * 0.96),
      this.scene,
      this.camera,
    );
    this.outlinePass.selectedObjects = [this.scene];
    this.composer.addPass(this.outlinePass);
  }

  loop = () => {
    window.requestAnimationFrame(this.loop);
    this.render();
    this.controls.update();
  };

  render() {
    const delta = Math.max(0, Math.min(1, this.clock.getDelta()));
    this.human.update(delta, this.clock.elapsedTime);
    this.composer.render();
  }

  createEngine() {
    this.scene = new Scene();
    const aspectRatio = this.stageWidth / this.stageHeight;
    const fieldOfView = 40;
    const nearPlane = 1;
    const farPlane = 1500;
    this.camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.handleWindowResize, false);
  }

  handleWindowResize = () => {
    const width = window.innerWidth * 0.96;
    const height = window.innerHeight * 0.96;
    this.stageWidth = width;
    this.stageHeight = height;
    this.renderer.setSize(this.stageWidth, this.stageHeight);
    this.camera.aspect = this.stageWidth / this.stageHeight;
    this.camera.updateProjectionMatrix();
    this.composer.setSize(this.stageWidth, this.stageHeight);
  };

  createLights() {
    this.shadowLight = new DirectionalLight(0xffffff, 1);
    this.shadowLight.position.set(15, 15, 10);
    this.shadowLight.lookAt(0, 0, 0);
    this.shadowLight.castShadow = true;
    this.shadowLight.shadow.camera.left = -20;
    this.shadowLight.shadow.camera.right = 20;
    this.shadowLight.shadow.camera.top = 20;
    this.shadowLight.shadow.camera.bottom = -20;
    this.shadowLight.shadow.camera.near = 1;
    this.shadowLight.shadow.camera.far = 100;
    this.shadowLight.shadow.mapSize.width = 512;
    this.shadowLight.shadow.mapSize.height = 512;
    this.scene.add(this.shadowLight);
  }
}
