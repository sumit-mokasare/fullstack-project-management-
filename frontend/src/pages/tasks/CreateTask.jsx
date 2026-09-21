import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Upload, X, FileText, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { ButtonSpinner } from '@/components/ui/Spinner';

const statuses = ['todo', 'in_progress', 'done'];

export default function CreateTask() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMembers = useCallback(async () => {
    const res = await api.get(`/project/getMember/${projectId}`);
    if (res.success) setMembers(res.data || []);
  }, [projectId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleFiles = (e) => { const selected = Array.from(e.target.files).slice(0, 3); setFiles(selected); };
  const removeFile = (idx) => { setFiles(files.filter((_, i) => i !== idx)); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('email', email);
    files.forEach((f) => formData.append('files', f));
    const res = await api.post(`/task/${projectId}`, formData, true);
    setLoading(false);
    if (res.success) { navigate(`/projects/${projectId}`); } else { setError(res.message || 'Failed to create task'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={`/projects/${projectId}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"><ArrowLeft size={16} /> Back to project</Link>
      <div><h1 className="text-2xl font-bold text-gray-900">Create Task</h1><p className="text-gray-500 mt-1">Assign a new task to a project member</p></div>
      <div className="card p-6">
        {error && <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4"><AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="label">Task Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="input" required minLength={3} /></div>
          <div><label className="label">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide more details about this task..." className="input min-h-[100px] resize-y" required minLength={5} /></div>
          <div><label className="label">Assign To</label><select value={email} onChange={(e) => setEmail(e.target.value)} className="input" required><option value="">Select a member</option>{members.map((m) => <option key={m._id} value={m.user?.email}>{m.user?.fullname} ({m.user?.email})</option>)}</select>{members.length === 0 && <p className="text-xs text-warning-600 mt-1">No members found. Add members to the project first.</p>}</div>
          <div><label className="label">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className="input">{statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></div>
          <div><label className="label">Attachments (max 3 files, 10MB each)</label><div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors"><input type="file" multiple onChange={handleFiles} className="hidden" id="file-upload" accept="image/*,.pdf,.doc,.docx,.txt" /><label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2"><Upload size={24} className="text-gray-400" /><span className="text-sm text-gray-500">Click to upload files</span></label></div>{files.length > 0 && <div className="mt-3 space-y-2">{files.map((file, idx) => <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"><FileText size={16} className="text-gray-400 flex-shrink-0" /><span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span><span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</span><button type="button" onClick={() => removeFile(idx)} className="p-1 text-gray-400 hover:text-error-500"><X size={14} /></button></div>)}</div>}</div>
          <div className="flex gap-3 pt-2"><button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? <ButtonSpinner /> : 'Create Task'}</button><button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}
