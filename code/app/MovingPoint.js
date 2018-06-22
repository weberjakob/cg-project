const slowDownFactor = 0.0001; //is to set speed with reasonable values eg. 1-10

class MovingPoint {

    constructor(initialPosition) {
        if (initialPosition == null) {
            this.initialPosition = vec3.create();
        }
        else {
            this.initialPosition = initialPosition;
        }
        this.resetPosition();//sets offset and timeSinceLastSpeedSet to initial value
    }

    /**
     * sets the movement into the given direction
     * this movement stops when setSpeed/moveTo/moveToRelativPosition/setPosition/resetPosition is called
     */
    setSpeed(speed) {
        vec3.add(this.offset, this.offset, vec3.scale(vec3.create(), this.speed, (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet)));
        this.timeSinceLastSpeedSet = projectTimeInMilliSeconds;
        vec3.scale(this.speed, speed, slowDownFactor);
    }

    /**
     * Move to global position within the given amount of time (in milliseconds)
     */
    moveTo(position, timeToGetThereInMilliseconds) {
        var difference = vec3.subtract(vec3.create(), position, this.getPosition());
        var speed = vec3.scale(vec3.create(), difference, 1 / (timeToGetThereInMilliseconds * slowDownFactor));
        this.timeToStopMoving = projectTimeInMilliSeconds + timeToGetThereInMilliseconds;
        this.isMovingToSpecificPosition = true;
        this.setSpeed(speed);
    }

    /**
     * Move to a position relative to the current position of the node within the given amount of time
     */
    moveToRelativPosition(position, timeToGetThereInMilliseconds) {
        this.moveTo(vec3.add(vec3.create(), position, this.getPosition()), timeToGetThereInMilliseconds);
    }

    /**
     * returns the position as vec3
     */
    getPosition() {
        return vec3.add(
            vec3.create(),
            this.offset,
            vec3.scale(vec3.create(), this.speed, (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet)));
    }

    /**
     * if moveTo or moveToRelativPosition is called, this method has to be called every frame to ensure the movement stops when the position is reached
     */
    stopIfMoveToPositionReached() {
        if(this.isMovingToSpecificPosition && this.timeToStopMoving < projectTimeInMilliSeconds) {
            this.setSpeed([0,0,0]);
            this.isMovingToSpecificPosition = false;
        }
    }

    /**
     * directly set the position
     */
    setPosition(position) {
        this.initialPosition = position;
        this.resetPosition();
    }

    /**
     * reset the position resets the position to the last position where setPosition was set or it's initial position
     */
    resetPosition() {
        this.offset = vec3.create();//[0,0,0];
        vec3.copy(this.offset, this.initialPosition);
        this.speed = vec3.create();//(0,0,0);
        this.timeSinceLastSpeedSet = projectTimeInMilliSeconds;
        this.isMovingToSpecificPosition = false;
        this.timeToStopMoving = 0;
    }
}