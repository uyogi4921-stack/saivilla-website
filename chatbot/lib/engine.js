import { matchProperties, BUY_BUDGETS, RENT_BUDGETS } from './matcher';

// ---------- helpers ----------

const COMPLEX_KEYWORDS = [
  'loan', 'emi', 'legal', 'document', 'documentation', 'registry', 'registration',
  'dispute', 'tax', 'gst', 'stamp duty', 'nri', 'court', 'advocate', 'lawyer',
  'mortgage', 'litigation', 'power of attorney', 'inheritance', 'will',
];

export function isComplexQuery(text) {
  const t = text.toLowerCase();
  return COMPLEX_KEYWORDS.some((k) => t.includes(k));
}

function parseIntent(text) {
  const t = text.toLowerCase();
  if (/\b(buy|purchase|own|khareed)/.test(t)) return 'buy';
  if (/\b(rent|lease|bhade|tenant)/.test(t)) return 'rent';
  if (/\b(invest|investment|returns|appreciat)/.test(t)) return 'invest';
  return null;
}

// Parse "50 lakh", "1.2 cr", "₹80L", "20000 per month" etc.
function parseBudgetText(text, isRent) {
  const t = text.toLowerCase().replace(/,/g, '');
  const num = t.match(/(\d+(?:\.\d+)?)/);
  if (!num) return null;
  const n = parseFloat(num[1]);

  if (isRent) {
    // Treat plain numbers as ₹/month; "k" suffix as thousands
    let amount = n;
    if (/k\b/.test(t)) amount = n * 1000;
    if (amount < 100) amount = amount * 1000; // "15" → 15k
    return { min: amount * 0.6, max: amount * 1.25, label: `around ₹${Math.round(amount).toLocaleString('en-IN')}/mo` };
  }

  let lakhs;
  if (/cr|crore/.test(t)) lakhs = n * 100;
  else if (/l|lakh|lac/.test(t)) lakhs = n;
  else if (n > 1000) lakhs = n / 100000; // raw rupees
  else lakhs = n; // assume lakhs
  return { min: lakhs * 0.6, max: lakhs * 1.25, label: `around ₹${lakhs >= 100 ? (lakhs / 100).toFixed(1) + ' Cr' : Math.round(lakhs) + 'L'}` };
}

function parseLocation(text) {
  const t = text.toLowerCase();
  if (t.includes('palanpur')) return 'palanpur';
  if (t.includes('ahmedabad') || t.includes('amdavad')) return 'ahmedabad';
  if (/\b(any|both|either|anywhere|no preference)\b/.test(t)) return 'any';
  return null;
}

function parseType(text) {
  const t = text.toLowerCase();
  if (/flat|apartment|bhk/.test(t)) return 'flat';
  if (/villa|bungalow|house|duplex/.test(t)) return 'villa';
  if (/plot|land|zameen/.test(t)) return 'plot';
  if (/commercial|shop|office|showroom|dukan/.test(t)) return 'commercial';
  return null;
}

function nextSevenDays() {
  const days = [];
  const fmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({ id: d.toISOString().slice(0, 10), label: fmt.format(d) });
  }
  return days;
}

const TIME_SLOTS = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

const INTENT_WORD = { buy: 'buying', rent: 'renting', invest: 'investing' };

// ---------- initial state ----------

export function initialState() {
  return {
    step: 'intent',
    prefs: { intent: null, budget: null, location: null, type: null },
    booking: { property: null, date: null, time: null, name: null, phone: null },
    matches: [],
    missCount: 0,
    pendingHandoffReturn: null,
  };
}

export function greetingMessages() {
  return {
    messages: [
      { type: 'text', text: 'Namaste! 🙏 Welcome to SAIVILLA DREAMHOUSE PVT.LTD. — trusted by 5000+ happy families across 25+ projects in Palanpur.' },
      { type: 'text', text: "I'm Sai, your property assistant. I can help you find your dream property and even book a free site visit — all in 2 minutes!" },
      { type: 'text', text: 'So tell me, what brings you here today?' },
    ],
    chips: [
      { id: 'buy', label: '🏠 Buy a property' },
      { id: 'rent', label: '🔑 Rent a property' },
      { id: 'invest', label: '📈 Investment' },
    ],
  };
}

