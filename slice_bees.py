import os
from PIL import Image

image_path = r"C:\Users\USER\.gemini\antigravity\brain\2d907f7b-9bf5-45f9-8d00-3b630e808534\media__1781432934192.png"
out_dir = r"c:\Users\USER\Desktop\Amazon-SecondLife\public\images\nova"

os.makedirs(out_dir, exist_ok=True)

img = Image.open(image_path)
width, height = img.size

# 3 columns, 2 rows
col_width = width // 3
row_height = height // 2

# We map the 6 bees to our 6 moods based on visual matches
moods = [
    "proud",    # Top-Left: Hugging honeycomb -> Proud/Idle?
    "excited",  # Top-Center: Arms up -> Excited
    "thinking", # Top-Right: '?' bubble -> Thinking
    "happy",    # Bottom-Left: Winking thumbs up -> Happy
    "idle",     # Bottom-Center: Crying -> Idle (or sad, but we map to idle for now to cover 6)
    "scanning"  # Bottom-Right: Angry -> Scanning (fallback)
]

# Let's adjust mappings to be as close as possible to the user's intent:
# 1. Hugging honeycomb -> idle (default state, holding honey)
# 2. Arms up -> excited
# 3. Question mark -> thinking
# 4. Winking thumbs up -> proud
# 5. Sad -> maybe we just keep it as 'sad' but use it for scanning or something. We'll name them by index first.

names = [
    "idle",
    "excited",
    "thinking",
    "happy",
    "sad",
    "scanning"
]

idx = 0
for row in range(2):
    for col in range(3):
        left = col * col_width
        top = row * row_height
        right = left + col_width
        bottom = top + row_height
        
        box = (left, top, right, bottom)
        cropped = img.crop(box)
        
        out_path = os.path.join(out_dir, f"{names[idx]}_raw.png")
        cropped.save(out_path)
        idx += 1

print("Slicing complete.")
