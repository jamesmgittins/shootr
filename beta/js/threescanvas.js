var ThreesCanvas = {
  camera : null, 
  scene : null, 
  renderer : null, 
  mesh : null,

  shipArt3D : function(size, seed, colorsToUse) {
    Math.seedrandom(seed);
    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({vertexColors:THREE.VertexColors});
    var squareMaterial = new THREE.MeshBasicMaterial({ color:0xFFFFFF, side:THREE.DoubleSide }); 
    
    // var material = new THREE.MeshBasicMaterial( { wireframe:true, color : 0xFFFF00 } );
    var positions = [];
    var colors = [];

    for (var side = 1; side >= -1; side-=2) {
      Math.seedrandom(seed);
  
      var colorIndex = 0;
      positions.push( 0, 0, 0 );

      var color = hexToRgb(colorsToUse[colorIndex]);
      colors.push(color.r / 255);
      colors.push(color.g / 255);
      colors.push(color.b / 255);
  
      var shipLines = 25;
  
      for (var i = 0; i < shipLines; i++) {
          nextYLoc = (Math.random() * size);
          nextXLoc = (Math.random() * size / 2) * (nextYLoc / size);
          nextZLoc = (Math.random() * size / 2) * (nextYLoc / size);
  
          if (i == shipLines - 2){
            nextYLoc = size;
            nextXLoc = size / 2;
            nextZLoc = 0;
          }
          
          positions.push( nextXLoc * side, nextYLoc, nextZLoc );
  
          var color = hexToRgb(colorsToUse[colorIndex]);
          colors.push(color.r / 255);
          colors.push(color.g / 255);
          colors.push(color.b / 255);
  
          colorIndex++;
          if (colorIndex >= colorsToUse.length - 1)
            colorIndex = 0;
      }
    }



    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry.computeBoundingSphere();
    mesh = new THREE.Line( geometry, material );
    return mesh;
  },

  init : function() {
    ThreesCanvas.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    ThreesCanvas.camera.position.z = 400;
    ThreesCanvas.scene = new THREE.Scene();
    // var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    // var material = new THREE.MeshBasicMaterial( { wireframe:true, color : 0xFFFF00 } );
    // material = new THREE.LineBasicMaterial({vertexColors : THREE.VertexColors, wireframe:true});
    // material.opacity = 0.1;
    // ThreesCanvas.mesh = new THREE.Mesh( geometry, material );

    ThreesCanvas.mesh = ThreesCanvas.shipArt3D(200, -851978, Ships.enemyColors[1]);

    ThreesCanvas.scene.add( ThreesCanvas.mesh );
    ThreesCanvas.renderer = new THREE.WebGLRenderer({canvas : document.getElementById('threes_canvas'), alpha : true});
    ThreesCanvas.renderer.setPixelRatio( window.devicePixelRatio );
    ThreesCanvas.renderer.setSize( window.innerWidth, window.innerHeight );
    // ThreesCanvas.mesh.rotation.z += Math.PI;
    //document.body.appendChild( ThreesCanvas.renderer.domElement );
  },

  animate: function() {
    requestAnimationFrame( ThreesCanvas.animate );
    // ThreesCanvas.mesh.rotation.x += 0.005;
    ThreesCanvas.mesh.rotation.y += 0.01;
    ThreesCanvas.renderer.render( ThreesCanvas.scene, ThreesCanvas.camera );
  }
};

// ThreesCanvas.init();
// ThreesCanvas.animate();