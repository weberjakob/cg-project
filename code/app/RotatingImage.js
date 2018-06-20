class RotatingImage extends TransformationSGNode {
    constructor(xScale) {
        super();
        var quadRenderNode = new QuadRenderNode();
        var scaleNode = new TransformationSGNode(mat4.multiply(mat4.create(), glm.rotateX(90), glm.scale(xScale, 1, 1)), quadRenderNode);
        this.append(scaleNode);
    }

    render(context) {
        this.matrix = mat4.multiply(this.matrix, this.matrix, glm.rotateY(0.3));
        super.render(context);
    }
}