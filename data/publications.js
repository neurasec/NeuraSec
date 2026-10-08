/* ============================================================
   NeuraSec — Publications
   ------------------------------------------------------------
   HOW TO ADD A PAPER
   Copy one block and fill it in. Write the authors exactly as
   printed on the paper — any author whose name matches a member
   in data/members.js is linked to that member's profile
   automatically, and the paper appears on their page.

   Keep each status group NEWEST FIRST (like a CV).

   type:   journal | conference | chapter
   status: published | accepted | review | submitted | progress
           (review = under peer review,
            submitted = submitted, awaiting peer review)
   Journal and conference papers that are published or accepted
   are numbered automatically (J1, J2 … / C1, C2 …), oldest first.
   ============================================================ */

const SSCI_2027 = {
  venue: '2027 IEEE Symposium Series on Computational Intelligence (SSCI 2027)',
  details: 'Gold Coast, Queensland, Australia, 14–17 February 2027'
};
const MCETS_2026 = {
  venue: 'Mediterranean Conference on Emerging Technologies and Systems (MCETS 2026)',
  details: 'Larnaca, Cyprus, 29–30 October 2026'
};

window.NEURASEC_PUBLICATIONS = [

  /* ───────────── Published ───────────── */
  {
    id: 'latent-feature-squeezing-2026',
    title: 'Latent-Space Feature Squeezing for Adversarially Robust Intrusion Detection on IoT Edge Devices',
    authors: ['Mansooreh Mirzaei', 'Shahrzad Saremi', 'Abdullah Khan', 'Hassan Ahmed', 'Parvin Rastegari', 'Maryam Nooraei Abadeh', 'Rania Shibl', 'Marzieh Varposhti', 'Thanh Thi Nguyen'],
    year: 2026, type: 'journal', status: 'published',
    venue: 'International Journal of Intelligent Computing and Cybernetics',
    details: 'Ahead of print · pp. 1–37 · Emerald Publishing',
    doi: '10.1108/IJICC-06-2026-0590',
    pdf: 'https://www.emerald.com/ijicc/article-pdf/doi/10.1108/IJICC-06-2026-0590/11896647/ijicc-06-2026-0590en.pdf',
    abstract: 'Machine learning-based intrusion detection systems (IDS) for Internet of Things (IoT) environments are vulnerable to adversarial perturbations that can cause malicious traffic to be misclassified as benign. Existing defences, such as adversarial training and feature squeezing, are typically applied independently and are not specifically designed for the heterogeneous combination of continuous and discrete features in IoT network traffic. This study proposes a robust and efficient defence framework for securing IoT IDSs against adversarial attacks. This study proposes CoLD-IDS (Coordinated Latent Defence for Intrusion Detection Systems), a two-phase defence framework that is evaluated on the Edge-IIoTset dataset, which contains more than 2.2 million samples spanning 14 attack categories from a physical IoT testbed. Phase 1 combines an IoT-adapted feature squeezing mechanism that quantizes only continuous features with multi-attack adversarial training using clean, Fast Gradient Sign Method (FGSM) and Projected Gradient Descent (PGD) samples. Phase 2 introduces a latent-space defence pipeline in which a denoising autoencoder compresses the original 52-dimensional feature space into a 32-dimensional representation, where feature squeezing and adversarial training are jointly applied. Robustness is further validated through ablation studies and Backward Pass Differentiable Approximation (BPDA) attacks. The adversarially trained multi-layer perceptron in Phase 1 achieved an accuracy of 99.58% on clean data and 99.49% under a PGD attack. The latent-space framework in Phase 2 achieved 98.90% accuracy on clean data and 98.88% under a PGD attack, corresponding to a degradation of only 0.02 percentage points. Ablation studies revealed that applying feature squeezing without training-time adaptation significantly degrades robustness, reducing PGD accuracy to 78.23% for the undefended baseline and 31.47% for latent squeezing without adversarial adaptation. BPDA evaluation confirmed that the observed robustness is not a consequence of gradient masking. Both proposed systems satisfy the latency and storage constraints of edge-based IoT deployments, achieving inference times below 4 µs per sample on CPU. This study presents CoLD-IDS, a novel two-phase adversarial defence framework that integrates IoT-specific feature squeezing with multi-attack adversarial training and extends this concept to a latent representation learned through a denoising autoencoder. Unlike existing approaches that employ these defences independently, the proposed framework jointly optimises feature transformation and adversarial adaptation, resulting in highly robust and computationally efficient intrusion detection suitable for resource-constrained IoT edge devices.',
    keywords: ['Adversarial Robustness', 'Intrusion Detection', 'IoT', 'Edge AI']
  },
  {
    id: 'crisis-hybrid-learning-2026',
    title: 'Crisis-Induced Hybrid Learning, Cognitive Offloading, and Generative AI Reliance Among Pakistani CS Undergraduates',
    authors: ['Hassan Ahmed', 'Abdullah Khan', 'Arooj Fatima', 'Abdul Mateen', 'Shahrzad Saremi', 'Rania Shibl', 'Sadegh Rajaei', 'Mansooreh Mirzaei'],
    year: 2026, type: 'journal', status: 'published',
    venue: 'Education Innovations: Systems and Future Learning',
    details: 'Vol. 1, No. 1, pp. 568–589 · Emerald Publishing',
    doi: '10.1108/EISFL-06-2026-0098',
    pdf: 'https://www.emerald.com/eisfl/article-pdf/1/1/568/11890957/eisfl-06-2026-0098en.pdf',
    abstract: 'In spring 2026, geopolitical tensions prompted the Pakistani government to mandate full online instruction (10 March–3 April 2026), followed by a hybrid schedule for the rest of the semester. This shift is treated here as an externally imposed crisis context for AI adoption, not as a natural experiment. No pre-crisis baseline or control group was available. The study characterises generative AI (GenAI) adoption patterns and the psychological antecedents of AI dependency among undergraduate computer-science (CS) students during this window. Three hypotheses, grounded in the reviewed literature, structured the analysis. A cross-sectional survey was administered across Pakistani higher education institutions (HEIs) in April–May 2026. Of 360 responses collected, two incomplete records were removed, and a thirteen-criterion data-quality screen was applied, yielding N = 299. Fourteen constructs were operationalised from UTAUT, Cognitive Load Theory (CLT), Self-Determination Theory (SDT), and the AI Anxiety Scale (AIAS). Block-entry OLS regression and bootstrapped mediation (5,000 resamples) tested the hypotheses; ANOVA and Spearman correlations supported descriptive analysis of adoption patterns. Adoption was near-universal (>99%), with 45.2% of respondents reporting ≥ 31% of submitted work directly AI-generated. A three-block OLS regression explained 54.6% of variance in AI dependency. Cognitive offloading was the strongest predictor (β = 0.41, p < 0.001), followed by procrastination (β = 0.23, p < 0.001), extrinsic motivation (β = 0.17, p = 0.002), and intrinsic motivation as a protective factor (β = −0.13, p = 0.013). Bootstrapped mediation confirmed procrastination partially mediates the extrinsic motivation–dependency path (ab = 0.201, 95% BC-CI [0.122, 0.289]). To our knowledge, this is among the first studies to survey GenAI dependency during an active government-mandated crisis disruption in South Asian higher education. Contributions include a multi-theory construct battery adapted for a crisis context, a thirteen-criterion response-quality protocol, and evidence that habituated cognitive offloading and extrinsic motivation are the primary drivers of AI dependency in this context.',
    keywords: ['Hybrid Learning', 'Cognitive Offloading', 'Generative AI', 'CS Education']
  },
  {
    id: 'uav-can-ids-2026',
    title: 'Securing UAV CAN Bus: A Dual-Schema Deep Learning Approach for Volumetric and Integrity Intrusion Detection',
    authors: ['Abdullah Khan', 'Hassan Ahmed', 'Maryam Javaid', 'Hassan Khan'],
    year: 2026, type: 'journal', status: 'published',
    venue: 'ICCK Transactions on Advanced Computing and Systems',
    details: 'Vol. 2, No. 4, pp. 1–18 · Institute of Central Computation and Knowledge',
    doi: '10.62762/TACS.2026.747077',
    pdf: 'https://www.researchgate.net/publication/414490581_Securing_UAV_CAN_Bus_A_Dual-Schema_Deep_Learning_Approach_for_Volumetric_and_Integrity_Intrusion_Detection',
    abstract: 'UAV CAN buses lack encryption and authentication, making them vulnerable to intrusion attacks. We propose a schema-specific IDS that partitions detection into volumetric (DoS, Replay) and integrity (FDI, Evil Twin) subspaces, each served by a dedicated Bi-GRU model with stochastic feature augmentation. The system achieves 97.45% weighted accuracy on volumetric attacks and 99.97% detection rate on integrity attacks, significantly outperforming monolithic classifiers.',
    keywords: ['UAV Security', 'CAN Bus', 'Bi-GRU', 'Intrusion Detection', 'Deep Learning']
  },
  {
    id: 'selm-ctr-2026',
    title: 'SELM-CTR: A Stacking Ensemble Deep Learning Model with SHAP-Based Analysis for Large-Scale Click-Through Rate Prediction',
    authors: ['Zeeshan Ali', 'Hassan Ahmed', 'Abdullah Khan', 'Shahrzad Saremi', 'Rania Shibl', 'Mansooreh Mirzaei', 'Parvin Rastegari', 'Mingzhong Wang'],
    year: 2026, type: 'journal', status: 'published',
    venue: 'International Journal of Intelligent Computing and Cybernetics',
    details: 'Emerald Publishing',
    metrics: 'JCR Q2 · IF 3.1',
    doi: '10.1108/IJICC-04-2026-0403',
    keywords: ['CTR Prediction', 'Stacking Ensemble', 'SHAP', 'XAI', 'Deep Learning']
  },
  {
    id: 'coi-peer-learning-2026',
    title: 'An Extended Community of Inquiry Framework for Monitoring and Predicting Online Peer Learning Participation',
    authors: ['Mohsen Dokhanchi', 'Shahrzad Saremi', 'Rania Shibl', 'Maryam Heidari', 'Hassan Ahmed', 'Dahlia Mansoor', 'Yassine Himeur', 'Mohammad Al-Zaffin', 'Shadi Atalla', 'Wathiq Mansoor'],
    year: 2026, type: 'journal', status: 'published',
    venue: 'Journal of Applied Research in Higher Education',
    details: 'Vol. 18, No. 8, pp. 113–141',
    metrics: 'JCR Q2 · IF 1.8',
    doi: '10.1108/JARHE-04-2026-0666',
    keywords: ['Community of Inquiry', 'Online Learning', 'Peer Learning', 'Higher Education']
  },
  {
    id: 'egenai-dbr-2026',
    title: 'EGenAI-DBR: A Design-Based Framework for Responsible Generative AI Integration in Higher Education',
    authors: ['Shahrzad Saremi', 'Mansooreh Mirzaei', 'Ahmad Rasti', 'Maryam Nooraei Abadeh', 'Marzieh Varposhti', 'Rania Shibl', 'Hassan Ahmed', 'Shaden Khaled A. Aldakheel', 'Erica Mealy', 'Katie Wang', 'Declan Humphreys'],
    year: 2026, type: 'journal', status: 'published',
    venue: 'Education Innovations: Systems and Future Learning',
    details: 'Vol. 1, No. 1, pp. 341–373 · Emerald Publishing',
    doi: '10.1108/EISFL-04-2026-0057',
    keywords: ['Generative AI', 'Higher Education', 'Responsible AI', 'Design-Based Research']
  },
  {
    id: 'bot-detection-2026',
    title: 'Enhancing Social Media Bot Detection with Cross-Feature Gating and Residual Learning',
    authors: ['Abdullah Khan', 'Arooj Fatima', 'Ridda Jamil', 'Hassan Ahmed', 'Aini Saba'],
    year: 2026, type: 'journal', status: 'published',
    venue: 'ICCK Transactions on Emerging Topics in Artificial Intelligence',
    details: 'Vol. 3, No. 1, pp. 20–32 · Institute of Central Computation and Knowledge',
    doi: '10.62762/TETAI.2025.791029',
    url: 'https://www.icck.org/article/abs/TETAI.2025.791029',
    keywords: ['Bot Detection', 'Social Media', 'Deep Learning', 'Feature Gating']
  },
  {
    id: 'av-attack-ensemble-2025',
    title: 'An Ensemble Deep Learning Framework for Autonomous Vehicle Attack Detection',
    authors: ['Hassan Jari', 'Hassan Ahmed', 'Hareem Kibriya', 'Wazir Zada Khan', 'Ali Tahir'],
    year: 2025, type: 'conference', status: 'published',
    venue: 'Proceedings of ICETECC 2025',
    details: 'Jamshoro, Pakistan, 23–25 April 2025 · IEEE',
    doi: '10.1109/ICETECC65365.2025.11070228',
    url: 'https://ieeexplore.ieee.org/document/11070228',
    pdf: 'https://www.researchgate.net/publication/393688332_An_Ensemble_Deep_Learning_Framework_for_Autonomous_Vehicle_Attack_Detection',
    keywords: ['Autonomous Vehicles', 'Attack Detection', 'Ensemble Learning', 'CAN Bus']
  },

  /* ───────────── Accepted / In Press ───────────── */
  {
    id: 'urdu-transliteration-2026',
    title: 'Urdu to Roman Urdu Transliteration Using Bi-Directional LSTM and Attention Mechanisms',
    authors: ['Hassan Ahmed', 'Abdullah Khan', 'Hassan Khan'],
    year: 2026, type: 'journal', status: 'accepted',
    venue: 'ICCK Transactions on Advanced Computing and Systems',
    details: 'Institute of Central Computation and Knowledge',
    pdf: 'https://www.researchgate.net/publication/414490663_Urdu_to_Roman_Urdu_Transliteration_Using_Bi-Directional_LSTM_and_Attention_Mechanisms',
    keywords: ['Urdu NLP', 'Transliteration', 'BiLSTM', 'Attention']
  },
  {
    id: 'bparc-2026',
    title: 'BPARC: Bilaterally Player-Aware Resource Compensation for Rain-Interrupted Limited-Overs Cricket Matches',
    authors: ['Abdul Mateen', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl', 'Mansooreh Mirzaei', 'Anthony Bedford', 'Erica Mealy', 'Mingzhong Wang'],
    year: 2026, type: 'conference', status: 'accepted',
    venue: 'The 18th Australasian Conference on Mathematics and Computers in Sport',
    pdf: 'https://www.researchgate.net/publication/414949661_BPARC_BILATERALLY_PLAYER-AWARE_RESOURCE_COMPENSATION_FOR_RAIN-INTERRUPTED_LIMITED-OVERS_CRICKET_MATCHES',
    keywords: ['Sports Analytics', 'Cricket', 'DLS Method', 'Fairness']
  },
  {
    id: 'iomt-ids-benchmark-2026',
    title: 'Intrusion Detection for the Internet of Medical Things: A Cost-Aware Comparative Benchmark of Machine Learning Approaches',
    authors: ['Hassan Ahmed', 'Gordana Dermody', 'Abdul Mateen', 'Shahrzad Saremi', 'Rania Shibl'],
    year: 2026, type: 'conference', status: 'accepted',
    venue: MCETS_2026.venue, details: MCETS_2026.details,
    pdf: 'https://www.researchgate.net/publication/414497681_Intrusion_Detection_for_the_Internet_of_Medical_Things_A_Cost-Aware_Comparative_Benchmark_of_Machine_Learning_Approaches',
    keywords: ['IoMT', 'Intrusion Detection', 'Benchmark', 'Machine Learning']
  },
  {
    id: 'artp-2026',
    title: 'ARTP: A Safety-Conscious Autonomous Red-Team Planner for Penetration Testing',
    authors: ['Raja Muhammad Bilal Arshad', 'Zain Ali', 'Ali Raza', 'Hassan Ahmed', 'Amir Moeed', 'Abdul Mateen'],
    year: 2026, type: 'conference', status: 'accepted',
    venue: MCETS_2026.venue, details: MCETS_2026.details,
    keywords: ['Red Teaming', 'Autonomous Agents', 'Penetration Testing', 'AI Safety']
  },

  /* ───────────── Under Review ───────────── */
  {
    id: 'dyslexia-handwriting-2026',
    title: 'Benchmark Saturation in Synthetic Dyslexia Handwriting Detection: A Seven-Detector Dual-Domain Evaluation With Intrinsic and EigenCAM Explainability',
    authors: ['Javeria Iqbal', 'Hassan Ahmed', 'Hanzla Iqbal', 'Shahrzad Saremi', 'Rania Shibl', 'Alan Wee-Chung Liew', 'Akhlaqur Rahman', 'Mostafa Kamalpour'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['Dyslexia', 'Handwriting Analysis', 'Object Detection', 'Explainability', 'EigenCAM']
  },
  {
    id: 'phishattn-2026',
    title: 'PhishAttn: A Hybrid CNN-BiLSTM-Attention Framework for Semantic and Statistical Phishing URLs Detection',
    authors: ['Hassan Ahmed', 'Arooj Fatima', 'Abdullah Khan', 'Shahrzad Saremi', 'Rania Shibl', 'Mansooreh Mirzaei'],
    year: 2026, type: 'journal', status: 'review',
    venue: 'International Journal of Machine Learning and Cybernetics', details: 'Springer Nature',
    abstract: 'Phishing attacks impersonate legitimate URLs to steal credentials and financial data. Rule-based detectors fail against rapidly evolving techniques; ML methods rely on handcrafted features. We propose PhishAttn — a hybrid CNN-BiLSTM-Attention model that automatically extracts local and sequential URL features. Evaluated on Kaggle, Mendeley, and PhiUSIIL datasets, the model achieves accuracies of 95.98%, 98.90%, and 99.80% respectively, with an overall accuracy of 98.28% and AUC-ROC of 0.9979.',
    keywords: ['Phishing Detection', 'CNN', 'BiLSTM', 'Attention', 'Cybersecurity']
  },
  {
    id: 'eclipse-infoveillance-2026',
    title: 'Multilingual Computational Infoveillance of Ocular Risk During the 2026 Solar Eclipse',
    authors: ['Hassan Ahmed', 'Shahrzad Saremi', 'Alan Wee-Chung Liew', 'Rania Shibl', 'Thanh Thi Nguyen', 'Judy Watson'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['Infoveillance', 'Multilingual NLP', 'Public Health', 'Social Media']
  },
  {
    id: 'flood-susceptibility-2026',
    title: 'A Computational-Intelligence Framework for Flood Susceptibility Mapping and Warning-Chain Diagnosis',
    authors: ['Hassan Ahmed', 'Abdul Mateen', 'Shahrzad Saremi', 'Alan Wee-Chung Liew', 'Rania Shibl', 'Hilda Jemutai Bitok', 'Mingzhong Wang'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['Flood Risk', 'Susceptibility Mapping', 'Early Warning', 'Computational Intelligence']
  },
  {
    id: 'jbdm-2026',
    title: 'From Analysis to Defense: Benchmarking LLM Jailbreak Vulnerability and Introducing the JBDM Ensemble Detector',
    authors: ['Abdullah Khan', 'Hassan Ahmed', 'Hassan Khan', 'Jawaid Iqbal', 'Mujeeb Ur Rehman'],
    year: 2026, type: 'journal', status: 'review',
    venue: 'IET Information Security', details: 'Wiley',
    abstract: 'We benchmark five LLMs against jailbreak prompts and propose JBDM — a three-stage ensemble detector combining a fine-tuned DeBERTa-v3 Transformer with lexical features, XGBoost, and an MLP over hybrid embeddings. JBDM achieves an out-of-fold AUC-ROC of 99.99% and overall accuracy of 99.85%. Deployed as a guard layer, it achieves 100% jailbreak detection on Gemini and ≥90% on Claude and ChatGPT.',
    keywords: ['LLM Safety', 'Jailbreak Detection', 'DeBERTa', 'Ensemble']
  },
  {
    id: 'wse-resnet59-2026',
    title: 'WSE-ResNet59: Adaptive Channel Recalibration via Nested Squeeze-and-Excitation Blocks for Multiclass Lung Disease Detection in Chest Radiography',
    authors: ['Yasir Saleem', 'Ghalib Nadeem', 'Hassan Ahmed'],
    year: 2026, type: 'journal', status: 'review',
    venue: 'Physical and Engineering Sciences in Medicine', details: 'Springer',
    keywords: ['Medical Imaging', 'Chest X-ray', 'Squeeze-and-Excitation', 'Lung Disease']
  },
  {
    id: 'urdu-toxicity-2026',
    title: 'Toxicity Detection in Urdu: In-Depth Analysis of Taxonomies, Datasets, and Methodologies',
    authors: ['Ayesha Rashid', 'Sajid Mahmood', 'Muhammad Fahad Zia', 'Reema Choudhary', 'Sonia Shahzadi', 'Hassan Ahmed', 'Shahrzad Saremi'],
    year: 2026, type: 'journal', status: 'review',
    venue: 'Social Network Analysis and Mining', details: 'Springer',
    keywords: ['Urdu NLP', 'Toxicity Detection', 'Survey', 'Datasets']
  },
  {
    id: 'mr-diffdbscan-2026',
    title: 'MR-DiffDBSCAN: A MapReduce-Based Framework for Scalable Crowd Behavior Analysis in Social Networks',
    authors: ['Sanaa S. Almansur', 'Maryam Nooraei Abadeh', 'Mansooreh Mirzaei', 'Shahrzad Saremi', 'Rania Shibl', 'Hassan Ahmed'],
    year: 2026, type: 'journal', status: 'review',
    venue: 'Data Technologies and Applications', details: 'Emerald Publishing',
    keywords: ['MapReduce', 'DBSCAN', 'Crowd Behaviour', 'Social Networks']
  },
  {
    id: 'chatbot-oos-2026',
    title: 'How Confident Should a Chatbot Be? Computational Intelligence for Honest Out-of-Scope Detection in Intent Recognition',
    authors: ['Muhammad Irfan Aslam', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl', 'Akhlaqur Rahman'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['Chatbots', 'Intent Recognition', 'Out-of-Scope Detection', 'Calibration']
  },
  {
    id: 'iot-malware-leakage-2026',
    title: 'Leakage-Controlled Dynamic Analysis for Cross-Architecture IoT Malware Detection',
    authors: ['Arooj Fatima', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl', 'Alan Wee-Chung Liew', 'Akhlaqur Rahman'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['IoT Malware', 'Dynamic Analysis', 'Data Leakage', 'Cybersecurity']
  },
  {
    id: 'milk10k-skin-lesion-2026',
    title: 'Multimodal Fusion of Paired Clinical and Dermoscopic Images for Long-Tailed Skin Lesion Classification on MILK10k',
    authors: ['Bisma Ali', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl', 'Alan Wee-Chung Liew', 'Thanh Thi Nguyen'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['Skin Lesions', 'Multimodal Fusion', 'Dermoscopy', 'Long-Tailed Learning']
  },
  {
    id: 'wildfire-monitoring-2026',
    title: 'Stress-Testing Computational Intelligence for Australian Wildfire Monitoring: Continental-Scale Clustering, Forecasting, and Sensor Placement',
    authors: ['Bisma Ali', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl', 'Amin Beheshti', 'Akhlaqur Rahman'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['Wildfire', 'Forecasting', 'Clustering', 'Sensor Placement']
  },
  {
    id: 'prescriber-fragmentation-2026',
    title: 'Detecting Prescriber Fragmentation with AI-Informed Trajectory Analysis',
    authors: ['Svetlana Kolos', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl', 'Mostafa Kamalpour', 'Amin Beheshti'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['Healthcare Analytics', 'Trajectory Analysis', 'Prescribing']
  },
  {
    id: 'ae-rf-ddos-2026',
    title: 'Hybrid Autoencoder–Random Forest Framework for DDoS Intrusion Detection with Leakage-Aware Normalization',
    authors: ['Marzieh Varposhti', 'Mansooreh Mirzaei', 'Maryam Nooraei Abadeh', 'Shahrzad Saremi', 'Hassan Ahmed', 'Rania Shibl', 'Abdullah Khan', 'Thanh Thi Nguyen'],
    year: 2026, type: 'conference', status: 'review', ...SSCI_2027,
    keywords: ['DDoS', 'Autoencoder', 'Random Forest', 'Intrusion Detection']
  },
  {
    id: 'genai-creative-partner-2026',
    title: 'GenAI as a Creative Partner: Design Thinking, Ethics, and Student Outcomes in Higher Education',
    authors: ['Shahrzad Saremi', 'Mansooreh Mirzaei', 'Maryam Nooraei Abadeh', 'Ahmad Rasti', 'Hassan Ahmed', 'Shaden AlDkheel', 'Mohsen Dokhanchi', 'Katie Wang', 'Erica Mealy', 'Joy Galaige', 'Syed Zaidi'],
    year: 2026, type: 'journal', status: 'review',
    venue: 'Artificial Intelligence in Education', details: 'Emerald Publishing',
    keywords: ['Generative AI', 'Design Thinking', 'Ethics', 'Higher Education']
  },

  /* ───────────── Submitted (awaiting peer review) ───────────── */
  {
    id: 'agri-price-forecasting-2026',
    title: 'Explainable Ensemble Machine Learning for Agricultural Producer Price Forecasting: A Framework for Transparent Market Intelligence',
    authors: ['Damilare Ogunjobi', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl', 'Akhlaqur Rahman'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'The Australian Journal of Agricultural and Resource Economics',
    keywords: ['Price Forecasting', 'Ensemble Learning', 'XAI', 'Agriculture']
  },
  {
    id: 'bidsleep-2026',
    title: 'Beyond Single-Night Wearable Sleep Staging: Modality, Unlabelled Longitudinal History, and Annotation Quality in BIDSleep',
    authors: ['Shiva Jahanaray', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl', 'Gordana Dermody'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Medical & Biological Engineering & Computing', details: 'Springer',
    keywords: ['Sleep Staging', 'Wearables', 'Digital Health']
  },
  {
    id: 'travel-planning-llm-2026',
    title: 'A Schema-Validated Multi-Agent LLM Framework for Personalised, Budget-Aware Travel Planning: Design and Operational Evaluation',
    authors: ['Syed Hammad ul Hassan', 'Hassan Ahmed', 'Shahrzad Saremi', 'Shiva Ilkhani Zadeh', 'Rania Shibl'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Information Technology & Tourism', details: 'Springer',
    keywords: ['Multi-Agent LLMs', 'Travel Planning', 'Personalisation']
  },
  {
    id: 'urban-mobility-entropy-2026',
    title: 'Entropy-Guided Detection of Behavioural Regime Shifts in AI-Governed Urban Mobility',
    authors: ['Bisma Ali', 'Hassan Ahmed', 'Rania Shibl', 'Maryam Nooraei Abadeh', 'Sondos Bahadori', 'Mansooreh Mirzaei', 'Shahrzad Saremi'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'International Journal of Intelligent Transportation Systems Research', details: 'Springer',
    keywords: ['Urban Mobility', 'Entropy', 'Regime Shifts', 'Intelligent Transportation']
  },
  {
    id: 'vehicular-fog-survey-2026',
    title: 'Toward Secure and Trustworthy Vehicular Fog Computing: A Survey',
    authors: ['Ghalib Nadeem', 'Bisma Ali', 'Hassan Ahmed', 'Amna Dahri', 'Shahrzad Saremi', 'Rania Shibl'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Computer Networks', details: 'Elsevier',
    keywords: ['Vehicular Fog Computing', 'Security', 'Trust', 'Survey']
  },
  {
    id: 'sports-injury-bibliometric-2026',
    title: 'Mapping Artificial Intelligence and Machine Learning Research in Sports Injury Prediction: A Bibliometric Analysis with Growth Modelling, Thematic Evolution and a Research Agenda',
    authors: ['Sepehr Amooeinejad', 'Mohamadali Rezaeimanesh', 'Hassan Ahmed', 'Mostafa Kamalpour', 'Shahrzad Saremi', 'Rania Shibl'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'European Journal of Sport Science', details: 'Wiley',
    keywords: ['Sports Injury', 'Bibliometrics', 'Machine Learning']
  },
  {
    id: 'genai-dark-side-2026',
    title: 'The Dark Side of GenAI in Education: A Bibliometric Analysis of Risks to Motivation, Pedagogy, and Long-Term Learning Outcomes',
    authors: ['Jie Zhu', 'Shahrzad Saremi', 'Rania Shibl', 'Mostafa Kamalpour', 'Hassan Ahmed', 'Mansooreh Mirzaei', 'Mingzhong Wang'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Scientometrics', details: 'Springer Nature',
    keywords: ['Generative AI', 'Education', 'Bibliometrics']
  },
  {
    id: 'smart-home-ageing-2026',
    title: 'Development and Single-Home Field Evaluation of a Local-First Smart Home Monitoring Architecture for Ageing in Place: Proof-of-Concept Study',
    authors: ['Mingzhong Wang', 'Rania Shibl', 'Shahrzad Saremi', 'Hassan Ahmed', 'Maryam Ghahramani', 'Raul Fernandez Rojas', 'Calvin Joseph', 'Kerry North', 'Judy Watson', 'Erica Mealy', 'Gordana Dermody'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'JMIR Formative Research', details: 'JMIR Publications',
    keywords: ['Smart Home', 'Ageing in Place', 'Health Monitoring']
  },
  {
    id: 'iov-authentication-2026',
    title: 'Securing Internet of Vehicles: A Robust Three-Factor Privacy-Preserving Authentication Protocol',
    authors: ['Gelare Oudi Ghadim', 'Parvin Rastegari', 'Mohammad Dakhilalian', 'Faramarz Hendessi', 'Shahrzad Saremi', 'Rania Shibl', 'Hassan Ahmed', 'Thanh Thi Nguyen'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'International Journal of Information Security', details: 'Springer Nature',
    keywords: ['Internet of Vehicles', 'Authentication', 'Privacy']
  },
  {
    id: 'federated-kd-anomaly-2026',
    title: 'A Federated Knowledge Distillation Model for Anomaly Detection in Isolated Networks',
    authors: ['Alireza Sharifi', 'Maryam Nooraei Abadeh', 'Mansooreh Mirzaei', 'Shahrzad Saremi', 'Rania Shibl', 'Hassan Ahmed', 'Mingzhong Wang'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'International Journal of Data Science and Analytics', details: 'Springer',
    keywords: ['Federated Learning', 'Knowledge Distillation', 'Anomaly Detection']
  },
  {
    id: 'pqc-governance-2026',
    title: 'Mandatory Migration as Governance Opportunity: Leveraging the Post-Quantum Cryptography Transition to Embed Research Data Management Controls',
    authors: ['Peter Embleton', 'Rania Shibl', 'Shahrzad Saremi', 'Hassan Ahmed'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Data & Policy', details: 'Cambridge University Press',
    keywords: ['Post-Quantum Cryptography', 'Data Governance', 'Research Data Management']
  },
  {
    id: 'ai-business-analytics-2026',
    title: 'The Evolution of AI-Driven Business Analytics: A Scientometric Review of Global Research Trends, Knowledge Structures, and Future Directions',
    authors: ['Mansooreh Mirzaei', 'Mostafa Kamalpour', 'Maryam Nooraei Abadeh', 'Shahrzad Saremi', 'Rania Shibl', 'Hassan Ahmed', 'Erica Mealy', 'Tianwa Chen'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Journal of Knowledge Management', details: 'Emerald Publishing',
    keywords: ['Business Analytics', 'Scientometrics', 'AI']
  },
  {
    id: 'genai-is-users-2026',
    title: 'Evaluating the Impact of Generative AI on Users in Information Systems',
    authors: ['Jie Zhu', 'Shahrzad Saremi', 'Rania Shibl', 'Hassan Ahmed', 'Abdul Mateen', 'Mansooreh Mirzaei'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Transactions on Intelligent Systems and Technology', details: 'ACM',
    keywords: ['Generative AI', 'Information Systems', 'User Impact']
  },
  {
    id: 'falls-detection-2026',
    title: 'Machine Learning for Falls Detection and Activity Monitoring in Ageing-in-Place Settings: A Benchmark Study Using Open-Source Wearable Sensor Data',
    authors: ['Shahrzad Saremi', 'Mansooreh Mirzaei', 'Ahmad Rasti', 'Sadegh Rajaei', 'Maryam Nooraei Abadeh', 'Rania Shibl', 'Hassan Ahmed', 'Tianwa Chen'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Journal of Enabling Technologies', details: 'Emerald Publishing',
    keywords: ['Falls Detection', 'Wearable Sensors', 'Ageing in Place', 'Benchmark']
  },
  {
    id: 'hydration-agent-2026',
    title: 'A Context-Aware Multimodal Intelligent Agent for Personalized Hydration Monitoring and Adaptive Alert Management',
    authors: ['Ikenna Ukabuiro', 'Sunil Raj', 'Khandaker Sohada', 'Akhlaqur Rahman', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Biomedical Signal Processing & Control', details: 'Elsevier',
    keywords: ['Hydration Monitoring', 'Intelligent Agents', 'Multimodal AI']
  },
  {
    id: 'iot-flood-monitoring-2026',
    title: 'Enhanced Internet-of-Things (IoT) Framework for Real-Time Flood Disaster Monitoring and Predictive Analytics Using Multimodal AI',
    authors: ['Ikenna Ukabuiro', 'Henry Odikwa Ndubuisi', 'Chisom Onwubiko Davidson', 'Akhlaqur Rahman', 'MD Sanjid Islam Khan', 'Hassan Ahmed', 'Shahrzad Saremi', 'Rania Shibl'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'Journal of Flood Risk Management', details: 'Wiley',
    keywords: ['IoT', 'Flood Monitoring', 'Predictive Analytics', 'Multimodal AI']
  },
  {
    id: 'himalayan-wolf-optimization-2026',
    title: 'Himalayan Wolf Optimization: A Novel Nature-Inspired Metaheuristic Algorithm for Global Optimization Problems',
    authors: ['Marzieh Varposhti', 'Mansooreh Mirzaei', 'Maryam Nooraei Abadeh', 'Shahrzad Saremi', 'Rania Shibl', 'Hassan Ahmed', 'Li-Minn Ang'],
    year: 2026, type: 'journal', status: 'submitted',
    venue: 'The Journal of Supercomputing', details: 'Springer',
    keywords: ['Metaheuristics', 'Optimisation', 'Nature-Inspired Algorithms']
  }
];
