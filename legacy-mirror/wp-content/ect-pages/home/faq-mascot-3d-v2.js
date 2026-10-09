/** A welcoming clay nerd with an articulated greeting and a laptop in his lap. */
export async function mountMascot(host) {
  if (!host?.isConnected) return null;
  let THREE;
  try { THREE = await import('./three.module.min.js'); } catch { return null; }
  if (!host.isConnected) return null;

  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const removeListeners = [];
  let renderer;
  let canvas;
  let keyLight;
  let resizeObserver;
  let pauseObserver;
  let frameId = 0;
  let disposed = false;
  let markedReady = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    if (frameId) cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    pauseObserver?.disconnect();
    for (const remove of removeListeners) remove();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) texture.dispose();
    keyLight?.shadow.map?.dispose();
    renderer?.dispose();
    canvas?.remove();
    if (markedReady) delete host.dataset.mascotReady;
  }
  function listen(target, type, callback) {
    target.addEventListener(type, callback);
    removeListeners.push(() => target.removeEventListener(type, callback));
  }

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: true,
    });
    canvas = renderer.domElement;
    canvas.className = 'ect-home-faq__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.width = canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.hidden = true;
    renderer.setClearColor(0xffffff, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.73, 1.73, 1.73, -1.73, 0.1, 30);
    camera.position.set(2.3, 3.15, 9.2);
    camera.lookAt(0.1, 1.49, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xffcba5, 1.05));
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    keyLight = new THREE.DirectionalLight(0xfff5eb, 2.2);
    keyLight.position.set(-3.8, 6.3, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(keyLight.shadow.camera, { left: -3, right: 3, top: 4, bottom: -1, near: 0.1, far: 15 });
    keyLight.shadow.normalBias = 0.035;
    keyLight.shadow.bias = -0.00025;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);
    const fill = new THREE.DirectionalLight(0xf2f8ff, 0.9);
    fill.position.set(4, 3, 5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(0, 4.5, -4);
    scene.add(rim);

    const keepGeometry = geometry => (geometries.add(geometry), geometry);
    const keepMaterial = material => (materials.add(material), material);
    function clay(color, roughness = 0.7) {
      return keepMaterial(new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }));
    }
    const sweaterMaterial = clay(0xfd8649);
    const sweaterTrim = clay(0xff6c2a, 0.68);
    const cream = clay(0xfff5ed, 0.74);
    const white = clay(0xffffff, 0.44);
    const skin = clay(0xffc79f, 0.72);
    const skinShade = clay(0xeeb28c, 0.74);
    const blush = clay(0xee9584, 0.8);
    const hairMaterial = clay(0x4b3125, 0.68);
    const hairLight = clay(0x72503a, 0.72);
    const ink = clay(0x27272d, 0.46);
    const trousers = clay(0x44424d, 0.8);
    const soleMaterial = clay(0xeae7e3, 0.72);
    const smileMaterial = clay(0x803f36, 0.76);
    const laptopMaterial = clay(0xf7f6f2, 0.34);
    const laptopEdge = clay(0xc8c8cd, 0.44);
    const sharedSphere = keepGeometry(new THREE.SphereGeometry(1, 32, 24));
    const fingerGeometry = keepGeometry(new THREE.CapsuleGeometry(0.027, 0.135, 5, 12));
    const shoeSoleGeometry = keepGeometry(new THREE.CapsuleGeometry(0.205, 0.22, 8, 24));
    shoeSoleGeometry.rotateX(Math.PI / 2);
    shoeSoleGeometry.scale(1, 0.19, 1);
    function mesh(geometry, material, parent, position = [0, 0, 0]) {
      const object = new THREE.Mesh(geometry, material);
      object.position.set(...position);
      object.castShadow = object.receiveShadow = true;
      parent.add(object);
      return object;
    }
    function sphere(parent, position, scale, material) {
      const object = mesh(sharedSphere, material, parent, position);
      object.scale.set(...scale);
      return object;
    }
    function tube(parent, points, radius, material, segments = 24) {
      const path = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
      return mesh(keepGeometry(new THREE.TubeGeometry(path, segments, radius, 8, false)), material, parent);
    }
    function roundedBox(parent, width, height, depth, radius, material, position) {
      const shape = new THREE.Shape();
      const left = -width / 2, right = width / 2, top = height / 2, bottom = -height / 2;
      shape.moveTo(left + radius, bottom);
      shape.lineTo(right - radius, bottom);
      shape.quadraticCurveTo(right, bottom, right, bottom + radius);
      shape.lineTo(right, top - radius);
      shape.quadraticCurveTo(right, top, right - radius, top);
      shape.lineTo(left + radius, top);
      shape.quadraticCurveTo(left, top, left, top - radius);
      shape.lineTo(left, bottom + radius);
      shape.quadraticCurveTo(left, bottom, left + radius, bottom);
      const geometry = keepGeometry(new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012,
        bevelSegments: 3, curveSegments: 12,
      }));
      geometry.translate(0, 0, -depth / 2);
      return mesh(geometry, material, parent, position);
    }

    const figure = new THREE.Group();
    figure.rotation.y = -0.045;
    scene.add(figure);
    // The seated silhouette is sculpted separately from the standing torso.
    sphere(figure, [0, 0.58, 0.02], [0.47, 0.26, 0.33], trousers);
    for (const side of [-1, 1]) {
      // One continuous fabric surface crosses the knee, without open tube joins.
      tube(figure, [[side * 0.24, 0.57, 0.07], [side * 0.45, 0.44, 0.31],
        [side * 0.555, 0.33, 0.55], [side * 0.568, 0.245, 0.71], [side * 0.55, 0.2, 0.84]], 0.163, trousers, 40);
      sphere(figure, [side * 0.55, 0.2, 0.834], [0.153, 0.151, 0.155], trousers);
      const shoe = new THREE.Group();
      shoe.position.set(side * 0.57, 0.15, 0.91);
      shoe.rotation.y = side * 0.11;
      figure.add(shoe);
      sphere(shoe, [0, 0.015, 0], [0.218, 0.145, 0.315], white);
      mesh(shoeSoleGeometry, soleMaterial, shoe, [0, -0.083, 0]);
      sphere(shoe, [0, 0.095, -0.135], [0.145, 0.064, 0.122], soleMaterial);
      for (const z of [-0.025, 0.047, 0.115]) {
        tube(shoe, [[-0.079, 0.128, z], [0, 0.153, z + 0.008], [0.079, 0.128, z]], 0.011, white, 12);
      }
      tube(shoe, [[side * 0.177, -0.005, -0.16], [side * 0.209, -0.015, 0.015], [side * 0.166, -0.01, 0.19]], 0.012, soleMaterial, 16);
    }

    const body = new THREE.Group();
    body.position.y = 0.61;
    figure.add(body);
    const torsoProfile = new THREE.CatmullRomCurve3([
      [0, 0, 0], [0.34, 0.015, 0], [0.48, 0.08, 0], [0.52, 0.29, 0],
      [0.505, 0.57, 0], [0.41, 0.83, 0], [0.25, 0.99, 0], [0.16, 1.025, 0], [0, 1.027, 0],
    ].map(point => new THREE.Vector3(...point)), false, 'centripetal');
    const torsoPoints = torsoProfile.getPoints(42).map(point => new THREE.Vector2(Math.max(0, point.x), point.y));
    const torso = mesh(keepGeometry(new THREE.LatheGeometry(torsoPoints, 48)), sweaterMaterial, body);
    torso.scale.z = 0.74;
    const hem = mesh(keepGeometry(new THREE.TorusGeometry(0.465, 0.025, 8, 48)), sweaterTrim, body, [0, 0.106, 0]);
    hem.rotation.x = Math.PI / 2;
    hem.scale.y = 0.74;
    for (let rib = -6; rib <= 6; rib++) {
      const x = rib * 0.055;
      const z = 0.74 * Math.sqrt(0.465 ** 2 - x ** 2);
      tube(body, [[x, 0.061, z], [x, 0.139, z]], 0.005, sweaterTrim, 4);
    }
    sphere(figure, [0, 1.74, -0.01], [0.16, 0.23, 0.16], skin);
    const collar = new THREE.Group();
    collar.position.set(0, 1.59, 0.315);
    figure.add(collar);
    const collarShape = new THREE.Shape();
    collarShape.moveTo(0.015, 0.065);
    collarShape.quadraticCurveTo(0.12, 0.1, 0.21, 0.033);
    collarShape.quadraticCurveTo(0.175, -0.086, 0.106, -0.143);
    collarShape.quadraticCurveTo(0.042, -0.048, 0.015, 0.065);
    const collarGeometry = keepGeometry(new THREE.ExtrudeGeometry(collarShape, {
      depth: 0.022, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2,
    }));
    mesh(collarGeometry, white, collar);
    mesh(collarGeometry, white, collar).scale.x = -1;
    const bow = new THREE.Group();
    bow.position.set(0, 1.535, 0.363);
    figure.add(bow);
    for (const side of [-1, 1]) {
      const wing = sphere(bow, [side * 0.1, 0, 0], [0.115, 0.064, 0.041], ink);
      wing.rotation.z = side * 0.17;
    }
    sphere(bow, [0, 0, 0.02], [0.047, 0.056, 0.041], ink);

    const head = new THREE.Group();
    head.position.set(0, 2.225, 0.025);
    figure.add(head);
    sphere(head, [0, 0, 0], [0.66, 0.64, 0.56], skin);
    for (const side of [-1, 1]) {
      sphere(head, [side * 0.65, -0.015, 0.015], [0.103, 0.139, 0.105], skin);
      sphere(head, [side * 0.679, -0.023, 0.078], [0.041, 0.073, 0.035], skinShade);
      const cheek = sphere(head, [side * 0.385, -0.197, 0.442], [0.115, 0.061, 0.017], blush);
      cheek.rotation.y = side * 0.37;
    }
    // Each swept lock has volume; subtle strands follow the sculpted hair.
    const cap = mesh(keepGeometry(new THREE.SphereGeometry(1, 36, 22, 0, Math.PI * 2, 0, Math.PI * 0.36)), hairMaterial, head, [0, 0.035, -0.04]);
    cap.scale.set(0.698, 0.691, 0.594);
    sphere(head, [0, 0.22, -0.23], [0.657, 0.413, 0.365], hairMaterial);
    for (const side of [-1, 1]) {
      const sideLock = sphere(head, [side * 0.572, 0.22, -0.075], [0.13, 0.255, 0.33], hairMaterial);
      sideLock.rotation.z = side * 0.12;
    }
    const sweep = sphere(head, [-0.16, 0.455, 0.347], [0.39, 0.151, 0.198], hairMaterial);
    sweep.rotation.z = 0.23;
    const curl = sphere(head, [0.269, 0.48, 0.303], [0.238, 0.126, 0.172], hairMaterial);
    curl.rotation.z = -0.15;
    const quiff = sphere(head, [-0.27, 0.628, 0.128], [0.264, 0.136, 0.208], hairMaterial);
    quiff.rotation.z = -0.27;
    tube(head, [[-0.42, 0.627, 0.258], [-0.26, 0.634, 0.388], [-0.06, 0.548, 0.495]], 0.012, hairLight, 24);
    tube(head, [[-0.335, 0.574, 0.398], [-0.145, 0.512, 0.504], [0.034, 0.44, 0.513]], 0.009, hairLight, 24);

    const eyes = [];
    const pupils = [];
    const glassesGeometry = keepGeometry(new THREE.TorusGeometry(0.221, 0.031, 12, 44));
    for (const side of [-1, 1]) {
      const eye = new THREE.Group();
      eye.position.set(side * 0.25, 0.052, 0.523);
      head.add(eye);
      sphere(eye, [0, 0, 0.008], [0.119, 0.11, 0.029], white);
      const pupil = sphere(eye, [0.008, -0.001, 0.037], [0.046, 0.062, 0.018], ink);
      sphere(pupil, [-0.28, 0.37, 0.86], [0.19, 0.15, 0.13], white);
      sphere(pupil, [0.3, -0.22, 0.94], [0.075, 0.065, 0.07], white);
      eyes.push(eye);
      pupils.push(pupil);
      const rim = mesh(glassesGeometry, ink, head, [side * 0.25, 0.052, 0.588]);
      rim.rotation.y = side * 0.15;
      tube(head, [[side * 0.468, 0.058, 0.557], [side * 0.572, 0.083, 0.381], [side * 0.677, 0.035, 0.082]], 0.024, ink, 20);
      tube(head, [[side * 0.363, 0.321, 0.451], [side * 0.266, 0.356, 0.489], [side * 0.15, 0.329, 0.514]], 0.022, hairMaterial, 20);
    }
    tube(head, [[-0.035, 0.061, 0.622], [0, 0.085, 0.635], [0.035, 0.061, 0.622]], 0.025, ink, 12);
    sphere(head, [0, -0.075, 0.571], [0.073, 0.092, 0.087], skin);
    sphere(head, [0, -0.103, 0.615], [0.088, 0.062, 0.079], skin);
    const faceZ = (x, y) => 0.56 * Math.sqrt(Math.max(0, 1 - (x / 0.66) ** 2 - (y / 0.64) ** 2));
    function faceShape(shape, material, offset) {
      const geometry = keepGeometry(new THREE.ShapeGeometry(shape, 24));
      const positions = geometry.attributes.position;
      for (let index = 0; index < positions.count; index++) {
        positions.setZ(index, faceZ(positions.getX(index), positions.getY(index)) + offset);
      }
      geometry.computeVertexNormals();
      return mesh(geometry, material, head);
    }
    const smileShape = new THREE.Shape();
    smileShape.moveTo(-0.217, -0.22);
    smileShape.bezierCurveTo(-0.117, -0.285, 0.117, -0.285, 0.217, -0.22);
    smileShape.bezierCurveTo(0.175, -0.392, -0.175, -0.392, -0.217, -0.22);
    faceShape(smileShape, smileMaterial, 0.016);
    const teethShape = new THREE.Shape();
    teethShape.moveTo(-0.17, -0.247);
    teethShape.bezierCurveTo(-0.075, -0.281, 0.075, -0.281, 0.17, -0.247);
    teethShape.bezierCurveTo(0.121, -0.315, -0.121, -0.315, -0.17, -0.247);
    faceShape(teethShape, white, 0.024);
    const tongueShape = new THREE.Shape();
    tongueShape.moveTo(-0.065, -0.345);
    tongueShape.quadraticCurveTo(0, -0.305, 0.065, -0.345);
    tongueShape.quadraticCurveTo(0, -0.377, -0.065, -0.345);
    faceShape(tongueShape, blush, 0.022);

    // The laptop has a hinged lid, keyboard, trackpad and a small code motif.
    const laptop = new THREE.Group();
    laptop.position.set(-0.035, 0.86, 0.585);
    laptop.rotation.y = -0.045;
    figure.add(laptop);
    const base = roundedBox(laptop, 0.99, 0.66, 0.051, 0.065, laptopMaterial, [0, 0, -0.025]);
    base.rotation.x = -Math.PI / 2;
    const bottom = roundedBox(laptop, 0.97, 0.644, 0.022, 0.06, laptopEdge, [0, -0.03, -0.025]);
    bottom.rotation.x = -Math.PI / 2;
    const keyGeometry = keepGeometry(new THREE.BoxGeometry(0.068, 0.006, 0.037));
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 10; column++) {
        mesh(keyGeometry, trousers, laptop, [-0.385 + column * 0.085, 0.04, -0.23 + row * 0.055]);
      }
    }
    const trackpad = roundedBox(laptop, 0.256, 0.115, 0.003, 0.018, soleMaterial, [0, 0.034, 0.155]);
    trackpad.rotation.x = -Math.PI / 2;
    const lid = new THREE.Group();
    lid.position.set(0, 0.321, 0.232);
    lid.rotation.x = -0.23;
    laptop.add(lid);
    roundedBox(lid, 0.99, 0.624, 0.045, 0.065, laptopMaterial, [0, 0, 0]);
    roundedBox(lid, 0.948, 0.576, 0.014, 0.048, ink, [0, 0, -0.032]);
    const laptopLogo = new THREE.Group();
    laptopLogo.position.set(0, -0.012, 0.043);
    lid.add(laptopLogo);
    tube(laptopLogo, [[-0.035, 0.06, 0], [-0.101, 0, 0], [-0.035, -0.06, 0]], 0.012, sweaterMaterial, 12);
    tube(laptopLogo, [[0.035, 0.06, 0], [0.101, 0, 0], [0.035, -0.06, 0]], 0.012, sweaterMaterial, 12);
    const hinge = mesh(keepGeometry(new THREE.CylinderGeometry(0.028, 0.028, 0.76, 16)), laptopEdge, laptop, [0, 0.014, 0.301]);
    hinge.rotation.z = Math.PI / 2;

    const yAxis = new THREE.Vector3(0, 1, 0);
    const boneVector = new THREE.Vector3();
    const sleeveNormal = new THREE.Vector3();
    const sleeveBinormal = new THREE.Vector3();
    const sleeveForward = new THREE.Vector3(0, 0, 1);
    const sleeveRadial = new THREE.Vector3();
    function makeArm(side, greeting) {
      const group = new THREE.Group();
      figure.add(group);
      const shoulder = new THREE.Vector3(side * 0.452, 1.425, 0.024);
      sphere(group, shoulder.toArray(), [0.17, 0.18, 0.164], sweaterMaterial);
      const sleeveCurve = new THREE.CatmullRomCurve3([
        shoulder.clone(),
        new THREE.Vector3(side * 0.7, 1.1, 0.19),
        new THREE.Vector3(side * 0.86, 1.4, 0.3),
      ], false, 'centripetal');
      const sleeveGeometry = keepGeometry(new THREE.TubeGeometry(sleeveCurve, 32, 0.125, 12, false));
      const sleeve = mesh(sleeveGeometry, sweaterMaterial, group);
      sleeve.frustumCulled = false;
      const hand = new THREE.Group();
      group.add(hand);
      if (greeting) {
        sphere(hand, [0, 0.094, 0], [0.109, 0.139, 0.058], skin);
        sphere(hand, [0, 0.008, 0], [0.079, 0.071, 0.057], skin);
        const fingers = [
          { x: -0.073, y: 0.227, length: 0.88, tilt: 0.14 },
          { x: -0.024, y: 0.246, length: 1.08, tilt: 0.04 },
          { x: 0.029, y: 0.235, length: 0.99, tilt: -0.055 },
          { x: 0.077, y: 0.214, length: 0.78, tilt: -0.16 },
        ];
        for (const finger of fingers) {
          const digit = mesh(fingerGeometry, skin, hand, [finger.x, finger.y, 0]);
          digit.scale.y = finger.length;
          digit.rotation.z = finger.tilt;
        }
        const thumb = mesh(keepGeometry(new THREE.CapsuleGeometry(0.033, 0.09, 5, 12)), skin, hand, [-0.118, 0.07, 0.01]);
        thumb.rotation.z = -0.78;
        tube(hand, [[-0.064, 0.091, 0.056], [-0.015, 0.048, 0.06], [0.038, 0.043, 0.052]], 0.004, skinShade, 12);
      } else {
        sphere(hand, [0, 0, 0], [0.106, 0.056, 0.101], skin);
        for (let index = 0; index < 4; index++) {
          sphere(hand, [-0.063 + index * 0.042, -0.01, 0.077], [0.026, 0.028, 0.056], skin);
        }
        sphere(hand, [0.097, 0.01, 0.021], [0.043, 0.035, 0.055], skin);
      }
      const cuff = new THREE.Group();
      group.add(cuff);
      const cuffRing = mesh(keepGeometry(new THREE.TorusGeometry(0.094, 0.019, 8, 28)), sweaterTrim, cuff);
      cuffRing.rotation.x = Math.PI / 2;
      return { shoulder, sleeveCurve, sleeveGeometry, hand, cuff,
        lastElbow: new THREE.Vector3(Infinity, Infinity, Infinity),
        lastWrist: new THREE.Vector3(Infinity, Infinity, Infinity) };
    }
    const leftArm = makeArm(-1, false);
    const rightArm = makeArm(1, true);
    function positionArm(arm, elbow, wrist) {
      arm.hand.position.copy(wrist);
      arm.cuff.position.copy(wrist);
      boneVector.copy(wrist).sub(elbow).normalize();
      arm.cuff.quaternion.setFromUnitVectors(yAxis, boneVector);
      if (arm.lastElbow.equals(elbow) && arm.lastWrist.equals(wrist)) return;
      arm.lastElbow.copy(elbow);
      arm.lastWrist.copy(wrist);
      arm.sleeveCurve.points[1].copy(elbow);
      arm.sleeveCurve.points[2].copy(wrist);
      const positions = arm.sleeveGeometry.attributes.position;
      const normals = arm.sleeveGeometry.attributes.normal;
      // One continuous knitted sleeve bends through the elbow, without ball joins.
      for (let ring = 0; ring <= 32; ring++) {
        const progress = ring / 32;
        const center = arm.sleeveCurve.getPoint(progress);
        const tangent = arm.sleeveCurve.getTangent(progress);
        sleeveNormal.crossVectors(tangent, sleeveForward).normalize();
        sleeveBinormal.crossVectors(tangent, sleeveNormal).normalize();
        const shoulderWidth = 0.039 * Math.max(0, 1 - progress / 0.35);
        const wristTaper = 0.03 * Math.max(0, (progress - 0.76) / 0.24);
        const radius = 0.125 + shoulderWidth - wristTaper;
        for (let segment = 0; segment <= 12; segment++) {
          const angle = segment / 12 * Math.PI * 2;
          sleeveRadial.copy(sleeveNormal).multiplyScalar(-Math.cos(angle))
            .addScaledVector(sleeveBinormal, Math.sin(angle));
          const index = ring * 13 + segment;
          positions.setXYZ(index, center.x + radius * sleeveRadial.x,
            center.y + radius * sleeveRadial.y, center.z + radius * sleeveRadial.z);
          normals.setXYZ(index, sleeveRadial.x, sleeveRadial.y, sleeveRadial.z);
        }
      }
      positions.needsUpdate = normals.needsUpdate = true;
    }

    // A soft floor shadow adds weight without adding an opaque background.
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const shadowContext = shadowCanvas.getContext('2d');
    if (shadowContext) {
      const gradient = shadowContext.createRadialGradient(64, 64, 4, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(60, 35, 20, .2)');
      gradient.addColorStop(0.5, 'rgba(60, 35, 20, .08)');
      gradient.addColorStop(1, 'rgba(60, 35, 20, 0)');
      shadowContext.fillStyle = gradient;
      shadowContext.fillRect(0, 0, 128, 128);
      const texture = new THREE.CanvasTexture(shadowCanvas);
      textures.add(texture);
      const shadowMaterial = keepMaterial(new THREE.MeshBasicMaterial({
        map: texture, transparent: true, depthWrite: false, toneMapped: false,
      }));
      const shadow = mesh(keepGeometry(new THREE.PlaneGeometry(2.65, 1.7)), shadowMaterial, scene, [0.05, 0.014, 0.49]);
      shadow.rotation.x = -Math.PI / 2;
      shadow.castShadow = shadow.receiveShadow = false;
    }

    // Rare marketing delight: one quiet greeting in a ten-second cycle.
    // The articulated joints use the animate skill's strong ease-in-out curve.
    function easeInOut(progress) {
      if (progress <= 0) return 0;
      if (progress >= 1) return 1;
      const cubic = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
      let low = 0, high = 1, t = progress;
      for (let index = 0; index < 12; index++) {
        if (cubic(t, 0.77, 0.175) < progress) low = t;
        else high = t;
        t = (low + high) / 2;
      }
      return cubic(t, 0, 1);
    }
    const leftElbow = new THREE.Vector3(-0.68, 1.035, 0.247);
    const leftWrist = new THREE.Vector3(-0.374, 0.923, 0.447);
    const rightElbow = new THREE.Vector3(0.744, 1.368, 0.092);
    const rightWrist = new THREE.Vector3();
    const forearmRest = new THREE.Vector3(0.234, 0.607, 0.062);
    const waveAxis = new THREE.Vector3(0, 0, 1);
    function pose(time) {
      const phase = time % 10;
      const start = easeInOut(Math.min(1, Math.max(0, (phase - 0.7) / 0.45)));
      const finish = 1 - easeInOut(Math.min(1, Math.max(0, (phase - 3.2) / 0.55)));
      const greeting = start * finish;
      const wave = greeting * Math.sin((phase - 0.7) * Math.PI * 2 / 1.05);
      const breath = Math.sin(time * Math.PI * 2 / 5);
      body.scale.y = 1 + breath * 0.003;
      head.rotation.set(-0.052 + greeting * 0.035, 0.085 + Math.sin(time * Math.PI * 2 / 10) * 0.021, -0.027 - greeting * 0.028);
      let blink = 0;
      for (const blinkAt of [4.15, 8.3]) {
        const blinkPhase = (phase - blinkAt) / 0.17;
        if (blinkPhase > 0 && blinkPhase < 1) blink = Math.sin(blinkPhase * Math.PI);
      }
      for (let index = 0; index < eyes.length; index++) {
        eyes[index].scale.y = Math.max(0.07, 1 - blink * 0.93);
        pupils[index].position.x = 0.008 + Math.sin(time * Math.PI * 2 / 10) * 0.006;
      }
      rightWrist.copy(forearmRest).applyAxisAngle(waveAxis, wave * 0.19).add(rightElbow);
      positionArm(leftArm, leftElbow, leftWrist);
      leftArm.hand.rotation.set(-0.23, -0.1, -0.12);
      positionArm(rightArm, rightElbow, rightWrist);
      rightArm.hand.rotation.set(-0.035, 0.2, -0.08 + wave * 0.29);
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let contextLost = false;
    let pausedByController = false;
    let elapsed = 0;
    let lastTick = 0;
    function isPaused() {
      return pausedByController || host.dataset.paused === 'true' || reducedMotion.matches || document.hidden || contextLost;
    }
    function render() {
      if (disposed || contextLost) return;
      renderer.render(scene, camera);
      canvas.hidden = false;
      host.dataset.mascotReady = 'true';
      markedReady = true;
    }
    function resize() {
      if (disposed || contextLost) return;
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
      if (reducedMotion.matches) { pose(0); render(); }
      if (!isPaused()) {
        lastTick = performance.now();
        frameId = requestAnimationFrame(frame);
      }
    }
    function onContextLost(event) {
      event.preventDefault();
      contextLost = true;
      delete host.dataset.mascotReady;
      markedReady = false;
      canvas.hidden = true;
      syncPlayback();
    }
    function onContextRestored() {
      contextLost = false;
      pose(reducedMotion.matches ? 0 : elapsed);
      resize();
      syncPlayback();
    }
    if (!host.isConnected) { dispose(); return null; }
    resizeObserver = new ResizeObserver(resize);
    pauseObserver = new MutationObserver(syncPlayback);
    host.append(canvas);
    pose(0);
    resize();
    resizeObserver.observe(host);
    pauseObserver.observe(host, { attributes: true, attributeFilter: ['data-paused'] });
    listen(reducedMotion, 'change', syncPlayback);
    listen(document, 'visibilitychange', syncPlayback);
    listen(canvas, 'webglcontextlost', onContextLost);
    listen(canvas, 'webglcontextrestored', onContextRestored);
    syncPlayback();
    return {
      setPaused(paused) {
        if (disposed) return;
        pausedByController = Boolean(paused);
        syncPlayback();
      },
      capturePoster() {
        if (disposed || contextLost) return null;
        const previousSize = renderer.getSize(new THREE.Vector2());
        const previousPixelRatio = renderer.getPixelRatio();
        let poster = null;
        try {
          renderer.setPixelRatio(1);
          renderer.setSize(640, 640, false);
          pose(0);
          render();
          poster = canvas.toDataURL('image/png');
        } catch { /* Keep the existing fallback if capture is unavailable. */ }
        finally {
          renderer.setPixelRatio(previousPixelRatio);
          renderer.setSize(previousSize.x, previousSize.y, false);
          pose(reducedMotion.matches ? 0 : elapsed);
          render();
        }
        return poster;
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
