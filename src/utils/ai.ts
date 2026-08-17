import { Lead, TeamMember } from '../types';

const strengths = [
  'Deep expertise in production-grade AI agent systems',
  'Proven track record with LLM and RAG architectures',
  'Experience with high-scale distributed AI systems',
  'Strong background in NLP and conversational AI',
  'Enterprise-grade security and compliance knowledge',
  'Full-stack AI deployment capabilities',
  'Agile project management with AI teams',
  'Cost optimization for AI infrastructure',
];

const greetings = ['Hi', 'Hello', 'Hey', 'Greetings'];
const closings = [
  'Looking forward to hearing from you.',
  'I\'d love to discuss this further.',
  'Happy to share more details.',
  'Excited about the possibility of working together.',
  'Let me know if you have questions.',
  'Would love to connect.',
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] { const shuffled = [...arr].sort(() => 0.5 - Math.random()); return shuffled.slice(0, Math.min(n, arr.length)); }

export function generateOutreachMessage(lead: Lead, senderName: string, company: string): string {
  const greeting = pick(greetings);
  const firstName = lead.contactName.split(' ')[0];
  const closing = pick(closings);
  const relevantSkills = pickN(lead.skills, 3);
  const strength = pick(strengths);

  const budgetLine = lead.budgetMin
    ? `\n\nWe understand the investment is in the ${lead.budgetMin >= 1000 ? `$${Math.round(lead.budgetMin/1000)}K` : `$${lead.budgetMin}`}${lead.budgetMax ? `-$${lead.budgetMax >= 1000 ? `${Math.round(lead.budgetMax/1000)}K` : lead.budgetMax}` : ''} range. We can structure our engagement to maximize ROI within your budget.`
    : '';

  const urgencyLine = lead.urgencyScore > 80
    ? '\n\nI understand timing is critical, and we can mobilize our team quickly to meet your deadline.'
    : '';

  const templates = [
    `${greeting} ${firstName},\n\nI came across your project "${lead.title}" at ${lead.company} and wanted to reach out.\n\nWith our ${relevantSkills.join(', ')} expertise, we've helped companies like yours build production AI systems that deliver real business results:\n\n• Reduced support costs by 40% through intelligent automation\n• Built RAG systems processing millions of documents with 95%+ accuracy\n• Deployed LLM-powered solutions serving 10K+ daily requests\n\n${strength} — which aligns perfectly with what you're looking for.${budgetLine}${urgencyLine}\n\nWould you be open to a 15-minute call this week to explore how we can help ${lead.company} achieve its AI goals?\n\n${closing}\n\nBest regards,\n${senderName}\n${company}`,

    `${greeting} ${firstName},\n\nYour search for ${relevantSkills[0]} expertise for "${lead.title}" caught our attention.\n\nAt ${company}, we specialize in exactly this type of project. Our team has:\n\n• ${Math.floor(Math.random() * 20 + 10)}+ years combined AI engineering experience\n• Delivered ${Math.floor(Math.random() * 50 + 20)} successful AI projects\n• Maintained a 98% client satisfaction rate\n\n${pick(strengths)}. We'd bring this same rigor to ${lead.company}.\n\nCan we schedule a brief call to discuss your specific requirements?\n\n${closing}\n\n${senderName}`,

    `${greeting} ${firstName},\n\nI noticed ${lead.company} is looking for help with ${lead.aiCategory.toLowerCase()} — right in our wheelhouse.\n\nQuick question: are you looking for a quick turnaround or a longer-term partnership? We're flexible and can tailor our approach accordingly.\n\nHere's what sets us apart:\n• We've built ${pickN(lead.skills, 2).join(' and ')} systems used by Fortune 500 companies\n• Our team includes former AI engineers from leading tech companies\n• We offer transparent pricing with no hidden costs\n\n${budgetLine}\n\nHappy to jump on a quick call whenever works for you.\n\n${closing}\n\n${senderName}\n${company}`,
  ];

  return pick(templates);
}

export function generateLeadSummary(lead: Lead): string {
  const company = lead.company;
  const skills = lead.skills.slice(0, 4).join(', ');
  const budget = lead.budgetMin
    ? `The budget is estimated at $${lead.budgetMin >= 1000 ? `${Math.round(lead.budgetMin/1000)}K` : lead.budgetMin}${lead.budgetMax ? `-$${lead.budgetMax >= 1000 ? `${Math.round(lead.budgetMax/1000)}K` : lead.budgetMax}` : ''}.`
    : 'Budget details are pending confirmation.';
  const urgency = lead.urgencyScore > 80 ? 'This project has high urgency.' : lead.urgencyScore > 60 ? 'Moderate timeline expectations.' : 'Flexible timeline.';
  const fit = lead.technicalFit > 85 ? 'Excellent technical fit for our team.' : lead.technicalFit > 70 ? 'Good technical alignment.' : 'May require additional expertise.';

  return `${company} is seeking ${lead.aiCategory.toLowerCase()} expertise for "${lead.title}". Key skills required: ${skills}. ${budget} ${urgency} ${fit} Contact: ${lead.contactName}${lead.contactTitle ? `, ${lead.contactTitle}` : ''}. Located in ${lead.location}, ${lead.remoteType} arrangement. Source: ${lead.source}.`;
}

