//OpenGL context
var gl = null;
//shader program
var shaderProgram = null;
var lineDrawProgram = null;
var canvasWidth = 800;
var canvasHeight = 800;
var aspectRatio = canvasWidth / canvasHeight;

//rendering context
var context;
var rootNode, mainShaderRootNode, simpleShaderRootNode;

//camera and projection settings
var animatedAngle = 0;
var fieldOfViewInRadians = convertDegreeToRadians(30);
var eye = vec3.create();
var miniMapEye = vec3.create();
const miniMapYHeight = 20;
var center = vec3.create();
var up = vec3.create();
const camera = {
    rotation: {
        x: 0,
        y: 0
    },
    zoom: 0
};

//keyboard and mouse buttons
var upButtonPressed = false;
var downButtonPressed = false;
var userCamera = false;
var tramFrontCamera = true;
var mouseButtonPressed = false;
var mouseX = 0, mouseY = 0, mousePrevX = 0, mousePrevY = 0;
var zoomspeed = 0.1;

//textures
var waterTexture;
var churchTexture;

/*scene settings*/
var projectTimeInMilliSeconds = 0;//runs from 0.0 to 30.0s
var animationRepeatedCount = 0;   //tells us how often our scene was already repeated
var sceneIndex = 0; //indicates the scene: 1=Main Station, 2= Danube Bridge, 3=JKU
/*var lastSecondRendered = 0;
function oneSecondSinceLastRendering() {
    if(projectTimeInMilliSeconds / 1000 > lastSecondRendered) {
        lastSecondRendered++;
        return true;
    }
    else return false;
}*/

var tram;
var persons, billboardPersons;
var personParent = "Station";
var tram, tram2;

//links to buffer stored on the GPU
var quadVertexBuffer, quadColorBuffer, sunColorBuffer;
var cubeVertexBuffer, prismVertexBuffer, cubeColorBuffer, bridgeColorBuffer, prismColorBuffer, cubeIndexBuffer,
    personColorBuffer, lineBuffer;

//render Lines
var linePositions = [];

var quadColors = new Float32Array([
    1, 0, 0, 1,
    1, 1, 0, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    1, 1, 0, 1,
    0, 1, 0, 1]);


//used for tram
var cubeColors = new Float32Array([
    0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
    1, 0.5, 0, 1, 0.5, 0, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 0.5, 0, 1, 0.5, 0, 1, 1, 1, 1, 1, 1,
    0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
]);
//used for bridge
var bridgeColors = new Float32Array([
    0, 0.5, 0, 0, 0.5, 0, 0, 0.5, 0, 0, 0.5, 0,
    0, 0.25, 0, 0, 0.25, 0, 0, 0.25, 0, 0, 0.25, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0.25, 0, 0, 0.25, 0, 0, 0.25, 0, 0, 0.25, 0,
    0, 0.5, 0, 0, 0.5, 0, 0, 0.5, 0, 0, 0.5, 0,
    0, 0.5, 0, 0, 0.5, 0, 0, 0.5, 0, 0, 0.5, 0
]);

var personColors = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 0.25, 1, 0, 0.25, 1, 0, 0.25, 1, 0, 0.25, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0.25, 1, 0, 0.25, 1, 0, 0.25, 1, 0, 0.25, 1,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
]);

//used for tram

//used for prism
var prismColors = new Float32Array([
    1, 0.7, 0.3, 1, 0.7, 0.3, 1, 0.7, 0.3, 1, 0.7, 0.3,
    1, 0.7, 0.3, 1, 0.7, 0.3, 1, 0.7, 0.3, 1, 0.7, 0.3,
    0.8, 0.35, 0.15, 0.8, 0.35, 0.15, 0.8, 0.35, 0.15, 0.8, 0.35, 0.15,
    0.8, 0.35, 0.15, 0.8, 0.35, 0.15, 0.8, 0.35, 0.15, 0.8, 0.35, 0.15,
    0.5, 0.7, 0.3, 0.5, 0.7, 0.3, 0.5, 0.7, 0.3, 0.5, 0.7, 0.3,
    1, 0.7, 0.3, 1, 0.7, 0.3, 1, 0.7, 0.3, 1, 0.7, 0.3
]);


