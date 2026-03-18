import { useState, useEffect } from "react";
import { QUESTION_BANK } from "./questions";

// ─── CONFIG ───────────────────────────────────────────────────────────
const ROLES = [
  { id: "engineer", label: "Data Engineer", icon: "⚙️", desc: "Azure · AWS · Snowflake · SQL · Python" },
  { id: "analyst",  label: "Data Analyst",  icon: "📊", desc: "Power BI · Tableau · Qlik Sense · SQL · Analytics" },
];
const PLATFORMS_ENG  = ["Azure", "AWS", "Snowflake"];
const TOOLS_ANALYST  = ["Power BI", "Tableau", "Qlik Sense"];
const PLATFORM_ICONS = { Azure:"☁️", AWS:"⚡", Snowflake:"❄️", "Power BI":"📊", Tableau:"📈", "Qlik Sense":"🔵" };

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

// ─── SESSION ENCODING ─────────────────────────────────────────────────
// Each candidate submission is encoded into a URL-safe base64 string.
// The interviewer link is: /app?interviewer=true&s=<encoded>
// This means every candidate gets their own unique link — no shared state,
// no overwriting, works for any number of simultaneous interviewers.

const encodeSession = (data) => {
  try {
    const json = JSON.stringify(data);
    // btoa needs ASCII — use encodeURIComponent to handle unicode names
    return btoa(encodeURIComponent(json));
  } catch(e) { return null; }
};

const decodeSession = (str) => {
  try {
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch(e) { return null; }
};

// Read ?s= param from current URL
const getSessionFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const s = params.get("s");
  return s ? decodeSession(s) : null;
};

// Build interviewer URL from encoded session data
const buildInterviewerURL = (data) => {
  const encoded = encodeSession(data);
  if (!encoded) return null;
  const base = window.location.origin + window.location.pathname;
  return `${base}?interviewer=true&s=${encoded}`;
};

// ─── QUESTION SELECTION ───────────────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const buildInterview = (role, platform, band) => {
  const platformBank = QUESTION_BANK[platform]?.[band] || [];
  const sqlGenBank   = QUESTION_BANK["SQL"]?.[band]    || [];

  let sqlPool, techPool, shPool;

  if (role === "engineer") {
    sqlPool  = shuffle(sqlGenBank);
    techPool = shuffle(platformBank.filter(q => q.cat === "Cloud" || q.cat === "Python"));
    shPool   = shuffle(platformBank.filter(q => q.cat === "Stakeholder"));
  } else {
    const platformSQL = platformBank.filter(q => q.cat === "SQL");
    sqlPool  = shuffle([...platformSQL, ...sqlGenBank]);
    techPool = shuffle(platformBank.filter(q => q.cat === "Tool" || q.cat === "Analytics"));
    shPool   = shuffle(platformBank.filter(q => q.cat === "Stakeholder"));
  }

  const picked = [
    ...sqlPool.slice(0, 2),
    ...techPool.slice(0, 4),
    ...shPool.slice(0, 2),
  ];

  if (picked.length < 8) {
    const usedIds = new Set(picked.map(q => String(q.id)));
    const spare   = shuffle([...sqlPool, ...techPool, ...shPool].filter(q => !usedIds.has(String(q.id))));
    while (picked.length < 8 && spare.length) picked.push(spare.shift());
  }

  return picked;
};

const getCatInfo = (role, cat) => role === "analyst" ? ANALYST_CATEGORIES[cat] : ENG_CATEGORIES[cat];

