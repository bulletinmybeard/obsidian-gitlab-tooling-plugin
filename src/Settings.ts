import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'

import { capitalizeFirstLetter, getType } from './Utils'

export class GitlabToolingSettingTab extends PluginSettingTab {
	plugin: any
	settingsArray: SettingItem[]

	constructor(app: App, plugin: any) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()
		containerEl.createEl('h1', {
			text: 'GitLab Tooling Configuration'
		})

		this.settingsArray = [
			{
				name: 'GitLab Host URL',
				desc: `Specify the URL of your GitLab instance if you're using a self-hosted version. Default is GitLab.com.`,
				type: 'text',
				placeholder: 'https://gitlab.com',
				settingKey: 'gitlabUrl',
			},
			{
				name: 'Personal Access Token',
				desc: 'Enter your GitLab Personal Access Token for authentication. Required for accessing private projects or for increased rate limits.',
				type: 'text',
				placeholder: 'Your Personal Access Token',
				settingKey: 'gitlabToken',
			},
			{
				name: 'Custom API Headers',
				desc: 'Define custom headers for API requests for advanced use cases.',
				placeholder: 'e.g., X-Custom-Header: Value',
				type: 'text',
				settingKey: 'customApiHeaders',
			},
			{
				name: 'Only pull Open Merge Requests',
				desc: 'Enable to only include open merge requests in the fetched data.',
				type: 'toggle',
				settingKey: 'openMergeRequestsOnly',
			},
			{
				name: 'Display Mode',
				desc: 'Choose between displaying detailed info cards or compact badges for merge requests and issues',
				type: 'dropdown',
				settingKey: 'displayMode',
				placeholder: 'Detailed',
				options: [
					{
						text: 'Detailed',
						value: 'detailed'
					},
					{
						text: 'Compact',
						value: 'compact'
					}
				],
			},
			{
				name: 'Enable Auto-Polling',
				desc: `Automatically poll GitLab for updates at specified intervals. Helps keep data up-to-date without manual refresh.`,
				type: 'toggle',
				settingKey: 'enableDebugLogging',
			},
			{
				name: 'Polling Interval',
				desc: `Set the frequency for auto-polling GitLab updates (e.g., '5m' for every 5 minutes, '1h' for hourly). Requires auto-polling to be enabled.`,
				placeholder: 'e.g., 5m, 1h',
				type: 'text',
				settingKey: 'enableAutoPolling',
			},
			{
				name: 'Cache API Responses',
				desc: 'Enable caching of GitLab API responses to minimize rate limiting issues and improve performance.',
				type: 'toggle',
				settingKey: 'cacheRestApiResponses',
			},
			{
				name: 'Maximum Display Items',
				desc: 'Limit the number of items (merge requests, issues, etc.) displayed at once.',
				placeholder: 'e.g., 10',
				type: 'text',
				settingKey: 'maxDisplayItems',
			},
			{
				name: 'Custom Date Format',
				desc: 'Specify the date format used for displaying dates within the plugin.',
				placeholder: 'e.g., YYYY-MM-DD',
				type: 'text',
				settingKey: 'customDateFormat',
			},
		]

		this.addSettings()
	}

	/**
	 * Adds a setting block to the settings page.
	 * @param {SettingItem} setting
	 * @return {void}
	 */
	addDynamicSetting = (setting: any): void => {

		const newSetting: any = new Setting(this.containerEl)
			.setName(setting.name)
			.setDesc(setting.desc)

		const componentType = `add${capitalizeFirstLetter(setting.type)}`
		if (getType(newSetting[componentType]) === 'function') {
			const component = newSetting[componentType]((comp: any) => {
				if ('setDisabled' in comp && setting?.disabled) {
					comp.setDisabled(setting.disabled)
				}
				if ('addOption' in comp && setting.type === 'dropdown' && setting?.options) {
					for (const option of setting.options) {
						comp.addOption(option.value, option.text)
					}
				}
				if ('setPlaceholder' in comp && setting?.placeholder) {
					comp.setPlaceholder(setting.placeholder)
				}
				if ('setValue' in comp) {
					comp.setValue(this.plugin.settings[setting?.settingKey])
				}
				if ('onChange' in comp) {
					comp.onChange(async (value: any) => {
						console.log(`[${setting.name}] ${setting.settingKey}`, value)
						this.plugin.settings[setting.settingKey] = value
						await this.plugin.saveSettings()
						this.display()
					})
				}
			})
			component.settingEl.setAttribute('data-setting', setting.settingKey)
		} else {
			console.error(`Unsupported setting type: ${setting.type}`)
		}
	}

	/**
	 * @return {void}
	 */
	addSettings(): void {
		this.settingsArray
			.forEach((setting: SettingItem) => {
				/**
				 * Adds a dynamic setting if the `setting` does not depend on another setting,
				 * or if it does and the dependent setting is enabled.
				 */
				if (setting?.dependsOn) {
					if (this.plugin.settings?.[setting.dependsOn]) {
						this.addDynamicSetting(setting)
					}
				} else {
					this.addDynamicSetting(setting)
				}
			})
	}
}
