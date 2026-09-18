import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity, BarChart3, BookOpenCheck, Brain, ChevronDown, ChevronsUpDown,
  CircleGauge, Download, Filter, HeartPulse, Info, Lightbulb, Menu, Moon,
  RefreshCcw, Search, Sparkles, TableProperties, Users, X,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, Pie, PieChart, ReferenceLine,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { students, palette, type Student } from "./data";

type View = "dashboard" | "students" | "usage" | "academic" | "health" | "insights" | "about";
type Filters = { gender: string; level: string; country: string; platform: string; status: string; impact: string };
type SortKey = keyof Pick<Student, "studentId" | "age" | "dailyUsage" | "sleepHours" | "mentalHealth" | "addictionScore">;

const initialFilters: Filters = { gender: "All", level: "All", country: "All", platform: "All", status: "All", impact: "All" };
const navItems: { label: string; to: string; view: View; icon: typeof Activity }[] = [
  { label: "Dashboard", to: "/", view: "dashboard", icon: CircleGauge },
  { label: "Student Analysis", to: "/students", view: "students", icon: TableProperties },
  { label: "Social Media Usage", to: "/usage", view: "usage", icon: BarChart3 },
  { label: "Academic Impact", to: "/academic-impact", view: "academic", icon: BookOpenCheck },
  { label: "Health & Well-being", to: "/health", view: "health", icon: HeartPulse },
  { label: "Insights", to: "/insights", view: "insights", icon: Lightbulb },
  { label: "About Project", to: "/about", view: "about", icon: Info },
];
const chartColors = [palette.coral, palette.sky, palette.mauve, palette.sage, palette.butter, palette.ink];
const tooltipStyle = { borderRadius: 10, border: `1px solid ${palette.hair}`, background: palette.surface, fontSize: 12 };

function average(rows: Student[], key: keyof Student) {
  if (!rows.length) return 0;
  return rows.reduce((sum, row) => sum + Number(row[key]), 0) / rows.length;
}
function correlation(rows: Student[], xKey: keyof Student, yKey: keyof Student) {
  if (rows.length < 2) return 0;
  const ax = average(rows, xKey), ay = average(rows, yKey);
  const top = rows.reduce((s, r) => s + (Number(r[xKey]) - ax) * (Number(r[yKey]) - ay), 0);
  const dx = Math.sqrt(rows.reduce((s, r) => s + (Number(r[xKey]) - ax) ** 2, 0));
  const dy = Math.sqrt(rows.reduce((s, r) => s + (Number(r[yKey]) - ay) ** 2, 0));
  return dx && dy ? top / (dx * dy) : 0;
}
function grouped(rows: Student[], key: keyof Student, valueKey?: keyof Student) {
  const groups = new Map<string, { total: number; count: number }>();
  rows.forEach((row) => {
    const name = String(row[key]);
    const current = groups.get(name) ?? { total: 0, count: 0 };
    current.total += valueKey ? Number(row[valueKey]) : 1;
    current.count += 1;
    groups.set(name, current);
  });
  return [...groups.entries()].map(([name, v]) => ({ name, value: valueKey ? Number((v.total / v.count).toFixed(2)) : v.count })).sort((a, b) => b.value - a.value);
}

