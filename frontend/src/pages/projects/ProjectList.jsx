import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Plus, Search, Pin, Pencil, Trash2, Users, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { timeAgo } from "../../lib/Timeago";
import { getPermissions, NO_PERMISSION_TEXT } from "@/lib/permissions";
import { usePinnedProjects } from "../../context/Pinnedprojectscontext ";
import { FullPageSpinner } from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// Works whether your API sends a number or the members array
const getMemberCount = (project) => {
  const value = project.membersCount ?? project.memberCount ?? project.members;
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return value.length;
  return null;
};

const iconBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export default function ProjectList() {
  const { isPinned, togglePin, unpin, syncPinned } = usePinnedProjects();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    const res = await api.get("/project/getProject");
    setLoading(false);
    if (res.success) {
      setProjects(res.data || []);
    } else {
      setError(res.message || "Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Keep pinned names up to date and drop pinned projects that no longer exist
  useEffect(() => {
    if (!loading && !error) syncPinned(projects);
  }, [projects, loading, error, syncPinned]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setActionError("");
    const res = await api.delete(`/project/${target._id}`);
    if (res.success) {
      unpin(target._id);
      setProjects((prev) => prev.filter((p) => p._id !== target._id));
    } else {
      setActionError(res.message || "Failed to delete project");
    }
  };

  const filtered = projects
    .filter(
      (p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()),
    )
    // pinned projects first
    .sort((a, b) => Number(isPinned(b._id)) - Number(isPinned(a._id)));

  if (loading) return <FullPageSpinner label="Loading projects..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link to="/projects/create" className="btn-primary">
          <Plus size={18} /> Create New Project
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input pl-10"
        />
      </div>

      {actionError && (
        <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderKanban}
            title={search ? "No matching projects" : "No projects yet"}
            description={search ? "Try a different search term." : "Create your first project to get started."}
            action={
              !search && (
                <Link to="/projects/create" className="btn-primary">
                  <Plus size={18} /> Create Project
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Project Name</th>
                  <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Description</th>
                  <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Members</th>
                  <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Created</th>
                  <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((project) => {
                  const can = getPermissions(project.role);
                  const pinned = isPinned(project._id);
                  const members = getMemberCount(project);

                  return (
                    <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <Link
                          to={`/projects/${project._id}`}
                          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <p className="truncate">{project.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-medium text-white">
                          <Users size={12} /> {members ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {timeAgo(project.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => togglePin({ _id: project._id, name: project.name })}
                            title={pinned ? "Unpin from sidebar" : "Pin to sidebar"}
                            aria-label={pinned ? `Unpin ${project.name}` : `Pin ${project.name}`}
                            aria-pressed={pinned}
                            className={`${iconBtn} ${pinned ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                          >
                            <Pin size={15} fill={pinned ? "currentColor" : "none"} />
                          </button>

                          {can.editProject ? (
                            <Link
                              to={`/projects/${project._id}/edit`}
                              title="Edit project"
                              aria-label={`Edit ${project.name}`}
                              className={`${iconBtn} bg-primary-50 text-primary-600 hover:bg-primary-100`}
                            >
                              <Pencil size={15} />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title={NO_PERMISSION_TEXT}
                              aria-label="Edit project"
                              className={`${iconBtn} bg-primary-50 text-primary-600`}
                            >
                              <Pencil size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(project)}
                            disabled={!can.deleteProject}
                            title={!can.deleteProject ? NO_PERMISSION_TEXT : "Delete project"}
                            aria-label={`Delete ${project.name}`}
                            className={`${iconBtn} bg-error-50 text-error-600 hover:bg-error-100`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete project?"
        message={`This will permanently delete "${deleteTarget?.name || "this project"}", its members, and all associated notes. This cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </div>
  );
}
