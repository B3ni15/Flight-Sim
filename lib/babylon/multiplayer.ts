import * as BABYLON from 'babylonjs';
import { A320Physics, PlaneInput } from './physics';

export interface MultiplayerPlayer {
  id: string;
  nickname: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  speed?: number;
  color?: string;
  isReady: boolean;
}

export class MultiplayerPlane {
  private mesh: BABYLON.Mesh | null = null;
  private scene: BABYLON.Scene;
  private playerData: MultiplayerPlayer;
  private targetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private targetRotation: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private interpolationSpeed: number = 0.1;

  constructor(scene: BABYLON.Scene, playerData: MultiplayerPlayer) {
    this.scene = scene;
    this.playerData = playerData;
    this.createMesh();
  }

  private createMesh(): void {
    this.mesh = new BABYLON.Mesh(`player_${this.playerData.id}`, this.scene);

    const material = new BABYLON.StandardMaterial(`playerMat_${this.playerData.id}`, this.scene);
    material.diffuseColor = this.hexToColor(this.playerData.color || '#4ECDC4');
    material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    const scale = 0.8;

    const fuselage = BABYLON.MeshBuilder.CreateCylinder('fuselage', {
      height: 12.6 * scale,
      diameterTop: 1.2 * scale,
      diameterBottom: 1.2 * scale,
      tessellation: 12,
    }, this.scene);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.material = material;
    fuselage.parent = this.mesh;

    const nose = BABYLON.MeshBuilder.CreateSphere('nose', {
      diameter: 1.2 * scale,
      segments: 12,
    }, this.scene);
    nose.position.z = 6.5 * scale;
    nose.scaling = new BABYLON.Vector3(1, 0.85, 1.5);
    nose.material = material;
    nose.parent = this.mesh;

    const verticalStab = BABYLON.MeshBuilder.CreateBox('verticalStab', {
      width: 0.12 * scale,
      height: 2.2 * scale,
      depth: 2.5 * scale,
    }, this.scene);
    verticalStab.position.z = -7.5 * scale;
    verticalStab.position.y = 1.5 * scale;
    verticalStab.rotation.x = 0.3;
    verticalStab.material = material;
    verticalStab.parent = this.mesh;

    const wingLeft = BABYLON.MeshBuilder.CreateBox('wingLeft', {
      width: 5.5 * scale,
      height: 0.15 * scale,
      depth: 1.8 * scale,
    }, this.scene);
    wingLeft.position.x = -5.8 * scale;
    wingLeft.position.z = 0.5 * scale;
    wingLeft.rotation.z = 0.15;
    wingLeft.material = material;
    wingLeft.parent = this.mesh;

    const wingRight = BABYLON.MeshBuilder.CreateBox('wingRight', {
      width: 5.5 * scale,
      height: 0.15 * scale,
      depth: 1.8 * scale,
    }, this.scene);
    wingRight.position.x = 5.8 * scale;
    wingRight.position.z = 0.5 * scale;
    wingRight.rotation.z = -0.15;
    wingRight.material = material;
    wingRight.parent = this.mesh;

    const engineLeft = BABYLON.MeshBuilder.CreateCylinder('engineLeft', {
      height: 1.8 * scale,
      diameter: 0.55 * scale,
      tessellation: 12,
    }, this.scene);
    engineLeft.rotation.x = Math.PI / 2;
    engineLeft.position.x = -2.3 * scale;
    engineLeft.position.y = -0.2 * scale;
    engineLeft.position.z = 0.8 * scale;
    engineLeft.material = material;
    engineLeft.parent = this.mesh;

    const engineRight = BABYLON.MeshBuilder.CreateCylinder('engineRight', {
      height: 1.8 * scale,
      diameter: 0.55 * scale,
      tessellation: 12,
    }, this.scene);
    engineRight.rotation.x = Math.PI / 2;
    engineRight.position.x = 2.3 * scale;
    engineRight.position.y = -0.2 * scale;
    engineRight.position.z = 0.8 * scale;
    engineRight.material = material;
    engineRight.parent = this.mesh;

    if (this.playerData.position) {
      this.mesh.position = new BABYLON.Vector3(
        this.playerData.position.x,
        this.playerData.position.y,
        this.playerData.position.z
      );
    }

    if (this.playerData.rotation) {
      this.mesh.rotation = new BABYLON.Vector3(
        this.playerData.rotation.x,
        this.playerData.rotation.y,
        this.playerData.rotation.z
      );
    }

    this.targetPosition = this.mesh.position.clone();
    this.targetRotation = this.mesh.rotation.clone();
  }

