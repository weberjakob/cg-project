var s = 0.3; //size of cube

/*var cubeVertices = new Float32Array([
    -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
    -s,-s, s, s,-s, s, s, s, s, -s, s, s,
    -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
    s,-s,-s, s, s,-s, s, s, s, s,-s, s,
    -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
    -s, s,-s, -s, s, s, s, s, s, s, s,-s,
]);

var cubeIndices =  new Float32Array([
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23
]);*/

var cubeVertices = new Float32Array([
    -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
    -s,-s, s, s,-s, s, s, s, s, -s, s, s,
    -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
    s,-s,-s, s, s,-s, s, s, s, s,-s, s,
    -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
    -s, s,-s, -s, s, s, s, s, s, s, s,-s
]);

var cubeIndices =  new Float32Array([
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23
]);

var t = 1/Math.sqrt(3);
cubeNormals = new Float32Array([-t, -t, -t, t, -t, -t, t, t, -t, -t, t, -t,
    -t, -t, t, t, -t, t, t, t, t, -t, t, t,
    -t, -t, -t, -t, t, -t, -t, t, t, -t, -t, t,
    t, -t, -t, t, t, -t, t, t, t, t, -t, t,
    -t, -t, -t, -t, -t, t, t, -t, t, t, -t, -t,
    -t, t, -t, -t, t, t, t, t, t, t, t, -t]);

cubeTextures = new Float32Array([
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1]);

class CubeRenderNode extends SceneGraphNode {
    constructor(children) {
        super(children);
        this.renderSGNode = new RenderSGNode({
            position: cubeVertices,
            normal: cubeNormals,
            texture: cubeTextures,
            indices: cubeIndices
        });
    }

    render(context) {
        this.renderSGNode.render(context);
        super.render(context);
    }

}