declare const window: any

import {
	dx,
	rad,
	Size,
	State,
	UserOS,
	HTMLDiv,
	Position,
	detectOS,
	pluralNoun,
	HTMLAnchor,
	HTMLButton,
	RESULT_TEXT,
	ModalButton,
	UI_STAR_URL,
	HTMLContainer,
	HTMLParagraph,
	preloadImages,
	PIPE_TOP_URLS,
	getRandomFloat,
	BACKGROUND_URLS,
	PIPE_BOTTOM_URLS,
	PLAYER_MODEL_URLS,
	MAIN_BACKGROUND_URL,
	distanceBetweenPipes
} from './GameSettings.js'

// Load the images needed for the game in the cache
preloadImages([
	UI_STAR_URL,
	MAIN_BACKGROUND_URL,
	...BACKGROUND_URLS,
	...PLAYER_MODEL_URLS,
	...PIPE_BOTTOM_URLS,
	...PIPE_TOP_URLS,
])

class ButtonWindow {
	constructor(frame: HTMLElement, buttons: ModalButton[]) {
		const overlay = new HTMLDiv(['overlay', 'modal-part']).node
		buttons.forEach(button => {
			const container = new HTMLDiv(['btn-container', 'bottom']).node
			const buttonEl = new HTMLButton(button.text, ['yellow', 'hidden', 'transparent'])
			if (button.classes) buttonEl.addClasses(...button.classes)
			if (button.callback)
				buttonEl.regEvent('click', button.callback)
			container.appendChild(buttonEl.node)
			setTimeout(() => {
				buttonEl.node.classList.remove('hidden')
				setTimeout(() => {
					buttonEl.node.classList.remove('transparent')
				}, 4)
			}, 500)
			overlay.appendChild(container)
		})
		frame.appendChild(overlay)
	}
}

class AdvancedModalWindow {
	constructor(frame: HTMLElement, children: HTMLContainer[] = [], closable = true) {
		const shadow = new HTMLDiv(['shadow', 'modal-part']).node
		const win = new HTMLDiv(['modal-win'])
		const closeBtn = new HTMLDiv(['close-btn'])
		if (closable) {
			closeBtn.regEvent('click', () => {
				frame.removeChild(shadow)
				frame.removeChild(win.node)
			})
			win.addChildren(closeBtn)
		}
		win.addChildren(...children, new HTMLDiv(['stars']))
		shadow.classList.add('hidden')
		shadow.classList.add('transparent')
		setTimeout(() => {
			shadow.classList.remove('hidden')
			setTimeout(() => {
				shadow.classList.remove('transparent')
			}, 4)
		}, 500)
		shadow.appendChild(win.node)
		frame.appendChild(shadow)
	}
}

class Background {
	private position: Position;
	private mainBackground: HTMLImageElement;
	public sprite: HTMLImageElement;

	constructor(url: string) {
		this.position = new Position(0, 0)
		this.mainBackground = new Image()
		this.mainBackground.src = MAIN_BACKGROUND_URL
		this.sprite = new Image()
		this.sprite.src = url
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		context.drawImage(
			this.mainBackground,
			this.position.x,
			this.position.y,
			canvas.width,
			canvas.height
		)
		context.drawImage(
			this.sprite,
			this.position.x,
			this.position.y,
			canvas.width,
			canvas.height
		)
	}
}

class Shadow {
	private position: Position;
	private size: Size;
	public opacity: number;
	public active: boolean;
	private color: ColorRGBA;

	constructor(size: Size, opacity: number) {
		this.size = size
		this.color = new ColorRGBA(0, 0, 0, 1)
		this.opacity = opacity
		this.active = true
		this.color.setOpacity(this.opacity)
		this.position = new Position(0, 0)
	}

	render(context: CanvasRenderingContext2D): void {
		this.color.setOpacity(this.opacity)
		context.fillStyle = this.color.toString()
		context.fillRect(
			this.position.x,
			this.position.y,
			this.size.width,
			this.size.height
		)
	}
}

class ColorRGBA {
	private red: number;
	private green: number;
	private blue: number;
	private opacity: number;

