class PersonNode extends SceneGraphNode {
    constructor(initialPosition) {
        super();
        this.rigidBodyTransformationMatrix = mat4.create();

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
}
