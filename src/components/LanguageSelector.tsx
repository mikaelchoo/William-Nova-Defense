/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Languages } from 'lucide-react';
import { Language } from '../i18n';

interface LanguageSelectorProps {
  lang: Language;
  onChange: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ lang, onChange }) => {
  return (
    <button
      id="btn-lang-selector"
      onClick={() => onChange(lang === 'zh' ? 'en' : 'zh')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-slate-900/80 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer font-sans text-sm shadow-md backdrop-blur-sm"
      title={lang === 'zh' ? 'Switch to English' : '切换至中文'}
    >
      <Languages size={16} className="animate-pulse" />
      <span className="font-medium">
        {lang === 'zh' ? 'English' : '中文'}
      </span>
    </button>
  );
};
