import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("rounded-md kairo-skeleton", className)}
      style={{ background: 'var(--bg-overlay, rgba(30,30,40,1))' }}
      {...props} />
  );
}

function SkeletonMessage({ compact }) {
  return (
    <div className="flex items-start gap-4 px-4 py-1" style={{ marginTop: compact ? 0 : 16 }}>
      {!compact && <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />}
      {compact && <div className="w-10 flex-shrink-0" />}
      <div className="flex-1 space-y-2">
        {!compact && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 rounded" style={{ width: 80 + Math.random() * 60 }} />
            <Skeleton className="h-2.5 w-12 rounded" />
          </div>
        )}
        <Skeleton className="h-3 rounded" style={{ width: `${40 + Math.random() * 50}%` }} />
        {Math.random() > 0.5 && <Skeleton className="h-3 rounded" style={{ width: `${20 + Math.random() * 40}%` }} />}
      </div>
    </div>
  );
}

function SkeletonMember() {
  return (
    <div className="flex items-center gap-2.5 px-2 h-10">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <Skeleton className="h-3 rounded flex-1" style={{ maxWidth: 80 + Math.random() * 60 }} />
    </div>
  );
}

function SkeletonChannel() {
  return (
    <div className="flex items-center gap-2 px-2 h-9">
      <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
      <Skeleton className="h-3 rounded flex-1" style={{ maxWidth: 60 + Math.random() * 80 }} />
    </div>
  );
}

export { Skeleton, SkeletonMessage, SkeletonMember, SkeletonChannel }
