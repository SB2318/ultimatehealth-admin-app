/**
 * UltimateHealth Admin - Clinical Demo & Fallback Datasets
 * Conforms 100% to backend MongoDB / PocketBase schemas:
 * ArticleData, EditRequest, PodcastData, Report, User, Category
 * Automatically wraps empty API responses when database has 0 records.
 */

import {
  ArticleData,
  EditRequest,
  PodcastData,
  Report,
  Category,
  User,
  Reason,
  NotificationD,
  NotificationType,
  GlossaryTerm,
} from '../type';

export const DEMO_TAGS: Category[] = [
  {__v: 0, _id: 'tag_cardio', id: 1, name: 'Cardiology'},
  {__v: 0, _id: 'tag_neuro', id: 2, name: 'Neurology'},
  {__v: 0, _id: 'tag_diab', id: 3, name: 'Endocrinology'},
  {__v: 0, _id: 'tag_derma', id: 4, name: 'Dermatology'},
  {__v: 0, _id: 'tag_ped', id: 5, name: 'Pediatrics'},
];

export const DEMO_USER_1: User = {
  _id: 'usr_ananya',
  user_name: 'Dr. Ananya Sharma, MD',
  user_handle: 'ananya_cardio',
  Profile_image: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400',
  followers: ['usr_2', 'usr_3'],
};

export const DEMO_USER_2: User = {
  _id: 'usr_rajesh',
  user_name: 'Dr. Rajesh Mehta, MBBS, DNB',
  user_handle: 'rajesh_neuro',
  Profile_image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
  followers: ['usr_1'],
};

export const DEMO_USER_3: User = {
  _id: 'usr_priya',
  user_name: 'Dr. Priya Patel, MS',
  user_handle: 'priya_derma',
  Profile_image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
  followers: [],
};

