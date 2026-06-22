import { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const T = {
  navy:"#1B2A4A", navyL:"#2D4373", red:"#D52B1E",
  blue:"#1A6FB5", blueL:"#DBEAFE", bluePale:"#EFF6FF",
  teal:"#0F7B6C", tealL:"#CCFBF1",
  orange:"#C65D07", orangeL:"#FED7AA",
  green:"#1D7324", greenL:"#DCFCE7",
  purple:"#7C3AED", purpleL:"#E9D5FF",
  slate:"#334155", dark:"#1E293B", mid:"#64748B",
  light:"#E2E8F0", off:"#F8FAFC", bg:"#F1F5F9", white:"#FFFFFF",
};

const TA_COLORS = { Oncology:T.green, NeuroPain:T.red, ImmCV:T.blue, Diabetes:T.orange };
const MODALITY_BG = { "small-molecule":"#ECE3F5", peptide:"#D9EBF7", oligonucleotide:"#FFDDD2", adc:"#FFF3CD" };
const STATUS_STYLE = {
  "POC":           { bg:"#DBEAFE", color:T.blue },
  "Campaign Lead": { bg:T.greenL,  color:T.green },
  "Not pursued":   { bg:T.light,   color:T.mid },
  "Dropped":       { bg:"#FEE2E2", color:T.red },
};

// ── seed data ─────────────────────────────────────────────────────────────────
const SEED = [
  {
    id:"LY4064809", lsn:"STX-478", name:"Tersolisib", ta:"Oncology", modality:"small-molecule",
    characteristics:"PI3Kα mutant-selective inhibitor. Peak demand projected at 10 MT/year. CT design ongoing.",
    sessions:[{
      id:"DD-2026-02", date:"2026-02-20",
      objective:"Identify alternative RSM synthesis routes addressing current operational issues: high temps, low yields, undesirable solvents (DMF), Cl substitution impurity.",
      pptRef:"Tersolisib_STX-478_RSM_design_day_challenge.pptx",
      pptLink:"https://lilly.sharepoint.com/sites/SMDD/Design_Days/Tersolisib_STX-478_RSM_design_day_challenge.pptx",
      currentRoute:{
        description:"Friedel-Crafts acylation (Fries rearrangement) → Ring closing in DMF/AcOH at high temperature",
        challenges:["High temperatures","Low yields for 2 steps","Slow reactions","DMF at high temp in presence of acid/base","Fries rearrangement gives Cl substitution impurity — cannot be purged"],
        priorities:["Solvents/reagents with better safety profile","Improved cycle time","Avoid Cl substitution"],
      },
      history:[
        { name:"Acylation screen", outcome:"Friedel-Crafts works but no advantage except cycle time. TfOH gave ~88% conversion (not reproducible). Zn/Ti salts, BBr3, FeCl3, TFA all tried." },
        { name:"Ring-closing attempts", outcome:"DMF critical for solubility but decomposes at high temp. Dimethylamine byproduct via iminium may enable reactivity. Without DMF — major side product." },
        { name:"WuXi routes", outcome:"Similar to CatSci Route 2. Evaluated but not advanced." },
        { name:"Bioduro route", outcome:"Evaluated, details in supplemental slides." },
      ],
      proposals:[
        { id:"P-001", proposedBy:"CatSci", date:"2026-02-20", title:"CatSci Route 1 – Base/Acid Solvent Screening", pros:"Avoids current intermediates. Initial POC close to literature conditions.", cons:"Will still require concentrated reagents/neat reactions and extreme temperatures.", killerExperiments:"Base/solvent screening Step 1; Acid/solvent screening Step 2; Partial reduction feasibility.", reference:"Internal CatSci report Feb 2026", slideLink:"slide_6", status:"POC", ptsScore:"High", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-002", proposedBy:"CatSci", date:"2026-02-20", title:"CatSci Route 2 – Vilsmeier-Haack Optimisation", pros:"Structured 3-step sequence using current SM.", cons:"Requires Vilsmeier-Haack optimisation. Extreme conditions remain.", killerExperiments:"Acid/solvent screening; Vilsmeier-Haack optimisation for Step 3.", reference:"Internal CatSci report Feb 2026", slideLink:"slide_6", status:"POC", ptsScore:"High", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-003", proposedBy:"CatSci", date:"2026-02-20", title:"CatSci Route 3 – Lower PTS Halogenated SM", pros:"Commercial SM (Hal=F: $195/500g, Hal=Br: $131/500g). Avoids Fries entirely.", cons:"Lower PTS score. Multiple steps (4,5) still require screening.", killerExperiments:"Oxime selection and method; Acid/solvent screening Steps 4,5.", reference:"", slideLink:"slide_7", status:"Not pursued", ptsScore:"Low", outcomeSummary:"Deprioritised due to low PTS score.", campaignReportLink:"" },
        { id:"P-004", proposedBy:"Alex Harmata", date:"2026-02-20", title:"Aromatic bromination + Metal/X exchange + acetylation", pros:"Uses current SMs. High likelihood of technical success. Avoids true cryogenic conditions via Grignard.", cons:"Retains SN2 step with toxic electrophile. Generates halogenated organic waste.", killerExperiments:"Find conditions to maximise acetylation yield. Grignard with Ac₂O at −10°C.", reference:"", slideLink:"slide_15", status:"POC", ptsScore:"Medium", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-005", proposedBy:"Samrat Sahu", date:"2026-02-05", title:"Pd-cat. Intramolecular Cyclization to Benzofuran", pros:"No Fries/acid-cat cyclization. 2-step access to –CF₃ derivative. Both SMs inexpensive.", cons:"Pd impurity purging required. Safety profile of CaC₂ at high temp.", killerExperiments:"Will cyclization work for direct aldehyde? Scalability of cyclization step.", reference:"DFT analysis Feb 2026", slideLink:"slide_32", status:"POC", ptsScore:"Medium", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-006", proposedBy:"Samrat Sahu", date:"2026-02-04", title:"Benzofuran via Base-mediated Cyclization (Stille)", pros:"Replacing Fries with Stille coupling. 3-step LLS. Last step tested at WuXi.", cons:"Scalability of Stille coupling.", killerExperiments:"Stille coupling of electron-deficient ring. Try –I instead of –Br.", reference:"Nova et al. JACS 2006", slideLink:"slide_34", status:"POC", ptsScore:"Medium", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-007", proposedBy:"Samrat Sahu", date:"2026-02-05", title:"Benzofuran via Cu-cat. Alkynylation & Alkyl-Suzuki", pros:"Cu-cat alkynylation/Pd-cat cyclization removes Fries.", cons:"5-step LLS. Mostly linear sequence.", killerExperiments:"Feasibility of the Alkyl Suzuki coupling.", reference:"", slideLink:"slide_36", status:"Not pursued", ptsScore:"Low", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-008", proposedBy:"Stan Kolis / Reaxys", date:"2026-02-06", title:"Sonagashira / Alkyne Hydrolysis (alt. Fries)", pros:"Known/executed chemistry. Precedented in literature.", cons:"Discovery scale only. Long reaction times (48h). Harsh conditions.", killerExperiments:"Get bromo arene to work. Can reaction times be reduced?", reference:"ScienceDirect polyfluorinated o-hydroxyacetophenones", slideLink:"slide_37", status:"Not pursued", ptsScore:"Low", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-009", proposedBy:"Jon Day", date:"2026-02-18", title:"Vilsmaxxing – Sulfinate-based Vilsmeier variant", pros:"No CF₃ anion concerns. Cheap. Similar intermediate to current route.", cons:"Highly reactive intermediate. May form trifluoroacetonitrile as side product.", killerExperiments:"Is sulfinate electron-poor enough for selectivity?", reference:"", slideLink:"slide_39", status:"POC", ptsScore:"Medium", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-010", proposedBy:"Zhengao Feng", date:"2026-02-19", title:"2-Step Telescoped Cyclization (NaOEt/EtOH)", pros:"Better control of each transformation. Easier workup.", cons:"Unsure about cyclization reactivity.", killerExperiments:"Cyclization at reflux to test kinetics. NaOEt/EtOH to avoid DMF.", reference:"", slideLink:"slide_40", status:"POC", ptsScore:"Medium", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-011", proposedBy:"Alonso Arguelles", date:"2026-02-19", title:"Intramolecular Heck + Asymmetric Addition", pros:"Fast to test. No Fries or Cl-impurity. SM at $720/kg.", cons:"Adds a Pd step. Asymmetric addition may have selectivity issues.", killerExperiments:"Asymmetric addition — reduced reactivity may help selectivity.", reference:"", slideLink:"slide_41", status:"POC", ptsScore:"Medium", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-012", proposedBy:"Tom Pickel", date:"2026-02-20", title:"Benzofuran from Hydroxy-acetophenone + Carbenoid", pros:"Two steps to benzofuran from commercial material.", cons:"Adds Pd step. Vinyl ether Heck with ortho-bromophenols not well established.", killerExperiments:"Chem. Eur. J. 2015, 21, 4, 1482–1487 as starting point.", reference:"Chem. Eur. J. 2015, 21, 4, 1482–1487", slideLink:"slide_42", status:"Not pursued", ptsScore:"Low", outcomeSummary:"", campaignReportLink:"" },
        { id:"P-013", proposedBy:"Joey Tuccinardi", date:"2026-02-20", title:"Pyruvate-derived Ullmann Cyclization / SNAr", pros:"Precedented cyclization. Concise route.", cons:"Palladium/Cu use. Should be RSM-level?", killerExperiments:"Heck reaction may be difficult but very similar examples exist.", reference:"", slideLink:"slide_43", status:"POC", ptsScore:"Medium", outcomeSummary:"", campaignReportLink:"" },
      ],
    }],
  },
  { id:"LY3023414", lsn:"LY3023414", name:"Samotolisib", ta:"Oncology", modality:"small-molecule", characteristics:"PI3K/mTOR dual inhibitor. Phase 2 oncology trials.", sessions:[] },
  { id:"LY3127760", lsn:"LY3127760", name:"LY3127760", ta:"NeuroPain", modality:"small-molecule", characteristics:"Nav1.7 inhibitor for pain. RSM scale-up under review.", sessions:[] },
  { id:"LY3372689", lsn:"LY3372689", name:"Tirzepatide", ta:"Diabetes", modality:"peptide", characteristics:"GLP-1/GIP dual agonist peptide. Manufacturing complexity review ongoing.", sessions:[] },
  { id:"LY3819253", lsn:"LY3819253", name:"Mirikizumab", ta:"ImmCV", modality:"small-molecule", characteristics:"IL-23p19 antagonist. Commercial-stage process optimization.", sessions:[] },
];


// ── helpers ───────────────────────────────────────────────────────────────────
const Badge = ({ text, bg, color, small }) => (
  <span style={{ display:"inline-block", padding:small?"2px 7px":"3px 9px", borderRadius:12,
    background:bg||T.blueL, color:color||T.blue, fontSize:small?10:11, fontWeight:700, letterSpacing:"0.3px" }}>{text}</span>
);
const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status]||STATUS_STYLE["Not pursued"];
  return <Badge text={status} bg={s.bg} color={s.color} />;
};
const TaBadge = ({ ta }) => <Badge text={ta} bg={(TA_COLORS[ta]||T.mid)+"22"} color={TA_COLORS[ta]||T.mid} />;
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background:T.white, borderRadius:10,
    border:`1px solid ${T.light}`, boxShadow:"0 1px 2px rgba(0,0,0,0.03)",
    cursor:onClick?"pointer":undefined, ...style }}>{children}</div>
);
const Divider = () => <div style={{ borderBottom:`1px solid ${T.light}` }} />;
const KPI = ({ label, value, sub, accent }) => (
  <Card style={{ padding:22, position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:0, left:0, bottom:0, width:4, background:accent||T.blue }} />
    <div style={{ fontSize:11, color:T.mid, fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
    <div style={{ fontSize:32, fontWeight:800, color:accent||T.blue, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:T.mid, marginTop:6 }}>{sub}</div>}
  </Card>
);

const Input = ({ label, value, onChange, placeholder, type="text", style }) => (
  <div style={{ marginBottom:14, ...style }}>
    {label && <div style={{ fontSize:11, fontWeight:700, color:T.mid, textTransform:"uppercase",
      letterSpacing:"0.5px", marginBottom:5 }}>{label}</div>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", padding:"8px 11px", border:`1px solid ${T.light}`, borderRadius:6,
        fontSize:13, background:T.off, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows=3 }) => (
  <div style={{ marginBottom:14 }}>
    {label && <div style={{ fontSize:11, fontWeight:700, color:T.mid, textTransform:"uppercase",
      letterSpacing:"0.5px", marginBottom:5 }}>{label}</div>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", padding:"8px 11px", border:`1px solid ${T.light}`, borderRadius:6,
        fontSize:13, background:T.off, fontFamily:"inherit", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:14 }}>
    {label && <div style={{ fontSize:11, fontWeight:700, color:T.mid, textTransform:"uppercase",
      letterSpacing:"0.5px", marginBottom:5 }}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", padding:"8px 11px", border:`1px solid ${T.light}`, borderRadius:6,
        fontSize:13, background:T.off, fontFamily:"inherit", outline:"none" }}>
      {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>
);

