'use client'

import { useRef, useEffect } from 'react'

const InteractiveGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ===================================
    // PARAMÈTRES (Adaptés au thème du site)
    // ===================================
    const config = {
      // --- Grille ---
      cellSize: 22,
      cellBaseAlpha: 0.07,
      cellSpacing: 1,

      // --- Révélation ---
      revealDuration: 2000,
      revealStagger: 2,

      // --- Souris ---
      glowRadius: 350,
      glowPower: 0.5,
      mouseEffectRadius: 250,
      mouseLerpFactor: 0.08,

      // --- Couleurs (depuis tailwind.config.ts) ---
      // accent: #007aff -> 0, 122, 255
      cellColor: '0, 122, 255', 
      // Un peu plus doux pour le halo
      glowColor: '0, 122, 255', 
    }

    let cols: number, rows: number
    let grid: any[] = []
    let mouse = { x: -9999, y: -9999, lerpedX: -9999, lerpedY: -9999 }
    let animationFrameId: number

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    const useEffect = !isReducedMotion && !hasCoarsePointer

    const setupGrid = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      cols = Math.ceil(rect.width / config.cellSize)
      rows = Math.ceil(rect.height / config.cellSize)

      grid = []
      for (let i = 0; i < cols * rows; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        grid.push({
          x: col * config.cellSize,
          y: row * config.cellSize,
          alpha: 0,
          targetAlpha: config.cellBaseAlpha,
          revealStartTime: Date.now() + (col + row) * config.revealStagger + Math.random() * 50,
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end

    const update = () => {
      mouse.lerpedX = lerp(mouse.lerpedX, mouse.x, config.mouseLerpFactor)
      mouse.lerpedY = lerp(mouse.lerpedY, mouse.y, config.mouseLerpFactor)

      grid.forEach((cell) => {
        if (cell.alpha < cell.targetAlpha) {
          const timeSinceReveal = Date.now() - cell.revealStartTime
          if (timeSinceReveal > 0) {
            const revealProgress = Math.min(timeSinceReveal / config.revealDuration, 1)
            cell.alpha = lerp(0, config.cellBaseAlpha, revealProgress)
          }
        }

        const dx = cell.x + config.cellSize / 2 - mouse.lerpedX
        const dy = cell.y + config.cellSize / 2 - mouse.lerpedY
        const dist = Math.sqrt(dx * dx + dy * dy)

        let mouseInfluence = 0
        if (dist < config.mouseEffectRadius) {
          mouseInfluence = (1 - dist / config.mouseEffectRadius) * (1 - config.cellBaseAlpha)
        }

        const finalAlpha = config.cellBaseAlpha + mouseInfluence
        cell.alpha = lerp(cell.alpha, finalAlpha, 0.1)
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // --- 1. Dessiner les cellules ---
      grid.forEach((cell) => {
        if (cell.alpha > 0.001) {
          ctx.fillStyle = `rgba(${config.cellColor}, ${cell.alpha})`
          // Utiliser roundRect pour des coins arrondis
          ctx.beginPath()
          ctx.roundRect(
            cell.x + config.cellSpacing,
            cell.y + config.cellSpacing,
            config.cellSize - config.cellSpacing * 2,
            config.cellSize - config.cellSpacing * 2,
            2 // Rayon de l'arrondi
          )
          ctx.fill()
        }
      })

      // --- 2. Dessiner le halo de la souris ---
      const glow = ctx.createRadialGradient(
        mouse.lerpedX, mouse.lerpedY, 0,
        mouse.lerpedX, mouse.lerpedY, config.glowRadius
      )
      glow.addColorStop(0, `rgba(${config.glowColor}, ${config.glowPower})`)
      glow.addColorStop(1, `rgba(${config.glowColor}, 0)`)
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1))
    }

    const animate = () => {
      update()
      draw()
      animationFrameId = requestAnimationFrame(animate)
    }

    if (useEffect) {
      setupGrid()
      window.addEventListener('resize', setupGrid, { passive: true })
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.body.addEventListener('mouseleave', handleMouseLeave)
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', setupGrid)
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 bg-dark">
      <canvas ref={canvasRef} className="w-full h-full opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent" />
    </div>
  )
}

export default InteractiveGridBackground
