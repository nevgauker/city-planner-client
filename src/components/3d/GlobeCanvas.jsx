import { useEffect, useRef, forwardRef } from 'react'
import * as THREE from 'three'

const GlobeCanvas = forwardRef(function GlobeCanvas(_, ref) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const globeRef = useRef(null)

  // Mouse/touch interaction state
  const mouseStateRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    velocityX: 0,
    velocityY: 0,
  })

  const rotationStateRef = useRef({
    x: 0,
    y: 0,
  })

  const isAnimatingRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000)
    camera.position.z = 2.5
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x0a0e27)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Starfield background
    const starsGeometry = new THREE.BufferGeometry()
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 })
    const starsVertices = []
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200
      const y = (Math.random() - 0.5) * 200
      const z = (Math.random() - 0.5) * 200
      starsVertices.push(x, y, z)
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVertices), 3))
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Create globe
    const geometry = new THREE.SphereGeometry(1, 64, 64)

    // Improved Perlin noise implementation (better than simple sine waves)
    const permutation = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
      247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
      57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
      60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
      65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 234, 36, 120, 151,
      107, 42, 144, 146, 157, 30, 135, 24, 52, 65, 153, 34, 63, 20, 109, 129,
      130, 201, 205, 144, 175, 178, 119, 33, 56, 139, 76, 76, 76, 76, 76, 34,
      4, 30, 135, 24, 52, 65, 153, 34, 63, 20, 109, 129, 130, 201, 205, 144,
    ]

    const p = permutation.concat(permutation)

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
    const lerp = (t, a, b) => a + t * (b - a)
    const grad = (hash, x, y, z) => {
      const h = hash & 15
      const u = h < 8 ? x : y
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
    }

    const perlinNoise = (x, y, z) => {
      const xi = Math.floor(x) & 255
      const yi = Math.floor(y) & 255
      const zi = Math.floor(z) & 255

      const xf = x - Math.floor(x)
      const yf = y - Math.floor(y)
      const zf = z - Math.floor(z)

      const u = fade(xf)
      const v = fade(yf)
      const w = fade(zf)

      const aaa = p[p[p[xi] + yi] + zi]
      const aba = p[p[p[xi] + yi + 1] + zi]
      const aab = p[p[p[xi] + yi] + zi + 1]
      const abb = p[p[p[xi] + yi + 1] + zi + 1]
      const baa = p[p[p[xi + 1] + yi] + zi]
      const bba = p[p[p[xi + 1] + yi + 1] + zi]
      const bab = p[p[p[xi + 1] + yi] + zi + 1]
      const bbb = p[p[p[xi + 1] + yi + 1] + zi + 1]

      const g0 = grad(aaa, xf, yf, zf)
      const g1 = grad(baa, xf - 1, yf, zf)
      const g2 = grad(aba, xf, yf - 1, zf)
      const g3 = grad(bba, xf - 1, yf - 1, zf)
      const g4 = grad(aab, xf, yf, zf - 1)
      const g5 = grad(bab, xf - 1, yf, zf - 1)
      const g6 = grad(abb, xf, yf - 1, zf - 1)
      const g7 = grad(bbb, xf - 1, yf - 1, zf - 1)

      const l0 = lerp(u, g0, g1)
      const l1 = lerp(u, g2, g3)
      const l2 = lerp(u, g4, g5)
      const l3 = lerp(u, g6, g7)
      const l4 = lerp(v, l0, l1)
      const l5 = lerp(v, l2, l3)

      return lerp(w, l4, l5)
    }

    // Multi-octave Perlin noise with geographical bias
    const getTerrainValue = (lon, lat) => {
      let value = 0
      let amplitude = 1
      let frequency = 1
      let maxValue = 0

      // Create continents in realistic locations
      // North America
      if (lon > -2.5 && lon < -0.5 && lat > 0.2 && lat < 0.9) {
        value += 0.4 * amplitude
      }
      // South America
      if (lon > -1.8 && lon < -0.5 && lat > -1.2 && lat < 0.1) {
        value += 0.3 * amplitude
      }
      // Europe/Africa
      if (lon > -0.5 && lon < 1.5 && lat > -1.2 && lat < 0.9) {
        value += 0.35 * amplitude
      }
      // Asia
      if (lon > 1 && lon < 3 && lat > -0.5 && lat < 0.9) {
        value += 0.4 * amplitude
      }
      // Australia
      if (lon > 2.2 && lon < 2.8 && lat > -0.8 && lat < -0.2) {
        value += 0.25 * amplitude
      }

      // Add Perlin noise for realistic coastlines (6 octaves)
      for (let i = 0; i < 6; i++) {
        const noiseVal = perlinNoise(
          lon * frequency * 3,
          lat * frequency * 3,
          (i * 10 + 42) * 0.1
        )
        value += amplitude * noiseVal
        maxValue += amplitude
        amplitude *= 0.55
        frequency *= 1.9
      }

      return value / (maxValue + 1)
    }

    // Create placeholder texture
    const placeholderCanvas = document.createElement('canvas')
    placeholderCanvas.width = 256
    placeholderCanvas.height = 256
    const placeholderCtx = placeholderCanvas.getContext('2d')
    placeholderCtx.fillStyle = '#1a4d7a'
    placeholderCtx.fillRect(0, 0, 256, 256)
    const texture = new THREE.CanvasTexture(placeholderCanvas)

    // Try to load a realistic Earth texture from CDN
    const textureLoader = new THREE.TextureLoader()
    const earthTextureUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg'

    textureLoader.load(
      earthTextureUrl,
      (loadedTexture) => {
        console.log('✓ Realistic Earth texture loaded')
        if (globeRef.current && globeRef.current.material) {
          globeRef.current.material.map = loadedTexture
          globeRef.current.material.needsUpdate = true
        }
      },
      undefined,
      (error) => {
        console.warn('Earth texture failed to load, using procedural generation')
        const canvas = document.createElement('canvas')
        canvas.width = 2048
        canvas.height = 1024
        const ctx = canvas.getContext('2d')

        const imageData = ctx.createImageData(canvas.width, canvas.height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          const pixel = i / 4
          const x = pixel % canvas.width
          const y = Math.floor(pixel / canvas.width)

          const lon = (x / canvas.width) * Math.PI * 2 - Math.PI
          const lat = (y / canvas.height) * Math.PI - Math.PI / 2

          const terrainValue = getTerrainValue(lon, lat)
          const landThreshold = 0.4

          let r, g, b

          if (terrainValue > landThreshold) {
            const heightFactor = Math.min(1, (terrainValue - landThreshold) / (1 - landThreshold))

            if (lat > 0.3 && lat < 0.7 && heightFactor < 0.3) {
              r = Math.round(20 + heightFactor * 40)
              g = Math.round(80 + heightFactor * 50)
              b = Math.round(20)
            } else if (heightFactor < 0.4) {
              r = Math.round(50 + heightFactor * 40)
              g = Math.round(100 + heightFactor * 40)
              b = Math.round(30 + heightFactor * 20)
            } else if (heightFactor < 0.65) {
              r = Math.round(100 + heightFactor * 50)
              g = Math.round(120 + heightFactor * 30)
              b = Math.round(50 + heightFactor * 20)
            } else {
              r = Math.round(140 + heightFactor * 60)
              g = Math.round(140 + heightFactor * 40)
              b = Math.round(120 + heightFactor * 40)
            }

            const noise = (Math.random() - 0.5) * 15
            r = Math.max(0, Math.min(255, r + noise))
            g = Math.max(0, Math.min(255, g + noise))
            b = Math.max(0, Math.min(255, b + noise))
          } else {
            const depthFactor = (landThreshold - terrainValue) / landThreshold

            if (depthFactor < 0.25) {
              r = 100
              g = 160
              b = 200
            } else if (depthFactor < 0.5) {
              r = 50
              g = 120
              b = 190
            } else if (depthFactor < 0.8) {
              r = 20
              g = 80
              b = 160
            } else {
              r = 10
              g = 50
              b = 130
            }

            const waterNoise = (Math.random() - 0.5) * 20
            r = Math.max(0, Math.min(255, r + waterNoise))
            g = Math.max(0, Math.min(255, g + waterNoise))
            b = Math.max(0, Math.min(255, b + waterNoise))
          }

          data[i] = r
          data[i + 1] = g
          data[i + 2] = b
          data[i + 3] = 255
        }

        ctx.putImageData(imageData, 0, 0)
        const fallbackTexture = new THREE.CanvasTexture(canvas)
        if (globeRef.current && globeRef.current.material) {
          globeRef.current.material.map = fallbackTexture
          globeRef.current.material.needsUpdate = true
        }
      }
    )

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: 0x1a1a2e, // Slight self-glow for realistic depth
      emissiveIntensity: 0.15,
      shininess: 10, // Ocean shine
      specular: 0x555555, // More visible ocean reflections
    })

    const globe = new THREE.Mesh(geometry, material)
    scene.add(globe)
    globeRef.current = globe

    // Lighting setup - Google Earth style
    // Main sun light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
    sunLight.position.set(5, 3, 5)
    sunLight.castShadow = false
    scene.add(sunLight)

    // Rim/edge light for depth
    const rimLight = new THREE.DirectionalLight(0x6699ff, 0.4)
    rimLight.position.set(-8, -2, -5)
    scene.add(rimLight)

    // Bottom fill light for subtle shadows
    const fillLight = new THREE.DirectionalLight(0x3366cc, 0.2)
    fillLight.position.set(0, -5, 0)
    scene.add(fillLight)

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    // Mouse/Touch Event Handlers
    const handleMouseDown = (e) => {
      mouseStateRef.current.isDown = true
      mouseStateRef.current.startX = e.clientX
      mouseStateRef.current.startY = e.clientY
      mouseStateRef.current.currentX = e.clientX
      mouseStateRef.current.currentY = e.clientY
    }

    const handleMouseMove = (e) => {
      if (!mouseStateRef.current.isDown) return

      const deltaX = e.clientX - mouseStateRef.current.currentX
      const deltaY = e.clientY - mouseStateRef.current.currentY

      // Store velocity for inertia
      mouseStateRef.current.velocityX = deltaX * 0.005
      mouseStateRef.current.velocityY = deltaY * 0.005

      // Update rotation state
      rotationStateRef.current.y += deltaX * 0.005
      rotationStateRef.current.x += deltaY * 0.005

      // Clamp x rotation to prevent flipping
      rotationStateRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationStateRef.current.x))

      mouseStateRef.current.currentX = e.clientX
      mouseStateRef.current.currentY = e.clientY
    }

    const handleMouseUp = () => {
      mouseStateRef.current.isDown = false
    }

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        mouseStateRef.current.isDown = true
        mouseStateRef.current.startX = e.touches[0].clientX
        mouseStateRef.current.startY = e.touches[0].clientY
        mouseStateRef.current.currentX = e.touches[0].clientX
        mouseStateRef.current.currentY = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e) => {
      if (!mouseStateRef.current.isDown || e.touches.length !== 1) return

      const deltaX = e.touches[0].clientX - mouseStateRef.current.currentX
      const deltaY = e.touches[0].clientY - mouseStateRef.current.currentY

      mouseStateRef.current.velocityX = deltaX * 0.005
      mouseStateRef.current.velocityY = deltaY * 0.005

      rotationStateRef.current.y += deltaX * 0.005
      rotationStateRef.current.x += deltaY * 0.005

      rotationStateRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationStateRef.current.x))

      mouseStateRef.current.currentX = e.touches[0].clientX
      mouseStateRef.current.currentY = e.touches[0].clientY
    }

    const handleTouchEnd = () => {
      mouseStateRef.current.isDown = false
    }

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('mouseleave', handleMouseUp)

    renderer.domElement.addEventListener('touchstart', handleTouchStart)
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: true })
    renderer.domElement.addEventListener('touchend', handleTouchEnd)

    // Animation loop with inertia
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (globeRef.current) {
        // Apply manual rotation
        globeRef.current.rotation.x = rotationStateRef.current.x
        globeRef.current.rotation.y = rotationStateRef.current.y

        // Apply inertia (continued rotation after drag)
        if (!mouseStateRef.current.isDown && !isAnimatingRef.current) {
          rotationStateRef.current.y += mouseStateRef.current.velocityX
          rotationStateRef.current.x += mouseStateRef.current.velocityY

          // Dampen velocity over time
          mouseStateRef.current.velocityX *= 0.95
          mouseStateRef.current.velocityY *= 0.95

          // Stop inertia when velocity is very small
          if (Math.abs(mouseStateRef.current.velocityX) < 0.0001) {
            mouseStateRef.current.velocityX = 0
          }
          if (Math.abs(mouseStateRef.current.velocityY) < 0.0001) {
            mouseStateRef.current.velocityY = 0
          }
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width
      const newHeight = containerRef.current?.clientHeight || height
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)

      // Remove event listeners
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp)

      renderer.domElement.removeEventListener('touchstart', handleTouchStart)
      renderer.domElement.removeEventListener('touchmove', handleTouchMove)
      renderer.domElement.removeEventListener('touchend', handleTouchEnd)

      cancelAnimationFrame(animationId)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  // Expose rotateTo method
  useEffect(() => {
    if (ref) {
      ref.current = {
        rotateTo: (lat, lng) => {
          if (!globeRef.current || !cameraRef.current) return

          // Convert lat/lng to rotation angles
          const phi = (90 - lat) * (Math.PI / 180) // Latitude to phi
          const theta = (lng + 180) * (Math.PI / 180) // Longitude to theta

          // Animate camera and globe to point toward the location
          const startRotY = rotationStateRef.current.y
          const startRotX = rotationStateRef.current.x

          // Target rotations
          const targetRotY = theta
          const targetRotX = phi - Math.PI / 2

          const duration = 2000 // 2 seconds
          const startTime = Date.now()

          // Disable inertia during animation
          isAnimatingRef.current = true
          mouseStateRef.current.velocityX = 0
          mouseStateRef.current.velocityY = 0

          const animateRotation = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Easing function (easeInOutQuad)
            const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

            rotationStateRef.current.y = startRotY + (targetRotY - startRotY) * easeProgress
            rotationStateRef.current.x = startRotX + (targetRotX - startRotX) * easeProgress

            if (progress < 1) {
              requestAnimationFrame(animateRotation)
            } else {
              // Re-enable inertia after animation completes
              isAnimatingRef.current = false
            }
          }

          animateRotation()
        },
      }
    }
  }, [ref])

  return <div ref={containerRef} className="w-full h-full" />
})

export default GlobeCanvas
