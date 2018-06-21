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
var movePointNode;

//camera and projection settings
var animatedAngle = 0;
var fieldOfViewInRadians = convertDegreeToRadians(30);
var eye = vec3.create();
//var miniMapEye = vec3.create();
const miniMapYHeight = 30;
var center = vec3.create();
var up = vec3.create();
const camera = {
    rotation: {
        x: 0,
        y: 0,
        z: 0
    },
    zoom: 0
};

//keyboard and mouse buttons
var upButtonPressed = false;
var downButtonPressed = false;
var userCamera = false;
var tramFrontCamera = false;
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
    hbftexture: 'models/hbf.png',
    jkutexture: 'models/jku.png',
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
    staticcolour_fs: 'shader/static_color.fs.glsl',
    stopsign: 'models/stopsign.png',
    blank: 'models/blank.png'
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

    /*create scene graph*/
    rootNode = new ShaderSGNode(shaderProgram);

    createLightNodes(resources);
    createLandScape(resources);
    createRiver(resources);
    createRails(resources);
    createBridge(resources);
    createPrism(resources);
    createPerson(resources);
    createBillboardedPeople(resources);
    createBillBoards(resources);
    createStations(resources);
    createTram(resources);
    createEyePoint(resources);
    //createTestCube(resources);

    //register keyboard events
    window.addEventListener("keyup", keyUp, false);
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("mousemove", mouseMoved, false);
    window.addEventListener("mouseup", mouseUp, false);
    window.addEventListener("mousedown", mouseDown, false);
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
        camera.rotation.z += deltaX;
        //if(camera.rotation.y < 0) camera.rotation.y = -1 * (-camera.rotation.y % 100);
        //else camera.rotation.y %= 100;
        camera.rotation.y = Math.min(camera.rotation.y, 90);
        camera.rotation.y = Math.max(camera.rotation.y, -90);
    } else {
        deltaX = 0;
        deltaY = 0;
    }
}

function createLandScape(resources) {
   //create billboard trees
}

function createRiver(resources) {

    var riverBase = new QuadRenderNode();
    var riverTexture = new AdvancedTextureSGNode(resources.rivertexture, [riverBase]);
    var riverMaterial = new MaterialSGNode(riverTexture);
    riverMaterial.ambient = [0.2, 0.2, 0.2, 1];
    riverMaterial.diffuse = [0.8, 0.8, 0.8, 1];
    riverMaterial.specular = [0.2, 0.2, 0.2, 1];
    riverMaterial.shininess = 50;
    var quadTransformationMatrix = mat4.multiply(mat4.create(), glm.translate(21, -0.5, 0.2), glm.rotateY(90));
    quadTransformationMatrix = mat4.multiply(quadTransformationMatrix, quadTransformationMatrix, glm.scale(100, 0, 3.9));

    var transformationNode = new TransformationSGNode(quadTransformationMatrix, [riverMaterial]);
    rootNode.append(transformationNode);

}


function createTram(resources) {
    tram = new Tram(resources);
    var tramTextureNode = new AdvancedTextureSGNode(resources.orange, [tram]);
    var tramMaterialNode = new MaterialSGNode(tramTextureNode);
    tramMaterialNode.ambient = [0.2, 0.2, 0.2,1 ];
    tramMaterialNode.diffuse = [0.7, 0.6, 0.5, 1];
    tramMaterialNode.specular = [0.1, 0.1, 0.1, 1];
    tramMaterialNode.shininess = 50;
    var tramPosition = new TransformationSGNode(glm.translate(-4, 0.1, 0.05), [tramMaterialNode]);

    //tram2 is driving in the opposite direction
    tram2 = new Tram(resources);
    var tram2textureNode = new AdvancedTextureSGNode(resources.red, [tram2]);
    var tram2materialNode = new MaterialSGNode(tram2textureNode);
    tram2materialNode.ambient = [0.2, 0.2, 0.2,1 ];
    tram2materialNode.diffuse = [0.7, 0.6, 0.5, 1];
    tram2materialNode.specular = [0.1, 0.1, 0.1, 1];
    tram2materialNode.shininess = 50;
    var tramPosition2 = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(40, 0.1, -0.175), glm.rotateY(180)), [tram2materialNode]);

    rootNode.append(tramPosition2);
    rootNode.append(tramPosition);
}

