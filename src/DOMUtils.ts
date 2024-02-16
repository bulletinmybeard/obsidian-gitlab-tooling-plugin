import { createBadgeImageGroup } from './Badges'

export const createList = (parentElement: any, items: any) => {
	const ul: HTMLUListElement = createEl('ul', {
		cls: 'gt-unordered-list',
		parent: parentElement
	})
	items.forEach((item: any) => {
		const li: HTMLLIElement = createEl('li', {
			text: item,
			parent: ul
		})
		li.innerHTML = item
	})
}

export const createInfoCards = async (container: HTMLElement, errors: any[], items: any): Promise<void> => {
	for (let i: number = 0; i < items.length; i++) {
		const item = items[i]

		let cssItem: string[] = ['gt-flex-item']
		if (item?.isHeaderBlock) {
			cssItem.push('gt-flex-item-full-width')
			cssItem.push('gt-flex-item-clear')
		}

		if (errors?.[item.key]) {
			cssItem.push('gt-flex-item-error')
		}

		const itemDiv: HTMLDivElement = createDiv({
			cls: cssItem.join(' '),
			parent: container
		})

		if (item?.isHeaderBlock) {
			// await this.updateButton(itemDiv)
		}

		const header: HTMLDivElement = createEl('div', {
			cls: 'gt-flex-item-header',
			parent: itemDiv
		})

		header.innerHTML = item.header

		if (errors?.[item.key]) {
			createEl('div', {
				cls: 'gt-flex-item-content',
				text: errors[item.key],
				parent: itemDiv
			})
		} else {
			if (item?.list) {
				if (item.list.length === 0) {
					createEl('div', {
						cls: 'gt-flex-item-content',
						text: 'No items to display.',
						parent: itemDiv
					})
				} else {
					createList(itemDiv, item.list)
				}
			} else if (item?.content) {
				createEl('div', {
					cls: 'gt-flex-item-content',
					text: item.content,
					parent: itemDiv
				})
			} else if (item?.badges) {
				createBadgeImageGroup(item.badges, itemDiv)
			}
		}
	}
}
