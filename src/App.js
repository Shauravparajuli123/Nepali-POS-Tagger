import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

// ── NCG Tag definitions ────────────────────────────────────────────────────
const TAG_INFO = {
  VA:  { label: "Copula/Aux",      color: "#f59e0b", bg: "#fef3c7", desc: "Auxiliary/Copula verb (हुनु, छ, हो)" },
  VBF: { label: "Finite Verb",     color: "#10b981", bg: "#d1fae5", desc: "Present tense verb (गर्छ, जान्छ, बस्छु)" },
  VBP: { label: "Past Verb",       color: "#06b6d4", bg: "#cffafe", desc: "Past/Perfective verb (गयो, गरेको, आयो)" },
  VBN: { label: "Non-finite",      color: "#8b5cf6", bg: "#ede9fe", desc: "Infinitive/Relative (गर्नु, गर्ने, पार्न)" },
  VBG: { label: "Gerund",          color: "#6366f1", bg: "#e0e7ff", desc: "Gerund/Participle (गर्दै, गर्दा)" },
  VBI: { label: "Imperative",      color: "#ec4899", bg: "#fce7f3", desc: "Command form (गर्नुस्, होस्)" },
  NN:  { label: "Common Noun",     color: "#3b82f6", bg: "#dbeafe", desc: "Common noun (घर, काम, मान्छे, देश)" },
  NNP: { label: "Proper Noun",     color: "#1d4ed8", bg: "#bfdbfe", desc: "Proper noun / name (नेपाल, काठमाडौं)" },
  PP:  { label: "Pronoun",         color: "#7c3aed", bg: "#ede9fe", desc: "Personal pronoun (म, हामी, उनी)" },
  PPD: { label: "Demonstrative",   color: "#9333ea", bg: "#f3e8ff", desc: "Demonstrative (यो, त्यो, यी)" },
  PPW: { label: "Wh-Pronoun",      color: "#a855f7", bg: "#faf5ff", desc: "Question pronoun (को, के, कहाँ)" },
  PPR: { label: "Reflexive",       color: "#c026d3", bg: "#fdf4ff", desc: "Reflexive pronoun (आफू, आफ्नो)" },
  PPX: { label: "Indefinite Pro",  color: "#db2777", bg: "#fdf2f8", desc: "Indefinite (कोही, केही, सबै)" },
  JJ:  { label: "Adjective",       color: "#f97316", bg: "#ffedd5", desc: "Adjective (राम्रो, ठूलो, नयाँ)" },
  RB:  { label: "Adverb",          color: "#84cc16", bg: "#f7fee7", desc: "Adverb (धेरै, बिस्तारै, एकदम)" },
  RBT: { label: "Time Adverb",     color: "#65a30d", bg: "#ecfccb", desc: "Time adverb (अहिले, हिजो, भोलि)" },
  RBL: { label: "Loc. Adverb",     color: "#16a34a", bg: "#dcfce7", desc: "Locative adverb (यहाँ, त्यहाँ)" },
  CC:  { label: "Coord. Conj.",    color: "#dc2626", bg: "#fee2e2", desc: "Coordinating conj. (र, तर, वा)" },
  CS:  { label: "Subord. Conj.",   color: "#b91c1c", bg: "#fecaca", desc: "Subordinating conj. (किनभने, यदि)" },
  CMP: { label: "Possessive",      color: "#0891b2", bg: "#e0f2fe", desc: "Possessive case marker -को/-का/-की" },
  CME: { label: "Ergative",        color: "#0e7490", bg: "#cffafe", desc: "Ergative case marker -ले" },
  CMD: { label: "Dative",          color: "#155e75", bg: "#a5f3fc", desc: "Dative case marker -लाई" },
  CML: { label: "Locative",        color: "#164e63", bg: "#67e8f9", desc: "Locative case marker -मा/-मध्ये" },
  CMA: { label: "Ablative",        color: "#1e3a5f", bg: "#7dd3fc", desc: "Ablative case marker -बाट/-देखि" },
  RP:  { label: "Particle",        color: "#854d0e", bg: "#fef9c3", desc: "Particle (नि, पो, नै)" },
  RPD: { label: "Disc. Particle",  color: "#713f12", bg: "#fef08a", desc: "Discourse particle (त, चाहिँ)" },
  POP: { label: "Postposition",    color: "#78350f", bg: "#fde68a", desc: "Postposition (लागि, सम्म, बिना)" },
  CD:  { label: "Cardinal",        color: "#374151", bg: "#f3f4f6", desc: "Cardinal number (एक, दुई, २०७९)" },
  OD:  { label: "Ordinal",         color: "#4b5563", bg: "#f9fafb", desc: "Ordinal number (पहिलो, दोस्रो)" },
  DT:  { label: "Determiner",      color: "#6b7280", bg: "#f3f4f6", desc: "Determiner (यस्तो, अरू, हरेक)" },
  FW:  { label: "Foreign Word",    color: "#9ca3af", bg: "#f9fafb", desc: "Foreign/Roman word (English)" },
  SYM: { label: "Symbol",          color: "#d1d5db", bg: "#f9fafb", desc: "Punctuation/Symbol (। , ? !)" },
  UH:  { label: "Interjection",    color: "#fbbf24", bg: "#fffbeb", desc: "Interjection (वाह, ओहो, अरे)" },
  PL:  { label: "Plural Marker",   color: "#64748b", bg: "#f1f5f9", desc: "Plural suffix -हरू (split from stem)" },
  XX:  { label: "Unknown",         color: "#9ca3af", bg: "#f3f4f6", desc: "Unknown/Unclassified word" },
};

