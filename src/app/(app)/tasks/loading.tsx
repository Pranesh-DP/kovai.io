import { Skeleton } from "@/components/ui/Skeleton";

export default function TasksLoading() {
  return (
    <div className="flex-1 flex flex-col gap-6" aria-busy="true" aria-label="Loading tasks">
      {/* Top Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center p-1 rounded-xl glass border border-white/10 gap-1.5 w-64 h-10">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl glass border border-white/10 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

