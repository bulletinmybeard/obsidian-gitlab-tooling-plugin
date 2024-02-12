import { App, Plugin } from 'obsidian'

import { DEFAULT_SETTINGS } from './Constants'
import { GitLabToolingRenderer } from './Renderers/GitLabToolingRenderer'
import { deepMerge } from './Utils'
import { GitlabToolingSettingTab } from './Settings'

export let ObsidianApp: App | null = null

export default class GitLabToolingPlugin extends Plugin {
	settings: GitLabToolingPluginSettings

	async onload() {
		ObsidianApp = this.app

		this.settings = deepMerge(DEFAULT_SETTINGS, await this.loadData())

		this.addSettingTab(new GitlabToolingSettingTab(this.app, this))

		this.registerMarkdownCodeBlockProcessor('gitlab-tooling', (source: string, el: HTMLElement, ctx: any) => {
			GitLabToolingRenderer(source, el, ctx, this)
		})
	}

	onunload() {
		this.settings = DEFAULT_SETTINGS
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
