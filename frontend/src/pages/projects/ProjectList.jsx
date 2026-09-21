import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { FullPageSpinner } from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    const res = await api.get('/project/getProject');
    setLoading(false);
    if (res.success) { setProjects(res.data || []); }
    else { setError(res.message || 'Failed to load projects'); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <FullPageSpinner label="Loading projects..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Projects</h1><p className="text-gray-500 mt-1">Manage all your projects in one place</p></div>
        <Link to="/projects/create" className="btn-primary"><Plus size={18} /> New Project</Link>
      </div>
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="input pl-10" />
      </div>
      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={FolderKanban} title={search ? 'No matching projects' : 'No projects yet'} description={search ? 'Try a different search term.' : 'Create your first project to get started.'} action={!search && <Link to="/projects/create" className="btn-primary"><Plus size={18} /> Create Project</Link>} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} className="card p-5 hover:shadow-md hover:border-primary-200 transition-all group">
              <div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50"><FolderKanban className="h-5 w-5 text-primary-600" /></div><Badge variant={project.role === 'admin' ? 'primary' : 'default'}>{project.role}</Badge></div>
              <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
