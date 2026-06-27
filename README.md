# Material de Matemàtiques — INS Miquel Tarradell

Catàleg web del material de matemàtiques del departament: un cercador del material
(allotjat majoritàriament a Google Drive) més un conjunt d'eines per catalogar-lo,
editar el catàleg i treballar amb les proves de Competències Bàsiques (CB).

Tot és **HTML + CSS + JavaScript pur (vanilla)**, sense framework, sense `npm` i
**sense pas de compilació**. Cada pàgina és un fitxer `.html` autocontingut.

> Per a la referència tècnica detallada (esquemes de dades, dependències, particularitats),
> vegeu [`ARQUITECTURA.md`](ARQUITECTURA.md).
> Per a les tasques de manteniment del dia a dia (editar el catàleg, afegir material,
> publicar canvis), vegeu [`MANTENIMENT.md`](MANTENIMENT.md).

---

## Les pàgines

| Fitxer | Què és | Per a qui |
|---|---|---|
| `index.html` | **Cercador**. Cerca per paraula clau + filtres (curs, origen, sentit, format, tipus, activitat). Previsualització lateral del Drive i enllaços per obrir. | Tot el professorat |
| `repartiment.html` | **Repartiment de continguts**. Consulta els continguts matemàtics assignats a cada curs de l'ESO (1r–4t), organitzats per sentit matemàtic. Document de referència immutable d'un curs a l'altre. | Tot el professorat |
| `afegir-material.html` | **Editor del manifest**. Afegeix, edita i elimina entrades del catàleg, gestiona el vocabulari, valida i descarrega el `manifest.json`. | Qui manté el catàleg |
| `extreu-json.html` | **Catalogador amb IA**. Puja un PDF/DOCX i Gemini en proposa l'entrada de manifest (títol, curs, activitats…). Cal una clau de Gemini. | Qui manté el catàleg |
| `banc-cb.html` | **Banc d'ítems CB**. Filtra blocs de preguntes de proves CB i exporta un PDF per a l'alumnat (sense respostes). | Tot el professorat |
| `eliminar-curs.html` | **Eliminador de curs**. Treu la referència a un curs acadèmic (p. ex. `2024-25`) d'un PDF o DOCX, tot client-side. | Tot el professorat |
| `florence-cb.html` | **Mapa Florence → CB**. Per a cada sessió Florence de 2n/3r ESO, recomana preguntes CB i en deixa baixar els PNG. | Tot el professorat |
| `examen-recuperacio.html` | **Generador d'exàmens de recuperació** del curs anterior (1r/2n/3r ESO). Filtra el banc de recuperació per curs, sentit/tema i dificultat, el professor marca les preguntes i descarrega un `.docx` amb una imatge per pregunta (numeració nativa de Word + espai de resposta configurable). | Tot el professorat |
| `alimentar-banc.html` | **Crear preguntes a partir d'imatges** (amb IA). Puja fotos d'exercicis; Gemini en transcriu el text i n'aïlla les figures. Cada pregunta es **re-renderitza** en tipografia uniforme (text + figura). Permet editar, agrupar diverses en una, i exportar: o bé un fragment (`Exporta .zip`), o bé el banc sencer amb la versió incrementada (`Actualitza JSON`). Cal una clau de Gemini. | Qui manté el banc de recuperació |

## Els fitxers de dades i utilitats compartides

| Fitxer / carpeta | Contingut |
|---|---|
| `manifest.json` | El catàleg: vocabulari, etiquetes, configuració dels filtres i la llista de materials. **Font de veritat del cercador.** |
| `repartiment-data.js` | Dades del repartiment de continguts (estructura per curs, sentit, tema i ítems). **Font de veritat** de `repartiment.html`. |
| `auth.js` | Portal d'accés per contrasenya per a `repartiment.html`. Carregat al final del `<body>` de la pàgina protegida. Vegeu §&nbsp;[Canviar la contrasenya](#canviar-la-contrasenya) més avall. |
| `cb-items.json` | El banc de proves CB que consumeix `banc-cb.html`. |
| `cb-img/` | 107 imatges PNG (`CB1.png … CB157.png`) que fa servir `florence-cb.html`. |
| `recuperacio-items.json` | El banc de preguntes de recuperació que consumeixen `examen-recuperacio.html` i `alimentar-banc.html`. Cada pregunta és **una imatge**. Té un camp `versio` (`"1.x"`) que `alimentar-banc.html` incrementa en actualitzar el banc. |
| `recuperacio-img/` | Els PNG de les preguntes de recuperació (un per pregunta), referenciats pel camp `figura` de cada ítem. |
| `lib/jszip.min.js` | Llibreria `jszip` servida en local; la fan servir `florence-cb.html`, `examen-recuperacio.html` i `alimentar-banc.html`. |
| `lib/pdf-lib.min.js` | Llibreria `pdf-lib` servida en local; la fa servir `banc-cb.html`. |

## Canviar la contrasenya

`repartiment.html` està protegit per contrasenya. La contrasenya no s'emmagatzema en clar: `auth.js` en guarda el **hash SHA-256** a la constant `AUTH_HASH`.

Per canviar-la:

1. Obriu qualsevol pàgina del projecte al navegador (no cal que sigui una pàgina protegida).
2. Obriu la consola de desenvolupador (`F12` → pestanya *Console*).
3. Executeu:
   ```
   authHash('nova-contrasenya').then(console.log)
   ```
4. Copieu el hash de 64 caràcters que apareix a la consola.
5. Obriu `auth.js` i substituïu el valor de `AUTH_HASH` (línia ~26) pel hash obtingut.
6. Feu *commit* de `auth.js` al repositori.

> **Nota:** `authHash` és una funció global que `auth.js` exposa expressament per a aquest ús. Utilitza l'API nativa `crypto.subtle` del navegador (SHA-256); no cal cap eina externa.

## Stack i desplegament

- **Sense build.** Fitxers estàtics; s'obren directament al navegador, però **cal servir-los per HTTP(S)** (no per `file://`), perquè el cercador i el banc CB llegeixen els seus JSON amb `fetch()`.
- **Allotjament:** repositori a **GitHub** → desplegament automàtic a **Cloudflare Pages**.
  Publicar un canvi = fer *commit* del fitxer modificat (normalment `manifest.json`); Cloudflare redesplega sol.
- **Idioma:** tota la interfície i els comentaris del codi són en català.

## Dependències externes (resum)

L'aplicació depèn d'internet per a les seves funcions principals:

- **Google Drive / Docs** — previsualització i obertura del material.
- **`cb.step-quiz.net`** — imatges de les proves CB (banc) i enllaços a les proves.
- **`generativelanguage.googleapis.com`** (Gemini) — la catalogació amb IA.
- **`cdnjs.cloudflare.com`** — algunes llibreries JS (vegeu `ARQUITECTURA.md`).

Vegeu el mapa complet de dependències a [`ARQUITECTURA.md`](ARQUITECTURA.md#dependències-per-pàgina).
