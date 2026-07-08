/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { GameState, ScoreBoard } from './types';
import { i18n, Language } from './i18n';
import { sound } from './sound';
import { 
  Shield, 
  Trophy, 
  Layers, 
  Sparkles, 
  Gamepad2, 
  Pause, 
  Play, 
  RotateCcw,
  Activity,
  Cpu
} from 'lucide-react';

export default function App() {
  // Localization: Load from localStorage or default to Chinese 'zh'
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('tina_defense_lang');
    return (stored === 'en' || stored === 'zh') ? stored : 'zh';
  });

  // Sound Config: Load from localStorage
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('tina_defense_sound');
    return stored !== 'false'; // defaults to true
  });

  // Game States
  const [gameState, setGameState] = useState<GameState>('START');
  const [citiesCount, setCitiesCount] = useState<number>(6);

  // ScoreBoard states loaded from local persistence
  const [scoreBoard, setScoreBoard] = useState<ScoreBoard>(() => {
    const storedScore = localStorage.getItem('tina_defense_score');
    const storedWave = localStorage.getItem('tina_defense_wave');
    const storedHighScore = localStorage.getItem('tina_defense_highscore');

    return {
      score: storedScore ? Number(storedScore) : 0,
      wave: storedWave ? Number(storedWave) : 1,
      highScore: storedHighScore ? Number(storedHighScore) : 0,
      missilesFired: 0,
      rocketsDestroyed: 0,
    };
  });

  // Wave Clear Interstitial States
  const [showWaveClear, setShowWaveClear] = useState<boolean>(false);
  const [waveMissilesLeft, setWaveMissilesLeft] = useState<{ left: number; mid: number; right: number }>({
    left: 20,
    mid: 40,
    right: 20,
  });
  const [waveBonusPoints, setWaveBonusPoints] = useState<number>(0);

  // Sync preferences to localStorage on change
  useEffect(() => {
    localStorage.setItem('tina_defense_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('tina_defense_sound', String(isSoundEnabled));
    sound.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  const t = i18n[lang];

  // START Game Handler
  const handleStartGame = () => {
    sound.playTick();
    setScoreBoard((prev) => ({
      ...prev,
      score: 0,
      wave: 1,
      missilesFired: 0,
      rocketsDestroyed: 0,
    }));
    setCitiesCount(6);
    setGameState('PLAYING');
    setShowWaveClear(false);
  };

  // RESUME Handler
  const handleResume = () => {
    sound.playTick();
    setGameState('PLAYING');
  };

  // PAUSE Handler
  const handlePause = () => {
    sound.playTick();
    setGameState('PAUSED');
  };

  // RESTART Handler (Full reset)
  const handleRestart = () => {
    sound.playTick();
    setScoreBoard((prev) => ({
      ...prev,
      score: 0,
      wave: 1,
      missilesFired: 0,
      rocketsDestroyed: 0,
    }));
    setCitiesCount(6);
    setGameState('PLAYING');
    setShowWaveClear(false);
    
    // Save state resets
    localStorage.setItem('tina_defense_score', '0');
    localStorage.setItem('tina_defense_wave', '1');
  };

  // Triggered by GameCanvas when all wave rockets are cleared
  const handleWaveClearTrigger = (
    missilesLeft: { left: number; mid: number; right: number },
    bonusPoints: number
  ) => {
    setWaveMissilesLeft(missilesLeft);
    setWaveBonusPoints(bonusPoints);
    setShowWaveClear(true);
  };

  // Move to next wave on user prompt
  const handleNextWave = () => {
    sound.playTick();
    setShowWaveClear(false);
    setScoreBoard((prev) => {
      const nextWave = prev.wave + 1;
      localStorage.setItem('tina_defense_wave', String(nextWave));
      return {
        ...prev,
        wave: nextWave,
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#050714] text-slate-100 flex flex-col items-center justify-between p-3 md:p-6 select-none overflow-x-hidden font-sans relative">
      
      {/* Immersive Cosmic Gradient Atmosphere */}
      <div className="absolute inset-0 cosmic-gradient opacity-80 pointer-events-none"></div>
      
      {/* Ambient Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)] opacity-40 pointer-events-none"></div>

      {/* Subtle Starfield Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20px_30px,#fff,transparent),radial-gradient(1.5px_1.5px_at_40px_70px,#fff,transparent),radial-gradient(1px_1px_at_120px_80px,#fff,transparent),radial-gradient(2px_2px_at_200px_150px,#22d3ee,transparent),radial-gradient(1.5px_1.5px_at_350px_220px,#fff,transparent)] bg-[size:500px_500px] opacity-25 pointer-events-none"></div>

      {/* ================= HEADER HUB BRANDING ================= */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 mb-5 p-4 rounded-2xl bg-[#0a0e2a]/80 border border-cyan-500/20 backdrop-blur-md glow-cyan relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
            <Gamepad2 size={24} className="animate-pulse text-cyan-200" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-glow-cyan text-cyan-300 font-sans">
              {t.title}
            </h1>
            <p className="text-[10px] md:text-xs text-cyan-400/70 font-mono tracking-widest uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block"></span>
              {gameState === 'PLAYING' ? `${t.waveLabel.replace('{wave}', String(scoreBoard.wave))} · ALPHA SECTOR` : 'Arcade Interface'}
            </p>
          </div>
        </div>

        {/* Real-time cybernetic diagnostic feedback */}
        <div className="flex items-center gap-5 text-[10px] font-mono text-cyan-400/60 bg-[#070b21]/90 px-4 py-2 rounded-xl border border-cyan-500/20 backdrop-blur-sm shadow-inner">
          <div className="flex items-center gap-1.5">
            <Cpu size={12} className="text-cyan-400 animate-pulse" />
            <span>GRID: <span className="text-cyan-300 font-bold">ACTIVE</span></span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-cyan-500/15 pl-4">
            <Activity size={12} className="text-cyan-400 animate-pulse" />
            <span>FPS: <span className="text-cyan-300 font-bold">60.0</span></span>
          </div>
          <div className="hidden sm:block border-l border-cyan-500/15 pl-4">
            <span>VERSION: <span className="text-indigo-400 font-bold">v1.1.0</span></span>
          </div>
        </div>
      </header>

      {/* ================= MAIN INTERACTIVE SECTION ================= */}
      <main className="w-full max-w-5xl flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5 items-stretch z-10 my-1">
        
        {/* LEFT/SIDEBAR CONTROLS & DIAGNOSTICS */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col justify-between gap-3 md:gap-4">
          
          {/* Tactical Monitor 1: Current Score */}
          <div className="flex-1 bg-[#0a0e2a]/80 border border-cyan-500/20 rounded-2xl p-3 md:p-4 flex flex-col justify-between shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-cyan-400/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
            <div className="flex justify-between items-start mb-1.5 md:mb-3">
              <span className="text-cyan-400 text-[10px] md:text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5 font-mono">
                <Sparkles size={13} className="text-cyan-400" />
                {t.score}
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                SCN
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-cyan-300 font-mono tracking-wider text-glow-cyan">
              {String(scoreBoard.score).padStart(8, '0')}
            </div>
          </div>

          {/* Tactical Monitor 2: Wave & Level */}
          <div className="flex-1 bg-[#0a0e2a]/80 border border-cyan-500/20 rounded-2xl p-3 md:p-4 flex flex-col justify-between shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-indigo-400/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
            <div className="flex justify-between items-start mb-1.5 md:mb-3">
              <span className="text-indigo-300 text-[10px] md:text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5 font-mono">
                <Layers size={13} className="text-indigo-400" />
                {t.wave}
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                PHS
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-indigo-300 font-mono tracking-wider text-glow-cyan">
              WAVE {String(scoreBoard.wave).padStart(2, '0')}
            </div>
          </div>

          {/* Tactical Monitor 3: High Score */}
          <div className="flex-1 bg-[#0a0e2a]/80 border border-cyan-500/20 rounded-2xl p-3 md:p-4 flex flex-col justify-between shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-orange-400/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
            <div className="flex justify-between items-start mb-1.5 md:mb-3">
              <span className="text-orange-400 text-[10px] md:text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5 font-mono">
                <Trophy size={13} className="text-orange-400" />
                {t.highScore}
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20 uppercase">
                MAX
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-orange-400 font-mono tracking-wider text-glow-orange">
              {String(scoreBoard.highScore).padStart(8, '0')}
            </div>
          </div>

          {/* Tactical Monitor 4: Shield integrity indicator */}
          <div className="flex-1 bg-[#0a0e2a]/80 border border-cyan-500/20 rounded-2xl p-3 md:p-4 flex flex-col justify-between shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-emerald-400/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
            <div className="flex justify-between items-start mb-1.5 md:mb-2">
              <span className="text-emerald-400 text-[10px] md:text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5 font-mono">
                <Shield size={13} className="text-emerald-400" />
                {lang === 'zh' ? '城市护盾' : 'SHIELDS'}
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase">
                INTEG
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-black text-emerald-300 font-mono tracking-widest">
                {citiesCount * 16.6 < 100 ? `${Math.round(citiesCount * 16.67)}%` : '100%'}
              </span>
              <span className="text-xs text-slate-500 font-mono mt-2">({citiesCount}/6)</span>
            </div>
            {/* Tiny battery light indicators */}
            <div className="flex gap-1.5 mt-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-sm transition-all duration-500 ${
                    i < citiesCount 
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] border border-emerald-300/20' 
                      : 'bg-slate-900 border border-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* CENTER INTERACTIVE GAME SCREEN PANEL */}
        <div className="lg:col-span-3 relative h-[50vh] md:h-[60vh] lg:h-auto min-h-[380px] max-h-[700px] flex flex-col justify-between rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-500/5 bg-[#030614]">
          
          {/* Game Canvas Wrapper with Embedded UI overlays */}
          <div className="w-full h-full relative">
            <GameCanvas
              gameState={gameState}
              setGameState={setGameState}
              scoreBoard={scoreBoard}
              setScoreBoard={setScoreBoard}
              setCitiesCount={setCitiesCount}
              isSoundEnabled={isSoundEnabled}
              onWaveClearTrigger={handleWaveClearTrigger}
              lang={lang}
            />

            <GameUI
              gameState={gameState}
              scoreBoard={scoreBoard}
              citiesCount={citiesCount}
              lang={lang}
              setLang={setLang}
              isSoundEnabled={isSoundEnabled}
              toggleSound={() => setIsSoundEnabled(prev => !prev)}
              onStartGame={handleStartGame}
              onResume={handleResume}
              onRestart={handleRestart}
              onNextWave={handleNextWave}
              showWaveClear={showWaveClear}
              waveMissilesLeft={waveMissilesLeft}
              waveBonusPoints={waveBonusPoints}
              batteryStatus={{
                left: true,
                mid: true,
                right: true,
              }}
            />
          </div>

          {/* Quick HUD Play Controls underneath the stage */}
          {gameState === 'PLAYING' && (
            <div className="absolute top-16 left-5 pointer-events-auto flex items-center gap-2 z-10">
              <button
                id="btn-hud-pause"
                onClick={handlePause}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0e2a]/95 hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-100 rounded-lg border border-cyan-500/30 font-mono text-xs font-semibold cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all"
              >
                <Pause size={12} />
                <span>{t.pause}</span>
              </button>
              <button
                id="btn-hud-restart"
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0e2a]/95 hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-100 rounded-lg border border-cyan-500/30 font-mono text-xs font-semibold cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all"
              >
                <RotateCcw size={12} />
                <span>{t.restart}</span>
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ================= FOOTER CREDITS ================= */}
      <footer className="w-full max-w-5xl mt-5 p-3 rounded-xl bg-[#0a0e2a]/40 border border-cyan-500/10 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-cyan-400/40 gap-2 z-10">
        <div>
          <span>WILLIAM NOVA DEFENSE PROTOCOL v1.1.0 // SECURE LINK ESTABLISHED</span>
        </div>
        <div className="flex gap-4">
          <span className="text-cyan-400/30">// STATUS: ALL SYSTEMS OPERATIONAL</span>
          <span className="text-glow-cyan text-cyan-300 font-bold">ARCADE SLATE v4</span>
        </div>
      </footer>

    </div>
  );
}
