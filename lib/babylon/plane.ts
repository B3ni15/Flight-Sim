import * as BABYLON from 'babylonjs';
import { A320Physics, PlaneInput } from './physics';

export class Plane {
  private mesh: BABYLON.Mesh | null = null;
  private physics: A320Physics;
  private scene: BABYLON.Scene;
  private inputs: PlaneInput = {
    throttle: 0,
    elevator: 0,
    rudder: 0,
    aileron: 0,
    flaps: 0,
    gear: true,
    brake: false,
  };
  private planeMeshes: BABYLON.Mesh[] = [];

  private readonly SPAWN_X = 0;
  private readonly SPAWN_Y = 2;
  private readonly SPAWN_Z = -1900;
  private readonly SPAWN_HEADING = 270;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
    this.physics = new A320Physics();
  }

  async loadModel(url: string = '/models/a320.glb'): Promise<void> {
    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync('', url, '', this.scene);
      this.mesh = result.meshes[0] as BABYLON.Mesh;
      
      this.setPosition(this.mesh);
      
      if (result.meshes.length > 1) {
        for (let i = 1; i < result.meshes.length; i++) {
          result.meshes[i].parent = this.mesh;
        }
      }
      
      this.mesh.checkCollisions = true;
      this.mesh.isPickable = true;
    } catch (error) {
      console.log('Creating procedural A320 model...');
      this.createProceduralA320();
    }
  }

  private setPosition(mesh: BABYLON.Mesh): void {
    mesh.position = new BABYLON.Vector3(this.SPAWN_X, this.SPAWN_Y, this.SPAWN_Z);
    mesh.rotation = new BABYLON.Vector3(0, (this.SPAWN_HEADING - 270) * Math.PI / 180, 0);
    mesh.scaling = new BABYLON.Vector3(1, 1, 1);
  }

  private createProceduralA320(): void {
    const material = new BABYLON.StandardMaterial('a320Material', this.scene);
    material.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.9);
    material.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    material.specularPower = 32;

    const cockpitMaterial = new BABYLON.StandardMaterial('cockpitMaterial', this.scene);
    cockpitMaterial.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.2);
    cockpitMaterial.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);

    const engineMaterial = new BABYLON.StandardMaterial('engineMaterial', this.scene);
    engineMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.3);
    engineMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    const tireMaterial = new BABYLON.StandardMaterial('tireMaterial', this.scene);
    tireMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const root = new BABYLON.Mesh('a320Root', this.scene);
    this.setPosition(root);
    this.mesh = root;

    const fuselage = BABYLON.MeshBuilder.CreateCylinder('fuselage', {
      height: 12.6,
      diameterTop: 1.3,
      diameterBottom: 1.3,
      tessellation: 24,
    }, this.scene);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.position.z = 0;
    fuselage.material = material;
    fuselage.parent = root;
    this.planeMeshes.push(fuselage);

    const nose = BABYLON.MeshBuilder.CreateSphere('nose', {
      diameter: 1.3,
      segments: 24,
    }, this.scene);
    nose.position.z = 6.8;
    nose.scaling = new BABYLON.Vector3(1, 0.9, 1.6);
    nose.material = material;
    nose.parent = root;
    this.planeMeshes.push(nose);

    const cockpit = BABYLON.MeshBuilder.CreateBox('cockpit', {
      width: 1.1,
      height: 0.5,
      depth: 1.8,
    }, this.scene);
    cockpit.position.z = 5.5;
    cockpit.position.y = 0.4;
    cockpit.material = cockpitMaterial;
    cockpit.parent = root;
    this.planeMeshes.push(cockpit);

    const tailCone = BABYLON.MeshBuilder.CreateCylinder('tailCone', {
      height: 4,
      diameterTop: 0,
      diameterBottom: 1.3,
      tessellation: 24,
    }, this.scene);
    tailCone.rotation.x = Math.PI / 2;
    tailCone.position.z = -8.3;
    tailCone.material = material;
    tailCone.parent = root;
    this.planeMeshes.push(tailCone);

    const verticalStab = BABYLON.MeshBuilder.CreateBox('verticalStab', {
      width: 0.15,
      height: 2.5,
      depth: 2.8,
    }, this.scene);
    verticalStab.position.z = -7.8;
    verticalStab.position.y = 1.8;
    verticalStab.rotation.x = 0.35;
    verticalStab.material = material;
    verticalStab.parent = root;
    this.planeMeshes.push(verticalStab);

    const horizontalStabilizerLeft = BABYLON.MeshBuilder.CreateBox('hStabLeft', {
      width: 4,
      height: 0.12,
      depth: 1.5,
    }, this.scene);
    horizontalStabilizerLeft.position.z = -7.5;
    horizontalStabilizerLeft.position.y = 0.3;
    horizontalStabilizerLeft.rotation.z = 0.12;
    horizontalStabilizerLeft.material = material;
    horizontalStabilizerLeft.parent = root;
    this.planeMeshes.push(horizontalStabilizerLeft);

    const horizontalStabilizerRight = BABYLON.MeshBuilder.CreateBox('hStabRight', {
      width: 4,
      height: 0.12,
      depth: 1.5,
    }, this.scene);
    horizontalStabilizerRight.position.z = -7.5;
    horizontalStabilizerRight.position.y = 0.3;
    horizontalStabilizerRight.rotation.z = -0.12;
    horizontalStabilizerRight.material = material;
    horizontalStabilizerRight.parent = root;
    this.planeMeshes.push(horizontalStabilizerRight);

    const wingLeft = BABYLON.MeshBuilder.CreateBox('wingLeft', {
      width: 6.5,
      height: 0.18,
      depth: 2.2,
    }, this.scene);
    wingLeft.position.x = -7;
    wingLeft.position.z = 0.8;
    wingLeft.rotation.z = 0.18;
    wingLeft.rotation.y = 0.08;
    wingLeft.material = material;
    wingLeft.parent = root;
    this.planeMeshes.push(wingLeft);

    const wingRight = BABYLON.MeshBuilder.CreateBox('wingRight', {
      width: 6.5,
      height: 0.18,
      depth: 2.2,
    }, this.scene);
    wingRight.position.x = 7;
    wingRight.position.z = 0.8;
    wingRight.rotation.z = -0.18;
    wingRight.rotation.y = -0.08;
    wingRight.material = material;
    wingRight.parent = root;
    this.planeMeshes.push(wingRight);

    const wingletLeft = BABYLON.MeshBuilder.CreateBox('wingletLeft', {
      width: 0.1,
      height: 1.3,
      depth: 0.8,
    }, this.scene);
    wingletLeft.position.x = -13.4;
    wingletLeft.position.z = 0.8;
    wingletLeft.position.y = 0.9;
    wingletLeft.rotation.z = 0.5;
    wingletLeft.material = material;
    wingletLeft.parent = root;
    this.planeMeshes.push(wingletLeft);

    const wingletRight = BABYLON.MeshBuilder.CreateBox('wingletRight', {
      width: 0.1,
      height: 1.3,
      depth: 0.8,
    }, this.scene);
    wingletRight.position.x = 13.4;
    wingletRight.position.z = 0.8;
    wingletRight.position.y = 0.9;
    wingletRight.rotation.z = -0.5;
    wingletRight.material = material;
    wingletRight.parent = root;
    this.planeMeshes.push(wingletRight);

    const engineLeft = BABYLON.MeshBuilder.CreateCylinder('engineLeft', {
      height: 2.2,
      diameter: 0.65,
      tessellation: 24,
    }, this.scene);
    engineLeft.rotation.x = Math.PI / 2;
    engineLeft.position.x = -2.8;
    engineLeft.position.y = -0.1;
    engineLeft.position.z = 1;
    engineLeft.material = engineMaterial;
    engineLeft.parent = root;
    this.planeMeshes.push(engineLeft);

    const engineRight = BABYLON.MeshBuilder.CreateCylinder('engineRight', {
      height: 2.2,
      diameter: 0.65,
      tessellation: 24,
    }, this.scene);
    engineRight.rotation.x = Math.PI / 2;
    engineRight.position.x = 2.8;
    engineRight.position.y = -0.1;
    engineRight.position.z = 1;
    engineRight.material = engineMaterial;
    engineRight.parent = root;
    this.planeMeshes.push(engineRight);

    const createWheel = (name: string, x: number, y: number, z: number, scale: number = 1) => {
      const wheel = BABYLON.MeshBuilder.CreateCylinder(name, {
        height: 0.35,
        diameter: 0.8 * scale,
        tessellation: 24,
      }, this.scene);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.x = x;
      wheel.position.y = y;
      wheel.position.z = z;
      wheel.material = tireMaterial;
      wheel.parent = root;
      this.planeMeshes.push(wheel);
      return wheel;
    };

    createWheel('wheelMainLeft', -2.8, -0.7, 0, 0.9);
    createWheel('wheelMainRight', 2.8, -0.7, 0, 0.9);
    createWheel('wheelNose', 0, -0.7, 5.8, 0.55);

    const createWindow = (z: number, y: number, side: number) => {
      const windowMesh = BABYLON.MeshBuilder.CreatePlane('window', {
        width: 0.18,
        height: 0.14,
      }, this.scene);
      windowMesh.position.z = z;
      windowMesh.position.y = y;
      windowMesh.position.x = side * 0.66;
      windowMesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      windowMesh.material = cockpitMaterial;
      windowMesh.parent = root;
      this.planeMeshes.push(windowMesh);
    };

    for (let i = 0; i < 10; i++) {
      createWindow(4.2 - i * 0.45, 0.5, 1);
      createWindow(4.2 - i * 0.45, 0.5, -1);
    }

    for (const mesh of this.planeMeshes) {
      mesh.checkCollisions = true;
      mesh.isPickable = true;
    }
  }

  update(deltaTime: number): void {
    this.physics.setInput(this.inputs);
    this.physics.update(deltaTime);
    
    const state = this.physics.getState();
    
    if (this.mesh) {
      this.mesh.position = state.position.clone();
      this.mesh.rotation = state.rotation.clone();
    }
  }

  setInput(input: Partial<PlaneInput>): void {
    this.inputs = { ...this.inputs, ...input };
  }

  getState() {
    return this.physics.getState();
  }

  getMesh(): BABYLON.Mesh | null {
    return this.mesh;
  }

  reset(): void {
    this.physics.reset();
    this.inputs = {
      throttle: 0,
      elevator: 0,
      rudder: 0,
      aileron: 0,
      flaps: 0,
      gear: true,
      brake: false,
    };
    
    if (this.mesh) {
      this.setPosition(this.mesh);
    }
  }
}

export const createPlane = (scene: BABYLON.Scene): Plane => {
  return new Plane(scene);
};
