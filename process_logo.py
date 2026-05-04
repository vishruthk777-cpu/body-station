"""
Professional Logo Background Removal & Multi-Size Export
Removes white background with anti-aliased edges, no halos.
Outputs transparent PNGs at multiple sizes for web use.
"""
from PIL import Image, ImageFilter
import numpy as np
import os

def remove_white_background(input_path, output_path):
    """Remove white/near-white background with smooth alpha edges."""
    img = Image.open(input_path).convert('RGBA')
    data = np.array(img, dtype=np.float64)

    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

    # Calculate "whiteness" — how close each pixel is to pure white
    # Use max channel approach: a pixel is "white" if ALL channels are high
    min_channel = np.minimum(np.minimum(r, g, ), b)
    max_channel = np.maximum(np.maximum(r, g), b)
    
    # Saturation-based: low saturation + high brightness = background
    brightness = (r + g + b) / 3.0
    saturation = max_channel - min_channel
    
    # Threshold: pixels that are bright and unsaturated are background
    # Use soft thresholds for anti-aliased edges
    bright_thresh_low = 200.0
    bright_thresh_high = 240.0
    sat_thresh_low = 20.0
    sat_thresh_high = 50.0
    
    # Compute background probability (0 = definitely foreground, 1 = definitely background)
    bright_factor = np.clip((brightness - bright_thresh_low) / (bright_thresh_high - bright_thresh_low), 0, 1)
    sat_factor = np.clip((sat_thresh_high - saturation) / (sat_thresh_high - sat_thresh_low), 0, 1)
    
    bg_probability = bright_factor * sat_factor
    
    # New alpha: foreground gets full opacity, background gets transparent
    new_alpha = np.clip((1.0 - bg_probability) * 255.0, 0, 255).astype(np.uint8)
    
    # Preserve original alpha where it was already transparent
    original_alpha = data[:,:,3].astype(np.uint8)
    final_alpha = np.minimum(new_alpha, original_alpha)
    
    # Apply the new alpha
    data[:,:,3] = final_alpha
    
    result = Image.fromarray(data.astype(np.uint8))
    
    # Clean up edge halos: slight erosion then blur on alpha channel
    alpha = result.split()[3]
    
    # Light erosion to remove white fringe pixels
    alpha_eroded = alpha.filter(ImageFilter.MinFilter(3))
    
    # Smooth the edges slightly
    alpha_smooth = alpha_eroded.filter(ImageFilter.GaussianBlur(radius=0.8))
    
    # Re-threshold to keep clean edges
    alpha_array = np.array(alpha_smooth)
    alpha_array = np.where(alpha_array > 15, np.clip(alpha_array * 1.3, 0, 255), 0).astype(np.uint8)
    alpha_final = Image.fromarray(alpha_array)
    
    result.putalpha(alpha_final)
    
    # Trim whitespace (crop to content)
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
    
    result.save(output_path, 'PNG', optimize=True)
    print(f"  Saved: {output_path} ({result.size[0]}x{result.size[1]})")
    return result


def create_sizes(source_img, output_dir, base_name="logo"):
    """Generate multiple sizes for web use."""
    sizes = {
        'favicon': (32, 32),
        'mobile': (128, 128),
        'tablet': (256, 256),
        'desktop': (512, 512),
    }
    
    os.makedirs(output_dir, exist_ok=True)
    
    for label, (w, h) in sizes.items():
        resized = source_img.copy()
        resized.thumbnail((w, h), Image.LANCZOS)
        
        # Center on transparent canvas of exact size
        canvas = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        x = (w - resized.width) // 2
        y = (h - resized.height) // 2
        canvas.paste(resized, (x, y), resized)
        
        out_path = os.path.join(output_dir, f"{base_name}_{label}_{w}x{h}.png")
        canvas.save(out_path, 'PNG', optimize=True)
        print(f"  Saved: {out_path}")
    
    # Also save a navbar-optimized version (height-constrained, wider aspect)
    navbar_height = 50
    ratio = navbar_height / source_img.height
    navbar_width = int(source_img.width * ratio)
    navbar_img = source_img.resize((navbar_width, navbar_height), Image.LANCZOS)
    navbar_path = os.path.join(output_dir, f"{base_name}_navbar.png")
    navbar_img.save(navbar_path, 'PNG', optimize=True)
    print(f"  Saved: {navbar_path} (navbar-optimized)")
    
    # High-res version for retina displays (2x navbar)
    retina_height = 100
    ratio2 = retina_height / source_img.height
    retina_width = int(source_img.width * ratio2)
    retina_img = source_img.resize((retina_width, retina_height), Image.LANCZOS)
    retina_path = os.path.join(output_dir, f"{base_name}_navbar_2x.png")
    retina_img.save(retina_path, 'PNG', optimize=True)
    print(f"  Saved: {retina_path} (retina navbar)")


if __name__ == '__main__':
    print("=" * 50)
    print("  Body Station Logo Processor")
    print("=" * 50)
    
    input_file = 'logo.png'
    output_file = 'logo_transparent.png'
    sizes_dir = 'logo_sizes'
    
    print("\n1. Removing white background...")
    clean_logo = remove_white_background(input_file, output_file)
    
    print("\n2. Generating multiple sizes...")
    create_sizes(clean_logo, sizes_dir)
    
    print("\n✅ Done! All logo files generated.")
    print(f"   Primary: {output_file}")
    print(f"   Sizes:   {sizes_dir}/")
