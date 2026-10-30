import base64, sys, os, subprocess, time, math
from playwright.sync_api import sync_playwright
S, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True); os.makedirs(OUT + "/dumbbell_spin", exist_ok=True)
srv = subprocess.Popen(["python3", "-m", "http.server", "8765", "--bind", "127.0.0.1"], cwd=S, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
def save(page, path, rx, ry, rz):
    d = page.evaluate(f"shot({rx},{ry},{rz})"); open(path, "wb").write(base64.b64decode(d.split(",")[1]))
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        page = b.new_page(viewport={"width": 900, "height": 900})
        page.on("console", lambda m: print("console:", m.text))
        page.goto("http://127.0.0.1:8765/index.html"); page.wait_for_function("window.ready === true", timeout=60000)
        page.evaluate("setup('dumbbell')"); save(page, f"{OUT}/dumbbell.png", 0.35, -0.55, 0.12)
        for i in range(48):
            a = i / 48 * math.pi * 2
            save(page, f"{OUT}/dumbbell_spin/{i:02d}.png", 0.35 + 0.15 * math.sin(a), a - 0.55, 0.12)
        page.evaluate("setup('kettlebell')"); save(page, f"{OUT}/kettlebell.png", 0.12, -0.5, 0)
        page.evaluate("setup('plate')"); save(page, f"{OUT}/plate.png", -0.35, 0.55, 0.1)
        page.evaluate("setup('shaker')"); save(page, f"{OUT}/shaker.png", 0.1, 0.4, -0.08)
        b.close()
finally:
    srv.terminate()
print("done")
