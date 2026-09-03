// Civic Editorial notifications: a quiet, chronological feed keeps public-service updates useful rather than noisy.
import { Bell, CheckCircle2, ChevronRight, Clock3, HeartHandshake, MessageCircle, Settings2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import CivicShell from "@/components/CivicShell";
import { notifications } from "@/data/mockData";

const iconFor = (kind: string) => kind === "status" ? Clock3 : kind === "community" ? HeartHandshake : CheckCircle2;

export default function Notifications() {
  return <CivicShell title="Notifications" eyebrow="Stay in the loop" action={<button className="quiet-link" onClick={() => toast.success("Notification preferences are saved.")}><Settings2 size={15} /> Preferences</button>}>
    <section className="notifications-intro"><div><span className="section-kicker">Two new updates</span><h2>Useful signals, right on time.</h2><p>We’ll only notify you about reports you follow, updates from service teams, and moments that need your input.</p></div><div className="notification-control"><Bell size={19} /><span>All report updates<br /><strong>On</strong></span><ChevronRight size={15} /></div></section>
    <section className="notification-feed"><div className="feed-day"><span>Today</span><i /></div>{notifications.slice(0, 1).map((item) => { const Icon = iconFor(item.kind); return <Link href="/issues/CG-2048" className={`notification-row ${item.unread ? "unread" : ""}`} key={item.id}><div className="notification-icon"><Icon size={18} /></div><div className="notification-copy"><div className="notification-line"><strong>{item.title}</strong>{item.unread && <span className="unread-dot" />}</div><p>{item.detail}</p><span>{item.time}</span></div><ChevronRight size={17} /></Link>; })}<div className="feed-day"><span>Earlier</span><i /></div>{notifications.slice(1).map((item) => { const Icon = iconFor(item.kind); return <Link href={item.kind === "resolution" ? "/issues/CG-1994" : "/issues/CG-2031"} className={`notification-row ${item.unread ? "unread" : ""}`} key={item.id}><div className="notification-icon"><Icon size={18} /></div><div className="notification-copy"><div className="notification-line"><strong>{item.title}</strong>{item.unread && <span className="unread-dot" />}</div><p>{item.detail}</p><span>{item.time}</span></div><ChevronRight size={17} /></Link>; })}</section>
    <div className="notification-trust"><ShieldCheck size={17} /><span>Notifications are sent only for reports you created or chose to support. <button onClick={() => toast("Notification preferences are available from this page.")}>Manage preferences</button></span></div>
  </CivicShell>;
}