// ---------- the state machine ----------
// process(state, input) → { messages, chips, state }
// input = { id?, label?, text? }  (chip click has id, free text has text)

export function process(state, input) {
  const s = structuredClone(state);
  const raw = (input.text || input.label || '').trim();
  const out = { messages: [], chips: [], state: s };

  // Global: complex-query detection on free text
  if (input.text && isComplexQuery(input.text)) {
    s.pendingHandoffReturn = s.step;
    s.step = 'handoff_confirm';
    out.messages.push(
      { type: 'text', text: "That's an important question — but things like loans, legal and documentation are best handled by our experts, not a bot! 😊" },
      { type: 'text', text: 'Shall I connect you to our team? They usually respond within 15 minutes during office hours.' },
    );
    out.chips = [
      { id: 'handoff_yes', label: '👤 Yes, connect me' },
      { id: 'handoff_no', label: '↩️ No, continue here' },
    ];
    return out;
  }

  switch (s.step) {
    // ---------------- intent ----------------
    case 'intent': {
      const intent = ['buy', 'rent', 'invest'].includes(input.id) ? input.id : parseIntent(raw);
      if (!intent) return unrecognized(s, out, 'Just tap one of the options below, or tell me — are you looking to buy, rent, or invest?');

      // We currently sell new projects only — rentals go to the human team
      if (intent === 'rent') {
        s.pendingHandoffReturn = 'intent';
        s.step = 'handoff_confirm';
        out.messages.push(
          { type: 'text', text: 'We mainly offer brand-new properties for purchase at the moment. 😊' },
          { type: 'text', text: 'But for rentals in Palanpur, our team can personally help you find something good. Shall I connect you?' },
        );
        out.chips = [
          { id: 'handoff_yes', label: '👤 Yes, connect me' },
          { id: 'handoff_no', label: '🏠 Show me properties to buy' },
        ];
        return out;
      }

      s.prefs.intent = intent;
      s.missCount = 0;
      s.step = 'budget';

      const opener =
        intent === 'buy'
          ? 'Wonderful! Buying a home is a big milestone. 🎉'
          : intent === 'rent'
            ? 'Sure thing! Let me find you a good rental. 🔑'
            : 'Smart move! Real estate in Gujarat is giving great returns. 📈';

      out.messages.push(
        { type: 'text', text: opener },
        { type: 'text', text: `What's your budget for ${INTENT_WORD[intent]}? A rough range is fine.` },
      );
      const budgets = intent === 'rent' ? RENT_BUDGETS : BUY_BUDGETS;
      out.chips = Object.entries(budgets).map(([id, b]) => ({ id: `budget_${id}`, label: b.label }));
      return out;
    }

    // ---------------- budget ----------------
    case 'budget': {
      const isRent = s.prefs.intent === 'rent';
      const table = isRent ? RENT_BUDGETS : BUY_BUDGETS;
      let budget = null;

      if (input.id?.startsWith('budget_')) {
        const key = input.id.replace('budget_', '');
        if (table[key]) budget = { ...table[key] };
      } else if (raw) {
        budget = parseBudgetText(raw, isRent);
      }
      if (!budget) return unrecognized(s, out, "I didn't catch the budget. You can tap a range below, or type something like \"50 lakh\" or \"1.5 cr\".");

      s.prefs.budget = budget;
      s.missCount = 0;
      s.step = 'location';
      out.messages.push(
        { type: 'text', text: `Noted — ${budget.label}. 👍 Our team will share exact pricing during your visit.` },
        { type: 'text', text: 'And which area do you prefer? All our projects are in prime Palanpur locations on the Ahmedabad Highway.' },
      );
      out.chips = [
        { id: 'loc_palanpur', label: '📍 Palanpur' },
        { id: 'loc_any', label: '🗺️ Anywhere is fine' },
      ];
      return out;
    }

    // ---------------- location ----------------
    case 'location': {
      let loc = null;
      if (input.id?.startsWith('loc_')) loc = input.id.replace('loc_', '');
      else if (raw) loc = parseLocation(raw);
      if (!loc) return unrecognized(s, out, 'Our projects are in Palanpur (on the Ahmedabad Highway). Shall I show you those? Or say "anywhere".');

      s.prefs.location = loc;
      s.missCount = 0;
      s.step = 'type';
      const locLabel = loc === 'any' ? 'both cities' : loc.charAt(0).toUpperCase() + loc.slice(1);
      out.messages.push(
        { type: 'text', text: `${locLabel === 'both cities' ? "Great, I'll show you our best options!" : `${locLabel} — lovely choice!`}` },
        { type: 'text', text: 'Last question — what type of property are you looking for?' },
      );
      out.chips = [
        { id: 'type_flat', label: '🏢 Flat / Apartment' },
        { id: 'type_villa', label: '🏡 Villa / Bungalow' },
        { id: 'type_commercial', label: '🏬 Commercial' },
      ];
      return out;
    }

    // ---------------- type → results ----------------
    case 'type': {
      let type = null;
      if (input.id?.startsWith('type_')) type = input.id.replace('type_', '');
      else if (raw) type = parseType(raw);
      if (!type) return unrecognized(s, out, 'Tap one of the options — flat, villa, plot, or commercial?');

      s.prefs.type = type;
      s.missCount = 0;

      const { matches, exact } = matchProperties(s.prefs);
      s.matches = matches;
      s.step = 'results';

      if (matches.length === 0) {
        out.messages.push({ type: 'text', text: "Hmm, I couldn't find anything matching right now. 😅 But our team adds new properties every week — shall I connect you with them?" });
        out.chips = [
          { id: 'handoff_yes', label: '👤 Yes, connect me' },
          { id: 'restart', label: '🔄 Change preferences' },
        ];
        s.step = 'handoff_confirm';
        s.pendingHandoffReturn = 'results';
        return out;
      }

      out.messages.push(
        { type: 'text', text: exact ? 'Found some great options for you! 🎯 Here are my top picks:' : "I couldn't find an exact match, but here are the closest options I think you'll like:" },
        { type: 'properties', properties: matches },
        { type: 'text', text: 'Would you like to see any of these in person? Site visits are completely free — our team will even arrange pick-up from Palanpur city area. 🚗' },
      );
      out.chips = [
        { id: 'book_visit', label: '📅 Book a site visit' },
        { id: 'restart', label: '🔄 Change preferences' },
        { id: 'agent', label: '👤 Talk to an agent' },
      ];
      return out;
    }

    // ---------------- results actions ----------------
    case 'results': {
      if (input.id === 'book_visit') {
        if (s.matches.length === 1) {
          s.booking.property = s.matches[0];
          s.step = 'book_date';
          return askDate(s, out);
        }
        s.step = 'book_pick';
        out.messages.push({ type: 'text', text: 'Great! Which property would you like to visit?' });
        out.chips = s.matches.map((m) => ({ id: `pick_${m.id}`, label: `${m.emoji} ${m.name}` }));
        return out;
      }
      if (input.id === 'restart') return restart(s, out);
      if (input.id === 'agent') return startHandoff(s, out);
      // free text on results screen → try booking keywords
      if (/visit|book|dekhna|see/i.test(raw)) {
        s.step = 'book_pick';
        out.messages.push({ type: 'text', text: 'Sure! Which property would you like to visit?' });
        out.chips = s.matches.map((m) => ({ id: `pick_${m.id}`, label: `${m.emoji} ${m.name}` }));
        return out;
      }
      return unrecognized(s, out, 'You can book a site visit, change your preferences, or talk to our team — just tap below!', [
        { id: 'book_visit', label: '📅 Book a site visit' },
        { id: 'restart', label: '🔄 Change preferences' },
        { id: 'agent', label: '👤 Talk to an agent' },
      ]);
    }

    // ---------------- booking: pick property ----------------
    case 'book_pick': {
      const picked = s.matches.find((m) => input.id === `pick_${m.id}` || raw.toLowerCase().includes(m.name.toLowerCase()));
      if (!picked) return unrecognized(s, out, 'Just tap the property you want to visit. 😊', s.matches.map((m) => ({ id: `pick_${m.id}`, label: `${m.emoji} ${m.name}` })));
      s.booking.property = picked;
      s.step = 'book_date';
      return askDate(s, out);
    }

    // ---------------- booking: date ----------------
    case 'book_date': {
      const day = nextSevenDays().find((d) => input.id === `date_${d.id}`);
      if (!day) return unrecognized(s, out, 'Please pick a date from the options below.', nextSevenDays().map((d) => ({ id: `date_${d.id}`, label: `📅 ${d.label}` })));
      s.booking.date = day;
      s.step = 'book_time';
      out.messages.push({ type: 'text', text: `${day.label} it is! And what time suits you?` });
      out.chips = TIME_SLOTS.map((t) => ({ id: `time_${t}`, label: `🕐 ${t}` }));
      return out;
    }

    // ---------------- booking: time ----------------
    case 'book_time': {
      const slot = TIME_SLOTS.find((t) => input.id === `time_${t}`);
      if (!slot) return unrecognized(s, out, 'Please pick a time slot below.', TIME_SLOTS.map((t) => ({ id: `time_${t}`, label: `🕐 ${t}` })));
      s.booking.time = slot;
      s.step = 'book_name';
      out.messages.push({ type: 'text', text: 'Almost done! May I know your name?' });
      out.chips = [];
      return out;
    }

    // ---------------- booking: name ----------------
    case 'book_name': {
      const name = raw.replace(/[^a-zA-Z\s.]/g, '').trim();
      if (name.length < 2) return unrecognized(s, out, 'Please type your name so our team knows who to expect. 😊');
      s.booking.name = name;
      s.missCount = 0;
      s.step = 'book_phone';
      out.messages.push({ type: 'text', text: `Nice to meet you, ${name.split(' ')[0]}! And your mobile number? Our team will call to confirm the visit.` });
      out.chips = [];
      return out;
    }

    // ---------------- booking: phone → confirmed ----------------
    case 'book_phone': {
      const digits = raw.replace(/[\s-]/g, '').replace(/^\+91/, '');
      if (!/^[6-9]\d{9}$/.test(digits)) {
        return unrecognized(s, out, "That doesn't look like a valid mobile number. Please type a 10-digit number, e.g. 98765 43210.");
      }
      s.booking.phone = digits;
      s.step = 'confirmed';
      out.messages.push(
        { type: 'booking', booking: structuredClone(s.booking) },
        { type: 'text', text: `All set, ${s.booking.name.split(' ')[0]}! 🎉 Your site visit is booked. Our team will call you on ${digits.replace(/(\d{5})(\d{5})/, '$1 $2')} shortly to confirm.` },
        { type: 'text', text: 'Anything else I can help you with?' },
      );
      out.chips = [
        { id: 'restart', label: '🔍 New search' },
        { id: 'agent', label: '👤 Talk to an agent' },
      ];
      out.log = { type: 'booking', data: s.booking };
      return out;
    }

    // ---------------- confirmed ----------------
    case 'confirmed': {
      if (input.id === 'restart') return restart(s, out);
      if (input.id === 'agent') return startHandoff(s, out);
      return unrecognized(s, out, 'You can start a new search or talk to our team — tap below!', [
        { id: 'restart', label: '🔍 New search' },
        { id: 'agent', label: '👤 Talk to an agent' },
      ]);
    }

    // ---------------- handoff confirm ----------------
    case 'handoff_confirm': {
      if (input.id === 'handoff_yes' || /\b(yes|ha|haan|sure|ok)\b/i.test(raw)) return startHandoff(s, out);
      if (input.id === 'restart') return restart(s, out);
      // decline → resume previous step
      s.step = s.pendingHandoffReturn || 'intent';
      s.pendingHandoffReturn = null;
      out.messages.push({ type: 'text', text: 'No problem! Let\'s continue. 😊' });
      out.chips = chipsForStep(s);
      return out;
    }

    // ---------------- after handoff ----------------
    case 'handoff_done': {
      if (input.id === 'restart') return restart(s, out);
      out.messages.push({ type: 'text', text: 'Our team has your conversation and will reach out soon. Meanwhile, feel free to start a new search!' });
      out.chips = [{ id: 'restart', label: '🔍 Start new search' }];
      return out;
    }

    default:
      return restart(s, out);
  }
}