function SelectFilter({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <label className="relative min-w-36 flex-1 sm:flex-none"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full appearance-none rounded-xl border border-border bg-background py-1.5 pl-3 pr-8 text-xs font-medium text-foreground outline-none transition focus:border-ring sm:w-auto"><option value="All">{label} · All</option>{values.map((item) => <option key={item} value={item}>{label} · {item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground" /></label>;
}

function Panel({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={`clay rounded-2xl border border-border bg-card p-4 sm:p-5 ${className}`}><div className="mb-4"><h2 className="font-display text-base font-semibold text-card-foreground">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}</div>{children}</section>;
}

function ChartTooltipBox({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number | string; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-xl border border-border bg-popover p-2.5 text-xs shadow-lg"><p className="mb-1 font-semibold">{label}</p>{payload.map((item) => <p key={`${item.name}-${item.value}`} className="text-muted-foreground">{item.name}: <strong className="text-foreground">{item.value}</strong></p>)}</div>;
}

function Kpis({ rows }: { rows: Student[] }) {
  const cards = [
    { label: "Total Students", value: rows.length.toLocaleString(), note: "active sample", icon: Users, tone: "bg-coral-soft text-coral" },
    { label: "Average Daily Usage", value: `${average(rows, "dailyUsage").toFixed(1)}h`, note: "per student", icon: Activity, tone: "bg-butter-soft text-butter-strong" },
    { label: "Average Addiction Score", value: average(rows, "addictionScore").toFixed(1), note: "out of 10", icon: Sparkles, tone: "bg-mauve-soft text-mauve-strong" },
    { label: "Average Sleep Hours", value: `${average(rows, "sleepHours").toFixed(1)}h`, note: "per night", icon: Moon, tone: "bg-sky-soft text-sky-strong" },
    { label: "Average Mental Health", value: average(rows, "mentalHealth").toFixed(1), note: "out of 10", icon: Brain, tone: "bg-sage-soft text-sage-strong" },
  ];
  return <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">{cards.map(({ label, value, note, icon: Icon, tone }, index) => <article key={label} className={`clay rounded-2xl border border-border bg-card p-4 ${index === 4 ? "col-span-2 xl:col-span-1" : ""}`}><div className="flex items-start justify-between gap-2"><p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p><span className={`grid size-8 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></span></div><p className="mt-2 font-display text-3xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{note}</p></article>)}</section>;
}

function PlatformChart({ rows }: { rows: Student[] }) {
  const data = grouped(rows, "platform").slice(0, 8);
  return <Panel title="Most Used Social Media Platforms" subtitle="Students by primary platform"><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: 10, right: 12 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={palette.hair} /><XAxis type="number" tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={74} tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltipBox />} cursor={{ fill: "var(--muted)" }} /><Bar dataKey="value" name="Students" radius={[0, 6, 6, 0]} isAnimationActive={false}>{data.map((entry, i) => <Cell key={entry.name} fill={chartColors[i % chartColors.length]} />)}</Bar></BarChart></ResponsiveContainer></div></Panel>;
}

function AcademicUsageChart({ rows }: { rows: Student[] }) {
  const data = grouped(rows, "academicLevel", "dailyUsage");
  return <Panel title="Usage by Academic Level" subtitle="Average daily hours"><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.hair} /><XAxis dataKey="name" tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} tickLine={false} /><YAxis domain={[0, 7]} tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltipBox />} cursor={{ fill: "var(--muted)" }} /><Bar dataKey="value" name="Hours" fill={palette.sky} radius={[7, 7, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div></Panel>;
}

function ScatterPanel({ rows, kind }: { rows: Student[]; kind: "usage" | "sleep" | "mental" }) {
  const config = kind === "usage" ? { title: "Daily Usage vs Addiction Score", subtitle: "Higher usage aligns with stronger addiction indicators", x: "dailyUsage" as const, xLabel: "Daily usage (hours)", color: palette.coral } : kind === "sleep" ? { title: "Sleep Hours vs Addiction Score", subtitle: "Sleep tends to decline as addiction scores rise", x: "sleepHours" as const, xLabel: "Sleep (hours)", color: palette.sky } : { title: "Mental Health vs Addiction Score", subtitle: "Well-being scores across addiction levels", x: "mentalHealth" as const, xLabel: "Mental health score", color: palette.sage };
  const data = rows.slice(0, 180).map((row) => ({ x: row[config.x], y: row.addictionScore, id: row.studentId }));
  const r = correlation(rows, config.x, "addictionScore");
  return <Panel title={config.title} subtitle={config.subtitle}><div className="mb-2 flex justify-end"><span className="rounded-lg bg-muted px-2 py-1 text-[11px] text-muted-foreground">Correlation r = {r.toFixed(2)}</span></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ left: -18, right: 8, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke={palette.hair} /><XAxis type="number" dataKey="x" name={config.xLabel} tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} tickLine={false} /><YAxis type="number" dataKey="y" name="Addiction score" domain={[0, 10]} tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} tickLine={false} /><Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle} /><Scatter data={data} fill={config.color} fillOpacity={0.72} isAnimationActive={false} /></ScatterChart></ResponsiveContainer></div></Panel>;
}

