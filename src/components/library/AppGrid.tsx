// no default React import needed with react-jsx runtime
import type { AppTemplate } from "../../types";
import { AppCard } from "./AppCard";

interface AppGridProps {
  templates: AppTemplate[];
  onOpen: (template: AppTemplate) => void;
  onRunSample?: (template: AppTemplate) => void;
}

export function AppGrid({ templates, onOpen, onRunSample }: AppGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((tpl) => (
        <AppCard key={tpl.id} template={tpl} onOpen={onOpen} onRunSample={onRunSample} />
      ))}
    </div>
  );
}


