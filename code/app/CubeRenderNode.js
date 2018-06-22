var s = 0.3; //size of cube
const cubeVertices = [
    -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
    -s,-s, s, s,-s, s, s, s, s, -s, s, s,
    -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
    s,-s,-s, s, s,-s, s, s, s, s,-s, s,
    -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
    -s, s,-s, -s, s, s, s, s, s, s, s,-s
];

const cubeIndices = [
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23
];

var t = 1/Math.sqrt(3);
const cubeNormals = [-t, -t, -t, t, -t, -t, t, t, -t, -t, t, -t,
    -t, -t, t, t, -t, t, t, t, t, -t, t, t,
    -t, -t, -t, -t, t, -t, -t, t, t, -t, -t, t,
    t, -t, -t, t, t, -t, t, t, t, t, -t, t,
    -t, -t, -t, -t, -t, t, t, -t, t, t, -t, -t,
    -t, t, -t, -t, t, t, t, t, t, t, t, -t
];

const cubeTextures = [
    0, 0, 0, 1, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1, 1, 0];

class CubeRenderNode extends SceneGraphNode {
    constructor(children) {
        super(children);
        this.renderSGNode = new RenderSGNode({
            position: cubeVertices,
            normal: cubeNormals,
            texture: cubeTextures,
            index: cubeIndices
        });
    }

    render(context) {
        this.renderSGNode.render(context);
        super.render(context);
    }
}