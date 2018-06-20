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

    setSpeed(speed) {
        //this.offset += this.speed * (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet);
        vec3.add(this.offset, this.offset, vec3.scale(vec3.create(), this.speed, (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet)));
        this.timeSinceLastSpeedSet = projectTimeInMilliSeconds;
        vec3.scale(this.speed, speed, slowDownFactor);
    }

    moveTo(position, timeToGetThereInMilliseconds) {
        var difference = vec3.subtract(vec3.create(), position, this.getPosition());
        var speed = vec3.scale(vec3.create(), difference, 1 / (timeToGetThereInMilliseconds * slowDownFactor));
        this.timeToStopMoving = projectTimeInMilliSeconds + timeToGetThereInMilliseconds;
        this.isMovingToSpecificPosition = true;
        this.setSpeed(speed);
    }

    getPosition() {
        //return (this.offset + (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet) * this.speed) / 8000;
        return vec3.add(
            vec3.create(),
            this.offset,
            vec3.scale(vec3.create(), this.speed, (projectTimeInMilliSeconds - this.timeSinceLastSpeedSet)));
    }

    stopIfMoveToPositionReached() {
        if(this.isMovingToSpecificPosition && this.timeToStopMoving < projectTimeInMilliSeconds) {
            this.setSpeed([0,0,0]);
            this.isMovingToSpecificPosition = false;
        }
    }

    setPosition(position) {
        this.initialPosition = position;
        this.resetPosition();
    }

    resetPosition() {
        this.offset = vec3.create();//[0,0,0];
        vec3.copy(this.offset, this.initialPosition);
        this.speed = vec3.create();//(0,0,0);
        this.timeSinceLastSpeedSet = projectTimeInMilliSeconds;
        this.isMovingToSpecificPosition = false;
        this.timeToStopMoving = 0;
    }
}