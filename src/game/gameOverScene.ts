import 'phaser';
import type { Text } from '../common/game.type';

export default class GameOverScene extends Phaser.Scene {

  private text!: Text;
  private totalScoreText!: Text;
  private continueText!: Text;

  constructor() {
    super({ key: 'gameOverScene'});
  }

  init() {
    this.text;
    this.totalScoreText;
    this.continueText;
  }

  preload() {}

  create() {
    this.text = this.add.text(280, 200, 'Game Over', { backgroundColor: "#880000", color: "#AAAAAA", fontSize: '42px' });

    this.continueText = this.add.text(320, 350, 'CONTINUE?', { color: "#AAAAAA", fontSize: '30px' });

    const continueZone = this.add.zone(0, 0, 1600, 1200);
    continueZone.setInteractive({
      useHandCursor: true
    });

    continueZone.on('pointerdown', () => {
      window.location.reload();
    });
  }
}