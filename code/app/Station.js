class Station extends SceneGraphNode {
    constructor(stationNameTexture, stopsignTexture) {
        super();
        var platform = new TransformationSGNode(mat4.multiply(mat4.create(), mat4.create(), glm.scale(7, 0.1, 1.2)), new CubeRenderNode());
        this.append(platform);

        var column = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(1.5, 0.1, -0.2), glm.scale(0.02, 0.5, 0.02)), new CubeRenderNode());
        this.append(column);

        var display = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(1.5, 0.2 * 1.5, -0.2), glm.scale(0.002, 0.2, 0.2)), new CubeRenderNode());
        var stopsignTextureNode = new AdvancedTextureSGNode(stopsignTexture, [display]);
        var stopsignMaterialNode = new MaterialSGNode(stopsignTextureNode);
        stopsignMaterialNode.diffuse = [0.3, 0.3, 0.3, 1];
        stopsignMaterialNode.specular = [0.2, 0.2, 0.2, 1];
        stopsignMaterialNode.shininess = 1;
        this.append(stopsignMaterialNode);

        //set Station Name:
        var billboard1 = new RotatingImage(1);
        //billboard1.setPosition(0, 2, -2);
        var textureBillboardNode = new AdvancedTextureSGNode(stationNameTexture, [billboard1]);
        var materialBillboardNode = new MaterialSGNode(textureBillboardNode);
        materialBillboardNode.ambient=[0,0,0,0];
        materialBillboardNode.diffuse = [0,0,0,0];
        materialBillboardNode.specular = [0,0,0,0];
        materialBillboardNode.emission = [0,0,0,0];
        materialBillboardNode.shininess=0,1;
        var billboardPos = new TransformationSGNode(glm.translate(0, 2, 0), materialBillboardNode);
        this.append(billboardPos);
    }

}