import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NO_PERMISSION_TEXT } from "@/lib/permissions";

// Colors use your theme scales (primary / warning / success).
// If a shade doesn't exist in your Tailwind config, swap it for one you have.
const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    column: "bg-primary-50",
    edge: "border-l-primary-600",
    pill: "bg-primary-100 text-primary-700",
  },
  {
    id: "in_progress",
    label: "In Progress",
    column: "bg-warning-50",
    edge: "border-l-warning-600",
    pill: "bg-warning-50 text-warning-600 ring-1 ring-warning-600/30",
  },
  {
    id: "done",
    label: "Done",
    column: "bg-success-50",
    edge: "border-l-success-500",
    pill: "bg-success-50 text-success-700 ring-1 ring-success-500/30",
  },
];

function timeAgo(dateString) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, size] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "";
}

// Clicks inside dropdowns must not open the task page.
const stop = (e) => e.stopPropagation();

/**
 * Props
 * - tasks:       array of tasks ({ _id, title, description, status, assignedTo, createdAt })
 * - projectId:   used to open the task detail page
 * - canMove:     false => cards can't be dragged and the status pill is disabled
 * - onMove:      (taskId, newStatus) => void
 * - movingId:    id of a task whose status update is in progress
 * - members:     project members ([{ _id, role, user: { _id, fullname, email } }])
 * - canAssign:   false => the assignee dropdown is disabled
 * - onAssign:    (taskId, member) => void
 * - assigningId: id of a task whose assignment is in progress
 */
export default function KanbanBoard({
  tasks,
  projectId,
  canMove,
  onMove,
  movingId,
  members = [],
  canAssign = false,
  onAssign,
  assigningId,
}) {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const openTask = (taskId) => navigate(`/projects/${projectId}/tasks/${taskId}`);

  const handleDrop = (e, status) => {
    e.preventDefault();
    setDragOver(null);
    setDraggingId(null);
    if (!canMove) return;
    const id = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t._id === id);
    if (task && task.status !== status) onMove(id, status);
  };

  const handleAssignChange = (task, userId) => {
    const member = members.find((m) => m.user?._id === userId);
    if (member && member.user?._id !== task.assignedTo?._id) onAssign(task._id, member);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isOver = dragOver === col.id && canMove;

        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              if (!canMove) return;
              e.preventDefault();
              setDragOver(col.id);
            }}
            onDragLeave={() => setDragOver((c) => (c === col.id ? null : c))}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-xl p-5 min-h-[420px] transition-shadow ${col.column} ${isOver ? "ring-2 ring-primary-600/40" : ""}`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-5">
              {col.label} ({colTasks.length})
            </h3>

            {colTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No tasks in this column</p>
            ) : (
              <div className="space-y-4">
                {colTasks.map((task) => {
                  const assigneeId = task.assignedTo?._id || "";
                  const assigneeName = task.assignedTo?.fullname || task.assignedTo?.username || "Unassigned";
                  const assigneeInMembers = members.some((m) => m.user?._id === assigneeId);

                  return (
                    <div
                      key={task._id}
                      role="link"
                      tabIndex={0}
                      onClick={() => openTask(task._id)}
                      onKeyDown={(e) => {
                        if (e.target === e.currentTarget && e.key === "Enter") openTask(task._id);
                      }}
                      draggable={canMove}
                      onDragStart={(e) => {
                        if (!canMove) return;
                        e.dataTransfer.setData("text/plain", task._id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(task._id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOver(null);
                      }}
                      className={`rounded-xl bg-white shadow-sm border-l-4 ${col.edge} p-4 cursor-pointer hover:shadow-md transition-shadow ${draggingId === task._id ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-gray-900 break-words">{task.title}</h4>

                        {/* Status pill + dropdown (also works on touch screens) */}
                        <select
                          value={task.status}
                          onChange={(e) => onMove(task._id, e.target.value)}
                          onClick={stop}
                          disabled={!canMove || movingId === task._id}
                          title={!canMove ? NO_PERMISSION_TEXT : "Change status"}
                          aria-label={`Change status of ${task.title}`}
                          className={`flex-shrink-0 appearance-none rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border-0 ${col.pill} ${canMove ? "cursor-pointer" : "cursor-not-allowed opacity-70"} disabled:cursor-not-allowed`}
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{task.description}</p>
                      )}

                      {/* Assign to another member */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 flex-shrink-0">
                          {assigneeName.charAt(0).toUpperCase()}
                        </span>
                        <select
                          value={assigneeId}
                          onChange={(e) => handleAssignChange(task, e.target.value)}
                          onClick={stop}
                          disabled={!canAssign || assigningId === task._id}
                          title={!canAssign ? NO_PERMISSION_TEXT : "Assign to"}
                          aria-label={`Assign ${task.title} to a member`}
                          className="min-w-0 flex-1 text-sm text-gray-700 rounded-md border border-gray-200 bg-white py-1 pl-2 pr-6 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {!assigneeId && (
                            <option value="" disabled>
                              Unassigned
                            </option>
                          )}
                          {assigneeId && !assigneeInMembers && (
                            <option value={assigneeId} disabled>
                              {assigneeName}
                            </option>
                          )}
                          {members.map((m) => (
                            <option key={m._id} value={m.user?._id}>
                              {m.user?.fullname || m.user?.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      {task.createdAt && <p className="text-xs text-gray-400 mt-3">{timeAgo(task.createdAt)}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
