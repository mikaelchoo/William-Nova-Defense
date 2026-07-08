/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Rocket, Interceptor, Explosion, Battery, City, Particle, ScoreBoard } from '../types';
import { sound } from '../sound';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  scoreBoard: ScoreBoard;
  setScoreBoard: React.Dispatch<React.SetStateAction<ScoreBoard>>;
  setCitiesCount: (count: number) => void;
  isSoundEnabled: boolean;
  onWaveClearTrigger: (missilesLeft: { left: number; mid: number; right: number }, bonusPoints: number) => void;
  lang: 'zh' | 'en';
}

const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  scoreBoard,
  setScoreBoard,
  setCitiesCount,
  isSoundEnabled,
  onWaveClearTrigger,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core Game Entity Refs to avoid stale React state in the 60fps animation loop
  const rocketsRef = useRef<Rocket[]>([]);
  const interceptorsRef = useRef<Interceptor[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  // Game Setup Refs
  const batteriesRef = useRef<Battery[]>([
    { x: 70, y: 550, maxMissiles: 20, missiles: 20, isDestroyed: false },
    { x: 400, y: 550, maxMissiles: 40, missiles: 40, isDestroyed: false },
    { x: 730, y: 550, maxMissiles: 20, missiles: 20, isDestroyed: false },
  ]);

  const citiesRef = useRef<City[]>([
    { id: 1, x: 140, y: 565, width: 30, height: 18, isDestroyed: false },
    { id: 2, x: 200, y: 565, width: 28, height: 22, isDestroyed: false },
    { id: 3, x: 260, y: 565, width: 34, height: 16, isDestroyed: false },
    { id: 4, x: 500, y: 565, width: 32, height: 20, isDestroyed: false },
    { id: 5, x: 560, y: 565, width: 30, height: 24, isDestroyed: false },
    { id: 6, x: 620, y: 565, width: 34, height: 15, isDestroyed: false },
  ]);

  // Wave / Spawning Tracking Refs
  const totalRocketsInWaveRef = useRef<number>(10);
  const spawnedRocketsCountRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const spawnIntervalRef = useRef<number>(2000); // ms
  const levelRef = useRef<number>(1);

  // Performance & Feedback Refs
  const shakeIntensityRef = useRef<number>(0);
  const waveActiveRef = useRef<boolean>(false);
  const nextWaveTriggeredRef = useRef<boolean>(false);

  // Track firing tower status to report to React UI
  const [batteryState, setBatteryState] = useState({
    left: 20,
    mid: 40,
    right: 20,
    leftDestroyed: false,
    midDestroyed: false,
    rightDestroyed: false,
  });

  // Synced high score tracking
  const updateScoreAndStats = useCallback((points: number, destroyedRocket = false, firedInterceptor = false) => {
    setScoreBoard((prev) => {
      const nextScore = Math.max(0, prev.score + points);
      const nextHighScore = Math.max(prev.highScore, nextScore);
      const nextRockets = prev.rocketsDestroyed + (destroyedRocket ? 1 : 0);
      const nextFired = prev.missilesFired + (firedInterceptor ? 1 : 0);

      // Save to LocalStorage immediately
      localStorage.setItem('tina_defense_score', String(nextScore));
      localStorage.setItem('tina_defense_wave', String(prev.wave));
      localStorage.setItem('tina_defense_highscore', String(nextHighScore));

      return {
        ...prev,
        score: nextScore,
        highScore: nextHighScore,
        rocketsDestroyed: nextRockets,
        missilesFired: nextFired,
      };
    });
  }, [setScoreBoard]);

  // Update sound settings dynamically
  useEffect(() => {
    sound.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  // Sync state into refs when gameState shifts (like a user-triggered Restart)
  useEffect(() => {
    if (gameState === 'START') {
      // Clean slate on menu
      rocketsRef.current = [];
      interceptorsRef.current = [];
      explosionsRef.current = [];
      particlesRef.current = [];
      spawnedRocketsCountRef.current = 0;
      waveActiveRef.current = false;
      nextWaveTriggeredRef.current = false;

      // Restore fully
      batteriesRef.current.forEach((b) => {
        b.missiles = b.maxMissiles;
        b.isDestroyed = false;
      });
      citiesRef.current.forEach((c) => {
        c.isDestroyed = false;
      });

      setCitiesCount(6);
      syncBatteryUI();
    }
  }, [gameState, setCitiesCount]);

  // Helper to trigger particles
  const spawnExplosionParticles = (x: number, y: number, color: string, count = 25, sizeMultiplier = 1) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: (1 + Math.random() * 3) * sizeMultiplier,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02,
      });
    }
  };

  // Helper to sync battery UI
  const syncBatteryUI = () => {
    setBatteryState({
      left: batteriesRef.current[0].missiles,
      mid: batteriesRef.current[1].missiles,
      right: batteriesRef.current[2].missiles,
      leftDestroyed: batteriesRef.current[0].isDestroyed,
      midDestroyed: batteriesRef.current[1].isDestroyed,
      rightDestroyed: batteriesRef.current[2].isDestroyed,
    });
  };

  // Handle canvas touch or mouse clicks
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    if (gameState !== 'PLAYING' || waveActiveRef.current === false) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;

    // Convert screen pointer coordinates to logical coordinate system (800x600)
    const targetX = (clientX - rect.left) * scaleX;
    const targetY = (clientY - rect.top) * scaleY;

    // Prevent shooting below the cities / launch horizontal line
    if (targetY > 520) return;

    // Find closest active, loaded missile battery horizontally
    let bestBatteryIdx = -1;
    let minDistance = Infinity;

    batteriesRef.current.forEach((b, idx) => {
      if (!b.isDestroyed && b.missiles > 0) {
        const dist = Math.abs(b.x - targetX);
        if (dist < minDistance) {
          minDistance = dist;
          bestBatteryIdx = idx;
        }
      }
    });

    if (bestBatteryIdx !== -1) {
      const launchBattery = batteriesRef.current[bestBatteryIdx];
      launchBattery.missiles -= 1;
      syncBatteryUI();

      // Launch interceptor
      const interceptorId = Math.random().toString(36).substr(2, 9);
      interceptorsRef.current.push({
        id: interceptorId,
        start: { x: launchBattery.x, y: launchBattery.y - 12 },
        current: { x: launchBattery.x, y: launchBattery.y - 12 },
        target: { x: targetX, y: targetY },
        speed: 7, // Logical units per frame
        progress: 0,
        batteryIndex: bestBatteryIdx,
      });

      // Track missile statistics
      updateScoreAndStats(0, false, true);
      sound.playShoot();
    } else {
      // Out of Ammo click tick feedback
      sound.playTick();
    }
  };

  // Trigger click handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleCanvasInteraction(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Run the physics/drawing engine inside requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastFrameTime = performance.now();

    // Resize handlers
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Spawning logic for current wave
    const spawnRocket = (currentTime: number) => {
      if (gameState !== 'PLAYING' || !waveActiveRef.current) return;
      if (spawnedRocketsCountRef.current >= totalRocketsInWaveRef.current) return;

      if (currentTime - lastSpawnTimeRef.current >= spawnIntervalRef.current) {
        lastSpawnTimeRef.current = currentTime;
        spawnedRocketsCountRef.current += 1;

        const startX = 20 + Math.random() * (LOGICAL_WIDTH - 40);
        const startY = 0;

        // Pick a target: 35% Active City, 35% Active Battery, 30% Random ground
        const activeCities = citiesRef.current.filter((c) => !c.isDestroyed);
        const activeBatteries = batteriesRef.current.filter((b) => !b.isDestroyed);

        let targetX = Math.random() * LOGICAL_WIDTH;
        let targetY = 560; // Ground line

        const roll = Math.random();
        if (roll < 0.4 && activeCities.length > 0) {
          const c = activeCities[Math.floor(Math.random() * activeCities.length)];
          targetX = c.x + (Math.random() - 0.5) * 15;
        } else if (roll < 0.8 && activeBatteries.length > 0) {
          const b = activeBatteries[Math.floor(Math.random() * activeBatteries.length)];
          targetX = b.x + (Math.random() - 0.5) * 10;
        } else {
          targetX = 50 + Math.random() * (LOGICAL_WIDTH - 100);
        }

        // Adjust rocket speed based on level and current score to increase difficulty
        const baseSpeed = 0.5 + scoreBoard.score / 2500; // scaling speed
        const speedMultiplier = 0.8 + Math.random() * 0.7;
        const speed = Math.max(0.6, Math.min(2.5, baseSpeed * speedMultiplier));

        const rocketId = Math.random().toString(36).substr(2, 9);
        const neonColors = ['#f43f5e', '#ef4444', '#f97316', '#ff007f'];
        const color = neonColors[Math.floor(Math.random() * neonColors.length)];

        rocketsRef.current.push({
          id: rocketId,
          start: { x: startX, y: startY },
          current: { x: startX, y: startY },
          target: { x: targetX, y: targetY },
          speed,
          progress: 0,
          color,
        });
      }
    };

    // Main 60fps Game Loop
    const render = (time: number) => {
      // Delta time check
      const dt = time - lastFrameTime;
      lastFrameTime = time;

      // Handle Spawns
      spawnRocket(time);

      // Clean drawing stage
      ctx.save();
      
      // Implement Screen Shake
      if (shakeIntensityRef.current > 0.1) {
        const dx = (Math.random() - 0.5) * shakeIntensityRef.current;
        const dy = (Math.random() - 0.5) * shakeIntensityRef.current;
        ctx.translate(dx, dy);
        shakeIntensityRef.current *= 0.88; // decay
      }

      // Scaling transform for responsive design
      const scaleX = canvas.width / LOGICAL_WIDTH;
      const scaleY = canvas.height / LOGICAL_HEIGHT;
      ctx.scale(scaleX, scaleY);

      // Draw Starry Retro Grid Canvas Background
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < LOGICAL_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, LOGICAL_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < LOGICAL_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(LOGICAL_WIDTH, y);
        ctx.stroke();
      }

      // Draw Starry glow dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      const stars = [
        { x: 120, y: 80, r: 1 }, { x: 340, y: 150, r: 1.5 }, { x: 710, y: 90, r: 1 },
        { x: 230, y: 220, r: 1 }, { x: 550, y: 110, r: 2 }, { x: 650, y: 260, r: 1 },
        { x: 80, y: 310, r: 1.5 }, { x: 480, y: 340, r: 1 }, { x: 760, y: 400, r: 1 }
      ];
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 1. UPDATE AND DRAW PARTICLES
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // 2. UPDATE AND DRAW INTERCEPTOR MISSILES
      interceptorsRef.current = interceptorsRef.current.filter((it) => {
        if (gameState !== 'PLAYING') {
          // Draw stale interceptor lines
          ctx.strokeStyle = 'rgba(14, 165, 233, 0.6)'; // sky-500
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(it.start.x, it.start.y);
          ctx.lineTo(it.current.x, it.current.y);
          ctx.stroke();
          return true;
        }

        // Calculate travel progress
        const dx = it.target.x - it.start.x;
        const dy = it.target.y - it.start.y;
        const totalDist = Math.sqrt(dx * dx + dy * dy);
        
        // Logical progress
        const step = it.speed / totalDist;
        it.progress = Math.min(1, it.progress + step);

        it.current.x = it.start.x + dx * it.progress;
        it.current.y = it.start.y + dy * it.progress;

        // Draw launching path line
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.7)'; // sky-500
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#0ea5e9';
        ctx.beginPath();
        ctx.moveTo(it.start.x, it.start.y);
        ctx.lineTo(it.current.x, it.current.y);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // Draw Interceptor target marker "X"
        ctx.strokeStyle = '#38bdf8'; // sky-400
        ctx.lineWidth = 1;
        const size = 3;
        ctx.beginPath();
        ctx.moveTo(it.target.x - size, it.target.y - size);
        ctx.lineTo(it.target.x + size, it.target.y + size);
        ctx.moveTo(it.target.x + size, it.target.y - size);
        ctx.lineTo(it.target.x - size, it.target.y + size);
        ctx.stroke();

        // Check if interceptor reached target
        if (it.progress >= 1) {
          // Trigger circular shockwave explosion
          explosionsRef.current.push({
            id: Math.random().toString(36).substr(2, 9),
            position: it.target,
            radius: 1,
            maxRadius: 36,
            duration: 40, // frames
            elapsed: 0,
            stage: 'GROWING',
            color: 'rgba(56, 189, 248, 0.6)', // sky-400 transparent
          });
          
          spawnExplosionParticles(it.target.x, it.target.y, '#38bdf8', 12, 0.8);
          return false; // remove from list
        }
        return true;
      });

      // 3. UPDATE AND DRAW EXPLOSIONS
      explosionsRef.current = explosionsRef.current.filter((ex) => {
        if (gameState === 'PLAYING') {
          ex.elapsed += 1;
          if (ex.stage === 'GROWING') {
            ex.radius += 1.6;
            if (ex.radius >= ex.maxRadius) {
              ex.radius = ex.maxRadius;
              ex.stage = 'SHRINKING';
            }
          } else if (ex.stage === 'SHRINKING') {
            ex.radius -= 1.1;
            if (ex.radius <= 0) {
              ex.radius = 0;
              ex.stage = 'DONE';
            }
          }
        }

        if (ex.stage === 'DONE') return false;

        // Draw glow circle
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#06b6d4';
        ctx.fillStyle = ex.color;
        ctx.beginPath();
        ctx.arc(ex.position.x, ex.position.y, ex.radius, 0, Math.PI * 2);
        ctx.fill();

        // Stroke boundary
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        return true;
      });

      // 4. UPDATE AND DRAW ENEMY ROCKETS
      rocketsRef.current = rocketsRef.current.filter((rk) => {
        if (gameState !== 'PLAYING') {
          // Render static trails
          ctx.strokeStyle = rk.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rk.start.x, rk.start.y);
          ctx.lineTo(rk.current.x, rk.current.y);
          ctx.stroke();
          return true;
        }

        const dx = rk.target.x - rk.start.x;
        const dy = rk.target.y - rk.start.y;
        const totalDist = Math.sqrt(dx * dx + dy * dy);
        
        const step = rk.speed / totalDist;
        rk.progress = Math.min(1, rk.progress + step);

        rk.current.x = rk.start.x + dx * rk.progress;
        rk.current.y = rk.start.y + dy * rk.progress;

        // Add small tail exhaust smoke particles
        if (Math.random() < 0.15) {
          particlesRef.current.push({
            x: rk.current.x,
            y: rk.current.y,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.2 - Math.random() * 0.4,
            color: 'rgba(244, 63, 94, 0.4)',
            size: 1 + Math.random() * 1.5,
            alpha: 0.8,
            decay: 0.03,
          });
        }

        // Draw falling trail vector line
        ctx.strokeStyle = rk.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(rk.start.x, rk.start.y);
        ctx.lineTo(rk.current.x, rk.current.y);
        ctx.stroke();

        // Draw missile tip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(rk.current.x, rk.current.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // COLLISION: Check if rocket is caught in any active shockwave explosion
        let isHit = false;
        explosionsRef.current.forEach((ex) => {
          const exDx = rk.current.x - ex.position.x;
          const exDy = rk.current.y - ex.position.y;
          const dist = Math.sqrt(exDx * exDx + exDy * exDy);
          if (dist <= ex.radius + 2) {
            isHit = true;
          }
        });

        if (isHit) {
          // Award score immediately
          updateScoreAndStats(20, true, false);

          // Spawn particles & sound
          spawnExplosionParticles(rk.current.x, rk.current.y, rk.color, 20, 1);
          shakeIntensityRef.current = Math.max(shakeIntensityRef.current, 6);
          sound.playExplosion();

          return false; // delete rocket
        }

        // Check if rocket reached destination
        if (rk.progress >= 1) {
          // Impact detonator!
          sound.playImpact();
          shakeIntensityRef.current = Math.max(shakeIntensityRef.current, 14);
          
          // Draw explosive cloud at target
          explosionsRef.current.push({
            id: Math.random().toString(36).substr(2, 9),
            position: rk.target,
            radius: 1,
            maxRadius: 28,
            duration: 35,
            elapsed: 0,
            stage: 'GROWING',
            color: 'rgba(239, 68, 68, 0.5)', // red impact
          });

          spawnExplosionParticles(rk.target.x, rk.target.y, '#f43f5e', 24, 1.2);

          // CHECK TARGET TYPE: Battery, City, or ground
          // Check Batteries
          batteriesRef.current.forEach((b) => {
            if (!b.isDestroyed) {
              const bDx = rk.target.x - b.x;
              const bDy = rk.target.y - b.y;
              const dist = Math.sqrt(bDx * bDx + bDy * bDy);
              if (dist < 25) {
                b.isDestroyed = true;
                b.missiles = 0;
                syncBatteryUI();
                spawnExplosionParticles(b.x, b.y, '#ef4444', 35, 1.5);
              }
            }
          });

          // Check Cities
          citiesRef.current.forEach((c) => {
            if (!c.isDestroyed) {
              const cDx = rk.target.x - c.x;
              const cDy = rk.target.y - c.y;
              const dist = Math.sqrt(cDx * cDx + cDy * cDy);
              if (dist < 22) {
                c.isDestroyed = true;
                spawnExplosionParticles(c.x, c.y, '#e11d48', 30, 1.3);
              }
            }
          });

          // Dynamic cities count sync
          const intactCities = citiesRef.current.filter((c) => !c.isDestroyed).length;
          setCitiesCount(intactCities);

          // FAIL CHECK: Are all 3 batteries destroyed?
          const allBatteriesDestroyed = batteriesRef.current.every((b) => b.isDestroyed);
          if (allBatteriesDestroyed) {
            setGameState('DEFEAT');
            sound.playDefeat();
          }

          return false; // remove rocket
        }

        return true;
      });

      // 5. DRAW GROUND DEFENSES
      // Baseline Horizon
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 560);
      ctx.lineTo(LOGICAL_WIDTH, 560);
      ctx.stroke();

      ctx.fillStyle = '#0f172a'; // slate-900 ground
      ctx.fillRect(0, 560, LOGICAL_WIDTH, 40);

      // Draw Cities
      citiesRef.current.forEach((c) => {
        if (c.isDestroyed) {
          // Draw charred structural ruins
          ctx.fillStyle = '#334155'; // slate-700
          ctx.fillRect(c.x - c.width / 2, 555, c.width, 5);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(c.x - c.width / 2 + 5, 550, 4, 5);
          ctx.fillRect(c.x + c.width / 2 - 9, 552, 4, 3);
          return;
        }

        // Active City styling: Glowing blue buildings
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8'; // sky-400
        ctx.lineWidth = 1.5;

        const leftX = c.x - c.width / 2;
        const topY = c.y - c.height;

        // Draw multiple grouped building blocks
        ctx.beginPath();
        ctx.rect(leftX, topY, c.width, c.height);
        ctx.fill();
        ctx.stroke();

        // Mini glowing windows
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.fillRect(leftX + 4, topY + 4, 4, 4);
        ctx.fillRect(leftX + 12, topY + 4, 4, 4);
        ctx.fillRect(leftX + c.width - 8, topY + 4, 4, 4);
        ctx.fillRect(leftX + 8, topY + 11, 4, 4);
        ctx.fillRect(leftX + 18, topY + 11, 4, 4);
      });

      // Draw 3 Missile Launcher Batteries
      batteriesRef.current.forEach((b, idx) => {
        const leftX = b.x - 24;
        const topY = b.y - 14;

        if (b.isDestroyed) {
          // Draw heavy crater ruins
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 16, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 8, Math.PI, 0);
          ctx.fill();
          
          // Text indicators "OFF"
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('DOWN', b.x, b.y + 4);
          return;
        }

        // Battery Base dome
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#10b981'; // emerald-500 neon outline
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, 20, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        // Draw Battery Cannon pointing upwards towards center screen
        ctx.save();
        ctx.translate(b.x, b.y - 4);
        
        // Tilt cannon slightly based on mouse horizontal relative positions
        ctx.rotate(0); // static centered or pointing up
        
        ctx.fillStyle = '#34d399';
        ctx.fillRect(-4, -12, 8, 12);
        ctx.restore();

        // Draw circular ammo slot dots inside dome to reflect remaining missile count
        ctx.fillStyle = '#059669';
        const cols = 5;
        const rows = 2;
        const startX = b.x - 12;
        const startY = b.y + 4;
        
        // Draw miniature indicator lines
        ctx.fillStyle = b.missiles > 0 ? '#34d399' : '#f43f5e';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${b.missiles}`, b.x, b.y + 12);
      });

      // 6. WINNING CONDITION & PROGRESS CHECK
      if (gameState === 'PLAYING') {
        if (scoreBoard.score >= 1000) {
          setGameState('VICTORY');
          sound.playVictory();
          waveActiveRef.current = false;
        }

        // WAVE FINISHED CHECK:
        // Are all rockets spawned for this wave, and no active rockets or interceptors left on screen?
        const waveDone = 
          spawnedRocketsCountRef.current >= totalRocketsInWaveRef.current &&
          rocketsRef.current.length === 0 &&
          interceptorsRef.current.length === 0 &&
          explosionsRef.current.length === 0;

        if (waveDone && waveActiveRef.current && !nextWaveTriggeredRef.current) {
          waveActiveRef.current = false;
          nextWaveTriggeredRef.current = true;

          // Calculate remaining missiles and score bonuses
          const leftAmmo = batteriesRef.current[0].missiles;
          const midAmmo = batteriesRef.current[1].missiles;
          const rightAmmo = batteriesRef.current[2].missiles;
          const missilesLeft = { left: leftAmmo, mid: midAmmo, right: rightAmmo };
          const bonusPoints = (leftAmmo + midAmmo + rightAmmo) * 10;

          // Award Wave clear points
          updateScoreAndStats(bonusPoints, false, false);
          
          sound.playWaveCleared();

          // Notify parent overlay to render the Wave Complete screen
          setTimeout(() => {
            onWaveClearTrigger(missilesLeft, bonusPoints);
          }, 600);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    // Begin looping
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState, scoreBoard.score, updateScoreAndStats, setGameState, onWaveClearTrigger, setCitiesCount]);

  // Handle setting up the next Wave manually called from React UI
  useEffect(() => {
    // Watch for next wave triggers in state changes
    if (gameState === 'PLAYING' && !waveActiveRef.current && nextWaveTriggeredRef.current) {
      // Setup parameters for the next wave
      const currentWave = scoreBoard.wave;
      levelRef.current = currentWave;
      totalRocketsInWaveRef.current = 10 + 5 * currentWave;
      spawnedRocketsCountRef.current = 0;
      spawnIntervalRef.current = Math.max(800, 2400 - currentWave * 300);
      lastSpawnTimeRef.current = performance.now();

      // Clear trails and objects to avoid visual overlapping
      rocketsRef.current = [];
      interceptorsRef.current = [];
      explosionsRef.current = [];

      // Repair and reload batteries
      batteriesRef.current.forEach((b) => {
        b.missiles = b.maxMissiles;
        b.isDestroyed = false;
      });

      // Keep cities states (they are NOT repaired between waves!)
      syncBatteryUI();

      // Trigger Wave start
      nextWaveTriggeredRef.current = false;
      waveActiveRef.current = true;
    }
  }, [scoreBoard.wave, gameState]);

  // Initial trigger to begin first wave
  useEffect(() => {
    if (gameState === 'PLAYING' && !waveActiveRef.current && !nextWaveTriggeredRef.current) {
      // First wave setup
      levelRef.current = 1;
      totalRocketsInWaveRef.current = 10;
      spawnedRocketsCountRef.current = 0;
      spawnIntervalRef.current = 2000;
      lastSpawnTimeRef.current = performance.now();

      rocketsRef.current = [];
      interceptorsRef.current = [];
      explosionsRef.current = [];

      // Restore
      batteriesRef.current.forEach((b) => {
        b.missiles = b.maxMissiles;
        b.isDestroyed = false;
      });

      syncBatteryUI();
      waveActiveRef.current = true;
    }
  }, [gameState]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-950 rounded-2xl border border-cyan-500/20 shadow-2xl">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Real-time playing ammo counter indicators shown overlay on top of the canvas */}
      {gameState === 'PLAYING' && !nextWaveTriggeredRef.current && (
        <div className="absolute bottom-16 left-0 right-0 px-6 flex justify-between pointer-events-none font-mono text-xs z-10">
          <div className={`px-2.5 py-1 rounded bg-slate-950/80 border ${batteryState.leftDestroyed ? 'border-rose-500/40 text-rose-500' : 'border-emerald-500/40 text-emerald-400'}`}>
            {lang === 'zh' ? '左炮台' : 'LEFT'}: {batteryState.leftDestroyed ? 'OFFLINE' : `${batteryState.left}/20`}
          </div>
          <div className={`px-2.5 py-1 rounded bg-slate-950/80 border ${batteryState.midDestroyed ? 'border-rose-500/40 text-rose-500' : 'border-emerald-500/40 text-emerald-400'}`}>
            {lang === 'zh' ? '中炮台' : 'MID'}: {batteryState.midDestroyed ? 'OFFLINE' : `${batteryState.mid}/40`}
          </div>
          <div className={`px-2.5 py-1 rounded bg-slate-950/80 border ${batteryState.rightDestroyed ? 'border-rose-500/40 text-rose-500' : 'border-emerald-500/40 text-emerald-400'}`}>
            {lang === 'zh' ? '右炮台' : 'RIGHT'}: {batteryState.rightDestroyed ? 'OFFLINE' : `${batteryState.right}/20`}
          </div>
        </div>
      )}
    </div>
  );
};
