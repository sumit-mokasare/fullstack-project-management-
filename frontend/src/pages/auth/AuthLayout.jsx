import { CheckSquare } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white" />
          <div className="absolute bottom-32 right-10 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-accent-400" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <CheckSquare className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">ProManage</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight">Manage projects, tasks, and teams — all in one place.</h1>
            <p className="mt-4 text-primary-100 text-lg">Create projects, assign tasks, track progress, and collaborate with your team seamlessly.</p>
          </div>
          <p className="text-primary-200 text-sm">© 2026 ProManage. All rights reserved.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">ProManage</span>
          </div>
          <div className="card p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500 mt-1.5 text-sm">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
