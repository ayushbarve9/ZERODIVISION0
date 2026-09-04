// Civic Editorial complaints workspace: editorial list rows and status filters make a resident's report history scannable without hiding the next action.
import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, ChevronRight, Clock3, Filter, MessageCircle, Search, ThumbsUp } from "lucide-react";
import { Link } from "wouter";
import CivicShell from "@/components/CivicShell";
import { mockIssues } from "@/data/mockData";

function StatusPill({ status }: { status: string }) {
  const tone = status === "Resolved" ? "resolved" : status === "In progress" ? "progress" : "review";
  return <span className={`status-pill ${tone}`}><i />{status}</span>;
}

export default function MyComplaints() {
  const [filter, setFilter] = useState("All reports");
  const [query, setQuery] = useState("");
  const filters = ["All reports", "In progress", "Under review", "Resolved"];
  const filtered = useMemo(() => mockIssues.filter((issue) => (filter === "All reports" || issue.status === filter) && `${issue.title} ${issue.category} ${issue.location}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);

  return (
    <CivicShell title="My complaints" eyebrow="Your reporting history" action={<Link href="/report" className="button button-primary"><span>+</span> New report</Link>}>
      <section className="complaints-summary">
        <div>
          <span className="section-kicker">A clear trail of action</span>
          <h2>Every report has a next step.</h2>
          <p>Follow the work, add context, and verify a fix when it reaches your street.</p>
        </div>
        <div className="summary-stats">
          <div><strong>{mockIssues.length}</strong><span>Total reports</span></div>
          <div><strong>{mockIssues.filter(i => i.status === 'Resolved').length}</strong><span>Resolved</span></div>
          <div><strong>{mockIssues.filter(i => i.status !== 'Resolved').length}</strong><span>Active</span></div>
        </div>
      </section>

      <div className="complaints-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="Filter complaints">
          {filters.map((item) => {
            const count = mockIssues.filter(i => item === "All reports" ? true : i.status === item).length;
            return (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                {item} {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
        <label className="list-search">
          <Search size={15} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports" aria-label="Search reports" />
          <Filter size={15} />
        </label>
      </div>

      <section className="complaints-list">
        <div className="list-heading">
          <span>{filtered.length} reports</span>
          <span>Last update <Clock3 size={13} /></span>
        </div>
        {filtered.map((issue) => (
          <Link key={issue.id} href={`/issues/${issue.id}`} className="complaint-row">
            <div className="complaint-image"><img src={issue.image} alt="" /></div>
            <div className="complaint-main">
              <div className="complaint-topline">
                <span className="issue-id">{issue.id}</span>
                <span className="complaint-date">Reported {issue.reportedAt}</span>
              </div>
              <h3>{issue.title}</h3>
              <div className="complaint-location">
                <span>{issue.category}</span><span>·</span><span>{issue.location}</span>
              </div>
              <div className="complaint-bottom">
                <StatusPill status={issue.status} />
                <span><MessageCircle size={13} /> {issue.comments} updates</span>
                <span><ThumbsUp size={13} /> {issue.supporters} neighbors</span>
              </div>
            </div>
            <div className="complaint-update">
              <span>Updated {issue.updatedAt}</span>
              <strong>{issue.status === "Resolved" ? "Review resolution" : issue.status === "In progress" ? "View progress" : "View report"}</strong>
              <ChevronRight size={18} />
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <CheckCircle2 size={23} />
            <h3>No reports found</h3>
            <p>You have not logged any civic complaints yet. Use the "+ New report" button to submit one.</p>
          </div>
        )}
      </section>

      <div className="complaints-footnote">
        <ArrowUpRight size={15} />
        <span>Reports are retained for 24 months to keep neighborhood patterns visible to service teams.</span>
      </div>
    </CivicShell>
  );
}
