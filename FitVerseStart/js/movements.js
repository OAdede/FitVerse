import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 1.6, 3.8)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.querySelector('.viewer-container').appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false
controls.autoRotate = true
controls.autoRotateSpeed = 0.5
controls.minPolarAngle = Math.PI / 2
controls.maxPolarAngle = Math.PI / 2

scene.add(new THREE.AmbientLight(0xffffff, 0.4))

const frontLight = new THREE.DirectionalLight(0xffffff, 1.2)
frontLight.position.set(0, 1.5, 5)
scene.add(frontLight)

const backLight = new THREE.DirectionalLight(0xffffff, 0.6)
backLight.position.set(0, 3, -4)
scene.add(backLight)

const rightLight = new THREE.DirectionalLight(0xffffff, 0.8)
rightLight.position.set(3, 2, 2)
scene.add(rightLight)

const leftLight = new THREE.DirectionalLight(0xffffff, 0.8)
leftLight.position.set(-3, 2, 2)
scene.add(leftLight)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let clickableMeshes = []
let hoverLight = null
let hoverTarget = null
let lastMouseEvent = null

const meshMap = {
  'chest': 'chest',
  'abs': 'abs',
  'biceps': 'biceps',
  'triceps': 'triceps',
  'trapezius': 'trapezius',
  'lats': 'lats',
  'shoulders': 'shoulders',
  'glutes': 'glutes',
  'hamstring': 'hamstring',
  'quads': 'quads',
  'calves': 'calves'
}

window.addEventListener('mousemove', (event) => {
  lastMouseEvent = event
})

window.addEventListener('click', (event) => {
  const container = document.querySelector('.viewer-container')
  const rect = container.getBoundingClientRect()
  const mx = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const my = -((event.clientY - rect.top) / rect.height) * 2 + 1
  mouse.set(mx, my)

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(clickableMeshes, true)

  if (intersects.length > 0) {
    const clickedName = intersects[0].object.name
    console.log('🔍 Tıklanan mesh:', clickedName)

    const baseName = clickedName.toLowerCase().split(/[_\.]/)[0]
    const matchedPage = meshMap[baseName]

    if (matchedPage) {
      console.log(`✅ ${baseName} → /src/pages/${matchedPage}.html`)
      window.open(`/src/pages/${matchedPage}.html`, '_blank')
    } else {
      console.warn(`⛔ "${baseName}" için eşleşme yok`)
    }
  }
})

const loader = new GLTFLoader()
loader.load('/models/model_1.glb', (gltf) => {
  gltf.scene.scale.set(1.6, 1.9, 1.6)
  gltf.scene.position.y = -2.1
  scene.add(gltf.scene)

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      const baseName = child.name.toLowerCase().split(/[_\.]/)[0]
      if (meshMap[baseName]) {
        clickableMeshes.push(child)
        console.log('🟢 Aktif mesh:', child.name)
      }
    }
  })
})

function adjustCamera() {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)

  if (width < 768) {
    camera.position.set(0, 1.6, 5.0)
  } else if (width < 1024) {
    camera.position.set(0, 1.6, 4.2)
  } else {
    camera.position.set(0, 1.6, 3.8)
  }
}
window.addEventListener('resize', adjustCamera)
adjustCamera()

function animate() {
  requestAnimationFrame(animate)

  if (lastMouseEvent) {
    const container = document.querySelector('.viewer-container')
    const rect = container.getBoundingClientRect()
    mouse.x = ((lastMouseEvent.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((lastMouseEvent.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(clickableMeshes, true)

    let hoveredMesh = null
    if (intersects.length > 0) {
      const hovered = intersects.find(i => meshMap[i.object.name.toLowerCase().split(/[_\.]/)[0]])?.object
      if (hovered) hoveredMesh = hovered
    }

    if (hoverLight) {
      scene.remove(hoverLight)
      if (hoverTarget) scene.remove(hoverTarget)
      hoverLight = null
      hoverTarget = null
    }

    if (hoveredMesh) {
      const meshPos = hoveredMesh.getWorldPosition(new THREE.Vector3())

      hoverTarget = new THREE.Object3D()
      hoverTarget.position.copy(meshPos)
      scene.add(hoverTarget)

      hoverLight = new THREE.SpotLight(0xffcc88, 2, 6, Math.PI / 6, 0.4)
      hoverLight.position.set(meshPos.x, meshPos.y + 1.5, meshPos.z + 2)
      hoverLight.target = hoverTarget

      scene.add(hoverLight)
    }
  }

  controls.update()
  renderer.render(scene, camera)
}
animate()
