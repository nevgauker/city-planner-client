import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'

export interface GlobeHandle {
  rotateTo: (lat: number, lng: number) => void
}

const GlobeCanvas = forwardRef<GlobeHandle>(function GlobeCanvas(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<THREE.Mesh | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const isAnimatingRef = useRef(false)

  const mouseStateRef = useRef({ isDown: false, currentX: 0, currentY: 0, velocityX: 0, velocityY: 0 })
  const rotationStateRef = useRef({ x: 0, y: 0 })

  useImperativeHandle(ref, () => ({
    rotateTo: (lat: number, lng: number) => {
      if (!globeRef.current || !cameraRef.current) return

      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      const startRotY = rotationStateRef.current.y
      const startRotX = rotationStateRef.current.x
      const targetRotY = theta
      const targetRotX = phi - Math.PI / 2
      const duration = 2000
      const startTime = Date.now()

      isAnimatingRef.current = true
      mouseStateRef.current.velocityX = 0
      mouseStateRef.current.velocityY = 0

      const animateRotation = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

        rotationStateRef.current.y = startRotY + (targetRotY - startRotY) * easeProgress
        rotationStateRef.current.x = startRotX + (targetRotX - startRotX) * easeProgress

        if (progress < 1) requestAnimationFrame(animateRotation)
        else isAnimatingRef.current = false
      }
      animateRotation()
    },
  }))

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000)
    camera.position.z = 2.5
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x0a0e27)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Stars
    const starsGeo = new THREE.BufferGeometry()
    const starsVerts: number[] = []
    for (let i = 0; i < 1000; i++) {
      starsVerts.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200)
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVerts), 3))
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 })))

    // Globe
    const geometry = new THREE.SphereGeometry(1, 64, 64)
    const placeholderCanvas = document.createElement('canvas')
    placeholderCanvas.width = 256; placeholderCanvas.height = 256
    const ctx = placeholderCanvas.getContext('2d')!
    ctx.fillStyle = '#1a4d7a'; ctx.fillRect(0, 0, 256, 256)

    const material = new THREE.MeshPhongMaterial({
      map: new THREE.CanvasTexture(placeholderCanvas),
      emissive: 0x1a1a2e, emissiveIntensity: 0.15, shininess: 10, specular: 0x555555,
    })
    const globe = new THREE.Mesh(geometry, material)
    scene.add(globe)
    globeRef.current = globe

    new THREE.TextureLoader().load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => { material.map = tex; material.needsUpdate = true },
    )

    const light1 = new THREE.DirectionalLight(0xffffff, 1.2)
    light1.position.set(5, 3, 5)
    scene.add(light1)
    const light2 = new THREE.DirectionalLight(0x6699ff, 0.4)
    light2.position.set(-8, -2, -5)
    scene.add(light2)
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))

    const onMouseDown = (e: MouseEvent) => { mouseStateRef.current = { ...mouseStateRef.current, isDown: true, currentX: e.clientX, currentY: e.clientY } }
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseStateRef.current.isDown) return
      const dx = e.clientX - mouseStateRef.current.currentX
      const dy = e.clientY - mouseStateRef.current.currentY
      mouseStateRef.current.velocityX = dx * 0.005; mouseStateRef.current.velocityY = dy * 0.005
      rotationStateRef.current.y += dx * 0.005; rotationStateRef.current.x += dy * 0.005
      rotationStateRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationStateRef.current.x))
      mouseStateRef.current.currentX = e.clientX; mouseStateRef.current.currentY = e.clientY
    }
    const onMouseUp = () => { mouseStateRef.current.isDown = false }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      mouseStateRef.current = { ...mouseStateRef.current, isDown: true, currentX: e.touches[0].clientX, currentY: e.touches[0].clientY }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!mouseStateRef.current.isDown || e.touches.length !== 1) return
      const dx = e.touches[0].clientX - mouseStateRef.current.currentX
      const dy = e.touches[0].clientY - mouseStateRef.current.currentY
      mouseStateRef.current.velocityX = dx * 0.005; mouseStateRef.current.velocityY = dy * 0.005
      rotationStateRef.current.y += dx * 0.005; rotationStateRef.current.x += dy * 0.005
      rotationStateRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationStateRef.current.x))
      mouseStateRef.current.currentX = e.touches[0].clientX; mouseStateRef.current.currentY = e.touches[0].clientY
    }
    const onTouchEnd = () => { mouseStateRef.current.isDown = false }

    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('mouseleave', onMouseUp)
    renderer.domElement.addEventListener('touchstart', onTouchStart)
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true })
    renderer.domElement.addEventListener('touchend', onTouchEnd)

    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      if (globeRef.current) {
        globeRef.current.rotation.x = rotationStateRef.current.x
        globeRef.current.rotation.y = rotationStateRef.current.y
        if (!mouseStateRef.current.isDown && !isAnimatingRef.current) {
          rotationStateRef.current.y += mouseStateRef.current.velocityX
          rotationStateRef.current.x += mouseStateRef.current.velocityY
          mouseStateRef.current.velocityX *= 0.95
          mouseStateRef.current.velocityY *= 0.95
          if (Math.abs(mouseStateRef.current.velocityX) < 0.0001) mouseStateRef.current.velocityX = 0
          if (Math.abs(mouseStateRef.current.velocityY) < 0.0001) mouseStateRef.current.velocityY = 0
        }
      }
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = containerRef.current?.clientWidth || width
      const h = containerRef.current?.clientHeight || height
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('mouseleave', onMouseUp)
      renderer.domElement.removeEventListener('touchstart', onTouchStart)
      renderer.domElement.removeEventListener('touchmove', onTouchMove)
      renderer.domElement.removeEventListener('touchend', onTouchEnd)
      cancelAnimationFrame(animationId)
      renderer.dispose(); geometry.dispose(); material.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
})

export default GlobeCanvas
