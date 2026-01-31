import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={clsx("skeleton", className)} />;
}

// Pre-built skeleton variants
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/2 mb-6" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function SkeletonUniversityCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
      {/* Logo placeholder */}
      <Skeleton className="h-12 w-12 rounded-lg mb-4" />
      {/* Name */}
      <Skeleton className="h-6 w-3/4 mb-2" />
      {/* Location */}
      <Skeleton className="h-4 w-1/2 mb-4" />
      {/* Details */}
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Description */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      {/* CTA */}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