//load the shader resources using a utility function
loadResources({
    simple_vs: 'shader/simple.vs.glsl',
    simple_fs: 'shader/simple.fs.glsl',
    texture_vs: 'shader/texture.vs.glsl',
    texture_fs: 'shader/texture.fs.glsl',
    phong_vs: 'shader/phong.vs.glsl',
    phong_fs: 'shader/phong.fs.glsl',
    churchtexture: 'models/neuerdom.jpg',
    rivertexture: 'models/water.jpg',
    cobblestone: 'models/cobblestone.jpg',
    bridge_metal: 'models/metal.jpg',
    sun: 'models/sun.png',
    traintracks: 'models/bronze.jpg',
    cement: 'models/cement.jpg',
    orange: 'models/orange.jpg',
    red: 'models/red.jpg',
    staticcolorvs: 'shader/static_color.vs.glsl',
    person1: 'models/person1.png',
    person2: 'models/person2.png',
    person3: 'models/person3.png',
    staticcolour_vs: 'shader/static_color.vs.glsl',
    staticcolour_fs: 'shader/static_color.fs.glsl'
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
    shaderProgram = createProgram(gl, resources.texture_vs, resources.texture_fs);

    lineDrawProgram = createProgram(gl, resources.staticcolour_vs, resources.staticcolour_fs);

    /*set buffers for cube*/
    initBuffer();

    initTextures(resources);

    /*create scene graph*/
    rootNode = new ShaderSGNode(shaderProgram);

    createLightNodes(resources);
    createRiver(resources);
    createRails(resources);
    createStation(resources);
    createBridge(resources);
    createPrism(resources);
    createPerson(resources);
    createBillboardedPeople(resources);
    createBillBoards(resources);
    createTram(resources);
    createTestCube(resources);

    //register keyboard events
    window.addEventListener("keyup", keyUp, false);
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("mousemove", mouseMoved, false);
    window.addEventListener("mouseup", mouseUp, false);
    window.addEventListener("mousedown", mouseDown, false);
}

function initTextures(resources) {
    //create texture object
    waterTexture = gl.createTexture();
    //select a texture unit
    gl.activeTexture(gl.TEXTURE2);
    //bind texture to active texture unit
    gl.bindTexture(gl.TEXTURE_2D, waterTexture);
    //set sampling parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //change texture sampling behaviour
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //upload texture data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.rivertexture);
    //clean up/unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function keyUp(key) {
    if (key.keyCode == 38 || key.keyCode == 40) {
        //no zoom
        camera.zoom = 0;
        upButtonPressed = false;
        downButtonPressed = false;
    }
}

function keyDown(key) {
    if (key.keyCode == 67) {
        //'c' is pressed
        if (userCamera) {
            userCamera = false;
            tramFrontCamera = false;
        } else {
            userCamera = true;
            tramFrontCamera = false;
        }
    } else if (key.keyCode == 70) {
        //'f' is pressed
        if (tramFrontCamera) {
            userCamera = false;
            tramFrontCamera = false;
        } else {
            userCamera = false;
            tramFrontCamera = true;
        }
    } else if (key.keyCode == 38) {
        camera.zoom = 1;//zoom in
        upButtonPressed = true;
    } else if (key.keyCode == 40) {
        camera.zoom = -1;//zoom out
        downButtonPressed = true;
    }
}

function mouseUp(event) {
    if (event.button == 0) {
        mouseButtonPressed = false;
    }
}

function mouseDown(event) {
    if (event.button == 0) {
        mouseButtonPressed = true;
    }
}

function mouseMoved(event) {
    mousePrevX = mouseX;
    mousePrevY = mouseY;
    mouseX = event.pageX;
    mouseY = event.pageY;
    if (mouseButtonPressed && userCamera) {
        deltaX = mouseX - mousePrevX;
        deltaY = mouseY - mousePrevY;
        camera.rotation.x += deltaX;
        camera.rotation.y += deltaY;
        camera.rotation.y = Math.min(camera.rotation.y, 90);
        camera.rotation.y = Math.max(camera.rotation.y, -90);
    } else {
        deltaX = 0;
        deltaY = 0;
    }
}

function createRiver(resources) {

    var riverBase = new QuadRenderNode();
    var riverTexture = new AdvancedTextureSGNode(resources.rivertexture, [riverBase]);

    var quadTransformationMatrix = mat4.multiply(mat4.create(), glm.translate(21, -0.5, 0.2), glm.rotateY(90));
    quadTransformationMatrix = mat4.multiply(quadTransformationMatrix, quadTransformationMatrix, glm.scale(100, 0, 3.9));

    var transformationNode = new TransformationSGNode(quadTransformationMatrix, [riverTexture]);
    rootNode.append(transformationNode);

}


function createTram(resources) {
    tram = new Tram();
    var tramtextureNode = new AdvancedTextureSGNode(resources.orange, [tram]);
    var tramPosition = new TransformationSGNode(glm.translate(-4, 0.1, 0.05), [tramtextureNode]);

    //tram2 is driving in the opposite direction
    tram2 = new Tram();
    var tram2textureNode = new AdvancedTextureSGNode(resources.red, [tram2]);
    var tramPosition2 = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(20, 0.1, -0.175), glm.rotateY(180)), [tram2textureNode]);

    rootNode.append(tramPosition2);
    rootNode.append(tramPosition);
}

