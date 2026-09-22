// Single source of truth for all editable site content.
// Edited via the local admin at /admin — writes back to data/content.json.
import raw from "@/data/content.json";

export type FeaturedItem = {
  slug: string;
  title: string;
  img?: string;
  videoPreview?: string;
  videoPreviewStart?: number;
  videoPreviewEnd?: number;
  videoFull?: string;
  videoUrl?: string; // YouTube/Vimeo/Google Drive link — takes priority over videoFull on the project page
  videoVertical?: boolean; // measured from the generated preview's real dimensions — more reliable than guessing from the URL
  link?: string;
  description?: string;
  client?: string;
  role?: string;
  date?: string;
  gear?: string[];
  photos?: string[];
};

export type Photo = {
  src: string;
  caption?: string;
  zoomSrc?: string; // optional pre-zoomed detail crop, shown in the lightbox
};
export type ReelClip = { src: string; label?: string };

export type ShowcasePhoto = {
  image: string; // the flat base photo (~1MB is plenty)
  zoomImage?: string; // a separate pre-zoomed detail crop (~1MB) shown in the lens
  caption?: string;
  focusX: number; // where the lens sits over the base, in percent
  focusY: number;
  // legacy fields from the old single-file model — no longer used
  preview?: string;
  zoom?: number;
};
export type Brand = { name: string; logo?: string };
export type Social = { name: string; url: string };
export type Capability = {
  name: string;
  desc: string;
  details?: string; // longer paragraph shown when the row is expanded
  image?: string; // screenshot/still shown when the row is expanded
};

export type Profile = {
  name: string;
  siteTitle?: string; // browser tab title + search result headline
  siteDescription?: string; // search result description / link previews
  heroEyebrow: string;
  heroWords: string[];
  heroStats: { value: string; label: string }[];
  aboutHeadline: string;
  aboutSubheading: string;
  aboutBio1: string;
  aboutBio2: string;
  aboutPortrait?: string;
  contactHeadline: string;
  contactSubheading: string;
  contactEmail: string;
  contactLocation: string;
  availability: string;
  footerBanner?: string; // panoramic image above the footer; empty hides it
  bookingUrl?: string; // Calendly (or similar) link — embeds a booking calendar on the contact page
  socials: Social[];
};

// Every headline and small label on the site, editable in the admin.
// Missing keys fall back to these defaults, so older saves keep working.
export const defaultSectionText = {
  heroTitleLine1: "Bringing ideas to",
  heroTitleLine2: "life with",
  workLabel: "Selected Work",
  workHeading: "Films worth watching twice.",
  stillsLabel: "Gallery & Stills",
  stillsHeading: "Frames pulled from the field.",
  stillsBlurb:
    "Photography from shoots, travels, and everything in between — graded with the same eye as the films.",
  stillsButton: "View Gallery & Stills",
  reelLabel: "Color & VFX",
  reelHeading: "Where footage finds its final look.",
  brandsLabel: "Trusted By",
  skillsLabel: "Capabilities",
  skillsHeading: "What I bring to the table.",
  aboutLabel: "About",
  contactLabel: "Contact",
  reviewsLabel: "Reviews",
  reviewsHeading: "Words from people I've worked with.",
  aboutStoryLabel: "The story",
  aboutSkillsHeading: "Capabilities & toolbox.",
  aboutCtaHeading: "Sound like a fit?",
};

export type SectionTextKey = keyof typeof defaultSectionText;

export type SiteContent = {
  profile: Profile;
  featuredWork: FeaturedItem[];
  photos: Photo[];
  showcasePhoto?: ShowcasePhoto;
  reelClips?: ReelClip[];
  brands: Brand[];
  skills: {
    capabilities: Capability[];
    software: string[];
    gear: string[];
  };
  sectionText?: Partial<typeof defaultSectionText>;
};

/** True for YouTube Shorts links — vertical 9:16 videos. */
export function isVerticalVideoUrl(url?: string): boolean {
  return !!url && /youtube\.com\/shorts\//.test(url);
}

/** True for Google Drive links. */
export function isDriveVideoUrl(url?: string): boolean {
  return !!url && /drive\.google\.com\//.test(url);
}

/** True for YouTube links. */
export function isYouTubeVideoUrl(url?: string): boolean {
  return !!url && /(?:youtube\.com|youtu\.be)\//.test(url);
}

/** The file ID inside a Google Drive share link, or null. */
export function driveFileId(url?: string): string | null {
  if (!url) return null;
  const m = url.trim().match(/drive\.google\.com\/(?:file\/d\/([\w-]{10,})|open\?id=([\w-]{10,}))/);
  return m ? m[1] || m[2] : null;
}

/**
 * Direct-download URL for a Drive file — streams the ORIGINAL bytes.
 *
 * Drive's /preview iframe only serves its own transcodes: capped at 1080p,
 * frequently still low-res for recent uploads, and with no way to ask for a
 * quality. Pointing a native <video> at the original file avoids all that.
 * confirm=t skips the "can't scan this for viruses" interstitial on big files.
 */
export function driveDirectUrl(url?: string): string | null {
  const id = driveFileId(url);
  return id ? `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t` : null;
}

/**
 * Whether a featured item's video is vertical (9:16).
 *
 * YouTube keeps the original Shorts-URL heuristic untouched — it already
 * frames right. Vimeo and Google Drive links carry no orientation hint in
 * the URL at all, so those use the measured//set value instead.
 */
export function isVerticalItem(item: Pick<FeaturedItem, "videoVertical" | "videoUrl">): boolean {
  if (isYouTubeVideoUrl(item.videoUrl)) return isVerticalVideoUrl(item.videoUrl);
  return item.videoVertical ?? false;
}

/**
 * Turns a pasted YouTube, Vimeo, or Google Drive link into an embeddable
 * player URL. Returns null if the link isn't recognized.
 */
export function videoEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube: watch?v=ID, youtu.be/ID, /shorts/ID, /embed/ID, /live/ID
  const yt = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/
  );
  if (yt) {
    // rel=0: related videos limited to the same channel; cc/iv off: captions
    // and overlays hidden; playsinline: play inside the page on phones.
    // Plain youtube.com host — the nocookie domain plus legacy params
    // triggers "error 153" on some mobile browsers.
    return `https://www.youtube.com/embed/${yt[1]}?rel=0&cc_load_policy=0&iv_load_policy=3&playsinline=1`;
  }

  // Vimeo: vimeo.com/12345 or player.vimeo.com/video/12345
  const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d{6,})/);
  if (vimeo) {
    // autoplay=0 & muted=0 override whatever the video's own embed settings
    // say. They matter together: browsers refuse to autoplay with sound, so
    // a player set to autoplay starts muted and makes the viewer unmute it.
    // Waiting for a click means the click itself permits audio.
    return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=0&muted=0`;
  }

  // Google Drive: /file/d/ID/view, /file/d/ID/preview, or open?id=ID.
  // The file's sharing must be set to "Anyone with the link".
  const driveId = driveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  return null;
}

export const content = raw as SiteContent;
export const profile = content.profile;
export const featuredWork = content.featuredWork;
export const photos = content.photos;
export const reelClips = content.reelClips ?? [];
export const showcasePhoto = content.showcasePhoto;
export const sectionText = { ...defaultSectionText, ...(content.sectionText ?? {}) };
export const brands = content.brands;
export const skills = content.skills;
