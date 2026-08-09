import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useListProjects } from '../api/request';
import type { Project } from '../api/types';

interface ProjectHistoryProps {
  currentProjectId: number | null;
  onSelectProject: (id: number) => void;
  onCreateProject: () => void;
  isCreating?: boolean;
  refreshTrigger?: number; // hochzählen, um die Liste neu zu laden
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ProjectHistory({
  currentProjectId,
  onSelectProject,
  onCreateProject,
  isCreating,
  refreshTrigger,
}: ProjectHistoryProps) {
  const { listProjects, isLoading, data } = useListProjects();

  useEffect(() => {
    listProjects();
    // refreshTrigger sorgt dafür, dass wir nach dem Anlegen eines neuen
    // Projekts die Liste erneut abrufen
  }, [refreshTrigger]);

  const projects: Project[] = data?.projects ?? [];

  return (
    <div className="flex flex-col h-full">
      <Button
        variant="default"
        onClick={onCreateProject}
        disabled={isCreating}
        className="w-full mb-4 flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        {isCreating ? 'Wird erstellt…' : 'Neues Projekt'}
      </Button>

      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8A8371] mb-2 px-1">
        Verlauf
      </h3>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {isLoading && projects.length === 0 && (
          <p className="text-sm text-[#8A8371] px-1">hier kommen die Projekte hinzu.</p>
        )}

        {!isLoading && projects.length === 0 && (
          <p className="text-sm text-[#8A8371] px-1">
            Noch keine Projekte vorhanden.
          </p>
        )}

        {projects.map((project) => {
          const isActive = project.id === currentProjectId;
          return (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-orange-50 text-[#1E2430] border border-orange-200'
                  : 'hover:bg-[#FAF8F4] text-[#1E2430]/80 border border-transparent'
              }`}
            >
              <div className="font-medium truncate">{project.name}</div>
              <div className="text-xs text-[#8A8371]">
                {formatDate(project.created_at)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}