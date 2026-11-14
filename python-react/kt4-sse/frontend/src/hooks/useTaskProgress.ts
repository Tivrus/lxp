import { useEffect, useState } from 'react'

export type ProgressStatus = 'running' | 'done' | 'error'

type ProgressEvent = { percent: number; step: string }
type CompleteEvent = { percent: number; message: string }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function useTaskProgress(simulateFailure: boolean) {
  const [percent, setPercent] = useState(0)
  const [status, setStatus] = useState<ProgressStatus>('running')
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    const url = new URL('/progress', API_URL)
    if (simulateFailure) url.searchParams.set('fail', 'true')

    const source = new EventSource(url)

    source.addEventListener('progress', (event) => {
      const data: ProgressEvent = JSON.parse(event.data)
      setPercent(data.percent)
      setLog((prev) => [...prev, `${data.percent}% ${data.step}`])
    })

    source.addEventListener('complete', (event) => {
      const data: CompleteEvent = JSON.parse(event.data)
      setPercent(data.percent)
      setStatus('done')
      setLog((prev) => [...prev, data.message])
      source.close()
    })

    source.onerror = () => {
      setStatus('error')
      source.close()
    }

    return () => source.close()
  }, [simulateFailure])

  return { percent, status, log }
}
