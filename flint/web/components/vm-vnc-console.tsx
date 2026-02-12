"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslation } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Monitor, AlertCircle, Maximize2, Minimize2 } from "lucide-react"

interface VMVNCConsoleProps {
  vmUuid: string
}

// Declare global RFB from noVNC
declare global {
  interface Window {
    RFB: any
  }
}

export function VMVNCConsole({ vmUuid }: VMVNCConsoleProps) {
  const { t } = useTranslation()
  const vncContainerRef = useRef<HTMLDivElement>(null)
  const rfbRef = useRef<any>(null)

  const [isConnecting, setIsConnecting] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  // Load noVNC from CDN
  useEffect(() => {
    if (typeof window === 'undefined' || window.RFB) {
      setIsScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@novnc/novnc@latest/lib/rfb.js'
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => {
      setError('Failed to load noVNC library')
      setIsConnecting(false)
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!isScriptLoaded || !vncContainerRef.current || !vmUuid) return

    const initializeVNC = async () => {
      try {
        setIsConnecting(true)
        setError(null)

        // Wait for RFB to be available
        let attempts = 0
        while (!window.RFB && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        if (!window.RFB) {
          throw new Error('noVNC RFB not available')
        }

        // Get API key for authentication
        const apiKeyResponse = await fetch('/api/api-key', {
          credentials: 'include'
        })

        if (!apiKeyResponse.ok) {
          throw new Error('Failed to get API key')
        }

        const apiKey = await apiKeyResponse.text()

        // Get VNC connection details
        const vncInfoResponse = await fetch(`/api/vms/${vmUuid}/vnc`, {
          credentials: 'include'
        })

        if (!vncInfoResponse.ok) {
          const errorText = await vncInfoResponse.text()
          throw new Error(`Failed to get VNC info: ${errorText}`)
        }

        const vncInfo = await vncInfoResponse.json()

        // Construct WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/api/vms/${vmUuid}/vnc/ws?token=${encodeURIComponent(apiKey)}`

        // Clear container
        vncContainerRef.current!.innerHTML = ''

        // Initialize noVNC RFB client
        const rfb = new window.RFB(vncContainerRef.current, wsUrl, {
          credentials: { password: '' },
          shared: true,
        })

        // Configure RFB options
        rfb.scaleViewport = true
        rfb.resizeSession = false
        rfb.showDotCursor = true
        rfb.background = '#000000'

        // Event handlers
        rfb.addEventListener('connect', () => {
          console.log('VNC connected')
          setIsConnecting(false)
          setIsConnected(true)
          setError(null)
        })

        rfb.addEventListener('disconnect', (event: any) => {
          console.log('VNC disconnected:', event.detail)
          setIsConnecting(false)
          setIsConnected(false)

          if (event.detail.clean) {
            setError('Connection closed')
          } else {
            setError(`Disconnected: ${event.detail.reason || 'Unknown error'}`)
          }
        })

        rfb.addEventListener('credentialsrequired', () => {
          console.log('VNC credentials required')
        })

        rfb.addEventListener('securityfailure', (event: any) => {
          console.error('VNC security failure:', event.detail)
          setError(`Security failure: ${event.detail.reason || 'Authentication failed'}`)
          setIsConnecting(false)
          setIsConnected(false)
        })

        // Store reference
        rfbRef.current = rfb

      } catch (err) {
        console.error('Failed to initialize VNC:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize VNC')
        setIsConnecting(false)
        setIsConnected(false)
      }
    }

    initializeVNC()

    // Cleanup
    return () => {
      if (rfbRef.current) {
        try {
          rfbRef.current.disconnect()
        } catch (e) {
          console.error('Error disconnecting VNC:', e)
        }
        rfbRef.current = null
      }
    }
  }, [vmUuid, isScriptLoaded])

  const toggleFullscreen = () => {
    if (!vncContainerRef.current) return

    if (!document.fullscreenElement) {
      vncContainerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const reconnect = () => {
    if (rfbRef.current) {
      try {
        rfbRef.current.disconnect()
      } catch (e) {
        console.error('Error during reconnect cleanup:', e)
      }
      rfbRef.current = null
    }

    setError(null)
    setIsConnecting(true)
    setIsConnected(false)

    // Trigger re-initialization
    setIsScriptLoaded(false)
    setTimeout(() => setIsScriptLoaded(true), 100)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            VNC Console
          </CardTitle>
          <div className="flex gap-2">
            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <><Minimize2 className="h-4 w-4 mr-2" /> Exit Fullscreen</>
                ) : (
                  <><Maximize2 className="h-4 w-4 mr-2" /> Fullscreen</>
                )}
              </Button>
            )}
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={reconnect}
              >
                Reconnect
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isConnecting && (
          <div className="flex items-center justify-center h-96 bg-black rounded-md">
            <div className="flex flex-col items-center gap-2 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Connecting to VNC...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-96 bg-black rounded-md">
            <div className="flex flex-col items-center gap-2 text-white">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div
          ref={vncContainerRef}
          className={`vnc-container bg-black rounded-md ${
            !isConnecting && !error ? 'block' : 'hidden'
          }`}
          style={{
            minHeight: '600px',
            width: '100%',
            position: 'relative',
          }}
        />
      </CardContent>
    </Card>
  )
}