// Modal wrapper
const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200,
    display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 20px", overflowY:"auto" }}>
    <div style={{ background:T.white, borderRadius:12, width:"100%", maxWidth:wide?760:520,
      boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"18px 24px", borderBottom:`1px solid ${T.light}` }}>
        <div style={{ fontWeight:700, fontSize:15, color:T.navy }}>{title}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18,
          cursor:"pointer", color:T.mid, lineHeight:1 }}>✕</button>
      </div>
      <div style={{ padding:"24px" }}>{children}</div>
    </div>
  </div>
);

const Btn = ({ children, onClick, variant="primary", small, disabled }) => {
  const styles = {
    primary:   { bg:T.navy,   color:T.white, border:T.navy },
    secondary: { bg:T.white,  color:T.slate, border:T.light },
    danger:    { bg:"#FEE2E2",color:T.red,   border:"#FCA5A5" },
    success:   { bg:T.greenL, color:T.green, border:T.green },
  };
  const s = styles[variant]||styles.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      padding:small?"5px 12px":"7px 16px", borderRadius:6, cursor:"pointer",
      fontSize:small?11:13, fontWeight:700, fontFamily:"inherit", opacity:disabled?0.5:1,
    }}>{children}</button>
  );
};

const STRUCTURE_IMAGES = {
  "LY4064809": "data:image/png;base64,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",
  "LY3023414": "data:image/png;base64,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",
  "LY3127760": null,
  "LY3372689": "data:image/png;base64,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",
  "LY3819253": null,
  "route_current": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAxoAAARjCAYAAADoylLVAAAgAElEQVR4nOzdeXwN9+L/8Xe2JgRxQ+1qFy5av1pKtUHFnlgiiFrq0lq63BRFFU20tt66Fb6tUqroVWJtSRVBVatqa+1aYqvYl8S+ZPn8/nCd6zRB8IkQr+fjkceDM2c+MyMjmdeZOWdcjDFGAAAAAGCRa2avAAAAAICsh9AAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAAAADWERoAAAAArCM0AAAAAFhHaAAAAACwjtAAAAAAYB2hAQAAAMA6QgMAAACAdYQGAAAAAOsIDQAA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K1bUxo0b5eLiotatW+ubb77R9u3bFRQUpG3btt3zMo8fP665c+dKUrr35SlTpig6Olq5c+dW7ty5NXfuXMcrwMePH1fu3Lkd82bPnl2enp73vJ54NERHR6t06dIqVqyYPvnkEyUlJWXYsjgbDdweoYFH2vUDs+bNm6tChQpauHChKlasKOnawdGePXscB1GlS5fW9OnT1axZM7Vo0UJjxoxRcnLyXS13z549mjBhglxcXPTCCy9oxowZqZ4zb948FSpUSH5+fpIkNze3VGc0MuIArGDBgurbt6/69Omjt99++7bPd3d3V+vWrVWyZEmtXbs23cu51TX6t7J48WLVqFFDHTt21PTp052mbd++XTVr1lSRIkXk7++vffv2pTnGn3/+qQkTJmjevHmqW7eucubMKT8/P82YMUMuLi6aMmVKutfnQbFx40Y1btxY27dvV3R0tNMB0IULF/TJJ5/o0qVLjnAeN26cRo8ere7du9/1WZwLFy5o7Nixio+Pl6R07csJCQlauXKlTp8+rYSEBMfXunXrdOLECeXLl08nTpxwzBsfH39PZ67up+joaPn4+Oirr75yerxFixZOUbxo0SLVqFFD2bJlU548eRQcHKzY2FhJ0qZNm9K8ph+3tmvXLgUHBysmJkYTJ05UeHi4cubMqXr16um7777LkGVm9tlo4GFAaOCRtWHDBjVq1Ejbt2/Xt99+m+qVqYIFC6pmzZqKjY1VUFCQNm/eLOnawVRMTIyyZcumxo0ba9WqVele5vUzJ2+++aaGDBmiUqVKqX///vrxxx/Vr18/HTp0SOfOndP8+fP1xhtv6MMPP5SLi4vV7U6vNm3aaM2aNbp69Wq6np+cnCwPD490P/dm1+jfzpQpU9SxY0cVLlxY+fPn1/r16yVdi8Z27dqpX79+iouLU2BgoHr27JnmGD/++KP8/Pz097//3elxNzc3hYSEaMWKFelalwfBkSNH1KNHD3388ceaMmWKIiIi5OXl5Zju4uIif39/PfHEE2rYsKGmTZsmY4yKFi2qzz//XKGhoWrduvUdhfONgf7UU0/p5ZdflqR07cszZszQCy+8oMcee8wxnru7uxo2bKgZM2YoICBAP//8s3bs2KHk5GR169YtVVA+qKZMmaKRI0fe8vr86OhohYaG6pVXXlFcXJx27NihMmXKqFatWo5gQ/olJCTo7bff1jvvvKNRo0ZpzJgxcnFxkaurqzp16qRvv/1Wa9euVUhIiPbs2WNlmdcv83tQzkYDDzQDWNKkSZPMXoV0OXTokOnRo4fp3LmzOXr0aLrmiYuLMy+99JLp1KmTOXbsmOPx06dPm3/+85+mRYsWZu/evTedPyUlxcyaNcvUq1fPzJo1K9X0P/74w7Rs2dL4+voab29vU6NGDfPNN984psfExJhSpUqlmq958+Zm9OjR6dqGm0lMTDSSzMGDB50eT0hIMJLM6dOnzcSJE029evXSfP7Vq1fN9OnTja+vrzl9+rRjuqenp9PXjev/7bffmrZt2zr+3qlTJzNnzpzbruvp06dNiRIlTHJysjHGmMmTJ5vXX3/dGGPM/v37jY+Pj+O5V69eNefOnUtznI8//tixPX/16aefmhdeeOG265LZrl69aiIjI029evXMzz//nK55rly5YiIjI01AQIBZs2aN4/Hk5GQzdepUU7t2bfPdd9/dcowNGzaYBg0amPDwcHP58uVU02+3Lz/zzDNmxowZqeabP3++qVKlijHGmKioKFOmTBlToEAB06FDhzSX86A5deqUKVu2rElJSTHly5c3hw4dckxr3ry5+fLLL40xxjz11FNm1KhRqeafNGmSOXr0qPntt9/S/L8OZ7faZydPnmw2btxorly54nhs165d5sUXXzRhYWHmzJkzd73c7du3m7CwMGOMMa+//rpp3rx5qudERUWZokWLmpSUlAz92W3Tw/L7Gw8fQgPWPOg/qG48yPrll1/uaox169aZxo0bm5EjRzod/Pz+++8mODjY9O/f35w9ezZd8zwobhYa27dvN56eniYlJSXN0LgeENmzZzdVq1Y1q1atuuV4N2rdurXx9vY2Pj4+xsfHx3h7e5ugoKDbrusnn3xiPD09HfPlypXL5M2b11y9etWsW7fOPPHEE+na5lmzZply5cqlOe3dd991iqAH0YIFC4y/v7+ZOnWqSUlJueP5bxbb8fHxpn///qZVq1Zmz549TvMcPnzYdO/e3XTu3NkcOXLknrchq/n444/NwIEDjTHGvPfee+Zf//qXY9r10Lge7/v377/pOITG7X3//fembt26JjIy0iQmJqb5nDlz5pg6deo4Ra4x1160qV27tomMjDRJSUnpXubp06dT/d84ePCg8fX1NX379jVxcXHm7NmzZt68eSZfvnxm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oUIFNW3aVLNnz7a2zXdj+vTpql+/vlxcXFS7dm19++23qd6cunPnTg0ePNjpsSJFiqh48eKaMmWKcuTI4bgc6nYuX76swMBAtW7d+p4v3yhbtqwOHjyoS5cuOR7bsWOHypcvr/Hjx2vbtm3atm3bbS9h8vPzc/oUqetjpEft2rX1n//8J9XjM2bMSPN9HncqNjZW7du314IFCzR//nyFhYXJzc3N6TkBAQFatGiRLl26pAYNGqT7TMOlS5f0wQcfqGfPnurVq5emTp2qfPnyOQI9NDRUrVq10vz581WiRAmnefPkyaPRo0erb9++6tatmyIiInT58uV73t4H2eXLl/XTTz+pWbNmdzSft7e3qlatmuZ+Eh4eru3bt9903ujoaB04cEDFihVTgQIF9MUXX6h///565513Uu23R44c0ZUrV1SsWLE7Wr8H2ZEjR9SlSxflzp1bHTp0ULdu3TR06FCn//N362YvRBlj9OWXXyokJESjR4/WypUr1bRpU23evNnCFv3P9e9dQkKC3N3dHUF6o4IFC+r06dNWlwtkKgNY0qRJk/u+zEuXLpldu3aZF1980YSFhZmEhIR0z7thwwbTsGFDEx4ebi5dupRq+qFDh8ymTZtMeHi4adq0qdm8ebNjWmJiopkwYYJp0KCBWbVqVbqXeeHCBcd4W7ZsSfd8dyMxMdFIMgcPHjTGGHPu3DkzduxYkytXLrNp0yZjjDHJycmmdu3apmbNmmbDhg3mwoULZtWqVaZUqVJm7NixxhhjBg4caN5//31jjDHjx483hQsXdkwLDw83AwcONMYY8/vvv5vo6OhU6xEREWF69OiR5jrmyZPH7N69O9Xfz5w5YyZOnJjmPAEBAWbIkCHm6tWrZvr06aZ48eImMTHxpv8OP/74o6lQoYLTY0OHDjWNGzc258+fN1u2bDF58+Y1v//++03HuNGRI0fM448/bl5++WWzZ88ec/78eTN16lTj6+tr1q1bl64x/urixYvm/PnzJjw83AQGBppt27ale96TJ0+aN99804SGhpoDBw6kmp6SkmJWrlxpFixYYJ5//nkzdepUp+nLly83derUMZGRkSYpKSndy73ZeA86Nzc3c+LECafH0tpHjDFm7dq1pmzZsne1nKVLl5ps2bKZMWPGmGPHjpljx46Z/v37m+LFi5uzZ88aY4z56quvzOHDh285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YcOW+fa1otx+++2x3nrrlbv961//quhhrTBz586NCRMmxIgRI+K2226LPn36ZJ1FGFZ3++67b4waNSrGjRsXJ554Ypx77rlx2WWXxRVXXLFSDzksLS2NSZMmxeLFi1fac0aYyJNVn0On+MUYMGDAMsuOOuqoOOqooyIi4sgjj4wDDjggOnToUO4x37e7fq211oorr7wyrrzyyuXef8kll8Rvf/vb2GOPPaJhw4bL7CnYcssto7i4OF599dXYZpttImLJHpc777xzmW3VqVNnucsjIkpKSsodhtWyZctyP9eoUeNbvzFba621ljk0Y6lvzlL98ssvR7Vq1aJFixYRsWQm41/KcbydO3eOQYMGlVtWr169ChrNilenTp1o0KBBDB48uKKHAj/bu+++G+utt165Zf369YvjjjtuhT5v9erV49prr12hz/FDtG3bNp5//vnCl0UrQ4MGDWLhwoUxY8aMwmG4S3300Uer9b+frB6EBquEZ555Jh555JH4z3/+E9dee200b948Lrvssizb7tq1axx11FFx3XXXxdy5c5c5FruoqCjOOuusuPjiiwsRsbzzNn4pBg4cGGeddUlV6h8AACAASURBVFbh5y+++CI6d+5cgSP6P9WqVVvmDxVg1VBSUhLPP/98uWW/pgsZ7L///nHzzTev1NCoX79+tGjRIkaMGBF/+tOfyt139913xx577LHSxgI/hdBglbDjjjvGhx9+uEK2XVJSEqNGjfrOx/zxj3+Me++9N+67774VMoZc7r333vjyyy/LnTToFxGQQ6VKlX7VXxRstdVW8dprr0VKaaVegGPgwIHRtWvXqFWrVnTu3DkWLFgQN998c9x5553x4osvrrRxwE8hNOAHKCoqioceeqiih/G9unTpEl26dKnoYQCsllq1ahWvvPJKbLfddivtOTt27Bh33XVXDBgwIHr27BlrrrlmtG/fPsaMGRPNmjVbaeOAn8LJ4Kzy2rVrF5UrV46qVatGjRo1Yvvtt4/bb7+9cP/S67/fdNNNy6y76aabRrt27co97tuuE7+iLG9cq6MBAwbEsGHDKnoYUM7Sz/0391b+6U9/+snn1lxwwQXRrFmzqF+/fjRq1CiOO+64+PLLL79znQcffDBat24d1apVi3XWWSc6duwY48eP/0nPz4qz//77V8jVpzp06BBjx46Nzz77LGbPnh33339/bL755it9HPBjCQ1WCzfccEN8+eWX8eGHH0afPn2id+/ecemllxbuLykpidtuu63cOq+99lp89tln5ZY1a9ZsmQnl/vrXv66wcaeU4owzzvhR6yxatGgFjQZ+nUpKSqJXr16xYMGCn72t22+/PUaOHBljx46NWbNmxYQJE2LixInfOW/KqjAh2+677/6tc2j8mrRs2TJeeumlih4GrDKEBquVWrVqRZcuXeK2226L/v37x9y5cyMiYrPNNoupU6fGxx9/XHjsiBEjYpdddvlZzzd16tQoKSkp/HzccccV9pBELJn/4t57742XXnoptttuu2jWrFlsvvnmhQm7unTpEjNnzowWLVrEtGnTYvLkybHzzjvHpptuGtttt10899xzERHx6quvxtZbbx2HHXbYz54QCyhv8803j1atWi1zRbSlPvnkk+jYsWM0a9YsNtpoo2+9gl1ExKRJk6JVq1bRsGHDiFhyVbWRI0dG7969v3Wdr0/IVrdu3WjcuHH07ds3unbtGv379/95L46sioqKYosttogJEyZU9FBglSA0WC3tvPPOUaNGjcL8F4sWLYpOnToVZlBNKcU999wTv//973/W8zRv3jyKiopi2rRpEbHk0rILFiyIBQsWREopxo0bFzvvvHMce+yx0bNnz3jrrbeib9++hctBDh06NCpXrhxvvPFGlJSUxCGHHBKHHnpovPnmm3HNNdfEgQceGF999VUUFxfH1KlTY999913urMLAT7dw4cK45JJLYvDgwcu96MSFF14Y6623Xrz11lsxevTo6NOnz7denGLfffeN2267Lc4888wYN25cLFy4MOrXr7/ceRAiTMi2Kqqow6dgVSQ0WG01atQoPv3008LP3bp1K5y78dxzz0Xz5s2jQYMG5dZZep34r9+uueaa73yeXXbZJZ5//vn473//G9WqVYvf/va38fLLL8ekSZNigw02iHXWWSfGjh0bhx56aEQsiaC33357me28//77MXny5DjiiCMiYsku+kaNGsXzzz8fRUVFsXjx4uX+MQL8PCmlKCkpieOPP365hzJefPHFMWTIkIiIaNKkSWywwQbx7rvvLndbrVq1iueffz5mzZoVBx10UKyzzjrRo0eP+OSTT5b7eBOyrXratGmzzGV+geVz1SlWWx9++GGsu+668cUXX0TEkj/c58yZE1OmTIk77rgjunXrtsw6P+U68UtDo0qVKrHDDjvEZpttFs8++2zUrl07dtttt4iIuP/+++Ovf/1rlJWVxcKFC5c7u+zMmTPjyy+/jKZNmxaWzZs3L2bNmhV169aNOnXqxBpr+G4AVpTTTz89Nttssxg3bly55f/617/inHPOiVmzZsUaa6wR06ZNi8WLF8ewYcPi7rvvjpRS7L333oV5DrbYYovChQ/efPPN6NOnTxx22GHx6KOPLrPOoYce+oMnZPvggw9iiy22iFdffTWaNGmyYt8MvtUaa6wRzZs3jzfffDM23XTTih4O/KL5q4XV0uOPPx5lZWXRsmXLcsu7du0ad999dzz00EPLncRu6XXiv36rXr36dz7X0tB45plnom3bttG6det49tlnY+zYsbHbbrvFBx98EH/84x/j+uuvj3HjxsXf//735W5nvfXWi5o1a8a7775buM2aNSsOOOCAiIiVet12+DWqXr16DBw4ME4++eRyUd+tW7fo0qVLvPjiizFu3Lho1KhRRES888478eijj8aoUaPihhtuiIglV4/66KOPCutuuummceaZZxauIPXNdb4+Ids3fXNCtj59+sQOO+ywQl47P87+++8f9957b0UPA37xhAarlbKyshg1alQcfvjhMXDgwCguLi53f7du3eLqq6+ObbbZ5gfPaDt37tzvvCzrhhtuGJ9++mmMHj062rZtG6WlpTF58uR45ZVXol27djF79uyoWbNmNG3aNBYtWhRXXnllLF68OObPnx/FxcWxcOHCmDdvXjRu3DiaNWtW+INj1qxZ0a1bt/j8889/+hsC/Chdu3aN4uLieOCBBwrLPvnkk9h6660jIuLWW2+NWbNmxeeffx4XXHBBrLHGGjFu3LjYfvvtI2JJHBxzzDGF2JgzZ05ce+21hYtELG+dgQMHxjnnnBM33nhjzJkzJ2bMmBGXXHJJ3HnnnYWrVQ0dOjQ6duy4zOGeVIz27dvH448/XtHDgF88ocFqoUePHlG1atWoVatWnHnmmTFo0KA4+uijl3lcaWlprLvuutG1a9cfvO2ZM2fGMccc852PadOmTXz++edRr169KCoqiqZNm0b9+vWjevXq0aJFi9h7772jtLQ0WrZsGR06dIh27drF7rvvHrVq1Ypdd901Ntxww3jxxRdjxIgRcf3110fz5s2jbdu20b59+6hZs+aPfj+An27w4MHlzqM677zzolOnTtGiRYuYNWtWnHTSSXHkkUfG+++/HyNGjIibbrqpcA7HtddeG02aNIlWrVpFnTp1YosttojKlSvHddddV9jeN9dZOiHb8OHDo6SkJDbddNN49tlnCxOyvffeezF27Ngf9e8WK17btm2Xexgs8H+KUkqpogfB6qFjx47x8MMPV/QwVog//vGPceONN1b0MH6R9t5773jkkUcqehi/WN6fJVbH92HYsGExffr075wjI8c6V155ZYwZMyZq1qwZY8eOjW233TbuvPPOHz9g+Bar8+9vKpY9GvA9FixY8LMvg8uv04cfflhunhVWHwsWLIhevXrF+PHjo1OnTtGpU6fvnf37p6wTEdGzZ88YOXJk3HTTTdGuXbu4+OKLc70MgBXKVafge1SpUmW5J47D92nUqFG5Q2ZYfVSpUiXmzJmzwtf5pptuuulnrQ+wMtmjAQAAZCc0WOXdfvvtsdZaa8XIkSPLLb/ooouiQYMGUadOnTj++ONj0aJFERExf/78OOyww6JWrVrRqFGjGDp06HK3O3/+/DjuuOOia9eu8eabbxaWv/nmm9GpU6eoVatW1KxZM9q2bRuPPfbY946zefPmUbVq1cKtuLg4TjrppIiIeOutt6Jdu3ZRo0aN2HzzzZc7GVS9evVi6tSpP/h9AQCoSEKDVdrll18ed911V/zmN78pt/zJJ5+M6667Ll588cV477334o033igcwnLhhRfGnDlz4oMPPojRo0fH2WefHW+88cYy2x4+fHgccMABMXTo0LjwwgsjImL69OnRrl27aN68eUyYMCE+/vjjOProo+PAAw+MMWPGfOdYp06dGl9++WXh1qZNm8IcGd27d48OHTrEnDlzYsCAAXHQQQdFWVlZjrcIAKBCCA1Wabvuumvcd999sdZaa5Vbfs8998Sxxx4bTZo0ibXXXjt69+4dd999d+G+vn37Rs2aNaO0tDQOPfTQuOeee5bZdkopFi1aFCmlwiUML7vssmjdunVcdtllseGGG0bNmjXj8MMPj9tuuy1q1679g8d99913R4MGDWKnnXaKmTNnxvjx4+OMM86I4uLi6Ny5czRo0CCee+65ZdZ77LHHokWLFlG3bt1C/AB5PfHEE9G8efNyy4488sjYb7/9CntGl+eH7O188MEHo3Xr1lGtWrVYZ511omPHjoXJ/ABWN0KDVdrWW2+93Bmzp0yZEptssknh50022SQmT54cEUv2LHzbfV93xBFHxMiRI6NHjx7x5z//OSIixowZU9gL8XX77LNPbLnllj9ozIsXL46+ffvG+eefXxjrRhttFGuu+X/XZvi2MU2cODFef/31eO655+Lcc8+NL7744gc9J/DTnX/++TFp0qS44447olKlSst9zA/Z2zly5Mj4wx/+EMccc0xMnz49JkyYEK1bt4727dvHpEmTVuZLAlgpXHWK1dIXX3wRVatWLfxctWrV+Pzzz6OsrCzKysqWe983Va9ePa6//vpyy+bMmRPrrrvuzxrbAw88EKWlpbHpppsud6zfNaYePXpEUVFRlJaWRs2aNWPGjBmx0UYb/azxAN/u5ptvjjvuuCOeeeaZqFat2rc+7ut7O5c6/PDDo27duoW9nWeeeWYMHDgwunfvXnhM3759Y9q0adG/f/+44447VtjrAKgI9miwWqpRo0bMnTu38POnn34aNWvWjOLi4iguLl7ufT9EvXr1Yvr06T9rbNddd10ceOCB3zrW7xrT2muvXfjfa6yxxncexgH8PE888UT069cvRo0aFeuss853Pvb79nZ+8MEHMXXq1HKf/aUOOeSQeOqpp7KNG+CXQmiwWiotLS13paiJEyfGZptt9r33fZ+ddtopbr311mWWjxgxYrnneXzTl19+GWPHji03AeAmm2wS06ZNi/nz5/+kMQH5/ec//4njjz8+5s2bF/Pmzfvex3/f3s45c+bEmmuuGXXr1l3mvoYNG8Z///vfnzVegF8iocFq6eCDD44bb7wx3nvvvZg9e3Zcfvnl0bVr14hY8u3hJZdcEvPmzYvXX3897rnnnuV+y7g8p512WkycODGOOuqoePvtt2PevHlxyy23xIknnhgbbLBBREQ8/fTT8eqrry53/QkTJkSjRo2iVq1ahWX16tWLNm3axKWXXhplZWVx++23x4IFC2KHHXb4me8C8FNVqlQpnnrqqejXr1906dKl3KGMw4YNi7322iv23HPPGDx4cER8/97OBg0axMKFC2PGjBnL3PfRRx9FvXr1Yv78+dG1a9f4/e9/H7vuums89NBD+V8YwEokNFilbbvttlG1atUYPXp0dOvWLapWrRp33313tGvXLv70pz9Fq1atomnTptG2bdvo0aNHRET07t071l133WjUqFF06NAhBg0aFKWlpT/o+dZbb714/vnnY86cOdGyZctYb7314qabboqHHnooWrZsGRFL/gh5+OGHl7v+hx9+uNxvPYcPHx5PPvlk1K5dOwYOHBgjR44sd3I4sHLVqVMnGjduHCeeeGJsscUWhX8/IiLeeeedePTRR2PUqFFxww03RMT37+2sX79+tGjRIkaMGLHMY+6+++7YY4894vPPP49TTjklHnjggTj//PPj/vvvX3EvEGAlKEoppYoeBKuHjh07fusf2L8mzz77bEyaNCmOPPLIih7KSnHZZZd96/HlrVu3jrPPPnslj4iKMmvWrDj88MOXe99XX30VTzzxxEoe0U/zxBNPxLHHHluYIPOzzz6LbbfdNo455pg47bTTCo977rnn4sYbb4yhQ4fGxx9/HFtuuWXst99+ceaZZ8a6664b99xzT5xyyikxatSoaNmyZTz88MPRtWvXuOKKK6Jz586xYMGCuPnmm+Piiy+OF198MZo1axYRS/a6TpgwIe6///7YeOONK+Q94NfF729WFF+ZQmZffPFFdO7cuaKHsdL06tUrevXqVdHD4Begfv368cgjj1T0MLJba621YuTIkdGuXbvYbrvtYqeddooRI0bE6NGjY8iQIRHxf3s7zzjjjGjZsmV89dVX0bJly3J7Ozt27Bh33XVXDBgwIHr27BlrrrlmtG/fPsaMGVOIjIiIO+64IyZMmBAnn3zyavl+Ar8e9miQjW9EgF+DYcOGxfTp0+Pcc8/Nut0xY8bEmDFjom/fvjFr1qzYb7/9ljtxJ+Tm9zcrinM0AOAHWrBgQfTq1SvGjx8fnTp1ik6dOsWXX36ZZdtt2rSJyZMnR+fOnePggw+O8847L8t2ASqK0ABWKTVr1vzWK3ItWLAgTjvttNhwww2jatWq0bBhwzjqqKMKM6jvs88+UVRUFKeffnphnTfeeCOKioqWOZH3pptuiqKiomjXrl1ERJSVlcVJJ50UDRo0iHXWWSe6du0ac+bMiYiIadOmxd577x1rr712NGzYMHr16hWLFy+OiIgXX3wxWrVqFdWrV48WLVrEs88+GxERAwYMiKKiomVuS88LiFgya3yVKlWiqKgoFi5cGBERb731Vuy4445RrVq12GyzzQrbY+WoUqVKzJkzJ/7+978Xbt+ccPOnWnPNNeOWW26J++67L5566qnYfffds2y3oiz9vH1biF1//fWx+eabR/Xq1aNu3bqx9957x5QpUyJiyblfRUVFsf3225dbp169esuc/7a8z8n1118fTZs2jZo1a8aOO+4Yr7/+ekRE7L777st85ho3bhwRS97/b9532GGHRUTEuHHjomXLllG9evUoLS0tTK5YVlYWvXr1ioYNG0atWrXi+OOPL4zh448/js6dO0etWrVi/fXXj2uvvTbH2wqrFKEBX3PXXXfFb37zm2jevHnssssuhV96Z5xxRhQXF0fVqlULtwkTJkRExMknnxyHH354HHXUUeW2ddFFF8Xll1++0l/Dr1n//v3j8ssvj/333z+GDx8eHTt2jGHDhsU555xT7nFDhgyJjz766Fu3M3fu3DjzzDOjUqVKhWUXXXRRDBkyJA466KA46KCD4o477oh+/fpFRMQJJ5wQo0ePjuuuuy4OOeSQGDRoUPztb3+LefPmxX777RcffPBBnHPOOTF79uzo0qVLzJ8/P3bddde46KKLCrf27dtHlSpVok6dOoXnPPnkk5eZlPHwww+PN998M84777xIKcVBBx0UZWVlOd4+WGkee+yxOOaYY6JJkyYxdOjQOPXUU+Opp54qXIZ8qRdffPF7r771zc/JmDFj4phjjonS0tI4/fTT45VXXikEw5FHHlnuc9e4ceNo2LBhRERceOGFheX9+vWLSpUqRcOGDeOrr76Kzp07x4wZM+Lcc8+NypUrx//7f/8vpk+fHldddVUMGjQo9thjj+jUqVNcc801ccUVV0RExNFHHx0PPfRQ9OzZM5o0aRLHH398vPzyyznfRvjlS5DJ3nvvXdFD+Fk++OCDVLt27fTWW2+llFK64oor0k477ZRSSumYY45JQ4YMWWadyZMnp3322SellFKPHj3SSy+9lFJK6f3330+tWrVKZWVlK2fwvyI1atRI22+//XLv23PPPVPlypXLve833nhjGjduXEoppY4dO6bmzZunGjVqpOOPPz6llNLrr7+eIiL97W9/K6xz6qmnpt/85jdpq622Sm3btk0ppXT11VenAQMGFB5Tp06dtOuuu6aUUiopKUmtW7dOKaX07rvvpohIp556ahozZkyKiHT55ZenlFK65pprUkSkhx9+uNy4Z82alerUqZP69OlTWPbAAw+kqlWrpi5duqSISGVlZWnGjBkpIgqPu/HGG1NEpDFjxvyEdxJWrI4dO6aISPPnz1/mvgsvvDBFRPrnP/9ZWPbwww+nBx98MC1evDhdeumlKSLSVlttlbbYYou0aNGilFJKdevWTUcccURhneV9Tv7xj3+k0047LX3yyScppZQ6deqU1lxzzbR48eJyY3jiiSdSRKRHH310mfH17ds3rbXWWmnGjBnp/fffT0cccUR65JFHUkopXXfddSki0hNPPJF23XXXVKdOnbRw4cK0aNGi1LBhw9SyZcu0cOHCVLly5fT73/8+pZTSpEmTUkSk3r17/8x3dcVY1X9/88tljwb8r6lTp8b6668fTZs2jYiIXXfdNSZNmhQREZ9++mm5SfaWmjJlSuHxTZo0icmTJ0dExKmnnhqXXHKJuTBWslatWsVXX30V7dq1iyuvvDJef/316N69e7nDLypXrhw9e/aMYcOGxbvvvrvMNt5888246qqrClcTWuq4446Ls846K6ZNmxa33357zJkzJ3bbbbeIWHIZ33//+9/x9ttvx9NPP10Yy9IZpZf+t7P0EI2le8qWOuussyIi4s9//nNELDkE7JRTTok+ffpESUlJ4XFLD6tq0qRJuf/7ze3BL12rVq0iIuIPf/hD9O/fP5555pnYY489CodbLdW7d+94/fXXC4cqfd23fU723HPPuOyyyyKlFGPHjo0XXnghdtlll3LbXbRoUfTs2TN23XXX6NChQ7ntvvPOO3HppZdG7969o0GDBlFSUhLDhg2L3/3ud5FSivvvvz+Ki4ujRYsWMW/evKhZs2ZUqlQp1lhjjWjUqFFMmTIlysrK4quvvvrezz6s7oQG/K+tt946Pvnkkxg/fnxERNx///2FY6TnzJkTt956a2ywwQbRpEmTuPDCCyNiyTG9S4/HLSsri+Li4nj88cejSpUqMW3atNhnn33i9NNPj+TibitFv3794pxzzomZM2fGySefHFtuuWVsttlm8cILLxQes2jRoujdu3dUq1ZtuVcNOvnkk+PAAw+MXXbZZbnPscsuu8Shhx4aBxxwQOFcj8GDB0ft2rWjWbNm0b179+jWrVscfPDB0aJFi6hUqVKMGDEi3n///bjlllsiImL+/PmF7U2ZMiWGDx8eJ510Uqy99toRETFo0KBIKcUZZ5xR7rmXhkuVKlUiYkk0fX05rCp22223uO2226J+/frRv3//aN++fay33nqFCRC//rj27dtHv379Cv/WLvVtn5Ol+vTpEzvuuGPUr18/hg8fXu6+m2++OSZOnBh9+/ZdZr1+/fpFlSpV4qSTTiq3fPHixXH00UfHI488EmeffXasu+66sfXWW8e0adPioYcein/+85/x+uuvx/z586Nq1apRWloajz/+eEycODGuu+66iCj/2YdfhQrdn8JqZXXY9XrLLbek4uLiVLdu3dS4ceM0ZcqUlFJKF1xwQRo8eHCaN29emjhxYiopKUkjR45MH330Udphhx3S4sWL05577pneeOON1LJlyzR58uS01VZbpbKystSjR4/05JNPVvArW31816FTX/fuu++mwYMHp2rVqqVNNtkkpbTkUI7S0tKUUkrnn39+qlSpUrrvvvsKh07dd999qXr16mnixIlp9uzZqUWLFmmHHXZIc+fOLWz3scceS5deemmqWrVq6tatW0oppXbt2qUNNtggPfLII+mqq65KEZEGDhyYUkrprLPOShGRIiJts802KSLS1VdfXdhenz59UlFRUfrwww9TSilNnz491ahRI916661p9uzZ6dhjj00Rkf7zn/+kZ555JkVEuuaaa1JKKT355JMpItINN9yQ4Z2FvL7r0Kmv++9//5tGjhyZmjRpkipVqpTef//9wqFTH330UeG/++uvvz6tu+666YgjjvjOz8nSQ6Ree+21NGzYsNS0adPUrFmzcuPYfvvt06abbrrMWGbPnp2qVKmSjj322HLLFy5cmA488MAUEalv376F5W+//XZq3LhxiohUs2bNtPHGG6cGDRqklFJ68MEHU5UqVVJEpNLS0lSjRo100EEH/eT3c0VaHX5/88skNMhmVf+Havz48alJkybpnXfeSSmldNddd6WNN944LVy4cJnHnnfeeenII49MKaU0ZMiQtNtuu6WBAwemiy66KA0aNCiNHz8+7b///imlJcf2Dxo0aKW9jtXdt4XG/Pnz0+mnn54uueSScst/97vfpcqVK6fFixeXC43PPvss1atXL7Vp06YQGieffHIhCr5+a9asWbrsssvK/f9xp512SrVq1UozZ85MEVHuuPG11167cG7HwoUL08SJE9PkyZPT7bffniIiPfPMMymllBYvXpwaN25c7vUsDZ/l3caPH58iIp1xxhkppf87VvzZZ5/N9O5CPt8VGkOGDElHH3104dyLlFK6+OKLC/89fz00Ukppr732So0bN04lJSXpiCOO+M7PydChQ9Npp52WFixYkFJKqV+/fiki0muvvZZSWnJuXXztXKevGzp06HLP2zjppJNSRKRrr712mXVmzZqVXn311fTZZ5+l0tLStNtuuxXue//999P48ePTe++9l4qKitL555//E97JFW9V//3NL5cDyOF/PfXUU9G6devCce8HHnhgHHbYYfHhhx/Ge++9F9ttt13hMpYLFy4sHL5ywgknxAknnBDTp0+PAw44IMaOHRsTJkyINdZYcmTiGmusscyVg/h5Pvroo7jsssvKLTv00ENj3Lhx8cwzz8TkyZNjyy23jHfeeSeeeOKJZY7Pjlhymdwzzjij3KzmJ554YnTq1Knw85FHHhnVqlWLYcOGxaBBg2LkyJHx7rvvRvXq1ePZZ5+NNm3aRL169aJhw4YxatSouPfee+Pdd9+NuXPnxhZbbBHz5s2LRo0axUYbbRSHHHJI/PWvf43S0tJo3bp1RCy5VO306dNj3333LTxnu3btYvTo0YWfhwwZEvfcc0888cQTsemmm8bOO+8cw4cPj7p168Z1110XTZo0WeYSoPBLMnjw4HLnq7Vv3z5mzpwZ119/fbz99tvRsWPHmDt3blxzzTVRt27d2GKLLZaZqHDAgAGFGdYjvvtz8j//8z8xaNCg+Pe//x077LBDDB06NGrWrFk4n+6f//xnRERss802y4x16TlWX79vwoQJcdVVV0VJSUnMnj07Bg4cGBFLLpU7D7F4uQAAD3tJREFUatSoOPvss6NXr14xc+bM+Pe//x1nn3124f5XX301evfuHQ8//HAUFxdHt27dfs5bCaueii4dVh+r+jci//jHP9KGG26YZs2alVJK6fHHH09169ZNZWVlqU2bNunss89OixYtSlOnTk0lJSXLfON10EEHpaeffjqltGT3e6tWrVJKS74Je+ihh1bui1mN1ahRY7nfYj7//PNp1qxZqUePHqlRo0apcuXKaf311089evRIM2bMSCmVP3QqpSV7QRo1arTMVaeW+vpVp2bNmpUOPvjgtM4666S111477bXXXmnq1KkppZReeOGF1LZt21SjRo1Ut27ddOihh6bZs2enlFK65557UtOmTVPlypVTmzZt0qRJkwrbHz16dIqI7/yWc+lelqVX0nr77bdT27ZtU+XKldOWW26ZXn755Z/5jsKKsXSPxjdvF110UVq0aFE677zz0sYbb5yqVq2a6tWrlzp06JBeeeWVlFJaZo9GSil17tx5mb2HS339c7Jo0aL05z//Oa2//vqpWrVqaeutt07/+Mc/Co9duodj6Z7Fr9tpp52WuULV3XffvdzX8Ze//CV99tlnqUuXLqlGjRqpXr166bzzzius9z//8z+pVatWqUqVKql58+bp/vvvz/K+rgir+u9vfrmKUnKWKnl07NgxHn744Yoexs8ycODAGD58eKSUonbt2nH55ZdH+/bt46233oqjjz46Xn311ahdu3accsop0bNnz8J6Tz75ZNx4443lJn274IIL4umnn466devGrbfe6gpUAPwirQ6/v/llEhpk4x8q4Ndi8ODBMXDgwPjqq6+ie/fuMWjQoCgqKoq33norDj/88HjttdeiSZMmMWzYsGjdunV89tln0b179yguLo4dd9wxTjjhhMK29t577+jfv3+5Q4NgZfL7mxXF5W0B4Ed46qmn4uqrr46XX345Jk+eHC+++GJhxufu3btHhw4dYs6cOTFgwIDCzO133HFHtGnTJu6444644YYbCpdqvffee6OkpERkAKslx3IAwI9w0003Ra9evQqTsI0dOzYiImbOnBnjx4+P0aNHx5prrhmdO3eOAQMGxHPPPRdTpkwpXASgdu3aMXPmzKhdu3ZccMEF8dhjj1XYawFYkezRAIAfYcKECfHJJ5/ENttsE82aNYv+/ftHxJLJFzfaaKNy52NtsskmMXny5OVO7nnBBRfEMcccE5dccknss88+hQkdAVYXQgMAfoQ5c+bESy+9FGPHjo1nn302RowYEffdd1988cUXhUtgL1W1atX4/PPPY5tttokXXngh5s2bF59++mnMnj07xowZE82aNYuZM2fG/fffH3/5y1/is88+q6BXBZCf0ACAH6F27drRvXv3qF69eqy33npx2GGHxZNPPhk1atSIuXPnlnvsp59+GjVr1oxOnTrFF198EZ07d46BAwfGqaeeGn/5y1/ijTfeiG233TYqVaoUm2yySUyZMqWCXhVAfkIDAH6Epk2bxieffFL4OaUUxcXFsckmm8S0adNi/vz5hfsmTpwYm222Way55ppx9dVXx2OPPRZffvllNG7cOLbbbrtYtGiRyT2B1ZbQAIAf4bDDDosrrrgi/vvf/8aMGTPib3/7W+y2225Rr169aNOmTVx66aVRVlYWt99+eyxYsCB22GGHwrrz58+PCy64IC688MKIiCgtLS3sxZg6dWo0b968Ql4TwIogNADgR+jSpUv87ne/i9LS0thmm22iW7dusc8++0RExPDhw+PJJ5+M2rVrx8CBA2PkyJHlTg6/8MIL49hjj4111lknIiL22muv+PDDD2P33XePLl26RJ06dSrkNQGsCCbsIxsT/gDAqsfvb1YUezQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5okE1KqaKHAAD8SH5/s6IIDbIpLi6OuXPnVvQwAIAf6PXXX48mTZpU9DBYTQkNsjn11FOjR48eMWfOnIoeCgDwPaZMmRI9e/aMM888s6KHwmpqzYoeAKuPnXbaKYqKiqJ79+6xcOHCWLBgQUUPCQD4hkqVKkWlSpWibt26ccMNN0RJSUlFD4nVVFFyYB4AAJCZQ6cAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDshAYAAJCd0AAAALITGgAAQHZCAwAAyE5oAAAA2QkNAAAgO6EBAABkJzQAAIDs/j9Fo+NVTEDnzQAAAABJRU5ErkJggg==",
};
// ── AI extraction ─────────────────────────────────────────────────────────────
async function extractFromPPT(pptText) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      model:"claude-sonnet-4-6", max_tokens:1000,
      messages:[{ role:"user", content:`Extract Design Day data from this PPT text. Return ONLY JSON, no markdown:
{
  "moleculeId":"string","moleculeName":"string","ta":"string","sessionDate":"YYYY-MM-DD",
  "objective":"string","currentRouteSummary":"string","challenges":["string"],
  "proposals":[{"proposedBy":"string","date":"YYYY-MM-DD","title":"string","pros":"string","cons":"string","killerExperiments":"string","reference":"string","slideLink":"string"}]
}
PPT text:\n${pptText.slice(0,6000)}` }]
    })
  });
  const data = await res.json();
  const raw = data.content?.find(b=>b.type==="text")?.text||"{}";
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch { return null; }
}

