class PersonNode extends SceneGraphNode {
    constructor(initialPosition) {
        super();

        //super(mat4.multiply(mat4.create(), initialPosition, glm.scale(7, 7, 7)));
        /*this.turned = false;
        this.speed = 0;
        this.legOffset = 0;*/
        this.rigidBodyTransformationMatrix = mat4.create();
        /*
        if (initialPosition == null) {
            this.initialPosition = glm.translate(0, 0, 0);
        }
        else {
            this.initialPosition = initialPosition;
        }

        this.resetPosition();
        */
        var rigidBodyNode = new TransformationSGNode(this.rigidBodyTransformationMatrix);
        var body = new TransformationSGNode(glm.scale(0.01, 0.01, 0.01));
        var bodyTrans = new TransformationSGNode(glm.scale(0.6, 1, 0.4));

        bodyTrans.append(new CubeRenderNode());
        body.append(bodyTrans);

        var head = new TransformationSGNode(mat4.multiply(mat4.create(), glm.scale(0.2, 0.2, 0.2), glm.translate(0, 2, 0)));
        head.append(new CubeRenderNode());
        body.append(head);
        var leftleg = new TransformationSGNode(mat4.multiply(mat4.create(), glm.scale(0.2, 1, 0.2), glm.translate(0.4, -0.5, 0)));
        var rightleg = new TransformationSGNode(mat4.multiply(mat4.create(), glm.scale(0.2, 1, 0.2), glm.translate(-0.4, -0.5, 0)));
        leftleg.append(new CubeRenderNode());
        rightleg.append(new CubeRenderNode());

        body.append(leftleg);
        body.append(rightleg);
        var leftarm = new TransformationSGNode(mat4.multiply(mat4.create(), glm.scale(0.4, 0.1, 0.1), glm.translate(0.7, 0, 0)));
        var rightarm = new TransformationSGNode(mat4.multiply(mat4.create(), glm.scale(0.4, 0.1, 0.1), glm.translate(-0.7, 0, 0)));
        leftarm.append(new CubeRenderNode());
        rightarm.append(new CubeRenderNode());
        body.append(leftarm);
        body.append(rightarm);
        rigidBodyNode.append(body);
        this.append(rigidBodyNode);

    }

    /*
    rotateAndTranslate(a, b, c) {
        this.resetPosition();
        mat4.multiply(this.rigidBodyTransformationMatrix, glm.rotateY(-90), glm.translate(a, b, c));
        mat4.multiply(this.matrix, this.matrix, this.rigidBodyTransformationMatrix);
    }*/
/*
    closeDoors() {
        if (!this.turned) {

            this.initialPosition = mat4.multiply(mat4.create(), glm.rotateY(-90), glm.translate(1, 1, 1));
            this.resetPosition();
            this.turned = true;
        }
    }
    */
/*
    setSpeed(speed) {
        this.speed = speed;
    }

    resetPosition() {
        this.matrix = this.initialPosition;
        this.matrix = mat4.multiply(mat4.create(), this.matrix, glm.translate(0, 0, 0));
        this.matrix = mat4.multiply(mat4.create(), this.matrix, glm.scale(7, 7, 7));
    }

    render(context) {
        //backup previous one
        var previous = context.sceneMatrix;

        //set current world matrix by multiplying it)
        mat4.multiply(this.matrix, this.matrix, glm.translate(0, 0, -this.speed / 3500));

        if (previous === null) {
            context.sceneMatrix = mat4.clone(this.matrix);
        }
        else {
            //context.sceneMatrix = mat4.multiply(mat4.create(), previous, mat4.multiply(mat4.create(), this.matrix, glm.translate(projectTimeInMilliSeconds * this.speed/10000, 0, 0)));
            context.sceneMatrix = mat4.multiply(mat4.create(), previous, this.matrix);
        }

        super.render(context);
        context.sceneMatrix = previous;
    }
*/
}
