/* images.mjs (neo) - the neoclassical theme's image slot map and derivative recipes (docs/NEO-SPEC.md 0.2 build
   hooks 1-3, 2.7, 2.10, 6.3, 6.5). Read ONLY by the theme hooks of src/build.mjs (every one guarded by
   THEME !== 'glass'); the glass build never imports this file. Node builtins only; no side effects.

   Hook 1 (image map): bandPlan, the cut-out prefix table and the 404 cut-out replace the inline glass tables
          (build.mjs CUTS / bandPlan / 'cut-lens-prism'). PHOTO_PAGES, BAND_FOCUS and the SVC feature table stay shared.
   Hook 2 (derivatives): every id in DERIVE is baked once with ffmpeg (tone + resize, cached by source hash + recipe
          in tmp/build-cache/derived/), then encoded by the shared encoder with the AI label; genFor / useGen /
          ctx.gen return the derivative, so no template ever sees a raw neo file.
   Hook 3 (grounds): the three pre-composited marble grounds (texture at its cap over the flat colour), appended to
          the shipped tokens.css as --n-ground-light / --n-ground-dark / --n-ground-deep. */

/* ---- 2.10 treatments (ffmpeg -vf fragments; each runs after the crop/scale) ---- */
export const TONES = {
  /* T0: original pixels, resize only (the magnifier and the laurel keep their colour: NEO-SPEC 2.10) */
  T0: 'format=rgba',
  /* T3 duo-marble: --ink-950 -> --marble-50, alpha kept exactly */
  T3: "format=rgba,colorchannelmixer=rr=.2126:rg=.7152:rb=.0722:gr=.2126:gg=.7152:gb=.0722:br=.2126:bg=.7152:bb=.0722,lutrgb=r='35+val*212/255':g='34+val*211/255':b='41+val*195/255':a=val",
  /* T5 duo-niche: tritone --poster-deep, --green-800 at 63%, --marble-400 after a 1.8 gamma (no text ever on it) */
  T5: "format=gray,lut=y='255*pow(val/255,1.8)',format=rgb24,lutrgb=r='if(lt(val,160),17+val*32/160,49+(val-160)*113/95)':g='if(lt(val,160),20+val*53/160,73+(val-160)*87/95)':b='if(lt(val,160),11-val*11/160,(val-160)*162/95)'",
};
export const TONE_LABEL = { T0: 'resized by the build', T3: 'tone-mapped (T3 duo-marble) and resized by the build', T5: 'tone-mapped (T5 duo-niche), cropped 3:4 and resized by the build' };

/* ---- 6.5 derivatives: id -> treatment, max width (never upscaled), crop, cwebp quality ---- */
export const DERIVE = {
  'neo-cut-bust-glasses': { tone: 'T3', maxW: 760, q: 82 },
  'neo-cut-bust-profile': { tone: 'T3', maxW: 560, q: 82 },
  'neo-cut-column': { tone: 'T3', maxW: 480, q: 82 },
  'neo-cut-hand-spectacles': { tone: 'T3', maxW: 560, q: 82 },
  'neo-cut-eye-relief': { tone: 'T3', maxW: 560, q: 82 },
  'neo-cut-magnifier': { tone: 'T0', maxW: 600, q: 82 },
  'neo-cut-laurel': { tone: 'T0', maxW: 400, q: 82 },
  'neo-scene-colonnade': { tone: 'T5', maxW: 640, q: 76, crop: '3:4' },
  'neo-scene-arch-garden': { tone: 'T5', maxW: 640, q: 76, crop: '3:4' },
  'neo-scene-library': { tone: 'T5', maxW: 640, q: 76, crop: '3:4' },
};
/* the full -vf chain of one derivative: centred crop (if any), lanczos resize capped at maxW, then the tone */
export function recipeOf(d) {
  const crop = d.crop === '3:4' ? "crop=w='min(iw,ih*3/4)':h='min(ih,iw*4/3)'," : '';
  return crop + "scale=w='min(iw," + d.maxW + ")':h=-2:flags=lanczos," + TONES[d.tone];
}

/* ---- 2.7 grounds: the texture at its cap composited over the flat colour (normal blend: c*(1-a) + t*a), 1600 wide,
   cwebp q60. light 18% over --marble-50 #f7f5ec; dark 14% over --poster #1b2012; deep 10% over --poster-deep #11140b ---- */
export const GROUNDS = [
  { token: '--n-ground-light', name: 'neo-ground-light', id: 'neo-tex-marble-light', over: [0xf7, 0xf5, 0xec], alpha: 0.18, overName: 'marble-50' },
  { token: '--n-ground-dark', name: 'neo-ground-dark', id: 'neo-tex-marble-dark', over: [0x1b, 0x20, 0x12], alpha: 0.14, overName: 'poster' },
  { token: '--n-ground-deep', name: 'neo-ground-deep', id: 'neo-tex-marble-dark', over: [0x11, 0x14, 0x0b], alpha: 0.10, overName: 'poster-deep' },
];
export const GROUND_W = 1600, GROUND_Q = 60;
export function groundRecipe(g) {
  const ch = (i) => "'val*" + g.alpha + '+' + g.over[i] + '*' + (1 - g.alpha).toFixed(2) + "'";
  return 'scale=' + GROUND_W + ':-1:flags=lanczos,format=rgb24,lutrgb=r=' + ch(0) + ':g=' + ch(1) + ':b=' + ch(2);
}

/* ---- 6.3 band scene by family (the --photo pages are the shared glass PHOTO_PAGES) ---- */
const SCENE_BY_FAMILY = {
  'service-hub': 'neo-scene-colonnade', 'service-detail': 'neo-scene-colonnade', insurance: 'neo-scene-colonnade', 'contact-forms': 'neo-scene-colonnade',
  'eyewear-contacts': 'neo-scene-arch-garden',
  'library-article': 'neo-scene-library', 'blog-index': 'neo-scene-library',
};
export function bandPlan(family, p, photoPages) {
  if (photoPages.has(p)) return { variant: 'photo' };
  const scene = SCENE_BY_FAMILY[family];
  return scene ? { variant: 'scene', scene } : { variant: 'plain' };
}

/* ---- 6.3 cut-out by URL prefix, first match wins (then the build's exclusions); the glass CUTS format ---- */
export function cutRules(libIndexes) {
  return [
    [{ test: (x) => libIndexes.has(x) }, 'neo-cut-bust-profile'],
    [/^\/eye-care-services\/eye-exams\/pediatric-eye-exams\/|^\/eyeglasses-contacts\/eyeglasses\/kids-optical\//, 'neo-cut-hand-spectacles'],
    [/^\/eye-care-services\/eye-exams\//, 'neo-cut-eye-relief'],
    [/^\/eye-care-services\/contact-lens-exams\/|^\/eyeglasses-contacts\/contact-lenses\/|^\/order-contacts-online\//, 'neo-cut-eye-relief'],
    [/^\/eyeglasses-contacts\/eyeglasses\/transitions-lenses\/|^\/eyeglasses-contacts\/eyeglasses\/designer-frames\/|^\/promotions\//, null],
    [/^\/eyeglasses-contacts\//, 'neo-cut-hand-spectacles'],
    [/^\/eye-care-services\/$|^\/eye-care-services\/eye-conditions\/|^\/eye-care-services\/management-of-ocular-diseases\/|^\/eye-care-services\/eye-emergencies-pinkred-eyes\/|^\/eye-care-services\/lasik-refractive-surgery-co-management\//, 'neo-cut-eye-relief'],
  ];
}
/* 3.23: the 404 sheet's relief */
export const CUT_404 = 'neo-cut-eye-relief';
