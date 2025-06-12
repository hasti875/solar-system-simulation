const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(40, 30, 40);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const planetData = [
  { name: 'Mercury', color: 0x6A0DAD, distance: 6, size: 0.3, speed: 0.02 },
  { name: 'Venus', color: 0x556B2F, distance: 8, size: 0.6, speed: 0.015 },
  { name: 'Earth', color: 0x2E70C9, distance: 11, size: 0.65, speed: 0.012 },
  { name: 'Mars', color: 0xB22222, distance: 14, size: 0.5, speed: 0.010 },
  { name: 'Jupiter', color: 0xcc9966, distance: 18, size: 1.5, speed: 0.007 },
  { name: 'Saturn', color: 0xFF69B4, distance: 23, size: 1.2, speed: 0.005 },
  { name: 'Uranus', color: 0xBA55D3, distance: 28, size: 1.0, speed: 0.003 },
  { name: 'Neptune', color: 0x00008b, distance: 33, size: 1.0, speed: 0.002 },
];

const planets = [];
const orbitAngles = {};
const speeds = {};
const controlsDiv = document.getElementById('controls');

planetData.forEach((planet) => {
  const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = planet.distance;
  mesh.userData = { name: planet.name };
  scene.add(mesh);

  const orbitCurve = new THREE.EllipseCurve(
    0, 0, planet.distance, planet.distance, 0, 2 * Math.PI, false, 0
  );
  const orbitPoints = orbitCurve.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
    orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
  );
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });
  const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);

  planets.push({ mesh, distance: planet.distance });
  orbitAngles[planet.name] = Math.random() * Math.PI * 2;
  speeds[planet.name] = planet.speed;

  const sliderContainer = document.createElement('div');
  sliderContainer.classList.add('slider-container');
  sliderContainer.innerHTML = `
    <label for="${planet.name}">${planet.name} Speed:</label><br>
    <input type="range" min="0.001" max="0.05" step="0.001" value="${planet.speed}" id="${planet.name}"/>
  `;
  controlsDiv.appendChild(sliderContainer);

  document.getElementById(planet.name).addEventListener('input', (e) => {
    speeds[planet.name] = parseFloat(e.target.value);
  });
});

let isPaused = false;
const pauseButton = document.createElement('button');
pauseButton.id = 'pauseButton';
pauseButton.textContent = 'Pause';
controlsDiv.appendChild(pauseButton);
pauseButton.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  if (!isPaused) {
    const delta = clock.getDelta();
    planets.forEach((planet, i) => {
      const name = planetData[i].name;
      orbitAngles[name] += speeds[name] * delta * 60;
      planet.mesh.position.x = Math.cos(orbitAngles[name]) * planet.distance;
      planet.mesh.position.z = Math.sin(orbitAngles[name]) * planet.distance;
    });
  }
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const popup = document.getElementById("popup");

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planetName = intersects[0].object.userData.name;
    popup.textContent = planetName;
    popup.style.left = event.clientX + 10 + "px";
    popup.style.top = event.clientY + 10 + "px";
    popup.style.display = "block";
  } else {
    popup.style.display = "none";
  }
}

window.addEventListener("mousemove", onMouseMove);
