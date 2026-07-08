/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ enabled, onToggle }) => {
  return (
    <button
      id="btn-sound-toggle"
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-sans text-sm shadow-md backdrop-blur-sm ${
        enabled
          ? 'border-emerald-500/30 bg-slate-900/80 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400'
          : 'border-rose-500/30 bg-slate-900/80 text-rose-400 hover:bg-rose-500/10 hover:border-rose-400'
      }`}
      title={enabled ? 'Mute' : 'Unmute'}
    >
      {enabled ? (
        <>
          <Volume2 size={16} />
          <span className="font-medium">On / 开启</span>
        </>
      ) : (
        <>
          <VolumeX size={16} />
          <span className="font-medium">Off / 关闭</span>
        </>
      )}
    </button>
  );
};
