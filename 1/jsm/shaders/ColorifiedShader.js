import { Color } from '../../../build/three.module.js';
/**
 * Colorify shader
 */

var ColorifiedShader = {
    uniforms: {
        tDiffuse: { value: null },
        fade: { value: 0.0 },
    },

    vertexShader: ['varying vec2 vUv;', 'void main() {', '	vUv = uv;', '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );', '}'].join(
        '\n'
    ),

    fragmentShader: [
        'precision highp float;',

        'uniform sampler2D tDiffuse;',
        'uniform float fade;',

        'varying vec2 vUv;',

        'void main() {',

        'vec4 baseColor = texture2D( tDiffuse, vUv );',

        'gl_FragColor = mix(baseColor, vec4(1.0, 1.0, 1.0, 1.0), fade);',

        '}',
    ].join('\n'),
};

export { ColorifiedShader };
