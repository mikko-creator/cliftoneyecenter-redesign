/* images.mjs - web-ready copies of every image the build ships.
   Ported unchanged in mechanism from the friscoeyesource reference (src/lib/images.mjs):
   JPEG/PNG -> WebP via cwebp (on PATH, or $CWEBP), capped to a max width for its role, cached by
   content hash + settings so a rebuild re-encodes nothing and two builds produce identical bytes.
   Generated images get their AI provenance label (IPTC DigitalSourceType trainedAlgorithmicMedia,
   CreatorTool, description) written back as an XMP chunk with webpmux, exactly as the reference.
   Clifton additions: `lossless` (the QR code must stay scannable: DESIGN-SPEC 3.21 / 6.5 says
   byte-identical, so it is COPIED, never re-encoded), and GIFs ship as-is. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { imageSize } from './util.mjs';

const CWEBP = process.env.CWEBP || 'cwebp';
let encoderOk = null;
function hasEncoder() {
  if (encoderOk === null) {
    const r = spawnSync(CWEBP, ['-version'], { encoding: 'utf8' });
    encoderOk = r.status === 0;
  }
  return encoderOk;
}

export function createImages({ cacheDir, stats }) {
  fs.mkdirSync(cacheDir, { recursive: true });
  /* The file's real format, from its first bytes - an extension is a claim, not evidence
     (this harvest holds a GIF named .png and an HTML soft-404 named .jpg). */
  function sniff(b) {
    if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8) return '.jpg';
    if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return '.png';
    if (b.slice(0, 3).toString('latin1') === 'GIF') return '.gif';
    if (b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP') return '.webp';
    if (/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(b.slice(0, 400).toString('utf8'))) return '.svg';
    return null;
  }
  function xmpPacket(label) {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
      + '<rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/">'
      + '<Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia</Iptc4xmpExt:DigitalSourceType>'
      + '<xmp:CreatorTool>' + esc(label.tool) + '</xmp:CreatorTool>'
      + '<dc:description><rdf:Alt><rdf:li xml:lang="x-default">' + esc(label.description) + '</rdf:li></rdf:Alt></dc:description>'
      + '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>';
  }
  /* Returns { rel, w, h, webp } (rel = file name inside the cache dir) or null when not an image. */
  function web(srcAbs, { maxW = 1600, q = 80, name, aiLabel = null, lossless = false, alphaQ = 90 } = {}) {
    const meta = aiLabel ? 'ai:' + JSON.stringify(aiLabel) : 'none';
    const bytes = fs.readFileSync(srcAbs);
    const ext = sniff(bytes);
    if (!ext) return null;
    const dim = imageSize(srcAbs);
    const base = (name || path.basename(srcAbs, path.extname(srcAbs))).replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'img';
    const convertible = (ext === '.jpg' || ext === '.png') && hasEncoder() && !lossless;
    if (!convertible) {
      if ((ext === '.jpg' || ext === '.png') && !lossless) stats.encoderMissing = (stats.encoderMissing || 0) + 1;
      const key = crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 10);
      const rel = base + '.' + key + ext;
      const out = path.join(cacheDir, rel);
      if (!fs.existsSync(out)) fs.writeFileSync(out, bytes);
      if (lossless) stats.copiedLossless = (stats.copiedLossless || 0) + 1;
      return { rel, w: dim && dim.w, h: dim && dim.h, webp: false };
    }
    const key = crypto.createHash('sha1').update(bytes).update('|' + maxW + '|' + q + '|' + meta + (alphaQ !== 90 ? '|aq' + alphaQ : '')).digest('hex').slice(0, 10);
    const rel = base + '.' + key + '.webp';
    const out = path.join(cacheDir, rel);
    if (!fs.existsSync(out)) {
      const argv = ['-quiet', '-q', String(q), '-m', '6', '-metadata', 'none'];
      if (ext === '.png') argv.push('-exact', '-alpha_q', String(alphaQ));   /* alphaQ 100 = lossless alpha (the 6% texture's 0-15 alpha must not be quantised) */
      let input = srcAbs;
      /* cwebp picks its decoder from the file NAME on Windows (WIC); a mislabelled source goes via a correctly named temp copy */
      if (path.extname(srcAbs).toLowerCase().replace('jpeg', 'jpg') !== ext) {
        input = path.join(cacheDir, '.sniffed-' + key + ext);
        fs.writeFileSync(input, bytes);
      }
      if (dim && dim.w > maxW) argv.push('-resize', String(maxW), '0');
      const tmpOut = out + '.part.webp';
      argv.push(input, '-o', tmpOut);
      const r = spawnSync(CWEBP, argv, { encoding: 'utf8' });
      if (r.status !== 0 || !fs.existsSync(tmpOut)) throw new Error('cwebp failed for ' + srcAbs + ': ' + (r.stderr || r.stdout));
      if (aiLabel) {
        const x = path.join(cacheDir, '.xmp-' + key + '.xml');
        const tmp = out + '.xmp.webp';
        fs.writeFileSync(x, xmpPacket(aiLabel));
        const mux = spawnSync(process.env.WEBPMUX || 'webpmux', ['-set', 'xmp', x, tmpOut, '-o', tmp], { encoding: 'utf8' });
        if (mux.status !== 0 || !fs.existsSync(tmp)) throw new Error('webpmux failed for ' + out + ': ' + (mux.stderr || mux.stdout));
        fs.unlinkSync(tmpOut);
        fs.renameSync(tmp, out);
        fs.unlinkSync(x);
        stats.aiLabelled = (stats.aiLabelled || 0) + 1;
      } else fs.renameSync(tmpOut, out);
      if (input !== srcAbs) fs.unlinkSync(input);
      stats.encoded = (stats.encoded || 0) + 1;
    } else stats.cached = (stats.cached || 0) + 1;
    const d = imageSize(out);
    return { rel, w: d && d.w, h: d && d.h, webp: true };
  }
  return { web, hasEncoder, sniff };
}
