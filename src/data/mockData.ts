import { RoleplayScenario, GrammarModule, VocabWord } from '../types';

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'professor-office-hours',
    title: 'Asking a Professor for Clarification & Extension',
    category: 'academic',
    description:
      'Visit your professor during office hours to politely ask for clarification on an assignment and request a 2-day deadline extension due to campus hackathon participation.',
    characterName: 'Prof. Jonathan Vance',
    characterRole: 'Associate Professor of Computer Science',
    characterAvatar: '👨‍🏫',
    initialPrompt:
      'Come in! Have a seat. I was just reviewing the syllabus. What can I help you with regarding the operating systems assignment?',
    learningObjectives: [
      'Polite and respectful formal academic register',
      'Direct, concise explanation without making excuses',
      'Offering a win-win compromise or progress update',
    ],
  },
  {
    id: 'talking-to-seniors',
    title: 'Seeking Placement & Internship Advice from a Senior',
    category: 'campus',
    description:
      'Ask a college senior who recently cracked an off-campus software engineering role for practical interview preparation tips and resume review advice.',
    characterName: 'Aarav Mehta',
    characterRole: 'Final Year Student & Incoming SWE at Razorpay',
    characterAvatar: '🧑‍💻',
    initialPrompt:
      'Hey! Glad you reached out on LinkedIn. The placement season is definitely intense, but totally manageable if you have a structured roadmap. What year are you in, and how are your DSA and projects looking right now?',
    learningObjectives: [
      'Friendly yet professional peer networking',
      'Asking targeted, non-generic questions',
      'Active listening and appreciative follow-ups',
    ],
  },
  {
    id: 'canteen-small-talk',
    title: 'Casual Campus Networking & Canteen Small Talk',
    category: 'campus',
    description:
      'Start a natural, friendly conversation with a student sitting next to you in the college cafeteria or library lounge during semester exam week.',
    characterName: 'Maya Chen',
    characterRole: 'Data Science Sophomore & Tech Club Organizer',
    characterAvatar: '👩‍🎓',
    initialPrompt:
      'Hey there! Mind if I share this table? The campus cafeteria is packed today. Are you studying for the machine learning midterm too?',
    learningObjectives: [
      'Breaking the ice smoothly without awkward silence',
      'Using open-ended questions to keep dialogue moving',
      'Natural transitions from college life to shared interests',
    ],
  },
  {
    id: 'group-discussion-round',
    title: 'Campus Placement Group Discussion (GD) Round',
    category: 'discussion',
    description:
      'Participate in a competitive campus GD on the topic: "Will generative AI create more opportunities than it eliminates for fresh engineering graduates?"',
    characterName: 'Moderator Priya & Virtual Peers',
    characterRole: 'Campus Hiring GD Moderator',
    characterAvatar: '👥',
    initialPrompt:
      'Welcome candidates to Round 2. The topic is: "Will generative AI create more opportunities than it eliminates for fresh graduates?" You have 10 minutes. Candidate 1, you may initiate or anyone can open the floor.',
    learningObjectives: [
      'Initiating or entering a group discussion with presence',
      'Polite disagreement using "I see your point, however..."',
      'Synthesizing multiple viewpoints and steering back to the core theme',
    ],
  },
  {
    id: 'explaining-tech-project',
    title: 'Explaining an AI/ML Project to a Senior Mentor',
    category: 'career',
    description:
      'Explain your semester project or hackathon build to a mentor. Articulate the problem, architecture, tradeoffs, and key learnings in crisp English.',
    characterName: 'Dr. Elena Rostova',
    characterRole: 'Senior Research Scientist & Hackathon Judge',
    characterAvatar: '🔬',
    initialPrompt:
      'Welcome to the project evaluation booth! I see you built an intelligent document analysis system. Walk me through the problem statement, why traditional approaches failed, and how your solution handles edge cases.',
    learningObjectives: [
      'Explaining complex technical concepts simply without filler words',
      'Structuring explanations: Problem -> Architecture -> Impact',
      'Handling tough technical questions under pressure',
    ],
  },
  {
    id: 'hr-behavioral-interview',
    title: 'HR Behavioral Interview: Overcoming Conflict',
    category: 'career',
    description:
      'Answer classic behavioral questions like "Tell me about a time you had a serious disagreement with a team member and how you resolved it" using the STAR method.',
    characterName: 'Rachel Green',
    characterRole: 'Head of University Talent Acquisition',
    characterAvatar: '💼',
    initialPrompt:
      'Good morning! We loved your coding round performance. In engineering, collaboration is just as critical as raw technical skill. Could you describe a time when you and a teammate had strongly opposing views on a project, and how you worked through it?',
    learningObjectives: [
      'Utilizing the STAR framework (Situation, Task, Action, Result)',
      'Avoiding defensive language or blaming teammates',
      'Demonstrating emotional intelligence and professional maturity',
    ],
  },
  {
    id: 'tech-presentation-qna',
    title: 'Technical Seminar Presentation & Hostile Q&A',
    category: 'academic',
    description:
      'Defend your presentation on "Quantum Computing vs Modern Cryptography" before a sharp academic panel with challenging follow-up questions.',
    characterName: 'Prof. Harrison Cole',
    characterRole: 'Department Chair & Senior Reviewer',
    characterAvatar: '🏛️',
    initialPrompt:
      'Thank you for your initial slides. You claimed that post-quantum lattice cryptography is ready for immediate enterprise rollout. How do you reconcile that with current memory and key size overheads?',
    learningObjectives: [
      'Staying calm and composed during critical questioning',
      'Using acknowledging phrases: "That is a valid concern...", "To address that specific point..."',
      'Closing presentations with persuasive, definitive impact',
    ],
  },
];

