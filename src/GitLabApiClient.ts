import { requestUrl, Notice, Plugin, RequestUrlResponse } from 'obsidian'

import { BaseClass } from './BaseClass'
import { CacheManager } from './CacheManager'
import { slugifyString } from './Utils'

interface IPlugin extends Plugin {
	settings: GitLabToolingPluginSettings;
}

export class GitLabApiClient extends BaseClass {
	plugin: IPlugin
	cache: CacheManager
	item: any

	constructor(plugin: IPlugin, item: any) {
		super()
		this.plugin = plugin
		this.item = item
		this.cache = new CacheManager(plugin.app, plugin.manifest.id)
	}

	private async request(endpoint: string = '', method: string = 'GET'): Promise<any> {
		const url: string = `${this.item.sourceInfo.apiRepoUrl}/${endpoint}`
		try {
			const cacheKey = slugifyString(url)

			// TODO: Refactor request payload cache!!!
			if (this.plugin.settings.cacheRestApiResponses) {
				const requestCacheItem = this.cache.get(cacheKey)
				if (requestCacheItem) {
					return requestCacheItem
				}
			}
			const response: RequestUrlResponse = await requestUrl({
				url,
				method,
				headers: {
					'Content-Type': 'application/json',
					'PRIVATE-TOKEN': this.plugin.settings.gitlabToken,
				},
				throw: false,
			})
			if (response.status === 200) {
				if (this.plugin.settings.cacheRestApiResponses) {
					this.cache.set(cacheKey, response.json)
				}
				return response.json
			} else {
				throw new Error(`Request '${url}' failed with status: ${response.status}`)
			}
		} catch (err) {
			if (err instanceof Error && err.message.includes('ERR_NAME_NOT_RESOLVED')) {
				throw new Error(`The host '${this.item.sourceInfo.apiRepoUrl}' is offline or the domain name cannot be resolved.`)
			} else {
				throw new Error(`An error occurred while fetching data from GitLab '${url}'.`)
			}
		}
	}

	async handleApiRequest(requestPromise: any) {
		try {
			const data = await requestPromise
			return { success: true, data }
		} catch (error) {
			if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
				return { success: false, error: 'Host not reachable', critical: true }
			}
			return { success: false, error: error.message }
		}
	}

	requestWrapper(key: string, promise: any) {
		return promise
			.then((data: any) => ({ success: true, key, data }))
			.catch((error: any) => {
				let errorMessage = error.message
				if (errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
					errorMessage = 'Host not reachable'
				}
				return { success: false, key, error: errorMessage }
			})
	}

	async getProjectPipelines(): Promise<any> {
		return this.request('pipelines')
	}

	async getOpenMergeRequests(): Promise<any> {
		const endpoint = `merge_requests${this.plugin.settings.openMergeRequestsOnly ? '?state=opened' : ''}`;
		return this
			.request(endpoint)
			.then((data: any) =>
				this.processMergeRequestDiscussions(data))
	}

	async getOpenMergeRequestDiscussions(mergeRequestIID: number): Promise<any> {
		const endpoint = `merge_requests/${mergeRequestIID}/discussions?order_by=updated_at`
		return this.request(endpoint)
	}

	async processMergeRequestDiscussions(data: any): Promise<any> {
		if (data.length > 0) {
			return await Promise
				.all(data.map(async (mr: any): Promise<any> => {
					/**
					 * Merge requests can have open and unresolved review threads
					 * that are being filtered out of the available discussions.
					 */
					const authorId = mr['author']['id']
					mr.reviewThreads = await this.getOpenMergeRequestDiscussions(mr['iid'])
						.then((discussions: any) => {
							return discussions.reduce((acc: any, discussion: any) => {
								for (const note of discussion['notes']) {
									if (note['resolvable']
										&& !note['resolved']
										&& note['author']['id'] !== authorId) {
										acc.push(note)
									}
								}
								return acc
							}, [])
						})
					return mr
				}))
		}
		return []
	}

	async getProjectDetails(): Promise<any> {
		return this.request()
	}

	async getBranches(): Promise<any> {
		return this.request('repository/branches?order_by=updated_at')
	}

	async getReleases(): Promise<any> {
		return this.request('releases')
	}

	async getRepositoryTags(): Promise<any> {
		return this.request('repository/tags')
	}

	async fetchGitLabData(item: { sourceInfo: any, exclude: string[] }): Promise<any> {

		// TODO: Replace error message when cached data is being returned!
		const notice: Notice = new Notice(
			`Retrieving data for '${item.sourceInfo.repoSlug}' from GitLab`, 0)

		/**
		 * `getProjectDetails` is being called outside `Promise.all`
		 * and used to test the connection to GitLab.
		 */
		const repo = await this.getProjectDetails()

		return Promise
			.all([
				this.requestWrapper('branches', this.getBranches()),
				this.requestWrapper('mergeRequests', this.getOpenMergeRequests()),
				this.requestWrapper('releases', this.getReleases()),
				this.requestWrapper('tags', this.getRepositoryTags()),
				this.requestWrapper('pipelines', this.getProjectPipelines()),
			])
			.then((responses: any) => {
				const errors: any = {}
				const promises: any = {
					repo,
					branches: [],
					mergeRequests: [],
					releases: [],
					tags: [],
					pipelines: [],
				}
				responses.forEach((response: any) => {
					if (response.success) {
						promises[response.key] = response.data
					} else {
						errors[response.key] = response.error
					}
				})
				notice.hide()
				return { errors, promises }
			})
	}

	wrapRequest(key: string, promise: any) {
		return promise
			.then((data: any) => ({ success: true, key, data }))
			.catch((error: any) => {
				let errorMessage = error.message
				if (errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
					errorMessage = 'Host not reachable'
				}
				return { success: false, key, error: errorMessage }
			})
	}
}
