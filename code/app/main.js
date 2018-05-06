/**
 * Created by Marc Streit on 01.04.2016.
 *
 * */

//the OpenGL context
var gl = null;
//our shader program
var shaderProgram = null;

var canvasWidth = 800;
var canvasHeight = 800;
var aspectRatio = canvasWidth / canvasHeight;

//rendering context
var context;

//camera and projection settings
var animatedAngle = 0;
var fieldOfViewInRadians = convertDegreeToRadians(30);

//scene settings
var projectTimeInMilliSeconds = 0;//runs from 0.0 to 30.0s
var sceneIndex=0; //indicates the scene: 1=Main Station, 2= Danube Bridge, 3=JKU

var tramNode;

var robotTransformationNode;
var tramTransformationNode;
var headTransformationNode;

//links to buffer stored on the GPU
var quadVertexBuffer, quadColorBuffer;
var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;

var quadVertices = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0]);

var quadColors = new Float32Array([
    0, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 1, 0, 1,
    0, 0, 0, 1]);

var s = 0.3; //size of cube
//additional comment which is useless
var cubeVertices = new Float32Array([
   -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
   -s,-s, s, s,-s, s, s, s, s, -s, s, s,
   -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
   s,-s,-s, s, s,-s, s, s, s, s,-s, s,
   -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
   -s, s,-s, -s, s, s, s, s, s, s, s,-s,
]);

//used for colored cube
/*
var cubeColors = new Float32Array([
   0,1,1, 0,1,1, 0,1,1, 0,1,1,
   1,0,1, 1,0,1, 1,0,1, 1,0,1,
   1,0,0, 1,0,0, 1,0,0, 1,0,0,
   0,0,1, 0,0,1, 0,0,1, 0,0,1,
   1,1,0, 1,1,0, 1,1,0, 1,1,0,
   0,1,0, 0,1,0, 0,1,0, 0,1,0
]);*/

//used for tram
var cubeColors = new Float32Array([
    0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,0.5,
    1,0.5,0, 1,0.5,0, 1,1,1, 1,1,1,
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    1,0.5,0, 1,0.5,0, 1,1,1, 1,1,1,
    0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,0.5,
]);

var cubeIndices =  new Float32Array([
   0,1,2, 0,2,3,
   4,5,6, 4,6,7,
   8,9,10, 8,10,11,
   12,13,14, 12,14,15,
   16,17,18, 16,18,19,
   20,21,22, 20,22,23
]);

