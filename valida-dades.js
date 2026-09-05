#!/usr/bin/env node
/*
 * valida-dades.js — Comprovació de coherència de totes les dades del projecte.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *     node valida-dades.js
 *
 * Sense arguments i sense dependències: només Node i els fitxers del repo.
 * Torna codi 0 si tot lliga i 1 si hi ha errors, així que es pot encadenar
 * abans d'un commit.
 *
 * PER QUÈ EXISTEIX
 *   Les dades del projecte estan repartides en cinc llocs que s'han de
 *   correspondre entre ells, i les relacions no són evidents:
 *
 *     florence-cb.html (PAYLOAD) ──┬─→ cb-img/CB<id>.png      (cada id, una targeta)
 *                                  └─→ florence-pdf/<id>.pdf  (cada sessió amb pdf:true)
 *     pipeline-data.js ────────────┬─→ PAYLOAD                (sessions i ids CB)
 *                                  └─→ repartiment-data.js    (cursos, temes, posicions)
 *
 *   Cap d'aquestes relacions no peta en execució: si falla, el que passa és
 *   que una imatge no carrega o que una proposta desapareix en silenci. És
 *   exactament el tipus d'error que no es veu fins que un professor se'l
 *   troba a classe. Per això es comprova aquí.
 *
 * QUAN EXECUTAR-LO
 *   Sempre que toquis el PAYLOAD, pipeline-data.js, repartiment-data.js,
 *   cb-img/ o florence-pdf/. En particular, cada juny (vegeu
 *   ACTUALITZACIO-ANUAL.md), després d'incorporar l'edició CB de l'any i les
 *   sessions Florence noves.
 *
 *   Al final imprimeix les XIFRES que apareixen escrites als fitxers .md
 *   (recomptes d'imatges, de sessions, de cobertura). Copia-les tal com
 *   surten: és l'única llista d'on són.
 */

const fs = require('fs');
const path = require('path');

const ARREL = __dirname;
const F = p => path.join(ARREL, p);

const errors = [], avisos = [], info = [];
const err = m => errors.push(m);
const avis = m => avisos.push(m);

/* ── Càrrega ────────────────────────────────────────────────────────── */

function llegeix(nom) {
  try { return fs.readFileSync(F(nom), 'utf8'); }
  catch (e) { err(`No es pot llegir ${nom}: ${e.message}`); return null; }
}

/* Els fitxers de dades són JS, no JSON: els avaluem tal com faria el
   navegador, en un àmbit aïllat, i en recollim les constants globals. */
function constantsDe(fitxers, noms) {
  const codi = fitxers.map(n => llegeix(n) || '').join('\n');
  try {
    return new Function(codi + `\n; return {${noms.join(',')}};`)();
  } catch (e) {
    err(`Els fitxers ${fitxers.join(' + ')} no s'avaluen: ${e.message}`);
    return null;
  }
}

/* El PAYLOAD viu dins de florence-cb.html, en una sola línia. */
function payloadDe(html) {
  if (!html) return null;
  const m = html.match(/const PAYLOAD\s*=\s*(\{[\s\S]*?\});?\s*\n/);
  if (!m) { err('No s\'ha trobat «const PAYLOAD = {…}» dins de florence-cb.html'); return null; }
  try { return JSON.parse(m[1]); }
  catch (e) { err(`El PAYLOAD no és JSON vàlid: ${e.message}`); return null; }
}

const html    = llegeix('florence-cb.html');
const PAYLOAD = payloadDe(html);
const rep     = constantsDe(['repartiment-data.js'], ['REPARTIMENT', 'SENTITS', 'CONTINGUTS_ACTIVITATS']);
const pip     = constantsDe(['pipeline-data.js'], ['PIPELINES', 'CONTINGUT_PIPELINE']);

if (!PAYLOAD || !rep || !pip) { bolca(); process.exit(1); }

const { REPARTIMENT, CONTINGUTS_ACTIVITATS } = rep;
const { PIPELINES, CONTINGUT_PIPELINE } = pip;
const CURSOS = ['1ESO', '2ESO', '3ESO', '4ESO'];
const ORDINAL = { '1ESO':'1r', '2ESO':'2n', '3ESO':'3r', '4ESO':'4t' };

/* ── Índexs ─────────────────────────────────────────────────────────── */

const sessions = {};            // id de sessió → graf
const cbAlPayload = new Set();  // ids CB referenciats per alguna sessió
for (const g of ['1', '2', '3', '4']) {
  for (const s of (PAYLOAD['d' + g] || [])) {
    if (sessions[s.id]) err(`Sessió duplicada al PAYLOAD: ${s.id}`);
    sessions[s.id] = g;
    const vistos = new Set();
    for (const c of (s.cb || [])) {
      if (vistos.has(c.id)) err(`${s.id} repeteix la pregunta CB ${c.id}`);
      vistos.add(c.id);
      cbAlPayload.add(c.id);
    }
    // Les llistes cb es mantenen ordenades per pes descendent (ACTUALITZACIO-ANUAL)
    const pesos = (s.cb || []).map(c => c.pes);
    if (pesos.some((p, i) => i && p > pesos[i-1]))
      avis(`${s.id}: la llista cb no està ordenada per pes descendent`);
  }
}

