# NOWHEN — Plan to sell the Persona drop

_Written 2 Nov 2026 from the live store data. Re-check the numbers in Admin → Inventory before you start._

## Where things stand

| | |
|---|---|
| Product | NOWHEN Persona Oversized T-Shirt – Black, ₹699 |
| Stock | **25 tees**: S 3 · M 6 · L 6 · **XL 10** |
| Value at full price | ₹17,475 |
| Paid orders so far | 0 (2 checkouts started on 31 Aug, never paid — ₹3,594) |
| Email subscribers | 0 |
| Discount codes | none yet |

What this means:

- **25 pieces is a small, winnable number.** You don't need ads to sell them. You need about 25 people who already half-know you. The plan is built around your own network first, then Instagram, and a discount only at the end.
- **XL is the problem size.** It's 40% of the stock. Most of the content below pushes "size up for the baggy fit", so XL becomes the size people pick on purpose.
- **Email can't help yet** because nobody is on the list. Everything starts on WhatsApp and Instagram. Email becomes useful once you have buyers.
- **Never fake a "was" price.** The new compare-at price field is for genuine reductions only, e.g. ₹699 → ₹549 in the final week. Inflated MRPs are misleading under Indian consumer rules, and people notice.

## Before you start (one evening)

1. **Run the database update** (needed for the new sale-price and bundle features):
   `node add-sale-fields.js` from the NOWHEN folder, then merge/deploy the `optimise/speed-seo-conversion` branch.
2. **Shoot real photos of the actual tee.** The current product image looks like a generated mockup. Add 3–4 phone photos to the product: front and back worn, a close-up of the back print, and the same tee on two different body sizes (this sells the oversized fit). Use daylight and a plain wall. Real photos are the single biggest trust boost for a new brand.
3. **Add a size chart** to the product description: chest width and length in inches for S, M, L and XL. Measure a tee flat. For oversized tees, fit is the #1 reason people don't buy online.
4. **Check the 2 unpaid checkouts** (Admin → Orders, status "created", 31 Aug). If they were real people and not your own tests, message them personally: _"Hey! Saw you tried to grab the Persona tee — payment didn't go through. Want me to send you a direct link?"_
5. **Create these codes** in Admin → Offers:

   | Code | Setting | Use |
   |---|---|---|
   | `BUY2` | ₹200 off, minimum items **2** | "2 for ₹1,198": one for you, one for a friend |
   | `CREW` | 10% off, expires in 7 days | Friends & family launch week only |
   | one per creator, e.g. `RIYA` | 10% off | Lets you see which creator actually sold tees (Admin → Orders shows the code) |

6. **Turn on the promo bar** (Admin → Settings): `PERSONA DROP — ONLY 25 MADE · 2 FOR ₹1,198 WITH CODE BUY2` linking to `/shop/24`.
   Only say "only 25 made / no restock" if that's true.

## Week 1 — Friends, family, colleagues (target: 10 tees)

Your first 10 buyers are people who already know one of you. Each of the three founders makes a list of 30 people and messages them **one by one** (not a broadcast). A personal message gets several times the replies of a group post.

**WhatsApp message (personal, edit the first line per person):**

> Hey [name]! Big news: the three of us finally launched our clothing brand, NOWHEN 🖤
> First drop is the Persona oversized tee: "Outside of Time" on the front, the Persona graphic on the back. We only made 25.
> ₹699, or 2 for ₹1,198 with code BUY2 if you want to split with someone.
> nowhen.in/shop/24
> Would mean a lot if you checked it out, and even more if you sent it to one friend who'd wear it 🙏

**WhatsApp Status / Instagram Story (post daily this week):**
- Day 1: back-print photo — "IT'S LIVE. 25 pieces. Link in bio."
- Day 2: packing your first order — "Order #1 going out 📦"
- Day 3: poll sticker — "Front or back print?"
- Day 4: fit video, S vs XL on the same person — "Size up for the baggy look"
- Day 5: countdown — "[X] left"
- Day 6: screenshot of a friend's message or photo (ask them first)
- Day 7: "CREW code ends tonight"

**Offline:** your admin panel already records offline sales. Bring 6–8 tees (mostly L and XL) to a college fest, a flea market, a gym or office meet-up, and take UPI on the spot.

