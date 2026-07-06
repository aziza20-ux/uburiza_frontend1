export const courses = [
  { id: 1, title: 'Advanced Digital Marketing', author: 'Sarah Mensah', authorAvatar: 'https://i.pravatar.cc/150?img=1', lessons: 24, progress: 64, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', category: 'Digital Marketing' },
  { id: 2, title: 'Entrepreneurship Fundamentals', author: 'Kwame Boateng', authorAvatar: 'https://i.pravatar.cc/150?img=2', lessons: 18, progress: 32, image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80', category: 'Entrepreneurship' },
  { id: 3, title: 'AI Fluency for Everyday Work', author: 'Derrick Iradukunda', authorAvatar: 'https://i.pravatar.cc/150?img=11', lessons: 18, progress: 0, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', category: 'AI & Data Science' },
  { id: 4, title: 'Digital Literacy for Beginners', author: 'Amara Okoro', authorAvatar: 'https://i.pravatar.cc/150?img=7', lessons: 12, progress: 0, image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&q=80', category: 'Digital Literacy' },
  { id: 5, title: 'Data Science with Python', author: 'Zainab Abdi', authorAvatar: 'https://i.pravatar.cc/150?img=9', lessons: 30, progress: 10, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80', category: 'AI & Data Science' },
  { id: 6, title: 'Social Media Strategy', author: 'Sarah Mensah', authorAvatar: 'https://i.pravatar.cc/150?img=1', lessons: 15, progress: 0, image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80', category: 'Digital Marketing' }
];

export const upcomingEvents = [
  { id: 1, title: 'Module 4 Quiz', course: 'Digital Marketing', time: 'TODAY, 5:00 PM', type: 'quiz' },
  { id: 2, title: 'Peer Review Assignment', course: 'UI/UX Design', time: 'TOMORROW', type: 'assignment' },
  { id: 3, title: 'Live Mentor Session', course: 'All Students', time: 'FRIDAY, 2:00 PM', type: 'live' }
];
export const mentors = [
  { id: 1, name: "Fatima Diop", role: "UI Designer", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 2, name: "Oluwaseun Ariyo", role: "Marketing Lead", avatar: "https://i.pravatar.cc/150?img=4" }
];

export const resources = [
  { id: 1, title: "African Market Entry Strategy", type: "PDF", desc: "A comprehensive guide to scaling digital services across the Pan-African region.", category: "Digital Entrepreneurship", updated: "2 days ago", size: "4.2 MB", iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" },
  { id: 2, title: "Python for Data Science Toolkit", type: "XLS", desc: "Ready-to-use scripts and notebooks for cleaning local agricultural data sets using", category: "AI & Data Science", updated: "1 week ago", size: "1.8 MB", iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" },
  { id: 3, title: "FinTech Compliance Checklist", type: "DOC", desc: "Essential regulatory requirements for startups in Nigeria, Kenya, and South Africa. Updated", category: "Legal & Tech Policy", updated: "3 days ago", size: "850 KB", iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" },
  { id: 4, title: "UI/UX Design Systems Workshop", type: "VIDEO", desc: "Recording of the advanced masterclass on creating accessible mobile-first interfaces for", category: "Product Design", updated: "5 days ago", size: "24.5 MB", iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" },
  { id: 5, title: "Social Media Campaign Planner", type: "XLS", desc: "Monthly calendar and content strategy template optimized for WhatsApp and", category: "Digital Marketing", updated: "Today", size: "1.2 MB", iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" },
  { id: 6, title: "Low-Bandwidth Web", type: "PDF", desc: "Technical documentation on reducing DOM size and optimizing image delivery for 2G/3G", category: "Web Development", updated: "2 weeks ago", size: "3.1 MB", iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" },
  { id: 7, title: "Venture Capital Pitch Deck", type: "PDF", desc: "A proven structure for African founders to tell their story and secure seed-stage funding.", category: "Entrepreneurship", updated: "Yesterday", size: "5.4 MB", iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" },
  { id: 8, title: "Machine Learning Model Ethics", type: "DOC", desc: "Framework for auditing AI models for bias in recruitment and financial lending specifically", category: "AI Ethics", updated: "4 days ago", size: "2.1 MB", iconColor: "text-emerald-500", bgIcon: "bg-emerald-50" }
];

export const learners = [
  { id: 1, name: "Fatima Yusuf", course: "AI Foundations", date: "Oct 12, 2023", status: "Active", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 2, name: "Kojo Mensah", course: "Entrepreneurship 101", date: "Oct 11, 2023", status: "Completed", avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 3, name: "Amara Okoro", course: "Digital Literacy", date: "Oct 10, 2023", status: "Active", avatar: "https://i.pravatar.cc/150?img=7" },
  { id: 4, name: "Moussa Diop", course: "Fullstack Web Dev", date: "Oct 09, 2023", status: "Pending", avatar: "https://i.pravatar.cc/150?img=8" },
  { id: 5, name: "Zainab Abdi", course: "UX Design", date: "Oct 08, 2023", status: "Active", avatar: "https://i.pravatar.cc/150?img=9" }
];

export const activityData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.8 },
  { day: 'Wed', hours: 4.2 },
  { day: 'Thu', hours: 3.5 },
  { day: 'Fri', hours: 2.0 },
  { day: 'Sat', hours: 5.5 },
  { day: 'Sun', hours: 3.0 },
];

export const analyticsData = [
  { month: 'Feb', learners: 200, completions: 100 },
  { month: 'Mar', learners: 350, completions: 180 },
  { month: 'Apr', learners: 450, completions: 220 },
  { month: 'May', learners: 700, completions: 300 },
  { month: 'Jun', learners: 900, completions: 450 },
];

export const aiFluencyCourse = {
  id: 'ai-fluency',
  title: 'AI Fluency for Everyday Work',
  description: 'Learn how to understand, use, and work alongside AI tools — no technical background needed. Built for African professionals, educators, and entrepreneurs.',
  author: 'Derrick Iradukunda',
  authorAvatar: 'https://i.pravatar.cc/150?img=11',
  level: 'Beginner — No prerequisites',
  access: 'All modules free — no payment required',
  portfolioOutput: 'AI Prompt Library (shareable)',
  lessons: 18,
  modulesCount: 5,
  duration: '4 hours total',
  image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
  progress: 0,
  objectives: [
    'Explain what AI is and how it works in plain language',
    'Use AI tools like ChatGPT confidently in your daily work',
    'Write clear, effective prompts to get useful AI outputs',
    'Identify real AI use cases in your organization or business',
    'Understand the risks, ethics, and limits of AI tools',
    'Build a personal AI Prompt Library as a portfolio artifact'
  ],
  modules: [
    {
      title: 'What is AI and Why Does It Matter?',
      lessonsCount: '3 lessons',
      duration: '35 min',
      badge: 'Free',
      items: [
        { title: 'Welcome to Uburiza Academy', type: 'video', duration: '3 min', description: 'Video introduction · YouTube embed' },
        { title: 'AI in Plain Language — What It Is and What It Isn\'t', type: 'video', duration: '12 min', description: 'Video lesson · YouTube embed' },
        { title: 'AI Around You — Examples from Rwanda and Africa', type: 'reading', duration: '8 min', description: 'Reading + examples' }
      ]
    },
    {
      title: 'How AI Tools Actually Work',
      lessonsCount: '4 lessons',
      duration: '45 min',
      badge: 'Free',
      items: [
        { title: 'Large Language Models — A Simple Explanation', type: 'video', duration: '14 min', description: 'Video lesson · YouTube embed' },
        { title: 'How ChatGPT, Gemini and Claude Are Different', type: 'video', duration: '10 min', description: 'Video lesson · YouTube embed' },
        { title: 'What AI Can and Cannot Do — Honest Limits', type: 'reading', duration: '7 min', description: 'Reading' },
        { title: 'Module 2 Check — Test Your Understanding', type: 'quiz', duration: '5 min', description: 'Quiz · 5 questions' }
      ]
    },
    {
      title: 'Prompting — How to Talk to AI',
      lessonsCount: '4 lessons',
      duration: '50 min',
      badge: 'Free',
      items: [
        { title: 'What is a Prompt and Why Does It Matter?', type: 'video', duration: '10 min', description: 'Video lesson · YouTube embed' },
        { title: 'The CLEAR Framework — Writing Prompts That Work', type: 'video', duration: '15 min', description: 'Video lesson · YouTube embed' },
        { title: '20 Prompt Templates for Work and Study', type: 'download', duration: '10 min', description: 'Reading + downloadable template' },
        { title: 'Prompting Challenge — Write 3 Prompts for Your Work', type: 'project', duration: '15 min', description: 'Practical exercise' }
      ]
    },
    {
      title: 'AI Ethics, Risks, and Responsible Use',
      lessonsCount: '3 lessons',
      duration: '35 min',
      badge: 'Free',
      items: [
        { title: 'Bias, Hallucinations, and Why AI Gets Things Wrong', type: 'video', duration: '12 min', description: 'Video lesson · YouTube embed' },
        { title: 'AI and Jobs — What Changes, What Stays, What\'s New', type: 'video', duration: '13 min', description: 'Video lesson · YouTube embed' },
        { title: 'Rwanda\'s AI Policy — What You Should Know', type: 'reading', duration: '10 min', description: 'Reading' }
      ]
    },
    {
      title: 'Capstone — Build Your AI Prompt Library',
      lessonsCount: '4 lessons',
      duration: '55 min',
      badge: 'Portfolio',
      description: 'Every Uburiza Academy course ends with something real you created. In this course, you build a personal AI Prompt Library — a shareable document of 10 prompts tailored to your work, study, or business that you can use every day.',
      items: [
        { title: 'What is a Prompt Library and Why Build One?', type: 'video', duration: '8 min', description: 'Video lesson · YouTube embed' },
        { title: 'Prompt Library Template — Download and Fill', type: 'download', duration: '—', description: 'Downloadable template (DOCX)' },
        { title: 'Build — Create 10 Prompts for Your Work or Life', type: 'project', duration: '30 min', description: 'Project submission' },
        { title: 'Course Complete — Download Your Certificate', type: 'certificate', duration: '—', description: 'Certificate of completion' }
      ]
    }
  ]
};


