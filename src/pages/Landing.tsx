import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Search,
  Brain,
  GitBranch,
  ShieldCheck,
  Shield,
  ArrowRight,
  Lock,
  Key,
  Users,
  FileText,
  CheckCircle,
  Gauge,
  Upload,
  Webhook,
  Mail,
  Database,
  Linkedin,
  Zap,
  Menu,
  X,
} from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#pricing' },
];

const benefits = [
  {
    icon: Search,
    title: 'AI-Powered Discovery',
    description:
      'Automatically find and score AI project opportunities across LinkedIn, matching your expertise with high-intent prospects.',
  },
  {
    icon: Brain,
    title: 'Smart Qualification',
    description:
      'AI analyzes intent signals, budget confidence, and technical fit to prioritize leads most likely to convert.',
  },
  {
    icon: GitBranch,
    title: 'Pipeline Management',
    description:
      'Kanban-style project pipeline with drag-and-drop status tracking from discovery through to closed deals.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliant Outreach',
    description:
      'Review-before-send messaging with AI-powered personalization that respects LinkedIn platform policies.',
  },
];

const steps = [
  {
    number: 1,
    title: 'Connect',
    description: 'Link your LinkedIn API or import data from CSV files to get started in minutes.',
  },
  {
    number: 2,
    title: 'Discover',
    description: 'AI finds, scores, and qualifies opportunities that match your ideal client profile.',
  },
  {
    number: 3,
    title: 'Win',
    description: 'Manage outreach sequences, track engagement, and close deals faster.',
  },
];

const integrations = [
  { icon: Linkedin, name: 'LinkedIn API', color: 'bg-[#0a66c2]' },
  { icon: Upload, name: 'CSV Import', color: 'bg-emerald-500' },
  { icon: Webhook, name: 'Webhooks', color: 'bg-violet-500' },
  { icon: Mail, name: 'Email', color: 'bg-orange-500' },
  { icon: Database, name: 'CRM Systems', color: 'bg-cyan-500' },
];

