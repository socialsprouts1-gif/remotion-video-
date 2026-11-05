import base64, sys, os, subprocess, time
from playwright.sync_api import sync_playwright
S, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
srv = subprocess.Popen(["python3", "-m", "http.server", "8769", "--bind", "127.0.0.1"], cwd=S, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
def save(page, path, rx, ry, rz):
    d = page.evaluate(f"shot({rx},{ry},{rz})"); open(path, "wb").write(base64.b64decode(d.split(",")[1]))
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        page = b.new_page(viewport={"width": 900, "height": 900})
        page.goto("http://127.0.0.1:8769/index.html"); page.wait_for_function("window.ready === true", timeout=60000)
        page.evaluate("setup('funnel')"); save(page, f"{OUT}/funnel.png", 0.0, 0.3, 0)
        page.evaluate("setup('house')"); save(page, f"{OUT}/house.png", 0.1, -0.6, 0)
        b.close()
finally:
    srv.terminate()
print("done")
