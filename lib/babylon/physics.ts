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
  
  private readonly SPAWN_X = 0;
  private readonly SPAWN_Y = 2;
  private readonly SPAWN_Z = -1900;
  private readonly SPAWN_HEADING = 270;
  
  private throttleDecayRate: number = 30;
  
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
    const dt = Math.min(deltaTime / 1000, 0.05);
    
    this.updateThrottleDecay(dt);
    this.updateAerodynamics(dt);
    this.updateEngine(dt);
    this.updateFlightDynamics(dt);
    this.updateGroundInteraction(dt);
    this.updateState();
  }

  private updateThrottleDecay(dt: number): void {
    if (this.input.throttle > 0 && this.input.throttle < 100) {
      this.input.throttle = Math.max(0, this.input.throttle - this.throttleDecayRate * dt);
    }
  }

  private updateAerodynamics(dt: number): void {
    const speed = this.state.speed;
    
    if (speed < 1) {
      return;
    }
    
    const airDensity = 1.225;
    const speedMs = speed / 3.6;
    const speedSq = speedMs * speedMs;
    
    const angleOfAttack = this.state.pitch * Math.PI / 180;
    
    let cl = 0.2 + 2 * Math.PI * angleOfAttack;
    if (this.input.flaps > 0) {
      cl += this.input.flaps * 0.3;
    }
    cl = Math.max(-1.5, Math.min(1.5, cl));
    
    let cd = 0.02;
    if (this.input.flaps > 0) {
      cd += this.input.flaps * 0.04;
    }
    if (this.input.gear) {
      cd += 0.05;
    }
    cd += 0.02 * Math.pow(angleOfAttack, 2);
    cd = Math.max(0.01, cd);
    
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
    
    const headingRad = this.state.heading * Math.PI / 180;
    const engineDirection = new BABYLON.Vector3(
      Math.sin(headingRad),
      0,
      Math.cos(headingRad)
    );
    
    const engineForce = engineDirection.scale(thrust);
    this.state.velocity.addInPlace(engineForce.scale(dt / this.mass));
    
    if (this.input.throttle > 0) {
      this.state.fuel = Math.max(0, this.state.fuel - dt * this.input.throttle * 0.00005);
    }
    
    if (this.input.brake && this.state.speed > 0) {
      const brakeForce = 0.3 * this.state.speed;
      this.state.velocity = this.state.velocity.scale(Math.max(0, 1 - brakeForce * dt / this.mass));
    }
  }

  private updateFlightDynamics(dt: number): void {
    const pitchRate = this.input.elevator * 40 * dt;
    const rollRate = this.input.aileron * 50 * dt;
    const yawRate = this.input.rudder * 20 * dt;
    
    this.state.pitch += pitchRate;
    this.state.roll += rollRate;
    this.state.heading += yawRate;
    
    this.state.pitch = Math.max(-25, Math.min(25, this.state.pitch));
    this.state.roll = Math.max(-40, Math.min(40, this.state.roll));
    this.state.heading = ((this.state.heading + 360) % 360);
    
    const gravityForce = new BABYLON.Vector3(0, -9.81 * this.mass, 0);
    this.state.velocity.addInPlace(gravityForce.scale(dt / this.mass));
  }

  private updateGroundInteraction(dt: number): void {
    if (this.state.position.y <= 0.5) {
      this.state.position.y = 0.5;
      
      if (this.state.velocity.y < 0) {
        this.state.velocity.y = 0;
      }
      
      const groundFriction = 0.02;
      if (!this.input.brake && this.input.throttle < 50) {
        this.state.velocity = this.state.velocity.scale(1 - groundFriction * dt);
      }
      
      if (this.state.roll > 5 || this.state.roll < -5) {
        this.state.roll *= 0.95;
      }
    }
  }

  private updateState(): void {
    this.state.speed = this.state.velocity.length() * 3.6;
    this.state.altitude = Math.max(0, this.state.position.y);
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
