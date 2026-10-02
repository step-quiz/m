# Actualització anual: competències bàsiques i Florence

Cada juny arriben novetats per tres camins. Aquesta guia els recull tots tres, amb
l'estat en què va quedar el projecte i què cal fer la propera vegada.

- **Eix CB** — el Departament publica les proves de competències bàsiques de l'any.
  Afecten `cb-main` (el projecte de `cb.step-quiz.net`) i, de retruc, aquest projecte.
- **Eix Florence** — apareixen seqüències didàctiques noves. No sempre arriben el juny: el
  curs 2026-27 el material de Florence arriba per blocs (I1, I2…), i el primer, l'octubre
  del 2026, va portar la primera sessió de **1r** i la primera de **4t d'ESO** (vegeu
  «El material arriba per blocs» més avall).
- **Eix repartiment** — el pont `pipeline-data.js`, que relaciona els continguts del
  currículum amb les dues coses anteriors. **No s'actualitza sol**: si només fas els dos
  primers eixos, l'entrada «Per contingut» de `florence-cb.html` es quedarà mostrant la
  cobertura de l'any passat i cap contingut no proposarà les sessions noves.

**L'ordre importa:** CB → Florence → repartiment. Cada pas fa servir el resultat de
l'anterior (les preguntes noves s'assignen a les sessions; les sessions noves s'assignen
als continguts).

### Si comences sense context

Llegeix, en aquest ordre: [`README.md`](README.md) (què és cada fitxer),
[`ARQUITECTURA.md`](ARQUITECTURA.md) §2–§5 (els contractes de dades) i aquesta guia. Per al
dia a dia del catàleg, [`MANTENIMENT.md`](MANTENIMENT.md).

Abans de tocar res, executa `node valida-dades.js`: comprova totes les relacions entre
fitxers i imprimeix les xifres actuals. Torna a executar-lo al final i compara. És la
manera més ràpida de veure l'estat real del repositori sense fiar-te del que diuen els
`.md`, que es poden haver quedat enrere.

---

## Estat actual (octubre del 2026)

| | |
|---|---|
| Banc CB | 2n ESO 2024–2026 · 4t ESO 2022–2026 · **84 blocs, 218 preguntes** (ids 1–218) |
| Grafs Florence | 1r ESO (1 sessió) · 2n ESO (11 sessions) · 3r ESO (11 sessions) · 4t ESO (1 sessió) |
| Targetes `cb-img/` | 169 (`CB1.png … CB218.png`) |
| Fitxes `florence-pdf/` | 36: 24 fitxes d'alumnat de sessions i 12 fitxes docents d'activitats focus |
| Activitats focus | 12, totes del bloc I1 · les proposen 25 continguts |
| Pont `pipeline-data.js` | 49 fils · 233 dels 251 continguts (2n 80/80 · 3r 48/49 · 1r 54/62 · 4t 51/60) |

> Aquestes xifres les imprimeix `node valida-dades.js`. Si no coincideixen amb el que veus,
> fes cas del guió, no de la taula.

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

7. **Reparteix les preguntes noves entre les sessions del `PAYLOAD`** i, tot seguit, entre
   els fils de `pipeline-data.js` (vegeu «Eix repartiment» més avall).
8. Executa `node valida-dades.js`, actualitza els recomptes de `ARQUITECTURA.md` §3 i §4e i
   afegeix una línia a `MILLORES-TECNIQUES.md`.

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

