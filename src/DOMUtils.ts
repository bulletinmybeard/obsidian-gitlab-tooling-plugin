import { formatDate } from './Utils';

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

export const createInfoCards = async (container: any, items: any) => {
	for (let i: number = 0; i < items.length; i++) {
		const item = items[i]

		let cssItem: string[] = ['gt-flex-item']
		if (item?.isHeaderBlock) {
			cssItem.push('gt-flex-item-full-width')
			cssItem.push('gt-flex-item-clear')
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

		if (item?.list) {
			if (item.list.length === 0) {
				const content: HTMLDivElement = createEl('div', {
					cls: 'gt-flex-item-content',
					text: 'No items to display.',
					parent: itemDiv
				})
			} else {
				createList(itemDiv, item.list)
			}
		} else if (item?.content) {
			const content: HTMLDivElement = createEl('div', {
				cls: 'gt-flex-item-content',
				text: item.content,
				parent: itemDiv
			})
		}
	}
}
