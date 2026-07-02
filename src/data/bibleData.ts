export interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
  aelfAbbr: string;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // ANCIEN TESTAMENT (39 livres)
  { id: 'genese', name: 'Genèse', testament: 'OT', chapters: 50, aelfAbbr: 'Gn' },
  { id: 'exode', name: 'Exode', testament: 'OT', chapters: 40, aelfAbbr: 'Ex' },
  { id: 'levitique', name: 'Lévitique', testament: 'OT', chapters: 27, aelfAbbr: 'Lv' },
  { id: 'nombres', name: 'Nombres', testament: 'OT', chapters: 36, aelfAbbr: 'Nb' },
  { id: 'deuteronome', name: 'Deutéronome', testament: 'OT', chapters: 34, aelfAbbr: 'Dt' },
  { id: 'josue', name: 'Josué', testament: 'OT', chapters: 24, aelfAbbr: 'Jos' },
  { id: 'juges', name: 'Juges', testament: 'OT', chapters: 21, aelfAbbr: 'Jg' },
  { id: 'ruth', name: 'Ruth', testament: 'OT', chapters: 4, aelfAbbr: 'Rt' },
  { id: '1samuel', name: '1 Samuel', testament: 'OT', chapters: 31, aelfAbbr: '1Sm' },
  { id: '2samuel', name: '2 Samuel', testament: 'OT', chapters: 24, aelfAbbr: '2Sm' },
  { id: '1rois', name: '1 Rois', testament: 'OT', chapters: 22, aelfAbbr: '1R' },
  { id: '2rois', name: '2 Rois', testament: 'OT', chapters: 25, aelfAbbr: '2R' },
  { id: '1chroniques', name: '1 Chroniques', testament: 'OT', chapters: 29, aelfAbbr: '1Ch' },
  { id: '2chroniques', name: '2 Chroniques', testament: 'OT', chapters: 36, aelfAbbr: '2Ch' },
  { id: 'esdras', name: 'Esdras', testament: 'OT', chapters: 10, aelfAbbr: 'Esd' },
  { id: 'nehemie', name: 'Néhémie', testament: 'OT', chapters: 13, aelfAbbr: 'Ne' },
  { id: 'esther', name: 'Esther', testament: 'OT', chapters: 10, aelfAbbr: 'Est' },
  { id: 'job', name: 'Job', testament: 'OT', chapters: 42, aelfAbbr: 'Job' },
  { id: 'psaumes', name: 'Psaumes', testament: 'OT', chapters: 150, aelfAbbr: 'Ps' },
  { id: 'proverbes', name: 'Proverbes', testament: 'OT', chapters: 31, aelfAbbr: 'Pr' },
  { id: 'ecclesiaste', name: 'Ecclésiaste', testament: 'OT', chapters: 12, aelfAbbr: 'Qo' },
  { id: 'cantiquedescantiques', name: 'Cantique des Cantiques', testament: 'OT', chapters: 8, aelfAbbr: 'Ct' },
  { id: 'esaie', name: 'Ésaïe', testament: 'OT', chapters: 66, aelfAbbr: 'Is' },
  { id: 'jeremie', name: 'Jérémie', testament: 'OT', chapters: 52, aelfAbbr: 'Jr' },
  { id: 'lamentations', name: 'Lamentations', testament: 'OT', chapters: 5, aelfAbbr: 'La' },
  { id: 'ezechiel', name: 'Ézéchiel', testament: 'OT', chapters: 48, aelfAbbr: 'Ez' },
  { id: 'daniel', name: 'Daniel', testament: 'OT', chapters: 12, aelfAbbr: 'Dn' },
  { id: 'osee', name: 'Osée', testament: 'OT', chapters: 14, aelfAbbr: 'Os' },
  { id: 'joel', name: 'Joël', testament: 'OT', chapters: 3, aelfAbbr: 'Jl' },
  { id: 'amos', name: 'Amos', testament: 'OT', chapters: 9, aelfAbbr: 'Am' },
  { id: 'abdias', name: 'Abdias', testament: 'OT', chapters: 1, aelfAbbr: 'Ab' },
  { id: 'jonas', name: 'Jonas', testament: 'OT', chapters: 4, aelfAbbr: 'Jon' },
  { id: 'michee', name: 'Michée', testament: 'OT', chapters: 7, aelfAbbr: 'Mi' },
  { id: 'nahum', name: 'Nahum', testament: 'OT', chapters: 3, aelfAbbr: 'Na' },
  { id: 'habacuc', name: 'Habacuc', testament: 'OT', chapters: 3, aelfAbbr: 'Ha' },
  { id: 'sophonie', name: 'Sophonie', testament: 'OT', chapters: 3, aelfAbbr: 'So' },
  { id: 'aggee', name: 'Aggée', testament: 'OT', chapters: 2, aelfAbbr: 'Ag' },
  { id: 'zacharie', name: 'Zacharie', testament: 'OT', chapters: 14, aelfAbbr: 'Za' },
  { id: 'malachie', name: 'Malachie', testament: 'OT', chapters: 4, aelfAbbr: 'Ml' },

  // NOUVEAU TESTAMENT (27 livres)
  { id: 'matthieu', name: 'Matthieu', testament: 'NT', chapters: 28, aelfAbbr: 'Mt' },
  { id: 'marc', name: 'Marc', testament: 'NT', chapters: 16, aelfAbbr: 'Mc' },
  { id: 'luc', name: 'Luc', testament: 'NT', chapters: 24, aelfAbbr: 'Lc' },
  { id: 'jean', name: 'Jean', testament: 'NT', chapters: 21, aelfAbbr: 'Jn' },
  { id: 'actes', name: 'Actes', testament: 'NT', chapters: 28, aelfAbbr: 'Ac' },
  { id: 'romains', name: 'Romains', testament: 'NT', chapters: 16, aelfAbbr: 'Rm' },
  { id: '1corinthiens', name: '1 Corinthiens', testament: 'NT', chapters: 16, aelfAbbr: '1Co' },
  { id: '2corinthiens', name: '2 Corinthiens', testament: 'NT', chapters: 13, aelfAbbr: '2Co' },
  { id: 'galates', name: 'Galates', testament: 'NT', chapters: 6, aelfAbbr: 'Ga' },
  { id: 'ephesiens', name: 'Éphésiens', testament: 'NT', chapters: 6, aelfAbbr: 'Ep' },
  { id: 'philippiens', name: 'Philippiens', testament: 'NT', chapters: 4, aelfAbbr: 'Ph' },
  { id: 'colossiens', name: 'Colossiens', testament: 'NT', chapters: 4, aelfAbbr: 'Col' },
  { id: '1thessaloniciens', name: '1 Thessaloniciens', testament: 'NT', chapters: 5, aelfAbbr: '1Th' },
  { id: '2thessaloniciens', name: '2 Thessaloniciens', testament: 'NT', chapters: 3, aelfAbbr: '2Th' },
  { id: '1timothee', name: '1 Timothée', testament: 'NT', chapters: 6, aelfAbbr: '1Tm' },
  { id: '2timothee', name: '2 Timothée', testament: 'NT', chapters: 4, aelfAbbr: '2Tm' },
  { id: 'tite', name: 'Tite', testament: 'NT', chapters: 3, aelfAbbr: 'Tt' },
  { id: 'philemon', name: 'Philémon', testament: 'NT', chapters: 1, aelfAbbr: 'Phm' },
  { id: 'hebreux', name: 'Hébreux', testament: 'NT', chapters: 13, aelfAbbr: 'He' },
  { id: 'jacques', name: 'Jacques', testament: 'NT', chapters: 5, aelfAbbr: 'Jc' },
  { id: '1pierre', name: '1 Pierre', testament: 'NT', chapters: 5, aelfAbbr: '1P' },
  { id: '2pierre', name: '2 Pierre', testament: 'NT', chapters: 3, aelfAbbr: '2P' },
  { id: '1jean', name: '1 Jean', testament: 'NT', chapters: 5, aelfAbbr: '1Jn' },
  { id: '2jean', name: '2 Jean', testament: 'NT', chapters: 1, aelfAbbr: '2Jn' },
  { id: '3jean', name: '3 Jean', testament: 'NT', chapters: 1, aelfAbbr: '3Jn' },
  { id: 'jude', name: 'Jude', testament: 'NT', chapters: 1, aelfAbbr: 'Jude' },
  { id: 'apocalypse', name: 'Apocalypse', testament: 'NT', chapters: 22, aelfAbbr: 'Ap' }
];

export const OT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'OT');
export const NT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'NT');

export const TOTAL_OT_CHAPTERS = OT_BOOKS.reduce((sum, b) => sum + b.chapters, 0); // 929
export const TOTAL_NT_CHAPTERS = NT_BOOKS.reduce((sum, b) => sum + b.chapters, 0); // 260
export const TOTAL_BIBLE_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0); // 1189