**Per donar d'alta 1r o 4t ESO n'hi ha prou d'omplir `d1`/`ff1` o `d4`/`ff4`.** A l'entrada
«Per sessió Florence» apareix sol un grup nou («Pensades per a 1r d'ESO»), i l'avís «Encara no
hi ha sessions pensades per a…» desapareix per a aquell curs; si una clau és buida o no hi
és, el grup no es dibuixa. Cada graf té un color, que només pinta l'identificador de la
sessió (S1, S2…):

| Graf | Variable CSS | Color |
|---|---|---|
| 1r ESO | `--g1` | terra |
| 2n ESO | `--g2` | blau |
| 3r ESO | `--g3` | verd |
| 4t ESO | `--g4` | morat |

L'encaix ja no es pinta amb colors sinó amb paraules i punts (●●● molt relacionada, ●●○
relacionada, ●○○ relació parcial), de manera que un graf nou no demana cap gamma. Els grups
s'ordenen segons el curs dels alumnes triat (primer el seu, després el més proper), no per
l'ordre de les claus del `PAYLOAD`.

### El material arriba per blocs (I1, I2…)

El curs 2026-27 Florence (programa FLORENCE-SIM) envia el material per blocs temàtics. Cada
bloc porta una carpeta per curs, amb el prefix del bloc (`I1 ESO1. Sanefes`,
`I1 ESO4. Qui té la raó`), i el bloc I1 («Raonament proporcional») va portar a més un
document d'«Activitats focus». L'octubre del 2026 es va incorporar així:

| Fitxer de la carpeta | On va |
|---|---|
| Fitxa alumnat (PDF) | `florence-pdf/F_<curs>ESO_S<nn>.pdf`. El número surt del títol intern del document (`ESO4_S01_Fitxa docent…` → `F_4ESO_S01`). |
| Fitxa docent, Fitxa Centre, Presentació, Recurs imprimible | No van al repositori. Si el departament les vol a mà, al Drive i al catàleg (`manifest.json`, origen `florence`), com les versions «pautada» o «adaptada» de 2n i 3r. |
| Pauta d'observació, Anàlisi de la sessió, observacions omplertes | No s'han publicat: són documents de seguiment del programa. |
| Material complementari (SVG, Beam Studio) | Fitxers per tallar peces amb làser. No es publiquen aquí. |
| Activitats focus (DOCX) | Un PDF per activitat a `florence-pdf/FO_<curs>ESO_<nn>.pdf`, fet amb `divideix_focus.py`; entrada a `PAYLOAD.focus`, als fils i al catàleg (vegeu «Donar d'alta activitats focus»). |

Les preguntes CB es van triar entre les que ja tenien targeta i, per a «Qui té la raó?», se
n'hi van generar tres de noves: `CB9` i `CB10` (l'escala i la rampa del mercat, 4t del
2025), que treballen exactament la raó entre els catets, i `CB88` (la foto, 4t del 2023),
que treballa la raó entre costats que es manté en reduir una figura.

### Donar d'alta activitats focus

Les activitats focus són activitats curtes que ataquen un error típic. Arriben totes les d'un
bloc en un sol DOCX per al docent. Es van incorporar per primer cop l'octubre del 2026 (bloc
I1, 10 activitats de 1r a 4t). L'endemà en van arribar dues més per a 1r del mateix bloc, cadascuna en un
DOCX propi: el guió funciona igual amb un DOCX d'una sola activitat. Com que el nom del fitxer
no porta el bloc (`extra1…`), cal posar `bloc: "I1"` a mà a la proposta.

1. **Divideix el DOCX:** `python3 divideix_focus.py "<fitxer>.docx"`. Deixa a `focus-nou/` un
   DOCX i un PDF per activitat, amb els ids que continuen la numeració de cada curs
   (`FO_1ESO_05`…), i un `payload-focus.json` amb les entrades proposades. Comprova que cada
   PDF comença pel títol de la seva activitat i que no en falta cap pàgina.
2. **Copia els PDF** a `florence-pdf/`, i esborra la carpeta `focus-nou/` (no s'ha de pujar).
3. **Afegeix les entrades a `PAYLOAD.focus`** de `florence-cb.html`. El camp `conflicte` és la
   frase de l'apartat «Conflicte/Error focalitzat»: el guió la proposa, però revisa-la perquè
   s'entengui sola (surt a la targeta com «Error que ataca»).
4. **Posa cada activitat als fils** de `pipeline-data.js` (camp `focus`) de la idea que
   treballa: `percentatges`, `percentatge-variacio`, `area-escala`, `semblanca`… Així surt a
   tots els continguts que toquen aquell fil. Si la idea no té fil, crea'l (secció «Eix
   repartiment»).