export const GRAMMAR_MODULES: GrammarModule[] = [
  {
    id: 'mti-common-pitfalls',
    title: 'Overcoming Common Student Translation Traps',
    tag: 'Fluency & Natural Usage',
    ruleExplanation:
      'Many Indian and bilingual students translate directly from their native tongue into English. This causes common unnatural idioms like "I have a doubt" (say "I have a question"), "discuss about" (discuss already means talk about), and "pass out of college" (say "graduate").',
    commonPitfall:
      'Saying "Myself Rahul" instead of "I am Rahul" or "My name is Rahul". In English, reflexive pronouns cannot serve as sentence subjects.',
    questions: [
      {
        prompt: 'Excuse me sir, I _____ regarding question number 3 in the assignment.',
        options: ['am having a doubt', 'have a question', 'have a doubt', 'am doubting'],
        correctIndex: 1,
        explanation: 'In academic English, "have a question" or "need clarification" is the natural, correct expression.',
      },
      {
        prompt: 'Let us _____ the new campus club guidelines in today’s meeting.',
        options: ['discuss about', 'discuss', 'discuss on', 'discussing about'],
        correctIndex: 1,
        explanation: '"Discuss" is a transitive verb that directly takes the object without "about".',
      },
      {
        prompt: 'My brother will _____ from university next month with a computer science degree.',
        options: ['pass out', 'graduate', 'pass off', 'get passed'],
        correctIndex: 1,
        explanation: 'In standard English, "pass out" means to faint or lose consciousness. Use "graduate".',
      },
    ],
  },
  {
    id: 'past-continuous-vs-simple-past',
    title: 'Past Continuous vs. Simple Past',
    tag: 'Tenses',
    ruleExplanation:
      'Use the Past Continuous (was/were + -ing) for an ongoing background action, and Simple Past (verb-ed / irregular) for the specific action that interrupted it.',
    commonPitfall:
      'Using continuous tense with state verbs, e.g., saying "I was knowing the answer" instead of "I knew the answer".',
    questions: [
      {
        prompt: 'While the team _____ the algorithm, the power suddenly went out.',
        options: ['debugged', 'was debugging', 'has debugged', 'is debugging'],
        correctIndex: 1,
        explanation: '"Was debugging" sets the continuous scene interrupted by the outage.',
      },
      {
        prompt: 'Yesterday, the professor _____ the project marks during lecture.',
        options: ['announced', 'was announcing', 'has announced', 'is announcing'],
        correctIndex: 0,
        explanation: 'With a finished past time marker ("yesterday"), use Simple Past ("announced").',
      },
      {
        prompt: 'I _____ to speak with you earlier today regarding the research paper.',
        options: ['was wanting', 'wanted', 'am wanting', 'wanting'],
        correctIndex: 1,
        explanation: '"Want" is a stative verb and is rarely used in continuous tense in this context.',
      },
    ],
  },
  {
    id: 'articles-a-an-the',
    title: 'Mastering Articles: A, An, and The',
    tag: 'Articles',
    ruleExplanation:
      'Use "a/an" for non-specific singular countable items (use "an" before vowel sounds like "an hour", "an honest mistake"). Use "the" when both speaker and listener know which specific item is meant, or when it is unique.',
    commonPitfall:
      'Skipping articles altogether before countable nouns, e.g., saying "I am writing email" instead of "I am writing an email".',
    questions: [
      {
        prompt: 'It was _____ honor to represent our department at the state conference.',
        options: ['a', 'an', 'the', 'no article'],
        correctIndex: 1,
        explanation: '"Honor" begins with a silent "h", producing the vowel sound /ɒ/, requiring "an".',
      },
      {
        prompt: 'Could you please pass me _____ notes you took during Monday’s data structures class?',
        options: ['a', 'an', 'the', 'some of'],
        correctIndex: 2,
        explanation: 'These are specific notes identifiable to both speaker and listener, requiring "the".',
      },
      {
        prompt: 'She plans to pursue _____ Master’s degree in artificial intelligence.',
        options: ['a', 'an', 'the', 'no article'],
        correctIndex: 0,
        explanation: '"Master\'s" begins with a consonant sound /m/, so "a" is used.',
      },
    ],
  },
  {
    id: 'prepositions-in-on-at',
    title: 'Prepositions of Time and Place: In, On, At',
    tag: 'Prepositions',
    ruleExplanation:
      'Time: "at" for exact clock times (at 4 PM), "on" for days and dates (on Monday, on July 14th), "in" for months, years, and general periods (in 2026, in the morning). Place: "at" for specific spots, "on" for surfaces/streets, "in" for enclosed spaces/cities.',
    commonPitfall:
      'Saying "at the morning" (say "in the morning") or "discuss on Sunday morning" vs "in Sunday".',
    questions: [
      {
        prompt: 'Our mock interview session is scheduled _____ 3:30 PM _____ Thursday.',
        options: ['at / on', 'on / in', 'in / on', 'at / in'],
        correctIndex: 0,
        explanation: 'Use "at" for specific clock times and "on" for specific days.',
      },
      {
        prompt: 'The campus placement drive will be held _____ the auditorium _____ Bangalore.',
        options: ['in / at', 'at / in', 'on / at', 'in / on'],
        correctIndex: 1,
        explanation: 'Use "at" for specific venue points ("at the auditorium") and "in" for cities ("in Bangalore").',
      },
      {
        prompt: 'I saw the hackathon announcement _____ the department notice board.',
        options: ['at', 'in', 'on', 'with'],
        correctIndex: 2,
        explanation: 'Surfaces take "on" ("on the board", "on the screen").',
      },
    ],
  },
  {
    id: 'subject-verb-agreement',
    title: 'Subject-Verb Agreement in Professional English',
    tag: 'Structure',
    ruleExplanation:
      'Singular subjects take singular verbs; plural subjects take plural verbs. Pay close attention to words joined by "as well as", "either... or", and indefinite pronouns like "each" and "every".',
    commonPitfall:
      'Saying "Each of the students have submitted" instead of "Each of the students has submitted". "Each" is grammatically singular.',
    questions: [
      {
        prompt: 'Each of the project team members _____ given five minutes to present.',
        options: ['is', 'are', 'were', 'have been'],
        correctIndex: 0,
        explanation: '"Each" is singular and governs the verb, so "is" is correct.',
      },
      {
        prompt: 'The professor, along with three research scholars, _____ publishing the paper.',
        options: ['is', 'are', 'were', 'have been'],
        correctIndex: 0,
        explanation: 'Parenthetical phrases like "along with" do not make the subject plural. "The professor" is singular.',
      },
      {
        prompt: 'Neither the team lead nor the developers _____ convinced by the proposal.',
        options: ['was', 'were', 'is', 'has been'],
        correctIndex: 1,
        explanation: 'In "neither... nor" constructions, the verb agrees with the closer subject ("developers" -> plural "were").',
      },
    ],
  },
];

