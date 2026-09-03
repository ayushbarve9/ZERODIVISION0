// Civic Editorial dashboard: an uneven editorial composition turns civic data into a readable story of what changed, what needs attention, and what a resident can do next.
import { ArrowUpRight, Check, ChevronRight, Clock3, FilePlus2, LocateFixed, MessageCircle, Plus, Radio, Sparkles, ThumbsUp, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import CivicShell from "@/components/CivicShell";
import { mockIssues, issueImages } from "@/data/mockData";

function StatusPill({ status }: { status: string }) {
  const tone = status === "Resolved" ? "resolved" : status === "In progress" ? "progress" : "review";
  return <span className={`status-pill ${tone}`}><i />{status}</span>;
}

export default function Home() {
  const activeIssue = mockIssues[0];
  return (
    <CivicShell
      title="Small reports. Visible progress."
      eyebrow="Good morning, Maya"
      action={<Link href="/report" className="button button-primary"><Plus size={17} /> Report an issue</Link>}
    >
      <section className="dashboard-intro">
        <div className="intro-copy"><p>Keep your neighborhood moving forward. You have <strong>one active report</strong> and two updates waiting.</p><Link href="/complaints" className="text-link">View your complaint history <ArrowUpRight size={15} /></Link></div>
        <Link href="/intelligence" className="intro-stamp" style={{ textDecoration: "none", cursor: "pointer" }} title="Open City Command Center"><span className="stamp-line" /><span>District 4<br /><strong>Live Operations</strong></span><Radio size={16} /></Link>
      </section>

      <section className="metric-row" aria-label="Your activity summary">
        <div className="metric-card metric-card-featured"><div className="metric-top"><span className="metric-label">Reports this year</span><TrendingUp size={16} /></div><strong>14</strong><span className="metric-foot positive"><ArrowUpRight size={13} /> 18% from last year</span></div>
        <div className="metric-card"><div className="metric-top"><span className="metric-label">Resolved</span><Check size={16} /></div><strong>11</strong><span className="metric-foot">79% resolution rate</span></div>
        <div className="metric-card"><div className="metric-top"><span className="metric-label">Neighbors reached</span><ThumbsUp size={16} /></div><strong>126</strong><span className="metric-foot">Across 8 shared reports</span></div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <section className="section-block">
            <div className="section-heading"><div><span className="section-kicker">Needs your attention</span><h2>Active report</h2></div><Link href="/complaints" className="quiet-link">All complaints <ChevronRight size={15} /></Link></div>
            <Link href={`/issues/${activeIssue.id}`} className="active-issue-card">
              <div className="active-issue-image"><img src={activeIssue.image} alt="Pothole beside an urban crosswalk" /><span className="image-stamp">{activeIssue.id}</span></div>
              <div className="active-issue-body"><div className="issue-row"><StatusPill status={activeIssue.status} /><span className="issue-updated"><Clock3 size={13} /> Updated {activeIssue.updatedAt.toLowerCase()}</span></div><h3>{activeIssue.title}</h3><p>{activeIssue.location}</p><div className="active-issue-footer"><span>Street maintenance crew assigned</span><ArrowUpRight size={17} /></div></div>
            </Link>
          </section>

          <section className="section-block activity-block">
            <div className="section-heading"><div><span className="section-kicker">Your neighborhood</span><h2>Recent civic activity</h2></div><Link href="/nearby" className="quiet-link">Explore nearby <ChevronRight size={15} /></Link></div>
            <div className="activity-list">
              {mockIssues.slice(1).map((issue) => <Link to={`/issues/${issue.id}`} className="activity-item" key={issue.id}><div className="activity-thumb"><img src={issue.image} alt="" /></div><div className="activity-copy"><div className="activity-meta"><span>{issue.category}</span><span>{issue.updatedAt}</span></div><h3>{issue.title}</h3><div className="activity-detail"><StatusPill status={issue.status} /><span><MessageCircle size={13} /> {issue.comments} comments</span><span><ThumbsUp size={13} /> {issue.supporters}</span></div></div><ChevronRight className="activity-arrow" size={18} /></Link>)}
            </div>
          </section>
        </div>

        <aside className="dashboard-aside">
          <section className="impact-card">
            <div className="impact-image"><img src={issueImages.community} alt="Neighbors discussing a local street issue" /><div className="impact-overlay" /></div>
            <div className="impact-content"><span className="section-kicker light">The bigger picture</span><h2>One report can shift a street.</h2><p>Your updates help service teams spot patterns earlier. Keep the signal clear.</p><Link href="/nearby" className="button button-light">See the neighborhood map <ArrowUpRight size={15} /></Link></div>
          </section>
          <section className="quick-actions">
            <div className="section-heading"><div><span className="section-kicker">Make a difference</span><h2>Quick actions</h2></div><Sparkles size={17} className="moss-icon" /></div>
            <Link href="/report" className="quick-action"><span className="quick-icon mint"><FilePlus2 size={17} /></span><span><strong>Report something new</strong><small>Photo, location, and a short description</small></span><ChevronRight size={16} /></Link>
            <Link href="/nearby" className="quick-action"><span className="quick-icon sand"><LocateFixed size={17} /></span><span><strong>See what’s nearby</strong><small>Support an issue on your block</small></span><ChevronRight size={16} /></Link>
            <Link href="/intelligence" className="quick-action"><span className="quick-icon" style={{ background: "#dff0fa", color: "#0284c7" }}><Radio size={17} /></span><span><strong>City Command Center</strong><small>Live GIS telemetry & diagnostics</small></span><ChevronRight size={16} /></Link>
          </section>
        </aside>
      </div>
    </CivicShell>
  );
}
