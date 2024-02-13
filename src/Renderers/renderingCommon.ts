import { ObsidianApp } from '../main'

import { sortArray, formatDate, deepMerge, limitArrayItems, getElapsedTime } from '../Utils'
import * as dom from '../DOMUtils'
import { CONTENT_BLOCK_MAPPING } from '../Constants'
import { createBadgeImage } from '../Badges'

export default {

    getTheme(): string {
		// @ts-ignore
		const obsidianTheme = (ObsidianApp.vault as any).getConfig('theme')
		if (obsidianTheme === 'obsidian') {
			return 'is-dark'
		} else if (obsidianTheme === 'system') {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				return 'is-dark'
			} else {
				return 'is-light'
			}
		}
        return 'is-dark'
    },

    renderContainer(children: HTMLElement[]): HTMLElement {
        const container: HTMLDivElement = createDiv({ cls: 'gitlab-tooling-repo-container' })
        for (const child of children) {
            container.appendChild(child)
        }
        return container
    },

    async renderGitLabData(item: any, plugin: any, apiData: any): Promise<HTMLElement> {
        const container: HTMLDivElement = createDiv('gt-flex-container')

		const exclude = item.exclude
		const settings = plugin.settings

		const renderContentBlock = (block: string, apiData: any, settings: any, options: any = {}) => {
			options = deepMerge({
				limit: 5,
				sortBy: null,
				sortDirection: 'asc',
			}, options)

			const data: any[] = limitArrayItems(apiData[block], options.limit)

			const keyPathValue = (data: any, keyPath: string): any => {
				return keyPath
					.split('.')
					.reduce((acc, key) => acc[key], data)
			}

			const blockConfig = CONTENT_BLOCK_MAPPING?.[block]
			if (!blockConfig) {
				return []
			}

			return data.reduce((acc: string[], item: any) => {
				const title = keyPathValue(item, blockConfig?.titleKey)
				const date = keyPathValue(item, blockConfig?.date?.key)

				let htmlString = `<a href="${item['web_url']}" target="_blank">${title}</a><br>` +
					`<span>${blockConfig.date.title}: ${getElapsedTime(date)}</span>`

				if (blockConfig.additionalFields && !settings['compactMode']) {
					blockConfig.additionalFields.forEach((field: any) => {
						const value = keyPathValue(item, field.key)
						htmlString += `<br><span>${field.title}: ${value}</span>`
					})
				}

				return acc.concat(htmlString)
			}, [])
		}

		await dom.createListView(container, [
			{
				header: `Git Repository: <a href="${apiData.repo['web_url']}">${apiData.repo.name}</a>`,
				content: '-> show badges here',
				isHeaderBlock: true,
				key: 'header',
			},
			{
				header: 'Open Merge Requests',
				list: renderContentBlock('mergeRequests', apiData, settings),
				key: 'merge-requests',
			},
			{
				header: `Pipelines`,
				list: renderContentBlock('pipelines', apiData, settings, { limit: 2 }),
				key: 'pipelines',
			},
			{
				header: 'Branches',
				list: renderContentBlock('branches', apiData, settings),
				key: 'branches',
			},
			{
				header: 'Releases',
				list: renderContentBlock('releases', apiData, settings),
				key: 'releases',
			},
			{
				header: 'Tags',
				list: renderContentBlock('tags', apiData, settings),
				key: 'tags',
			},
		].filter((item: any) => !exclude.includes(item.key)))

        return container
    }
}
