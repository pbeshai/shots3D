// Big thanks to https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js
// for a lot of the examples I used to create this.

(function (THREE, THREEx, Util) {
  'use strict';

  var container, scene, camera, renderer, controls, stats;
  var clock = new THREE.Clock();
  var floor, hoop;
  var balls = [];
  var particles, particleSystem;
  var scale = 10; // 10 units = 1 foot
  var dim = {
    court: {
      length: ft(94),
      width: ft(50)
    },
    hoop: { // dimensions from baseline
      x: 0,
      y: ft(40) - inches(9),
      z: ft(10),
      r: inches(9)
    },
    ball: {
      r: inches(9.85)
    }
  };

  var shotArcPointsArray = [], shotArcIndexArray = [];
  var particleShotArcPointsArray = [], particleShotArcIndexArray = [];

  init();
  animate();

  function init() {
    scene = new THREE.Scene();

    initCamera();
    initRenderer();
    initEvents();
    initControls();
    initLighting();
    initGeometry();
  }

  function ft(x) {
    return x * scale;
  }

  function inches(x) {
    return scale * (x / 12);
  }

  function initCamera() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var viewAngle = 75;
    var near = 0.1;
    var far = 10000;
    camera = new THREE.PerspectiveCamera(viewAngle, screenWidth / screenHeight, near, far);

    // Add the camera to the scene and set the angle toward the scene origin
    scene.add(camera);
    // camera.position.set(ft(50), ft(20), ft(-20));
    camera.position.set(0, ft(80), ft(0));
    var hoopPos = new THREE.Vector3(dim.hoop.x, dim.hoop.z, -dim.hoop.y);
    camera.lookAt(hoopPos);
  }

  function initRenderer() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(screenWidth, screenHeight);
    document.body.appendChild(renderer.domElement);
  }

  function initEvents() {
    // automatically resize renderer
    THREEx.WindowResize(renderer, camera);
    // toggle full-screen on given key press
    THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });
  }

  function initControls() {
    // Orbit controls = mouse1 rotate, mouse2 pan, scroll to zoom
    controls = new THREE.OrbitControls(camera, renderer.domElement);
  }

  function initLighting() {
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, ft(40), -dim.court.length / 2);
    scene.add(light);

    var light2 = new THREE.PointLight(0xffffff);
    light2.position.set(0, ft(40), dim.court.length / 2);
    scene.add(light2);


    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
  }


  function initGeometry() {
    initCourt();

    for (var i = 0; i < 10; i++) {
      initBall();
    }

    initParticles();

    // var axes = new THREE.AxisHelper(50);
    // axes.position.set(0,0,0);
    // scene.add(axes);
  }

  function initParticles() {
    particles = new THREE.Geometry;
    var step = 50;
    for (var x = 0; x < dim.court.width; x+= step) {
      for (var y = 0; y < dim.court.length; y+= step) {
        for (var z = 0; z < ft(30); z += step) {
          var particle = new THREE.Vector3(x - dim.court.width / 2, y - dim.court.length / 2, z);
          particles.vertices.push(particle);
        }
      }
    }

    // var particleMaterial = new THREE.ParticleBasicMaterial({ color: 0x995700, size: dim.ball.r*2 });
    var particleTexture = THREE.ImageUtils.loadTexture('img/basketball_round.png');
    var particleMaterial = new THREE.PointCloudMaterial({ map: particleTexture, transparent: true, size: dim.ball.r*2 });

    particleSystem = new THREE.PointCloud(particles, particleMaterial);

    floor.add(particleSystem);
  }

  function initBall() {
    // Texture from http://www.nasa.gov/externalflash/sphere_gallery/hi-resjpgs/12.jpg
    var texture = new THREE.ImageUtils.loadTexture('img/basketball_texture.jpg');
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    var geometry = new THREE.SphereGeometry(dim.ball.r, 32, 16);
    var material = new THREE.MeshLambertMaterial({ map: texture });
    var ball = new THREE.Mesh(geometry, material);
    ball.position.set(0, 0, dim.ball.r);
    balls.push(ball);
    floor.add(ball);

    // basic glow effect
    var spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.ImageUtils.loadTexture('img/glow.png'),
      useScreenCoordinates: false,
      color: 0xff8800,
      transparent: false,
      blending: THREE.AdditiveBlending
    });

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(40, 40, 1);
    ball.add(sprite); // this centers the glow at the mesh
  }


  function initCourt() {
    var floorGeometry = new THREE.BoxGeometry(dim.court.width, dim.court.length, 1, 10, 10);
    var floorMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    // var floorTexture = new THREE.ImageUtils.loadTexture('img/floor.jpg');
    // floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    // floorTexture.repeat.set(5,5);
    // var floorMaterial = new THREE.MeshLambertMaterial({ map: floorTexture });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -0.5, 0);
    floor.rotation.x = -Math.PI / 2; // in floor coordinates Z is up, x is the same, and y is length of court
    scene.add(floor);

    var axes = new THREE.AxisHelper(10);
    axes.position.set(0, 0, 10);
    floor.add(axes);

    // <polyline fill="none" stroke="#999999" stroke-linecap="square" stroke-linejoin="bevel" stroke-miterlimit="10" points="30.059,0 30.059,137.064     "></polyline>

    var components = { // derived from SVG made for Buckets
      corner3ptRight: {
        line: { x1: 470.364, y1: 137.064, x2: 470.364, y2: 0 }
      },
      corner3ptLeft: {
        line: { x1: 30.059, y1: 0, x2: 30.059, y2: 137.064 }
      },
      arc3pt: {
        // SVG path
        path: 'M30.203,137.058 c49.417,121.198,187.98,179.485,309.489,130.194c59.332-24.068,106.401-71.017,130.529-130.194'
      },
      paint: {
        rect: { x: 170.196, y: 0, width: 160.033, height: 189.945, skipBottom: true } // skip bottom to not show the line along the baseline.
      },
      paintCircleTop: {
        path: 'M190.518,189.945 c0,32.943,26.726,59.65,59.694,59.65c32.97,0,59.695-26.707,59.695-59.65'
      },
      paintCircleBottom: {
        x: 250,
        y: ft(19),
        dashed: true,

        circle: { r: 60, thetaStart: Math.PI, thetaLength: Math.PI }
      },

      restrictedArea: {
        path: 'M210.729,52.773 c2.745,21.792,22.653,37.229,44.459,34.486c18.033-2.269,32.236-16.464,34.509-34.486'
      },
      paintInnerRight: { line: { x1: 310.331, y1: 189.945, x2: 310.331, y2: 0 } },
      paintInnerLeft: { line: { x1: 190.094, y1: 189.945, x2: 190.094, y2: 0 } },
      paintTickRight1: { line: { x1: 340.391, y1: 145.95, x2: 330.229, y2: 145.95 } },
      paintTickRight2: { line: { x1: 340.391, y1: 114.223, x2: 330.229, y2: 114.223 } },
      paintTickRight3: { line: { x1: 340.391, y1: 82.495, x2: 330.229, y2: 82.495 } },
      paintTickRight4: { line: { x1: 340.391, y1: 71.071, x2: 330.229, y2: 71.071 } },
      paintTickLeft1: { line: { x1: 160.032, y1: 145.95, x2: 170.196, y2: 145.95 } },
      paintTickLeft2: { line: { x1: 160.032, y1: 114.223, x2: 170.196, y2: 114.223 } },
      paintTickLeft3: { line: { x1: 160.032, y1: 82.495, x2: 170.196, y2: 82.495 } },
      paintTickLeft4: { line: { x1: 160.032, y1: 71.071, x2: 170.196, y2: 71.071 } },

      benchLineLeft: { line: { x1: 0, y1: 280.053, x2: 30.059, y2: 280.053, } },
      benchLineRight: { line: { x1: 500, y1: 280.053, x2: 470.364, y2: 280.053 } },

      halfCourtCircle: {
        path: 'M309.907,470 c0-32.945-26.726-59.65-59.695-59.65c-32.969,0-59.694,26.705-59.694,59.65'
      },

      halfCourtLine: {
        line: { x1: 0, y1: 470, x2: 500, y2: 470 }
      },

      courtBorder: {
        rect: { x: 0, y: 0, width: 500, height: 940 }
      }
    };
    addMirroredComponent(components.arc3pt);
    addMirroredComponent(components.corner3ptLeft);
    addMirroredComponent(components.corner3ptRight);
    addMirroredComponent(components.paint);
    addMirroredComponent(components.restrictedArea);
    addMirroredComponent(components.paintCircleBottom);
    addMirroredComponent(components.paintCircleTop);
    addMirroredComponent(components.paintInnerRight);
    addMirroredComponent(components.paintInnerLeft);
    addMirroredComponent(components.paintTickRight1);
    addMirroredComponent(components.paintTickRight2);
    addMirroredComponent(components.paintTickRight3);
    addMirroredComponent(components.paintTickRight4);
    addMirroredComponent(components.paintTickLeft1);
    addMirroredComponent(components.paintTickLeft2);
    addMirroredComponent(components.paintTickLeft3);
    addMirroredComponent(components.paintTickLeft4);
    addMirroredComponent(components.benchLineLeft);
    addMirroredComponent(components.benchLineRight);
    addMirroredComponent(components.halfCourtCircle);
    addComponent(components.halfCourtLine);
    addComponent(components.courtBorder);
    initHoop();

    function addMirroredComponent(component) {
      addComponent(component);
      addComponent(component, true);
    }


    function addComponent(component, otherSide) {

      var materialProps = { color: 0x666666, side: THREE.DoubleSide };
      var lineMaterial;
      if (component.dashed) {
        materialProps.dashSize = inches(14);
        materialProps.gapSize = inches(14);

        lineMaterial = new THREE.LineDashedMaterial(materialProps);
      } else {
        lineMaterial = new THREE.LineBasicMaterial(materialProps);
      }

      var geometry;
      if (component.line) {
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(component.line.x1, component.line.y1, 0));
        geometry.vertices.push(new THREE.Vector3(component.line.x2, component.line.y2, 0));

      } else if (component.path) { // handle SVG paths
        geometry = new THREE.ShapeGeometry(Util.transformSVGPath(component.path));
      } else if (component.rect) {
        geometry = new THREE.Geometry();
        if (component.rect.skipBottom !== true) { // skip bottom in paint
          geometry.vertices.push(new THREE.Vector3(component.rect.x, component.rect.y, 0));
        }
        geometry.vertices.push(new THREE.Vector3(component.rect.x + component.rect.width, component.rect.y, 0));
        geometry.vertices.push(new THREE.Vector3(component.rect.x + component.rect.width, component.rect.y + component.rect.height, 0));
        geometry.vertices.push(new THREE.Vector3(component.rect.x, component.rect.y + component.rect.height, 0));
        geometry.vertices.push(new THREE.Vector3(component.rect.x, component.rect.y, 0));
      } else if (component.circle) {
        geometry = new THREE.CircleGeometry(component.circle.r, 16, component.circle.thetaStart, component.circle.thetaLength);
      }

      var line = new THREE.Line(geometry, lineMaterial, component.dashed ?  THREE.LinePieces : undefined);

      var svgOrigin = { x: -250, y: -470, z: 1 };
      var compX = component.x, compY = component.y;
      if (otherSide) {
        svgOrigin.y *= -1;
        line.scale.set(1, -1, 1);
        compY *= -1;
      }
      line.position.set(svgOrigin.x + (compX || 0), svgOrigin.y + (compY || 0), svgOrigin.z);
      floor.add(line);
    }
  }


  function initHoop() {
    // add in hoop
    var hoopGeometry = new THREE.TorusGeometry(dim.hoop.r, inches(1), 32, 32);
    var hoopMaterial = new THREE.MeshLambertMaterial({ color: 0xAA0000 });
    hoop = new THREE.Mesh(hoopGeometry, hoopMaterial);

    hoop.position.set(dim.hoop.x, dim.hoop.y, dim.hoop.z);
    floor.add(hoop);

    // add backboard
    var backboardGeometry = new THREE.BoxGeometry(inches(60), inches(42), inches(4), 10, 10);
    var backboardMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    var backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    backboard.position.set(0, dim.hoop.r + inches(2), inches(16));
    backboard.rotation.x = -Math.PI / 2; // in backboard coordinates Z is up, x is the same, and y is length of court

    hoop.add(backboard);

  }


  function animate() {
    requestAnimationFrame(animate);
    render();
    update();
  }

  var ballDirection = 1;

  function randomCourtLocation() {
    var location = {
      x: (Math.random() * dim.court.width) - (dim.court.width / 2),
      y: (Math.random() * dim.court.length) - (dim.court.length / 2),
      z: 0
    };
    return location;
  }

  function generateShotArc(ballLoc) {
    ballLoc = ballLoc || randomCourtLocation();

    // TODO: height should be determined as a function of distance to rim
    var ballHeight = ft(Math.random() * 10 + 25);

    var shotArc = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(ballLoc.x, ballLoc.y, ft(6)),
      new THREE.Vector3(ballLoc.x + (dim.hoop.x - ballLoc.x) / 2, ballLoc.y + (dim.hoop.y - ballLoc.y) / 2, ballHeight),
      new THREE.Vector3(dim.hoop.x, dim.hoop.y, dim.hoop.z)
    );
    // number of points determines time ball takes to reach the basket, should be determined by height of arc
    var shotArcPoints = shotArc.getPoints(ballHeight / 5);

    return shotArcPoints;
  }

  function update() {
    // delta = change in time since last call (in seconds)
    var delta = clock.getDelta();

    // a new random shot
    balls.forEach(function (ball, i) {
      var shotArcPoints = shotArcPointsArray[i], shotArcIndex = shotArcIndexArray[i];

      if (shotArcIndex === undefined || shotArcIndex === shotArcPoints.length) {
        shotArcPoints = shotArcPointsArray[i] = generateShotArc();
        shotArcIndex = shotArcIndexArray[i] = 0;
      }
      var currArcPoint = shotArcPoints[shotArcIndex];

      ball.position.x = currArcPoint.x;
      ball.position.y = currArcPoint.y;
      ball.position.z = currArcPoint.z;

      shotArcIndexArray[i] += 1;
      ball.rotation.x += 0.15;
      // ball.rotation.y += 0.01;

      // particleSystem.rotation.x += delta / 10;
    });

    particles.vertices.forEach(function (particle, i) {
      var shotArcPoints = particleShotArcPointsArray[i], shotArcIndex = particleShotArcIndexArray[i];

      if (shotArcIndex === undefined || shotArcIndex === shotArcPoints.length) {
        shotArcPoints = particleShotArcPointsArray[i] = generateShotArc();
        shotArcIndex = particleShotArcIndexArray[i] = 0;
      }

      var currArcPoint = shotArcPoints[shotArcIndex];
      if (i === 100) {
        console.log(currArcPoint, particle);
      }
      particle.x = currArcPoint.x;
      particle.y = currArcPoint.y;
      particle.z = currArcPoint.z;

      particleShotArcIndexArray[i] += 1;

      // particleSystem.rotation.x += delta / 10;
    });
    particles.verticesNeedUpdate = true;
  }

  function render() {
    renderer.render(scene, camera);
  }


})(THREE, THREEx, Util);
