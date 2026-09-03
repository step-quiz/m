# Millores tècniques — Material de Matemàtiques (INS Miquel Tarradell)

Backlog **viu** de millores de l'aspecte tècnic del projecte. La idea és anar
implementant-les a poc a poc i **actualitzar aquest fitxer a cada canvi**: marca
l'estat, anota la data al registre del final i, si cal, ajusta la descripció.

Aquest document NO substitueix `ARQUITECTURA.md` (estat real del projecte) ni
`MANTENIMENT.md` (flux de treball); els complementa amb el que *encara està per fer*.

---

## Com fer servir aquest document

Cada proposta té un identificador estable (p. ex. `A1`), una casella d'estat i unes
metadades. Quan acabis una millora, posa la casella a `[x]`, canvia **Estat** a `Fet`,
afegeix una línia al **Registre de canvis** i —si la millora resol un punt de
`ARQUITECTURA.md` §6— actualitza també aquella secció.

**Estat:** `Pendent` · `En curs` · `Fet` · `Descartat`
**Prioritat:** `Alta` · `Mitjana` · `Baixa`
**Esforç:** `S` (hores) · `M` (un dia) · `L` (diversos dies)

**Output:** Proporciona com a output únicament els fitxers modificats, en un zip que respecta la jerarquia de directoris.

> ⚠️ Les referències a línies són **aproximades**: el codi es mou a mesura que
> s'edita. Fes servir-les com a punt de partida, no com a adreça exacta.

---

## Índex

| ID | Millora | Prioritat | Esforç | Estat |
|----|---------|-----------|--------|-------|
| A1 | Targetes de resultat operables amb teclat (`index.html`) | Alta | S–M | Fet |
| A2 | Estils `:focus-visible` coherents a tot el projecte | Mitjana | S | Fet |
| A3 | Anunciar el nombre de resultats (regió `aria-live`) | Baixa | S | Descartat |
| A4 | Semàntica correcta del commutador Bàsic/Avançat | Baixa | S | Fet |
| B1 | Avisar d'activitats òrfenes al validador (`afegir-material.html`) | Alta | S | Fet |
| B2 | Resoldre l'activitat òrfena actual al `manifest.json` | Alta | S | Fet |
| B3 | Centralitzar codi compartit en `common.js` | Mitjana | M | En curs (parcial) |
| B4 | Treure el codi mort de `saveModal()` | Baixa | S | Fet |
| B5 | Homogeneïtzar `florence-cb.html` (sense `onclick` en línia) | Baixa | M | Fet |
| C1 | Servir totes les llibreries en local (treure cdnjs) | Mitjana | S–M | Pendent |
| C2 | Allotjar en local les imatges del banc CB | Mitjana | M | Pendent |
| D1 | Actualitzar la documentació desfasada | Alta | S | Fet |
| E1 | Botó «comparteix aquesta cerca» (`index.html`) | Mitjana | S | Pendent |
| E2 | Millorar el rànquing de la cerca (pes del títol) | Baixa | S | Fet |
| F1 | Les etiquetes del vocabulari no entren a l'índex de cerca | Alta | S | Fet |
| F2 | La cerca bloqueja el navegador uns segons per pulsació de tecla | Alta | S | Fet |
| F3 | **L'examen de recuperació barreja preguntes de cursos diferents** | Mitjana | S | **Pendent** |
| F4 | L'editor de `repartiment.html` destrueix la documentació del fitxer de dades | Mitjana | S | Fet |
| F5 | `f.url` sense escapar i `bumpVersion()` que fa retrocedir la versió | Baixa | S | Fet |

---

## A. Accessibilitat i teclat

### A1 — Targetes de resultat operables amb teclat
- [x] **Estat:** Fet · **Prioritat:** Alta · **Esforç:** S–M
- **Fitxers:** `index.html` (CSS `.card` / `.card-actions` ~ln 464–468; `toggleOpen` ~ln 1316; `keydown` ~ln 1491)
- **Problema:** Les targetes són `<div class="card">` sense `tabindex`, i els botons
  «Previsualitza» i «Obre al Drive» viuen dins d'un contenidor amb `display:none` que
  només es fa visible amb la classe `.is-open`, que **només s'activa fent clic amb el
  ratolí**. Amb teclat es pot cercar i filtrar, però **no es pot obrir ni previsualitzar
  cap material** (el `Tab` ni hi arriba). És el forat d'usabilitat més important.
