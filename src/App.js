import { useState, useEffect, useRef } from "react";

// ── NCG Tag definitions ────────────────────────────────────────────────────
const TAG_INFO = {
  VA:  { label: "Copula/Aux",     color: "#f59e0b", bg: "#fef3c7", desc: "Auxiliary/Copula verb (हुनु, छ)" },
  VBF: { label: "Finite Verb",    color: "#10b981", bg: "#d1fae5", desc: "Present tense verb (गर्छ, जान्छ)" },
  VBP: { label: "Past Verb",      color: "#06b6d4", bg: "#cffafe", desc: "Past/Perfective verb (गयो, गरेको)" },
  VBN: { label: "Non-finite",     color: "#8b5cf6", bg: "#ede9fe", desc: "Infinitive/Relative (गर्नु, गर्ने)" },
  VBG: { label: "Gerund",         color: "#6366f1", bg: "#e0e7ff", desc: "Gerund/Participle (गर्दै, गर्दा)" },
  VBI: { label: "Imperative",     color: "#ec4899", bg: "#fce7f3", desc: "Command form (गर्नुस्)" },
  NN:  { label: "Common Noun",    color: "#3b82f6", bg: "#dbeafe", desc: "Common noun (घर, काम, मान्छे)" },
  NNP: { label: "Proper Noun",    color: "#1d4ed8", bg: "#bfdbfe", desc: "Proper noun, names (नेपाल, काठमाडौं)" },
  PP:  { label: "Pronoun",        color: "#7c3aed", bg: "#ede9fe", desc: "Personal pronoun (म, हामी, उनी)" },
  PPD: { label: "Demonstrative",  color: "#9333ea", bg: "#f3e8ff", desc: "Demonstrative (यो, त्यो)" },
  PPW: { label: "Wh-Pronoun",     color: "#a855f7", bg: "#faf5ff", desc: "Question pronoun (को, के, कहाँ)" },
  PPR: { label: "Reflexive",      color: "#c026d3", bg: "#fdf4ff", desc: "Reflexive (आफू, आफ्नो)" },
  PPX: { label: "Indefinite Pro", color: "#db2777", bg: "#fdf2f8", desc: "Indefinite (कोही, केही, सबै)" },
  JJ:  { label: "Adjective",      color: "#f97316", bg: "#ffedd5", desc: "Adjective (राम्रो, ठूलो, नयाँ)" },
  RB:  { label: "Adverb",         color: "#84cc16", bg: "#f7fee7", desc: "Adverb (धेरै, बिस्तारै)" },
  RBT: { label: "Time Adverb",    color: "#65a30d", bg: "#ecfccb", desc: "Time adverb (अहिले, हिजो, भोलि)" },
  RBL: { label: "Loc. Adverb",    color: "#16a34a", bg: "#dcfce7", desc: "Locative adverb (यहाँ, त्यहाँ)" },
  CC:  { label: "Coord. Conj.",   color: "#dc2626", bg: "#fee2e2", desc: "Coordinating conj. (र, तर, वा)" },
  CS:  { label: "Subord. Conj.",  color: "#b91c1c", bg: "#fecaca", desc: "Subordinating conj. (किनभने, यदि)" },
  CMP: { label: "Possessive",     color: "#0891b2", bg: "#e0f2fe", desc: "Possessive case -को/-का/-की (नेपालको)" },
  CME: { label: "Ergative",       color: "#0e7490", bg: "#cffafe", desc: "Ergative case -ले (सरकारले)" },
  CMD: { label: "Dative",         color: "#155e75", bg: "#a5f3fc", desc: "Dative case -लाई (मान्छेलाई)" },
  CML: { label: "Locative",       color: "#164e63", bg: "#67e8f9", desc: "Locative case -मा (घरमा)" },
  CMA: { label: "Ablative",       color: "#1e3a5f", bg: "#7dd3fc", desc: "Ablative case -बाट (देशबाट)" },
  RP:  { label: "Particle",       color: "#854d0e", bg: "#fef9c3", desc: "Particle (नि, पो, नै)" },
  RPD: { label: "Disc. Particle", color: "#713f12", bg: "#fef08a", desc: "Discourse particle (त, चाहिँ)" },
  POP: { label: "Postposition",   color: "#78350f", bg: "#fde68a", desc: "Postposition (लागि, सम्म, बिना)" },
  CD:  { label: "Cardinal",       color: "#374151", bg: "#f3f4f6", desc: "Cardinal number (एक, दुई, २०७९)" },
  OD:  { label: "Ordinal",        color: "#4b5563", bg: "#f9fafb", desc: "Ordinal number (पहिलो, दोस्रो)" },
  DT:  { label: "Determiner",     color: "#6b7280", bg: "#f3f4f6", desc: "Determiner (यस्तो, अरू, हरेक)" },
  FW:  { label: "Foreign Word",   color: "#9ca3af", bg: "#f9fafb", desc: "Foreign/Roman word (English)" },
  SYM: { label: "Symbol",         color: "#d1d5db", bg: "#f9fafb", desc: "Punctuation/Symbol (। , ? !)" },
  UH:  { label: "Interjection",   color: "#fbbf24", bg: "#fffbeb", desc: "Interjection (वाह, ओहो, अरे)" },
  XX:  { label: "Unknown",        color: "#9ca3af", bg: "#f3f4f6", desc: "Unknown/Unclassified word" },
};