const securityFeatures = [
  { icon: Lock, title: 'OAuth 2.0 Authentication', description: 'Secure token-based access with automatic renewal' },
  { icon: Key, title: 'Encrypted API Keys', description: 'AES-256 encryption for all stored credentials' },
  { icon: Users, title: 'Role-Based Access', description: 'Granular permissions for team collaboration' },
  { icon: FileText, title: 'Audit Logging', description: 'Complete activity trail for compliance and review' },
  { icon: CheckCircle, title: 'Data Compliance', description: 'GDPR-ready with configurable data retention policies' },
  { icon: Gauge, title: 'Rate Limit Management', description: 'Intelligent throttling to respect API quotas' },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: '$99',
    period: '/mo',
    description: 'For solo practitioners getting started',
    features: ['500 leads per month', '1 user', 'Basic AI scoring', 'Email support'],
    cta: 'Start Free Trial',
    action: '/signup' as const,
    featured: false,
  },
  {
    name: 'Professional',
    price: '$249',
    period: '/mo',
    description: 'For growing teams and consultancies',
    features: [
      '2,500 leads per month',
      '5 users',
      'Advanced AI scoring',
      'Outreach sequences',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    action: '/signup' as const,
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced needs',
    features: [
      'Unlimited leads',
      'Unlimited users',
      'Custom AI models',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    action: '/signup' as const,
    featured: false,
  },
];

function getFooterLinkHref(label: string): string {
  switch (label) {
    case 'Features':
      return '#features';
    case 'Pricing':
      return '#pricing';
    case 'Integrations':
      return '#integrations';
    case 'Privacy Policy':
      return '#privacy';
    case 'Terms of Service':
      return '#terms';
    case 'Help Center':
      return 'mailto:support@leadgen.ai';
    case 'Contact Us':
      return 'mailto:contact@leadgen.ai';
    default:
      return '#';
  }
}

function isExternalLink(label: string): boolean {
  return ['Help Center', 'Contact Us'].includes(label);
}

function isScrollLink(label: string): boolean {
  return ['Features', 'Pricing', 'Integrations', 'Privacy Policy', 'Terms of Service'].includes(label);
}

const footerColumns = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Integrations', 'Changelog', 'API Docs'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press Kit'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Documentation', 'Status Page', 'Contact Us'],
  },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#') && href.length > 1) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1629] text-white font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0b1629]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                <Zap className="h-4 w-4 text-white" />
              </div>
              LeadGen AI
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <Link
                to="/signin"
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Get Started
              </Link>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-white/5 bg-[#0b1629]/95 backdrop-blur-xl md:hidden">
            <div className="space-y-1 px-4 pb-4 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    scrollToSection(e, link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-center text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-blue-500 px-3 py-2 text-center text-sm font-medium text-white transition-all hover:bg-blue-400"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[128px]" />
          <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-cyan-500/6 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Lead Generation
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Find AI Projects.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Win Better Clients.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              Discover high-intent AI engineering opportunities, qualify leads, and manage your
              outreach in one workspace.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/signin"
                className="group flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/30"
              >
                Connect LinkedIn API
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/app/dashboard"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 text-sm text-slate-400 sm:px-6 lg:px-8">
          <Shield className="h-4 w-4 shrink-0 text-emerald-400" />
          <p>
            Data is collected and used only through authorized integrations and in accordance with
            LinkedIn platform policies.
          </p>
        </div>
      </section>

      <section id="features" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why LeadGen AI</h2>
            <p className="mt-4 text-lg text-slate-400">
              Everything you need to find, qualify, and close AI engineering opportunities.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-white/5 bg-white/[0.02] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-400">
              Get started in three simple steps.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+32px)] top-6 hidden h-px w-[calc(100%-64px)] bg-gradient-to-r from-blue-500/40 to-transparent md:block" />
                )}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-lg font-bold text-blue-400">
                  {step.number}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="integrations" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Integrations</h2>
            <p className="mt-4 text-lg text-slate-400">
              Connect with the tools you already use.
            </p>
          </div>
          <div className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-6 py-4"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${integration.color}`}
                >
                  <integration.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium">{integration.name}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            <ShieldCheck className="mr-1 inline-block h-4 w-4" />
            Authorized integrations only
          </p>
        </div>
      </section>

      <section id="security" className="border-y border-white/5 bg-white/[0.02] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Enterprise-Grade Security
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Your data is protected with industry-leading security practices.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {securityFeatures.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pricing</h2>
            <p className="mt-4 text-lg text-slate-400">
              Choose the plan that fits your team.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  tier.featured
                    ? 'border-blue-500/30 bg-blue-500/5 shadow-xl shadow-blue-500/5'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{tier.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                    {tier.period && (
                      <span className="text-sm text-slate-400">{tier.period}</span>
                    )}
                  </div>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 shrink-0 text-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={tier.action}
                  className={`mt-8 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all ${
                    tier.featured
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/30'
                      : 'border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to win more clients?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Start discovering high-intent AI engineering opportunities today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="group flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/app/dashboard"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section id="terms" className="border-y border-white/5 bg-white/[0.02] py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Terms of Service</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            By using LeadGen AI, you agree to these terms. Our platform provides AI-powered lead
            generation tools designed to help professionals discover and manage business
            opportunities. You are responsible for ensuring that your use of the platform complies
            with all applicable laws and LinkedIn platform policies. We reserve the right to modify
            or terminate the service at any time.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            All data collected through authorized integrations is handled in strict accordance with
            our privacy policy and applicable data protection regulations. Unauthorized use of the
            platform or its APIs may result in immediate account termination.
          </p>
        </div>
      </section>

      <section id="privacy" className="border-y border-white/5 bg-[#0b1629] py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Privacy Policy</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            LeadGen AI respects your privacy and is committed to protecting your personal data. We
            collect only the information necessary to provide our services, including account
            credentials, LinkedIn integration tokens, and usage analytics. Your data is encrypted at
            rest using AES-256 and in transit using TLS 1.3.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            We do not sell or share your personal information with third parties except as required to
            deliver integrated services (such as LinkedIn API access). You may request deletion of
            your data at any time by contacting our support team.
          </p>
        </div>
      </section>

      <section id="compliance" className="border-y border-white/5 bg-white/[0.02] py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">API Compliance</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            LeadGen AI operates in full compliance with LinkedIn's API Terms of Service and Developer
            Program Policies. All data collection is performed through authorized API endpoints with
            explicit user consent. We implement rate limiting and throttling to respect platform
            quotas and ensure responsible API usage.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Our platform undergoes regular audits to maintain compliance with data protection
            standards including GDPR, CCPA, and SOC 2. We work closely with platform providers to
            ensure all integrations meet current policy requirements.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#0b1629]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                LeadGen AI
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Find AI engineering opportunities, qualify leads, and manage outreach in one
                workspace.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5" />
                Authorized integrations only
              </div>
            </div>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="text-sm font-semibold">{column.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => {
                    const href = getFooterLinkHref(link);
                    const external = isExternalLink(link);
                    const scrollable = isScrollLink(link);

                    if (external) {
                      return (
                        <li key={link}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-400 transition-colors hover:text-white"
                          >
                            {link}
                          </a>
                        </li>
                      );
                    }

                    if (scrollable) {
                      return (
                        <li key={link}>
                          <a
                            href={href}
                            onClick={(e) => scrollToSection(e, href)}
                            className="text-sm text-slate-400 transition-colors hover:text-white"
                          >
                            {link}
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={link}>
                        <a
                          href="#"
                          onClick={scrollToTop}
                          className="text-sm text-slate-400 transition-colors hover:text-white"
                        >
                          {link}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-sm text-slate-500">
              &copy; 2026 LeadGen AI. Founded by Nawaz Khan. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Data collected and used in accordance with LinkedIn platform policies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
