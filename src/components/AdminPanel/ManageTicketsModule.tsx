import React, { useState } from 'react';
import { UserTicket } from '../../types';
import { LifeBuoy, MessageSquare, Send, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface ManageTicketsModuleProps {
  tickets: UserTicket[];
  setTickets: React.Dispatch<React.SetStateAction<UserTicket[]>>;
}

export const ManageTicketsModule: React.FC<ManageTicketsModuleProps> = ({ tickets, setTickets }) => {
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'Open' | 'In Progress' | 'Closed'>('Open');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const res = await apiFetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminReply,
          status: ticketStatus,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t.id === updated.id ? updated : t));
        setSelectedTicket(null);
        setAdminReply('');
      }
    } catch {
      alert('خطا در بروزرسانی تیکت');
    }
  };

  const openTicketModal = (t: UserTicket) => {
    setSelectedTicket(t);
    setAdminReply(t.adminReply || '');
    setTicketStatus(t.status);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>مدیریت تیکت‌های پشتیبانی و سفارشات</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          بررسی و پاسخگویی به درخواست‌های مشاوره و تیکت‌های ثبت شده توسط کاربران
        </p>
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => openTicketModal(ticket)}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:border-purple-500/50 cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">کد تیکت: {ticket.id}</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                ticket.status === 'Open'
                  ? 'bg-amber-100 text-amber-800'
                  : ticket.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {ticket.status === 'Open' ? 'در انتظار پاسخ' : ticket.status === 'In Progress' ? 'در حال بررسی' : 'پاسخ داده شده / بسته'}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {ticket.subject}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium">
              {ticket.message}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              <span>کاربر: {ticket.userName} ({ticket.userContact})</span>
              <span>{ticket.createdAt}</span>
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
            هیچ تیکت پشتیبانی ثبت نشده است.
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                پاسخ به تیکت {selectedTicket.id}
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>نام کاربر:</strong> {selectedTicket.userName}</p>
              <p><strong>اطلاعات تماس:</strong> {selectedTicket.userContact}</p>
              <p><strong>موضوع:</strong> {selectedTicket.subject}</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                {selectedTicket.message}
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تغییر وضعیت تیکت</label>
                <select
                  value={ticketStatus}
                  onChange={e => setTicketStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                >
                  <option value="Open">در انتظار پاسخ (Open)</option>
                  <option value="In Progress">در حال بررسی (In Progress)</option>
                  <option value="Closed">بسته شده / تکمیل (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">متن پاسخ مدیریت</label>
                <textarea
                  rows={4}
                  value={adminReply}
                  onChange={e => setAdminReply(e.target.value)}
                  placeholder="پاسخ مدیریت به کاربر یا یادداشت داخلی..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ثبت پاسخ و بروزرسانی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
