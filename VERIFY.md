# Emergency data verification

Last review: **2026-10-24**. Data lives in `src/data/emergency.js`. A record is
marked verified (`lastVerified` set, shown as "Verified <date>" in the Plan tab)
only when an official government source confirms it. Everything else is shown
as "Unverified — confirm with official sources".

## Verified against official sources

| Record | Value | Source |
|---|---|---|
| King County Emergency Management | (206) 296-3830 | [kingcounty.gov — OEM About](https://kingcounty.gov/en/dept/executive-services/governance-leadership/emergency-management/about) |
| ALERT King County sign-up | Everbridge `member.everbridge.net/index/101672076443713` | [kingcounty.gov — ALERT King County](https://kingcounty.gov/en/dept/executive-services/health-safety/safety-injury-prevention/emergency-preparedness/alert-king-county) |
| Chelan County Emergency Management | (509) 667-6863 | [co.chelan.wa.us/emergency-management](https://www.co.chelan.wa.us/emergency-management) |
| Chelan County alert sign-up | Everbridge `member.everbridge.net/406411280384261/login` | same |
| Chelan County evacuation-level lookup | ArcGIS Experience `634880e7…` | same |
| Kittitas County Sheriff (ask for Emergency Mgmt) | (509) 962-7525 | [co.kittitas.wa.us/sheriff/emergency.aspx](https://www.co.kittitas.wa.us/sheriff/emergency.aspx) |
| Kittitas County alert sign-up | Everbridge `member.everbridge.net/337829242601599/login` | same |
| Kittitas County evacuation-level lookup | ArcGIS Experience `cbd279e3…` | same |
| Kittitas Valley Event Center as **animal/livestock** shelter | 901 E 7th Ave, Ellensburg | [Kittitas County press release, 2014-08-02](http://www.co.kittitas.wa.us/press/default.aspx?prID=5518) |

## Corrected (changed in the data — please confirm)

1. **Chelan County contact** — `(509) 667-6500` ("Chelan County Sheriff") is not
   listed on the Sheriff's [contacts page](https://www.co.chelan.wa.us/sheriff/contacts).
   Replaced with Chelan County Emergency Management `(509) 667-6863` (official
   EM page). Also replaced in the Icicle Canyon route text.
2. **Leavenworth routes** — Primary said "US-2 West to Wenatchee" (Wenatchee is
   east) and the alternate "US-2 East to Cashmere" went the same direction.
   Now: Primary = US-2 East via Peshastin/Cashmere toward Wenatchee; Alternate
   = US-2 West through Tumwater Canyon over Stevens Pass. Old alternate text
   "south to Wenatchee via US-97 Alt" removed (US-97 Alt runs Wenatchee→Chelan,
   per [WSDOT/US 97 Alt](https://en.wikipedia.org/wiki/U.S._Route_97_Alternate)).
   Drive-time estimates for both were removed (unknown).
3. **Wenatchee alternate / Ellensburg alternate** — "US-97 Alt" between
   Wenatchee and Ellensburg replaced with US-97 over Blewett Pass (+ US-2
   between Peshastin and Wenatchee).
4. **"Chelan County Fairgrounds (5700 Wenas Rd, Wenatchee)"** — the fairgrounds
   is the Chelan County Expo Center, **5700 Wescott Dr, Cashmere**. Wenas Rd is
   in Yakima County.
5. **Kirkland primary** — "Exit SR-522 west toward Woodinville" → **east**
   (Woodinville is east of I-405 on SR-522).
6. **Woodinville High School** address `14508 NE 171st St` → **19819 136th Ave
   NE** ([woodinville.nsd.org](https://woodinville.nsd.org/our-school/directions)).
7. **North Bend Elementary** address `123 E 4th St` → **400 E 3rd St** (WIAA /
   school listings).
8. **Putnam Centennial Center** address `719 E 1st St` → **719 E 3rd St**, Cle
   Elum (WA DOH listing; Kiwanis; Sept 2025 Lambert Rd fire coverage).
9. **"Kittitas County Event Center" vs "Kittitas Valley Event Center"** — unified
   as Kittitas Valley Event Center (the county's own name for it,
   [co.kittitas.wa.us/kvec](https://co.kittitas.wa.us/kvec)).
10. **Ellensburg "In city" option** — previously said KVEC was a "confirmed active
    shelter in past fires". Official records show it housed **animals and
    livestock**; people were sheltered elsewhere (Mercer Creek Church, 2014).
    Text and labels changed accordingly.
11. **Cle Elum SR-903 route** — "Kittitas County EM's #1 evacuation risk" claim
    removed (no source found). Replaced with "only paved road out of Roslyn,
    Ronald, and Lake Cle Elum" (Wikipedia; consistent with 2024 WA State
    Standard reporting). Still unverified as an official route.
12. **"WA-Alert"** — no public system by that name was found. References removed
    from the shelter disclaimer and King County route text; the Plan tab now
    links each county's real alert sign-up instead. Repeated references to
    `kingcounty.gov/emergencymanagement` (unverified URL) were dropped for the
    same reason.
13. **Issaquah primary** — claim that I-90 is the "primary evacuation corridor per
    the 2025 Evacuation Time Study" softened to a pointer to the study; the
    study PDF could not be read (HTTP 403) to confirm it.
14. **Live King County evacuation routes** (Plan tab) — the ArcGIS endpoint
    `services.arcgis.com/hn7l5M5rFpMhKGf0/.../EvacuationRoutes_public` returns
    `{"error":{"code":400,"message":"Invalid URL"}}`, which the app displayed as
    "No active evacuation orders in King County". Section removed.

## Still unverified — needs an official source

- **All 24 evacuation routes** (names, directions, and use-if conditions). No
  county or city publishes these as official routes for these communities.
  The Issaquah [public evacuation route map](https://www.issaquahwa.gov/DocumentCenter/View/11307/Public-Evacuation-Route-Map)
  and [ArcGIS evacuation routes layer](https://apps.issaquahwa.gov/server/rest/services/SingleLayers/Evacuation_Routes/MapServer)
  are candidates for Issaquah/Sammamish.
- **All drive-time estimates** ("Est. 25 min" etc.).
- **All "people" shelters** — none is confirmed by an official source as a
  designated or past wildfire shelter: Woodinville HS, Seattle Center, Kenmore
  City Hall, Bellevue College, Redmond City Hall, Renton Technical College,
  North Bend Elementary, Kent Commons, Auburn Multi-Service Center, Everett
  Community College, Kittitas Valley Event Center (people), Central Washington
  University, Douglas County Fairgrounds, Chelan County Expo Center, Putnam
  Centennial Center.
  - Putnam Centennial Center opened as a shelter in the Sept 2025 Lambert Rd
    fire per [NBC Right Now](https://www.nbcrightnow.com/fires/fire-prompts-evacuations-near-cle-elum-on-lambert-road/article_218fff40-6d54-4a04-987f-e8fe74476e66.html)
    (news, not an official release).
  - **Auburn Multi-Service Center at 1 E Main St is likely wrong**: 1 E Main St
    is the City of Auburn customer service center, and the Multi-Service Center
    is a social-services nonprofit, not a known shelter site.
- **Icicle Rd** "dead-end canyon with no alternate exit" — consistent with
  Chelan County EM describing Leavenworth's "limited egress routes" ([Wenatchee
  World](https://www.wenatcheeworld.com/wildfire/the-complexities-of-wildfire-evacuations-in-chelan-and-douglas-counties/article_85d91f77-47bb-45d8-b305-d19e133a0703.html))
  but not confirmed.
- **"Kittitas County may convert SR-10 to one-way outbound"** — no source found.
- **2-1-1 WA as a disaster helpline** — [wa211.org](https://wa211.org/) confirms
  211 connects to community services but the home page doesn't state disaster
  support explicitly.
- **King County evacuation-zone lookup** — none found. If King County adopts
  Genasys Protect or similar, add it to `COUNTY_RESOURCES.King.evacMapUrl`.
- **Radio stations** in the generic fallback text ("AM 950 KBBO (east WA) or
  KOMO 1000 (west WA)") — not checked. Sammamish's evacuation page reportedly
  points to AM 540 instead.

## How to verify an entry

1. Find the claim on an official county, city, WSDOT, or Red Cross page.
2. In `src/data/emergency.js`, set `source` to that URL and `lastVerified` to
   today's date (`YYYY-MM-DD`), correcting the text if needed.
3. Remove the item from this file.
