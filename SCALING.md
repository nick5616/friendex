# Scaling & Costs

What running Friendex costs as it grows, what's been done to keep that near
zero, what's left, and some ideas for later. Prices are approximate (Firebase
Blaze / Netlify as of late 2026) — check the current pricing pages before
relying on exact numbers.

## Where the money goes

| Resource | Driven by | Free tier |
|---|---|---|
| Firestore storage | Photo sprites + friends docs | 1 GiB |
| Firestore writes | One friends-doc write per edit (800ms debounce) + photo uploads | 20k/day |
| Firestore reads | One per app open, catch count, photos only on a new device | 50k/day |
| Firestore egress | Friends doc on each open, sprites on new devices | 10 GiB/mo |
| Hosting bandwidth | First install + app chunk re-download after each deploy | Netlify: plan-dependent; Cloudflare Pages: unmetered |
| Auth | Google sign-in | Free (Identity Platform: 50k MAU, then ~$0.0055/MAU) |

## Scale math

Per active user per month: 50 friends, 60% with photos, 20 opens, 30 edits,
~8 deploys.

**Before** (512px JPEGs in the cloud, 6MB of TTF fonts, single 375KB bundle):
~2MB stored and ~5MB of hosting bandwidth per user. Free storage ran out
around 500 users.

**After** (64px sprites, 34KB of woff2 fonts, vendor chunks split out):

| Users | Stored | Ops/mo | Hosting/mo | ~$/mo |
|---|---|---|---|---|
| 1–10 | ~1MB | trivial | < 10MB | $0 |
| 100 | ~12MB | ~8k | ~50MB | $0 |
| 500 | ~60MB | ~40k | ~250MB | $0 |
| 2,000 | ~230MB | ~160k | ~1GB | $0 |
| 10,000 | ~1.2GB | ~800k | ~5GB | ~$0.05 |
| 50,000 | ~6GB | ~4M (writes over free) | ~25GB | ~$4 |
| 100,000 | ~12GB | ~8M | ~50GB | ~$10, plus Auth if on Identity Platform |

(~115KB stored per user: ~30 sprites at ~3KB plus a ~25KB friends doc.)

The first thing to cost real money is now write volume around 30–50k active
users, not storage at 500.

## Done

- [x] **Fonts subset to Latin woff2.** Gaegu shipped its full Korean glyph set
  (3MB per weight). Now ~17KB each; Silkscreen 32KB → 8KB. Cached for a week.
- [x] **Vendor chunks** (`vendor`, `vendor-firebase`, `vendor-motion`) keep
  stable hashes across deploys, so returning users re-download ~46KB instead
  of ~375KB after an update.
- [x] **Photos sync as 64px sprites** (~3KB vs ~70KB). Full photos stay on the
  device that added them; other devices draw the sprite pixelated. Old
  full-size cloud photos are overwritten with sprites by any device that still
  has the original.
- [x] **Firestore rule caps photo docs at 16k chars**, so a modified client
  can't fill storage. (Paste the rules from `FIREBASE_SETUP.md` into the
  console — they aren't deployed from the repo.)

## To do — infrastructure

- [ ] **Deploy the new Firestore rules** from `FIREBASE_SETUP.md`.
- [ ] **Budget alert + kill switch.** Budget alerts alone don't stop spending.
  Google's documented pattern: budget → Pub/Sub → Cloud Function that
  disables billing. Or stay on the Spark plan, which hard-stops at quota
  (an outage instead of a bill).
- [ ] **App Check** (reCAPTCHA Enterprise on web). The API key is public by
  design; App Check is what stops a script from hammering Firestore with a
  real Google login. This is the actual cost risk, far more than organic
  growth.
- [ ] **Move hosting to Cloudflare Pages** if bandwidth ever matters.
  Unmetered static bandwidth; `_headers` and `_redirects` work as-is.
- [ ] **Service worker bypasses the immutable cache** for `/assets/` (it fetches
  with `cache: "no-cache"`), so every load revalidates each chunk. Cheap
  (304s), but unnecessary now that chunks are hashed.
- [ ] **Write rate-limiting** via rules is possible (`request.time` vs a stored
  timestamp) but would reject fast legitimate edits with the current sync, which
  doesn't retry. Needs retry-on-failure first.
- [ ] **Friends doc 1MB limit.** At ~500 bytes/friend that's ~2,000 friends.
  Fine for now; a power user with long notes could hit it. Fix: shard into
  one doc per friend (more reads/writes, but per-friend diffs).
- [ ] Pre-existing lint errors in `useFirestoreSync.js` (unused
  destructured vars) and `FriendAvatar.jsx` (non-component export).

## Funding — on hold

No pricing for now. Instead the app grows with you: an unlock ladder
(`src/unlocks.js`) hands out more as your dex fills up, and at 10 friends it
just asks "Do you like it?" (answer stays on the device). Costs are low enough
that nothing needs to be charged until well past 50k users.

| Friends | Unlock |
|---|---|
| start | Red & Blue versions |
| 5 / 10 / 20 | Yellow / Crystal (+ "Do you like it?") / Ruby |
| 30 | Color customizer |
| 40 | Sapphire |
| 50 | Color harmonies in the customizer |
| 60 | Emerald |
| 75 | Mix it up! |
| 100 | Pearl |
| 151 / 251 / 386 | Kanto / Johto / Hoenn badges |
| 493 | Sinnoh badge — a full Gen IV dex — and a shiny trainer card |

Trainer titles climb alongside: Rookie → Trainer (10) → Ace Trainer (30) →
Gym Leader (50) → Elite Four (100) → region Champions.

If money ever comes back on the table, the options considered were: tip jar
(no Stripe needed), one-time supporter cosmetics, printed trainer cards / QR
stickers, freemium cloud sync (keep local-only free), and ads (rejected).

## Postulations

- **Generated sprites for friends without photos.** Deterministic, client-side
  creature/silhouette built from data already in the dex (types, interests,
  colors, initials). Zero inference cost, no one's actual face. Natural next
  step from the "Who's that friend?" placeholders.
- **AI likeness from web-searched descriptors** — parked. The friends being
  described never signed up, and gathering web data about private people
  pooled across the user base is profile-building on non-consenting people
  (GDPR/CCPA exposure, likely fails Google OAuth review). It would also cost
  inference money per friend and produce generic faces, not likenesses. If an
  AI angle is wanted, keep it to data the user typed in, on-device.
- **Sprite palette quantization** (true 16-color Gen-1 look): posterize before
  encoding. Purely aesthetic; size is already small.
