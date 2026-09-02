import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { adminAPI } from '../api/services';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (tab === 'users') adminAPI.getUsers().then((r) => setUsers(r.data)).catch(() => {});
    if (tab === 'feedback') adminAPI.getFeedback().then((r) => setFeedback(r.data)).catch(() => {});
  }, [tab]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <div className="flex gap-4 mb-6">
          {['users', 'feedback'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full capitalize ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-violet-500/10">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Goal</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="p-3">{u.full_name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.fitness_goal}</td>
                    <td className="p-3">{u.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => adminAPI.toggleUser(u.id).then(() => adminAPI.getUsers().then((r) => setUsers(r.data)))}
                        className="text-violet-500 text-xs hover:underline"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'feedback' && (
          <div className="space-y-4">
            {feedback.map((f) => (
              <div key={f.id} className={`glass-card p-4 ${f.is_read ? 'opacity-60' : ''}`}>
                <div className="flex justify-between">
                  <p className="font-semibold">{f.subject}</p>
                  {!f.is_read && (
                    <button onClick={() => adminAPI.markFeedbackRead(f.id)} className="text-xs text-violet-500">Mark read</button>
                  )}
                </div>
                <p className="text-sm text-slate-500">{f.name} — {f.email}</p>
                <p className="mt-2 text-sm">{f.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