//load the shader resources using a utility function
loadResources({
  vs: 'shader/simple.vs.glsl',
  fs: 'shader/simple.fs.glsl',
  //TASK 5-3
  staticcolorvs: 'shader/static_color.vs.glsl'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {

  //create a GL context
  gl = createContext(canvasWidth, canvasHeight);

  //in WebGL / OpenGL3 we have to create and use our own shaders for the programmable pipeline
  //create the shader program
  shaderProgram = createProgram(gl, resources.vs, resources.fs);

  //set buffers for quad
  initQuadBuffer();
  //set buffers for cube
  initCubeBuffer();

  //create scenegraph
  rootNode = new SceneGraphNode();

  //Task 3-1
  var quadTransformationMatrix = glm.rotateX(90);
  quadTransformationMatrix = mat4.multiply(mat4.create(), quadTransformationMatrix, glm.translate(3,-0.5,0));
  quadTransformationMatrix = mat4.multiply(mat4.create(), quadTransformationMatrix, glm.scale(4,5,1));

  //Task 3-2
  var transformationNode = new TransformationSceneGraphNode(quadTransformationMatrix);
  rootNode.append(transformationNode);


  //TASK 5-3
  var staticColorShaderNode = new ShaderSceneGraphNode(createProgram(gl, resources.staticcolorvs, resources.fs));
  transformationNode.append(staticColorShaderNode);


  //TASK 2-2
  var quadNode = new QuadRenderNode();
  staticColorShaderNode.append(quadNode);

  //createRobot(rootNode);
    // createTram(rootNode, 0);


    createTram();

    createRails();
  //TASK 4-2
  //var cubeNode = new CubeRenderNode();
  //rootNode.append(cubeNode);
}

function createTram() {
    tramNode = new TramNode();
    rootNode.append(tramNode);

    //inserting the cockpit, translation is relative to the tram

}
function initQuadBuffer() {

  //create buffer for vertices
  quadVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
  //copy data to GPU
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  //same for the color
  quadColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadColors, gl.STATIC_DRAW);
}

function initCubeBuffer() {

  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

  cubeIndexBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
}

function createRails() {
    for(var i = 0; i < 100; i++)
    {
        var railTransformationMatrix = mat4.multiply(mat4.create(),  mat4.create(), glm.scale(0.2, 0.05, 0.05));
        railTransformationMatrix = mat4.multiply(mat4.create(),railTransformationMatrix, glm.rotateZ(i < 30 ? i : (60-i)));

        for(var railAxe = 0; railAxe < 2; railAxe++)
        {
            var rail = new CubeRenderNode();
            var railAxeTransformationMatrix = mat4.multiply(mat4.create(), railTransformationMatrix, glm.translate(-8 + i/8, railAxe * 3, -20));

            var railTransformationNode = new TransformationSceneGraphNode(railAxeTransformationMatrix);
            railTransformationNode.append(rail);
            rootNode.append(railTransformationNode);
        }
    }

}


/**
 * render one frame
 */
function render(timeInMilliseconds) {

  //set background color to light gray
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //enable depth test to let objects in front occluse objects further away
  gl.enable(gl.DEPTH_TEST);

  //TASK 1-1
  gl.enable(gl.BLEND);
  //TASK 1-2
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  //activate this shader program
  gl.useProgram(shaderProgram);

    context = createSceneGraphContext(gl, shaderProgram);

    //update tram transformation
    switch (sceneIndex) {
        case 1:
            tramNode.setSpeed(2);

            //var tramTransformationMatrix = mat4.create();
            //tramTransformationMatrix = mat4.multiply(mat4.create(), tramTransformationMatrix, glm.rotateY(30-projectTimeInMilliSeconds/1000));
            //tramTransformationMatrix = mat4.multiply(mat4.create(), tramTransformationMatrix, glm.translate(-1, 1, 1));
            //tramTransformationMatrix = mat4.multiply(mat4.create(), tramTransformationMatrix, glm.scale(0.3, 0.3, 0.3));
            //tramTransformationNode.setMatrix(tramTransformationMatrix);
            break;
        case 2:
            tramNode.setSpeed(3);
            break;
        case 3:
            tramNode.setSpeed(5);
            break;
    }
    rootNode.render(context);




  //request another render call as soon as possible
  requestAnimationFrame(render);

  //animate based on elapsed time
  animatedAngle = timeInMilliseconds/10;
  //project lasts for 30 seconds
  projectTimeInMilliSeconds = timeInMilliseconds%30000;
  //0 to 5: scene
  // 5 to 25: scene 2
  //26 to 30: scene 3
  sceneIndex = projectTimeInMilliSeconds<5000 ? 1: projectTimeInMilliSeconds <25000 ? 2 : 3;
  //sceneIndex = 3;
}

function setUpModelViewMatrix(sceneMatrix, viewMatrix) {
  var modelViewMatrix = mat4.multiply(mat4.create(), viewMatrix, sceneMatrix);
  gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_modelView'), false, modelViewMatrix);
}

/**
 * returns a new rendering context
 * @param gl the gl context
 * @param projectionMatrix optional projection Matrix
 * @returns {ISceneGraphContext}
 */
function createSceneGraphContext(gl, shader) {

  //create a default projection matrix
  projectionMatrix = mat4.perspective(mat4.create(), fieldOfViewInRadians, aspectRatio, 0.01, 20);
  //set projection matrix
  gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_projection'), false, projectionMatrix);

  return {
    gl: gl,
    sceneMatrix: mat4.create(),
    viewMatrix: calculateViewMatrix(),
    projectionMatrix: projectionMatrix, //com
    shader: shader
  };
}

function calculateViewMatrix() {
  //compute the camera's matrix
  var eye = [projectTimeInMilliSeconds/2000,3,5];
  var center = [projectTimeInMilliSeconds/10000,0,0];
  var up = [0,1,0];
  viewMatrix = mat4.lookAt(mat4.create(), eye, center, up);
  return viewMatrix;
}

/**
 * base node of the scenegraph
 */
class SceneGraphNode {

  constructor() {
    this.children = [];
  }

  /**
   * appends a new child to this node
   * @param child the child to append
   * @returns {SceneGraphNode} the child
   */
  append(child) {
    this.children.push(child);
    return child;
  }

  /**
   * removes a child from this node
   * @param child
   * @returns {boolean} whether the operation was successful
   */
  remove(child) {
    var i = this.children.indexOf(child);
    if (i >= 0) {
      this.children.splice(i, 1);
    }
    return i >= 0;
  };

  /**
   * render method to render this scengraph
   * @param context
   */
  render(context) {

    //render all children
    this.children.forEach(function (c) {
      return c.render(context);
    });
  };
}

/**
 * a quad node that renders floor plane
 */
class QuadRenderNode extends SceneGraphNode {

  render(context) {

    //TASK 2-1

    //setting the model view and projection matrix on shader
    setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

    var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadColorBuffer);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocation);

    //set alpha value for blending
    //TASK 1-3
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 1);

    // draw the bound data as 6 vertices = 2 triangles starting at index 0
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //render children
    super.render(context);
  }
}

class TramNode extends SceneGraphNode {

