// Game objects
var Snake = {
    x: 0,
    y: 0,
    // 0 indexed, clockwise
    direction: 0,
    length: 0,
    body: [],
    init: function() {
        this.x = 10;
        this.y = 10;
        this.direction = 2;
        this.length = 0;
        this.body.length = 0;
    },
    setDirection: function(direction) {

        // We don't want the user to be able to "back up" on
        // themselves and lose.
        if (
            this.direction == 0 && direction == 2 ||
            this.direction == 1 && direction == 3 ||
            this.direction == 2 && direction == 0 || 
            this.direction == 3 && direction == 1
            ) {
            return;
        }

        this.direction = direction;
    },
    isCollidingWith: function(obj) {
        
        for (var i = 0, length = this.body.length; i < length; i++) {
            if (obj.x == this.body[i].x && obj.y == this.body[i].y) {
                return true;
            }
        }

        return false;

    },
    update: function () {

        switch (this.direction) {
            case 0:
                this.y--;
                break;
            case 1:
                this.x++;
                break;
            case 2:
                this.y++;
                break;
            case 3:
                this.x--;
                break;

        }

        // The game is over if the user collides
        // with themselves.
        if (this.isCollidingWith(this)) {
            Game.lose();
            return;
        } else if (this.isCollidingWith(Fruit)) {
            Game.addToScore();
            Fruit.place();
            this.length++;
        }

        // Draw the snake on the other side of
        // the map if it exceeds the map's bounds
        if (this.x < 0) {
            this.x = World.width - 1;
        } else if (this.x > World.width - 1) {
            this.x = 0;
        } else if (this.y < 0) {
            this.y = World.height - 1;
        } else if (this.y > World.height - 1) {
            this.y = 0;
        }

        // Once the snake has exceeded its length,
        // shift off the last position.
        if (this.body.length > this.length) {
            var oldPosition = this.body.shift();
            World.setCellAt(oldPosition.x, oldPosition.y, 0);
        }

        this.body.push({
            x: this.x,
            y: this.y
        });

        World.setCellAt(this.x, this.y, 1);

    }

};

var Fruit = {

    x: 0,
    y: 0,

    place: function() {

        // Build up a list of slots that are 
        // valid to place the fruit.
        // This feels better than looping with
        // random numbers until it reaches a
        // "valid" slot.
        var validSlots = [];

        for (var y = 0; y < World.height; y++) {
            for (var x = 0; x < World.width; x++) {              
                if (World.getCellAt(x, y) == 0) {
                    validSlots.push({
                        x: x,
                        y: y
                    });
                }
            }
        }

        var randomSlot = validSlots[Math.floor(Math.random() * validSlots.length)];

        this.x = randomSlot.x;
        this.y = randomSlot.y;

        World.setCellAt(randomSlot.x, randomSlot.y, 2);

    }

};

var World = {
    cellSize: 16,
    width: 25,
    height: 30,
    cells: [],
    getCellAt: function (x, y) {
        return this.cells[y][x];
    },
    setCellAt: function (x, y, value) {
        this.cells[y][x] = value;
    },
    init: function () {
        // Reset cells.
        for (var y = 0; y < this.height; y++) {
            this.cells.push([]);
            for (var x = 0; x < this.width; x++) {
                this.cells[y][x] = 0;
            }
        }
    }
};


var Renderer = {

    ctx: null,

    world: null,

    init: function (world) {
        var canvas = document.getElementsByTagName("canvas")[0];

        canvas.width = world.width * world.cellSize;
        canvas.height = world.height * world.cellSize;

        this.ctx = canvas.getContext("2d");

        this.world = world;       

    },

    render: function() {
        for (var y = 0; y < this.world.height; y++) {

            for (var x = 0; x < this.world.width; x++) {

                var cellId = this.world.getCellAt(x, y);

                var color = {
                    1: "#000",
                    2: "#fcc"
                }[cellId];

                this.ctx.fillStyle = color;

                this.ctx[(cellId == 0 ? "clear" : "fill") + "Rect"](x * this.world.cellSize, y * this.world.cellSize, this.world.cellSize, this.world.cellSize);
            }
        }
    }

}

var Game = {

    score: 0,

    updateInterval: 100,

    active: false,

    activePanelId: "title",

    update: function () {
        Snake.update();
        Renderer.render();
    },

    showPanel: function(panelId) {

        var previousPanel = document.getElementById(this.activePanelId),
            nextPanel = document.getElementById(panelId);

        previousPanel.className = (" " + previousPanel.className + " ").replace(" show ", "") + " hide";
        nextPanel.className += " show";

        
        this.activePanelId = panelId;

    },

    init: function () {
        var self = this;

        if (document.body.style.hasOwnProperty("webkitTransform")) {
            document.body.className += " transform-supported";
        
            document.getElementById("game-container").addEventListener("webkitTransitionEnd", function(event) {
                event.target.className = (" " + event.target.className + " ").replace(" hide ", "");
            });

        }

        document.addEventListener("DOMContentLoaded", function () {
            Renderer.init(World);
            var startButton = document.getElementById("button-play");

            startButton.addEventListener("click", function() {
                self.showPanel("game");
                self.start();
            });

            var replayButton = document.getElementById("lose").getElementsByTagName("button")[0];      
                    
            replayButton.addEventListener("click", function() {
                self.showPanel("game");           
                self.start();
            });

            var aboutButton = document.getElementById("button-about");
            
            aboutButton.addEventListener("click", function() {
                self.showPanel("about");
            });
            
            var backButton = document.getElementById("about").getElementsByTagName("button")[0];      
                    
            backButton.addEventListener("click", function() {
                self.showPanel("title");           
            });

            


        });

        document.addEventListener("keydown", function (event) {
            
            if ( ! self.active) {
                return;
            }

            switch (event.keyCode) {
                case 38:
                case 87:
                    Snake.setDirection(0);
                    break;
                case 39:
                case 68:
                    Snake.setDirection(1);
                    break;
                case 40:
                case 83:
                    Snake.setDirection(2);
                    break;
                case 37:
                case 65:
                    Snake.setDirection(3);
                    break;
            }
        });

        
    },

    addToScore: function() {
        document.getElementById("score").textContent = ++this.score;
    },

    start: function() {
        this.score = 0;

        this.active = true;

        World.init();

        Snake.init();
        

        var self = this;

        (function me(game) {

            if ( ! self.active) {
                return;
            }

            self.update();
            setTimeout(me, self.updateInterval);
        })();

        Fruit.place();
        
    },

    lose: function() {
        document.getElementById("score").textContent = 0;
        document.getElementById("final-score").getElementsByTagName("span")[0].textContent = this.score;       
        this.showPanel("lose");       
        this.active = false;
    }

};

Game.init();




