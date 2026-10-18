#!/usr/bin/env python3
"""
genera_cb_items.py — reconstrueix `cb-items.json` (projecte m, banc-cb.html)
a partir de `preguntes.json` (projecte cb, cb.step-quiz.net).

Els dos fitxers contenen exactament la mateixa informació amb dues formes:
`preguntes.json` és una llista plana de preguntes i `cb-items.json` les agrupa
en BLOCS (un estímul compartit + les preguntes que en pengen). S'ha comprovat
que el segon es dedueix del primer sense pèrdua: la font de veritat és
`preguntes.json` i aquest script en deriva l'altre.

    python3 genera_cb_items.py preguntes.json cb-items.json

Un bloc = preguntes consecutives que comparteixen el mateix fitxer d'enunciat.

IMATGES (millora C2). banc-cb.html no les baixa de cb.step-quiz.net: en té una
còpia a `cb/data/` (la mateixa estructura que el web del cb), de manera que
funciona sense connexió i sense CORS. Amb --imatges, l'script hi copia les
imatges que fa servir cb-items.json, palatitzades (256 colors, error mitjà
< 0,2/255, com les targetes de Florence: ocupen un terç), i esborra les que ja
no s'hi fan servir. Necessita Pillow només en aquest cas:

    python3 genera_cb_items.py ../cb/preguntes.json cb-items.json --imatges ../cb/data
"""
import argparse, datetime, io, json, os, sys

ETIQUETES = {
    "algebraic": "Algebraic",
    "mesura": "Mesura",
    "espacial": "Espacial",
    "estocastic": "Estocàstic",
    "numeric": "Numèric",
    "2eso": "2n ESO",
    "4eso": "4t ESO",
}
NOM_NIVELL = {"2eso": "2n ESO", "4eso": "4t ESO"}
BASE = "https://cb.step-quiz.net/"
IMATGES_LOCALS = "cb/"   # image_base: les rutes data/… es resolen dins de m/cb/


def genera(preguntes, generat=None):
    blocs, comptador = [], {}
    for q in preguntes:
        if blocs and blocs[-1]["enunciat"] == q["enunciat"]:
            bloc = blocs[-1]
        else:
            clau = (q["nivell"], q["any"])
            comptador[clau] = comptador.get(clau, 0) + 1
            num = comptador[clau]
            bloc = {
                "id": f"cb{q['nivell']}{q['any']}e{num}",
                "nivell": q["nivell"],
                "any": q["any"],
                "num": num,
                "title": f"CB {NOM_NIVELL[q['nivell']]} {q['any']} · bloc {num}",
                "enunciat": q["enunciat"],
                "senses": [],
                "difficulties": [],
                "questions": [],
            }
            blocs.append(bloc)
        bloc["questions"].append({
            "id": q["id"],
            "img": q["pregunta"],
            "sentit": q["sentit"],
            "dificultat": q["dificultat"],
            "correcta": q["indexCorrecte"],
            "pistes": q["pistes"],
        })

    for b in blocs:
        # ordre d'aparició (és el que fa servir el fitxer actual), sense repetits
        b["senses"] = list(dict.fromkeys(x["sentit"] for x in b["questions"]))
        b["difficulties"] = sorted({x["dificultat"] for x in b["questions"]})

    etiquetes = {k: v for k, v in ETIQUETES.items()
                 if k in {q["sentit"] for q in preguntes} | {q["nivell"] for q in preguntes}}

    return {
        "generated": generat or datetime.date.today().isoformat(),
        "source": BASE,
        "image_base": IMATGES_LOCALS,
        "labels": etiquetes,
        "blocks": blocs,
    }


def imatges_de(dades):
    """Rutes (data/….png) de totes les imatges que fa servir cb-items.json."""
    rutes = set()
    for b in dades["blocks"]:
        rutes.add(b["enunciat"])
        rutes.update(q["img"] for q in b["questions"])
    return sorted(rutes)


def copia_imatges(dades, origen, arrel):
    """Copia (palatitzades) les imatges que falten o han canviat i esborra les sobrants."""
    from PIL import Image
    desti = os.path.join(arrel, IMATGES_LOCALS)
    rutes = imatges_de(dades)
    noves = 0
    for r in rutes:
        font = os.path.join(origen, os.path.basename(r))
        if not os.path.exists(font):
            sys.exit(f"Falta la imatge {font} (la cita preguntes.json)")
        im = Image.open(font).convert("RGB")
        q = im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        buf = io.BytesIO()
        q.save(buf, "PNG", optimize=True)
        cami = os.path.join(desti, r)
        os.makedirs(os.path.dirname(cami), exist_ok=True)
        if not os.path.exists(cami) or open(cami, "rb").read() != buf.getvalue():
            open(cami, "wb").write(buf.getvalue())
            noves += 1
    usades = {os.path.normpath(os.path.join(desti, r)) for r in rutes}
    sobrants = 0
    for d, _, fitxers in os.walk(desti):
        for f in fitxers:
            c = os.path.normpath(os.path.join(d, f))
            if f.endswith(".png") and c not in usades:
                os.remove(c)
                sobrants += 1
    print(f"{IMATGES_LOCALS}: {len(rutes)} imatges ({noves} escrites, {sobrants} esborrades)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Reconstrueix cb-items.json a partir de preguntes.json del cb.")
    ap.add_argument("entrada", nargs="?", default="preguntes.json")
    ap.add_argument("sortida", nargs="?", default="cb-items.json")
    ap.add_argument("generat", nargs="?", default=None, help="data del camp generated (per defecte, avui)")
    ap.add_argument("--imatges", metavar="CARPETA_DATA_DEL_CB",
                    help="copia també les imatges a cb/data/ (p. ex. ../cb/data)")
    a = ap.parse_args()
    dades = genera(json.load(open(a.entrada, encoding="utf-8")), a.generat)
    with open(a.sortida, "w", encoding="utf-8") as f:
        json.dump(dades, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{a.sortida}: {len(dades['blocks'])} blocs · "
          f"{sum(len(b['questions']) for b in dades['blocks'])} preguntes")
    if a.imatges:
        copia_imatges(dades, a.imatges, os.path.dirname(os.path.abspath(a.sortida)))
