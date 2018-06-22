class Bridge extends SceneGraphNode {
    constructor() {
        super();
        var floor = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(1.2, 0, 0.25), glm.scale(16, 0.1, 1)), [new CubeRenderNode()]);
        this.append(floor);

        for (var rightSide = 0; rightSide < 2; rightSide++) {
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 8; j++) {
                    var columnMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.translate(-2 + i * 1.65, 0.05, rightSide * 0.5));
                    columnMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.rotateZ(-90 + (25.7 * j)));

                    var balkMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.rotateZ(12.5));

                    columnMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.translate(0, 0.45, 0));
                    var smallBalkMatrix = mat4.multiply(mat4.create(), balkMatrix, glm.translate(0, 0.45, 0));
                    balkMatrix = mat4.multiply(mat4.create(), balkMatrix, glm.translate(0, 0.9, 0));

                    columnMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.scale(0.05, 1.5, 0.05));
                    balkMatrix = mat4.multiply(mat4.create(), balkMatrix, glm.scale(0.7, 0.05, 0.05));
                    smallBalkMatrix = mat4.multiply(mat4.create(), smallBalkMatrix, glm.scale(0.4, 0.05, 0.05));

                    var column = new TransformationSGNode(columnMatrix, [new CubeRenderNode()]);
                    this.append(column);

                    if (j >= 0 && j < 7) {
                        var balk = new TransformationSGNode(balkMatrix, [new CubeRenderNode()]);
                        var smallBalk = new TransformationSGNode(smallBalkMatrix, [new CubeRenderNode()]);

                        this.append(balk);
                        this.append(smallBalk);
                    } //not append the last balk

                    //append crossBalk only from one side
                    if (rightSide == 0 && j >= 1 && j < 7) {
                        var crossBalkMatrix = mat4.multiply(mat4.create(), columnMatrix, glm.translate(0, 0.32, 5));
                        crossBalkMatrix = mat4.multiply(mat4.create(), crossBalkMatrix, glm.scale(1, 0.01, 18));
                        var crossBalk = new TransformationSGNode(crossBalkMatrix, [new CubeRenderNode()]);
                        this.append(crossBalk);
                    }
                }
            }
        }
    }
}