const temes = {};   // "CURS|sentit/tema" → objecte tema
for (const curs of CURSOS) {
  for (const b of ((REPARTIMENT[curs] || {}).blocs || [])) {
    for (const t of b.temes) temes[`${curs}|${b.sentit}/${t.id}`] = t;
  }
}

const fitxers = d => { try { return fs.readdirSync(F(d)); } catch { return []; } };
const targetes = new Set(fitxers('cb-img')
  .map(f => (f.match(/^CB(\d+)\.png$/) || [])[1]).filter(Boolean).map(Number));
const pdfs = new Set(fitxers('florence-pdf').filter(f => f.endsWith('.pdf')).map(f => f.slice(0, -4)));

/* ── 1. PAYLOAD ↔ imatges i PDF ─────────────────────────────────────── */

for (const id of cbAlPayload)
  if (!targetes.has(id)) err(`Falta la targeta cb-img/CB${id}.png (la referencia el PAYLOAD)`);
for (const id of targetes)
  if (!cbAlPayload.has(id)) avis(`cb-img/CB${id}.png no la referencia cap sessió`);

for (const [sid, g] of Object.entries(sessions)) {
  const s = (PAYLOAD['d' + g] || []).find(x => x.id === sid);
  if (s.pdf && !pdfs.has(sid)) err(`${sid} declara pdf:true però no hi ha florence-pdf/${sid}.pdf`);
  if (!s.pdf && pdfs.has(sid)) avis(`Hi ha florence-pdf/${sid}.pdf però la sessió diu pdf:false`);
  if (!s.nucli) avis(`${sid} no té «nucli»: la fitxa quedarà sense la línia explicativa`);
}
for (const p of pdfs)
  if (!sessions[p]) avis(`florence-pdf/${p}.pdf no correspon a cap sessió del PAYLOAD`);

/* ── 2. Relacions ff<n> ─────────────────────────────────────────────── */

for (const g of ['1', '2', '3', '4']) {
  for (const [a, b] of (PAYLOAD['ff' + g] || [])) {
    for (const x of [a, b]) {
      if (!sessions[x]) err(`ff${g} apunta a una sessió inexistent: ${x}`);
      else if (sessions[x] !== g) err(`ff${g} relaciona ${x}, que és del graf ${sessions[x]}`);
    }
  }
}

/* ── 3. PIPELINES ───────────────────────────────────────────────────── */

for (const [pid, p] of Object.entries(PIPELINES)) {
  if (!p.label) err(`El fil «${pid}» no té label`);
  const vistes = new Set();
  for (const [sid, pes] of (p.florence || [])) {
    if (!sessions[sid]) err(`El fil «${pid}» apunta a una sessió inexistent: ${sid}`);
    if (![1,2,3].includes(pes)) err(`El fil «${pid}» dona un encaix invàlid a ${sid}: ${pes}`);
    if (vistes.has(sid)) err(`El fil «${pid}» repeteix la sessió ${sid}`);
    vistes.add(sid);
  }
  const cbVistes = new Set();
  for (const id of (p.cb || [])) {
    // Cal la targeta PER VEURE-LA i la fitxa del PAYLOAD per saber-ne font i descripció.
    if (!targetes.has(id)) err(`El fil «${pid}» fa servir CB ${id}, que no té targeta a cb-img/`);
    if (!cbAlPayload.has(id))
      err(`El fil «${pid}» fa servir CB ${id}, que cap sessió no descriu: sortiria sense font ni text`);
    if (cbVistes.has(id)) err(`El fil «${pid}» repeteix la pregunta CB ${id}`);
    cbVistes.add(id);
  }
  if (!(p.florence || []).length && !(p.cb || []).length)
    err(`El fil «${pid}» és buit: no proposa ni tasca ni pràctica`);
}

/* ── 4. CONTINGUT_PIPELINE ──────────────────────────────────────────── */

const filsUsats = new Set();
for (const [clau, mapa] of Object.entries(CONTINGUT_PIPELINE)) {
  const t = temes[clau];
  if (!t) { err(`CONTINGUT_PIPELINE té una clau que no és cap tema: «${clau}»`); continue; }
  for (const [pos, ids] of Object.entries(mapa)) {
    const n = Number(pos);
    if (!(n >= 1 && n <= t.continguts.length))
      err(`«${clau}» posició ${pos}: el tema només té ${t.continguts.length} continguts`);
    for (const id of ids) {
      if (!PIPELINES[id]) err(`«${clau}»[${pos}] fa servir un fil desconegut: «${id}»`);
      filsUsats.add(id);
    }
    if (new Set(ids).size !== ids.length) avis(`«${clau}»[${pos}] repeteix algun fil`);
  }
}
for (const pid of Object.keys(PIPELINES))
  if (!filsUsats.has(pid)) avis(`El fil «${pid}» està definit però no el fa servir cap contingut`);

