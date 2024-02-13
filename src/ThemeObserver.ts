class ThemeChangeObserverClass {
	#observer

	constructor() {
		this.#observer = new MutationObserver((mutations: MutationRecord[]): void => {
			mutations.forEach((mutation: MutationRecord) => {
				const element: Node = mutation.target
				if (!(element instanceof HTMLElement)) {
					return
				}

				if (this.#isThemeChange(mutation.oldValue, 'theme-dark', 'theme-light')) {
					console.log('Theme changed: dark -> light')
				} else if (this.#isThemeChange(mutation.oldValue, 'theme-light', 'theme-dark')) {
					console.log('Theme changed: light -> dark')
				}
			})
		})
	}

	#isThemeChange(oldValue: any, fromTheme: any, toTheme: any): string {
		const target: HTMLElement = document.body
		return oldValue?.includes(fromTheme) && !oldValue?.includes(toTheme) && target.classList.contains(toTheme)
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
			return 'dark'
		} else if (classList.contains('theme-light')) {
			return 'light'
		}
		return 'light'
	}
}

export const ThemeChangeObserver = new ThemeChangeObserverClass()
