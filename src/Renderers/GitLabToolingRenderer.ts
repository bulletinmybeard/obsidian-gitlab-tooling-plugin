import { MarkdownPostProcessorContext } from 'obsidian'
import { ThemeObserver } from '../main'

import RC from './renderingCommon'

import { GitLabApiClient } from '../GitLabApiClient'
import { parseMarkdownBlock, slugifyString } from '../Utils'

const updateRenderComponents = async (
	parentEl: HTMLElement,
	items: Record<string, HTMLElement>
): Promise<void> => {
	parentEl.replaceChildren(RC.renderContainer(Object.values(items)))
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

	const renderedItems: Record<string, HTMLElement> = {}
	const item = parseMarkdownBlock(plugin, source)

	const apiClient = new GitLabApiClient(plugin, item)

	if (item?.sourceInfo && !Object.isEmpty(item.sourceInfo)) {
		const apiData = await apiClient.fetchGitLabData(item)
		renderedItems[item.sourceInfo.repoSlug] = await RC.renderGitLabData(item, plugin, apiData)
	} else {
		renderedItems[slugifyString(source)] = await renderInvalidGitRepository(source)
	}

	await updateRenderComponents(el, renderedItems)
	ThemeObserver.addListener(async (newTheme: string) => {
		console.log(`Theme updated to: ${newTheme}`);
		// TODO: Only replace the class instead of rerendering the components!
		await updateRenderComponents(el, renderedItems)
	})
}
