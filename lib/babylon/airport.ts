import * as BABYLON from 'babylonjs';

export class Airport {
  private scene: BABYLON.Scene;
  private runway: BABYLON.Mesh | null = null;
  private taxiways: BABYLON.Mesh[] = [];
  private lights: BABYLON.Mesh[] = [];
  private signs: BABYLON.Mesh[] = [];

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  build(): void {
    this.buildRunway();
    this.buildTaxiways();
    this.buildApron();
    this.buildLights();
    this.buildSigns();
    this.buildTerminal();
    this.buildControlTower();
  }

  private buildRunway(): void {
    const runwayLength = 4000;
    const runwayWidth = 60;

    const asphaltMaterial = new BABYLON.StandardMaterial('asphalt', this.scene);
    asphaltMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.28);
    asphaltMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const runway = BABYLON.MeshBuilder.CreateBox('runway', {
      width: runwayWidth,
      height: 0.3,
      depth: runwayLength,
    }, this.scene);
    runway.position = new BABYLON.Vector3(0, 0.15, 0);
    runway.material = asphaltMaterial;
    runway.receiveShadows = true;
    this.runway = runway;

    const thresholdMaterial = new BABYLON.StandardMaterial('threshold', this.scene);
    thresholdMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    thresholdMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    const centerlineMaterial = new BABYLON.StandardMaterial('centerline', this.scene);
    centerlineMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    centerlineMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    for (let i = -runwayLength / 2 + 30; i < runwayLength / 2 - 30; i += 60) {
      const marking = BABYLON.MeshBuilder.CreateBox('centerline', {
        width: 2,
        height: 0.32,
        depth: 30,
      }, this.scene);
      marking.position = new BABYLON.Vector3(0, 0.16, i);
      marking.material = centerlineMaterial;
      marking.parent = runway;
    }

