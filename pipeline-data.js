/* pipeline-data.js — Pont «repartiment de continguts» ↔ Florence ↔ CB
 * ════════════════════════════════════════════════════════════════════
 * El fa servir florence-cb.html (mode «El meu repartiment»), que el
 * carrega just després de repartiment-data.js. Cap dependència externa.
 *
 * PROBLEMA QUE RESOL
 *   El professorat parteix del repartiment de continguts (què toca avui),
 *   no de la llista de sessions Florence. Aquest fitxer diu, per a cada
 *   contingut del repartiment, quina tasca rica de Florence el treballa i
 *   quines preguntes CB el consoliden.
 *
 * DUES TAULES
 *   PIPELINES          — el catàleg de «fils didàctics». Cada fil aplega
 *                        les sessions Florence i les preguntes CB que
 *                        treballen una mateixa idea matemàtica.
 *   CONTINGUT_PIPELINE — quins fils toca cada contingut del repartiment.
 *
 * L'esquema és de dos nivells a propòsit: 251 continguts comparteixen
 * una quarantena d'idees. Corregir una llista de CB es fa UN cop, al fil,
 * i no contingut a contingut.
 *
 * FORMAT
 *   PIPELINES['<id>'] = {
 *     label:    text visible del fil,
 *     nota:     (opcional) per què aquesta tasca serveix per a això,
 *     florence: [ ['<id de sessió>', <encaix 1-3>], … ],
 *     cb:       [ <id de pregunta CB>, … ]
 *   }
 *
 *   CONTINGUT_PIPELINE['<CURS>|<sentit>/<tema.id>'] = {
 *     <posició del contingut>: ['<id de fil>', …], …
 *   }
 *
 * REGLES
 *   - La clau PORTA EL CURS. El mateix «<sentit>/<tema.id>» existeix a
 *     cursos diferents amb continguts diferents (numeric/fraccions és a
 *     1r i a 2n, algebraic/llenguatge-algebraic als quatre cursos).
 *   - <posició> és el número que es veu al davant del contingut a
 *     repartiment.html, començant per 1. Si reordeneu o inseriu
 *     continguts dins d'un tema, cal renumerar aquí. florence-cb.html
 *     ignora en silenci les posicions que no existeixen.
 *   - Els ids de sessió han de ser al PAYLOAD de florence-cb.html i els
 *     ids CB han de tenir targeta a cb-img/CB<id>.png. Ara mateix això
 *     vol dir els 166 ids que ja referencia alguna sessió Florence.
 *   - Una sessió pot ser d'un curs diferent del contingut: és normal i
 *     desitjat (Pitàgores de 2n es treballa amb «Quadrats inclinats»,
 *     que és del graf de 3r). La interfície ho marca.
 *   - Un contingut sense entrada no és un error: vol dir que ni Florence
 *     ni la prova CB el toquen. La pàgina ho diu i ofereix el catàleg.
 *
 * ESTAT
 *   Esborrany generat el 05/09/2026 a partir dels nuclis de les 22
 *   sessions Florence i de les descripcions dels 166 ítems CB.
 *   ESTÀ PENSAT PER SER REVISAT pel departament: els encaixos (1-3) i la
 *   tria de preguntes són una proposta, no una veritat.
 */

