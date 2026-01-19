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

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
    this.physics = new A320Physics();
  }

  async loadModel(url: string = '/models/a320.glb'): Promise<void> {
    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync('', url, '', this.scene);
      this.mesh = result.meshes[0] as BABYLON.Mesh;
      
      this.mesh.position = new BABYLON.Vector3(0, 1, -2000);
      this.mesh.rotation = BABYLON.Vector3.Zero();
      this.mesh.scaling = new BABYLON.Vector3(1, 1, 1);
      
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

  private createProceduralA320(): void {
    const material = new BABYLON.StandardMaterial('a320Material', this.scene);
    material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.95);
    material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    material.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);

    const cockpitMaterial = new BABYLON.StandardMaterial('cockpitMaterial', this.scene);
    cockpitMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
    cockpitMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    const engineMaterial = new BABYLON.StandardMaterial('engineMaterial', this.scene);
    engineMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
    engineMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const tireMaterial = new BABYLON.StandardMaterial('tireMaterial', this.scene);
    tireMaterial.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);

    const root = new BABYLON.Mesh('a320Root', this.scene);

    const fuselage = BABYLON.MeshBuilder.CreateCylinder('fuselage', {
      height: 12.6,
      diameterTop: 1.2,
      diameterBottom: 1.2,
      tessellation: 16,
    }, this.scene);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.scaling = new BABYLON.Vector3(1, 1, 1);
    fuselage.position.z = 0;
    fuselage.material = material;
    fuselage.parent = root;
    this.planeMeshes.push(fuselage);

    const nose = BABYLON.MeshBuilder.CreateSphere('nose', {
      diameter: 1.2,
      segments: 16,
    }, this.scene);
    nose.position.z = 6.5;
    nose.scaling = new BABYLON.Vector3(1, 0.85, 1.5);
    nose.material = material;
    nose.parent = root;
    this.planeMeshes.push(nose);

    const cockpit = BABYLON.MeshBuilder.CreateBox('cockpit', {
      width: 1.0,
      height: 0.6,
      depth: 1.5,
    }, this.scene);
    cockpit.position.z = 5.5;
    cockpit.position.y = 0.35;
    cockpit.material = cockpitMaterial;
    cockpit.parent = root;
    this.planeMeshes.push(cockpit);

    const tailCone = BABYLON.MeshBuilder.CreateCylinder('tailCone', {
      height: 3,
      diameterTop: 0,
      diameterBottom: 1.2,
      tessellation: 16,
    }, this.scene);
    tailCone.rotation.x = Math.PI / 2;
    tailCone.position.z = -7.8;
    tailCone.material = material;
    tailCone.parent = root;
    this.planeMeshes.push(tailCone);

    const verticalStabilizer = BABYLON.MeshBuilder.CreateBox('verticalStab', {
      width: 0.12,
      height: 2.2,
      depth: 2.5,
    }, this.scene);
    verticalStabilizer.position.z = -7.5;
    verticalStabilizer.position.y = 1.5;
    verticalStabilizer.rotation.x = 0.3;
    verticalStabilizer.material = material;
    verticalStabilizer.parent = root;
    this.planeMeshes.push(verticalStabilizer);

    const horizontalStabilizerLeft = BABYLON.MeshBuilder.CreateBox('hStabLeft', {
      width: 3.5,
      height: 0.1,
      depth: 1.2,
    }, this.scene);
    horizontalStabilizerLeft.position.z = -7.3;
    horizontalStabilizerLeft.position.y = 0.2;
    horizontalStabilizerLeft.rotation.z = 0.1;
    horizontalStabilizerLeft.material = material;
    horizontalStabilizerLeft.parent = root;
    this.planeMeshes.push(horizontalStabilizerLeft);

    const horizontalStabilizerRight = BABYLON.MeshBuilder.CreateBox('hStabRight', {
      width: 3.5,
      height: 0.1,
      depth: 1.2,
    }, this.scene);
    horizontalStabilizerRight.position.z = -7.3;
    horizontalStabilizerRight.position.y = 0.2;
    horizontalStabilizerRight.rotation.z = -0.1;
    horizontalStabilizerRight.material = material;
    horizontalStabilizerRight.parent = root;
    this.planeMeshes.push(horizontalStabilizerRight);

    const wingLeft = BABYLON.MeshBuilder.CreateBox('wingLeft', {
      width: 5.5,
      height: 0.15,
      depth: 1.8,
    }, this.scene);
    wingLeft.position.x = -5.8;
    wingLeft.position.z = 0.5;
    wingLeft.rotation.z = 0.15;
    wingLeft.rotation.y = 0.05;
    wingLeft.material = material;
    wingLeft.parent = root;
    this.planeMeshes.push(wingLeft);

    const wingRight = BABYLON.MeshBuilder.CreateBox('wingRight', {
      width: 5.5,
      height: 0.15,
      depth: 1.8,
    }, this.scene);
    wingRight.position.x = 5.8;
    wingRight.position.z = 0.5;
    wingRight.rotation.z = -0.15;
    wingRight.rotation.y = -0.05;
    wingRight.material = material;
    wingRight.parent = root;
    this.planeMeshes.push(wingRight);

    const wingletLeft = BABYLON.MeshBuilder.CreateBox('wingletLeft', {
      width: 0.08,
      height: 1.0,
      depth: 0.6,
    }, this.scene);
    wingletLeft.position.x = -11.2;
    wingletLeft.position.z = 0.5;
    wingletLeft.position.y = 0.7;
    wingletLeft.rotation.z = 0.4;
    wingletLeft.material = material;
    wingletLeft.parent = root;
    this.planeMeshes.push(wingletLeft);

    const wingletRight = BABYLON.MeshBuilder.CreateBox('wingletRight', {
      width: 0.08,
      height: 1.0,
      depth: 0.6,
    }, this.scene);
    wingletRight.position.x = 11.2;
    wingletRight.position.z = 0.5;
    wingletRight.position.y = 0.7;
    wingletRight.rotation.z = -0.4;
    wingletRight.material = material;
    wingletRight.parent = root;
    this.planeMeshes.push(wingletRight);

    const engineLeft = BABYLON.MeshBuilder.CreateCylinder('engineLeft', {
      height: 1.8,
      diameter: 0.55,
      tessellation: 16,
    }, this.scene);
    engineLeft.rotation.x = Math.PI / 2;
    engineLeft.position.x = -2.3;
    engineLeft.position.y = -0.2;
    engineLeft.position.z = 0.8;
    engineLeft.material = engineMaterial;
    engineLeft.parent = root;
    this.planeMeshes.push(engineLeft);

    const engineRight = BABYLON.MeshBuilder.CreateCylinder('engineRight', {
      height: 1.8,
      diameter: 0.55,
      tessellation: 16,
    }, this.scene);
    engineRight.rotation.x = Math.PI / 2;
    engineRight.position.x = 2.3;
    engineRight.position.y = -0.2;
    engineRight.position.z = 0.8;
    engineRight.material = engineMaterial;
    engineRight.parent = root;
    this.planeMeshes.push(engineRight);

    const createWheel = (name: string, x: number, y: number, z: number, scale: number = 1) => {
      const wheel = BABYLON.MeshBuilder.CreateCylinder(name, {
        height: 0.3,
        diameter: 0.7 * scale,
        tessellation: 16,
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

    createWheel('wheelMainLeft', -2.5, -0.7, 0, 0.8);
    createWheel('wheelMainRight', 2.5, -0.7, 0, 0.8);
    createWheel('wheelNose', 0, -0.7, 5.5, 0.5);

    const createWindow = (z: number, y: number, side: number) => {
      const windowMesh = BABYLON.MeshBuilder.CreatePlane('window', {
        width: 0.15,
        height: 0.12,
      }, this.scene);
      windowMesh.position.z = z;
      windowMesh.position.y = y;
      windowMesh.position.x = side * 0.61;
      windowMesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      windowMesh.material = cockpitMaterial;
      windowMesh.parent = root;
      this.planeMeshes.push(windowMesh);
    };

    for (let i = 0; i < 8; i++) {
      createWindow(4.5 - i * 0.4, 0.45, 1);
      createWindow(4.5 - i * 0.4, 0.45, -1);
    }

    root.position = new BABYLON.Vector3(0, 1, -2000);
    this.mesh = root;

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
  }
}

export const createPlane = (scene: BABYLON.Scene): Plane => {
  return new Plane(scene);
};
