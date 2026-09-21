import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Users, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FullPageSpinner } from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    const res = await api.get('/project/getProject');
    setLoading(false);
    if (res.success) { setProjects(res.data || []); }
    else { setError(res.message || 'Failed to load projects'); }
  };

  useEffect(() => { fetchProjects(); }, []);

  if (loading) return <FullPageSpinner label="Loading your projects..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  const adminProjects = projects.filter((p) => p.role === 'admin');
  const memberProjects = projects.filter((p) => p.role !== 'admin');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullname?.split(' ')[0] || user?.username}</h1>
          <p className="text-gray-500 mt-1">Here's an overview of your projects</p>
        </div>
        <Link to="/projects/create" className="btn-primary"><Plus size={18} /> New Project</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Projects</p><p className="text-2xl font-bold text-gray-900 mt-1">{projects.length}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50"><FolderKanban className="h-5 w-5 text-primary-600" /></div></div></div>
        <div className="card p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">As Admin</p><p className="text-2xl font-bold text-gray-900 mt-1">{adminProjects.length}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50"><Users className="h-5 w-5 text-accent-600" /></div></div></div>
        <div className="card p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">As Member</p><p className="text-2xl font-bold text-gray-900 mt-1">{memberProjects.length}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50"><CheckSquare className="h-5 w-5 text-success-600" /></div></div></div>
        <div className="card p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Email Status</p><p className="text-sm font-bold text-gray-900 mt-1">{user?.isEmailVerified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Unverified</Badge>}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50"><Clock className="h-5 w-5 text-warning-600" /></div></div></div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Your Projects</h2></div>
        {projects.length === 0 ? (
          <div className="card"><EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to start managing tasks and collaborating with your team." action={<Link to="/projects/create" className="btn-primary"><Plus size={18} /> Create Project</Link>} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project._id} to={`/projects/${project._id}`} className="card p-5 hover:shadow-md hover:border-primary-200 transition-all group">
                <div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50"><FolderKanban className="h-5 w-5 text-primary-600" /></div><Badge variant={project.role === 'admin' ? 'primary' : 'default'}>{project.role}</Badge></div>
                <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                <div className="flex items-center gap-1 text-sm text-primary-600 mt-4 font-medium">View project <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