	constructor(r: number, g: number, b: number, opacity = 1) {
		if (r >= 0 && r <= 255) this.red = r
		else if (r > 255) this.red = 255
		else this.red = 0

		if (g >= 0 && g <= 255) this.green = g
		else if (g > 255) this.green = 255
		else this.green = 0

		if (b >= 0 && b <= 255) this.blue = b
		else if (b > 255) this.blue = 255
		else this.blue = 0

		if (opacity >= 0 && opacity <= 1) {this.opacity = opacity}
		else if (opacity > 1) this.opacity = 1
		else this.opacity = 0
	}

	public setOpacity(opacity: number): void {
		if (opacity >= 0 && opacity <= 1) {this.opacity = opacity}
		else if (opacity > 1) this.opacity = 1
		else this.opacity = 0
	}

	public toString(): string {
		return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`
	}
}

class UI {
	private position: Position;
	private size: Size;
	private textMargin: Position;
	public score: number;
	private backgroundColor: ColorRGBA;
	private star: HTMLImageElement;

	constructor(position: Position, size: Size, background: ColorRGBA = new ColorRGBA(255, 255, 255, 1)) {
		this.position = position
		this.size = size
		this.score = 0
		this.backgroundColor = background
		this.textMargin = new Position(42, 24)
		this.star = new Image()
		this.star.src = UI_STAR_URL
	}

	public render(context: CanvasRenderingContext2D): void {
		context.fillStyle = this.backgroundColor.toString()
		context.fillRect(
			this.position.x,
			this.position.y,
			this.size.width,
			this.size.height
		)

		context.font = '700 24px Montserrat'
		context.fillStyle = new ColorRGBA(0, 0, 0, 1).toString()
		context.fillText(
			this.score.toString(),
			this.position.x + this.textMargin.x,
			this.position.y + this.textMargin.y
		)
		context.drawImage(
			this.star,
			this.position.x + 4,
			this.position.y + 4,
			22,
			22
		)
	}
}

class PipesGenerator {
	public top: HTMLImageElement = new Image();
	public bottom: HTMLImageElement = new Image();
	public passed: boolean;
	public pipes: Position[];
	public gap: number;

	constructor(top_url: string, bottom_url: string) {
		this.gap = 260
		this.passed = true
		this.pipes = []
		this.top.src = top_url
		this.bottom.src = bottom_url
	}

	public render(context: CanvasRenderingContext2D) {
		for (let i = 0; i < this.pipes.length; i++) {
			const pipe = this.pipes[i]
			context.drawImage(this.top, pipe.x, pipe.y)
			context.drawImage(this.bottom, pipe.x, pipe.y + this.top.height + this.gap)
		}
	}
}

class Player {
	public position: Position;
	public size: Size;
	public sprite: HTMLImageElement;
	public speed: number;
	public gravity: number;
	public thrust: number;

	constructor(size: Size, url: string) {
		this.position = new Position(0, 0)
		this.size = size
		this.speed = 0
		this.gravity = 0.175
		this.thrust = 3.9
		this.sprite = new Image()
		this.sprite.src = url
	}

	public render(context: CanvasRenderingContext2D) {
		context.save()
		context.translate(this.position.x, this.position.y)
		context.drawImage(this.sprite, 0, 0, this.size.width, this.size.height)
		context.restore()
	}
}

class Game {
	public frames: number;
	private score: number;
	private mainFrame: HTMLElement;
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private canvasSize: Size;
	private verticalCenter: number;
	private horizontalCenter: number;
	private state: State;
	private player: Player;
	private delay: number;
	private background: Background;
	private shadow: Shadow;
	private level: 0 | 1 | 2;
	private levelEdges: number[] = [50, 150];
	private pipesGenerator: PipesGenerator;
	private speedingCoefficient = 0;
	private UI: UI;
	private os: UserOS;
	private screen: Size;

	constructor(mainFrame: HTMLElement, canvas: HTMLCanvasElement) {
		this.state = State.Awaiting
		this.mainFrame = mainFrame
		this.canvas = canvas
		this.os = detectOS()
		if (this.os == UserOS.Android || this.os == UserOS.iOS)
			this.screen = new Size(window.screen.width, window.screen.height)
		else
			this.screen = new Size(window.innerWidth, window.innerHeight)
		if (this.screen.height < 700) {
			this.canvas.height = 550
			this.canvas.width = 309
			this.mainFrame.style.height = '550px'
			this.mainFrame.style.width = '309px'
		}
		console.log(this.screen)
		this.canvasSize = new Size(this.canvas.width, this.canvas.height)
		this.frames = this.score = this.delay = this.level = 0
		this.context = this.canvas.getContext('2d')!
		this.player = new Player(new Size(100, 100), PLAYER_MODEL_URLS[this.level])
		this.background = new Background(BACKGROUND_URLS[this.level])
		this.shadow = new Shadow(this.canvasSize, 0.4)
		this.pipesGenerator = new PipesGenerator(PIPE_TOP_URLS[this.level], PIPE_BOTTOM_URLS[this.level])
		const UISize = new Size(100, 30)
		this.UI = new UI(new Position(this.canvasSize.width - UISize.width - 40, 30), UISize)
		this.canvas.addEventListener('click', e => {e.preventDefault(); this.handleClick(this.state)})
		this.horizontalCenter = (this.canvasSize.width - this.player.size.width) / 2
		this.verticalCenter = (this.canvasSize.height - this.player.size.height) / 2
		window.addEventListener('keypress', (event: KeyboardEvent) => {
			if (event.key == ' ') {
				event.preventDefault()
				this.handleClick(this.state)
			}
		})
		this.player.position.x = this.horizontalCenter
		this.player.position.y = this.verticalCenter
	}

	public start(): void {
		this.state = State.Playing
		this.flap()
	}

	private restart(): void {
		this.level = this.score = this.UI.score = 0
		this.player = new Player(new Size(100, 100), PLAYER_MODEL_URLS[this.level])
		this.background = new Background(BACKGROUND_URLS[this.level])
		this.pipesGenerator = new PipesGenerator(PIPE_TOP_URLS[this.level], PIPE_BOTTOM_URLS[this.level])
		this.player.position.x = this.horizontalCenter
		this.player.position.y = this.verticalCenter
		this.start()
	}

	private updatePipes(): void {
		if (this.pipesGenerator.pipes.length) {
			this.pipesGenerator.pipes.forEach(pipe => pipe.x -= dx)
			if (this.pipesGenerator.pipes[0].x < -this.pipesGenerator.top.width) {
				this.pipesGenerator.pipes.shift()
				this.pipesGenerator.passed = true
			}
		}
	}

	public update(): void {
		let direction = 1
		const shadowDisappearCoefficient = 0.4 / 60
		switch (this.state) {
		case State.Awaiting: {
			this.player.position.y += 2 * Math.sin(this.frames * 3 * rad)

			this.updatePipes()
			break
		}
		case State.Playing: {
			this.player.position.y += this.player.speed
			this.player.speed += this.player.gravity

			if (this.frames % distanceBetweenPipes == 0) {
				this.pipesGenerator.pipes.push(
					new Position(
						this.canvasSize.width,
						-80 * getRandomFloat(2, 5) - 30
					)
				)
			}
					
			this.updatePipes()

			if (this.collisioned())
				this.state = State.PreGameOver

			if (this.score == this.levelEdges[this.level] && this.level != this.levelEdges.length) {
				this.level++
				this.state = State.InitializeNewLevel
			}

			if (this.shadow.active) {
				if (this.shadow.opacity > 0) {
					this.shadow.opacity -= shadowDisappearCoefficient
				}
				else {
					this.shadow.active = false
				}
			}
			break
		}
		case State.InitializeNewLevel: {
			this.pipesGenerator.pipes.forEach(pipe => { pipe.x -= dx })
			this.speedingCoefficient = Math.abs(this.verticalCenter - this.player.position.y) / 50
			direction = (this.verticalCenter - this.player.position.y) > 0 ? 1 : -1

			this.player.speed = direction * this.speedingCoefficient

			this.delay = 75
			this.hideModals()
			new ButtonWindow(
				this.mainFrame,
				[{
					text: `На ${this.level + 1} уровень!`,
					callback: () => {
						if (!this.delay) {
							this.hideModals()
							this.start()
						}
					}
				}]
			)
			this.state = State.ChangingLevel
			break
		}
		case State.ChangingLevel: {
			if (!this.delay) {
				this.state = State.Awaiting
				this.pipesGenerator.top.src = PIPE_TOP_URLS[this.level]
				this.pipesGenerator.bottom.src = PIPE_BOTTOM_URLS[this.level]
				this.player.sprite.src = PLAYER_MODEL_URLS[this.level]
				this.background.sprite.src = BACKGROUND_URLS[this.level]
			}
			else {
				this.updatePipes()

				if (Math.abs(this.verticalCenter - this.player.position.y) < 2) {
					this.player.position.y = this.verticalCenter
					this.player.speed = 0
				}
				else {
					this.player.position.y += this.player.speed
				}
				this.delay--
			}
			break
		}
		case State.PreGameOver: {
			this.hideModals()
					
			const scoreWord = pluralNoun(this.score, 'балл', 'балла', 'баллов')
			let resultText: string
			if (this.score <= 10)
				resultText = RESULT_TEXT[0]
			else if (this.score <= 100)
				resultText = RESULT_TEXT[1]
			else
				resultText = RESULT_TEXT[2]

			new AdvancedModalWindow(
				this.mainFrame,
				[
					new HTMLParagraph(`<b>${this.score} ${scoreWord}</b><br>${resultText}`, ['smaller-lines']),
					new HTMLButton('Начать сначала', ['yellow']).regEvent('click', () => {
						this.hideModals()
						this.restart()
					})
				],
				false
			)
			this.state = State.GameOver
			break
		}
		case State.GameOver: {
			if (this.player.position.y + this.player.size.height + this.player.speed < this.canvasSize.height) {
				this.player.position.y += this.player.speed
				this.player.speed += this.player.gravity * 3
			}
			else {
				this.player.speed = 0
			}
			break
		}
		}
	}

	public render(): void {
		this.background.render(this.canvas, this.context)
		if (this.shadow.active) this.shadow.render(this.context)
		this.pipesGenerator.render(this.context)
		this.player.render(this.context)
		this.UI.render(this.context)
	}

	private hideModals(): void {
		const children = this.mainFrame.children
		for (let i = 0; i < children.length; i++) {
			const child = children[i]
			if (child.classList.contains('modal-part'))
				this.mainFrame.removeChild(child)
		}
	}

	private flap(): void {
		if (this.player.position.y > 0 && this.player.position.y < (this.canvasSize.height - this.player.size.height))
			this.player.speed = -this.player.thrust
	}

	private collisioned(): boolean {
		if (this.pipesGenerator.pipes.length == 0)
			return false

		if (this.player.position.y + this.player.size.height >= this.canvasSize.height)
			return true

		let closest = 0
		const pipes = this.pipesGenerator.pipes
		for (let i = 0; i < pipes.length; i++) {
			if ((pipes[i].x + this.pipesGenerator.top.width) > (this.player.position.x + this.player.size.width / 2)) {
				closest = i
				break
			}
		}

		const playerEdge = this.player.position.x + this.player.size.width

		if ((playerEdge - 3) > pipes[closest].x) {
			const pipeWidth = this.pipesGenerator.top.width
			const radius = this.player.size.width / 2
			const center = new Position(this.player.position.x + radius, this.player.position.y + radius)
			const topEdge = pipes[closest].y + this.pipesGenerator.top.height
			const bottomEdge = pipes[closest].y + this.pipesGenerator.top.height + this.pipesGenerator.gap

			if ((this.player.position.y + this.player.size.height / 2) < (topEdge - 90))
				return true

			if ((this.player.position.y + this.player.size.height / 2) > (bottomEdge + 90))
				return true

			const playerPerimeter: Position[] = []
			const topPipeSide: Position[] = []
			const bottomPipeSide: Position[] = []

			const topA = new Position(pipes[closest].x, topEdge - 70)

			const bottomA = new Position(pipes[closest].x, bottomEdge + 70)

			for (let n = 0; n < 90; n++) {
				const xn = center.x + radius * Math.cos(n * 4 * rad)
				const yn = center.y - radius * Math.sin(n * 4 * rad)
				playerPerimeter.push(new Position(xn, yn))
			}

			const kx = pipeWidth / 2 / 25
			const ky = 70 / 25
			for (let n = 0; n < 25; n++) {
				let xn = topA.x + kx * n
				let yn = topA.y + ky * n
				topPipeSide.push(new Position(xn, yn))

				xn = bottomA.x + kx * n
				yn = bottomA.y - ky * n
				bottomPipeSide.push(new Position(xn, yn))
			}

			if (this.player.position.y <= topEdge) {
				for (let i = 0; i < 45; i++) {
					for (let j = 0; j < 25; j++) {
						if (playerPerimeter[i].x > topPipeSide[j].x && playerPerimeter[i].y < topPipeSide[j].y) {
							return true
						}
					}
				}
			}
			if (this.player.position.y + this.player.size.height >= bottomEdge + 5) {
				for (let i = 45; i < 90; i++) {
					for (let j = 0; j < 25; j++) {
						if (playerPerimeter[i].x > bottomPipeSide[j].x && playerPerimeter[i].y > bottomPipeSide[j].y) {
							return true
						}
					}
				}
			}

			if (this.pipesGenerator.passed && ((this.player.position.x + radius) > (pipes[closest].x + pipeWidth / 2))) {
				this.score++
				this.UI.score = this.score
				this.pipesGenerator.passed = false
			}  
		}

		return false
	}

	private handleClick(state: State): void {
		if (state == State.Playing)
			this.flap()
	}

	private createCode(n: string): string {
		let hash = 0
		if (n.length == 0) return `${hash}`
		for (let i = 0; i < n.length; i++) { const char = n.charCodeAt(i); hash = ((hash<<5)-hash)+char; hash = hash & hash }
		return hash.toString(16)
	}

	private saveScore(): void {
		$.ajax({
			url: 'request.php?action=update-score',
			type: 'POST',
			dataType: 'json',
			cache: false,
			data: {
				'score': this.score,
				'hash': window.hashValue,
				'code': this.createCode(`${this.score}`)
			},
			error: (jqXHR, errorTextStatus) => {
				console.warn(jqXHR)
				console.warn(errorTextStatus)
			}
		})
	}

	private checkUnauthorized(): void {
		$.ajax({
			url: 'request.php',
			type: 'GET',
			dataType: 'json',
			cache: false,
			data: {
				'action': 'increase-ip-counter'
			},
			success: (response) => {
				if (response.success) {
					if (response.result >= 7) {
						this.hideModals()
						new AdvancedModalWindow(
							this.mainFrame,
							[
								new HTMLParagraph('Авторизуйтесь, чтобы продолжить игру и принять участие в рейтинге'),
								new HTMLAnchor('Авторизация', ['reg-window-btn', 'yellow-btn'], window.regLink).setAttr('data-success-action', 'location.reload()')
							],
							false
						)
					}
				}
			},
			error: (jqXHR, errorTextStatus) => {
				console.warn(jqXHR)
				console.warn(errorTextStatus)
			}
		})
	}
}

const mainFrame = document.querySelector<HTMLElement>('main.game-frame')!
const canvas = document.querySelector<HTMLCanvasElement>('canvas#game')!
const workingGame = new Game(mainFrame, canvas)
const startButton = document.querySelector('main.game-frame button.start')!
const overlay = document.querySelector('main.game-frame div.overlay')!
startButton?.addEventListener('click', () => {
	overlay.parentElement?.removeChild(overlay)
	workingGame.start()
})

loop()

function loop(): void {
	workingGame.update()
	workingGame.render()
	workingGame.frames++
	window.requestAnimationFrame(loop)
}
