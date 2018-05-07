/**
 * Created by Marc Streit on 01.04.2016.
 *
 * */
//inserted this comment to check if commit was succsessfull

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
var eye = vec3.create();
var center = vec3.create();
var up = vec3.create();

//keyboard and mouse buttons
var upButtonPressed=false;
var downButtonPressed = false;
var rightButtonPressed = false;
var leftButtonPressed = false;
var userCamera = false;
var mouseButtonPressed = false;
var mouseX=0, mouseY=0, mousePrevX=0, mousePrevY=0;
var zoomspeed=0.2;

//scene settings
var projectTimeInMilliSeconds = 0;//runs from 0.0 to 30.0s
var animationRepeatedCount = 0;   //tells us how often our scene was already repeated
var sceneIndex=0; //indicates the scene: 1=Main Station, 2= Danube Bridge, 3=JKU

var tram, tram2;

var robotTransformationNode;
var tramTransformationNode;
var headTransformationNode;

//links to buffer stored on the GPU
var quadVertexBuffer, quadColorBuffer;
var cubeVertexBuffer, prismVertexBuffer, cubeColorBuffer, bridgeColorBuffer, prismColorBuffer, cubeIndexBuffer;

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

var pScale = 0.5; //scale of the top of the prism
var prismVertices = new Float32Array([
   -s,-s,-s,    s,-s,-s,   s*pScale, s,-s,    -s*pScale, s,-s,
   -s,-s, s,    s,-s, s,   s*pScale, s, s,    -s*pScale, s, s,
   -s,-s,-s,    -s*pScale, s,-s,  -s*pScale, s, s,   -s,-s, s,
   s,-s,-s,     s*pScale, s,-s,   s*pScale, s, s,    s,-s, s,
   -s,-s,-s,    -s,-s, s,  s,-s, s,    s,-s,-s,
   -s*pScale, s,-s,    -s*pScale, s, s,  s*pScale, s, s,    s*pScale, s,-s,
]);

var cubeVertices = new Float32Array([
    -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
    -s,-s, s, s,-s, s, s, s, s, -s, s, s,
    -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
    s,-s,-s, s, s,-s, s, s, s, s,-s, s,
    -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
    -s, s,-s, -s, s, s, s, s, s, s, s,-s,
]);





