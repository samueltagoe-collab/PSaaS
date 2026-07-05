import { useState, useEffect, useCallback } from "react";
import {
  PenTool, HardHat, Lightbulb, Plus, ArrowRight, CheckCircle2, Circle,
  Search, Send, Clock, Wallet, ChevronLeft, Stamp as StampIcon, X
} from "lucide-react";

const STAGES = ["submitted", "reviewing", "matched", "planning", "execution", "delivered"];
const STAGE_LABEL = {
  submitted: "Filed", reviewing: "Reviewing Proposals", matched: "Matched",
  planning: "Planning", execution: "In Execution", delivered: "Delivered",
};
const STAGE_TONE = {
  submitted: "amber", reviewing: "amber", matched: "cyan",
  planning: "cyan", execution: "cyan", delivered: "green",
};
const CATEGORIES = ["Fintech", "Health", "Education", "Agritech", "Logistics", "Retail", "Other"];

const genId = () => Math.random().toString(36).slice(2, 9);
const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtGHS = (n) => `GH₵${Number(n).toLocaleString()}`;

const SEED_IDEAS = [
  {
    id: "a1b2c3", title: "Trotro Route Finder", category: "Logistics",
    description: "An app that shows commuters the fastest trotro routes and live fare estimates between any two stations in Accra.",
    budgetMin: 8000, budgetMax: 15000, timelineWeeks: 6,
    ownerName: "Ama Boateng", status: "reviewing", createdAt: Date.now() - 86400000 * 4,
    proposals: [{ id: genId(), proName: "Kwame Asante", message: "I've built two mapping apps before. I'd start with a route-data audit of GPRTU stations.", timelineWeeks: 7, createdAt: Date.now() - 86400000 * 2 }],
    assignedPro: null, milestones: [],
  },
  {
    id: "d4e5f6", title: "ShopKeeper Ledger", category: "Retail",
    description: "A simple stock and debt ledger for market traders who currently track everything in exercise books.",
    budgetMin: 5000, budgetMax: 9000, timelineWeeks: 4,
    ownerName: "Yaw Mensah", status: "execution", createdAt: Date.now() - 86400000 * 20,
    proposals: [{ id: genId(), proName: "Efua Owusu", message: "Offline-first, syncs when there's data. I've shipped this pattern for two other clients.", timelineWeeks: 5, createdAt: Date.now() - 86400000 * 18 }],
    assignedPro: "Efua Owusu",
    milestones: [
      { id: genId(), title: "Wireframes signed off", done: true },
      { id: genId(), title: "Offline ledger core built", done: true },
      { id: genId(), title: "Sync engine", done: false },
    ],
  },
];

function useBoard() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("ideas-board", true);
        setIdeas(res && res.value ? JSON.parse(res.value) : SEED_IDEAS);
      } catch {
        setIdeas(SEED_IDEAS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setIdeas(next);
    try {
      const ok = await window.storage.set("ideas-board", JSON.stringify(next), true);
      if (!ok) setError("Couldn't save to the shared board. Your change is visible locally only.");
    } catch {
      setError("Couldn't save to the shared board. Your change is visible locally only.");
    }
  }, []);

  return { ideas, persist, loading, error, setError };
}

function Stamp({ tone, children, size = "md" }) {
  const colors = {
    amber: "border-amber-400 text-amber-300",
    cyan: "border-cyan-300 text-cyan-200",
    green: "border-emerald-400 text-emerald-300",
  };
  return (
    <span
      className={`inline-block border-2 border-dashed rounded-sm uppercase font-mono tracking-widest ${colors[tone]} ${size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[11px] px-2 py-1"}`}
      style={{ transform: "rotate(-3deg)" }}
    >
      {children}
    </span>
  );
}

function TitleBlock({ idea }) {
  return (
    <div className="border border-cyan-900/60 bg-[#0B1830] font-mono text-[10px] text-slate-400 grid grid-cols-3 divide-x divide-cyan-900/60">
      <div className="px-2 py-1.5">
        <div className="text-slate-500">NO.</div>
        <div className="text-cyan-200">{idea.id.toUpperCase()}</div>
      </div>
      <div className="px-2 py-1.5">
        <div className="text-slate-500">FILED BY</div>
        <div className="text-cyan-200 truncate">{idea.ownerName}</div>
      </div>
      <div className="px-2 py-1.5">
        <div className="text-slate-500">DATE</div>
        <div className="text-cyan-200">{fmtDate(idea.createdAt)}</div>
      </div>
    </div>
  );
}

