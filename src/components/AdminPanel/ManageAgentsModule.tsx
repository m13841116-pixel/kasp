import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Pencil, 
  Trash2, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Search, 
  DollarSign 
} from 'lucide-react';
import { AIAgent } from '../../types';

interface ManageAgentsModuleProps {
  agents: AIAgent[];
  onAddAgent: (agent: Omit<AIAgent, 'id' | 'subscribers' | 'monthlyRevenue'>) => void;
  onEditAgent: (agent: AIAgent) => void;
  onDeleteAgent: (id: string) => void;
  lang: 'fa' | 'en';
}

export const ManageAgentsModule: React.FC<ManageAgentsModuleProps> = ({
  agents,
  onAddAgent,
  onEditAgent,
  onDeleteAgent,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [price, setPrice] = useState('50,000 Tomans/month');
  const [category, setCategory] = useState('AI Tools');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Maintenance'>('Active');
  const [featuresInput, setFeaturesInput] = useState('Persian Natural Language, Instant Subdomain Hook, API Key');

  const filteredAgents = agents.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingAgent(null);
    setTitle('');
    setDescription('');
    setSubdomain('agent1.kasp.ir');
    setPrice('50,000 Tomans/month');
    setCategory('AI Tools');
    setStatus('Active');
    setFeaturesInput('Persian Language Support, High Uptime, REST API');
    setIsModalOpen(true);
  };

  const openEditModal = (agent: AIAgent) => {
    setEditingAgent(agent);
    setTitle(agent.title);
    setDescription(agent.description);
    setSubdomain(agent.subdomain);
    setPrice(agent.price);
    setCategory(agent.category);
    setStatus(agent.status);
    setFeaturesInput(agent.features.join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subdomain) return;

    const featuresList = featuresInput.split(',').map(f => f.trim()).filter(Boolean);

    if (editingAgent) {
      onEditAgent({
        ...editingAgent,
        title,
        description,
        subdomain,
        price,
        category,
        status,
        features: featuresList,
      });
    } else {
      onAddAgent({
        title,
        description,
        subdomain,
        price,
        priceNum: parseInt(price.replace(/[^0-9]/g, '')) || 50000,
        category,
        status,
        icon: 'Bot',
        features: featuresList,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bot className="w-8 h-8 text-purple-500" />
            <span>{lang === 'fa' ? 'مدیریت ایجنت‌های هوش مصنوعی' : 'Manage AI Agents'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'fa' 
              ? 'تعریف ابزارهای جدید، تنظیم ساب‌دومین اختصاصی (*.kasp.ir) و تغییر قیمتها'
              : 'Add new micro-apps, bind custom subdomain URLs, and update pricing.'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'fa' ? 'افزودن ایجنت جدید (Add New Agent)' : 'Add New Agent'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={lang === 'fa' ? 'جستجو بر اساس نام، ساب‌دومین یا دسته‌بندی...' : 'Search by title, subdomain URL, or category...'}
          className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder-slate-500"
        />
      </div>

      {/* Agents Data Table */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase font-mono border-b border-slate-200/60 dark:border-slate-800">
              <tr>
                <th className="p-4">{lang === 'fa' ? 'عنوان ایجنت' : 'Agent Title'}</th>
                <th className="p-4">{lang === 'fa' ? 'آدرس اپلیکیشن (URL)' : 'App URL'}</th>
                <th className="p-4">{lang === 'fa' ? 'قیمت اشتراک' : 'Monthly Price'}</th>
                <th className="p-4">{lang === 'fa' ? 'دسته‌بندی' : 'Category'}</th>
                <th className="p-4">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="p-4 text-right">{lang === 'fa' ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{agent.title}</span>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-blue-500 dark:text-blue-400">
                    <a 
                      href={agent.subdomain.startsWith('http') ? agent.subdomain : `https://${agent.subdomain}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px] inline-block">{agent.subdomain}</span>
                    </a>
                  </td>

                  <td className="p-4 font-semibold text-emerald-400">
                    {agent.price}
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {agent.category}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      agent.status === 'Active' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {agent.status}
                    </span>
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(agent)}
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title="Edit Agent"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAgent(agent.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete Agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-700 space-y-6 relative shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <span>{editingAgent ? 'ویرایش ایجنت' : 'افزودن ایجنت جدید (Add New Agent)'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-bold mb-1">نام ایجنت (Agent Name) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: Kasp AI Translator"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  آدرس وب‌سایت یا اپلیکیشن (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-blue-600 dark:text-blue-400 focus:outline-none focus:border-purple-500 dir-ltr text-left"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  آدرس دقیق پروژه‌ای که طراحی کرده‌اید (مثلاً آدرس خروجی Google AI Studio)
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">توضیحات کوتاه (Description)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیح مختصر عملکرد ایجنت..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">قیمت اشتراک (Price)</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50,000 Tomans/month"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-emerald-400 font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">دسته‌بندی (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="AI Tools">AI Tools</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Dev Tool">Dev Tool</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ویژگی‌ها (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="پشتیبانی زبان فارسی, API Endpoint, تحویل آنی"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/20"
                >
                  {editingAgent ? 'ذخیره تغییرات' : 'افزودن ایجنت'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