// ── Lexicon ────────────────────────────────────────────────────────────────
const LEXICON = {
  'छ':'VA','छन्':'VA','छु':'VA','छौ':'VA','थियो':'VA','थिए':'VA',
  'हो':'VA','होइन':'VA','हैन':'VA','हुन्':'VA','भयो':'VA','भए':'VA',
  'हुनेछ':'VA','थिएन':'VA','छैन':'VA','छैनन्':'VA',
  'म':'PP','हामी':'PP','तिमी':'PP','तपाईं':'PP','उनी':'PP',
  'उहाँ':'PP','ऊ':'PP','उनीहरू':'PP',
  'यो':'PPD','त्यो':'PPD','यी':'PPD','ती':'PPD','यस':'PPD','त्यस':'PPD',
  'को':'PPW','के':'PPW','कहाँ':'PPW','कसरी':'PPW','कति':'PPW','किन':'PPW',
  'आफू':'PPR','आफैं':'PPR','आफ्नो':'PPR',
  'कोही':'PPX','केही':'PPX','सबै':'PPX','कुनै':'PPX',
  'र':'CC','तर':'CC','अनि':'CC','वा':'CC','पनि':'CC','तथा':'CC',
  'किनभने':'CS','यदि':'CS','ताकि':'CS','जब':'CS','त्यसैले':'CS',
  'नि':'RP','पो':'RP','नै':'RP','त':'RPD','चाहिँ':'RPD',
  'लागि':'POP','सम्म':'POP','बिना':'POP','बारे':'POP','तिर':'POP',
  'सँग':'POP','द्वारा':'POP','बाहेक':'POP','अगाडि':'POP','पछाडि':'POP',
  'धेरै':'RB','थोरै':'RB','बिस्तारै':'RB','एकदम':'RB',
  'अहिले':'RBT','हिजो':'RBT','भोलि':'RBT','अब':'RBT',
  'पहिले':'RBT','पछि':'RBT','आज':'RBT','सायद':'RBT',
  'यहाँ':'RBL','त्यहाँ':'RBL',
  'यस्तो':'DT','अरू':'DT','हरेक':'DT','अन्य':'DT',
  'राम्रो':'JJ','ठूलो':'JJ','सानो':'JJ','नयाँ':'JJ','पुरानो':'JJ',
  'सुन्दर':'JJ','विशेष':'JJ','सरकारी':'JJ','सफा':'JJ','चिसो':'JJ',
  'समृद्ध':'JJ','राष्ट्रिय':'JJ','सामाजिक':'JJ','आर्थिक':'JJ',
  'एक':'CD','दुई':'CD','तीन':'CD','चार':'CD','पाँच':'CD',
  'सय':'CD','हजार':'CD','लाख':'CD',
  'पहिलो':'OD','दोस्रो':'OD','तेस्रो':'OD',
  'वर्षा':'NN','शान्ति':'NN','शिक्षा':'NN','जनता':'NN','पानी':'NN',
  'काम':'NN','घर':'NN','देश':'NN','नीति':'NN','बालक':'NN',
  'ओहो':'UH','वाह':'UH','अरे':'UH',
  '।':'SYM',',':'SYM','?':'SYM','!':'SYM','-':'SYM',
  '(':'SYM',')':'SYM','—':'SYM',':':'SYM',';':'SYM',
  'ले':'CME','लाई':'CMD','मा':'CML','बाट':'CMA','देखि':'CMA',
  'का':'CMP','की':'CMP','कै':'CMP','हरू':'PL','हरु':'PL',
};

// ── STAGE 1: Tokenizer ─────────────────────────────────────────────────────
function tokenize(sentence) {
  const raw = sentence.trim().split(/\s+/).filter(Boolean);
  const tokens = [];
  for (const w of raw) {
    const m = w.match(/^([\u0900-\u097F\w]+)([^\u0900-\u097F\w]+)$/);
    if (m) { if (m[1]) tokens.push(m[1]); if (m[2]) tokens.push(m[2]); }
    else tokens.push(w);
  }
  return tokens.filter(Boolean);
}

// ── STAGE 2: Morphological Segmenter ──────────────────────────────────────
const SEG_RULES = [
  { suffix:'हरूले',   morphemes:['हरू','ले'],   tags:['PL','CME'] },
  { suffix:'हरूलाई',  morphemes:['हरू','लाई'],  tags:['PL','CMD'] },
  { suffix:'हरूको',   morphemes:['हरू','को'],   tags:['PL','CMP'] },
  { suffix:'हरूका',   morphemes:['हरू','का'],   tags:['PL','CMP'] },
  { suffix:'हरूकी',   morphemes:['हरू','की'],   tags:['PL','CMP'] },
  { suffix:'हरूमा',   morphemes:['हरू','मा'],   tags:['PL','CML'] },
  { suffix:'हरूबाट',  morphemes:['हरू','बाट'],  tags:['PL','CMA'] },
  { suffix:'हरूदेखि', morphemes:['हरू','देखि'], tags:['PL','CMA'] },
  { suffix:'हरूसँग',  morphemes:['हरू','सँग'],  tags:['PL','POP'] },
  { suffix:'हरू',     morphemes:['हरू'],         tags:['PL'] },
  { suffix:'हरु',     morphemes:['हरु'],         tags:['PL'] },
  { suffix:'मध्ये',   morphemes:['मध्ये'],       tags:['CML'] },
  { suffix:'देखि',    morphemes:['देखि'],        tags:['CMA'] },
  { suffix:'बाट',     morphemes:['बाट'],         tags:['CMA'] },
  { suffix:'लाई',     morphemes:['लाई'],         tags:['CMD'] },
  { suffix:'मा',      morphemes:['मा'],          tags:['CML'] },
  { suffix:'ले',      morphemes:['ले'],          tags:['CME'] },
  { suffix:'कै',      morphemes:['कै'],          tags:['CMP'] },
  { suffix:'को',      morphemes:['को'],          tags:['CMP'] },
  { suffix:'का',      morphemes:['का'],          tags:['CMP'] },
  { suffix:'की',      morphemes:['की'],          tags:['CMP'] },
];
const MIN_STEM = 2;

function segment(token) {
  if (LEXICON[token]) return [{ surface: token, isMorpheme: false, segFrom: null }];
  if (/^[०-९\d]/.test(token)) return [{ surface: token, isMorpheme: false, segFrom: null }];
  if (/^[^\u0900-\u097F\w]/.test(token)) return [{ surface: token, isMorpheme: false, segFrom: null }];
  if (/^[A-Za-z]/.test(token)) return [{ surface: token, isMorpheme: false, segFrom: null }];
  for (const rule of SEG_RULES) {
    if (token.endsWith(rule.suffix)) {
      const stem = token.slice(0, -rule.suffix.length);
      if (stem.length >= MIN_STEM) {
        return [
          { surface: stem, isMorpheme: false, segFrom: token },
          ...rule.morphemes.map((m, i) => ({ surface: m, isMorpheme: true, morphemeTag: rule.tags[i], segFrom: token })),
        ];
      }
    }
  }
  return [{ surface: token, isMorpheme: false, segFrom: null }];
}