- **Proposta:**
  1. A `.card`: afegir `tabindex="0"`, `role="button"` i `aria-expanded` (sincronitzat amb `.is-open`).
  2. Al gestor `keydown`: que `Enter` i `Espai` cridin `toggleOpen(card.dataset.id)` (i `preventDefault` a l'espai per no fer scroll).
  3. En obrir, moure el focus al primer botó d'acció de la targeta.
  4. Acompanyar-ho amb estils `:focus-visible` (vegeu A2) perquè el focus es vegi com el `:hover`.
- **Verificació:** Amb el ratolí desconnectat, `Tab` fins a un resultat → `Enter` l'obre →
  `Tab` arriba a «Previsualitza» i «Obre al Drive» → `Esc` el tanca. Provar amb lector de pantalla que s'anuncia com a botó desplegable.

### A2 — Estils `:focus-visible` coherents
- [x] **Estat:** Fet · **Prioritat:** Mitjana · **Esforç:** S
- **Fitxers:** totes les pàgines (`*.html`)
- **Problema:** No hi ha cap regla `:focus-visible`; el focus de teclat depèn només del
  contorn per defecte del navegador. L'efecte d'ombra negra interior que es veu en `:hover`
  no es replica en `:focus`, així que navegar amb teclat «es veu» diferent de passar-hi el ratolí.
- **Proposta:** Afegir un anell de focus consistent (p. ex. reaprofitant `box-shadow: 0 0 0 4px var(--accent-soft)`)
  per a botons, enllaços-acció, caselles i `summary`, amb `:focus-visible`. No tocar el comportament de ratolí.
- **Verificació:** Navegar tota una pàgina amb `Tab` i veure sempre on és el focus.

### A3 — Anunciar el nombre de resultats
- [x] **Estat:** Descartat · **Prioritat:** Baixa · **Esforç:** S
- **Fitxers:** `index.html` (`renderResults`; l'`aria-live` actual és a `.chip-row` ~ln 741)
- **Problema:** Quan canvia el llistat, els lectors de pantalla no anuncien quants resultats hi ha.
- **Proposta:** Afegir una regió `aria-live="polite"` (visualment discreta) que digui «N materials» a cada render.
- **Verificació:** Amb lector de pantalla, en filtrar se sent el recompte nou.

### A4 — Semàntica del commutador Bàsic/Avançat
- [x] **Estat:** Fet · **Prioritat:** Baixa · **Esforç:** S
- **Fitxers:** `index.html` (`role="tablist"`/`role="tab"` ~ln 683–686)
- **Problema:** Es fa servir patró de pestanyes (`tablist`/`tab`) però no és un conjunt de
  pestanyes amb panells, i no es gestiona `aria-selected` ni la tabulació entre opcions.
- **Proposta:** O bé completar el patró ARIA (`aria-selected`, *roving tabindex*), o —més
  senzill— tractar-ho com el que és: dos botons amb `aria-pressed`.
- **Verificació:** El lector de pantalla anuncia correctament quina opció està activa.

---

## B. Qualitat de codi i manteniment

### B1 — Avisar d'activitats òrfenes al validador
- [x] **Estat:** Fet · **Prioritat:** Alta · **Esforç:** S
- **Fitxers:** `afegir-material.html` (`validateManifest` ~ln 730)
- **Problema:** Una activitat present a `vocabulary.activity` però absent de tots els
  `activity_blocks` **no és filtrable** al cercador, i el validador no avisa. És el parany
  documentat a `ARQUITECTURA.md` §6.1 i `MANTENIMENT.md` («Afegir una ACTIVITAT nova»).
- **Proposta:** Afegir una comprovació que compari `vocabulary.activity` amb la unió de
  `activity_blocks[].items` i mostri un **avís** (no error) per cada activitat òrfena.
  Opcional/ideal: petita interfície per assignar l'activitat a un bloc des de l'editor
  (avui els blocs només s'editen a mà al JSON).
- **Verificació:** Afegir una activitat nova sense posar-la a cap bloc → el validador l'assenyala.

### B2 — Resoldre l'activitat òrfena actual
- [x] **Estat:** Fet · **Prioritat:** Alta · **Esforç:** S
- **Fitxers:** `manifest.json` (`activity_blocks`)
- **Problema:** `circumferencia-cercle` és al vocabulari i l'usa un fitxer, però no és a cap
  bloc → no es pot filtrar (confirmat).
- **Proposta:** Afegir `"circumferencia-cercle"` a l'`items` del bloc «Geometria sintètica».
- **Verificació:**
  ```bash
  python3 -c "import json;m=json.load(open('manifest.json'));b=set().union(*[x['items'] for x in m['activity_blocks']]);print([a for a in m['vocabulary']['activity'] if a not in b])"
  # ha de retornar []
  ```

### B3 — Centralitzar codi compartit en `common.js`
- [ ] **Estat:** En curs (parcial) · **Prioritat:** Mitjana · **Esforç:** M
- **Fitxers:** totes les pàgines
- **Problema:** `escHtml`, `normalize`, `slugify`, `FILTER_GROUPS` i el vocabulari
  de reserva estaven **copiats** a cada pàgina (documentat a `ARQUITECTURA.md` §1 i §6.5). Un
  canvi de lògica comuna s'ha de replicar a mà i el vocabulari es pot desincronitzar.
- **Proposta:** Moure aquestes utilitats a un únic `common.js` carregat amb
  `<script src="common.js"></script>`. **No cal pas de compilació**; segueix sent estàtic.
- **Estat actual (parcial):** `common.js` existeix i el carreguen `index.html`,
  `repartiment.html`, `banc-cb.html` i `eliminar-curs.html`. Les altres quatre pàgines
  (`afegir-material.html`, `extreu-json.html`, `alimentar-banc.html`,
  `examen-recuperacio.html`) **encara NO** el carreguen i conserven còpies locals. Mentre
  això sigui així es paga alhora el cost del fitxer compartit i el de la duplicació. **Decisió
  actual: no completar B3** (es manté la coexistència deliberadament); aquesta entrada queda
  oberta com a recordatori de l'estat real, no com a feina planificada.
- **Verificació (si algun dia es completa):** cercar `function escHtml` a `*.html` retorna 0
  definicions locals; totes les pàgines carreguen `common.js`.

### B4 — Treure el codi mort de `saveModal()`
- [x] **Estat:** Fet · **Prioritat:** Baixa · **Esforç:** S
- **Fitxers:** `afegir-material.html` (`saveModal` ~ln 1529–1534)
- **Problema:** La variable `others` es calcula i no s'usa, i hi ha un bloc
  `if (!state.editingNew) { }` buit (documentat a §6.6). La comprovació de duplicats real
  (via `conflict`/`origId`) sí que funciona.
- **Proposta:** Eliminar les dues línies inútils. Cap canvi de comportament.
- **Verificació:** Crear i editar fitxers amb IDs repetits segueix bloquejant-se correctament.

### B5 — Homogeneïtzar `florence-cb.html`
- [x] **Estat:** Fet · **Prioritat:** Baixa · **Esforç:** M
- **Fitxers:** `florence-cb.html` (12 `onclick` en línia; `innerHTML` sense escapar)
- **Problema:** És la pàgina menys robusta i l'única que no segueix el patró de la resta
  (events delegats + `escHtml`). Avui és segur perquè totes les dades del `PAYLOAD` són
  internes (§6.10), però és inconsistent.
- **Proposta:** Substituir els `onclick` per gestors delegats i escapar el text interpolat,
  igual que a `index.html` / `banc-cb.html`.
- **Verificació:** La pàgina funciona igual; cercar `onclick=` retorna 0.

---

## C. Resiliència i dependències externes

### C1 — Servir totes les llibreries en local
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Esforç:** S–M
- **Fitxers:** `eliminar-curs.html` (pdf.js, pdf-lib, jszip des de cdnjs), `extreu-json.html` (mammoth des de cdnjs); ja existeix `lib/pdf-lib.min.js`
- **Problema:** Càrrega incoherent (§6.4): unes pàgines depenen de `cdnjs.cloudflare.com` en
  execució. Si el tallafocs de l'institut el bloqueja o cdnjs cau, aquelles pàgines deixen de
  funcionar. A més, `eliminar-curs.html` torna a baixar `pdf-lib` de cdnjs tot i tenir-lo al repo.
- **Proposta:** Descarregar les llibreries a `lib/` i referenciar-les en local a totes les
  pàgines. Reaprofitar el `lib/pdf-lib.min.js` que ja hi és.
- **Verificació:** Amb la xarxa externa tallada (o cdnjs bloquejat) però el lloc servit en
  local, `eliminar-curs.html` i `extreu-json.html` segueixen carregant les seves eines.

### C2 — Allotjar en local les imatges del banc CB
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Esforç:** M
- **Fitxers:** `banc-cb.html` (`fetch(url, {mode:'cors'})` ~ln 487), `cb-items.json` (`image_base`)
- **Problema:** Les imatges del banc es carreguen de `cb.step-quiz.net` (§6.3). Sense connexió,
  sense aquell host o sense capçaleres CORS, ni les miniatures ni l'exportació a PDF funcionen.
  En canvi, `florence-cb.html` ja serveix els seus PNG en local (`cb-img/`).
- **Proposta:** Descarregar les imatges del banc i servir-les en local (o cau), com es fa amb
  Florence. Implica decidir on viuen i actualitzar `image_base`.
- **Verificació:** Generar un PDF del banc **sense connexió** (servint el lloc en local) funciona.

---

## D. Documentació

### D1 — Actualitzar la documentació desfasada
- [x] **Estat:** Fet · **Prioritat:** Alta · **Esforç:** S
- **Fitxers:** `ARQUITECTURA.md`, `MANTENIMENT.md`, `README.md`
- **Problema:** La documentació, que és una fortalesa del projecte, té punts ja superats:
  - **`ARQUITECTURA.md` §6.2** i **`MANTENIMENT.md`** diuen que falten 7 imatges
    (`CB24, CB54, CB56, CB58, CB59, CB155, CB157`). **Ja hi són totes** (107 referenciades,
    107 presents a `cb-img/`). La limitació està resolta.
  - **`README.md`** diu «~100 imatges PNG (CB1.png … CB153.png)»; en realitat n'hi ha 107 i
    arriben fins a `CB157.png`.
- **Proposta:** Eliminar/actualitzar la limitació §6.2, treure la nota d'imatges que falten de
  `MANTENIMENT.md` i corregir el recompte del `README`.
- **Verificació:** La documentació coincideix amb el resultat de l'script de comprovació
  d'imatges (0 que falten).

---

## E. Millores funcionals menors (tècniques)

### E1 — Botó «comparteix aquesta cerca»
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Esforç:** S
- **Fitxers:** `index.html` (ja existeix `buildUrlParams` ~ln 1369 i `syncToUrl`)
- **Problema:** L'estat ja viu a la URL (`?q=&course=…&open=`), però no hi ha una manera
  còmoda de copiar-la per passar als companys una llista filtrada.
- **Proposta:** Un botó que copiï `location.href` al porta-retalls (`navigator.clipboard`) amb
  un petit *toast* de confirmació. Pràcticament una funció.
- **Verificació:** Filtrar, copiar, obrir l'enllaç en una altra pestanya → es restaura el mateix estat.

### E2 — Millorar el rànquing de la cerca
- [x] **Estat:** Fet · **Prioritat:** Baixa · **Esforç:** S
- **Fitxers:** `index.html` (`loadManifest` construeix `_blob`; `scoreToken`/`computeFiltered`)
- **Problema:** El `_blob` barreja tots els camps amb el mateix pes, així que una coincidència
  al títol no compta més que una a les notes.
- **Proposta:** Ponderar (p. ex. títol > activitats/sentit > notes) i, opcionalment, mostrar un
  fragment coincident. És una millora de qualitat, no un error.
- **Verificació:** Cercar un terme present a dos materials (un al títol, un a les notes) →
  primer el del títol.

---

## F. Errors detectats

A diferència de les seccions anteriors, aquestes entrades no són millores
opcionals: són comportaments incorrectes. Les que estan marcades com a `Fet`
ja s'han corregit; `F3` es deixa documentada expressament perquè **no és
urgent**, però convé no perdre-la de vista.

### F1 — Les etiquetes del vocabulari no entren a l'índex de cerca
- [x] **Estat:** Fet · **Prioritat:** Alta · **Esforç:** S
- **Fitxers:** `index.html` (`loadManifest()`, `init()`)
- **Problema:** `loadManifest()` construïa els blobs de cerca cridant `label()`,
  però `state.vocabLabels` no s'assignava fins **després** que `loadManifest()`
  retornés. Durant tota la construcció de l'índex, `label()` queia al *fallback*
  (slug → «Text Capitalitzat») i les etiquetes reals de `vocabulary_labels` no
  s'indexaven mai. Afectava **157 de les 167 fitxes**.
- **Símptoma:** paraules com `teorema`, `1r`, `2n`, `3r`, `4t`, `resolució`,
  `aritmètiques`, `geomètriques` o `socioemocional` no trobaven res.
  Cercar `1r ESO` retornava 11 resultats en comptes de 51.
- **Solució:** assignar `state.vocabLabels` dins de `loadManifest()`, abans del
  bucle que construeix `_blob`, `_blobTitle` i `_blobMain`.
- **Verificació:** `1r ESO` → 51 · `4t` → 23 · `teorema` → 12 ·
  `teorema de pitàgores` → 7 · `progressions geomètriques` → 3.

### F2 — La cerca bloqueja el navegador uns segons per pulsació de tecla
- [x] **Estat:** Fet · **Prioritat:** Alta · **Esforç:** S
- **Fitxers:** `index.html` (`scoreToken()`, `computeCounts()`, `computeFiltered()`)
- **Problema:** dues causes que es multiplicaven.
  1. `computeCounts()` refeia `matchesQuery()` sobre tot el manifest **un cop per
     cadascun dels sis grups de filtres**, i `computeFiltered()` una setena vegada.
  2. `scoreToken()` calculava la distància Damerau-Levenshtein **exacta** amb una
     matriu de programació dinàmica O(L²) per cada finestra del blob, quan només
     necessita saber si és ≤ 1.
- **Símptoma:** amb `proporcionalitat` escrit sencer, ~4,7 s de bloqueig del fil
  principal per pulsació. El *debounce* de 120 ms no ho tapava.
- **Solució:** cache `queryIndex()` que resol la consulta un sol cop i la
  reparteix (la coincidència amb la consulta no depèn de cap filtre), i
  `withinEditDistance1()`, una comprovació O(L) amb sortida anticipada que
  substitueix la matriu. L'equivalència amb la implementació anterior s'ha
  verificat sobre tots els parells de paraules de fins a 6 lletres (1.129.309
  parells) més 351.081 parells aleatoris: cap discrepància.
- **Verificació:** `proporcionalitat` passa de 4.733 ms a ~3 ms per pulsació.

### F3 — L'examen de recuperació barreja preguntes de cursos diferents
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Esforç:** S
- **Fitxers:** `examen-recuperacio.html` (`setCurs()`, `selectedOrdered()`, `doExport()`)
- **Problema:** `setCurs()` neteja `state.sentits` però **no** `state.selected`, i
  `selectedOrdered()` filtra sobre *totes* les preguntes del banc, no sobre les
  del curs actiu. Les preguntes triades sobreviuen al canvi de curs sense que
  res ho indiqui.
- **Símptoma:** un professor tria preguntes a 1r d'ESO, canvia a 2n per comparar,
  n'hi afegeix un parell més i exporta. El `.docx` conté preguntes dels dos
  cursos i el fitxer es diu `examen-recuperacio-2ESO-<data>.docx`. El panell
  dret «Examen muntat» les mostra totes, però sense dir de quin curs és cadascuna,
  així que la barreja passa desapercebuda fins que l'examen és a mans de l'alumnat.
- **Per què no és urgent ara:** el banc de recuperació encara són els 5 ítems de
  prova (`recuperacio-items.json` v1.0), i amb tan poques preguntes la barreja es
  detecta a ull. Passarà a ser rellevant quan el banc creixi.
- **Opcions (a decidir quan es reprengui):**
  - **(a) Aïllar per curs** — `setCurs()` fa també `state.selected.clear()`.
    És el més simple i coherent amb el nom del fitxer exportat, però esborra
    la feina feta si algú canvia de curs per mirar una cosa i torna enrere.
  - **(b) Avisar i confirmar** — conservar la selecció, però si en exportar hi ha
    més d'un curs, demanar confirmació i anomenar el fitxer `…-mixt-<data>.docx`.
  - **(c) Etiquetar** — mostrar el curs a cada element del panell «Examen muntat»
    i acolorir els que no són del curs actiu. No impedeix res, però ho fa visible.
  - La (b) sembla el millor equilibri: no destrueix feina i tanca el forat real,
    que és exportar una barreja **sense saber-ho**.
- **Verificació (quan es faci):** triar 2 preguntes a 1ESO, canviar a 2ESO, triar-ne
  1, exportar → o bé el `.docx` té només la de 2ESO, o bé apareix l'avís.

### F4 — L'editor de `repartiment.html` destrueix la documentació del fitxer de dades
- [x] **Estat:** Fet · **Prioritat:** Mitjana · **Esforç:** S
- **Fitxers:** `repartiment.html` (`downloadData()`)
- **Problema:** `downloadData()` regenerava `repartiment-data.js` sencer amb
  `JSON.stringify()`. Com que els comentaris no sobreviuen a un *round-trip* per
  JSON, cada ús de l'editor s'emportava el bloc de documentació de
  `CONTINGUTS_ACTIVITATS` (30 línies: format de la clau, com afegir-n'hi, l'avís
  sobre les posicions) i els 21 comentaris de línia que diuen a quin contingut
  correspon cada número.
- **Solució:** l'editor només modifica `REPARTIMENT`, així que ara es baixa el
  text original del fitxer i s'hi substitueix **només** aquell bloc, delimitat per
  `const REPARTIMENT = {` i `}; // end REPARTIMENT`. La resta queda byte a byte
  igual. Si el fitxer no es pot llegir o no hi ha delimitadors, s'avisa i no es
  descarrega res, en comptes de generar un fitxer mutilat.
- **Verificació:** editar, descarregar i comprovar que els 21 comentaris de línia
  i els blocs `FORMAT:` / `COM AFEGIR-NE` hi continuen sent, i que el fitxer
  generat es pot tornar a passar per l'editor.

### F5 — `f.url` sense escapar i `bumpVersion()` que fa retrocedir la versió
- [x] **Estat:** Fet · **Prioritat:** Baixa · **Esforç:** S
- **Fitxers:** `index.html` (`renderResults()`, `renderPreview()`, `openPreview()`),
  `alimentar-banc.html` (`bumpVersion()`)
- **Problema 1:** el camp `url` del manifest era l'**única** interpolació de tot
  `index.html` que no passava per `escHtml()`, ni a `href="${openHref}"` ni a
  `<iframe src="${previewSrc}">`. Amb un manifest curat el risc pràctic és baix,
  però trencava la regla que se segueix a la resta del fitxer.
- **Problema 2:** `bumpVersion()` només entenia el format exacte `N.M`; per a
  qualsevol altra cosa retornava `'1.0'`. Un banc a `2.0.1` retrocedia
  silenciosament a `1.0` i el fitxer nou semblava més vell que el que substituïa.
- **Solució:** helper `safeUrl()` que filtra per esquema (només `http`/`https`,
  perquè un `javascript:` s'executaria en clicar) i escapament del resultat;
  `bumpVersion()` incrementa l'últim grup de xifres sigui quin sigui el format.
- **Verificació:** `2.0.1` → `2.0.2` · `v3` → `v4` · `1.9` → `1.10` · buit → `1.0`.

---

## Decisions: què NO farem (i per què)

Es deixa constància de propostes valorades i **descartades a propòsit**, perquè no es tornin a obrir sense motiu.

- **Anunciar el nombre de resultats (A3).** No es vol implementar. *(Estat: Descartat)*
- **Publicar des de l'editor directament a GitHub (API + token).** Trencaria el model
  «descarrega → *commit*» que avui fa que l'eina **no pugui corrompre producció** (§7).
  Afegiria gestió de credencials i risc. Es manté el flux manual. *(Estat: Descartat)*
- **Valoracions/notes del professorat per material, comentaris, etc.** Requereix *backend* o
  emmagatzematge compartit; xoca amb la decisió d'un lloc 100% estàtic. *(Estat: Descartat,
  reobrible si algun dia hi ha backend)*

---

## Registre de canvis

Afegeix una línia per cada millora aplicada (la més recent a dalt).

| Data | ID | Canvi | Qui |
|------|----|-------|-----|
| 2026-09-03 | dades | `manifest.json`: afegida l'entrada `bg-trigonometria-eso` (dossier de trigonometria d'ESO de Bogdan, tema 3), un cop pujat el PDF al Drive. Tanca el punt pendent de l'entrada anterior; esborrat `PENDENT-bg-trigonometria-eso.json`, que ja no serveix. Ara les entrades `bg-*` són 12 | — |
| 2026-09-03 | dades | `manifest.json`: revisades les 11 entrades `bg-*` (dossiers Bogdan d'ESO) contra el contingut real dels PDF. Tretes 4 etiquetes que el dossier no tracta (`pitagores` a geometria, `inequacions` a equacions de 4t, `sistemes-lineals-gauss` a sistemes 3×3) i afegides 10 que hi faltaven (5 només a `bg-nombres-reals`). Afegit el camp `notes` amb el temari real de cada dossier. Afegida l'etiqueta que faltava al valor `angles` del vocabulari. **Pendent:** el dossier de trigonometria d'ESO (tema 3) no és al Drive; entrada preparada a `PENDENT-bg-trigonometria-eso.json`, només li falta el `drive_id` | — |
| 2026-09-03 | F5 | `index.html`: helper `safeUrl()` (només http/https) + `escHtml()` a l'`href` de la targeta, al `src` de l'iframe i a `window.open()`. `alimentar-banc.html`: `bumpVersion()` incrementa l'últim grup de xifres en comptes de reiniciar a `1.0` | — |
| 2026-09-03 | F4 | `repartiment.html`: `downloadData()` ara fa *splice* del bloc `REPARTIMENT` dins del text original del fitxer en comptes de regenerar-lo sencer; es conserven els 21 comentaris de línia i els blocs de documentació de `CONTINGUTS_ACTIVITATS` | — |
| 2026-09-03 | F3 | Documentat (no corregit): la selecció de preguntes sobreviu al canvi de curs a `examen-recuperacio.html`. Vegeu §F3 i el comentari a `setCurs()` | — |
| 2026-09-03 | F2 | `index.html`: cache `queryIndex()` (la consulta es resol 1 cop en comptes de 7 per pulsació) i `withinEditDistance1()` O(L) en lloc de la matriu Damerau-Levenshtein O(L²). 4.733 ms → ~3 ms per pulsació | — |
| 2026-09-03 | F1 | `index.html`: `state.vocabLabels` s'assigna dins de `loadManifest()`, abans de construir els blobs. `1r ESO` passa d'11 a 51 resultats | — |
| 2026-06-04 | E2 | `index.html`: `_blobTitle` i `_blobMain` per ponderar títol (×3) i camps principals (×2) vs notes (×1) en `matchesQuery()` | — |
| 2026-06-04 | D1 | `ARQUITECTURA.md §6.2`, `MANTENIMENT.md`, `README.md`: actualitzades les referències a imatges de `cb-img/`; les 107 imatges ja hi són totes (`CB157.png` inclòs) | — |
| 2026-06-04 | B3 | Creat `common.js` amb `escHtml`, `normalize`, `slugify`, `FILTER_GROUPS`, `ESO_COURSES`, `BATX_COURSES`, `FALLBACK_VOCAB`, `FALLBACK_LABELS`; adoptat per `index.html`, `repartiment.html`, `banc-cb.html` i `eliminar-curs.html`. Les altres 4 pàgines conserven còpies locals (migració deixada deliberadament incompleta) | — |
| 2026-06-04 | B5 | `florence-cb.html`: 12 `onclick` eliminats; gestors delegats; `esc()` per a tot l'innerHTML dinàmic | — |
| 2026-06-04 | B4 | `saveModal()`: eliminada variable `others` no usada i bloc `if (!state.editingNew) {}` buit | — |
| 2026-06-04 | B2 | `manifest.json`: `circumferencia-cercle` afegida al bloc Geometria sintètica (resolt manualment) | — |
| 2026-06-04 | B1 | Validador d'activitats òrfenes ja estava implementat a `validateManifest()`; marcat com a Fet | — |
| 2026-06-04 | doc | Instrucció d'output afegida a «Com fer servir»; A3 descartat; A3/B2 moguts a seccions corresponents | — |
| 2026-06-04 | A4 | Commutador Bàsic/Avançat: eliminat `role=tablist/tab`, afegit `aria-pressed` sincronitzat | — |
| 2026-06-04 | A2 | Estils `:focus-visible` afegits a tots els fitxers HTML (`box-shadow: 0 0 0 4px var(--accent-soft)`) | — |
| 2026-06-04 | A1 | Targetes: `tabindex=0`, `role=button`, `aria-expanded`; keydown Enter/Espai; focus al primer botó en obrir; retorn de focus en tancar | — |
| _(exemple)_ 2026-06-04 | — | Creació del document de millores | — |
