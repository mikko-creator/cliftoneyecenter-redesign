/* forms.mjs - rebuild the two Gravity Forms field-for-field from the SOURCE markup.

   Ported from the friscoeyesource reference (src/lib/forms.mjs) with docs/PORT-NOTES.md F-1..F-3:
   - F-1  DEFAULT_FIELDS and the "every page gets a form" fallback are DELETED. A form renders only
          where div.gform_wrapper sits inside <main> (/contact-us/appointment-request-form/ and
          /contact-us/contact-form/). content.mjs prepare() finds the wrapper; this file parses it.
   - F-2  the input is the script-stripped <main> markup, never the raw bytes (the inline jQuery
          string "<form></form><form></form>" sits on 347 pages).
   - F-3  no authored strings: the form's name is the page h1 (aria-labelledby="page-title"), the
          button is the source value "Submit", the PHI note is gone. The only UI sentence is the
          honest notice decided in BUILD-DECISIONS #4 (chrome.json notice).
   Gravity Forms is parsed per field (li.gfield), so every label, sub-label, description, required
   mark, option and placeholder is the source's own. The honeypot (li.gform_validation_container,
   labelled "Email"/"Phone" here) and the Akismet block are anti-spam plumbing and are dropped (L23).
   Markup: docs/COMPONENTS.md E.1/E.2 (ids f{formId}-{fieldId} from the GF input ids). */
import { esc, decodeEntities, plain, findElements } from './util.mjs';

