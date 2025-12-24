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
    <div className="space-y-1" ref={containerRef}>
      <Label>
        {label}
        {required ? ' *' : ''}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          name={name}
          type="text"
          className={cn(open ? 'border-slate-300' : '')}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (normalizedOptions.length) openList();
          }}
          onFocus={() => {
            if (normalizedOptions.length) openList();
          }}
          onBlur={() => {
            window.setTimeout(() => closeList(), 100);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />

        {open && (
          <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {filteredOptions.map((opt, idx) => (
              <div
                key={opt}
                className={cn(
                  "flex items-center transition",
                  highlightedIndex === idx ? "bg-slate-100" : "hover:bg-slate-50",
                )}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <button
                  type="button"
                  className="flex w-full flex-1 items-center justify-between px-3 py-2 text-left text-sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                >
                  <span className="truncate">{opt}</span>
                  <span className="text-xs text-slate-500">Seleccionar</span>
                </button>
                <button
                  type="button"
                  className="mx-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:text-red-600 hover:bg-red-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveOption(opt);
                  }}
                  aria-label={`Eliminar "${opt}"`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="border-t border-slate-100">
              <button
                type="button"
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-700 transition ${
                  highlightedIndex === filteredOptions.length ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleAddNew}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              >
                <span>Agregar nuevo</span>
                <span className="text-xs font-normal text-slate-500">Segui escribiendo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
