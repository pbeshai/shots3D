// Big thanks to https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js
// for a lot of the examples I used to create this.

(function (THREE, THREEx) {
  'use strict';

  var container, scene, camera, renderer, controls, stats;
  var clock = new THREE.Clock();
  var floor, hoop, ball;

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

  var shotCurve, shotCurvePoints, shotCurveIndex;

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

    initBall();

    // var axes = new THREE.AxisHelper(50);
    // axes.position.set(0,0,0);
    // scene.add(axes);
  }

  function initBall() {
    // Texture from http://www.nasa.gov/externalflash/sphere_gallery/hi-resjpgs/12.jpg
    var texture = new THREE.ImageUtils.loadTexture('img/basketball_texture.jpg');
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    var geometry = new THREE.SphereGeometry(dim.ball.r, 32, 16);
    var material = new THREE.MeshLambertMaterial({ map: texture });
    ball = new THREE.Mesh(geometry, material);
    ball.position.set(0, 0, dim.ball.r);
    floor.add(ball);

    // basic glow effect
    var spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.ImageUtils.loadTexture('img/glow.png'),
      useScreenCoordinates: false,
      color: 0xffaa00,
      transparent: false,
      blending: THREE.AdditiveBlending
    });

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(40, 40, 1);
    ball.add(sprite); // this centers the glow at the mesh
  }


  function initCourt() {
    var floorTexture = new THREE.ImageUtils.loadTexture('img/floor.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(5,5);
    var floorGeometry = new THREE.BoxGeometry(dim.court.width, dim.court.length, 1, 10, 10);
    // var material = new THREE.MeshLambertMaterial({ color: 0xCC884e });
    var floorMaterial = new THREE.MeshLambertMaterial({ map: floorTexture });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -0.5, 0);
    floor.rotation.x = -Math.PI / 2; // in floor coordinates Z is up, x is the same, and y is length of court
    scene.add(floor);

    var axes = new THREE.AxisHelper(10);
    axes.position.set(0,0,10);
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

      var materialProps = { color: 0x333333, side: THREE.DoubleSide };
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
        geometry = new THREE.ShapeGeometry(transformSVGPath(component.path));
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

      var line = new THREE.Line(geometry, lineMaterial, component.dashed ?  THREE.LinePieces : undefined );

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
    var hoopGeometry = new THREE.RingGeometry(dim.hoop.r, dim.hoop.r + inches(1), 32);
    var hoopMaterial = new THREE.MeshLambertMaterial({ color: 0xAA0000 });
    hoop = new THREE.Mesh(hoopGeometry, hoopMaterial);

    hoop.position.set(dim.hoop.x, dim.hoop.y, dim.hoop.z);
    floor.add(hoop);
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

  function update() {
    // delta = change in time since last call (in seconds)
    var delta = clock.getDelta();

    // a new random shot
    if (shotCurveIndex === undefined || shotCurveIndex === shotCurvePoints.length) {
      var ballLoc = randomCourtLocation();
      var ballHeight = ft(Math.random() * 10 + 25);

      shotCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(ballLoc.x, ballLoc.y, ft(6)),
        new THREE.Vector3(ballLoc.x + (dim.hoop.x - ballLoc.x) / 2, ballLoc.y + (dim.hoop.y - ballLoc.y) / 2, ballHeight),
        new THREE.Vector3(dim.hoop.x, dim.hoop.y, dim.hoop.z)
      );
      shotCurvePoints = shotCurve.getPoints(60);
      shotCurveIndex = 0;
    }

    ball.position.x = shotCurvePoints[shotCurveIndex].x;
    ball.position.y = shotCurvePoints[shotCurveIndex].y;
    ball.position.z = shotCurvePoints[shotCurveIndex].z;



    shotCurveIndex += 1;
    ball.rotation.x += 0.15;
    // ball.rotation.y += 0.01;
  }

  function render() {
    renderer.render(scene, camera);
  }


  // External helpers: https://gist.github.com/gabrielflorit/3758456
  function transformSVGPath(pathStr) {

    var DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46,
        MINUS = 45;

    var path = new THREE.Shape();

    var idx = 1, len = pathStr.length, activeCmd,
        x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
        x1 = 0, x2 = 0, y1 = 0, y2 = 0,
        rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;

    function eatNum() {
      var sidx, c, isFloat = false, s;
      // eat delims
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE)
          break;
        idx++;
      }
      if (c === MINUS)
        sidx = idx++;
      else
        sidx = idx;
      // eat number
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (DIGIT_0 <= c && c <= DIGIT_9) {
          idx++;
          continue;
        }
        else if (c === PERIOD) {
          idx++;
          isFloat = true;
          continue;
        }

        s = pathStr.substring(sidx, idx);
        return isFloat ? parseFloat(s) : parseInt(s);
      }

      s = pathStr.substring(sidx);
      return isFloat ? parseFloat(s) : parseInt(s);
    }

    function nextIsNum() {
      var c;
      // do permanently eat any delims...
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE)
          break;
        idx++;
      }
      c = pathStr.charCodeAt(idx);
      return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
    }

    var canRepeat;
    activeCmd = pathStr[0];
    while (idx <= len) {
      canRepeat = true;
      switch (activeCmd) {
          // moveto commands, become lineto's if repeated
        case 'M':
          x = eatNum();
          y = eatNum();
          path.moveTo(x, y);
          activeCmd = 'L';
          break;
        case 'm':
          x += eatNum();
          y += eatNum();
          path.moveTo(x, y);
          activeCmd = 'l';
          break;
        case 'Z':
        case 'z':
          canRepeat = false;
          if (x !== firstX || y !== firstY)
            path.lineTo(firstX, firstY);
          break;
          // - lines!
        case 'L':
        case 'H':
        case 'V':
          nx = (activeCmd === 'V') ? x : eatNum();
          ny = (activeCmd === 'H') ? y : eatNum();
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
        case 'l':
        case 'h':
        case 'v':
          nx = (activeCmd === 'v') ? x : (x + eatNum());
          ny = (activeCmd === 'h') ? y : (y + eatNum());
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
          // - cubic bezier
        case 'C':
          x1 = eatNum(); y1 = eatNum();
        case 'S':
          if (activeCmd === 'S') {
            x1 = 2 * x - x2; y1 = 2 * y - y2;
          }
          x2 = eatNum();
          y2 = eatNum();
          nx = eatNum();
          ny = eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx; y = ny;
          break;
        case 'c':
          x1 = x + eatNum();
          y1 = y + eatNum();
        case 's':
          if (activeCmd === 's') {
            x1 = 2 * x - x2;
            y1 = 2 * y - y2;
          }
          x2 = x + eatNum();
          y2 = y + eatNum();
          nx = x + eatNum();
          ny = y + eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx; y = ny;
          break;
          // - quadratic bezier
        case 'Q':
          x1 = eatNum(); y1 = eatNum();
        case 'T':
          if (activeCmd === 'T') {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = eatNum();
          ny = eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx;
          y = ny;
          break;
        case 'q':
          x1 = x + eatNum();
          y1 = y + eatNum();
        case 't':
          if (activeCmd === 't') {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = x + eatNum();
          ny = y + eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx; y = ny;
          break;
          // - elliptical arc
        case 'A':
          rx = eatNum();
          ry = eatNum();
          xar = eatNum() * DEGS_TO_RADS;
          laf = eatNum();
          sf = eatNum();
          nx = eatNum();
          ny = eatNum();
          if (rx !== ry) {
            console.warn("Forcing elliptical arc to be a circular one :(",
                         rx, ry);
          }
          // SVG implementation notes does all the math for us! woo!
          // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
          // step1, using x1 as x1'
          x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
          y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
          // step 2, using x2 as cx'
          var norm = Math.sqrt(
            (rx*rx * ry*ry - rx*rx * y1*y1 - ry*ry * x1*x1) /
            (rx*rx * y1*y1 + ry*ry * x1*x1));
          if (laf === sf)
            norm = -norm;
          x2 = norm * rx * y1 / ry;
          y2 = norm * -ry * x1 / rx;
          // step 3
          cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
          cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;

          var u = new THREE.Vector2(1, 0),
              v = new THREE.Vector2((x1 - x2) / rx,
                                    (y1 - y2) / ry);
          var startAng = Math.acos(u.dot(v) / u.length() / v.length());
          if (u.x * v.y - u.y * v.x < 0)
            startAng = -startAng;

          // we can reuse 'v' from start angle as our 'u' for delta angle
          u.x = (-x1 - x2) / rx;
          u.y = (-y1 - y2) / ry;

          var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
          // This normalization ends up making our curves fail to triangulate...
          if (v.x * u.y - v.y * u.x < 0)
            deltaAng = -deltaAng;
          if (!sf && deltaAng > 0)
            deltaAng -= Math.PI * 2;
          if (sf && deltaAng < 0)
            deltaAng += Math.PI * 2;

          path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
          x = nx;
          y = ny;
          break;
        default:
          throw new Error("weird path command: " + activeCmd);
      }
      if (firstX === null) {
        firstX = x;
        firstY = y;
      }
      // just reissue the command
      if (canRepeat && nextIsNum())
        continue;
      activeCmd = pathStr[idx++];
    }

    return path;
  }
})(THREE, THREEx);
