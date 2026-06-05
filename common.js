/* common.js — Utilitats compartides
 * Carregat per index.html, afegir-material.html, banc-cb.html,
 * eliminar-curs.html i extreu-json.html amb <script src="common.js">.
 * Cap dependència externa; no requereix pas de compilació.
 */

/* ─── ESCAPAMENT HTML ────────────────────────────────────────────── */
function escHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* ─── NORMALITZACIÓ (strip accents, lowercase, trim) ────────────── */
function normalize(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ─── SLUGIFY ────────────────────────────────────────────────────── */
function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/* ─── GRUPS DE FILTRE ────────────────────────────────────────────── */
/* Camps: key (clau d'estat), label (nom UI), field (camp del fitxer),
 *        multi (boolean), required (camp obligatori, usat per l'editor). */
const FILTER_GROUPS = [
  { key: 'course',     label: 'Curs',             field: 'courses',    multi: true,  required: false },
  { key: 'origin',     label: 'Origen',           field: 'origin',     multi: false, required: false },
  { key: 'math_sense', label: 'Sentit matemàtic', field: 'math_sense', multi: false, required: false },
  { key: 'format',     label: 'Format',           field: 'format',     multi: false, required: true  },
  { key: 'type',       label: 'Tipus',            field: 'type',       multi: false, required: false },
  { key: 'activity',   label: 'Activitat',        field: 'activities', multi: true,  required: false },
];

/* Cursos de cada etapa (usat per index.html per al filtre d'umbrella) */
const ESO_COURSES  = ['1ESO','2ESO','3ESO','4ESO'];
const BATX_COURSES = ['1Bat','2Bat'];

/* ─── VOCABULARI DE RESERVA ─────────────────────────────────────── */
/* Usat per extreu-json.html quan no hi ha manifest carregat.
 * Les pàgines que en necessitin una còpia mutable han de fer:
 *   let VOCAB  = Object.assign({}, FALLBACK_VOCAB);
 *   let LABELS = Object.assign({}, FALLBACK_LABELS);
 */
const FALLBACK_VOCAB = {
  origin: ["miquel-tarradell","florence","nrich","geogebra","bogdan","fem-matematiques","mmaca","g-morales","ins-gelida","reptes-mates"],
  format: ["pdf","doc"],
  course: ["1ESO","2ESO","3ESO","4ESO","1Bat","2Bat","ESO","Bat","primaria","SIEI","aula-acollida"],
  math_sense: ["algebraic","mesura","espacial","estocastic","numeric","analitic","socio-emocional"],
  activity: ["nombres-naturals","nombres-enters","divisibilitat","fraccions","nombres-decimals","nombres-racionals","potencies","arrels-radicals","notacio-cientifica","percentatges","proporcionalitat","interes-simple-compost","llenguatge-algebraic","monomis-polinomis","identitats-notables","factoritzacio","equacions","equacions-segon-grau","sistemes-equacions","inequacions","figures-planes","poligons","arees-perimetres","pitagores","tales","semblanca","cossos-geometrics","volums-arees-cossos","moviments-pla","geometria-pla-cartesia","concepte-funcio","funcio-lineal","recta-afi","funcio-quadratica","creixement-decreixement","trigonometria","triangles-rectangles","estadistica-descriptiva","mesures-centralitzacio","mesures-dispersio","taules-grafics-estadistics","probabilitat-basica","combinatoria","nombres-reals","nombres-complexos","logaritmes-exponencials","successions","progressions","identitats-trigonometriques","equacions-trigonometriques","sinus-cosinus","funcions-trigonometriques","vectors-pla","geometria-analitica-pla","rectes-pla","coniques","funcio-exponencial-logaritmica","funcions-racionals","funcio-valor-absolut","funcions-trossos","limits","continuitat","asimptotes","estudi-funcio","derivades","regla-cadena","derivades-successives","aplicacions-derivada","optimitzacio","integrals","metodes-integracio","integral-definida","calcul-arees","matrius","determinants","sistemes-lineals-gauss","rouche-frobenius","vectors-espai","producte-escalar","producte-vectorial-mixt","rectes-plans-espai","distancies-angles","probabilitat-condicionada","teorema-bayes","variables-aleatories","distribucio-binomial","distribucio-normal","inferencia-estadistica","contrast-hipotesis"],
  type: ["exercici","exercici-solucions","dossier","examen","examen-recuperacio-trimestral","examen-recuperacio-global","teoria","examen-estructura","examen-correccio"]
};

const FALLBACK_LABELS = {
  "miquel-tarradell":"Miquel Tarradell","florence":"Florence","nrich":"NRICH","geogebra":"Geogebra","bogdan":"Bogdan","fem-matematiques":"Fem Mates","mmaca":"MMACA","g-morales":"G.Morales","ins-gelida":"INS Gelida","reptes-mates":"Reptes wsp","pdf":"PDF","doc":"Google Doc","1ESO":"1r ESO","2ESO":"2n ESO","3ESO":"3r ESO","4ESO":"4t ESO","1Bat":"1r Bat","2Bat":"2n Bat","ESO":"ESO","Bat":"Bat","primaria":"Primària","SIEI":"SIEI","aula-acollida":"Aula d'acollida","algebraic":"Algebraic","mesura":"Mesura","espacial":"Espacial","estocastic":"Estocàstic","numeric":"Numèric","analitic":"Analític","socio-emocional":"Socioemocional","nombres-naturals":"Nombres naturals","nombres-enters":"Nombres enters","divisibilitat":"Divisibilitat","fraccions":"Fraccions","nombres-decimals":"Nombres decimals","nombres-racionals":"Nombres racionals","potencies":"Potències","arrels-radicals":"Arrels i radicals","notacio-cientifica":"Notació científica","percentatges":"Percentatges","proporcionalitat":"Proporcionalitat","interes-simple-compost":"Interès simple i compost","llenguatge-algebraic":"Llenguatge algebraic","monomis-polinomis":"Monomis i polinomis","identitats-notables":"Identitats notables","factoritzacio":"Factorització","equacions":"Equacions","equacions-segon-grau":"Equacions de segon grau","sistemes-equacions":"Sistemes d'equacions","inequacions":"Inequacions","figures-planes":"Figures planes","poligons":"Polígons","arees-perimetres":"Àrees i perímetres","pitagores":"Teorema de Pitàgores","tales":"Teorema de Tales","semblanca":"Semblança","cossos-geometrics":"Cossos geomètrics","volums-arees-cossos":"Volums i àrees de cossos","moviments-pla":"Moviments al pla","geometria-pla-cartesia":"Geometria al pla cartesià","concepte-funcio":"Concepte de funció","funcio-lineal":"Funció lineal","recta-afi":"Recta afí","funcio-quadratica":"Funció quadràtica","creixement-decreixement":"Creixement i decreixement","trigonometria":"Trigonometria","triangles-rectangles":"Resolució de triangles rectangles","estadistica-descriptiva":"Estadística descriptiva","mesures-centralitzacio":"Mesures de centralització","mesures-dispersio":"Mesures de dispersió","taules-grafics-estadistics":"Taules i gràfics estadístics","probabilitat-basica":"Probabilitat bàsica","combinatoria":"Combinatòria","nombres-reals":"Nombres reals","nombres-complexos":"Nombres complexos","logaritmes-exponencials":"Logaritmes i exponencials","successions":"Successions","progressions":"Progressions aritmètiques i geomètriques","identitats-trigonometriques":"Identitats trigonomètriques","equacions-trigonometriques":"Equacions trigonomètriques","sinus-cosinus":"Teorema del sinus i del cosinus","funcions-trigonometriques":"Funcions trigonomètriques","vectors-pla":"Vectors al pla","geometria-analitica-pla":"Geometria analítica al pla","rectes-pla":"Rectes al pla","coniques":"Còniques","funcio-exponencial-logaritmica":"Funció exponencial i logarítmica","funcions-racionals":"Funcions racionals","funcio-valor-absolut":"Funció valor absolut","funcions-trossos":"Funcions a trossos","limits":"Límits de funcions","continuitat":"Continuïtat","asimptotes":"Asímptotes","estudi-funcio":"Estudi de funció","derivades":"Derivades","regla-cadena":"Regla de la cadena","derivades-successives":"Derivades successives","aplicacions-derivada":"Aplicacions de la derivada","optimitzacio":"Optimització","integrals":"Integrals","metodes-integracio":"Mètodes d'integració","integral-definida":"Integral definida","calcul-arees":"Càlcul d'àrees","matrius":"Matrius","determinants":"Determinants","sistemes-lineals-gauss":"Sistemes lineals (Gauss)","rouche-frobenius":"Teorema de Rouché-Frobenius","vectors-espai":"Vectors a l'espai","producte-escalar":"Producte escalar","producte-vectorial-mixt":"Producte vectorial i mixt","rectes-plans-espai":"Rectes i plans a l'espai","distancies-angles":"Distàncies i angles","probabilitat-condicionada":"Probabilitat condicionada","teorema-bayes":"Teorema de Bayes","variables-aleatories":"Variables aleatòries","distribucio-binomial":"Distribució binomial","distribucio-normal":"Distribució normal","inferencia-estadistica":"Inferència estadística","contrast-hipotesis":"Contrast d'hipòtesis","exercici":"Exercici","exercici-solucions":"Exercici amb solucions","dossier":"Dossier","examen":"Examen","examen-recuperacio-trimestral":"Recuperació trimestral","examen-recuperacio-global":"Recuperació global","teoria":"Teoria","examen-estructura":"Estructura d'examen","examen-correccio":"Correcció d'examen"
};

/* ─── ENLLAÇ AL SEGUIMENT (Google Doc) ───────────────────────────────
 * L'adreça es llegeix de "seguiment-link.txt" (un fitxer de text pla
 * amb únicament la URL). Per canviar l'adreça, edita només aquell fitxer;
 * no cal tocar cap línia de codi.
 *
 * S'aplica a tots els elements amb l'atribut data-seguiment-doc
 * (index.html, repartiment.html, etc.).
 */
document.addEventListener('DOMContentLoaded', () => {
  fetch('seguiment-link.txt')
    .then(r => r.ok ? r.text() : Promise.reject(r.status))
    .then(text => {
      const url = text.trim();
      if (!url) return;
      document.querySelectorAll('[data-seguiment-doc]').forEach(a => {
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
      });
    })
    .catch(err => console.warn('seguiment-link.txt no s\'ha pogut carregar:', err));
});