/* ── 5. CONTINGUTS_ACTIVITATS (pont amb el catàleg) ─────────────────── */
/* La seva clau no porta el curs, així que la mateixa taula s'aplica a tots
   els cursos que comparteixen «<sentit>/<tema.id>». Vegeu ARQUITECTURA §6.11.
   Aquí només mirem que les posicions existeixin en algun d'aquests cursos. */

for (const [clau, mapa] of Object.entries(CONTINGUTS_ACTIVITATS || {})) {
  const coincid = CURSOS.filter(c => temes[`${c}|${clau}`]);
  if (!coincid.length) { avis(`CONTINGUTS_ACTIVITATS: «${clau}» no és cap tema`); continue; }
  if (coincid.length > 1)
    avis(`CONTINGUTS_ACTIVITATS: «${clau}» existeix a ${coincid.join(', ')} amb continguts diferents; `
       + `les posicions només poden ser correctes per a un curs`);
  const max = Math.max(...coincid.map(c => temes[`${c}|${clau}`].continguts.length));
  for (const pos of Object.keys(mapa))
    if (Number(pos) > max) avis(`CONTINGUTS_ACTIVITATS: «${clau}» posició ${pos} no existeix enlloc`);
}

/* ── 6. cb-items.json (banc CB) ─────────────────────────────────────── */

let nItems = 0, maxItem = 0;
try {
  const cb = JSON.parse(llegeix('cb-items.json'));
  const ids = cb.blocks.flatMap(b => b.questions.map(q => q.id));
  nItems = ids.length; maxItem = Math.max(...ids);
  const falten = [...cbAlPayload].filter(id => !ids.includes(id)).sort((a,b) => a-b);
  if (falten.length)
    info.push(`cb-items.json va ${falten.length} preguntes endarrerit respecte del PAYLOAD `
      + `(ids ${falten[0]}–${falten[falten.length-1]}). Regenera'l amb genera_cb_items.py `
      + `si vols que banc-cb.html les tingui.`);
} catch { avis('No s\'ha pogut llegir cb-items.json'); }

/* ── Cobertura i xifres per als .md ─────────────────────────────────── */

const cobertura = {};
let totCont = 0, totAmb = 0;
for (const curs of CURSOS) {
  let tot = 0, amb = 0;
  for (const b of ((REPARTIMENT[curs] || {}).blocs || []))
    for (const t of b.temes)
      t.continguts.forEach((c, i) => {
        tot++;
        if (((CONTINGUT_PIPELINE[`${curs}|${b.sentit}/${t.id}`] || {})[i+1] || []).length) amb++;
      });
  cobertura[curs] = [amb, tot]; totCont += tot; totAmb += amb;
}
const nSessions = Object.keys(sessions).length;
const grafsPlens = ['1','2','3','4'].filter(g => (PAYLOAD['d'+g] || []).length);

/* ── Sortida ────────────────────────────────────────────────────────── */

function bolca() {
  for (const e of errors) console.log('  ERROR   ' + e);
  for (const a of avisos) console.log('  avís    ' + a);
}

console.log('\n── Coherència de les dades ──────────────────────────────────');
bolca();
if (!errors.length && !avisos.length) console.log('  Tot lliga.');
for (const i of info) console.log('\n  nota: ' + i);

console.log('\n── Xifres que apareixen escrites als .md ────────────────────');
console.log(`  Targetes cb-img/            ${targetes.size}`);
console.log(`  Ids CB referenciats         ${cbAlPayload.size}`);
console.log(`  Fitxes florence-pdf/        ${pdfs.size}`);
console.log(`  Sessions Florence           ${nSessions}  (grafs plens: ${grafsPlens.join(', ')})`);
console.log(`  Preguntes a cb-items.json   ${nItems}  (id més alt: ${maxItem})`);
console.log(`  Fils a pipeline-data.js     ${Object.keys(PIPELINES).length}`);
console.log(`  Cobertura del repartiment   ${totAmb}/${totCont}  ` +
  CURSOS.map(c => `${ORDINAL[c]} ${cobertura[c][0]}/${cobertura[c][1]}`).join(' · '));
console.log('\n  Cal repassar-les a: README.md, MANTENIMENT.md, ARQUITECTURA.md (§3, §4d, §4e, §6)');
console.log('  i ROADMAP-PEDAGOGIC.md (fitxes F2 i CB1).\n');

process.exit(errors.length ? 1 : 0);
