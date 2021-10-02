var life = [12, 8, 10]
var gameOver = false;
var gamesWon = -1;

var Unit = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,
  initialize:
    function Unit(scene, x, y, texture, frame, type, hp, defense, modStr, damageType) {
      Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
      this.type = type;
      this.maxHp = hp;
      this.hp = hp;
      this.defense = defense;
      this.modStr = modStr;
      this.damageType = damageType;
      this.living = true;
      this.menuItem = null;
      this.attackResult = 0;
    },
  setMenuItem: function (item) {
    this.menuItem = item;
  },
  attackTest: function (target) {
    this.attackResult = Phaser.Math.Between(1, 20);
    this.attackResult += this.modStr;
    if (this.attackResult >= target.defense) {
      this.attack(target)
    } else {
      this.scene.events.emit("Message", this.type + " errou attaque em " + target.type + " (" + (this.attackResult - this.modStr) + ")");
    }
  },
  attack: function (target) {
    if (this.damageType == "d6") {
      this.damage = Phaser.Math.Between(1, 6);
    } else if (this.damageType == "d10") {
      this.damage = Phaser.Math.Between(1, 10);
    } else if (this.damageType == "d12") {
      this.damage = Phaser.Math.Between(1, 12);
    } else if (this.damageType == "2d6") {
      this.damage = Phaser.Math.Between(1, 6);
      this.damage += Phaser.Math.Between(1, 6);
    } else if (this.damageType == "2d10") {
      this.damage = Phaser.Math.Between(1, 10);
      this.damage += Phaser.Math.Between(1, 10);
    }
    if (target.living) {
      target.takeDamage(this.damage);
      this.scene.events.emit("Message", this.type + " ataca (" + (this.attackResult - this.modStr) + ") " + target.type + " causando " + this.damage + " de dano (" + target.hp + ")");
    }
  },
  takeDamage: function (damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.menuItem.unitKilled();
      this.living = false;
      this.visible = false;
      this.menuItem = null;
    }
  }
});

var Enemy = new Phaser.Class({
  Extends: Unit,
  initialize:
    function Enemy(scene, x, y, texture, frame, type, hp, defense, modStr, damageType) {
      Unit.call(this, scene, x, y, texture, frame, type, hp, defense, modStr, damageType);

      this.setScale(1.75);
    }
});

var PlayerCharacter = new Phaser.Class({
  Extends: Unit,
  initialize:
    function PlayerCharacter(scene, x, y, texture, frame, type, index, hp, defense, modStr, damageType) {
      Unit.call(this, scene, x, y, texture, frame, type, hp, defense, modStr, damageType);

      this.index = index;

      this.setScale(1.75);
    }
});

var MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,

  initialize:

    function MenuItem(x, y, text, scene) {
      Phaser.GameObjects.Text.call(this, scene, x, y, text, { font: "30px Arial", color: "#ffffff", align: "left" });
    },

  select: function () {
    this.setColor("#ffff1f");
  },

  deselect: function () {
    this.setColor("#ffffff");
  },
  // when the associated enemy or player unit is killed
  unitKilled: function () {
    this.active = false;
    this.visible = false;
  }

});

var Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize:

    function Menu(x, y, scene, heroes) {
      Phaser.GameObjects.Container.call(this, scene, x, y);
      this.menuItems = [];
      this.menuItemIndex = 0;
      this.x = x;
      this.y = y;
      this.selected = false;
    },
  addMenuItem: function (unit) {
    var menuItem = new MenuItem(0, this.menuItems.length * 50, unit, this.scene);
    this.menuItems.push(menuItem);
    this.add(menuItem);
    return menuItem;
  },
  // menu navigation 
  moveSelectionUp: function () {
    this.menuItems[this.menuItemIndex].deselect();
    do {
      this.menuItemIndex--;
      if (this.menuItemIndex < 0)
        this.menuItemIndex = this.menuItems.length - 1;
    } while (!this.menuItems[this.menuItemIndex].active);
    this.menuItems[this.menuItemIndex].select();
  },
  moveSelectionDown: function () {
    this.menuItems[this.menuItemIndex].deselect();
    do {
      this.menuItemIndex++;
      if (this.menuItemIndex >= this.menuItems.length)
        this.menuItemIndex = 0;
    } while (!this.menuItems[this.menuItemIndex].active);
    this.menuItems[this.menuItemIndex].select();
  },
  // select the menu as a whole and highlight the choosen element
  select: function (index) {
    if (!index)
      index = 0;
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = index;
    while (!this.menuItems[this.menuItemIndex].active) {
      this.menuItemIndex++;
      if (this.menuItemIndex >= this.menuItems.length)
        this.menuItemIndex = 0;
      if (this.menuItemIndex == index)
        return;
    }
    this.menuItems[this.menuItemIndex].select();
    this.selected = true;
  },
  // deselect this menu
  deselect: function () {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = 0;
    this.selected = false;
  },
  confirm: function () {
    // when the player confirms his slection, do the action
  },
  // clear menu and remove all menu items
  clear: function () {
    for (var i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].destroy();
    }
    this.menuItems.length = 0;
    this.menuItemIndex = 0;
  },
  // recreate the menu items
  remap: function (units) {
    this.clear();
    for (var i = 0; i < units.length; i++) {
      var unit = units[i];
      unit.setMenuItem(this.addMenuItem(unit.type));
    }
    this.menuItemIndex = 0;
  }
});


var HeroesMenu = new Phaser.Class({
  Extends: Menu,

  initialize:

    function HeroesMenu(x, y, scene) {
      Menu.call(this, x, y, scene);
    }
});

var ActionsMenu = new Phaser.Class({
  Extends: Menu,

  initialize:

    function ActionsMenu(x, y, scene) {
      Menu.call(this, x, y, scene);
      this.addMenuItem('Attack');
    },
  confirm: function () {
    this.scene.events.emit('SelectedAction');
  }

});

var EnemiesMenu = new Phaser.Class({
  Extends: Menu,

  initialize:

    function EnemiesMenu(x, y, scene) {
      Menu.call(this, x, y, scene);
    },
  confirm: function () {
    this.scene.events.emit("Enemy", this.menuItemIndex);
  }
});

var Message = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
    function Message(scene, events) {
      Phaser.GameObjects.Container.call(this, scene, 480, 100);
      var graphics = this.scene.add.graphics();
      this.add(graphics);
      graphics.lineStyle(1, 0xffffff, 0.8);
      graphics.fillStyle(0x10109E, 0.3);
      graphics.strokeRect(-230, -75, 450, 75);
      graphics.fillRect(-230, -75, 450, 75);
      this.text = new Phaser.GameObjects.Text(scene, 0, -35, "", { font: "30px Arial", color: '#ffffff', align: 'center', wordWrap: { width: 440, useAdvancedWrap: true } });
      this.add(this.text);
      this.text.setOrigin(0.5);
      events.on("Message", this.showMessage, this);
      this.visible = false;
    },
  showMessage: function (text) {
    this.text.setText(text);
    this.visible = true;
    if (this.hideEvent)
      this.hideEvent.remove(false);
    this.hideEvent = this.scene.time.addEvent({ delay: 3500, callback: this.hideMessage, callbackScope: this });
  },
  hideMessage: function () {
    this.hideEvent = null;
    this.visible = false;
  }
});


var BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
    function BattleScene() {
      Phaser.Scene.call(this, { key: 'BattleScene' });
    },

  create: function () {

    let bg = this.add.image(0, 0, "mapa").setOrigin(0, 0);

    this.startBattle();

    // on wake event we call startBattle too
    this.sys.events.on('wake', this.startBattle, this);
  },

  startBattle: function () {

    // shake the world
    this.cameras.main.shake(150);

    if (life[0] > 0) {
      var kasyNo = new PlayerCharacter(this, 720, 115, 'golem', 14, `Kas'y No`, 0, life[0], 18, 8, "d12");
      this.add.existing(kasyNo);
    }

    if (life[1] > 0) {
      var calevigh = new PlayerCharacter(this, 840, 230, 'samurai', 0, 'Calevigh', 1, life[1], 11, 12, "2d6");
      this.add.existing(calevigh);
    }

    if (life[2] > 0) {
      var fili = new PlayerCharacter(this, 720, 345, 'anao', 7, 'Fili', 2, life[2], 15, 6, "2d10");
      this.add.existing(fili);
    }

    var esqueleto1 = new Enemy(this, 240, 115, 'esqueleto_inimigo', 3, 'Esqueleto1', 20, 15, 4, "d6");
    this.add.existing(esqueleto1);

    var esqueleto2 = new Enemy(this, 120, 230, 'esqueleto_inimigo', 3, 'Esqueleto2', 20, 15, 4, "d6");
    this.add.existing(esqueleto2);

    // array with heroes
    this.heroes = [];
    if (kasyNo) {
      this.heroes = this.heroes.concat(kasyNo);
    }

    if (calevigh) {
      this.heroes = this.heroes.concat(calevigh);
    }

    if (fili) {
      this.heroes = this.heroes.concat(fili);
    }

    // array with enemies
    this.enemies = [esqueleto1, esqueleto2];
    // array with both parties, who will attack
    this.units = this.heroes.concat(this.enemies);

    this.index = -1; // currently active unit

    this.scene.run("UIScene");
  },

  nextTurn: function () {
    // if we have victory or game over

    if (this.checkEndBattle()) {
      this.endBattle();
      if (gameOver) {
        // sleep the UI
        this.scene.sleep('WorldScene');
        // return to WorldScene and sleep current BattleScene
        this.scene.switch('GameOverScene');
      }
      return;
    }
    do {
      // currently active unit
      this.index++;
      // if there are no more units, we start again from the first one
      if (this.index >= this.units.length) {
        this.index = 0;
      }
    } while (!this.units[this.index].living);
    // if its player hero
    if (this.units[this.index] instanceof PlayerCharacter) {
      // we need the player to select action and then enemy
      this.events.emit("PlayerSelect", this.index);
    } else { // else if its enemy unit
      // pick random living hero to be attacked
      var r;
      do {
        r = Math.floor(Math.random() * this.heroes.length);
      } while (!this.heroes[r].living)
      // call the enemy's attack function 
      this.units[this.index].attackTest(this.heroes[r]);
      // add timer for the next turn, so will have smooth gameplay
      this.time.addEvent({ delay: 3500, callback: this.nextTurn, callbackScope: this });
    }
  },

  receivePlayerSelection: function (action, target) {
    if (action == 'attack') {
      this.units[this.index].attackTest(this.enemies[target]);
    }
    this.time.addEvent({ delay: 3500, callback: this.nextTurn, callbackScope: this });
  },

  checkEndBattle: function () {
    var victory = true;
    // if all enemies are dead we have victory
    for (var i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].living)
        victory = false;
    }
    gameOver = true;
    // if all heroes are dead we have game over
    for (var i = 0; i < this.heroes.length; i++) {
      if (this.heroes[i].living)
        gameOver = false;
    }

    if (victory) {
      gamesWon += 1;
    }

    return victory || gameOver;
  },

  endBattle: function () {
    for (var i = 0; i < this.heroes.length; i++) {
      if (!this.heroes[i].living) {
        life[i] = 0
      } else {
        let x = this.heroes[i].index;
        life[x] = this.heroes[i].hp;
      }
    }
    // clear state, remove sprites
    this.heroes.length = 0;
    this.enemies.length = 0;
    for (var i = 0; i < this.units.length; i++) {
      // link item
      this.units[i].destroy();
    }
    this.units.length = 0;
    // sleep the UI
    this.scene.sleep('UIScene');
    // return to WorldScene and sleep current BattleScene
    this.scene.switch('WorldScene');
  },

  exitBattle: function () {
    this.scene.sleep('UIScene');
    this.scene.switch('WorldScene');
  },

});

var UIScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
    function UIScene() {
      Phaser.Scene.call(this, { key: 'UIScene' });
    },
  create: function () {
    // draw some background for the menu
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(1, 0xffffff);
    this.graphics.fillStyle(0x031f4c, 1);
    this.graphics.strokeRect(5, 462, 275, 231);
    this.graphics.fillRect(5, 462, 275, 231);
    this.graphics.strokeRect(285, 462, 275, 231);
    this.graphics.fillRect(285, 462, 275, 231);
    this.graphics.strokeRect(565, 462, 402, 231);
    this.graphics.fillRect(565, 462, 402, 231);

    // basic container to hold all menus
    this.menus = this.add.container();

    this.heroesMenu = new HeroesMenu(570, 470, this);
    this.actionsMenu = new ActionsMenu(290, 470, this);
    this.enemiesMenu = new EnemiesMenu(10, 470, this);

    // the currently selected menu 
    this.currentMenu = this.actionsMenu;

    // add menus to the container
    this.menus.add(this.heroesMenu);
    this.menus.add(this.actionsMenu);
    this.menus.add(this.enemiesMenu);

    this.battleScene = this.scene.get("BattleScene");

    // listen for keyboard events
    this.input.keyboard.on("keydown", this.onKeyInput, this);

    // when its player cunit turn to move
    this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);

    // when the action on the menu is selected
    // for now we have only one action so we dont send and action id
    this.events.on("SelectedAction", this.onSelectedAction, this);

    // an enemy is selected
    this.events.on("Enemy", this.onEnemy, this);

    // when the scene receives wake event
    this.sys.events.on('wake', this.createMenu, this);

    // the message describing the current action
    this.message = new Message(this, this.battleScene.events);
    this.add.existing(this.message);

    this.createMenu();
  },

  createMenu: function () {
    // map hero menu items to heroes
    this.remapHeroes();
    // map enemies menu items to enemies
    this.remapEnemies();
    // first move
    this.battleScene.nextTurn();
  },

  remapHeroes: function () {
    var heroes = this.battleScene.heroes;
    this.heroesMenu.remap(heroes);
  },
  remapEnemies: function () {
    var enemies = this.battleScene.enemies;
    this.enemiesMenu.remap(enemies);
  },

  onKeyInput: function (event) {
    if (this.currentMenu && this.currentMenu.selected) {
      if (event.code === "ArrowUp") {
        this.currentMenu.moveSelectionUp();
      } else if (event.code === "ArrowDown") {
        this.currentMenu.moveSelectionDown();
      } else if (event.code === "ArrowRight" || event.code === "Shift") {
      } else if (event.code === "Space" || event.code === "ArrowLeft") {
        this.currentMenu.confirm();
      }
    }
  },

  onPlayerSelect: function (id) {
    this.heroesMenu.select(id);
    this.actionsMenu.select(0);
    this.currentMenu = this.actionsMenu;
  },

  onSelectedAction: function () {
    this.currentMenu = this.enemiesMenu;
    this.enemiesMenu.select(0);
  },

  onEnemy: function (index) {
    this.heroesMenu.deselect();
    this.actionsMenu.deselect();
    this.enemiesMenu.deselect();
    this.currentMenu = null;
    this.battleScene.receivePlayerSelection('attack', index);
  }
});

var BootScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function BootScene() {
      Phaser.Scene.call(this, { key: 'BootScene' });
    },

  preload: function () {
    this.load.spritesheet('samurai', 'assets/samurai_spritesheet4.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('golem', 'assets/golem_spritesheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('anao', 'assets/anao_spritesheet.png', { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('esqueleto_inimigo', 'assets/esqueleto_inimigo_spritesheet.png', { frameWidth: 64, frameHeight: 64 });

    this.load.image('mapa', 'assets/mapa_floresta_neve.jpg');
    this.load.image('mapa_escuro', 'assets/mapa_floresta_neve_escuro.jpg');
  },

  create: function () {
    // start the WorldScene
    this.scene.start('WorldScene');
  }
});

var WorldScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function WorldScene() {
      Phaser.Scene.call(this, { key: 'WorldScene' });
    },

  preload: function () {

  },

  create: function () {
    var mapa = this.add.image(0, 0, 'mapa').setOrigin(0, 0);

    // ----------------- animação samurai -----------------

    this.anims.create({
      key: 'parado',
      frames: [{ key: 'samurai', frame: 12 }],
      frameRate: 20
    })

    this.anims.create({
      key: 'esquerda',
      frames: this.anims.generateFrameNumbers('samurai', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    })

    this.anims.create({
      key: 'direita',
      frames: this.anims.generateFrameNumbers('samurai', { start: 4, end: 7 }),
      frameRate: 5,
      repeat: -1
    })

    this.anims.create({
      key: 'cima',
      frames: this.anims.generateFrameNumbers('samurai', { start: 8, end: 11 }),
      frameRate: 5,
      repeat: -1
    })

    this.anims.create({
      key: 'baixo',
      frames: this.anims.generateFrameNumbers('samurai', { start: 12, end: 15 }),
      frameRate: 5,
      repeat: -1
    })

    this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

    // our player sprite created through the phycis system
    this.player = this.physics.add.sprite(150, 345, 'samurai');

    this.player.setCollideWorldBounds(true);

    // where the enemies will be
    this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
    for (var i = 0; i < 25; i++) {
      var x = Phaser.Math.RND.between(0, 960);
      var y = Phaser.Math.RND.between(0, 693);
      // parameters are x, y, width, height
      this.spawns.create(x, y, 20, 20);
    }
    // add collider
    this.physics.add.overlap(this.player, this.spawns, this.onMeetEnemy, false, this);

    this.sys.events.on('wake', this.wake, this);
  },

  wake: function () {
    this.a.reset();
    this.d.reset();
    this.w.reset();
    this.s.reset();
  },

  onMeetEnemy: function (player, zone) {
    // we move the zone to some other location
    zone.x = Phaser.Math.RND.between(0, 960);
    zone.y = Phaser.Math.RND.between(0, 693);

    // switch to BattleScene
    this.scene.switch('BattleScene');
  },
  update: function (time, delta) {
    let x = 0;
    let y = 0;

    this.player.body.setVelocity(0);

    if (this.a.isDown) {
      this.player.body.setVelocityX(-150);
      this.player.anims.play('esquerda', true);
      x = 1;
    } else if (this.d.isDown) {
      this.player.body.setVelocityX(150);
      this.player.anims.play('direita', true);
      x = 1;
    }
    else {
      this.player.body.setVelocityX(0);
      x = 0;
    }

    if (this.s.isDown) {
      this.player.body.setVelocityY(150);
      this.player.anims.play('baixo', true);
      y = 1;
    } else if (this.w.isDown) {
      this.player.body.setVelocityY(-150);
      this.player.anims.play('cima', true);
      y = 1;
    }
    else {
      this.player.body.setVelocityY(0);
      y = 0;
    }

    if (x == 0 && y == 0) {
      this.player.anims.play('parado', true);
    }
  }

});

var GameOverScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function GameOverScene() {
      Phaser.Scene.call(this, { key: 'GameOverScene' });
    },

  create: function () {
    const gameOverBg = this.add.image(0, 0, 'mapa_escuro').setOrigin(0, 0);

    var text = this.add.text(150, 75, "GAME OVER", { font: "100px Cinzel", fill: "#DF4200", align: "center" });
    var text = this.add.text(300, 200, "Jogos vencidos: " + gamesWon, { font: "50px Arial", fill: "#ffff1f", align: "center" });

    this.tweens.add({
      targets: gameOverBg,
      ease: 'Sine.easeInOut',
      yoyo: false,
      repeat: -1,
      duration: 3000
    });

    this.cameras.main.once('camerafadeincomplete', function (camera) {
      camera.fadeOut(6000);
    });

    this.cameras.main.fadeIn(6000);
  }
});

var config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 960,
  height: 693,
  zoom: 1.3,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true // set to true to view zones
    }
  },
  scene: [
    BootScene,
    WorldScene,
    BattleScene,
    UIScene,
    GameOverScene
  ]
};
var game = new Phaser.Game(config);