const attrOf = (tag, name) => {
  const m = new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(tag || '');
  return m ? (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]) : null;
};
const openTag = (html) => (/^<[^>]*>/.exec(html) || [''])[0];
/* label text without the required-asterisk spans */
const labelText = (inner) => plain(String(inner || '').replace(/<span class="gfield_required[\s\S]*?<\/span>\s*<\/span>|<span class="gfield_required[^"]*"[^>]*>\*<\/span>/gi, ''));
const lastNum = (id) => (String(id || '').match(/_(\d+)$/) || [])[1] || '';

/* Returns { id, fields: [...], submit } or null. Field kinds: note, text, email, tel, number,
   textarea, radio, checkbox, name, time. */
export function parseGravityForm(wrapperHtml) {
  const formTag = /<form\b[^>]*>/i.exec(wrapperHtml);
  if (!formTag) return null;
  const id = attrOf(formTag[0], 'id') || 'gform';
  const submit = /<input\b[^>]*type=['"]submit['"][^>]*>/i.exec(wrapperHtml);
  const fields = [];
  for (const li of findElements(wrapperHtml, /<(li)\b[^>]*class="gfield\b[^"]*"[^>]*>/gi)) {
    const cls = attrOf(openTag(li.html), 'class') || '';
    if (/gform_validation_container|gfield--type-honeypot/.test(cls)) continue;
    const gfId = lastNum(attrOf(openTag(li.html), 'id')) || String(fields.length + 1);
    const required = /gfield_contains_required/.test(cls);
    const labelM = /<label class='gfield_label[^']*'[^>]*>([\s\S]*?)<\/label>/i.exec(li.html) || /<label class="gfield_label[^"]*"[^>]*>([\s\S]*?)<\/label>/i.exec(li.html);
    const label = labelM ? labelText(labelM[1]) : '';
    const descM = /<div class='gfield_description'[^>]*>([\s\S]*?)<\/div>/i.exec(li.html);
    const description = descM ? descM[1].trim() : '';
    const type = (/gfield--type-([a-z]+)/.exec(cls) || [])[1] || 'text';
    if (type === 'html') {
      /* an HTML field is copy: keep its paragraphs (the contact form's intro has an inner <p>) */
      const inner = li.html.replace(/^<li\b[^>]*>/i, '').replace(/<\/li>$/i, '');
      const paras = inner.split(/<\/?p\b[^>]*>/i).map((x) => x.trim()).filter((x) => plain(x));
      fields.push({ kind: 'note', paras, gfId });
      continue;
    }
    if (type === 'radio' || type === 'checkbox') {
      const options = [...li.html.matchAll(/<input\b([^>]*type='(?:radio|checkbox)'[^>]*)\/?>\s*<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => ({ value: decodeEntities(attrOf(m[1], 'value') || ''), label: plain(m[2]) }));
      fields.push({ kind: type, label, required, description, options, gfId });
      continue;
    }
    if (type === 'name') {
      const parts = [...li.html.matchAll(/<input\b([^>]*)\/?>\s*<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => ({ sub: plain(m[2]), required: /aria-required=['"]true/.test(m[1]), gfSub: lastNum(attrOf(m[1], 'id')) }));
      fields.push({ kind: 'name', label, required, description, parts, gfId });
      continue;
    }
    if (type === 'time') {
      const hour = /<input\b([^>]*id='input_\d+_\d+_1'[^>]*)>/i.exec(li.html);
      const minute = /<input\b([^>]*id='input_\d+_\d+_2'[^>]*)>/i.exec(li.html);
      const ampm = /<select\b([^>]*)>([\s\S]*?)<\/select>/i.exec(li.html);
      const subs = [...li.html.matchAll(/<label\b[^>]*class='[^']*gform-field-label--type-sub[^']*'[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => plain(m[1]));
      const num = (m, sub) => (m ? { placeholder: attrOf(m[1], 'placeholder') || '', min: attrOf(m[1], 'min'), max: attrOf(m[1], 'max'), sub, gfSub: lastNum(attrOf(m[1], 'id')) } : null);
      fields.push({
        kind: 'time', label, required, description, gfId,
        hour: num(hour, subs[0] || ''),
        minute: num(minute, subs[1] || ''),
        ampm: ampm ? { options: [...ampm[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map((m) => ({ value: attrOf(m[1], 'value') || '', label: plain(m[2]) })), sub: subs[2] || '', gfSub: lastNum(attrOf(ampm[1], 'id')) } : null,
      });
      continue;
    }
    const isTextarea = /<textarea\b/i.test(li.html);
    const input = /<input\b([^>]*)>/i.exec(li.html);
    const inputType = input ? (attrOf(input[1], 'type') || 'text').toLowerCase() : 'text';
    fields.push({ kind: isTextarea ? 'textarea' : (['email', 'tel', 'number'].includes(inputType) ? inputType : 'text'), label, required, description, gfId, placeholder: input ? attrOf(input[1], 'placeholder') || '' : '' });
  }
  return { id, fields, submit: submit ? decodeEntities(attrOf(submit[0], 'value') || '') : '' };
}

/* CS-04: the source form's Gravity Forms conditional logic (window['gf_form_conditional_logic'][N], a script in
   the RAW page: data, not runtime) -> { gfId: { field: gfId of the controlling field, value } }. Only what this site
   uses is carried: actionType "show", one rule, operator "is" (contact form: Email shows when "Should we reply?"
   is "Email", Phone when it is "Call"). Anything else is returned in `unsupported` and the build fails closed. */
export function parseConditionalLogic(raw, formId) {
  const num = String(formId || '').replace(/^gform_/, '');
  const at = String(raw).indexOf("gf_form_conditional_logic'][" + num + ']');
  const out = { rules: {}, unsupported: [] };
  if (at < 0) return out;
  const block = String(raw).slice(at, at + 20000);
  const logic = /logic:\s*\{([\s\S]*?)\},\s*dependents:/.exec(block);
  if (!logic) { out.unsupported.push('conditional logic present but not parseable'); return out; }
  for (const m of logic[1].matchAll(/(\d+):\s*(\{"field":[\s\S]*?"section":[^}]*\})/g)) {
    let rule;
    try { rule = JSON.parse(m[2]).field; } catch { out.unsupported.push('field ' + m[1] + ': unparseable rule'); continue; }
    const r = rule && rule.rules || [];
    if (!rule || rule.actionType !== 'show' || r.length !== 1 || r[0].operator !== 'is') { out.unsupported.push('field ' + m[1] + ': ' + JSON.stringify(rule).slice(0, 160)); continue; }
    out.rules[m[1]] = { field: String(r[0].fieldId), value: String(r[0].value) };
  }
  return out;
}

/* COMPONENTS E.1/E.2. `localHref(href)` relativises links inside descriptions; `icon(name)` gives
   the sprite reference; `notice` is chrome.notice; `phone` the practice phone. */
export function renderForm(form, { localHref, icon, notice, phone, conditional }) {
  const fid = String(form.id || '').replace(/^gform_/, '');
  const out = [];
  const req = '<span class="field__req" aria-hidden="true">*</span>';
  const errP = (id) => '<p class="field__error" id="' + id + '-err" data-field-error hidden>' + icon('alert') + '<span class="field__error-text"></span></p>';
  const fixLinks = (h) => String(h).replace(/<a\b([^>]*)>/gi, (m, attrs) => {
    const raw = decodeEntities(attrOf(attrs, 'href') || '');
    const to = localHref(raw);
    return to ? '<a href="' + esc(to) + '">' : '<a>';
  }).replace(/<a>([\s\S]*?)<\/a>/g, '$1').replace(/<(?!\/?(a|strong|em|br)\b)[^>]+>/gi, '');
  const intro = [];
  for (const f of form.fields) {
    if (f.kind === 'note') { for (const para of f.paras) intro.push('<p>' + fixLinks(para) + '</p>'); continue; }
    const id = 'f' + fid + '-' + f.gfId;
    const help = f.description ? '<p class="field__help" id="' + id + '-help">' + fixLinks(f.description) + '</p>\n' : '';
    const describedby = f.description ? ' aria-describedby="' + id + '-help"' : '';
    const r = f.required ? ' required aria-required="true"' : '';
    /* CS-04: a field the source shows only for one choice carries data-show-if="{controlling name}={value}" (site.js) */
    const cond = conditional && conditional[f.gfId];
    const showIf = cond ? ' data-show-if="' + esc('f' + fid + '-' + cond.field + '=' + cond.value) + '"' : '';
    if (f.kind === 'radio' || f.kind === 'checkbox') {
      out.push('<fieldset class="field field--choice"' + describedby + showIf + '>\n<legend class="field__label">' + esc(f.label) + (f.required ? req : '') + '</legend>\n'
        + f.options.map((o, i) => '<div class="choice"><input class="choice__input" type="' + f.kind + '" id="' + id + '-' + i + '" name="' + id + '" value="' + esc(o.value) + '"' + (f.required && f.kind === 'radio' ? ' required' : '') /* COMPONENTS E.2: aria-required is not valid on role radio (VIB-07) */ + '><label class="choice__label" for="' + id + '-' + i + '">' + esc(o.label) + '</label></div>').join('\n')
        + '\n' + help + errP(id) + '\n</fieldset>');
      continue;
    }
    if (f.kind === 'name' || f.kind === 'time') {
      const subs = [];
      if (f.kind === 'name') {
        for (const pt of f.parts) {
          const sid = id + '-' + pt.gfSub;
          subs.push('<div class="field__sub"><input class="field__control" type="text" id="' + sid + '" name="' + sid + '"' + (pt.required ? ' required aria-required="true"' : '') + ' autocomplete="' + (/first/i.test(pt.sub) ? 'given-name' : /last/i.test(pt.sub) ? 'family-name' : 'off') + '"><label class="field__sublabel" for="' + sid + '">' + esc(pt.sub) + '</label></div>');
        }
      } else {
        for (const k of ['hour', 'minute']) {
          const x = f[k]; if (!x) continue;
          const sid = id + '-' + x.gfSub;
          subs.push('<div class="field__sub"><input class="field__control" type="number" id="' + sid + '" name="' + sid + '"' + (x.min !== null ? ' min="' + esc(x.min) + '"' : '') + (x.max !== null ? ' max="' + esc(x.max) + '"' : '') + ' step="1"' + (x.placeholder ? ' placeholder="' + esc(x.placeholder) + '"' : '') + r + '><label class="field__sublabel" for="' + sid + '">' + esc(x.sub) + '</label></div>');
        }
        if (f.ampm) {
          const sid = id + '-' + f.ampm.gfSub;
          subs.push('<div class="field__sub"><select class="field__control" id="' + sid + '" name="' + sid + '"' + r + '>' + f.ampm.options.map((o) => '<option value="' + esc(o.value) + '">' + esc(o.label) + '</option>').join('') + '</select><label class="field__sublabel" for="' + sid + '">' + esc(f.ampm.sub) + '</label></div>');
        }
      }
      out.push('<fieldset class="field field--group"' + describedby + showIf + '>\n<legend class="field__label">' + esc(f.label) + (f.required ? req : '') + '</legend>\n<div class="field__row">\n' + subs.join('\n') + '\n</div>\n' + help + errP(id) + '\n</fieldset>');
      continue;
    }
    const auto = f.kind === 'email' ? ' autocomplete="email"' : f.kind === 'tel' ? ' autocomplete="tel"' : '';
    const ph = f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '';
    const label = '<label class="field__label" for="' + id + '">' + esc(f.label) + (f.required ? req : '') + '</label>';
    const control = f.kind === 'textarea'
      ? '<textarea class="field__control" id="' + id + '" name="' + id + '" rows="6"' + r + describedby + '></textarea>'
      : '<input class="field__control" type="' + f.kind + '" id="' + id + '" name="' + id + '"' + r + auto + ph + describedby + '>';
    out.push('<div class="field' + (f.kind === 'textarea' ? ' field--wide' : '') + '"' + showIf + '>\n' + label + '\n' + control + '\n' + help + errP(id) + '\n</div>');
  }
  return [
    '<form class="form" method="post" aria-labelledby="page-title" data-form>',
    intro.length ? '<div class="form__intro">' + intro.join('') + '</div>' : '',
    '<div class="form__grid">\n' + out.join('\n') + '\n</div>',
    '<div class="form__foot">',
    '<p class="form__notice glass glass--leaf" role="status" tabindex="-1" data-form-notice hidden>' + esc(notice.before) + '<a href="tel:' + esc(phone) + '">' + esc(phone) + '</a>' + esc(notice.after || '') + '</p>',
    '<button class="btn btn--primary" type="submit">' + esc(form.submit || 'Submit') + '</button>',
    '</div>',
    '</form>',
  ].filter(Boolean).join('\n');
}
