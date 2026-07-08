/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'DEFEAT';

export interface Position {
  x: number;
  y: number;
}

export interface Rocket {
  id: string;
  start: Position;
  current: Position;
  target: Position;
  speed: number;
  progress: number;
  color: string;
  explosionRadius?: number;
}

export interface Interceptor {
  id: string;
  start: Position;
  current: Position;
  target: Position;
  speed: number;
  progress: number;
  batteryIndex: number;
}

export interface Explosion {
  id: string;
  position: Position;
  radius: number;
  maxRadius: number;
  duration: number; // in frames or ms
  elapsed: number;
  stage: 'GROWING' | 'SHRINKING' | 'DONE';
  color: string;
}

export interface Battery {
  x: number;
  y: number;
  maxMissiles: number;
  missiles: number;
  isDestroyed: boolean;
}

export interface City {
  id: number;
  x: number;
  y: number;
  isDestroyed: boolean;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

export interface ScoreBoard {
  score: number;
  wave: number;
  highScore: number;
  missilesFired: number;
  rocketsDestroyed: number;
}