export const DEMO_ARTICLES: ArticleData[] = [
  {
    _id: '901',
    title: 'Hypertension Management: Contemporary Evidence-Based Guidelines 2026',
    authorName: 'Dr. Ananya Sharma, MD',
    authorId: 'usr_ananya',
    description: 'A comprehensive primary care review on updated arterial blood pressure targets, combination therapeutics, and sodium restriction protocols.',
    summary: 'Updated review comparing ACE inhibitors versus ARBs in patients with diabetic kidney disease.',
    content: '<p>Systemic arterial hypertension remains the single largest preventable contributor to all-cause mortality and cardiovascular morbidity globally. Recent clinical trials continue to emphasize early combination pharmacotherapy...</p>',
    tags: [DEMO_TAGS[0]],
    lastUpdated: new Date(Date.now() - 3600000 * 4).toISOString(),
    imageUtils: ['https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800'],
    viewCount: 384,
    repostUsers: [],
    likeCount: 42,
    savedUsers: [],
    assigned_date: null,
    discardReason: '',
    status: 'unassigned',
    reviewer_id: null,
    pb_recordId: 'pb_rec_901',
  },
  {
    _id: '902',
    title: 'Neuroprotective Nutritional Protocols for Cognitive Longevity & Dementia Prevention',
    authorName: 'Dr. Rajesh Mehta, MBBS, DNB',
    authorId: 'usr_rajesh',
    description: 'Analyzing clinical outcomes of MIND and Ketogenic dietary interventions on cerebral amyloid deposition and microglial neuroinflammation.',
    summary: 'Evaluating polyphenols, omega-3 fatty acids, and vascular risk reduction in pre-clinical Alzheimer cohorts.',
    content: '<p>Neurodegenerative disorders such as Alzheimer disease represent complex multifactorial pathophysiologies characterized by chronic neuroinflammation, mitochondrial dysfunction, and oxidative stress...</p>',
    tags: [DEMO_TAGS[1]],
    lastUpdated: new Date(Date.now() - 3600000 * 8).toISOString(),
    imageUtils: ['https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=800'],
    viewCount: 512,
    repostUsers: [],
    likeCount: 67,
    savedUsers: [],
    assigned_date: null,
    discardReason: '',
    status: 'unassigned',
    reviewer_id: null,
    pb_recordId: 'pb_rec_902',
  },
  {
    _id: '903',
    title: 'Type 2 Diabetes Remission Strategies: Intermittent Fasting and Micro-Nutrient Optimization',
    authorName: 'Dr. Vikram Sen, MD',
    authorId: 'usr_vikram',
    description: 'Clinical efficacy of severe caloric restriction and time-restricted feeding in reducing hepatic steatosis and beta-cell glucotoxicity.',
    summary: 'Review of the DiRECT clinical trial follow-up data and practical primary care implementation guidelines.',
    content: '<p>The prevailing dogma that Type 2 Diabetes is an inexorably progressive, lifelong chronic illness has been fundamentally challenged by recent clinical intervention trials demonstrating sustained beta-cell recovery...</p>',
    tags: [DEMO_TAGS[2]],
    lastUpdated: new Date(Date.now() - 3600000 * 18).toISOString(),
    imageUtils: ['https://images.pexels.com/photos/6823567/pexels-photo-6823567.jpeg?auto=compress&cs=tinysrgb&w=800'],
    viewCount: 290,
    repostUsers: [],
    likeCount: 31,
    savedUsers: [],
    assigned_date: null,
    discardReason: '',
    status: 'unassigned',
    reviewer_id: null,
    pb_recordId: 'pb_rec_903',
  },
  {
    _id: '904',
    title: 'Atopic Dermatitis & Biological Therapies: A Primary Care Diagnostic Update',
    authorName: 'Dr. Priya Patel, MS',
    authorId: 'usr_priya',
    description: 'Targeted monoclonal antibodies versus Janus kinase (JAK) inhibitors in moderating severe refractory pruritus and epidermal barrier restoration.',
    summary: 'Safety monitoring, lab surveillance, and flare management in adult atopic eczema.',
    content: '<p>Atopic dermatitis involves complex interactions between epidermal skin barrier breakdown and immune dysregulation driven predominantly by type 2 cytokine signaling including IL-4 and IL-13...</p>',
    tags: [DEMO_TAGS[3]],
    lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString(),
    imageUtils: ['https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=800'],
    viewCount: 198,
    repostUsers: [],
    likeCount: 19,
    savedUsers: [],
    assigned_date: null,
    discardReason: '',
    status: 'unassigned',
    reviewer_id: null,
    pb_recordId: 'pb_rec_904',
  },
  {
    _id: '905',
    title: 'Pediatric Antibiotic Stewardship: Avoiding Resistant Respiratory Infections',
    authorName: 'Dr. Sameer Joshi, MD',
    authorId: 'usr_sameer',
    description: 'Evidence-based algorithms for differentiating viral croup, bronchiolitis, and streptococcal pharyngitis in pediatric outpatient settings.',
    summary: 'Reducing broad-spectrum macrolide overprescription in pediatric community-acquired infections.',
    content: '<p>Judicious antimicrobial stewardship in ambulatory pediatric practice is essential to counter the alarming rise of antimicrobial resistance worldwide...</p>',
    tags: [DEMO_TAGS[4]],
    lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
    imageUtils: ['https://images.pexels.com/photos/4167541/pexels-photo-4167541.jpeg?auto=compress&cs=tinysrgb&w=800'],
    viewCount: 421,
    repostUsers: [],
    likeCount: 54,
    savedUsers: [],
    assigned_date: null,
    discardReason: '',
    status: 'unassigned',
    reviewer_id: null,
    pb_recordId: 'pb_rec_905',
  },
];