function ImpactDonut({ rows }: { rows: Student[] }) {
  const yes = rows.filter((row) => row.academicImpact === "Yes").length;
  const data = [{ name: "Affected", value: yes }, { name: "Not affected", value: rows.length - yes }];
  const pct = rows.length ? Math.round((yes / rows.length) * 100) : 0;
  return <Panel title="Academic Performance Impact" subtitle="Reported effect on academic performance"><div className="relative h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} isAnimationActive={false}>{data.map((entry, index) => <Cell key={entry.name} fill={[palette.coral, palette.sage][index]} />)}</Pie><Tooltip content={<ChartTooltipBox />} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="font-display text-3xl font-semibold">{pct}%</p><p className="text-[10px] text-muted-foreground">affected</p></div></div></div><div className="flex justify-center gap-5 text-xs"><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-coral" />Affected</span><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-sage" />Not affected</span></div></Panel>;
}

function DistributionChart({ rows }: { rows: Student[] }) {
  const data = Array.from({ length: 8 }, (_, index) => ({ name: `${index + 2}`, value: rows.filter((row) => row.addictionScore === index + 2).length }));
  return <Panel title="Addiction Score Distribution" subtitle="Number of students at each score"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.hair} /><XAxis dataKey="name" tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} /><YAxis tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} /><Tooltip content={<ChartTooltipBox />} cursor={{ fill: "var(--muted)" }} /><Bar dataKey="value" name="Students" fill={palette.mauve} radius={[5, 5, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div></Panel>;
}

function GenderBoxPlot({ rows }: { rows: Student[] }) {
  const stats = ["Female", "Male"].map((gender) => {
    const scores = rows.filter((r) => r.gender === gender).map((r) => r.addictionScore).sort((a, b) => a - b);
    const at = (p: number) => scores[Math.floor((scores.length - 1) * p)] ?? 0;
    return { gender, min: at(0), q1: at(.25), median: at(.5), q3: at(.75), max: at(1) };
  });
  return <Panel title="Addiction Score by Gender" subtitle="Median and interquartile range"><div className="space-y-8 py-5">{stats.map((item, index) => <div key={item.gender}><div className="mb-2 flex justify-between text-xs"><span>{item.gender}</span><span className="text-muted-foreground">Median {item.median}</span></div><div className="relative h-9"><div className="absolute top-1/2 h-px bg-border" style={{ left: `${item.min * 10}%`, right: `${100 - item.max * 10}%` }} /><div className={`absolute top-1 h-7 rounded-md border ${index ? "border-sky-strong bg-sky-soft" : "border-coral bg-coral-soft"}`} style={{ left: `${item.q1 * 10}%`, width: `${(item.q3 - item.q1) * 10}%` }} /><div className="absolute top-0 h-9 w-0.5 bg-foreground" style={{ left: `${item.median * 10}%` }} /></div><div className="flex justify-between text-[10px] text-muted-foreground"><span>0</span><span>10</span></div></div>)}</div></Panel>;
}

function CountryChart({ rows }: { rows: Student[] }) {
  const data = grouped(rows, "country").slice(0, 8);
  return <Panel title="Student Distribution by Country" subtitle="Top represented countries in the selected cohort"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.hair} /><XAxis dataKey="name" angle={-28} textAnchor="end" height={56} tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: palette.muted }} axisLine={false} /><Tooltip content={<ChartTooltipBox />} cursor={{ fill: "var(--muted)" }} /><Bar dataKey="value" name="Students" fill={palette.butter} radius={[5, 5, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div></Panel>;
}

function Heatmap({ rows }: { rows: Student[] }) {
  const metrics = [{ key: "dailyUsage" as const, label: "Usage" }, { key: "sleepHours" as const, label: "Sleep" }, { key: "mentalHealth" as const, label: "Mental" }, { key: "conflicts" as const, label: "Conflict" }, { key: "addictionScore" as const, label: "Addiction" }];
  return <Panel title="Correlation Matrix" subtitle="Relationship strength between numerical variables"><div className="overflow-x-auto"><div className="grid min-w-[430px] grid-cols-6 gap-1 text-center text-[10px]"><span />{metrics.map((m) => <span key={m.key} className="self-end py-2 text-muted-foreground">{m.label}</span>)}{metrics.map((row) => <div key={row.key} className="contents"><span className="self-center text-left text-muted-foreground">{row.label}</span>{metrics.map((col) => { const value = row.key === col.key ? 1 : correlation(rows, row.key, col.key); const opacity = Math.max(.12, Math.abs(value)); return <span title={`${row.label} / ${col.label}: ${value.toFixed(2)}`} key={col.key} className="grid aspect-square place-items-center rounded-md text-[10px] font-semibold" style={{ backgroundColor: `color-mix(in oklab, ${value >= 0 ? palette.coral : palette.sky} ${Math.round(opacity * 80)}%, var(--card))` }}>{value.toFixed(2)}</span>; })}</div>)}</div></div></Panel>;
}

function DataTable({ rows }: { rows: Student[] }) {
  const [query, setQuery] = useState(""); const [sort, setSort] = useState<SortKey>("studentId"); const [ascending, setAscending] = useState(true);
  const shown = useMemo(() => rows.filter((r) => `${r.studentId} ${r.gender} ${r.academicLevel} ${r.country} ${r.platform}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (Number(a[sort]) - Number(b[sort])) * (ascending ? 1 : -1)).slice(0, 20), [rows, query, sort, ascending]);
  const sortBy = (key: SortKey) => { if (sort === key) setAscending((v) => !v); else { setSort(key); setAscending(true); } };
  const columns: { label: string; key?: SortKey }[] = [{ label: "Student ID", key: "studentId" }, { label: "Age", key: "age" }, { label: "Gender" }, { label: "Academic Level" }, { label: "Country" }, { label: "Daily Usage", key: "dailyUsage" }, { label: "Platform" }, { label: "Sleep", key: "sleepHours" }, { label: "Mental Health", key: "mentalHealth" }, { label: "Addiction", key: "addictionScore" }];
  return <Panel title="Student Records" subtitle="Search and sort the filtered student sample"><div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID, country, platform…" className="rounded-xl bg-background pl-9" /></div><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-xs"><thead><tr className="border-b border-border text-muted-foreground">{columns.map((c) => <th key={c.label} className="px-3 py-3 font-medium">{c.key ? <button onClick={() => sortBy(c.key as SortKey)} className="inline-flex items-center gap-1 cursor-pointer">{c.label}<ChevronsUpDown className="size-3" /></button> : c.label}</th>)}</tr></thead><tbody>{shown.map((r) => <tr key={r.studentId} className="border-b border-border/70 transition-colors hover:bg-muted/60"><td className="px-3 py-3 font-semibold">#{String(r.studentId).padStart(3, "0")}</td><td className="px-3 py-3">{r.age}</td><td className="px-3 py-3">{r.gender}</td><td className="px-3 py-3">{r.academicLevel}</td><td className="px-3 py-3">{r.country}</td><td className="px-3 py-3 tabular-nums">{r.dailyUsage}h</td><td className="px-3 py-3">{r.platform}</td><td className="px-3 py-3 tabular-nums">{r.sleepHours}h</td><td className="px-3 py-3 tabular-nums">{r.mentalHealth}/10</td><td className="px-3 py-3"><span className={`rounded-md px-2 py-1 font-semibold ${r.addictionScore >= 8 ? "bg-coral-soft text-coral" : r.addictionScore >= 6 ? "bg-butter-soft text-butter-strong" : "bg-sage-soft text-sage-strong"}`}>{r.addictionScore}</span></td></tr>)}</tbody></table></div><p className="mt-3 text-[11px] text-muted-foreground">Showing {shown.length} of {rows.length} matching students</p></Panel>;
}

function Insights({ rows }: { rows: Student[] }) {
  const topPlatform = grouped(rows, "platform")[0]; const topLevel = grouped(rows, "academicLevel", "dailyUsage")[0]; const affected = rows.filter((r) => r.academicImpact === "Yes").length; const highRisk = rows.filter((r) => r.addictionScore >= 8); const riskGender = grouped(highRisk, "gender")[0];
  const insights = [
    { icon: BarChart3, title: "Platform preference", value: topPlatform?.name ?? "—", text: `${topPlatform?.value ?? 0} students use it most often.` },
    { icon: BookOpenCheck, title: "Highest usage group", value: topLevel?.name ?? "—", text: `${topLevel?.value ?? 0} average hours of daily use.` },
    { icon: Activity, title: "Usage & addiction", value: `r = ${correlation(rows, "dailyUsage", "addictionScore").toFixed(2)}`, text: "A strong positive relationship appears in the selected cohort." },
    { icon: Moon, title: "Sleep & addiction", value: `r = ${correlation(rows, "sleepHours", "addictionScore").toFixed(2)}`, text: "Higher addiction scores tend to coincide with less sleep." },
    { icon: Brain, title: "Mental health & addiction", value: `r = ${correlation(rows, "mentalHealth", "addictionScore").toFixed(2)}`, text: "Higher addiction scores align with lower well-being scores." },
    { icon: BookOpenCheck, title: "Academic effect", value: `${rows.length ? Math.round(affected / rows.length * 100) : 0}%`, text: "of selected students report an academic impact." },
    { icon: Users, title: "High-risk group", value: riskGender ? `${riskGender.name} students` : "—", text: `${highRisk.length} students score 8 or higher for addiction risk.` },
  ];
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{insights.map(({ icon: Icon, title, value, text }) => <article key={title} className="clay rounded-2xl border border-border bg-card p-5"><span className="grid size-9 place-items-center rounded-xl bg-coral-soft text-coral"><Icon className="size-4" /></span><p className="mt-5 text-xs font-semibold uppercase text-muted-foreground">{title}</p><h2 className="mt-1 font-display text-2xl font-semibold">{value}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div>;
}

function About() {
  return <div className="grid gap-3 lg:grid-cols-[1.3fr_.7fr]"><Panel title="About this analysis" subtitle="A portfolio-ready exploration of digital behavior and student well-being"><div className="space-y-4 text-sm leading-7 text-muted-foreground"><p>This interactive dashboard translates a 705-row student social media dataset into a clear analytical narrative. It examines daily usage, platform preference, academic impact, sleep, mental health, relationship status, conflict, and addiction risk.</p><p>Every chart and KPI responds to the active filters, helping identify patterns across demographic and academic groups. The sample data mirrors the structure and scale of the supplied notebook, so the interface works immediately.</p><div className="rounded-xl bg-muted p-4 text-xs"><strong className="text-foreground">Dataset quality:</strong> 13 columns · 705 rows · no missing values · no duplicate records</div></div></Panel><Panel title="Measures included"><ul className="space-y-3 text-sm text-muted-foreground">{["Demographics and academic level", "Daily usage and preferred platform", "Sleep and mental health", "Academic performance impact", "Relationship status and conflicts", "Addiction risk score"].map((item) => <li key={item} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-coral" />{item}</li>)}</ul></Panel></div>;
}

export function AnalyticsApp({ view }: { view: View }) {
  const [filters, setFilters] = useState(initialFilters); const [mobileOpen, setMobileOpen] = useState(false);
  const filtered = useMemo(() => students.filter((row) => (filters.gender === "All" || row.gender === filters.gender) && (filters.level === "All" || row.academicLevel === filters.level) && (filters.country === "All" || row.country === filters.country) && (filters.platform === "All" || row.platform === filters.platform) && (filters.status === "All" || row.relationshipStatus === filters.status) && (filters.impact === "All" || row.academicImpact === filters.impact)), [filters]);
  const update = (key: keyof Filters) => (value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const download = () => { const header = "Student_ID,Age,Gender,Academic_Level,Country,Avg_Daily_Usage_Hours,Most_Used_Platform,Affects_Academic_Performance,Sleep_Hours_Per_Night,Mental_Health_Score,Relationship_Status,Conflicts_Over_Social_Media,Addicted_Score"; const csv = [header, ...filtered.map((r) => [r.studentId, r.age, r.gender, r.academicLevel, r.country, r.dailyUsage, r.platform, r.academicImpact, r.sleepHours, r.mentalHealth, r.relationshipStatus, r.conflicts, r.addictionScore].join(","))].join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "student-social-media-report.csv"; a.click(); URL.revokeObjectURL(a.href); };
  const titles: Record<View, [string, string]> = { dashboard: ["Student Social Media Analytics", "Insights into Social Media Usage, Academic Performance & Student Well-being"], students: ["Student Analysis", "Explore individual student records and risk indicators"], usage: ["Social Media Usage", "Compare platform preferences and daily usage patterns"], academic: ["Academic Impact", "Understand how digital habits relate to academic outcomes"], health: ["Health & Well-being", "Explore sleep, mental health, and addiction relationships"], insights: ["Analytical Insights", "Automatically generated findings from the selected cohort"], about: ["About Project", "Dataset scope, analytical goals, and measures"] };
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => <aside className={`${mobile ? "fixed inset-y-0 left-0 z-50 flex w-[250px] shadow-2xl" : "fixed inset-y-0 left-0 z-30 hidden w-[236px] lg:flex"} m-3 mr-0 flex-col rounded-r-[26px] border border-border bg-card/95 px-3 py-4 backdrop-blur`}><div className="mb-6 flex items-center gap-2.5 px-2"><div className="grid size-9 place-items-center rounded-xl bg-coral text-xs font-semibold text-coral-foreground">SL</div><div className="leading-tight"><p className="font-display text-[13px] font-semibold">Student Lens</p><p className="text-[10px] text-muted-foreground">Analytics notebook</p></div>{mobile && <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></Button>}</div><nav className="flex flex-col gap-1">{navItems.map(({ label, to, icon: Icon, view: itemView }) => <Button key={label} asChild variant={itemView === view ? "navActive" : "nav"} className="justify-start"><Link to={to} onClick={() => setMobileOpen(false)}><Icon />{label}</Link></Button>)}</nav><div className="mt-auto rounded-2xl bg-butter-soft p-3"><p className="font-display text-xs font-semibold">Export session</p><p className="mt-0.5 text-[10px] text-muted-foreground">{filtered.length} rows · filtered view</p><Button variant="default" size="sm" className="mt-2 w-full" onClick={download}><Download />Download Report</Button></div></aside>;
  return <div className="min-h-screen bg-background font-body text-foreground antialiased"><Sidebar />{mobileOpen && <><div className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={() => setMobileOpen(false)} /><Sidebar mobile /></>}<div className="p-3 lg:pl-[252px] lg:pr-4"><header className="flex items-start justify-between gap-3 px-1 py-3"><div className="flex min-w-0 items-start gap-3"><Button variant="outline" size="icon" className="shrink-0 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></Button><div><h1 className="max-w-[32ch] text-balance font-display text-2xl font-semibold leading-tight sm:text-3xl">{titles[view][0]}</h1><p className="mt-1 max-w-[65ch] text-pretty text-sm text-muted-foreground">{titles[view][1]}</p></div></div><div className="hidden items-center gap-2 sm:flex"><Button variant="outline" onClick={() => setFilters(initialFilters)}><RefreshCcw />Reset Filters</Button><Button onClick={download}><Download />Download Report</Button></div></header><section className="mb-4 mt-2 rounded-2xl border border-border bg-card p-2.5"><div className="flex items-center gap-2 px-1.5 pb-2 text-xs text-muted-foreground"><Filter className="size-4" />Filters <span className="ml-auto rounded-lg bg-muted px-2 py-1 tabular-nums">{filtered.length} of 705</span></div><div className="flex flex-wrap gap-2"><SelectFilter label="Gender" value={filters.gender} values={["Female", "Male"]} onChange={update("gender")} /><SelectFilter label="Level" value={filters.level} values={["High School", "Undergraduate", "Graduate"]} onChange={update("level")} /><SelectFilter label="Country" value={filters.country} values={[...new Set(students.map((r) => r.country))].sort()} onChange={update("country")} /><SelectFilter label="Platform" value={filters.platform} values={[...new Set(students.map((r) => r.platform))].sort()} onChange={update("platform")} /><SelectFilter label="Relationship" value={filters.status} values={["Single", "In Relationship", "Complicated"]} onChange={update("status")} /><SelectFilter label="Academic impact" value={filters.impact} values={["Yes", "No"]} onChange={update("impact")} /></div><div className="mt-2 flex gap-2 sm:hidden"><Button variant="outline" size="sm" className="flex-1" onClick={() => setFilters(initialFilters)}><RefreshCcw />Reset</Button><Button size="sm" className="flex-1" onClick={download}><Download />Report</Button></div></section>{!filtered.length ? <div className="grid min-h-80 place-items-center rounded-2xl border border-border bg-card text-center"><div><Filter className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 font-display text-xl font-semibold">No students match</h2><p className="mt-1 text-sm text-muted-foreground">Reset the filters to restore the full sample.</p><Button className="mt-4" onClick={() => setFilters(initialFilters)}>Reset Filters</Button></div></div> : <main className="space-y-3 pb-8">{view === "dashboard" && <><Kpis rows={filtered} /><div className="grid gap-3 xl:grid-cols-12"><div className="xl:col-span-8"><ScatterPanel rows={filtered} kind="usage" /></div><div className="xl:col-span-4"><ImpactDonut rows={filtered} /></div><div className="xl:col-span-6"><PlatformChart rows={filtered} /></div><div className="xl:col-span-6"><CountryChart rows={filtered} /></div><div className="xl:col-span-6"><AcademicUsageChart rows={filtered} /></div><div className="xl:col-span-6"><DistributionChart rows={filtered} /></div><div className="xl:col-span-6"><ScatterPanel rows={filtered} kind="sleep" /></div><div className="xl:col-span-6"><Heatmap rows={filtered} /></div></div></>}{view === "students" && <DataTable rows={filtered} />}{view === "usage" && <div className="grid gap-3 xl:grid-cols-2"><PlatformChart rows={filtered} /><AcademicUsageChart rows={filtered} /><DistributionChart rows={filtered} /><ScatterPanel rows={filtered} kind="usage" /></div>}{view === "academic" && <><Kpis rows={filtered} /><div className="grid gap-3 xl:grid-cols-2"><ImpactDonut rows={filtered} /><AcademicUsageChart rows={filtered} /><ScatterPanel rows={filtered} kind="usage" /><CountryChart rows={filtered} /></div></>}{view === "health" && <div className="grid gap-3 xl:grid-cols-2"><ScatterPanel rows={filtered} kind="sleep" /><ScatterPanel rows={filtered} kind="mental" /><DistributionChart rows={filtered} /><GenderBoxPlot rows={filtered} /></div>}{view === "insights" && <Insights rows={filtered} />}{view === "about" && <About />}</main>}</div></div>;
}
