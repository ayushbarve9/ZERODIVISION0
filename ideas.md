# Citizen Portal — Design Direction

## Three stylistic approaches

### Theme Name: Civic Editorial
Very light civic software with editorial typography, strong wayfinding, and a warm paper-like canvas that feels considered rather than bureaucratic.

Probability: 0.04

### Theme Name: Quiet Infrastructure
An airy, architectural dashboard built around pale mineral tones, fine linework, and a calm sense of public service.

Probability: 0.08

### Theme Name: Signal Commons
A bold, low-key interface where high-contrast civic signals, dark map surfaces, and restrained luminous accents make status and urgency immediately legible.

Probability: 0.02

## Selected approach: Civic Editorial

### Design Movement
Swiss International Style softened by contemporary civic editorial design: a disciplined information hierarchy, generous margins, and a warm, human visual voice rather than a cold municipal portal.

### Core Principles
1. **Clarity before decoration:** every card, status, and action should make the next civic step obvious.
2. **Human-scale systems:** pair precise infrastructure data with approachable language and real neighborhood imagery.
3. **Asymmetric rhythm:** use a strong left navigation rail, editorial split layouts, and off-center focal panels instead of a centered app template.
4. **Trust through restraint:** use contrast and color only for hierarchy, urgency, and progress; avoid gratuitous gradients or visual noise.

### Color Philosophy
The base is warm parchment (#F6F4EE) rather than sterile white, creating a sense of place and printed civic documents. Deep ink (#163438) anchors navigation and high-trust content. A mint-derived **Civic Moss** (#75C7B2) owns positive progress and community action without feeling like generic tech green. Signal coral (#E56B51) is reserved for urgent issues and reopen actions. Muted mineral green-gray (#718887) supports metadata and maps.

### Layout Paradigm
A persistent left rail establishes orientation; the main workspace is an editorial canvas with a narrow utility column on the right. Dashboard views use uneven two-column compositions (roughly 1.45fr / 0.95fr) with inset panels and visual pauses. Detail views use a wide narrative column plus a sticky decision rail.

### Signature Elements
- **Civic Moss rule:** a thin vertical moss line appears beside active navigation, timeline progress, and high-confidence status.
- **Issue stamp:** severity and workflow state are presented as compact, uppercase editorial stamps with small geometric markers.
- **Paper / glass layering:** warm canvas, white surface cards, and frosted utility drawers create depth without uniform rounded rectangles.

### Interaction Philosophy
Every interaction should feel like a clear handoff: selecting a location pins it, submitting a report confirms what will happen next, and status changes explain the public-service action rather than merely changing color. Hover states lift cards by 2px and reveal a moss edge; buttons respond with a restrained press scale; toasts are concise and actionable.

### Animation
Use fast, low-drama transitions: 160–220ms ease-out for controls and route changes. Stagger dashboard sections by 40ms only on first entry. Use a 3px map-pin pulse for fresh reports and a subtle progress shimmer on active timeline steps. Respect prefers-reduced-motion and never animate layout dimensions.

### Typography System
Use **DM Sans** for interface copy, labels, and numeric data; use **Newsreader** for large editorial headlines and contextual empty states. Headlines are sentence case with tight tracking; eyebrow labels are 11px uppercase with 0.14em tracking; body copy is 14–16px with 1.55 line height. Never use Inter.

### Brand Essence
**Common Ground** is a calm, transparent civic reporting space for residents who want to turn local friction into visible action — differentiated by explaining the journey from report to resolution.

Personality: **grounded, clear, neighborly**.

### Brand Voice
Headlines are direct and human. CTAs describe the civic action and the next result. Microcopy is specific, plainspoken, and quietly reassuring; no bureaucratic filler.

Example headline: “Small reports. Visible progress.”

Example CTA: “Report an issue near you”.

### Wordmark & Logo
Use a custom compact mark: two offset rounded rectangles forming a shared speech-bubble / map-pin silhouette, with the inner negative space resembling a small path through a neighborhood block. The wordmark pairs a slightly tracked DM Sans semibold “common” with a Newsreader italic “ground”. Do not use a default text-only wordmark in the UI; display the symbol beside the name.

### Signature Brand Color
**Civic Moss — #75C7B2**. This is the ownable brand color: optimistic, civic, and legible against deep ink, parchment, and white surfaces.

## Integration contract reminders

- Keep issue submission assembled in one adapter function with the shape: `{ photo, latitude, longitude, description, severity }`.
- Treat downstream intelligence as a response boundary: `{ issue_id, category, priority, duplicate_status }`.
- Use mock adapters and local state for the frontend demonstration; do not implement AI logic in this module.
- Keep status, comments, timeline, notifications, community support, reopen, and resolution verification as replaceable UI actions so other team members can wire their modules later.
