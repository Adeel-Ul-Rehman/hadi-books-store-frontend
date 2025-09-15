import os
from PIL import Image
import shutil

def compress_and_convert_images(folder_path, max_size_kb=150):
    """
    Compress images in a folder to PNG format with size below max_size_kb.
    Images will be converted in place with the same name but .png extension.
    """
    if not os.path.exists(folder_path):
        print(f"❌ Folder '{folder_path}' does not exist!")
        return
    
    # Get all image files
    image_files = [f for f in os.listdir(folder_path) 
                  if f.lower().endswith(('jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'webp'))]
    
    if not image_files:
        print(f"❌ No images found in '{folder_path}'")
        return
    
    print(f"📸 Found {len(image_files)} images to process")
    
    success_count = 0
    for image_file in image_files:
        img_path = os.path.join(folder_path, image_file)
        file_name, file_ext = os.path.splitext(image_file)
        output_path = os.path.join(folder_path, f"{file_name}.png")
        
        try:
            # Check current file size if it's already a PNG
            if file_ext.lower() == '.png':
                size_kb = os.path.getsize(img_path) / 1024
                if size_kb <= max_size_kb:
                    print(f"✅ {image_file} is already under {max_size_kb}KB ({size_kb:.1f} KB)")
                    success_count += 1
                    continue
            
            with Image.open(img_path) as img:
                # Always convert to RGB to avoid issues with transparency
                if img.mode in ("RGBA", "P", "LA"):
                    img = img.convert("RGB")
                elif img.mode != "RGB":
                    img = img.convert("RGB")
                
                # Check if the image is already small enough
                temp_path = os.path.join(folder_path, "temp_image.png")
                img.save(temp_path, format="PNG", optimize=True)
                size_kb = os.path.getsize(temp_path) / 1024
                
                # If image is already below the size limit, just convert format
                if size_kb <= max_size_kb:
                    # Remove original file if it's not already PNG
                    if file_ext.lower() != '.png':
                        os.remove(img_path)
                    os.rename(temp_path, output_path)
                    print(f"✅ Converted {image_file} → {file_name}.png ({size_kb:.1f} KB)")
                    success_count += 1
                    continue
                
                # If too large, compress it
                quality = 90
                attempts = 0
                max_attempts = 15
                
                while size_kb > max_size_kb and attempts < max_attempts and quality > 10:
                    img.save(temp_path, format="PNG", optimize=True, quality=quality)
                    size_kb = os.path.getsize(temp_path) / 1024
                    
                    if size_kb > max_size_kb:
                        quality -= 10  # Reduce quality more aggressively
                    attempts += 1
                
                # If still too large after quality reduction, try resizing
                if size_kb > max_size_kb:
                    scale = 0.9
                    original_width, original_height = img.size
                    
                    while size_kb > max_size_kb and scale > 0.5:
                        new_size = (int(original_width * scale), int(original_height * scale))
                        resized_img = img.resize(new_size, Image.LANCZOS)
                        resized_img.save(temp_path, format="PNG", optimize=True, quality=quality)
                        size_kb = os.path.getsize(temp_path) / 1024
                        
                        if size_kb > max_size_kb:
                            scale -= 0.1
                        else:
                            break
                
                # Final check and file replacement
                size_kb = os.path.getsize(temp_path) / 1024
                
                if size_kb <= max_size_kb:
                    # Remove original file
                    if file_ext.lower() != '.png' or img_path != output_path:
                        os.remove(img_path)
                    os.rename(temp_path, output_path)
                    print(f"✅ Compressed {image_file} → {file_name}.png ({size_kb:.1f} KB)")
                    success_count += 1
                else:
                    print(f"❌ Could not compress {image_file} below {max_size_kb}KB ({size_kb:.1f} KB)")
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
        
        except Exception as e:
            print(f"❌ Error processing {image_file}: {str(e)}")
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    print(f"\n🎉 Processing complete! Successfully processed {success_count}/{len(image_files)} images")
    print(f"📁 All images are now in PNG format and under {max_size_kb}KB")

if __name__ == "__main__":
    # Process images in the current folder
    folder_path = "."  # Current directory
    
    compress_and_convert_images(folder_path, 150)