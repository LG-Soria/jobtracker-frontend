import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] border leading-none bg-transparent",
  {
    variants: {
      variant: {
        info: "text-ink border-ink",
        warning: "text-[#854d0e] border-[#fef08a] bg-[#fef9c3]",
        neutral: "text-ink-soft border-border",
        danger: "text-danger border-danger",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
