// Civic Editorial issue detail: a narrative report column and sticky decision rail make the resident's next civic action unambiguous.
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, CheckCircle2, ChevronDown, Clock3, Flag, HeartHandshake, MapPin, MessageCircle, MoreHorizontal, RotateCcw, Send, ShieldCheck, Sparkles, ThumbsUp, UserRound } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import CivicShell from "@/components/CivicShell";
import { getIssue } from "@/data/mockData";
import { WhyThisModal } from "@intel/components/intelligence/WhyThisModal";
const WhyThisModalComponent = WhyThisModal as any;

function StatusPill({ status }: { status: string }) {
  const tone = status === "Resolved" ? "resolved" : status === "In progress" ? "progress" : "review";
  return <span className={`status-pill ${tone}`}><i />{status}</span>;
}

export default function IssueDetails() {
  const [, params] = useRoute("/issues/:id");
  const issue = getIssue(params?.id);
  const [supported, setSupported] = useState(false);
  const [comment, setComment] = useState("");
  const [verified, setVerified] = useState(false);
  const [reopened, setReopened] = useState(false);
  const [showAiDiag, setShowAiDiag] = useState(false);

  function addComment(event: React.FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    toast.success("Update added to your report.");
    setComment("");
  }

  function verifyResolution() {
    setVerified(true);
    toast.success("Thanks for confirming the resolution.");
  }

  function reopenIssue() {
    setReopened(true);
    toast.success("The service team has been asked to review this report again.");
  }

  if (!issue) {
    return (
      <CivicShell title="Report Not Found" eyebrow="Common Ground" action={<Link href="/complaints" className="button button-primary">All Reports</Link>}>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#F2FFF6' }}>
          <h2 style={{ marginBottom: '8px', fontSize: '18px' }}>Report Not Found</h2>
          <p style={{ color: 'rgba(242, 255, 246, 0.7)', fontSize: '13px', marginBottom: '20px' }}>
            The requested incident report does not exist or has been cleared from active queues.
          </p>
          <Link href="/complaints" className="button button-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Return to Complaint History
          </Link>
        </div>
      </CivicShell>
    );
  }

  const displayedStatus = reopened ? "Under review" : issue.status;
  return <CivicShell title={issue.title} eyebrow={`Report ${issue.id}`} action={<Link href="/complaints" className="quiet-link"><ArrowLeft size={15} /> Back to complaints</Link>}>
    <div className="detail-layout">
      <div className="detail-main">
        <div className="detail-hero-image"><img src={issue.image} alt="Neighborhood view related to this issue" /><div className="detail-image-meta"><span className="image-stamp">{issue.id}</span><span>Reported {issue.reportedAt}</span></div></div>
        <div className="detail-meta-row"><StatusPill status={displayedStatus} /><span className="severity-tag"><i className={issue.severity.toLowerCase()} /> {issue.severity} severity</span><span className="meta-location"><MapPin size={14} /> {issue.location}</span></div>
        <p className="detail-lede">{issue.description}</p>
        <div className="detail-actions">
          <button className={`support-button ${supported ? "supported" : ""}`} onClick={() => setSupported(!supported)}><ThumbsUp size={16} /> {supported ? "Supported" : "Support this report"} <span>{issue.supporters + (supported ? 1 : 0)}</span></button>
          <button className="detail-action" style={{ color: "#0369a1", borderColor: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", fontWeight: 600 }} onClick={() => setShowAiDiag(true)}><Sparkles size={15} /> AI Root-Cause Diagnostic</button>
          <button className="detail-action"><Flag size={15} /> Add context</button>
          <button className="detail-action icon-only" aria-label="More issue actions"><MoreHorizontal size={17} /></button>
        </div>

        <section className="timeline-section"><div className="section-heading"><div><span className="section-kicker">The journey so far</span><h2>Complaint timeline</h2></div><span className="last-updated"><Clock3 size={14} /> Updated {issue.updatedAt}</span></div><div className="timeline">{issue.timeline.map((item, index) => <div className={`timeline-item ${item.complete ? "complete" : "pending"}`} key={item.label}><div className="timeline-marker">{item.complete ? <Check size={13} /> : <span />}</div><div className="timeline-line" /><div className="timeline-copy"><div className="timeline-top"><strong>{item.label}</strong><span>{item.date}</span></div><p>{item.detail}</p>{index === 3 && item.complete && <div className="timeline-note"><span className="note-bar" />A field crew has been assigned to complete the repair this week.</div>}</div></div>)}</div></section>

        <section className="comments-section"><div className="section-heading"><div><span className="section-kicker">Keep the context clear</span><h2>Comments & updates <span>({issue.comments})</span></h2></div><button className="quiet-link">Newest first <ChevronDown size={15} /></button></div><div className="comment-item"><div className="comment-avatar">MC</div><div><div className="comment-head"><strong>You</strong><span>12 Sep 2024 · 09:42</span></div><p>Reported the pothole after noticing it was making the crosswalk difficult to use.</p></div></div><div className="comment-item team-comment"><div className="team-avatar"><ShieldCheck size={15} /></div><div><div className="comment-head"><strong>Street maintenance</strong><span>Today · 08:18</span><span className="team-label">Service team</span></div><p>Thanks for the clear location. A crew has been scheduled to inspect and repair the area this week.</p></div></div><form className="comment-composer" onSubmit={addComment}><UserRound size={17} /><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a useful update for the service team" aria-label="Add a comment" /><button type="submit" aria-label="Send comment"><Send size={16} /></button></form></section>
      </div>

      <aside className="detail-aside"><div className="decision-card"><div className="decision-header"><span className="section-kicker">Your next step</span><span className="decision-icon"><HeartHandshake size={17} /></span></div>{issue.status === "Resolved" && !verified && !reopened ? <><h3>Does this look fixed?</h3><p>Your verification helps the team close the loop with confidence.</p><button className="button button-primary full-button" onClick={verifyResolution}><CheckCircle2 size={16} /> Yes, verify resolution</button><button className="secondary-button full-button" onClick={reopenIssue}><RotateCcw size={15} /> Not yet — reopen issue</button></> : <><h3>{reopened ? "Review requested again" : verified ? "Resolution verified" : "We’re on it"}</h3><p>{reopened ? "We’ve kept the report visible so the service team can take another look." : verified ? "Thanks for helping keep the neighborhood record accurate." : "You can add context or support the report while work is underway."}</p><div className="decision-complete"><span><Check size={14} /></span>{reopened ? "Reopen request sent" : verified ? "Verified by you" : "Service team assigned"}</div></>}
          <div className="decision-divider" /><div className="decision-stat"><span><ThumbsUp size={15} /> Community support</span><strong>{issue.supporters + (supported ? 1 : 0)}</strong></div><div className="decision-stat"><span><MessageCircle size={15} /> Public updates</span><strong>{issue.comments}</strong></div></div><div className="privacy-card"><ShieldCheck size={17} /><div><strong>Private by default</strong><p>Your profile details are never shown on the public issue map.</p></div></div><Link href="/nearby" className="back-map-card"><span><MapPin size={16} /> View on neighborhood map</span><ArrowUpRight size={15} /></Link></aside>
    </div>

    {showAiDiag && (
      <WhyThisModalComponent
        issue={{
          issueId: issue.id,
          category: (issue.category as any) || "Pothole",
          latitude: issue.coordinates.lat,
          longitude: issue.coordinates.lng,
          priorityScore: issue.severity === "Critical" ? 95 : issue.severity === "High" ? 82 : 60,
          duplicateCount: 3,
          status: issue.status === "In progress" ? "In Progress" : (issue.status as any),
          department: issue.category === "Water Leakage" ? "Water & Power" : "Public Works",
          communityImpact: 84,
          riskLevel: issue.severity,
          slaDeadline: new Date(Date.now() + 12 * 3600000).toISOString(),
          isRecurring: true,
          address: issue.location,
          createdAt: new Date().toISOString()
        }}
        onClose={() => setShowAiDiag(false)}
      />
    )}
  </CivicShell>;
}