const PIPELINES = {

  'lectura-enunciats': {
    label: 'Llegir i interpretar un enunciat',
    nota:  'Els enunciats CB són textos densos amb taules i gràfics: val la pena treballar-los com a text abans que com a càlcul.',
    florence: [['F_2ESO_S05', 2], ['F_2ESO_S04', 1]],
    cb: [109, 96, 190, 99, 195, 199, 210],
  },

  'resolucio-problemes': {
    label: 'Resoldre problemes amb estratègia',
    nota:  'Tasques de Thinking Classroom: primer buscar una estratègia, després calcular.',
    florence: [['F_2ESO_S04', 3], ['F_3ESO_S04', 3], ['F_2ESO_S09', 2]],
    cb: [115, 116, 199, 179, 98, 195, 96],
  },

  'recompte': {
    label: 'Recompte sistemàtic de casos',
    nota:  'Enumerar tots els casos de manera ordenada és la base de la combinatòria i de la probabilitat de Laplace.',
    florence: [['F_3ESO_S03', 3], ['F_2ESO_S04', 2], ['F_3ESO_S04', 2]],
    cb: [116, 179, 211, 212, 98],
  },

  'patrons': {
    label: 'Patrons i regularitats',
    nota:  'Continuar una sèrie i descriure com creix, abans de posar-hi lletres.',
    florence: [['F_2ESO_S07', 3], ['F_3ESO_S03', 3]],
    cb: [201, 202, 203, 70, 71, 72, 101, 51, 52, 168],
  },

  'generalitzacio': {
    label: 'Del patró a l\'expressió algebraica',
    nota:  'El salt de «la figura 10 en té 21» a «la figura n en té 2n+1». És el nucli del sentit algebraic a l\'ESO.',
    florence: [['F_3ESO_S03', 3], ['F_2ESO_S11', 3], ['F_2ESO_S08', 2], ['F_2ESO_S07', 2]],
    cb: [73, 72, 169, 122, 203, 100, 50, 168, 65],
  },

  'llenguatge-algebraic': {
    label: 'Traduir un enunciat a llenguatge algebraic',
    florence: [['F_2ESO_S11', 3], ['F_3ESO_S09', 2]],
    cb: [190, 21, 100, 122, 37, 178],
  },

  'equacions': {
    label: 'Plantejar i resoldre equacions',
    florence: [['F_2ESO_S11', 2], ['F_3ESO_S09', 2]],
    cb: [190, 21, 178, 87, 151, 175],
  },

  'sistemes': {
    label: 'Sistemes d\'equacions',
    florence: [['F_3ESO_S09', 3]],
    cb: [175, 87, 151, 21],
  },

  'identitats-notables': {
    label: 'Identitats notables',
    nota:  '(a+b)² vist com l\'àrea d\'un quadrat descompost: la demostració gràfica evita l\'error de repartir el quadrat.',
    florence: [['F_3ESO_S09', 3]],
    cb: [50, 65, 64, 132],
  },

  'equacio-2n-grau': {
    label: 'Equació de segon grau',
    florence: [['F_3ESO_S09', 2], ['F_3ESO_S10', 2]],
    cb: [50, 75, 74, 65],
  },

  'funcions': {
    label: 'Funcions: taula, gràfic i fórmula',
    nota:  'Les quatre representacions d\'una funció i el pas d\'una a l\'altra.',
    florence: [['F_3ESO_S10', 3], ['F_2ESO_S11', 3], ['F_3ESO_S01', 2]],
    cb: [24, 54, 170, 178, 176, 177, 56, 157, 125, 196, 123],
  },

  'funcio-afi': {
    label: 'Funció lineal i funció afí',
    florence: [['F_3ESO_S10', 3], ['F_2ESO_S11', 2]],
    cb: [56, 157, 54, 24, 178, 176, 177, 162, 170, 197],
  },

  'funcio-quadratica': {
    label: 'Funció quadràtica i paràbola',
    florence: [['F_3ESO_S10', 3], ['F_3ESO_S02', 2]],
    cb: [75, 74, 50, 143],
  },

  'proporcionalitat-inversa': {
    label: 'Magnituds inversament proporcionals',
    nota:  'Rectangles de la mateixa àrea: la mateixa exploració que fa Florence amb perímetre fix, girada.',
    florence: [['F_2ESO_S01', 2], ['F_2ESO_S11', 2]],
    cb: [165, 182, 195],
  },

  'lectura-grafics': {
    label: 'Llegir i interpretar gràfics',
    florence: [['F_2ESO_S05', 3], ['F_3ESO_S10', 2], ['F_3ESO_S05', 2]],
    cb: [58, 59, 155, 163, 123, 147, 93, 15, 110, 196, 1, 2, 197],
  },

  'geogebra': {
    label: 'Explorar amb GeoGebra',
    nota:  'Florence fa servir GeoGebra per moure una funció i veure què li passa a la gràfica.',
    florence: [['F_3ESO_S10', 3], ['F_3ESO_S02', 1]],
    cb: [75, 170, 24],
  },

  'divisibilitat': {
    label: 'Divisibilitat, múltiples i divisors',
    nota:  'A «Fent el préssec» la divisibilitat apareix com a condició del problema, no com a regla.',
    florence: [['F_2ESO_S09', 3]],
    cb: [19, 181, 51, 195],
  },

  'fraccions': {
    label: 'Fraccions com a part d\'un tot',
    florence: [['F_2ESO_S08', 3], ['F_2ESO_S09', 3]],
    cb: [198, 111, 112, 32, 185, 208, 94],
  },

  'fraccio-quantitat': {
    label: 'Fracció d\'una quantitat',
    florence: [['F_2ESO_S09', 3], ['F_2ESO_S08', 2]],
    cb: [32, 185, 195, 198, 208, 111],
  },

  'percentatges': {
    label: 'Percentatges',
    florence: [['F_2ESO_S03', 3], ['F_3ESO_S07', 3]],
    cb: [108, 110, 193, 207, 95, 85, 39, 40, 16, 171, 146, 117],
  },

  'percentatge-variacio': {
    label: 'Augments i disminucions percentuals',
    nota:  '+10 i +10% no són el mateix, i dos descomptes seguits no se sumen. És l\'error clàssic que ataca «Qui en dona més?».',
    florence: [['F_3ESO_S07', 3], ['F_2ESO_S03', 2]],
    cb: [153, 37, 193, 85, 86, 40, 68, 67],
  },

  'proporcionalitat': {
    label: 'Proporcionalitat i comparació de raons',
    florence: [['F_3ESO_S07', 2], ['F_2ESO_S03', 2]],
    cb: [194, 192, 184, 182, 174, 188, 186, 69, 141, 54],
  },

  'enters': {
    label: 'Nombres enters',
    florence: [['F_2ESO_S04', 2]],
    cb: [115, 199],
  },

  'potencies': {
    label: 'Potències',
    nota:  'Plegar el paper n vegades: 2ⁿ apareix com a recompte abans que com a notació.',
    florence: [['F_2ESO_S08', 3]],
    cb: [74, 143, 127, 65],
  },

  'arrel': {
    label: 'Arrel quadrada i quadrats perfectes',
    nota:  'Al geoplà, l\'àrea d\'un quadrat inclinat és 5 i el costat √5: l\'arrel apareix com una longitud, no com una tecla.',
    florence: [['F_3ESO_S02', 3]],
    cb: [133, 131, 74, 75],
  },

  'decimals': {
    label: 'Nombres decimals',
    florence: [['F_2ESO_S03', 1]],
    cb: [107, 192, 99],
  },

  'estimacio': {
    label: 'Estimar i aproximar',
    florence: [['F_2ESO_S05', 2]],
    cb: [99, 158, 218, 48],
  },

  'figures-planes': {
    label: 'Reconèixer i compondre figures planes',
    florence: [['F_2ESO_S06', 3], ['F_2ESO_S01', 1]],
    cb: [200, 105, 204, 167, 131, 96],
  },

  'perimetre': {
    label: 'Perímetre',
    nota:  'Florence hi arriba comparant perímetre i àrea: quan un creix, l\'altre no ha de créixer per força.',
    florence: [['F_2ESO_S01', 3], ['F_2ESO_S11', 2]],
    cb: [104, 114, 216, 89, 191, 183],
  },

  'area-figures': {
    label: 'Àrea de figures planes i composades',
    florence: [['F_2ESO_S01', 3], ['F_2ESO_S06', 2]],
    cb: [113, 215, 131, 105, 50, 132],
  },

  'area-escala': {
    label: 'Com creix l\'àrea quan creix el costat',
    nota:  'Si dupliques el costat l\'àrea es multiplica per 4. És l\'error més persistent de tota la geometria d\'ESO.',
    florence: [['F_2ESO_S06', 3], ['F_3ESO_S02', 2]],
    cb: [14, 132, 131, 127, 50, 81, 138],
  },

  'pitagores': {
    label: 'Teorema de Pitàgores',
    nota:  '«Quadrats inclinats» construeix a²+b²=c² des de l\'àrea al geoplà: el teorema surt com a patró d\'una taula, no com a fórmula donada.',
    florence: [['F_3ESO_S02', 3]],
    cb: [133, 164, 131, 132, 74],
  },

  'semblanca': {
    label: 'Semblança i teorema de Tales',
    florence: [['F_3ESO_S05', 3], ['F_2ESO_S06', 2]],
    cb: [28, 14, 81, 132, 127, 138],
  },

  'circumferencia': {
    label: 'Circumferència i cercle',
    florence: [['F_2ESO_S02', 1]],
    cb: [166, 137, 138],
  },

  'angles': {
    label: 'Angles i la seva mesura',
    florence: [['F_3ESO_S08', 1]],
    cb: [166, 205, 167],
  },

  'simetria': {
    label: 'Simetries i moviments al pla',
    florence: [['F_2ESO_S04', 2], ['F_3ESO_S08', 2]],
    cb: [204, 205, 167, 105],
  },

  'coordenades': {
    label: 'Coordenades i moviments en graella',
    florence: [['F_2ESO_S07', 3], ['F_2ESO_S11', 2]],
    cb: [103, 119, 120, 102, 121, 124],
  },

  'escala-plans': {
    label: 'Escala en plànols i mapes',
    florence: [['F_2ESO_S07', 2], ['F_3ESO_S02', 1]],
    cb: [102, 81, 14, 96, 165, 183],
  },

  'unitats': {
    label: 'Magnituds, unitats i canvis d\'unitat',
    florence: [['F_3ESO_S01', 2]],
    cb: [165, 183, 99, 218],
  },

  'poliedres': {
    label: 'Poliedres i desenvolupaments plans',
    nota:  'El pas 3D→2D i tornar. Les dues sessions «Podem construir-ho?» de 2n i 3r són la mateixa idea a dos nivells.',
    florence: [['F_2ESO_S02', 3], ['F_3ESO_S08', 3]],
    cb: [126, 80, 61, 62, 63, 42, 191, 144],
  },

  'cos-revolucio': {
    label: 'Cossos de revolució',
    florence: [['F_2ESO_S02', 2]],
    cb: [42, 137, 48],
  },

  'volum': {
    label: 'Volum de cossos',
    florence: [['F_3ESO_S01', 3]],
    cb: [137, 48, 160, 161, 127, 138, 130],
  },

  'visualitzacio-3d': {
    label: 'Visualització espacial en 3D',
    florence: [['F_2ESO_S02', 2], ['F_3ESO_S01', 2]],
    cb: [130, 129, 144, 161, 143],
  },

  'estadistica-taules': {
    label: 'Taules i gràfics estadístics',
    florence: [['F_2ESO_S05', 3], ['F_3ESO_S05', 2]],
    cb: [109, 93, 206, 210, 15, 173, 187, 94, 1, 2],
  },

  'centralitzacio': {
    label: 'Mitjana, mediana i dispersió',
    florence: [['F_3ESO_S06', 3], ['F_2ESO_S05', 2]],
    cb: [118, 217, 35, 17, 41, 172, 158, 159],
  },

  'pensament-critic': {
    label: 'Pensament crític amb dades',
    nota:  'Les dades no parlen soles: «El cas del riu» i «Fake news» treballen què s\'hi pot i què no s\'hi pot concloure.',
    florence: [['F_2ESO_S05', 3], ['F_3ESO_S06', 3]],
    cb: [210, 173, 188, 174, 147],
  },

  'probabilitat': {
    label: 'Probabilitat',
    florence: [['F_2ESO_S010', 3], ['F_3ESO_S11', 3]],
    cb: [128, 18, 33, 135, 78, 79, 209, 180, 189, 76, 77, 142, 43, 20, 44, 45],
  },

  'combinatoria': {
    label: 'Combinatòria',
    florence: [['F_3ESO_S03', 2], ['F_3ESO_S11', 2]],
    cb: [179, 116, 211, 180],
  },
};

