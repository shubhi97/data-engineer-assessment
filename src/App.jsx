import { useState, useEffect } from "react";
import LZString from "lz-string";
import { QUESTION_BANK } from "./questions";

// ─── CONFIG ───────────────────────────────────────────────────────────
const ALL_ROLES = [
  { id: "engineer", label: "Data Engineer", icon: "⚙️", desc: "Azure · AWS · Snowflake · SQL" },
  { id: "analyst",  label: "Data Analyst",  icon: "📊", desc: "Power BI · Tableau · Qlik Sense" },
];

// All platforms/tools in one flat list with role tag
const ALL_PLATFORMS = [
  { id: "Azure",       role: "engineer", icon: "☁️",  color: "#0078D4" },
  { id: "AWS",         role: "engineer", icon: "⚡",  color: "#FF9900" },
  { id: "Snowflake",   role: "engineer", icon: "❄️",  color: "#29B5E8" },
  { id: "Power BI",    role: "analyst",  icon: "📊",  color: "#F2C811" },
  { id: "Tableau",     role: "analyst",  icon: "📈",  color: "#E97627" },
  { id: "Qlik Sense",  role: "analyst",  icon: "🔵",  color: "#009845" },
];

const BANDS = [
  { id:"junior", label:"Entry Level",  color:"#10b981", emoji:"🟢", title:"Entry Level (0–3 yrs)" },
  { id:"mid",    label:"Mid-Level",    color:"#f59e0b", emoji:"🟠", title:"Mid-Level (3–6 yrs)" },
  { id:"senior", label:"Senior / Lead",color:"#8b5cf6", emoji:"🟣", title:"Senior / Lead (6+ yrs)" },
];

const ENG_CATEGORIES = {
  SQL:         { color:"#38bdf8", tag:"SQL" },
  Cloud:       { color:"#34d399", tag:"Cloud Technology" },
  Python:      { color:"#a78bfa", tag:"Python" },
  Stakeholder: { color:"#f472b6", tag:"Stakeholder Mgmt" },
};
const ANALYST_CATEGORIES = {
  SQL:         { color:"#38bdf8", tag:"SQL" },
  Tool:        { color:"#fb923c", tag:"Analytics Tool" },
  Analytics:   { color:"#34d399", tag:"Analytics & Insight" },
  Stakeholder: { color:"#f472b6", tag:"Stakeholder Mgmt" },
};
const ALL_CATEGORIES = { ...ENG_CATEGORIES, ...ANALYST_CATEGORIES };