  update(data: Partial<MultiplayerPlayer>): void {
    if (!this.mesh) return;

    if (data.position) {
      this.targetPosition = new BABYLON.Vector3(data.position.x, data.position.y, data.position.z);
    }

    if (data.rotation) {
      this.targetRotation = new BABYLON.Vector3(data.rotation.x, data.rotation.y, data.rotation.z);
    }
  }

  interpolate(deltaTime: number): void {
    if (!this.mesh) return;

    const lerpFactor = Math.min(1, this.interpolationSpeed * deltaTime / 16);

    this.mesh.position = BABYLON.Vector3.Lerp(this.mesh.position, this.targetPosition, lerpFactor);
    this.mesh.rotation = BABYLON.Vector3.Lerp(this.mesh.rotation, this.targetRotation, lerpFactor);
  }

  updatePlayerData(data: Partial<MultiplayerPlayer>): void {
    this.playerData = { ...this.playerData, ...data };
  }

  getMesh(): BABYLON.Mesh | null {
    return this.mesh;
  }

  getPlayerData(): MultiplayerPlayer {
    return { ...this.playerData };
  }

  dispose(): void {
    this.mesh?.dispose();
  }

  private hexToColor(hex: string): BABYLON.Color3 {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return new BABYLON.Color3(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      );
    }
    return new BABYLON.Color3(0.3, 0.8, 0.77);
  }
}

export class MultiplayerManager {
  private scene: BABYLON.Scene | null = null;
  private planes: Map<string, MultiplayerPlane> = new Map();
  private localPlayerId: string = '';

  init(scene: BABYLON.Scene, localPlayerId: string): void {
    this.scene = scene;
    this.localPlayerId = localPlayerId;
  }

  addPlayer(playerData: MultiplayerPlayer): void {
    if (!this.scene || playerData.id === this.localPlayerId) return;

    if (this.planes.has(playerData.id)) {
      this.updatePlayer(playerData.id, playerData);
      return;
    }

    const plane = new MultiplayerPlane(this.scene, playerData);
    this.planes.set(playerData.id, plane);
    console.log(`Added player: ${playerData.nickname}`);
  }

  removePlayer(playerId: string): void {
    const plane = this.planes.get(playerId);
    if (plane) {
      plane.dispose();
      this.planes.delete(playerId);
      console.log(`Removed player: ${playerId}`);
    }
  }

  updatePlayer(playerId: string, data: Partial<MultiplayerPlayer>): void {
    const plane = this.planes.get(playerId);
    if (plane) {
      plane.updatePlayerData(data);
      plane.update(data);
    }
  }

  getPlanePosition(playerId: string): BABYLON.Vector3 | null {
    const plane = this.planes.get(playerId);
    return plane?.getMesh()?.position.clone() || null;
  }

  getAllPlayerPositions(): Map<string, { position: BABYLON.Vector3; rotation: BABYLON.Vector3 }> {
    const result = new Map<string, { position: BABYLON.Vector3; rotation: BABYLON.Vector3 }>();
    
    this.planes.forEach((plane, id) => {
      const mesh = plane.getMesh();
      if (mesh) {
        result.set(id, {
          position: mesh.position.clone(),
          rotation: mesh.rotation.clone()
        });
      }
    });
    
    return result;
  }

  update(deltaTime: number): void {
    this.planes.forEach(plane => {
      plane.interpolate(deltaTime);
    });
  }

  clear(): void {
    this.planes.forEach(plane => plane.dispose());
    this.planes.clear();
  }

  getPlaneCount(): number {
    return this.planes.size;
  }
}

export const multiplayerManager = new MultiplayerManager();
