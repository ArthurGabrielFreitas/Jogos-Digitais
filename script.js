function preload() {
  //this.load.image('personagem', 'assets/sprite.png');
  this.load.image('mapa', 'assets/mapa_floresta_neve.jpg');
  this.load.spritesheet('samurai', 'assets/samurai_spritesheet4.png', { frameWidth: 64, frameHight: 64 });
  this.load.spritesheet('golem', 'assets/golem_spritesheet.png', { frameWidth: 64, frameHight: 64 });
  this.load.spritesheet('cursor', 'assets/borda.png', { frameWidth: 64, frameHight: 64 });
}

function create() {
  this.add.image(480, 346, 'mapa');

  this.golem = this.physics.add.sprite(480, 346, 'golem').setScale(1, 1);
  this.golem.setCollideWorldBounds(true);

  this.player = this.physics.add.sprite(300, 346, 'samurai').setScale(1, 1);
  this.player.setCollideWorldBounds(true);

  this.cursor = this.physics.add.sprite(480, 346, 'cursor').setScale(1, 1);
  this.cursor.setCollideWorldBounds(true);

  // ----------------- animação cursor -----------------

  this.anims.create({
    key: 'idle',
    frames: this.anims.generateFrameNumbers('cursor', { start: 0, end: 1 }),
    frameRate: 1.5,
    repeat: -1
  })

  // ----------------- animação samurai -----------------

  this.anims.create({
    key: 'samurai_parado',
    frames: [{ key: 'samurai', frame: 12 }],
    frameRate: 20
  })

  this.anims.create({
    key: 'samurai_esquerda',
    frames: this.anims.generateFrameNumbers('samurai', { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1
  })

  this.anims.create({
    key: 'samurai_direita',
    frames: this.anims.generateFrameNumbers('samurai', { start: 4, end: 7 }),
    frameRate: 5,
    repeat: -1
  })

  this.anims.create({
    key: 'samurai_cima',
    frames: this.anims.generateFrameNumbers('samurai', { start: 8, end: 11 }),
    frameRate: 5,
    repeat: -1
  })

  this.anims.create({
    key: 'samurai_baixo',
    frames: this.anims.generateFrameNumbers('samurai', { start: 12, end: 15 }),
    frameRate: 5,
    repeat: -1
  })

  // ----------------- animação golem -----------------

  this.anims.create({
    key: 'golem_parado',
    frames: [{ key: 'golem', frame: 8 }],
    frameRate: 20
  })

  this.anims.create({
    key: 'golem_esquerda',
    frames: this.anims.generateFrameNumbers('golem', { start: 4, end: 7 }),
    frameRate: 5,
    repeat: -1
  })

  this.anims.create({
    key: 'golem_direita',
    frames: this.anims.generateFrameNumbers('golem', { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1
  })

  this.anims.create({
    key: 'golem_cima',
    frames: this.anims.generateFrameNumbers('golem', { start: 12, end: 13 }),
    frameRate: 5,
    repeat: -1
  })

  this.anims.create({
    key: 'golem_baixo',
    frames: this.anims.generateFrameNumbers('golem', { start: 8, end: 11 }),
    frameRate: 5,
    repeat: -1
  })


  this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
  this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
  this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
  this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

  this.i = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I)
  this.j = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)
  this.k = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)
  this.l = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)
}

function update() {

  let sx, sy, gx, gy;

  // ----------------- movimento cursor -----------------

  let cursors = this.input.keyboard.createCursorKeys();
  if ((cursors.left.isDown) || (cursors.right.isDown)) this.cursor.setVelocityX(cursors.left.isDown ? -150 : 150);
  else this.cursor.setVelocityX(0);
  if ((cursors.up.isDown) || (cursors.down.isDown)) this.cursor.setVelocityY(cursors.up.isDown ? -150 : 150);
  else this.cursor.setVelocityY(0);

  this.cursor.anims.play('idle', true);

  // ----------------- movimento samurai -----------------

  if (this.a.isDown) {
    this.player.setVelocityX(-150);
    this.player.anims.play('samurai_esquerda', true);
  } else if (this.d.isDown) {
    this.player.setVelocityX(150);
    this.player.anims.play('samurai_direita', true);
  }
  else {
    this.player.setVelocityX(0);
    sx = 0;
  }

  if (this.s.isDown) {
    this.player.setVelocityY(150);
    this.player.anims.play('samurai_baixo', true);
  } else if (this.w.isDown) {
    this.player.setVelocityY(-150);
    this.player.anims.play('samurai_cima', true);
  }
  else {
    this.player.setVelocityY(0);
    sy = 0;
  }

  if(sx == 0 && sy == 0){
    this.player.anims.play('samurai_parado', true);
  }

  // ----------------- movimento golem -----------------

  if (this.j.isDown) {
    this.golem.setVelocityX(-150);
    this.golem.anims.play('golem_esquerda', true);
  } else if (this.l.isDown) {
    this.golem.setVelocityX(150);
    this.golem.anims.play('golem_direita', true);
  }
  else {
    this.golem.setVelocityX(0);
    gx = 0;
  }

  if (this.k.isDown) {
    this.golem.setVelocityY(150);
    this.golem.anims.play('golem_baixo', true);
  } else if (this.i.isDown) {
    this.golem.setVelocityY(-150);
    this.golem.anims.play('golem_cima', true);
  }
  else {
    this.golem.setVelocityY(0);
    gy = 0;
  }
  if(gx == 0 && gy == 0){
    this.golem.anims.play('golem_parado', true);
  }

}

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 693,
  pixelArt: true,
  backgroundColor: '#000000',
  autoCenter: Phaser.Scale.CENTER_BOTH,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0
      },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);