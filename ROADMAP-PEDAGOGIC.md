# Roadmap pedagògic — Material de Matemàtiques (INS Miquel Tarradell)

Document **viu** d'idees per fer créixer el projecte *com a eina d'ensenyament*, no
només com a cercador de fitxers. A diferència de `MILLORES-TECNIQUES.md` (que arregla el
que ja hi ha), aquí es recullen **funcionalitats, continguts i relacions didàctiques noves**.

Igual que el document tècnic: implementa a poc a poc, marca l'estat i deixa constància al
**Registre de canvis** del final.

---

## Principi rector

El currículum vigent a Catalunya (**Decret 175/2022**, educació bàsica) desplega cada
matèria amb quatre elements: **competències específiques**, **criteris d'avaluació**,
**sabers** i **situacions d'aprenentatge**. En matemàtiques, els sabers s'agrupen en
**sentits**: numèric, de la mesura, algebraic i de pensament computacional, espacial,
estocàstic i socioemocional. Les competències específiques s'agrupen en cinc blocs:
resolució de problemes, raonament i prova, connexions, comunicació i representació, i
gestió socioemocional. Les **situacions d'aprenentatge** —contextos reals que donen sentit
a l'aprenentatge— substitueixen les unitats didàctiques tradicionals.

Tres conseqüències per a aquest projecte:

1. El camp `math_sense` del `manifest.json` **ja coincideix** amb els sentits oficials
   (numèric, mesura, algebraic, espacial, estocàstic) — només hi falta el socioemocional.
   Bona part del treball d'alinear-se amb el currículum ja està fet.
2. Les tasques **Florence** són, de fet, **situacions d'aprenentatge**: contextos rics amb
   un producte i raonament. El projecte ja treballa en la lògica del decret.
3. Per tant, moltes idees d'aquest roadmap no són «afegir coses noves» sinó **fer explícita
   i navegable** la relació amb el currículum que ja hi és de manera implícita.

---

## Com fer servir aquest document

Cada idea té un identificador estable (p. ex. `F1`) i metadades. En completar-ne una, posa
la casella a `[x]`, canvia **Estat** a `Fet` i afegeix una línia al registre.

**Estat:** `Pendent` · `En curs` · `Fet` · `Descartat`
**Prioritat:** `Alta` · `Mitjana` · `Baixa`
**Tipus:** `Dades` (esquema/vocabulari) · `Funcionalitat` (pàgina o eina) · `Contingut` (redacció pedagògica)

Les idees de tipus `Contingut` tenen **dos costos**: el tècnic (programar-ho) i el de
**redacció** (omplir-ho de material). Es noten per separat a cada fitxa, perquè sovint el
segon és el gros.

---

## Índex

