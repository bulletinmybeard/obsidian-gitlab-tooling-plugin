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

	constructor(plugin: IPlugin) {
		super()
		this.plugin = plugin
		this.cache = new CacheManager(plugin.app, plugin.manifest.id)
	}

	private async request(sourceInfo: any, endpoint: string = '', method: string = 'GET'): Promise<any> {
		const url: string = `${sourceInfo.apiRepoUrl}/${endpoint}`
		try {
			const response: RequestUrlResponse = await requestUrl({
				url,
				method,
				headers: {
					'Content-Type': 'application/json',
					'PRIVATE-TOKEN': this.plugin.settings.gitlabToken,
				},
			})

			if (response.status === 200) {
				return response.json
			} else {
				throw new Error(`Request failed with status: ${response.status}`)
			}
		} catch (err) {
			if (err instanceof Error && err.message.includes('ERR_NAME_NOT_RESOLVED')) {
				throw new Error('The host is offline or the domain name cannot be resolved.')
			} else {
				throw new Error('An error occurred while fetching data from GitLab.')
			}
		}
	}

	async getProjectPipelines(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, 'pipelines')
	}

	async retryProjectPipeline(sourceInfo: any, pipelineId: number): Promise<any> {
		return this.request(sourceInfo, `pipelines/${pipelineId}/retry`, 'POST')
	}

	async getOpenMergeRequests(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, 'merge_requests?state=opened')
	}

	async getOpenMergeRequestDiscussions(sourceInfo: any, mergeRequestIID: number): Promise<any> {
		return this.request(sourceInfo, `merge_requests/${mergeRequestIID}/discussions?order_by=updated_at`)
	}

	async getProjectDetails(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo)
	}

	async getBranches(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, `repository/branches?order_by=updated_at`)
	}

	async getReleases(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, 'releases')
	}

	async getRepositoryTags(sourceInfo: any): Promise<any> {
		return this.request(sourceInfo, 'repository/tags')
	}

	async fetchGitLabData(item: { sourceInfo: any, exclude: string[] }): Promise<any> {

		// TODO: Replace error message when cached data is being returned!
		const notice: Notice = new Notice(
			`Retrieving data for '${item.sourceInfo.repoSlug}' from GitLab`, 0)

		const fetchedData: any = {
			repo: {},
			branches: [],
			mergeRequests: [],
			pipelines: [],
			releases: [],
			tags: [],
		}
		const promises: any[] = []

		promises.push(this.getProjectDetails(item.sourceInfo).then(data => fetchedData['repo'] = data))

		// TODO: Check first whether the repository exists before proceeding with other REST API requests.

		if (!item.exclude.includes('pipelines')) {
			promises.push(this.getProjectPipelines(item.sourceInfo).then(data => fetchedData['pipelines'] = data))
		}

		if (!item.exclude.includes('merge-requests')) {
			promises.push(
				this
					.getOpenMergeRequests(item.sourceInfo)
					.then(async (data) => {
						if (data.length > 0) {
							return fetchedData['mergeRequests'] = await Promise
								.all(data.map(async (mr: any): Promise<any> => {
									/**
									 * TODO: Add settings option to exclude those sub-requests
									 *
									 * Merge requests can have open and unresolved review threads
									 * that are being filtered out of the available discussions.
									 */
									const authorId = mr['author']['id']
									mr.reviewThreads = await this.getOpenMergeRequestDiscussions(item.sourceInfo, mr['iid'])
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
					}))
		}

		if (!item.exclude.includes('branches')) {
			promises.push(this.getBranches(item.sourceInfo).then(data => fetchedData['branches'] = data))
		}

		if (!item.exclude.includes('releases')) {
			promises.push(this.getReleases(item.sourceInfo).then(data => fetchedData['releases'] = data))
		}

		if (!item.exclude.includes('tags')) {
			promises.push(this.getRepositoryTags(item.sourceInfo).then(data => fetchedData['tags'] = data))
		}

		await Promise
			.all(promises)
			.finally(() => {
				notice.hide()
			})

		return fetchedData
	}
}
