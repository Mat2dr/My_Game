class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = config.gameObjects;
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = false;
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
             utils.withGrid(5.5) - cameraPerson.x,
             utils.withGrid(3.1) - cameraPerson.y,
            )
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
             utils.withGrid(5.5) - cameraPerson.x,
             utils.withGrid(3.1) - cameraPerson.y,
            )
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {

            let object = this.gameObjects[key];
            object.id = key;

            //TODO: Determine if the object should actually mount
            object.mount(this);
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;

        for (let i=0; i<events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })
            await eventHandler.init();
        }

        this.isCutscenePlaying = false;

        //Reset NPCs do their idle behavior
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
    }

    checkForActionCutscene() {
        const hero = this.gameObjects['hero'];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if (!this.isCutscenePlaying && match && match.talking.length) {
            this.startCutscene(match.talking[0].events)
        }
    }

    checkForFootstepCutscene() {
        const hero = this.gameObjects['hero'];
        const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
        if (!this.isCutscenePlaying && match) {
            this.startCutscene( match[0].events )
        }
    }

    addWall(x,y) {
        this.walls[`${x},${y}`] = true;
    }
    removeWall(x,y) {
        delete this.walls[`${x},${y}`];
    }
    moveWall(wasX,wasY, direction) {
        this.removeWall(wasX, wasY);
        const {x,y} = utils.nextPosition(wasX, wasY, direction);
        this.addWall(x,y);
    }
}

window.OverworldMaps = {
    Chambre: {
        lowerSrc: '/images/maps/chambre.png',
        upperSrc: '',
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(2),
                y: utils.withGrid(3),
            }),
            npcA: new Person({
                x: utils.withGrid(4),
                y: utils.withGrid(3),
                src: '/images/characters/people/npc1.png',
                /* behaviorLoop: [
                    { type: 'walk', direction: 'left' },
                    { type: 'stand', direction: 'up', time: 800 },
                    { type: 'walk', direction: 'down' },
                    { type: 'stand', direction: 'down', time: 300 },
                    { type: 'walk', direction: 'up' },
                    { type: 'walk', direction: 'right' },
                ], */
            }),
            npcB: new Person({
                x: utils.withGrid(0),
                y: utils.withGrid(4),
                src: '/images/characters/people/npc2.png',
                behaviorLoop: [
                    { type: 'stand', direction: 'left', time: 800 },
                    { type: 'stand', direction: 'up', time: 800 },
                    { type: 'stand', direction: 'right', time: 1200 },
                    { type: 'stand', direction: 'down', time: 300 },
                ],
                talking: [
                    {
                        events: [
                            {type: 'textMessage', text: "oh oh ohhh", faceHero: "npcB" },
                            {type: 'textMessage', text: "i'm busy" }
                        ]
                    }
                ]
            })
        },
         walls: {
            //lit
            [utils.asGridCoords(0,2)]: true,
            [utils.asGridCoords(0,3)]: true,
            //wall left
            [utils.asGridCoords(-1,4)]: true,
            //wall bottom
            [utils.asGridCoords(0,5)]: true,
            [utils.asGridCoords(1,5)]: true,
            [utils.asGridCoords(2,6)]: true,
            [utils.asGridCoords(3,5)]: true,
            [utils.asGridCoords(4,5)]: true,
            //wall right
            [utils.asGridCoords(5,4)]: true,
            [utils.asGridCoords(5,3)]: true,
            [utils.asGridCoords(5,2)]: true,
            //chair
            [utils.asGridCoords(4,4)]: true,
            //wall top
            [utils.asGridCoords(4,2)]: true,
            [utils.asGridCoords(3,2)]: true,
            [utils.asGridCoords(2,2)]: true,
            [utils.asGridCoords(1,1)]: true,
            [utils.asGridCoords(0,1)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoords(2,5)]: [
                {
                    events: [
                        /* {who: "npcA", type: 'walk', direction: 'left' },
                        {who: "npcA", type: 'walk', direction: 'down' },
                        {who: "npcA", type: 'walk', direction: 'left' },
                        {who: "npcA", type: 'stand', direction: 'down'},
                        {who: "hero", type: 'stand', direction: 'up', time: 800 },
                        {type: 'textMessage', text: "No you can't go out now !" },
                        {who: "npcA", type: 'walk', direction: 'right' },
                        {who: "npcA", type: 'walk', direction: 'up' },
                        {who: "npcA", type: 'walk', direction: 'right' },
                        {who: "hero", type: 'walk', direction: 'up' },  */
                    ]
                }
            ],
            [utils.asGridCoords(2,5)]: [
                {
                    events: [
                        {type: 'changeMap', map: 'DemoRoom' },
                    ]
                }
            ]
        }
    },
    DemoRoom: {
        lowerSrc: '/images/maps/DemoLower.png',
        upperSrc: '/images/maps/DemoUpper.png',
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
            }),
            npc4: new Person({
                x: utils.withGrid(3),
                y: utils.withGrid(4),
                src: '/images/characters/people/npc4.png',
                talking: [
                    {
                        events: [
                            {type: 'textMessage', text: "You made it !", faceHero: "npc4" },
                        ]
                    }
                ]
            }),
        },
        walls: {
            //Walls left
            [utils.asGridCoords(0,0)]: true,
            [utils.asGridCoords(0,1)]: true,
            [utils.asGridCoords(0,2)]: true,
            [utils.asGridCoords(0,3)]: true,
            [utils.asGridCoords(0,4)]: true,
            [utils.asGridCoords(0,5)]: true,
            [utils.asGridCoords(0,6)]: true,
            [utils.asGridCoords(0,7)]: true,
            [utils.asGridCoords(0,8)]: true,
            [utils.asGridCoords(0,9)]: true,
            //Walls top
            [utils.asGridCoords(0,0)]: true,
            [utils.asGridCoords(1,3)]: true,
            [utils.asGridCoords(2,3)]: true,
            [utils.asGridCoords(3,3)]: true,
            [utils.asGridCoords(4,3)]: true,
            [utils.asGridCoords(5,3)]: true,
            [utils.asGridCoords(6,4)]: true,
            [utils.asGridCoords(7,3)]: true,
            [utils.asGridCoords(8,4)]: true,
            [utils.asGridCoords(9,3)]: true,
            [utils.asGridCoords(10,3)]: true,
            //walls left
            [utils.asGridCoords(11,4)]: true,
            [utils.asGridCoords(11,5)]: true,
            [utils.asGridCoords(11,6)]: true,
            [utils.asGridCoords(11,7)]: true,
            [utils.asGridCoords(11,8)]: true,
            [utils.asGridCoords(11,9)]: true,
            //walls bottom
            [utils.asGridCoords(10,10)]: true,
            [utils.asGridCoords(9,10)]: true,
            [utils.asGridCoords(8,10)]: true,
            [utils.asGridCoords(7,10)]: true,
            [utils.asGridCoords(6,10)]: true,
            [utils.asGridCoords(5,11)]: true,
            [utils.asGridCoords(4,10)]: true,
            [utils.asGridCoords(3,10)]: true,
            [utils.asGridCoords(2,10)]: true,
            [utils.asGridCoords(1,10)]: true,
            //Table
            [utils.asGridCoords(7,6)]: true,
            [utils.asGridCoords(8,6)]: true,
            [utils.asGridCoords(7,7)]: true,
            [utils.asGridCoords(8,7)]: true,
        }
    },
}