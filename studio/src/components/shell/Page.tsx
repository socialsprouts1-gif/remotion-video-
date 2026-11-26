import { cn } from "@/lib/cn";
export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-10", className)}>{children}</main>;
}
