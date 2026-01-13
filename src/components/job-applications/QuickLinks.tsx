'use client';

import { useState, useEffect } from 'react';
import { Link2, Copy, Check, Plus, X } from 'lucide-react';
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
        <div className="space-y-6 rounded-none border border-border/50 bg-white p-6 transition-all duration-300 hover:border-border shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-ink/5 p-2">
                        <Link2 className="h-4 w-4 text-ink" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-tight text-ink">Enlaces rapidos</h3>
                        <p className="text-[11px] font-medium text-ink-muted/60 uppercase tracking-wider">Tus links listos para copiar</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[10px] font-bold uppercase tracking-widest text-ink-soft hover:text-ink"
                >
                    {isEditing ? 'Listo' : 'Editar enlaces'}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {links.map((link) => (
                    <div key={link.id} className="group relative flex flex-col gap-2 rounded-card border border-border/20 bg-surface/30 p-3 transition-all duration-300 hover:border-ink/20 hover:bg-surface-muted/10">
                        {isEditing ? (
                            <div className="space-y-2">
                                <Input
                                    value={link.label}
                                    onChange={(e) => handleUpdate(link.id, 'label', e.target.value)}
                                    className="h-7 text-[11px] px-2 border-border/40"
                                    placeholder="Etiqueta"
                                />
                                <Input
                                    value={link.url}
                                    onChange={(e) => handleUpdate(link.id, 'url', e.target.value)}
                                    className="h-7 text-[11px] px-2 border-border/40"
                                    placeholder="https://..."
                                />
                                <button
                                    onClick={() => removeLink(link.id)}
                                    className="absolute -right-1 -top-1 rounded-full bg-danger p-0.5 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted/80">{link.label}</span>
                                    {link.url && (
                                        <button
                                            onClick={() => handleCopy(link.url, link.id)}
                                            className="text-ink-soft hover:text-ink transition-colors"
                                            title="Copiar link"
                                        >
                                            {copiedId === link.id ? (
                                                <Check className="h-3.5 w-3.5 text-success-text" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div className="truncate text-xs text-ink-soft/60 font-mono">
                                    {link.url ? link.url.replace(/^https?:\/\//, '') : 'Vacio'}
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {isEditing && links.length < 5 && (
                    <button
                        onClick={addLink}
                        className="flex flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-border/40 p-4 text-ink-soft hover:border-ink/20 hover:text-ink transition-all duration-300"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Agregar</span>
                    </button>
                )}
            </div>
        </div>
    );
}
