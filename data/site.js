/* ============================================================
   NeuraSec — News, partner institutions and tools
   Newest news first. `members` (optional) lists member ids to
   link from the news item.
   ============================================================ */

window.NEURASEC_NEWS = [
  { date: '2026-10', tag: 'Membership',
    text: 'Manar Makki Shaalan (University of Babylon, Iraq) joins as a researcher, bringing expertise in graph theory, domination theory and network reliability',
    members: ['manar-makki-shaalan'] },
  { date: '2026-10', tag: 'Conference',
    text: 'Two papers to be presented at MCETS 2026 in Larnaca, Cyprus (29–30 October): an IoMT intrusion-detection benchmark and the ARTP autonomous red-team planner',
    publications: ['iomt-ids-benchmark-2026', 'artp-2026'] },
  { date: '2026-05', tag: 'Membership',
    text: 'Dr. Tanja Pavleska (Jozef Stefan Institute, Slovenia) joins as International Advisor',
    members: ['tanja-pavleska'] },
  { date: '2026-01', tag: 'Publication',
    text: 'Bot detection paper published in ICCK Transactions on Emerging Topics in AI (Vol. 3, No. 1)',
    publication: 'bot-detection-2026' },
  { date: '2025-10', tag: 'Membership',
    text: 'Dr. Shahrzad Saremi and Dr. Rania Shibl join as International Advisors',
    members: ['shahrzad-saremi', 'rania-shibl'] },
  { date: '2025-08', tag: 'Membership',
    text: 'Dr. Imane Guellil (University of Birmingham) joins as International Advisor',
    members: ['imane-guellil'] },
  { date: '2024-08', tag: 'Announcement',
    text: 'NeuraSec Research Group founded by Hassan Ahmed and Abdullah Khan',
    members: ['hassan-ahmed', 'abdullah-khan'] }
];

window.NEURASEC_PARTNERS = [
  { name: 'University of the Sunshine Coast', kind: 'University', country: 'Australia' },
  { name: 'Southern Cross University', kind: 'University', country: 'Australia' },
  { name: 'Jozef Stefan Institute', kind: 'Research Institute', country: 'Slovenia' },
  { name: 'University of Birmingham', kind: 'University', country: 'United Kingdom' },
  { name: 'Tsinghua University', kind: 'University', country: 'China' },
  { name: 'Huazhong University of Science & Technology', kind: 'University', country: 'China' },
  { name: 'Simula Research Laboratory', kind: 'Research Lab', country: 'Norway' },
  { name: 'Universitas Atma Jaya Yogyakarta', kind: 'University', country: 'Indonesia' },
  { name: 'Chulalongkorn University', kind: 'University', country: 'Thailand' },
  { name: 'COMSATS University Islamabad, Wah Campus', kind: 'University', country: 'Pakistan' },
  { name: 'University of Babylon', kind: 'University', country: 'Iraq' }
];

window.NEURASEC_TOOLS = [
  {
    name: 'AuthentiCite',
    tagline: 'References → BibTeX',
    description: 'Paste any citation format. Smart preprocessing routes each reference through a DOI fast-path, multi-strategy API search, and an LLM structural fallback — with AI hallucination detection.',
    url: 'https://hassanahmed1166.github.io/ref-to-bibtex/',
    authors: ['hassan-ahmed']
  }
];
