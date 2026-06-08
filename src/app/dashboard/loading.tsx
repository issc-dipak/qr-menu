export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      <p className="text-xs font-medium text-muted animate-pulse">Loading dashboard content...</p>
    </div>
  );
}
