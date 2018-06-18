var quadVertices = new Float32Array([
    -1.0, 0, -1.0,
    1.0, 0,-1.0,
    -1.0, 0,1.0,
    -1.0,0, 1.0,
    1.0, 0,-1.0,
    1.0,0, 1.0]);
var quadTextures = new Float32Array([
    -1.0,-1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0]);

var quadNormals = new Float32Array([
    0,1,0,
    0,1,0,
    0,1,0,
    0,1,0,
    0,1,0,
    0,1,0]);

var quadIndices = new Float32Array([0,1,2,3,4,5,6]);

class QuadRenderNode extends SceneGraphNode {

    constructor(children) {
        super(children);
        this.renderSGNode = new RenderSGNode({
            position:quadVertices,
            normal: quadNormals,
            texture: quadTextures,
            indices: quadIndices
        });
    }

    render(context) {
        this.renderSGNode.render(context);
        super.render(context);
    }
}