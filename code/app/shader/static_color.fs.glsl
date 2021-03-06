/**
 * as simple fragment shader just setting the provided color as fragment color
 * Created by Samuel Gratzl on 08.02.2016.
     modified by Jakob Weber and Christoph Pichler
 */

//need to specify how "precise" float should be
precision mediump float;

//interpolate argument between vertex and fragment shader
uniform vec3 v_color;

//entry point again
void main() {
  //gl_FragColor ... magic output variable containg the final 4D color of the fragment
  //we use the provided interpolated color from our three vertices
  gl_FragColor = vec4(v_color, 1);
}