export const DEMO_IN_PROGRESS_ARTICLES: ArticleData[] = [
  {
    _id: '906',
    title: 'Clinical Evaluation of Long-COVID Cardiovascular Sequelae: Myocarditis & POTS',
    authorName: 'Dr. Ananya Sharma, MD',
    authorId: 'usr_ananya',
    description: 'Post-acute sequelae of SARS-CoV-2 infection on cardiac conduction systems, autonomic dysfunction, and exercise intolerance protocols.',
    summary: 'Diagnostic pathway for post-infectious orthostatic tachycardia syndrome and microvascular ischemia.',
    content: '<p>Cardiovascular symptoms represent a frequent and debilitating facet of post-acute sequelae of COVID-19 (PASC). Patients frequently present with postural palpitations, chest discomfort, and severe fatigue...</p>',
    tags: [DEMO_TAGS[0]],
    lastUpdated: new Date(Date.now() - 3600000 * 2).toISOString(),
    imageUtils: ['https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800'],
    viewCount: 612,
    repostUsers: [],
    likeCount: 88,
    savedUsers: [],
    assigned_date: new Date().toISOString(),
    discardReason: '',
    status: 'in_progress',
    reviewer_id: 'reviewer_active',
    pb_recordId: 'pb_rec_906',
  },
  {
    _id: '907',
    title: 'Therapeutic Glucagon-Like Peptide-1 (GLP-1) Agonists: Renal & Metabolic Outcomes',
    authorName: 'Dr. Vikram Sen, MD',
    authorId: 'usr_vikram',
    description: 'Examining cardiorenal protection, GFR preservation, and weight-independent glycemic benefits in high-risk diabetic cohorts.',
    summary: 'Synthesis of FLOW, SUSTAIN, and AMPLITUDE-O nephroprotection trials.',
    content: '<p>The therapeutic horizon of GLP-1 receptor agonists has expanded dramatically from glycemic lowering to profound multi-organ protection across diabetic nephropathy and heart failure...</p>',
    tags: [DEMO_TAGS[2]],
    lastUpdated: new Date(Date.now() - 3600000 * 5).toISOString(),
    imageUtils: ['https://images.pexels.com/photos/6823567/pexels-photo-6823567.jpeg?auto=compress&cs=tinysrgb&w=800'],
    viewCount: 450,
    repostUsers: [],
    likeCount: 73,
    savedUsers: [],
    assigned_date: new Date().toISOString(),
    discardReason: '',
    status: 'in_progress',
    reviewer_id: 'reviewer_active',
    pb_recordId: 'pb_rec_907',
  },
];

export const DEMO_IMPROVEMENTS: EditRequest[] = [
  {
    _id: 'edit_req_101',
    user_id: 'usr_ananya',
    article: DEMO_ARTICLES[0],
    edit_reason: 'Updated pharmacological dosage guidelines for stage-2 hypertension based on recent European Society of Cardiology clinical update.',
    status: 'pending',
    reviewer_id: undefined,
    edited_content: '<p>Revised Section 4: Calcium channel blocker titrations must be accompanied by serum electrolyte evaluation at 4-week follow-up intervals...</p>',
    editComments: [],
    created_at: new Date(Date.now() - 3600000 * 6),
    discardReason: '',
    last_updated: new Date(),
    pb_recordId: 'pb_edit_101',
    article_recordId: 'pb_rec_901',
    imageUtils: [],
  },
  {
    _id: 'edit_req_102',
    user_id: 'usr_rajesh',
    article: DEMO_ARTICLES[1],
    edit_reason: 'Clarified contraindications for high-dose DHA supplementation in patients with concurrent anticoagulant therapy.',
    status: 'pending',
    reviewer_id: undefined,
    edited_content: '<p>Revised Section 2: Patients receiving direct oral anticoagulants (DOACs) must maintain total omega-3 fatty acid intake below 3g daily...</p>',
    editComments: [],
    created_at: new Date(Date.now() - 3600000 * 14),
    discardReason: '',
    last_updated: new Date(),
    pb_recordId: 'pb_edit_102',
    article_recordId: 'pb_rec_902',
    imageUtils: [],
  },
  {
    _id: 'edit_req_103',
    user_id: 'usr_priya',
    article: DEMO_ARTICLES[3],
    edit_reason: 'Added black-box warnings and FDA safety advisories regarding oral JAK inhibitors for severe pediatric atopic dermatitis.',
    status: 'in_progress',
    reviewer_id: 'reviewer_active',
    edited_content: '<p>Section 5 Update: Mandatory lipid panel and hepatic transaminase surveillance required at baseline and 12-week intervals...</p>',
    editComments: [],
    created_at: new Date(Date.now() - 86400000 * 1),
    discardReason: '',
    last_updated: new Date(),
    pb_recordId: 'pb_edit_103',
    article_recordId: 'pb_rec_904',
    imageUtils: [],
  },
];

