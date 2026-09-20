const styleGroups = [
  {
    key: "bauhaus",
    label: "Bauhaus",
    baseFamily: "swiss",
    palette: "saffron",
    treatment: "geometry",
    description: "Geometric forms, functional hierarchy, and primary-color signals.",
    names: [
      "bauhaus-primary",
      "bauhaus-geometry",
      "bauhaus-grid",
      "bauhaus-atelier",
      "bauhaus-functional",
      "bauhaus-asymmetric",
      "bauhaus-study",
      "bauhaus-industrial",
      "bauhaus-colorfield",
      "bauhaus-signal",
    ],
  },
  {
    key: "swiss-objective",
    label: "Swiss / International Typographic",
    baseFamily: "swiss",
    palette: "mono",
    treatment: "grid",
    description: "Objective typography, mathematical grids, and disciplined negative space.",
    names: [
      "swiss-objective",
      "swiss-modular",
      "swiss-redline",
      "swiss-helvetica",
      "swiss-poster",
      "swiss-quiet",
      "swiss-index",
      "swiss-editorial",
      "swiss-utility",
      "swiss-basel",
    ],
  },
  {
    key: "constructivist",
    label: "Constructivist",
    baseFamily: "brutalist",
    palette: "coral",
    treatment: "diagonal",
    description: "Diagonal force, industrial contrast, and poster-like visual momentum.",
    names: [
      "constructivist-diagonal",
      "constructivist-red",
      "constructivist-poster",
      "constructivist-industrial",
      "constructivist-collision",
      "constructivist-rail",
      "constructivist-dynamic",
      "constructivist-ink",
      "constructivist-archive",
      "constructivist-signal",
    ],
  },
  {
    key: "destijl",
    label: "De Stijl",
    baseFamily: "swiss",
    palette: "cobalt",
    treatment: "orthogonal",
    description: "Orthogonal planes, primary blocks, and compositional balance.",
    names: [
      "destijl-primary",
      "destijl-grid",
      "destijl-red-blue",
      "destijl-planes",
      "destijl-orthogonal",
      "destijl-canvas",
      "destijl-neoplastic",
      "destijl-studio",
      "destijl-block",
      "destijl-harmony",
    ],
  },
  {
    key: "art-deco",
    label: "Art Deco",
    baseFamily: "luxury",
    palette: "copper",
    treatment: "deco",
    description: "Symmetry, stepped geometry, metallic accents, and theatrical hierarchy.",
    names: [
      "artdeco-gatsby",
      "artdeco-geometric",
      "artdeco-chrome",
      "artdeco-velvet",
      "artdeco-sunburst",
      "artdeco-emerald",
      "artdeco-goldline",
      "artdeco-palace",
      "artdeco-night",
      "artdeco-modern",
    ],
  },
  {
    key: "art-nouveau",
    label: "Art Nouveau / Jugendstil",
    baseFamily: "organic",
    palette: "plum",
    treatment: "nouveau",
    description: "Botanical curves, flowing linework, and ornamental natural forms.",
    names: [
      "artnouveau-botanical",
      "artnouveau-jugendstil",
      "artnouveau-curve",
      "artnouveau-peacock",
      "artnouveau-ornament",
      "artnouveau-iris",
      "artnouveau-poster",
      "artnouveau-atelier",
      "artnouveau-vine",
      "artnouveau-line",
    ],
  },
  {
    key: "arts-and-crafts",
    label: "Arts & Crafts",
    baseFamily: "organic",
    palette: "sand",
    treatment: "tactile",
    description: "Handmade texture, printed edges, material warmth, and craft detail.",
    names: [
      "artsandcrafts",
      "kelmscott",
      "woodcut",
      "letterpress",
      "blockprint",
      "handbound",
      "folkprint",
      "papergrain",
      "workshop",
      "heritage",
    ],
  },
  {
    key: "midcentury",
    label: "Mid-century Modern",
    baseFamily: "aurora",
    palette: "mint",
    treatment: "midcentury",
    description: "Flat geometry, optimistic color, and playful modernist illustration.",
    names: [
      "midcentury-modern",
      "midcentury-olive",
      "midcentury-paprika",
      "midcentury-catalog",
      "midcentury-atomic",
      "midcentury-studio",
      "midcentury-form",
      "midcentury-house",
      "midcentury-travel",
      "midcentury-optimist",
    ],
  },
  {
    key: "pop-art",
    label: "Pop Art",
    baseFamily: "brutalist",
    palette: "saffron",
    treatment: "halftone",
    description: "High-contrast color, comic rhythm, halftone texture, and cultural energy.",
    names: [
      "popart-primary",
      "popart-comic",
      "popart-halftone",
      "popart-cmyk",
      "popart-collage",
      "popart-sticker",
      "popart-neon",
      "popart-gallery",
      "popart-quote",
      "popart-newsprint",
    ],
  },
  {
    key: "psychedelic",
    label: "Psychedelic",
    baseFamily: "retrofuture",
    palette: "violet",
    treatment: "psychedelic",
    description: "Fluid color, optical rhythm, and expressive poster movement.",
    names: [
      "psychedelic-swirl",
      "psychedelic-acid",
      "psychedelic-poster",
      "psychedelic-sun",
      "psychedelic-liquid",
      "psychedelic-flower",
      "psychedelic-vinyl",
      "psychedelic-rainbow",
      "psychedelic-night",
      "psychedelic-dream",
    ],
  },
  {
    key: "memphis",
    label: "Memphis / Postmodern Play",
    baseFamily: "brutalist",
    palette: "coral",
    treatment: "memphis",
    description: "Playful pattern, irregular geometry, and colorful postmodern surfaces.",
    names: [
      "memphis-milano",
      "memphis-squiggle",
      "memphis-confetti",
      "memphis-pastel",
      "memphis-primary",
      "memphis-pattern",
      "memphis-playground",
      "memphis-pixel",
      "memphis-pop",
      "memphis-soft",
    ],
  },
  {
    key: "postmodern",
    label: "Postmodern Deconstruction",
    baseFamily: "retrofuture",
    palette: "mono",
    treatment: "postmodern",
    description: "Layered type, broken grids, collage logic, and deliberate visual tension.",
    names: [
      "postmodern-layered",
      "postmodern-deconstruct",
      "postmodern-typographic",
      "postmodern-collage",
      "postmodern-ironic",
      "postmodern-gridbreak",
      "postmodern-ransom",
      "postmodern-neo",
      "postmodern-archive",
      "postmodern-raw",
    ],
  },
  {
    key: "editorial-publishing",
    label: "Editorial / Publishing",
    baseFamily: "aurora",
    palette: "ice",
    treatment: "editorial",
    description: "Magazine pacing, reading hierarchy, columns, captions, and long-form clarity.",
    names: [
      "editorial-newspaper",
      "editorial-magazine",
      "editorial-zine",
      "editorial-book",
      "editorial-report",
      "editorial-essay",
      "editorial-index",
      "editorial-literary",
      "editorial-gallery",
      "editorial-modernist",
    ],
  },
  {
    key: "fashion",
    label: "Fashion / Couture",
    baseFamily: "luxury",
    palette: "mono",
    treatment: "fashion",
    description: "Runway restraint, image-led hierarchy, high contrast, and refined spacing.",
    names: [
      "fashion-couture",
      "fashion-runway",
      "fashion-lookbook",
      "fashion-monochrome",
      "fashion-luxury",
      "fashion-beauty",
      "fashion-atelier",
      "fashion-heritage",
      "fashion-minimal",
      "fashion-bold",
    ],
  },
  {
    key: "japanese-inspired",
    label: "Japanese-inspired Minimal",
    baseFamily: "aurora",
    palette: "ocean",
    treatment: "japanese",
    description: "Quiet space, paper texture, restrained marks, and deliberate asymmetry.",
    names: [
      "japanese-ma",
      "japanese-ukiyo",
      "japanese-washi",
      "japanese-zen",
      "japanese-kintsugi",
      "japanese-ink",
      "japanese-architecture",
      "japanese-seasonal",
      "japanese-minimal",
      "japanese-neo",
    ],
  },
  {
    key: "scandinavian",
    label: "Scandinavian / Nordic",
    baseFamily: "aurora",
    palette: "ice",
    treatment: "scandi",
    description: "Functional calm, soft neutrals, generous space, and domestic warmth.",
    names: [
      "scandi-nordic",
      "scandi-hygge",
      "scandi-quiet",
      "scandi-pine",
      "scandi-frost",
      "scandi-warm",
      "scandi-functional",
      "scandi-folk",
      "scandi-atelier",
      "scandi-light",
    ],
  },
  {
    key: "mediterranean",
    label: "Mediterranean / Riviera",
    baseFamily: "organic",
    palette: "sand",
    treatment: "mediterranean",
    description: "Sun-washed surfaces, terracotta contrast, arches, and relaxed hospitality.",
    names: [
      "mediterranean-sun",
      "mediterranean-tile",
      "mediterranean-coastal",
      "mediterranean-terracotta",
      "mediterranean-lemon",
      "mediterranean-olive",
      "mediterranean-cobalt",
      "mediterranean-riviera",
      "mediterranean-market",
      "mediterranean-craft",
    ],
  },
  {
    key: "afrofuturist",
    label: "Afrofuturist-inspired",
    baseFamily: "retrofuture",
    palette: "violet",
    treatment: "afrofuturist",
    description: "Speculative futures, heritage references, bold geometry, and cosmic color.",
    names: [
      "afrofuturist-orbit",
      "afrofuturist-heritage",
      "afrofuturist-kinetic",
      "afrofuturist-metal",
      "afrofuturist-earth",
      "afrofuturist-cosmic",
      "afrofuturist-pattern",
      "afrofuturist-digital",
      "afrofuturist-matriarch",
      "afrofuturist-signal",
    ],
  },
  {
    key: "scientific",
    label: "Scientific / Field Note",
    baseFamily: "datanoir",
    palette: "ocean",
    treatment: "scientific",
    description: "Evidence-first annotation, instrument logic, grids, and measured contrast.",
    names: [
      "scientific-paper",
      "scientific-lab",
      "scientific-blueprint",
      "scientific-geology",
      "scientific-climate",
      "scientific-medical",
      "scientific-astronomy",
      "scientific-fieldnote",
      "scientific-instrument",
      "scientific-evidence",
    ],
  },
  {
    key: "cyberpunk",
    label: "Cyberpunk / Neon Systems",
    baseFamily: "datanoir",
    palette: "cinematic",
    treatment: "cyberpunk",
    description: "Neon signal, terminal texture, hard contrast, and networked futures.",
    names: [
      "cyberpunk-neon",
      "cyberpunk-terminal",
      "cyberpunk-dystopia",
      "cyberpunk-grid",
      "cyberpunk-arcade",
      "cyberpunk-chrome",
      "cyberpunk-rain",
      "cyberpunk-digital",
      "cyberpunk-amber",
      "cyberpunk-signal",
    ],
  },
  {
    key: "material-digital",
    label: "Material / Digital Surface",
    baseFamily: "aurora",
    palette: "mint",
    treatment: "material",
    description: "Surface depth, soft elevation, responsive cards, and product clarity.",
    names: [
      "material-surface",
      "material-glass",
      "material-neumorph",
      "material-flat",
      "material-depth",
      "material-soft",
      "material-dynamic",
      "material-ambient",
      "material-product",
      "material-interface",
    ],
  },
  {
    key: "cinematic",
    label: "Cinematic / Film",
    baseFamily: "midnight",
    palette: "cinematic",
    treatment: "cinematic",
    description: "Widescreen framing, controlled suspense, grain-like texture, and scene pacing.",
    names: [
      "cinematic-noir",
      "cinematic-storyboard",
      "cinematic-filmgrain",
      "cinematic-wide",
      "cinematic-documentary",
      "cinematic-thriller",
      "cinematic-sci-fi",
      "cinematic-amber",
      "cinematic-monochrome",
      "cinematic-festival",
    ],
  },
  {
    key: "dada",
    label: "Dada / Anti-Design",
    baseFamily: "brutalist",
    palette: "mono",
    treatment: "dada",
    description: "Cut-up composition, found language, absurd scale, and deliberate disruption.",
    names: [
      "dada-cutup",
      "dada-cabaret",
      "dada-found",
      "dada-absurd",
      "dada-typographic",
      "dada-manifesto",
      "dada-random",
      "dada-cinema",
      "dada-archive",
      "dada-ready",
    ],
  },
  {
    key: "futurism",
    label: "Futurism / Machine Age",
    baseFamily: "retrofuture",
    palette: "cobalt",
    treatment: "futurism",
    description: "Speed lines, mechanical rhythm, aerodynamic forms, and machine optimism.",
    names: [
      "futurism-speed",
      "futurism-machine",
      "futurism-aero",
      "futurism-kinetic",
      "futurism-turbine",
      "futurism-chrome",
      "futurism-satellite",
      "futurism-velocity",
      "futurism-streamline",
      "futurism-mechanic",
    ],
  },
  {
    key: "suprematism",
    label: "Suprematist / Abstract Geometry",
    baseFamily: "swiss",
    palette: "mono",
    treatment: "suprematism",
    description: "Floating planes, radical abstraction, and tension between scale and emptiness.",
    names: [
      "suprematism-plane",
      "suprematism-red",
      "suprematism-black",
      "suprematism-floating",
      "suprematism-axis",
      "suprematism-white",
      "suprematism-composition",
      "suprematism-study",
      "suprematism-space",
      "suprematism-zero",
    ],
  },
  {
    key: "art-brut",
    label: "Art Brut / Naive",
    baseFamily: "organic",
    palette: "saffron",
    treatment: "artbrut",
    description: "Raw marks, direct color, hand-made edges, and outsider-art energy.",
    names: [
      "artbrut-raw",
      "artbrut-naive",
      "artbrut-chalk",
      "artbrut-outsider",
      "artbrut-childlike",
      "artbrut-folkshape",
      "artbrut-roughpaint",
      "artbrut-handscript",
      "artbrut-streetpaper",
      "artbrut-rawgallery",
    ],
  },
  {
    key: "gothic",
    label: "Gothic / Medieval",
    baseFamily: "luxury",
    palette: "plum",
    treatment: "gothic",
    description: "Cathedral verticals, manuscript detail, dark paper, and ceremonial hierarchy.",
    names: [
      "gothic-cathedral",
      "gothic-manuscript",
      "gothic-blackletter",
      "gothic-stainedglass",
      "gothic-reliquary",
      "gothic-nocturne",
      "gothic-heraldic",
      "gothic-abbey",
      "gothic-illuminated",
      "gothic-crypt",
    ],
  },
  {
    key: "baroque",
    label: "Baroque / Theatrical",
    baseFamily: "luxury",
    palette: "copper",
    treatment: "baroque",
    description: "Dramatic contrast, ornamental framing, movement, and theatrical richness.",
    names: [
      "baroque-opera",
      "baroque-chiaroscuro",
      "baroque-gilded",
      "baroque-court",
      "baroque-velvet",
      "baroque-flourish",
      "baroque-grandtour",
      "baroque-dramatic",
      "baroque-ornament",
      "baroque-salon",
    ],
  },
  {
    key: "rococo",
    label: "Rococo / Playful Ornament",
    baseFamily: "organic",
    palette: "coral",
    treatment: "rococo",
    description: "Pastel ornament, shell curves, garden motifs, and light decorative rhythm.",
    names: [
      "rococo-shell",
      "rococo-pastel",
      "rococo-salon",
      "rococo-scroll",
      "rococo-garden",
      "rococo-cameo",
      "rococo-powder",
      "rococo-fete",
      "rococo-confection",
      "rococo-boudoir",
    ],
  },
  {
    key: "classical",
    label: "Classical / Neoclassical",
    baseFamily: "swiss",
    palette: "sand",
    treatment: "classical",
    description: "Measured proportion, civic structure, marble restraint, and academic clarity.",
    names: [
      "classical-column",
      "classical-marble",
      "classical-roman",
      "classical-academy",
      "classical-civic",
      "classical-proportion",
      "classical-atlas",
      "classical-forum",
      "classical-neoclassic",
      "classical-stoic",
    ],
  },
  {
    key: "victorian",
    label: "Victorian / Industrial Heritage",
    baseFamily: "organic",
    palette: "mono",
    treatment: "victorian",
    description: "Fine rules, print heritage, botanical detail, and industrial-era formality.",
    names: [
      "victorian-press",
      "victorian-railway",
      "victorian-cabinet",
      "victorian-botanical",
      "victorian-parlor",
      "victorian-copperplate",
      "victorian-gaslight",
      "victorian-conservatory",
      "victorian-ledger",
      "victorian-foundry",
    ],
  },
  {
    key: "architectural-modern",
    label: "Architectural Modernism",
    baseFamily: "swiss",
    palette: "ice",
    treatment: "architectural",
    description: "Plans, sections, concrete grids, and spatial logic translated into slides.",
    names: [
      "architectural-plan",
      "architectural-concrete",
      "architectural-cantilever",
      "architectural-facade",
      "architectural-axonometric",
      "architectural-section",
      "architectural-plaza",
      "architectural-tower",
      "architectural-habitat",
      "architectural-monolith",
    ],
  },
  {
    key: "industrial",
    label: "Industrial / Factory",
    baseFamily: "datanoir",
    palette: "forest",
    treatment: "industrial",
    description: "Utility systems, steel surfaces, hard rules, and operational structure.",
    names: [
      "industrial-factory",
      "industrial-grid",
      "industrial-rivet",
      "industrial-warehouse",
      "industrial-utility",
      "industrial-blueprint",
      "industrial-steel",
      "industrial-shift",
      "industrial-conveyor",
      "industrial-plant",
    ],
  },
  {
    key: "tropical-modern",
    label: "Tropical Modernism",
    baseFamily: "organic",
    palette: "mint",
    treatment: "tropical",
    description: "Breezeblock rhythm, sun, foliage, open air, and relaxed modern structure.",
    names: [
      "tropical-canopy",
      "tropical-monsoon",
      "tropical-palm",
      "tropical-breezeblock",
      "tropical-veranda",
      "tropical-lagoon",
      "tropical-resort",
      "tropical-rainforest",
      "tropical-coastal",
      "tropical-sunroom",
    ],
  },
  {
    key: "wabi-sabi",
    label: "Wabi-sabi / Imperfection",
    baseFamily: "aurora",
    palette: "sand",
    treatment: "wabisabi",
    description: "Quiet imperfection, patina, natural material, and unforced asymmetry.",
    names: [
      "wabisabi-quiet",
      "wabisabi-clay",
      "wabisabi-patina",
      "wabisabi-repair",
      "wabisabi-asymmetry",
      "wabisabi-stone",
      "wabisabi-tea",
      "wabisabi-weathered",
      "wabisabi-slow",
      "wabisabi-imperfect",
    ],
  },
  {
    key: "islamic-geometric",
    label: "Islamic Geometric / Moorish",
    baseFamily: "luxury",
    palette: "ocean",
    treatment: "moorish",
    description: "Tessellation, courtyard geometry, lattice, and ornamental spatial rhythm.",
    names: [
      "moorish-tile",
      "moorish-tessellation",
      "moorish-mashrabiya",
      "moorish-courtyard",
      "moorish-arabesque",
      "moorish-zellij",
      "moorish-dome",
      "moorish-lattice",
      "moorish-oasis",
      "moorish-geometry",
    ],
  },
  {
    key: "indian-craft",
    label: "Indian Craft / Block Print",
    baseFamily: "organic",
    palette: "saffron",
    treatment: "indiancraft",
    description: "Block-print rhythm, textile color, market warmth, and hand-crafted pattern.",
    names: [
      "indiacraft-block",
      "indiacraft-textile",
      "indiacraft-jaipur",
      "indiacraft-rangoli",
      "indiacraft-indigo",
      "indiacraft-kalamkari",
      "indiacraft-haveli",
      "indiacraft-monsoon",
      "indiacraft-bazaar",
      "indiacraft-spice",
    ],
  },
  {
    key: "latin-modern",
    label: "Latin Modernism / Color Field",
    baseFamily: "brutalist",
    palette: "coral",
    treatment: "latin",
    description: "Mural color, civic concrete, sun, and expressive modernist blocks.",
    names: [
      "latin-sun",
      "latin-mural",
      "latin-concrete",
      "latin-tropical",
      "latin-modernista",
      "latin-mercado",
      "latin-bright",
      "latin-cinder",
      "latin-plaza",
      "latin-poster",
    ],
  },
  {
    key: "solarpunk",
    label: "Solarpunk / Eco-futurism",
    baseFamily: "organic",
    palette: "mint",
    treatment: "solarpunk",
    description: "Biophilic infrastructure, renewable futures, daylight, and shared commons.",
    names: [
      "solarpunk-garden",
      "solarpunk-canopy",
      "solarpunk-renewable",
      "solarpunk-civic",
      "solarpunk-biophilic",
      "solarpunk-daylight",
      "solarpunk-repair",
      "solarpunk-commons",
      "solarpunk-climate",
      "solarpunk-greenfuture",
    ],
  },
  {
    key: "dark-academia",
    label: "Dark Academia",
    baseFamily: "luxury",
    palette: "plum",
    treatment: "academia",
    description: "Library atmosphere, archival paper, ink, scholarship, and quiet drama.",
    names: [
      "darkacademia-library",
      "darkacademia-study",
      "darkacademia-archive",
      "darkacademia-oxford",
      "darkacademia-ink",
      "darkacademia-lecture",
      "darkacademia-nocturne",
      "darkacademia-classics",
      "darkacademia-observatory",
      "darkacademia-reading",
    ],
  },
  {
    key: "light-academia",
    label: "Light Academia",
    baseFamily: "aurora",
    palette: "sand",
    treatment: "lightacademia",
    description: "Sunlit scholarship, parchment, museum calm, and classical softness.",
    names: [
      "lightacademia-parchment",
      "lightacademia-museum",
      "lightacademia-studio",
      "lightacademia-sunny",
      "lightacademia-classical",
      "lightacademia-linen",
      "lightacademia-lecture",
      "lightacademia-gallery",
      "lightacademia-salon",
      "lightacademia-courtyard",
    ],
  },
  {
    key: "vaporwave",
    label: "Vaporwave / Y2K",
    baseFamily: "retrofuture",
    palette: "violet",
    treatment: "vaporwave",
    description: "Chrome gradients, mall nostalgia, digital sunset, and early-web surrealism.",
    names: [
      "vaporwave-pastel",
      "vaporwave-y2k",
      "vaporwave-mallsoft",
      "vaporwave-chrome",
      "vaporwave-sunset",
      "vaporwave-poolside",
      "vaporwave-cybersigil",
      "vaporwave-arcade",
      "vaporwave-datamosh",
      "vaporwave-dreamweb",
    ],
  },
  {
    key: "webcore",
    label: "Webcore / Internet Nostalgia",
    baseFamily: "datanoir",
    palette: "ocean",
    treatment: "webcore",
    description: "Browser chrome, pixel cues, hyperlink logic, and hand-built web memory.",
    names: [
      "webcore-browser",
      "webcore-geocities",
      "webcore-pixel",
      "webcore-webring",
      "webcore-hyperlink",
      "webcore-portal",
      "webcore-guestbook",
      "webcore-html",
      "webcore-dialup",
      "webcore-desktop",
    ],
  },
  {
    key: "skeuomorphic",
    label: "Skeuomorphic / Object-based",
    baseFamily: "aurora",
    palette: "copper",
    treatment: "skeuomorphic",
    description: "Material surfaces, familiar objects, tactile controls, and layered depth.",
    names: [
      "skeuo-desktop",
      "skeuo-leather",
      "skeuo-paper",
      "skeuo-wood",
      "skeuo-metal",
      "skeuo-notebook",
      "skeuo-dashboard",
      "skeuo-folder",
      "skeuo-studio",
      "skeuo-classic",
    ],
  },
  {
    key: "neo-brutalist",
    label: "Neo-Brutalist / Digital Utility",
    baseFamily: "brutalist",
    palette: "saffron",
    treatment: "neobrutalist",
    description: "Heavy borders, hard shadows, loud type, and utility-first digital layouts.",
    names: [
      "neobrutalist-block",
      "neobrutalist-loud",
      "neobrutalist-acid",
      "neobrutalist-type",
      "neobrutalist-utility",
      "neobrutalist-portfolio",
      "neobrutalist-blackwhite",
      "neobrutalist-poster",
      "neobrutalist-rawweb",
      "neobrutalist-contrast",
    ],
  },
  {
    key: "corporate-memphis",
    label: "Corporate Memphis / Friendly Systems",
    baseFamily: "aurora",
    palette: "cobalt",
    treatment: "corporate",
    description: "Friendly gradients, approachable figures, soft geometry, and service clarity.",
    names: [
      "corporatememphis-friendly",
      "corporatememphis-people",
      "corporatememphis-gradient",
      "corporatememphis-onboarding",
      "corporatememphis-product",
      "corporatememphis-explainer",
      "corporatememphis-team",
      "corporatememphis-service",
      "corporatememphis-workplace",
      "corporatememphis-optimistic",
    ],
  },
  {
    key: "data-visualization",
    label: "Data Visualization / Analytical",
    baseFamily: "datanoir",
    palette: "ice",
    treatment: "datavis",
    description: "Chart-first hierarchy, analytical grids, annotations, and evidence density.",
    names: [
      "datavis-observable",
      "datavis-editorial",
      "datavis-scientific",
      "datavis-network",
      "datavis-flow",
      "datavis-trend",
      "datavis-chart",
      "datavis-map",
      "datavis-evidence",
      "datavis-dashboard",
    ],
  },
  {
    key: "abstract-expressionism",
    label: "Abstract Expressionism",
    baseFamily: "organic",
    palette: "plum",
    treatment: "abstract",
    description:
      "Gesture, painterly movement, expressive color fields, and human-scale imperfection.",
    names: [
      "abex-gesture",
      "abex-colorfield",
      "abex-drip",
      "abex-impasto",
      "abex-splash",
      "abex-canvas",
      "abex-painterly",
      "abex-rhythm",
      "abex-tension",
      "abex-silence",
    ],
  },
  {
    key: "surrealism",
    label: "Surrealism / Dream Logic",
    baseFamily: "luxury",
    palette: "plum",
    treatment: "surreal",
    description:
      "Unexpected scale, dreamlike juxtaposition, portals, and a sense of productive estrangement.",
    names: [
      "surreal-dream",
      "surreal-mirror",
      "surreal-floating",
      "surreal-portal",
      "surreal-uncanny",
      "surreal-collage",
      "surreal-moon",
      "surreal-object",
      "surreal-echo",
      "surreal-theatre",
    ],
  },
  {
    key: "cubism",
    label: "Cubism / Faceted Planes",
    baseFamily: "swiss",
    palette: "cobalt",
    treatment: "cubist",
    description:
      "Fragmented viewpoints, faceted planes, overlapping geometry, and constructed depth.",
    names: [
      "cubist-plane",
      "cubist-faceted",
      "cubist-still",
      "cubist-portrait",
      "cubist-grid",
      "cubist-fracture",
      "cubist-blue",
      "cubist-ochre",
      "cubist-construct",
      "cubist-volume",
    ],
  },
  {
    key: "impressionism",
    label: "Impressionism / Light Study",
    baseFamily: "organic",
    palette: "forest",
    treatment: "impressionist",
    description:
      "Atmospheric light, soft edges, optical color, and a sense of a moment observed in motion.",
    names: [
      "impressionist-garden",
      "impressionist-light",
      "impressionist-water",
      "impressionist-morning",
      "impressionist-atmosphere",
      "impressionist-pastel",
      "impressionist-brush",
      "impressionist-sunset",
      "impressionist-haze",
      "impressionist-river",
    ],
  },
  {
    key: "maximalism",
    label: "Maximalism / Layered Ornament",
    baseFamily: "brutalist",
    palette: "saffron",
    treatment: "maximalist",
    description:
      "Dense layering, pattern collisions, saturated surfaces, and deliberately abundant visual energy.",
    names: [
      "maximalist-collage",
      "maximalist-pattern",
      "maximalist-jewel",
      "maximalist-layer",
      "maximalist-ornament",
      "maximalist-baroque",
      "maximalist-pop",
      "maximalist-eclectic",
      "maximalist-theatre",
      "maximalist-overload",
    ],
  },
  {
    key: "minimalism",
    label: "Minimalism / Essential Space",
    baseFamily: "swiss",
    palette: "mono",
    treatment: "minimalist",
    description:
      "Reduction, silence, measured spacing, and only the elements needed to carry the idea.",
    names: [
      "minimalist-white",
      "minimalist-air",
      "minimalist-line",
      "minimalist-quiet",
      "minimalist-black",
      "minimalist-zen",
      "minimalist-still",
      "minimalist-space",
      "minimalist-paper",
      "minimalist-essential",
    ],
  },
  {
    key: "synthwave",
    label: "Synthwave / Night Drive",
    baseFamily: "retrofuture",
    palette: "violet",
    treatment: "synthwave",
    description:
      "Neon horizons, arcade glow, chrome surfaces, and a nostalgic future imagined at speed.",
    names: [
      "synthwave-sunset",
      "synthwave-grid",
      "synthwave-neon",
      "synthwave-nightdrive",
      "synthwave-arcade",
      "synthwave-chrome",
      "synthwave-pulse",
      "synthwave-signal",
      "synthwave-outrun",
      "synthwave-digital",
    ],
  },
  {
    key: "glitchcore",
    label: "Glitchcore / Signal Error",
    baseFamily: "datanoir",
    palette: "cinematic",
    treatment: "glitchcore",
    description:
      "Scanlines, broken registration, system noise, and intentionally unstable digital signals.",
    names: [
      "glitchcore-scan",
      "glitchcore-noise",
      "glitchcore-error",
      "glitchcore-broken",
      "glitchcore-terminal",
      "glitchcore-signal",
      "glitchcore-fragment",
      "glitchcore-ghost",
      "glitchcore-static",
      "glitchcore-corrupt",
    ],
  },
  {
    key: "low-poly",
    label: "Low-poly / Faceted Render",
    baseFamily: "aurora",
    palette: "ocean",
    treatment: "lowpoly",
    description:
      "Angular facets, simplified volumes, crystalline surfaces, and clean spatial depth.",
    names: [
      "lowpoly-facet",
      "lowpoly-mountain",
      "lowpoly-crystal",
      "lowpoly-orbit",
      "lowpoly-animal",
      "lowpoly-landscape",
      "lowpoly-cube",
      "lowpoly-ice",
      "lowpoly-surface",
      "lowpoly-render",
    ],
  },
  {
    key: "biophilic",
    label: "Biophilic / Living Systems",
    baseFamily: "organic",
    palette: "mint",
    treatment: "biophilic",
    description:
      "Daylight, natural textures, living edges, and calm systems that reconnect the page to nature.",
    names: [
      "biophilic-canopy",
      "biophilic-garden",
      "biophilic-breath",
      "biophilic-living",
      "biophilic-greenhouse",
      "biophilic-forest",
      "biophilic-water",
      "biophilic-daylight",
      "biophilic-terrace",
      "biophilic-ecosystem",
    ],
  },
  {
    key: "biomorphic",
    label: "Biomorphic / Organic Form",
    baseFamily: "aurora",
    palette: "forest",
    treatment: "biomorphic",
    description:
      "Cellular forms, flowing contours, growth patterns, and shapes borrowed from living matter.",
    names: [
      "biomorphic-cell",
      "biomorphic-organ",
      "biomorphic-flow",
      "biomorphic-spore",
      "biomorphic-tissue",
      "biomorphic-shell",
      "biomorphic-growth",
      "biomorphic-wave",
      "biomorphic-reef",
      "biomorphic-root",
    ],
  },
  {
    key: "cartographic",
    label: "Cartographic / Atlas Systems",
    baseFamily: "datanoir",
    palette: "ice",
    treatment: "cartographic",
    description:
      "Contours, coordinates, routes, legends, and spatial evidence organized like a field atlas.",
    names: [
      "cartographic-atlas",
      "cartographic-contour",
      "cartographic-route",
      "cartographic-terrain",
      "cartographic-coordinates",
      "cartographic-survey",
      "cartographic-border",
      "cartographic-region",
      "cartographic-legend",
      "cartographic-expedition",
    ],
  },
  {
    key: "editorial-botanical",
    label: "Editorial Botanical / Herbarium",
    baseFamily: "luxury",
    palette: "forest",
    treatment: "botanical",
    description:
      "Specimen labels, pressed forms, botanical linework, and an archival editorial pace.",
    names: [
      "botanical-herbarium",
      "botanical-press",
      "botanical-specimen",
      "botanical-leaf",
      "botanical-greenhouse",
      "botanical-flora",
      "botanical-ink",
      "botanical-garden",
      "botanical-field",
      "botanical-archive",
    ],
  },
  {
    key: "documentary",
    label: "Documentary / Observational",
    baseFamily: "midnight",
    palette: "cinematic",
    treatment: "documentary",
    description:
      "Contact sheets, captions, evidence fragments, and a restrained observational narrative.",
    names: [
      "documentary-contact",
      "documentary-field",
      "documentary-archive",
      "documentary-interview",
      "documentary-observation",
      "documentary-grain",
      "documentary-caption",
      "documentary-reel",
      "documentary-verite",
      "documentary-notebook",
    ],
  },
  {
    key: "quiet-luxury",
    label: "Quiet Luxury / Tailored Editorial",
    baseFamily: "luxury",
    palette: "sand",
    treatment: "quietluxury",
    description:
      "Tactile restraint, tailored proportions, natural materials, and low-volume confidence.",
    names: [
      "quietluxury-silk",
      "quietluxury-stone",
      "quietluxury-hotel",
      "quietluxury-cashmere",
      "quietluxury-gallery",
      "quietluxury-matte",
      "quietluxury-tailored",
      "quietluxury-marble",
      "quietluxury-heritage",
      "quietluxury-editorial",
    ],
  },
  {
    key: "neo-folk",
    label: "Neo-folk / Handcrafted Future",
    baseFamily: "organic",
    palette: "saffron",
    treatment: "neofolk",
    description:
      "Weave, stitch, clay, print, and local craft references translated into a contemporary system.",
    names: [
      "neofolk-weave",
      "neofolk-loom",
      "neofolk-stitch",
      "neofolk-patch",
      "neofolk-wood",
      "neofolk-festival",
      "neofolk-clay",
      "neofolk-print",
      "neofolk-ribbon",
      "neofolk-hearth",
    ],
  },
  {
    key: "modern-collage",
    label: "Modern Collage / Cut and Paste",
    baseFamily: "brutalist",
    palette: "coral",
    treatment: "collage",
    description: "Found fragments, paper edges, pasted scale, and layered editorial composition.",
    names: [
      "collage-cutout",
      "collage-paste",
      "collage-found",
      "collage-layer",
      "collage-photo",
      "collage-paper",
      "collage-sticker",
      "collage-zine",
      "collage-mixed",
      "collage-montage",
    ],
  },
  {
    key: "techno-organic",
    label: "Techno-organic / Hybrid Network",
    baseFamily: "datanoir",
    palette: "mint",
    treatment: "technoorganic",
    description:
      "Circuit logic meets roots, cells, sensors, and living networks in a hybrid visual language.",
    names: [
      "technoorganic-circuit",
      "technoorganic-vine",
      "technoorganic-biomesh",
      "technoorganic-pulse",
      "technoorganic-hybrid",
      "technoorganic-root",
      "technoorganic-sensor",
      "technoorganic-network",
      "technoorganic-seed",
      "technoorganic-lab",
    ],
  },
  {
    key: "kinetic-type",
    label: "Kinetic Type / Moving Letter",
    baseFamily: "retrofuture",
    palette: "cobalt",
    treatment: "kinetic",
    description:
      "Type as motion, rhythm, repetition, and directional force rather than static labeling.",
    names: [
      "kinetic-stack",
      "kinetic-tilt",
      "kinetic-stretch",
      "kinetic-repeat",
      "kinetic-bounce",
      "kinetic-motion",
      "kinetic-echo",
      "kinetic-velocity",
      "kinetic-rotate",
      "kinetic-rhythm",
    ],
  },
  {
    key: "paper-cut",
    label: "Paper Cut / Layered Relief",
    baseFamily: "organic",
    palette: "coral",
    treatment: "papercut",
    description: "Cut edges, layered relief, shadowed paper planes, and theatrical handmade depth.",
    names: [
      "papercut-layer",
      "papercut-fold",
      "papercut-shadow",
      "papercut-diorama",
      "papercut-flower",
      "papercut-landscape",
      "papercut-letter",
      "papercut-relief",
      "papercut-sculpt",
      "papercut-stage",
    ],
  },
];

