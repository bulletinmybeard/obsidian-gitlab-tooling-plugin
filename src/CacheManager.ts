import { App } from 'obsidian'
import * as path from 'path'
import * as fs from 'fs'

import { BaseClass } from './BaseClass'
import { convertToSeconds } from './Utils'

export class CacheManager extends BaseClass {
	app: App
	cacheExpirationMs: number
	cacheDirectory: string
	pluginId: string

	/**
	 * Initialize the cache manager.
	 * @param {App} app
	 * @param {string} pluginId
	 * @param {string} cacheExpiration
	 */
	constructor(app: App, pluginId: string, cacheExpiration?: string) {
		super()

		this.app = app
		this.pluginId = pluginId

		// @ts-ignore
		this.cacheDirectory = `${this.app.vault.adapter.basePath}/.obsidian/plugins/${this.pluginId}/cache/`
		this.cacheExpirationMs = convertToSeconds(cacheExpiration ?? '1d') // Defaults to one day

		this.ensureDirectoryExists()
	}

	/**
	 * Saves a value to the cache.
	 * @param {string} cacheKey
	 * @param {any} data
	 * @return {void}
	 */
	set(cacheKey: string, data: any): void {
		const cacheEntry = { data, timestamp: Date.now() }
		try {
			fs.writeFileSync(this.cachePath(cacheKey), JSON.stringify(cacheEntry), { encoding: 'utf-8' })
		} catch (err) {
			this.logger.error(`${this.pluginId} error setting cache key:`, err)
		}
	}

	/**
	 * Retrieves a value from the cache.
	 * @param {string} cacheKey
	 * @return {any}
	 */
	get(cacheKey: string): any {
		try {
			const cacheEntry = JSON.parse(fs.readFileSync(this.cachePath(cacheKey), { encoding: 'utf-8' }))
			return this.isCacheValid(
				cacheEntry.data,
				cacheEntry.timestamp
			) ? cacheEntry.data : null
		} catch (err) {
			this.logger.info(`${this.pluginId} error getting cache key:`, err)
			return null
		}
	}

	/**
     * Removes a value from the cache.
     * @param {string} cacheKey
	 * @return {void}
     */
	remove(cacheKey: string): void {
		try {
			fs.unlinkSync(this.cachePath(cacheKey))
		} catch (err) {
			this.logger.error(`${this.pluginId} error removing cache key:`, err)
		}
	}

	/**
	 * Creates the cache directory inside this plugin directory.
	 */
	ensureDirectoryExists(): void {
		if (!(fs.existsSync(this.cacheDirectory))) {
			try {
				fs.mkdirSync(this.cacheDirectory, { recursive: true })
				this.logger.info(`'${this.pluginId}' cache directory successfully created.`)
			} catch (err) {
				this.logger.error(`Error creating '${this.pluginId}' cache directory:`, err)
			}
		} else {
			this.logger.debug(`${this.pluginId} cache directory '${this.cacheDirectory}' exists.`)
		}
	}

	/**
	 * Removes all cached items from the cache directory.
	 * @return {Promise<void>}
	 */
	async flush(): Promise<void> {
		try {
			// TODO: Refactor all this...
			const files = await this.app.vault.adapter.list(this.cacheDirectory)
			if (files && files.files) {
				for (const filePath of files.files) {
					await this.app.vault.adapter.remove(filePath)
				}
			}
			this.logger.info(`'${this.pluginId}' cache directory flushed successfully.`)
		} catch (err) {
			this.logger.error(`Error flushing '${this.pluginId}' cache directory:`, err)
		}
	}

	/**
	 * Returns true if the cache entry is still valid.
	 * @param {string} cacheKey
	 * @return {string}
	 */
	cachePath(cacheKey: string): string {
		return path.resolve(this.cacheDirectory, cacheKey)
	}

	isCacheValid(data: any, timestamp: number): boolean {
		if (!data || !timestamp) {
			return false
		}
		const cacheExpirationMs = convertToSeconds('1d') * 1000
		return (Date.now() - timestamp) < cacheExpirationMs
	}
}