// ── main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [molecules, setMolecules] = useState(SEED);
  const [view, setView] = useState("dashboard");
  const [sel, setSel] = useState({ molId:null, sessionId:null, proposalId:null });
  const [search, setSearch] = useState("");
  const [taFilter, setTaFilter] = useState("All");
  const [modal, setModal] = useState(null); // null | "addMol" | "addSession" | "addProposal" | "editProposal" | "outcomes"
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState("");
  const [activeRole, setActiveRole] = useState("Contributor");
  const fileRef = useRef();

  // ── derived state ──────────────────────────────────────────────────────────
  const selMol      = molecules.find(m=>m.id===sel.molId);
  const selSession  = selMol?.sessions.find(s=>s.id===sel.sessionId);
  const selProposal = selSession?.proposals.find(p=>p.id===sel.proposalId);
  const allSessions  = molecules.flatMap(m=>m.sessions.map(s=>({...s,mol:m})));
  const allProposals = allSessions.flatMap(s=>s.proposals.map(p=>({...p,session:s,mol:s.mol})));

  const totalProposals  = allProposals.length;
  const pocCount        = allProposals.filter(p=>p.status==="POC").length;
  const campaignCount   = allProposals.filter(p=>p.status==="Campaign Lead").length;
  const notPursued      = allProposals.filter(p=>p.status==="Not pursued"||p.status==="Dropped").length;
  const successRate     = totalProposals ? Math.round((pocCount+campaignCount)/totalProposals*100) : 0;

  const trendData = ["Q1 '25","Q2 '25","Q3 '25","Q4 '25","Q1 '26"].map((q,i)=>({
    q, proposals:[0,0,0,0,totalProposals][i], sessions:[0,0,0,0,allSessions.length][i],
  }));

  const statusPie = [
    { name:"POC",          value:pocCount,       fill:T.blue },
    { name:"Campaign Lead",value:campaignCount,  fill:T.green },
    { name:"Not pursued",  value:notPursued,     fill:T.light },
  ].filter(d=>d.value>0);

  // search covers molecule name/LSN/ID, scientist names across proposals, keywords in objectives
  const filteredMols = molecules.filter(m => {
    const matchTA = taFilter==="All"||m.ta===taFilter;
    if (!search) return matchTA;
    const q = search.toLowerCase();
    const inMol = m.name.toLowerCase().includes(q)||m.lsn.toLowerCase().includes(q)||m.id.toLowerCase().includes(q);
    const inScientist = m.sessions.some(s=>s.proposals.some(p=>p.proposedBy.toLowerCase().includes(q)));
    const inKeyword = m.sessions.some(s=>s.objective.toLowerCase().includes(q)||s.id.toLowerCase().includes(q));
    return matchTA && (inMol||inScientist||inKeyword);
  });

  // ── update helpers ─────────────────────────────────────────────────────────
  const updateProposal = (molId, sessionId, proposalId, patch) =>
    setMolecules(prev=>prev.map(m=>m.id!==molId?m:{...m,sessions:m.sessions.map(s=>
      s.id!==sessionId?s:{...s,proposals:s.proposals.map(p=>p.id!==proposalId?p:{...p,...patch})})}));

  // ── nav ────────────────────────────────────────────────────────────────────
  const goMol     = id      => { setSel({molId:id,sessionId:null,proposalId:null}); setView("molecule"); };
  const goSession = (m,s)   => { setSel({molId:m,sessionId:s,proposalId:null}); setView("session"); };
  const goProp    = (m,s,p) => { setSel({molId:m,sessionId:s,proposalId:p}); setView("proposal"); };

  // ── file upload ────────────────────────────────────────────────────────────
  async function handleFile(e) {
    const file = e.target.files[0]; if(!file) return;
    setExtracting(true); setExtractMsg("Sending to Claude for extraction…");
    const demoText = `Feb 20, 2026. Tersolisib (STX-478) RSM Synthetic Route Designer Day
Current Route: Friedel-Crafts acylation. Issues: High temperatures, Low yields, DMF.
Proposal by Alex Harmata: Aromatic bromination + Metal/X exchange. Pros: High likelihood of success. Cons: Toxic electrophile.`;
    const extracted = await extractFromPPT(demoText);
    if(extracted) {
      const ns = {
        id:`DD-${Date.now()}`, date:extracted.sessionDate||new Date().toISOString().slice(0,10),
        objective:extracted.objective||"Extracted from PPT", pptRef:file.name, pptLink:"",
        currentRoute:{ description:extracted.currentRouteSummary||"", challenges:extracted.challenges||[], priorities:[] },
        history:[], proposals:(extracted.proposals||[]).map((p,i)=>({
          id:`P-EX-${i}`, proposedBy:p.proposedBy||"Unknown", date:p.date||"",
          title:p.title||"Untitled", pros:p.pros||"", cons:p.cons||"",
          killerExperiments:p.killerExperiments||"", reference:p.reference||"",
          slideLink:p.slideLink||"", status:"POC", ptsScore:"Medium",
          outcomeSummary:"", campaignReportLink:"",
        })),
      };
      setMolecules(prev=>prev.map(m=>m.id===(extracted.moleculeId||prev[0].id)?{...m,sessions:[...m.sessions,ns]}:m));
      setExtractMsg(`✓ Extracted ${ns.proposals.length} proposals from ${file.name}`);
    } else { setExtractMsg("⚠ Extraction failed — check console."); }
    setExtracting(false); e.target.value="";
  }


  // ── MODALS ─────────────────────────────────────────────────────────────────
  const AddMoleculeModal = () => {
    const [f, setF] = useState({ lsn:"", name:"", ta:"Oncology", modality:"small-molecule", characteristics:"" });
    const save = () => {
      if(!f.lsn) return;
      const id = "LY"+Date.now();
      setMolecules(prev=>[...prev,{...f,id,sessions:[]}]);
      setModal(null);
    };
    return (
      <Modal title="Add molecule" onClose={()=>setModal(null)}>
        <Input label="Molecule ID (LY / LSN)" value={f.lsn} onChange={v=>setF({...f,lsn:v})} placeholder="e.g. LY1234567 or LSN9876543" />
        <Input label="Name (if available)" value={f.name} onChange={v=>setF({...f,name:v})} placeholder="e.g. Tersolisib" />
        <Select label="Therapeutic area" value={f.ta} onChange={v=>setF({...f,ta:v})}
          options={["Oncology","NeuroPain","ImmCV","Diabetes"]} />
        <Select label="Modality" value={f.modality} onChange={v=>setF({...f,modality:v})}
          options={["small-molecule","peptide","oligonucleotide","adc"]} />
        <Textarea label="General characteristics" value={f.characteristics} onChange={v=>setF({...f,characteristics:v})} rows={3} />
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={!f.lsn}>Add molecule</Btn>
        </div>
      </Modal>
    );
  };

  const AddSessionModal = ({ molId }) => {
    const [f, setF] = useState({ date:new Date().toISOString().slice(0,10), objective:"", pptRef:"", pptLink:"" });
    const save = () => {
      if(!f.objective) return;
      const id = `DD-${f.date.slice(0,7).replace("-","")}-${Date.now().toString().slice(-4)}`;
      const ns = { id, date:f.date, objective:f.objective, pptRef:f.pptRef, pptLink:f.pptLink,
        currentRoute:{ description:"", challenges:[], priorities:[] }, history:[], proposals:[] };
      setMolecules(prev=>prev.map(m=>m.id===molId?{...m,sessions:[...m.sessions,ns]}:m));
      setModal(null);
    };
    return (
      <Modal title="Add design session" onClose={()=>setModal(null)}>
        <Input label="Date" type="date" value={f.date} onChange={v=>setF({...f,date:v})} />
        <Textarea label="Session objective" value={f.objective} onChange={v=>setF({...f,objective:v})}
          placeholder="What synthesis problem is being addressed?" rows={3} />
        <Input label="PPT filename" value={f.pptRef} onChange={v=>setF({...f,pptRef:v})}
          placeholder="e.g. Tersolisib_RSM_DesignDay.pptx" />
        <Input label="PPT SharePoint link" value={f.pptLink} onChange={v=>setF({...f,pptLink:v})}
          placeholder="https://lilly.sharepoint.com/..." />
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={!f.objective}>Add session</Btn>
        </div>
      </Modal>
    );
  };

  const AddProposalModal = ({ molId, sessionId }) => {
    const blank = { proposedBy:"", date:new Date().toISOString().slice(0,10), title:"", pros:"", cons:"", killerExperiments:"", reference:"", slideLink:"", status:"POC", ptsScore:"Medium", outcomeSummary:"", campaignReportLink:"" };
    const [f, setF] = useState(blank);
    const save = () => {
      if(!f.title||!f.proposedBy) return;
      const id = `P-${Date.now().toString().slice(-5)}`;
      setMolecules(prev=>prev.map(m=>m.id!==molId?m:{...m,sessions:m.sessions.map(s=>
        s.id!==sessionId?s:{...s,proposals:[...s.proposals,{...f,id}]})}));
      setModal(null);
    };
    return (
      <Modal title="Add proposal" onClose={()=>setModal(null)} wide>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
          <Input label="Proposed by" value={f.proposedBy} onChange={v=>setF({...f,proposedBy:v})} placeholder="Scientist name" />
          <Input label="Date" type="date" value={f.date} onChange={v=>setF({...f,date:v})} />
        </div>
        <Input label="Proposal title" value={f.title} onChange={v=>setF({...f,title:v})} placeholder="Brief descriptive title" />
        <Textarea label="Pros" value={f.pros} onChange={v=>setF({...f,pros:v})} placeholder="Advantages of this route…" rows={2} />
        <Textarea label="Cons" value={f.cons} onChange={v=>setF({...f,cons:v})} placeholder="Disadvantages or risks…" rows={2} />
        <Textarea label="Killer / key experiments" value={f.killerExperiments} onChange={v=>setF({...f,killerExperiments:v})} placeholder="Critical experiments needed to validate…" rows={2} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
          <Input label="Reference (optional)" value={f.reference} onChange={v=>setF({...f,reference:v})} placeholder="Paper, patent, or internal report" />
          <Input label="PPT slide link" value={f.slideLink} onChange={v=>setF({...f,slideLink:v})} placeholder="slide_15 or full URL" />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
          <Select label="Initial status" value={f.status} onChange={v=>setF({...f,status:v})}
            options={["POC","Campaign Lead","Not pursued","Dropped"]} />
          <Select label="PTS score" value={f.ptsScore} onChange={v=>setF({...f,ptsScore:v})}
            options={["High","Medium","Low"]} />
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={!f.title||!f.proposedBy}>Add proposal</Btn>
        </div>
      </Modal>
    );
  };

  const OutcomeModal = ({ molId, sessionId, proposalId }) => {
    const p = molecules.find(m=>m.id===molId)?.sessions.find(s=>s.id===sessionId)?.proposals.find(p=>p.id===proposalId);
    const [f, setF] = useState({ status:p?.status||"POC", outcomeSummary:p?.outcomeSummary||"", campaignReportLink:p?.campaignReportLink||"" });
    const save = () => { updateProposal(molId,sessionId,proposalId,f); setModal(null); };
    return (
      <Modal title="Update outcome" onClose={()=>setModal(null)}>
        <Select label="Status" value={f.status} onChange={v=>setF({...f,status:v})}
          options={["POC","Campaign Lead","Not pursued","Dropped"]} />
        <Textarea label="Outcome summary" value={f.outcomeSummary} onChange={v=>setF({...f,outcomeSummary:v})}
          placeholder="What was the result? Why was it selected or dropped?" rows={3} />
        <Input label="Campaign report link (SharePoint)" value={f.campaignReportLink} onChange={v=>setF({...f,campaignReportLink:v})}
          placeholder="https://lilly.sharepoint.com/..." />
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={save}>Save outcome</Btn>
        </div>
      </Modal>
    );
  };


  // ── HEADER ─────────────────────────────────────────────────────────────────
  const Header = () => (
    <div style={{ background:T.navy, padding:"0 24px", height:54, display:"flex",
      alignItems:"center", gap:10, position:"sticky", top:0, zIndex:100, flexWrap:"wrap" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:22, height:22, background:T.red, borderRadius:4, display:"flex",
          alignItems:"center", justifyContent:"center", color:T.white, fontWeight:800, fontSize:12 }}>D</div>
        <span style={{ color:T.white, fontWeight:700, fontSize:14 }}>Design Days</span>
        <span style={{ color:"#94A3B8", fontSize:12 }}>SMDD</span>
      </div>
      <div style={{ marginLeft:"auto", display:"flex", gap:4, alignItems:"center", flexWrap:"wrap" }}>
        {["dashboard","portfolio","outcomes"].map(v=>(
          <button key={v} onClick={()=>setView(v)} style={{
            background:view===v?T.red:"transparent", color:view===v?T.white:"#94A3B8",
            border:"none", padding:"6px 12px", borderRadius:5, cursor:"pointer",
            fontSize:12, fontWeight:view===v?700:500, fontFamily:"inherit",
          }}>{{dashboard:"Dashboard",portfolio:"Portfolio",outcomes:"Outcomes"}[v]}</button>
        ))}
        <div style={{ width:1, height:20, background:"rgba(255,255,255,0.15)", margin:"0 4px" }} />
        {/* Role selector */}
        <select value={activeRole} onChange={e=>setActiveRole(e.target.value)} style={{
          background:"rgba(255,255,255,0.1)", color:T.white, border:"1px solid rgba(255,255,255,0.2)",
          padding:"5px 10px", borderRadius:5, fontSize:11, fontFamily:"inherit", cursor:"pointer",
        }}>
          {["Contributor","Scientist","Viewer","Leadership"].map(r=><option key={r} value={r} style={{background:T.navy}}>{r}</option>)}
        </select>
        {activeRole!=="Viewer"&&activeRole!=="Leadership"&&(
          <button onClick={()=>setModal("addMol")} style={{
            background:"rgba(255,255,255,0.1)", color:T.white,
            border:"1px solid rgba(255,255,255,0.2)", padding:"5px 12px",
            borderRadius:5, cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"inherit",
          }}>+ Molecule</button>
        )}
        <button onClick={()=>fileRef.current?.click()} style={{
          background:T.red, color:T.white, border:"none", padding:"5px 12px",
          borderRadius:5, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit",
        }}>{extracting?"⏳ Extracting…":"⬆ Upload PPT"}</button>
        <input ref={fileRef} type="file" accept=".pptx" style={{display:"none"}} onChange={handleFile}/>
      </div>
    </div>
  );

  const Breadcrumb = () => {
    const crumbs = [{label:"Dashboard",action:()=>setView("dashboard")}];
    if(selMol) crumbs.push({label:selMol.lsn,action:()=>goMol(selMol.id)});
    if(selSession) crumbs.push({label:selSession.id,action:()=>goSession(selMol.id,selSession.id)});
    if(selProposal) crumbs.push({label:selProposal.title.slice(0,30)+"…"});
    return (
      <div style={{ padding:"8px 24px", background:T.white, borderBottom:`1px solid ${T.light}`,
        fontSize:12, color:T.mid, display:"flex", gap:6, alignItems:"center" }}>
        {crumbs.map((c,i)=>(
          <span key={i} style={{display:"flex",alignItems:"center",gap:6}}>
            {i>0&&<span style={{color:T.light}}>›</span>}
            {c.action?<span style={{color:T.blue,cursor:"pointer",fontWeight:600}} onClick={c.action}>{c.label}</span>
              :<span style={{color:T.dark,fontWeight:600}}>{c.label}</span>}
          </span>
        ))}
      </div>
    );
  };

  // ── SEARCH BAR ─────────────────────────────────────────────────────────────
  const SearchBar = () => {
    const tas = ["All",...new Set(molecules.map(m=>m.ta))];
    return (
      <div style={{ background:T.white, borderBottom:`1px solid ${T.light}`, padding:"10px 24px",
        display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by molecule ID, scientist name, keyword, design ID…"
          style={{ padding:"7px 12px", border:`1px solid ${T.light}`, borderRadius:6,
            fontSize:12, width:340, background:T.off, fontFamily:"inherit", outline:"none" }}/>
        <div style={{ display:"flex", gap:4 }}>
          {tas.map(t=>(
            <button key={t} onClick={()=>setTaFilter(t)} style={{
              background:taFilter===t?(TA_COLORS[t]||T.navy):"transparent",
              color:taFilter===t?T.white:T.mid,
              border:`1px solid ${taFilter===t?(TA_COLORS[t]||T.navy):T.light}`,
              padding:"5px 10px", borderRadius:5, cursor:"pointer", fontSize:11,
              fontWeight:600, fontFamily:"inherit",
            }}>{t}</button>
          ))}
        </div>
        {search&&<span style={{fontSize:11,color:T.mid}}>{filteredMols.length} result{filteredMols.length!==1?"s":""}</span>}
      </div>
    );
  };


  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  const Dashboard = () => (
    <div style={{padding:"24px 24px 60px",maxWidth:1300,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:21,fontWeight:800,color:T.navy,letterSpacing:"-0.3px"}}>Designer Day Database</div>
        <div style={{fontSize:13,color:T.mid,marginTop:3}}>SMDD Route Scouting & Manufacturing · {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
      </div>
      {extractMsg&&<div style={{background:extractMsg.startsWith("✓")?T.greenL:T.blueL,color:extractMsg.startsWith("✓")?T.green:T.blue,borderRadius:8,padding:"10px 16px",marginBottom:16,fontSize:13,fontWeight:600}}>{extractMsg}</div>}

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14,marginBottom:22}}>
        <KPI label="Design Events"    value={allSessions.length}  accent={T.blue} />
        <KPI label="Active Programs"  value={molecules.filter(m=>m.sessions.length>0).length} accent={T.teal} />
        <KPI label="Total Proposals"  value={totalProposals}      accent={T.orange} />
        <KPI label="POC"              value={pocCount}            accent={T.blue} sub={`${Math.round(pocCount/Math.max(totalProposals,1)*100)}% of total`}/>
        <KPI label="In Campaign"      value={campaignCount}       accent={T.green} />
        <KPI label="Success Rate"     value={`${successRate}%`}  accent={T.purple} sub="POC + Campaign / Total"/>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20}}>
        <Card style={{padding:20}}>
          <div style={{fontWeight:700,fontSize:13,color:T.navy,marginBottom:2}}>Proposal & session volume by quarter</div>
          <div style={{fontSize:11,color:T.mid,marginBottom:14}}>Activity trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={trendData} barSize={18} barGap={4}>
              <XAxis dataKey="q" tick={{fontSize:11,fill:T.mid}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:T.mid}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:6,border:`1px solid ${T.light}`,fontSize:11}}/>
              <Bar dataKey="proposals" name="Proposals" radius={[3,3,0,0]}>
                {trendData.map((_,i)=><Cell key={i} fill={i===trendData.length-1?T.blue:T.blueL}/>)}
              </Bar>
              <Bar dataKey="sessions" name="Sessions" radius={[3,3,0,0]}>
                {trendData.map((_,i)=><Cell key={i} fill={i===trendData.length-1?T.teal:T.tealL}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{padding:20}}>
          <div style={{fontWeight:700,fontSize:13,color:T.navy,marginBottom:2}}>Proposal status breakdown</div>
          <div style={{fontSize:11,color:T.mid,marginBottom:10}}>All sessions</div>
          {totalProposals>0?(
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false} fontSize={10}>
                  {statusPie.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          ):<div style={{color:T.mid,fontSize:13,paddingTop:40,textAlign:"center"}}>No proposals yet</div>}
        </Card>
      </div>

      {/* Molecule table */}
      <Card>
        <div style={{padding:"16px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:T.navy}}>Molecule registry</div>
            <div style={{fontSize:11,color:T.mid,marginTop:2}}>{filteredMols.length} of {molecules.length} molecules</div>
          </div>
          {activeRole!=="Viewer"&&activeRole!=="Leadership"&&(
            <Btn small onClick={()=>setModal("addMol")}>+ Add molecule</Btn>
          )}
        </div>
        <Divider/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:T.off}}>
                {["Molecule ID","Name","Therapeutic Area","Modality","Sessions","Proposals","Success Rate",""].map(h=>(
                  <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,
                    color:T.mid,letterSpacing:"0.4px",textTransform:"uppercase",borderBottom:`1px solid ${T.light}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMols.map(m=>{
                const mProps = m.sessions.reduce((a,s)=>a+s.proposals.length,0);
                const mPOC = m.sessions.reduce((a,s)=>a+s.proposals.filter(p=>p.status==="POC"||p.status==="Campaign Lead").length,0);
                const mRate = mProps?Math.round(mPOC/mProps*100):null;
                return (
                  <tr key={m.id} onClick={()=>goMol(m.id)} style={{cursor:"pointer",transition:"background 0.1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.bluePale}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"11px 14px",fontWeight:700,color:T.blue}}>{m.lsn}</td>
                    <td style={{padding:"11px 14px",fontWeight:600,color:T.dark}}>{m.name||"—"}</td>
                    <td style={{padding:"11px 14px"}}><TaBadge ta={m.ta}/></td>
                    <td style={{padding:"11px 14px"}}>
                      <span style={{display:"inline-block",padding:"2px 8px",borderRadius:10,
                        background:MODALITY_BG[m.modality]||T.off,fontSize:10,fontWeight:700,color:T.slate}}>{m.modality}</span>
                    </td>
                    <td style={{padding:"11px 14px",color:m.sessions.length?T.dark:T.mid}}>{m.sessions.length||"—"}</td>
                    <td style={{padding:"11px 14px",color:mProps?T.dark:T.mid}}>{mProps||"—"}</td>
                    <td style={{padding:"11px 14px"}}>
                      {mRate!==null?<span style={{fontWeight:700,color:mRate>50?T.green:T.orange}}>{mRate}%</span>:<span style={{color:T.mid}}>—</span>}
                    </td>
                    <td style={{padding:"11px 14px"}}><span style={{color:T.blue,fontSize:12,fontWeight:600}}>View →</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent sessions */}
      <div style={{marginTop:20}}>
        <div style={{fontWeight:700,fontSize:13,color:T.navy,marginBottom:12}}>Recent design sessions</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {allSessions.slice(-6).reverse().map(s=>(
            <Card key={s.id} onClick={()=>goSession(s.mol.id,s.id)} style={{padding:16,cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(26,111,181,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,0.03)"}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontWeight:700,color:T.blue,fontSize:13}}>{s.mol.lsn}</span>
                <TaBadge ta={s.mol.ta}/>
              </div>
              <div style={{fontSize:11,color:T.mid,marginBottom:6}}>{s.id} · {s.date}</div>
              <div style={{fontSize:12,color:T.slate,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{s.objective}</div>
              <div style={{marginTop:8,fontSize:11,color:T.mid}}>{s.proposals.length} proposal{s.proposals.length!==1?"s":""}</div>
            </Card>
          ))}
          {allSessions.length===0&&<div style={{gridColumn:"1/-1",color:T.mid,fontSize:13,padding:20,textAlign:"center"}}>No sessions yet. Upload a PPT to get started.</div>}
        </div>
      </div>
    </div>
  );


  // ── MOLECULE VIEW ──────────────────────────────────────────────────────────
  const MoleculeView = () => {
    if(!selMol) return null;
    const mProps = selMol.sessions.reduce((a,s)=>a+s.proposals.length,0);
    const mPOC   = selMol.sessions.reduce((a,s)=>a+s.proposals.filter(p=>p.status==="POC"||p.status==="Campaign Lead").length,0);
    return (
      <div style={{padding:"24px 24px 60px",maxWidth:1300,margin:"0 auto"}}>
        <Card style={{marginBottom:20,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"200px 1fr"}}>
            <div style={{background:T.off,padding:20,borderRight:`1px solid ${T.light}`,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:180}}>
              {STRUCTURE_IMAGES[selMol.id]
                ?<img src={STRUCTURE_IMAGES[selMol.id]} alt={`${selMol.name} structure`}
                    style={{maxWidth:"100%",maxHeight:160,objectFit:"contain",borderRadius:6}}/>
                :<div style={{width:"100%",minHeight:140,border:`2px dashed ${T.light}`,borderRadius:8,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:T.mid,background:T.white}}>
                    <div style={{fontSize:24,color:T.light}}>⬡</div>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase",color:T.mid,marginTop:6}}>Structure unavailable</div>
                  </div>}
            </div>
            <div style={{padding:"20px 24px"}}>
              <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                <TaBadge ta={selMol.ta}/>
                <span style={{display:"inline-block",padding:"3px 9px",borderRadius:12,
                  background:MODALITY_BG[selMol.modality]||T.off,fontSize:11,fontWeight:700,color:T.slate}}>{selMol.modality}</span>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:T.navy}}>{selMol.name||selMol.lsn}</div>
              <div style={{fontSize:13,color:T.mid,marginTop:2,marginBottom:10}}>{selMol.id} · {selMol.lsn}</div>
              <div style={{fontSize:13,color:T.slate,lineHeight:1.6,marginBottom:14}}>{selMol.characteristics}</div>
              <div style={{display:"flex",gap:20}}>
                {[["Sessions",selMol.sessions.length,T.blue],["Proposals",mProps,T.orange],["Success rate",mProps?`${Math.round(mPOC/mProps*100)}%`:"—",T.green]].map(([l,v,c])=>(
                  <div key={l} style={{fontSize:11,color:T.mid}}>
                    <span style={{fontSize:20,fontWeight:800,color:c,display:"block"}}>{v}</span>{l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:14,color:T.navy}}>Design sessions</div>
          {activeRole!=="Viewer"&&activeRole!=="Leadership"&&(
            <Btn small onClick={()=>setModal({type:"addSession",molId:selMol.id})}>+ Add session</Btn>
          )}
        </div>
        {selMol.sessions.length===0
          ?<Card style={{padding:32,textAlign:"center",color:T.mid}}>No sessions yet. Upload a PPT or add a session manually.</Card>
          :selMol.sessions.map(s=>(
            <Card key={s.id} style={{marginBottom:14,cursor:"pointer"}}
              onClick={()=>goSession(selMol.id,s.id)}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(26,111,181,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,0.03)"}>
              <div style={{padding:"14px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <span style={{fontWeight:700,color:T.blue,fontSize:14}}>{s.id}</span>
                    <span style={{color:T.mid,fontSize:12,marginLeft:8}}>{s.date}</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <Badge text={`${s.proposals.length} proposals`} bg={T.blueL} color={T.blue} small/>
                    <span style={{color:T.blue,fontSize:12,fontWeight:600}}>Open →</span>
                  </div>
                </div>
                <div style={{fontSize:13,color:T.slate,marginTop:6,lineHeight:1.5}}>{s.objective}</div>
                {s.pptRef&&(
                  <div style={{fontSize:11,color:T.mid,marginTop:6,display:"flex",alignItems:"center",gap:4}}>
                    📎 {s.pptLink
                      ?<a href={s.pptLink} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                          style={{color:T.blue,textDecoration:"none"}}>{s.pptRef} ↗</a>
                      :s.pptRef}
                  </div>
                )}
              </div>
            </Card>
          ))}
      </div>
    );
  };

  // ── SESSION VIEW ───────────────────────────────────────────────────────────
  const SessionView = () => {
    const [tab, setTab] = useState("proposals");
    if(!selSession||!selMol) return null;
    return (
      <div style={{padding:"24px 24px 60px",maxWidth:1300,margin:"0 auto"}}>
        <Card style={{marginBottom:20,padding:"18px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex",gap:8,marginBottom:6}}>
                <TaBadge ta={selMol.ta}/>
                <Badge text={selMol.lsn} bg={T.bluePale} color={T.blue}/>
              </div>
              <div style={{fontSize:17,fontWeight:800,color:T.navy}}>{selSession.id}</div>
              <div style={{fontSize:12,color:T.mid,marginTop:2}}>{selSession.date}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Badge text={`${selSession.proposals.length} proposals`} bg={T.blueL} color={T.blue}/>
              {selSession.pptLink&&(
                <a href={selSession.pptLink} target="_blank" rel="noreferrer"
                  style={{fontSize:12,color:T.blue,fontWeight:600,textDecoration:"none"}}>📎 Open PPT ↗</a>
              )}
            </div>
          </div>
          <div style={{fontSize:13,color:T.slate,marginTop:10,paddingTop:10,borderTop:`1px solid ${T.light}`,lineHeight:1.6}}>{selSession.objective}</div>
        </Card>

        <div style={{display:"flex",gap:4,marginBottom:16,alignItems:"center"}}>
          {[["proposals","Proposals"],["route","Current Route"],["history","Dev. History"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{
              background:tab===v?T.blue:T.white, color:tab===v?T.white:T.slate,
              border:`1px solid ${tab===v?T.blue:T.light}`, padding:"6px 14px",
              borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit",
            }}>{l}</button>
          ))}
          {tab==="proposals"&&activeRole!=="Viewer"&&activeRole!=="Leadership"&&(
            <Btn small onClick={()=>setModal({type:"addProposal",molId:selMol.id,sessionId:selSession.id})}
              style={{marginLeft:"auto"}}>+ Add proposal</Btn>
          )}
        </div>

        {tab==="route"&&(
          <Card style={{padding:22}}>
            <div style={{fontWeight:700,fontSize:14,color:T.navy,marginBottom:10}}>Current synthesis route</div>
            {STRUCTURE_IMAGES["route_current"]&&selMol.id==="LY4064809"&&(
              <img src={STRUCTURE_IMAGES["route_current"]} alt="Current synthesis route"
                style={{width:"100%",borderRadius:8,border:`1px solid ${T.light}`,marginBottom:14,background:T.white}}/>
            )}
            <div style={{fontSize:13,color:T.slate,lineHeight:1.6,marginBottom:16}}>{selSession.currentRoute.description}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:11,color:T.red,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Operational issues</div>
                {selSession.currentRoute.challenges.map((c,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:7,fontSize:13,color:T.slate}}>
                    <span style={{color:T.red,flexShrink:0}}>✗</span>{c}
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:11,color:T.green,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Development priorities</div>
                {selSession.currentRoute.priorities.map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:7,fontSize:13,color:T.slate}}>
                    <span style={{color:T.green,flexShrink:0}}>→</span>{p}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {tab==="history"&&(
          <div>
            {selSession.history.length===0
              ?<Card style={{padding:24,color:T.mid,textAlign:"center"}}>No development history recorded.</Card>
              :selSession.history.map((h,i)=>(
                <Card key={i} style={{padding:18,marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:13,color:T.navy,marginBottom:5}}>{h.name}</div>
                  <div style={{fontSize:13,color:T.slate,lineHeight:1.6}}>{h.outcome}</div>
                </Card>
              ))}
          </div>
        )}

        {tab==="proposals"&&(
          <div>
            {selSession.proposals.map(p=>(
              <Card key={p.id} style={{marginBottom:12,cursor:"pointer"}}
                onClick={()=>goProp(selMol.id,selSession.id,p.id)}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(26,111,181,0.12)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,0.03)"}>
                <div style={{padding:"14px 18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <span style={{fontWeight:700,color:T.navy,fontSize:13,flex:1,marginRight:12}}>{p.title}</span>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                      <StatusBadge status={p.status}/>
                      <span style={{fontSize:11,color:T.mid}}>PTS: {p.ptsScore}</span>
                      <span style={{color:T.blue,fontSize:12,fontWeight:600}}>→</span>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:T.mid,marginBottom:8}}>
                    By <strong style={{color:T.slate}}>{p.proposedBy}</strong> · {p.date}
                    {p.slideLink&&<span style={{marginLeft:8,color:T.blue}}>📎 {p.slideLink}</span>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div style={{background:T.greenL+"88",borderRadius:6,padding:"8px 12px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.green,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:3}}>Pros</div>
                      <div style={{fontSize:12,color:T.slate,lineHeight:1.5}}>{p.pros}</div>
                    </div>
                    <div style={{background:"#FEE2E288",borderRadius:6,padding:"8px 12px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.red,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:3}}>Cons</div>
                      <div style={{fontSize:12,color:T.slate,lineHeight:1.5}}>{p.cons}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {selSession.proposals.length===0&&<Card style={{padding:24,color:T.mid,textAlign:"center"}}>No proposals yet. Add one manually or upload a PPT.</Card>}
          </div>
        )}
      </div>
    );
  };


  // ── PROPOSAL DETAIL ────────────────────────────────────────────────────────
  const ProposalDetail = () => {
    if(!selProposal||!selSession||!selMol) return null;
    return (
      <div style={{padding:"24px 24px 60px",maxWidth:900,margin:"0 auto"}}>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <TaBadge ta={selMol.ta}/>
          <Badge text={selMol.lsn} bg={T.bluePale} color={T.blue}/>
          <Badge text={selSession.id} bg={T.off} color={T.mid}/>
          <StatusBadge status={selProposal.status}/>
          <Badge text={`PTS: ${selProposal.ptsScore}`} bg={T.off} color={T.slate}/>
        </div>
        <div style={{fontSize:19,fontWeight:800,color:T.navy,marginBottom:4}}>{selProposal.title}</div>
        <div style={{fontSize:13,color:T.mid,marginBottom:4}}>
          Proposed by <strong style={{color:T.slate}}>{selProposal.proposedBy}</strong> · {selProposal.date}
        </div>
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          {selProposal.reference&&(
            <span style={{fontSize:12,color:T.slate}}>📄 <strong>Ref:</strong> {selProposal.reference}</span>
          )}
          {selProposal.slideLink&&selSession.pptLink?(
            <a href={`${selSession.pptLink}#${selProposal.slideLink}`} target="_blank" rel="noreferrer"
              style={{fontSize:12,color:T.blue,textDecoration:"none",fontWeight:600}}>📎 View source slide ↗</a>
          ):selProposal.slideLink&&(
            <span style={{fontSize:12,color:T.mid}}>📎 {selProposal.slideLink}</span>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <Card style={{padding:18}}>
            <div style={{fontSize:11,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>✓ Pros</div>
            <div style={{fontSize:13,color:T.slate,lineHeight:1.7}}>{selProposal.pros||"—"}</div>
          </Card>
          <Card style={{padding:18}}>
            <div style={{fontSize:11,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>✗ Cons</div>
            <div style={{fontSize:13,color:T.slate,lineHeight:1.7}}>{selProposal.cons||"—"}</div>
          </Card>
        </div>
        <Card style={{padding:18,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T.orange,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>🧪 Killer / key experiments</div>
          <div style={{fontSize:13,color:T.slate,lineHeight:1.7}}>{selProposal.killerExperiments||"—"}</div>
        </Card>

        {/* Outcome tracking */}
        <Card style={{padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:13,color:T.navy}}>Outcome tracking</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <StatusBadge status={selProposal.status}/>
              {activeRole!=="Viewer"&&(
                <Btn small onClick={()=>setModal({type:"outcome",molId:selMol.id,sessionId:selSession.id,proposalId:selProposal.id})}>
                  Update outcome
                </Btn>
              )}
            </div>
          </div>
          {selProposal.outcomeSummary&&(
            <div style={{fontSize:13,color:T.slate,lineHeight:1.6,marginBottom:10,padding:"10px 14px",
              background:T.off,borderRadius:6}}>{selProposal.outcomeSummary}</div>
          )}
          {selProposal.campaignReportLink&&(
            <a href={selProposal.campaignReportLink} target="_blank" rel="noreferrer"
              style={{fontSize:12,color:T.blue,fontWeight:600,textDecoration:"none"}}>📊 View campaign report ↗</a>
          )}
          {!selProposal.outcomeSummary&&!selProposal.campaignReportLink&&(
            <div style={{fontSize:12,color:T.mid}}>No outcome recorded yet.</div>
          )}
        </Card>
      </div>
    );
  };

  // ── OUTCOMES VIEW ──────────────────────────────────────────────────────────
  const OutcomesView = () => {
    const [statusFilter, setStatusFilter] = useState("All");
    const proposals = allProposals.filter(p=>statusFilter==="All"||p.status===statusFilter);
    return (
      <div style={{padding:"24px 24px 60px",maxWidth:1300,margin:"0 auto"}}>
        <div style={{fontSize:21,fontWeight:800,color:T.navy,marginBottom:4}}>Outcome tracking</div>
        <div style={{fontSize:13,color:T.mid,marginBottom:20}}>All proposals across sessions — filterable by status</div>

        <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
          {["All","POC","Campaign Lead","Not pursued","Dropped"].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)} style={{
              background:statusFilter===s?T.navy:T.white, color:statusFilter===s?T.white:T.slate,
              border:`1px solid ${statusFilter===s?T.navy:T.light}`, padding:"5px 12px",
              borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit",
            }}>{s} {statusFilter!==s&&<span style={{color:T.mid,fontSize:10}}>({allProposals.filter(p=>s==="All"||p.status===s).length})</span>}</button>
          ))}
        </div>

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,background:T.white,borderRadius:10,overflow:"hidden",border:`1px solid ${T.light}`}}>
            <thead>
              <tr style={{background:T.off}}>
                {["Molecule","Session","Proposal","Proposed by","Date","Status","Outcome","Campaign Report"].map(h=>(
                  <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,
                    color:T.mid,letterSpacing:"0.4px",textTransform:"uppercase",borderBottom:`1px solid ${T.light}`,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proposals.map((p,i)=>(
                <tr key={p.id} style={{borderBottom:`1px solid ${T.off}`,background:i%2===0?T.white:T.bg,cursor:"pointer"}}
                  onClick={()=>goProp(p.mol.id,p.session.id,p.id)}
                  onMouseEnter={e=>e.currentTarget.style.background=T.bluePale}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?T.white:T.bg}>
                  <td style={{padding:"10px 14px",fontWeight:700,color:T.blue}}>{p.mol.lsn}</td>
                  <td style={{padding:"10px 14px",color:T.mid,fontSize:12}}>{p.session.id}</td>
                  <td style={{padding:"10px 14px",maxWidth:220}}>
                    <div style={{fontWeight:600,color:T.dark,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div>
                  </td>
                  <td style={{padding:"10px 14px",color:T.slate}}>{p.proposedBy}</td>
                  <td style={{padding:"10px 14px",color:T.mid,fontSize:12,whiteSpace:"nowrap"}}>{p.date}</td>
                  <td style={{padding:"10px 14px"}}><StatusBadge status={p.status}/></td>
                  <td style={{padding:"10px 14px",maxWidth:180}}>
                    {p.outcomeSummary
                      ?<span style={{fontSize:12,color:T.slate,overflow:"hidden",textOverflow:"ellipsis",display:"block",whiteSpace:"nowrap"}}>{p.outcomeSummary}</span>
                      :<span style={{fontSize:11,color:T.mid}}>—</span>}
                  </td>
                  <td style={{padding:"10px 14px"}}>
                    {p.campaignReportLink
                      ?<a href={p.campaignReportLink} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                          style={{fontSize:12,color:T.blue,fontWeight:600,textDecoration:"none"}}>View ↗</a>
                      :<span style={{fontSize:11,color:T.mid}}>—</span>}
                  </td>
                </tr>
              ))}
              {proposals.length===0&&<tr><td colSpan={8} style={{padding:32,textAlign:"center",color:T.mid}}>No proposals match this filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── PORTFOLIO ──────────────────────────────────────────────────────────────
  const Portfolio = () => {
    const tas = [...new Set(molecules.map(m=>m.ta))];
    return (
      <div style={{padding:"24px 24px 60px",maxWidth:1300,margin:"0 auto"}}>
        <div style={{fontSize:21,fontWeight:800,color:T.navy,marginBottom:4}}>Portfolio overview</div>
        <div style={{fontSize:13,color:T.mid,marginBottom:20}}>Segregated by therapeutic area · click any molecule to drill down</div>
        <Card style={{padding:"12px 18px",marginBottom:20,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.mid,textTransform:"uppercase",letterSpacing:"0.5px"}}>Modality</div>
          {Object.entries(MODALITY_BG).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.slate}}>
              <div style={{width:14,height:9,borderRadius:2,background:v}}/>{k}
            </div>
          ))}
        </Card>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(tas.length,4)},1fr)`,gap:20}}>
          {tas.map(ta=>(
            <div key={ta}>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
                {molecules.filter(m=>m.ta===ta).map(m=>{
                  const mProps = m.sessions.reduce((a,s)=>a+s.proposals.length,0);
                  return (
                    <div key={m.id} onClick={()=>goMol(m.id)} style={{
                      borderRadius:8,padding:"12px 14px",textAlign:"center",cursor:"pointer",
                      border:`2.5px solid ${TA_COLORS[ta]||T.mid}`,
                      background:MODALITY_BG[m.modality]||T.off,transition:"transform 0.1s",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                      <div style={{fontSize:15,fontWeight:800,color:T.navy}}>{m.lsn}</div>
                      <div style={{fontSize:11,color:T.mid,marginTop:2}}>{m.name||m.modality}</div>
                      {m.sessions.length>0&&<div style={{marginTop:6,display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap"}}>
                        <Badge text={`${m.sessions.length} session${m.sessions.length!==1?"s":""}`} bg={(TA_COLORS[ta]||T.mid)+"22"} color={TA_COLORS[ta]||T.mid} small/>
                        {mProps>0&&<Badge text={`${mProps} proposals`} bg={T.off} color={T.mid} small/>}
                      </div>}
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.5px",textTransform:"uppercase",
                color:TA_COLORS[ta]||T.mid,borderTop:`2px solid ${TA_COLORS[ta]||T.mid}`,
                paddingTop:7,textAlign:"center"}}>{ta}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  // ── RENDER ─────────────────────────────────────────────────────────────────
  const isNavView = view==="dashboard"||view==="portfolio"||view==="outcomes";
  return (
    <div style={{fontFamily:"'IBM Plex Sans',Arial,sans-serif",background:T.bg,minHeight:"100vh",color:T.dark}}>
      <Header/>
      {!isNavView&&<Breadcrumb/>}
      {(view==="dashboard"||view==="portfolio"||view==="outcomes"||view==="molecule")&&<SearchBar/>}

      {view==="dashboard" &&<Dashboard/>}
      {view==="portfolio" &&<Portfolio/>}
      {view==="outcomes"  &&<OutcomesView/>}
      {view==="molecule"  &&<MoleculeView/>}
      {view==="session"   &&<SessionView/>}
      {view==="proposal"  &&<ProposalDetail/>}

      {/* Modals */}
      {modal==="addMol"&&<AddMoleculeModal/>}
      {modal?.type==="addSession"&&<AddSessionModal molId={modal.molId}/>}
      {modal?.type==="addProposal"&&<AddProposalModal molId={modal.molId} sessionId={modal.sessionId}/>}
      {modal?.type==="outcome"&&<OutcomeModal molId={modal.molId} sessionId={modal.sessionId} proposalId={modal.proposalId}/>}
    </div>
  );
}
