"""Extract visit-step visuals from existing clinical collage assets."""
from pathlib import Path
from PIL import Image

OUT = Path(r"c:\Users\jayde\printdenture\public\images\visit-protocols")
OUT.mkdir(parents=True, exist_ok=True)

# Clear previous poster crops (keep only curated extracts)
for p in OUT.glob("*"):
    if p.name.startswith("_"):
        p.unlink()
    elif p.suffix.lower() in {".jpg", ".jpeg", ".png"}:
        p.unlink()


def save_crop(src: Path, box: tuple[int, int, int, int], name: str, pad: int = 0) -> None:
    im = Image.open(src).convert("RGB")
    l, t, r, b = box
    if pad:
        l, t = max(0, l - pad), max(0, t - pad)
        r, b = min(im.width, r + pad), min(im.height, b + pad)
    crop = im.crop((l, t, r, b))
    # Normalize to a consistent landscape thumbnail canvas
    target_w, target_h = 640, 400
    crop_ratio = crop.width / crop.height
    target_ratio = target_w / target_h
    if crop_ratio > target_ratio:
        new_h = crop.height
        new_w = int(new_h * target_ratio)
        left = (crop.width - new_w) // 2
        crop = crop.crop((left, 0, left + new_w, new_h))
    else:
        new_w = crop.width
        new_h = int(new_w / target_ratio)
        top = (crop.height - new_h) // 2
        crop = crop.crop((0, top, new_w, top + new_h))
    crop = crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
    crop.save(OUT / name, quality=90, optimize=True)
    print(f"wrote {name} from {src.name} {box}")


ROOT = Path(r"c:\Users\jayde\printdenture\public\images")

# digital-workflow.jpg — 5-step horizontal infographic
wf = ROOT / "jb-fork" / "digital-workflow.jpg"
wf_im = Image.open(wf)
ww, wh = wf_im.size
print("digital-workflow", ww, wh)
# Split into 5 equal columns (content area roughly full width)
col_w = ww // 5
# Image content sits in lower ~55% of each column
y0, y1 = int(wh * 0.28), int(wh * 0.95)
save_crop(wf, (col_w * 0 + 8, y0, col_w * 1 - 8, y1), "step-intraoral-scan.jpg")
save_crop(wf, (col_w * 1 + 8, y0, col_w * 2 - 8, y1), "step-jaw-relation-scan.jpg")
save_crop(wf, (col_w * 4 + 8, y0, col_w * 5 - 8, y1), "step-temp-denture.jpg")

# denture-fabrication.jpg — 2x2 collage; bottom-right is final denture
fab = ROOT / "jb-tray" / "denture-fabrication.jpg"
fab_im = Image.open(fab)
fw, fh = fab_im.size
print("denture-fabrication", fw, fh)
save_crop(fab, (0, 0, fw // 2, fh // 2), "step-wax-setup.jpg")
save_crop(fab, (fw // 2, fh // 2, fw, fh), "step-final-denture.jpg")

# articulator.jpg — 2x2 collage of impression + wax rim mounting
art = ROOT / "jb-tray" / "articulator.jpg"
art_im = Image.open(art)
aw, ah = art_im.size
print("articulator", aw, ah)
save_crop(art, (0, 0, aw // 2, ah // 2), "step-wax-rim-impression.jpg")
save_crop(art, (0, ah // 2, aw // 2, ah), "step-articulator.jpg")

# Product / chairside shots — center-crop to same aspect
def save_centered(src: Path, name: str) -> None:
    im = Image.open(src).convert("RGB")
    target_w, target_h = 640, 400
    ratio = target_w / target_h
    if im.width / im.height > ratio:
        new_h = im.height
        new_w = int(new_h * ratio)
        left = (im.width - new_w) // 2
        im = im.crop((left, 0, left + new_w, new_h))
    else:
        new_w = im.width
        new_h = int(new_w / ratio)
        top = max(0, (im.height - new_h) // 2)
        im = im.crop((0, top, new_w, top + new_h))
    im = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
    im.save(OUT / name, quality=90, optimize=True)
    print(f"wrote {name} from {src.name}")


save_centered(ROOT / "jb-fork" / "product.jpg", "hero-jb-fork.jpg")
save_centered(ROOT / "jb-tray" / "product.jpg", "hero-jb-tray.jpg")
save_centered(ROOT / "jb-fork" / "impression-chairside.jpg", "step-fork-chairside.jpg")
save_centered(ROOT / "jb-fork" / "records-complete.jpg", "step-fork-records.jpg")
save_centered(ROOT / "jb-fork" / "components.jpg", "step-fork-components.jpg")
save_centered(ROOT / "jb-tray" / "upper-tray.jpg", "step-tray-upper.jpg")
save_centered(ROOT / "jb-tray" / "lower-tray.jpg", "step-tray-lower.jpg")
save_centered(ROOT / "jb-fork" / "workflow-benefits.jpg", "step-printed-tryin.jpg")

print("done")