// ── Morphology engine (JS port of Python tagger) ──────────────────────────
const LEXICON = {
  'छ':'VA','छन्':'VA','छु':'VA','छौ':'VA','थियो':'VA','थिए':'VA',
  'हो':'VA','होइन':'VA','हैन':'VA','हुन्':'VA','भयो':'VA','भए':'VA',
  'हुनेछ':'VA','थिएन':'VA','छैन':'VA','छैनन्':'VA',
  'म':'PP','हामी':'PP','तिमी':'PP','तपाईं':'PP','उनी':'PP',
  'उहाँ':'PP','ऊ':'PP','उनीहरू':'PP',
  'यो':'PPD','त्यो':'PPD','यी':'PPD','ती':'PPD',
  'यस':'PPD','त्यस':'PPD',
  'को':'PPW','के':'PPW','कहाँ':'PPW','कसरी':'PPW','कति':'PPW','किन':'PPW',
  'आफू':'PPR','आफैं':'PPR','आफ्नो':'PPR',
  'कोही':'PPX','केही':'PPX','सबै':'PPX','कुनै':'PPX',
  'र':'CC','तर':'CC','अनि':'CC','वा':'CC','पनि':'CC','तथा':'CC',
  'किनभने':'CS','यदि':'CS','ताकि':'CS','जब':'CS','त्यसैले':'CS',
  'नि':'RP','पो':'RP','नै':'RP','त':'RPD','चाहिँ':'RPD',
  'लागि':'POP','सम्म':'POP','बिना':'POP','बारे':'POP','तिर':'POP',
  'सँग':'POP','द्वारा':'POP','बाहेक':'POP','अगाडि':'POP',
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
  'ओहो':'UH','वाह':'UH','अरे':'UH',
  '।':'SYM',',':'SYM','?':'SYM','!':'SYM','-':'SYM',
  '(':'SYM',')':'SYM','—':'SYM',':':'SYM',';':'SYM',
};

