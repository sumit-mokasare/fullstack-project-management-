import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, StickyNote, Plus, Trash2, Pencil, AlertCircle, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { FullPageSpinner, ButtonSpinner } from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function NotesPage() {
  const { projectId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [content, setContent] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true); setError('');
    const res = await api.get(`/note/${projectId}`);
    setLoading(false);
    if (res.success) { setNotes(res.data || []); } else { setError(res.message || 'Failed to load notes'); }
  }, [projectId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleCreate = async (e) => {
    e.preventDefault(); setActionError(''); setActionLoading(true);
    const res = await api.post(`/note/${projectId}`, { content });
    setActionLoading(false);
    if (res.success) { setNotes([res.data, ...notes]); setContent(''); setShowCreate(false); } else { setActionError(res.message || 'Failed to create note'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setActionError(''); setActionLoading(true);
    const res = await api.put(`/note/${projectId}/notes/${showEdit._id}`, { content: showEdit.content });
    setActionLoading(false);
    if (res.success) { setNotes(notes.map((n) => (n._id === showEdit._id ? res.data : n))); setShowEdit(null); } else { setActionError(res.message || 'Failed to update note'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    const res = await api.delete(`/note/${projectId}/notes/${deleteTarget._id}`);
    setActionLoading(false); setDeleteTarget(null);
    if (res.success) { setNotes(notes.filter((n) => n._id !== deleteTarget._id)); }
  };

  if (loading) return <FullPageSpinner label="Loading notes..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotes} />;

  return (
    <div className="space-y-6">
      <Link to={`/projects/${projectId}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"><ArrowLeft size={16} /> Back to project</Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Project Notes</h1><p className="text-gray-500 mt-1">Important notes and updates for this project</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={18} /> Add Note</button>
      </div>
      {notes.length === 0 ? (
        <div className="card"><EmptyState icon={StickyNote} title="No notes yet" description="Add notes to keep your team informed about important details." action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={18} /> Add Note</button>} /></div>
      ) : (
        <div className="space-y-3">{notes.map((note) => (
          <div key={note._id} className="card p-5"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3 flex-1"><div className="h-9 w-9 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0"><StickyNote className="h-4 w-4 text-accent-600" /></div><div className="flex-1"><p className="text-gray-800 whitespace-pre-wrap">{note.content}</p><div className="flex items-center gap-2 mt-3 text-xs text-gray-400"><UserIcon size={12} /><span>{note.createdBy?.fullname || 'Unknown'}</span><span>·</span><span>{new Date(note.createdAt).toLocaleDateString()}</span></div></div></div><div className="flex gap-1 flex-shrink-0"><button onClick={() => setShowEdit(note)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><Pencil size={15} /></button><button onClick={() => setDeleteTarget(note)} className="p-1.5 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 transition-colors"><Trash2 size={15} /></button></div></div></div>
        ))}</div>
      )}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Note" size="md">
        {actionError && <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4"><AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{actionError}</span></div>}
        <form onSubmit={handleCreate} className="space-y-4"><div><label className="label">Note Content</label><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note here..." className="input min-h-[120px] resize-y" required /></div><div className="flex gap-3"><button type="submit" disabled={actionLoading} className="btn-primary flex-1">{actionLoading ? <ButtonSpinner /> : 'Add Note'}</button><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button></div></form>
      </Modal>
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Note" size="md">
        {actionError && <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4"><AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{actionError}</span></div>}
        {showEdit && <form onSubmit={handleEdit} className="space-y-4"><div><label className="label">Note Content</label><textarea value={showEdit.content} onChange={(e) => setShowEdit({ ...showEdit, content: e.target.value })} className="input min-h-[120px] resize-y" required /></div><div className="flex gap-3"><button type="submit" disabled={actionLoading} className="btn-primary flex-1">{actionLoading ? <ButtonSpinner /> : 'Save Changes'}</button><button type="button" onClick={() => setShowEdit(null)} className="btn-secondary">Cancel</button></div></form>}
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete note?" message="This note will be permanently deleted." confirmLabel="Delete" />
    </div>
  );
}