function createPerson() {
    persons = new Array(1, 2, 3);
    for (i = 0; i < persons.length; i++) {
        persons[i] = new PersonNode(mat4.multiply(mat4.create(), glm.translate(0.5, 0.1, 0.5), glm.translate(i / 2.5 + 0.3, 0, 0)));
        rootNode.append(persons[i]);
    }
}

function createBillboardedPeople(resources) {
    billboardPersons = [1,2,3];
    var textures = [resources.person1, resources.person2, resources.person3];
    for (i = 0; i < billboardPersons.length; i++) {
        var quadRenderNode = new BillboardNode(0.6);
        quadRenderNode.setPosition(0.8+i/2.5, 0.1, 0.5);
        var textureNode = new AdvancedTextureSGNode(textures[i], quadRenderNode);
        var transformationMatrix = mat4.multiply(mat4.create(), glm.translate(0.8, 0.1, 0.5), glm.translate(i / 2.5, 0, 0));
        transformationMatrix = mat4.multiply(transformationMatrix, transformationMatrix, glm.scale(0.04, 0.04, 0.04));
        billboardPersons[i] = new TransformationSGNode(transformationMatrix, textureNode);
        rootNode.append(billboardPersons[i]);
    }
}

function createLightNodes(resources) {
    let light = new LightSGNode([29, 2, -2], createLightSphere(resources));
    var transformationNode = new TransformationSGNode(glm.translate(0, 2, 1), [light]);
    rootNode.append(transformationNode);
}

function createLightSphere(resources) {
    return new ShaderSGNode(createProgram(gl, resources.simple_vs, resources.simple_fs), [
        new RenderSGNode(makeSphere(.2, 10, 10))
    ]);
}

function createBridge(resources) {
    var bridge = new Bridge();
    var bridgeTexture = new AdvancedTextureSGNode(resources.bridge_metal, [bridge]);
    var bridgePosition = new TransformationSGNode(glm.translate(20, -0.05, -0.32), [bridgeTexture]);

    rootNode.append(bridgePosition);
}

function createRails(resources) {
    var railTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.scale(200, 0.05, 0.05));
    for (var secondLine = 0; secondLine < 2; secondLine++) {
        for (var railAxe = 0; railAxe < 2; railAxe++) {
            var rail = new CubeRenderNode();
            var railAxeTransformationMatrix = mat4.multiply(mat4.create(), railTransformationMatrix, glm.translate(0, 0, railAxe * 2 - secondLine * 4.5));
            var railTextureNode = new AdvancedTextureSGNode(resources.traintracks, [rail])
            var railTransformationNode = new TransformationSGNode(railAxeTransformationMatrix, [railTextureNode]);
            rootNode.append(railTransformationNode);
        }
    }
}

