import { NavLink } from "react-router-dom";
import { FolderKanban, PinOff } from "lucide-react";
import { usePinnedProjects } from "../../context/Pinnedprojectscontext ";

// Put this in your sidebar, right below the "Projects" link.
export default function PinnedProjects({ onNavigate }) {
  const { pinned, unpin } = usePinnedProjects();
  if (pinned.length === 0) return null;

  return (
    <div className="mt-1 ml-4 pl-3 border-l border-gray-200 space-y-0.5">
      <p className="px-2 pt-1 pb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">Pinned</p>
      {pinned.map((project) => (
        <div key={project._id} className="group flex items-center">
          <NavLink
            to={`/projects/${project._id}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex flex-1 min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                isActive ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <FolderKanban size={14} className="flex-shrink-0" />
            <span className="truncate">{project.name}</span>
          </NavLink>
          <button
            type="button"
            onClick={() => unpin(project._id)}
            title="Unpin"
            aria-label={`Unpin ${project.name}`}
            className="p-1 rounded text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <PinOff size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