function createPerson() {
    persons = [];
    for (i = 0; i < 3; i++) {

        //persons[i] = new PersonNode();//mat4.multiply(mat4.create(), glm.translate(0.5, 0.1, 0.5), glm.translate(i / 2.5 + 0.3, 0, 0)));
        persons[i] = new MovingNode();
        /*mat4.multiply(
                                                                   mat4.create(),
                   glm.scale(7,7,7),
                                                                   glm.translate(i / 2.5 + 0.9, 0.1, 0.5)
                                                                   ));
               */

        persons[i].append(new TransformationSGNode(mat4.multiply(
            mat4.create(),
            glm.translate(i / 2.5 + 1.95, 0.1, 0.5),
            glm.scale(7, 7, 7)),
            [new PersonNode()]));//persons[i]);
        rootNode.append(persons[i]);
    }
}

function createBillboardedPeople(resources) {
    billboardPersons = [1, 2, 3];
    var textures = [resources.person1, resources.person2, resources.person3];
    for (i = 0; i < billboardPersons.length; i++) {
        var quadRenderNode = new BillboardNode(0.6);
        quadRenderNode.setPosition(0.8 + i / 2.5, 0.1, 0.5);
        var textureNode = new AdvancedTextureSGNode(textures[i], quadRenderNode);
        var transformationMatrix = mat4.multiply(mat4.create(), glm.translate(0.8, 0.1, 0.5), glm.translate(i / 2.5, 0, 0));
        transformationMatrix = mat4.multiply(transformationMatrix, transformationMatrix, glm.scale(0.04, 0.04, 0.04));
        billboardPersons[i] = new TransformationSGNode(transformationMatrix, textureNode);
        rootNode.append(billboardPersons[i]);
    }
}

function createLightNodes(resources) {
    //normal single point light
    let light = new LightSGNode([29, 2, -3], createLightSphere(resources));
    var transformationNode = new TransformationSGNode(glm.translate(0, 2, 1), [light]);
    rootNode.append(transformationNode);

    //spot light
    let spotLight = new SpotLightNode([0, 0, 0], createLightSphere(resources), [0, 1, 0]);
    movePointNode = new MovingNode([10, 1, -0.1]);
    movePointNode.append(spotLight);
    movePointNode.moveTo([20, 2, -0.1], 20000);
    rootNode.append(movePointNode);
}

function createLightSphere(resources) {
    return new ShaderSGNode(createProgram(gl, resources.simple_vs, resources.simple_fs), [
        new RenderSGNode(makeSphere(.2, 10, 10))
    ]);
}

function createBridge(resources) {
    var bridge = new Bridge();
    var bridgeTexture = new AdvancedTextureSGNode(resources.bridge_metal, [bridge]);
    var bridgeMaterial = new MaterialSGNode(bridgeTexture);
    bridgeMaterial.ambient = [0.10, 0.25, 0.054, 1];
    bridgeMaterial.diffuse = [0.30, 0.75, 0.18144, 1];
    bridgeMaterial.specular = [0.1, 0.5, 0.1, 1];
    bridgeMaterial.shininess = 0.2;
    var bridgePosition = new TransformationSGNode(glm.translate(20, -0.05, -0.32), [bridgeMaterial]);
    rootNode.append(bridgePosition);
}