export const DEMO_PODCASTS: PodcastData[] = [
  {
    _id: 'pod_201',
    user_id: DEMO_USER_1,
    article_id: 901,
    title: 'Clinical Perspectives: Treating Refractory Hypertension in Primary Care',
    description: 'Dr. Ananya Sharma discusses resistant hypertension diagnostic algorithms and third-line aldosterone antagonist therapy.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover_image: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: 1420,
    tags: [DEMO_TAGS[0]],
    likedUsers: [DEMO_USER_2],
    savedUsers: [],
    viewUsers: [],
    discardReason: '',
    is_removed: false,
    mentionedUsers: [],
    reportId: null,
    status: 'unassigned',
    admin_id: null,
    updated_at: new Date().toISOString(),
    filePath: 'podcasts/pod_201.mp3',
    downloadAt: new Date(),
    commentCount: 8,
  },
  {
    _id: 'pod_202',
    user_id: DEMO_USER_2,
    article_id: 902,
    title: 'The Brain-Gut Axis: Neuroinflammation and Dietary Interventions',
    description: 'Dr. Rajesh Mehta reviews microbiome metabolites, short-chain fatty acids, and blood-brain barrier integrity.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover_image: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: 1850,
    tags: [DEMO_TAGS[1]],
    likedUsers: [DEMO_USER_1],
    savedUsers: [],
    viewUsers: [],
    discardReason: '',
    is_removed: false,
    mentionedUsers: [],
    reportId: null,
    status: 'unassigned',
    admin_id: null,
    updated_at: new Date().toISOString(),
    filePath: 'podcasts/pod_202.mp3',
    downloadAt: new Date(),
    commentCount: 14,
  },
  {
    _id: 'pod_203',
    user_id: DEMO_USER_3,
    article_id: 904,
    title: 'Biological Advancements in Refractory Dermatology',
    description: 'Dr. Priya Patel breaks down targeted immunological approaches for chronic eczema and psoriasis.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover_image: 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: 1180,
    tags: [DEMO_TAGS[3]],
    likedUsers: [],
    savedUsers: [],
    viewUsers: [],
    discardReason: '',
    is_removed: false,
    mentionedUsers: [],
    reportId: null,
    status: 'unassigned',
    admin_id: null,
    updated_at: new Date().toISOString(),
    filePath: 'podcasts/pod_203.mp3',
    downloadAt: new Date(),
    commentCount: 5,
  },
];

export const DEMO_REASONS: Reason[] = [
  {_id: 'rsn_1', reason: 'Misleading or Unverified Clinical Information', status: 'active'},
  {_id: 'rsn_2', reason: 'Unsubstantiated Pharmacological Claims', status: 'active'},
  {_id: 'rsn_3', reason: 'Copyright or Plagiarism Infringement', status: 'active'},
];

export const DEMO_REPORTS: Report[] = [
  {
    _id: 'rep_301',
    admin_id: null,
    action_taken: 'pending',
    articleId: DEMO_ARTICLES[0],
    podcastId: DEMO_PODCASTS[0],
    commentId: {_id: 'comm_1', id: '1', comment: 'Claims that herbal tea replaces beta-blockers entirely without medical guidance.'} as any,
    reportedBy: DEMO_USER_2,
    convictId: {_id: 'usr_unverified', user_name: 'HerbalRemedies24', user_handle: 'herbal_remedies', Profile_image: '', followers: []},
    reasonId: DEMO_REASONS[0],
    last_action_date: new Date(),
    created_at: new Date(Date.now() - 3600000 * 5),
    convict_statement: 'User posted non-peer reviewed claims advocating cessation of prescription anti-hypertensives.',
  },
  {
    _id: 'rep_302',
    admin_id: null,
    action_taken: 'pending',
    articleId: DEMO_ARTICLES[2],
    podcastId: DEMO_PODCASTS[1],
    commentId: {_id: 'comm_2', id: '2', comment: 'Selling unregulated GLP-1 compounding peptide formulas via telegram links.'} as any,
    reportedBy: DEMO_USER_1,
    convictId: {_id: 'usr_spammer', user_name: 'PeptideShop', user_handle: 'peptides_fast', Profile_image: '', followers: []},
    reasonId: DEMO_REASONS[1],
    last_action_date: new Date(),
    created_at: new Date(Date.now() - 3600000 * 12),
    convict_statement: 'Spamming commercial affiliate links for unapproved injectable compounds in article comment section.',
  },
];

