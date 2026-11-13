import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div
      className="flex-1 flex flex-col gap-6 w-full"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-5 w-full">
        {/* Tile 1: Greeting + Quick Add skeleton (span 8) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-8 p-6 sm:p-8 rounded-3xl glass border border-white/10 flex flex-col justify-between gap-6 h-64">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-80 rounded" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        {/* Tile 2: Completion Ring skeleton (span 4) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-4 p-6 sm:p-8 rounded-3xl glass border border-white/10 flex flex-col items-center justify-between h-64">
          <div className="w-full flex justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>
          <Skeleton className="h-32 w-32 rounded-full my-2" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>

        {/* Tile 3: Status Chips skeleton (span 4) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-4 p-6 sm:p-8 rounded-3xl glass border border-white/10 flex flex-col justify-between gap-4 h-64">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        </div>

        {/* Tile 4: Progress Bar skeleton (span 8) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-8 p-6 sm:p-8 rounded-3xl glass border border-white/10 flex flex-col justify-between gap-4 h-64">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-4 w-full rounded-full my-auto" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>

        {/* Tile 5: In Focus skeleton (span 6) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-6 p-6 sm:p-8 rounded-3xl glass border border-white/10 flex flex-col gap-4 h-72">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>

        {/* Tile 6: Recent Activity skeleton (span 6) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-6 p-6 sm:p-8 rounded-3xl glass border border-white/10 flex flex-col gap-4 h-72">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

