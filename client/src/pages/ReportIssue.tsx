// Civic Editorial report flow: the form captures only citizen-observable facts and hands the payload to a replaceable intelligence adapter.
import { useRef, useState } from "react";
import { Camera, Check, ChevronLeft, Crosshair, FileImage, Info, LoaderCircle, MapPin, Navigation, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import CivicShell from "@/components/CivicShell";
import { MapView } from "@/components/Map";
import { submitIssue, type IntelligenceResponse, type IssueSeverity } from "@/data/mockData";

const severities: { name: IssueSeverity; hint: string; color: string }[] = [
  { name: "Low", hint: "Cosmetic or minor inconvenience", color: "low" },
  { name: "Medium", hint: "Affects everyday use", color: "medium" },
  { name: "High", hint: "Creates access or safety friction", color: "high" },
  { name: "Critical", hint: "Immediate risk to people or property", color: "critical" },
];

export default function ReportIssue() {
  const [, navigate] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("Medium");
  const [photo, setPhoto] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState("Hawthorne Ave & 8th Street");
  const [coordinates, setCoordinates] = useState({ lat: 40.7411, lng: -73.9897 });
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<IntelligenceResponse | null>(null);

  function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      toast.error("That photo is over 6 MB. Please choose a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Location services are not available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((position) => {
      setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
      setLocationLabel("Your current location");
      setLocating(false);
      toast.success("Location added to your report.");
    }, () => {
      setLocating(false);
      toast.error("We couldn't access your location. You can place the pin manually.");
    }, { enableHighAccuracy: true, timeout: 8000 });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!description.trim()) {
      toast.error("Add a short description so the service team knows what to look for.");
      return;
    }
    setSubmitting(true);
    const intelligence = await submitIssue({ photo, latitude: coordinates.lat, longitude: coordinates.lng, description, severity });
    setResponse(intelligence);
    setSubmitting(false);
    toast.success("Report received. Your issue is now being classified.");
  }

  return (
    <CivicShell title="Report an issue near you" eyebrow="New civic report" action={<Link href="/" className="quiet-link"><ChevronLeft size={15} /> Back to overview</Link>}>
      <div className="report-layout">
        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-progress"><span className="progress-active">01</span><span className="progress-line" /><span>02</span><span className="progress-line muted" /><span>03</span><small>Describe · Place · Send</small></div>
          <section className="form-section"><div className="form-section-heading"><span className="section-kicker">01 / What happened?</span><h2>Show us what needs attention.</h2><p>A photo and a plain-language description help teams act faster. You can report anything from a blocked sidewalk to a broken light.</p></div>
            <div className="photo-upload">
              {photo ? <div className="photo-preview"><img src={photo} alt="Selected civic issue" /><button type="button" className="remove-photo" onClick={() => setPhoto(null)} aria-label="Remove photo"><X size={15} /></button><div className="photo-ready"><Check size={13} /> Photo attached</div></div> : <button type="button" className="upload-dropzone" onClick={() => fileRef.current?.click()}><span className="upload-icon"><Camera size={22} /></span><span><strong>Add a photo</strong><small>JPG or PNG · up to 6 MB</small></span><Upload size={17} className="upload-arrow" /></button>}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handlePhoto} className="visually-hidden" />
            </div>
            <label className="field-label" htmlFor="description">What did you notice?</label>
            <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="For example: The pavement is uneven beside the east crosswalk and collects water after rain." rows={5} maxLength={500} />
            <div className="field-meta"><span>Be specific about what and where.</span><span>{description.length}/500</span></div>
          </section>

          <section className="form-section"><div className="form-section-heading"><span className="section-kicker">02 / How urgent is it?</span><h2>Help us set the first signal.</h2></div><div className="severity-grid">{severities.map((item) => <button type="button" key={item.name} className={`severity-option ${severity === item.name ? "selected" : ""} ${item.color}`} onClick={() => setSeverity(item.name)}><span className="severity-marker" /><span><strong>{item.name}</strong><small>{item.hint}</small></span>{severity === item.name && <Check size={16} />}</button>)}</div><div className="form-note"><Info size={15} /><span>Our service team may adjust priority after reviewing the full context.</span></div></section>

          <section className="form-section"><div className="form-section-heading"><span className="section-kicker">03 / Where is it?</span><h2>Pin the place, not your home.</h2><p>Only the issue location is shared with service teams. Your personal details stay private.</p></div>
            <div className="location-field"><MapPin size={17} /><div><strong>{locationLabel}</strong><span>{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span></div><button type="button" className="location-action" onClick={useMyLocation}>{locating ? <LoaderCircle size={15} className="spin" /> : <Navigation size={15} />} {locating ? "Finding you" : "Use my location"}</button></div>
            <div className="map-picker"><MapView initialCenter={coordinates} initialZoom={15} onMapReady={(map) => { if (window.google?.maps?.marker) new window.google.maps.marker.AdvancedMarkerElement({ map, position: coordinates, title: "Issue location" }); }} /><div className="map-overlay-label"><Crosshair size={14} /> Drag the pin to refine the location</div><div className="map-pin"><span /></div></div>
          </section>

          <div className="form-submit-row"><div className="privacy-note-inline"><ShieldCheck size={16} /><span>Private report · visible to your service team</span></div><button type="submit" className="button button-primary button-submit" disabled={submitting}>{submitting ? <><LoaderCircle size={17} className="spin" /> Sending report</> : <><Sparkles size={16} /> Send report</>}</button></div>
        </form>

        <aside className="report-aside"><div className="aside-sticky"><div className="report-aside-card"><span className="section-kicker light">What happens next</span><h3>Your report gets a clear path forward.</h3><div className="next-step"><span className="step-number">1</span><div><strong>We receive it</strong><small>Your report and location are securely sent to the civic service team.</small></div></div><div className="next-step"><span className="step-number">2</span><div><strong>It gets classified</strong><small>An intelligence service suggests category, priority, and duplicate status.</small></div></div><div className="next-step"><span className="step-number">3</span><div><strong>You stay in the loop</strong><small>We’ll show updates here and ask you to verify the resolution.</small></div></div></div><div className="integration-note"><FileImage size={17} /><div><strong>Module handoff</strong><p>Frontend sends <code>photo</code>, <code>latitude</code>, <code>longitude</code>, <code>description</code>, and <code>severity</code>.</p></div></div>{response && <div className="intelligence-result"><div className="result-head"><span className="result-orb"><Check size={15} /></span><div><span className="section-kicker">Intelligence response</span><strong>Handoff received</strong></div></div><div className="result-grid"><div><small>Issue ID</small><strong>{response.issue_id}</strong></div><div><small>Category</small><strong>{response.category}</strong></div><div><small>Priority</small><strong>{response.priority}</strong></div><div><small>Duplicate</small><strong>{response.duplicate_status}</strong></div></div><button type="button" className="text-link" onClick={() => navigate(`/issues/${response.issue_id}`)}>Open report details <Navigation size={14} /></button></div>}</div></aside>
      </div>
    </CivicShell>
  );
}
