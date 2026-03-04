export default function RootLoading() {
  return (
    <div className="min-h-screen bg-cairn-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-cairn-border border-t-canopy animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
