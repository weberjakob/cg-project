/**
 * a phong shader implementation with texture support
 */
precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

//illumination related variables
uniform Material u_material;
uniform Light u_light;
uniform Light u_lightSpot;
varying vec3 v_spotLightDirection;
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_normalSpotVec;
varying vec3 v_eyeSpotVec;
varying vec3 v_lightSpotVec;

//texture related variables
uniform bool u_enableObjectTexture;
//define texture sampler and texture coordinates
varying vec2 v_texCoord;
uniform sampler2D u_tex;

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	//compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

    material.diffuse = textureColor;
    material.ambient = textureColor;
	//Note: an alternative to replacing the material color is to multiply it with the texture color


	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

  return c_amb + c_diff + c_spec + c_em;
}

vec4 calculateSpotLight(Light light, Material material, vec3 lightSpotVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor, vec3 spotDirectionVec) {
    float lightObjectDistance = length(lightSpotVec);
	lightSpotVec = normalize(lightSpotVec);
	normalVec = normalize(normalVec);
	spotDirectionVec = normalize(spotDirectionVec);
	eyeVec = normalize(eyeVec);

    spotDirectionVec.xyz = vec3(0, 1, 0);
	//compute diffuse term
	float diffuse = max(dot(lightSpotVec,spotDirectionVec),0.0);
	diffuse = diffuse < 0.9 ? 0.0 : 1.0;//diffuse==1 <=> fragment is lighted by spot
    diffuse = diffuse/(lightObjectDistance);

	//compute specular term
	vec3 reflectVec = reflect(-lightSpotVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

    material.diffuse = textureColor;
    material.ambient = textureColor;

	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

  return c_amb + c_diff + c_spec + c_em;
}

void main (void) {

  vec4 textureColor =  texture2D(u_tex,v_texCoord);
  gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor)+
                    calculateSpotLight(u_lightSpot, u_material, v_lightSpotVec, v_normalSpotVec, v_eyeVec, textureColor, v_spotLightDirection);

}
