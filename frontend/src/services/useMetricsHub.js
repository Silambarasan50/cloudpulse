import { useEffect, useRef, useState } from 'react'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { HUB_URL } from './api'

export function useMetricsHub(onMetric) {
  const [status, setStatus] = useState('connecting')
  const handlerRef = useRef(onMetric)
  handlerRef.current = onMetric

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('ReceiveMetricUpdate', (payload) => handlerRef.current?.(payload))
    connection.onreconnecting(() => setStatus('reconnecting'))
    connection.onreconnected(() => setStatus('connected'))
    connection.onclose(() => setStatus('disconnected'))

    let cancelled = false
    connection
      .start()
      .then(() => !cancelled && setStatus('connected'))
      .catch(() => !cancelled && setStatus('disconnected'))

    return () => {
      cancelled = true
      connection.stop()
    }
  }, [])

  return status
}
