/**
 * A small, self-contained 3D companion for the homepage FAQ.
 * Geometry is procedural; the original logo and fallback image stay untouched.
 * The loader controls offscreen playback through setPaused() or data-paused.
 */
export async function mountMascot(host) {
  if (!host || !host.isConnected) return null;

  let THREE;
  try {
    THREE = await import('./three.module.min.js');
  } catch {
    return null;
  }
  if (!host.isConnected) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
      preserveDrawingBuffer: true,
    });
  } catch {
    return null;
  }

  const canvas = renderer.domElement;
  canvas.className = 'ect-home-faq__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.92, 1.92, 1.92, -1.92, 0.1, 40);
  camera.position.set(3.3, 3.0, 8.4);
  camera.lookAt(0, 1.5, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xffc297, 1.65));
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const keyLight = new THREE.DirectionalLight(0xfff4e8, 3.1);
  keyLight.position.set(-3.5, 6.5, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -3;
  keyLight.shadow.camera.right = 3;
  keyLight.shadow.camera.top = 4.5;
  keyLight.shadow.camera.bottom = -1;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 15;
  keyLight.shadow.normalBias = 0.045;
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.radius = 3;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xe8f8ff, 1.05);
  fillLight.position.set(4, 3, 4);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
  rimLight.position.set(0, 4.5, -4);
  scene.add(rimLight);

  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const keepGeometry = geometry => (geometries.add(geometry), geometry);
  const keepMaterial = material => (materials.add(material), material);
  const orange = keepMaterial(new THREE.MeshPhysicalMaterial({
    color: 0xff6c2a, roughness: 0.47, metalness: 0, clearcoat: 0.12,
    clearcoatRoughness: 0.55,
  }));
  const warmOrange = keepMaterial(new THREE.MeshPhysicalMaterial({
    color: 0xfd8649, roughness: 0.54, metalness: 0, clearcoat: 0.08,
  }));
  const white = keepMaterial(new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.34, metalness: 0, clearcoat: 0.16,
  }));
  const paper = keepMaterial(new THREE.MeshStandardMaterial({
    color: 0xfffdf8, roughness: 0.84, metalness: 0, side: THREE.DoubleSide,
  }));
  const pageInk = keepMaterial(new THREE.MeshStandardMaterial({
    color: 0xf1b18c, roughness: 0.82, metalness: 0,
  }));
  const skin = keepMaterial(new THREE.MeshStandardMaterial({
    color: 0xf0b798, roughness: 0.68, metalness: 0,
  }));
  const skinAccent = keepMaterial(new THREE.MeshStandardMaterial({
    color: 0xe8a186, roughness: 0.72, metalness: 0,
  }));
  const hair = keepMaterial(new THREE.MeshStandardMaterial({
    color: 0x493022, roughness: 0.64, metalness: 0,
  }));
  const hairHighlight = keepMaterial(new THREE.MeshStandardMaterial({
    color: 0x6c4936, roughness: 0.7, metalness: 0,
  }));
  const charcoal = keepMaterial(new THREE.MeshStandardMaterial({
    color: 0x302b2b, roughness: 0.46, metalness: 0,
  }));
  const smileMaterial = keepMaterial(new THREE.MeshStandardMaterial({
    color: 0x92584a, roughness: 0.78, metalness: 0,
  }));
  const sphereGeometry = keepGeometry(new THREE.SphereGeometry(1, 32, 24));
  const shortCapsule = keepGeometry(new THREE.CapsuleGeometry(0.145, 1, 6, 16));

  function mesh(geometry, material, parent, position = [0, 0, 0]) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function sphere(parent, position, scale, material = orange) {
    const object = mesh(sphereGeometry, material, parent, position);
    object.scale.set(...scale);
    return object;
  }
  function tube(parent, points, radius, material = white, segments = 24) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    return mesh(keepGeometry(new THREE.TubeGeometry(curve, segments, radius, 8, false)), material, parent);
  }
  function box(parent, dimensions, material, position) {
    return mesh(keepGeometry(new THREE.BoxGeometry(...dimensions)), material, parent, position);
  }

  const figure = new THREE.Group();
  figure.rotation.y = -0.11;
  scene.add(figure);

  // An adult illustrated human, seated in a soft orange sweater and trousers.
  const body = new THREE.Group();
  figure.add(body);
  sphere(body, [0, 1.18, -0.04], [0.64, 0.75, 0.43], warmOrange);
  sphere(body, [0, 0.62, 0], [0.66, 0.34, 0.45]);
  sphere(body, [0, 1.92, 0], [0.145, 0.23, 0.14], skin);
  tube(figure, [[-0.3, 0.56, -0.05], [-0.86, 0.33, 0.33], [-0.79, 0.24, 0.63], [0.53, 0.19, 0.91]], 0.215, warmOrange, 32);
  tube(figure, [[0.33, 0.55, -0.05], [0.89, 0.36, 0.33], [0.72, 0.25, 0.54], [-0.59, 0.18, 0.71]], 0.215, orange, 32);
  const leftShoe = sphere(figure, [-0.66, 0.2, 0.75], [0.3, 0.18, 0.36], white);
  leftShoe.rotation.y = -0.65;
  const rightShoe = sphere(figure, [0.61, 0.2, 0.96], [0.3, 0.18, 0.36], white);
  rightShoe.rotation.y = 0.7;

  const collar = new THREE.Group();
  collar.position.set(0, 1.84, 0.345);
  body.add(collar);
  const collarShape = new THREE.Shape();
  collarShape.moveTo(0.025, 0.04);
  collarShape.lineTo(0.18, 0.105);
  collarShape.quadraticCurveTo(0.245, -0.03, 0.225, -0.13);
  collarShape.lineTo(0.05, -0.05);
  collarShape.closePath();
  const collarGeometry = keepGeometry(new THREE.ExtrudeGeometry(collarShape, {
    depth: 0.03, bevelEnabled: true, bevelSize: 0.008,
    bevelThickness: 0.008, bevelSegments: 2, curveSegments: 10,
  }));
  mesh(collarGeometry, white, collar);
  const collarLeft = mesh(collarGeometry, white, collar);
  collarLeft.scale.x = -1;
  const bowTie = new THREE.Group();
  bowTie.position.set(0, 1.73, 0.435);
  bowTie.scale.setScalar(0.48);
  body.add(bowTie);
  const bowWing = new THREE.Shape();
  bowWing.moveTo(0.045, 0);
  bowWing.bezierCurveTo(0.12, 0.085, 0.26, 0.17, 0.34, 0.145);
  bowWing.bezierCurveTo(0.395, 0.095, 0.395, -0.095, 0.34, -0.145);
  bowWing.bezierCurveTo(0.26, -0.17, 0.12, -0.085, 0.045, 0);
  const bowGeometry = keepGeometry(new THREE.ExtrudeGeometry(bowWing, {
    depth: 0.075, bevelEnabled: true, bevelSize: 0.02,
    bevelThickness: 0.02, bevelSegments: 3, curveSegments: 12, steps: 1,
  }));
  mesh(bowGeometry, orange, bowTie);
  const secondWing = mesh(bowGeometry, orange, bowTie);
  secondWing.scale.x = -1;
  sphere(bowTie, [0, 0, 0.045], [0.105, 0.115, 0.075], orange);

  const head = new THREE.Group();
  head.position.set(0, 2.52, 0);
  figure.add(head);
  sphere(head, [0, 0, 0], [0.52, 0.64, 0.47], skin);
  // A gently tapered jaw softens the oval face instead of a spherical toy head.
  sphere(head, [0, -0.31, 0.055], [0.355, 0.295, 0.34], skin);
  for (const side of [-1, 1]) {
    sphere(head, [side * 0.515, -0.015, 0.01], [0.093, 0.145, 0.093], skin);
    sphere(head, [side * 0.54, -0.018, 0.067], [0.035, 0.075, 0.035], skinAccent);
  }
  // Short brown hair with a swept forelock and a quiet side part.
  const hairCap = mesh(keepGeometry(new THREE.SphereGeometry(1, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.385)), hair, head, [0, 0.055, -0.025]);
  hairCap.scale.set(0.555, 0.675, 0.485);
  sphere(head, [0, 0.195, -0.185], [0.52, 0.435, 0.345], hair);
  for (const side of [-1, 1]) {
    sphere(head, [side * 0.445, 0.23, -0.045], [0.12, 0.27, 0.34], hair);
  }
  const forelock = sphere(head, [-0.14, 0.425, 0.337], [0.35, 0.13, 0.15], hair);
  forelock.rotation.z = 0.2;
  const smallerForelock = sphere(head, [0.245, 0.445, 0.29], [0.225, 0.105, 0.17], hair);
  smallerForelock.rotation.z = -0.18;
  tube(head, [[0.19, 0.625, 0.2], [0.115, 0.535, 0.345], [0.1, 0.43, 0.444]], 0.011, hairHighlight, 20);

  const glassesGeometry = keepGeometry(new THREE.TorusGeometry(0.157, 0.0205, 10, 40));
  const eyes = [];
  const pupils = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.19, 0.065, 0.465);
    head.add(eye);
    // Small embedded eyes, without protruding white eyeballs.
    sphere(eye, [0, 0, 0.002], [0.061, 0.035, 0.013], white);
    const pupil = sphere(eye, [0, -0.014, 0.014], [0.021, 0.021, 0.010], charcoal);
    sphere(pupil, [-0.25, 0.34, 0.84], [0.15, 0.14, 0.15], white);
    eyes.push(eye);
    pupils.push(pupil);
    mesh(glassesGeometry, charcoal, head, [side * 0.19, 0.074, 0.502]);
    tube(head, [[side * 0.342, 0.079, 0.499], [side * 0.43, 0.091, 0.354], [side * 0.523, 0.03, 0.06]], 0.016, charcoal, 20);
    tube(head, [[side * 0.29, 0.247, 0.414], [side * 0.21, 0.266, 0.444], [side * 0.12, 0.253, 0.453]], 0.014, hair, 20);
  }
  tube(head, [[-0.035, 0.082, 0.505], [0, 0.105, 0.529], [0.035, 0.082, 0.505]], 0.018, charcoal, 12);
  sphere(head, [0, -0.067, 0.468], [0.067, 0.09, 0.095], skin);
  sphere(head, [0, -0.1, 0.509], [0.059, 0.047, 0.065], skin);
  const frontOfHead = (x, y) => 0.47 * Math.sqrt(1 - (x / 0.52) ** 2 - (y / 0.64) ** 2) + 0.013;
  tube(head, [[-0.135, -0.25, frontOfHead(-0.135, -0.25)], [-0.07, -0.276, frontOfHead(-0.07, -0.276)], [0, -0.282, frontOfHead(0, -0.282)], [0.07, -0.276, frontOfHead(0.07, -0.276)], [0.135, -0.25, frontOfHead(0.135, -0.25)]], 0.01, smileMaterial, 28);

  // Sweater sleeves follow articulated arms; natural hands grip the book.
  function makeArm(side) {
    const group = new THREE.Group();
    figure.add(group);
    const shoulder = new THREE.Vector3(side * 0.57, 1.62, 0.08);
    sphere(group, shoulder.toArray(), [0.185, 0.185, 0.185], warmOrange);
    const upper = mesh(shortCapsule, warmOrange, group);
    const elbow = sphere(group, [0, 0, 0], [0.145, 0.145, 0.145], warmOrange);
    const forearm = mesh(shortCapsule, warmOrange, group);
    const hand = new THREE.Group();
    group.add(hand);
    sphere(hand, [0, 0, 0], [0.112, 0.073, 0.083], skin);
    for (const finger of [-1.5, -0.5, 0.5, 1.5]) {
      sphere(hand, [finger * 0.047, -0.012, 0.069], [0.025, 0.046, 0.046], skin);
    }
    sphere(hand, [-side * 0.102, 0.04, 0.034], [0.046, 0.064, 0.04], skin);
    return { group, shoulder, upper, elbow, forearm, hand, side };
  }
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const boneVector = new THREE.Vector3();
  function positionBone(bone, start, end) {
    boneVector.copy(end).sub(start);
    bone.position.copy(start).add(end).multiplyScalar(0.5);
    bone.scale.set(1, Math.max(0.05, boneVector.length()) / 1.29, 1);
    bone.quaternion.setFromUnitVectors(yAxis, boneVector.normalize());
  }
  function positionArm(arm, elbow, hand, turning = 0) {
    arm.elbow.position.copy(elbow);
    arm.hand.position.copy(hand);
    arm.hand.rotation.set(-0.3 + turning * 0.2, arm.side * 0.15, arm.side * 0.15);
    positionBone(arm.upper, arm.shoulder, elbow);
    positionBone(arm.forearm, elbow, hand);
  }

  // Covers, paper blocks and the turning sheet are all genuine 3D surfaces.
  const book = new THREE.Group();
  book.position.set(0, 1.055, 0.89);
  book.rotation.x = -1.045;
  figure.add(book);
  for (const side of [-1, 1]) {
    const leaf = new THREE.Group();
    leaf.rotation.y = -side * 0.075;
    book.add(leaf);
    box(leaf, [0.595, 0.835, 0.065], orange, [side * 0.302, 0, -0.065]);
    box(leaf, [0.562, 0.77, 0.06], paper, [side * 0.29, 0, 0]);
    for (let line = 0; line < 5; line++) {
      const lineLength = line === 4 ? 0.265 : 0.365;
      box(leaf, [lineLength, 0.011, 0.0025], pageInk, [side * 0.295, 0.23 - line * 0.072, 0.0316]);
    }
    for (let layer = 0; layer < 3; layer++) {
      box(leaf, [0.56, 0.0025, 0.003], pageInk, [side * 0.29, -0.386, -0.018 + layer * 0.017]);
    }
  }
  const spine = box(book, [0.042, 0.835, 0.096], warmOrange, [0, 0, -0.048]);
  spine.castShadow = false;

  const pagePivot = new THREE.Group();
  pagePivot.position.z = 0.039;
  book.add(pagePivot);
  const pageGeometry = keepGeometry(new THREE.PlaneGeometry(0.56, 0.766, 12, 12));
  pageGeometry.translate(0.28, 0, 0);
  const pagePositions = pageGeometry.attributes.position;
  const pageRestPositions = new Float32Array(pagePositions.array);
  const turningPage = mesh(pageGeometry, paper, pagePivot);
  turningPage.castShadow = true;
  const turningLines = new THREE.Group();
  pagePivot.add(turningLines);
  for (let line = 0; line < 5; line++) {
    const lineLength = line === 4 ? 0.255 : 0.36;
    box(turningLines, [lineLength, 0.011, 0.002], pageInk, [0.295, 0.23 - line * 0.072, 0.003]);
  }

  // A restrained contact shadow grounds the toy on the transparent canvas.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext('2d');
  if (shadowContext) {
    const gradient = shadowContext.createRadialGradient(64, 64, 6, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(70, 34, 15, 0.24)');
    gradient.addColorStop(0.5, 'rgba(70, 34, 15, 0.1)');
    gradient.addColorStop(1, 'rgba(70, 34, 15, 0)');
    shadowContext.fillStyle = gradient;
    shadowContext.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    textures.add(shadowTexture);
    const shadowMaterial = keepMaterial(new THREE.MeshBasicMaterial({
      map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false,
    }));
    const contactShadow = mesh(keepGeometry(new THREE.PlaneGeometry(2.8, 2.05)), shadowMaterial, scene, [0, 0.014, 0.3]);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.castShadow = false;
    contactShadow.receiveShadow = false;
  }
  // Marketing delight: a slow 12 s reading cycle, not a floating image.
  // Page rotation uses the animate skill's strong ease-in-out curve.
  function easeInOut(progress) {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    const x1 = 0.77, y1 = 0, x2 = 0.175, y2 = 1;
    const cubic = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
    let low = 0, high = 1, t = progress;
    for (let iteration = 0; iteration < 12; iteration++) {
      if (cubic(t, x1, x2) < progress) low = t;
      else high = t;
      t = (low + high) * 0.5;
    }
    return cubic(t, y1, y2);
  }
  const handPosition = new THREE.Vector3();
  const leftHand = new THREE.Vector3(-0.61, 1.13, 1.025);
  const rightHandRest = new THREE.Vector3(0.615, 1.13, 1.025);
  const leftElbow = new THREE.Vector3(-0.86, 1.12, 0.38);
  const rightElbow = new THREE.Vector3();
  let lastPageCurl = -1;
  function pose(time) {
    const phase = time % 12;
    const progress = Math.max(0, Math.min(1, (phase - 6.8) / 1.8));
    const turn = easeInOut(progress);
    const turnAngle = Math.PI * turn;
    const turning = Math.sin(turnAngle);
    const rest = phase >= 8.6;
    const settle = rest ? easeInOut(Math.min(1, (phase - 8.6) / 0.8)) : 0;
    const breath = Math.sin(time * Math.PI * 2 / 4.8);
    body.scale.y = 1 + breath * 0.0035;
    head.rotation.x = 0.28 + Math.sin(time * Math.PI * 2 / 6.4) * 0.018 + turning * 0.018;
    head.rotation.y = -0.075 + Math.sin(time * Math.PI * 2 / 9.6) * 0.025 - turn * (1 - settle) * 0.085;
    head.rotation.z = -0.012 + Math.sin(time * Math.PI * 2 / 12) * 0.012;

    let blink = 0;
    for (const start of [2.05, 8.05]) {
      const blinkPhase = (phase - start) / 0.22;
      if (blinkPhase > 0 && blinkPhase < 1) blink = Math.sin(blinkPhase * Math.PI);
    }
    for (let index = 0; index < eyes.length; index++) {
      eyes[index].scale.y = Math.max(0.055, 1 - blink * 0.945);
      pupils[index].position.x = Math.sin(time * Math.PI * 2 / 9.6) * 0.007 - turn * (1 - settle) * 0.007;
      pupils[index].position.y = -0.014;
    }

    pagePivot.rotation.y = -turnAngle;
    // A gentle curl while the paper passes the vertical position.
    const curl = turning * 0.055;
    if (curl !== lastPageCurl) {
      for (let index = 0; index < pagePositions.count; index++) {
        const offset = index * 3;
        const x = pageRestPositions[offset];
        pagePositions.setZ(index, Math.sin(x / 0.56 * Math.PI) * curl);
      }
      pagePositions.needsUpdate = true;
      pageGeometry.computeVertexNormals();
      lastPageCurl = curl;
    }
    turningLines.visible = turning < 0.12;
    // Hide the turned sheet once it settles; the paper stack supplies its rest pose.
    pagePivot.visible = !rest;
    figure.updateMatrixWorld(true);
    handPosition.set(0.56 * Math.cos(turnAngle), 0.02, 0.039 + 0.56 * Math.sin(turnAngle));
    book.localToWorld(handPosition);
    figure.worldToLocal(handPosition);
    handPosition.lerp(rightHandRest, settle);
    rightElbow.set(0.85 - turning * 0.14, 1.12 + turning * 0.16, 0.38 + turning * 0.1);
    positionArm(leftArm, leftElbow, leftHand);
    positionArm(rightArm, rightElbow, handPosition, turning);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  let contextLost = false;
  let pausedByController = false;
  let elapsed = 0;
  let lastTick = 0;
  let frameId = 0;
  function isPaused() {
    return pausedByController || host.dataset.paused === 'true' || reducedMotion.matches || document.hidden || contextLost;
  }
  function render() {
    if (disposed || contextLost) return;
    renderer.render(scene, camera);
    if (host.dataset.mascotReady !== 'true') {
      canvas.hidden = false;
      host.dataset.mascotReady = 'true';
    }
  }
  function resize() {
    if (disposed) return;
    const size = Math.max(64, Math.round(host.getBoundingClientRect().width || 280));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(size, size, false);
    render();
  }
  function frame(now) {
    frameId = 0;
    if (disposed || isPaused()) return;
    if (now - lastTick >= 1000 / 30) {
      elapsed += Math.min(0.1, (now - lastTick) / 1000);
      lastTick = now;
      pose(elapsed);
      render();
    }
    frameId = requestAnimationFrame(frame);
  }
  function syncPlayback() {
    if (disposed) return;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    if (reducedMotion.matches) {
      pose(0);
      render();
    }
    if (!isPaused()) {
      lastTick = performance.now();
      frameId = requestAnimationFrame(frame);
    }
  }
  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    delete host.dataset.mascotReady;
    canvas.hidden = true;
    syncPlayback();
  }
  function onContextRestored() {
    contextLost = false;
    pose(elapsed);
    render();
    syncPlayback();
  }
  const resizeObserver = new ResizeObserver(resize);
  const pauseObserver = new MutationObserver(syncPlayback);

  try {
    host.append(canvas);
    pose(0);
    resize();
    resizeObserver.observe(host);
    pauseObserver.observe(host, { attributes: true, attributeFilter: ['data-paused'] });
    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);
    syncPlayback();
  } catch {
    canvas.remove();
    delete host.dataset.mascotReady;
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) texture.dispose();
    renderer.dispose();
    return null;
  }

  return {
    setPaused(paused) {
      pausedByController = Boolean(paused);
      syncPlayback();
    },
    capturePoster() {
      if (disposed || contextLost) return null;
      const previousSize = renderer.getSize(new THREE.Vector2());
      const previousPixelRatio = renderer.getPixelRatio();
      renderer.setPixelRatio(1);
      renderer.setSize(640, 640, false);
      pose(0);
      render();
      let poster = null;
      try { poster = canvas.toDataURL('image/png'); } catch { /* Preserve fallback on capture failure. */ }
      renderer.setPixelRatio(previousPixelRatio);
      renderer.setSize(previousSize.x, previousSize.y, false);
      pose(reducedMotion.matches ? 0 : elapsed);
      render();
      return poster;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      pauseObserver.disconnect();
      reducedMotion.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      for (const texture of textures) texture.dispose();
      keyLight.shadow.map?.dispose();
      renderer.dispose();
      canvas.remove();
      delete host.dataset.mascotReady;
    },
  };
}