//used for tram
var cubeColors = new Float32Array([
    0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,0.5,
    1,0.5,0, 1,0.5,0, 1,1,1, 1,1,1,
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    1,0.5,0, 1,0.5,0, 1,1,1, 1,1,1,
    0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,0.5,
]);
//used for bridge
var bridgeColors = new Float32Array([
    0,0.5,0, 0,0.5,0, 0,0.5,0, 0,0.5,0,
    0,0.25,0, 0,0.25,0, 0,0.25,0, 0,0.25,0,
    0,0,0, 0,0,0, 0,0,0, 0,0,0,
    0,0,0, 0,0,0, 0,0,0, 0,0,0,
    0,0.25,0, 0,0.25,0, 0,0.25,0, 0,0.25,0,
    0,0.5,0, 0,0.5,0, 0,0.5,0, 0,0.5,0,
    0,0.5,0, 0,0.5,0, 0,0.5,0, 0,0.5,0
]);
//used for prism
var prismColors = new Float32Array([
    1,0.7,0.3, 1,0.7,0.3, 1,0.7,0.3, 1,0.7,0.3,
    1,0.7,0.3, 1,0.7,0.3, 1,0.7,0.3, 1,0.7,0.3,
    0.8,0.35,0.15, 0.8,0.35,0.15, 0.8,0.35,0.15, 0.8,0.35,0.15,
    0.8,0.35,0.15, 0.8,0.35,0.15, 0.8,0.35,0.15, 0.8,0.35,0.15,
    0.5,0.7,0.3, 0.5,0.7,0.3, 0.5,0.7,0.3, 0.5,0.7,0.3,
    1,0.7,0.3, 1,0.7,0.3, 1,0.7,0.3, 1,0.7,0.3
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

  //set buffers for cube
  initBuffer();

  //create scenegraph
  rootNode = new SceneGraphNode();

    createRiver(resources);

    createTram();

    createRails();

    createStation();

    createBridge();

    createPrism();

   //register keyboard events
    window.addEventListener("keyup", keyUp, false);
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("mousemove", mouseMoved, false);
    window.addEventListener("mouseup", mouseUp, false);
    window.addEventListener("mousedown", mouseDown, false);
}

function keyUp(key) {
    upButtonPressed &= key.keyCode!=38;
  downButtonPressed &= key.keyCode!=40;
rightButtonPressed &= key.keyCode !=39;
leftButtonPressed &= key.keyCode !=37;
}

function keyDown(key) {
    if(key.keyCode==67) {
        userCamera = !userCamera;
    }
    upButtonPressed |= key.keyCode==38;
    downButtonPressed |=key.keyCode==40;
    rightButtonPressed |= key.keyCode ==39;
    leftButtonPressed |= key.keyCode ==37;
}

function mouseUp(event) {
    if(event.button==0) {
        mouseButtonPressed = false;
    }
}

function mouseDown(event) {
    if(event.button==0) {
        mouseButtonPressed=true;
    }
}

function mouseMoved(event) {
   if(mouseButtonPressed) {
       mousePrevX=mouseX;
       mousePrevY=mouseY;
        mouseX = event.pageX;
        mouseY = event.pageY;
    }
}

function createRiver(resources) {
    var quadTransformationMatrix = mat4.multiply(mat4.create(), glm.rotateX(90), glm.translate(21,0,0.2));
    quadTransformationMatrix = mat4.multiply(mat4.create(), quadTransformationMatrix, glm.scale(3.9,100,1));
    var transformationNode = new TransformationSceneGraphNode(quadTransformationMatrix);
    var staticColorShaderNode = new ShaderSceneGraphNode(createProgram(gl, resources.staticcolorvs, resources.fs));
    transformationNode.append(staticColorShaderNode);
    staticColorShaderNode.append(new QuadRenderNode());
    rootNode.append(transformationNode);
}

function createTram() {
    tram = new Tram();
    var tramPosition = new TransformationSceneGraphNode(glm.translate(-2,0.1,0.05));
    tramPosition.append(tram);
    rootNode.append(tramPosition);

    //tram2 is driving in the opposite direction
    tram2 = new Tram();
    var tramPosition2 = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(20,0.1, -0.175), glm.rotateY(180)));
    tramPosition2.append(tram2);
    rootNode.append(tramPosition2);
}

function createBridge() {
    var bridge = new Bridge();
    var bridgePosition = new TransformationSceneGraphNode(glm.translate(20,-0.05, -0.32))
    bridgePosition.append(bridge);
    rootNode.append(bridgePosition);
}

function createRails() {
    var railTransformationMatrix = mat4.multiply(mat4.create(),  mat4.create(), glm.scale(200, 0.05, 0.05));
    for(var secondLine = 0; secondLine < 2; secondLine++) {
        for (var railAxe = 0; railAxe < 2; railAxe++) {
            var rail = new CubeRenderNode();
            var railAxeTransformationMatrix = mat4.multiply(mat4.create(), railTransformationMatrix, glm.translate(0, 0, railAxe * 2 - secondLine * 4.5));

            var railTransformationNode = new TransformationSceneGraphNode(railAxeTransformationMatrix);
            railTransformationNode.append(rail);
            rootNode.append(railTransformationNode);
        }
    }
}

function createStation() {
    var station = new Station();
    var stationPosition = new TransformationSceneGraphNode(glm.translate(1, 0, 0.51));
    stationPosition.append(station);
    rootNode.append(stationPosition);
}

