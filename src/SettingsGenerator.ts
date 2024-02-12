import { Setting, Plugin } from 'obsidian'

import { BaseClass } from './BaseClass'
import { capitalizeFirstLetter } from './Utils'

export class SettingsGenerator extends BaseClass {
	plugin: any
	containerEl: HTMLElement

	constructor(plugin: Plugin, containerEl: HTMLElement) {
		super()
		this.plugin = plugin
		this.containerEl = containerEl
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
		if (typeof newSetting[componentType] === 'function') {
			const component = newSetting[componentType]((comp: any) => {
				if ('setPlaceholder' in comp && setting.placeholder) {
					comp.setPlaceholder(setting.placeholder)
				}
				if ('setValue' in comp) {
					comp.setValue(this.plugin.settings[setting.settingKey])
				}
				if ('onChange' in comp) {
					comp.onChange(async (value: any) => {
						console.log(`[${setting.name}] ${setting.settingKey}`, value)
						this.plugin.settings[setting.settingKey] = value
						await this.plugin.saveSettings()
					})
				}
			})

			// if (setting?.dependsOn) {
			// 	const dependencySetting = this.plugin.settings[setting.dependsOn]
			// 	const updateVisibility = () => {
			// 		component.settingEl.style.display = dependencySetting ? '' : 'none'
			// 	}
			// 	updateVisibility()
			// 	// @ts-ignore
			// 	this.containerEl.querySelector(`[data-setting="${setting.dependsOn}"] input[type="checkbox"]`).addEventListener('change', (event) => {
			// 	})
			// }

			component.settingEl.setAttribute('data-setting', setting.settingKey)
		} else {
			this.logger.error(`Unsupported setting type: ${setting.type}`)
		}
	}

	/**
	 * Adds a setting instance to the settings container.
	 * @param {SettingItem[]} settingsArray
	 * @return {void}
	 */
	addSettings(settingsArray: SettingItem[]): void {
		settingsArray
			.forEach((setting: SettingItem) => {
				this.addDynamicSetting(setting)
			})
	}
}
