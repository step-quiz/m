# Arquitectura i referència tècnica

Descripció fidel de l'estat **actual** del projecte: com està organitzat, els contractes
de dades, les dependències de cada pàgina i les particularitats conegudes (inclosos els
detalls que convé tenir presents abans de tocar res).

---

## 1. Forma general

Nou pàgines HTML independents, cadascuna autocontinguda (el seu CSS i el seu JS dins del
mateix fitxer). El codi compartit està **parcialment** centralitzat: `common.js` aplega
utilitats com `escHtml`, `slugify` o `normalize` i constants com `FILTER_GROUPS`, i el
carreguen `index.html`, `repartiment.html`, `banc-cb.html` i `eliminar-curs.html`. La resta
de pàgines (`afegir-material.html`, `extreu-json.html`, `alimentar-banc.html` i
`examen-recuperacio.html`) **no** carreguen `common.js` i en conserven **còpies pròpies**
d'aquestes utilitats. És un compromís deliberat per evitar un pas de compilació; el cost és
que un canvi de lògica comuna s'ha de replicar a mà a les pàgines que no fan servir
`common.js`. Vegeu la millora `B3` a `MILLORES-TECNIQUES.md`.

Cada pàgina segueix la mateixa estructura interna: `CONFIG → STATE → utilitats → càlcul →
render → accions → events → init`, amb separadors de comentari. El codi està ben comentat,
sobretot a les parts no evidents.

Les dades viuen en quatre contractes separats:

