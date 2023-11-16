import Phaser from "phaser";
import type { CursorKeys, GameObjectWithBody, Keyboard, Physics, PhysicsGroup, TileSprite } from "../common/game.type";

export default class MainScene extends Phaser.Scene {

  private player!: Physics;
  private playerHp!: number;
  private cursors?: CursorKeys;
  private background!: TileSprite;
  private bullet!: Physics;
  private enemyBullet!: Physics;
  private enemyBulletGroup!: PhysicsGroup;
  private spacebar!: Keyboard;
  private bulletNum!: number;
  private bat!: Physics;
  private batNum!: number;
  private enemyBulletNum!: number;
  private batGroup!: PhysicsGroup;
  private defeatedBats!: number;
  private ghost!: Physics;
  private ghostHp!: number;
  private interValId!: number;
  private isGameOver!: boolean;

  constructor() {
    super({ key: 'mainScene'});
  }

  init() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.bulletNum = 0;
    this.enemyBulletNum = 0;
    this.batNum = 0;
    this.defeatedBats = 0;
    this.batGroup = this.physics.add.group();
    this.enemyBulletGroup = this.physics.add.group();
    this.ghostHp = 20;
    this.playerHp = 10;
    this.isGameOver = false;
  }

  preload() {
    this.load.image('background', 'assets/yakei.jpg');
    this.load.spritesheet('player', 'assets/pipo-halloweenchara2016_09.png', {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet('bullet', 'assets/bomb.png', {
      frameWidth: 32, frameHeight: 32, startFrame: 36
    });
    this.load.spritesheet('enemyBullet', 'assets/bomb.png', {
      frameWidth: 32, frameHeight: 32, startFrame: 54
    });
    this.load.spritesheet('bat', 'assets/koumori.png', {
      frameWidth: 32, frameHeight: 32, startFrame: 3
    });
    this.load.spritesheet('ghost', 'assets/obake.png', {
      frameWidth: 32, frameHeight: 32, startFrame: 3
    });
  }

  create() {
    this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

    this.createPlayer();

    for(let i = 0; i <= 2; i++) {
      setTimeout(() => {
        this.createBats();
      }, Phaser.Math.Between(1000, 3000));
    }

    this.spacebar = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if(this.isGameOver) {
      this.scene.transition({ target: "gameOverScene", duration: 10});
    }

    this.background.tilePositionX -= -2;

    if(this.cursors?.left.isDown) {
      this.player.setVelocityX(-300);
      this.player.anims.play('right', true);
    } else if(this.cursors?.right.isDown) {
      this.player.setVelocityX(300);
      this.player.anims.play('right', true);
    } else if(this.player) {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    }
    
    if(this.cursors?.up.isDown) {
      this.player.setVelocityY(-300);
    }
    
    if(this.cursors?.down.isDown) {
      this.player.setVelocityY(300);
    }

    if(Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      this.createBullets();
    }

    if(this.bat && this.bat.x < 0 && this.defeatedBats <= 10 && !this.ghost ) {  
      this.createBats();
      this.createBats();
    }

    if(this.defeatedBats >= 10 && !this.ghost) {
      this.defeatedBats = 0;
      this.createGhost();
    }
  }

  createBullets() {
    this.bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');

    this.bullet.setVelocityX(500);
    this.bullet.setAccelerationX(100);

    this.bulletNum += 1

    this.anims.create({
      key: `playerBullet${this.bulletNum}`,
      frames: this.anims.generateFrameNumbers('bullet', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1,
    });

    this.physics.add.overlap(this.bullet, this.batGroup, this.bulletHitBat, undefined, this);
    this.physics.add.overlap(this.bullet, this.ghost, this.bulletHitGhost, undefined, this);
    this.bullet.anims.play(`playerBullet${this.bulletNum}`);
  }

  createEnemyBullets() {
    this.enemyBullet = this.physics.add.sprite(this.ghost.x, this.ghost.y, 'enemyBullet');
    this.enemyBulletGroup.add(this.enemyBullet);

    this.enemyBullet.setVelocityX(-500);
    this.enemyBullet.setAccelerationX(-100);

    this.enemyBulletNum += 1;

    this.anims.create({
      key: `enemyBullet${this.enemyBulletNum}`,
      frames: this.anims.generateFrameNumbers('enemyBullet', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1,
    });

    this.enemyBullet.anims.play(`enemyBullet${this.enemyBulletNum}`);
  }

  createBats() {
    this.bat = this.physics.add.sprite(800, Phaser.Math.Between(0, 600), 'bat');
    this.batGroup.add(this.bat);
    this.bat.setVelocityX(-200);

    this.batNum += 1;

    this.anims.create({
      key: `moveBat${this.batNum}`,
      frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1,
    }); 

    this.bat.anims.play(`moveBat${this.batNum}`);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    });
    
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
      frameRate: 5,
      repeat: -1
    }); 

    this.physics.add.overlap(this.player, this.enemyBulletGroup, this.playerHitEnemy, undefined, this);
    this.player.anims.play('right', false);
  }

  createGhost() {
    this.ghost = this.physics.add.sprite(600, 300, 'ghost');
    this.ghost.setCollideWorldBounds(true);
    
    this.anims.create({
      key: 'moveGhost',
      frames: this.anims.generateFrameNumbers('ghost', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    });

    this.interValId = setInterval(() => {

      this.createEnemyBullets();

      const xFrom = Phaser.Math.Between(-170, 190);
      const xTo = Phaser.Math.Between(-170, 190);
      
      const yFrom = Phaser.Math.Between(-300, 300);
      const yTo = Phaser.Math.Between(-150, 150);
      
      this.tweens.add({
        targets: this.ghost.body.velocity,
        props: {
          x: { from: xFrom, to: xTo, duration: Phaser.Math.Between(700, 1000) },
          y: { from: yFrom, to: yTo, duration: Phaser.Math.Between(700, 1000) }
        },
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }, 400);  

    this.ghost.anims.play('moveGhost', false);
  }

  bulletHitBat(
    bullet: GameObjectWithBody | Phaser.Tilemaps.Tile,
    batGroup: GameObjectWithBody | Phaser.Tilemaps.Tile,
  ) {
    ( bullet as GameObjectWithBody).destroy();
    ( batGroup as GameObjectWithBody).destroy();
    this.defeatedBats += 1;
    if(this.defeatedBats <= 10 && !this.ghost) {
      for(let i = 0; i <= 1; i++) {
        setTimeout(() => {
          this.createBats();
        }, Phaser.Math.Between(1000, 3000))
      }
    }   
  }

  bulletHitGhost(
    bullet: GameObjectWithBody | Phaser.Tilemaps.Tile,
    ghost: GameObjectWithBody | Phaser.Tilemaps.Tile,
  ) {
    (bullet as GameObjectWithBody).destroy();
    this.ghostHp -= 1;
    if(this.ghostHp === 0) {
      (ghost as GameObjectWithBody).destroy();
      clearInterval(this.interValId);
    }
  }

  playerHitEnemy(
    _player: GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemy: GameObjectWithBody | Phaser.Tilemaps.Tile,
  ) {
    (enemy as GameObjectWithBody).destroy();
    this.playerHp -= 1;
    if(this.playerHp === 0) {
      this.isGameOver = true;
      clearInterval(this.interValId);
    }
  }
}