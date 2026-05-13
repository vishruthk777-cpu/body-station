from PIL import Image
import numpy as np

img = Image.open('logo.png').convert('RGBA')
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

mean_rgb = np.mean(data[:,:,:3], axis=2)
color_diff = np.max(np.abs(data[:,:,:3] - mean_rgb[:,:,np.newaxis]), axis=2)

mask = (mean_rgb > 90) & (color_diff < 40)
data[mask, 3] = 0

img_clean = Image.fromarray(data)
img_clean.save('logo.png')
print("Logo cleaned successfully!")
