import * as THREE from 'three'

export const boxGeometryToLineSegmentsGeometry = (boxGeometry) => {
  boxGeometry.computeBoundingBox()

  const box = boxGeometry.boundingBox

  const points = []
  points.push(new THREE.Vector3(box.min.x, box.min.y, box.min.z))
  points.push(new THREE.Vector3(box.max.x, box.min.y, box.min.z))
  points.push(new THREE.Vector3(box.min.x, box.max.y, box.min.z))
  points.push(new THREE.Vector3(box.max.x, box.max.y, box.min.z))
  points.push(new THREE.Vector3(box.min.x, box.min.y, box.max.z))
  points.push(new THREE.Vector3(box.max.x, box.min.y, box.max.z))
  points.push(new THREE.Vector3(box.min.x, box.max.y, box.max.z))
  points.push(new THREE.Vector3(box.max.x, box.max.y, box.max.z))

  points.push(new THREE.Vector3(box.min.x, box.min.y, box.min.z))
  points.push(new THREE.Vector3(box.min.x, box.max.y, box.min.z))
  points.push(new THREE.Vector3(box.max.x, box.min.y, box.min.z))
  points.push(new THREE.Vector3(box.max.x, box.max.y, box.min.z))
  points.push(new THREE.Vector3(box.min.x, box.min.y, box.max.z))
  points.push(new THREE.Vector3(box.min.x, box.max.y, box.max.z))
  points.push(new THREE.Vector3(box.max.x, box.min.y, box.max.z))
  points.push(new THREE.Vector3(box.max.x, box.max.y, box.max.z))

  points.push(new THREE.Vector3(box.min.x, box.min.y, box.min.z))
  points.push(new THREE.Vector3(box.min.x, box.min.y, box.max.z))
  points.push(new THREE.Vector3(box.max.x, box.min.y, box.min.z))
  points.push(new THREE.Vector3(box.max.x, box.min.y, box.max.z))
  points.push(new THREE.Vector3(box.min.x, box.max.y, box.min.z))
  points.push(new THREE.Vector3(box.min.x, box.max.y, box.max.z))
  points.push(new THREE.Vector3(box.max.x, box.max.y, box.min.z))
  points.push(new THREE.Vector3(box.max.x, box.max.y, box.max.z))

  return new THREE.BufferGeometry().setFromPoints(points)
}
