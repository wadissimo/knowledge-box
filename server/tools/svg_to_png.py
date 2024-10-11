import cairosvg
import os
files = []
for file in os.listdir("../media/images/"):
    if file.endswith(".svg"):
        files.append(file.replace(".svg", ""))

print("converting")
for file in files:
    cairosvg.svg2png(url=f"../media/images/{file}.svg", write_to=f"../media/images/{file}.png")



print("done")