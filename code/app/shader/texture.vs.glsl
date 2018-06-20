// Phong Vertex Shader

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_modelView;
uniform mat4 u_model;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform mat4 u_invView;

uniform vec3 u_lightPos;
uniform vec3 u_lightSpotPos;
varying vec3 v_spotLightDirection;

//output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_normalSpotVec;
varying vec3 v_eyeSpotVec;
varying vec3 v_lightSpotVec;


//define output variable for texture coordinates
varying vec2 v_texCoord;

void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);
	vec4 eyeSpotPosition = u_modelView* vec4(a_position, 1);

  v_normalVec = u_normalMatrix * a_normal;
  v_normalSpotVec = u_normalMatrix * a_normal;

    v_eyeVec = -eyePosition.xyz;
	v_lightVec = u_lightPos - eyePosition.xyz;
	v_eyeSpotVec = -eyeSpotPosition.xyz;
	v_lightSpotVec = u_lightSpotPos -eyeSpotPosition.xyz;

	//pass on texture coordinates to fragment shader
	v_texCoord = a_texCoord;

	gl_Position = u_projection * eyePosition;
}