| ID | Idea | Tipus | Prioritat | Depèn de | Estat |
|----|------|-------|-----------|----------|-------|
| F1 | Vocabulari curricular compartit (competències, sabers) | Dades | Alta | — | Pendent |
| F2 | Graf navegable saber ↔ CB ↔ Florence ↔ material | Funcionalitat | Mitjana | F1 | Fet (parcial) |
| S1 | Seqüències didàctiques / situacions d'aprenentatge | Funcionalitat + Contingut | Alta | — | Pendent |
| S2 | Graf de prerequisits entre temes | Dades + Funcionalitat | Mitjana | F1 | Pendent |
| D1 | Nivells: suport / consolidació / ampliació | Dades | Alta | — | Pendent |
| D2 | Generador de dossier de recuperació | Funcionalitat | Mitjana | D1 | Pendent |
| D3 | Glossari de vocabulari (aula d'acollida) | Contingut | Baixa | — | Pendent |
| AV1 | Rúbriques i criteris d'avaluació per tasca | Contingut | Mitjana | F1 | Pendent |
| G1 | De l'enllaç PDF a la guia docent de la tasca | Contingut | Alta | — | Pendent |
| CB1 | Vista inversa de Florence (forats de cobertura) | Funcionalitat | Mitjana | — | Fet (parcial) |
| CB2 | Cobertura de sentits en exportar el banc CB | Funcionalitat | Baixa | — | Pendent |
| CB3 | Versió «professorat» del PDF (amb solucionari) | Funcionalitat | Mitjana | — | Pendent |
| CX1 | Contextos reals i connexió amb altres matèries | Dades + Contingut | Mitjana | — | Pendent |
| RM1 | Rutines de pensament de baixa preparació | Funcionalitat + Contingut | Baixa | — | Pendent |
| RM2 | Facet de manipulatius i eines digitals | Dades | Baixa | — | Pendent |

---

## 1. Fonament

### F1 — Vocabulari curricular compartit
- [ ] **Estat:** Pendent · **Prioritat:** Alta · **Tipus:** Dades
- **Cost:** tècnic S–M · contingut M (etiquetar 48 materials)
- **Idea:** Afegir al vocabulari del `manifest.json` (i, a la llarga, a `cb-items.json` i al
  `PAYLOAD` de Florence) els descriptors oficials: **competències específiques** (CE) i, si es
  vol, els **sabers** del currículum, a més dels sentits que ja hi ha.
- **Per què:** Passes de buscar per etiquetes casolanes a buscar per descriptor oficial. Et
  permet **demostrar la cobertura curricular** (programació, inspecció) i és la base de gairebé
  tota la resta del roadmap. A més, `math_sense` ja equival als sentits oficials: el salt és menor del que sembla.
- **Com es podria fer:** Nou grup de vocabulari `competencia` (CE1…CEn) amb les seves
  etiquetes a `vocabulary_labels`, i opcionalment `saber`. Reaprofitar tota la maquinària de
  filtres que ja existeix (`FILTER_GROUPS`, `activity_blocks`). Mapar `math_sense` ↔ sentit oficial documentadament.
- **Primer pas:** Decidir la llista de CE i sabers a partir del currículum de matemàtiques
  d'ESO i afegir-la com a grup nou (sense etiquetar encara cap fitxer).

### F2 — Graf navegable saber ↔ CB ↔ Florence ↔ material
- [x] **Estat:** Fet (parcial, 2026-09-05) · **Prioritat:** Mitjana · **Tipus:** Funcionalitat
- **Què s'ha fet:** el mode «El meu repartiment» de `florence-cb.html`. El punt de partida no
  és un saber del decret sinó un **contingut del repartiment**, que és el vocabulari que el
  departament ja fa servir cada dia; per a cada contingut es veuen alhora la sessió Florence
  que el treballa, les preguntes CB que el consoliden i el material del catàleg. El pont viu a
  `pipeline-data.js` (vegeu `ARQUITECTURA.md` §4e).
- **Es travessa en els dos sentits:** des de `florence-cb.html` tries el contingut, i des de
  `repartiment.html` cada contingut amb fils duu una icona que obre la seva seqüència.
- **Què hi falta:** substituir o completar els «fils didàctics» pels descriptors oficials del
  decret quan hi hagi F1, i revisar el mapatge tema a tema (ara és un esborrany derivat dels
  `nucli` de les sessions).
- **Cost:** tècnic M · contingut baix (es deriva de F1)
- **Idea:** Una vista on, partint d'un **saber o competència**, es vegin alhora els **ítems CB**
  que el treballen, les **sessions Florence** relacionades i els **materials del catàleg** que el toquen.
- **Per què:** És la versió completa de «més relacions». Avui Florence ja enllaça amb CB i el
  catàleg s'etiqueta per sentit; si tot comparteix el vocabulari de F1, obtens una xarxa
  navegable en comptes de tres illes separades.
- **Com es podria fer:** Una pàgina que creui `manifest.json` (per competència/sentit), el
  `PAYLOAD` de Florence (camp `cb[]` i `nucli`) i `cb-items.json` (camp `senses`). No cal backend.
- **Primer pas:** Tenir F1 i pintar una taula simple «saber → recursos» abans del graf.

---

## 2. Seqüències i itineraris

### S1 — Seqüències didàctiques (situacions d'aprenentatge)
- [ ] **Estat:** Pendent · **Prioritat:** Alta · **Tipus:** Funcionalitat + Contingut
- **Cost:** tècnic M · contingut M–L (redactar les seqüències)
- **Idea:** Que el professorat pugui muntar i compartir **unitats**: una seqüència ordenada de
  materials amb una justificació, prerequisits, durada i producte final.
- **Per què:** El decret organitza l'aprenentatge en situacions/seqüències, no en materials
  solts. Les relacions `ff2`/`ff3` de Florence ja són un precursor d'això: generalitzar-ho
  converteix el catàleg d'un cercador a un lloc on **es munten i es comparteixen unitats**.
- **Com es podria fer:** Un nou contracte de dades `sequences[]` (llista d'`id` de materials +
  metadades) al costat del manifest, o reaprofitant l'estat-a-la-URL per compartir col·leccions
  (vegeu E1 del document tècnic). Florence ja en seria el primer exemple real.
- **Primer pas:** Modelar una sola seqüència existent (p. ex. una unitat de geometria de 2n) com a prova.

### S2 — Graf de prerequisits entre temes
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Tipus:** Dades + Funcionalitat
- **Cost:** tècnic S · contingut M (definir les dependències)
- **Idea:** Declarar relacions de prerequisit entre activitats/sabers («per fraccions
  equivalents cal divisibilitat») i mostrar-les com a suggeriment.
- **Per què:** Ajuda a planificar la seqüència i, sobretot, l'**atenció a la diversitat**:
  davant d'una dificultat, el sistema pot proposar «abans, repassa X».
- **Com es podria fer:** Una llista de parelles `[saber_previ, saber_seguent]` (com `ff2`/`ff3`,
  però entre sabers) i, al material, un «abans d'això, mira…».
- **Primer pas:** Definir prerequisits per a un bloc temàtic (p. ex. Aritmètica).

---

## 3. Atenció a la diversitat

### D1 — Nivells: suport / consolidació / ampliació
- [ ] **Estat:** Pendent · **Prioritat:** Alta · **Tipus:** Dades
- **Cost:** tècnic S · contingut M (classificar/crear variants)
- **Idea:** Etiquetar materials (o agrupar-ne variants) per nivell: **suport**, **consolidació**,
  **ampliació**. Els ítems CB ja tenen `dificultat` (1–3) i `pes`; portar aquesta idea al catàleg.
- **Per què:** Permet donar a dos alumnes versions diferents de la mateixa tasca sense buscar
  per separat. És atenció a la diversitat operativa, no declarativa.
- **Com es podria fer:** Camp `nivell_diversitat` al vocabulari, o una relació «variants d'una
  mateixa tasca». Mostrar al cercador la terna quan existeixi.
- **Primer pas:** Afegir el camp i etiquetar un grapat de materials d'un tema.

### D2 — Generador de dossier de recuperació
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Tipus:** Funcionalitat
- **Cost:** tècnic M · contingut baix (reaprofita D1 i el banc CB)
- **Idea:** A partir dels temes/sentits fluixos d'un alumne, generar un **dossier** (materials de
  suport + ítems CB de dificultat baixa) en PDF.
