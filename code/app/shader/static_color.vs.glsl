/**
 * as simple vertex shader setting the 2D position of a vertex without any transformations and forwarding the color
 * Created by Samuel Gratzl on 08.02.2016.
     modified by Jakob Weber and Christoph Pichler
 */

// the position of the point
attribute vec3 a_position;

//the color of the point
attribute vec3 a_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;

void main() {
  gl_Position = u_projection * u_modelView
    * vec4(a_position, 1);
}
