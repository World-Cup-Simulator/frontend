import { FlagImage } from '../../../shared/components/FlagImage';
import type { ThirdPlaceTeam } from '../models';

interface ThirdPlacesModalProps {
  isOpen: boolean;
  teams: ThirdPlaceTeam[];
  selectedCount: number;
  onToggle: (teamCode: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const ThirdPlacesModal = ({
  isOpen,
  teams,
  selectedCount,
  onToggle,
  onConfirm,
  onClose,
}: ThirdPlacesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/90 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-zinc-800 rounded-2xl border border-zinc-700/50 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100">
              Seleccionar Mejores Terceros
            </h2>
            <span className="text-sm font-medium text-zinc-400">
              {selectedCount}/8
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Selecciona los 8 mejores equipos clasificados en tercer lugar.
          </p>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((team) => (
              <button
                key={team.teamCode}
                type="button"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left
                  ${team.selected
                    ? 'bg-indigo-600/20 border-indigo-500/50'
                    : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-700/50'
                  }
                `}
                onClick={() => onToggle(team.teamCode)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${team.selected ? 'border-indigo-500 bg-indigo-500' : 'border-zinc-500'}
                `}>
                  {team.selected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <FlagImage code={team.teamCode} alt={team.teamName} className="h-5 w-7" />

                <div className="min-w-0">
                  <span className="text-sm font-medium text-zinc-200 block truncate">
                    {team.teamName}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Grupo {team.groupCode}
                  </span>
                </div>

                {team.points > 0 && (
                  <span className="ml-auto text-xs font-bold text-zinc-300">
                    {team.points} pts
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-700/50 flex gap-3 justify-end">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${selectedCount === 8
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }
            `}
            onClick={onConfirm}
            disabled={selectedCount !== 8}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
