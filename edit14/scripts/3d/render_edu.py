import base64, sys, os, subprocess, time, math
from playwright.sync_api import sync_playwright
S, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT + "/cap_spin", exist_ok=True)
srv = subprocess.Popen(["python3", "-m", "http.server", "8766", "--bind", "127.0.0.1"], cwd=S, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
def save(page, path, rx, ry, rz):
    d = page.evaluate(f"shot({rx},{ry},{rz})"); open(path, "wb").write(base64.b64decode(d.split(",")[1]))
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        page = b.new_page(viewport={"width": 900, "height": 900})
        page.goto("http://127.0.0.1:8766/index.html"); page.wait_for_function("window.ready === true", timeout=60000)
        page.evaluate("setup('cap')"); save(page, f"{OUT}/cap.png", 0.25, 0.3, 0.05)
        for i in range(48):
            a = i / 48 * math.pi * 2
            save(page, f"{OUT}/cap_spin/{i:02d}.png", 0.25 + 0.12 * math.sin(a), a, 0.08 * math.cos(a))
        page.evaluate("setup('books')"); save(page, f"{OUT}/books.png", 0.12, 0.5, 0)
        page.evaluate("setup('pencil')"); save(page, f"{OUT}/pencil.png", 0.0, 0.3, -0.6)
        b.close()
finally:
    srv.terminate()
print("done")
