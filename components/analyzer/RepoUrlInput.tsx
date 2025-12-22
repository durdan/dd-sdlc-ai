'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Github, Link } from 'lucide-react';

interface RepoUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  error?: string | null;
}

export function RepoUrlInput({ value, onChange, onSubmit, disabled, error }: RepoUrlInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit && !disabled) {
        onSubmit();
      }
    },
    [onSubmit, disabled]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData('text');
      if (pastedText.includes('github.com') || pastedText.match(/^[\w-]+\/[\w.-]+$/)) {
        setTimeout(() => {
          if (onSubmit && !disabled) {
            onSubmit();
          }
        }, 100);
      }
    },
    [onSubmit, disabled]
  );

  return (
    <div className="w-full">
      <div
        className={`
          relative flex items-center rounded-2xl transition-all duration-300
          bg-white/60 dark:bg-white/5
          backdrop-blur-xl
          border-2
          ${
            isFocused
              ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] dark:shadow-[0_0_30px_rgba(59,130,246,0.2)]'
              : error
                ? 'border-red-500/50'
                : 'border-white/30 dark:border-white/10 hover:border-white/50 dark:hover:border-white/20'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        {/* Icon container with glass effect */}
        <div className="flex items-center justify-center w-14 h-14 border-r border-white/20 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-lg">
            <Github className="w-5 h-5 text-white" />
          </div>
        </div>

        <Input
          type="text"
          placeholder="Enter GitHub repository URL or owner/repo"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="flex-1 h-14 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white font-medium"
        />

        {/* Link icon for visual indication */}
        {value && (
          <div className="pr-4">
            <Link className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 font-mono text-xs">
            github.com/owner/repo
          </span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">or</span>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 font-mono text-xs">
            owner/repo
          </span>
        </div>
      </div>
    </div>
  );
}