// ─── APP ──────────────────────────────────────────────────────────────
export default function App() {
  const params        = new URLSearchParams(window.location.search);
  const isInterviewer = params.get("interviewer") === "true";

  const [step,          setStep]          = useState("setup");
  const [role,          setRole]          = useState(null);
  const [platform,      setPlatform]      = useState(null);
  const [band,          setBand]          = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [yearsExp,      setYearsExp]      = useState("");
  const [questions,     setQuestions]     = useState([]);
  const [currentQ,      setCurrentQ]      = useState(0);
  const [answers,       setAnswers]       = useState({});
  const [scores,        setScores]        = useState({});
  const [session,       setSession]       = useState(null);
  const [interviewerURL,setInterviewerURL]= useState(null);
  const [copied,        setCopied]        = useState(false);

  // Interviewer: read session from URL param ?s=
  useEffect(() => {
    if (isInterviewer) {
      const s = getSessionFromURL();
      setSession(s);
    }
  }, [isInterviewer]);

  const selectedBand    = BANDS.find(b => b.id === band);
  const currentQuestion = questions[currentQ];

  const handleStart = () => {
    if (!role || !platform || !band || !candidateName.trim() || !yearsExp.trim()) return;
    setQuestions(buildInterview(role, platform, band));
    setStep("interview");
    setCurrentQ(0);
    setAnswers({});
  };

  const handleSubmit = () => {
    const sessionData = {
      candidateName, yearsExp, role, platform, band,
      questions, answers,
      submittedAt: new Date().toISOString(),
    };
    // Build the unique interviewer URL from this session's data
    const url = buildInterviewerURL(sessionData);
    setInterviewerURL(url);
    setStep("thankyou");
  };

  const copyURL = () => {
    if (!interviewerURL) return;
    navigator.clipboard.writeText(interviewerURL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── INTERVIEWER VIEW ──────────────────────────────────────────────
  if (isInterviewer) {
    if (!session) return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
          <h2 style={{ color:"#f1f5f9", fontSize:22, margin:"0 0 8px" }}>Invalid or Missing Link</h2>
          <p style={{ color:"#64748b", margin:0, fontSize:15, maxWidth:380 }}>
            This link does not contain a valid candidate submission.<br/>
            Please use the unique link generated after a candidate submits.
          </p>
        </div>
      </div>
    );

    const qs     = session.questions || [];
    const cats   = [...new Set(qs.map(q => q.cat))];
    const catMap = session.role === "analyst" ? ANALYST_CATEGORIES : ENG_CATEGORIES;

    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>

          {/* Candidate header */}
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:"#94a3b8", fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Interviewer Review</div>
                <h1 style={{ color:"#f1f5f9", fontSize:24, fontWeight:800, margin:"0 0 4px" }}>{session.candidateName}</h1>
                <div style={{ color:"#64748b", fontSize:14 }}>
                  {session.role === "analyst" ? "📊 Data Analyst" : "⚙️ Data Engineer"}
                  {" · "}{session.platform}
                  {" · "}{BANDS.find(b => b.id === session.band)?.title}
                  {session.yearsExp && <span> · {session.yearsExp} yrs exp</span>}
                </div>
                <div style={{ color:"#475569", fontSize:12, marginTop:4 }}>
                  Submitted: {new Date(session.submittedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:12, padding:"1rem 1.5rem", textAlign:"center" }}>
                <div style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Answered</div>
                <div style={{ color:"#f1f5f9", fontSize:32, fontWeight:800 }}>
                  {Object.keys(session.answers).length}
                  <span style={{ color:"#475569", fontSize:16 }}>/{qs.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div style={{ background:"#1e293b", borderLeft:"3px solid #f59e0b", borderRadius:"0 12px 12px 0", padding:"12px 16px", marginBottom:"1.5rem" }}>
            <p style={{ color:"#fcd34d", fontSize:13, margin:0 }}>
              📋 <strong>Interviewer Mode</strong> — Scores are local to your browser. Each interviewer scores independently using their own copy of this link.
            </p>
          </div>

          {/* Question cards */}
          {qs.map((q, i) => {
            const info   = catMap[q.cat] || { color:"#94a3b8", tag: q.cat };
            const answer = session.answers[q.id];
            return (
              <div key={q.id} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"1.25rem", marginBottom:"1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ marginBottom:8 }}>
                      <span style={{ background:info.color+"22", color:info.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.06em", marginRight:8 }}>
                        {info.tag}
                      </span>
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
                  {/* Score buttons — local to each interviewer's browser */}
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
                    const info = catMap[cat] || { color:"#94a3b8", tag: cat };
                    return (
                      <div key={cat} style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ color:info.color, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{info.tag}</div>
                        <div style={{ color:"#f1f5f9", fontSize:26, fontWeight:800 }}>
                          {avg ?? "—"}<span style={{ color:"#475569", fontSize:13 }}>/4</span>
                        </div>
                        {avg && parseFloat(avg) < 2 && <div style={{ color:"#dc2626", fontSize:11, marginTop:2 }}>⚠ Below minimum</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:verdict.bg, border:`2px solid ${verdict.color}40`, borderRadius:12, padding:"1.25rem", textAlign:"center" }}>
                  <div style={{ fontSize:32, fontWeight:800, color:verdict.color }}>
                    {overall}<span style={{ fontSize:16, color:"#94a3b8" }}>/4</span>
                  </div>
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
        <h1 style={{ color:"#f1f5f9", fontSize:28, fontWeight:800, margin:"0 0 12px" }}>
          Thank You, {candidateName}!
        </h1>
        <p style={{ color:"#64748b", fontSize:16, lineHeight:1.7, margin:"0 0 24px" }}>
          Your answers have been submitted. Please share the link below with your interviewer(s) — each one can open it independently to review and score your responses.
        </p>

        {/* Interviewer link box */}
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
              {copied ? "✓ Copied to clipboard!" : "Copy Link"}
            </button>
            <p style={{ color:"#475569", fontSize:12, margin:"12px 0 0", lineHeight:1.6 }}>
              Send this link to all interviewers. Each interviewer opens it in their own browser and scores independently — no login required, no data shared between them.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ── SETUP ─────────────────────────────────────────────────────────
  if (step === "setup") {
    const platformOptions = role === "analyst" ? TOOLS_ANALYST : PLATFORMS_ENG;
    const canStart = role && platform && band && candidateName.trim() && yearsExp.trim();

    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:540 }}>
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"6px 14px", marginBottom:16 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 6px #22c55e" }}></span>
              <span style={{ color:"#94a3b8", fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase" }}>Technical Interview</span>
            </div>
            <h1 style={{ color:"#f1f5f9", fontSize:26, fontWeight:800, margin:"0 0 8px" }}>Welcome</h1>
            <p style={{ color:"#64748b", fontSize:14, margin:0 }}>Please fill in your details to begin</p>
          </div>

          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"2rem", display:"flex", flexDirection:"column", gap:"1.5rem" }}>
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Full Name *</label>
              <input placeholder="e.g. Alex Johnson" value={candidateName} onChange={e => setCandidateName(e.target.value)}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>

            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Years of Experience *</label>
              <input placeholder="e.g. 4" type="number" min="0" max="40" value={yearsExp} onChange={e => setYearsExp(e.target.value)}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>

            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:10 }}>Role *</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {ROLES.map(r => {
                  const active = role === r.id;
                  return (
                    <button key={r.id} onClick={() => { setRole(r.id); setPlatform(null); }}
                      style={{ padding:"14px 10px", borderRadius:10,
                        border: active ? "2px solid #3b82f6" : "2px solid #334155",
                        background: active ? "#1d3a5e" : "#0f172a",
                        cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, textAlign:"center" }}>
                      <span style={{ fontSize:24 }}>{r.icon}</span>
                      <span style={{ color: active ? "#e2e8f0" : "#94a3b8", fontWeight:700, fontSize:13 }}>{r.label}</span>
                      <span style={{ color:"#475569", fontSize:11 }}>{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {role && (
              <div>
                <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:10 }}>
                  {role === "analyst" ? "Analytics Tool *" : "Cloud Platform *"}
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  {platformOptions.map(p => {
                    const active = platform === p;
                    return (
                      <button key={p} onClick={() => setPlatform(p)}
                        style={{ padding:"14px 8px", borderRadius:10,
                          border: active ? "2px solid #3b82f6" : "2px solid #334155",
                          background: active ? "#1d3a5e" : "#0f172a",
                          cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:22 }}>{PLATFORM_ICONS[p]}</span>
                        <span style={{ color: active ? "#93c5fd" : "#64748b", fontSize:11, fontWeight:600 }}>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {role && platform && (
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
  const catInfo     = getCatInfo(role, currentQuestion?.cat);
  const allAnswered = questions.every(q => answers[q.id]?.trim());

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* Top bar */}
      <div style={{ background:"#1e293b", borderBottom:"1px solid #334155", padding:"1rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <span style={{ color:"#f1f5f9", fontWeight:700 }}>{candidateName}</span>
          <span style={{ color:"#475569", margin:"0 8px" }}>·</span>
          <span style={{ color:"#64748b", fontSize:14 }}>{platform} · {selectedBand?.title}</span>
        </div>
        <span style={{ color:"#64748b", fontSize:13 }}>Q{currentQ+1} of {questions.length}</span>
      </div>

      {/* Progress */}
      <div style={{ height:3, background:"#1e293b" }}>
        <div style={{ height:"100%", background:"linear-gradient(90deg,#3b82f6,#8b5cf6)", width:`${(currentQ / questions.length) * 100}%`, transition:"width 0.3s" }} />
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"2rem" }}>
        <div style={{ marginBottom:"1.25rem" }}>
          <span style={{ background: catInfo?.color+"22", color: catInfo?.color, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {catInfo?.tag}
          </span>
          <span style={{ color:"#475569", fontSize:13, marginLeft:10 }}>Question {currentQ+1}</span>
        </div>

        <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.75rem", marginBottom:"1.25rem" }}>
          <p style={{ color:"#e2e8f0", fontSize:18, lineHeight:1.7, margin:0, fontWeight:500 }}>{currentQuestion?.q}</p>
        </div>

        <div style={{ marginBottom:"1.5rem" }}>
          <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Your Answer</label>
          <textarea
            value={answers[currentQuestion?.id] || ""}
            onChange={e => setAnswers(p => ({ ...p, [currentQuestion.id]: e.target.value }))}
            placeholder="Type your answer here..."
            rows={6}
            style={{ width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"14px 16px",
              color:"#e2e8f0", fontSize:15, lineHeight:1.6, resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
          <button onClick={() => setCurrentQ(q => Math.max(0, q-1))} disabled={currentQ === 0}
            style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid #334155", background:"#1e293b",
              color: currentQ === 0 ? "#334155" : "#94a3b8",
              cursor: currentQ === 0 ? "not-allowed" : "pointer", fontSize:14, fontWeight:600 }}>
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