function Pipeline({ status }) {
  const idx = STAGES.indexOf(status);
  return (
    <div className="flex items-center w-full overflow-x-auto py-2">
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center flex-1 min-w-[86px]">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            {i <= idx ? (
              <CheckCircle2 size={18} className={i === idx ? "text-amber-300" : "text-cyan-300"} />
            ) : (
              <Circle size={18} className="text-slate-600" />
            )}
            <span className={`text-[9px] font-mono uppercase tracking-wide text-center ${i <= idx ? "text-slate-200" : "text-slate-600"}`}>
              {STAGE_LABEL[s]}
            </span>
          </div>
          {i < STAGES.length - 1 && (
            <div className={`h-px flex-1 mx-1 ${i < idx ? "bg-cyan-500" : "bg-slate-700"}`} style={{ borderTop: i < idx ? "none" : "1px dashed #475569" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function IdeaCard({ idea, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="text-left bg-[#0F1F38] border border-cyan-900/50 hover:border-cyan-500/70 transition-colors rounded-sm overflow-hidden group"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors leading-snug">{idea.title}</h3>
          <Stamp tone={STAGE_TONE[idea.status]} size="sm">{STAGE_LABEL[idea.status]}</Stamp>
        </div>
        <p className="text-sm text-slate-400 line-clamp-2">{idea.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1"><Wallet size={12} />{fmtGHS(idea.budgetMin)}–{fmtGHS(idea.budgetMax)}</span>
          <span className="flex items-center gap-1"><Clock size={12} />{idea.timelineWeeks}w</span>
          <span className="text-cyan-400">{idea.category}</span>
        </div>
        {idea.proposals.length > 0 && idea.status !== "delivered" && (
          <div className="text-[11px] text-amber-300/80 font-mono">{idea.proposals.length} proposal{idea.proposals.length > 1 ? "s" : ""} submitted</div>
        )}
      </div>
      <TitleBlock idea={idea} />
    </button>
  );
}

function Onboarding({ initial, onSave, onClose, closable }) {
  const [name, setName] = useState(initial?.name || "");
  const [role, setRole] = useState(initial?.role || "owner");

  return (
    <div className="fixed inset-0 bg-[#060D1A]/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F1F38] border border-cyan-800/60 rounded-sm max-w-md w-full p-6 relative">
        {closable && (
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"><X size={18} /></button>
        )}
        <div className="flex items-center gap-2 mb-1 text-cyan-300">
          <PenTool size={20} />
          <span className="font-mono text-xs tracking-[0.2em] uppercase">Public/SaaS</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-100 mb-1">Sign in to the workshop</h2>
        <p className="text-sm text-slate-400 mb-5">Your name shows on ideas you file and proposals you send. Anyone on this board can see it.</p>
        <label className="block text-xs font-mono uppercase tracking-wide text-slate-400 mb-1">Your name</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sammy Odame"
          className="w-full bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 mb-4 focus:outline-none focus:border-cyan-400"
        />
        <label className="block text-xs font-mono uppercase tracking-wide text-slate-400 mb-2">I'm here mainly as a...</label>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setRole("owner")}
            className={`flex flex-col items-center gap-2 border rounded-sm py-3 px-2 transition-colors ${role === "owner" ? "border-amber-400 bg-amber-400/10 text-amber-200" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
          >
            <Lightbulb size={20} /><span className="text-xs font-medium">Idea Owner</span>
          </button>
          <button
            onClick={() => setRole("pro")}
            className={`flex flex-col items-center gap-2 border rounded-sm py-3 px-2 transition-colors ${role === "pro" ? "border-cyan-400 bg-cyan-400/10 text-cyan-200" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
          >
            <HardHat size={20} /><span className="text-xs font-medium">IT Professional</span>
          </button>
        </div>
        <button
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), role })}
          className="w-full bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-[#0B1830] font-semibold rounded-sm py-2.5 flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors"
        >
          Enter the workshop <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function SubmitForm({ user, onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [timelineWeeks, setTimelineWeeks] = useState("");

  const valid = title.trim() && description.trim() && budgetMin && budgetMax && timelineWeeks;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onCancel} className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm mb-4"><ChevronLeft size={16} />Back to board</button>
      <div className="flex items-center gap-2 text-amber-300 mb-1"><Lightbulb size={18} /><span className="font-mono text-xs uppercase tracking-widest">File a new idea</span></div>
      <h1 className="text-2xl font-semibold text-slate-100 mb-6">Describe the SaaS you've been pondering</h1>

      <div className="space-y-4 bg-[#0F1F38] border border-cyan-900/50 rounded-sm p-5">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-slate-400 mb-1">Idea title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Clinic Queue Manager"
            className="w-full bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400" />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-slate-400 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-slate-400 mb-1">What should it do, and who is it for?</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Be specific about the problem and who feels it most."
            className="w-full bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate-400 mb-1">Budget min (GH₵)</label>
            <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)}
              className="w-full bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate-400 mb-1">Budget max (GH₵)</label>
            <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate-400 mb-1">Timeline (weeks)</label>
            <input type="number" value={timelineWeeks} onChange={(e) => setTimelineWeeks(e.target.value)}
              className="w-full bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400" />
          </div>
        </div>
        <button
          disabled={!valid}
          onClick={() => onCreate({
            id: genId(), title: title.trim(), category, description: description.trim(),
            budgetMin: Number(budgetMin), budgetMax: Number(budgetMax), timelineWeeks: Number(timelineWeeks),
            ownerName: user.name, status: "submitted", createdAt: Date.now(),
            proposals: [], assignedPro: null, milestones: [],
          })}
          className="w-full bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-[#0B1830] font-semibold rounded-sm py-2.5 flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors"
        >
          File this idea <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function IdeaDetail({ idea, user, onBack, onUpdate }) {
  const [proposalMsg, setProposalMsg] = useState("");
  const [proposalWeeks, setProposalWeeks] = useState("");
  const [milestoneTitle, setMilestoneTitle] = useState("");

  const isOwner = idea.ownerName.toLowerCase() === user.name.toLowerCase();
  const isAssignedPro = idea.assignedPro && idea.assignedPro.toLowerCase() === user.name.toLowerCase();
  const hasProposed = idea.proposals.some((p) => p.proName.toLowerCase() === user.name.toLowerCase());

  const update = (patch) => onUpdate({ ...idea, ...patch });

  const submitProposal = () => {
    if (!proposalMsg.trim() || !proposalWeeks) return;
    const proposal = { id: genId(), proName: user.name, message: proposalMsg.trim(), timelineWeeks: Number(proposalWeeks), createdAt: Date.now() };
    update({ proposals: [...idea.proposals, proposal], status: idea.status === "submitted" ? "reviewing" : idea.status });
    setProposalMsg(""); setProposalWeeks("");
  };

  const acceptProposal = (proName) => {
    update({ assignedPro: proName, status: "matched" });
  };

  const advance = () => {
    const order = ["matched", "planning", "execution", "delivered"];
    const i = order.indexOf(idea.status);
    if (i >= 0 && i < order.length - 1) update({ status: order[i + 1] });
  };

  const addMilestone = () => {
    if (!milestoneTitle.trim()) return;
    update({ milestones: [...idea.milestones, { id: genId(), title: milestoneTitle.trim(), done: false }] });
    setMilestoneTitle("");
  };

  const toggleMilestone = (id) => {
    update({ milestones: idea.milestones.map((m) => m.id === id ? { ...m, done: !m.done } : m) });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm mb-4"><ChevronLeft size={16} />Back to board</button>

      <div className="flex items-start justify-between gap-3 mb-2">
        <h1 className="text-2xl font-semibold text-slate-100">{idea.title}</h1>
        <Stamp tone={STAGE_TONE[idea.status]}>{STAGE_LABEL[idea.status]}</Stamp>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-slate-400 font-mono mb-4">
        <span className="flex items-center gap-1"><Wallet size={13} />{fmtGHS(idea.budgetMin)}–{fmtGHS(idea.budgetMax)}</span>
        <span className="flex items-center gap-1"><Clock size={13} />{idea.timelineWeeks} weeks requested</span>
        <span className="text-cyan-400">{idea.category}</span>
      </div>

      <TitleBlock idea={idea} />

      <div className="bg-[#0F1F38] border border-cyan-900/50 border-t-0 rounded-b-sm p-5 space-y-6">
        <Pipeline status={idea.status} />
        <p className="text-slate-300 leading-relaxed">{idea.description}</p>

        {idea.assignedPro && (
          <div className="text-sm text-cyan-200 font-mono">Building this: <span className="text-cyan-300">{idea.assignedPro}</span></div>
        )}

        {(idea.status === "submitted" || idea.status === "reviewing") && (
          <div className="border-t border-cyan-900/50 pt-5">
            <h3 className="text-sm font-mono uppercase tracking-wide text-slate-400 mb-3">Proposals ({idea.proposals.length})</h3>
            <div className="space-y-3 mb-4">
              {idea.proposals.map((p) => (
                <div key={p.id} className="bg-[#0B1830] border border-slate-700 rounded-sm p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-100 font-medium text-sm">{p.proName}</span>
                    <span className="text-xs text-slate-500 font-mono">{p.timelineWeeks}w proposed</span>
                  </div>
                  <p className="text-sm text-slate-400">{p.message}</p>
                  {isOwner && (
                    <button onClick={() => acceptProposal(p.proName)}
                      className="mt-2 text-xs bg-amber-400 text-[#0B1830] font-semibold rounded-sm px-3 py-1.5 hover:bg-amber-300">
                      Accept & assign
                    </button>
                  )}
                </div>
              ))}
              {idea.proposals.length === 0 && <p className="text-sm text-slate-500">No proposals yet.</p>}
            </div>
            {!isOwner && !hasProposed && (
              <div className="space-y-2">
                <textarea value={proposalMsg} onChange={(e) => setProposalMsg(e.target.value)} rows={3}
                  placeholder="How would you approach this, and why?"
                  className="w-full bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-400" />
                <div className="flex gap-2">
                  <input type="number" value={proposalWeeks} onChange={(e) => setProposalWeeks(e.target.value)} placeholder="Weeks"
                    className="w-24 bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-400" />
                  <button onClick={submitProposal} disabled={!proposalMsg.trim() || !proposalWeeks}
                    className="flex-1 bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-[#0B1830] font-semibold rounded-sm px-3 py-2 text-sm hover:bg-cyan-300">
                    Submit proposal
                  </button>
                </div>
              </div>
            )}
            {hasProposed && <p className="text-sm text-cyan-300 font-mono">Your proposal is in.</p>}
          </div>
        )}

        {["matched", "planning", "execution", "delivered"].includes(idea.status) && (
          <div className="border-t border-cyan-900/50 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono uppercase tracking-wide text-slate-400">Milestones</h3>
              {isAssignedPro && idea.status !== "delivered" && (
                <button onClick={advance} className="text-xs bg-cyan-400 text-[#0B1830] font-semibold rounded-sm px-3 py-1.5 hover:bg-cyan-300">
                  {idea.status === "matched" ? "Start planning" : idea.status === "planning" ? "Begin execution" : "Mark delivered"}
                </button>
              )}
            </div>
            <div className="space-y-2 mb-3">
              {idea.milestones.map((m) => (
                <label key={m.id} className={`flex items-center gap-2 text-sm ${isAssignedPro ? "cursor-pointer" : ""}`}>
                  <input type="checkbox" checked={m.done} disabled={!isAssignedPro} onChange={() => toggleMilestone(m.id)}
                    className="accent-cyan-400" />
                  <span className={m.done ? "text-slate-500 line-through" : "text-slate-200"}>{m.title}</span>
                </label>
              ))}
              {idea.milestones.length === 0 && <p className="text-sm text-slate-500">No milestones logged yet.</p>}
            </div>
            {isAssignedPro && (
              <div className="flex gap-2">
                <input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} placeholder="Add a milestone"
                  className="flex-1 bg-[#0B1830] border border-slate-700 rounded-sm px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-400" />
                <button onClick={addMilestone} className="bg-slate-700 text-slate-200 rounded-sm px-3 hover:bg-slate-600"><Plus size={16} /></button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard({ ideas, user, onOpen }) {
  const filed = ideas.filter((i) => i.ownerName.toLowerCase() === user.name.toLowerCase());
  const building = ideas.filter((i) => i.assignedPro && i.assignedPro.toLowerCase() === user.name.toLowerCase());
  const proposed = ideas.filter((i) =>
    i.proposals.some((p) => p.proName.toLowerCase() === user.name.toLowerCase()) &&
    (!i.assignedPro || i.assignedPro.toLowerCase() !== user.name.toLowerCase())
  );

  const Section = ({ title, list, empty }) => (
    <div className="mb-8">
      <h2 className="text-sm font-mono uppercase tracking-wide text-slate-400 mb-3">{title}</h2>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((idea) => <IdeaCard key={idea.id} idea={idea} onOpen={() => onOpen(idea.id)} />)}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-100 mb-6">Your desk, {user.name.split(" ")[0]}</h1>
      <Section title="Ideas you've filed" list={filed} empty="You haven't filed an idea yet." />
      <Section title="Projects you're building" list={building} empty="Nothing assigned to you yet." />
      <Section title="Proposals awaiting a decision" list={proposed} empty="No open proposals." />
    </div>
  );
}

export default function App() {
  const { ideas, persist, loading, error } = useBoard();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(false);
  const [view, setView] = useState("board");
  const [activeId, setActiveId] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("current-user", false);
        if (res && res.value) setUser(JSON.parse(res.value));
      } catch {
        // no stored user yet
      } finally {
        setUserLoading(false);
      }
    })();
  }, []);

  const saveUser = async (u) => {
    setUser(u);
    setEditingUser(false);
    try { await window.storage.set("current-user", JSON.stringify(u), false); } catch { /* session-only fallback */ }
  };

  const updateIdea = (updated) => persist(ideas.map((i) => (i.id === updated.id ? updated : i)));
  const createIdea = (idea) => { persist([idea, ...ideas]); setActiveId(idea.id); setView("detail"); };

  const filtered = ideas.filter((i) =>
    (category === "All" || i.category === category) &&
    (i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()))
  );
  const active = ideas.find((i) => i.id === activeId);

  return (
    <div
      className="min-h-screen text-slate-200"
      style={{
        background: "#0B1830",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(94,200,216,0.06) 0px, rgba(94,200,216,0.06) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(94,200,216,0.06) 0px, rgba(94,200,216,0.06) 1px, transparent 1px, transparent 28px)",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {!userLoading && !user && <Onboarding onSave={saveUser} closable={false} />}
      {editingUser && user && <Onboarding initial={user} onSave={saveUser} onClose={() => setEditingUser(false)} closable={true} />}

      <header className="border-b border-cyan-900/50 sticky top-0 bg-[#0B1830]/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-cyan-300 flex-shrink-0">
            <PenTool size={20} />
            <span className="font-mono text-xs sm:text-sm tracking-[0.15em] uppercase">Public/SaaS</span>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <button onClick={() => setView("board")} className={`px-3 py-1.5 rounded-sm ${view === "board" ? "bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:text-slate-200"}`}>Board</button>
            <button onClick={() => setView("submit")} className={`px-3 py-1.5 rounded-sm ${view === "submit" ? "bg-amber-400/10 text-amber-200" : "text-slate-400 hover:text-slate-200"}`}>File an idea</button>
            <button onClick={() => setView("dashboard")} className={`px-3 py-1.5 rounded-sm ${view === "dashboard" ? "bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:text-slate-200"}`}>My desk</button>
          </nav>
          {user && (
            <button onClick={() => setEditingUser(true)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono flex-shrink-0">
              {user.role === "owner" ? <Lightbulb size={14} /> : <HardHat size={14} />}
              {user.name}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && <div className="max-w-3xl mx-auto mb-4 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-sm px-3 py-2">{error}</div>}

        {loading ? (
          <p className="text-center text-slate-500 text-sm py-20 font-mono">Loading the workshop…</p>
        ) : !user ? null : view === "submit" ? (
          <SubmitForm user={user} onCreate={createIdea} onCancel={() => setView("board")} />
        ) : view === "dashboard" ? (
          <Dashboard ideas={ideas} user={user} onOpen={(id) => { setActiveId(id); setView("detail"); }} />
        ) : view === "detail" && active ? (
          <IdeaDetail idea={active} user={user} onBack={() => setView("board")} onUpdate={updateIdea} />
        ) : (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-100 mb-1">The board</h1>
              <p className="text-slate-400 text-sm">Ideas people have filed, and the IT professionals turning them into something real.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ideas..."
                  className="w-full bg-[#0F1F38] border border-slate-700 rounded-sm pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="bg-[#0F1F38] border border-slate-700 rounded-sm px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400">
                <option>All</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => setView("submit")} className="flex items-center justify-center gap-1.5 bg-amber-400 text-[#0B1830] font-semibold rounded-sm px-4 py-2 text-sm hover:bg-amber-300 flex-shrink-0">
                <Plus size={16} />File an idea
              </button>
            </div>
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-16">No ideas match yet. Be the first to file one.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map((idea) => <IdeaCard key={idea.id} idea={idea} onOpen={() => { setActiveId(idea.id); setView("detail"); }} />)}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
