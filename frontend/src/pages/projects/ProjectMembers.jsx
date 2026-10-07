import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Trash2,
  Mail,
  AlertCircle,
  User as UserIcon,
  Users,
  Shield,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getPermissions, NO_PERMISSION_TEXT } from "@/lib/permissions";
import { FullPageSpinner, ButtonSpinner } from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const roles = ["admin", "project_admin", "project_manger", "member"];
const disabledClass = "disabled:opacity-50 disabled:cursor-not-allowed";

export default function ProjectMembers({ embedded = false, onChange }) {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("member");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [editingRole, setEditingRole] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await api.get(`/project/getMember/${projectId}`);
    setLoading(false);
    if (res.success) {
      setMembers(res.data || []);
    } else {
      setError(res.message || "Failed to load members");
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ---- Permissions ----
  const myId = user?._id || user?.id;
  const myRole = members.find((m) => (m.user?._id || m.user) === myId)?.role;
  const can = getPermissions(myRole);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!can.manageMembers) return;
    setActionError("");
    setActionLoading(true);
    const res = await api.post(`/project/${projectId}/member`, { email: newEmail, role: newRole });
    setActionLoading(false);
    if (res.success) {
      setShowAdd(false);
      setNewEmail("");
      setNewRole("member");
      fetchMembers();
      onChange?.();
    } else {
      setActionError(res.message || "Failed to add member");
    }
  };

  const handleRoleChange = async (memberId, role) => {
    if (!can.manageMembers) return;
    setActionLoading(true);
    const res = await api.post(`/project/${projectId}/member/${memberId}`, { role });
    setActionLoading(false);
    setEditingRole(null);
    if (res.success) {
      fetchMembers();
      onChange?.();
    } else {
      setError(res.message || "Failed to update role");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !can.manageMembers) return;
    setActionLoading(true);
    const res = await api.delete(`/project/${projectId}/member/${deleteTarget._id}`);
    setActionLoading(false);
    setDeleteTarget(null);
    if (res.success) {
      fetchMembers();
      onChange?.();
    } else {
      setError(res.message || "Failed to remove member");
    }
  };

  if (loading) return <FullPageSpinner label="Loading members..." />;
  if (error) return <ErrorState message={error} onRetry={fetchMembers} />;

  return (
    <div className="space-y-6">
      {!embedded && (
        <Link
          to={`/projects/${projectId}`}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Back to project
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Members</h1>
          <p className="text-gray-500 mt-1">
            {can.manageMembers
              ? "Manage who has access to this project"
              : "You can view members but only admins can change them"}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          disabled={!can.manageMembers}
          title={!can.manageMembers ? NO_PERMISSION_TEXT : undefined}
          className={`btn-primary ${disabledClass}`}
        >
          <UserPlus size={18} /> Add Member
        </button>
      </div>
      {members.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Add team members to collaborate on this project."
            action={
              <button
                onClick={() => setShowAdd(true)}
                disabled={!can.manageMembers}
                title={!can.manageMembers ? NO_PERMISSION_TEXT : undefined}
                className={`btn-primary ${disabledClass}`}
              >
                <UserPlus size={18} /> Add Member
              </button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-3">Member</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-3">Role</th>
                <th className="text-right text-sm font-medium text-gray-600 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {member.user?.avatar?.url !== "https://placeholder.com/600x400" ? (
                          <img src={member.user.avatar.url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary-600">
                            {`${user.username?.charAt(0) || ""}${
                              user.fullname?.trim().split(/\s+/).slice(-1)[0]?.charAt(0) || ""
                            }`.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.user?.fullname}</p>
                        <p className="text-xs text-gray-500">@{member.user?.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {editingRole === member._id ? (
                      <select
                        defaultValue={member.role}
                        onChange={(e) => handleRoleChange(member._id, e.target.value)}
                        disabled={actionLoading || !can.manageMembers}
                        className={`input py-1.5 text-sm w-auto ${disabledClass}`}
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === "admin" ? "primary" : "default"}>
                          <Shield size={12} /> {member.role}
                        </Badge>
                        <button
                          onClick={() => setEditingRole(member._id)}
                          disabled={!can.manageMembers}
                          title={!can.manageMembers ? NO_PERMISSION_TEXT : "Change role"}
                          aria-label="Change role"
                          className={`p-1 text-gray-400 hover:text-gray-600 ${disabledClass}`}
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(member)}
                      disabled={!can.manageMembers}
                      title={!can.manageMembers ? NO_PERMISSION_TEXT : "Remove member"}
                      aria-label="Remove member"
                      className={`p-1.5 rounded-lg text-error-500 hover:bg-error-50 transition-colors ${disabledClass}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={showAdd && can.manageMembers} onClose={() => setShowAdd(false)} title="Add Member" size="md">
        {actionError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="member@example.com"
                className="input pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">The user must already have an account</p>
          </div>
          <div>
            <label className="label">Role</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input">
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={actionLoading} className="btn-primary flex-1">
              {actionLoading ? <ButtonSpinner /> : "Add Member"}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove member?"
        message={`Remove ${deleteTarget?.user?.fullname || "this member"} from the project?`}
        confirmLabel="Remove"
      />
    </div>
  );
}
