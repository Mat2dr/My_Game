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
             utils.withGrid(5) - cameraPerson.x,
             utils.withGrid(2.1) - cameraPerson.y,
            )
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
             utils.withGrid(5) - cameraPerson.x,
             utils.withGrid(2.1) - cameraPerson.y,
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
    House: {
        lowerSrc: '/images/maps/chambre.png',
        upperSrc: '',
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(1),
                y: utils.withGrid(2),
            }),
            cat: new Person({
                x: utils.withGrid(4),
                y: utils.withGrid(3),
                src: '/images/characters/animals/cat.png',
                 behaviorLoop: [
                    { type: 'stand', direction: 'left', time: 800 },
                    { type: 'stand', direction: 'up', time: 800 },
                    { type: 'stand', direction: 'right', time: 1200 },
                    { type: 'stand', direction: 'down', time: 300 },
                ],
                talking: [
                    {
                        events: [
                            {type: 'textMessage', text: "Miaou Miaaaouuu MIAOU !", faceHero: "cat" },
                        ]
                    }
                ]
            }),
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
                        {type: 'changeMap', map: 'HouseGarden' },
                    ]
                }
            ],
        }
    },
    HouseGarden: {
        lowerSrc: '/images/maps/samplemap.png',
        upperSrc: '',
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(13),
                y: utils.withGrid(15),
            }),
            npcB: new Person({
                x: utils.withGrid(16),
                y: utils.withGrid(18),
                src: '/images/characters/people/npc2.png',
                behaviorLoop: [
                    { type: 'stand', direction: 'left', time: 400 },
                    { type: 'stand', direction: 'up', time: 500 },
                    { type: 'stand', direction: 'right', time: 200 },
                    { type: 'stand', direction: 'down', time: 300 },
                ],
                talking: [
                    {
                        events: [
                            {type: 'textMessage', text: "Enfin te voilà !", faceHero: "npcB" },
                            {type: 'textMessage', text: "Je voulais te dire...", faceHero: "npcB" },
                            {type: 'textMessage', text: "J'ai perdu mes clés !", faceHero: "npcB" },
                        ]
                    }
                ]
            }),
        },
        walls: {
            //House col row
            [utils.asGridCoords(11,14)]: true,
            [utils.asGridCoords(12,14)]: true,
            [utils.asGridCoords(13,14)]: true,
            [utils.asGridCoords(14,14)]: true,
            [utils.asGridCoords(15,14)]: true,

            [utils.asGridCoords(11,11)]: true,
            [utils.asGridCoords(11,12)]: true,
            [utils.asGridCoords(11,13)]: true,

            [utils.asGridCoords(11,11)]: true,
            [utils.asGridCoords(12,11)]: true,
            [utils.asGridCoords(13,11)]: true,
            [utils.asGridCoords(14,11)]: true,
            [utils.asGridCoords(15,11)]: true,

            [utils.asGridCoords(15,12)]: true,
            [utils.asGridCoords(15,13)]: true,
            //post col row
            [utils.asGridCoords(16,14)]: true,
            //top map col row
            [utils.asGridCoords(16,11)]: true,
            [utils.asGridCoords(17,11)]: true,
            [utils.asGridCoords(18,11)]: true,
            //right map col row
            [utils.asGridCoords(19,12)]: true,
            [utils.asGridCoords(19,13)]: true,
            [utils.asGridCoords(20,14)]: true,
            [utils.asGridCoords(19,15)]: true,
            [utils.asGridCoords(19,16)]: true,
            [utils.asGridCoords(20,17)]: true,
            [utils.asGridCoords(20,18)]: true,
            [utils.asGridCoords(19,19)]: true,
            [utils.asGridCoords(19,20)]: true,
            //bottom map
            [utils.asGridCoords(18,21)]: true,
            [utils.asGridCoords(17,21)]: true,
            [utils.asGridCoords(16,21)]: true,
            [utils.asGridCoords(15,21)]: true,
            [utils.asGridCoords(14,21)]: true,
            [utils.asGridCoords(13,21)]: true,
            [utils.asGridCoords(12,21)]: true,
            [utils.asGridCoords(11,21)]: true,
            [utils.asGridCoords(10,21)]: true,
            [utils.asGridCoords(9,21)]: true,
            [utils.asGridCoords(8,21)]: true,
            [utils.asGridCoords(7,21)]: true,
            //left map col row
            [utils.asGridCoords(6,20)]: true,
            [utils.asGridCoords(6,19)]: true,
            [utils.asGridCoords(5,18)]: true,
            [utils.asGridCoords(5,17)]: true,
            [utils.asGridCoords(5,16)]: true,
            [utils.asGridCoords(5,15)]: true,
            [utils.asGridCoords(5,14)]: true,
            [utils.asGridCoords(5,13)]: true,
            [utils.asGridCoords(5,12)]: true,
            [utils.asGridCoords(5,11)]: true,
            //top map
            [utils.asGridCoords(6,11)]: true,
            [utils.asGridCoords(7,11)]: true,
            [utils.asGridCoords(8,11)]: true,
            [utils.asGridCoords(9,11)]: true,
            [utils.asGridCoords(10,11)]: true,
            //epouv

            //barriere
            [utils.asGridCoords(10,12)]: true,
            [utils.asGridCoords(10,13)]: true,
            [utils.asGridCoords(10,14)]: true,
            [utils.asGridCoords(10,15)]: true,

        },
        cutsceneSpaces: {
            [utils.asGridCoords(13,15)]: [
                {
                    events: [
                        {type: 'changeMap', map: 'House' },
                    ]
                }
            ]
        }
    },
}