- **Per què:** Automatitza una feina recurrent i molesta, i materialitza els itineraris de remediació.
- **Com es podria fer:** Reaprofitar l'exportador a PDF de `banc-cb.html` i el filtratge per
  sentit/dificultat; afegir-hi materials del catàleg marcats com a «suport» (D1).
- **Primer pas:** Tenir D1 i muntar un dossier per a un sentit concret.

### D3 — Glossari de vocabulari matemàtic (aula d'acollida)
- [ ] **Estat:** Pendent · **Prioritat:** Baixa · **Tipus:** Contingut
- **Cost:** tècnic S · contingut M (redactar el glossari)
- **Idea:** Un glossari de termes matemàtics clau per tema, amb suport visual i, si escau, traducció.
- **Per què:** Inclusió de l'alumnat nouvingut; el llenguatge és sovint la primera barrera en matemàtiques.
- **Com es podria fer:** Un fitxer de dades `glossari` (terme → definició breu + imatge) lligat per tema/saber.
- **Primer pas:** Recollir el vocabulari d'un bloc i decidir-ne el format.

---

## 4. Avaluació competencial

### AV1 — Rúbriques i criteris d'avaluació per tasca
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Tipus:** Contingut
- **Cost:** tècnic S–M · contingut M–L (redactar rúbriques)
- **Idea:** Adjuntar a materials —sobretot les tasques riques Florence i els exàmens— una
  **rúbrica** alineada amb els **criteris d'avaluació** (que el decret vincula a les
  competències específiques), amb opció d'imprimir-la.