// ── STAGE 3: POS Tagger ────────────────────────────────────────────────────
function tagSurface(surface, isMorpheme, morphemeTag) {
  if (isMorpheme && morphemeTag)
    return { tag: morphemeTag, step: 'morpheme', rule: `Segmented morpheme "${surface}" → ${TAG_INFO[morphemeTag]?.label || morphemeTag}` };
  const w = surface.trim();
  if (!w) return { tag: 'SYM', step: 'empty', rule: 'Empty' };
  if (LEXICON[w]) return { tag: LEXICON[w], step: 'lexicon', rule: `Lexicon: "${w}" → ${LEXICON[w]}` };
  if (/^[०-९\d][०-९\d,./%\-]*$/.test(w)) return { tag: 'CD', step: 'digit', rule: 'Digit pattern' }; // eslint-disable-line no-useless-escape
  if (/^[^\u0900-\u097F\w]+$/.test(w)) return { tag: 'SYM', step: 'punct', rule: 'Punctuation/symbol' };
  if (/^[A-Za-z]/.test(w)) return { tag: 'FW', step: 'roman', rule: 'Roman/English → Foreign Word' };
  if (/(इएको|इएकी|इएका|\u0947को|\u0947की|\u0947का|एको|एकी|एका|यको|यकी|यका)$/.test(w)) return { tag:'VBP', step:'verb', rule:'Perfective participle (-एको/-ेको)' };
  if (/(\u0947पछि|एपछि|एर)$/.test(w)) return { tag:'VBN', step:'verb', rule:'Conjunctive participle (-एपछि/-एर)' };
  if (w.length>=4 && /(\u0947नन्|\u0947न$|एनन्|इनन्|एनौ)$/.test(w)) return { tag:'VBP', step:'verb', rule:'Negated past (-एनन्/-ेन)' };
  if (/(ाइन्छ|इन्छ|िन्छ)$/.test(w)) return { tag:'VBF', step:'verb', rule:'Passive present (-इन्छ/-ाइन्छ)' };
  if (/(ँदैनन्|दैनन्|ँदैन|दैन)$/.test(w)) return { tag:'VBF', step:'verb', rule:'Continuous negative (-दैन/-ँदैन)' };
  if (/(दैछन्|दैछौ|दैछु|दैछ|ँदैछ)$/.test(w)) return { tag:'VBF', step:'verb', rule:'Progressive (-दैछ/-ँदैछ)' };
  if (/(दछन्|दछौ|दछु|दछ)$/.test(w)) return { tag:'VBF', step:'verb', rule:'Habitual (-दछ/-दछन्)' };
  if (/नेछ(न्)?$/.test(w)) return { tag:'VBF', step:'verb', rule:'Future (-नेछ/-नेछन्)' };
  if (/(ाइएको|ाइयो|ाइन्|इयो|गरियो|गरिएको|गरिन्छ)$/.test(w)) return { tag:'VBF', step:'verb', rule:'Passive/causative (-ाइयो/-इयो)' };
  if (/\u094Dछ(\u0941|\u094Dन्|\u094Cस्|न्|स्)?$/.test(w)) return { tag:'VBF', step:'verb', rule:'Halant+छ (्छु/्छ/्छन्) — बस्छु, पढ्छ' };
  if (/(न्छ|ञ्छ|र्छ|ल्छ|स्छ|ग्छ|ट्छ|ँछ|म्छ|ब्छ|द्छ|न्दछ)$/.test(w)) return { tag:'VBF', step:'verb', rule:'Consonant cluster+छ (गर्छ, जान्छ)' };
  if (/छ(न्|औ|ौ|उ|स्)$/.test(w)) return { tag:'VBF', step:'verb', rule:'Present person ending (-छन्/-छौ/-छु)' };
  if (/नुभ(यो|एको|ए|इन्|एन)$/.test(w)) return { tag:'VBP', step:'verb', rule:'Honorific past (-नुभयो/-नुभएको)' };
  if (w.length>2 && /(इनन्|यौं|इन्|यो)$/.test(w)) return { tag:'VBP', step:'verb', rule:'Simple past (-यो/-इन्/-यौं)' };
  if (w.length>=3 && /[\u0915-\u0931\u0933-\u0939\u094D]\u0947$/.test(w)) return { tag:'VBP', step:'verb', rule:'Past 3rd plural consonant+े — गरे, लेखे' };
  if (/[\u0906-\u0914\u0915-\u0939\u093e\u093f\u0940]\u090f$/.test(w)) return { tag:'VBP', step:'verb', rule:'Past independent ए form — आए, गाए, खाए' };
  if (w.length>2 && /(ँदा|न्दा|ँदै|न्दै|दै|दा)$/.test(w)) return { tag:'VBG', step:'verb', rule:'Gerund (-दै/-ँदै/-दा) — गर्दै' };
  if (/(नुपर्ने|नुपर्छ|नुहोस्|नुस्|नु)$/.test(w)) return { tag:'VBN', step:'verb', rule:'Infinitive (-नु/-नुस्/-नुहोस्)' };
  if (w.length>=4 && /[ािीुूेैो][नण]$/.test(w)) return { tag:'NN', step:'noun', rule:'Abstract noun: vowel+न/ण' };
  if (w.length>=6 && /[ािीुूेैो].{0,3}[नण]$/.test(w)) return { tag:'NN', step:'noun', rule:'Abstract noun with ण — प्रसारण' };
  if (w.length>3 && /(इत्व|त्व|ता|पन|ाई)$/.test(w)) return { tag:'NN', step:'noun', rule:'Abstract noun (-ता/-त्व/-पन)' };
  if (w.length>=4 && /(ती|ली|री|नी|गी|जी)$/.test(w)) return { tag:'NN', step:'noun', rule:'Verbal noun (-ती/-री/-नी)' };
  if (w.length>4 && /(कर्ता|वाला|दार|कार)$/.test(w)) return { tag:'NNP', step:'noun', rule:'Agentive (-कर्ता/-वाला/-दार)' };
  if (w.length>=3 && /[^न]न$/.test(w)) return { tag:'VBN', step:'verb', rule:'Bare infinitive (-न) — पार्न, गर्न' };
  if (w.length>3 && /[^न]ने$/.test(w)) return { tag:'VBN', step:'verb', rule:'Relative verb (-ने) — गर्ने, जाने' };
  if (/(नुहोस्|होस्|देऊ|दिनुस्)$/.test(w)) return { tag:'VBI', step:'verb', rule:'Imperative (-नुहोस्/-होस्)' };
  if (/(इलो|इली|इला|ालु|युक्त|हीन|वान|शाली|पूर्ण|योग्य)$/.test(w)) return { tag:'JJ', step:'adj', rule:'Adjective suffix (-इलो/-ालु/-युक्त)' };
  if (w.length>3 && /(गरी|तर्फ|पूर्वक|रूपमा)$/.test(w)) return { tag:'RB', step:'adv', rule:'Adverb suffix (-गरी/-तर्फ)' };
  return { tag: w.length>=5?'NNP':'NN', step:'default', rule: w.length>=5?'Default: ≥5 chars → Proper Noun (NNP)':'Default: <5 chars → Common Noun (NN)' };
}

// ── Full pipeline ──────────────────────────────────────────────────────────
function runPipeline(sentence) {
  const orthoTokens = tokenize(sentence);
  const result = [];
  for (const token of orthoTokens) {
    const segs = segment(token);
    const isSegmented = segs.length > 1;
    for (const seg of segs) {
      const { tag, step, rule } = tagSurface(seg.surface, seg.isMorpheme, seg.morphemeTag);
      result.push({ surface: seg.surface, tag, step, rule, isMorpheme: seg.isMorpheme || false, isSegmented, originalToken: token });
    }
  }
  return result;
}

function groupByOriginal(tagged) {
  const groups = []; let i = 0;
  while (i < tagged.length) {
    if (tagged[i].isSegmented) {
      const orig = tagged[i].originalToken; const parts = [];
      while (i < tagged.length && tagged[i].originalToken === orig) { parts.push(tagged[i]); i++; }
      groups.push({ type: 'segmented', original: orig, parts });
    } else { groups.push({ type: 'single', token: tagged[i] }); i++; }
  }
  return groups;
}

// ══════════════════════════════════════════════════════════════════════════════
// ✂️  NEW: EXTRACTIVE SUMMARIZER — powered entirely by YOUR POS tagger
//
//  No external API. Uses runPipeline() from above.
//  How it works:
//   1. Split text into sentences on ।
//   2. Tag every sentence with runPipeline()
//   3. Score each sentence:
//      NNP×3.0  (proper nouns = high info density)
//      NN×2.0   (common nouns)
//      VBP×1.5  (past-tense events = news content)
//      VBF×1.0  (finite verbs)
//      JJ×0.5   (adjectives add some weight)
//      SYM×-0.5 (penalise punctuation-heavy lines)
//      ÷ √(length)  (normalise so long sentences don't dominate)
//      × 1.3 position bonus for first/last sentence
//   4. Keep top-N% by score, in original order
// ══════════════════════════════════════════════════════════════════════════════
const SCORE_W = { NNP:3.0, NN:2.0, VBP:1.5, VBF:1.0, NNI:1.0, VBN:0.8, JJ:0.5, RBT:0.4, SYM:-0.5, CC:-0.2 };

