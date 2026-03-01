export type TabKey = "source" | "add" | "pipeline";

export function TabBar({
  tab,
  setTab,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
}) {
  const item = (key: TabKey, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={
        tab === key
          ? "flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          : "flex-1 rounded-xl border bg-white px-3 py-2 text-sm font-medium"
      }
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto flex max-w-md gap-2 px-4 pb-4">
      {item("source", "Source")}
      {item("add", "Add")}
      {item("pipeline", "Pipeline")}
    </div>
  );
}