5. **Dona-les d'alta al catàleg** (`manifest.json`) amb `type: "focus"`, `format: "pdf"` i
   `url: "florence-pdf/<id>.pdf"`: no cal pujar-les al Drive. El títol porta «(activitat
   focus)» al darrere i les `notes`, l'error que ataca (així també es troben cercant).
6. Executa `node valida-dades.js`: avisa si una activitat no té PDF o si no és a cap fil.

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
de fer el commit**, com les 169 que ja hi ha:

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
- **Afegeix les sessions noves als fils de `pipeline-data.js`** (secció següent). Sense
  això, les sessions surten a l'entrada «Per sessió Florence» però no a «Per contingut».
- Executa `node valida-dades.js` i resol-ne els errors.
- Actualitza els recomptes a `README.md`, `MANTENIMENT.md` i `ARQUITECTURA.md`, i afegeix la
  línia a `MILLORES-TECNIQUES.md`. El validador imprimeix totes les xifres al final.

---

## Eix repartiment: actualitzar el pont `pipeline-data.js`

Aquest és el pas que és fàcil oblidar, perquè res no falla si te'l saltes: la pàgina
segueix funcionant, simplement es queda amb la cobertura de l'any passat.

### Què hi ha dins

Dues taules (l'esquema complet és a [`ARQUITECTURA.md`](ARQUITECTURA.md) §4e):

- `PIPELINES` — els «fils didàctics». Cada fil aplega les **sessions Florence** i les
  **preguntes CB** que treballen una mateixa idea (`pitagores`, `percentatges`, `poliedres`…).
- `CONTINGUT_PIPELINE` — quins fils toca cada contingut del repartiment, per posició.

Gairebé tota la feina anual és a `PIPELINES`. `CONTINGUT_PIPELINE` només canvia si canvia
el repartiment mateix.

### Quan arriba una edició CB nova

Les preguntes noves ja s'han repartit entre les sessions al pas anterior. Ara toca posar-les
també als fils, que és el que fa que apareguin quan un professor entra pel currículum.

1. Mira quines preguntes noves ha rebut cada sessió.
2. Per a cada fil que inclogui aquella sessió, pregunta't si la pregunta nova hi encaixa.
   Si hi encaixa, afegeix-hi l'id. **Les llistes `cb` van de més a menys properes al
   contingut:** la primera és la que donaries a un alumne si només n'hi poguessis donar una.
3. Si una pregunta nova obre un tema que cap fil no cobreix, val més crear un fil nou i
   assignar-lo als continguts que toqui, que no encabir-la en un fil que li queda gran.

Restricció dura: **només pots posar ids que tinguin targeta a `cb-img/`**, perquè és d'allà
que surt la imatge, i que estiguin descrits en alguna sessió del `PAYLOAD`, perquè d'allà
surten la font (`2ESO`/`4ESO`) i el text de la columna «Continguts que es mobilitzen». Si
poses un id que no compleix les dues coses, `valida-dades.js` t'ho dirà.

### Quan arriben sessions Florence noves (sobretot de 1r i 4t)

Aquest és el cas gros, i el que farà pujar més la cobertura. L'octubre del 2026 es va fer
per primer cop, amb «Sanefes» (1r) i «Qui té la raó?» (4t).

1. Dona d'alta les sessions al `PAYLOAD` (secció anterior). Fins aquí, l'entrada
   «Per contingut» encara no les proposa.
2. Per a cada sessió nova, llegeix-ne el `nucli` i busca **quins fils ja existents** la
   descriuen. Afegeix-hi `['F_1ESO_S03', <encaix>]`. Sovint no cal cap fil nou: una sessió
   de 1r sobre àrees encaixa al fil `area-figures` que ja hi ha.
3. Crea fils nous només per a idees que no hi són. Els forats coneguts són bons candidats:
   logaritmes, la resta de trigonometria (reducció al primer quadrant, teoremes del sinus i
   del cosinus), notació científica, sistemes de numeració, la jerarquia de les operacions.
   El fil `trigonometria` es va crear així l'octubre del 2026.
4. Assigna els fils nous als continguts a `CONTINGUT_PIPELINE`, amb la clau
   `<CURS>|<sentit>/<tema.id>` i la **posició** del contingut dins del tema, començant per 1.
5. Si una sessió de 1r no troba cap contingut de 1r on encaixar, mira si el repartiment de 1r
   té aquell tema. Per exemple, el repartiment de 1r no té cap contingut de raó ni de
   proporcionalitat (és a 2n), i per això «Sanefes» només surt a 1r per «Gràfics i taules».

Un detall que va sorprendre el 2026 i tornarà a passar: **una sessió pot servir per a un
contingut d'un altre curs**. El teorema de Pitàgores és contingut de 2n, però la sessió que
el treballa és «Quadrats inclinats», del graf de 3r. Això és desitjat i la interfície ho
marca; no ho «arreglis» limitant els fils al seu propi curs.

### Frases que ja no s'han de tocar

La interfície deriva del `PAYLOAD` quins cursos tenen graf. Des que `d1` i `d4` tenen
sessions (octubre del 2026), els missatges del tipus «De moment només hi ha graf de 2n i 3r
d'ESO» ja no surten: van desaparèixer sols. **No
hi ha cap any escrit a mà dins de `florence-cb.html`**; si n'hi afegeixes un, el tornaràs a
haver de buscar l'any vinent.

### El fitxer s'edita a mà

`pipeline-data.js` es va generar un cop amb un guió, però la font de veritat ara és el
fitxer mateix: està comentat contingut a contingut precisament perquè es pugui editar
directament. No el regeneris des de zero; perdries les correccions del departament.

### Comprovacions

```
node valida-dades.js
```

Comprova que cap fil no apunti a sessions o preguntes inexistents, que cap posició no se
surti del seu tema, que no hi hagi fils definits i no fets servir, i imprimeix la cobertura
nova per copiar-la als `.md`.

---

## Guions d'aquest projecte

| Guió | Què fa |
|---|---|
| `retalla_cb.py` | Retalla enunciats i preguntes dels PDF oficials d'una prova CB |
| `genera_cb_items.py` | Refà `cb-items.json` a partir de `preguntes.json` de `cb-main` |
| `make_cb_card.py` | Compon les targetes `cb-img/CB<id>.png` de `florence-cb.html` |
| `divideix_focus.py` | Divideix el DOCX d'«Activitats focus» d'un bloc en un DOCX i un PDF per activitat |
| `valida-dades.js` | Comprova la coherència entre el `PAYLOAD`, `pipeline-data.js`, `repartiment-data.js`, `cb-img/`, `florence-pdf/` i `cb-items.json`, i imprimeix les xifres dels `.md` |

Els tres primers necessiten Python 3; dos d'ells, també Pillow, i `retalla_cb.py` a més
`pdfplumber` i les eines de `poppler` (`pdftoppm`). `divideix_focus.py` necessita Python 3,
`python-docx` i, per als PDF, LibreOffice amb el Writer i les fonts del document (Roboto,
Roboto Condensed, Lexend, Noto Color Emoji); sense LibreOffice, fa només els DOCX. `valida-dades.js` només necessita Node,
sense cap paquet: llegeix els fitxers de dades tal com ho faria el navegador.

`cb-items.json` **es dedueix sencer** de `preguntes.json`: la font de veritat és el segon i
el primer se'n deriva. No editis `cb-items.json` a mà.