function createStation(resources) {
    var station = new Station();
    var textureStation = new AdvancedTextureSGNode(resources.cobblestone, [station]);
    var stationPosition = new TransformationSGNode(glm.translate(1, 0, 0.51), [textureStation]);
    rootNode.append(stationPosition);
}

function createBillBoards(resources) {
    var billboard1 = new BillboardNode(1);
    billboard1.setPosition(30, 2, -2);
    var textureBillboardNode = new AdvancedTextureSGNode(resources.sun, [billboard1]);
    var billboardPos = new TransformationSGNode(glm.translate(30, 2, -2), textureBillboardNode);
    rootNode.append(billboardPos);
}

function createPrism(resources) {
    //prism before the bridge:
    var prism = new PrismRenderNode();
    var prismTransformationMatrix = mat4.multiply(mat4.create(), glm.rotateY(90), glm.scale(1.9, 0.3, 57));
    mat4.multiply(prismTransformationMatrix, prismTransformationMatrix, glm.translate(0.04, -0.3, 0));
    var texturePrismNode = new AdvancedTextureSGNode(resources.cement, [prism]);
    var prismTransformation = new TransformationSGNode(prismTransformationMatrix, [texturePrismNode]);
    rootNode.append(prismTransformation);

    //prism after the bridge
    var prism2 = new PrismRenderNode();
    var texturePrismNode2 = new AdvancedTextureSGNode(resources.cement, [prism2]);
    var prismTransformation2 = new TransformationSGNode(mat4.multiply(mat4.create(), prismTransformationMatrix, glm.translate(0, 0, 0.74)), [texturePrismNode2]);
    rootNode.append(prismTransformation2);
}

function createTestCube(resources) {
    var testCube = new TransformationSGNode(glm.translate(3,4, 0) , [new CubeRenderNode()]);
    var testCubeTextured = new AdvancedTextureSGNode(resources.cement, [testCube]);

    rootNode.append(testCubeTextured);
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
    sunColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sunColorBuffer);

    //init cube buffer
    cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

    cubeIndexBuffer = gl.createBuffer();
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
    personColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, personColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, personColors, gl.STATIC_DRAW);

    cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    lineBuffer = gl.createBuffer();

}

/**
 * render one frame
 */
