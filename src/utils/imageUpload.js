const MAX_SOURCE_IMAGE_BYTES = 12 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 1400

export async function readImageUpload(file) {
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    throw new TypeError('Choose a valid image file.')
  }

  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new RangeError('Image files must be 12 MB or smaller.')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Your browser could not prepare this image.')
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error('Your browser could not process this image.'))
      },
      'image/webp',
      0.82,
    )
  })

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Your browser did not return image data.'))
    }, { once: true })
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Could not read this image file.')), { once: true })
    reader.readAsDataURL(blob)
  })
}
