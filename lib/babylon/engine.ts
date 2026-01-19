import * as BABYLON from 'babylonjs';
import '@babylonjs/loaders';

export class BabylonEngine {
  private engine: BABYLON.Engine | null = null;
  private scene: BABYLON.Scene | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private camera: BABYLON.FollowCamera | null = null;
  private targetMesh: BABYLON.Mesh | null = null;

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
    this.setupFog();

    return this.scene;
  }

  private setupCamera(): void {
    if (!this.scene || !this.canvas) return;

    const camera = new BABYLON.FollowCamera('followCamera', new BABYLON.Vector3(0, 10, -50), this.scene);
    camera.radius = 60;
    camera.heightOffset = 20;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.03;
    camera.maxCameraSpeed = 20;
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 150;
    
    this.camera = camera;
    this.scene.activeCamera = camera;
  }

  setFollowTarget(mesh: BABYLON.Mesh | null): void {
    this.targetMesh = mesh;
    if (this.camera && mesh) {
      this.camera.lockedTarget = mesh;
    }
  }

  updateCameraTarget(position: BABYLON.Vector3): void {
    if (this.camera && !this.targetMesh) {
      this.camera.setTarget(position);
    }
  }

  private setupLights(): void {
    if (!this.scene) return;

    const hemisphericLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    hemisphericLight.intensity = 0.7;
    hemisphericLight.diffuse = new BABYLON.Color3(1, 0.98, 0.95);
    hemisphericLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.4);

    const directionalLight = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    directionalLight.position = new BABYLON.Vector3(200, 400, 200);
    directionalLight.intensity = 0.9;
    directionalLight.diffuse = new BABYLON.Color3(1, 0.98, 0.9);
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

  private setupFog(): void {
    if (!this.scene) return;
    
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.0001;
    this.scene.fogColor = new BABYLON.Color3(0.7, 0.8, 0.9);
  }

  private setupGround(): void {
    if (!this.scene) return;

    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 20000, height: 20000 },
      this.scene
    );
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.35, 0.55, 0.25);
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
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

  getCamera(): BABYLON.FollowCamera | null {
    return this.camera;
  }

  dispose(): void {
    this.scene?.dispose();
    this.engine?.dispose();
  }
}

export const babylonEngine = new BabylonEngine();
