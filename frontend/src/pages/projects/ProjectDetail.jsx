import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Users, CheckSquare, StickyNote, Settings, Trash2, Plus, ArrowLeft, Calendar, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { FullPageSpinner } from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const statusColors = { todo: 'default', in_progress: 'warning', done: 'success' };

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showDelete, setShowDelete] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    const [projectRes, tasksRes, membersRes, notesRes] = await Promise.all([
      api.get(`/project/${projectId}`),
      api.get(`/task/${projectId}`).catch(() => null),
      api.get(`/project/getMember/${projectId}`),
      api.get(`/note/${projectId}`).catch(() => null),
    ]);
    setLoading(false);
    if (projectRes.success) { setProject(projectRes.data); } else { setError(projectRes.message || 'Failed to load project'); return; }
    if (tasksRes?.success) setTasks(tasksRes.data || []); else setTasks([]);
    if (membersRes.success) setMembers(membersRes.data || []); else setMembers([]);
    if (notesRes?.success) setNotes(notesRes.data || []); else setNotes([]);
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    const res = await api.delete(`/project/${projectId}`);
    if (res.success) { navigate('/projects'); } else { setError(res.message || 'Failed to delete project'); }
  };

  if (loading) return <FullPageSpinner label="Loading project..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!project) return <ErrorState message="Project not found" />;

  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
    { id: 'members', label: 'Members', icon: Users, count: members.length },
    { id: 'notes', label: 'Notes', icon: StickyNote, count: notes.length },
  ];

  return (
    <div className="space-y-6">
      <Link to="/projects" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-fit"><ArrowLeft size={16} /> All Projects</Link>
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 flex-shrink-0"><FolderKanban className="h-6 w-6 text-primary-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 mt-1">{project.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><UserIcon size={14} /> {project.createdBy?.fullname || 'Unknown'}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/projects/${projectId}/edit`} className="btn-secondary text-sm"><Settings size={16} /> Edit</Link>
            <button onClick={() => setShowDelete(true)} className="btn-danger text-sm"><Trash2 size={16} /> Delete</button>
          </div>
        </div>
      </div>
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <tab.icon size={16} />{tab.label}{tab.count !== undefined && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">{tab.count}</span>}
          </button>
        ))}
      </div>
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100"><CheckSquare className="h-5 w-5 text-gray-500" /></div><div><p className="text-sm text-gray-500">To Do</p><p className="text-xl font-bold text-gray-900">{todoCount}</p></div></div></div>
          <div className="card p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50"><CheckSquare className="h-5 w-5 text-warning-600" /></div><div><p className="text-sm text-gray-500">In Progress</p><p className="text-xl font-bold text-gray-900">{inProgressCount}</p></div></div></div>
          <div className="card p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50"><CheckSquare className="h-5 w-5 text-success-600" /></div><div><p className="text-sm text-gray-500">Done</p><p className="text-xl font-bold text-gray-900">{doneCount}</p></div></div></div>
        </div>
      )}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Link to={`/projects/${projectId}/tasks/create`} className="btn-primary text-sm"><Plus size={16} /> Create Task</Link></div>
          {tasks.length === 0 ? (
            <div className="card"><EmptyState icon={CheckSquare} title="No tasks yet" description="Create tasks and assign them to your team members." action={<Link to={`/projects/${projectId}/tasks/create`} className="btn-primary text-sm"><Plus size={16} /> Create Task</Link>} /></div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Link key={task._id} to={`/projects/${projectId}/tasks/${task._id}`} className="card p-4 hover:shadow-md hover:border-primary-200 transition-all block">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900">{task.title}</h3><p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p><div className="flex items-center gap-3 mt-2 text-xs text-gray-500"><span>Assigned to: {task.assignedTo?.fullname || 'N/A'}</span><span>by {task.assignedBy?.fullname || 'N/A'}</span></div></div>
                    <Badge variant={statusColors[task.status] || 'default'}>{task.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Link to={`/projects/${projectId}/members`} className="btn-primary text-sm"><Users size={16} /> Manage Members</Link></div>
          {members.length === 0 ? (
            <div className="card"><EmptyState icon={Users} title="No members" description="No members have been added to this project." /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member._id} className="card p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">{member.user?.avatar?.url ? <img src={member.user.avatar.url} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5 text-primary-600" />}</div><div className="min-w-0"><p className="font-medium text-gray-900 truncate">{member.user?.fullname}</p><p className="text-xs text-gray-500 truncate">{member.user?.username}</p></div><Badge variant={member.role === 'admin' ? 'primary' : 'default'} className="ml-auto">{member.role}</Badge></div></div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="card"><EmptyState icon={StickyNote} title="No notes" description="Project notes will appear here once created." /></div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note._id} className="card p-4"><div className="flex items-start gap-3"><div className="h-9 w-9 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0"><StickyNote className="h-4 w-4 text-accent-600" /></div><div className="flex-1"><p className="text-gray-800 whitespace-pre-wrap">{note.content}</p><p className="text-xs text-gray-400 mt-2">by {note.createdBy?.fullname || 'Unknown'} · {new Date(note.createdAt).toLocaleDateString()}</p></div></div></div>
              ))}
            </div>
          )}
        </div>
      )}
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete project?" message="This will permanently delete the project, its members, and all associated notes. This cannot be undone." confirmLabel="Delete Project" />
    </div>
  );
}
