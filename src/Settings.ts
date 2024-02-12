import { App, Plugin, PluginSettingTab } from 'obsidian'

import { SettingsGenerator } from './SettingsGenerator'

export class GitlabToolingSettingTab extends PluginSettingTab {
	plugin: Plugin

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

		new SettingsGenerator(this.plugin, containerEl)
			.addSettings([
				{
					name: 'Gitlab instance URL',
					desc: 'Use your own Gitlab instance instead of the public hosted Gitlab.',
					type: 'text',
					placeholder: 'https://gitlab.com',
					settingKey: 'gitlabUrl',
				},
				{
					name: 'Personal Access Token',
					desc: 'Create a personal access token in your Gitlab account and enter it here.',
					type: 'text',
					placeholder: 'Token',
					settingKey: 'gitlabToken',
				},
				{
					name: 'Open Merge Requests',
					desc: 'Only fetch open merge requests.',
					type: 'toggle',
					settingKey: 'openMergeRequestsOnly',
				},
				{
					name: 'Compact Info Card',
					desc: 'Show Badges instead of the default info card.',
					type: 'toggle',
					settingKey: 'compactInfoCard',
				},
				{
					name: 'Compact Mode',
					desc: 'Toggle between \'Full Details\' for more information or \'Compact Mode\' for a concise view.',
					type: 'toggle',
					settingKey: 'compactMode',
				},
				{
					name: 'Enable Debug Logging',
					desc: 'Toggle to enable detailed debug log messages for troubleshooting and development purposes.',
					type: 'toggle',
					settingKey: 'enableDebugLogging',
				},
				{
					name: 'Enable auto-polling',
					desc: 'If enabled it will poll the GitLab REST API resources periodically.',
					type: 'toggle',
					settingKey: 'enableAutoPolling',
				},
				{
					name: 'Auto-polling interval',
					desc: 'Interval (e.g., 5m, 20m, 1h, etc.) at which to poll GitLab for updates.',
					type: 'text',
					placeholder: '5m',
					settingKey: 'autoPollingInterval',
					dependsOn: 'enableAutoPolling'
				},
				{
					name: 'Cache REST API responses',
					desc: 'Useful if account is rate limited.',
					type: 'toggle',
					settingKey: 'cacheRestApiResponses',
				},
			])
	}
}