export function calculateLeadScore(lead: Lead): { overall: number; intent: number; budget: number; urgency: number; technical: number; reasons: string[] } {
  let intent = 50;
  let budget = 50;
  let urgency = 50;
  let technical = 50;
  const reasons: string[] = [];

  // Intent signals
  if (lead.description.toLowerCase().includes('need') || lead.description.toLowerCase().includes('looking for')) { intent += 15; reasons.push('Strong intent language in project description'); }
  if (lead.description.toLowerCase().includes('asap') || lead.description.toLowerCase().includes('urgent')) { intent += 10; urgency += 15; reasons.push('Urgency mentioned in description'); }
  if (lead.description.toLowerCase().includes('budget') || lead.budgetMin) { intent += 10; budget += 10; reasons.push('Budget allocation indicated'); }
  if (lead.contactTitle?.toLowerCase().includes('cto') || lead.contactTitle?.toLowerCase().includes('vp')) { intent += 10; reasons.push('Decision-maker as contact'); }
  if (lead.description.length > 200) { intent += 5; reasons.push('Detailed project description shows preparedness'); }

  // Budget signals
  if (lead.budgetMax && lead.budgetMax > 100000) { budget += 20; reasons.push('High-value project ($100K+)'); }
  else if (lead.budgetMax && lead.budgetMax > 50000) { budget += 10; reasons.push('Mid-range budget allocation'); }
  if (lead.budgetMin && lead.budgetMax) { budget += 10; reasons.push('Defined budget range provided'); }

  // Urgency signals
  if (lead.projectType === 'contract') { urgency += 10; reasons.push('Contract project — defined timeline'); }
  if (lead.projectType === 'freelance') { urgency += 5; reasons.push('Freelance engagement — typically faster decisions'); }
  if (lead.postedDate) {
    const daysOld = Math.floor((Date.now() - new Date(lead.postedDate).getTime()) / 86400000);
    if (daysOld < 3) { urgency += 15; reasons.push('Recently posted — early mover advantage'); }
    else if (daysOld < 7) { urgency += 10; reasons.push('Recently posted'); }
  }

  // Technical fit
  const coreSkills = ['AI Agents', 'LLMs', 'RAG', 'Python', 'LangChain', 'NLP', 'Machine Learning'];
  const matchingSkills = lead.skills.filter(s => coreSkills.some(c => s.toLowerCase().includes(c.toLowerCase())));
  if (matchingSkills.length >= 3) { technical += 25; reasons.push(`Strong skill alignment (${matchingSkills.length} core skills match)`); }
  else if (matchingSkills.length >= 2) { technical += 15; reasons.push(`Good skill alignment (${matchingSkills.length} core skills match)`); }
  else if (matchingSkills.length >= 1) { technical += 5; reasons.push(`${matchingSkills.length} core skill match`); }

  if (lead.remoteType === 'remote') { technical += 5; reasons.push('Remote-friendly — broader team access'); }

  intent = Math.min(99, intent + Math.floor(Math.random() * 5));
  budget = Math.min(99, budget + Math.floor(Math.random() * 5));
  urgency = Math.min(99, urgency + Math.floor(Math.random() * 5));
  technical = Math.min(99, technical + Math.floor(Math.random() * 5));

  const overall = Math.round(intent * 0.3 + budget * 0.2 + urgency * 0.2 + technical * 0.3);

  if (reasons.length === 0) reasons.push('Standard lead profile — recommend further qualification');

  return { overall, intent, budget, urgency, technical, reasons: reasons.slice(0, 6) };
}

export function generateSearchSuggestions(query: string): string[] {
  const base = [
    'AI agent developer needed', 'LLM engineer for enterprise', 'RAG system architect',
    'Chatbot development project', 'Machine learning consultant', 'NLP specialist',
    'AI automation consultant', 'Computer vision engineer', 'Deep learning researcher',
    'MLOps engineer', 'Prompt engineer', 'AI product manager',
  ];
  if (!query) return base.slice(0, 6);
  return base.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
}

export function smartSearch(leads: Lead[], query: string): Lead[] {
  if (!query.trim()) return leads;
  const terms = query.toLowerCase().split(/\s+/);
  return leads.map(lead => {
    let score = 0;
    const searchText = `${lead.title} ${lead.company} ${lead.description} ${lead.skills.join(' ')} ${lead.aiCategory} ${lead.contactName}`.toLowerCase();
    terms.forEach(term => {
      if (searchText.includes(term)) score += 10;
      if (lead.title.toLowerCase().includes(term)) score += 20;
      if (lead.skills.some(s => s.toLowerCase().includes(term))) score += 15;
      if (lead.aiCategory.toLowerCase().includes(term)) score += 15;
    });
    return { lead, score };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).map(r => r.lead);
}

export function generateActivityDescription(type: string): string {
  const descriptions: Record<string, string[]> = {
    discovery: ['Lead discovered via LinkedIn API sync', 'New lead found through search filter', 'Lead imported from CSV upload'],
    qualified: ['Lead qualified by AI scoring engine', 'Manually qualified based on criteria match', 'Auto-qualified: high intent + budget signals'],
    outreach: ['Initial outreach email sent', 'LinkedIn message sent', 'Follow-up email dispatched'],
    response: ['Contact responded to outreach', 'Scheduled discovery call', 'Requested proposal'],
    note: ['Note added by team member', 'Internal comment updated', 'Activity logged'],
  };
  return pick(descriptions[type] || descriptions.discovery);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
