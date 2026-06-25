import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className, rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-subtle",
        rounded ? "rounded-full" : "rounded-lg",
        className
      )}
    />
  );
}
