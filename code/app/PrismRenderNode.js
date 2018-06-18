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
    -t, t, -t, -t, t, t, t, t, t, t, t, -t]);

prismTextures = new Float32Array([
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1,
    -1, -1, -1, 1, 1, -1, 1, 1]);

class PrismRenderNode extends SceneGraphNode {

    constructor(children) {
        super(children);
        this.renderSGNode = new RenderSGNode({
            position: prismVertices,
            normal: prismNormals,
            texture: prismTextures,
            indices: prismIndices
        });
    }

    render(context) {
        this.renderSGNode.render(context);
        super.render(context);
    }


    /*
    constructor(colorBuffer) {
        super();
        this.alpha = 1; //initialy the cube is not transparent at all
        if (colorBuffer == null) {
            this.colorBuffer = cubeColorBuffer;
        }
        else this.colorBuffer = colorBuffer;
    }

    render(context) {

        //setting the model view and projection matrix on shader
        setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

        var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, prismVertexBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLocation);

        gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), this.alpha);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

        //render children
        super.render(context);
    }*/
}