// ---------- shared transitions ----------

function askDate(s, out) {
  out.messages.push(
    { type: 'text', text: `Excellent choice! ${s.booking.property.emoji} ${s.booking.property.name} is one of our most-loved projects.` },
    { type: 'text', text: 'When would you like to visit? Pick any day this week:' },
  );
  out.chips = nextSevenDays().map((d) => ({ id: `date_${d.id}`, label: `📅 ${d.label}` }));
  return out;
}

function restart(s, out) {
  const fresh = initialState();
  out.state = fresh;
  out.messages.push({ type: 'text', text: "Let's start fresh! What are you looking for today?" });
  out.chips = [
    { id: 'buy', label: '🏠 Buy a property' },
    { id: 'rent', label: '🔑 Rent a property' },
    { id: 'invest', label: '📈 Investment' },
  ];
  return out;
}

function startHandoff(s, out) {
  s.step = 'handoff_done';
  out.messages.push(
    { type: 'handoff' },
    { type: 'text', text: 'Connecting you to our team... 👤 Done! Your conversation has been shared with our property experts at Sai Villa DreamHouse.' },
    { type: 'text', text: '📞 You can also reach us directly:\n+91 94263 19628 · +91 97252 08524 · +91 63570 08496\n📧 saivillaoffice@gmail.com\n🕐 Mon–Sat, 10:00 AM – 7:00 PM' },
  );
  out.chips = [{ id: 'restart', label: '🔍 Start new search' }];
  out.log = { type: 'handoff', data: { prefs: s.prefs } };
  return out;
}