// ─── QUESTION SELECTION ───────────────────────────────────────────────
// Rules:
//   For each selected platform → pick 2 SQL + 2 Cloud/Tool + 1 Stakeholder = 5 per platform
//   But SQL and Stakeholder questions are shared (don't repeat them per platform)
//   Final structure:
//     • 2 SQL questions (shared, from generic SQL bank or first platform's SQL pool)
//     • Per platform: 2 Cloud/Tool questions (no repeats across platforms)
//     • 1–2 Stakeholder questions (shared pool from all selected platforms)
//   Total = 2 SQL + (2 × numPlatforms) Cloud/Tool + 2 Stakeholder
//   Examples:
//     1 platform  → 2 + 2 + 2 = 6  (we bump tech to 4) → 8 questions
//     2 platforms → 2 + 4 + 2 = 8 questions
//     3 platforms → 2 + 6 + 2 = 10 questions
//     4 platforms → 2 + 8 + 2 = 12 questions
//     5 platforms → 2 + 10 + 2 = 14 questions
//     6 platforms → 2 + 12 + 2 = 16 questions

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const buildInterview = (selectedRoles, selectedPlatforms, band) => {
  const usedIds = new Set();
  const pick = (pool, n) => {
    const available = pool.filter(q => !usedIds.has(String(q.id)));
    const chosen = shuffle(available).slice(0, n);
    chosen.forEach(q => usedIds.add(String(q.id)));
    return chosen;
  };

  const sqlGenBank = QUESTION_BANK["SQL"]?.[band] || [];

  // ── 1. SQL questions (2, shared across all platforms) ─────────────
  // Collect SQL from all selected platforms + generic SQL bank, deduplicated
  let allSqlPool = [...sqlGenBank];
  selectedPlatforms.forEach(pid => {
    const pb = QUESTION_BANK[pid]?.[band] || [];
    pb.filter(q => q.cat === "SQL").forEach(q => {
      if (!allSqlPool.find(x => x.id === q.id)) allSqlPool.push(q);
    });
  });
  const sqlQs = pick(allSqlPool, 2);

  // ── 2. Tech questions (2 per platform, in order: SQL → platform Qs) ─
  const techQs = [];
  selectedPlatforms.forEach(pid => {
    const role = ALL_PLATFORMS.find(p => p.id === pid)?.role || "engineer";
    const pb   = QUESTION_BANK[pid]?.[band] || [];
    let pool;
    if (role === "engineer") {
      pool = pb.filter(q => q.cat === "Cloud" || q.cat === "Python");
    } else {
      pool = pb.filter(q => q.cat === "Tool" || q.cat === "Analytics");
    }
    // For single platform → pick 4 tech Qs; for multi → pick 2 each
    const n = selectedPlatforms.length === 1 ? 4 : 2;
    techQs.push(...pick(pool, n));
  });

  // ── 3. Stakeholder questions (2, shared from all selected platforms) ─
  let allShPool = [];
  selectedPlatforms.forEach(pid => {
    const pb = QUESTION_BANK[pid]?.[band] || [];
    pb.filter(q => q.cat === "Stakeholder").forEach(q => {
      if (!allShPool.find(x => x.id === q.id)) allShPool.push(q);
    });
  });
  const shQs = pick(allShPool, 2);

  // ── Final order: SQL → Tech (grouped by platform) → Stakeholder ───
  return [...sqlQs, ...techQs, ...shQs];
};

// ─── PLATFORM TAG for interviewer view ───────────────────────────────
// Each question shows which platform it belongs to
const getPlatformForQuestion = (qId, selectedPlatforms, band) => {
  for (const pid of selectedPlatforms) {
    const bank = QUESTION_BANK[pid]?.[band] || [];
    if (bank.find(q => String(q.id) === String(qId))) return pid;
  }
  // Check generic SQL bank
  const sqlBank = QUESTION_BANK["SQL"]?.[band] || [];
  if (sqlBank.find(q => String(q.id) === String(qId))) return "SQL";
  return null;
};

const getCatInfo = (cat) => ALL_CATEGORIES[cat] || { color:"#94a3b8", tag: cat };

// ─── SESSION ENCODING (lz-string, slim payload) ───────────────────────
const buildLookup = () => {
  const map = {};
  for (const [, levels] of Object.entries(QUESTION_BANK)) {
    for (const [, qs] of Object.entries(levels)) {
      qs.forEach(q => { map[String(q.id)] = q; });
    }
  }
  return map;
};
const Q_LOOKUP = buildLookup();

const encodeSession = (data) => {
  const slim = {
    n: data.candidateName,
    y: data.yearsExp,
    r: data.roles,         // array of role ids
    p: data.platforms,     // array of platform ids
    b: data.band,
    t: data.submittedAt,
    q: data.questions.map(q => q.id),
    a: data.answers,
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(slim));
};

const decodeSession = (str) => {
  try {
    const slim = JSON.parse(LZString.decompressFromEncodedURIComponent(str));
    if (!slim) return null;
    return {
      candidateName: slim.n,
      yearsExp:      slim.y,
      roles:         slim.r,
      platforms:     slim.p,
      band:          slim.b,
      submittedAt:   slim.t,
      questions:     slim.q.map(id => Q_LOOKUP[String(id)]).filter(Boolean),
      answers:       slim.a,
    };
  } catch(e) { return null; }
};

const getSessionFromURL = () => {
  const s = new URLSearchParams(window.location.search).get("s");
  return s ? decodeSession(s) : null;
};

const buildInterviewerURL = (data) => {
  const encoded = encodeSession(data);
  if (!encoded) return null;
  return `${window.location.origin}${window.location.pathname}?interviewer=true&s=${encoded}`;
};

