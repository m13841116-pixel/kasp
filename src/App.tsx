import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BannersCarousel } from './components/BannersCarousel';
import { ServicesSection } from './components/ServicesSection';
import { PricingSection } from './components/PricingSection';
import { AgentsCarousel } from './components/AgentsCarousel';
import { ProcessSection } from './components/ProcessSection';
import { CustomAppSection } from './components/CustomAppSection';
import { LuckyWheel } from './components/LuckyWheel';
import { FaqSection } from './components/FaqSection';
import { TicketModal } from './components/TicketModal';
import { Footer } from './components/Footer';
import { ProposalModal } from './components/ProposalModal';
import { AgentPreviewModal } from './components/AgentPreviewModal';
import { PaymentModal } from './components/PaymentModal';

import type { AdminTab } from './components/AdminPanel/Sidebar';
import { 
  initialAgents, 
  initialBannerConfig, 
  initialFreelancers, 
  initialAppRequests,
  initialServices,
  initialPromoBanners,
  initialTickets
} from './data/mockData';
import { AIAgent, BannerConfig, Freelancer, AppRequest, ServiceItem, PromoBanner, UserTicket } from './types';
import { Loader2, Zap, ArrowLeft, Bot, Headphones } from 'lucide-react';
import { apiFetch, getCsrfToken } from './utils/api';

