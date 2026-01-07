type DashboardHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function DashboardHero({ eyebrow, title, subtitle }: DashboardHeroProps) {
  return (
    <section className="space-y-3 bg-bg px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="h-[2px] w-8 bg-primary" aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
          {eyebrow}
        </span>
      </div>
      <div className="space-y-2">
        <h1 className="text-[2.25rem] font-semibold leading-snug text-ink sm:text-[2.5rem]">
          {title}
        </h1>
        <p className="max-w-3xl text-sm text-ink-muted leading-relaxed">{subtitle}</p>
      </div>
    </section>
  );
}
