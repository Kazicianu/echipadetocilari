/** A curious clay shop owner: a parcel under one arm, a raised finger and a question in the air. */
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
    // Same three-quarter view as the agency mascot, reframed for a standing figure and his bubble.
    const camera = new THREE.OrthographicCamera(-1.82, 1.82, 1.82, -1.82, 0.1, 30);
    camera.position.set(2.79, 3.205, 9.2);
    camera.lookAt(0.59, 1.545, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xffcba5, 1.05));
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    keyLight = new THREE.DirectionalLight(0xfff5eb, 2.2);
    keyLight.position.set(-3.8, 6.3, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    // The shadow frustum is fitted to the figure, which keeps the terminator clean.
    Object.assign(keyLight.shadow.camera, { left: -1.05, right: 1.35, top: 2.6, bottom: -0.55, near: 0.1, far: 15 });
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
    const orange = clay(0xfd8649);
    const shirt = clay(0xfff5ed, 0.74);
    const white = clay(0xffffff, 0.44);
    const skin = clay(0xffc79f, 0.72);
    const skinShade = clay(0xeeb28c, 0.74);
    const blush = clay(0xee9584, 0.8);
    const hairMaterial = clay(0x7a4a30, 0.7);
    const ink = clay(0x27272d, 0.46);
    const apronMaterial = clay(0x27272d, 0.82);
    const trousers = clay(0x44424d, 0.8);
    const soleMaterial = clay(0xeae7e3, 0.72);
    const smileMaterial = clay(0x803f36, 0.76);
    const cardboard = clay(0xd9a871, 0.86);
    const sharedSphere = keepGeometry(new THREE.SphereGeometry(1, 32, 24));
    const detailSphere = keepGeometry(new THREE.SphereGeometry(1, 16, 12));
    const fingerGeometry = keepGeometry(new THREE.CapsuleGeometry(0.033, 0.1, 5, 12));
    const ringGeometry = keepGeometry(new THREE.TorusGeometry(0.106, 0.03, 10, 28));
    ringGeometry.rotateX(Math.PI / 2);
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
    // Small details share a lighter sphere and stay out of the shadow pass.
    function dot(parent, position, scale, material) {
      const object = mesh(detailSphere, material, parent, position);
      object.scale.set(...scale);
      object.castShadow = false;
      return object;
    }
    // A clay stroke swept along a curve: the radius follows the path, so tips taper shut.
    const forward = new THREE.Vector3(0, 0, 1);
    const ringCenter = new THREE.Vector3();
    const ringTangent = new THREE.Vector3();
    const ringNormal = new THREE.Vector3();
    const ringBinormal = new THREE.Vector3();
    const ringGuide = new THREE.Vector3();
    const ringRadial = new THREE.Vector3();
    function sweep(geometry, curve, radiusAt, length, flat, guide) {
      const { tubularSegments: segments, radialSegments: radial } = geometry.parameters;
      const positions = geometry.attributes.position;
      const normals = geometry.attributes.normal;
      for (let ring = 0; ring <= segments; ring++) {
        const progress = ring / segments;
        curve.getPoint(progress, ringCenter);
        curve.getTangent(progress, ringTangent);
        // Without a guide the stroke lies flat on the form it wraps, such as a lock on the scalp.
        ringNormal.crossVectors(ringTangent, guide || ringGuide.copy(ringCenter).normalize()).normalize();
        ringBinormal.crossVectors(ringTangent, ringNormal).normalize();
        const radius = Math.max(0.0005, radiusAt(progress));
        const slope = Math.max(-3, Math.min(3,
          (radiusAt(Math.min(1, progress + 0.02)) - radiusAt(Math.max(0, progress - 0.02))) / (0.04 * length)));
        for (let segment = 0; segment <= radial; segment++) {
          const angle = segment / radial * Math.PI * 2;
          const index = ring * (radial + 1) + segment;
          ringRadial.copy(ringNormal).multiplyScalar(-Math.cos(angle)).addScaledVector(ringBinormal, Math.sin(angle) * flat);
          positions.setXYZ(index, ringCenter.x + radius * ringRadial.x,
            ringCenter.y + radius * ringRadial.y, ringCenter.z + radius * ringRadial.z);
          ringRadial.copy(ringNormal).multiplyScalar(-Math.cos(angle) * flat).addScaledVector(ringBinormal, Math.sin(angle))
            .normalize().addScaledVector(ringTangent, -slope).normalize();
          normals.setXYZ(index, ringRadial.x, ringRadial.y, ringRadial.z);
        }
      }
      positions.needsUpdate = normals.needsUpdate = true;
    }
    function roll(parent, points, radiusAt, material, segments = 32, radial = 12, flat = 1, guide = forward) {
      const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)), false, 'centripetal');
      const geometry = keepGeometry(new THREE.TubeGeometry(curve, segments, 0.01, radial, false));
      sweep(geometry, curve, radiusAt, curve.getLength(), flat, guide);
      geometry.computeBoundingSphere();
      return mesh(geometry, material, parent);
    }
    const rounded = (progress, startCap, endCap = startCap) => Math.sqrt(Math.max(0, 1 - Math.max(0,
      1 - progress / startCap, 1 - (1 - progress) / endCap) ** 2));
    // A tessellated sheet through a grid of points, given row by row.
    function sheet(parent, points, columns, material) {
      const indices = [];
      for (let corner = 0; corner + columns + 2 < points.length; corner++) {
        if (corner % (columns + 1) === columns) continue;
        const below = corner + columns + 1;
        indices.push(corner, below, corner + 1, corner + 1, below, below + 1);
      }
      const geometry = keepGeometry(new THREE.BufferGeometry());
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      mesh(geometry, material, parent).castShadow = false;
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
    const smooth = (from, to, value) => {
      const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
      return t * t * (3 - 2 * t);
    };

    const figure = new THREE.Group();
    figure.rotation.y = -0.045;
    scene.add(figure);
    // Standing legs: hips, two tapered trouser legs with a rolled hem and plain house sneakers.
    sphere(figure, [0, 0.77, 0], [0.42, 0.2, 0.31], trousers);
    const legGeometry = keepGeometry(new THREE.CylinderGeometry(0.168, 0.122, 0.58, 28, 1, true));
    for (const side of [-1, 1]) {
      const leg = mesh(legGeometry, trousers, figure, [side * 0.212, 0.51, 0.012]);
      leg.rotation.z = side * 0.04;
      const hem = mesh(ringGeometry, trousers, leg, [0, -0.215, 0]);
      hem.scale.set(1.06, 0.75, 1.06);
      // The legs stay out of the apron's shade, whose edge would land on them as a hard chevron.
      leg.receiveShadow = hem.receiveShadow = false;
      const shoe = new THREE.Group();
      shoe.position.set(side * 0.235, 0.125, 0.15);
      shoe.rotation.y = side * 0.2;
      figure.add(shoe);
      sphere(shoe, [0, 0.015, 0], [0.218, 0.145, 0.315], white);
      mesh(shoeSoleGeometry, soleMaterial, shoe, [0, -0.083, 0]);
    }

    const body = new THREE.Group();
    body.position.y = 0.8;
    figure.add(body);
    const depthSquash = 0.74;
    const torsoProfile = new THREE.CatmullRomCurve3([
      [0, 0, 0], [0.3, 0.012, 0], [0.43, 0.07, 0], [0.475, 0.27, 0],
      [0.465, 0.55, 0], [0.4, 0.82, 0], [0.25, 0.985, 0], [0.16, 1.02, 0], [0, 1.022, 0],
    ].map(point => new THREE.Vector3(...point)), false, 'centripetal');
    const torsoPoints = torsoProfile.getPoints(42).map(point => new THREE.Vector2(Math.max(0, point.x), point.y));
    const torso = mesh(keepGeometry(new THREE.LatheGeometry(torsoPoints, 48)), shirt, body);
    torso.scale.z = depthSquash;

    // Cloth is wrapped around the torso: an angle around the body and a height give a point on it.
    function torsoRadius(height) {
      const upper = torsoPoints.findIndex(point => point.y >= height);
      const low = torsoPoints[upper - 1], high = torsoPoints[upper];
      return low.x + (high.x - low.x) * (height - low.y) / (high.y - low.y);
    }
    const waistRadius = torsoRadius(0.14);
    function wrap(angle, height, lift = 0) {
      const radius = (height >= 0.14 ? torsoRadius(height) : waistRadius + (0.14 - height) * 0.05) + 0.016 + lift;
      return [radius * Math.sin(angle), height, depthSquash * radius * Math.cos(angle)];
    }
    // A cloth panel: a sheet with quarter-circle lower corners and a rolled hem all around its border.
    function panel(top, bottom, corner, spread, lift, material, hemRadius, columns, centre = 0) {
      const straight = Math.round((top - bottom) / 0.04), rows = straight + 6;
      const points = [];
      for (let row = 0; row <= rows; row++) {
        const turn = Math.max(0, row - straight) / 6 * Math.PI / 2;
        const height = row < straight ? top + (bottom + corner - top) * row / straight : bottom + corner * (1 - Math.sin(turn));
        const reach = spread(height) - corner * (1 - Math.cos(turn)) / waistRadius;
        for (let column = 0; column <= columns; column++) {
          points.push(wrap(centre + reach * (column / columns * 2 - 1), height, lift));
        }
      }
      sheet(body, points, columns, material);
      const loop = [];
      for (let row = 0; row < rows; row++) loop.push(points[row * (columns + 1)]);
      for (let column = 0; column < columns; column++) loop.push(points[rows * (columns + 1) + column]);
      for (let row = rows; row > 0; row--) loop.push(points[row * (columns + 1) + columns]);
      for (let column = columns; column >= 0; column--) loop.push(points[column]);
      roll(body, loop, () => hemRadius, material, loop.length, 6, 1, null).castShadow = false;
    }
    const apronTop = 0.84;
    const apronSpread = height => 0.6 + 0.1 * smooth(apronTop, 0.64, height) + 0.5 * smooth(0.66, 0.46, height);
    panel(apronTop, -0.15, 0.11, apronSpread, 0, apronMaterial, 0.016, 24);
    panel(0.34, 0.06, 0.075, () => 0.35, 0.014, orange, 0.014, 14, 0.26);
    // The neck strap runs from the bib corners around the back of the neck.
    const strap = [[0.6, apronTop], [0.68, 0.9], [0.9, 0.955], [1.45, 0.995], [2.3, 1.008]];
    roll(body, [...strap, [Math.PI, 1.012], ...strap.map(([angle, height]) => [-angle, height]).reverse()]
      .map(([angle, height]) => wrap(angle, height, 0.004)), () => 0.022, apronMaterial, 56, 8, 1, null).castShadow = false;

    // The head turns on a neck pivot, so a tilt moves the whole head.
    const neck = new THREE.Group();
    neck.position.set(0, 1.86, 0);
    figure.add(neck);
    const head = new THREE.Group();
    head.position.set(0, 0.555, 0.025);
    neck.add(head);
    sphere(head, [0, 0, 0], [0.66, 0.64, 0.56], skin);
    const faceZ = (x, y, grow = 1) => grow * 0.56
      * Math.sqrt(Math.max(0, 1 - (x / (0.66 * grow)) ** 2 - (y / (0.64 * grow)) ** 2));
    for (const side of [-1, 1]) {
      sphere(head, [side * 0.65, -0.015, 0.015], [0.103, 0.139, 0.105], skin);
      dot(head, [side * 0.679, -0.023, 0.078], [0.041, 0.073, 0.035], skinShade);
      const cheek = dot(head, [side * 0.385, -0.125, 0.437], [0.1, 0.052, 0.017], blush);
      cheek.rotation.y = side * 0.42;
    }

    // Short combed hair: a close cap, slim sides and flat locks swept from a parting on his right.
    const cap = mesh(keepGeometry(new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.38)), hairMaterial, head, [0, 0.035, -0.025]);
    cap.scale.set(0.684, 0.7, 0.588);
    cap.rotation.x = -0.22;
    sphere(head, [0, 0.17, -0.2], [0.64, 0.45, 0.385], hairMaterial);
    for (const side of [-1, 1]) sphere(head, [side * 0.578, 0.17, -0.1], [0.078, 0.23, 0.27], hairMaterial).rotation.z = side * 0.1;
    // A point on the scalp: a turn around the head, a climb toward the crown, a lift off the skin.
    const scalp = ([turn, climb, lift]) => [(0.66 + lift) * Math.cos(climb) * Math.sin(turn),
      (0.64 + lift) * Math.sin(climb), (0.56 + lift) * Math.cos(climb) * Math.cos(turn)];
    for (const [width, flat, ...path] of [
      [0.14, 0.48, [-0.64, 0.64, 0.03], [-0.3, 0.8, 0.055], [0.1, 0.85, 0.07], [0.5, 0.75, 0.055], [0.86, 0.52, 0.04],
        [1.1, 0.26, 0.03], [1.22, 0.06, 0.025]],
      [0.15, 0.62, [-0.8, 0.9, 0.035], [-0.35, 1.05, 0.07], [0.2, 1.06, 0.1], [0.7, 0.88, 0.085], [1.12, 0.6, 0.045]],
      [0.095, 0.48, [-0.7, 0.7, 0.03], [-0.95, 0.54, 0.035], [-1.14, 0.3, 0.03], [-1.22, 0.08, 0.025]],
    ]) roll(head, path.map(scalp), progress => width * rounded(progress, 0.14, 0.32), hairMaterial, 36, 14, flat, null);

    // A short tidy beard: one shell that hugs the jaw and tucks into the skin along its border.
    const beard = [];
    for (let row = 0; row <= 18; row++) {
      for (let column = 0; column <= 72; column++) {
        const edge = Math.abs(column / 36 - 1);
        const around = (column / 36 - 1) * 1.46;
        // The cheek line dips beside the mouth and climbs to a slim sideburn at the ear.
        const top = -0.205 - 0.08 * smooth(0.1, 0.3, edge) * (1 - smooth(0.4, 0.75, edge)) + 0.22 * smooth(0.7, 1, edge);
        const angle = Math.asin(-top / 0.64) * (1 - row / 18) + Math.PI / 2 * row / 18;
        // The border lies exactly on the skin, so the outline follows the mesh and stays crisp.
        const grow = 1.002 + (0.035 + 0.03 * Math.sin(angle) ** 2) * smooth(0, 0.13, row / 18) * smooth(0, 0.08, 1 - edge);
        beard.push([0.66 * Math.cos(angle) * Math.sin(around) * grow, -0.64 * Math.sin(angle) * grow,
          0.56 * Math.cos(angle) * Math.cos(around) * grow]);
      }
    }
    sheet(head, beard, 72, hairMaterial);
    for (const side of [-1, 1]) {
      const whisker = dot(head, [side * 0.1, -0.188, faceZ(0.1, -0.188) + 0.03], [0.12, 0.042, 0.045], hairMaterial);
      whisker.rotation.set(0, side * 0.2, side * -0.24);
    }

    const eyes = [];
    const pupils = [];
    const lids = [];
    const brows = [];
    for (const side of [-1, 1]) {
      const eye = new THREE.Group();
      eye.position.set(side * 0.215, 0.06, 0.53);
      eye.rotation.y = side * 0.26;
      head.add(eye);
      sphere(eye, [0, 0, 0.004], [0.1, 0.112, 0.03], white).receiveShadow = false;
      const pupil = sphere(eye, [0, 0, 0.031], [0.056, 0.07, 0.018], ink);
      dot(pupil, [-0.28, 0.37, 0.86], [0.19, 0.15, 0.13], white);
      dot(pupil, [0.3, -0.22, 0.94], [0.075, 0.065, 0.07], white);
      eyes.push(eye);
      pupils.push(pupil);
      // The closed lid of a blink: one soft line, swapped in at the peak for two or three frames.
      const lid = roll(head, [[-0.092, 0, 0.016], [0, -0.03, 0.03], [0.092, 0, 0.016]],
        progress => 0.013 * rounded(progress, 0.2), ink, 16, 8);
      lid.position.copy(eye.position);
      lid.rotation.copy(eye.rotation);
      lid.castShadow = lid.visible = false;
      lids.push(lid);
      // Both brows arch high and open; the one on the bubble side sits a touch higher.
      const raise = side > 0 ? 0.028 : 0;
      const brow = roll(head, [[side * 0.335, 0.218 + raise * 0.4], [side * 0.235, 0.282 + raise], [side * 0.118, 0.262 + raise * 0.8]]
        .map(([x, y]) => [x, y, faceZ(x, y) + 0.012]), progress => 0.027 * rounded(progress, 0.22), hairMaterial, 20, 10, 0.8);
      brow.castShadow = false;
      brows.push(brow);
    }
    sphere(head, [0, -0.088, 0.596], [0.09, 0.08, 0.086], skin);
    // The mouth hangs from its upper lip, so the question can be spoken with a small jaw motion.
    const mouthTop = -0.25;
    const mouth = new THREE.Group();
    mouth.position.y = mouthTop;
    head.add(mouth);
    // Each part of the mouth is a lens on the curved face: half width, corners, upper bow, lower bow.
    function mouthPart(half, corners, upper, lower, material, offset) {
      const shape = new THREE.Shape();
      shape.moveTo(-half, corners);
      shape.bezierCurveTo(-half / 2, upper, half / 2, upper, half, corners);
      shape.bezierCurveTo(half * 0.8, lower, -half * 0.8, lower, -half, corners);
      const geometry = keepGeometry(new THREE.ShapeGeometry(shape, 24));
      const positions = geometry.attributes.position;
      for (let index = 0; index < positions.count; index++) {
        positions.setZ(index, faceZ(positions.getX(index), positions.getY(index), 1.05) + offset);
      }
      geometry.translate(0, -mouthTop, 0);
      geometry.computeVertexNormals();
      mesh(geometry, material, mouth).castShadow = false;
    }
    mouthPart(0.178, mouthTop, -0.284, -0.405, smileMaterial, 0.008);
    mouthPart(0.142, -0.268, -0.291, -0.328, white, 0.015);
    mouthPart(0.062, -0.366, -0.345, -0.383, blush, 0.014);

    // The parcel: a small taped cardboard box with a shipping label, held against the hip.
    const parcel = new THREE.Group();
    parcel.position.set(-0.46, 1.19, 0.47);
    parcel.rotation.set(0, 0.185, 0.03);
    figure.add(parcel);
    roundedBox(parcel, 0.5, 0.38, 0.4, 0.035, cardboard, [0, 0, 0]);
    const slabGeometry = keepGeometry(new THREE.BoxGeometry(1, 1, 1));
    for (const [material, size, position] of [
      [orange, [0.1, 0.008, 0.43], [0, 0.203, 0]],
      [orange, [0.1, 0.13, 0.008], [0, 0.141, 0.213]],
      [white, [0.17, 0.105, 0.006], [0.135, -0.02, 0.214]],
      [ink, [0.115, 0.013, 0.004], [0.135, 0.004, 0.218]],
      [ink, [0.08, 0.013, 0.004], [0.118, -0.032, 0.218]],
    ]) {
      const slab = mesh(slabGeometry, material, parcel, position);
      slab.scale.set(...size);
      slab.castShadow = false;
    }
    // His arm reaches around it: the palm on the side of the box, four fingers wrapped onto its front.
    sphere(parcel, [-0.285, -0.03, 0.09], [0.07, 0.15, 0.125], skin);
    for (const [y, fan, length] of [[0.07, 0.07, 0.96], [0.005, 0.025, 1.06], [-0.06, -0.02, 1], [-0.122, -0.065, 0.82]]) {
      const grip = mesh(fingerGeometry, skin, parcel, [-0.196 - (length - 1) * 0.06, y, 0.226]);
      grip.rotation.z = Math.PI / 2 + fan;
      grip.scale.y = length;
    }

    const yAxis = new THREE.Vector3(0, 1, 0);
    const boneVector = new THREE.Vector3();
    const bendNormal = new THREE.Vector3();
    const sleeveRings = 32, sleeveSides = 14, cuffRing = 20;
    // One sleeve per arm: a dome at the shoulder, a step down at the rolled cuff, a taper to the wrist.
    const sleeveRadius = progress => Math.sqrt(1 - Math.max(0, 1 - progress / 0.14) ** 2) * (progress <= cuffRing / sleeveRings
      ? 0.112 + 0.04 * Math.max(0, 1 - progress / 0.35) : 0.127 - 0.059 * progress);
    function makeArm(side) {
      const sleeveCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.35, 1.72, 0.01),
        new THREE.Vector3(side * 0.7, 1.2, 0.19),
        new THREE.Vector3(side * 0.86, 1.5, 0.3),
      ], false, 'centripetal');
      // The same tube carries the shirt sleeve and the bare forearm below the cuff.
      const sleeveGeometry = keepGeometry(new THREE.TubeGeometry(sleeveCurve, sleeveRings, 0.11, sleeveSides, false));
      sleeveGeometry.clearGroups();
      sleeveGeometry.addGroup(0, cuffRing * sleeveSides * 6, 0);
      sleeveGeometry.addGroup(cuffRing * sleeveSides * 6, (sleeveRings - cuffRing) * sleeveSides * 6, 1);
      const sleeve = mesh(sleeveGeometry, [shirt, skin], figure);
      sleeve.frustumCulled = false;
      // The head's shadow would cut a hard scoop into the shoulder, so the arms stay evenly lit.
      sleeve.receiveShadow = false;
      const cuff = mesh(ringGeometry, shirt, figure);
      cuff.scale.y = 1.4;
      return { sleeveCurve, sleeveGeometry, cuff,
        lastElbow: new THREE.Vector3(Infinity, Infinity, Infinity),
        lastWrist: new THREE.Vector3(Infinity, Infinity, Infinity) };
    }
    const parcelArm = makeArm(-1);
    const askingArm = makeArm(1);
    function positionArm(arm, elbow, wrist) {
      if (arm.lastElbow.equals(elbow) && arm.lastWrist.equals(wrist)) return;
      arm.lastElbow.copy(elbow);
      arm.lastWrist.copy(wrist);
      arm.sleeveCurve.points[1].copy(elbow);
      arm.sleeveCurve.points[2].copy(wrist);
      // The plane of the bend gives one steady frame, so the sleeve never twists at the elbow.
      boneVector.copy(elbow).sub(arm.sleeveCurve.points[0]);
      bendNormal.copy(wrist).sub(elbow).cross(boneVector);
      if (bendNormal.lengthSq() < 1e-6) bendNormal.set(0, 0, 1);
      else bendNormal.normalize();
      sweep(arm.sleeveGeometry, arm.sleeveCurve, sleeveRadius, boneVector.length() + wrist.distanceTo(elbow), 1, bendNormal);
      arm.sleeveCurve.getPoint(cuffRing / sleeveRings, arm.cuff.position);
      arm.sleeveCurve.getTangent(cuffRing / sleeveRings, ringTangent);
      arm.cuff.quaternion.setFromUnitVectors(yAxis, ringTangent);
    }
    // The asking hand: a soft fist with the index finger up and the thumb over three curled fingers.
    const hand = new THREE.Group();
    hand.scale.setScalar(1.25);
    figure.add(hand);
    sphere(hand, [0, 0.01, 0], [0.064, 0.06, 0.062], skin);
    sphere(hand, [0.004, 0.108, 0], [0.106, 0.11, 0.074], skin);
    const indexFinger = new THREE.Group();
    indexFinger.position.set(-0.058, 0.19, 0.006);
    hand.add(indexFinger);
    mesh(fingerGeometry, skin, indexFinger, [0, 0.102, 0]).scale.set(1.15, 1.54, 1.15);
    for (let curled = 0; curled < 3; curled++) {
      dot(hand, [0.008 + curled * 0.047, 0.172 - curled * 0.014, 0.05], [0.031, 0.046, 0.04], skin);
    }
    const thumb = mesh(fingerGeometry, skin, hand, [-0.012, 0.09, 0.07]);
    thumb.rotation.z = -1.05;
    thumb.scale.y = 0.91;

    // The question: a white clay chat bubble with an orange rim and a chunky orange question mark.
    const bubble = new THREE.Group();
    bubble.position.set(1.6, 2.62, 0.05);
    bubble.rotation.set(-0.14, 0.22, -0.03);
    scene.add(bubble);
    const bubbleShape = new THREE.Shape();
    bubbleShape.moveTo(-0.34, -0.46);
    bubbleShape.lineTo(0.3, -0.46);
    bubbleShape.quadraticCurveTo(0.5, -0.46, 0.5, -0.26);
    bubbleShape.lineTo(0.5, 0.26);
    bubbleShape.quadraticCurveTo(0.5, 0.46, 0.3, 0.46);
    bubbleShape.lineTo(-0.3, 0.46);
    bubbleShape.quadraticCurveTo(-0.5, 0.46, -0.5, 0.26);
    bubbleShape.lineTo(-0.5, -0.2);
    // The tail leaves the lower corner and aims at his mouth.
    bubbleShape.quadraticCurveTo(-0.52, -0.36, -0.695, -0.398);
    bubbleShape.quadraticCurveTo(-0.735, -0.418, -0.69, -0.44);
    bubbleShape.quadraticCurveTo(-0.5, -0.455, -0.34, -0.46);
    const bubbleGeometry = keepGeometry(new THREE.ExtrudeGeometry(bubbleShape, {
      depth: 0.06, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 4, curveSegments: 14,
    }));
    bubbleGeometry.translate(0, 0, -0.03);
    const rimGeometry = keepGeometry(new THREE.ExtrudeGeometry(bubbleShape, {
      depth: 0.03, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.018, bevelOffset: 0.058,
      bevelSegments: 2, curveSegments: 14,
    }));
    rimGeometry.translate(0, 0, -0.052);
    const mark = new THREE.Group();
    mark.position.set(0.02, 0.02, 0.084);
    mark.scale.set(1.18, 1.18, 1);
    bubble.add(mark);
    // The bubble floats clear of the figure, so it takes no part in the shadow pass.
    for (const part of [
      mesh(bubbleGeometry, white, bubble),
      mesh(rimGeometry, orange, bubble),
      roll(mark, [[-0.13, 0.15, 0], [-0.068, 0.232, 0], [0.035, 0.245, 0], [0.117, 0.182, 0], [0.13, 0.08, 0],
        [0.087, 0.012, 0], [0.02, -0.04, 0], [0, -0.095, 0], [0, -0.135, 0]],
        progress => 0.052 * rounded(progress, 0.07), orange, 64, 14),
      sphere(mark, [0, -0.268, 0], [0.062, 0.062, 0.058], orange),
    ]) part.castShadow = part.receiveShadow = false;

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
      const shadow = mesh(keepGeometry(new THREE.PlaneGeometry(2.05, 1.2)), shadowMaterial, scene, [0.02, 0.014, 0.2]);
      shadow.rotation.x = -Math.PI / 2;
      shadow.castShadow = shadow.receiveShadow = false;
    }

    // Rare marketing delight: one quiet asking beat in a ten-second cycle.
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
    const ramp = (phase, start, duration) => easeInOut(Math.min(1, Math.max(0, (phase - start) / duration)));
    const parcelElbow = new THREE.Vector3(-0.88, 1.27, 0.02);
    const parcelWrist = new THREE.Vector3(-0.3, -0.04, 0.03).applyEuler(parcel.rotation).add(parcel.position);
    const askingElbow = new THREE.Vector3();
    const askingWrist = new THREE.Vector3();
    function pose(time) {
      const phase = ((time % 10) + 10) % 10;
      // He looks up at his question, lifts his finger and says it, while the bubble pops once.
      const ask = ramp(phase, 1, 0.45) * (1 - ramp(phase, 3.3, 0.55));
      const pop = -0.08 * ramp(phase, 1.2, 0.2) + 0.135 * ramp(phase, 1.4, 0.22) - 0.055 * ramp(phase, 1.62, 0.36);
      const wiggle = Math.sin((phase - 1.4) * Math.PI * 2 / 0.5) * ramp(phase, 1.4, 0.15) * (1 - ramp(phase, 1.6, 0.9));
      const talk = ask * (0.5 - 0.5 * Math.cos((phase - 1.45) * Math.PI * 2 / 0.62));
      const breath = Math.sin(phase * Math.PI * 2 / 5);
      const sway = Math.sin(phase * Math.PI * 2 / 10);
      body.scale.y = 1 + breath * 0.003;
      neck.rotation.set(-0.04 - ask * 0.05, 0.1 + sway * 0.02 + ask * 0.06, 0.03 + ask * 0.08);
      let blink = 0;
      for (const blinkAt of [4.3, 8.2]) {
        const blinkPhase = (phase - blinkAt) / 0.17;
        if (blinkPhase > 0 && blinkPhase < 1) blink = Math.sin(blinkPhase * Math.PI);
      }
      const shut = blink > 0.72;
      for (let index = 0; index < eyes.length; index++) {
        eyes[index].visible = !shut;
        lids[index].visible = shut;
        eyes[index].scale.y = Math.max(0.07, 1 - blink * 0.93);
        pupils[index].position.x = 0.006 + sway * 0.005 + ask * 0.022;
        pupils[index].position.y = ask * 0.026;
        brows[index].position.y = ask * 0.036;
      }
      mouth.scale.set(1 - talk * 0.1, 1 + talk * 0.3, 1);
      bubble.scale.setScalar(1 + pop);
      bubble.position.y = 2.62 + breath * 0.01;
      mark.rotation.z = wiggle * 0.1;
      askingElbow.set(0.72, 1.17 + ask * 0.025, 0.12);
      askingWrist.set(1.05 - ask * 0.015, 1.45 + ask * 0.055, 0.22);
      positionArm(parcelArm, parcelElbow, parcelWrist);
      positionArm(askingArm, askingElbow, askingWrist);
      hand.position.copy(askingWrist);
      hand.rotation.set(-0.06, 0.2, -0.2 + ask * 0.08);
      indexFinger.rotation.z = talk * 0.09;
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
      capturePoster(time = 0) {
        if (disposed || contextLost) return null;
        const previousSize = renderer.getSize(new THREE.Vector2());
        const previousPixelRatio = renderer.getPixelRatio();
        let poster = null;
        try {
          renderer.setPixelRatio(1);
          renderer.setSize(640, 640, false);
          pose(Number.isFinite(time) ? time : 0);
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
