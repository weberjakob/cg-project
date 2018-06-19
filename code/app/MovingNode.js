const slowDownFactor = 0.0001; //is to set speed with reasonable values eg. 1-10

class MovingNode extends SceneGraphNode {

    constructor(initialPosition) {
        super();
        if (initialPosition == null) {
            this.initialPosition = mat4.create();
        }
        else {
            this.initialPosition = initialPosition;
        }
        this.speed = vec3.create();
        this.resetPosition();//sets offset and timeSinceLastSpeedSet to initial value
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
        //this.offset += this.speed * (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet);
        vec3.add(this.offset, this.offset, vec3.scale(vec3.create(), this.speed, (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet)));
        this.timeSinceLastSpeedSet = projectTimeInMilliSeconds;
        vec3.scale(this.speed, speed, slowDownFactor);
        //this.speed = speed;
    }

    getPositionMatrix() {
        return mat4.multiply(mat4.create(), glm.translate(this.getPosition()[0], this.getPosition()[1], this.getPosition()[2]), this.initialPosition);
    }

    getPosition() {
        //return (this.offset + (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet) * this.speed) / 8000;
        return vec3.add(
                    vec3.create(),
                    this.offset,
                    vec3.scale(vec3.create(), this.speed, (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet)));
    }

    resetPosition() {
        this.offset = vec3.create();
        this.speed = [0,0,0];
        this.timeSinceLastSpeedSet = projectTimeInMilliSeconds;
    }
}