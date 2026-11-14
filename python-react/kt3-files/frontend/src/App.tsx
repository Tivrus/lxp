import { useEffect, useState } from 'react'
import { getErrorMessage, getImages, type UploadedImage } from './api'
import ImageUploader from './components/ImageUploader'

function App() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [lastUploaded, setLastUploaded] = useState<UploadedImage | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    getImages()
      .then(setImages)
      .catch((err) => setLoadError(getErrorMessage(err)))
  }, [])

  const handleUploaded = (image: UploadedImage) => {
    setLastUploaded(image)
    setImages((prev) => [image, ...prev])
  }

  return (
    <div className="app">
      <h2>Загрузка изображений</h2>
      <p className="muted">PNG или JPEG до 5 МБ</p>

      <ImageUploader onUploaded={handleUploaded} />

      {lastUploaded && (
        <section>
          <h3>Загружено</h3>
          <img src={lastUploaded.thumbnail_url} alt={lastUploaded.filename} className="thumb" />
          <a href={lastUploaded.original_url} target="_blank" rel="noreferrer">
            Оригинал {lastUploaded.width}x{lastUploaded.height}
          </a>
        </section>
      )}

      {loadError && <p className="error">Не удалось загрузить список: {loadError}</p>}

      {images.length > 0 && (
        <section>
          <h3>Все изображения</h3>
          <div className="grid">
            {images.map((image) => (
              <a key={image.id} href={image.original_url} target="_blank" rel="noreferrer" className="card">
                <img src={image.thumbnail_url} alt={image.filename} height={100} className="thumb" />
                {image.filename}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default App