export const VOCABULARY_LIST: VocabWord[] = [
  {
    id: 'v1',
    word: 'Articulate',
    phonetic: '/ɑːrˈtɪk.jə.lət/',
    partOfSpeech: 'adjective / verb',
    meaning: 'Able to express thoughts and ideas clearly and effectively in speech or writing.',
    collegeContextExample:
      'During the campus placement interview, she was able to articulate her project architecture with great precision.',
    collocations: ['articulate speaker', 'articulate an idea', 'clearly articulate'],
    level: 'Intermediate',
    category: 'Communication',
  },
  {
    id: 'v2',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    meaning: 'Dealing with things sensibly and realistically based on practical rather than theoretical considerations.',
    collegeContextExample:
      'Instead of building an overcomplicated microservices setup, our hackathon team chose a pragmatic monolithic approach.',
    collocations: ['pragmatic approach', 'pragmatic solution', 'pragmatic mindset'],
    level: 'Intermediate',
    category: 'Workplace & Logic',
  },
  {
    id: 'v3',
    word: 'Ambiguous',
    phonetic: '/æmˈbɪɡ.ju.əs/',
    partOfSpeech: 'adjective',
    meaning: 'Open to more than one interpretation; unclear or having a double meaning.',
    collegeContextExample:
      'The prompt for the coding competition was ambiguous, so we asked the organizers for clarification before writing code.',
    collocations: ['ambiguous requirements', 'deliberately ambiguous', 'clarify ambiguous'],
    level: 'Intermediate',
    category: 'Technical & Academic',
  },
  {
    id: 'v4',
    word: 'Receptive',
    phonetic: '/rɪˈsep.tɪv/',
    partOfSpeech: 'adjective',
    meaning: 'Willing to consider or accept new suggestions and constructive feedback.',
    collegeContextExample:
      'The professor was very receptive to our suggestion of holding hybrid office hours for working students.',
    collocations: ['receptive to feedback', 'receptive audience', 'highly receptive'],
    level: 'Beginner',
    category: 'Interpersonal',
  },
  {
    id: 'v5',
    word: 'Compelling',
    phonetic: '/kəmˈpel.ɪŋ/',
    partOfSpeech: 'adjective',
    meaning: 'Evoking interest, attention, or admiration in a powerfully irresistible way.',
    collegeContextExample:
      'He opened his seminar with a compelling statistic showing how generative AI adoption doubled in single-semester courses.',
    collocations: ['compelling argument', 'compelling evidence', 'compelling narrative'],
    level: 'Intermediate',
    category: 'Public Speaking',
  },
  {
    id: 'v6',
    word: 'Paradigm',
    phonetic: '/ˈpær.ə.daɪm/',
    partOfSpeech: 'noun',
    meaning: 'A typical example or pattern of something; a distinct set of concepts or thought patterns.',
    collegeContextExample:
      'Transitioning from procedural code to functional reactive programming requires a complete paradigm shift.',
    collocations: ['paradigm shift', 'dominant paradigm', 'programming paradigm'],
    level: 'Advanced',
    category: 'Technical & Academic',
  },
  {
    id: 'v7',
    word: 'Concise',
    phonetic: '/kənˈsaɪs/',
    partOfSpeech: 'adjective',
    meaning: 'Giving a lot of information clearly and in a few words; brief and comprehensive.',
    collegeContextExample:
      'In tech interviews, interviewers prefer concise explanations over ten-minute rambling stories.',
    collocations: ['concise summary', 'clear and concise', 'concise explanation'],
    level: 'Beginner',
    category: 'Communication',
  },
  {
    id: 'v8',
    word: 'Substantiate',
    phonetic: '/səbˈstæn.ʃi.eɪt/',
    partOfSpeech: 'verb',
    meaning: 'Provide evidence to support or prove the truth of a claim or argument.',
    collegeContextExample:
      'In a competitive group discussion, always substantiate your claims with empirical data or industry examples.',
    collocations: ['substantiate a claim', 'substantiate an argument', 'substantiate with evidence'],
    level: 'Advanced',
    category: 'Discussion & Debate',
  },
  {
    id: 'v9',
    word: 'Tenacious',
    phonetic: '/təˈneɪ.ʃəs/',
    partOfSpeech: 'adjective',
    meaning: 'Tending to keep a firm hold of something; clinging or adhering closely; persistent.',
    collegeContextExample:
      'Her tenacious attitude while debugging memory leaks in C++ helped our team win the 36-hour hackathon.',
    collocations: ['tenacious effort', 'tenacious mindset', 'tenacious resolve'],
    level: 'Advanced',
    category: 'Personal Traits',
  },
  {
    id: 'v10',
    word: 'Consensus',
    phonetic: '/kənˈsen.səs/',
    partOfSpeech: 'noun',
    meaning: 'A general agreement arrived at by a group.',
    collegeContextExample:
      'After an energetic debate, the team finally reached a consensus on the database schema.',
    collocations: ['reach a consensus', 'general consensus', 'build consensus'],
    level: 'Intermediate',
    category: 'Group Discussion',
  },
];

