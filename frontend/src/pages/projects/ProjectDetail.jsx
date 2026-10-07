import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Users,
  CheckSquare,
  StickyNote,
  Settings,
  Trash2,
  Plus,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Search,
  Pin,
  PinOff,
  Pencil,
  User as UserIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { usePinnedProjects } from "../../context/Pinnedprojectscontext ";
import { getPermissions, NO_PERMISSION_TEXT } from "@/lib/permissions";
import { timeAgo } from "../../lib/Timeago.js";
import { FullPageSpinner } from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import KanbanBoard from "../../components/ui/KanbanBoard";
import ProjectMembers from "./ProjectMembers"; // adjust the path if it lives elsewhere
import NotesPage from "../notes/NotesPage.jsx";

const statusColors = { todo: "default", in_progress: "warning", done: "success" };

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPinned, togglePin, unpin } = usePinnedProjects();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("board");
  const [showDelete, setShowDelete] = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);
  const [moveError, setMoveError] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [projectRes, tasksRes, membersRes] = await Promise.all([
      api.get(`/project/${projectId}`),
      api.get(`/task/${projectId}`).catch(() => null),
      api.get(`/project/getMember/${projectId}`),
    ]);
    setLoading(false);
    if (projectRes.success) {
      setProject(projectRes.data);
    } else {
      setError(projectRes.message || "Failed to load project");
      return;
    }
    if (tasksRes?.success) setTasks(tasksRes.data || []);
    else setTasks([]);
    if (membersRes.success) setMembers(membersRes.data || []);
    else setMembers([]);
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reload only the member list (used after adding, removing or changing a member)
  const refreshMembers = useCallback(async () => {
    const res = await api.get(`/project/getMember/${projectId}`);
    if (res.success) setMembers(res.data || []);
  }, [projectId]);

  if (loading) return <FullPageSpinner label="Loading project..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!project) return <ErrorState message="Project not found" />;

  // ---- Permissions ----
  const myId = user?._id || user?.id;
  const myRole = members.find((m) => (m.user?._id || m.user) === myId)?.role;
  const isOwner = !!myId && (project.createdBy?._id || project.createdBy) === myId;
  const can = getPermissions(isOwner ? "admin" : myRole);

  const handleDelete = async () => {
    if (!can.deleteProject) return;
    const res = await api.delete(`/project/${projectId}`);
    if (res.success) {
      unpin(projectId);
      navigate("/projects");
    } else {
      setError(res.message || "Failed to delete project");
    }
  };

  // Move a task to another column. Updates the UI first, rolls back if the API fails.
  const handleMove = async (taskId, status) => {
    if (!can.changeStatus) return;
    const previous = tasks;
    setMoveError("");
    setMovingId(taskId);
    setTasks(tasks.map((t) => (t._id === taskId ? { ...t, status } : t)));
    const res = await api.put(`/task/${projectId}/updateStatus/${taskId}`, { status });
    setMovingId(null);
    if (!res.success) {
      setTasks(previous);
      setMoveError(res.message || "Failed to move task");
    }
  };

  // Assign a task to another member. Updates the UI first, rolls back if the API fails.
  const handleAssign = async (taskId, member) => {
    if (!can.assignTask) return;
    const task = tasks.find((t) => t._id === taskId);
    const email = member?.user?.email;
    if (!task || !email) {
      setMoveError("Can't assign this task: the member's email is not available.");
      return;
    }
    const previous = tasks;
    setMoveError("");
    setAssigningId(taskId);
    setTasks(tasks.map((t) => (t._id === taskId ? { ...t, assignedTo: member.user } : t)));
    const res = await api.put(`/task/${projectId}/task/${taskId}`, {
      title: task.title,
      description: task.description,
      email,
    });
    setAssigningId(null);
    if (!res.success) {
      setTasks(previous);
      setMoveError(res.message || "Failed to assign task");
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskTarget || !can.deleteTask) return;
    const target = deleteTaskTarget;
    setDeleteTaskTarget(null);
    setMoveError("");
    const res = await api.delete(`/task/${projectId}/task/${target._id}`);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t._id !== target._id));
    } else {
      setMoveError(res.message || "Failed to delete task");
    }
  };

  const q = taskSearch.trim().toLowerCase();
  const visibleTasks = q
    ? tasks.filter((t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
    : tasks;

  const tabs = [
    { id: "board", label: "Kanban Board", icon: FolderKanban },
    { id: "list", label: "List View", icon: CheckSquare },
    { id: "members", label: "Members", icon: Users },
    { id: "notes", label: "Notes", icon: StickyNote },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"
      >
        <ArrowLeft size={16} /> All Projects
      </Link>
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 flex-shrink-0">
              <FolderKanban className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 mt-1">{project.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <UserIcon size={14} /> {project.createdBy?.fullname || "Unknown"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => togglePin({ _id: projectId, name: project.name })}
              className="btn-secondary text-sm"
              title={isPinned(projectId) ? "Remove from sidebar" : "Pin to sidebar"}
            >
              {isPinned(projectId) ? <PinOff size={16} /> : <Pin size={16} />}
              {isPinned(projectId) ? "Unpin" : "Pin"}
            </button>
            {can.editProject && (
              <Link to={`/projects/${projectId}/edit`} className="btn-secondary text-sm">
                <Settings size={16} /> Edit
              </Link>
            )}
            {can.deleteProject && (
              <button onClick={() => setShowDelete(true)} className="btn-danger text-sm">
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "board" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Search..."
                aria-label="Search tasks"
                className="input pl-9"
              />
            </div>
            {can.createTask ? (
              <Link to={`/projects/${projectId}/tasks/create`} className="btn-primary">
                <Plus size={16} /> Add Task
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title={NO_PERMISSION_TEXT}
                className="btn-primary opacity-50 cursor-not-allowed"
              >
                <Plus size={16} /> Add Task
              </button>
            )}
            {!can.changeStatus && (
              <span className="text-xs text-gray-500 sm:ml-auto">View only: you can't move tasks</span>
            )}
          </div>

          {moveError && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{moveError}</span>
            </div>
          )}

          <KanbanBoard
            tasks={visibleTasks}
            projectId={projectId}
            canMove={can.changeStatus}
            onMove={handleMove}
            movingId={movingId}
            members={members}
            canAssign={can.assignTask}
            onAssign={handleAssign}
            assigningId={assigningId}
          />
        </div>
      )}

      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {can.createTask ? (
              <Link to={`/projects/${projectId}/tasks/create`} className="btn-primary text-sm">
                <Plus size={16} /> Create Task
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title={NO_PERMISSION_TEXT}
                className="btn-primary text-sm opacity-50 cursor-not-allowed"
              >
                <Plus size={16} /> Create Task
              </button>
            )}
          </div>

          {moveError && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{moveError}</span>
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={CheckSquare}
                title="No tasks yet"
                description={
                  can.createTask
                    ? "Create tasks and assign them to your team members."
                    : "No tasks have been created for this project yet."
                }
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Task</th>
                      <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Description</th>
                      <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Status</th>
                      <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Assigned To</th>
                      <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Assigned By</th>
                      <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Created</th>
                      <th className="text-left text-sm font-semibold text-gray-900 px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tasks.map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm">
                          <Link
                            to={`/projects/${projectId}/tasks/${task._id}`}
                            className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {task.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <p className="truncate">{task.description}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={statusColors[task.status] || "default"}>
                            {task.status?.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {task.assignedTo?.fullname || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {task.assignedBy?.fullname || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{timeAgo(task.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {can.editTask ? (
                              <Link
                                to={`/projects/${projectId}/tasks/${task._id}`}
                                state={{ openEdit: true }}
                                title="Edit task"
                                aria-label={`Edit ${task.title}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                              >
                                <Pencil size={15} />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                disabled
                                title={NO_PERMISSION_TEXT}
                                aria-label="Edit task"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 opacity-50 cursor-not-allowed"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteTaskTarget(task)}
                              disabled={!can.deleteTask}
                              title={!can.deleteTask ? NO_PERMISSION_TEXT : "Delete task"}
                              aria-label={`Delete ${task.title}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-error-50 text-error-600 hover:bg-error-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "members" && <ProjectMembers embedded onChange={refreshMembers} />}

      {activeTab === "notes" && <NotesPage embedded can={can} />}

      <ConfirmDialog
        isOpen={!!deleteTaskTarget && can.deleteTask}
        onClose={() => setDeleteTaskTarget(null)}
        onConfirm={handleDeleteTask}
        title="Delete task?"
        message={`This will permanently delete "${deleteTaskTarget?.title || "this task"}" and all its subtasks. This cannot be undone.`}
        confirmLabel="Delete Task"
      />

      {can.deleteProject && (
        <ConfirmDialog
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="Delete project?"
          message="This will permanently delete the project, its members, and all associated notes. This cannot be undone."
          confirmLabel="Delete Project"
        />
      )}
    </div>
  );
}