## Weeks 2–3 — Instagram (target: 10 more tees)

Post 3 times a week, plus stories every day. Reels reach new people; static posts don't. Each reel should take under an hour to make.

| # | Reel idea | Hook text on screen |
|---|---|---|
| 1 | Slow turn showing the back print, ending on a close-up | "The back is the point." |
| 2 | Same tee on S, L and XL bodies, side by side | "Which size are you? (XL is the move)" |
| 3 | Three friends, one house: packing orders at night | "Started with 3 friends and 25 tees" |
| 4 | One tee styled 3 ways (cargos, shorts, open shirt over it) | "1 tee, 3 fits" |
| 5 | Stock counter — "X left" with the size breakdown | "When it's gone, it's gone" |
| 6 | Customer photo or mirror selfie (ask first) | "Persona in the wild" |

**Caption template:**

> Persona — the first NOWHEN drop.
> Oversized fit, "Outside of Time" on the front, Persona on the back.
> 25 made. [X] left.
> 2 for ₹1,198 with code BUY2 → link in bio
> #nowhen #oversizedtshirt #streetwearindia #graphictee #indianstreetwear #ootdindia

**Micro-creators (budget: 2–3 tees).** Find 5–10 local creators with 2k–20k followers who post outfits. Smaller accounts have more engaged followers and actually reply. DM them:

> Hi [name]! We're a tiny 3-person streetwear brand and love your fits. We'd like to send you our first tee (Persona, oversized) — no strings attached. If you like it, a story would mean the world. What size are you? (XL fits very baggy.)

Give each one their own code (e.g. `RIYA`) so you can see who actually sells.

**Ads (optional):** only once a reel does clearly better than the rest (more saves and shares). Then boost that one reel for ₹1,000–2,000 over 5 days, targeting ages 18–28 in your city with interests in streetwear and sneakers. Don't boost static posts.

## Week 4 — Clear what's left (target: the rest)

1. Edit the product in Admin: set **price ₹549** and **compare-at price ₹699**. The site will show ~~₹699~~ ₹549 · 21% off.
2. Promo bar: `FINAL [X] PIECES — ₹549 · ENDS SUNDAY`.
3. Story: "Last call: [X] left, mostly XL. Wear it baggy."
4. Message everyone who replied in week 1 but didn't buy: _"Last few Persona tees are ₹549 till Sunday, then it's gone for good. Want me to hold an XL for you?"_
5. Anything still left after that: sell it at your next offline pop-up, or give it to creators for content for the next drop.

## Emails (once you have buyers or subscribers)

**After purchase, ~5 days after delivery** (send by hand from contact.nowhen@gmail.com):

> Subject: How's the Persona fitting?
>
> Hey [name],
> Thanks for being one of the first 25. Seriously, it means a lot to three people working out of one house.
> Two quick asks:
> 1. Post a fit pic and tag @nowhen. We'll reshare it.
> 2. Leave a quick review on the product page: nowhen.in/shop/24
> Got a friend who'd wear it? Code BUY2 still works.
> — [your name], NOWHEN

**Last call** (to subscribers and past buyers in week 4):

> Subject: Last [X] Persona tees
>
> The first NOWHEN drop is almost gone: [X] left, mostly XL (wear it baggy).
> ₹549 till Sunday, then we're done with it for good.
> → nowhen.in/shop/24

## Track it (5 minutes every Sunday)

| Week | Tees sold | Via WhatsApp | Via Instagram | Via creators (codes) | Offline | Left |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |

Admin → Orders shows which code each order used. That's how you'll know what worked before the next drop.

## Decisions for you

- **Cost per tee** — this sets the lowest price you can go to. ₹549 assumes you still make money at that price.
- **Is this a true limited run (no restock)?** If not, drop the "only 25 made" lines.
- **Instagram handle** — the site doesn't link to one yet. Add it to the footer once it exists.
- **Dispatch time** — the homepage says 2–3 days, the FAQ says 1–2 business days. Pick one and update the other.
- **Shipping charge** — none is shown at checkout right now. If shipping is free, say so on the product page, because free shipping is a strong selling point.
