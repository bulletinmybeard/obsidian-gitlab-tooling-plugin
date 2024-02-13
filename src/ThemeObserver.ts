class ThemeChangeObserverClass {
	#observer
	#listeners = []

	constructor() {
		this.#observer = new MutationObserver((mutations: MutationRecord[]): void => {
			mutations.forEach((mutation: MutationRecord) => {
				if (this.#isThemeChange(mutation)) {
					const newTheme: string = this.getCurrentTheme()
					console.log(`Observer: Theme changed to ${newTheme}`)
					this.#notifyListeners(newTheme)
				}
			})
		})
	}

	#isThemeChange(mutation: any) {
		const element = mutation.target
		return element instanceof HTMLElement && (
			(mutation.oldValue?.includes('theme-dark') && document.body.classList.contains('theme-light')) ||
			(mutation.oldValue?.includes('theme-light') && document.body.classList.contains('theme-dark'))
		)
	}

	attach(): void {
		this.#observer.observe(document.body, {
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['class'],
		})
	}

	detach(): void {
		this.#observer.disconnect()
	}

	getCurrentTheme(): string {
		const classList: DOMTokenList = document.body.classList
		if (classList.contains('theme-dark')) {
			return 'dark-mode'
		} else if (classList.contains('theme-light')) {
			return 'light-mode'
		}
		return 'light-mode'
	}

	addListener(listener: any): void {
		// @ts-ignore
		this.#listeners.push(listener)
	}

	removeListener(listener: any): void {
		// @ts-ignore
		const index = this.#listeners.indexOf(listener)
		if (index > -1) {
			this.#listeners.splice(index, 1)
		}
	}

	#notifyListeners(newTheme: any): void {
		// @ts-ignore
		this.#listeners.forEach(listener => listener(newTheme))
	}
}

export const ThemeChangeObserver = new ThemeChangeObserverClass()

// Listener example:
// ThemeObserver.addListener((newTheme: string) => {
// 	console.log(`Theme updated to: ${newTheme}`);
// 	...
// })
