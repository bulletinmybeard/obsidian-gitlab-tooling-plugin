import { ObsidianApp } from '../main'

import { sortArray, formatDate, limitArrayItems, getElapsedTime } from '../Utils'
import * as dom from '../DOMUtils'
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
        const container = createDiv({ cls: 'gitlab-tooling-repo-container' })
        for (const child of children) {
            container.appendChild(child)
        }
        return container
    },

    renderError(el: HTMLElement, message: string, searchView: any): void {
        const tagsRow = createDiv('gt-tags has-addons')
        createSpan({ cls: 'gt-tag is-delete is-danger', parent: tagsRow })
        if (searchView) {
            createSpan({ cls: `gt-tag is-danger ${this.getTheme()}`, text: "Search error", parent: tagsRow })
        } else {
            createSpan({ cls: `gt-tag is-danger ${this.getTheme()}`, text: "Search error", parent: tagsRow })
        }
        createSpan({ cls: 'ji-tag is-danger', text: message, parent: tagsRow })
        el.replaceChildren(this.renderContainer([tagsRow]))
    },

    async renderGitLabData(item: any, plugin: any, apiData: any): Promise<HTMLElement> {
        const container: HTMLDivElement = createDiv('gt-flex-container')

		const repoSlug = item.sourceInfo.repoSlug
		const sourceInfo = item.sourceInfo
		const exclude = item.exclude

		// const processData = (apiData: any, type: any) => {
		// 	const data = limitArrayItems(apiData[type], 10)
		// 	const sortedData = sortArray(data, type === 'branches' ? 'commit.committed_date' : 'updated_at')
		//
		// 	return sortedData.reduce((acc, item) => {
		// 		if ((type === 'branches' && !item.merged) ||
		// 			(type === 'mergeRequests' && item.state === 'opened') ||
		// 			type === 'pipelines') {
		//
		// 			let htmlString = `<a href="${item.web_url}" target="_blank">${type === 'branches' ? item.name : item.ref || item.title}</a><br>` +
		// 				`<span>Last update: ${timeAgo(type === 'branches' ? item.commit.committed_date : item.updated_at)}</span>`
		//
		// 			if (!plugin.settings['compactMode'] && type !== 'branches') {
		// 				htmlString += type === 'mergeRequests'
		// 					? `<span>Author: ${item.author.name}</span><br>` +
		// 					`<span>Target Branch: ${item.target_branch}</span><br>` +
		// 					`<span>Assignees: ${item.assignees.length}</span><br>` +
		// 					`<span>Reviewers: ${item.reviewers.length}</span><br>`
		// 					: `<span>Status: ${item.status}</span><br>` +
		// 					`<span>Sha: ${item.sha}</span><br>`
		// 			}
		//
		// 			acc.push(htmlString)
		// 		}
		// 		return acc
		// 	}, [])
		// }

		let branches = []
		let mergeRequests = []
		let pipelines = []

		try {
			branches = sortArray(limitArrayItems(apiData.branches), 'commit.committed_date')
				.reduce((acc: any[], branch: any) => {
					if (!branch['merged']) {
						acc.push(
							`<a href="${branch['web_url']}" target="_blank">${branch.name}</a><br>` +
							`<span>Last update: ${getElapsedTime(branch['commit']['committed_date'])}</span>`
						)
					}
					return acc;
				}, [])
			// console.log('[pipelines] data', branches)
		} catch (error) {
			console.error('[branches] data error', error)
		}

		try {
			mergeRequests = sortArray(limitArrayItems(apiData.mergeRequests), 'updated_at')
				.reduce((acc: any[], mr: any) => {
					if (mr.state === 'opened') {
						let htmlString = `<a href="${mr['web_url']}" target="_blank">${mr.title}</a><br>` +
							`<span>Last update: ${getElapsedTime(mr['updated_at'])}</span>`

						if (!plugin.settings['compactMode']) {
							htmlString += `<span>Author: ${mr['author']['name']}</span><br>` +
								`<span>Target Branch: ${mr['target_branch']}</span><br>` +
								`<span>Assignees: ${mr['assignees'].length}</span><br>` +
								`<span>Reviewers: ${mr['reviewers'].length}</span><br>`
						}

						acc.push(htmlString)
					}
					return acc;
				}, [])
			// console.log('[pipelines] data', mergeRequests)
		} catch (error) {
			console.error('[mergeRequests] data error', error)
		}

		try {
			pipelines = sortArray(limitArrayItems(apiData.pipelines), 'updated_at')
				.reduce((acc: any[], pipeline: any) => {
					let htmlString = `<a href="${pipeline['web_url']}" target="_blank">${pipeline['ref']}</a><br>` +
						`<span>Pipeline ran: ${getElapsedTime(pipeline['updated_at'])}</span>`

					if (!plugin.settings['compactMode']) {
						htmlString +=
							`<span>Status: ${pipeline['status']}</span><br>` +
							`<span>Sha: ${pipeline['sha']}</span><br>`
					}

					return acc.concat(htmlString)
				}, [])
			// console.log('[pipelines] data', pipelines)
		} catch (error) {
			console.error('[pipelines] data error', error)
		}

		// try {
		// 	branches = processData(apiData, 'branches');
		// } catch (error) {
		// 	console.error('[branches] data error', error);
		// }
		//
		// try {
		// 	mergeRequests = processData(apiData, 'mergeRequests');
		// } catch (error) {
		// 	console.error('[mergeRequests] data error', error);
		// }
		//
		// try {
		// 	pipelines = processData(apiData, 'pipelines');
		// } catch (error) {
		// 	console.error('[pipelines] data error', error);
		// }

		await dom.createListView(container, [
			{
				header: `Git Repository: <a href="${apiData.repo['web_url']}">${apiData.repo.name}</a>`,
				content: '-> show badges here',
				isHeaderBlock: true,
				key: 'header',
			},
			{
				header: 'Open Merge Requests',
				list: mergeRequests,
				key: 'merge-requests',
			},
			{
				header: 'Pipelines',
				list: pipelines,
				key: 'pipelines',
			},
			{
				header: 'Branches',
				list: branches,
				key: 'branches',
			},
		].filter((item: any) => !exclude.includes(item.key)))

        return container
    }
}
