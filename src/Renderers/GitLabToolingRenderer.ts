import { MarkdownPostProcessorContext } from 'obsidian'

import RC from './renderingCommon'

import { GitLabApiClient } from '../GitLabApiClient'
import { parseMarkdownBlock, slugifyString } from '../Utils'

const updateRenderComponents = async (
	parentEl: HTMLElement,
	items: Record<string, HTMLElement>,
	source: string
): Promise<void> => {
	parentEl.replaceChildren(RC.renderContainer(Object.values(items)))
	// if (!Object.isEmpty(items)) {
	// 	parentEl.replaceChildren(RC.renderContainer(Object.values(items)))
	// } else {
	// 	parentEl.replaceChildren(RC.renderContainer([await renderInvalidGitRepository(source)]))
	// }
}

const renderInvalidGitRepository = async (source: string): Promise<HTMLElement> => {
	const parentEl: HTMLDivElement = createDiv('gt-flex-container')
	const truncatedSource = (str: string, num: number = 65) => str.length > num ? str.slice(0, num) + '...' : str
	createDiv({ cls: 'gt-flex-item gt-flex-item-full-width', text: `Invalid GitLab Repository: ${truncatedSource(source)}`, parent: parentEl })
	return parentEl
}

export const GitLabToolingRenderer = async (
	source: string,
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext,
	plugin: any,
): Promise<void> => {

	const apiClient = new GitLabApiClient(plugin)

	const renderedItems: Record<string, HTMLElement> = {}
	const item = parseMarkdownBlock(plugin, source)

	if (item?.sourceInfo && !Object.isEmpty(item.sourceInfo)) {
		const apiData = await apiClient.fetchGitLabData(item)
		renderedItems[item.sourceInfo.repoSlug] = await RC.renderGitLabData(item, plugin, apiData)
	} else {
		renderedItems[slugifyString(source)] = await renderInvalidGitRepository(source)
	}

	await updateRenderComponents(el, renderedItems, source)
}
