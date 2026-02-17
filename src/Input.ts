export class InputManager {
  keys: Set<string> = new Set();
  mouseX = 0;
  mouseY = 0;
  mouseDown = false;
  private prevKeys: Set<string> = new Set();

  constructor() {
    const gameKeys = new Set([
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'Space', 'KeyZ', 'KeyX', 'KeyC', 'KeyP',
      'ShiftLeft', 'ShiftRight', 'Escape',
    ]);
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (gameKeys.has(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('mousedown', () => { this.mouseDown = true; });
    window.addEventListener('mouseup', () => { this.mouseDown = false; });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  justPressed(code: string): boolean {
    return this.keys.has(code) && !this.prevKeys.has(code);
  }

  get moveX(): number {
    let x = 0;
    if (this.isDown('ArrowLeft') || this.isDown('KeyA')) x -= 1;
    if (this.isDown('ArrowRight') || this.isDown('KeyD')) x += 1;
    return x;
  }

  get moveY(): number {
    let y = 0;
    if (this.isDown('ArrowDown') || this.isDown('KeyS')) y -= 1;
    if (this.isDown('ArrowUp') || this.isDown('KeyW')) y += 1;
    return y;
  }

  get fire(): boolean {
    return this.isDown('Space') || this.isDown('KeyZ') || this.mouseDown;
  }

  get bomb(): boolean {
    return this.justPressed('KeyX');
  }

  get barrelRoll(): boolean {
    return this.justPressed('ShiftLeft') || this.justPressed('ShiftRight') || this.justPressed('KeyC');
  }

  get pause(): boolean {
    return this.justPressed('KeyP') || this.justPressed('Escape');
  }

  endFrame(): void {
    this.prevKeys = new Set(this.keys);
  }
}