function createPrism() {
    //prism before the bridge:
    var prism = new PrismRenderNode(prismColorBuffer);
    var prismTransformationMatrix = mat4.multiply(mat4.create(), glm.rotateY(90), glm.scale(1.5,0.3, 57));
    mat4.multiply(prismTransformationMatrix, prismTransformationMatrix, glm.translate(0.0,-0.3,0));
    var prismTransformation = new TransformationSceneGraphNode(prismTransformationMatrix);
    prismTransformation.append(prism);
    rootNode.append(prismTransformation);

    //prism after the bridge
    var prismTransformation2 = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), prismTransformationMatrix, glm.translate(0,0,0.74)));
    prismTransformation2.append(new PrismRenderNode(prismColorBuffer));
    rootNode.append(prismTransformation2);
}

function initBuffer() {
  //init quad buffer
  quadVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
  //copy data to GPU
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
  quadColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadColors, gl.STATIC_DRAW);

  //init cube buffer
  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

  cubeIndexBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

  //init prism buffer
  prismVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, prismVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, prismVertices, gl.STATIC_DRAW);

  //init color buffers
  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

  bridgeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bridgeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bridgeColors, gl.STATIC_DRAW);

  prismColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, prismColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, prismColors, gl.STATIC_DRAW);

}
/*function createRails() {
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

}*/




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
            if (projectTimeInMilliSeconds < 4000) {
                tram.setSpeed(4);
                tram2.setSpeed(4);
            }
            else if(projectTimeInMilliSeconds < 5000) {
                tram.setSpeed(0);
            }
            else if(projectTimeInMilliSeconds < 8000) {
                tram.openDoors();
            }
            else if(projectTimeInMilliSeconds < 11000) {
                tram.closeDoors();
            }
            else if(projectTimeInMilliSeconds < 12500) {
                tram.setSpeed(3);
            }
            break;
        case 2:
            break;
        case 3:
            break;
    }
    rootNode.render(context);




  //request another render call as soon as possible
  requestAnimationFrame(render);

  //animate based on elapsed time
  animatedAngle = timeInMilliseconds/10;
  //project lasts for 30 seconds
  var oldProjectTimeInMilliSeconds = projectTimeInMilliSeconds;
  projectTimeInMilliSeconds = timeInMilliseconds%30000;
  //if animation gets repeated:
  if(projectTimeInMilliSeconds < oldProjectTimeInMilliSeconds) {
      tram.resetPosition();
  }
  //0 to 5: scene
  // 5 to 25: scene 2
  //26 to 30: scene 3
  sceneIndex = projectTimeInMilliSeconds<15000 ? 1: projectTimeInMilliSeconds <20000 ? 2 : 3;
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
    if(userCamera) {
        var mouseDX = mouseX-mousePrevX;
        var mouseDY = mouseY-mousePrevY;
        var direction = vec3.create();
        vec3.sub(direction, eye, center);
        if(upButtonPressed) {
            var scaling = vec3.create();
            var dirlength = vec3.length(direction)/zoomspeed;
            vec3.divide(scaling, direction, [dirlength, dirlength, dirlength]);
            vec3.sub(eye, eye, scaling);
            vec3.sub(center, center, scaling);
        } else if(downButtonPressed) {
            var scaling = vec3.create();
            var dirlength = vec3.length(direction)/zoomspeed;
            vec3.divide(scaling, direction, [dirlength, dirlength, dirlength]);
            vec3.add(eye, eye, scaling);
            vec3.add(center, center, scaling);
        } else if(leftButtonPressed) {
            var crossProd = vec3.create();
                vec3.cross(crossProd, up, direction);
            vec3.multiply(crossProd, crossProd, [0.01, 0.01, 0.01]);
            vec3.add(eye, eye, crossProd);
        } else if(rightButtonPressed) {
            var crossProd = vec3.create();
            vec3.cross(crossProd, direction, up);
            vec3.multiply(crossProd, crossProd, [0.01, 0.01, 0.01]);
            vec3.add(eye, eye, crossProd);
        } else if(mouseButtonPressed) {

            //HANDLE X
            var crossProd = vec3.create();
            vec3.cross(crossProd, direction, up);
            vec3.multiply(crossProd, crossProd, [mouseDX/500, mouseDX/500, mouseDX/500]);
            vec3.add(eye, eye, crossProd);

            //HANDLE Y
            //displayText(angleDirUp);
            var oldUp = vec3.create();
            vec3.multiply(oldUp, up, [mouseDY/100, mouseDY/100, mouseDY/100]);
            vec3.add(eye, eye, oldUp);
            var nv = vec3.create();
            vec3.cross(nv, direction, oldUp);
            vec3.cross(nv, direction, nv);
            var nvLength = vec3.length(nv);
            //vec3.divide(up, nv, [nvLength, nvLength, nvLength]);

        }
    } else {
        eye = [projectTimeInMilliSeconds / 2000, 3, 5];
        center = [projectTimeInMilliSeconds / 10000, 0, 0];
        up = [0, 1, 0];
    }
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

    constructor(initialPosition) {
        super();
        if(initialPosition == null) {
            this.initialPosition = mat4.create();
        }
        else {
            this.initialPosition = initialPosition;
        }
        this.speed = 0;
        this.doors = [];
        this.doorsOpenIndex = 1;
        //sets the matrix to its inital state
        this.resetPosition();

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

                var cockpitSideGlassTransformation = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(-0.285 + i* 0.1 + 0.05, 0, -0.27 + j*0.54), glm.scale(0.11, 1, 0.1)));
                var cockpitSideGlass = new CubeRenderNode();
                cockpitSideGlass.setAlphaValue(i%2 == 1 ? 0.3 : 0.1);
                cockpitSideGlassTransformation.append(cockpitSideGlass);
                this.append(cockpitSideGlassTransformation);

                if(j == 1 && i%2 == 1) {
                    this.doors.push(cockpitSideGlassTransformation);
                }
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
            //context.sceneMatrix = mat4.multiply(mat4.create(), previous, mat4.multiply(mat4.create(), this.matrix, glm.translate(projectTimeInMilliSeconds * this.speed/10000, 0, 0)));
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

    resetPosition() {
        this.matrix = this.initialPosition;
        this.matrix = mat4.multiply(mat4.create(), this.matrix, glm.translate(0, 0, 0));
        this.matrix = mat4.multiply(mat4.create(), this.matrix, glm.scale(2, 0.3, 0.3));
    }

    openDoors() {
        if (this.doorsOpenIndex > 0.25) {
            this.doorsOpenIndex -= 0.01;
            this.doors.forEach(function (door) {
                door.setMatrix(mat4.multiply(mat4.create(), door.matrix, glm.translate(-0.01, 0, 0)));
            });
        }
    }

    closeDoors() {
        if(this.doorsOpenIndex < 1) {
            this.doorsOpenIndex += 0.01;
            this.doors.forEach(function (door) {
                door.setMatrix(mat4.multiply(mat4.create(), door.matrix, glm.translate(0.01, 0, 0)));
            });
        }
    }
}