    const thresholdStripes = 8;
    for (let i = 0; i < thresholdStripes; i++) {
      const stripe = BABYLON.MeshBuilder.CreateBox('threshold', {
        width: 3 + i * 2,
        height: 0.32,
        depth: 3,
      }, this.scene);
      stripe.position = new BABYLON.Vector3(0, 0.16, -runwayLength / 2 + 20 + i * 5);
      stripe.material = thresholdMaterial;
      stripe.parent = runway;

      const stripe2 = BABYLON.MeshBuilder.CreateBox('threshold2', {
        width: 3 + i * 2,
        height: 0.32,
        depth: 3,
      }, this.scene);
      stripe2.position = new BABYLON.Vector3(0, 0.16, runwayLength / 2 - 20 - i * 5);
      stripe2.material = thresholdMaterial;
      stripe2.parent = runway;
    }
  }

  private buildTaxiways(): void {
    const taxiwayMaterial = new BABYLON.StandardMaterial('taxiway', this.scene);
    taxiwayMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.33);

    const taxiwayCenterMaterial = new BABYLON.StandardMaterial('taxiwayCenter', this.scene);
    taxiwayCenterMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);

    const taxiwayAlpha = BABYLON.MeshBuilder.CreateBox('taxiwayAlpha', {
      width: 25,
      height: 0.2,
      depth: 500,
    }, this.scene);
    taxiwayAlpha.position = new BABYLON.Vector3(-50, 0.1, 600);
    taxiwayAlpha.material = taxiwayMaterial;
    this.taxiways.push(taxiwayAlpha);

    const taxiwayBravo = BABYLON.MeshBuilder.CreateBox('taxiwayBravo', {
      width: 25,
      height: 0.2,
      depth: 800,
    }, this.scene);
    taxiwayBravo.position = new BABYLON.Vector3(50, 0.1, 500);
    taxiwayBravo.material = taxiwayMaterial;
    this.taxiways.push(taxiwayBravo);

    for (let i = 0; i < 10; i++) {
      const centerLine = BABYLON.MeshBuilder.CreateBox('txLine', {
        width: 1.5,
        height: 0.22,
        depth: 30,
      }, this.scene);
      centerLine.position = new BABYLON.Vector3(-50, 0.11, 350 + i * 50);
      centerLine.material = taxiwayCenterMaterial;
      this.taxiways.push(centerLine);

      const centerLine2 = BABYLON.MeshBuilder.CreateBox('txLine2', {
        width: 1.5,
        height: 0.22,
        depth: 30,
      }, this.scene);
      centerLine2.position = new BABYLON.Vector3(50, 0.11, 350 + i * 50);
      centerLine2.material = taxiwayCenterMaterial;
      this.taxiways.push(centerLine2);
    }
  }

  private buildApron(): void {
    const apronMaterial = new BABYLON.StandardMaterial('apron', this.scene);
    apronMaterial.diffuseColor = new BABYLON.Color3(0.35, 0.35, 0.38);

    const apron = BABYLON.MeshBuilder.CreateBox('apron', {
      width: 300,
      height: 0.2,
      depth: 200,
    }, this.scene);
    apron.position = new BABYLON.Vector3(0, 0.1, 900);
    apron.material = apronMaterial;
    this.taxiways.push(apron);

    for (let x = -100; x <= 100; x += 50) {
      for (let z = 800; z <= 1000; z += 50) {
        const parkingSpot = BABYLON.MeshBuilder.CreateBox('parking', {
          width: 40,
          height: 0.22,
          depth: 30,
        }, this.scene);
        parkingSpot.position = new BABYLON.Vector3(x, 0.11, z);
        const parkingMat = new BABYLON.StandardMaterial('parkingMat', this.scene);
        parkingMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        parkingSpot.material = parkingMat;
        this.taxiways.push(parkingSpot);
      }
    }
  }

  private buildLights(): void {
    const lightMaterial = new BABYLON.StandardMaterial('lightMat', this.scene);
    lightMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.9, 1);
    lightMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    for (let z = -1800; z <= 1800; z += 200) {
      const lightL = BABYLON.MeshBuilder.CreateSphere('edgeLight', {
        diameter: 0.4,
        segments: 8,
      }, this.scene);
      lightL.position = new BABYLON.Vector3(-32, 0.2, z);
      lightL.material = lightMaterial;
      this.lights.push(lightL);

      const lightR = BABYLON.MeshBuilder.CreateSphere('edgeLight', {
        diameter: 0.4,
        segments: 8,
      }, this.scene);
      lightR.position = new BABYLON.Vector3(32, 0.2, z);
      lightR.material = lightMaterial;
      this.lights.push(lightR);

      if (z % 400 === 0) {
        const thresholdLight = BABYLON.MeshBuilder.CreateSphere('threshLight', {
          diameter: 0.5,
          segments: 8,
        }, this.scene);
        thresholdLight.position = new BABYLON.Vector3(0, 0.2, z);
        const threshMat = new BABYLON.StandardMaterial('threshMat', this.scene);
        threshMat.emissiveColor = new BABYLON.Color3(1, 0.3, 0.3);
        thresholdLight.material = threshMat;
        this.lights.push(thresholdLight);
      }
    }

    const approachLightMaterial = new BABYLON.StandardMaterial('approachLight', this.scene);
    approachLightMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.8);

    for (let z = -2000; z > -3000; z -= 50) {
      const approachLight = BABYLON.MeshBuilder.CreateBox('approach', {
        width: 10,
        height: 0.3,
        depth: 2,
      }, this.scene);
      approachLight.position = new BABYLON.Vector3(0, 0.1, z);
      approachLight.material = approachLightMaterial;
      this.lights.push(approachLight);
    }
  }

  private buildSigns(): void {
    const signMaterial = new BABYLON.StandardMaterial('signMat', this.scene);
    signMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    signMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);

    const signTextMaterial = new BABYLON.StandardMaterial('signText', this.scene);
    signTextMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
    signTextMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);

    const taxiwaySigns = ['A', 'B', 'C', 'D'];
    const positions = [
      { x: -40, z: 400, rot: Math.PI / 2 },
      { x: 40, z: 400, rot: -Math.PI / 2 },
      { x: -40, z: 600, rot: Math.PI / 2 },
      { x: 40, z: 600, rot: -Math.PI / 2 },
    ];

    for (let i = 0; i < taxiwaySigns.length; i++) {
      const signPost = BABYLON.MeshBuilder.CreateBox('sign' + taxiwaySigns[i], {
        width: 0.1,
        height: 3,
        depth: 1.5,
      }, this.scene);
      signPost.position = new BABYLON.Vector3(positions[i].x, 1.5, positions[i].z);
      signPost.rotation.y = positions[i].rot;
      signPost.material = signMaterial;
      this.signs.push(signPost);
    }

    const runwayNumber = BABYLON.MeshBuilder.CreateBox('runwayNumber', {
      width: 0.1,
      height: 8,
      depth: 12,
    }, this.scene);
    runwayNumber.position = new BABYLON.Vector3(0, 0.1, -1900);
    const runwayMat = new BABYLON.StandardMaterial('runwayMat', this.scene);
    runwayMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    runwayNumber.material = runwayMat;
    this.signs.push(runwayNumber);

    const runwayNumber2 = BABYLON.MeshBuilder.CreateBox('runwayNumber2', {
      width: 0.1,
      height: 8,
      depth: 12,
    }, this.scene);
    runwayNumber2.position = new BABYLON.Vector3(0, 0.1, 1900);
    runwayNumber2.material = runwayMat;
    this.signs.push(runwayNumber2);
  }

  private buildTerminal(): void {
    const terminalMaterial = new BABYLON.StandardMaterial('terminal', this.scene);
    terminalMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
    terminalMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    const glassMaterial = new BABYLON.StandardMaterial('glass', this.scene);
    glassMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.8);
    glassMaterial.alpha = 0.5;
    glassMaterial.specularColor = new BABYLON.Color3(1, 1, 1);

    for (let i = 0; i < 5; i++) {
      const terminal = BABYLON.MeshBuilder.CreateBox('terminal' + i, {
        width: 40,
        height: 8,
        depth: 20,
      }, this.scene);
      terminal.position = new BABYLON.Vector3(-200 + i * 45, 4, 1100);
      terminal.material = terminalMaterial;
      this.signs.push(terminal);

      const windows = BABYLON.MeshBuilder.CreateBox('windows' + i, {
        width: 35,
        height: 4,
        depth: 0.5,
      }, this.scene);
      windows.position = new BABYLON.Vector3(-200 + i * 45, 5, 1110);
      windows.material = glassMaterial;
      this.signs.push(windows);
    }

    const controlTower = BABYLON.MeshBuilder.CreateCylinder('tower', {
      height: 30,
      diameter: 6,
      tessellation: 8,
    }, this.scene);
    controlTower.position = new BABYLON.Vector3(100, 15, 1050);
    const towerMat = new BABYLON.StandardMaterial('towerMat', this.scene);
    towerMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    controlTower.material = towerMat;
    this.signs.push(controlTower);

    const towerTop = BABYLON.MeshBuilder.CreateBox('towerTop', {
      width: 8,
      height: 6,
      depth: 8,
    }, this.scene);
    towerTop.position = new BABYLON.Vector3(100, 33, 1050);
    towerTop.material = glassMaterial;
    this.signs.push(towerTop);
  }

  private buildControlTower(): void {
    const towerBaseMaterial = new BABYLON.StandardMaterial('towerBase', this.scene);
    towerBaseMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);

    const tower = BABYLON.MeshBuilder.CreateCylinder('controlTower', {
      height: 40,
      diameter: 8,
      tessellation: 8,
    }, this.scene);
    tower.position = new BABYLON.Vector3(120, 20, 1150);
    tower.material = towerBaseMaterial;

    const towerCab = BABYLON.MeshBuilder.CreateBox('towerCab', {
      width: 12,
      height: 8,
      depth: 12,
    }, this.scene);
    towerCab.position = new BABYLON.Vector3(120, 44, 1150);
    const cabMat = new BABYLON.StandardMaterial('cabMat', this.scene);
    cabMat.diffuseColor = new BABYLON.Color3(0.5, 0.6, 0.7);
    cabMat.alpha = 0.6;
    towerCab.material = cabMat;
  }

  getRunway(): BABYLON.Mesh | null {
    return this.runway;
  }

  dispose(): void {
    this.runway?.dispose();
    this.taxiways.forEach(m => m.dispose());
    this.lights.forEach(m => m.dispose());
    this.signs.forEach(m => m.dispose());
  }
}

export const createAirport = (scene: BABYLON.Scene): Airport => {
  const airport = new Airport(scene);
  airport.build();
  return airport;
};