function createRails(resources) {
    var railTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.scale(200, 0.05, 0.05));
    for (var secondLine = 0; secondLine < 2; secondLine++) {
        for (var railAxe = 0; railAxe < 2; railAxe++) {
            var rail = new CubeRenderNode();
            var railAxeTransformationMatrix = mat4.multiply(mat4.create(), railTransformationMatrix, glm.translate(0, 0, railAxe * 2 - secondLine * 4.5));
            var railTextureNode = new AdvancedTextureSGNode(resources.traintracks, [rail])
            var railMaterialNode = new MaterialSGNode(railTextureNode);
            railMaterialNode.ambient = [0.0,0.0,0.0,1];
            railMaterialNode.diffuse = [0.4,0.2,0.2,1];
            railMaterialNode.specular = [0.4,0.1,0.1,1];
            railMaterialNode.shininess = 10;
            var railTransformationNode = new TransformationSGNode(railAxeTransformationMatrix, [railMaterialNode]);
            rootNode.append(railTransformationNode);
        }
    }
}

function createStations(resources) {
    //create hbf
    var station = new Station(resources.hbftexture, resources.stopsign);
    var textureStation = new AdvancedTextureSGNode(resources.cobblestone, [station]);
    var materialStation = new MaterialSGNode([textureStation]);
    materialStation.ambient = [0.1, 0.1, 0.1, 1];
    materialStation.diffuse = [0.1, 0.1, 0.1, 1];
    materialStation.specular = [0.1, 0.1, 0.1, 1];
    materialStation.shininess = 20;
    var stationPosition = new TransformationSGNode(glm.translate(1, 0, 0.51), [materialStation]);
    rootNode.append(stationPosition);

    //create jku
    var jkustation = new Station(resources.jkutexture, resources.stopsign);
    var textureJKUStation = new AdvancedTextureSGNode(resources.cobblestone, [jkustation]);
    var materialJKUStation = new MaterialSGNode([textureJKUStation]);
    materialJKUStation.ambient = [0.1, 0.1, 0.1, 1];
    materialJKUStation.diffuse = [0.1, 0.1, 0.1, 1];
    materialJKUStation.specular = [0.1, 0.1, 0.1, 1];
    materialJKUStation.shininess = 20;
    var stationPosition = new TransformationSGNode(glm.translate(32, 0, 0.51), [materialJKUStation]);
    rootNode.append(stationPosition);
}

function createBillBoards(resources) {
    var billboard1 = new BillboardNode(1);
    billboard1.setPosition(30, 2, -4);
    var textureBillboardNode = new AdvancedTextureSGNode(resources.sun, [billboard1]);
    var materialBillboardNode = new MaterialSGNode(textureBillboardNode);
    materialBillboardNode.ambient=[0, 0, 0, 0];
    materialBillboardNode.diffuse=[0, 0, 0, 0];
    materialBillboardNode.specular=[0, 0, 0, 0];
    materialBillboardNode.emission=[0, 0, 0, 0];
    materialBillboardNode.shininess=0;
    var billboardPos = new TransformationSGNode(glm.translate(30, 2, -4), materialBillboardNode);
    rootNode.append(billboardPos);
}

function createPrism(resources) {
    //prism before the bridge:
    var prism = new PrismRenderNode();
    var prismTransformationMatrix = mat4.multiply(mat4.create(), glm.rotateY(90), glm.scale(1.9, 0.3, 57));
    mat4.multiply(prismTransformationMatrix, prismTransformationMatrix, glm.translate(0.04, -0.3, 0));
    var texturePrismNode = new AdvancedTextureSGNode(resources.cement, [prism]);
    var materialPrismNode = new MaterialSGNode(texturePrismNode);
    materialPrismNode.ambient = [0.1,0.1,0.1,1];
    materialPrismNode.diffuse = [0.7, 0.7, 0.7,1];
    materialPrismNode.specular = [0.2,0.2,0.2,1];
    materialPrismNode.shininess = 0.2;
    var prismTransformation = new TransformationSGNode(prismTransformationMatrix, [materialPrismNode]);
    rootNode.append(prismTransformation);

    //prism after the bridge
    var prism2 = new PrismRenderNode();
    var texturePrismNode2 = new AdvancedTextureSGNode(resources.cement, [prism2]);
    var materialPrismNode2 = new MaterialSGNode(texturePrismNode2);
    materialPrismNode2.ambient = [0.1,0.1,0.1,1];
    materialPrismNode2.diffuse = [0.7, 0.7, 0.7,1];
    materialPrismNode2.specular = [0.2,0.2,0.2,1];
    materialPrismNode2.shininess = 0.2;
    var prismTransformation2 = new TransformationSGNode(mat4.multiply(mat4.create(), prismTransformationMatrix, glm.translate(0, 0, 0.74)), [materialPrismNode2]);
    rootNode.append(prismTransformation2);
}

