//const slowDownFactor = 0.0001; //is to set speed with reasonable values eg. 1-10

class MovingNode extends SceneGraphNode {

    constructor(initialPosition) {
        super();
        if (initialPosition == null) {
            initialPosition = vec3.create();
        }
        this.centerPosition = new MovingPoint(initialPosition);
    }

    render(context) {
        //backup previous one
        var previous = context.sceneMatrix;

        this.centerPosition.stopIfMoveToPositionReached();
        this.matrix = this.getPositionMatrix();

        if (previous === null) {
            context.sceneMatrix = mat4.clone(this.matrix);
        }
        else {
            context.sceneMatrix = mat4.multiply(mat4.create(), previous, this.matrix);
        }
        //render children
        super.render(context);

        //restore backup
        context.sceneMatrix = previous;
    }

    setSpeed(speed) {
        this.centerPosition.setSpeed(speed);
    }

    moveTo(position, timeToGetThereInMilliseconds) {
        this.centerPosition.moveTo(position, timeToGetThereInMilliseconds);
    }

    moveToRelativPosition(position, timeToGetThereInMilliseconds) {
        this.centerPosition.moveToRelativPosition(position, timeToGetThereInMilliseconds);
    }

    getPositionMatrix() {
        return mat4.fromTranslation(mat4.create(), this.getPosition());
    }

    getPosition() {
        return this.centerPosition.getPosition();
    }

    setPosition(position) {
        this.centerPosition.setPosition(position);
    }

    resetPosition() {
        this.centerPosition.resetPosition();
    }
}