const treatmentCss = {
  geometry: `
    :root { --radius: 0px; --shadow: none; --sans: Arial, Helvetica, sans-serif; }
    .slide { border-left: 16px solid var(--accent); }
    .title, .section-title { font-family: var(--sans); font-weight: 900; text-transform: uppercase; }
    .panel, .stat { border: 2px solid var(--ink); border-radius: 0; box-shadow: none; }
    .orb-a, .orb-b, .orb-c { border-radius: 0; transform: rotate(45deg); }
    .slide:not(.closing)::after { width: 190px; height: 14px; background: var(--accent); border: 0; transform: rotate(-45deg); }
  `,
  grid: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 42px 42px; }
    .panel, .stat { border-radius: 0; background: color-mix(in srgb, var(--paper) 84%, transparent); box-shadow: none; }
    .title, .section-title { font-family: var(--sans); font-weight: 700; }
    .slide:not(.closing)::after { right: 88px; top: 68px; bottom: auto; width: 180px; height: 2px; background: var(--accent); border: 0; }
  `,
  diagonal: `
    :root { --radius: 0px; }
    .slide::before { background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), transparent 38%), var(--slide-overlay); }
    .title, .section-title { font-weight: 900; letter-spacing: -.08em; }
    .panel, .stat { border-left: 9px solid var(--accent); border-radius: 0; box-shadow: 8px 8px 0 color-mix(in srgb, var(--ink) 18%, transparent); }
    .slide:not(.closing)::after { width: 420px; height: 18px; right: -70px; bottom: 110px; border: 0; background: var(--accent); transform: rotate(-18deg); }
  `,
  orthogonal: `
    :root { --radius: 0px; --shadow: none; }
    .slide { border-top: 14px solid var(--accent); }
    .title, .section-title { font-weight: 850; }
    .panel, .stat { border: 3px solid var(--ink); border-radius: 0; box-shadow: none; }
    .orb-a { border-radius: 0; transform: rotate(45deg); }
    .orb-b { border-radius: 0; transform: rotate(15deg); }
    .slide:not(.closing)::after { right: auto; left: 90px; bottom: 56px; width: 120px; height: 120px; border: 18px solid var(--accent); border-radius: 0; }
  `,
  deco: `
    :root { --radius: 0px; --shadow: none; }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.025em; }
    .kicker, .footer, .page-no { letter-spacing: .25em; }
    .panel, .stat { border: 1px solid var(--accent); border-radius: 0; box-shadow: none; }
    .slide:not(.closing)::after { left: 88px; right: 88px; bottom: 46px; width: auto; height: 8px; border-top: 1px solid var(--accent); border-bottom: 1px solid var(--accent); background: transparent; }
  `,
  nouveau: `
    :root { --radius: 44px; }
    .title, .section-title { font-family: var(--serif); font-weight: 600; }
    .panel, .stat { border-radius: var(--radius); box-shadow: 0 18px 42px color-mix(in srgb, var(--ink) 12%, transparent); }
    .orb-a { border-radius: 58% 42% 65% 35%; }
    .orb-b { border-radius: 46% 54% 34% 66%; }
    .slide:not(.closing)::after { right: -80px; bottom: -100px; width: 390px; height: 390px; border: 2px solid var(--accent); border-radius: 54% 46% 62% 38%; transform: rotate(22deg); }
  `,
  tactile: `
    :root { --radius: 3px; }
    .slide { background-image: radial-gradient(color-mix(in srgb, var(--accent) 18%, transparent) 1px, transparent 1px); background-size: 13px 13px; }
    .title, .section-title { font-family: var(--serif); font-weight: 700; }
    .panel, .stat { border: 1px solid var(--line-strong); box-shadow: 5px 6px 0 color-mix(in srgb, var(--accent) 24%, transparent); }
    .slide:not(.closing)::after { right: 90px; bottom: 64px; width: 120px; height: 120px; border: 1px dashed var(--accent); border-radius: 50%; }
  `,
  midcentury: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: radial-gradient(circle at 92% 10%, var(--art-one) 0 12%, transparent 12.2%), radial-gradient(circle at 10% 88%, var(--art-two) 0 8%, transparent 8.2%); }
    .title, .section-title { font-weight: 800; }
    .panel, .stat { border: 0; background: color-mix(in srgb, var(--panel) 82%, transparent); box-shadow: none; }
    .orb-a { border-radius: 50%; }
    .orb-b { border-radius: 0 100% 0 100%; }
    .slide:not(.closing)::after { right: 100px; bottom: 62px; width: 180px; height: 12px; border: 0; background: var(--accent); transform: rotate(-8deg); }
  `,
  halftone: `
    :root { --radius: 0px; }
    .slide::before { background: radial-gradient(color-mix(in srgb, var(--accent) 42%, transparent) 1px, transparent 1px); background-size: 12px 12px; opacity: .18; }
    .title, .section-title { font-weight: 900; text-transform: uppercase; }
    .panel, .stat { border: 3px solid var(--ink); border-radius: 0; box-shadow: 9px 9px 0 var(--accent); }
    .slide:not(.closing)::after { right: 90px; bottom: 70px; width: 150px; height: 150px; border: 12px dotted var(--accent); border-radius: 50%; }
  `,
  psychedelic: `
    :root { --radius: 30px; }
    .slide::before { background: conic-gradient(from 20deg, color-mix(in srgb, var(--accent) 18%, transparent), transparent 32%, color-mix(in srgb, var(--art-two) 18%, transparent) 56%, transparent 78%), var(--slide-overlay); }
    .title, .section-title { font-family: var(--serif); font-weight: 700; letter-spacing: -.06em; }
    .panel, .stat { border: 0; border-radius: 34px 10px; box-shadow: 0 18px 52px color-mix(in srgb, var(--accent) 20%, transparent); }
    .slide:not(.closing)::after { right: -100px; bottom: -100px; width: 390px; height: 390px; border: 18px solid var(--accent); border-radius: 42% 58% 64% 36%; transform: rotate(18deg); }
  `,
  memphis: `
    :root { --radius: 8px; }
    .slide { background-image: linear-gradient(135deg, transparent 0 48%, color-mix(in srgb, var(--accent) 22%, transparent) 49% 51%, transparent 52%), linear-gradient(45deg, transparent 0 48%, color-mix(in srgb, var(--art-two) 18%, transparent) 49% 51%, transparent 52%); background-size: 92px 92px; }
    .title, .section-title { font-weight: 900; }
    .panel, .stat { border: 2px solid var(--ink); box-shadow: 8px 8px 0 var(--accent-soft); }
    .slide:not(.closing)::after { left: 70px; bottom: 108px; width: 100px; height: 100px; border: 12px solid var(--accent); border-radius: 50%; }
  `,
  postmodern: `
    :root { --radius: 0px; --shadow: none; }
    .slide { border-top: 5px solid var(--accent); }
    .title, .section-title { font-weight: 900; letter-spacing: -.09em; }
    .panel, .stat { border: 1px solid var(--ink); border-radius: 0; box-shadow: none; }
    .panel:nth-child(2n), .stat:nth-child(2n) { transform: translateY(14px) rotate(1deg); }
    .slide:not(.closing)::after { right: auto; left: 80px; bottom: 56px; width: 180px; height: 16px; border: 0; background: var(--accent); transform: rotate(3deg); }
  `,
  editorial: `
    :root { --radius: 0px; --shadow: none; }
    .slide { border-left: 1px solid var(--line-strong); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.045em; }
    .lede, .section-lede { font-family: var(--serif); }
    .panel, .stat { border: 0; border-top: 2px solid var(--ink); border-bottom: 1px solid var(--line); border-radius: 0; background: transparent; box-shadow: none; }
    .slide:not(.closing)::after { left: 88px; right: 88px; bottom: 48px; width: auto; height: 1px; border: 0; background: var(--line-strong); }
  `,
  fashion: `
    :root { --radius: 0px; --shadow: none; }
    .slide { border-top: 12px solid var(--ink); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.05em; }
    .kicker, .footer, .page-no { letter-spacing: .28em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-radius: 0; box-shadow: none; background: transparent; }
    .slide:not(.closing)::after { right: 90px; bottom: 54px; width: 180px; height: 1px; border: 0; background: var(--accent); }
  `,
  japanese: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: linear-gradient(90deg, transparent 0 12%, color-mix(in srgb, var(--ink) 9%, transparent) 12.1% 12.2%, transparent 12.3%); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.035em; }
    .panel, .stat { border: 0; border-left: 2px solid var(--accent); border-radius: 0; box-shadow: none; background: transparent; }
    .slide:not(.closing)::after { right: 110px; top: 90px; bottom: auto; width: 170px; height: 170px; border: 1px solid var(--accent); border-radius: 50%; }
  `,
  scandi: `
    :root { --radius: 22px; --shadow: 0 12px 32px color-mix(in srgb, var(--ink) 8%, transparent); }
    .slide { padding: 86px 102px 70px; }
    .title, .section-title { font-weight: 600; letter-spacing: -.055em; }
    .panel, .stat { border: 0; border-radius: var(--radius); box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: 100px; bottom: 58px; width: 84px; height: 84px; border: 1px solid var(--accent); border-radius: 50%; }
  `,
  mediterranean: `
    :root { --radius: 38px; }
    .slide::before { background: radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--accent) 24%, transparent) 0 14%, transparent 14.2%), var(--slide-overlay); }
    .title, .section-title { font-weight: 800; }
    .panel, .stat { border: 2px solid var(--accent); border-radius: 42px 42px 8px 8px; box-shadow: none; }
    .slide:not(.closing)::after { right: 90px; bottom: 56px; width: 190px; height: 95px; border: 0; border-radius: 190px 190px 0 0; background: var(--accent-soft); }
  `,
  afrofuturist: `
    :root { --radius: 4px; }
    .slide { background-image: linear-gradient(135deg, transparent 0 48%, color-mix(in srgb, var(--accent) 22%, transparent) 49% 50%, transparent 51%), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 160px 160px, 44px 44px; }
    .title, .section-title { font-weight: 900; text-transform: uppercase; }
    .panel, .stat { border: 2px solid var(--accent); border-radius: 4px; box-shadow: 10px 10px 0 color-mix(in srgb, var(--art-two) 45%, transparent); }
    .slide:not(.closing)::after { right: -20px; bottom: 80px; width: 300px; height: 16px; border: 0; background: var(--accent); transform: rotate(-28deg); }
  `,
  scientific: `
    :root { --radius: 0px; --shadow: none; --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 34px 34px; }
    .title, .section-title { font-family: var(--sans); font-weight: 700; letter-spacing: -.08em; }
    .panel, .stat { border: 1px dashed var(--line-strong); border-radius: 0; box-shadow: none; background: color-mix(in srgb, var(--paper) 86%, transparent); }
    .slide:not(.closing)::after { right: 86px; top: 70px; bottom: auto; width: 190px; height: 8px; border: 1px dashed var(--accent); background: transparent; }
  `,
  cyberpunk: `
    :root { --radius: 2px; --shadow: 0 0 38px color-mix(in srgb, var(--accent) 20%, transparent); --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 48px 48px; }
    .title, .section-title { font-family: var(--sans); font-weight: 700; text-transform: uppercase; letter-spacing: -.09em; }
    .panel, .stat { border: 1px solid var(--accent); border-radius: 2px; box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 18%, transparent); }
    .slide:not(.closing)::after { right: 82px; top: 72px; bottom: auto; width: 240px; height: 7px; border: 1px solid var(--accent); background: transparent; box-shadow: 0 0 22px var(--accent); }
  `,
  material: `
    :root { --radius: 30px; --shadow: 0 20px 48px color-mix(in srgb, var(--ink) 12%, transparent); }
    .slide { background-image: radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--accent) 18%, transparent) 0 16%, transparent 16.2%); }
    .title, .section-title { font-weight: 750; }
    .panel, .stat { border: 0; border-radius: var(--radius); box-shadow: var(--shadow); }
    .orb-a { filter: blur(2px); }
    .slide:not(.closing)::after { right: 110px; bottom: 58px; width: 150px; height: 150px; border: 0; border-radius: 50%; background: color-mix(in srgb, var(--accent) 20%, transparent); filter: blur(2px); }
  `,
  cinematic: `
    :root { --radius: 4px; --shadow: 0 24px 70px rgb(0 0 0 / 35%); }
    .slide { border-top: 18px solid #05070d; border-bottom: 18px solid #05070d; background-image: linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px); background-size: 52px 52px; }
    .title, .section-title { font-family: var(--serif); font-weight: 600; letter-spacing: -.045em; }
    .panel, .stat { border: 1px solid var(--line); border-radius: 4px; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: 84px; bottom: 76px; width: 210px; height: 3px; border: 0; background: var(--accent); box-shadow: 0 0 26px var(--accent); }
  `,
  dada: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: repeating-linear-gradient(117deg, transparent 0 64px, color-mix(in srgb, var(--accent) 14%, transparent) 65px 68px, transparent 69px 118px); }
    .title, .section-title { font-weight: 900; text-transform: uppercase; letter-spacing: -.1em; transform: rotate(-1.5deg); }
    .panel, .stat { border: 3px dashed var(--ink); border-radius: 0; box-shadow: 12px -8px 0 var(--accent-soft); transform: rotate(-1deg); }
    .panel:nth-child(2n), .stat:nth-child(2n) { transform: rotate(1deg); }
    .slide:not(.closing)::after { right: -18px; bottom: 14px; width: 220px; height: 18px; border: 0; background: var(--accent); transform: rotate(17deg); }
  `,
  futurism: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: repeating-linear-gradient(110deg, transparent 0 54px, color-mix(in srgb, var(--accent) 18%, transparent) 55px 58px, transparent 59px 112px); }
    .title, .section-title { font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -.08em; }
    .panel, .stat { border: 0; border-left: 10px solid var(--accent); border-radius: 0; box-shadow: 8px 8px 0 color-mix(in srgb, var(--ink) 16%, transparent); }
    .slide:not(.closing)::after { right: -60px; bottom: 110px; width: 430px; height: 18px; border: 0; background: var(--accent); transform: skewX(-32deg); }
  `,
  suprematism: `
    :root { --radius: 0px; --shadow: none; }
    .slide { border-right: 14px solid var(--accent); }
    .title, .section-title { font-weight: 800; text-transform: uppercase; letter-spacing: -.1em; }
    .panel, .stat { border: 2px solid var(--ink); border-radius: 0; box-shadow: none; }
    .orb-a, .orb-b, .orb-c { border-radius: 0; transform: rotate(45deg); }
    .slide:not(.closing)::after { left: 118px; bottom: 80px; width: 126px; height: 126px; border: 16px solid var(--accent); border-radius: 0; transform: rotate(45deg); }
  `,
  artbrut: `
    :root { --radius: 8px; }
    .slide { background-image: radial-gradient(color-mix(in srgb, var(--accent) 26%, transparent) 1px, transparent 1px); background-size: 17px 17px; }
    .title, .section-title { font-weight: 800; letter-spacing: -.065em; }
    .panel, .stat { border: 3px solid var(--ink); border-radius: 28px 6px 18px 2px; box-shadow: 7px 7px 0 var(--accent-soft); }
    .slide:not(.closing)::after { left: 80px; bottom: 88px; width: 150px; height: 42px; border: 6px solid var(--accent); border-radius: 55% 45% 42% 58%; transform: rotate(-7deg); }
  `,
  gothic: `
    :root { --radius: 0px; --shadow: none; }
    .slide { border-left: 12px double var(--accent); border-right: 12px double var(--accent); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.035em; }
    .kicker, .footer, .page-no { letter-spacing: .24em; }
    .panel, .stat { border: 1px solid var(--accent); border-radius: 0; box-shadow: inset 0 0 0 6px color-mix(in srgb, var(--accent) 9%, transparent); }
    .slide:not(.closing)::after { left: 90px; right: 90px; bottom: 52px; width: auto; height: 12px; border-top: 3px double var(--accent); border-bottom: 3px double var(--accent); background: transparent; }
  `,
  baroque: `
    :root { --radius: 20px; }
    .slide::before { background: radial-gradient(circle at 20% 18%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 26%), var(--slide-overlay); }
    .title, .section-title { font-family: var(--serif); font-weight: 600; font-style: italic; letter-spacing: -.04em; }
    .panel, .stat { border: 1px solid var(--accent); border-radius: var(--radius); box-shadow: 0 16px 36px color-mix(in srgb, var(--ink) 16%, transparent); }
    .slide:not(.closing)::after { right: 80px; bottom: 66px; width: 190px; height: 190px; border: 8px double var(--accent); border-radius: 50%; transform: rotate(12deg); }
  `,
  rococo: `
    :root { --radius: 42px; }
    .slide { background-image: radial-gradient(circle at 88% 10%, color-mix(in srgb, var(--accent) 22%, transparent) 0 12%, transparent 12.2%); }
    .title, .section-title { font-family: var(--serif); font-weight: 600; letter-spacing: -.04em; }
    .panel, .stat { border: 2px solid var(--accent); border-radius: 40px 12px; box-shadow: 0 14px 32px color-mix(in srgb, var(--accent) 16%, transparent); }
    .slide:not(.closing)::after { left: 82px; bottom: 70px; width: 174px; height: 82px; border: 0; border-radius: 100% 0 100% 0; background: var(--accent-soft); transform: rotate(-10deg); }
  `,
  classical: `
    :root { --radius: 0px; --shadow: none; }
    .slide { border-top: 6px solid var(--ink); border-bottom: 6px solid var(--ink); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.035em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-radius: 0; background: transparent; box-shadow: none; }
    .slide:not(.closing)::after { left: 110px; right: 110px; bottom: 58px; width: auto; height: 8px; border-top: 1px solid var(--accent); border-bottom: 1px solid var(--accent); background: transparent; }
  `,
  victorian: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: repeating-linear-gradient(90deg, transparent 0 76px, color-mix(in srgb, var(--accent) 12%, transparent) 77px 78px, transparent 79px 152px); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.035em; }
    .panel, .stat { border: 4px double var(--accent); border-radius: 0; box-shadow: none; }
    .slide:not(.closing)::after { right: 90px; bottom: 56px; width: 174px; height: 72px; border: 5px double var(--accent); border-radius: 50%; background: transparent; }
  `,
  architectural: `
    :root { --radius: 0px; --shadow: none; --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 28px 28px; }
    .title, .section-title { font-family: var(--sans); font-weight: 700; letter-spacing: -.075em; }
    .panel, .stat { border: 1px dashed var(--line-strong); border-radius: 0; box-shadow: none; background: color-mix(in srgb, var(--paper) 84%, transparent); }
    .slide:not(.closing)::after { left: 90px; bottom: 14px; width: 150px; height: 12px; border: 0; background: var(--accent); transform: rotate(-30deg); }
  `,
  industrial: `
    :root { --radius: 2px; --shadow: 0 10px 0 color-mix(in srgb, var(--ink) 18%, transparent); --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { border-left: 14px solid var(--accent); background-image: repeating-linear-gradient(0deg, transparent 0 46px, color-mix(in srgb, var(--line) 80%, transparent) 47px 48px); }
    .title, .section-title { font-family: var(--sans); font-weight: 800; text-transform: uppercase; letter-spacing: -.07em; }
    .panel, .stat { border: 3px solid var(--ink); border-radius: 2px; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: 80px; bottom: 58px; width: 220px; height: 16px; border: 0; background: repeating-linear-gradient(135deg, var(--accent) 0 12px, var(--accent-soft) 12px 24px); }
  `,
  tropical: `
    :root { --radius: 34px; }
    .slide::before { background: radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--accent) 25%, transparent) 0 15%, transparent 15.2%), repeating-linear-gradient(90deg, transparent 0 48px, color-mix(in srgb, var(--art-two) 12%, transparent) 49px 52px); }
    .title, .section-title { font-weight: 800; letter-spacing: -.06em; }
    .panel, .stat { border: 0; border-radius: 36px 10px; box-shadow: 0 16px 40px color-mix(in srgb, var(--ink) 12%, transparent); }
    .slide:not(.closing)::after { right: 70px; bottom: 65px; width: 165px; height: 92px; border: 0; border-radius: 80% 20% 60% 30%; background: var(--accent-soft); transform: rotate(15deg); }
  `,
  wabisabi: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: radial-gradient(color-mix(in srgb, var(--ink) 12%, transparent) 1px, transparent 1px); background-size: 19px 19px; }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.035em; }
    .panel, .stat { border: 1px dashed var(--line-strong); border-radius: 3px; box-shadow: none; background: transparent; }
    .slide:not(.closing)::after { left: 100px; bottom: 70px; width: 160px; height: 10px; border-top: 2px solid var(--accent); border-bottom: 1px solid var(--accent); transform: rotate(-4deg); }
  `,
  moorish: `
    :root { --radius: 28px; }
    .slide { background-image: conic-gradient(from 45deg at 18px 18px, transparent 0 25%, color-mix(in srgb, var(--accent) 16%, transparent) 0 50%, transparent 0 75%, color-mix(in srgb, var(--art-two) 14%, transparent) 0); background-size: 36px 36px; }
    .title, .section-title { font-family: var(--serif); font-weight: 600; letter-spacing: -.035em; }
    .panel, .stat { border: 2px solid var(--accent); border-radius: 28px 28px 6px 6px; box-shadow: none; }
    .slide:not(.closing)::after { right: 100px; bottom: 56px; width: 140px; height: 140px; border: 2px solid var(--accent); border-radius: 50%; transform: rotate(45deg); }
  `,
  indiancraft: `
    :root { --radius: 6px; }
    .slide { background-image: radial-gradient(color-mix(in srgb, var(--accent) 22%, transparent) 2px, transparent 2px); background-size: 22px 22px; }
    .title, .section-title { font-family: var(--serif); font-weight: 700; letter-spacing: -.04em; }
    .panel, .stat { border: 2px solid var(--accent); border-radius: 6px; box-shadow: 5px 5px 0 var(--accent-soft); }
    .slide:not(.closing)::after { left: 80px; bottom: 64px; width: 150px; height: 20px; border: 0; border-radius: 50%; background: var(--accent); transform: rotate(-8deg); }
  `,
  latin: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, transparent) 0 22%, transparent 22% 100%); }
    .title, .section-title { font-weight: 900; text-transform: uppercase; letter-spacing: -.08em; }
    .panel, .stat { border: 0; border-left: 10px solid var(--accent); border-radius: 0; box-shadow: 8px 8px 0 var(--accent-soft); }
    .slide:not(.closing)::after { right: -40px; bottom: 80px; width: 400px; height: 20px; border: 0; background: var(--accent); transform: rotate(12deg); }
  `,
  solarpunk: `
    :root { --radius: 28px; --shadow: 0 16px 42px color-mix(in srgb, var(--ink) 10%, transparent); }
    .slide { background-image: radial-gradient(circle at 90% 12%, color-mix(in srgb, var(--accent) 28%, transparent) 0 16%, transparent 16.2%), linear-gradient(90deg, transparent 0 12%, color-mix(in srgb, var(--accent) 9%, transparent) 12.1% 12.2%, transparent 12.3%); }
    .title, .section-title { font-weight: 700; letter-spacing: -.06em; }
    .panel, .stat { border: 0; border-radius: var(--radius); box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: 90px; bottom: 58px; width: 170px; height: 170px; border: 2px solid var(--accent); border-radius: 50% 20% 50% 20%; transform: rotate(18deg); }
  `,
  academia: `
    :root { --radius: 0px; --shadow: none; }
    .slide { border-left: 10px solid var(--accent); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.04em; }
    .panel, .stat { border: 0; border-top: 1px solid var(--line-strong); border-bottom: 1px solid var(--line); border-radius: 0; background: transparent; box-shadow: none; }
    .slide:not(.closing)::after { right: 90px; bottom: 55px; width: 160px; height: 100px; border: 1px solid var(--accent); background: transparent; }
  `,
  lightacademia: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: linear-gradient(90deg, transparent 0 14%, color-mix(in srgb, var(--accent) 10%, transparent) 14.1% 14.2%, transparent 14.3%); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.035em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-radius: 0; background: color-mix(in srgb, var(--paper) 64%, transparent); box-shadow: none; }
    .slide:not(.closing)::after { left: 88px; bottom: 58px; width: 190px; height: 6px; border-top: 1px solid var(--accent); border-bottom: 1px solid var(--accent); }
  `,
  vaporwave: `
    :root { --radius: 8px; --shadow: 0 0 44px color-mix(in srgb, var(--accent) 22%, transparent); }
    .slide { background-image: repeating-linear-gradient(0deg, rgb(255 255 255 / 5%) 0 2px, transparent 2px 8px), linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), transparent 48%); }
    .title, .section-title { font-weight: 900; text-transform: uppercase; letter-spacing: -.1em; }
    .panel, .stat { border: 1px solid var(--accent); border-radius: 8px; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: 100px; bottom: 70px; width: 230px; height: 16px; border: 0; background: var(--accent); transform: skewX(-24deg); box-shadow: 0 0 24px var(--accent); }
  `,
  webcore: `
    :root { --radius: 0px; --shadow: none; --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { background-image: radial-gradient(var(--line-strong) 1px, transparent 1px); background-size: 18px 18px; }
    .title, .section-title { font-family: var(--sans); font-weight: 700; text-transform: uppercase; letter-spacing: -.07em; }
    .panel, .stat { border: 2px dashed var(--accent); border-radius: 0; box-shadow: none; }
    .slide:not(.closing)::after { right: 90px; top: 72px; bottom: auto; width: 190px; height: 14px; border: 1px dashed var(--accent); background: transparent; }
  `,
  skeuomorphic: `
    :root { --radius: 18px; --shadow: 0 18px 32px color-mix(in srgb, var(--ink) 18%, transparent), inset 0 1px 0 rgb(255 255 255 / 45%); }
    .slide { background-image: linear-gradient(135deg, color-mix(in srgb, var(--panel) 80%, white), var(--paper)); }
    .title, .section-title { font-weight: 750; letter-spacing: -.055em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-radius: var(--radius); box-shadow: var(--shadow); background: linear-gradient(145deg, color-mix(in srgb, var(--panel) 92%, white), var(--panel)); }
    .slide:not(.closing)::after { right: 90px; bottom: 62px; width: 180px; height: 100px; border: 1px solid var(--line-strong); border-radius: 22px; background: var(--accent-soft); box-shadow: var(--shadow); }
  `,
  neobrutalist: `
    :root { --radius: 0px; --shadow: 10px 10px 0 var(--ink); }
    .slide { border: 8px solid var(--ink); }
    .title, .section-title { font-weight: 900; text-transform: uppercase; letter-spacing: -.085em; }
    .panel, .stat { border: 4px solid var(--ink); border-radius: 0; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { left: 86px; bottom: 60px; width: 200px; height: 22px; border: 0; background: var(--accent); transform: rotate(-3deg); }
  `,
  corporate: `
    :root { --radius: 30px; --shadow: 0 16px 40px color-mix(in srgb, var(--ink) 10%, transparent); }
    .slide { background-image: radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--art-one) 22%, transparent) 0 12%, transparent 12.2%), radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--accent) 20%, transparent) 0 14%, transparent 14.2%); }
    .title, .section-title { font-weight: 750; letter-spacing: -.06em; }
    .panel, .stat { border: 0; border-radius: var(--radius); box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: -20px; bottom: 50px; width: 240px; height: 120px; border: 0; border-radius: 50% 50% 20% 50%; background: var(--accent-soft); transform: rotate(-12deg); }
  `,
  datavis: `
    :root { --radius: 0px; --shadow: none; --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 32px 32px; }
    .title, .section-title { font-family: var(--sans); font-weight: 700; letter-spacing: -.075em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-left: 7px solid var(--accent); border-radius: 0; box-shadow: none; }
    .slide:not(.closing)::after { top: auto; right: 100px; bottom: 24px; width: 240px; height: 12px; border: 0; background: repeating-linear-gradient(90deg, var(--accent) 0 26px, var(--accent-soft) 26px 42px); }
  `,
  abstract: `
    :root { --radius: 18px; --shadow: 0 18px 42px color-mix(in srgb, var(--ink) 12%, transparent); }
    .slide { background-image: radial-gradient(ellipse at 18% 18%, color-mix(in srgb, var(--accent) 20%, transparent) 0 12%, transparent 34%), radial-gradient(ellipse at 86% 80%, color-mix(in srgb, var(--art-two) 18%, transparent) 0 11%, transparent 32%); }
    .title, .section-title { font-family: var(--serif); font-weight: 600; font-style: italic; letter-spacing: -.055em; }
    .panel, .stat { border: 0; border-radius: 42% 12px 32% 18px; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { left: 76px; bottom: 60px; width: 210px; height: 48px; border: 0; border-radius: 70% 30% 58% 42%; background: var(--accent-soft); transform: rotate(-8deg); }
  `,
  surreal: `
    :root { --radius: 24px; --shadow: 0 24px 70px color-mix(in srgb, var(--accent) 18%, transparent); }
    .slide { background-image: radial-gradient(circle at 80% 15%, color-mix(in srgb, var(--accent) 22%, transparent) 0 9%, transparent 10%), radial-gradient(ellipse at 12% 84%, color-mix(in srgb, var(--art-one) 16%, transparent) 0 14%, transparent 32%); }
    .cover-art { transform: rotate(-4deg) scale(.92); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.06em; }
    .panel, .stat { border: 1px solid var(--accent-soft); border-radius: 46% 12px 12px 46%; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: 100px; bottom: 64px; width: 120px; height: 120px; border: 2px solid var(--accent); border-radius: 50% 50% 12% 50%; transform: rotate(18deg); }
  `,
  cubist: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, transparent) 0 17%, transparent 17% 62%, color-mix(in srgb, var(--art-two) 12%, transparent) 62% 78%, transparent 78%); }
    .title, .section-title { font-weight: 850; letter-spacing: -.085em; }
    .panel, .stat { border: 2px solid var(--ink); border-radius: 0; box-shadow: none; background: color-mix(in srgb, var(--panel) 90%, var(--accent-soft)); }
    .panel:nth-child(2n) { transform: translateY(8px); }
    .slide:not(.closing)::after { right: 80px; bottom: 60px; width: 190px; height: 48px; border: 0; background: var(--accent); transform: skewX(-30deg) rotate(-8deg); }
  `,
  impressionist: `
    :root { --radius: 30px; --shadow: 0 18px 44px color-mix(in srgb, var(--accent) 10%, transparent); }
    .slide { background-image: radial-gradient(circle at 22% 18%, color-mix(in srgb, var(--accent) 12%, transparent) 0 2px, transparent 3px), radial-gradient(circle at 78% 74%, color-mix(in srgb, var(--art-two) 14%, transparent) 0 3px, transparent 4px); background-size: 34px 28px, 44px 38px; }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.045em; }
    .panel, .stat { border: 0; border-radius: 34px; box-shadow: var(--shadow); background: color-mix(in srgb, var(--panel) 84%, var(--art-one)); }
    .slide:not(.closing)::after { left: 84px; bottom: 68px; width: 170px; height: 30px; border: 0; border-radius: 50%; background: var(--accent-soft); transform: rotate(12deg); }
  `,
  maximalist: `
    :root { --radius: 4px; --shadow: 12px 12px 0 var(--ink); }
    .slide { background-image: repeating-linear-gradient(135deg, transparent 0 26px, color-mix(in srgb, var(--accent) 8%, transparent) 27px 31px), radial-gradient(circle at 90% 10%, color-mix(in srgb, var(--art-one) 24%, transparent) 0 16%, transparent 16.5%); }
    .title, .section-title { font-weight: 950; text-transform: uppercase; letter-spacing: -.09em; }
    .panel, .stat { border: 3px solid var(--ink); border-radius: 4px; box-shadow: var(--shadow); }
    .panel:nth-child(2n) { transform: rotate(1deg); }
    .slide:not(.closing)::after { right: 44px; bottom: 58px; width: 250px; height: 24px; border: 0; background: var(--accent); transform: rotate(-6deg); }
  `,
  minimalist: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background: var(--paper); }
    .title, .section-title { font-weight: 450; letter-spacing: -.065em; }
    .panel, .stat { border: 0; border-top: 1px solid var(--ink); border-radius: 0; box-shadow: none; background: transparent; }
    .slide:not(.closing)::after { left: 88px; bottom: 58px; width: 160px; height: 1px; border: 0; background: var(--ink); }
  `,
  synthwave: `
    :root { --radius: 6px; --shadow: 0 0 38px color-mix(in srgb, var(--accent) 28%, transparent); }
    .slide { background-image: linear-gradient(180deg, transparent 0 72%, color-mix(in srgb, var(--accent) 12%, transparent) 72% 73%, transparent 73%), repeating-linear-gradient(0deg, transparent 0 38px, color-mix(in srgb, var(--accent) 13%, transparent) 39px 40px); }
    .title, .section-title { font-weight: 900; text-transform: uppercase; letter-spacing: -.105em; text-shadow: 4px 4px 0 color-mix(in srgb, var(--art-two) 62%, transparent); }
    .panel, .stat { border: 1px solid var(--accent); border-radius: 6px; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: 90px; bottom: 54px; width: 260px; height: 10px; border: 0; background: var(--accent); box-shadow: 0 0 22px var(--accent); transform: skewX(-28deg); }
  `,
  glitchcore: `
    :root { --radius: 0px; --shadow: none; --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { background-image: repeating-linear-gradient(0deg, rgb(255 255 255 / 4%) 0 1px, transparent 1px 6px); }
    .title, .section-title { font-family: var(--sans); font-weight: 800; text-transform: uppercase; letter-spacing: -.09em; text-shadow: 3px 0 var(--accent-soft), -3px 0 color-mix(in srgb, var(--art-two) 70%, transparent); }
    .panel, .stat { border: 2px dashed var(--accent); border-radius: 0; box-shadow: none; }
    .slide:not(.closing)::after { left: 90px; top: 74px; bottom: auto; width: 220px; height: 12px; border: 0; background: repeating-linear-gradient(90deg, var(--accent) 0 18px, var(--accent-soft) 18px 26px); transform: skewX(-18deg); }
  `,
  lowpoly: `
    :root { --radius: 10px; --shadow: 8px 12px 0 color-mix(in srgb, var(--ink) 16%, transparent); }
    .slide { background-image: linear-gradient(135deg, color-mix(in srgb, var(--art-one) 26%, transparent) 0 18%, transparent 18% 48%, color-mix(in srgb, var(--accent) 12%, transparent) 48% 64%, transparent 64%); }
    .title, .section-title { font-weight: 800; letter-spacing: -.075em; }
    .panel, .stat { border: 1px solid var(--ink); border-radius: 10px; box-shadow: var(--shadow); }
    .orb-a, .orb-b, .orb-c { border-radius: 18% 50% 28% 40%; transform: rotate(22deg); }
    .slide:not(.closing)::after { right: 86px; bottom: 60px; width: 150px; height: 100px; border: 0; background: var(--accent-soft); transform: skewY(22deg) rotate(12deg); }
  `,
  biophilic: `
    :root { --radius: 32px; --shadow: 0 18px 42px color-mix(in srgb, var(--ink) 9%, transparent); }
    .slide { background-image: radial-gradient(circle at 92% 10%, color-mix(in srgb, var(--accent) 18%, transparent) 0 12%, transparent 12.3%), radial-gradient(ellipse at 4% 98%, color-mix(in srgb, var(--art-two) 14%, transparent) 0 20%, transparent 20.4%); }
    .title, .section-title { font-weight: 650; letter-spacing: -.055em; }
    .panel, .stat { border: 0; border-radius: 32px 12px 32px 12px; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { left: 70px; bottom: 58px; width: 180px; height: 72px; border: 0; border-radius: 70% 0 70% 0; background: var(--accent-soft); transform: rotate(-9deg); }
  `,
  biomorphic: `
    :root { --radius: 28px; --shadow: 0 18px 48px color-mix(in srgb, var(--accent) 12%, transparent); }
    .slide { background-image: radial-gradient(ellipse at 82% 16%, color-mix(in srgb, var(--art-one) 19%, transparent) 0 14%, transparent 14.4%), radial-gradient(ellipse at 14% 88%, color-mix(in srgb, var(--accent) 13%, transparent) 0 16%, transparent 16.4%); }
    .title, .section-title { font-weight: 700; letter-spacing: -.06em; }
    .panel, .stat { border: 0; border-radius: 48% 18% 40% 20%; box-shadow: var(--shadow); }
    .panel:nth-child(2n) { border-radius: 18% 48% 20% 40%; }
    .slide:not(.closing)::after { right: 86px; bottom: 58px; width: 160px; height: 72px; border: 0; border-radius: 60% 40% 30% 70%; background: var(--accent-soft); transform: rotate(17deg); }
  `,
  cartographic: `
    :root { --radius: 2px; --shadow: none; --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { background-image: repeating-radial-gradient(ellipse at 18% 22%, transparent 0 22px, color-mix(in srgb, var(--line-strong) 72%, transparent) 23px 24px, transparent 25px 48px); }
    .title, .section-title { font-family: var(--sans); font-weight: 700; letter-spacing: -.075em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-radius: 2px; box-shadow: none; background: color-mix(in srgb, var(--paper) 78%, transparent); }
    .slide:not(.closing)::after { right: 82px; bottom: 62px; width: 190px; height: 34px; border: 1px solid var(--accent); background: repeating-linear-gradient(90deg, transparent 0 15px, var(--accent) 16px 17px); transform: rotate(-4deg); }
  `,
  botanical: `
    :root { --radius: 4px; --shadow: 0 10px 22px color-mix(in srgb, var(--ink) 9%, transparent); }
    .slide { background-image: linear-gradient(90deg, transparent 0 12%, color-mix(in srgb, var(--accent) 13%, transparent) 12.1% 12.2%, transparent 12.3%); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.045em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-radius: 4px; box-shadow: var(--shadow); background: color-mix(in srgb, var(--panel) 82%, var(--art-one)); }
    .slide:not(.closing)::after { left: 84px; bottom: 58px; width: 150px; height: 80px; border: 1px solid var(--accent); border-radius: 0 100% 0 100%; background: transparent; transform: rotate(-15deg); }
  `,
  documentary: `
    :root { --radius: 0px; --shadow: none; --sans: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; }
    .slide { background-image: radial-gradient(color-mix(in srgb, var(--ink) 12%, transparent) 1px, transparent 1px); background-size: 5px 5px; }
    .title, .section-title { font-family: var(--sans); font-weight: 700; letter-spacing: -.07em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-radius: 0; box-shadow: none; }
    .slide:not(.closing)::after { right: 82px; bottom: 56px; width: 190px; height: 18px; border: 0; border-top: 2px solid var(--accent); border-bottom: 1px solid var(--accent); background: transparent; }
  `,
  quietluxury: `
    :root { --radius: 0px; --shadow: 0 14px 28px color-mix(in srgb, var(--ink) 8%, transparent); }
    .slide { border-top: 1px solid var(--line-strong); border-bottom: 1px solid var(--line-strong); }
    .title, .section-title { font-family: var(--serif); font-weight: 500; letter-spacing: -.05em; }
    .panel, .stat { border: 1px solid var(--line-strong); border-radius: 0; box-shadow: var(--shadow); background: color-mix(in srgb, var(--panel) 88%, white); }
    .slide:not(.closing)::after { right: 96px; bottom: 62px; width: 170px; height: 1px; border: 0; background: var(--accent); }
  `,
  neofolk: `
    :root { --radius: 12px; --shadow: 6px 6px 0 color-mix(in srgb, var(--ink) 15%, transparent); }
    .slide { background-image: repeating-linear-gradient(45deg, transparent 0 16px, color-mix(in srgb, var(--accent) 10%, transparent) 17px 19px); }
    .title, .section-title { font-family: var(--serif); font-weight: 600; letter-spacing: -.045em; }
    .panel, .stat { border: 2px solid var(--ink); border-radius: 12px; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { left: 82px; bottom: 58px; width: 180px; height: 30px; border: 2px solid var(--accent); border-radius: 50%; background: transparent; transform: rotate(5deg); }
  `,
  collage: `
    :root { --radius: 0px; --shadow: 8px 10px 0 color-mix(in srgb, var(--ink) 18%, transparent); }
    .slide { background-image: linear-gradient(145deg, color-mix(in srgb, var(--accent) 14%, transparent) 0 22%, transparent 22% 76%, color-mix(in srgb, var(--art-two) 14%, transparent) 76%); }
    .title, .section-title { font-weight: 900; letter-spacing: -.085em; }
    .panel, .stat { border: 2px solid var(--ink); border-radius: 0; box-shadow: var(--shadow); }
    .panel:nth-child(2n) { transform: rotate(-1deg); }
    .slide:not(.closing)::after { right: 64px; bottom: 62px; width: 210px; height: 28px; border: 0; background: var(--accent); transform: rotate(7deg); }
  `,
  technoorganic: `
    :root { --radius: 20px; --shadow: 0 0 34px color-mix(in srgb, var(--accent) 16%, transparent); }
    .slide { background-image: radial-gradient(circle at 18% 24%, transparent 0 24px, color-mix(in srgb, var(--accent) 12%, transparent) 25px 26px, transparent 27px 54px), linear-gradient(90deg, transparent 0 76%, color-mix(in srgb, var(--art-two) 11%, transparent) 76.1% 76.2%, transparent 76.3%); }
    .title, .section-title { font-weight: 750; letter-spacing: -.065em; }
    .panel, .stat { border: 1px solid var(--accent); border-radius: 20px; box-shadow: var(--shadow); }
    .slide:not(.closing)::after { right: 86px; bottom: 60px; width: 180px; height: 54px; border: 1px solid var(--accent); border-radius: 50%; background: transparent; transform: rotate(-18deg); }
  `,
  kinetic: `
    :root { --radius: 0px; --shadow: none; }
    .slide { background-image: linear-gradient(90deg, color-mix(in srgb, var(--accent) 12%, transparent) 0 2%, transparent 2% 100%); }
    .title, .section-title { font-weight: 950; text-transform: uppercase; letter-spacing: -.11em; transform: skewX(-8deg); transform-origin: left center; }
    .panel, .stat { border: 0; border-left: 12px solid var(--accent); border-radius: 0; box-shadow: none; }
    .slide:not(.closing)::after { left: 78px; bottom: 60px; width: 270px; height: 12px; border: 0; background: repeating-linear-gradient(90deg, var(--accent) 0 22px, transparent 22px 34px); transform: skewX(-28deg); }
  `,
  papercut: `
    :root { --radius: 8px; --shadow: 8px 12px 0 color-mix(in srgb, var(--ink) 14%, transparent); }
    .slide { background-image: linear-gradient(135deg, color-mix(in srgb, var(--art-one) 18%, transparent) 0 18%, transparent 18% 82%, color-mix(in srgb, var(--accent) 12%, transparent) 82%); }
    .title, .section-title { font-weight: 700; letter-spacing: -.06em; }
    .panel, .stat { border: 0; border-radius: 8px; box-shadow: var(--shadow); background: var(--panel); }
    .panel:nth-child(2n) { transform: translateY(6px); }
    .slide:not(.closing)::after { right: 88px; bottom: 60px; width: 175px; height: 90px; border: 0; border-radius: 0 70% 0 70%; background: var(--accent-soft); transform: rotate(12deg); }
  `,
};

const variationCss = [
  `.panel, .stat { border-radius: 0; } .layout-statement .statement { letter-spacing: -.08em; }`,
  `.panel, .stat { border-radius: 12px; } .layout-timeline .timeline-item::before { width: 12px; height: 12px; }`,
  `.panel, .stat { border-radius: 24px 4px; } .layout-matrix .matrix-cell { min-height: 186px; }`,
  `.panel, .stat { border-radius: 4px; } .layout-quote-wall .mini-quote { border-top-width: 10px; }`,
  `.panel, .stat { border-radius: 18px; } .layout-scorecard .score-row { min-height: 68px; }`,
];

function stylePresetCss(group, index) {
  return `${treatmentCss[group.treatment]}\n    ${variationCss[index % variationCss.length]}`;
}

function humanizeStyleName(name) {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export { humanizeStyleName, styleGroups, stylePresetCss };
