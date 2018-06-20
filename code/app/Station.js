class Station extends SceneGraphNode {
    constructor(stationNameTexture, stopsignTexture) {
        super();
        var platform = new TransformationSGNode(mat4.multiply(mat4.create(), mat4.create(), glm.scale(7, 0.1, 1.2)), new CubeRenderNode());
        this.append(platform);

        var column = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(1.5, 0.1, -0.2), glm.scale(0.02, 0.5, 0.02)), new CubeRenderNode());
        this.append(column);

        var display = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(1.5, 0.2 * 1.5, -0.2), glm.scale(0.002, 0.2, 0.2)), new CubeRenderNode());
        var stopsignTextureNode = new AdvancedTextureSGNode(stopsignTexture, [display]);
        this.append(stopsignTextureNode);

        //set Station Name:
        var billboard1 = new RotatingImage(1);
        //billboard1.setPosition(0, 2, -2);
        var textureBillboardNode = new AdvancedTextureSGNode(stationNameTexture, [billboard1]);
        var billboardPos = new TransformationSGNode(glm.translate(0, 2, 0), textureBillboardNode);
        this.append(billboardPos);
    }

}