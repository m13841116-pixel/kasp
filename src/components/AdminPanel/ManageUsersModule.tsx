import React, { useState, useEffect } from 'react';
import { Users, Mail, Send, Search, ShieldCheck, UserCheck, MessageSquare, Check, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { apiFetch, getCsrfToken } from '../../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ManageUsersModuleProps {
  lang: 'fa' | 'en';
}

export const ManageUsersModule: React.FC<ManageUsersModuleProps> = ({ lang }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Message modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBroadcast, setIsBroadcast] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    apiFetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenMessageModal = (user: User | null = null, broadcast: boolean = false) => {
    setSelectedUser(user);
    setIsBroadcast(broadcast);
    setTitle('');
    setMessage('');
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: 'لطفاً موضوع و متن پیام را وارد کنید.' });
      return;
    }

    setSending(true);
    setStatusMsg(null);

    try {
      const csrfToken = await getCsrfToken();
      const res = await apiFetch('/api/admin/users/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          userId: isBroadcast ? undefined : selectedUser?.id,
          allUsers: isBroadcast,
          title: title.trim(),
          message: message.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({
          type: 'success',
          text: isBroadcast 
            ? `پیام همگانی با موفقیت برای ${data.count} کاربر ارسال شد.`
            : `پیام با موفقیت برای ${selectedUser?.name || 'کاربر'} ارسال شد.`
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setStatusMsg(null);
        }, 2000);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'خطا در ارسال پیام.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'ارتباط با سرور برقرار نشد.' });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = users.filter(u => u.role !== 'admin').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>مدیریت کاربران ثبت‌نامی</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مشاهده لیست تمامی کاربران ثبت‌نام شده و امکان ارسال پیام دایرکت یا همگانی
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="بروزرسانی لیست"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenMessageModal(null, true)}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
          >
            <Radio className="w-4 h-4" />
            <span>ارسال پیام همگانی به همه</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">کل کاربران سیستم</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{users.length} <span className="text-xs font-normal text-slate-400">نفر</span></p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">کاربران عادی / مشتریان</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{totalCustomers} <span className="text-xs font-normal text-slate-400">نفر</span></p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">مدیران سیستم</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalAdmins} <span className="text-xs font-normal text-slate-400">نفر</span></p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجو بر اساس نام یا ایمیل کاربر..."
          className="w-full pr-11 pl-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Users Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500">در حال دریافت لیست کاربران...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">کاربری یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">کاربر</th>
                  <th className="p-4">ایمیل / شناسه ارتباطی</th>
                  <th className="p-4">نقش دسترسی</th>
                  <th className="p-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const initial = (u.name || u.email || 'U').charAt(0).toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isAdmin 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                          }`}>
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name || 'کاربر بدون نام'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono dir-ltr text-right">
                        {u.email}
                      </td>
                      <td className="p-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>مدیر سیستم</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold text-[11px]">
                            <Users className="w-3.5 h-3.5" />
                            <span>کاربر مشتری</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-left">
                        <button
                          onClick={() => handleOpenMessageModal(u, false)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold flex items-center gap-1.5 transition-colors ml-auto text-[11px]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>ارسال پیام</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-scaleIn">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                <MessageSquare className="w-5 h-5" />
                <h3>
                  {isBroadcast ? 'ارسال پیام همگانی به همه کاربران' : `ارسال پیام به ${selectedUser?.name || selectedUser?.email}`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {statusMsg && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}>
                {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  عنوان / موضوع پیام
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: اطلاعیه مهم درباره بروزرسانی پنل"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  متن کامل پیام
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="متن پیام خود را برای کاربر بنویسید..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'در حال ارسال...' : 'ارسال پیام'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
