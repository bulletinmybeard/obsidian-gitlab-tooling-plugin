import { App, PluginSettingTab, Setting } from 'obsidian'

import { capitalizeFirstLetter, getType } from './Utils'
import { PLUGIN_SETTINGS } from './Constants'

export class GitlabToolingSettingTab extends PluginSettingTab {
	plugin: any
	settingsArray: SettingItem[]
	inputDebounceTimeoutMs: any = 350

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

		this.settingsArray = PLUGIN_SETTINGS

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
					const debouncedSave = this.debounceInput(async (value: any) => {
						if (`${value}`.length > 0
							&& setting?.validationPattern
							&& !new RegExp(setting.validationPattern, 'g').test(value)) {
							if (`${value}`.length > 0) {
								component.settingEl.setAttribute('data-setting', setting.settingKey)
								console.log(`[${setting.name}] Validation error ${setting.settingKey}`, value)
								component.settingEl.classList.add('validation-error')
								return
							}
						}
						component.settingEl.classList.remove('validation-error')
						console.log(`[${setting.name}] ${setting.settingKey}`, value)
						this.plugin.settings[setting.settingKey] = value
						await this.plugin.saveSettings()
						/**
						 * Only
						 */
						if (setting?.dependsOn
							|| (!setting?.dependsOn
								&& PLUGIN_SETTINGS.find((set: any) =>
									(set?.dependsOn
										&& set.dependsOn === setting.settingKey)))) {
							this.display()
						}
					}, this.inputDebounceTimeoutMs)

					comp.onChange((value: any) => {
						debouncedSave(value)
					})
				}
			})
			component.settingEl.setAttribute('data-setting', setting.settingKey)
		} else {
			console.error(`Unsupported setting type: ${setting.type}`)
		}
	}

	debounceInput(func: any, wait: any) {
		let timeout: any
		return (...args: any[]) => {
			const later = () => {
				clearTimeout(timeout)
				func(...args)
			}
			clearTimeout(timeout)
			timeout = setTimeout(later, wait)
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
