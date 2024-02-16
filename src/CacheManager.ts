import { App } from 'obsidian'
import * as path from 'path'
import * as fs from 'fs'

import { BaseClass } from './BaseClass'
import { convertToSeconds } from './Utils'

export class CacheManager extends BaseClass {
	app: App
	cacheExpirationMs: number
	cacheExpirationDefault: string = '1d' // Defaults to one day
	cacheDirectory: string
	pluginId: string

	/**
	 * Initialize the cache manager.
	 */
	constructor(app: App, pluginId: string, cacheExpiration?: string) {
		super()

		this.app = app
		this.pluginId = pluginId

		// @ts-ignore
		this.cacheDirectory = `${this.app.vault.adapter.basePath}/.obsidian/plugins/${this.pluginId}/cache/`
		this.cacheExpirationMs = convertToSeconds(cacheExpiration ?? this.cacheExpirationDefault)

		this.ensureDirectoryExists()
	}

	/**
	 * Saves a value to the cache.
	 */
	set(cacheKey: string, data: AnyObject): void {
		const cacheEntry = { data, timestamp: Date.now() }
		try {
			fs.writeFileSync(this.cachePath(cacheKey), JSON.stringify(cacheEntry), { encoding: 'utf-8' })
		} catch (err) {
			this.logger.error(`${this.pluginId} error setting cache key:`, err)
		}
	}

	/**
	 * Retrieves a value from the cache.
	 */
	get(cacheKey: string): AnyObject | null {
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
	 * Returns true if the cache entry is still valid.
	 */
	cachePath(cacheKey: string): string {
		return path.resolve(this.cacheDirectory, cacheKey)
	}

	/**
	 * Check the expiration date of a cache entry.
	 */
	isCacheValid(data: AnyObject, timestamp: number): boolean {
		if (!data || !timestamp) {
			return false
		}
		const cacheExpirationMs = this.cacheExpirationMs * 1000
		return (Date.now() - timestamp) < cacheExpirationMs
	}
}