export const PUBLIC_SPEAKING_TOPICS = {
  jam: [
    {
      title: 'Should college attendance be mandatory?',
      category: 'Campus Life',
      targetSeconds: 60,
      prepSeconds: 15,
      hookPrompt: 'Take a stand in 15 seconds. State your view, give 2 points, and conclude.',
    },
    {
      title: 'The biggest lesson I learned from a failed project',
      category: 'Personal Growth',
      targetSeconds: 60,
      prepSeconds: 15,
      hookPrompt: 'Describe what broke, what you felt, and the mindset shift it triggered.',
    },
    {
      title: 'Why every college student should build in public',
      category: 'Tech & Career',
      targetSeconds: 60,
      prepSeconds: 15,
      hookPrompt: 'Explain how sharing your projects publicly beats an ordinary resume.',
    },
    {
      title: 'Will artificial intelligence replace junior developers?',
      category: 'Technology',
      targetSeconds: 60,
      prepSeconds: 15,
      hookPrompt: 'Explain both sides, then finish with actionable advice for first-year coders.',
    },
  ],
  presentations: [
    {
      title: '3-Minute Elevator Pitch for a Smart Campus Navigation App',
      structure: ['The Problem (Lost Freshmen)', 'The Solution (AR Campus Map)', 'Impact & Feasibility', 'Ask'],
      targetSeconds: 120,
    },
    {
      title: 'Explaining Blockchain to a Non-Technical Audience',
      structure: ['Relatable Analogy (Shared Google Doc)', 'How Consensus Works', 'Real-world Use Case', 'Closing'],
      targetSeconds: 120,
    },
  ],
  gd: [
    {
      topic: 'Work From Home vs. Return to Office for Tech Freshers',
      keyStances: ['Mentorship & Culture in Office', 'Flexibility & Savings in Remote', 'Hybrid Compromise'],
      targetSeconds: 60,
    },
    {
      topic: 'Is College Degree Still Necessary in the Era of AI & Open Source?',
      keyStances: ['Signals & Alumni Network', 'Practical Skills & Bootcamps', 'Evolving Higher Ed'],
      targetSeconds: 60,
    },
  ],
};
