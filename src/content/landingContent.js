export const defaultLandingContent = {
  section_order: ['hero', 'how_it_works', 'preview', 'platform', 'video', 'faq', 'contact', 'closing'],
  blog: {
    enabled: true,
  },
  navigation: {
    enabled: true,
    links: [
      { label: 'Product preview', href: '#preview' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Platform', href: '#platform' },
      { label: 'FAQs', href: '#faq' },
      { label: 'Tutorial', href: '#tutorial' },
      { label: 'Contact', href: '#contact' },
      { label: 'Blog', href: '/blog' },
    ],
    login_label: 'Log in',
    action: { label: 'Get started', href: '/register' },
  },
  hero: {
    enabled: true,
    theme: 'light',
    motion_enabled: true,
    title: 'Turn business data',
    accent: 'into decisions. Just ask.',
    primary_action: { label: 'Analyze your data', href: '/register' },
    secondary_action: { label: 'See how it works', href: '#preview' },
    process_items: [
      { label: 'Upload', detail: 'Your business file' },
      { label: 'Ask', detail: 'In plain language' },
      { label: 'Decide', detail: 'With clear evidence' },
    ],
    process_footer: 'From raw data to a decision-ready answer',
  },
  how_it_works: {
    enabled: true,
    theme: 'dark',
    title: 'The question is yours.',
    accent: 'The heavy lifting is ours.',
    description: 'Tatparya combines reliable calculations, clear explanations, and visual evidence so you can spend less time preparing data and more time deciding what comes next.',
    flow_labels: ['Question', 'Analysis', 'Decision'],
    cards: [
      { title: 'Understand performance', description: 'Compare products, regions, and customers to see what contributes most to the business.' },
      { title: 'Investigate the change', description: 'Explore trends over time and ask follow-up questions when something needs a closer look.' },
      { title: 'Share a clear answer', description: 'Keep findings, recommendations, and charts together in one report your team can review.' },
    ],
  },
  preview: {
    enabled: true,
    theme: 'light',
    title: 'From a raw file.',
    accent: 'To a decision you can share.',
    description: 'Keep your dataset, questions, calculations, visuals, and recommendations together in one connected workspace.',
    workspace_label: 'Tatparya product workspace',
    helper_text: 'Select any step to explore the workflow.',
    open_label: 'Open full preview',
    steps: [
      { label: 'Upload', title: 'Start with your file.', description: 'Upload CSV, Excel, JSON, or Parquet. Review columns, missing values, and data quality before you begin.', image: '/dataset-preview.png', alt: 'Tatparya dataset profile with row, column, and quality information' },
      { label: 'Ask', title: 'Ask the business question.', description: 'Ask in plain language. Tatparya coordinates the analysis, calculations, and supporting evidence.', image: '/workspace-preview.png', alt: 'Tatparya workspace for asking questions about a dataset' },
      { label: 'Decide', title: 'Bring the answer to the table.', description: 'Review KPIs, findings, recommendations, and charts. Preview a professional report before downloading it.', image: '/analysis-preview.png', alt: 'Tatparya analysis dashboard with metrics, charts, and findings' },
    ],
  },
  platform: {
    enabled: true,
    theme: 'dark',
    title: 'Useful answers.',
    accent: 'Room to go deeper.',
    description: 'A good analysis should start a better conversation. Follow a result, compare another group, or take the findings into your next review.',
    action: { label: 'Start your first analysis', href: '/register' },
    cards: [
      { title: 'Your question, in your words', description: 'Ask about revenue, growth, customers, products, or regional performance using everyday business language.' },
      { title: 'Findings with visual context', description: 'See each result beside the chart that supports it, so the answer is easier to understand and explain.' },
      { title: 'Recommendations you can act on', description: 'Turn patterns into practical next steps while keeping the final business decision in your hands.' },
      { title: 'A report ready to share', description: 'Preview and download a polished PDF for your team, client, or next business review.' },
    ],
  },
  faq: {
    enabled: true,
    theme: 'dark',
    title: 'A few things',
    accent: 'worth knowing.',
    description: 'Everything you need to know before starting with your first file.',
    items: [
      { question: 'How does Tatparya answer questions?', answer: 'Tatparya interprets your business question, performs the relevant analysis, and presents the answer with supporting evidence.' },
      { question: 'Which files can I upload?', answer: 'Tatparya supports CSV, Excel, JSON, and Parquet files. Files with clear column names and consistent rows produce the best results.' },
      { question: 'Can I ask follow-up questions?', answer: 'Yes. Compare another group, investigate a change, or revisit an earlier result without starting over.' },
      { question: 'Can I download the results?', answer: 'Yes. Preview a report before downloading a PDF with the important metrics, findings, recommendations, and visuals.' },
      { question: 'Is every answer based on my data?', answer: 'Calculations and charts are generated from the selected dataset. Tatparya will not claim facts that the available fields cannot support.' },
    ],
  },
  video: {
    enabled: false,
    theme: 'light',
    title: 'See Tatparya in action.',
    accent: 'From file to answer.',
    description: 'Watch a short walkthrough of uploading data, asking a business question, and reviewing the result.',
    video_url: '',
    poster_url: '',
    caption: 'Tatparya product tutorial',
  },
  contact: {
    enabled: true,
    theme: 'light',
    title: 'Have a question?',
    accent: 'Let’s talk.',
    description: 'Tell us what you want to understand about your data or how Tatparya could fit your workflow.',
    form_title: 'Send us a message',
    email: 'support@tatparya.com',
    recipient_email: 'support@tatparya.com',
    phone: 'Available by email',
    address: 'Remote-first support',
    submit_label: 'Send message',
    success_message: 'Thanks — your message has been sent.',
  },
  closing: {
    enabled: true,
    theme: 'dark',
    title: 'Your next insight starts with a question.',
    action: { label: 'Get started', href: '/register' },
    note: 'Bring your file. We’ll help you explore it.',
  },
  footer: {
    enabled: true,
    preview_link: { label: 'Product preview', href: '#preview' },
    login_label: 'Log in',
    copyright_name: 'Tatparya',
  },
};

export function normalizeLandingContent(content) {
  const merge = (defaults, incoming) => {
    if (Array.isArray(defaults)) return Array.isArray(incoming) ? incoming : defaults;
    if (!defaults || typeof defaults !== 'object') return incoming ?? defaults;
    const source = incoming && typeof incoming === 'object' ? incoming : {};
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, merge(value, source[key])]));
  };
  const normalized = merge(defaultLandingContent, content);
  const validSections = defaultLandingContent.section_order;
  const incomingOrder = Array.isArray(content?.section_order) ? content.section_order : [];
  normalized.section_order = [...new Set(incomingOrder.filter((section) => validSections.includes(section)))];
  for (const section of validSections) {
    if (!normalized.section_order.includes(section)) normalized.section_order.push(section);
  }
  normalized.preview.steps = normalized.preview.steps.map((step, index) => ({
    ...step,
    label: step.label || defaultLandingContent.preview.steps[index]?.label || `Step ${index + 1}`,
  }));
  if (!normalized.navigation.links.some((link) => link.href === '/blog')) {
    normalized.navigation.links.push({ label: 'Blog', href: '/blog' });
  }
  for (const link of defaultLandingContent.navigation.links.filter((item) => ['#tutorial', '#contact'].includes(item.href))) {
    if (!normalized.navigation.links.some((item) => item.href === link.href)) normalized.navigation.links.push(link);
  }
  return normalized;
}