// ─── APP ──────────────────────────────────────────────────────────────
export default function App() {
  const isInterviewer = new URLSearchParams(window.location.search).get("interviewer") === "true";

  const [step,           setStep]           = useState("setup");
  const [selectedRoles,  setSelectedRoles]  = useState([]);       // array
  const [selectedPlatforms, setSelectedPlatforms] = useState([]); // array
  const [band,           setBand]           = useState(null);
  const [candidateName,  setCandidateName]  = useState("");
  const [yearsExp,       setYearsExp]       = useState("");
  const [questions,      setQuestions]      = useState([]);
  const [currentQ,       setCurrentQ]       = useState(0);
  const [answers,        setAnswers]        = useState({});
  const [scores,         setScores]         = useState({});
  const [session,        setSession]        = useState(null);
  const [interviewerURL, setInterviewerURL] = useState(null);
  const [copied,         setCopied]         = useState(false);

  useEffect(() => {
    if (isInterviewer) setSession(getSessionFromURL());
  }, [isInterviewer]);

  const toggleRole = (roleId) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
    // Remove platforms that belong to deselected role
    setSelectedPlatforms(prev =>
      prev.filter(pid => {
        const p = ALL_PLATFORMS.find(x => x.id === pid);
        return p && (selectedRoles.includes(p.role) || p.role !== roleId);
      })
    );
  };

  const togglePlatform = (pid) => {
    setSelectedPlatforms(prev =>
      prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]
    );
  };

  // Platforms shown = only those whose role is selected
  const visiblePlatforms = ALL_PLATFORMS.filter(p => selectedRoles.includes(p.role));

  const totalQs = selectedPlatforms.length === 0 ? 0
    : 2 + (selectedPlatforms.length === 1 ? 4 : selectedPlatforms.length * 2) + 2;

  const canStart = selectedRoles.length > 0 && selectedPlatforms.length > 0 && band && candidateName.trim() && yearsExp.trim();

  const handleStart = () => {
    if (!canStart) return;
    setQuestions(buildInterview(selectedRoles, selectedPlatforms, band));
    setStep("interview");
    setCurrentQ(0);
    setAnswers({});
  };

  const handleSubmit = () => {
    const data = {
      candidateName, yearsExp,
      roles: selectedRoles,
      platforms: selectedPlatforms,
      band, questions, answers,
      submittedAt: new Date().toISOString(),
    };
    setInterviewerURL(buildInterviewerURL(data));
    setStep("thankyou");
  };

  const copyURL = () => {
    if (!interviewerURL) return;
    navigator.clipboard.writeText(interviewerURL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const selectedBand    = BANDS.find(b => b.id === band);
  const currentQuestion = questions[currentQ];

  // ── INTERVIEWER VIEW ──────────────────────────────────────────────
  if (isInterviewer) {
    if (!session) return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
          <h2 style={{ color:"#f1f5f9", fontSize:22, margin:"0 0 8px" }}>Invalid or Missing Link</h2>
          <p style={{ color:"#64748b", margin:0, fontSize:15 }}>Please use the unique link generated after the candidate submits.</p>
        </div>
      </div>
    );

    const qs        = session.questions || [];
    const cats      = [...new Set(qs.map(q => q.cat))];
    const platforms = session.platforms || [];
    const band_s    = session.band;

    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>

          {/* Header */}
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:"#94a3b8", fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Interviewer Review</div>
                <h1 style={{ color:"#f1f5f9", fontSize:24, fontWeight:800, margin:"0 0 6px" }}>{session.candidateName}</h1>
                <div style={{ color:"#64748b", fontSize:14, marginBottom:6 }}>
                  {BANDS.find(b => b.id === band_s)?.title}
                  {session.yearsExp && <span> · {session.yearsExp} yrs exp</span>}
                </div>
                {/* Roles */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6 }}>
                  {(session.roles || []).map(r => {
                    const role = ALL_ROLES.find(x => x.id === r);
                    return role ? (
                      <span key={r} style={{ background:"#1d3a5e", color:"#93c5fd", fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20 }}>
                        {role.icon} {role.label}
                      </span>
                    ) : null;
                  })}
                </div>
                {/* Platforms */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {platforms.map(pid => {
                    const p = ALL_PLATFORMS.find(x => x.id === pid);
                    return p ? (
                      <span key={pid} style={{ background: p.color+"22", color: p.color, fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20 }}>
                        {p.icon} {pid}
                      </span>
                    ) : null;
                  })}
                </div>
                <div style={{ color:"#475569", fontSize:12, marginTop:8 }}>
                  Submitted: {new Date(session.submittedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:12, padding:"1rem 1.5rem", textAlign:"center", minWidth:90 }}>
                <div style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Answered</div>
                <div style={{ color:"#f1f5f9", fontSize:32, fontWeight:800 }}>
                  {Object.keys(session.answers).length}<span style={{ color:"#475569", fontSize:16 }}>/{qs.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background:"#1e293b", borderLeft:"3px solid #f59e0b", borderRadius:"0 12px 12px 0", padding:"12px 16px", marginBottom:"1.5rem" }}>
            <p style={{ color:"#fcd34d", fontSize:13, margin:0 }}>
              📋 <strong>Interviewer Mode</strong> — Score each question 1–4. Each interviewer scores independently in their own browser.
            </p>
          </div>

          {/* Question cards */}
          {qs.map((q, i) => {
            const info    = getCatInfo(q.cat);
            const answer  = session.answers[q.id];
            const platTag = getPlatformForQuestion(q.id, platforms, band_s);
            const platObj = ALL_PLATFORMS.find(x => x.id === platTag);
            return (
              <div key={q.id} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"1.25rem", marginBottom:"1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                      <span style={{ background:info.color+"22", color:info.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.06em" }}>{info.tag}</span>
                      {platObj && (
                        <span style={{ background:platObj.color+"22", color:platObj.color, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>
                          {platObj.icon} {platTag}
                        </span>
                      )}
                      <span style={{ color:"#475569", fontSize:12 }}>Q{i+1}</span>
                    </div>
                    <p style={{ color:"#e2e8f0", fontSize:15, margin:"0 0 12px", fontWeight:500, lineHeight:1.6 }}>{q.q}</p>
                    <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
                      <div style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Candidate Answer</div>
                      <p style={{ color: answer ? "#cbd5e1" : "#475569", fontSize:14, margin:0, lineHeight:1.7, fontStyle: answer ? "normal" : "italic" }}>
                        {answer || "No answer provided"}
                      </p>
                    </div>
                    <details>
                      <summary style={{ color:"#64748b", fontSize:13, cursor:"pointer", userSelect:"none" }}>▶ What to Listen For</summary>
                      <div style={{ background:"#0f172a", borderLeft:`3px solid ${info.color}`, borderRadius:"0 8px 8px 0", padding:"10px 14px", marginTop:8 }}>
                        <p style={{ color:"#94a3b8", fontSize:13, margin:0, lineHeight:1.7 }}>{q.wtlf}</p>
                      </div>
                    </details>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, minWidth:52 }}>
                    {[4,3,2,1].map(s => {
                      const cols = { 4:"#2563eb", 3:"#16a34a", 2:"#d97706", 1:"#dc2626" };
                      const active = scores[q.id] === s;
                      return (
                        <button key={s} onClick={() => setScores(p => ({ ...p, [q.id]: s }))}
                          style={{ width:52, height:52, borderRadius:10,
                            border: active ? `2px solid ${cols[s]}` : "2px solid #334155",
                            background: active ? `${cols[s]}33` : "#0f172a",
                            color: active ? cols[s] : "#475569",
                            cursor:"pointer", fontWeight:800, fontSize:18, transition:"all 0.15s" }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Score summary */}
          {Object.keys(scores).length > 0 && (() => {
            const allVals   = Object.values(scores).map(Number);
            const overall   = (allVals.reduce((a,b)=>a+b,0) / allVals.length).toFixed(2);
            const anyBelow2 = cats.some(c => {
              const vals = qs.filter(q=>q.cat===c).map(q=>scores[q.id]).filter(Boolean);
              return vals.length && (vals.reduce((a,b)=>a+b,0)/vals.length) < 2;
            });
            const verdict = parseFloat(overall) >= 3.0 && !anyBelow2
              ? { text:"RECOMMENDED TO PROCEED",        color:"#16a34a", bg:"#f0fdf4" }
              : parseFloat(overall) >= 2.5
              ? { text:"BORDERLINE — REVIEW CAREFULLY",  color:"#d97706", bg:"#fffbeb" }
              : { text:"NOT RECOMMENDED AT THIS LEVEL",  color:"#dc2626", bg:"#fef2f2" };
            return (
              <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.5rem", marginTop:"1.5rem" }}>
                <h3 style={{ color:"#f1f5f9", fontSize:18, fontWeight:700, margin:"0 0 1rem" }}>Score Summary</h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:"1rem" }}>
                  {cats.map(cat => {
                    const vals = qs.filter(q=>q.cat===cat).map(q=>scores[q.id]).filter(Boolean);
                    const avg  = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
                    const info = getCatInfo(cat);
                    return (
                      <div key={cat} style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ color:info.color, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{info.tag}</div>
                        <div style={{ color:"#f1f5f9", fontSize:26, fontWeight:800 }}>{avg ?? "—"}<span style={{ color:"#475569", fontSize:13 }}>/4</span></div>
                        {avg && parseFloat(avg) < 2 && <div style={{ color:"#dc2626", fontSize:11, marginTop:2 }}>⚠ Below minimum</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:verdict.bg, border:`2px solid ${verdict.color}40`, borderRadius:12, padding:"1.25rem", textAlign:"center" }}>
                  <div style={{ fontSize:32, fontWeight:800, color:verdict.color }}>{overall}<span style={{ fontSize:16, color:"#94a3b8" }}>/4</span></div>
                  <div style={{ color:verdict.color, fontWeight:700, fontSize:13, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:4 }}>{verdict.text}</div>
                  <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>Minimum 3.0 overall · No category below 2.0</div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // ── THANK YOU ─────────────────────────────────────────────────────
  if (step === "thankyou") return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
      <div style={{ maxWidth:520, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:24 }}>✅</div>
        <h1 style={{ color:"#f1f5f9", fontSize:28, fontWeight:800, margin:"0 0 12px" }}>Thank You, {candidateName}!</h1>
        <p style={{ color:"#64748b", fontSize:16, lineHeight:1.7, margin:"0 0 24px" }}>
          Your answers have been submitted. Please share the link below with your interviewers.
        </p>
        {interviewerURL && (
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"1.5rem", textAlign:"left" }}>
            <div style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
              🔗 Interviewer Review Link
            </div>
            <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", marginBottom:12, wordBreak:"break-all" }}>
              <span style={{ color:"#64748b", fontSize:12, fontFamily:"monospace" }}>{interviewerURL}</span>
            </div>
            <button onClick={copyURL}
              style={{ width:"100%", padding:"11px", borderRadius:8, border:"none",
                background: copied ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#3b82f6,#2563eb)",
                color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700, transition:"all 0.2s" }}>
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
            <p style={{ color:"#475569", fontSize:12, margin:"12px 0 0", lineHeight:1.6 }}>
              Send this to all interviewers. Each person opens it in their own browser and scores independently.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ── SETUP ─────────────────────────────────────────────────────────
  if (step === "setup") {
    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:580 }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"6px 14px", marginBottom:16 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 6px #22c55e" }}></span>
              <span style={{ color:"#94a3b8", fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase" }}>Technical Interview</span>
            </div>
            <h1 style={{ color:"#f1f5f9", fontSize:26, fontWeight:800, margin:"0 0 8px" }}>Welcome</h1>
            <p style={{ color:"#64748b", fontSize:14, margin:0 }}>Please fill in your details to begin</p>
          </div>

          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"2rem", display:"flex", flexDirection:"column", gap:"1.5rem" }}>

            {/* Name */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Full Name *</label>
              <input placeholder="e.g. Alex Johnson" value={candidateName} onChange={e => setCandidateName(e.target.value)}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>

            {/* Years */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Years of Experience *</label>
              <input placeholder="e.g. 4" type="number" min="0" max="40" value={yearsExp} onChange={e => setYearsExp(e.target.value)}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>

            {/* Roles — multi-select */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
                Role * <span style={{ color:"#475569", fontWeight:400, textTransform:"none", fontSize:11 }}>(select one or both)</span>
              </label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {ALL_ROLES.map(r => {
                  const active = selectedRoles.includes(r.id);
                  return (
                    <button key={r.id} onClick={() => toggleRole(r.id)}
                      style={{ padding:"14px 10px", borderRadius:10,
                        border: active ? "2px solid #3b82f6" : "2px solid #334155",
                        background: active ? "#1d3a5e" : "#0f172a",
                        cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, textAlign:"center", position:"relative" }}>
                      {active && (
                        <span style={{ position:"absolute", top:8, right:8, background:"#3b82f6", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>✓</span>
                      )}
                      <span style={{ fontSize:24 }}>{r.icon}</span>
                      <span style={{ color: active ? "#e2e8f0" : "#94a3b8", fontWeight:700, fontSize:13 }}>{r.label}</span>
                      <span style={{ color:"#475569", fontSize:11 }}>{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platforms — multi-select, shown after role selected */}
            {visiblePlatforms.length > 0 && (
              <div>
                <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
                  Platform / Tool * <span style={{ color:"#475569", fontWeight:400, textTransform:"none", fontSize:11 }}>(select one or more)</span>
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {visiblePlatforms.map(p => {
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button key={p.id} onClick={() => togglePlatform(p.id)}
                        style={{ padding:"14px 8px", borderRadius:10,
                          border: active ? `2px solid ${p.color}` : "2px solid #334155",
                          background: active ? p.color+"18" : "#0f172a",
                          cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, position:"relative" }}>
                        {active && (
                          <span style={{ position:"absolute", top:6, right:6, background:p.color, color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>✓</span>
                        )}
                        <span style={{ fontSize:22 }}>{p.icon}</span>
                        <span style={{ color: active ? p.color : "#64748b", fontSize:11, fontWeight:600 }}>{p.id}</span>
                      </button>
                    );
                  })}
                </div>


              </div>
            )}

            {/* Band */}
            {selectedPlatforms.length > 0 && (
              <div>
                <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:10 }}>Experience Band *</label>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {BANDS.map(b => {
                    const active = band === b.id;
                    return (
                      <button key={b.id} onClick={() => setBand(b.id)}
                        style={{ padding:"12px 16px", borderRadius:10,
                          border: active ? `2px solid ${b.color}` : "2px solid #334155",
                          background:"#0f172a", cursor:"pointer",
                          display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                        <span style={{ fontSize:18 }}>{b.emoji}</span>
                        <span>
                          <span style={{ color: active ? b.color : "#64748b", fontWeight:700, fontSize:14 }}>{b.label}</span>
                          <span style={{ color:"#475569", marginLeft:8, fontSize:12 }}>{b.title}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Start */}
            <button onClick={handleStart} disabled={!canStart}
              style={{ padding:"14px", borderRadius:10, border:"none",
                background: canStart ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "#1e293b",
                color: canStart ? "#fff" : "#475569",
                cursor: canStart ? "pointer" : "not-allowed",
                fontSize:15, fontWeight:700,
                boxShadow: canStart ? "0 4px 20px rgba(59,130,246,0.3)" : "none",
                transition:"all 0.2s" }}>
              {canStart ? "Begin Interview →" : "Complete all fields above"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── INTERVIEW ─────────────────────────────────────────────────────
  const catInfo     = getCatInfo(currentQuestion?.cat);
  const allAnswered = questions.every(q => answers[q.id]?.trim());
  const platTag     = currentQuestion ? getPlatformForQuestion(currentQuestion.id, selectedPlatforms, band) : null;
  const platObj     = ALL_PLATFORMS.find(x => x.id === platTag);

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* Top bar */}
      <div style={{ background:"#1e293b", borderBottom:"1px solid #334155", padding:"1rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <span style={{ color:"#f1f5f9", fontWeight:700 }}>{candidateName}</span>
          <span style={{ color:"#475569" }}>·</span>
          <span style={{ color:"#64748b", fontSize:14 }}>{selectedBand?.title}</span>
          <span style={{ color:"#475569" }}>·</span>
          <div style={{ display:"flex", gap:4 }}>
            {selectedPlatforms.map(pid => {
              const p = ALL_PLATFORMS.find(x => x.id === pid);
              return (
                <span key={pid} style={{ background: p.color+"22", color: p.color, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:12 }}>
                  {p.icon} {pid}
                </span>
              );
            })}
          </div>
        </div>
        <span style={{ color:"#64748b", fontSize:13 }}>Q{currentQ+1} of {questions.length}</span>
      </div>

      {/* Progress */}
      <div style={{ height:3, background:"#1e293b" }}>
        <div style={{ height:"100%", background:"linear-gradient(90deg,#3b82f6,#8b5cf6)", width:`${(currentQ / questions.length) * 100}%`, transition:"width 0.3s" }} />
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"2rem" }}>

        {/* Category + platform badge */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:"1.25rem" }}>
          <span style={{ background: catInfo?.color+"22", color: catInfo?.color, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {catInfo?.tag}
          </span>
          {platObj && (
            <span style={{ background: platObj.color+"22", color: platObj.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>
              {platObj.icon} {platTag}
            </span>
          )}
          <span style={{ color:"#475569", fontSize:13 }}>Question {currentQ+1}</span>
        </div>

        {/* Question */}
        <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.75rem", marginBottom:"1.25rem" }}>
          <p style={{ color:"#e2e8f0", fontSize:18, lineHeight:1.7, margin:0, fontWeight:500 }}>{currentQuestion?.q}</p>
        </div>

        {/* Answer */}
        <div style={{ marginBottom:"1.5rem" }}>
          <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Your Answer</label>
          <textarea value={answers[currentQuestion?.id] || ""} onChange={e => setAnswers(p => ({ ...p, [currentQuestion.id]: e.target.value }))}
            placeholder="Type your answer here..." rows={6}
            style={{ width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"14px 16px",
              color:"#e2e8f0", fontSize:15, lineHeight:1.6, resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
        </div>

        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
          <button onClick={() => setCurrentQ(q => Math.max(0, q-1))} disabled={currentQ === 0}
            style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid #334155", background:"#1e293b",
              color: currentQ === 0 ? "#334155" : "#94a3b8", cursor: currentQ === 0 ? "not-allowed" : "pointer", fontSize:14, fontWeight:600 }}>
            ← Previous
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(q => q+1)}
              style={{ flex:1, padding:"12px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#3b82f6,#2563eb)",
                color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700, boxShadow:"0 4px 14px rgba(59,130,246,0.3)" }}>
              Next Question →
            </button>
          ) : (
            <button onClick={handleSubmit}
              style={{ flex:1, padding:"12px", borderRadius:10, border:"none",
                background: allAnswered ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#3b82f6,#2563eb)",
                color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700,
                boxShadow: `0 4px 14px ${allAnswered ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.3)"}` }}>
              {allAnswered ? "Submit Answers ✓" : "Submit Answers →"}
            </button>
          )}
        </div>

        {/* Dot nav */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:"1.5rem", flexWrap:"wrap" }}>
          {questions.map((q, i) => (
            <button key={q.id} onClick={() => setCurrentQ(i)}
              style={{ width:28, height:28, borderRadius:"50%",
                border: i === currentQ ? "2px solid #3b82f6" : "2px solid #334155",
                background: answers[q.id]?.trim() ? "#22c55e33" : (i === currentQ ? "#1d3a5e" : "#0f172a"),
                color: i === currentQ ? "#3b82f6" : answers[q.id]?.trim() ? "#22c55e" : "#475569",
                cursor:"pointer", fontSize:12, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
              {i+1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