function createTestCube(resources) {
    var testCube = new TransformationSGNode(glm.translate(3, 4, 0), [new CubeRenderNode()]);
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
        movePointNode.setPosition([10, 1, -0.1]);
        movePointNode.moveTo([20, 2, -0.1], 20000);
    }

    //0 to 5: scene
    // 5 to 25: scene 2
    //26 to 30: scene 3
    //sceneIndex = projectTimeInMilliSeconds < 15000 ? 1 : projectTimeInMilliSeconds < 25000 ? 2 : 3;
    //sceneIndex = 3;

    //update tram transformation

    if       (projectTimeInMilliSeconds < 2500) {
        sceneIndex = 1;
    }
    else if  (projectTimeInMilliSeconds < 5000) {
        tram.setSpeed(vec3.fromValues(15,0,0));
        tram2.setSpeed(vec3.fromValues(10,0,0));
    }
    else if  (projectTimeInMilliSeconds < 6000) {
        tram.setSpeed(vec3.create());
    }
    else if  (projectTimeInMilliSeconds < 8000) {
        tram.openDoors();
        persons.forEach(function(person) {person.setSpeed(vec3.fromValues(0,0,-2.2));});
    }
    else if (projectTimeInMilliSeconds < 10000) {
        persons.forEach(function(person) {person.setSpeed(vec3.create());});
    }
    else if (projectTimeInMilliSeconds < 10500) {
        tram.closeDoors();
    }
    else if (projectTimeInMilliSeconds < 24000) {
        sceneIndex = 2;
        persons.forEach(function(person) {person.setSpeed(vec3.fromValues(20,0,0));});
        tram.setSpeed(vec3.fromValues(20,0,0));
    }
    else if (projectTimeInMilliSeconds < 26000) {
        sceneIndex = 3;
    }
    else if (projectTimeInMilliSeconds < 30000) {
        persons.forEach(function(person) {person.setSpeed(vec3.fromValues(0,0,1));});
        tram.setSpeed(vec3.fromValues(0, 0, 0));
        tram.openDoors();
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
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_model'), false, context.sceneMatrix);
    //console.log(context.sceneMatrix);
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
    var savedEye = eye;
    var savedCenter = center;

    eye = vec3.fromValues(eye[0], miniMapYHeight, eye[2]);
    center = vec3.fromValues(center[0], 0, center[2]);
    mat4.lookAt(miniMapViewMatrix, eye, center, up);
    //save viewMatrix
    var previous = context.viewMatrix;
    context.viewMatrix = miniMapViewMatrix;
    rootNode.render(context);
    renderLine(timeInMilliseconds);

    //restore eye
    eye = savedEye;
    center = savedCenter;
    //restore viewMatrix
    context.viewMatrix = previous;
}

function renderLine(timeInMilliseconds) {
    //add/remove line points to the array
    linePositions.push(eye[0]);
    linePositions.push(6);
    linePositions.push(eye[2]);
    //if animation lasted more than 10 seconds start removing first elements
    if (timeInMilliseconds > 10000) {
        linePositions.shift();
        linePositions.shift();
        linePositions.shift();
    }

    //draw lines
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.STATIC_DRAW);
    //use program with static shaders
    gl.useProgram(lineDrawProgram);
    const lineColor = {r: 1.0, g: 0.2, b: 0.0};
    gl.uniform3f(gl.getUniformLocation(lineDrawProgram, 'v_color'), lineColor.r, lineColor.g, lineColor.b);
    gl.uniformMatrix4fv(gl.getUniformLocation(lineDrawProgram, 'u_modelView'), false, mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(lineDrawProgram, 'u_projection'), false, context.projectionMatrix);
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
    gl.drawArrays(gl.LINE_STRIP, 0, linePositions.length / 3);
}

