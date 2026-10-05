#!/usr/bin/env python3
"""
divideix_focus.py — Divideix el DOCX d'«Activitats focus» de Florence en un
document per activitat (DOCX i PDF) i proposa les entrades de PAYLOAD.focus.

    python3 divideix_focus.py "I1_Raonament_proporcional._Activitats_focus._Fitxa_docent.docx"

PER QUÈ
    Florence envia les activitats focus d'un bloc (I1, I2…) en un sol DOCX per
    al docent. florence-cb.html en proposa cadascuna des dels continguts que
    toca, així que cal un PDF per activitat, pujat al Drive i enllaçat des del
    catàleg (manifest.json).
    Vegeu ACTUALITZACIO-ANUAL.md, «Donar d'alta activitats focus».

COM TALLA
    Cada activitat comença en una pàgina nova i té una línia «Curs: 1r d'ESO»
    sota el títol. Per a cada «Curs:», l'activitat comença just després del
    salt de pàgina anterior i s'acaba on comença la següent. Les capçaleres i
    els peus (logos) es conserven; les imatges que no fa servir cada part es
    treuen del fitxer. Els salts de pàgina interns d'una activitat es mantenen.

NUMERACIÓ
    Els ids continuen la numeració que ja hi ha a PAYLOAD.focus per a cada curs
    (si hi ha FO_1ESO_01…06, la primera de 1r d'un bloc nou serà FO_1ESO_07).

SORTIDA (a la carpeta focus-nou/, o la que diguis com a 2n argument)
    FO_<curs>ESO_<nn>.docx   — per si es vol editar o pujar al Drive
    FO_<curs>ESO_<nn>.pdf    — el que es puja al Drive (cal LibreOffice)
    payload-focus.json       — proposta d'entrades per a PAYLOAD.focus: revisa
                               el «conflicte» (és la primera frase de l'apartat
                               «Conflicte/Error focalitzat») abans d'enganxar-la.
                               «cataleg» és l'id que ha de tenir la fitxa nova
                               del catàleg, amb el drive_id del PDF pujat.

REQUISITS
    Python 3 + python-docx (pip install python-docx).
    Per als PDF, LibreOffice amb el mòdul Writer (soffice) i, perquè el resultat
    sigui fidel, les fonts del document (Roboto, Roboto Condensed, Lexend, Noto
    Color Emoji). Sense LibreOffice, el guió deixa només els DOCX: converteix-los
    a PDF amb el Word o el Google Docs.
"""
import json, os, re, shutil, subprocess, sys, tempfile, unicodedata

try:
    import docx
    from docx.oxml.ns import qn
    from lxml import etree
except ImportError:
    sys.exit('ERROR: cal python-docx. Instal·la-ho amb:  pip install python-docx')

ARREL = os.path.dirname(os.path.abspath(__file__))
SUPER = str.maketrans('0123456789', '⁰¹²³⁴⁵⁶⁷⁸⁹')
ORDINAL_CURS = {'1r': '1ESO', '2n': '2ESO', '3r': '3ESO', '4t': '4ESO'}


def text(el):
    """Text d'un element, amb els dígits en superíndex com a ¹²³ (k² i no k2)."""
    out = []
    for r in el.iter(qn('w:r')):
        sup = r.find(qn('w:rPr') + '/' + qn('w:vertAlign'))
        es_sup = sup is not None and sup.get(qn('w:val')) == 'superscript'
        for fill in r:                      # en ordre: el text i els salts de línia
            if fill.tag == qn('w:t'):
                out.append((fill.text or '').translate(SUPER) if es_sup else (fill.text or ''))
            elif fill.tag in (qn('w:br'), qn('w:cr')) and fill.get(qn('w:type')) != 'page':
                out.append('\n')
            elif fill.tag == qn('w:tab'):
                out.append('\t')
    return ''.join(out)


def te_salt(el):
    """Hi ha un salt de pàgina dins de l'element (al final, normalment)."""
    return any(br.get(qn('w:type')) == 'page' for br in el.iter(qn('w:br')))


def salt_abans(el):
    return el.find('.//' + qn('w:pageBreakBefore')) is not None


def troba_activitats(fills):
    """Llista de (inici, final, línia «Curs:») per a cada activitat."""
    cursos = [i for i, e in enumerate(fills) if text(e).strip().startswith('Curs:')]
    if not cursos:
        sys.exit('ERROR: no hi ha cap línia «Curs: …». No sembla un document d\'activitats focus.')
    inicis = []
    for c in cursos:
        i = c
        while i > 0 and not te_salt(fills[i - 1]) and not salt_abans(fills[i]):
            i -= 1
        inicis.append(i)
    finals = [inicis[k + 1] - 1 for k in range(len(inicis) - 1)] + [len(fills) - 1]
    return list(zip(inicis, finals, cursos))


