class TramNode extends SceneGraphNode {

    constructor(alphaOfFrontGlas) {
        super();

        //super(mat4.multiply(mat4.create(), initialPosition, glm.scale(2, 0.3, 0.3))); //the scaling here came from old code
        //super(initialPosition);
        this.doors = [];

        //render all components of the tram
        //all the dimensions of these components are relative to the tram node
        var ceiling = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(0, -0.27, 0), glm.scale(1, 0.1, 1)), [new CubeRenderNode()]);
        this.append(ceiling);

        var floor = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(0, +0.27, 0), glm.scale(1, 0.1, 1)), [new CubeRenderNode()]);
        this.append(floor);

        var back = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(-0.3, 0, 0), glm.scale(0.01, 1, 1)), [new CubeRenderNode()]);
        this.append(back);


        var front = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(0.3, 0, 0), glm.scale(0.01, 1, 1)));
        var frontGlass = new CubeRenderNode(); //new QuadRenderNode();
        //FIXME frontGlass.setAlphaValue(alphaOfFrontGlas);
        front.append(frontGlass);
        this.append(front);

        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 2; j++) {
                var cockpitSideTransformation = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(-0.285 + i * 0.1, 0, -0.27 + j * 0.54), glm.scale(0.05, 1, 0.1)), [new CubeRenderNode()]);
                this.append(cockpitSideTransformation);

                var cockpitSideGlassTransformation = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(-0.285 + i * 0.1 + 0.05, 0, -0.27 + j * 0.54), glm.scale(0.11, 1, 0.1)));
                var cockpitSideGlass = new CubeRenderNode();

                //FIXME cockpitSideGlass.setAlphaValue(i % 2 == 1 ? 0.3 : 0.1);
                cockpitSideGlassTransformation.append(cockpitSideGlass);
                var door = new MovingNode();
                door.append(cockpitSideGlassTransformation);
                this.append(door);

                if (j == 1 && i % 2 == 1) {
                    this.doors.push(door);
                }
            }
        }
    }

    openDoors() {
        this.doors.forEach(function (door) {
            door.moveTo([-0.07,0,0], 900);
        });
        /*
        if (this.doorsOpenIndex > 0.25) {
            this.doorsOpenIndex -= 0.01;
            this.doors.forEach(function (door) {
                door.setMatrix(mat4.multiply(mat4.create(), door.matrix, glm.translate(-0.01, 0, 0)));
            });
        }*/
    }

    closeDoors() {
        this.doors.forEach(function (door) {
            door.moveTo([0,0,0], 900);
        });
        /*
        if (this.doorsOpenIndex < 1) {
            this.doorsOpenIndex += 0.01;
            this.doors.forEach(function (door) {
                door.setMatrix(mat4.multiply(mat4.create(), door.matrix, glm.translate(0.01, 0, 0)));
            });
        }*/
    }
}

/**
 * A tram consists of multiple tram nodes
 */
class Tram extends SceneGraphNode {

    constructor() {
        super();
        this.tramNodes = [];
        this.movingNodes = [];
        for (var i = 0; i < 3; i++) {
            var alphaOfFrontGlas = i == 2 ? 0.2 : 1;

            var tramNode = new TramNode(alphaOfFrontGlas);
            var tramTransformationNode = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(i * 1.25, 0, 0), glm.scale(2, 0.3, 0.3)), tramNode);
            var movingNode = new MovingNode();
            movingNode.append(tramTransformationNode)

            this.tramNodes.push(tramNode);
            this.movingNodes.push(movingNode);
            super.append(movingNode);
            //new TramNode(glm.translate(i * 1.25, 0, 0), alphaOfFrontGlas));
        }
    }

    setSpeed(speed) {
        this.movingNodes.forEach(function (child) {
            child.setSpeed(speed);
        })
    }

    resetPosition() {
        this.movingNodes.forEach(function (child) {
            child.resetPosition();
        })
    }

    openDoors() {
        this.tramNodes.forEach(function (child) {
            child.openDoors();
        })
    }

    closeDoors() {
        this.tramNodes.forEach(function (child) {
            child.closeDoors();
        })
    }

    getPosition() {
        return this.movingNodes[0].getPosition();
    }

    /*
    getPosition() {
        return this.movingNodes[0].getXPosition();
    }
    */
}