//called to restart after 30 seconds
function resetPositions() {
    tram.resetPosition();
    tram2.resetPosition();
    persons.forEach(function (person) {
        person.resetPosition();
    })
}

function setUpModelViewMatrix(sceneMatrix, viewMatrix) {
    var modelViewMatrix = mat4.multiply(mat4.create(), viewMatrix, sceneMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_modelView'), false, modelViewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_model'), false, sceneMatrix);
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

var eyePoint;
var centerPoint;
var jumpToUserCamera = true;

function createEyePoint() {
    eyePoint = new MovingPoint();
    centerPoint = new MovingPoint();
}

function calculateViewMatrix() {
    //always calculate the position of the animated flight, but only show it if the user selected it
    switch (sceneIndex) {
        case 1:
            eyePoint.setPosition([7.5, 1.8, 1.6]);
            centerPoint.setPosition([6.3,1.6,1.3]);
            break;
        case 2:
            eyePoint.moveTo(vec3.add(vec3.create(), tram.getPosition(), [2,0.1,0.05]), 2000);
            centerPoint.moveTo(vec3.add(vec3.create(), tram.getPosition(), [3,0.1,0.05]), 2000);
            break;
        case 3:
            eyePoint.setPosition([40, 2, 0]);
            centerPoint.setPosition([39, 1.9, 0]);
    }

    //compute the camera's matrix
    viewMatrix = mat4.create();
    if (userCamera) {
        if(jumpToUserCamera) {
            //calculate direction
            let directionOffset = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), center, eye));
            camera.rotation.y = -directionOffset[1] * 360 / Math.PI;
            let acosParam = directionOffset[0] / Math.cos(camera.rotation.y * Math.PI / 360);
            camera.rotation.x = Math.acos(acosParam) * 360 / Math.PI;
            camera.rotation.z = -camera.rotation.x;
            camera.zoom = 0;
            jumpToUserCamera = false;
        }
        //calculate lookat direction
        var dirX = Math.cos(camera.rotation.x * Math.PI / 360) * Math.cos(camera.rotation.y * Math.PI / 360);
        var dirY = -camera.rotation.y * Math.PI / 360;
        var dirZ = Math.sin(camera.rotation.z * Math.PI / 360) * Math.cos(camera.rotation.y * Math.PI / 360);

        //round in order to neglect rounding mistakes (Math.sin(PI) would be >0 otherwise!)
        dirX = Math.round(dirX * 1000000000) / 1000000000;
        dirY = Math.round(dirY * 1000000000) / 1000000000;
        dirZ = Math.round(dirZ * 1000000000) / 1000000000;
        var direction = [dirX, dirY, dirZ];

        //calculate new lookat vectors
        vec3.add(eye, eye, vec3.scale(vec3.create(), direction, camera.zoom * zoomspeed));
        vec3.add(center, eye, direction);
        up = [0, 1, 0];
    }
    else if (tramFrontCamera) {
        //direction have to be normalized so that the jump to the user camera works
        var tramPos = tram.getPosition();
        vec3.add(eye, tramPos, [-1.8,0.1,0.03]);
        setCenterPosition(vec3.add(center, tramPos, [-1.7,0.1,0.03]));
        up = [0, 1, 0];
    }
    else {
        //direction have to be normalized so that the jump to the user camera works
        eye = eyePoint.getPosition();
        setCenterPosition(centerPoint.getPosition());
        up = [0, 1, 0];
    }

    viewMatrix = mat4.lookAt(viewMatrix, eye, center, up);
    return viewMatrix;
}

/**
 *  sets the the center Position with a normalized direction vector
 * */
function setCenterPosition(centerPos) {
    let direction = vec3.subtract(vec3.create(), centerPos, eye);
    vec3.normalize(direction, direction);
    vec3.add(center, eye, direction);
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




function convertDegreeToRadians(degree) {
    return degree * Math.PI / 180
}

function convertRadiansToDegree(degree) {
    return degree * 180 / Math.PI;
}
