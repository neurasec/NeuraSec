/* ============================================================
   NeuraSec — News, partner institutions and tools
   Newest news first. `members` (optional) lists member ids to
   link from the news item.
   ============================================================ */

/* Site-wide settings.
   defaultPublicationView: 'peer' shows only published and accepted papers on the
   Publications page (manuscripts under review stay one click away under "All");
   use 'all' to list everything by default. */
window.NEURASEC_SETTINGS = {
  defaultPublicationView: 'peer',
  showEmails: true            // false hides every personal email address on the site
};

window.NEURASEC_NEWS = [
  { date: '2026-10', tag: 'Publication',
    text: 'Crisis-induced hybrid learning, cognitive offloading and generative AI reliance among Pakistani CS undergraduates published in Education Innovations: Systems and Future Learning (Vol. 1, No. 1)',
    publication: 'crisis-hybrid-learning-2026' },
  { date: '2026-10', tag: 'Membership',
    text: 'Four researchers join NeuraSec: Furqan Ahmad (PhD Scholar, Northwestern Polytechnical University, China), Hina Mehboob (NUST, Pakistan), and Faria Hossain and Abir Hasan Talha (Northern University Bangladesh)',
    members: ['furqan-ahmad', 'hina-mehboob', 'faria-hossain', 'abir-hasan-talha'] },
  { date: '2026-10', tag: 'Membership',
    text: 'Manar Makki Shaalan (University of Babylon, Iraq) joins as a researcher, bringing expertise in graph theory, domination theory and network reliability',
    members: ['manar-makki-shaalan'] },
  { date: '2026-10', tag: 'Conference',
    text: 'Two papers to be presented at MCETS 2026 in Larnaca, Cyprus (29–30 October): an IoMT intrusion-detection benchmark and the ARTP autonomous red-team planner',
    publications: ['iomt-ids-benchmark-2026', 'artp-2026'] },
  { date: '2026-07', tag: 'Membership',
    text: 'Amira Mahcene (University of Constantine 2, Algeria) joins as a researcher, with interests in AI in healthcare and distributed applications',
    members: ['amira-mahcene'] },
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

/* Partner institutions. `logo` is optional (initials are shown if missing);
   put the file in images/partners/. `url` makes the card a link. */
window.NEURASEC_PARTNERS = [
  { name: 'University of the Sunshine Coast', logo: 'images/partners/university-of-the-sunshine-coast.webp', url: 'https://www.usc.edu.au', kind: 'University', country: 'Australia' },
  { name: 'Southern Cross University', logo: 'images/partners/southern-cross-university.webp', url: 'https://www.scu.edu.au', kind: 'University', country: 'Australia' },
  { name: 'Jozef Stefan Institute', logo: 'images/partners/jozef-stefan-institute.webp', url: 'https://www.ijs.si/ijsw/JSI', kind: 'Research Institute', country: 'Slovenia' },
  { name: 'University of Birmingham', logo: 'images/partners/university-of-birmingham.webp', url: 'https://www.birmingham.ac.uk', kind: 'University', country: 'United Kingdom' },
  { name: 'Tsinghua University', logo: 'images/partners/tsinghua-university.webp', url: 'https://www.tsinghua.edu.cn/en/', kind: 'University', country: 'China' },
  { name: 'Huazhong University of Science & Technology', logo: 'images/partners/huazhong-university-of-science-and-technology.webp', url: 'http://english.hust.edu.cn', kind: 'University', country: 'China' },
  { name: 'Simula Research Laboratory', logo: 'images/partners/simula-research-laboratory.webp', url: 'https://www.simula.no', kind: 'Research Lab', country: 'Norway' },
  { name: 'Universitas Atma Jaya Yogyakarta', logo: 'images/partners/universitas-atma-jaya-yogyakarta.webp', url: 'https://www.uajy.ac.id', kind: 'University', country: 'Indonesia' },
  { name: 'Chulalongkorn University', logo: 'images/partners/chulalongkorn-university.webp', url: 'https://www.chula.ac.th/en/', kind: 'University', country: 'Thailand' },
  { name: 'COMSATS University Islamabad, Wah Campus', logo: 'images/partners/comsats-university-islamabad.webp', url: 'https://wah.comsats.edu.pk', kind: 'University', country: 'Pakistan' },
  { name: 'University of Babylon', logo: 'images/partners/university-of-babylon.webp', url: 'https://uobabylon.edu.iq', kind: 'University', country: 'Iraq' },
  { name: 'Northwestern Polytechnical University', logo: 'images/partners/northwestern-polytechnical-university.webp', url: 'https://en.nwpu.edu.cn', kind: 'University', country: 'China' },
  { name: 'Northern University Bangladesh', url: 'https://www.nub.ac.bd', kind: 'University', country: 'Bangladesh' }
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
