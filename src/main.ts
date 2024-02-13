import { App, Plugin } from 'obsidian'

import { DEFAULT_SETTINGS } from './Constants'
import { GitLabToolingRenderer } from './Renderers/GitLabToolingRenderer'
import { deepMerge } from './Utils'
import { GitlabToolingSettingTab } from './Settings'
import { ThemeChangeObserver } from './ThemeObserver'

export let ObsidianApp: App | null = null
export let ThemeObserver: any | null = null

export default class GitLabToolingPlugin extends Plugin {
	settings: GitLabToolingPluginSettings
	themeObserver: any

	async onload() {
		ObsidianApp = this.app
		ThemeObserver = ThemeChangeObserver

		ThemeObserver.attach()

		this.settings = deepMerge(DEFAULT_SETTINGS, await this.loadData())

		this.addSettingTab(new GitlabToolingSettingTab(this.app, this))

		this.registerMarkdownCodeBlockProcessor('gitlab-tooling', (source: string, el: HTMLElement, ctx: any) => {
			GitLabToolingRenderer(source, el, ctx, this)
		})
	}

	onunload() {
		this.settings = DEFAULT_SETTINGS
		ThemeObserver.detach()
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