- `manifest.json` → el cercador i l'editor.
- `cb-items.json` → el banc d'ítems CB.
- un objecte `PAYLOAD` incrustat dins de `florence-cb.html` → el mapa Florence.
- `recuperacio-items.json` → el banc de recuperació (generador d'exàmens + alimentador).

---

## 2. Contracte de dades: `manifest.json`

```jsonc
{
  "version": 1,
  "generated": "2026-06-02",        // se segella a cada descàrrega des de l'editor
  "folder_url": "https://drive.google.com/drive/folders/…",
  "vocabulary": {                   // valors permesos (slugs) per cada faceta
    "origin":     ["miquel-tarradell", "florence", "nrich", …],
    "format":     ["pdf", "doc", "web"],
    "course":     ["1ESO","2ESO","3ESO","4ESO","1Bat","2Bat","ESO","Bat", …],
    "math_sense": ["algebraic","mesura","espacial","estocastic","numeric", …],
    "activity":   ["nombres-naturals", "fraccions", …],   // ~90 valors
    "type":       ["exercici","dossier","examen", …]
  },
  "vocabulary_labels": {            // slug → text visible (≈132 entrades)
    "miquel-tarradell": "Miquel Tarradell",
    "1ESO": "1r ESO",
    …
  },
  "basic": {                        // QUINS valors es mostren en mode «Bàsic»
    "origin": […], "course": […], "math_sense": […], "type": […], "format": […]
    // NOTA: NO inclou "activity" → en mode Bàsic no hi ha filtre d'activitat
  },
  "activity_blocks": [              // agrupació temàtica de les activitats
    { "label": "Aritmètica",  "items": ["nombres-naturals", "fraccions", …] },
    { "label": "Àlgebra",     "items": [ … ] },
    … (8 blocs en total)
  ],
  "files": [ /* 48 entrades, vegeu sota */ ]
}
```

### Entrada de `files[]`

```jsonc
{
  "title":      "Teorema de Pitàgores",      // obligatori
  "id":         "teorema-de-pitagores-1",    // obligatori, únic, [a-z0-9-]
  "format":     "pdf",                       // obligatori: pdf | doc | web
  "origin":     "miquel-tarradell",          // recomanat
  "courses":    ["2ESO"],                    // llista de slugs de course
  "math_sense": "mesura",                    // un sol slug
  "activities": ["arees-perimetres","pitagores"],
  "type":       "exercici",
  "drive_id":   "1BLWEO4w…",                 // cal drive_id O url
  "url":        "https://cb.step-quiz.net/…",// per a recursos web (format: "web")
  "year":       2026,                        // opcional
  "notes":      "…"                          // opcional
}
```

Freqüència real dels camps (sobre 48 fitxers): `title`/`id`/`format`/`origin`/`courses` a
tots; `type` 47; `drive_id` 42; `activities` 42; `math_sense` 41; `notes` 31; `year` 26;
`url` 6. Distribució de format: **pdf 39 · web 6 · doc 3**.

Com es construeix l'enllaç d'obertura (a `index.html`):
- `url` present → s'obre l'`url` (recursos web).
- `format: "doc"` → `https://docs.google.com/document/d/<drive_id>/edit`.
- altres → `https://drive.google.com/file/d/<drive_id>/view` (i `/preview` a l'iframe lateral).

### Com funciona el vocabulari (important)

Quatre claus col·laboren, i no totes són editables des de l'editor:

| Clau | Què fa | Editable a `afegir-material.html`? |
|---|---|---|
| `vocabulary[grup]` | Llista de slugs vàlids. | **Sí** (afegir/treure valors). |
| `vocabulary_labels` | Text visible de cada slug (si no n'hi ha, es *title-case* del slug). | **Sí** (editar etiqueta). |
| `basic[grup]` | Subconjunt de valors que es mostren en mode **Bàsic**. Si un grup no hi és, no surt en Bàsic. | **No** (només al JSON). |
| `activity_blocks` | Agrupació temàtica de les activitats. El filtre d'Activitat en mode **Avançat** es construeix NOMÉS d'aquí. | **No** (només al JSON). |

L'editor desa el manifest sencer tal com el va carregar, així que `basic` i
`activity_blocks` es conserven en el cicle carregar→descarregar encara que no tinguin
interfície. Però **no s'actualitzen sols**: afegir un valor a `vocabulary.activity` NO
l'afegeix a cap bloc.

Lògica de cursos «paraigua» (a `index.html`): un filtre per `3ESO` també casa amb fitxers
etiquetats `ESO`; `1Bat`/`2Bat` casen amb `Bat`; un fitxer **sense** `courses` es considera
universal i passa tots els filtres de curs.

---

## 3. Contracte de dades: `cb-items.json` (per a `banc-cb.html`)

```jsonc
{
  "generated": "2026-06-02",
  "source":     "https://cb.step-quiz.net/",
  "image_base": "https://cb.step-quiz.net/",   // les imatges es carreguen d'AQUÍ
  "labels": { "numeric": "…", "2eso": "…", … },// 7 etiquetes (5 sentits + 2 nivells)
  "blocks": [
    {
      "id": "cb4eso2025e1", "nivell": "4eso", "any": 2025, "num": 1,
      "title": "…", "enunciat": "data/cb4eso2025e1.png",
      "senses": ["estocastic","mesura","numeric"], "difficulties": [ … ],
      "questions": [
        { "id":"…", "img":"data/cb4eso2025p1.png", "sentit":"estocastic",
          "dificultat":1, "correcta":0, "pistes":[ … ] }
      ]
    }
  ]
}
```

- **59 blocs · 157 preguntes**, nivells `2eso` i `4eso`, anys 2022–2025.
- La unitat de filtre i d'exportació és el **bloc** (enunciat + la seva seqüència de preguntes).
- Les imatges es resolen com `image_base + img`, és a dir **des de `cb.step-quiz.net`** —
  no estan al repositori. L'exportació a PDF (i les miniatures) per tant necessiten connexió
  i que el host serveixi les imatges amb capçaleres **CORS**.
- El PDF generat per a l'alumnat **no inclou** el panell de respostes; això només es veu dins l'app.

---

## 4. Contracte de dades: `PAYLOAD` dins de `florence-cb.html`

Objecte JS incrustat:

```jsonc
{
  "d2": [ /* 11 sessions de 2n ESO */ ],
  "d3": [ /* 11 sessions de 3r ESO */ ],
  "ff2": [ ["F_2ESO_S01","F_2ESO_S11","relació…"], … ],  // 10 relacions
  "ff3": [ … ]                                            // 9 relacions
}
```

Cada sessió: `{ id, titol, nucli, cb[] }`.
Cada ítem CB: `{ id (numèric), desc, src ("2ESO"|"4ESO"), pes (1–3) }`.

`ff2`/`ff3` són triples `[origen, destí, descripció]`; la descripció surt com a `title` del
xip «Continua per…». Els camps `principal` i `addicionals[]` (combinacions de filtre amb URL
cap a `cb.step-quiz.net`) es van eliminar el 2026-09-04: no es renderitzaven i quedaven
desfasats cada cop que creixia el banc.

Les imatges es resolen en **local** com `cb-img/CB<id>.png` (a diferència del banc CB, que
les agafa de `cb.step-quiz.net`). Es referencien 107 ids CB diferents.

---

## 4d. Contracte de dades: banc de recuperació (`recuperacio-items.json`)

Banc de preguntes per a la recuperació de matemàtiques del **curs anterior** (1r/2n/3r ESO;
no n'hi ha de 4t, perquè un alumne o gradua o repeteix). El consumeixen dues pàgines:
`examen-recuperacio.html` (genera l'examen) i `alimentar-banc.html` (l'amplia).

**Principi clau:** cada pregunta **és una imatge**. No hi ha text d'enunciat al JSON; la
imatge (figura geomètrica, equació, enunciat sencer) ho conté tot. Això evita el problema de
renderitzar notació matemàtica (`√`, exponents, fraccions) amb fonts.

```jsonc
{
  "versio":     "1.4",              // l'incrementa alimentar-banc.html en actualitzar
  "_comentari": "…",                 // opcional, ignorat pel codi
  "preguntes": [
    {
      "id":         "rec-2eso-04231-0001",  // únic, [a-z0-9-]
      "curs":       "2ESO",                 // 1ESO | 2ESO | 3ESO
      "sentit":     "espacial",             // numeric|mesura|espacial|algebraic|estocastic|comprensio
      "tema":       "triangles",            // id de tema (coherent amb repartiment-data.js)
      "dificultat": "basic",                // basic | normal
      "figura":     "rec-2eso-04231-0001.png"  // fitxer a recuperacio-img/
    }
  ]
}
```

- Les imatges es resolen en **local** com `recuperacio-img/<figura>` (com Florence, no com el
  banc CB que les agafa remotes).
- `sentit`, `tema` i les etiquetes de curs són un mirall de `repartiment-data.js`; cada
  pàgina en porta una còpia de la taxonomia (patró «sense codi compartit»).
- El JSON pot dur comentaris `//`; `examen-recuperacio.html` els retira abans de parsejar.

### Flux de les dues eines (es complementen)

```
alimentar-banc.html                          examen-recuperacio.html
─────────────────────                        ────────────────────────
foto(s) → Gemini: text + box figura          fetch(recuperacio-items.json)
  → RE-RENDER uniforme (text+figura) → PNG      → filtra curs/sentit/tema/dificultat
  → revisió: editar text, ajustar requadre,     → el professor marca preguntes
    agrupar N preguntes en una                   → carrega recuperacio-img/<figura>
  → exporta:                                     → munta .docx (OOXML a mà + jszip):
     A) "Exporta .zip": fragment + PNG nous         · llista numerada NATIVA de Word
     B) "Actualitza JSON": cal el banc actual        · una imatge inline per pregunta
        carregat → banc sencer v(x+1) + PNG          · paràgrafs buits = espai resposta
                                                    → descàrrega .docx
```

- **Principi anti-Frankenstein:** `alimentar-banc.html` no retalla l'exercici sencer de la
  foto (tipografies/fons heterogenis). Re-renderitza el **text** en una font uniforme i només
  reaprofita la **figura** com a imatge retallada. Així totes les preguntes es veuen iguals.
- Gemini fa *structured output*: per cada exercici retorna `enunciat` (text Unicode net),
  `te_figura` (bool) i, si escau, `box_figura` `[ymin,xmin,ymax,xmax]` (0-1000). La notació
  és Unicode (2⁵, √, −, ×, ≈), no LaTeX; cobreix aritmètica i àlgebra senzilla.
- **Revisió:** el text de cada targeta és editable (re-render en directe); les figures tenen
  un editor de requadre arrossegable; i es poden **agrupar** diverses preguntes atòmiques en
  una de sola (enunciat comú + figures apilades) — útil quan Gemini separa a/b/c d'un mateix
  exercici.
- **Dos camins d'exportació:** *(A)* fragment de preguntes noves per enganxar a mà; *(B)*
  cicle de versions tancat — l'usuari carrega el `recuperacio-items.json` actual (l'eina no el
  pot llegir sola del repo), l'eina hi fusiona les noves i torna el banc sencer amb `versio`
  incrementada (1.x → 1.(x+1)), llest per substituir al repo sense edició manual.
- `examen-recuperacio.html` **no** depèn de Gemini ni de xarxa externa: només llegeix el banc
  i les imatges locals. El `.docx` es construeix sense llibreria de docx (OOXML cru + jszip).
- L'`id` de cada pregunta i el nom del seu PNG es deriven del **mateix** identificador base.

---

## 4b. Contracte de dades: `repartiment-data.js`

`repartiment-data.js` és un fitxer JS (no JSON) carregat com a `<script src="...">` per
`repartiment.html`. Declara tres constants globals: `SENTITS`, `CLASSES`
i `REPARTIMENT`. És la **font de veritat** del currículum: quan el departament revisa els
continguts d'un curs, s'edita aquest fitxer i la pàgina s'actualitza sola.

Estructura de `REPARTIMENT`:
```
CursData = { label, hores_any, hores_info, blocs: [ BlocData ] }
BlocData = { sentit: "numeric"|…, hores, temes: [ TemaData ] }
TemaData = { id, label, hores, continguts: string[] }
```

La clau de cada tema és `"<sentit>/<tema.id>"`.

---

## 5. Dependències per pàgina

| Pàgina | Llibreries | Xarxa en execució |
|---|---|---|
| `index.html` | cap | `fetch('manifest.json')`; iframes de Google Drive a la previsualització |
| `repartiment.html` | cap | cap (dades via `repartiment-data.js` local) |
| `afegir-material.html` | cap | `fetch('manifest.json')`; descàrrega del `manifest.json` editat |
| `extreu-json.html` | **mammoth 1.8.0** (cdnjs) | `fetch('manifest.json')` per sincronitzar vocabulari; **Gemini API** (clau de l'usuari) |
| `banc-cb.html` | **pdf-lib (local, `lib/`)** | `fetch('cb-items.json')`; imatges de `cb.step-quiz.net` (CORS) |
| `eliminar-curs.html` | **pdf.js 3.11.174 + pdf-lib 1.17.1 + jszip 3.10.1** (cdnjs) | cap (tot el processament és al navegador) |
| `florence-cb.html` | cap | imatges locals `cb-img/`; enllaços a `cb.step-quiz.net` |
| `examen-recuperacio.html` | **jszip (local, `lib/`)** | `fetch('recuperacio-items.json')`; imatges locals `recuperacio-img/` |
| `alimentar-banc.html` | **jszip (local, `lib/`)** | **Gemini API** (clau de l'usuari): `models` (llistar) + `generateContent` (detecció) |

Hosts externs que apareixen al codi: `drive.google.com`, `docs.google.com`,
`cb.step-quiz.net`, `m.step-quiz.net`, `cdnjs.cloudflare.com`,
`generativelanguage.googleapis.com`.

`localStorage`:
- `material:recents` (`index.html`) — array `{id, ts}`, màxim 10 documents oberts recentment.
- `material:uiMode` (`index.html`) — `"basic"` o `"advanced"`.
- `dept-auth-token` (`auth.js`) — objecte de sessió `{expires}` (vegeu §4c).

La clau de Gemini (`extreu-json.html` i `alimentar-banc.html`) s'introdueix a cada sessió i
**no es desa** enlloc; s'envia directament a `generativelanguage.googleapis.com`. No queda
incrustada al codi. Com que les pàgines són públiques, cada usuari hi posa la seva pròpia
clau; convé restringir-la a l'API de Gemini a la consola de Google.

---

## 4c. Autenticació per contrasenya: `auth.js`

`auth.js` protegeix `repartiment.html` mostrant una pantalla de
contrasenya mentre no hi hagi una sessió vàlida al navegador.

### Mecanisme

La contrasenya **no s'emmagatzema en clar**. `auth.js` conté una constant `AUTH_HASH` amb
el seu hash SHA-256. Quan l'usuari introdueix la contrasenya, es calcula el hash al navegador
mitjançant l'API nativa `crypto.subtle.digest` (sense cap llibreria externa) i es compara
amb `AUTH_HASH`. Si coincideix, s'emmagatzema un token de sessió a `localStorage`:

```js
// Clau: 'dept-auth-token'
{ expires: <timestamp ms> }  // Date.now() + 30 dies
```

En visites posteriors, el token es comprova sincrònament al `<head>` (snippet anti-flash)
i al cos del IIFE. Si és vàlid, la porta no es mostra mai.

### Canviar la contrasenya

1. Obriu qualsevol pàgina del projecte al navegador.
2. Obriu la consola (`F12` → *Console*) i executeu:
   ```
   authHash('nova-contrasenya').then(console.log)
   ```
   (`authHash` és una funció global que `auth.js` exposa expressament per a aquest ús.)
3. Copieu el hash de 64 caràcters resultant.
4. Obriu `auth.js`, localitzeu la constant `AUTH_HASH` (~línia 26) i substituïu-ne el valor.
5. Feu *commit* de `auth.js`.

### Snippet anti-flash

Per evitar un parpelleig del contingut protegit mentre `auth.js` (al final del `<body>`) no
s'ha executat encara, el `<head>` de cada pàgina protegida inclou aquest fragment síncron:

```html
<script>
try {
  var _s = JSON.parse(localStorage.getItem('dept-auth-token') || 'null');
  if (!_s || Date.now() > _s.expires)
    document.documentElement.classList.add('auth-locked');
} catch(e) { document.documentElement.classList.add('auth-locked'); }
</script>
<style>.auth-locked body { visibility: hidden; }</style>
```

S'executa abans que el navegador pinti cap píxel. `auth.js` elimina la classe
`auth-locked` en carregar, tant si mostra la porta (sessió invàlida) com si no (sessió
vàlida).

### Globals exposades

| Funció | Ús |
|---|---|
| `authHash(str)` | Retorna una `Promise<string>` amb el SHA-256 de `str`. Per generar nous hashes des de la consola. |
| `clearAuth()` | Elimina el token de sessió i recarrega la pàgina. Per tancar la sessió manualment. |

### Limitacions conegudes

- La seguretat és client-side: un usuari determinat pot llegir `AUTH_HASH` del codi font i
  fer un atac de diccionari offline. Per al cas d'ús (accés informal al professorat), és suficient.
- No hi ha mecanisme de bloqueig per intents fallits.
- La sessió és per navegador: qualsevol persona amb accés a l'equip pot
  utilitzar la sessió guardada fins que expiri o es tanqui manualment.

---

## 6. Limitacions i particularitats conegudes

Aquestes són característiques de l'estat actual, no necessàriament defectes a corregir; es
documenten perquè se'n tingui constància.

1. **Activitats fora d'`activity_blocks` no es poden filtrar.** El filtre d'Activitat del
   cercador, en mode Avançat, es construeix només a partir d'`activity_blocks[].items`; en
   mode Bàsic no hi ha filtre d'activitat. Una activitat present a `vocabulary.activity`
   però absent de tots els blocs queda invisible com a filtre. Cas actual:
   `circumferencia-cercle` (l'usa el fitxer *Perímetre de circumferència i àrea de cercle*,
   però no és a cap bloc). El fitxer continua trobant-se per les seves altres activitats, pel
   curs, pel sentit i per la cerca de text. El panell de validació de l'editor **no avisa**
   d'aquest cas. Com que l'editor no gestiona `activity_blocks`, l'efecte es repeteix cada
   cop que s'afegeix una activitat nova (vegeu `MANTENIMENT.md`).

2. **Imatges de `florence-cb.html`:** les 107 imatges referenciades (`CB1.png … CB157.png`)
   es troben totes a `cb-img/`. Les anteriorment mancants (`CB24, CB54, CB56, CB58, CB59,
   CB155, CB157`) han estat afegides; les sessions `F_3ESO_S01` i `F_3ESO_S10` funcionen correctament.

3. **El banc CB depèn d'imatges remotes.** `banc-cb.html` carrega les imatges de
   `cb.step-quiz.net` (no del repo); sense connexió, sense aquell host actiu o sense les
   capçaleres CORS, ni les miniatures ni l'exportació a PDF funcionen.

4. **Càrrega de llibreries inconsistent.** `eliminar-curs.html` i `extreu-json.html` les
   agafen de cdnjs; `banc-cb.html` porta `pdf-lib` en local (`lib/`). En particular,
   `eliminar-curs.html` torna a baixar `pdf-lib` de cdnjs tot i que ja és al repositori.

5. **El vocabulari està triplicat.** A més del `manifest.json`, hi ha còpies «de reserva»
   dins de `extreu-json.html` i de `afegir-material.html` (l'`emptyManifest()`). Quan les
   pàgines se serveixen per HTTP, totes dues se sobreescriuen amb el manifest carregat, així
   que la font de veritat efectiva és única; però les còpies estan desfasades i només
   actuen com a reserva per a `file://` o per crear un manifest des de zero.

6. **Codi mort menor** a `saveModal()` (`afegir-material.html`): la variable `others` es
   calcula i no s'utilitza, i hi ha un bloc `if (!state.editingNew) { }` buit. La comprovació
   de duplicats real funciona correctament.

7. **Cerca literal en DOCX.** A `eliminar-curs.html`, la cerca manual de text en DOCX es fa
   contra l'XML codificat; una frase que contingui `&`, `<`, `>`, `"` o `'` no es trobaria.
   Per a referències de curs (`2024-25`, etc.) és irrellevant.

8. **Cal servir per HTTP(S).** `index.html` i `banc-cb.html` no tenen pla alternatiu si el
   `fetch()` del seu JSON falla (cosa que passa amb `file://`). `afegir-material.html` i
   `extreu-json.html` sí que tenen reserva (mostren la zona de càrrega o el vocabulari intern).

9. **Responsivitat mòbil «best-effort».** Per sota de 900 px s'amaguen el panell de filtres i
   la previsualització lateral. Pensat per a ús en portàtil.

10. **Estil de `florence-cb.html`.** Usa handlers `onclick` en línia i construeix HTML amb
    `innerHTML` sense escapar. És segur perquè totes les dades del `PAYLOAD` són internes i de
    confiança (no hi ha cap entrada de l'usuari), però és el patró menys robust del conjunt.

---

## 7. Robustesa i seguretat (estat actual)

- **XSS:** `index.html`, `afegir-material.html` i `banc-cb.html` escapen amb `escHtml` totes
  les dades interpolades. `eliminar-curs.html` no escapa la cometa simple, però només fa
  servir atributs entre cometes dobles → segur. `florence-cb.html` no escapa, però només
  renderitza dades internes (vegeu §6.10).
- **Edició segura del catàleg:** l'editor mai escriu al servidor; només **descarrega** un
  `manifest.json` nou que cal pujar a mà. Per tant l'eina no pot corrompre el catàleg en
  producció. La validació bloqueja la descàrrega davant d'errors estructurals (IDs duplicats,
  valors fora de vocabulari) i un avís `beforeunload` evita perdre canvis a mig fer.
- **Rendiment:** el càlcul dels filtres és O(grups × fitxers × valors) per render; amb 48
  fitxers és instantani. Cap problema a aquesta escala.
