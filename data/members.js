/* ============================================================
   NeuraSec — Members
   ------------------------------------------------------------
   HOW TO ADD A MEMBER
   1. Put their photo in  images/members/<id>.jpg  (square-ish,
      at least 300×300 px). No photo? Leave `photo` out and the
      site shows their initials instead.
   2. Copy one block below, give it a unique `id` (lowercase,
      hyphens), and fill in the fields.
   3. `name` must be spelled exactly as it appears in the author
      lists in data/publications.js — that is how papers are
      linked to people. If a paper spells the name differently,
      add that spelling to `aliases`.

   group: leadership | advisors | core | interdisciplinary | former
   Groups marked `sortByContribution` are ordered automatically by
   papers (published/accepted count 2, others 1); elsewhere the
   order below is kept.
   ============================================================ */

window.NEURASEC_GROUPS = [
  { id: 'leadership',        title: 'Leadership' },
  { id: 'advisors',          title: 'International Advisors' },
  { id: 'core',              title: 'Core Researchers & Members', sortByContribution: true },
  { id: 'interdisciplinary', title: 'Interdisciplinary Researchers' },
  { id: 'former',            title: 'Former Members' }
];

window.NEURASEC_MEMBERS = [

  /* ── Leadership ── */
  {
    id: 'hassan-ahmed',
    name: 'Hassan Ahmed',
    group: 'leadership',
    role: 'Founder · Lead Researcher',
    institution: 'Department of Computer Science, National University of Computer and Emerging Sciences (FAST-NUCES), Chiniot-Faisalabad Campus',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Chiniot', lat: 31.72, lng: 72.98 },
    expertise: ['Cybersecurity', 'Deep Learning', 'NLP', 'XAI', 'LLMs', 'Computer Vision'],
    tags: ['MS Computer Science', 'Instructor · FAST-NUCES'],
    email: 'hassan.ahmed@nu.edu.pk',
    links: {
      linkedin: 'https://www.linkedin.com/in/hassanahmed1166/',
      scholar: 'https://scholar.google.com/citations?user=a7hJLzwAAAAJ',
      website: 'https://hassanahmed1166.github.io/'
    },
    photo: 'hassan-ahmed.jpg'
  },
  {
    id: 'abdullah-khan',
    name: 'Abdullah Khan',
    group: 'leadership',
    role: 'Co-Founder · Research Lead',
    institution: 'Department of Computer Science, University of Wah, Wah Cantt',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Wah Cantt', lat: 33.78, lng: 72.73 },
    expertise: ['Cybersecurity', 'Deep Learning', 'NLP', 'Applications of AI'],
    tags: ['MS Computer Science', 'Researcher · University of Wah'],
    email: 'abdullahkhanswati@outlook.com',
    links: {
      linkedin: 'https://www.linkedin.com/in/abdullah-khan-dev/',
      scholar: 'https://scholar.google.com/citations?user=NR8nCCkAAAAJ'
    },
    photo: 'abdullah-khan.jpg'
  },

  /* ── International Advisors ── */
  {
    id: 'shahrzad-saremi',
    prefix: 'Dr.',
    name: 'Shahrzad Saremi',
    group: 'advisors',
    role: 'Lecturer · FHEA',
    institution: 'School of Science, Technology and Engineering, University of the Sunshine Coast',
    country: 'Australia', flag: '🇦🇺',
    location: { city: 'Sunshine Coast', lat: -26.65, lng: 153.07 },
    expertise: ['Augmented Reality', 'Gesture Recognition', 'Human-Computer Interaction', 'Optimization', 'Information Systems'],
    email: 'ssaremi@usc.edu.au',
    links: {
      linkedin: 'https://www.linkedin.com/in/shahrzad-saremi-b8329b189/',
      scholar: 'https://scholar.google.com/citations?user=oDhSiscAAAAJ'
    },
    photo: 'shahrzad-saremi.jpg'
  },
  {
    id: 'rania-shibl',
    prefix: 'Dr.',
    name: 'Rania Shibl',
    group: 'advisors',
    role: 'Professor & Associate Dean Education',
    institution: 'Faculty of Science and Engineering, Southern Cross University',
    country: 'Australia', flag: '🇦🇺',
    location: { city: 'Lismore', lat: -28.82, lng: 153.36 },
    expertise: ['Information Systems', 'Health IT', 'Social Media', 'Cybercrime', 'Fraud Detection'],
    email: 'rania.shibl@scu.edu.au',
    links: {
      linkedin: 'https://www.linkedin.com/in/rania-shibl-62014077/',
      scholar: 'https://scholar.google.com/citations?user=e32UXEIAAAAJ'
    },
    photo: 'rania-shibl.jpg'
  },
  {
    id: 'tanja-pavleska',
    prefix: 'Dr.',
    name: 'Tanja Pavleska',
    group: 'advisors',
    role: 'Researcher',
    institution: 'Laboratory for Open Systems and Networks, Jozef Stefan Institute',
    country: 'Slovenia', flag: '🇸🇮',
    location: { city: 'Ljubljana', lat: 46.05, lng: 14.51 },
    expertise: ['Cybersecurity', 'Artificial Intelligence', 'System Design', 'e-Governance', 'Digital Transformation'],
    email: 'atanja@e5.ijs.si',
    links: {
      linkedin: 'https://www.linkedin.com/in/tanjaazderska/',
      scholar: 'https://scholar.google.com/citations?user=jHnvTCcAAAAJ'
    },
    photo: 'tanja-pavleska.jpg'
  },
  {
    id: 'imane-guellil',
    prefix: 'Dr.',
    name: 'Imane Guellil',
    group: 'advisors',
    role: 'Research Fellow (Data Science / AI / Engineering)',
    institution: 'Cancer and Genomic Sciences, University of Birmingham',
    country: 'United Kingdom', flag: '🇬🇧',
    location: { city: 'Birmingham', lat: 52.48, lng: -1.89 },
    expertise: ['Sentiment Analysis', 'Hate Speech Detection', 'Named Entity Recognition', 'Machine Learning', 'Medical NLP'],
    email: 'i.guellil@bham.ac.uk',
    links: {
      linkedin: 'https://www.linkedin.com/in/imane-guellil-10699253/',
      scholar: 'https://scholar.google.com/citations?user=EQk5dlkAAAAJ'
    },
    photo: 'imane-guellil.jpg'
  },
  {
    id: 'ike-devi-sulistyaningtyas',
    name: 'Ike Devi Sulistyaningtyas',
    group: 'advisors',
    role: 'Lecturer & Head of Public Relations Department',
    institution: 'Faculty of Social and Political Sciences, Universitas Atma Jaya Yogyakarta',
    country: 'Indonesia', flag: '🇮🇩',
    location: { city: 'Yogyakarta', lat: -7.77, lng: 110.37 },
    expertise: ['Communication Strategy', 'Public Relations', 'Digital Communication'],
    email: 'ike.devi@uajy.ac.id',
    links: {
      linkedin: 'https://www.linkedin.com/in/ike-devi-sulistyaningtyas-0239137a/',
      scholar: 'https://scholar.google.com/citations?user=rqVaH0oAAAAJ'
    },
    photo: 'ike-devi-sulistyaningtyas.jpg'
  },
  {
    id: 'ngo-nguyen-quynh-nhu',
    name: 'Ngô Nguyễn Quỳnh Như',
    aliases: ['Nguyen Quynh Nhu Ngo', 'Ngo Nguyen Quynh Nhu'],
    group: 'advisors',
    role: 'Professor in Finance',
    institution: 'Faculty of Finance and Banking, Ton Duc Thang University',
    country: 'Vietnam', flag: '🇻🇳',
    location: { city: 'Ho Chi Minh City', lat: 10.73, lng: 106.70 },
    expertise: ['Green Finance', 'Sustainable Finance', 'ESG', 'Money Laundering', 'Monetary Policy'],
    email: 'ngonguyenquynhnhu@tdtu.edu.vn',
    links: {
      linkedin: 'https://www.linkedin.com/in/nguyen-quynh-nhu-ngo-49997474/',
      scholar: 'https://scholar.google.com/citations?user=HWDToQgAAAAJ'
    },
    photo: 'ngo-nguyen-quynh-nhu.jpg'
  },

  /* ── Core Researchers & Members ── */
  {
    id: 'abdul-mateen',
    name: 'Abdul Mateen',
    group: 'core',
    role: 'Senior Researcher',
    institution: 'Department of Computer Science, FAST-NUCES, Chiniot-Faisalabad Campus',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Chiniot', lat: 31.72, lng: 72.98 },
    links: {
      linkedin: 'https://www.linkedin.com/in/ammateen49/',
      scholar: 'https://scholar.google.com/citations?user=CrlrCQkAAAAJ'
    },
    photo: 'abdul-mateen.jpg'
  },
  {
    id: 'furqan-ahmad',
    name: 'Furqan Ahmad',
    group: 'core',
    role: 'PhD Scholar',
    institution: "Northwestern Polytechnical University, Xi'an",
    country: 'China', flag: '🇨🇳',
    location: { city: "Xi'an", lat: 34.24, lng: 108.91 },
    expertise: ['AIoT', 'Edge Computing', 'TinyML', 'SDN & Network Automation', 'Smart Healthcare'],
    email: 'furqanahmad272@gmail.com',
    links: { linkedin: 'https://www.linkedin.com/in/furqanahmad272/' },
    photo: 'furqan-ahmad.jpg'
  },
  {
    id: 'kanwal-naz',
    name: 'Kanwal Naz',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'Department of Software Engineering, FAST-NUCES, Chiniot-Faisalabad Campus',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Chiniot', lat: 31.72, lng: 72.98 },
    links: { linkedin: 'https://www.linkedin.com/in/kanwal-naz-a2257115a/' },
    photo: 'kanwal-naz.jpg'
  },
  {
    id: 'bisma-ali',
    name: 'Bisma Ali',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'School of Electrical Engineering and Computer Science (SEECS), NUST Islamabad',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Islamabad', lat: 33.64, lng: 72.99 },
    links: {
      linkedin: 'https://www.linkedin.com/in/bisma-ali-855a20177/',
      scholar: 'https://scholar.google.com/citations?user=SDwE_QYAAAAJ'
    },
    photo: 'bisma-ali.jpg'
  },
  {
    id: 'hina-mehboob',
    name: 'Hina Mehboob',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'National University of Sciences and Technology (NUST)',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Islamabad', lat: 33.64, lng: 72.99 },
    tags: ['BE Computer Software Engineering'],
    links: { linkedin: 'https://www.linkedin.com/in/hina-mehboob-nust/' },
    photo: 'hina-mehboob.jpg'
  },
  {
    id: 'ghalib-nadeem',
    name: 'Ghalib Nadeem',
    group: 'core',
    role: 'Researcher · PhD Scholar',
    institution: 'Department of Computer Science, Huazhong University of Science and Technology, Wuhan',
    country: 'China', flag: '🇨🇳',
    location: { city: 'Wuhan', lat: 30.51, lng: 114.41 },
    links: {
      linkedin: 'https://www.linkedin.com/in/ghalib-nadeem-023678189/',
      scholar: 'https://scholar.google.com/citations?user=9-Y_EvAAAAAJ'
    },
    photo: 'ghalib-nadeem.jpg'
  },
  {
    id: 'arooj-fatima',
    name: 'Arooj Fatima',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'Department of Computer Science, University of Wah, Wah Cantt',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Wah Cantt', lat: 33.78, lng: 72.73 },
    links: { linkedin: 'https://www.linkedin.com/in/arooj-fatima-17979223b/' },
    photo: 'arooj-fatima.jpg'
  },
  {
    id: 'ridda-jameel',
    name: 'Ridda Jameel',
    aliases: ['Ridda Jamil'],
    group: 'core',
    role: 'Researcher · Member',
    institution: 'Department of Computer Science, University of Wah, Wah Cantt',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Wah Cantt', lat: 33.78, lng: 72.73 },
    links: { linkedin: 'https://www.linkedin.com/in/ridda-jamil-6142522bb/' }
  },
  {
    id: 'javeria-iqbal',
    name: 'Javeria Iqbal',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'Department of Computer Science, National University of Computer and Emerging Sciences',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Islamabad', lat: 33.64, lng: 72.99 },
    links: { linkedin: 'https://www.linkedin.com/in/jav530/' },
    photo: 'javeria-iqbal.jpg'
  },
  {
    id: 'nafiseh-faghani',
    name: 'Nafiseh Faghani',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'Department of Computer Science, Technical University of Darmstadt',
    country: 'Germany', flag: '🇩🇪',
    location: { city: 'Darmstadt', lat: 49.87, lng: 8.65 },
    links: { linkedin: 'https://www.linkedin.com/in/nafise-faghani/' },
    photo: 'nafiseh-faghani.jpg'
  },
  {
    id: 'aini-saba',
    name: 'Aini Saba',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'Department of Computer Science, University of Wah, Wah Cantt',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Wah Cantt', lat: 33.78, lng: 72.73 }
  },
  {
    id: 'zeshaan-ali',
    name: 'Zeshaan Ali',
    aliases: ['Zeeshan Ali'],
    group: 'core',
    role: 'Researcher · Member',
    institution: 'COMSATS University Islamabad, Wah Campus',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Wah Cantt', lat: 33.78, lng: 72.73 }
  },
  {
    id: 'shahzad-tanveer',
    name: 'Shahzad Tanveer',
    group: 'core',
    role: 'Member · Masters Student',
    institution: 'Department of Computer Science, FAST-NUCES, Chiniot-Faisalabad Campus',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Chiniot', lat: 31.72, lng: 72.98 }
  },
  {
    id: 'sohaib-ahmed',
    name: 'Sohaib Ahmed',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'COMSATS University Islamabad, Wah Campus',
    country: 'Qatar', flag: '🇶🇦',
    location: { city: 'Doha', lat: 25.29, lng: 51.53 },
    links: { linkedin: 'https://www.linkedin.com/in/sohaibahmed341/' }
  },
  {
    id: 'saood-ahmed',
    name: 'Saood Ahmed',
    group: 'core',
    role: 'Researcher · Member',
    institution: 'Department of Electrical Engineering, University of Management and Technology, Lahore',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Lahore', lat: 31.45, lng: 74.29 },
    links: { linkedin: 'https://www.linkedin.com/in/saood-ahmed/' }
  },
  {
    id: 'raja-muhammad-bilal-arshad',
    name: 'Raja Muhammad Bilal Arshad',
    group: 'core',
    role: 'Undergraduate Student',
    institution: 'Department of Computer Science, FAST-NUCES, Chiniot-Faisalabad Campus',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Chiniot', lat: 31.72, lng: 72.98 },
    links: { linkedin: 'https://www.linkedin.com/in/raja-muhammad-bilal-arshad/' }
  },
  {
    id: 'manar-makki-shaalan',
    name: 'Manar Makki Shaalan',
    group: 'core',
    role: 'Assistant Lecturer in Mathematics · PhD Scholar',
    institution: 'University of Babylon, Babylon',
    country: 'Iraq', flag: '🇮🇶',
    location: { city: 'Babylon', lat: 32.48, lng: 44.43 },
    expertise: ['Graph Theory', 'Domination Theory', 'Network Reliability'],
    links: {
      linkedin: 'https://www.linkedin.com/in/manar-makki-shaalan-937371439/',
      scholar: 'https://scholar.google.com/citations?user=T4QkHMsAAAAJ'
    },
    photo: 'manar-makki.jpg'
  },

  /* ── Interdisciplinary Researchers ── */
  {
    id: 'nida-ali',
    name: 'Nida Ali',
    group: 'interdisciplinary',
    role: 'Researcher · Member',
    institution: 'The University of Lahore',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Lahore', lat: 31.39, lng: 74.24 },
    expertise: ['Skill Development', 'Leadership'],
    links: { linkedin: 'https://www.linkedin.com/in/nida-muhammad-ali-/' },
    photo: 'nida-ali.jpg'
  },
  {
    id: 'muhammad-yousaf',
    name: 'Muhammad Yousaf',
    group: 'interdisciplinary',
    role: 'PhD Scholar',
    institution: 'Engineering Complex Software Systems, Simula Research Laboratory',
    country: 'Norway', flag: '🇳🇴',
    location: { city: 'Oslo', lat: 59.93, lng: 10.72 },
    links: { linkedin: 'https://www.linkedin.com/in/myousafastian/' },
    photo: 'muhammad-yousaf.jpg'
  },
  {
    id: 'ali-raza-kashif',
    name: 'Ali Raza Kashif',
    group: 'interdisciplinary',
    role: 'PhD Scholar',
    institution: 'School of Materials Science and Engineering, Huazhong University of Science & Technology',
    country: 'China', flag: '🇨🇳',
    location: { city: 'Wuhan', lat: 30.51, lng: 114.41 },
    links: {
      linkedin: 'https://www.linkedin.com/in/alirazakashif/',
      scholar: 'https://scholar.google.com/citations?user=tD9XOdwAAAAJ'
    },
    photo: 'ali-raza-kashif.jpg'
  },
  {
    id: 'farasat-haider',
    name: 'Farasat Haider',
    group: 'interdisciplinary',
    role: 'Masters Student',
    institution: 'School of Nanoscience and Technology, Chulalongkorn University, Bangkok',
    country: 'Thailand', flag: '🇹🇭',
    location: { city: 'Bangkok', lat: 13.74, lng: 100.53 },
    links: {
      linkedin: 'https://www.linkedin.com/in/farasat-haider-390a82298/',
      scholar: 'https://scholar.google.com/citations?user=FVzxhLgAAAAJ'
    },
    photo: 'farasat-haider.jpg'
  },
  {
    id: 'nimra-farooq',
    name: 'Nimra Farooq',
    group: 'interdisciplinary',
    role: 'Member',
    institution: 'Institute of Health Sciences, Khwaja Fareed University',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Rahim Yar Khan', lat: 28.42, lng: 70.30 },
    links: { linkedin: 'https://www.linkedin.com/in/nimra-farooq-aesthetician/' },
    photo: 'nimra-farooq.jpg'
  },
  {
    id: 'qasim-ali',
    name: 'Qasim Ali',
    group: 'interdisciplinary',
    role: 'Member',
    institution: 'Department of Textile Technology, National Textile University',
    country: 'Pakistan', flag: '🇵🇰',
    location: { city: 'Faisalabad', lat: 31.46, lng: 73.13 },
    links: { linkedin: 'https://www.linkedin.com/in/qasim63/' },
    photo: 'qasim-ali.jpg'
  },
  {
    id: 'hassan-khan',
    name: 'Hassan Khan',
    group: 'interdisciplinary',
    role: 'Member',
    institution: 'Department of Industrial Engineering, Tsinghua University',
    country: 'China', flag: '🇨🇳',
    location: { city: 'Beijing', lat: 40.00, lng: 116.33 }
  },
  {
    id: 'faria-hossain',
    name: 'Faria Hossain',
    group: 'interdisciplinary',
    role: 'Researcher',
    institution: 'Northern University Bangladesh',
    country: 'Bangladesh', flag: '🇧🇩',
    location: { city: 'Dhaka', lat: 23.87, lng: 90.40 },
    links: { linkedin: 'https://www.linkedin.com/in/faria-hossain-b094a32b1' },
    photo: 'faria-hossain.jpg'
  },
  {
    id: 'abir-hasan-talha',
    name: 'Abir Hasan Talha',
    group: 'interdisciplinary',
    role: 'Researcher',
    institution: 'Northern University Bangladesh',
    country: 'Bangladesh', flag: '🇧🇩',
    location: { city: 'Dhaka', lat: 23.87, lng: 90.40 },
    links: { linkedin: 'https://www.linkedin.com/in/abir-hasan-talha' },
    photo: 'abir-hasan-talha.jpg'
  },

  /* ── Former Members ── */
  {
    id: 'yahya-younas',
    name: 'Yahya Younas',
    group: 'former',
    role: 'Former Member',
    institution: 'COMSATS University, Wah Campus',
    country: 'Pakistan', flag: '🇵🇰',
    links: { linkedin: 'https://www.linkedin.com/in/yahyayounas/' }
  },
  {
    id: 'rabia-maqbool',
    name: 'Rabia Maqbool',
    group: 'former',
    role: 'Former Member',
    institution: 'NUML, Pakistan',
    country: 'Pakistan', flag: '🇵🇰',
    links: { linkedin: 'https://www.linkedin.com/in/rabia-paracha-158081151/' }
  }
];