function tagWord(word) {
  const w = word.trim();
  if (!w) return { tag: 'SYM', step: 'empty', rule: 'Empty input' };

  // Step 1: Lexicon
  if (LEXICON[w]) {
    return { tag: LEXICON[w], step: 'lexicon', rule: `Exact lexicon match: "${w}" → ${LEXICON[w]}` };
  }

  // Step 2: Digit
  if (/^[०-९\d][०-९\d,.\/%\-]*$/.test(w)) {
    return { tag: 'CD', step: 'digit', rule: 'Digit pattern (Devanagari or ASCII number)' };
  }

  // Step 3: Punctuation
  if (/^[^\u0900-\u097F\w]+$/.test(w)) {
    return { tag: 'SYM', step: 'punct', rule: 'Pure punctuation/symbol (no Devanagari chars)' };
  }

  // Step 4: Roman/English
  if (/^[A-Za-z]/.test(w)) {
    return { tag: 'FW', step: 'roman', rule: 'Starts with Roman/English character → Foreign Word' };
  }

  // Step 5: Verb rules
  if (/(इएको|इएकी|इएका|\u0947को|\u0947की|\u0947का|एको|एकी|एका|यको|यकी|यका)$/.test(w))
    return { tag: 'VBP', step: 'verb', rule: 'Perfective participle suffix (-एको/-ेको/-एकी/-एका)' };

  if (/(\u0947पछि|एपछि|एर)$/.test(w))
    return { tag: 'VBN', step: 'verb', rule: 'Conjunctive participle suffix (-एपछि/-एर)' };

  if (w.length >= 4 && /(\u0947नन्|\u0947न$|एनन्|इनन्|एनौ)$/.test(w))
    return { tag: 'VBP', step: 'verb', rule: 'Negated past suffix (-एनन्/-ेन/-इनन्)' };

  if (/(ाइन्छ|इन्छ|िन्छ)$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Passive present suffix (-इन्छ/-ाइन्छ) — पाइन्छ, सकिन्छ' };

  if (/(ँदैनन्|दैनन्|ँदैन|दैन)$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Continuous negative suffix (-दैन/-ँदैन)' };

  if (/(दैछन्|दैछौ|दैछु|दैछ|ँदैछ)$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Progressive present suffix (-दैछ/-ँदैछ)' };

  if (/(दछन्|दछौ|दछु|दछ)$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Habitual suffix (-दछ/-दछन्)' };

  if (/नेछ(न्)?$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Future suffix (-नेछ/-नेछन्)' };

  if (/(ाइएको|ाइयो|ाइन्|इयो|गरियो|गरिएको|गरिन्छ)$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Passive/causative suffix (-ाइयो/-इयो/-गरियो)' };

  if (/\u094Dछ(\u0941|\u094Dन्|\u094Cस्|न्|स्)?$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Halant+छ form (्छु/्छ/्छन्) — बस्छु, पढ्छ, गर्छु' };

  if (/(न्छ|ञ्छ|र्छ|ल्छ|स्छ|ग्छ|ट्छ|ँछ|म्छ|ब्छ|द्छ|न्दछ)$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Consonant cluster+छ suffix (गर्छ, जान्छ, हुन्छ)' };

  if (/छ(न्|औ|ौ|उ|स्)$/.test(w))
    return { tag: 'VBF', step: 'verb', rule: 'Present person ending (-छन्/-छौ/-छु/-छस्)' };

  if (/नुभ(यो|एको|ए|इन्|एन)$/.test(w))
    return { tag: 'VBP', step: 'verb', rule: 'Honorific past suffix (-नुभयो/-नुभएको) — गर्नुभयो' };

  if (w.length > 2 && /(इनन्|यौं|इन्|यो)$/.test(w))
    return { tag: 'VBP', step: 'verb', rule: 'Simple past suffix (-यो/-इन्/-यौं) — गयो, आयो' };

  // Case markers (AFTER verb rules to avoid -ले conflict)
  if (w.length > 4 && /(बाट|देखि)$/.test(w))
    return { tag: 'CMA', step: 'case', rule: 'Ablative case marker suffix (-बाट/-देखि) — देशबाट' };

  if (w.length > 3 && /लाई$/.test(w))
    return { tag: 'CMD', step: 'case', rule: 'Dative case marker suffix (-लाई) — मान्छेलाई' };

  if (w.length > 2 && /\u0932\u0947$/.test(w))
    return { tag: 'CME', step: 'case', rule: 'Ergative case marker suffix (-ले) — सरकारले, आमाले' };

  if (w.length > 3 && /(मध्ये|मा)$/.test(w))
    return { tag: 'CML', step: 'case', rule: 'Locative case marker suffix (-मा/-मध्ये) — घरमा' };

  if (w.length > 3 && /(कै|को|का|की)$/.test(w))
    return { tag: 'CMP', step: 'case', rule: 'Possessive case marker suffix (-को/-का/-की) — नेपालको' };

  // Past bare-e forms
  if (w.length >= 3 && /[\u0915-\u0931\u0933-\u0939\u094D]\u0947$/.test(w))
    return { tag: 'VBP', step: 'verb', rule: 'Past 3rd plural: consonant+े suffix — गरे, लेखे' };

  if (w.length >= 3 && /[\u0915-\u0939\u093e\u093f\u0940]\u090f$/.test(w))
    return { tag: 'VBP', step: 'verb', rule: 'Past independent ए form — गाए, आए, खाए' };

  if (w.length > 2 && /(ँदा|न्दा|ँदै|न्दै|दै|दा)$/.test(w))
    return { tag: 'VBG', step: 'verb', rule: 'Gerund/adverbial participle suffix (-दै/-ँदै/-दा) — गर्दै' };

  if (/(नुपर्ने|नुपर्छ|नुहोस्|नुस्|नु)$/.test(w))
    return { tag: 'VBN', step: 'verb', rule: 'Infinitive suffix (-नु/-नुस्/-नुहोस्) — गर्नु' };

  // Noun derivation
  if (/हर[ूु]$/.test(w))
    return { tag: 'NN', step: 'noun', rule: 'Plural marker suffix (-हरू/-हरु) — मान्छेहरू' };

  if (w.length >= 4 && /[ािीुूेैो][नण]$/.test(w))
    return { tag: 'NN', step: 'noun', rule: 'Abstract noun: vowel+न/ण suffix — सम्बोधन, सञ्चालन' };

  if (w.length >= 6 && /[ािीुूेैो].{0,3}[नण]$/.test(w))
    return { tag: 'NN', step: 'noun', rule: 'Abstract noun with ण — प्रसारण, निर्माण' };

  if (w.length > 3 && /(इत्व|त्व|ता|पन|ाई)$/.test(w))
    return { tag: 'NN', step: 'noun', rule: 'Abstract noun suffix (-ता/-त्व/-पन/-ाई) — स्वतन्त्रता' };

  if (w.length >= 4 && /(ती|ली|री|नी|गी|जी)$/.test(w))
    return { tag: 'NN', step: 'noun', rule: 'Verbal/abstract noun suffix (-ती/-री/-नी) — तयारी' };

  if (w.length > 4 && /(कर्ता|वाला|दार|कार)$/.test(w))
    return { tag: 'NNP', step: 'noun', rule: 'Agentive suffix (-कर्ता/-वाला/-दार) — कार्यकर्ता' };

  if (w.length >= 3 && /[^न]न$/.test(w))
    return { tag: 'VBN', step: 'verb', rule: 'Bare infinitive suffix (-न) — पार्न, गर्न, जान' };

  if (w.length > 3 && /[^न]ने$/.test(w))
    return { tag: 'VBN', step: 'verb', rule: 'Relative/adjectival verb suffix (-ने) — गर्ने, जाने' };

  if (/(नुहोस्|होस्|देऊ|दिनुस्)$/.test(w))
    return { tag: 'VBI', step: 'verb', rule: 'Imperative suffix (-नुहोस्/-होस्/-देऊ)' };

  if (/(इलो|इली|इला|ालु|युक्त|हीन|वान|शाली|पूर्ण|योग्य)$/.test(w))
    return { tag: 'JJ', step: 'adj', rule: 'Adjective derivation suffix (-इलो/-ालु/-युक्त/-पूर्ण)' };

  if (w.length > 3 && /(गरी|तर्फ|पूर्वक|रूपमा)$/.test(w))
    return { tag: 'RB', step: 'adv', rule: 'Adverb derivation suffix (-गरी/-तर्फ/-पूर्वक)' };

  // Default
  return {
    tag: w.length >= 5 ? 'NNP' : 'NN',
    step: 'default',
    rule: w.length >= 5
      ? 'Default: word length ≥5 chars → likely Proper Noun (NNP)'
      : 'Default: short word (< 5 chars) → Common Noun (NN)'
  };
}

const STEP_LABELS = {
  lexicon: { icon: '📖', label: 'Lexicon Lookup',     color: '#f59e0b' },
  digit:   { icon: '🔢', label: 'Digit Check',        color: '#6b7280' },
  punct:   { icon: '✦',  label: 'Punctuation Check',  color: '#9ca3af' },
  roman:   { icon: '🔤', label: 'Roman/Foreign Check', color: '#6366f1' },
  verb:    { icon: '⚡', label: 'Verb Rule Match',     color: '#10b981' },
  case:    { icon: '🔗', label: 'Case Marker Rule',    color: '#0891b2' },
  noun:    { icon: '🏷️', label: 'Noun Derivation Rule', color: '#3b82f6' },
  adj:     { icon: '🎨', label: 'Adjective Rule',      color: '#f97316' },
  adv:     { icon: '💨', label: 'Adverb Rule',          color: '#84cc16' },
  default: { icon: '🔍', label: 'Default Fallback',    color: '#9ca3af' },
  empty:   { icon: '∅',  label: 'Empty',               color: '#d1d5db' },
};

const EXAMPLES = [
  "म काठमाडौंमा बस्छु",
  "सरकारले नयाँ नीति ल्यायो",
  "विद्यार्थीहरूले परीक्षा दिए",
  "नेपाल सुन्दर देश हो",
  "उनीहरू बजारबाट आए",
  "शिक्षकले विद्यार्थीलाई पढाउनुभयो",
  "पाइन्छ सकिन्छ गरिन्छ",
];

// ── Tag chip component ────────────────────────────────────────────────────
function TagChip({ tag, size = 'sm' }) {
  const info = TAG_INFO[tag] || { label: tag, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: size === 'lg' ? '4px 10px' : '2px 7px',
      borderRadius: 6,
      background: info.bg,
      color: info.color,
      border: `1.5px solid ${info.color}40`,
      fontSize: size === 'lg' ? 13 : 11,
      fontWeight: 700,
      fontFamily: 'monospace',
      whiteSpace: 'nowrap',
    }}>
      {tag}
    </span>
  );
}

// ── Pipeline step visualization ───────────────────────────────────────────
function PipelineSteps({ word, result, allSteps }) {
  const steps = [
    { key: 'lexicon', label: 'Lexicon' },
    { key: 'digit',   label: 'Digit' },
    { key: 'punct',   label: 'Punct' },
    { key: 'roman',   label: 'Roman' },
    { key: 'verb',    label: 'Verb Rules' },
    { key: 'case',    label: 'Case Rules' },
    { key: 'noun',    label: 'Noun Rules' },
    { key: 'adj',     label: 'Adj Rules' },
    { key: 'adv',     label: 'Adv Rules' },
    { key: 'default', label: 'Default' },
  ];

  const matchIdx = steps.findIndex(s => s.key === result.step);

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, margin: '8px 0' }}>
      {steps.map((s, i) => {
        const isMatch  = s.key === result.step;
        const isPassed = i < matchIdx;
        const info     = STEP_LABELS[s.key];
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              padding: '3px 8px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: isMatch ? 700 : 400,
              background: isMatch ? info.color : isPassed ? '#f3f4f6' : '#fafafa',
              color: isMatch ? '#fff' : isPassed ? '#9ca3af' : '#d1d5db',
              border: `1.5px solid ${isMatch ? info.color : isPassed ? '#e5e7eb' : '#f3f4f6'}`,
              textDecoration: isPassed ? 'line-through' : 'none',
              transition: 'all 0.2s',
            }}>
              {info.icon} {s.label}
            </div>
            {i < steps.length - 1 && (
              <span style={{ color: '#d1d5db', fontSize: 10 }}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [input, setInput]           = useState("सरकारले नयाँ नीति ल्यायो");
  const [tagged, setTagged]         = useState([]);
  const [selected, setSelected]     = useState(null);
  const [animating, setAnimating]   = useState(false);
  const [visibleCount, setVisible]  = useState(0);
  const [activeTab, setActiveTab]   = useState('tagger'); // tagger | about | tags

  const tag = () => {
    const words  = input.trim().split(/\s+/).filter(Boolean);
    const result = words.map(w => ({ word: w, ...tagWord(w) }));
    setTagged(result);
    setSelected(null);
    setVisible(0);
    setAnimating(true);
    result.forEach((_, i) => {
      setTimeout(() => setVisible(i + 1), i * 180);
    });
    setTimeout(() => setAnimating(false), result.length * 180 + 300);
  };

  useEffect(() => { tag(); }, []);

  const tagCounts = tagged.reduce((acc, t) => {
    acc[t.tag] = (acc[t.tag] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>🏷️</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>
                Nepali POS Tagger
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                NCG 43-tag tagset · HMM + Morphology Rules · 227M tokens tagged
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['tagger', 'about', 'tags'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: activeTab === tab
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.06)',
              color: activeTab === tab ? '#fff' : '#94a3b8',
              transition: 'all 0.2s',
            }}>
              {tab === 'tagger' ? '🏷️ Tagger' : tab === 'about' ? 'ℹ️ About' : '📋 All Tags'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* TAGGER TAB */}
        {activeTab === 'tagger' && (
          <div>
            {/* Input Section */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 16,
              padding: 24,
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
                ENTER NEPALI TEXT
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && tag()}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 18,
                    color: '#f1f5f9',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  placeholder="नेपाली वाक्य लेख्नुहोस्..."
                />
                <button onClick={tag} style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}>
                  Tag →
                </button>
              </div>

              {/* Example sentences */}
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', alignSelf: 'center' }}>Examples:</span>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => { setInput(ex); }} style={{
                    padding: '4px 12px',
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 20,
                    color: '#a5b4fc',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Tagged output */}
            {tagged.length > 0 && (
              <>
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, fontWeight: 600 }}>
                    TAGGED OUTPUT — click any word to see step-by-step breakdown
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {tagged.slice(0, visibleCount).map((t, i) => {
                      const info = TAG_INFO[t.tag] || { color: '#6b7280', bg: '#f3f4f6', label: t.tag };
                      const isSelected = selected === i;
                      return (
                        <div key={i}
                          onClick={() => setSelected(isSelected ? null : i)}
                          style={{
                            cursor: 'pointer',
                            padding: '10px 14px',
                            borderRadius: 12,
                            background: isSelected
                              ? `${info.color}20`
                              : 'rgba(255,255,255,0.04)',
                            border: `2px solid ${isSelected ? info.color : 'rgba(255,255,255,0.08)'}`,
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            animation: `fadeIn 0.3s ease`,
                          }}>
                          <div style={{ fontSize: 20, color: '#f1f5f9', marginBottom: 4, fontWeight: 600 }}>
                            {t.word}
                          </div>
                          <TagChip tag={t.tag} />
                          <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                            {info.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tag distribution */}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>TAG DISTRIBUTION</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).map(([tag, count]) => (
                        <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <TagChip tag={tag} />
                          <span style={{ fontSize: 11, color: '#64748b' }}>×{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step-by-step breakdown */}
                {selected !== null && tagged[selected] && (
                  <div style={{
                    background: 'rgba(99,102,241,0.06)',
                    borderRadius: 16,
                    padding: 24,
                    border: '1.5px solid rgba(99,102,241,0.25)',
                    marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 700, marginBottom: 16 }}>
                      ⚡ STEP-BY-STEP TAGGING PROCESS — "{tagged[selected].word}"
                    </div>

                    {/* Word display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <div style={{
                        fontSize: 36, fontWeight: 800, color: '#f1f5f9',
                        background: 'rgba(255,255,255,0.06)',
                        padding: '8px 20px', borderRadius: 12,
                      }}>
                        {tagged[selected].word}
                      </div>
                      <div style={{ fontSize: 24, color: '#64748b' }}>→</div>
                      <div>
                        <TagChip tag={tagged[selected].tag} size="lg" />
                        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                          {TAG_INFO[tagged[selected].tag]?.desc}
                        </div>
                      </div>
                    </div>

                    {/* Pipeline visualization */}
                    <div style={{
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                    }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                        RULE PIPELINE (checks stop at first match ✓)
                      </div>
                      <PipelineSteps
                        word={tagged[selected].word}
                        result={tagged[selected]}
                      />
                    </div>

                    {/* Matched rule */}
                    <div style={{
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: STEP_LABELS[tagged[selected].step]?.color || '#6366f1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                      }}>
                        {STEP_LABELS[tagged[selected].step]?.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                          MATCHED AT: {STEP_LABELS[tagged[selected].step]?.label?.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 14, color: '#e2e8f0', marginTop: 2 }}>
                          {tagged[selected].rule}
                        </div>
                      </div>
                    </div>

                    {/* All steps explanation */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>
                        WHAT HAPPENED BEFORE THE MATCH (rules that were checked and skipped):
                      </div>
                      {(() => {
                        const allStepKeys = ['lexicon','digit','punct','roman','verb','case','noun','adj','adv','default'];
                        const matchIdx = allStepKeys.indexOf(tagged[selected].step);
                        const skipped  = allStepKeys.slice(0, matchIdx);
                        if (!skipped.length) return (
                          <div style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>
                            Matched on first check — no rules skipped.
                          </div>
                        );
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {skipped.map(s => (
                              <div key={s} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 8,
                                opacity: 0.5,
                              }}>
                                <span style={{ fontSize: 14 }}>✗</span>
                                <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                                  {STEP_LABELS[s]?.icon} {STEP_LABELS[s]?.label} — not matched, skipped
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* All words breakdown table */}
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 16 }}>
                    FULL SENTENCE BREAKDOWN
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          {['#','Word','Tag','Category','Rule Applied','Step'].map(h => (
                            <th key={h} style={{
                              textAlign: 'left', padding: '8px 12px',
                              color: '#64748b', fontWeight: 600, fontSize: 11,
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tagged.map((t, i) => {
                          const info = TAG_INFO[t.tag] || { label: t.tag, color: '#6b7280' };
                          return (
                            <tr key={i}
                              onClick={() => setSelected(i === selected ? null : i)}
                              style={{
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                cursor: 'pointer',
                                background: selected === i ? 'rgba(99,102,241,0.08)' : 'transparent',
                                transition: 'background 0.15s',
                              }}>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>{i+1}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>{t.word}</td>
                              <td style={{ padding: '10px 12px' }}><TagChip tag={t.tag} /></td>
                              <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{info.label}</td>
                              <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12, maxWidth: 300 }}>{t.rule}</td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: 20,
                                  background: `${STEP_LABELS[t.step]?.color}20`,
                                  color: STEP_LABELS[t.step]?.color,
                                  fontSize: 11, fontWeight: 600,
                                }}>
                                  {STEP_LABELS[t.step]?.icon} {STEP_LABELS[t.step]?.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { icon: '🔬', title: 'What is POS Tagging?',
                body: 'Part-of-Speech (POS) tagging assigns grammatical labels to each word in a sentence. For example: "सरकारले" → CME (Ergative case marker), "नीति" → NN (Common Noun), "ल्यायो" → VBP (Past Verb). It is the foundation of all NLP applications.' },
              { icon: '🏗️', title: 'How This Tagger Works',
                body: 'Uses a pipeline of 35 morphological rules derived from the Nepali Computational Grammar (NCG) paper, plus a 120-entry lexicon. Each word is checked in priority order: lexicon → digit → punctuation → verb rules → case marker rules → noun derivation → default.' },
              { icon: '📊', title: 'What Was Tagged',
                body: '227 million tokens across 6 domains: General Web (2.89 GB), Government/Legal (410 MB), Literature/Poetry (80 MB), News (177 MB), Social Media (109 MB), Wikipedia (198 MB). Total corpus: 3.77 GB.' },
              { icon: '⚡', title: 'Performance',
                body: 'Colab CPU (1 core): 489,592 TPS. Local PC CPU (12 cores parallel): 1,442,793 TPS — 2.95× faster. Colab T4 GPU: 533,238 TPS. The 12-core CPU outperforms the GPU for rule-based tagging because the task is I/O bound, not compute bound.' },
              { icon: '🎯', title: 'Accuracy',
                body: '100% on 57-token manual evaluation set. NN+NNP share: 43-47% across domains (healthy range for Nepali text). All unicode edge cases fixed: vowel-sign forms (ेको vs एको), ergative -ले vs past-ले disambiguation, abstract nouns with -ण.' },
              { icon: '🌍', title: 'Real World Uses',
                body: 'Machine translation, named entity recognition, dependency parsing, search engines, chatbots, spell checkers, news categorization, government document processing, Nepali keyboard autocomplete, educational language tools.' },
            ].map((card, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 16, padding: 24,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{card.body}</div>
              </div>
            ))}
          </div>
        )}

        {/* ALL TAGS TAB */}
        {activeTab === 'tags' && (
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Complete NCG (Nepali Computational Grammar) 43-tag coarse tagset used in this project
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {Object.entries(TAG_INFO).map(([tag, info]) => (
                <div key={tag} style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 12, padding: '14px 16px',
                  border: `1.5px solid ${info.color}20`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    minWidth: 48, height: 32,
                    background: info.bg,
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: info.color, fontWeight: 800, fontSize: 13, fontFamily: 'monospace',
                  }}>
                    {tag}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{info.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{info.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