const CONTINGUT_PIPELINE = {

  /* ═══ 1r d'ESO ═══ */

  '1ESO|comprensio/comprensio-lectora': {   // Comprensió lectora
    1: ['lectura-enunciats'],                         // Adquisició de vocabulari específic
    2: ['lectura-enunciats', 'estadistica-taules'],   // Obtenció d'informació en textos d'àmbit matemàtic
    3: ['patrons', 'generalitzacio'],                 // Expressió algebraica de patrons
    4: ['lectura-enunciats', 'resolucio-problemes'],  // Resolució de problemes a partir d'un context (enunciats CB)
  },

  '1ESO|numeric/nombres-naturals': {   // Nombres naturals
    4: ['potencies'],  // Potències de base i exponents naturals
  },

  '1ESO|numeric/divisibilitat': {   // Divisibilitat
    1: ['divisibilitat'],  // Divisibilitat
    2: ['divisibilitat'],  // Múltiples
    3: ['divisibilitat'],  // Divisors
    4: ['divisibilitat'],  // Criteris de divisibilitat
    5: ['divisibilitat'],  // Nombres primers i nombres compostos
    6: ['divisibilitat'],  // Factorització en nombres primers
    7: ['divisibilitat'],  // MCD i mcm
  },

  '1ESO|numeric/nombres-decimals': {   // Nombres decimals
    2: ['decimals'],   // Ordre dels nombres decimals
    3: ['decimals'],   // Operacions amb nombres decimals
    4: ['estimacio'],  // Aproximació per truncament i per arrodoniment
  },

  '1ESO|numeric/fraccions': {   // Fraccions
    1: ['fraccions'],          // Definició i representació d'una fracció
    2: ['fraccions'],          // Fracció pròpia i impròpia
    3: ['fraccions'],          // Fraccions equivalents
    4: ['fraccions'],          // Simplificació de fraccions. Fracció irreductible.
    5: ['fraccions'],          // Representació d'una fracció a la recta numèrica
    6: ['fraccions'],          // Comparació de fraccions (gràficament)
    7: ['fraccions'],          // Suma i resta de fraccions amb mateix denominador
    8: ['fraccio-quantitat'],  // Fracció d'un nombre
  },

  '1ESO|numeric/fraccions-decimals': {   // Fraccions i decimals
    1: ['fraccions', 'percentatges'],  // Expressar una fracció com un nombre decimal
    2: ['fraccions', 'percentatges'],  // Donat un decimal, expressar-lo com una fracció
  },

  '1ESO|numeric/arrel-quadrada': {   // Arrel quadrada
    1: ['arrel', 'potencies'],  // Quadrats perfectes
    2: ['arrel'],               // Arrel quadrada exacta i no exacta
  },

  '1ESO|espacial/elements-geometrics': {   // Elements geomètrics al pla
    1: ['figures-planes'],  // Punt, segment, recta, semirecta, circumferència, angle
    4: ['circumferencia'],  // Vocabulari en una circumferència (radi, diàmetre, …)
  },

  '1ESO|espacial/angles': {   // Angles
    1: ['angles'],  // Angles que formen dues rectes secants
    2: ['angles'],  // Representació d'angles convexos i còncaus
    3: ['angles'],  // Mesura d'angles amb el transportador
    4: ['angles'],  // Angles complementaris i suplementaris
  },

  '1ESO|espacial/poligons': {   // Polígons
    1: ['figures-planes'],  // Vocabulari: vèrtex, costat, diagonal, angle intern · triang…
    2: ['figures-planes'],  // Definició de polígon regular
  },

  '1ESO|espacial/triangles': {   // Triangles
    1: ['figures-planes'],  // Condició per poder construir un triangle
    2: ['angles'],          // Suma dels 3 angles d'un triangle
    3: ['figures-planes'],  // Classificació de triangles segons angles i costats
  },

  '1ESO|espacial/geogebra': {   // Geogebra
    1: ['geogebra'],  // Es treballen continguts explicats, amb Geogebra
  },

  '1ESO|espacial/fotomatiques': {   // Fotomàtiques
    1: ['figures-planes', 'simetria'],  // Estudi de fotografies matemàtiques publicades al centre.
  },

  '1ESO|mesura/magnituds-unitats': {   // Magnituds i unitats
    1: ['unitats'],                  // Mesures de longitud, massa i capacitat
    2: ['unitats', 'area-figures'],  // Mesures de superfície
  },

  '1ESO|mesura/escala': {   // Escala
    1: ['escala-plans'],  // Escales en un plànol
    2: ['escala-plans'],  // Escales en un mapa
    3: ['escala-plans'],  // Tria adequada de l'escala per a representar
  },

  '1ESO|mesura/calcul-perimetres': {   // Càlcul de perímetres
    1: ['perimetre'],                    // Definició de perímetre
    2: ['perimetre'],                    // Càlcul del perímetre (quadrat, rectangle, polígon regular)
    3: ['perimetre', 'circumferencia'],  // Càlcul del perímetre d'una circumferència
  },

  '1ESO|mesura/calcul-arees': {   // Càlcul d'àrees
    1: ['area-figures', 'unitats'],         // Definició de superfície. Visualització d'un metre quadrat
    2: ['area-figures'],                    // Càlcul de l'àrea (quadrat, rectangle, triangle)
    3: ['area-figures', 'circumferencia'],  // Càlcul de l'àrea d'un cercle
    4: ['area-figures'],                    // Càlcul de l'àrea de figures que es poden descomposar
  },

  '1ESO|algebraic/llenguatge-algebraic': {   // Llenguatge algebraic
    1: ['llenguatge-algebraic', 'generalitzacio'],  // Traduir al llenguatge algebraic un enunciat (edat d'aquí 5…
  },

  '1ESO|algebraic/grafics-taules': {   // Gràfics i taules
    1: ['lectura-grafics', 'estadistica-taules', 'patrons'],  // Interpretació de gràfics i taules. Buidat de dades i deducc…
  },

  /* ═══ 2n d'ESO ═══ */

  '2ESO|comprensio/comprensio-lectora': {   // Comprensió lectora
    1: ['lectura-enunciats'],                         // Adquisició de vocabulari específic
    2: ['lectura-enunciats', 'estadistica-taules'],   // Obtenció d'informació en textos d'àmbit matemàtic
    3: ['patrons', 'generalitzacio'],                 // Expressió algebraica de patrons
    4: ['lectura-enunciats', 'resolucio-problemes'],  // Resolució de problemes a partir d'un context
  },

  '2ESO|numeric/divisibilitat': {   // Divisibilitat
    1: ['divisibilitat'],  // Divisibilitat, múltiples, divisors
    2: ['divisibilitat'],  // Nombres primers i compostos. Màxim comú divisor
    3: ['divisibilitat'],  // Mínim comú múltiple
  },

  '2ESO|numeric/fraccions': {   // Fraccions
    1: ['fraccions'],                   // Representació de fraccions
    2: ['fraccio-quantitat'],           // Fracció d'un nombre
    3: ['fraccions'],                   // Suma i resta de fraccions amb mateix denominador
    4: ['fraccions', 'divisibilitat'],  // Fraccions equivalents. Reducció a comú denominador
    5: ['fraccions'],                   // Suma i resta de fraccions
    6: ['fraccio-quantitat'],           // Multiplicació de fraccions
    7: ['fraccio-quantitat'],           // Divisió de fraccions
  },

  '2ESO|numeric/percentatges': {   // Percentatges
    1: ['percentatges', 'fraccions'],           // Relació entre fracció, decimal i percentatge
    2: ['percentatges', 'estadistica-taules'],  // Representació gràfica d'un percentatge
    3: ['percentatges'],                        // Càlcul de percentatges menors o iguals que 100%
    4: ['percentatge-variacio'],                // Càlcul de percentatges majors que 100%
  },

  '2ESO|numeric/nombres-enters': {   // Nombres enters
    1: ['enters'],  // Representació dels enters a la recta real
    2: ['enters'],  // Oposat d'un nombre enter. Valor absolut
    3: ['enters'],  // Ordenar nombres enters
    4: ['enters'],  // Suma d'enters
    5: ['enters'],  // Resta d'enters
    6: ['enters'],  // Multiplicació d'enters
    7: ['enters'],  // Divisió d'enters
  },

  '2ESO|numeric/potencies': {   // Potències
    1: ['potencies'],  // Potències de base i exponents naturals
    2: ['potencies'],  // Potències de base entera i exponent natural
    3: ['potencies'],  // Potències de base racional i exponent natural
  },

  '2ESO|espacial/vocabulari': {   // Vocabulari
    1: ['figures-planes'],                 // Vocabulari al pla: punt, segment, vèrtex, costat, polígon,…
    2: ['poliedres', 'visualitzacio-3d'],  // Vocabulari a l'espai: vèrtex, aresta, cara, poliedre, cos d…
  },

  '2ESO|espacial/poligons': {   // Polígons
    1: ['figures-planes'],                  // Vocabulari: triangle, quadrilàter, pentàgon, hexàgon…
    2: ['figures-planes'],                  // Triangles: classificació segons angles i costats
    3: ['figures-planes', 'area-figures'],  // Quadrilàters: paral·lelogram (rombe, rectangle, quadrat), t…
    4: ['figures-planes'],                  // Polígons convexos i còncaus
    5: ['figures-planes'],                  // Polígons regulars
  },

  '2ESO|espacial/triangles': {   // Triangles
    1: ['area-figures'],                      // Les 3 altures d'un triangle qualsevol. Peu d'altura.
    2: ['pitagores'],                         // Triangle rectangle: angle recte, catets, hipotenusa
    3: ['pitagores'],                         // Teorema de Pitàgores
    4: ['pitagores'],                         // Teorema de l'altura
    5: ['pitagores'],                         // Resolució de triangles rectangles, coneguts 2 costats
    6: ['pitagores', 'resolucio-problemes'],  // Resolució de problemes aplicant el teorema de Pitàgores
  },

  '2ESO|espacial/circumferencia-cercle': {   // Circumferència i cercle
    1: ['circumferencia'],                    // Vocabulari en una circumferència (radi, diàmetre, …)
    2: ['angles', 'circumferencia'],          // Arc capaç i arc central
    3: ['circumferencia', 'figures-planes'],  // Circumferència i polígon regular inscrit
  },

  '2ESO|espacial/geogebra': {   // Geogebra
    1: ['geogebra'],  // S'implementen conceptes treballats amb Geogebra
  },

  '2ESO|espacial/poliedres': {   // Poliedres
    1: ['poliedres'],  // Desenvolupament pla de poliedres
    2: ['poliedres'],  // Fórmula d'Euler per a poliedres convexos
    3: ['poliedres'],  // Poliedres regulars: tetraedre, cub, octaedre, dodecaedre, i…
  },

  '2ESO|espacial/cossos-revolucio': {   // Cossos de revolució
    1: ['cos-revolucio', 'volum'],      // Cilindre. Base i altura.
    2: ['cos-revolucio'],               // Con. Base, altura i generatriu.
    3: ['cos-revolucio', 'poliedres'],  // Desenvolupament pla de cilindre i de con
    4: ['cos-revolucio'],               // Esfera
  },

  '2ESO|mesura/perimetres-arees-pla': {   // Perímetres i àrees al pla
    1: ['perimetre'],                       // Càlcul del perímetre d'un polígon
    2: ['perimetre', 'circumferencia'],     // Càlcul del perímetre d'una circumferència
    3: ['area-figures'],                    // Càlcul de l'àrea d'un quadrat, rectangle, triangle
    4: ['area-figures'],                    // Càlcul de l'àrea d'un rombe
    5: ['area-figures'],                    // Càlcul de l'àrea d'un paral·lelogram
    6: ['area-figures'],                    // Càlcul de l'àrea d'un trapezi
    7: ['area-figures', 'circumferencia'],  // Càlcul de l'àrea d'un cercle
  },

  '2ESO|mesura/arees-volums-espai': {   // Àrees i volums a l'espai
    1: ['volum', 'unitats'],           // Construcció d'1 metre cúbic
    2: ['volum', 'visualitzacio-3d'],  // Càlcul de l'àrea de les cares i càlcul del volum d'un cub,…
  },

  '2ESO|algebraic/pla-cartesia': {   // El pla cartesià
    1: ['coordenades'],              // Vocabulari: pla cartesià, coordenades d'un punt, eix d'absc…
    2: ['coordenades', 'funcions'],  // Representació de punts al pla cartesià (4 quadrants)
  },

  '2ESO|algebraic/proporcionalitat': {   // Proporcionalitat
    1: ['proporcionalitat', 'funcio-afi'],  // Magnituds directament proporcionals y=mx. Funció lineal. Re…
  },

  '2ESO|algebraic/llenguatge-algebraic': {   // Llenguatge algebraic
    1: ['generalitzacio', 'patrons'],  // Patrons geomètrics: traducció al llenguatge algebraic
    2: ['llenguatge-algebraic'],       // Traducció al llenguatge algebraic d'un enunciat
    3: ['equacions'],                  // Vocabulari: equació, identitat, grau equació, membres, term…
    4: ['equacions'],                  // Solució d'una equació. Comprovar la solució
  },

  '2ESO|algebraic/equacio-1r-grau': {   // Equació de 1r grau
    1: ['equacions'],                          // ax=b; ax+b=c
    2: ['equacions'],                          // Resolució d'una equació agrupant termes i aplicant propieta…
    3: ['equacions', 'llenguatge-algebraic'],  // Resolució d'un enunciat plantejant una equació de 1r grau
  },

  '2ESO|estocastic/variables-estadistiques': {   // Variables estadístiques
    1: ['estadistica-taules'],                     // Població i mostra
    2: ['estadistica-taules'],                     // Variables quantitatives i qualitatives
    3: ['estadistica-taules'],                     // Variables quantitatives discretes i contínues
    4: ['estadistica-taules', 'percentatges'],     // Taula estadística: freqüència absoluta, relativa, percentatge
    5: ['estadistica-taules', 'lectura-grafics'],       // Gràfic de barres
    6: ['estadistica-taules', 'percentatges', 'pensament-critic'],  // Diagrama de sectors
  },

  '2ESO|estocastic/mesures-centralitzacio': {   // Mesures de centralització
    1: ['centralitzacio'],  // La mediana i els quartils
    2: ['centralitzacio'],  // La mitjana aritmètica
    3: ['centralitzacio'],  // La mitjana aritmètica ponderada
  },

  /* ═══ 3r d'ESO ═══ */

  '3ESO|comprensio/comprensio-lectora': {   // Comprensió lectora
    1: ['lectura-enunciats'],                         // Adquisició de vocabulari específic
    2: ['lectura-enunciats', 'estadistica-taules'],   // Obtenció d'informació en textos d'àmbit matemàtic
    3: ['patrons', 'generalitzacio'],                 // Expressió algebraica de patrons
    4: ['lectura-enunciats', 'resolucio-problemes'],  // Resolució de problemes a partir d'un context
  },

  '3ESO|numeric/nombres-enters': {   // Nombres enters
    1: ['enters'],     // Operacions combinades amb nombres enters
    2: ['potencies'],  // Potència de base entera i exponent natural
    3: ['potencies'],  // Potència amb exponent negatiu, amb exponent zero
  },

  '3ESO|numeric/notacio-cientifica': {   // Notació científica
    1: ['potencies'],  // Potències de base 10, amb exponent positiu o negatiu
    2: ['estimacio'],  // Aproximar nombres i expressar en notació científica
  },

  '3ESO|espacial/semblanca': {   // Semblança
    1: ['semblanca'],                         // Teorema de Tales
    2: ['semblanca'],                         // Triangles en posició de Tales. Triangles semblants
    3: ['semblanca', 'resolucio-problemes'],  // Resolució de problemes emprant semblança de triangles
    4: ['semblanca', 'area-escala'],          // Figures semblants. Raó de semblança (k≥1, k<1, k<0)
  },

  '3ESO|espacial/moviments-pla': {   // Moviments al pla
    1: ['coordenades'],              // Mòdul, direcció i sentit en un vector lliure
    2: ['coordenades'],              // Coordenades d'un vector al pla cartesià. v=AB=B−A
    3: ['simetria', 'coordenades'],  // Translació determinada per un vector
    4: ['simetria'],                 // Gir determinat pel centre de gir i l'angle
    5: ['simetria'],                 // Simetria axial
    6: ['simetria'],                 // Simetria central
  },

  '3ESO|mesura/semblanca-mesura': {   // Semblança (mesures)
    1: ['area-escala', 'semblanca'],  // Càlcul de perímetres i àrees de figures semblants
    2: ['area-escala'],               // Raó entre perímetres de figures semblants i raó entre àrees…
  },

  '3ESO|algebraic/funcio-lineal': {   // Funció lineal i funció afí
    1: ['funcio-afi'],  // Representació gràfica de y=mx i de y=mx+n
    2: ['funcio-afi'],  // Pendent de la recta, ordenada a l'origen
    3: ['funcio-afi'],  // Rectes paral·leles amb mateix pendent. Recta paral·lela a l…
    4: ['funcio-afi'],  // Equació de la recta que passa per dos punts, conegudes les…
    5: ['funcio-afi'],  // Equació de la recta conegut el pendent i també les coordena…
  },

  '3ESO|algebraic/llenguatge-algebraic': {   // Llenguatge algebraic
    1: ['llenguatge-algebraic'],  // Traducció al llenguatge algebraic d'un enunciat
    2: ['equacions'],             // Vocabulari: equació, identitat, grau equació, membres, term…
    3: ['equacions'],             // Solució d'una equació. Comprovar la solució
  },

  '3ESO|algebraic/equacio-1r-grau': {   // Equació de 1r grau
    1: ['equacions'],  // ax+b=c
    2: ['equacions'],  // Resolució d'equacions agrupant termes, aplicant distributiv…
  },

  '3ESO|algebraic/sistema-equacions': {   // Sistema d'equacions de 1r grau
    1: ['sistemes', 'funcio-afi'],  // Resolució gràfica d'un sistema d'equacions
    2: ['sistemes', 'funcio-afi'],  // Nombre de solucions d'un sistema d'equacions i nombre de pu…
    3: ['sistemes'],                // Resolució d'un sistema d'equacions: mètode substitució
  },

  '3ESO|algebraic/estudi-funcio': {   // Estudi d'una funció
    1: ['funcions'],                     // Definició de funció. Exemples de no funció
    2: ['funcions'],                     // Variable independent i variable dependent
    3: ['funcions'],                     // Formes d'expressar una funció: text, taula de valors, gràfi…
    4: ['funcions'],                     // Domini d'una funció
    5: ['lectura-grafics', 'funcions'],  // Creixement i decreixement. Intervals de nombres reals
    6: ['lectura-grafics'],              // Màxims i mínims relatius i també absoluts
    7: ['funcions', 'funcio-afi'],       // Punts de tall de la gràfica amb eixos de coordenades
  },

  '3ESO|estocastic/experiments-aleatoris': {   // Experiments aleatoris
    1: ['probabilitat'],              // Espai mostral
    2: ['probabilitat'],              // Esdeveniment elemental
    3: ['probabilitat'],              // Esdeveniment segur, impossible, contrari a un altre
    4: ['probabilitat'],              // Diagrames de Venn
    5: ['recompte', 'combinatoria'],  // Tècniques de recompte: taules i diagrames d'arbre
    6: ['probabilitat'],              // Probabilitat d'un esdeveniment
    7: ['probabilitat'],              // Regla de Laplace
  },

  /* ═══ 4t d'ESO ═══ */

  '4ESO|comprensio/comprensio-lectora': {   // Comprensió lectora
    1: ['lectura-enunciats'],                         // Adquisició de vocabulari específic
    2: ['lectura-enunciats', 'estadistica-taules'],   // Obtenció d'informació en textos d'àmbit matemàtic
    3: ['patrons', 'generalitzacio'],                 // Expressió algebraica de patrons
    4: ['lectura-enunciats', 'resolucio-problemes'],  // Resolució de problemes a partir d'un context
  },

  '4ESO|numeric/nombres-reals': {   // El conjunt de nombres reals
    3: ['percentatges', 'fraccions'],  // Relació entre fracció, decimal i percentatge
    4: ['potencies'],                  // Notació i convencions en escriure potències: exponent negat…
    5: ['arrel'],                      // Nombres que no són reals. Relació amb l'equació de segon gr…
  },

  '4ESO|numeric/percentatge': {   // Percentatge
    1: ['estadistica-taules', 'percentatges', 'pensament-critic'],  // Interpretació d'un diagrama de sectors
    2: ['centralitzacio'],                            // Mitjana aritmètica ponderada
    3: ['percentatge-variacio'],                      // Augments i disminucions percentuals
    4: ['percentatge-variacio'],                      // Càlcul de l'IVA
    5: ['percentatge-variacio', 'proporcionalitat'],  // Interès en un crèdit
  },

  '4ESO|espacial/repas-trigonometria': {   // Repàs previ a la Trigonometria
    1: ['circumferencia', 'angles'],  // Circumferència: radi, centre, angle central
    2: ['pitagores'],                 // Triangles rectangles: vocabulari. Teorema de Pitàgores.
    3: ['semblanca'],                 // Triangles semblants: propietats que compleixen els angles r…
    4: ['coordenades'],               // Signe de les coordenades d'un punt en funció del quadrant
  },

  '4ESO|mesura/trigonometria': {   // Trigonometria
    2: ['circumferencia'],                    // Circumferència goniomètrica
    5: ['angles'],                            // Raons trigonomètriques d'angles complementaris
    8: ['pitagores', 'resolucio-problemes'],  // Resolució de problemes i de triangles amb trigonometria
  },

  '4ESO|algebraic/llenguatge-algebraic': {   // Llenguatge algebraic
    1: ['generalitzacio', 'llenguatge-algebraic'],  // Expressar en llenguatge algebraic relacions o patrons mostr…
    2: ['identitats-notables'],                     // Demostració d'identitats notables, de forma gràfica i manip…
  },

  '4ESO|algebraic/equacio-2n-grau': {   // Equació de 2n grau
    1: ['equacio-2n-grau', 'arrel'],  // Resolució de l'equació x²=k
    2: ['equacio-2n-grau'],           // Resolució de l'equació (x−a)²=k
    3: ['equacio-2n-grau'],           // Resolució de l'equació (ax−b)(cx−d)=0
    4: ['equacio-2n-grau'],           // Nombre de solucions que pot tenir una equació de 2n grau
    5: ['equacio-2n-grau'],           // Resolució d'una equació de 2n grau complerta
    6: ['equacio-2n-grau'],           // Discriminant d'una equació de 2n grau
  },

  '4ESO|algebraic/funcio-quadratica': {   // Funció quadràtica
    1: ['funcio-quadratica'],                     // Representació gràfica de y=ax²
    2: ['funcio-quadratica'],                     // Representació gràfica de y=ax²+c
    3: ['funcio-quadratica', 'equacio-2n-grau'],  // Punts de tall amb els eixos de coordenades de la gràfica de…
    4: ['funcio-quadratica'],                     // Vocabulari associat a la paràbola: branques, vèrtex, còncav…
    5: ['funcio-quadratica'],                     // Càlcul de les coordenades del vèrtex de la paràbola
  },

  '4ESO|algebraic/hiperbola': {   // Magnituds inv. proporcionals · Hipèrbola
    1: ['proporcionalitat-inversa'],                  // Definició de magnituds inversament proporcionals
    2: ['proporcionalitat-inversa', 'area-figures'],  // Exemple: donada una àrea A=24, trobar tots els rectangles q…
    3: ['proporcionalitat-inversa', 'funcions'],      // Representació de la hipèrbola, a partir de y=k/x, segons k>…
  },

  '4ESO|algebraic/funcio-exp-log': {   // Funció exponencial i logarítmica
    1: ['funcions', 'potencies'],        // Funció exponencial: contextos on apareix. Representació grà…
    2: ['lectura-grafics', 'funcions'],  // Estudi d'asímptotes i del creixement/decreixement
  },

  '4ESO|estocastic/variable-estadistica': {   // Variable estadística quantitativa
    1: ['estadistica-taules'],  // Variables quantitatives discretes
    2: ['estadistica-taules'],  // Variables quantitatives contínues. Marca de classe
    3: ['centralitzacio', 'pensament-critic'],  // Paràmetres de centralització. Paràmetres de dispersió.
  },

  '4ESO|estocastic/combinatoria': {   // Combinatòria
    1: ['combinatoria', 'recompte'],  // Variacions
    2: ['combinatoria', 'recompte'],  // Permutacions. Factorial d'un nombre
    3: ['combinatoria'],              // Variacions amb repetició
    4: ['combinatoria'],              // Combinacions. Triangle de Tartaglia. Binomi de Newton
  },

  '4ESO|estocastic/probabilitat': {   // Probabilitat
    1: ['probabilitat'],  // Diagrames de Venn
    2: ['probabilitat'],  // Regla de Laplace per a esdeveniments equiprobables
    3: ['probabilitat'],  // Probabilitat condicionada
    4: ['probabilitat'],  // Probabilitat composta
    5: ['probabilitat'],  // Llei dels grans nombres
  },
};
