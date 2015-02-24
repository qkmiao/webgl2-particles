/**
 * @author mrdoob / http://www.mrdoob.com
 */

GPGPU.SimulationShader = function () {

  var material = new THREE.ShaderMaterial( {
    uniforms: {
      tPositions: { type: "t", value: texture },
      origin: { type: "t", value: texture },
      timer: { type: "f", value: 0 },
      colliders: { type: "4fv", value: null },
    },

    vertexShader: [
      'varying vec2 vUv;',

      'void main() {',
      '  vUv = vec2(uv.x, 1.0 - uv.y);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}',
    ].join('\n'),

    fragmentShader: [
      'varying vec2 vUv;',

      'uniform sampler2D tPositions;',
      'uniform sampler2D origin;',

      'uniform float timer;',

      'uniform vec4 colliders[30];',

      'float rand(vec2 co){',
      '    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);',
      '}',

      'void main() {',
      '  vec3 pos = texture2D( tPositions, vUv ).xyz;',

      '  if ( rand(vUv + timer ) > 0.97 ) {',
      '    pos = texture2D( origin, vUv ).xyz;',
      '  } else {',
      '    float x = pos.x + timer;',
      '    float y = pos.y;',
      '    float z = pos.z;',

      '    pos.x += sin( y * 3.0 ) * cos( z * 11.0 ) * 0.005;',
      '    pos.y += sin( x * 5.0 ) * cos( z * 13.0 ) * 0.005;',
      '    pos.z += sin( x * 7.0 ) * cos( y * 17.0 ) * 0.005;',
      '  }',

      '  // Interaction with fingertips',
      '  for (int i = 0; i < 30; ++i) {',
      '    vec3 posToCollider = pos - colliders[i].xyz;',
      '    float dist = colliders[i].w - length(posToCollider);',
      '    if (dist > 0.0) {',
      '      pos += normalize(posToCollider) * colliders[i].w;',
      '    }',
      '  }',

      '  // Write new position out',
      '  gl_FragColor = vec4(pos, 1.0);',
      '}',
    ].join('\n'),
  } );

  return {

    material: material,

    setPositionsTexture: function ( positions ) {

      material.uniforms.tPositions.value = positions;

      return this;

    },

    setOriginsTexture: function ( origins ) {

      material.uniforms.origin.value = origins;

      return this;

    },

    setColliders: function ( colliders ) {

      material.uniforms.colliders.value = colliders;

      return this;

    },

    setTimer: function ( timer ) {

      material.uniforms.timer.value = timer;

      return this;

    }

  }

};

GPGPU.SimulationShader2 = function (renderer) {
  var gl = renderer.context;

  var attributes = {
    position: 0
  };;

  function createProgram () {
    var program = gl.createProgram();

    var vertexShader = gl.createShader( gl.VERTEX_SHADER );
    var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );

    gl.shaderSource( vertexShader, [
      'precision ' + renderer.getPrecision() + ' float;',

      'attribute vec3 position;',

      'uniform float timer;',

      'uniform vec4 colliders[30];',

      'float rand(vec2 co){',
      '    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);',
      '}',

      'void main() {',
      '  vec3 pos = position;',

      '  if ( rand(position.xy + timer) > 0.97 ) {',
      '    pos = vec3(0, 0, 0); //texture2D( origin, vUv ).xyz;',
      '  } else {',
      '    float x = pos.x + timer;',
      '    float y = pos.y;',
      '    float z = pos.z;',

      '    pos.x += sin( y * 3.0 ) * cos( z * 11.0 ) * 0.005;',
      '    pos.y += sin( x * 5.0 ) * cos( z * 13.0 ) * 0.005;',
      '    pos.z += sin( x * 7.0 ) * cos( y * 17.0 ) * 0.005;',
      '  }',

      '  // Interaction with fingertips',
      '  for (int i = 0; i < 30; ++i) {',
      '    vec3 posToCollider = pos - colliders[i].xyz;',
      '    float dist = colliders[i].w - length(posToCollider);',
      '    if (dist > 0.0) {',
      '      pos += normalize(posToCollider) * colliders[i].w;',
      '    }',
      '  }',

      '  // Write new position out',
      '  gl_Position = vec4(pos, 1.0);',
      '}'
    ].join( '\n' ) );

    gl.shaderSource( fragmentShader, [
      'precision ' + renderer.getPrecision() + ' float;',

      'void main() {',
        'gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
      '}'
    ].join( '\n' ) );

    gl.compileShader( vertexShader );
    gl.compileShader( fragmentShader );

    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    gl.bindAttribLocation( program, 0, 'position' );
    gl.transformFeedbackVaryings( program, ["gl_Position"], gl.SEPARATE_ATTRIBS );

    gl.linkProgram( program );

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader program failed to link");
      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  var program = createProgram();

  if (!program) {
    return null;
  }

  var uniforms = {};
  var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < count; i++) {
      uniform = gl.getActiveUniform(program, i);
      name = uniform.name.replace("[0]", "");
      uniforms[name] = gl.getUniformLocation(program, name);
  }

  var timerValue = 0;
  var collidersValue = null;

  return {
    program: program,

    attributes: attributes,

    bind: function() {
      gl.useProgram(program);
      gl.uniform1f(uniforms.timer, timer);
      gl.uniform4fv(uniforms.colliders, collidersValue);
    },

    setColliders: function ( colliders ) {
      collidersValue = colliders;
    },

    setTimer: function ( timer ) {
      timerValue = timer;
    }

  }

};