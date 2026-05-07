export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  return (
    <div className="bg-white/50 border border-[var(--color-obsidian)]/10 p-8 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-30">{label}</span>
        {Icon && <Icon className="w-4 h-4 opacity-20" />}
      </div>
      <p className="text-4xl font-serif text-[var(--color-obsidian)] leading-none">
        {value ?? '—'}
      </p>
    </div>
  );
}