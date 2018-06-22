var pScale = 0.5; //scale of the top of the prism
var s = 0.3;
var prismVertices = new Float32Array([
    -s, -s, -s, s, -s, -s, s * pScale, s, -s, -s * pScale, s, -s,
    -s, -s, s, s, -s, s, s * pScale, s, s, -s * pScale, s, s,
    -s, -s, -s, -s * pScale, s, -s, -s * pScale, s, s, -s, -s, s,
    s, -s, -s, s * pScale, s, -s, s * pScale, s, s, s, -s, s,
    -s, -s, -s, -s, -s, s, s, -s, s, s, -s, -s,
    -s * pScale, s, -s, -s * pScale, s, s, s * pScale, s, s, s * pScale, s, -s,
]);

var prismIndices =  new Float32Array([
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23
]);

var t = 1/Math.sqrt(3);
prismNormals = new Float32Array([-t, -t, -t, t, -t, -t, t, t, -t, -t, t, -t,
    -t, -t, t, t, -t, t, t, t, t, -t, t, t,
    -t, -t, -t, -t, t, -t, -t, t, t, -t, -t, t,
    t, -t, -t, t, t, -t, t, t, t, t, -t, t,
    -t, -t, -t, -t, -t, t, t, -t, t, t, -t, -t,
    -t, t, -t, -t, t, t, t, t, t, t, t, -t
]);

prismTextures = new Float32Array([
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1
]);

class PrismRenderNode extends SceneGraphNode {

    constructor(children) {
        super(children);
        this.renderSGNode = new RenderSGNode({
            position: prismVertices,
            normal: prismNormals,
            texture: prismTextures,
            index: prismIndices
        });
    }

    render(context) {
        this.renderSGNode.render(context);
        super.render(context);
    }
}