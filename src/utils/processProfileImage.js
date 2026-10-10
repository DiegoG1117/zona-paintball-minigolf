const TARGET_SIZE = 128
const MAX_BYTES = 100 * 1024

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

export async function processProfileImage(file) {
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Selecciona una imagen válida')
  }
  const img = await loadImage(file)
  const side = Math.min(img.width, img.height)
  const sx = (img.width - side) / 2
  const sy = (img.height - side) / 2
  const canvas = document.createElement('canvas')
  canvas.width = TARGET_SIZE
  canvas.height = TARGET_SIZE
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, sx, sy, side, side, 0, 0, TARGET_SIZE, TARGET_SIZE)

  let quality = 0.72
  let blob = await canvasToBlob(canvas, 'image/webp', quality)
  if (!blob) {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  }
  while (blob && blob.size > MAX_BYTES && quality > 0.4) {
    quality -= 0.08
    blob = await canvasToBlob(canvas, blob.type, quality)
  }
  if (!blob) throw new Error('No se pudo comprimir la imagen')
  return blob
}
