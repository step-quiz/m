# Guia de manteniment

Per a la persona que manté el catàleg. Recull el flux de treball i les coses que cal saber
per no trobar-se sorpreses. Per a l'esquema complet de dades vegeu [`ARQUITECTURA.md`](ARQUITECTURA.md).

---

## El cicle de publicació (llegeix això primer)

L'editor **no escriu mai** al servidor. El flux sempre és:

1. Obre **`afegir-material.html`** (carrega `manifest.json` tot sol des de la mateixa carpeta).
2. Fes els canvis (afegir/editar/eliminar fitxers, gestionar el vocabulari).
3. Prem **«Descarrega manifest»** → es baixa un `manifest.json` nou a la teva carpeta de Baixades.
4. **Substitueix** el `manifest.json` del repositori de GitHub per aquest (fes *commit*).
5. **Cloudflare Pages redesplega sol.** Al cap d'un moment, el cercador ja mostra els canvis.

> ⚠️ Editar el catàleg **no toca els fitxers reals del Drive**. Eliminar una entrada només la
> treu del catàleg; el document continua existint al Drive. Afegir-ne una només crea la
> referència; el document ja ha d'existir al Drive (o ser un recurs web amb `url`).

L'editor avisa amb un punt «canvis sense desar» i et demana confirmació si surts sense
descarregar. Abans de deixar-te descarregar, **valida** el manifest: si hi ha errors
estructurals (IDs duplicats, valors fora del vocabulari) t'ho diu i et demana si vols
descarregar igualment.

---

## Tasques habituals

### Afegir un material nou

Dues maneres:

- **A mà:** a l'editor, botó de fitxer nou → omple títol, ID, format, i el Drive ID **o**
  l'URL (pots enganxar l'URL sencera de Drive: l'ID s'extreu sol). Marca curs, sentit,
  activitats i tipus.
- **Amb IA:** obre **`extreu-json.html`**, posa la clau de Gemini, arrossega el PDF/DOCX.
  Et proposa l'entrada; revisa-la i prem «Edita al manifest →», que obre l'editor amb el
  fitxer pre-omplert. El `drive_id` **mai** es dedueix del document: l'has de posar tu.

### ✱ Afegir una ACTIVITAT nova (cas especial — llegeix-ho)

Aquí hi ha un parany. Calen **dos passos**, i el segon és manual:

1. **Al vocabulari** (editor → secció Activitat → «+ nou»): afegeix el slug i la seva
   etiqueta visible. Això ja et permet marcar-la als fitxers.
2. **A `manifest.json`, a mà:** afegeix el mateix slug dins de l'`items` d'un dels 8 blocs
   d'`activity_blocks` (Aritmètica, Àlgebra, Geometria sintètica, Geometria analítica,
   Funcions, Anàlisi, Trigonometria, Estadística i probabilitat). **Si no fas aquest segon
   pas, l'activitat no apareixerà com a filtre al cercador** (en mode Avançat el filtre
   d'Activitat es construeix només des d'`activity_blocks`; en mode Bàsic no hi ha filtre
   d'activitat). L'editor **no** gestiona els blocs i el validador **no** avisa d'això.

   ```jsonc
   "activity_blocks": [
     { "label": "Geometria sintètica",
       "items": ["figures-planes", "arees-perimetres",
                 "circumferencia-cercle"  /* ← afegeix-lo aquí */ ] },
     …
   ]
   ```

   *(Cas pendent actual: `circumferencia-cercle` és al vocabulari i l'usa un fitxer, però no
   és a cap bloc; per això no es pot filtrar. Afegir-lo a «Geometria sintètica» ho resoldria.)*

> Si vols comprovar de tant en tant que no s'ha colat cap activitat orfe, compara
> `vocabulary.activity` amb la unió de tots els `activity_blocks[].items`: el que sobri al
> primer és una activitat no filtrable.

### Editar o treure un valor del vocabulari

