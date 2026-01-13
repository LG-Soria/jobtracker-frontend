'use client';

import { useState, useEffect } from 'react';
import { Link2, Copy, Check, Plus, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type QuickLink = {
    id: string;
    label: string;
    url: string;
};

const DEFAULT_LINKS: QuickLink[] = [
    { id: '1', label: 'LinkedIn', url: '' },
    { id: '2', label: 'Portfolio', url: '' },
];

export function QuickLinks() {
    const [links, setLinks] = useState<QuickLink[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('jobtracker-quick-links');
        if (saved) {
            try {
                setLinks(JSON.parse(saved));
            } catch {
                setLinks(DEFAULT_LINKS);
            }
        } else {
            setLinks(DEFAULT_LINKS);
        }
    }, []);

    // Save to localStorage
    const saveLinks = (newLinks: QuickLink[]) => {
        setLinks(newLinks);
        localStorage.setItem('jobtracker-quick-links', JSON.stringify(newLinks));
    };

    const handleCopy = (url: string, id: string) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleUpdate = (id: string, field: 'label' | 'url', value: string) => {
        const newLinks = links.map((link) =>
            link.id === id ? { ...link, [field]: value } : link
        );
        saveLinks(newLinks);
    };

    const addLink = () => {
        if (links.length >= 5) return;
        const newLink = { id: Date.now().toString(), label: 'Nuevo link', url: '' };
        saveLinks([...links, newLink]);
    };

    const removeLink = (id: string) => {
        saveLinks(links.filter((link) => link.id !== id));
    };

    return (
        <div className={`space-y-6 rounded-none border border-border/50 bg-white p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm ${isExpanded ? 'ring-1 ring-ink/5' : ''}`}>
            <div className="flex items-center justify-between">
                <button
                    onClick={() => {
                        setIsExpanded(!isExpanded);
                        if (isExpanded) setIsEditing(false);
                    }}
                    className="group flex items-center gap-3 text-left transition-all duration-300"
                >
                    <div className={`rounded-full p-2 transition-all duration-500 ${isExpanded ? 'bg-ink text-white' : 'bg-ink/5 text-ink'}`}>
                        <Link2 className={`h-4 w-4 transition-transform duration-500 ${isExpanded ? 'rotate-12' : ''}`} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-semibold tracking-tight text-ink flex items-center gap-2">
                            Enlaces rapidos
                            <ChevronDown className={`h-3 w-3 text-ink-soft transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                        </h3>
                        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'h-4 opacity-100 mt-0.5' : 'h-0 opacity-0'}`}>
                            <p className="text-[11px] font-medium text-ink-muted/60 uppercase tracking-wider">Tus links listos para copiar</p>
                        </div>
                    </div>
                </button>
                {isExpanded && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-[10px] font-bold uppercase tracking-widest text-ink-soft hover:text-ink animate-in fade-in slide-in-from-right-2 duration-500"
                    >
                        {isEditing ? 'Guardar' : 'Editar enlaces'}
                    </Button>
                )}
            </div>

            <div className={`grid gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mt-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 opacity-80'}`}>
                {links.map((link) => (
                    <div
                        key={link.id}
                        className={`group relative flex transition-all duration-500 rounded-card border border-border/20 ${isExpanded
                            ? 'flex-col gap-2 bg-surface/30 p-3 hover:border-ink/20 hover:bg-surface-muted/10'
                            : 'items-center justify-between px-4 py-2 bg-white/50 hover:border-ink/10 hover:bg-surface/40'
                            }`}
                    >
                        {isExpanded && isEditing ? (
                            <div className="space-y-2 w-full animate-in fade-in zoom-in-95 duration-300">
                                <Input
                                    value={link.label}
                                    onChange={(e) => handleUpdate(link.id, 'label', e.target.value)}
                                    className="h-7 text-[11px] px-2 border-border/40 focus:border-ink/40"
                                    placeholder="Etiqueta"
                                />
                                <Input
                                    value={link.url}
                                    onChange={(e) => handleUpdate(link.id, 'url', e.target.value)}
                                    className="h-7 text-[11px] px-2 border-border/40 focus:border-ink/40"
                                    placeholder="https://..."
                                />
                                <button
                                    onClick={() => removeLink(link.id)}
                                    className="absolute -right-1.5 -top-1.5 rounded-full bg-danger p-1 text-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`flex items-center justify-between w-full ${isExpanded ? '' : 'gap-3'}`}>
                                    <span className={`font-bold uppercase tracking-wider text-ink-muted/80 truncate ${isExpanded ? 'text-[11px]' : 'text-[10px]'}`}>
                                        {link.label}
                                    </span>
                                    {link.url && (
                                        <button
                                            onClick={() => handleCopy(link.url, link.id)}
                                            className={`transition-all duration-300 hover:scale-110 active:scale-90 ${copiedId === link.id ? 'text-success-text' : 'text-ink-soft hover:text-ink'}`}
                                            title="Copiar link"
                                        >
                                            {copiedId === link.id ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                {isExpanded && (
                                    <div className="truncate text-xs text-ink-soft/60 font-mono animate-in fade-in slide-in-from-top-1 duration-500">
                                        {link.url ? link.url.replace(/^https?:\/\//, '') : 'Vacio'}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {isExpanded && isEditing && links.length < 5 && (
                    <button
                        onClick={addLink}
                        className="flex flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-border/40 p-4 text-ink-soft hover:border-ink/20 hover:text-ink transition-all duration-300 animate-in fade-in zoom-in-95"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Agregar</span>
                    </button>
                )}
            </div>
        </div>
    );
}
