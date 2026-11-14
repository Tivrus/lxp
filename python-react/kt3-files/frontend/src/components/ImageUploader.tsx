import { useRef, useState, type ChangeEvent } from 'react'
import { getErrorMessage, uploadImage, type UploadedImage } from '../api'
import { useObjectUrl } from '../hooks/useObjectUrl'

type Props = {
  onUploaded: (image: UploadedImage) => void
}

function formatSize(bytes: number) {
  return `${Math.round(bytes / 1024)} КБ`
}

function ImageUploader({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')
  const previewUrl = useObjectUrl(file)

  const isUploading = progress !== null

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
    setError('')
  }

  const handleUpload = async () => {
    if (!file) return

    setError('')
    setProgress(0)
    try {
      const image = await uploadImage(file, setProgress)
      onUploaded(image)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="uploader">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} />

      {file && previewUrl && (
        <>
          <img src={previewUrl} alt="Предпросмотр" className="preview" />
          <div className="muted">
            {file.name}, {formatSize(file.size)}
          </div>
        </>
      )}

      <div className="row">
        <button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? 'Загрузка...' : 'Загрузить'}
        </button>
        {isUploading && (
          <>
            <progress value={progress} max={100} />
            <span>{progress}%</span>
          </>
        )}
      </div>

      {error && <div className="error">Ошибка загрузки: {error}</div>}
    </div>
  )
}

export default ImageUploader
