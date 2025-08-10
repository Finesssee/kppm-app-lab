// no default React import needed with react-jsx runtime
import type { AppTemplate } from "../../types";

interface AppCardProps {
  template: AppTemplate;
  onOpen: (template: AppTemplate) => void;
  onRunSample?: (template: AppTemplate) => void;
}

export function AppCard({ template, onOpen, onRunSample }: AppCardProps) {
  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3 bg-card">
      <img
        src={template.coverImageUrl ?? "/placeholder.svg"}
        alt={template.name}
        className="w-full h-40 object-cover rounded"
      />
      <div className="flex-1">
        <div className="text-lg font-semibold">{template.name}</div>
        <div className="text-sm text-muted-foreground">{template.description}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {template.tags.map((t) => (
          <span key={t} className="text-xs px-2 py-1 rounded bg-secondary">
            {t}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
          onClick={() => onOpen(template)}
        >
          Open
        </button>
        {onRunSample && (
          <button
            className="px-3 py-2 rounded border hover:bg-secondary"
            onClick={() => onRunSample(template)}
          >
            Run sample
          </button>
        )}
      </div>
    </div>
  );
}