// Lazy loading Admin components for performance and code-splitting
const Sidebar = lazy(() => import('./components/AdminPanel/Sidebar').then(m => ({ default: m.Sidebar })));
const DashboardModule = lazy(() => import('./components/AdminPanel/DashboardModule').then(m => ({ default: m.DashboardModule })));
const ManageAgentsModule = lazy(() => import('./components/AdminPanel/ManageAgentsModule').then(m => ({ default: m.ManageAgentsModule })));
const ManageServicesModule = lazy(() => import('./components/AdminPanel/ManageServicesModule').then(m => ({ default: m.ManageServicesModule })));
const ManageBannersModule = lazy(() => import('./components/AdminPanel/ManageBannersModule').then(m => ({ default: m.ManageBannersModule })));
const ManageTicketsModule = lazy(() => import('./components/AdminPanel/ManageTicketsModule').then(m => ({ default: m.ManageTicketsModule })));
const FreelancerCRMModule = lazy(() => import('./components/AdminPanel/FreelancerCRMModule').then(m => ({ default: m.FreelancerCRMModule })));
const SiteSettingsModule = lazy(() => import('./components/AdminPanel/SiteSettingsModule').then(m => ({ default: m.SiteSettingsModule })));
const PaymentSettingsModule = lazy(() => import('./components/AdminPanel/PaymentSettingsModule').then(m => ({ default: m.PaymentSettingsModule })));
const PaymentReceiptsModule = lazy(() => import('./components/AdminPanel/PaymentReceiptsModule').then(m => ({ default: m.PaymentReceiptsModule })));
const AuthForm = lazy(() => import('./components/AuthForm').then(m => ({ default: m.AuthForm })));
const CustomerDashboard = lazy(() => import('./components/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'admin'>('landing');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  const [lang, setLang] = useState<'fa' | 'en'>('fa');

  // Force Dark Theme for a sleek, high-contrast dark visual experience
  const [theme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Application Database States
  const [agents, setAgents] = useState<AIAgent[]>(initialAgents);
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>(initialPromoBanners);
  const [tickets, setTickets] = useState<UserTicket[]>(initialTickets);
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(initialBannerConfig);
  const [freelancers, setFreelancers] = useState<Freelancer[]>(initialFreelancers);
  const [appRequests, setAppRequests] = useState<AppRequest[]>(initialAppRequests);

  // Modal States
  const [proposalFreelancer, setProposalFreelancer] = useState<Freelancer | null>(null);
  const [previewAgent, setPreviewAgent] = useState<AIAgent | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [paymentModalTarget, setPaymentModalTarget] = useState<{ title: string; price: string } | null>(null);

  // Support hash routing (#admin)
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname.includes('admin')) {
        setActiveTab('admin');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Add CSRF Token fetching and unauthorized event listener
  useEffect(() => {
    getCsrfToken();

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setUserRole(null);
      setActiveTab('admin');
    };

    window.addEventListener('app:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('app:unauthorized', handleUnauthorized);
    };
  }, []);

  // Fetch Public Database Records on mount
  const fetchPublicData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        apiFetch('/api/agents'),
        apiFetch('/api/services'),
        apiFetch('/api/promo-banners'),
        apiFetch('/api/banner-config'),
      ]);
      
      if (results[0].status === 'fulfilled' && results[0].value.ok) setAgents(await results[0].value.json());
      if (results[1].status === 'fulfilled' && results[1].value.ok) setServices(await results[1].value.json());
      if (results[2].status === 'fulfilled' && results[2].value.ok) setPromoBanners(await results[2].value.json());
      if (results[3].status === 'fulfilled' && results[3].value.ok) setBannerConfig(await results[3].value.json());
    } catch (err) {
      console.error('Error fetching public data:', err);
    }
  }, []);

  // Fetch Protected Admin Database Records
  const fetchAdminData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        apiFetch('/api/admin/agents'),
        apiFetch('/api/admin/services'),
        apiFetch('/api/admin/promo-banners'),
        apiFetch('/api/admin/tickets'),
        apiFetch('/api/admin/freelancers'),
        apiFetch('/api/admin/app-requests'),
        apiFetch('/api/banner-config'),
      ]);
      
      if (results[0].status === 'fulfilled' && results[0].value.ok) setAgents(await results[0].value.json());
      if (results[1].status === 'fulfilled' && results[1].value.ok) setServices(await results[1].value.json());
      if (results[2].status === 'fulfilled' && results[2].value.ok) setPromoBanners(await results[2].value.json());
      if (results[3].status === 'fulfilled' && results[3].value.ok) setTickets(await results[3].value.json());
      if (results[4].status === 'fulfilled' && results[4].value.ok) setFreelancers(await results[4].value.json());
      if (results[5].status === 'fulfilled' && results[5].value.ok) setAppRequests(await results[5].value.json());
      if (results[6].status === 'fulfilled' && results[6].value.ok) setBannerConfig(await results[6].value.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, []);

  // Check Auth Session
  const checkSession = useCallback(async () => {
    setIsAuthChecking(true);
    try {
      const res = await apiFetch('/api/auth/check');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUserRole(data.role);
          if (data.role === 'admin') {
            await fetchAdminData();
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setIsAuthChecking(false);
    }
  }, [fetchAdminData]);

  useEffect(() => {
    fetchPublicData();
    checkSession();
  }, [fetchPublicData, checkSession]);

  useEffect(() => {
    if (activeTab === 'admin' && isAuthenticated) {
      fetchAdminData();
    }
  }, [activeTab, isAuthenticated, fetchAdminData]);

  const scrollToSection = (id: string) => {
    setActiveTab('landing');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveTab('landing');
  };

  // Agent Actions
  const handleAddAgent = async (newAgentData: Omit<AIAgent, 'id' | 'subscribers' | 'monthlyRevenue'>) => {
    try {
      const res = await apiFetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAgentData,
          subscribers: 0,
          monthlyRevenue: '۰ تومان',
        }),
      });
      if (res.ok) {
        const createdAgent = await res.json();
        setAgents(prev => [createdAgent, ...prev]);
      }
    } catch (err) {
      console.error('Error adding agent:', err);
    }
  };

  const handleEditAgent = async (updatedAgent: AIAgent) => {
    try {
      const res = await apiFetch(`/api/admin/agents/${updatedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAgent),
      });
      if (res.ok) {
        const saved = await res.json();
        setAgents(prev => prev.map(a => a.id === saved.id ? saved : a));
      }
    } catch (err) {
      console.error('Error updating agent:', err);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/agents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAgents(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Error deleting agent:', err);
    }
  };

  // Freelancers
  const handleAddFreelancer = async (newFreeData: Omit<Freelancer, 'id' | 'completedProjects' | 'rating'>) => {
    try {
      const res = await apiFetch('/api/admin/freelancers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFreeData,
          completedProjects: 0,
          rating: 5.0,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setFreelancers(prev => [created, ...prev]);
      }
    } catch (err) {
      console.error('Error adding freelancer:', err);
    }
  };

  const handleDeleteFreelancer = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/freelancers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFreelancers(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error('Error deleting freelancer:', err);
    }
  };

  // Banner Config Update
  const handleUpdateBannerConfig = async (newConfig: BannerConfig) => {
    try {
      const res = await apiFetch('/api/admin/banner-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        const savedConfig = await res.json();
        setBannerConfig(savedConfig);
      }
    } catch (err) {
      console.error('Error updating banner config:', err);
    }
  };

  // App Request Submission
  const handleCustomAppSubmit = async (req: Omit<AppRequest, 'id' | 'timestamp' | 'status'>) => {
    try {
      const res = await apiFetch('/api/app-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        const createdReq = await res.json();
        setAppRequests(prev => [createdReq, ...prev]);
      }
    } catch (err) {
      console.error('Error submitting app request:', err);
    }
  };

  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onScrollToSection={scrollToSection}
        onOpenTicketModal={() => setIsTicketModalOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setActiveTab('admin');
        }}
      />

      {/* VIEW 1: MAIN LANDING PAGE */}
      {activeTab === 'landing' && (
        <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto animate-fadeIn relative">
          
          {/* Main Content Area */}
          <main className="flex-1 w-full lg:w-[calc(100%-340px)] order-2 lg:order-1">
            {/* Hero Section */}
            <HeroSection
              bannerConfig={bannerConfig}
              onExploreAgents={() => scrollToSection('agents')}
              onRequestCustomApp={() => scrollToSection('custom-app')}
              lang={lang}
            />

            {/* Promotional Banners Slider */}
            <BannersCarousel banners={promoBanners} onRequestCustomApp={() => scrollToSection('custom-app')} />

            {/* Services & Core Capabilities */}
            <ServicesSection services={services} onRequestCustomApp={() => scrollToSection('custom-app')} />

            {/* Pricing Section */}
            <PricingSection />

            {/* AI Agents & Products Showcase Carousel (Optional since we have the sidebar now, but keeping for mobile/full view) */}
            <AgentsCarousel
              agents={agents.filter(a => a.status === 'Active')}
              onTryAgent={(agent) => setPreviewAgent(agent)}
              onOpenPayment={(title, price) => setPaymentModalTarget({ title, price })}
              lang={lang}
            />

            {/* 4-Step Development Process */}
            <ProcessSection />

            {/* Custom Project Order */}
            <CustomAppSection
              onSubmitRequest={handleCustomAppSubmit}
              lang={lang}
            />

            {/* FAQ Accordion Section */}
            <FaqSection />

            {/* Production Footer */}
            <Footer lang={lang} onOpenTicketModal={() => setIsTicketModalOpen(true)} />
          </main>

          {/* Right Sidebar for Agents / Tools */}
          <aside className="hidden lg:block w-[340px] shrink-0 border-r lg:border-r-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md sticky top-0 h-screen overflow-y-auto z-40 order-1 lg:order-2 custom-scrollbar">
            <div className="p-6 pb-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black">ابزارهای هوش مصنوعی</h2>
                  <p className="text-xs text-slate-500">دسترسی سریع به سرویس‌ها</p>
                </div>
              </div>

              <div className="space-y-4">
                {agents.filter(a => a.status === 'Active').map(agent => (
                  <div 
                    key={agent.id} 
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/50 transition-all cursor-pointer group" 
                    onClick={() => setPreviewAgent(agent)}
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-600">
                        <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{agent.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{agent.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {agents.filter(a => a.status === 'Active').length === 0 && (
                  <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">در حال حاضر ابزاری در دسترس نیست.</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <LuckyWheel onRequestCustomApp={() => scrollToSection('custom-app')} />
        </div>
      )}

      {/* VIEW 2: AUTH & DASHBOARD CONTROL CENTER */}
      {activeTab === 'admin' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-80px)]">
          <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
            {!isAuthenticated ? (
              /* Login Screen when unauthenticated */
              <AuthForm
                initialMode={authMode}
                onLoginSuccess={async (role) => {
                  setIsAuthenticated(true);
                  setUserRole(role);
                  if (role === 'admin') {
                    await fetchAdminData();
                  }
                }}
              />
            ) : userRole === 'customer' ? (
              /* Customer Workspace Dashboard */
              <CustomerDashboard onLogout={handleLogout} />
            ) : (
              /* Admin Workspace Dashboard */
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Admin Sidebar Navigation */}
                <Sidebar
                  activeAdminTab={activeAdminTab}
                  setActiveAdminTab={setActiveAdminTab}
                  onBackToLanding={() => setActiveTab('landing')}
                  onLogout={handleLogout}
                  lang={lang}
                />

                {/* Admin Workspace Content View */}
                <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-colors overflow-hidden">
                  {activeAdminTab === 'dashboard' && (
                    <DashboardModule
                      agents={agents}
                      freelancers={freelancers}
                      requests={appRequests}
                      lang={lang}
                    />
                  )}

                  {activeAdminTab === 'agents' && (
                    <ManageAgentsModule
                      agents={agents}
                      onAddAgent={handleAddAgent}
                      onEditAgent={handleEditAgent}
                      onDeleteAgent={handleDeleteAgent}
                      lang={lang}
                    />
                  )}

                  {activeAdminTab === 'services' && (
                    <ManageServicesModule
                      services={services}
                      setServices={setServices}
                    />
                  )}

                  {activeAdminTab === 'banners' && (
                    <ManageBannersModule
                      bannerConfig={bannerConfig}
                      onUpdateBannerConfig={handleUpdateBannerConfig}
                      lang={lang}
                    />
                  )}

                  {activeAdminTab === 'tickets' && (
                    <ManageTicketsModule
                      tickets={tickets}
                      setTickets={setTickets}
                    />
                  )}

                  {activeAdminTab === 'crm' && (
                    <FreelancerCRMModule
                      freelancers={freelancers}
                      onAddFreelancer={handleAddFreelancer}
                      onDeleteFreelancer={handleDeleteFreelancer}
                      onOpenProposalModal={(freelancer) => setProposalFreelancer(freelancer)}
                      lang={lang}
                    />
                  )}

                  {activeAdminTab === 'settings' && (
                    <SiteSettingsModule
                      bannerConfig={bannerConfig}
                      setBannerConfig={setBannerConfig}
                    />
                  )}

                  {activeAdminTab === 'payments' && (
                    <PaymentSettingsModule />
                  )}

                  {activeAdminTab === 'receipts' && (
                    <PaymentReceiptsModule />
                  )}
                </main>

              </div>
            )}
          </Suspense>
        </div>
      )}

      {/* Modals */}
      <ProposalModal
        freelancer={proposalFreelancer}
        onClose={() => setProposalFreelancer(null)}
        lang={lang}
      />

      <AgentPreviewModal
        agent={previewAgent}
        onClose={() => setPreviewAgent(null)}
        lang={lang}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      {/* Floating Advice / Consultation Button */}
      {userRole !== 'admin' && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 border border-white/20 font-bold text-xs animate-bounce"
            title="درخواست مشاوره رایگان و ارسال تیکت به مدیریت"
          >
            <Headphones className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">مشاوره رایگان و پشتیبانی</span>
          </button>
        </div>
      )}

      {paymentModalTarget && (
        <PaymentModal
          isOpen={!!paymentModalTarget}
          onClose={() => setPaymentModalTarget(null)}
          itemTitle={paymentModalTarget.title}
          amount={paymentModalTarget.price}
          lang={lang}
        />
      )}

    </div>
  );
}
