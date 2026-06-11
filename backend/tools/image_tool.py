from PIL import Image

def validate_image(path):

    image = Image.open(path)

    return {
        "width": image.width,
        "height": image.height
    }