def titol_de(fills, inici, curs_idx):
    for e in fills[inici:curs_idx]:
        t = text(e).strip()
        if t:
            return t.split('\n')[0].strip()
    return '(sense títol)'


def conflicte_de(fills, inici, final):
    for i in range(inici, final + 1):
        if re.search(r'(Conflicte|Error) focalitzat', text(fills[i])):
            for e in fills[i + 1:final + 1]:
                t = text(e).strip()
                if t:
                    return t.split('\n')[0].strip()
    return ''


def numeracio_existent():
    """Número més alt de cada curs a PAYLOAD.focus (florence-cb.html)."""
    n = {}
    try:
        html = open(os.path.join(ARREL, 'florence-cb.html'), encoding='utf8').read()
    except OSError:
        return n
    for curs, num in re.findall(r'"id": "FO_(\dESO)_(\d+)"', html):
        n[curs] = max(n.get(curs, 0), int(num))
    return n


def slug(t):
    t = unicodedata.normalize('NFD', t.lower().replace('\u2019', "'"))
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def desa_part(src, inici, final, sortida, titol_doc):
    d = docx.Document(src)
    body = d.element.body
    fills = [e for e in body.iterchildren() if e.tag != qn('w:sectPr')]
    for i, e in enumerate(fills):
        if not (inici <= i <= final):
            body.remove(e)
    # Sense el salt de pàgina final, que deixaria una pàgina en blanc.
    for br in list(fills[final].iter(qn('w:br'))):
        if br.get(qn('w:type')) == 'page':
            br.getparent().remove(br)
    usats = set(re.findall(r'r:(?:embed|id|link)="(rId\d+)"', etree.tostring(body).decode()))
    for rid, rel in list(d.part.rels.items()):
        if rid not in usats and (rel.reltype.endswith('/image') or rel.reltype.endswith('/hyperlink')):
            d.part.drop_rel(rid)
    d.core_properties.title = titol_doc
    d.save(sortida)


def a_pdf(docxs, carpeta):
    soffice = shutil.which('soffice') or shutil.which('libreoffice')
    if not soffice:
        return False
    with tempfile.TemporaryDirectory() as perfil:
        env = dict(os.environ, HOME=perfil)
        r = subprocess.run([soffice, '--headless', '--norestore', '--convert-to', 'pdf',
                            '--outdir', carpeta] + docxs, env=env, capture_output=True, text=True)
    return r.returncode == 0


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = sys.argv[1]
    sortida = sys.argv[2] if len(sys.argv) > 2 else 'focus-nou'
    os.makedirs(sortida, exist_ok=True)
    m = re.match(r'\s*(I\d+)\b', os.path.basename(src).replace('_', ' '))
    bloc = m.group(1) if m else ''

    fills = [e for e in docx.Document(src).element.body.iterchildren() if e.tag != qn('w:sectPr')]
    seguent = numeracio_existent()
    payload, docxs = [], []
    for inici, final, ci in troba_activitats(fills):
        ordinal = re.search(r'Curs:\s*(\d\w)', text(fills[ci]))
        curs = ORDINAL_CURS.get(ordinal.group(1) if ordinal else '', '')
        if not curs:
            sys.exit(f'ERROR: no entenc el curs de «{text(fills[ci]).strip()}»')
        seguent[curs] = seguent.get(curs, 0) + 1
        fid = f'FO_{curs}_{seguent[curs]:02d}'
        titol = titol_de(fills, inici, ci)
        cami = os.path.join(sortida, fid + '.docx')
        desa_part(src, inici, final, cami, f'{titol} · Activitat focus' + (f' ({bloc})' if bloc else ''))
        docxs.append(cami)
        payload.append({'id': fid, 'titol': titol, 'curs': curs, 'bloc': bloc,
                        'cataleg': f'fl-focus-{curs.lower()}-{seguent[curs]:02d}-{slug(titol)}',
                        'conflicte': conflicte_de(fills, inici, final)})
        print(f'{fid}  {curs}  {titol}')

    with open(os.path.join(sortida, 'payload-focus.json'), 'w', encoding='utf8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    if a_pdf(docxs, sortida):
        print(f'\nFets {len(docxs)} DOCX i PDF a {sortida}/. Puja els PDF al Drive i dona\'ls d\'alta al catàleg.')
    else:
        print(f'\nFets {len(docxs)} DOCX a {sortida}/. No hi ha LibreOffice: converteix-los a PDF '
              'amb el Word o el Google Docs i puja\'ls al Drive.')
    print(f'Proposta per a PAYLOAD.focus: {sortida}/payload-focus.json (revisa els textos del conflicte).')


if __name__ == '__main__':
    main()