/**
 * A tram consists of multiple tram nodes
 */
class Tram extends SceneGraphNode {

    constructor() {
        super();
        for (var i = 0; i < 3; i++) {
            super.append(new TramNode(glm.translate(i * 1.25, 0, 0)));
        }
    }

    setSpeed(speed) {
        this.children.forEach(function (child) {
            child.setSpeed(speed);
        })
    }

    resetPosition() {
        this.children.forEach(function (child) {
            child.resetPosition();
        })
    }

    openDoors() {
        this.children.forEach(function (child) {
            child.openDoors();
        })
    }

    closeDoors() {
        this.children.forEach(function (child) {
            child.closeDoors();
        })
    }


}

//TASK 4-1

class Bridge extends SceneGraphNode {
    constructor() {
        super();
        var floor = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(1.2, 0, 0.25), glm.scale(16, 0.1, 1)));
        floor.append(new CubeRenderNode(bridgeColorBuffer));
        this.append(floor);

        for(var rightSide = 0; rightSide < 2; rightSide++) {
            for(var i = 0; i < 5 ; i++) {
                for(var j = 0; j < 8; j++) {
                    var columnMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.translate(-2 + i*1.65, 0.05, rightSide *0.5));
                    columnMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.rotateZ(-90 + (25.7 * j)));

                    var balkMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.rotateZ(12.5));

                    columnMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.translate(0, 0.45, 0));
                    var smallBalkMatrix = mat4.multiply(mat4.create(), balkMatrix, glm.translate(0, 0.45, 0));
                    balkMatrix = mat4.multiply(mat4.create(), balkMatrix, glm.translate(0, 0.9, 0));

                    columnMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.scale(0.05, 1.5, 0.05));
                    balkMatrix = mat4.multiply(mat4.create(), balkMatrix, glm.scale(0.7, 0.05, 0.05));
                    smallBalkMatrix = mat4.multiply(mat4.create(), smallBalkMatrix, glm.scale(0.4, 0.05, 0.05));

                    var column = new TransformationSceneGraphNode(columnMatrix);
                    column.append(new CubeRenderNode(bridgeColorBuffer));
                    this.append(column);

                    if(j >= 0 && j < 7) {
                        var balk = new TransformationSceneGraphNode(balkMatrix);
                        balk.append(new CubeRenderNode(bridgeColorBuffer));


                        var smallBalk = new TransformationSceneGraphNode(smallBalkMatrix);
                        smallBalk.append(new CubeRenderNode(bridgeColorBuffer));

                        this.append(balk);
                        this.append(smallBalk);
                    } //not append the last balk

                    //append crossBalk only from one side
                    if(rightSide == 0 && j >= 1 && j < 7) {
                        var crossBalkMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.translate(0, 0.32, 5));
                        crossBalkMatrix = mat4.multiply(mat4.create(), crossBalkMatrix, glm.scale(1, 0.01, 18));
                        var crossBalk = new TransformationSceneGraphNode(crossBalkMatrix);
                        crossBalk.append(new CubeRenderNode(bridgeColorBuffer));
                        this.append(crossBalk);
                    }


                }
            }
        }
    }
}


