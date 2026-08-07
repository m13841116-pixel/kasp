export interface AIAgent {
  id: string;
  title: string;
  description: string;
  subdomain: string;
  price: string;
  priceNum: number;
  subscribers: number;
  monthlyRevenue: string;
  category: string;
  icon: string;
  status: 'Active' | 'Draft' | 'Maintenance';
  features: string[];
}

export interface BannerConfig {
  headline: string;
  subheadline: string;
  discountBadge: string;
  primaryCta: string;
  secondaryCta: string;
  bannerImage: string;
  telegramContact?: string;
  phoneContact?: string;
  emailContact?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  features: string[];
  estimatedDelivery: string;
  orderNum: number;
  isActive: boolean;
}

export interface Freelancer {
  id: string;
  fullName: string;
  phone: string;
  primarySkill: 'Frontend' | 'Backend' | 'WordPress' | 'AI & ML' | 'UI/UX' | 'Full-Stack' | 'Mobile' | 'DevOps';
  rate: string;
  rateNum: number;
  notes: string;
  experience: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  rating: number;
  completedProjects: number;
  status: 'Available' | 'On Project' | 'Busy';
  email?: string;
  githubUrl?: string;
}

export interface AppRequest {
  id: string;
  userName: string;
  contactInfo: string;
  projectType?: string;
  idea: string;
  budget: number;
  timestamp: string;
  status: 'Pending' | 'Analyzed' | 'Accepted' | 'In Development' | 'Completed';
  aiAnalysis?: {
    feasibilityScore: number;
    recommendedStack: string[];
    estimatedTimeline: string;
    summary: string;
  };
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  bgGradient: string;
  isActive: boolean;
  displayOrder?: number;
}

export interface UserTicket {
  id: string;
  userName: string;
  userContact: string;
  subject: string;
  category: 'General' | 'Order' | 'Technical' | 'Custom App';
  message: string;
  status: 'Open' | 'In Progress' | 'Closed';
  createdAt: string;
  adminReply?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'User' | 'Admin';
}