    constructor() {
        super();
        this.speed = 0;
        this.matrix = mat4.create();
        this.matrix = mat4.multiply(mat4.create(), this.matrix, glm.translate(-1, 0.5, 1));
        this.matrix = mat4.multiply(mat4.create(), this.matrix, glm.scale(2, 0.3, 0.3));


        //render all components of the tram
        //all the dimensions of these components are relative to the tram node
        var ceiling = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(0, -0.27, 0), glm.scale(1, 0.1, 1)));
        ceiling.append(new CubeRenderNode());
        this.append(ceiling);

        var floor = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(0, +0.27, 0), glm.scale(1, 0.1, 1)));
        floor.append(new CubeRenderNode());
        this.append(floor);


        for(var i = 0; i < 6 ; i++) {
            for(var j = 0; j < 2; j++) {
                var cockpitSideTransformation = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(-0.285 + i* 0.1, 0, -0.27 + j*0.54), glm.scale(0.05, 1, 0.1)));
                cockpitSideTransformation.append(new CubeRenderNode());
                this.append(cockpitSideTransformation);

                var cockpitSideGlassTransformation = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(-0.285 + i* 0.1 + 0.05, 0, -0.27 + j*0.54), glm.scale(0.1, 1, 0.1)));
                var cockpitSideGlass = new CubeRenderNode();
                cockpitSideGlass.setAlphaValue(0.1);
                cockpitSideGlassTransformation.append(cockpitSideGlass);
                this.append(cockpitSideGlassTransformation);
            }
        }

        var front = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(0.3, 0, 0), glm.scale(0.01, 1, 1)));
        var frontGlass = new CubeRenderNode();
        frontGlass.setAlphaValue(0.1);
        front.append(frontGlass);
        this.append(front);

        var back = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(-0.3, 0, 0), glm.scale(0.01, 1, 1)));
        back.append(new CubeRenderNode());
        this.append(back);
    }

    render(context) {
        //backup previous one
        var previous = context.sceneMatrix;

        //set current world matrix by multiplying it
        mat4.multiply(this.matrix, this.matrix, glm.translate(this.speed/1000, 0, 0));

        if (previous === null) {
            context.sceneMatrix = mat4.clone(this.matrix);
        }
        else {
            context.sceneMatrix = mat4.multiply(mat4.create(), previous, this.matrix);
        }

        /*
        //setting the model view and projection matrix on shader
        setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

        var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(positionLocation);

        var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(colorLocation);

        //set alpha value for blending
        //TASK 1-3
        gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 1);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

        */

        //render children
        super.render(context);

        //restore backup
        context.sceneMatrix = previous;
        //this.lastRenderedTime = projectTimeInMilliSeconds;
    }

    setSpeed(speed) {
        this.speed = speed;
    }
}
//TASK 4-1
/**
 * a cube node that renders a cube at its local origin
 */
class CubeRenderNode extends SceneGraphNode {
    constructor() {
        super();
        this.alpha = 1; //initialy the cube is not transparent at all
    }

   render(context) {

    //setting the model view and projection matrix on shader
    setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

    var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(positionLocation);

    var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(colorLocation);

    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), this.alpha);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

    //render children
    super.render(context);
  }

  setAlphaValue(alpha) {
       this.alpha = alpha;
  }
}

//TASK 3-0
/**
 * a transformation node, i.e applied a transformation matrix to its successors
 */
class TransformationSceneGraphNode extends SceneGraphNode {
  /**
   * the matrix to apply
   * @param matrix
   */
  constructor(matrix) {
    super();
    this.matrix = matrix || mat4.create();
  }

  render(context) {
    //backup previous one
    var previous = context.sceneMatrix;
    //set current world matrix by multiplying it
    if (previous === null) {
      context.sceneMatrix = mat4.clone(this.matrix);
    }
    else {
      context.sceneMatrix = mat4.multiply(mat4.create(), previous, this.matrix);
    }

    //render children
    super.render(context);
    //restore backup
    context.sceneMatrix = previous;
  }

  setMatrix(matrix) {
    this.matrix = matrix;
  }
}

//TASK 5-0
/**
 * a shader node sets a specific shader for the successors
 */
class ShaderSceneGraphNode extends SceneGraphNode {
  /**
   * constructs a new shader node with the given shader program
   * @param shader the shader program to use
   */
  constructor(shader) {
    super();
    this.shader = shader;
  }

  render(context) {
    //backup prevoius one
    var backup = context.shader;
    //set current shader
    context.shader = this.shader;
    //activate the shader
    context.gl.useProgram(this.shader);
    //set projection matrix
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_projection'),
      false, context.projectionMatrix);
    //render children
    super.render(context);
    //restore backup
    context.shader = backup;
    //activate the shader
    context.gl.useProgram(backup);
  }
};

function convertDegreeToRadians(degree) {
  return degree * Math.PI / 180
}