A l'editor, cada etiqueta té un llapis (edita el text visible) i una ✕ (treu el valor del
vocabulari). Si treus un valor que algun fitxer encara fa servir, el fitxer **mantindrà el
valor però sortirà sense format** (es veurà el slug en cru). El panell de validació marca
com a **error** qualsevol valor d'un fitxer que no sigui al vocabulari.

### Treure la referència d'un curs d'un PDF o DOCX

Obre **`eliminar-curs.html`** i arrossega el fitxer. Detecta sol patrons de curs acadèmic
(`2024-25`, `2024/2025`, etc.); pots també escriure el text exacte a treure. En **PDF** ho
tapa amb un rectangle del color del fons; en **DOCX** ho elimina de debò de l'XML (queda
editable i sense rastre). Descarrega el fitxer «(sense curs)». No altera el fitxer original.

### Generar un PDF de proves CB per a l'alumnat

Obre **`banc-cb.html`**, filtra per nivell/any/sentit/dificultat i prem exportar. El PDF
surt sense les respostes. **Necessita connexió** (les imatges venen de `cb.step-quiz.net`).

---

## Novetats de cada juny

Les proves de competències bàsiques de l'any i les seqüències noves de Florence entren
per camins diferents i tenen guia pròpia: [`ACTUALITZACIO-ANUAL.md`](ACTUALITZACIO-ANUAL.md).
Hi ha els dos procediments pas a pas, els guions que cal executar i les comprovacions
abans del commit. `florence-cb.html` ja admet grafs de 1r i 4t d'ESO sense tocar codi.

---

## Coses a tenir presents

- **Sempre per HTTP(S).** No obris les pàgines amb doble clic (`file://`): el cercador i el
  banc CB no podrien carregar el seu JSON. Funcionen servides (GitHub Pages/Cloudflare, o un
  servidor local de proves).
- **Els `id` dels fitxers són estables i únics.** S'usen a les URL del cercador. Si en canvies
  un, els enllaços antics a aquell material deixaran de funcionar. Només minúscules, números i guions.
- **`drive_id` o `url`, com a mínim un.** Sense cap dels dos, el material no es pot obrir
  (el validador ho marca com a error).
- **El camp `generated`** del manifest es posa sol a la data de cada descàrrega; no cal tocar-lo.
- **Imatges de `florence-cb.html`:** són locals a `cb-img/` (`CB<id>.png`). Si una sessió
  recomana un CB del qual no hi ha el PNG, la previsualització/baixada d'aquella entrada
  falla. Ara hi ha totes les 166 imatges referenciades (`CB1.png … CB218.png`), sense cap
  pendent. Per generar-ne de noves: `make_cb_card.py <ids>`, amb el projecte CB al costat.
- **Llibreries:** algunes pàgines les carreguen de `cdnjs.cloudflare.com`. Si algun dia cdnjs
  no és accessible, `eliminar-curs.html` (pdf.js, pdf-lib, jszip) i `extreu-json.html`
  (mammoth) deixarien de funcionar. `banc-cb.html` ja porta `pdf-lib` en local i no en depèn.
- **Clau de Gemini:** s'introdueix a cada sessió de `extreu-json.html` i no es desa. Cada
  persona necessita la seva pròpia clau de Google AI Studio.

---

## On és cada cosa (mapa ràpid)

```
/
├── index.html              ← cercador
├── afegir-material.html    ← editor del manifest  (← treballaràs aquí)
├── extreu-json.html        ← catalogador amb IA
├── banc-cb.html            ← banc CB + export PDF
├── eliminar-curs.html      ← treure curs de PDF/DOCX
├── florence-cb.html        ← mapa Florence → CB
├── repartiment-data.js     ← el currículum (font de veritat del repartiment)
├── pipeline-data.js        ← pont repartiment ↔ Florence ↔ CB
├── manifest.json           ← catàleg (font de veritat del cercador)
├── cb-items.json           ← banc CB (per a banc-cb.html)
├── cb-img/                 ← PNG per a florence-cb.html
├── lib/pdf-lib.min.js      ← pdf-lib local (per a banc-cb.html)
├── README.md
├── ARQUITECTURA.md
└── MANTENIMENT.md          ← aquest document
```