function render(timeInMilliseconds) {

    //project lasts for 30 seconds
    var oldProjectTimeInMilliSeconds = projectTimeInMilliSeconds;
    projectTimeInMilliSeconds = timeInMilliseconds % 30000;
    //if animation gets repeated:
    if (projectTimeInMilliSeconds < oldProjectTimeInMilliSeconds) {
        resetPositions();
    }

    //0 to 5: scene
    // 5 to 25: scene 2
    //26 to 30: scene 3
    sceneIndex = projectTimeInMilliSeconds < 15000 ? 1 : projectTimeInMilliSeconds < 25000 ? 2 : 3;
    //sceneIndex = 3;

    //update tram transformation
    switch (sceneIndex) {
        case 1:
            if (projectTimeInMilliSeconds < 4000) {
                tram.setSpeed(vec3.fromValues(10,0,0));
                tram2.setSpeed(vec3.fromValues(10,0,0));
            }
            else if (projectTimeInMilliSeconds < 5000) {
                tram.setSpeed(vec3.create());
            }
            else if (projectTimeInMilliSeconds < 8000) {
                //FIXME tram.openDoors();
                persons.forEach(function(person) {
                    person.setSpeed(vec3.fromValues(0,0,-1.5));
                });
                /*for (i = 0; i < 3; i++) {
                    persons[i].setSpeed(vec3.fromValues(0,0,-1.5));
                }*/
            }
            else if (projectTimeInMilliSeconds < 10000) {
                persons.forEach(function(person) {
                   person.setSpeed(vec3.create());
                });

            }
            else if (projectTimeInMilliSeconds < 11000) {
                //FIXME tram.closeDoors();
            }
            else if (projectTimeInMilliSeconds < 12500) {
                /*
                if (personParent == "Station") {
                    personParent = "Tram";
                    for (i = 0; i < 3; i++) {
                        //rootNode.remove(persons[i]);
                        persons[i]
                        persons[i].rotateAndTranslate(-0.10, -0.005, -0.03);

                        //tram.append(persons[i]);
                    }
                }
                */
                persons.forEach(function(person) {
                    person.setSpeed(vec3.fromValues(10,0,0));
                });
                tram.setSpeed(vec3.fromValues(10,0,0));
            }
            break;
        case 2:
            break;
        case 3:
            if (projectTimeInMilliSeconds > 29000) {
                /*
                if (personParent == "Tram") {
                    personParent = "Station";
                    for (i = 0; i < persons.length; i++) {
                        tram.remove(persons[i]);
                        persons[i] = new PersonNode(mat4.multiply(mat4.create(), glm.translate(0.5, 0.1, 0.5), glm.translate(i / 2.5 + 0.3, 0, 0)));
                        rootNode.append(persons[i]);

                    }
                }*/
            }
            break;
    }

    renderMainView();
    renderMiniMap(timeInMilliseconds);
    //request another render call as soon as possible
    requestAnimationFrame(render);
}

function renderMainView() {
    //set viewport back to original size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    //enable depth test to let objects in front occluse objects further away
    gl.enable(gl.DEPTH_TEST);
    //disable scissor-test so the main view is not overdrawn by the miniMap
    gl.disable(gl.SCISSOR_TEST);

    //set background color to light gray
    gl.clearColor(0.5, 0.5, 0.5, 1);
    //clear the buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //activate shader program
    gl.useProgram(shaderProgram);

    context = createSceneGraphContext(gl, shaderProgram);
    displayText("c: User cam, f: front tram cam");
    rootNode.render(context);
}

function renderMiniMap(timeInMilliseconds) {
    // draw mini map
    const miniMapWidth = gl.canvas.width / 3;
    const miniMapHeight = gl.canvas.height / 3;
    const miniMapX = gl.canvas.width - miniMapWidth;
    const miniMapY = gl.canvas.height - miniMapHeight;
    gl.viewport(miniMapX, miniMapY, miniMapWidth, miniMapHeight);

    //set a scissor, so that only the given bounds are rendered
    gl.scissor(miniMapX, miniMapY, miniMapWidth, miniMapHeight);
    gl.enable(gl.SCISSOR_TEST);

    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var miniMapViewMatrix = mat4.create();
    miniMapEye = vec3.fromValues(eye[0], miniMapYHeight, eye[2]);
    var miniMapCenter = vec3.fromValues(center[0], 0, center[2]);
    mat4.lookAt(miniMapViewMatrix, miniMapEye, miniMapCenter, up);
    //save viewMatrix
    var previous = context.viewMatrix;
    context.viewMatrix = miniMapViewMatrix;
    rootNode.render(context);
    renderLine(timeInMilliseconds);

    //restore viewMatrix
    context.viewMatrix = previous;
}

function renderLine(timeInMilliseconds) {
    //add/remove line points to the array
    linePositions.push(miniMapEye[0]);
    linePositions.push(6);
    linePositions.push(miniMapEye[2]);
    //if animation lasted more than 10 seconds start removing first elements
    if(timeInMilliseconds > 10000) {
        linePositions.shift();
        linePositions.shift();
        linePositions.shift();
    }

    //draw lines
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.STATIC_DRAW);
    //use program with static shaders
    gl.useProgram(lineDrawProgram);
    const lineColor = { r: 1.0, g: 0.2, b: 0.0};
    gl.uniform3f(gl.getUniformLocation(lineDrawProgram, 'v_color'), lineColor.r, lineColor.g, lineColor.b);
    gl.uniformMatrix4fv(gl.getUniformLocation(lineDrawProgram, 'u_modelView'), false, mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(lineDrawProgram, 'u_projection'), false,  context.projectionMatrix);
    /*const colorLocation = gl.getAttribLocation(shaderProgram, 'a_color');
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    */
    var positionLoc = gl.getAttribLocation(lineDrawProgram, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    // Draw the triangle
    gl.enable(gl.DEPTH_TEST);
    gl.drawArrays(gl.LINE_STRIP, 0, linePositions.length/3);
}

