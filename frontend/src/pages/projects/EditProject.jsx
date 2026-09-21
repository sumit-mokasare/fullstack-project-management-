import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { ButtonSpinner } from '@/components/ui/Spinner';

export default function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      const res = await api.get(`/project/${projectId}`);
      setFetching(false);
      if (res.success) { setName(res.data.name || ''); setDescription(res.data.description || ''); }
      else { setError(res.message || 'Failed to load project'); }
    };
    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.patch(`/project/${projectId}`, { name, description });
    setLoading(false);
    if (res.success) { navigate(`/projects/${projectId}`); }
    else { setError(res.message || 'Failed to update project'); }
  };

  if (fetching) return <div className="flex justify-center py-20"><ButtonSpinner /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"><ArrowLeft size={16} /> Back</button>
      <div><h1 className="text-2xl font-bold text-gray-900">Edit Project</h1><p className="text-gray-500 mt-1">Update project details</p></div>
      <div className="card p-6">
        {error && <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4"><AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="label">Project Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required minLength={3} /></div>
          <div><label className="label">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[120px] resize-y" required minLength={5} /></div>
          <div className="flex gap-3"><button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? <ButtonSpinner /> : 'Save Changes'}</button><button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}
