// set the scene size
  var WIDTH = 800,
      HEIGHT = 600;

  // set some camera attributes
  var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

  // get the DOM element to attach to
  // - assume we've got jQuery to hand
  var $container = $('#container');

  // create a WebGL renderer, camera
  // and a scene
  var renderer = new THREE.WebGLRenderer();
  var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
                                  ASPECT,
                                  NEAR,
                                  FAR  );
  var scene = new THREE.Scene();

  // the camera starts at 0,0,0 so pull it back
  camera.position.z = 300;

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  $container.append(renderer.domElement);

  // create the sphere's material
  var shaderMaterial = new THREE.ShaderMaterial({
    vertexShader:   $('#vertexshader').text(),
    fragmentShader: $('#fragmentshader').text()
  });

  var customMaterial = new THREE.ShaderMaterial(
  {
      uniforms:
    {
      "c":   { type: "f", value: 0.2 },
      "p":   { type: "f", value: 1.8 },
      glowColor: { type: "c", value: new THREE.Color(0xffff00) },
      viewVector: { type: "v3", value: camera.position }
    },
    vertexShader:   document.getElementById( 'vertexShader2'   ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader2' ).textContent,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  }   );

  // set up the sphere vars
  var radius = 2, segments = 16, rings = 16;
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 });

  // create a new mesh with sphere geometry -
  // we will cover the sphereMaterial next!
  var sphere = new THREE.Mesh(
     new THREE.SphereGeometry(radius, segments, rings),
     new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
  sphere.position.set(-100, -100, 0);
  scene.add(sphere);

  sphere = new THREE.Mesh(
     new THREE.SphereGeometry(radius, segments, rings),
      // material);
     new THREE.MeshBasicMaterial({ color: 0xff0000 }));
     // customMaterial);
  sphere.position.set(100, -100, 0);
  scene.add(sphere);


  sphere = new THREE.Mesh(
     new THREE.SphereGeometry(radius, segments, rings),
      // material);
     new THREE.MeshBasicMaterial({ color: 0x0000ff }));
     // customMaterial);
  sphere.position.set(100, 100, 0);
  scene.add(sphere);

  sphere = new THREE.Mesh(
     new THREE.SphereGeometry(radius, segments, rings),
      // material);
     new THREE.MeshBasicMaterial({ color: 0x00ffff }));
     // customMaterial);
  sphere.position.set(-100, 100, 0);
  scene.add(sphere);


  sphere = new THREE.Mesh(
     new THREE.SphereGeometry(radius, segments, rings),
      // material);
     new THREE.MeshBasicMaterial({ color: 0xffff00 }));
     // customMaterial);
  sphere.position.set(150, 0, 0);
  scene.add(sphere);



  var sphereGlow = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, rings),
      // material);
     // shaderMaterial);
     customMaterial);
sphereGlow.scale.multiplyScalar(1.2);
  // add the sphere to the scene
  // scene.add(sphereGlow);
var light = new THREE.PointLight(0xffffff);
  light.position.set(0,250,0);
  scene.add(light);


// create the particle variables
var particleTexture = THREE.ImageUtils.loadTexture('img/particle.png');
var particleCount = 3000,
    pMaterial = new THREE.PointCloudMaterial({
  color: 0xFFAA00,
  size: 80,
  map: particleTexture,
  // blending: THREE.AdditiveBlending,
  transparent: true
});


var pMaterial2 = new THREE.ShaderMaterial( {
      uniforms: {
        amplitude: { type: "f", value: 1.0 },
        time:      { type: "f", value: 0.0 },
        color:     { type: "c", value: new THREE.Color( 0xff8800 ) },
        texture:   { type: "t", value: particleTexture },
        end:       { type: "v3", value: new THREE.Vector3(150, 0, 0) }
      },
      vertexShader:   document.getElementById( 'vertexshader3' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader3' ).textContent,
      transparent:    true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false
    });

var positions = new Float32Array( particleCount * 3 );
var colors = new Float32Array( particleCount * 3 );
var sizes = new Float32Array( particleCount );
var alpha = new Float32Array( particleCount );
var glow = new Float32Array( particleCount );

var baseSize = 8.0;

var color = new THREE.Color();
// now create the individual particles
for (var i = 0; i < particleCount / 2; i++) {

  // create a particle with random
  // position values, -250 -> 250
  var pX = Math.random() * 500 - 250,
      pY = Math.random() * 500 - 250,
      // pZ = Math.random() * 250 - 250,
      pZ = 0,
      particle = new THREE.Vector3(pX, pY, pZ)
      // particle.velocity = new THREE.Vector3(0, 0, 0);



  // bigger glow particle
  particle.toArray(positions, i * 3);
  color.setHex(0xff8800);
  color.toArray(colors, i * 3);
  alpha[i] = 0.5;
  glow[i] = 0.5;
  sizes[i] = baseSize + 8;

  i++;

  // main particle
  particle.toArray(positions, i * 3);
  color.setHex(0xff8800);
  color.toArray(colors, i * 3);
  alpha[i] = 1;
  glow[i] = 0.75;
  sizes[i] = baseSize;

  // add it to the geometry
  // particles.vertices.push(particle);
}


var geometry = new THREE.BufferGeometry();
      geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
      geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
      geometry.addAttribute( 'ca', new THREE.BufferAttribute( colors, 3 ) );
      geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alpha, 1 ) );
      geometry.addAttribute( 'glow', new THREE.BufferAttribute( glow, 1 ) );

pMaterial2.attributes = geometry.attributes;
// create the particle system
var particleSystem = new THREE.PointCloud(
    geometry,
    pMaterial2);


// add it to the scene
scene.add(particleSystem);





  // draw!
  // renderer.render(scene, camera);

// animation loop
  function update() {
    var time = particleSystem.material.uniforms.time;
    if (time.value >= 1) {
      time.value = 0;
    } else {
      time.value += 0.01;
    }
    // add some rotation to the system
    // particleSystem.rotation.y += 0.01;

    // var pCount = particleCount;
    // while(pCount--) {
    //   // get the particle
    //   var particle = particles.vertices[pCount];
    //   // check if we need to reset
    //   if(particle.y < -200) {
    //     particle.y = 200;
    //     particle.velocity.y = 0;
    //   }

    //   // update the velocity
    //   //particle.velocity.y -= Math.random() * .1;

    //   // and the position
    //   particle.add(
    //     particle.velocity);
    // }

    // // flag to the particle system that we've changed its vertices.
    // particleSystem.geometry.needsUpdate = true; // THREE.BufferGeometry

    // sort the points to get additive blending to work properly
    // sortPoints();

    renderer.render(scene, camera);

    // set up the next call
    requestAnimationFrame(update);
  }



  requestAnimationFrame(update);
