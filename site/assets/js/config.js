/* ==========================================================================
   GH Veilig Fietsen: all shop data in one place.
   Everything marked TODO must be confirmed with the owner before going live.
   ========================================================================== */
window.GH = {
  name: "GH Veilig Fietsen",
  phoneDisplay: "06 85775914",
  phoneIntl: "+31685775914",
  whatsapp: "31685775914",           // TODO: confirm this number is on WhatsApp
  email: "",                         // TODO: e.g. "info@ghveiligfietsen.nl" (leave empty to hide)
  street: "Lange Jansstraat 26",     // NB: brief said "Lange Janssstraat"; the real street is Lange Jansstraat
  postcode: "3512 BB",
  city: "Utrecht",
  mapsQuery: "GH Veilig Fietsen, Lange Jansstraat 26, 3512 BB Utrecht",
  rating: 4.5,
  reviewCount: 279,
  googleReviewUrl: "https://www.google.com/maps/search/?api=1&query=GH+Veilig+Fietsen+Lange+Jansstraat+26+Utrecht", // TODO: replace with the direct "write a review" link (g.page/r/…/review)
  socials: { instagram: "", facebook: "", tiktok: "" }, // TODO
  kvk: "",                           // TODO: KVK number
  formEndpoint: "",                  // optional: Formspree/Basin URL. Empty = forms open WhatsApp with the message prefilled.

  /* Opening hours (Europe/Amsterdam). 0 = Sunday … 6 = Saturday. null = closed.
     Source: the "Openingstijden" board in the shop window (photo).
     TODO: CONFIRM. Google lists closing at 19:00, the window board says 18:00. */
  hours: {
    1: ["09:00", "18:00"],
    2: ["09:00", "18:00"],
    3: ["09:00", "18:00"],
    4: ["09:00", "18:00"],
    5: ["09:00", "18:00"],
    6: ["09:00", "18:00"],
    0: ["12:00", "18:00"]
  },

  /* Fixed prices: ONLY tyre, inner tube, brakes and chain. Anchored on € 30 for patching a flat.
     Tyre, brakes and chain show the REPLACEMENT price only; repairing the original is mentioned
     (canFix) but never priced: that's quoted in the shop after checking the bike.
     from: true → "vanaf / from" (parts depend on the bike). TODO: CONFIRM with the owner. */
  repairs: [
    { nl: "Binnenband", en: "Inner tube", rows: [
      { nl: "Plakken", en: "Patch", price: 30 },
      { nl: "Vervangen", en: "Replace", price: 40 }
    ] },
    { nl: "Buitenband", en: "Tyre", canFix: true, rows: [
      { nl: "Vervangen", en: "Replace", price: 50, from: true, note: { nl: "incl. band en binnenband", en: "incl. tyre and tube" } }
    ] },
    { nl: "Remmen", en: "Brakes", canFix: true, rows: [
      { nl: "Remblokjes vervangen", en: "Replace brake pads", price: 35, note: { nl: "incl. blokjes", en: "incl. pads" } }
    ] },
    { nl: "Ketting", en: "Chain", canFix: true, rows: [
      { nl: "Vervangen", en: "Replace", price: 45, from: true, note: { nl: "incl. ketting", en: "incl. chain" } }
    ] }
  ],

  /* Everything else we fix: shown WITHOUT prices in a carousel.
     These are quoted in the shop, after checking the bike. icon = id from the sprite (#i-…). */
  services: [
    { icon: "wheel", nl: "Wiel richten", en: "Wheel truing" },
    { icon: "wheel", nl: "Spaken vervangen", en: "Spoke replacement" },
    { icon: "wheel", nl: "Nieuw voor- of achterwiel", en: "New front or rear wheel" },
    { icon: "wheel", nl: "Ventiel vervangen", en: "Valve replacement" },
    { icon: "shield", nl: "Remmen afstellen", en: "Brake adjustment" },
    { icon: "shield", nl: "Remkabels", en: "Brake cables" },
    { icon: "shield", nl: "Terugtraprem", en: "Coaster brakes" },
    { icon: "shield", nl: "Rollerbrake & trommelrem", en: "Roller & drum brakes" },
    { icon: "gear", nl: "Versnellingsnaaf (Nexus, Sturmey)", en: "Hub gears (Nexus, Sturmey)" },
    { icon: "gear", nl: "Versnelling afstellen", en: "Gear adjustment" },
    { icon: "gear", nl: "Versnellingskabels", en: "Gear cables" },
    { icon: "gear", nl: "Trapas & crank", en: "Bottom bracket & cranks" },
    { icon: "gear", nl: "Pedalen", en: "Pedals" },
    { icon: "gear", nl: "Ketting spannen & smeren", en: "Chain tension & oiling" },
    { icon: "light", nl: "Verlichting & dynamo", en: "Lights & dynamo" },
    { icon: "lock", nl: "Ringslot & kettingslot", en: "Frame & chain locks" },
    { icon: "frame", nl: "Standaard", en: "Kickstand" },
    { icon: "frame", nl: "Spatborden & kettingkast", en: "Mudguards & chain guard" },
    { icon: "frame", nl: "Bagagedrager & mand", en: "Rack & basket" },
    { icon: "frame", nl: "Kinderzitje monteren", en: "Child seat fitting" },
    { icon: "wrench", nl: "Zadel & stuur", en: "Saddle & handlebar" },
    { icon: "wrench", nl: "Handvatten & bel", en: "Grips & bell" },
    { icon: "wrench", nl: "Kleine beurt", en: "Basic service" },
    { icon: "wrench", nl: "Grote beurt", en: "Full service" },
    { icon: "bolt", nl: "E-bike check", en: "E-bike check" },
    { icon: "bike", nl: "Transportfietsen", en: "Cargo & transport bikes" },
    { icon: "bike", nl: "Kinderfietsen", en: "Kids' bikes" }
  ],

  /* Rental prices. TODO: CONFIRM. */
  rental: [
    { nl: "Dag", en: "Day", price: "€ 12,50", sub: { nl: "ideaal voor een dagje Utrecht", en: "perfect for a day in Utrecht" } },
    { nl: "Week", en: "Week", price: "€ 45", sub: { nl: "voor bezoek of je eerste week", en: "for visitors or your first week" }, hot: true },
    { nl: "Maand", en: "Month", price: "€ 75", sub: { nl: "tot je een eigen fiets hebt", en: "until you have your own bike" } }
  ],
  rentalDeposit: "€ 50", // TODO: CONFIRM

  /* Bike stock. Example stock only: replace with real bikes and photos.
     photo + credit: freely licensed example photos of the MODEL (Wikimedia Commons, in Wix Media).
     Shown with a "Voorbeeldfoto" credit. Replace with photos of the real bike; then drop `credit`.
     Local photos live in assets/img/bikes/. fit: "contain" shows a cut-out product shot whole, on white.
     type: stadsfiets | omafiets | opafiets | transportfiets | ebike | kinderfiets
     condition: likenew | good | used    frame in cm (kids: wheel inches) */
  bikes: [
    { id: 1, name: "Gazelle Primeur", type: "stadsfiets", isNew: false, condition: "good", frame: 57, gears: 3, price: 249, step: false,
      photo: "https://static.wixstatic.com/media/ee585c_1bfcf4cfb9b74b568270630f4e07cdd9~mv2.jpg/v1/fill/w_800,h_600,al_c,q_80,enc_auto/gazelle-primeur.jpg",
      credit: { by: "Bwilli88", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Gazelle_Primeur_(1).jpg" } },
    { id: 2, name: "Batavus Old Dutch", type: "omafiets", isNew: false, condition: "used", frame: 53, gears: 1, price: 149, step: true,
      photo: "assets/img/bikes/batavus-old-dutch.webp", fit: "contain" },
    { id: 3, name: "Studentenfiets opa", type: "opafiets", isNew: false, condition: "used", frame: 61, gears: 1, price: 99, step: false,
      photo: "assets/img/bikes/studentenfiets-opa.webp", fit: "contain" },
    { id: 4, name: "Cortina U4 Transport", type: "transportfiets", isNew: false, condition: "likenew", frame: 57, gears: 3, price: 349, step: true,
      photo: "assets/img/bikes/cortina-u4-transport.webp", fit: "contain" },
    { id: 5, name: "Sparta M7b e-bike", type: "ebike", isNew: false, condition: "good", frame: 53, gears: 7, price: 1195, step: true,
      photo: "assets/img/bikes/sparta-m7b-e-bike.jpg", fit: "contain" },
    { id: 6, name: "Alpina Yipeeh 20\"", type: "kinderfiets", isNew: false, condition: "good", frame: 20, gears: 1, price: 129, step: true,
      photo: "assets/img/bikes/alpina-yipeeh-20.webp", fit: "contain" },
    { id: 7, name: "Popal Daily Dutch", type: "omafiets", isNew: true, condition: "new", frame: 57, gears: 3, price: 429, step: true,
      photo: "assets/img/bikes/popal-daily-dutch.jpg", fit: "contain" },
    { id: 8, name: "Union Flow N3", type: "stadsfiets", isNew: false, condition: "good", frame: 61, gears: 3, price: 279, step: false,
      photo: "assets/img/bikes/union-flow-n3.jpg", fit: "contain" },
    { id: 9, name: "Gazelle Miss Grace", type: "stadsfiets", isNew: false, condition: "likenew", frame: 49, gears: 7, price: 399, step: true,
      photo: "assets/img/bikes/gazelle-miss-grace.jpg", fit: "contain" },
    { id: 10, name: "Batavus Personal", type: "opafiets", isNew: false, condition: "used", frame: 57, gears: 1, price: 119, step: false,
      photo: "assets/img/bikes/batavus-personal.jpg", fit: "contain" }
  ],

  /* Real Google reviews ONLY, with the reviewer's permission. Never invent quotes.
     Format: { name: "Voornaam A.", stars: 5, date: "2026-10", text: "…", lang: "nl" } */
  reviews: []
};
