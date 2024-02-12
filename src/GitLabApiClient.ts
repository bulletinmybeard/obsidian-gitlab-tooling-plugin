import { requestUrl, Notice, Plugin, RequestUrlResponse } from 'obsidian'

import { BaseClass } from './BaseClass'
import { CacheManager } from './CacheManager'
import { slugifyString } from './Utils'
import { GIT_REST_API_COMPONENTS } from './Constants'

interface IPlugin extends Plugin {
	settings: GitLabToolingPluginSettings;
}

export class GitLabApiClient extends BaseClass {
	plugin: IPlugin
	cache: CacheManager

	constructor(plugin: IPlugin) {
		super()
		this.plugin = plugin
		this.cache = new CacheManager(plugin.app, plugin.manifest.id)
	}

	private async request(sourceInfo: any, endpoint: string = ''): Promise<any> {

		const url = `${sourceInfo.apiRepoUrl}/${endpoint}`
		const cacheKey = slugifyString(url)

		// TODO: Refactor request payload cache!!!
		if (this.plugin.settings.cacheRestApiResponses) {
			const requestCacheItem = this.cache.get(cacheKey)
			if (requestCacheItem) {
				return requestCacheItem
			}
		}

		try {
			const response: RequestUrlResponse = await requestUrl({
				url: url,
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'PRIVATE-TOKEN': this.plugin.settings.gitlabToken,
				},
			})

			if (response.status !== 200) {
				// TODO: Handle errors properly...
				throw new Error(response.text)
			}

			if (this.plugin.settings.cacheRestApiResponses) {
				this.cache.set(cacheKey, response.json)
			}

			return response.json
		} catch (err) {
			const message = err.message.includes('ERR_NAME_NOT_RESOLVED')
				? 'The host is offline or the domain name cannot be resolved.'
				: `An error occurred with the request: ${err.message}`
			console.error(message)
			throw err
		}
	}

	async getPipelines(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, GIT_REST_API_COMPONENTS.PIPELINES)
	}

	async getLatestPipeline(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, GIT_REST_API_COMPONENTS.PIPELINES + '/latest')
	}

	async getMergeRequests(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, GIT_REST_API_COMPONENTS.MERGE_REQUESTS + '?state=opened')
	}

	async getRepoInfo(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo)
	}

	async getBranches(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, `repository/${GIT_REST_API_COMPONENTS.BRANCHES}?order_by=updated_at`)
	}

	async fetchGitLabData(item: { sourceInfo: any, exclude: string[] }): Promise<any> {

		// TODO: Replace error message when cached data is being returned!
		const notice: Notice = new Notice(
			`Retrieving data for '${item.sourceInfo.repoSlug}' from GitLab`, 0)

		const fetchedData: any = {
			branches: [],
			mergeRequests: [],
			pipelines: [],
			repo: {},
		}
		const promises: any[] = []

		promises.push(this.getRepoInfo(item.sourceInfo).then(data => fetchedData['repo'] = data))

		// TODO: Check first whether the repository exists before proceeding with other REST API requests.

		if (!item.exclude.includes(GIT_REST_API_COMPONENTS.PIPELINES)) {
			promises.push(this.getPipelines(item.sourceInfo).then(data => fetchedData['pipelines'] = data))
		}

		if (!item.exclude.includes(GIT_REST_API_COMPONENTS.MERGE_REQUESTS)) {
			promises.push(this.getMergeRequests(item.sourceInfo).then(data => fetchedData['mergeRequests'] = data))
		}

		if (!item.exclude.includes(GIT_REST_API_COMPONENTS.BRANCHES)) {
			promises.push(this.getBranches(item.sourceInfo).then(data => fetchedData['branches'] = data))
		}

		await Promise
			.all(promises)

		setTimeout(() => notice.hide(), 2000)

		return fetchedData
	}
}
