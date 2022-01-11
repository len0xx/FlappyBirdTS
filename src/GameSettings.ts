export const rad = Math.PI / 180
export const dx = 3
export const distanceBetweenPipes = 90

export const HOME_URL = 'https://xn--80adjbxl0aeb4ii6a.xn--p1ai'
export const GAME_URL = '/bobly/'
export const SHARE_TEXT = 'Попробуй побить мой рекорд в Bobly!\nИгра для тех, кто пока не готов принимать серьезные решения'
export const RESULT_TEXT = [
	'Отличное начало! Может попробуешь еще раз?',
	'Неплохой результат! Продолжим?',
	'Такой концентрации внимания стоит позавидовать'
]
export function pluralNoun(amount: number, singular: string, plural1: string, plural2: string): string {
	if (amount % 10 == 1 && amount != 11) return singular
	else if (amount % 10 > 1 && amount % 10 < 5 && (amount <= 11 || amount >= 15)) return plural1
	else return plural2
}

export const SOURCE_PATH = 'src/'
export const IMAGE_PATH = SOURCE_PATH + 'img/'
export const MAIN_BACKGROUND_URL = IMAGE_PATH + 'background.jpg'
export const BACKGROUND_URLS = [
	IMAGE_PATH + '1level.png',
	IMAGE_PATH + '2level.png',
	IMAGE_PATH + '3level.png'
]
export const PLAYER_MODEL_URLS = [
	IMAGE_PATH + 'player1.png',
	IMAGE_PATH + 'player2.png',
	IMAGE_PATH + 'player3.png'
]
export const PIPE_TOP_URLS = [
	IMAGE_PATH + 'pipe1top.png',
	IMAGE_PATH + 'pipe2top.png',
	IMAGE_PATH + 'pipe3top.png'
]
export const PIPE_BOTTOM_URLS = [
	IMAGE_PATH + 'pipe1bottom.png',
	IMAGE_PATH + 'pipe2bottom.png',
	IMAGE_PATH + 'pipe3bottom.png'
]
export const UI_STAR_URL = IMAGE_PATH + 'star.png'

export interface ModalButton {
	text: string,
	/** @deprecated */
	position?: 'top' | 'bottom',
	callback?: () => void,
	classes?: string[],
	/** @deprecated */
	successAction?: string,
	/** @deprecated */
	link?: string
}

export enum UserOS {
	Linux,
	MacOS,
	Windows,
	iOS,
	Android,
	Unknown
}

export function detectOS(): UserOS {
	const userAgent = window.navigator.userAgent
	const platform = window.navigator.platform
	const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
	const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
	const iosPlatforms = ['iPhone', 'iPad', 'iPod']
	let os = UserOS.Unknown

	if (macosPlatforms.indexOf(platform) !== -1)
		os = UserOS.MacOS
	else if (iosPlatforms.indexOf(platform) !== -1)
		os = UserOS.iOS
	else if (windowsPlatforms.indexOf(platform) !== -1)
		os = UserOS.Windows
	else if (/Android/.test(userAgent))
		os = UserOS.Android
	else if (!os && /Linux/.test(platform))
		os = UserOS.Linux

	return os
}

export function getRandomFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min
}

export function getRandomInt(min: number, max: number): number {
	return Math.floor(getRandomFloat(min, max))
}

export function preloadImages(array: string[]): void {
	const list: HTMLImageElement[] = []
	for (let i = 0; i < array.length; i++) {
		const img = new Image()
		img.onload = function() {
			const index = list.indexOf(img)
			if (index !== -1) {
				list.splice(index, 1)
			}
		}
		list.push(img)
		img.src = array[i]
	}
}

export enum State {
	Awaiting,
	Playing,
	InitializeNewLevel,
	ChangingLevel,
	PreGameOver,
	GameOver
}

export class Position {
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}
}

export class Size {
	public width: number;
	public height: number;

	constructor(width: number, height: number) {
		this.width = width
		this.height = height
	}
}


export class HTMLContainer {
	public node: HTMLElement;

	constructor(tagName: string, classes: string[] = [], id = '') {
		this.node = document.createElement(tagName)
		if (classes.length) this.addClasses(...classes)
		if (id !== '') this.setAttr('id', id)
	}

	public regEvent(e: string, callback: () => void): HTMLContainer {
		this.node.addEventListener(e, callback)
		return this
	}

	public addClasses(...classes: string[]): HTMLContainer {
		this.node.classList.add(...classes)
		return this
	}

	public remClasses(...classes: string[]): HTMLContainer {
		this.node.classList.remove(...classes)
		return this
	}

	public setAttr(name: string, val: string): HTMLContainer {
		this.node.setAttribute(name, val)
		return this
	}

	public remAttr(name: string): HTMLContainer {
		this.node.removeAttribute(name)
		return this
	}

	public setContent(content: string): HTMLContainer {
		this.node.innerHTML = content
		return this
	}

	public addChildren(...children: HTMLContainer[] | HTMLElement[]): HTMLContainer {
		children.forEach(child => {
			if (child instanceof HTMLContainer) this.node.appendChild(child.node)
			else if (child instanceof HTMLElement) this.node.appendChild(child)
		})
		return this
	}
}

export class HTMLParagraph extends HTMLContainer {
	constructor(content = '', classes: string[] = []) {
		super('p', classes)
		this.node.innerHTML = content
	}
}

export class HTMLDiv extends HTMLContainer {
	constructor(classes: string[] = []) {
		super('div', classes)
	}
}

export class HTMLAnchor extends HTMLContainer {
	constructor(content = '', classes: string[] = [], href = '') {
		super('a', classes)
		this.node.innerHTML = content
		this.setAttr('href', href)
	}

	public setHref(val: string): HTMLAnchor {
		this.setAttr('href', val)
		return this
	}
}

export class HTMLButton extends HTMLContainer {
	constructor(content = '', classes: string[] = []) {
		super('button', classes)
		this.node.innerHTML = content
	}
}

export function stringFormat(str: string, ...args: string[]): string {
	return str.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined'
			? args[number] 
			: match
		
	})
}
