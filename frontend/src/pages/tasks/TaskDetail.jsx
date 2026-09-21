import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Trash2, Plus, Check, X, FileText, User as UserIcon, Calendar, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import { FullPageSpinner, ButtonSpinner } from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const statuses = ['todo', 'in_progress', 'done'];
const statusVariants = { todo: 'default', in_progress: 'warning', done: 'success' };

export default function TaskDetail() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showSubtask, setShowSubtask] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskCompleted, setSubtaskCompleted] = useState(false);

  const fetchTask = useCallback(async () => {
    setLoading(true); setError('');
    const [taskRes, subRes] = await Promise.all([
      api.get(`/task/${projectId}/task/${taskId}`),
      api.get(`/task/${projectId}/subtask/${taskId}`).catch(() => null),
    ]);
    setLoading(false);
    if (taskRes.success) { setTask(taskRes.data); setEditTitle(taskRes.data.title || ''); setEditDesc(taskRes.data.description || ''); setEditEmail(taskRes.data.assignedTo?.email || ''); }
    else { setError(taskRes.message || 'Failed to load task'); }
    if (subRes?.success) setSubtasks(subRes.data || []); else setSubtasks([]);
  }, [projectId, taskId]);

  useEffect(() => { fetchTask(); }, [fetchTask]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    const res = await api.put(`/task/${projectId}/updateStatus/${taskId}`, { status: newStatus });
    setActionLoading(false);
    if (res.success) { setTask({ ...task, status: newStatus }); } else { setError(res.message || 'Failed to update status'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setActionLoading(true);
    const res = await api.put(`/task/${projectId}/task/${taskId}`, { title: editTitle, description: editDesc, email: editEmail });
    setActionLoading(false);
    if (res.success) { setTask(res.data); setShowEdit(false); } else { setError(res.message || 'Failed to update task'); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    const res = await api.delete(`/task/${projectId}/task/${taskId}`);
    setActionLoading(false);
    if (res.success) { navigate(`/projects/${projectId}`); } else { setError(res.message || 'Failed to delete task'); }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault(); setActionLoading(true);
    const res = await api.post(`/task/${projectId}/subtask/${taskId}`, { title: subtaskTitle, isCompleted: subtaskCompleted });
    setActionLoading(false);
    if (res.success) { setSubtasks([...subtasks, res.data]); setSubtaskTitle(''); setSubtaskCompleted(false); setShowSubtask(false); } else { setError(res.message || 'Failed to add subtask'); }
  };

  const toggleSubtask = async (subtask) => {
    setActionLoading(true);
    const res = await api.put(`/task/${projectId}/updatedSubTask/${taskId}/${subtask._id}`, { title: subtask.title, isCompleted: !subtask.isCompleted });
    setActionLoading(false);
    if (res.success) { setSubtasks(subtasks.map((s) => (s._id === subtask._id ? res.data : s))); }
  };

  const deleteSubtask = async (subtaskId) => {
    setActionLoading(true);
    const res = await api.delete(`/task/${projectId}/updatedSubTask/${taskId}/${subtaskId}`);
    setActionLoading(false);
    if (res.success) { setSubtasks(subtasks.filter((s) => s._id !== subtaskId)); }
  };

  if (loading) return <FullPageSpinner label="Loading task..." />;
  if (error) return <ErrorState message={error} onRetry={fetchTask} />;
  if (!task) return <ErrorState message="Task not found" />;

  return (
    <div className="space-y-6">
      <Link to={`/projects/${projectId}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"><ArrowLeft size={16} /> Back to project</Link>
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2"><Badge variant={statusVariants[task.status]}>{task.status.replace('_', ' ')}</Badge></div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600 mt-2">{task.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><UserIcon size={14} /> Assigned to: {task.assignedTo?.fullname || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><UserIcon size={14} /> Assigned by: {task.assignedBy?.fullname || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0"><button onClick={() => setShowEdit(true)} className="btn-secondary text-sm"><Pencil size={16} /> Edit</button><button onClick={() => setShowDelete(true)} className="btn-danger text-sm"><Trash2 size={16} /> Delete</button></div>
        </div>
        <div className="mt-5 pt-5 border-t border-gray-100"><label className="label">Change Status</label><div className="flex gap-2">{statuses.map((s) => <button key={s} onClick={() => handleStatusChange(s)} disabled={actionLoading || task.status === s} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${task.status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.replace('_', ' ')}</button>)}</div></div>
      </div>
      {task.attachments && task.attachments.length > 0 && (
        <div className="card p-5"><h3 className="font-semibold text-gray-900 mb-3">Attachments</h3><div className="space-y-2">{task.attachments.map((file, idx) => <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"><FileText size={18} className="text-gray-400 flex-shrink-0" /><span className="text-sm text-primary-600 flex-1 truncate">Attachment {idx + 1}</span><span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</span></a>)}</div></div>
      )}
      <div className="card p-5"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">Subtasks</h3><button onClick={() => setShowSubtask(true)} className="btn-ghost text-sm text-primary-600"><Plus size={16} /> Add Subtask</button></div>
        {subtasks.length === 0 ? (
          <EmptyState icon={Check} title="No subtasks" description="Break this task into smaller steps." />
        ) : (
          <div className="space-y-2">{subtasks.map((subtask) => <div key={subtask._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"><button onClick={() => toggleSubtask(subtask)} disabled={actionLoading} className={`flex h-5 w-5 items-center justify-center rounded border transition-colors flex-shrink-0 ${subtask.isCompleted ? 'bg-success-500 border-success-500 text-white' : 'border-gray-300 hover:border-primary-400'}`}>{subtask.isCompleted && <Check size={12} />}</button><span className={`text-sm flex-1 ${subtask.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>{subtask.title}</span><button onClick={() => deleteSubtask(subtask._id)} disabled={actionLoading} className="p-1 text-gray-400 hover:text-error-500 transition-colors"><Trash2 size={14} /></button></div>)}</div>
        )}
      </div>
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div><label className="label">Title</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input" required minLength={3} /></div>
          <div><label className="label">Description</label><textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="input min-h-[100px] resize-y" required minLength={5} /></div>
          <div><label className="label">Assign To (email)</label><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input" required /></div>
          <div className="flex gap-3 pt-2"><button type="submit" disabled={actionLoading} className="btn-primary flex-1">{actionLoading ? <ButtonSpinner /> : 'Save Changes'}</button><button type="button" onClick={() => setShowEdit(false)} className="btn-secondary">Cancel</button></div>
        </form>
      </Modal>
      <Modal isOpen={showSubtask} onClose={() => setShowSubtask(false)} title="Add Subtask" size="sm">
        <form onSubmit={handleAddSubtask} className="space-y-4">
          <div><label className="label">Subtask Title</label><input type="text" value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="What needs to be done?" className="input" required minLength={3} /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={subtaskCompleted} onChange={(e) => setSubtaskCompleted(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-700">Mark as completed</span></label>
          <div className="flex gap-3 pt-2"><button type="submit" disabled={actionLoading} className="btn-primary flex-1">{actionLoading ? <ButtonSpinner /> : 'Add Subtask'}</button><button type="button" onClick={() => setShowSubtask(false)} className="btn-secondary">Cancel</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete task?" message="This will permanently delete the task and all its subtasks. This cannot be undone." confirmLabel="Delete Task" />
    </div>
  );
}
