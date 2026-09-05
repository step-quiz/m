# Actualització anual: competències bàsiques i Florence

Cada juny arriben novetats per dos camins independents. Aquesta guia recull els dos, amb
l'estat en què va quedar tot el setembre del 2026 i què cal fer la propera vegada.

- **Eix CB** — el Departament publica les proves de competències bàsiques de l'any.
  Afecten `cb-main` (el projecte de `cb.step-quiz.net`) i, de retruc, aquest projecte.
- **Eix Florence** — apareixen seqüències didàctiques noves. El juny del 2027 s'hi
  afegiran les de **1r i 4t d'ESO**, que ara no existeixen.

Els dos eixos es poden fer per separat i en qualsevol ordre. Si toca fer-los tots dos,
convé fer primer el de CB: així les preguntes noves ja hi són quan s'assignen a les
sessions de Florence.

Per a l'esquema de dades vegeu [`ARQUITECTURA.md`](ARQUITECTURA.md); per al dia a dia del
catàleg, [`MANTENIMENT.md`](MANTENIMENT.md).

---

## Estat actual (setembre del 2026)

| | |
|---|---|
| Banc CB | 2n ESO 2024–2026 · 4t ESO 2022–2026 · **84 blocs, 218 preguntes** (ids 1–218) |
| Grafs Florence | 2n ESO (11 sessions) · 3r ESO (11 sessions) |
| Targetes `cb-img/` | 166 (`CB1.png … CB218.png`) |
| Fitxes d'alumnat `florence-pdf/` | 22 |

---

## Eix CB: incorporar una edició nova

### Què es publica i què cal

De cada nivell (2n i 4t d'ESO) el Departament penja tres PDF: la prova, el full de
respostes i un document de «Descripció de la prova, especificacions dels ítems i clau de
respostes». **El tercer és el important**: en surten el sentit matemàtic i el grau de
complexitat de cada ítem, i la clau de respostes. No cal endevinar res.

### Passos

1. **Retallar les imatges.** `python3 retalla_cb.py` sobre els PDF de la prova. Genera
   `data/cb<nivell><any>e<N>.png` (enunciats) i `data/cb<nivell><any>p<M>.png` (preguntes),
   amb `M` = el número oficial de l'ítem a la prova.

   El guió dedueix els blocs sol: un bloc és un estímul compartit més les preguntes que en
   pengen. Quan una pàgina continua l'activitat anterior sense estímul nou (només la barra
   grisa i una pregunta), les seves preguntes s'afegeixen al bloc anterior en comptes
   d'obrir-ne un de buit. **Revisa els retalls abans de publicar-los**: la segmentació és
   automàtica i la maquetació oficial pot canviar d'un any a l'altre.

2. **Transcriure les metadades** de la taula d'especificacions i de la clau de respostes:
   `sentit`, `dificultat` (Bàsic 1 · Intermedi 2 · Superior 3) i `indexCorrecte`
   (a 0 · b 1 · c 2 · d 3). Val la pena comprovar que la distribució de respostes
   correctes surti més o menys uniforme entre les quatre opcions: si no, hi ha un error de
   transcripció.

3. **Afegir les entrades a `preguntes.json`** de `cb-main`, amb ids correlatius a partir de
   l'últim (el 2026 va acabar al 218). Insereix-les **abans del claudàtor de tancament**
   sense reserialitzar el fitxer sencer: així el diff de git només mostra el que has afegit.

4. **Copiar les imatges** a `cb-main/data/`.

5. **Regenerar `cb-items.json`** d'aquest projecte:
   `python3 genera_cb_items.py <ruta>/preguntes.json cb-items.json`.

6. Res més. `banc-cb.html` no s'ha de tocar: els quatre filtres es construeixen llegint el
   JSON i l'any nou hi apareix sol. L'`index.html` de `cb-main` tampoc: des del setembre
   del 2026 deriva els anys de `preguntes.json` i només fa servir la llista escrita a mà
   com a reserva quan no pot llegir el fitxer.

7. Actualitza els recomptes de `ARQUITECTURA.md` §3 i afegeix una línia a
   `MILLORES-TECNIQUES.md`.

### Coses que han passat i tornaran a passar

- **Ítems que no encaixen.** Els de Verdader/Fals de dues parts no són d'opció múltiple de
  quatre; el 2026 se'n va ometre un (l'ítem 12 de 2n ESO). Ometre'n algun és normal: de les
  edicions anteriors n'hi ha 50 de no incloses. Si l'ometes, no copiïs la seva imatge.
- **La taxonomia de sentits es mou.** El 4t ESO del 2026 va fusionar «espacial» i «mesura»
  en un únic sentit oficial, EiM. Com que el banc els té separats i són dos filtres
  diferents, els vuit ítems afectats es van repartir a mà entre `espacial` i `mesura`. Si
  torna a passar, o es reparteixen igual o cal afegir un sentit nou a les `labels` de
  `cb-items.json`, al `SENSE_ORDER` de `banc-cb.html` i al desplegable de `cb-main/index.html`.
- **Les pistes.** Cada pregunta en porta quatre, una per opció, buida la de la correcta.
  Són text pedagògic escrit a mà i no es dedueixen de cap PDF. Les de l'edició 2026 encara
  estan buides: el mode examen funciona igual, però el mode pràctica mostra el requadre de
  retroacció en blanc quan l'alumne falla.