function extractiveSummarize(text, ratio = 0.4) {
  const rawSents = text
    .split(/[।!\?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 8 && /[\u0900-\u097F]/.test(s));

  if (rawSents.length <= 2)
    return { total: rawSents.length, kept: rawSents.length, sentences: rawSents.map((s,i) => ({ text:s, score:1, tagCounts:{}, idx:i, selected:true })) };

  const scored = rawSents.map((sent, idx) => {
    const tagged  = runPipeline(sent);
    const tagCounts = {};
    tagged.forEach(t => { tagCounts[t.tag] = (tagCounts[t.tag] || 0) + 1; });
    let score = 0;
    Object.entries(tagCounts).forEach(([tag, cnt]) => { score += (SCORE_W[tag] || 0) * cnt; });
    score = score / Math.sqrt(Math.max(tagged.length, 1));
    if (idx === 0 || idx === rawSents.length - 1) score *= 1.3; // position bonus
    return { text: sent, score, tagCounts, idx };
  });

  const numToKeep = Math.max(1, Math.round(rawSents.length * ratio));
  const topSet    = new Set([...scored].sort((a,b) => b.score - a.score).slice(0, numToKeep).map(s => s.idx));
  return {
    total: rawSents.length,
    kept:  numToKeep,
    sentences: scored.map(s => ({ ...s, selected: topSet.has(s.idx) })),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 🌐  NEW: MACHINE TRANSLATION — MyMemory free API
//  • No API key required
//  • Free tier: ~5000 chars/day per IP
//  • Supports ne (Nepali) ↔ en (English) ↔ hi (Hindi)
//  • When output is Nepali, we auto-tag it with runPipeline()
// ══════════════════════════════════════════════════════════════════════════════
async function translateText(text, from, to) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);
  const data = await res.json();
  if (data.responseStatus === 200) {
    return {
      translation: data.responseData.translatedText,
      confidence:  Math.round((data.responseData.match || 0) * 100),
    };
  }
  throw new Error(data.responseDetails || 'Translation failed — quota may be exceeded');
}

// ── UI helpers (unchanged from original) ──────────────────────────────────
const STEP_LABELS = {
  morpheme: { icon: '✂️',  label: 'Segmented Morpheme', color: '#f59e0b' },
  lexicon:  { icon: '📖', label: 'Lexicon Lookup',       color: '#f59e0b' },
  digit:    { icon: '🔢', label: 'Digit Check',          color: '#6b7280' },
  punct:    { icon: '✦',  label: 'Punctuation',          color: '#9ca3af' },
  roman:    { icon: '🔤', label: 'Roman/Foreign',         color: '#6366f1' },
  verb:     { icon: '⚡', label: 'Verb Rule',             color: '#10b981' },
  noun:     { icon: '🏷️', label: 'Noun Rule',            color: '#3b82f6' },
  adj:      { icon: '🎨', label: 'Adjective Rule',        color: '#f97316' },
  adv:      { icon: '💨', label: 'Adverb Rule',           color: '#84cc16' },
  default:  { icon: '🔍', label: 'Default Fallback',      color: '#9ca3af' },
  empty:    { icon: '∅',  label: 'Empty',                 color: '#d1d5db' },
};

const EXAMPLES = [
  "सरकारले नयाँ नीति ल्यायो",
  "विद्यार्थीहरूले परीक्षा दिए",
  "म काठमाडौंमा बस्छु",
  "नेपालको राजधानी काठमाडौं हो",
  "उनीहरू बजारबाट आए",
  "शिक्षकले विद्यार्थीलाई पढाउनुभयो",
  "बालकहरूलाई पानी दिनुस्",
];

const SUM_EXAMPLES = [
  "नेपाल सरकारले नयाँ शिक्षा नीति लागू गर्‍यो। यो नीतिले विद्यार्थीहरूलाई राम्रो शिक्षा दिन मद्दत गर्छ। शिक्षकहरूले पनि नयाँ तालिम पाउनेछन्। काठमाडौंका विद्यालयहरूमा यो कार्यक्रम पहिले सुरु हुनेछ। सरकारले यसका लागि बजेट छुट्याएको छ। विद्यार्थीहरूको संख्या बढ्दै गइरहेको छ।",
  "नेपालमा पर्यटन उद्योग फस्टाउँदो छ। हरेक वर्ष लाखौं पर्यटक नेपाल आउँछन्। हिमालय लुम्बिनी र पशुपतिनाथ प्रमुख आकर्षण हुन्। सरकारले पर्यटन पूर्वाधार सुधार गर्न लगानी बढाएको छ। यसले रोजगारी सिर्जनामा पनि मद्दत पुगेको छ। नेपालको अर्थतन्त्रमा पर्यटनको ठूलो योगदान रहेको छ।",
];

const TRANS_EXAMPLES = [
  { text: "नेपाल एक सुन्दर देश हो।", from: "ne", to: "en" },
  { text: "सरकारले नयाँ नीति घोषणा गर्‍यो।", from: "ne", to: "en" },
  { text: "The government announced a new policy today.", from: "en", to: "ne" },
];

function TagChip({ tag, size = 'sm' }) {
  const info = TAG_INFO[tag] || { label: tag, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding: size==='lg'?'4px 10px':'2px 7px', borderRadius:6, background:info.bg, color:info.color, border:`1.5px solid ${info.color}40`, fontSize:size==='lg'?13:11, fontWeight:700, fontFamily:'monospace', whiteSpace:'nowrap' }}>{tag}</span>
  );
}