//called to restart after 30 seconds
function resetPositions() {
    tram.resetPosition();
    tram2.resetPosition();
    persons.forEach(function(person) {
        person.resetPosition();
    })
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
    projectionMatrix = mat4.perspective(mat4.create(), fieldOfViewInRadians, aspectRatio, 0.01, 200);
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

var xPosition = 0;

function calculateViewMatrix() {
    xPosition = tram.getPosition()[0];
    //compute the camera's matrix
    viewMatrix = mat4.create();
    if (userCamera) {
        //calculate lookat direction
        var dirX = Math.cos(camera.rotation.x * Math.PI / 360) * Math.cos(camera.rotation.y * Math.PI / 360);
        var dirY = -camera.rotation.y * Math.PI / 360;
        var dirZ = Math.sin(camera.rotation.x * Math.PI / 360) * Math.cos(camera.rotation.y * Math.PI / 360);

        //round in order to neglect rounding mistakes (Math.sin(PI) would be >0 otherwise!)
        dirX = Math.round(dirX * 1000000000) / 1000000000;
        dirY = Math.round(dirY * 1000000000) / 1000000000;
        dirZ = Math.round(dirZ * 1000000000) / 1000000000;
        var direction = [dirX, dirY, dirZ];

        //calculate new lookat vectors
        eye = vec3.add(eye, eye, vec3.scale(vec3.create(), direction, camera.zoom * zoomspeed));
        center = vec3.add(center, eye, direction);
        up = [0, 1, 0];
    } else if (tramFrontCamera) {

        eye = [xPosition, 0.1, 0.05];
        center = [xPosition + 0.5, 0.1, 0.05];
        up = [0, 1, 0];
    }
    else {
        switch (sceneIndex) {
            case 1:
                if (projectTimeInMilliSeconds < 13000) {
                    eye = [7, 2.5, 5];
                    center = [0, 0, 0];
                    up = [0, 1, 0];
                } else {
                    eye = [projectTimeInMilliSeconds / 13000 * 7, 2.5, 5];
                    center = [projectTimeInMilliSeconds / 13000 * 7 - 7, 0, 0];
                    up = [0, 1, 0];
                }
                break;
            case 2:
                eye = [projectTimeInMilliSeconds / 1500 - 8, 2, 3];
                center = [30, 0, 0];
                up = [0, 1, 0];
                break;
            case 3:
                eye = [projectTimeInMilliSeconds / 1500 - 8, 2, 3];
                center = [30, 0, 0];
                up = [0, 1, 0];
                break;
        }
    }

    viewMatrix = mat4.lookAt(viewMatrix, eye, center, up);
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


class Station extends SceneGraphNode {
    constructor() {
        super();
        var platform = new TransformationSGNode(mat4.multiply(mat4.create(), mat4.create(), glm.scale(7, 0.1, 1.2)), new CubeRenderNode());
        this.append(platform);

        var column = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(1.5, 0.2, -0.2), glm.scale(0.02, 0.5, 0.02)), new CubeRenderNode());
        this.append(column);

        var display = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(1.5, 0.2 * 1.5, -0.2), glm.scale(0.02, 0.2, 0.2)), new CubeRenderNode());
        this.append(display);
    }
}

function convertDegreeToRadians(degree) {
    return degree * Math.PI / 180
}

function convertRadiansToDegree(degree) {
    return degree * 180 / Math.PI;
}
