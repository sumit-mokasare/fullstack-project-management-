import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Mail, AlertCircle, User as UserIcon, Shield, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { FullPageSpinner, ButtonSpinner } from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const roles = ['admin', 'project_admin', 'project_manger', 'member'];

export default function ProjectMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [editingRole, setEditingRole] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true); setError('');
    const res = await api.get(`/project/getMember/${projectId}`);
    setLoading(false);
    if (res.success) { setMembers(res.data || []); } else { setError(res.message || 'Failed to load members'); }
  }, [projectId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleAdd = async (e) => {
    e.preventDefault(); setActionError(''); setActionLoading(true);
    const res = await api.post(`/project/${projectId}/member`, { email: newEmail, role: newRole });
    setActionLoading(false);
    if (res.success) { setShowAdd(false); setNewEmail(''); setNewRole('member'); fetchMembers(); } else { setActionError(res.message || 'Failed to add member'); }
  };

  const handleRoleChange = async (memberId, role) => {
    setActionLoading(true);
    const res = await api.post(`/project/${projectId}/member/${memberId}`, { role });
    setActionLoading(false); setEditingRole(null);
    if (res.success) { fetchMembers(); } else { setError(res.message || 'Failed to update role'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    const res = await api.delete(`/project/${projectId}/member/${deleteTarget._id}`);
    setActionLoading(false); setDeleteTarget(null);
    if (res.success) { fetchMembers(); } else { setError(res.message || 'Failed to remove member'); }
  };

  if (loading) return <FullPageSpinner label="Loading members..." />;
  if (error) return <ErrorState message={error} onRetry={fetchMembers} />;

  return (
    <div className="space-y-6">
      <Link to={`/projects/${projectId}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"><ArrowLeft size={16} /> Back to project</Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Project Members</h1><p className="text-gray-500 mt-1">Manage who has access to this project</p></div>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><UserPlus size={18} /> Add Member</button>
      </div>
      {members.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No members yet" description="Add team members to collaborate on this project." action={<button onClick={() => setShowAdd(true)} className="btn-primary"><UserPlus size={18} /> Add Member</button>} /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left text-sm font-medium text-gray-600 px-6 py-3">Member</th><th className="text-left text-sm font-medium text-gray-600 px-6 py-3">Role</th><th className="text-right text-sm font-medium text-gray-600 px-6 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">{member.user?.avatar?.url ? <img src={member.user.avatar.url} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-4 w-4 text-primary-600" />}</div><div><p className="font-medium text-gray-900">{member.user?.fullname}</p><p className="text-xs text-gray-500">@{member.user?.username}</p></div></div></td>
                  <td className="px-6 py-3">
                    {editingRole === member._id ? (
                      <select defaultValue={member.role} onChange={(e) => handleRoleChange(member._id, e.target.value)} disabled={actionLoading} className="input py-1.5 text-sm w-auto">{roles.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                    ) : (
                      <div className="flex items-center gap-2"><Badge variant={member.role === 'admin' ? 'primary' : 'default'}><Shield size={12} /> {member.role}</Badge><button onClick={() => setEditingRole(member._id)} className="p-1 text-gray-400 hover:text-gray-600"><RefreshCw size={14} /></button></div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right"><button onClick={() => setDeleteTarget(member)} className="p-1.5 rounded-lg text-error-500 hover:bg-error-50 transition-colors"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Member" size="md">
        {actionError && <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4"><AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{actionError}</span></div>}
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="label">Email address</label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="member@example.com" className="input pl-10" required /></div><p className="text-xs text-gray-400 mt-1">The user must already have an account</p></div>
          <div><label className="label">Role</label><select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input">{roles.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
          <div className="flex gap-3 pt-2"><button type="submit" disabled={actionLoading} className="btn-primary flex-1">{actionLoading ? <ButtonSpinner /> : 'Add Member'}</button><button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Remove member?" message={`Remove ${deleteTarget?.user?.fullname || 'this member'} from the project?`} confirmLabel="Remove" />
    </div>
  );
}
