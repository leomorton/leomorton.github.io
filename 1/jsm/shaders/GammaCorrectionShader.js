/**
 * Gamma Correction Shader
 * http://en.wikipedia.org/wiki/gamma_correction
 */

var GammaCorrectionShader = {

	uniforms: {

		"tDiffuse": { value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 tex = texture2D( tDiffuse, vUv );",

		"	gl_FragColor = LinearTosRGB( tex );", // optional: LinearToGamma( tex, float( GAMMA_FACTOR ) );

		"}"

	].join( "\n" )

};

export { GammaCorrectionShader };
