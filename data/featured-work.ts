// Featured work items displayed as large cards.
// Supports image or video preview with full project detail page.
export type FeaturedItem = {
  slug: string; // Unique URL slug (e.g., 'porsche-718-spyder')
  title: string;
  img?: string; // Static fallback image
  videoPreview?: string; // Small looping preview video path
  videoPreviewStart?: number; // Looping preview start point
  videoPreviewEnd?: number; // Looping preview end point
  videoFull?: string; // Path to full quality video
  link?: string; // External backup link
  
  // Detailed page attributes
  description?: string; // Narrative overview
  client?: string; // Who the shoot was for
  role?: string; // What you did (e.g., Director, Editor, DP)
  date?: string; // Completion date
  gear?: string[]; // Camera gear, lens, software used
  photos?: string[]; // Array of high-quality shoot photos/stills
};

export const featuredItems: FeaturedItem[] = [
  {
    "slug": "porsche-718-spyder",
    "title": "Porsche 718 Spyder Edit",
    "videoPreview": "/videos/car-preview.mp4",
    "videoPreviewStart": 0,
    "videoPreviewEnd": 6.7,
    "videoFull": "/videos/car.mp4",
    "description": "A cinematic high-pace editing showcase featuring the Porsche 718 Spyder cruising along coastal roads. The project focuses on high-speed dynamic tracking, seamless sound design sync, and automotive color grading. Designed to capture the aggressive performance and raw emotion of open-top motoring.",
    "client": "Automotive Showcase",
    "role": "Editor & Colorist",
    "date": "2025",
    "gear": [
      "BMPCC 6K",
      "18-35mm Sigma Art Lens",
      "Adobe Suite",
      "DaVinci Resolve"
    ],
    "photos": [
      "/images/car.jpg/"
    ]
  },
  {
    "slug": "i-want-to-win",
    "title": "I want to win.",
    "videoPreview": "/videos/poem-preview.mp4",
    "videoPreviewStart": 0,
    "videoPreviewEnd": 7,
    "videoFull": "/videos/poem.mp4",
    "description": "An artistic visual poem exploring athletic drive, isolation, and competitive willpower. Shot with organic moody natural lighting, this short piece matches rhythmic, deliberate editing cuts with raw audio design to pull the viewer into the athlete’s singular state of focus.",
    "client": "Personal Creative Project",
    "role": "Director, DP & Editor",
    "date": "Winter 2025",
    "gear": [
      "BMPCC 6K",
      "18-35mm Sigma Art Lens",
      "Adobe Suite",
      "DaVinci Resolve"
    ],
    "photos": [
      "/videos/bask.mp4"
    ]
  },
  {
    "slug": "vi-pc-showcase",
    "title": "VI PC Showcase",
    "videoPreview": "/videos/vipc-preview-6-17.mp4",
    "videoPreviewStart": 6,
    "videoPreviewEnd": 15,
    "videoFull": "/videos/vipc.mp4",
    "description": "A premium product reveal and showcase highlighting custom PC craftsmanship and tech aesthetics. Using microscopic macro shots, dynamic speed ramping, and neon-hued HSL color adjustments, the edit captures the sleek mechanical beauty and cooling performance of the custom build.",
    "client": "VI PC Builders",
    "role": "DP & Editor",
    "date": "Summer 2026",
    "gear": [
      "BMPCC 6K",
      "18-35mm Sigma Art Lens",
      "Adobe Suite",
      "DaVinci Resolve"
    ],
    "photos": [
      "/images/whale.png",
      "/images/audit.jpg",
      "/images/isolated.jpg"
    ]
  },
  {
    "slug": "a-dance-video",
    "title": "A Dance Video",
    "videoPreview": "/videos/hans1pre.mp4/",
    "videoPreviewStart": 11,
    "videoPreviewEnd": 18,
    "videoFull": "/videos/hans1.mp4/",
    "client": "Hans",
    "role": "Dancer",
    "date": "2026",
    "gear": [
      "BMPCC 6K",
      "18-35mm Sigma Art Lens",
      "Adobe Suite",
      "DaVinci Resolve"
    ],
    "photos": []
  },
  {
    "slug": "jaye-byard-anamorphic",
    "title": "Jaye Byard Anamorphic",
    "videoPreview": "/videos/jayepre.mp4/",
    "videoPreviewStart": 0,
    "videoPreviewEnd": 10,
    "videoFull": "/videos/jaye.mp4/",
    "description": "Filming for Jaye Byard who was the Canadian heavyweight champ of bc",
    "client": "Jaye",
    "role": "Filmer",
    "date": "2025",
    "gear": [
      "BMPCC 6K",
      "18-35mm Sigma Art Lens",
      "Adobe Suite",
      "DaVinci Resolve"
    ],
    "photos": [
      "/images/2.jpg",
      "/images/1.jpg"
    ]
  }
];