// Helper fallback wrappers
export function getFallbackArticles(realArticles?: ArticleData[]): ArticleData[] {
  if (Array.isArray(realArticles) && realArticles.length > 0) {
    return realArticles;
  }
  return DEMO_ARTICLES;
}

export function getFallbackProgressArticles(realArticles?: ArticleData[]): ArticleData[] {
  if (Array.isArray(realArticles) && realArticles.length > 0) {
    return realArticles;
  }
  return DEMO_IN_PROGRESS_ARTICLES;
}

export function getFallbackImprovements(realImprovements?: EditRequest[]): EditRequest[] {
  if (Array.isArray(realImprovements) && realImprovements.length > 0) {
    return realImprovements;
  }
  return DEMO_IMPROVEMENTS;
}

export function getFallbackPodcasts(realPodcasts?: any[]): any[] {
  if (Array.isArray(realPodcasts) && realPodcasts.length > 0) {
    return realPodcasts;
  }
  return DEMO_PODCASTS;
}

export function getFallbackReports(realReports?: Report[]): Report[] {
  if (Array.isArray(realReports) && realReports.length > 0) {
    return realReports;
  }
  return DEMO_REPORTS;
}

export function getFallbackCount(realCount: number | undefined | null, fallbackCount: number): number {
  if (typeof realCount === 'number' && realCount > 0) {
    return realCount;
  }
  return fallbackCount;
}

