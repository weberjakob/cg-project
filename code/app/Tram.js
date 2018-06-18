class TramNode extends SceneGraphNode {

    constructor(initialPosition, alphaOfFrontGlas) {
        super();
        if (initialPosition == null) {
            this.initialPosition = mat4.create();
        }
        else {
            this.initialPosition = initialPosition;
        }
        mat4.multiply(this.initialPosition, this.initialPosition, glm.scale(2, 0.3, 0.3));
        this.speed = 0;
        this.resetPosition();//sets offset and timeSinceLastSpeedSet to initial value
        this.doors = [];
        this.doorsOpenIndex = 1;

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
                this.append(cockpitSideGlassTransformation);

                if (j == 1 && i % 2 == 1) {
                    this.doors.push(cockpitSideGlassTransformation);
                }
            }
        }
    }

    render(context) {
        //backup previous one
        var previous = context.sceneMatrix;

        //set current world matrix by multiplying it
        //mat4.multiply(this.matrix, this.matrix, glm.translate(this.speed / 1000, 0, 0));
        this.matrix = this.getPositionMatrix();
        //mat4.multiply(this.matrix, mat4.create(), glm.translate((this.offset + (projectTimeInMilliSeconds-this.timeSinceLastSpeedSet) * this.speed) / 1000, 0, 0));

        if (previous === null) {
            context.sceneMatrix = mat4.clone(this.matrix);
        }
        else {
            //context.sceneMatrix = mat4.multiply(mat4.create(), previous, mat4.multiply(mat4.create(), this.matrix, glm.translate(projectTimeInMilliSeconds * this.speed/10000, 0, 0)));
            context.sceneMatrix = mat4.multiply(mat4.create(), previous, this.matrix);
        }
        //render children
        super.render(context);

        //restore backup
        context.sceneMatrix = previous;
        //this.lastRenderedTime = projectTimeInMilliSeconds;
    }

    setSpeed(speed) {
        this.offset += this.speed * (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet);
        this.timeSinceLastSpeedSet = projectTimeInMilliSeconds;
        this.speed = speed;
    }

    getPositionMatrix() {
        return mat4.multiply(mat4.create(), glm.translate(this.getXPosition(), 0, 0), this.initialPosition);
    }

    getXPosition() {
        return (this.offset + (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet) * this.speed) / 8000;
    }

    resetPosition() {
        this.offset = 0;
        this.timeSinceLastSpeedSet = projectTimeInMilliSeconds;
    }

    openDoors() {
        if (this.doorsOpenIndex > 0.25) {
            this.doorsOpenIndex -= 0.01;
            this.doors.forEach(function (door) {
                door.setMatrix(mat4.multiply(mat4.create(), door.matrix, glm.translate(-0.01, 0, 0)));
            });
        }
    }

    closeDoors() {
        if (this.doorsOpenIndex < 1) {
            this.doorsOpenIndex += 0.01;
            this.doors.forEach(function (door) {
                door.setMatrix(mat4.multiply(mat4.create(), door.matrix, glm.translate(0.01, 0, 0)));
            });
        }
    }
}

/**
 * A tram consists of multiple tram nodes
 */
class Tram extends SceneGraphNode {

    constructor() {
        super();
        for (var i = 0; i < 3; i++) {
            var alphaOfFrontGlas = i == 2 ? 0.2 : 1;
            super.append(new TramNode(glm.translate(i * 1.25, 0, 0), alphaOfFrontGlas));
        }
    }

    setSpeed(speed) {
        this.children.forEach(function (child) {
            child.setSpeed(speed);
        })
    }

    resetPosition() {
        this.children.forEach(function (child) {
            child.resetPosition();
        })
    }

    openDoors() {
        this.children.forEach(function (child) {
            child.openDoors();
        })
    }

    closeDoors() {
        this.children.forEach(function (child) {
            child.closeDoors();
        })
    }

    getPosition() {
        return this.children[0].getPosition();
    }

    getXPosition() {
        return this.children[0].getXPosition();
    }
}