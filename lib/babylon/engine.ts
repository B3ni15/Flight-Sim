import * as BABYLON from 'babylonjs';
import '@babylonjs/loaders';

export class BabylonEngine {
  private engine: BABYLON.Engine | null = null;
  private scene: BABYLON.Scene | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private camera: BABYLON.ArcRotateCamera | null = null;

  init(canvas: HTMLCanvasElement): BABYLON.Engine {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    return this.engine;
  }

  createScene(): BABYLON.Scene {
    if (!this.engine) throw new Error('Engine not initialized');

    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1);
    this.scene.ambientColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    this.scene.collisionsEnabled = true;

    this.setupCamera();
    this.setupLights();
    this.setupSkybox();
    this.setupGround();

    return this.scene;
  }

  private setupCamera(): void {
    if (!this.scene || !this.canvas) return;

    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 3,
      50,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 200;
    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
    
    this.scene.activeCamera = this.camera;
  }

  setupFollowTarget(mesh: BABYLON.Mesh): void {
    if (this.camera) {
      this.camera.setTarget(mesh.position);
    }
  }

  private setupLights(): void {
    if (!this.scene) return;

    const hemisphericLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    hemisphericLight.intensity = 0.6;
    hemisphericLight.diffuse = new BABYLON.Color3(1, 0.95, 0.9);
    hemisphericLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);

    const directionalLight = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    directionalLight.position = new BABYLON.Vector3(100, 200, 100);
    directionalLight.intensity = 0.8;
    directionalLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

    const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
  }

  private setupSkybox(): void {
    if (!this.scene) return;

    const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 10000 }, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBoxMaterial', this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.emissiveColor = new BABYLON.Color3(0.53, 0.81, 0.92);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
  }

  private setupGround(): void {
    if (!this.scene) return;

    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 10000, height: 10000 },
      this.scene
    );
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    ground.checkCollisions = true;
  }

  getScene(): BABYLON.Scene | null {
    return this.scene;
  }

  getEngine(): BABYLON.Engine | null {
    return this.engine;
  }

  dispose(): void {
    this.scene?.dispose();
    this.engine?.dispose();
  }
}

export const babylonEngine = new BabylonEngine();