class Station extends SceneGraphNode {
    constructor() {
        super();
        var platform = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), mat4.create(), glm.scale(7, 0.1, 1.2)));
        platform.append(new CubeRenderNode());
        this.append(platform);

        var column = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(1.5, 0.2, -0.2), glm.scale(0.02, 0.5, 0.02)));
        column.append(new CubeRenderNode());
        this.append(column);

        var display = new TransformationSceneGraphNode(mat4.multiply(mat4.create(), glm.translate(1.5, 0.2 * 1.5, -0.2), glm.scale(0.02, 0.2, 0.2)));
        display.append(new CubeRenderNode());
        this.append(display);
    }
}
class CubeRenderNode extends SceneGraphNode {
    constructor(colorBuffer) {
        super();
        this.alpha = 1; //initialy the cube is not transparent at all
        if(colorBuffer == null) {
            this.colorBuffer = cubeColorBuffer;
        }
        else this.colorBuffer = colorBuffer;
    }

   render(context) {

    //setting the model view and projection matrix on shader
    setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

    var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(positionLocation);

    var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
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

  setColorBuffer(colorBuffer) {
        this.colorBuffer = colorBuffer;
  }

}


class PrismRenderNode extends SceneGraphNode {
    constructor(colorBuffer) {
        super();
        this.alpha = 1; //initialy the cube is not transparent at all
        if(colorBuffer == null) {
            this.colorBuffer = cubeColorBuffer;
        }
        else this.colorBuffer = colorBuffer;
    }

    render(context) {

        //setting the model view and projection matrix on shader
        setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

        var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, prismVertexBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(positionLocation);

        var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(colorLocation);

        gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), this.alpha);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

        //render children
        super.render(context);
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
