class BillboardNode extends TransformationSGNode {

    constructor(xScale) {
        super();
        this.alpha = 1;
        var quadRenderNode = new QuadRenderNode();
        var scaleNode = new TransformationSGNode(glm.scale(xScale, 1, 1), quadRenderNode);
        this.append(scaleNode);
        this.absPosition = [1, 0, 1];
    }

    render(context) {
        //this.computeLightPosition(context);
        var dir = vec3.create();
        vec3.sub(dir, eye, this.absPosition);
        vec3.scale(dir, dir, 1 / vec3.length(dir));
        var dirGround = [dir[0], 0, dir[2]];
        var stdVec = [1, 0, 0];

        var xAngle = vec3.angle(dirGround, stdVec);
        var yAngle = vec3.angle(dir, dirGround);
        xAngle = convertRadiansToDegree(xAngle);
        yAngle = convertRadiansToDegree(yAngle);
        //cos(alpha)=cos(360-alpha): xAngle value is [0;180].
        // Depending on the x-axis difference we should use xAngle or (360-xAngle) [+90 degrees offset]
        if (eye[2] < this.absPosition[2]) {
            xAngle = xAngle + 90;
        } else {
            xAngle = 90 - xAngle;
        }
        //cos(alpha)=cos(360-alpha): yAngle value is [0;180].
        // Depending on the y-axis difference we should use yAngle or (360-yAngle)
        if (eye[1] < this.absPosition[1]) {
            yAngle = yAngle + 90;
        } else {
            yAngle = 90 - yAngle;
        }

        this.matrix = mat4.multiply(this.matrix, glm.rotateY(xAngle), glm.rotateX(yAngle));

        super.render(context);
    }

    setPosition(x, y, z) {
        this.absPosition = [x, y, z];
    }

    computeLightPosition(context) {
        //transform with the current model view matrix
        const modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
        const position = vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), modelViewMatrix);
        this.absPosition = position;
    }

}