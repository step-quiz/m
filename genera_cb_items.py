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
"""
import json, sys, datetime

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
        "image_base": BASE,
        "labels": etiquetes,
        "blocks": blocs,
    }


if __name__ == "__main__":
    entrada = sys.argv[1] if len(sys.argv) > 1 else "preguntes.json"
    sortida = sys.argv[2] if len(sys.argv) > 2 else "cb-items.json"
    generat = sys.argv[3] if len(sys.argv) > 3 else None
    dades = genera(json.load(open(entrada, encoding="utf-8")), generat)
    with open(sortida, "w", encoding="utf-8") as f:
        json.dump(dades, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{sortida}: {len(dades['blocks'])} blocs · "
          f"{sum(len(b['questions']) for b in dades['blocks'])} preguntes")
