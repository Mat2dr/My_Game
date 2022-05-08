class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext('2d');
        this.map = null;
    }

    startGameLoop() {
        const step = () => {
            //Clear the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            //Establish the camera person
            const cameraPerson = this.map.gameObjects.hero;

            //update all objects
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                })
            })

            //Draw lower layer
            this.map.drawLowerImage(this.ctx, cameraPerson);

            //Draw GameObjects layer
            Object.values(this.map.gameObjects).sort((a,b) => {
                return a.y - b.y;
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson)
            })

            //Draw Uper layer
            this.map.drawUpperImage(this.ctx, cameraPerson);

            requestAnimationFrame(() =>{
                step();
            })
        }
        step();
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            //Is there a person here to talk to?
            this.map.checkForActionCutscene();
        })
    }

    bindHeroPositionCheck() {
        document.addEventListener('PersonWalkingComplete', e => {
            if (e.detail.whoId === 'hero') {
                //hero's position has changed
                this.map.checkForFootstepCutscene();
            }
        })
    }

    startMap(mapConfig) {
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();
    }

    init() {
        this.startMap(window.OverworldMaps.Chambre);

        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        this.startGameLoop();

        this.map.startCutscene([
            {type: 'textMessage', text: 'Hello there !' },
        ]);
    }
}