function PipelineStrip({ result }) {
  const steps = ['lexicon','digit','punct','roman','verb','noun','adj','adv','default'];
  const active = result.step === 'morpheme' ? 'morpheme' : result.step;
  const matchIdx = steps.indexOf(active);
  if (active === 'morpheme') {
    return <div style={{ padding:'6px 14px', borderRadius:20, background:'#f59e0b', color:'#fff', fontSize:11, fontWeight:700, display:'inline-block' }}>✂️ Tag assigned during morphological segmentation — no rule chain needed</div>;
  }
  return (
    <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:4, margin:'8px 0' }}>
      {steps.map((s, i) => {
        const isMatch = s===active, isPassed = i<matchIdx, info = STEP_LABELS[s];
        return (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:isMatch?700:400, background:isMatch?info.color:isPassed?'#f3f4f6':'#fafafa', color:isMatch?'#fff':isPassed?'#9ca3af':'#d1d5db', border:`1.5px solid ${isMatch?info.color:isPassed?'#e5e7eb':'#f3f4f6'}`, textDecoration:isPassed?'line-through':'none' }}>
              {info.icon} {info.label}
            </div>
            {i < steps.length-1 && <span style={{ color:'#d1d5db', fontSize:10 }}>→</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── shared style helpers ───────────────────────────────────────────────────
const card = { background:'rgba(255,255,255,0.04)', borderRadius:16, padding:24, border:'1px solid rgba(255,255,255,0.08)', marginBottom:20 };
const inputStyle = { background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'12px 16px', color:'#f1f5f9', outline:'none', fontFamily:'inherit', width:'100%', boxSizing:'border-box', resize:'vertical' };
const btnPrimary = { padding:'12px 28px', background:'linear-gradient(135deg, #6366f1, #8b5cf6)', border:'none', borderRadius:10, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' };
const exBtn = { padding:'4px 12px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:20, color:'#a5b4fc', fontSize:12, cursor:'pointer', fontFamily:'inherit' };

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── tagger state (original) ────────────────────────────────────────────
  const [input, setInput]         = useState("सरकारले नयाँ नीति ल्यायो");
  const [tagged, setTagged]       = useState([]);
  const [groups, setGroups]       = useState([]);
  const [selected, setSelected]   = useState(null);
  const [activeTab, setActiveTab] = useState('tagger');
  const [loading, setLoading]     = useState(false);

  // ── summarizer state ───────────────────────────────────────────────────
  const [sumText,    setSumText]    = useState('');
  const [sumRatio,   setSumRatio]   = useState(40);
  const [sumResult,  setSumResult]  = useState(null);
  const [sumRunning, setSumRunning] = useState(false);

  // ── translator state ───────────────────────────────────────────────────
  const [transText,   setTransText]   = useState('');
  const [transFrom,   setTransFrom]   = useState('ne');
  const [transTo,     setTransTo]     = useState('en');
  const [transResult, setTransResult] = useState(null);
  const [transLoading,setTransLoading]= useState(false);
  const [transError,  setTransError]  = useState('');

  const runTag = (text) => {
    const result = runPipeline(text);
    setTagged(result); setGroups(groupByOriginal(result)); setSelected(null);
  };

  useEffect(() => { runTag(input); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tagCounts     = tagged.reduce((acc, t) => { acc[t.tag]=(acc[t.tag]||0)+1; return acc; }, {});
  const selectedToken = selected !== null ? tagged[selected] : null;

  // OCR (original)
  async function handleImageUpload(e) {
    const file = e.target.files[0]; if (!file) return;
    setLoading(true);
    const { data:{ text } } = await Tesseract.recognize(file, "nep");
    const nepaliText = text.split(/\s+/).filter(w => /[\u0900-\u097F]/.test(w)).join(" ");
    setInput(nepaliText); runTag(nepaliText); setLoading(false);
  }

  // Summarizer handler
  function handleSummarize() {
    if (!sumText.trim()) return;
    setSumRunning(true);
    setTimeout(() => { setSumResult(extractiveSummarize(sumText, sumRatio / 100)); setSumRunning(false); }, 80);
  }

  // Translator handler
  async function handleTranslate() {
    if (!transText.trim()) return;
    setTransLoading(true); setTransError(''); setTransResult(null);
    try { setTransResult(await translateText(transText, transFrom, transTo)); }
    catch (err) { setTransError(err.message); }
    setTransLoading(false);
  }

  function swapLangs() {
    const tmp = transFrom; setTransFrom(transTo); setTransTo(tmp);
    setTransResult(null); setTransError('');
  }

  const TABS = [
    { id:'tagger',     icon:'🏷️', label:'Tagger' },
    { id:'summarizer', icon:'📝', label:'Summarizer' },
    { id:'translator', icon:'🌐', label:'Translator' },
    { id:'pipeline',   icon:'🔬', label:'Pipeline' },
    { id:'about',      icon:'ℹ️', label:'About' },
    { id:'tags',       icon:'📋', label:'Tags' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', fontFamily:"'Segoe UI', system-ui, sans-serif", color:'#e2e8f0' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'14px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg, #6366f1, #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏷️</div>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#f1f5f9' }}>Nepali POS Tagger</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>Tokenize → Segment → Tag · NCG 43-tag · 227M tokens</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background: activeTab===t.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)', color: activeTab===t.id ? '#fff' : '#94a3b8', transition:'all 0.2s' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'24px 28px', maxWidth:1200, margin:'0 auto' }}>

        {/* ═══════════════════ TAGGER (original — untouched) ═══════════════════ */}
        {activeTab === 'tagger' && (
          <div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:'#64748b', marginRight:8 }}>📷 Upload image:</label>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} style={{ color:'#94a3b8', fontSize:12 }} />
              {loading && <span style={{ color:'#f59e0b', marginLeft:8, fontSize:12 }}>Processing…</span>}
            </div>

            <div style={card}>
              <div style={{ fontSize:13, color:'#94a3b8', marginBottom:8, fontWeight:600 }}>ENTER NEPALI TEXT — agglutinated words like सरकारले are auto-split into सरकार + ले</div>
              <div style={{ display:'flex', gap:12 }}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runTag(input)} style={{ ...inputStyle, fontSize:18, resize:'none', height:48 }} placeholder="नेपाली वाक्य लेख्नुहोस्..." />
                <button onClick={()=>runTag(input)} style={btnPrimary}>Tag →</button>
              </div>
              <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:8 }}>
                <span style={{ fontSize:12, color:'#64748b', alignSelf:'center' }}>Examples:</span>
                {EXAMPLES.map((ex,i) => <button key={i} onClick={()=>{ setInput(ex); runTag(ex); }} style={exBtn}>{ex}</button>)}
              </div>
            </div>

            {groups.length > 0 && (<>
              <div style={card}>
                <div style={{ fontSize:13, color:'#94a3b8', marginBottom:16, fontWeight:600 }}>
                  TAGGED OUTPUT — click any token for breakdown
                  <span style={{ marginLeft:12, fontSize:11, color:'#f59e0b' }}>✂️ dashed box = word segmented into stem + morpheme(s)</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:16, alignItems:'flex-start' }}>
                  {groups.map((grp, gi) => {
                    if (grp.type === 'single') {
                      const t=grp.token, idx=tagged.indexOf(t), info=TAG_INFO[t.tag]||{color:'#6b7280',bg:'#f3f4f6',label:t.tag}, isSel=selected===idx;
                      return (
                        <div key={gi} onClick={()=>setSelected(isSel?null:idx)} style={{ cursor:'pointer', padding:'10px 14px', borderRadius:12, background:isSel?`${info.color}20`:'rgba(255,255,255,0.04)', border:`2px solid ${isSel?info.color:'rgba(255,255,255,0.08)'}`, textAlign:'center', transition:'all 0.2s', transform:isSel?'scale(1.05)':'scale(1)', animation:'fadeIn 0.3s ease' }}>
                          <div style={{ fontSize:20, color:'#f1f5f9', marginBottom:4, fontWeight:600 }}>{t.surface}</div>
                          <TagChip tag={t.tag} /><div style={{ fontSize:10, color:'#64748b', marginTop:4 }}>{info.label}</div>
                        </div>
                      );
                    }
                    return (
                      <div key={gi} style={{ animation:'fadeIn 0.3s ease' }}>
                        <div style={{ fontSize:10, color:'#f59e0b', marginBottom:4, textAlign:'center', fontWeight:600 }}>✂️ {grp.original}</div>
                        <div style={{ display:'flex', gap:6, alignItems:'flex-start', padding:'8px 10px', borderRadius:12, background:'rgba(245,158,11,0.06)', border:'1.5px dashed rgba(245,158,11,0.35)' }}>
                          {grp.parts.map((t, pi) => {
                            const idx=tagged.indexOf(t), info=TAG_INFO[t.tag]||{color:'#6b7280',bg:'#f3f4f6',label:t.tag}, isSel=selected===idx;
                            return (
                              <div key={pi} onClick={()=>setSelected(isSel?null:idx)} style={{ cursor:'pointer', padding:'8px 10px', borderRadius:10, minWidth:52, background:isSel?`${info.color}20`:'rgba(255,255,255,0.04)', border:`2px solid ${isSel?info.color:'rgba(255,255,255,0.08)'}`, textAlign:'center', transition:'all 0.2s', transform:isSel?'scale(1.05)':'scale(1)' }}>
                                <div style={{ fontSize:17, color:'#f1f5f9', marginBottom:3, fontWeight:700 }}>{t.surface}</div>
                                <TagChip tag={t.tag} />{t.isMorpheme&&<div style={{ fontSize:9, color:'#f59e0b', marginTop:3 }}>morpheme</div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>TAG DISTRIBUTION</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).map(([tag,count]) => (
                      <div key={tag} style={{ display:'flex', alignItems:'center', gap:4 }}><TagChip tag={tag}/><span style={{ fontSize:11, color:'#64748b' }}>×{count}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedToken && (
                <div style={{ background:'rgba(99,102,241,0.06)', borderRadius:16, padding:24, border:'1.5px solid rgba(99,102,241,0.25)', marginBottom:20 }}>
                  <div style={{ fontSize:13, color:'#a5b4fc', fontWeight:700, marginBottom:16 }}>
                    ⚡ STEP-BY-STEP — "{selectedToken.surface}"
                    {selectedToken.isSegmented && <span style={{ marginLeft:10, fontSize:11, color:'#f59e0b' }}>✂️ segmented from "{selectedToken.originalToken}"</span>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                    <div style={{ fontSize:36, fontWeight:800, color:'#f1f5f9', background:'rgba(255,255,255,0.06)', padding:'8px 20px', borderRadius:12 }}>{selectedToken.surface}</div>
                    <div style={{ fontSize:24, color:'#64748b' }}>→</div>
                    <div><TagChip tag={selectedToken.tag} size="lg"/><div style={{ fontSize:13, color:'#94a3b8', marginTop:4 }}>{TAG_INFO[selectedToken.tag]?.desc}</div></div>
                  </div>
                  {selectedToken.isSegmented && (
                    <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                      <div style={{ fontSize:12, color:'#f59e0b', fontWeight:700, marginBottom:6 }}>✂️ STAGE 2 — MORPHOLOGICAL SEGMENTATION</div>
                      <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:4 }}>
                        <strong style={{ color:'#fbbf24' }}>{selectedToken.originalToken}</strong>{' → '}
                        {groups.find(g=>g.type==='segmented'&&g.original===selectedToken.originalToken)?.parts.map((p,i)=>(
                          <span key={i}><strong style={{ color:TAG_INFO[p.tag]?.color||'#e2e8f0' }}>{p.surface}</strong><span style={{ fontSize:10, color:'#94a3b8', marginLeft:2, marginRight:8 }}>({TAG_INFO[p.tag]?.label})</span></span>
                        ))}
                      </div>
                      <div style={{ fontSize:12, color:'#94a3b8' }}>Suffix rule matched → stem and morpheme(s) tagged independently.</div>
                    </div>
                  )}
                  <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:12, padding:16, marginBottom:16 }}>
                    <div style={{ fontSize:12, color:'#64748b', marginBottom:8, fontWeight:600 }}>STAGE 3 — POS TAGGING RULE PIPELINE (stops at first match ✓)</div>
                    <PipelineStrip result={selectedToken}/>
                  </div>
                  <div style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:8, flexShrink:0, background:STEP_LABELS[selectedToken.step]?.color||'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{STEP_LABELS[selectedToken.step]?.icon}</div>
                    <div>
                      <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600 }}>MATCHED: {STEP_LABELS[selectedToken.step]?.label?.toUpperCase()}</div>
                      <div style={{ fontSize:14, color:'#e2e8f0', marginTop:2 }}>{selectedToken.rule}</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={card}>
                <div style={{ fontSize:13, color:'#94a3b8', fontWeight:600, marginBottom:16 }}>FULL TOKEN TABLE</div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                      {['#','Surface','From','Tag','Category','Rule','Type'].map(h=><th key={h} style={{ textAlign:'left', padding:'8px 12px', color:'#64748b', fontWeight:600, fontSize:11 }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {tagged.map((t,i)=>{
                        const info=TAG_INFO[t.tag]||{label:t.tag}, isSel=selected===i;
                        return (
                          <tr key={i} onClick={()=>setSelected(i===selected?null:i)} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer', background:isSel?'rgba(99,102,241,0.08)':'transparent' }}>
                            <td style={{ padding:'10px 12px', color:'#475569' }}>{i+1}</td>
                            <td style={{ padding:'10px 12px', fontWeight:700, fontSize:16, color:'#f1f5f9' }}>{t.surface}</td>
                            <td style={{ padding:'10px 12px', fontSize:12, color:'#f59e0b', fontFamily:'monospace' }}>{t.isSegmented?t.originalToken:'—'}</td>
                            <td style={{ padding:'10px 12px' }}><TagChip tag={t.tag}/></td>
                            <td style={{ padding:'10px 12px', color:'#94a3b8' }}>{info.label}</td>
                            <td style={{ padding:'10px 12px', color:'#64748b', fontSize:11, maxWidth:260 }}>{t.rule}</td>
                            <td style={{ padding:'10px 12px' }}><span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, background:t.isMorpheme?'rgba(245,158,11,0.15)':'rgba(99,102,241,0.12)', color:t.isMorpheme?'#f59e0b':'#a5b4fc' }}>{t.isMorpheme?'✂️ morpheme':'◉ token'}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>)}
          </div>
        )}

        {/* ═══════════════════ SUMMARIZER (NEW) ═══════════════════ */}
        {activeTab === 'summarizer' && (
          <div>
            {/* How it works */}
            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#10b981', marginBottom:4 }}>
                ✂️  Extractive Summarizer — powered by YOUR POS tagger, no external API
              </div>
              <div style={{ fontSize:12, color:'#64748b' }}>
                Each sentence is scored using tag weights:&nbsp;
                <span style={{ color:'#1d4ed8', fontWeight:700 }}>NNP×3</span>&nbsp;
                <span style={{ color:'#3b82f6', fontWeight:700 }}>NN×2</span>&nbsp;
                <span style={{ color:'#06b6d4', fontWeight:700 }}>VBP×1.5</span>&nbsp;
                <span style={{ color:'#10b981', fontWeight:700 }}>VBF×1</span>&nbsp;—
                sentences with more proper nouns and events score higher.
                Top-N% sentences are selected and returned in original order.
              </div>
            </div>

            <div style={card}>
              <div style={{ fontSize:13, color:'#94a3b8', marginBottom:8, fontWeight:600 }}>PASTE NEPALI TEXT (multiple sentences separated by ।)</div>
              <textarea
                value={sumText} onChange={e=>setSumText(e.target.value)}
                style={{ ...inputStyle, fontSize:16, height:160, marginBottom:16 }}
                placeholder={"यहाँ नेपाली अनुच्छेद टाँस्नुहोस्…\n\nExample: नेपाल सरकारले नयाँ नीति ल्यायो। विद्यार्थीहरूले परीक्षा दिए। शिक्षकले पढाउनुभयो।"}
              />

              {/* Ratio slider */}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <span style={{ fontSize:13, color:'#94a3b8', whiteSpace:'nowrap' }}>Keep top</span>
                <input type="range" min={20} max={80} step={10} value={sumRatio} onChange={e=>setSumRatio(Number(e.target.value))} style={{ flex:1, accentColor:'#6366f1' }} />
                <span style={{ fontSize:15, fontWeight:800, color:'#6366f1', minWidth:42 }}>{sumRatio}%</span>
                <span style={{ fontSize:12, color:'#64748b' }}>of sentences</span>
              </div>

              <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                <button onClick={handleSummarize} style={{ ...btnPrimary, opacity: sumRunning?0.7:1 }} disabled={sumRunning}>
                  {sumRunning ? '⏳ Summarizing…' : '📝 Summarize'}
                </button>
                <span style={{ fontSize:12, color:'#64748b' }}>Try:</span>
                {SUM_EXAMPLES.map((ex,i) => (
                  <button key={i} onClick={()=>setSumText(ex)} style={exBtn}>Example {i+1}</button>
                ))}
              </div>
            </div>

            {sumResult && (
              <div style={card}>
                {/* Stats */}
                <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
                  {[
                    { v: sumResult.total,                          l:'Total sentences',  c:'#94a3b8' },
                    { v: sumResult.kept,                           l:'Kept',             c:'#10b981' },
                    { v: sumResult.total - sumResult.kept,         l:'Removed',          c:'#ef4444' },
                    { v: `${100-Math.round(sumResult.kept/sumResult.total*100)}%`, l:'Compressed', c:'#6366f1' },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 18px', textAlign:'center', minWidth:100 }}>
                      <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.v}</div>
                      <div style={{ fontSize:11, color:'#64748b' }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Selected sentences */}
                <div style={{ fontSize:13, color:'#94a3b8', fontWeight:600, marginBottom:12 }}>
                  SUMMARY <span style={{ color:'#10b981' }}>● selected</span>
                </div>
                {sumResult.sentences.filter(s=>s.selected).map((s,i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ background:'rgba(16,185,129,0.15)', border:'1.5px solid #10b981', borderRadius:8, padding:'3px 10px', fontSize:11, color:'#10b981', fontWeight:700, whiteSpace:'nowrap', marginTop:4 }}>
                      #{i+1}  {s.score.toFixed(1)}pts
                    </div>
                    <div style={{ fontSize:15, color:'#f1f5f9', lineHeight:1.75, padding:'8px 14px', background:'rgba(16,185,129,0.06)', borderRadius:10, border:'1px solid rgba(16,185,129,0.2)', flex:1 }}>
                      {s.text}
                    </div>
                  </div>
                ))}

                {/* Score table (collapsible) */}
                <details style={{ marginTop:8 }}>
                  <summary style={{ fontSize:12, color:'#64748b', cursor:'pointer', userSelect:'none' }}>▶ Show all sentences with POS scores</summary>
                  <div style={{ overflowX:'auto', marginTop:12 }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                        {['#','Score','NNP','NN','VBP','VBF','✓','Sentence'].map(h=>(
                          <th key={h} style={{ textAlign:'left', padding:'6px 10px', color:'#64748b', fontWeight:600, fontSize:11 }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {sumResult.sentences.map((s,i)=>(
                          <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:s.selected?'rgba(16,185,129,0.06)':'transparent' }}>
                            <td style={{ padding:'8px 10px', color:'#64748b' }}>{i+1}</td>
                            <td style={{ padding:'8px 10px', fontWeight:700, color:s.selected?'#10b981':'#475569' }}>{s.score.toFixed(2)}</td>
                            <td style={{ padding:'8px 10px', color:'#1d4ed8' }}>{s.tagCounts?.NNP||0}</td>
                            <td style={{ padding:'8px 10px', color:'#3b82f6' }}>{s.tagCounts?.NN||0}</td>
                            <td style={{ padding:'8px 10px', color:'#06b6d4' }}>{s.tagCounts?.VBP||0}</td>
                            <td style={{ padding:'8px 10px', color:'#10b981' }}>{s.tagCounts?.VBF||0}</td>
                            <td style={{ padding:'8px 10px' }}>{s.selected?'✅':'—'}</td>
                            <td style={{ padding:'8px 10px', color:s.selected?'#f1f5f9':'#475569', maxWidth:380, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.text}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ TRANSLATOR (NEW) ═══════════════════ */}
        {activeTab === 'translator' && (
          <div>
            {/* Info */}
            <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#a5b4fc', marginBottom:4 }}>
                🌐  Machine Translation — MyMemory free API (no API key needed)
              </div>
              <div style={{ fontSize:12, color:'#64748b' }}>
                Uses <strong style={{ color:'#a5b4fc' }}>MyMemory</strong> (mymemory.translated.net) — free, no account needed, ~5000 chars/day.
                When the output is Nepali, your POS tagger automatically tags it too so you can see the grammar.
              </div>
            </div>

            <div style={card}>
              {/* Language bar */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <select value={transFrom} onChange={e=>{setTransFrom(e.target.value);setTransResult(null);}} style={{ padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#f1f5f9', fontSize:13, cursor:'pointer' }}>
                  <option value="ne">🇳🇵 Nepali</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="hi">🇮🇳 Hindi</option>
                </select>
                <button onClick={swapLangs} title="Swap languages" style={{ padding:'8px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#a5b4fc', fontSize:18, cursor:'pointer' }}>⇄</button>
                <select value={transTo} onChange={e=>{setTransTo(e.target.value);setTransResult(null);}} style={{ padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#f1f5f9', fontSize:13, cursor:'pointer' }}>
                  <option value="en">🇬🇧 English</option>
                  <option value="ne">🇳🇵 Nepali</option>
                  <option value="hi">🇮🇳 Hindi</option>
                </select>
              </div>

              <div style={{ fontSize:13, color:'#94a3b8', marginBottom:8, fontWeight:600 }}>ENTER TEXT</div>
              <textarea
                value={transText} onChange={e=>setTransText(e.target.value)}
                style={{ ...inputStyle, fontSize:16, height:110, marginBottom:16 }}
                placeholder={transFrom==='ne'?'यहाँ नेपाली लेख्नुहोस्…':'Type text to translate…'}
              />

              <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                <button onClick={handleTranslate} style={{ ...btnPrimary, opacity:transLoading?0.7:1 }} disabled={transLoading}>
                  {transLoading ? '⏳ Translating…' : '🌐 Translate'}
                </button>
                <span style={{ fontSize:12, color:'#64748b' }}>Quick examples:</span>
                {TRANS_EXAMPLES.map((ex,i) => (
                  <button key={i} onClick={()=>{ setTransText(ex.text); setTransFrom(ex.from); setTransTo(ex.to); setTransResult(null); }} style={exBtn}>
                    {ex.from==='ne'?'🇳🇵→🇬🇧':'🇬🇧→🇳🇵'} {i+1}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {transError && (
              <div style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.3)', borderRadius:12, padding:'14px 18px', marginBottom:16, color:'#fca5a5' }}>
                ❌ {transError}
                <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>If you see a quota error, the free limit (5000 chars/day per IP) may be reached. Try again tomorrow.</div>
              </div>
            )}

            {/* Result */}
            {transResult && (
              <div style={card}>
                <div style={{ fontSize:13, color:'#94a3b8', fontWeight:600, marginBottom:14 }}>
                  TRANSLATION — {transFrom.toUpperCase()} → {transTo.toUpperCase()}
                </div>

                {/* Translation box */}
                <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:12, padding:'18px 20px', marginBottom:16 }}>
                  <div style={{ fontSize:19, color:'#f1f5f9', lineHeight:1.75, fontWeight:500 }}>
                    {transResult.translation}
                  </div>
                </div>

                {/* Confidence bar */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <span style={{ fontSize:12, color:'#64748b', whiteSpace:'nowrap' }}>Confidence:</span>
                  <div style={{ flex:1, background:'rgba(255,255,255,0.08)', borderRadius:20, height:8, overflow:'hidden' }}>
                    <div style={{ width:`${transResult.confidence}%`, height:'100%', background: transResult.confidence>70?'#10b981':transResult.confidence>40?'#f59e0b':'#ef4444', borderRadius:20, transition:'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, minWidth:36, color: transResult.confidence>70?'#10b981':transResult.confidence>40?'#f59e0b':'#ef4444' }}>
                    {transResult.confidence}%
                  </span>
                </div>

                {/* Auto-tag Nepali output */}
                {transTo === 'ne' && transResult.translation && (
                  <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'14px 16px' }}>
                    <div style={{ fontSize:12, color:'#10b981', fontWeight:700, marginBottom:10 }}>
                      🏷️  Auto-tagged with your POS tagger:
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                      {runPipeline(transResult.translation).map((t,i) => (
                        <div key={i} style={{ textAlign:'center' }}>
                          <div style={{ fontSize:14, color:'#f1f5f9', marginBottom:3 }}>{t.surface}</div>
                          <TagChip tag={t.tag}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize:11, color:'#475569', marginTop:12 }}>
                  ⚠️ Translation by MyMemory (community-sourced). Quality may vary. For research, verify with a native speaker.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ PIPELINE (original — untouched) ═══════════════════ */}
        {activeTab === 'pipeline' && (
          <div>
            <div style={{ fontSize:15, color:'#94a3b8', marginBottom:24 }}>Every sentence passes through these 3 stages before any tag is assigned:</div>
            {[
              { n:'1', icon:'📝', title:'Tokenization', color:'#6366f1', desc:'Raw sentence split into orthographic tokens by whitespace. Trailing Devanagari punctuation (।) attached to words is split off.', example:'"सरकारले नयाँ नीति।"  →  ["सरकारले", "नयाँ", "नीति", "।"]', detail:'Only whitespace splitting + punctuation boundary detection. No tag assignment at this stage.' },
              { n:'2', icon:'✂️', title:'Morphological Segmentation', color:'#f59e0b', desc:'Each token checked against 21 suffix rules (longest first). If suffix found and stem ≥2 chars, split into stem + morpheme(s). Morphemes pre-tagged by suffix type.', example:'"सरकारले"  →  सरकार (stem) + ले (CME)\n"विद्यार्थीहरूले"  →  विद्यार्थी (stem) + हरू (PL) + ले (CME)', detail:'Handles: all 5 case markers (-ले,-लाई,-मा,-को,-बाट), plural (-हरू), 9 combination rules.' },
              { n:'3', icon:'🏷️', title:'POS Tagging', color:'#10b981', desc:'Each surface form tagged via priority-ordered rule chain. Morphemes from Stage 2 already tagged — only stems go through the full chain.', example:'"सरकार" → NNP (default ≥5 chars)\n"ले" → CME (lexicon)\n"ल्यायो" → VBP (past suffix -यो)', detail:'Chain: Lexicon → Digit → Punct → Roman → 17 Verb Rules → Noun Rules → Adj → Adv → Default. Stops at first match.' },
            ].map((stage, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:24, border:`1.5px solid ${stage.color}30`, marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background:`${stage.color}20`, border:`2px solid ${stage.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{stage.icon}</div>
                  <div><div style={{ fontSize:11, color:stage.color, fontWeight:700 }}>STAGE {stage.n}</div><div style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>{stage.title}</div></div>
                </div>
                <div style={{ fontSize:14, color:'#94a3b8', lineHeight:1.7, marginBottom:12 }}>{stage.desc}</div>
                <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:10, padding:'10px 16px', fontFamily:'monospace', fontSize:13, color:stage.color, marginBottom:8, whiteSpace:'pre-line' }}>{stage.example}</div>
                <div style={{ fontSize:12, color:'#64748b', fontStyle:'italic' }}>{stage.detail}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════ ABOUT (original — untouched) ═══════════════════ */}
        {activeTab === 'about' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {[
              { icon:'🔬', title:'What is POS Tagging?', body:'Part-of-Speech tagging assigns grammatical labels to words. For Nepali this requires segmentation first — "सरकारले" is two morphemes: सरकार (noun) + ले (ergative case marker). Both need separate tags.' },
              { icon:'✂️', title:'Why Segmentation Matters', body:'Nepali is agglutinative — case markers and plural markers attach directly to nouns. Without segmentation, "विद्यार्थीहरूले" gets one tag CME. With it: विद्यार्थी (NNP) + हरू (PL) + ले (CME).' },
              { icon:'📝', title:'Extractive Summarizer', body:'Scores each sentence by POS tag weights: NNP×3 + NN×2 + VBP×1.5. Sentences with more proper nouns and events score higher. Runs in your browser — no external API, powered entirely by your POS tagger.' },
              { icon:'🌐', title:'Machine Translator', body:'Uses MyMemory free API (no key needed). Supports Nepali↔English↔Hindi. When the output is Nepali, your POS tagger automatically tags it so you can see the grammar of the translation.' },
              { icon:'⚡', title:'Performance', body:'Local PC 12 cores: 1,442,793 TPS. Colab T4 GPU: 533,238 TPS. Colab CPU: 489,592 TPS. 12-core CPU outperforms GPU — rule-based tagging is I/O-bound, not compute-bound.' },
              { icon:'🎯', title:'Accuracy', body:'100% on 57-token manual evaluation. NN+NNP share: 43–47% across all 6 domains. All unicode edge cases fixed including vowel-sign forms and ergative disambiguation.' },
            ].map((c,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:24, border:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{c.icon}</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#f1f5f9', marginBottom:10 }}>{c.title}</div>
                <div style={{ fontSize:14, color:'#94a3b8', lineHeight:1.7 }}>{c.body}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════ TAGS (original — untouched) ═══════════════════ */}
        {activeTab === 'tags' && (
          <div>
            <div style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Complete NCG 43-tag coarse tagset + morpheme tags assigned during segmentation</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
              {Object.entries(TAG_INFO).map(([tag,info]) => (
                <div key={tag} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'14px 16px', border:`1.5px solid ${info.color}20`, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ minWidth:48, height:32, background:info.bg, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:info.color, fontWeight:800, fontSize:13, fontFamily:'monospace' }}>{tag}</div>
                  <div><div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9' }}>{info.label}</div><div style={{ fontSize:11, color:'#64748b' }}>{info.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        select option { background:#1e1b4b; color:#f1f5f9; }
        button:disabled { opacity:0.6; cursor:not-allowed !important; }
        textarea::placeholder { color:#475569; }
      `}</style>
    </div>
  );
}
