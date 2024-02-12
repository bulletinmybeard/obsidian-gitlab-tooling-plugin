import { formatDate } from './Utils';

export const createList = (parentElement: any, items: any) => {
	const ul = createEl('ul', {
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

// createListView(content, [
// ])
// if (getType(item.content) === 'array') {
// }


// async updateButton(parentEl: HTMLElement) {
// 	const button: HTMLButtonElement = createEl('button', {
// 		cls: 'gt-button is-small gt-update-button',
// 		text: 'Update',
// 		parent: parentEl,
// 		title: 'Poll GitLab for updates'
// 	})
// 	button.addEventListener('click', function (this: HTMLButtonElement, event: MouseEvent) {
//
// 		const originalText = this.textContent
//
// 		this.textContent = ''
// 		this.classList.add('is-loading')
//
// 		const loader = createEl('span', { cls: 'loader', parent: this })
// 		loader.textContent = 'Polling...'
//
// 		this.disabled = true
//
// 		const fileExplorer = document.querySelector('.nav-files-container')
// 		if (fileExplorer) {
// 			fileExplorer.classList.add('disabled-tree-nav')
// 		}
//
// 		setTimeout(() => {
// 			this.textContent = 'Polling pipelines...'
// 		}, 1500)
//
// 		setTimeout(() => {
// 			this.textContent = 'Polling open merge requests...'
// 		}, 1000)
//
// 		setTimeout(() => {
// 			this.textContent = 'Polling merge request discussions...'
// 		}, 1500)
//
// 		setTimeout(() => {
// 			this.classList.remove('is-loading')
// 			loader.remove()
// 			this.textContent = originalText
// 			this.disabled = false
//
// 			if (fileExplorer) {
// 				fileExplorer.classList.remove('disabled-tree-nav')
// 			}
//
// 		}, 5000)
// 	})
// }

export const createListView = async (container: any, items: any) => {
	for (let i = 0; i < items.length; i++) {
		const item = items[i]

		let cssItem: string[] = ['gt-flex-item']
		if (item?.isHeaderBlock) {
			cssItem.push('gt-flex-item-full-width')
			cssItem.push('gt-flex-item-clear')
		}

		const itemDiv = createDiv({
			cls: cssItem.join(' '),
			parent: container
		})

		if (item?.isHeaderBlock) {
			// await this.updateButton(itemDiv)
		}

		const header = createEl('div', {
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
			const content = createEl('div', {
				cls: 'gt-flex-item-content',
				text: item.content,
				parent: itemDiv
			})
		}
	}
}
