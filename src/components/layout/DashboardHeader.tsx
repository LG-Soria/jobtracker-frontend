import { LogOut } from "lucide-react";
import { Button } from "../ui/button";

type DashboardHeaderProps = {
  userEmail: string;
  onLogout: () => Promise<void> | void;
  loggingOut?: boolean;
};

export function DashboardHeader({ userEmail, onLogout, loggingOut = false }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-border bg-ink text-white">
          <div className="grid grid-cols-2 gap-0.5">
            <span className="block h-2 w-2 rounded-sm bg-white/90" />
            <span className="block h-2 w-2 rounded-sm bg-white/90" />
            <span className="block h-2 w-2 rounded-sm bg-white/90" />
            <span className="block h-2 w-2 rounded-sm bg-white/90" />
          </div>
        </div>
        <div className="text-sm font-semibold text-ink">JobTracker</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-ink">{userEmail}</p>
          <span className="mt-0.5 inline-flex items-center rounded border border-border px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            Sesion activa
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="hidden items-center gap-2 px-3 text-ink hover:text-ink sm:inline-flex"
          onClick={() => void onLogout()}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Saliendo..." : "Cerrar sesion"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center px-2 text-ink hover:text-ink sm:hidden"
          onClick={() => void onLogout()}
          disabled={loggingOut}
          aria-label="Cerrar sesion"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