function unrecognized(s, out, hint, chips) {
  s.missCount = (s.missCount || 0) + 1;
  if (s.missCount >= 2) {
    s.missCount = 0;
    s.pendingHandoffReturn = s.step;
    s.step = 'handoff_confirm';
    out.messages.push({ type: 'text', text: 'I might not be understanding you properly — sorry about that! 🙏 Would you like to talk to a real person from our team instead?' });
    out.chips = [
      { id: 'handoff_yes', label: '👤 Yes, connect me' },
      { id: 'handoff_no', label: '↩️ No, continue here' },
    ];
    return out;
  }
  out.messages.push({ type: 'text', text: hint });
  out.chips = chips || chipsForStep(s);
  return out;
}

function chipsForStep(s) {
  switch (s.step) {
    case 'intent':
      return [
        { id: 'buy', label: '🏠 Buy a property' },
        { id: 'rent', label: '🔑 Rent a property' },
        { id: 'invest', label: '📈 Investment' },
      ];
    case 'budget': {
      const budgets = s.prefs.intent === 'rent' ? RENT_BUDGETS : BUY_BUDGETS;
      return Object.entries(budgets).map(([id, b]) => ({ id: `budget_${id}`, label: b.label }));
    }
    case 'location':
      return [
        { id: 'loc_palanpur', label: '📍 Palanpur' },
        { id: 'loc_any', label: '🗺️ Anywhere is fine' },
      ];
    case 'type':
      return [
        { id: 'type_flat', label: '🏢 Flat / Apartment' },
        { id: 'type_villa', label: '🏡 Villa / Bungalow' },
        { id: 'type_commercial', label: '🏬 Commercial' },
      ];
    case 'results':
      return [
        { id: 'book_visit', label: '📅 Book a site visit' },
        { id: 'restart', label: '🔄 Change preferences' },
        { id: 'agent', label: '👤 Talk to an agent' },
      ];
    default:
      return [];
  }
}