export const DEMO_NOTIFICATIONS: NotificationD[] = [
  {
    _id: 'notif_001',
    userId: DEMO_USER_1,
    adminId: null,
    articleId: DEMO_ARTICLES[0],
    revisonId: null,
    podcastId: null,
    commentId: null,
    articleRecordId: 'pb_rec_901',
    type: NotificationType.ArticleSubmitToAdmin,
    title: 'New Clinical Article Submitted',
    message: 'Dr. Ananya Sharma submitted "Hypertension Management: Contemporary Evidence-Based Guidelines 2026" for peer review.',
    read: false,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'notif_002',
    userId: DEMO_USER_2,
    adminId: null,
    articleId: null,
    revisonId: DEMO_IMPROVEMENTS[0],
    podcastId: null,
    commentId: null,
    articleRecordId: 'pb_rec_901',
    type: NotificationType.RevisionSubmitToAdmin,
    title: 'Clinical Revision Pending Review',
    message: 'A revision request was submitted regarding pharmacological dosage updates in cardiovascular care.',
    read: false,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'notif_003',
    userId: DEMO_USER_1,
    adminId: null,
    articleId: DEMO_ARTICLES[1],
    revisonId: null,
    podcastId: null,
    commentId: null,
    articleRecordId: 'pb_rec_902',
    type: NotificationType.ArticleComment,
    title: 'New Clinical Commentary',
    message: 'Dr. Rajesh Mehta commented on the neuroprotective nutrition article.',
    read: true,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'notif_004',
    userId: null,
    adminId: null,
    articleId: DEMO_ARTICLES[2],
    revisonId: null,
    podcastId: null,
    commentId: null,
    articleRecordId: 'pb_rec_903',
    type: NotificationType.ArticleSubmitToAdmin,
    title: 'Article Queue Assignment',
    message: 'Type 2 Diabetes Remission Strategies is queued for peer review.',
    read: true,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getFallbackNotifications(realNotifications?: NotificationD[]): NotificationD[] {
  if (Array.isArray(realNotifications) && realNotifications.length > 0) {
    return realNotifications;
  }
  return DEMO_NOTIFICATIONS;
}

export const DEMO_GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    _id: 'term_1',
    term: 'Arterial Hypertension',
    definition: 'A chronic medical condition characterized by persistent elevation of systemic arterial blood pressure exceeding 130/80 mmHg.',
    slug: 'arterial-hypertension',
    category: 'Cardiology',
    phonetic: '/ɑːrˈtɪəriəl ˌhaɪpərˈtɛnʃən/',
    status: 'unassigned',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    _id: 'term_2',
    term: 'Amyloid Beta (Aβ)',
    definition: 'Peptides of 36–43 amino acids crucially implicated in Alzheimer disease as the main component of amyloid plaques found in patient brains.',
    slug: 'amyloid-beta',
    category: 'Neurology',
    phonetic: '/ˈæmɪlɔɪd ˈbeɪtə/',
    status: 'in-progress',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    _id: 'term_3',
    term: 'Glucagon-Like Peptide-1 (GLP-1)',
    definition: 'An incretin peptide hormone secreted from enteroendocrine L-cells that enhances insulin secretion in a glucose-dependent manner.',
    slug: 'glp-1',
    category: 'Endocrinology',
    phonetic: '/ˈɡluːkəɡɒn laɪk ˈpɛptaɪd wʌn/',
    status: 'unassigned',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: 'term_4',
    term: 'Atopic Eczema',
    definition: 'A chronic, pruritic inflammatory skin disease characterized by epidermal barrier dysfunction and immune hypersensitivity.',
    slug: 'atopic-eczema',
    category: 'Dermatology',
    phonetic: '/eɪˈtɒpɪk ˈɛksɪmə/',
    status: 'in-progress',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'term_5_pub',
    term: 'Acute Myocardial Infarction',
    definition: 'Commonly known as a heart attack; occurs when blood flow decreases or stops to a part of the heart, causing damage to the heart muscle.',
    slug: 'acute-myocardial-infarction',
    category: 'Cardiology',
    phonetic: '/əˈkjuːt ˌmaɪəʊˈkɑːdiəl ɪnˈfɑːkʃən/',
    status: 'published',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export function getFallbackGlossaryTerms(realTerms?: GlossaryTerm[]): GlossaryTerm[] {
  const terms = Array.isArray(realTerms) && realTerms.length > 0 ? realTerms : DEMO_GLOSSARY_TERMS;
  // Published glossary ko maat dikhao, sirf under review and unassign
  return terms.filter(t => t.status !== 'published');
}

export function getFallbackUnassignedGlossary(realTerms?: GlossaryTerm[]): GlossaryTerm[] {
  const terms = Array.isArray(realTerms) && realTerms.length > 0 ? realTerms : DEMO_GLOSSARY_TERMS;
  return terms.filter(t => t.status === 'unassigned');
}

export function getFallbackInProgressGlossary(realTerms?: GlossaryTerm[]): GlossaryTerm[] {
  const terms = Array.isArray(realTerms) && realTerms.length > 0 ? realTerms : DEMO_GLOSSARY_TERMS;
  return terms.filter(t => t.status === 'in-progress' || t.status === 'review-pending' || t.status === 'awaiting-user');
}

export const DEMO_ADMINS: any[] = [
  {
    _id: '6adecf8fa082224345d5bab1',
    user_name: 'Dr. Ananya Sharma',
    user_handle: 'dr_ananya_cardio',
    email: 'dr_ananya@ultimatehealth.org',
    role: 'Moderator',
    isSuperAdmin: false,
    isBlocked: false,
    status: 'active',
    isVerified: true,
    signature_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&q=80',
    Profile_avtar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&q=80',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    _id: '6adecf8fa082224345d5bab2',
    user_name: 'Dr. Rajesh Mehta',
    user_handle: 'dr_rajesh_neuro',
    email: 'dr_rajesh@ultimatehealth.org',
    role: 'Moderator',
    isSuperAdmin: false,
    isBlocked: false,
    status: 'active',
    isVerified: true,
    signature_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
    Profile_avtar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    _id: '6adecf8fa082224345d5bab3',
    user_name: 'Dr. Priya Patel',
    user_handle: 'dr_priya_derma',
    email: 'dr_priya@ultimatehealth.org',
    role: 'Reviewer',
    isSuperAdmin: false,
    isBlocked: false,
    status: 'active',
    isVerified: true,
    signature_url: 'https://images.unsplash.com/photo-1594824813633-46c52a36d9cf?auto=format&fit=crop&w=250&q=80',
    Profile_avtar: 'https://images.unsplash.com/photo-1594824813633-46c52a36d9cf?auto=format&fit=crop&w=250&q=80',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    _id: '6adecf8fa082224345d5bab0',
    user_name: 'Super Admin Executive',
    user_handle: 'superadmin_console',
    email: 'sb2318@it.jgec.ac.in',
    role: 'Super Admin',
    isSuperAdmin: true,
    isBlocked: false,
    status: 'active',
    isVerified: true,
    signature_url: '',
    Profile_avtar: '',
    created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
  },
];

export const DEMO_PLATFORM_ANALYTICS = {
  staffMetrics: {
    totalAdmins: 4,
    activeAdmins: 4,
    suspendedAdmins: 0,
    pendingApplicants: 3,
    totalApplicants: 5,
  },
  contentMetrics: {
    unassignedArticles: 2,
    inProgressArticles: 1,
    publishedArticles: 4,
    totalArticles: 7,
    reviewQueueCount: 3,
  },
  moderationMetrics: {
    pendingReports: 2,
    resolvedReports: 5,
    totalReports: 7,
  },
  masterDataMetrics: {
    totalSpecializations: 15,
    totalLanguages: 8,
  },
};

export const DEMO_REASONS_METRICS = [
  {
    _id: 'rsn_metric_1',
    reason: 'Misleading health advice / Medical disinformation',
    status: 'Active',
    activeReportsCount: 2,
    resolvedReportsCount: 4,
    totalReportsCount: 6,
  },
  {
    _id: 'rsn_metric_2',
    reason: 'Unverified drug claims or dangerous pharmaceutical dosages',
    status: 'Active',
    activeReportsCount: 1,
    resolvedReportsCount: 3,
    totalReportsCount: 4,
  },
  {
    _id: 'rsn_metric_3',
    reason: 'Clinical copyright infringement or uncredited text',
    status: 'Active',
    activeReportsCount: 0,
    resolvedReportsCount: 2,
    totalReportsCount: 2,
  },
];

export function getFallbackAdminDossier(admin: any) {
  if (!admin) return null;
  const isSuper = Boolean(admin.isSuperAdmin);
  return {
    admin: {
      _id: admin._id || admin.id || 'admin_dossier_id',
      user_name: admin.user_name || admin.name || 'Staff Member',
      user_handle: admin.user_handle || 'staff_member',
      email: admin.email || 'staff@ultimatehealth.org',
      role: admin.role || (isSuper ? 'Super Admin' : 'Moderator'),
      isSuperAdmin: isSuper,
      isBlocked: Boolean(admin.isBlocked || admin.is_blocked || admin.status === 'suspended'),
      status: admin.status || 'active',
      isVerified: admin.isVerified !== false,
      signature_url: admin.signature_url || '',
      Profile_avtar: admin.Profile_avtar || admin.Profile_image || '',
      created_at: admin.created_at || new Date().toISOString(),
    },
    permissions: {
      canReviewArticles: true,
      canInspectDiffs: true,
      canManageReports: true,
      canManageGlossary: true,
      canAuditGlobal: isSuper,
      canManageAdmins: isSuper,
    },
    metrics: {
      articlesReviewed: isSuper ? 12 : 5,
      improvementsReviewed: isSuper ? 8 : 3,
      reportsHandled: isSuper ? 6 : 2,
    },
  };
}
