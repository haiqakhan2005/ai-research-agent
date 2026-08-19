import { FacetMark } from "@/components/facet-mark";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { mark: 20, text: "text-base" },
  md: { mark: 26, text: "text-xl" },
  lg: { mark: 44, text: "text-4xl md:text-5xl" },
};

export function Logo({ size = "md", className }: LogoProps) {
  const cfg = SIZES[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <FacetMark size={cfg.mark} />
      <span className={cn("font-display italic tracking-tight text-ivory", cfg.text)}>
        Agentia
      </span>
    </div>
  );
}
