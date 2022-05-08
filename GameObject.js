class GameObject {
    constructor(config) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || "down";
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || 'images/characters/people/my-hero.png',
        });

        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        this.talking = config.talking || [];
    }

    mount(map) {
        this.isMounted = true;
        map.addWall(this.x, this.y);

        //If we have a behavior, kick off after a short delay
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }

    update() {
    }

    async doBehaviorEvent(map) {
        //don't do anything if there is a cutscene or don't have anything config
        if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
            return;
        }

        //setting up our event with relevant info
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;

        //create an event instance out of our next event config
        const eventHandler = new OverworldEvent({ map, event: eventConfig });
        await eventHandler.init()

        //setting the next event to fire
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0
        }

        //Do it again
        this.doBehaviorEvent(map);
    }
}