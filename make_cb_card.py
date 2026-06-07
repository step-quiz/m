#!/usr/bin/env python3
"""
make_cb_card.py — regenerate the florence-cb "CB<id>.png" cards.

florence-cb.html shows, for each Florence session, a set of recommended CB
questions as ready-to-print PNGs at cb-img/CB<id>.png. Each PNG is a *composite*
card (header + the shared "enunciat" image + the question image), not one of the
raw images from the CB source project. This script rebuilds those composites
from the CB source project (the one published at cb.step-quiz.net).

You normally do NOT need this. The cards that were missing have already been
generated. Keep this only for the future — e.g. if new Florence sessions point
to CB ids whose PNG you don't have yet, or if the source images change.

----------------------------------------------------------------------------
REQUIREMENTS
    Python 3 + Pillow:   pip install pillow

SETUP
    Put the CB source project (unzipped) next to this script so that
    CB_MAIN_DIR below points at the folder that contains:
        preguntes.json
        data/cb....png   (the enunciat/question images)

USAGE
    python3 make_cb_card.py 24 54 56 58 59 155 157
    (any list of CB ids). PNGs are written to OUT_DIR; copy them into cb-img/.
----------------------------------------------------------------------------
"""
import json, os, sys

# -- CONFIG (edit these two paths if your layout differs) -----------
CB_MAIN_DIR = 'cb-main'        # folder containing preguntes.json + data/
OUT_DIR     = 'cb-img-noves'   # where the generated PNGs are written

# Labels for the card header (kept here so the script needs no other file).
LABELS = {
    '1eso': '1r ESO', '2eso': '2n ESO', '3eso': '3r ESO', '4eso': '4t ESO',
    'algebraic': 'Algebraic', 'mesura': 'Mesura', 'espacial': 'Espacial',
    'estocastic': 'Estoc\u00e0stic', 'numeric': 'Num\u00e8ric', 'analitic': 'Anal\u00edtic',
}

# -- Layout constants (reverse-engineered from the existing cards) ---
W, M, CW = 1492, 46, 1401
BG, NAVY, GRAY, RULE = (255, 255, 255), (30, 57, 94), (89, 88, 92), (222, 226, 233)
BAR_X0, BAR_X1, BAR_Y0, BAR_Y1 = 46, 56, 68, 127
TEXT_X, TITLE_TOP, SUB_TOP, RULE_Y, ENUN_TOP, GAP_DIV = 82, 71, 106, 137, 175, 3


def _fail(msg):
    sys.exit('ERROR: ' + msg)


try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    _fail("Pillow is not installed. Run:  pip install pillow")

if not os.path.isfile(os.path.join(CB_MAIN_DIR, 'preguntes.json')):
    _fail("can't find %s/preguntes.json - set CB_MAIN_DIR to the CB source folder." % CB_MAIN_DIR)

BYID = {q['id']: q for q in json.load(open(os.path.join(CB_MAIN_DIR, 'preguntes.json')))}


def _font(bold, size):
    for p in ('/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf' % ('Bold' if bold else 'Regular'),
              '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


F_TITLE, F_SUB = _font(True, 35), _font(False, 25)


def _scaled(rel):
    im = Image.open(os.path.join(CB_MAIN_DIR, rel)).convert('RGB')
    return im.resize((CW, round(im.size[1] * CW / im.size[0])), Image.LANCZOS)


def _text_tl(d, xy, text, font, fill):
    b = d.textbbox((0, 0), text, font=font)
    d.text((xy[0] - b[0], xy[1] - b[1]), text, font=font, fill=fill)


def make_card(cbid):
    q = BYID.get(cbid)
    if not q:
        _fail("CB id %s is not in preguntes.json" % cbid)
    enun, preg = _scaled(q['enunciat']), _scaled(q['pregunta'])
    he, hp = enun.size[1], preg.size[1]
    card = Image.new('RGB', (W, 235 + he + hp), BG)
    d = ImageDraw.Draw(card)
    d.rectangle([BAR_X0, BAR_Y0, BAR_X1, BAR_Y1], fill=NAVY)
    _text_tl(d, (TEXT_X, TITLE_TOP), 'CB %s' % cbid, F_TITLE, NAVY)
    nivell = LABELS.get(q['nivell'], q['nivell'])
    sentit = LABELS.get(q['sentit'], q['sentit'].capitalize())
    _text_tl(d, (TEXT_X, SUB_TOP), '%s \u00b7 %s' % (nivell, sentit), F_SUB, GRAY)
    d.rectangle([M, RULE_Y, M + CW - 1, RULE_Y + 1], fill=RULE)
    card.paste(enun, (M, ENUN_TOP))
    d.rectangle([M, ENUN_TOP + he + 1, M + CW - 1, ENUN_TOP + he + 2], fill=RULE)
    card.paste(preg, (M, ENUN_TOP + he + GAP_DIV))
    return card


def main(ids):
    if not ids:
        sys.exit(__doc__)
    os.makedirs(OUT_DIR, exist_ok=True)
    for cid in ids:
        out = os.path.join(OUT_DIR, 'CB%s.png' % cid)
        make_card(cid).save(out)
        print('wrote', out)


if __name__ == '__main__':
    try:
        main([int(x) for x in sys.argv[1:]])
    except ValueError:
        _fail("arguments must be CB ids (integers), e.g.  python3 make_cb_card.py 24 54")