- **L'any no es veu enlloc.** Ni la targeta de `cb-img/` ni la taula de `florence-cb.html`
  diuen de quina edició surt una pregunta: només el nivell i el sentit. Si algun dia
  interessa distingir-ho, cal un camp `any` als ítems `cb` del `PAYLOAD`, una columna a la
  taula i una línia a `make_cb_card.py`.

---

## Eix Florence: incorporar sessions o un graf nou

### El fitxer ja està preparat per a quatre grafs

`florence-cb.html` porta les dades incrustades en un objecte `PAYLOAD` (no llegeix cap
JSON). Fins al setembre del 2026 estava lligat a exactament dos grafs; ara accepta els
quatre cursos d'ESO sense tocar codi:

```jsonc
{
  "d1": [ /* sessions de 1r ESO */ ],  "ff1": [ /* relacions entre sessions de 1r */ ],
  "d2": [ /* sessions de 2n ESO */ ],  "ff2": [ … ],
  "d3": [ … ],                         "ff3": [ … ],
  "d4": [ … ],                         "ff4": [ … ]
}
```

**Per donar d'alta 1r o 4t ESO n'hi ha prou d'omplir `d1`/`ff1` o `d4`/`ff4`.** La pestanya
apareix sola, amb la seva etiqueta i la seva gamma de colors; si una clau és buida o no hi
és, la pestanya no es dibuixa. Cada graf té la seva gamma d'encaix definida al CSS:

| Graf | Gamma | Color |
|---|---|---|
| 1r ESO | `--p3-1` `--p2-1` `--p1-1` | terra |
| 2n ESO | `--p3-2` `--p2-2` `--p1-2` | blau |
| 3r ESO | `--p3-3` `--p2-3` `--p1-3` | verd |
| 4t ESO | `--p3-4` `--p2-4` `--p1-4` | morat |

L'ordre de les pestanyes surt de la constant `GRAFS` del guió, no de l'ordre de les claus
del `PAYLOAD`.

### Donar d'alta una sessió

```jsonc
{
  "id":    "F_1ESO_S01",        // F_<curs>ESO_S<nn>; ha de coincidir amb el PDF
  "titol": "Títol de la sessió",
  "pdf":   true,                 // hi ha florence-pdf/F_1ESO_S01.pdf?
  "nucli": "continguts que treballa, en una línia",
  "cb": [
    { "id": 158, "desc": "què mobilitza aquesta pregunta", "src": "4ESO", "pes": 3 }
  ]
}
```

- `id` de l'ítem CB és **l'id global de `preguntes.json`**, el mateix que fa servir
  `cb-img/CB<id>.png`.
- `src` és el nivell de la prova d'on surt (`"2ESO"` o `"4ESO"`), no el curs de la sessió.
  Un graf de 1r ESO pot recomanar preguntes de 2n o de 4t: són les úniques que existeixen.
- `pes`: 3 mateix contingut nuclear · 2 afí · 1 secundari. Les llistes `cb` es mantenen
  ordenades per pes descendent.
- `pdf` substitueix el conjunt `FPDF` que hi havia abans, que era una llista paral·lela
  d'ids i s'havia de mantenir en un segon lloc.
- Una mateixa pregunta CB pot sortir a diverses sessions; és normal i freqüent.
- `ff<n>` són triples `[origen, destí, descripció]`. La descripció surt com a `title` del
  xip «Continua per…». Les relacions són bidireccionals: n'hi ha prou d'escriure-les un cop.

### Generar les targetes

Cada id CB referenciat necessita `cb-img/CB<id>.png`, en local. Si en falta una, la
previsualització i la baixada d'aquella fila fallen sense avisar.

```
python3 make_cb_card.py 219 220 221 …
```

El guió necessita el projecte `cb-main` al costat (`preguntes.json` + `data/`). Escriu a
`cb-img-noves/`; copia'n el contingut a `cb-img/`.

Les targetes surten en RGB i pesen unes tres vegades més del compte. **Palatitza-les abans
de fer el commit**, com les 166 que ja hi ha:

```python
from PIL import Image
im = Image.open(f).convert('RGB').quantize(colors=256, method=Image.Quantize.MEDIANCUT)
im.save(f, optimize=True)
```

L'error mitjà és de 0,2 sobre 255 i el pes baixa un 60 %.

### Comprovacions abans del commit

- Cada id CB referenciat té la seva imatge a `cb-img/`, i no hi ha imatges sense referència.
- Cap `src` contradiu el `nivell` real de la pregunta a `preguntes.json`.
- Cap sessió repeteix el mateix id CB.
- Les llistes `cb` estan ordenades per pes descendent.
- Cada sessió amb `"pdf": true` té el seu fitxer a `florence-pdf/`.
- Actualitza el recompte d'imatges a `README.md`, `MANTENIMENT.md` i `ARQUITECTURA.md`
  (surt a tres llocs), i afegeix la línia a `MILLORES-TECNIQUES.md`.

---

## Guions d'aquest projecte

| Guió | Què fa |
|---|---|
| `retalla_cb.py` | Retalla enunciats i preguntes dels PDF oficials d'una prova CB |
| `genera_cb_items.py` | Refà `cb-items.json` a partir de `preguntes.json` de `cb-main` |
| `make_cb_card.py` | Compon les targetes `cb-img/CB<id>.png` de `florence-cb.html` |

Tots tres necessiten Python 3; els dos primers, també Pillow, i `retalla_cb.py` a més
`pdfplumber` i les eines de `poppler` (`pdftoppm`).

`cb-items.json` **es dedueix sencer** de `preguntes.json`: la font de veritat és el segon i
el primer se'n deriva. No editis `cb-items.json` a mà.
