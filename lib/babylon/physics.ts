import * as BABYLON from 'babylonjs';

export interface PlaneInput {
  throttle: number;
  elevator: number;
  rudder: number;
  aileron: number;
  flaps: number;
  gear: boolean;
  brake: boolean;
}

export interface PlaneState {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  velocity: BABYLON.Vector3;
  angularVelocity: BABYLON.Vector3;
  speed: number;
  altitude: number;
  heading: number;
  pitch: number;
  roll: number;
  fuel: number;
  verticalSpeed: number;
}

export class A320Physics {
  private state: PlaneState;
  private input: PlaneInput;
  private mass: number = 78000;
  private wingArea: number = 122.4;
  private maxThrust: number = 120000;
  private momentOfInertia: BABYLON.Vector3 = new BABYLON.Vector3(2000000, 4000000, 5000000);
  private runwayDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
  
  private readonly SPAWN_X = 0;
  private readonly SPAWN_Y = 2;
  private readonly SPAWN_Z = -1900;
  private readonly SPAWN_HEADING = 270;
  
  constructor() {
    this.state = {
      position: new BABYLON.Vector3(this.SPAWN_X, this.SPAWN_Y, this.SPAWN_Z),
      rotation: BABYLON.Vector3.Zero(),
      velocity: BABYLON.Vector3.Zero(),
      angularVelocity: BABYLON.Vector3.Zero(),
      speed: 0,
      altitude: this.SPAWN_Y,
      heading: this.SPAWN_HEADING,
      pitch: 0,
      roll: 0,
      fuel: 100,
      verticalSpeed: 0,
    };
    
    this.input = {
      throttle: 0,
      elevator: 0,
      rudder: 0,
      aileron: 0,
      flaps: 0,
      gear: true,
      brake: false,
    };
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    this.updateAerodynamics(dt);
    this.updateEngine(dt);
    this.updateFlightDynamics(dt);
    this.updatePosition(dt);
    this.updateState();
  }

  private updateAerodynamics(dt: number): void {
    const airDensity = 1.225;
    const speedSq = this.state.speed * this.state.speed / 3.6 / 3.6;
    
    const angleOfAttack = this.state.pitch * Math.PI / 180;
    
    let cl = 0.2 + 2 * Math.PI * angleOfAttack;
    if (this.input.flaps > 0) {
      cl += this.input.flaps * 0.3;
    }
    cl = Math.max(-1.5, Math.min(1.5, cl));
    
    const cd = 0.02 + 0.04 * this.input.flaps + 0.05 * (this.input.gear ? 1 : 0) + 0.02 * Math.pow(angleOfAttack, 2);
    
    const liftForce = 0.5 * airDensity * speedSq * this.wingArea * cl;
    const dragForce = 0.5 * airDensity * speedSq * this.wingArea * cd;
    
    const liftDirection = new BABYLON.Vector3(0, 1, 0);
    const dragDirection = new BABYLON.Vector3(0, 0, -1);
    
    const lift = liftDirection.scale(liftForce);
    const drag = dragDirection.scale(dragForce);
    
    this.state.velocity.addInPlace(lift.scale(dt / this.mass));
    this.state.velocity.addInPlace(drag.scale(dt / this.mass));
  }

  private updateEngine(dt: number): void {
    const thrust = this.maxThrust * (this.input.throttle / 100);
    const engineForce = this.runwayDirection.scale(thrust);
    this.state.velocity.addInPlace(engineForce.scale(dt / this.mass));
    
    if (this.input.throttle > 0) {
      this.state.fuel = Math.max(0, this.state.fuel - dt * this.input.throttle * 0.0001);
    }
    
    if (this.input.brake && this.state.speed > 0) {
      const brakeForce = 0.05 * this.state.speed;
      this.state.velocity = this.state.velocity.scale(Math.max(0, 1 - brakeForce * dt / this.mass));
    }
  }

  private updateFlightDynamics(dt: number): void {
    const pitchRate = this.input.elevator * 30 * dt;
    const rollRate = this.input.aileron * 45 * dt;
    const yawRate = this.input.rudder * 15 * dt;
    
    this.state.pitch += pitchRate;
    this.state.roll += rollRate;
    this.state.heading += yawRate;
    
    this.state.pitch = Math.max(-30, Math.min(30, this.state.pitch));
    this.state.roll = Math.max(-45, Math.min(45, this.state.roll));
    this.state.heading = ((this.state.heading + 360) % 360);
    
    const gravityForce = new BABYLON.Vector3(0, -9.81 * this.mass, 0);
    this.state.velocity.addInPlace(gravityForce.scale(dt / this.mass));
  }

  private updatePosition(dt: number): void {
    this.state.position.addInPlace(this.state.velocity.scale(dt));
    
    if (this.state.position.y < 0) {
      this.state.position.y = 0;
      
      if (this.state.verticalSpeed < -5) {
        this.state.speed *= 0.9;
      }
    }
  }

  private updateState(): void {
    this.state.speed = this.state.velocity.length() * 3.6;
    this.state.altitude = this.state.position.y;
    this.state.rotation.x = this.state.pitch * Math.PI / 180;
    this.state.rotation.y = this.state.heading * Math.PI / 180;
    this.state.rotation.z = this.state.roll * Math.PI / 180;
    this.state.verticalSpeed = this.state.velocity.y;
  }

  setInput(input: Partial<PlaneInput>): void {
    this.input = { ...this.input, ...input };
  }

  getState(): PlaneState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      position: new BABYLON.Vector3(this.SPAWN_X, this.SPAWN_Y, this.SPAWN_Z),
      rotation: BABYLON.Vector3.Zero(),
      velocity: BABYLON.Vector3.Zero(),
      angularVelocity: BABYLON.Vector3.Zero(),
      speed: 0,
      altitude: this.SPAWN_Y,
      heading: this.SPAWN_HEADING,
      pitch: 0,
      roll: 0,
      fuel: 100,
      verticalSpeed: 0,
    };
    this.input = {
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

export const a320Physics = new A320Physics();
