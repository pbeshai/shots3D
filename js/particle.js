// Big thanks to https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js
// for a lot of the examples I used to create this.

(function (THREE, THREEx, SPARKS, TWEEN) {
  'use strict';

  var container, scene, camera, renderer, controls, stats;
  var clock = new THREE.Clock();
  var floor, hoop, ball;
  var group, particleCloud, sparksEmitter, emitterpos, counter, hue;
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
    container = document.createElement( 'div' );
    document.body.appendChild(container);

    initCamera();
    initRenderer();
    initEvents();
    // initControls();
    initLighting();
    initGeometry();

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

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
    // camera.position.set(0, ft(80), ft(0));
    camera.position.set( 0, 150, 700 );

    var hoopPos = new THREE.Vector3(dim.hoop.x, dim.hoop.z, -dim.hoop.y);
    camera.lookAt(hoopPos);
  }

  function initRenderer() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(screenWidth, screenHeight);
    container.appendChild(renderer.domElement);
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
    group = new THREE.Group();
    scene.add( group );

    particleCloud = new THREE.Object3D(); // Just a group
    particleCloud.y = 800;
    group.add( particleCloud );
    hue = 0;

    sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(160));
    emitterpos = new THREE.Vector3();
    sparksEmitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( emitterpos ) ) );
    sparksEmitter.addInitializer(new SPARKS.Lifetime(0,2));
    sparksEmitter.addInitializer(new SPARKS.Target(null, setTargetParticle));
    sparksEmitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,-50,10))));
    // TOTRY Set velocity to move away from centroid
    sparksEmitter.addAction(new SPARKS.Age(TWEEN.Easing.Linear.None));
    //sparksEmitter.addAction(new SPARKS.Accelerate(0.2));
    sparksEmitter.addAction(new SPARKS.Move());
    sparksEmitter.addAction(new SPARKS.RandomDrift(50,50,2000));
    sparksEmitter.addCallback("created", onParticleCreated);
    sparksEmitter.addCallback("dead", onParticleDead);
    sparksEmitter.addCallback("updated", function( particle ) {
      particle.target.position.copy( particle.position );
    });
    sparksEmitter.start();
  }

  function setTargetParticle() {
    // var material = new THREE.SpriteCanvasMaterial( {
    //   program: hearts
    // } );
    var material = new THREE.SpriteMaterial();

    material.color.setHSL(hue, 1, 0.75);

    hue += 0.001;
    if (hue>1) hue-=1;
    var particle = new THREE.Sprite( material );
    particle.scale.x = particle.scale.y = Math.random() * 10 + 10;
    particleCloud.add( particle );
    return particle;
  }

  function onParticleCreated( p ) {
    p.target.position.copy( p.position );
  }

  function onParticleDead( particle ) {
    particle.target.visible = false;
    particleCloud.remove( particle.target );
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
    // emitterpos.x = Math.random() * 100;
    // emitterpos.y = Math.random() * 100;
    particleCloud.rotation.y += 0.05;
    // ball.rotation.y += 0.01;

    stats.update();
  }

  function render() {
    renderer.render(scene, camera);
  }

})(THREE, THREEx, SPARKS, TWEEN);