- **Per què:** La qualificació és per competències; tenir la rúbrica integrada al material dona
  coherència a tot el departament i estalvia feina.
- **Com es podria fer:** Estructura `rubrica` lligada a un material (criteris + nivells
  d'assoliment), reaprofitant la competència de F1. Generació d'un PDF de rúbrica.
- **Primer pas:** Redactar una rúbrica per a una sola tasca Florence i veure'n el format.

---

## 5. De la tasca a la guia docent

### G1 — Enriquir cada tasca rica amb guia per al docent
- [ ] **Estat:** Pendent · **Prioritat:** Alta · **Tipus:** Contingut
- **Cost:** tècnic S · contingut L (és, sobretot, redacció)
- **Idea:** A cada tasca rica (Florence i similars), afegir: els **processos** que desenvolupa
  (conjecturar, generalitzar, argumentar, modelitzar), **bones preguntes** per al docent, les
  **estratègies i errors típics** anticipats, i possibles **extensions**.
- **Per què:** Es nota la influència del *Thinking Classroom* a les relacions Florence. Aquesta
  informació converteix un enllaç a un PDF en una **eina de planificació de classe** i és el que
  fa que una tasca rica funcioni a l'aula. És el camp on el projecte pot aportar més valor afegit.
- **Com es podria fer:** Camps nous a cada sessió del `PAYLOAD` de Florence (`processos`,
  `preguntes`, `errors`, `extensions`) i mostrar-los a la fitxa de la sessió.
- **Primer pas:** Triar 2–3 sessions Florence i redactar-ne la guia completa com a model.

---

## 6. Competències Bàsiques com a diagnòstic

### CB1 — Vista inversa de Florence (forats de cobertura)
- [x] **Estat:** Fet (parcial, 2026-09-05) · **Prioritat:** Mitjana · **Tipus:** Funcionalitat
- **Què s'ha fet:** el forat es veu des del costat del currículum, que és on es nota. Cada curs
  diu quants dels seus continguts tenen pràctica associada (2n 80/80 · 3r 48/49 · 1r 54/62 ·
  4t 49/60) i un contingut sense res ho diu obertament. Els buits documentats són logaritmes,
  trigonometria, notació científica i bona part de 1r.
- **Què hi falta:** l'altra direcció, la que deia la fitxa original: quins ítems CB no toca cap
  sessió Florence. Amb `pipeline-data.js` ara és una resta de conjunts trivial.
- **Cost:** tècnic S · contingut baix
- **Idea:** Mostrar quins **ítems CB no toca cap sessió Florence**, és a dir, l'invers del que
  ara fa `florence-cb.html`.
- **Per què:** Revela forats del programa de tasques riques: temes de la prova CB que no es
  treballen enlloc.
- **Com es podria fer:** Creuar tots els ids referenciats al `PAYLOAD` amb el conjunt complet
  d'ítems de `cb-items.json`; llistar els que no apareixen.
- **Primer pas:** Un petit informe (fins i tot manual) de la diferència entre els dos conjunts.

### CB2 — Cobertura de sentits en exportar el banc CB
- [ ] **Estat:** Pendent · **Prioritat:** Baixa · **Tipus:** Funcionalitat
- **Cost:** tècnic S · contingut baix
- **Idea:** En construir un full de pràctica al banc CB, mostrar **quins sentits cobreix** la
  selecció (i en quina proporció).
- **Per què:** Ajuda a equilibrar l'avaluació i a no sobrerepresentar un sentit sense adonar-se'n.
- **Com es podria fer:** Sumar el camp `senses`/`sentit` dels blocs seleccionats i pintar-ne un resum.
- **Primer pas:** Mostrar el recompte de sentits de la selecció actual.

### CB3 — Versió «professorat» del PDF (amb solucionari)
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Tipus:** Funcionalitat
- **Cost:** tècnic S–M · contingut baix
- **Idea:** Una segona variant del PDF del banc CB, **per al professorat, amb les respostes** i
  les pistes. El PDF de l'alumnat es manté sense respostes (com ara).
- **Per què:** Estalvia preparar el solucionari a part. Les dades ja hi són: `cb-items.json` té
  `correcta` i `pistes`.
- **Com es podria fer:** Una opció a `banc-cb.html` que, en exportar, afegeixi una pàgina de
  solucions a partir d'aquells camps.
- **Primer pas:** Generar el solucionari d'un sol bloc.

---

## 7. Context i interdisciplinarietat

### CX1 — Contextos reals i connexió amb altres matèries
- [ ] **Estat:** Pendent · **Prioritat:** Mitjana · **Tipus:** Dades + Contingut
- **Cost:** tècnic S · contingut M (etiquetar)
- **Idea:** Etiquetar tasques per **context real** (finances personals, salut, sostenibilitat,
  esport…) i per **connexió amb altres matèries/àmbits** (física, tecnologia, ciències socials, EF).
- **Per què:** El decret organitza l'aprenentatge en situacions contextualitzades i promou el
  treball per àmbits. Et permetria trobar «matemàtiques en clau de sostenibilitat» per a un
  projecte interdisciplinari, cosa que cada cop es demana més.
- **Com es podria fer:** Dos grups de vocabulari nous (`context`, `connexio`) amb la maquinària
  de filtres existent.
- **Primer pas:** Definir una llista curta de contextos i àmbits i etiquetar-ne uns quants materials.

---

## 8. Rutines i manipulatius

### RM1 — Rutines de pensament de baixa preparació
- [ ] **Estat:** Pendent · **Prioritat:** Baixa · **Tipus:** Funcionalitat + Contingut
- **Cost:** tècnic S · contingut M (recollir/crear imatges i preguntes)
- **Idea:** Un apartat de rutines ràpides: *Which One Doesn't Belong*, *Notice & Wonder*,
  estimació, *number talks*.
- **Per què:** Activitats de baixa preparació i alt valor que encaixen en qualsevol classe i
  fomenten el raonament i la comunicació matemàtica.
- **Com es podria fer:** Una col·lecció d'imatges/contextos amb el tipus de rutina, navegable
  per tema. Pot reaprofitar la lògica de galeria de Florence.
- **Primer pas:** Recollir un grapat d'exemples d'una rutina i muntar-ne la vista.

### RM2 — Facet de manipulatius i eines digitals
- [ ] **Estat:** Pendent · **Prioritat:** Baixa · **Tipus:** Dades
- **Cost:** tècnic S · contingut S–M
- **Idea:** Etiquetar/recollir GeoGebra, Desmos, Polypad, simulacions i manipulatius físics
  (geoplà, policubs, tangram).
- **Per què:** Connecta la tasca amb l'eina. Els policubs, el tangram i els desenvolupaments ja
  surten a les sessions Florence: la relació tasca↔manipulatiu és natural i útil.
- **Com es podria fer:** Grup de vocabulari `manipulatiu`/`eina` i, per a les eines digitals,
  enllaços (reaprofitant `format: "web"` amb `url`).
- **Primer pas:** Afegir el camp i etiquetar les sessions Florence que ja usen manipulatius.

---

## Per on començar

Si s'hagués de prioritzar:

1. **F1 (vocabulari curricular).** És la base de F2, S2, D1, AV1 i CX1, i el camp `math_sense`
   ja hi té mig camí fet.
2. **S1 (seqüències) i G1 (guia docent).** Aprofiten directament el que ja existeix amb Florence
   (relacions entre sessions i tasques riques) i són on l'eina aporta més valor pedagògic.
3. La resta, segons necessitat del departament.

---

## Decisions: què NO farem (de moment)

- **Recollir evidències de treball de l'alumnat, co-avaluació o valoracions compartides.**
  Requereix emmagatzematge compartit/backend i xoca amb la decisió d'un lloc estàtic (vegeu
  `MILLORES-TECNIQUES.md` → Decisions). Reobrible si algun dia hi ha backend. *(Estat: Descartat)*

---

## Registre de canvis

Afegeix una línia per cada idea aplicada (la més recent a dalt).

| Data | ID | Canvi | Qui |
|------|----|-------|-----|
| 2026-09-05 | F2 · CB1 | Mode «El meu repartiment» a `florence-cb.html` i fitxer de pont `pipeline-data.js` (48 fils, 231/251 continguts). El repartiment de continguts passa a ser un punt d'entrada navegable cap a Florence, les CB i el catàleg | — |
| _(exemple)_ 2026-06-04 | — | Creació del roadmap pedagògic | — |
