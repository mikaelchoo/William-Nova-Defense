/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Award, 
  HelpCircle, 
  ShieldAlert, 
  Zap, 
  Flame, 
  Target, 
  Trophy,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { GameState, ScoreBoard } from '../types';
import { i18n, Language } from '../i18n';
import { LanguageSelector } from './LanguageSelector';
import { SoundToggle } from './SoundToggle';

interface GameUIProps {
  gameState: GameState;
  scoreBoard: ScoreBoard;
  citiesCount: number;
  lang: Language;
  setLang: (lang: Language) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  onStartGame: () => void;
  onResume: () => void;
  onRestart: () => void;
  onNextWave: () => void;
  showWaveClear: boolean;
  waveMissilesLeft: { left: number; mid: number; right: number };
  waveBonusPoints: number;
  batteryStatus: { left: boolean; mid: boolean; right: boolean };
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  scoreBoard,
  citiesCount,
  lang,
  setLang,
  isSoundEnabled,
  toggleSound,
  onStartGame,
  onResume,
  onRestart,
  onNextWave,
  showWaveClear,
  waveMissilesLeft,
  waveBonusPoints,
  batteryStatus,
}) => {
  const t = i18n[lang];

  // Helper for safety checks
  const getSafeBonus = (val: number) => (isNaN(val) ? 0 : val);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center font-sans select-none">
      
      {/* ================= HEADER CONTROL BAR ================= */}
      <div className="w-full max-w-5xl px-4 py-3 flex justify-between items-center pointer-events-auto absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="font-mono text-cyan-300 font-bold tracking-widest uppercase text-[10px] md:text-xs text-glow-cyan bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur-sm">
            {gameState === 'PLAYING' ? t.waveActive : gameState}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <LanguageSelector lang={lang} onChange={setLang} />
          <SoundToggle enabled={isSoundEnabled} onToggle={toggleSound} />
        </div>
      </div>

      {/* ================= START MENU OVERLAY ================= */}
      {gameState === 'START' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-xl mx-4 p-5 md:p-7 rounded-2xl border border-cyan-500/30 bg-[#070b24]/95 text-white pointer-events-auto shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col items-center max-h-[90vh] overflow-y-auto scrollbar-thin relative"
        >
          {/* Futuristic corner brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40"></div>

          {/* Logo / Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-black tracking-wider text-cyan-300 text-glow-cyan font-mono animate-pulse pb-1">
              {t.title}
            </h1>
            <p className="text-cyan-400/70 text-xs md:text-sm mt-2 font-mono tracking-widest uppercase">
              // {t.subtitle}
            </p>
          </div>

          {/* High Score Panel */}
          {scoreBoard.highScore > 0 && (
            <div className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-cyan-950/40 border border-cyan-400/30 rounded-full text-cyan-300 text-xs md:text-sm font-bold tracking-wider font-mono shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <Trophy size={16} className="text-cyan-400 animate-bounce" />
              <span>{t.highScore}: {String(scoreBoard.highScore).padStart(8, '0')}</span>
            </div>
          )}

          {/* Rules Board */}
          <div className="w-full bg-[#030617]/90 rounded-xl p-4 md:p-5 border border-cyan-500/20 text-sm mb-6 space-y-4 shadow-inner">
            <h3 className="text-cyan-300 font-bold font-mono tracking-widest flex items-center gap-2 border-b border-cyan-500/20 pb-2 text-xs md:text-sm uppercase">
              <HelpCircle size={16} className="text-cyan-400" />
              SYSTEM OPERATIONAL DIRECTIVE // {t.howToPlay}
            </h3>
            <ul className="space-y-3 text-cyan-100/80 font-normal leading-relaxed text-xs md:text-sm font-sans list-disc list-inside">
              <li>{t.rule1}</li>
              <li>{t.rule2}</li>
              <li>{t.rule3}</li>
              <li>{t.rule4}</li>
              <li>{t.rule5}</li>
              <li className="text-cyan-300 font-semibold">{t.rule6}</li>
            </ul>
          </div>

          {/* Launch Button */}
          <button
            id="btn-start-game"
            onClick={onStartGame}
            className="group relative flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl text-white font-black text-sm md:text-base tracking-widest uppercase transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_45px_rgba(6,182,212,0.55)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-cyan-400/40"
          >
            <Play size={18} fill="currentColor" className="group-hover:translate-x-0.5 transition-transform" />
            <span>{t.startGame}</span>
          </button>
        </motion.div>
      )}

      {/* ================= PAUSE MENU OVERLAY ================= */}
      {gameState === 'PAUSED' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl border border-cyan-500/30 bg-[#070b24]/95 text-white pointer-events-auto text-center shadow-[0_0_40px_rgba(6,182,212,0.2)] max-w-sm w-full mx-4 relative"
        >
          {/* Futuristic corner brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/40"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/40"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/40"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/40"></div>

          <h2 className="text-2xl font-black text-cyan-300 mb-2 flex items-center justify-center gap-2 tracking-widest uppercase font-mono text-glow-cyan animate-pulse">
            <ShieldAlert className="text-cyan-400" />
            {t.paused}
          </h2>
          <p className="text-cyan-400/70 text-xs mb-6 tracking-widest font-mono">
            {t.totalScore.replace('{score}', String(scoreBoard.score).padStart(8, '0'))}
          </p>

          <div className="flex flex-col gap-3">
            <button
              id="btn-resume-game"
              onClick={onResume}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl text-white font-extrabold text-sm tracking-widest uppercase transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] cursor-pointer border border-cyan-400/30"
            >
              <Play size={16} fill="currentColor" />
              <span>{t.resume}</span>
            </button>
            <button
              id="btn-restart-game"
              onClick={onRestart}
              className="flex items-center justify-center gap-2 py-3 bg-[#030617]/80 hover:bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-cyan-300 font-semibold text-sm tracking-wider uppercase transition-all hover:border-cyan-400/50 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>{t.restart}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ================= WAVE CLEARED OVERLAY ================= */}
      {showWaveClear && gameState === 'PLAYING' && (
        <div className="absolute inset-0 bg-[#050714]/85 backdrop-blur-md flex items-center justify-center z-30 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4 p-6 rounded-2xl border border-cyan-500/30 bg-[#070b24]/95 text-white shadow-[0_0_50px_rgba(6,182,212,0.25)] relative"
          >
            {/* Futuristic corner brackets */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400/40"></div>
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400/40"></div>
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400/40"></div>
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400/40"></div>

            <div className="text-center mb-5">
              <div className="inline-flex p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3 animate-bounce shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-cyan-300 tracking-widest uppercase font-mono text-glow-cyan">
                {t.waveCleared}
              </h2>
              <p className="text-cyan-400/70 text-xs mt-1.5 font-mono uppercase tracking-wider">
                // {t.waveSummary}
              </p>
            </div>

            {/* Score Stats / Calculations */}
            <div className="bg-[#030617]/90 rounded-xl p-4 border border-cyan-500/20 space-y-3.5 font-mono text-xs md:text-sm mb-6 shadow-inner">
              <div className="text-xs font-bold text-cyan-400 border-b border-cyan-500/15 pb-2 tracking-widest uppercase">
                {t.missileBonus} (+10 {t.bonusPoints}/PNT)
              </div>
              
              <div className="flex justify-between items-center text-cyan-100/80">
                <span className="text-[11px] uppercase tracking-wider">{t.leftBattery}</span>
                <span className="text-cyan-300 font-bold">{getSafeBonus(waveMissilesLeft.left)} × 10</span>
              </div>
              <div className="flex justify-between items-center text-cyan-100/80">
                <span className="text-[11px] uppercase tracking-wider">{t.midBattery}</span>
                <span className="text-cyan-300 font-bold">{getSafeBonus(waveMissilesLeft.mid)} × 10</span>
              </div>
              <div className="flex justify-between items-center text-cyan-100/80 border-b border-cyan-500/10 pb-2">
                <span className="text-[11px] uppercase tracking-wider">{t.rightBattery}</span>
                <span className="text-cyan-300 font-bold">{getSafeBonus(waveMissilesLeft.right)} × 10</span>
              </div>

              <div className="pt-1.5 flex justify-between items-center text-cyan-300 font-bold text-glow-cyan text-sm md:text-base">
                <span className="text-xs uppercase tracking-widest">{t.scoreBonus}</span>
                <span>+{getSafeBonus(waveBonusPoints)} {t.bonusPoints}</span>
              </div>
            </div>

            {/* Next Wave Button */}
            <button
              id="btn-next-wave"
              onClick={onNextWave}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl text-white font-extrabold text-sm md:text-base tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer border border-cyan-400/30"
            >
              <span>{t.nextWave}</span>
              <ArrowRight size={18} className="animate-pulse" />
            </button>
          </motion.div>
        </div>
      )}

      {/* ================= VICTORY SCREEN OVERLAY ================= */}
      {gameState === 'VICTORY' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-4 p-6 rounded-2xl border border-cyan-500/30 bg-[#070b24]/95 text-white pointer-events-auto text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative"
        >
          {/* Futuristic corner brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40"></div>

          <div className="inline-flex p-3.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-3 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Award size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-cyan-300 tracking-widest uppercase font-mono mb-2 text-glow-cyan">
            {t.victoryTitle}
          </h2>
          <p className="text-cyan-100/70 text-xs md:text-sm px-2 mb-6 leading-relaxed">
            {t.victoryDesc}
          </p>

          {/* Stats Summary */}
          <div className="bg-[#030617]/90 rounded-xl p-4 border border-cyan-500/20 text-left font-mono text-xs md:text-sm space-y-3 mb-6 shadow-inner">
            <h4 className="text-cyan-300 font-bold text-center border-b border-cyan-500/15 pb-2 uppercase tracking-widest text-xs">
              {t.statsTitle}
            </h4>
            <div className="flex justify-between items-center py-0.5 text-cyan-100/80">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <Target size={14} className="text-cyan-400" />
                {t.statsRockets}
              </span>
              <span className="text-cyan-300 font-bold">{scoreBoard.rocketsDestroyed}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-cyan-100/80">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <Zap size={14} className="text-cyan-400" />
                {t.statsFired}
              </span>
              <span className="text-cyan-300 font-bold">{scoreBoard.missilesFired}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-cyan-100/80">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <Flame size={14} className="text-cyan-400" />
                {t.statsCities}
              </span>
              <span className="text-emerald-400 font-bold">{citiesCount} / 6</span>
            </div>
            <div className="border-t border-cyan-500/15 pt-2 flex justify-between items-center text-cyan-300 font-bold text-glow-cyan text-sm md:text-base">
              <span className="text-xs uppercase tracking-widest">{t.score}</span>
              <span>{String(scoreBoard.score).padStart(8, '0')}</span>
            </div>
          </div>

          {/* Restart Button */}
          <button
            id="btn-victory-restart"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl text-white font-extrabold text-sm md:text-base tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer border border-cyan-400/30"
          >
            <RotateCcw size={16} />
            <span>{t.playAgain}</span>
          </button>
        </motion.div>
      )}

      {/* ================= DEFEAT SCREEN OVERLAY ================= */}
      {gameState === 'DEFEAT' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-4 p-6 rounded-2xl border border-orange-500/30 bg-[#070b24]/95 text-white pointer-events-auto text-center shadow-[0_0_50px_rgba(249,115,22,0.25)] relative"
        >
          {/* Futuristic corner brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-orange-400/40"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-orange-400/40"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-orange-400/40"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-orange-400/40"></div>

          <div className="inline-flex p-3.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-3 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <Flame size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-orange-400 tracking-widest uppercase font-mono mb-2 text-glow-orange">
            {t.defeatTitle}
          </h2>
          <p className="text-cyan-100/70 text-xs md:text-sm px-2 mb-6 leading-relaxed">
            {t.defeatDesc}
          </p>

          {/* Stats Summary */}
          <div className="bg-[#030617]/90 rounded-xl p-4 border border-orange-500/20 text-left font-mono text-xs md:text-sm space-y-3 mb-6 shadow-inner">
            <h4 className="text-orange-300 font-bold text-center border-b border-orange-500/15 pb-2 uppercase tracking-widest text-xs">
              {t.statsTitle}
            </h4>
            <div className="flex justify-between items-center py-0.5 text-cyan-100/80">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <Target size={14} className="text-orange-400" />
                {t.statsRockets}
              </span>
              <span className="text-cyan-300 font-bold">{scoreBoard.rocketsDestroyed}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-cyan-100/80">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <Zap size={14} className="text-orange-400" />
                {t.statsFired}
              </span>
              <span className="text-cyan-300 font-bold">{scoreBoard.missilesFired}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 text-cyan-100/80">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <Flame size={14} className="text-orange-400" />
                {t.statsCities}
              </span>
              <span className="text-rose-400 font-bold">{citiesCount} / 6</span>
            </div>
            <div className="border-t border-orange-500/15 pt-2 flex justify-between items-center text-orange-400 font-bold text-glow-orange text-sm md:text-base">
              <span className="text-xs uppercase tracking-widest">{t.score}</span>
              <span>{String(scoreBoard.score).padStart(8, '0')}</span>
            </div>
          </div>

          {/* Restart Button */}
          <button
            id="btn-defeat-restart"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white font-extrabold text-sm md:text-base tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer border border-orange-400/30"
          >
            <RotateCcw size={16} />
            <span>{t.playAgain}</span>
          </button>
        </motion.div>
      )}

    </div>
  );
};
