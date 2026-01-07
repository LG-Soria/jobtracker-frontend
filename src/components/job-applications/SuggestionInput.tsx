'use client';

import { KeyboardEvent, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';
import { Trash2 } from 'lucide-react';

type SuggestionInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  name?: string;
  placeholder?: string;
  required?: boolean;
  persistKey?: string;
  inputRef?: RefObject<HTMLInputElement>;
};

export function SuggestionInput({
  label,
  value,
  onChange,
  options,
  name,
  placeholder,
  required = false,
  persistKey,
  inputRef: inputRefProp,
}: SuggestionInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = inputRefProp ?? internalInputRef;
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = localStorage.getItem(persistKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRemovedOptions(parsed.filter((item) => typeof item === 'string'));
      }
    } catch (err) {
      console.error('No pudimos cargar preferencias de sugerencias', err);
    }
  }, [persistKey]);

  useEffect(() => {
    if (!persistKey) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify(removedOptions));
    } catch (err) {
      console.error('No pudimos guardar preferencias de sugerencias', err);
    }
  }, [persistKey, removedOptions]);

  const normalizedOptions = useMemo(() => {
    const counts = new Map<string, { value: string; count: number }>();

    options.forEach((opt) => {
      const trimmed = opt.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      const prev = counts.get(key);
      counts.set(key, { value: prev?.value ?? trimmed, count: (prev?.count ?? 0) + 1 });
    });

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
      .map((item) => item.value);
  }, [options]);

  const availableOptions = useMemo(() => {
    const removed = new Set(removedOptions.map((o) => o.toLowerCase()));
    return normalizedOptions.filter((opt) => !removed.has(opt.toLowerCase()));
  }, [normalizedOptions, removedOptions]);

  const filteredOptions = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return availableOptions;
    return availableOptions.filter((opt) => opt.toLowerCase().includes(term));
  }, [availableOptions, value]);

  const totalItems = filteredOptions.length + 1; // +1 para el boton "Agregar nuevo"

  const closeList = () => {
    setOpen(false);
    setHighlightedIndex(null);
  };

  const openList = () => {
    setOpen(true);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    closeList();
  };

  const handleRemoveOption = (option: string) => {
    setRemovedOptions((prev) => Array.from(new Set([...prev, option])));
    setHighlightedIndex(null);
  };

  const handleAddNew = () => {
    closeList();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      if (!normalizedOptions.length) return;
      e.preventDefault();
      openList();
      setHighlightedIndex(0);
      return;
    }

    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        if (prev === null) return 0;
        return Math.min(prev + 1, totalItems - 1);
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        if (prev === null) return totalItems - 1;
        return Math.max(prev - 1, 0);
      });
    } else if (e.key === 'Enter') {
      if (highlightedIndex === null) return;
      e.preventDefault();
      if (highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else {
        handleAddNew();
      }
    } else if (e.key === 'Escape') {
      closeList();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeList();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted/70">
        {label}
        {required ? ' *' : ''}
      </Label>
      <div className="relative group/input">
        <Input
          ref={inputRef}
          name={name}
          type="text"
          className={cn(
            "border-border/60 bg-surface/50 transition-all duration-300 focus:bg-surface focus:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)]",
            open ? "border-ink-soft/60 ring-0" : ""
          )}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (normalizedOptions.length) openList();
          }}
          onBlur={() => {
            window.setTimeout(() => closeList(), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />

        <div
          className={cn(
            "absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-card border border-border bg-surface shadow-[0_12px_24px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top",
            open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          )}
        >
          <div className="max-h-[280px] overflow-y-auto py-1.5 px-1.5 scrollbar-thin scrollbar-thumb-border">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={opt}
                  className={cn(
                    "flex items-center rounded-input transition-all duration-200 ease-out mb-0.5 last:mb-0",
                    highlightedIndex === idx ? "bg-surface-muted translate-x-1" : "hover:bg-surface-muted/60",
                  )}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <button
                    type="button"
                    className="flex w-full flex-1 items-center justify-between px-3 py-2.5 text-left text-sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                  >
                    <span className="truncate font-medium text-ink">{opt}</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider transition-opacity duration-300",
                      highlightedIndex === idx ? "opacity-100 text-ink-soft" : "opacity-0"
                    )}>
                      Seleccionar
                    </span>
                  </button>
                  <button
                    type="button"
                    className="mx-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft/40 transition-all duration-200 hover:bg-danger/10 hover:text-primary"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOption(opt);
                    }}
                    aria-label={`Eliminar "${opt}"`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-ink-soft/60 italic">Sin sugerencias previas</p>
              </div>
            )}
          </div>

          <div className="border-t border-border/50 bg-surface-muted/30 p-1.5">
            <button
              type="button"
              className={cn(
                "group flex w-full items-center justify-between rounded-input px-3 py-2.5 text-left text-[13px] font-semibold text-ink transition-all duration-200",
                highlightedIndex === filteredOptions.length ? "bg-white shadow-sm ring-1 ring-border/40" : "hover:bg-white/60"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleAddNew}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
            >
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <span>Agregar nuevo</span>
              </div>
              <span className="text-[10px] font-medium text-ink-soft/70 opacity-0 transition-opacity group-hover:opacity-100">
                Segui escribiendo
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
