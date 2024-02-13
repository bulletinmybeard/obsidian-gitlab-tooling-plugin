
export const DEFAULT_SETTINGS: GitLabToolingPluginSettings = {
	gitlabUrl: 'https://gitlab.com',
	gitlabToken: '',
	openMergeRequestsOnly: false,
	displayMode: 'detailed',
	enableDebugLogging: true,
	enableAutoPolling: false,
	autoPollingInterval: '5m',
	cacheRestApiResponses: false,
	gitlabApiUrl(): string {
		return `${this.gitlabUrl}/api/v4`
	}
}

export const TIME_UNIT_MAPPING: any = {
	's': 1,           // Second
	'm': 60,          // Minute
	'h': 3600,        // Hour
	'd': 86400,       // Day
	'w': 604800,      // Week
	'M': 2629800,     // Month (average of 30.44 days per month)
	'y': 31557600,    // Year (365.25 days for leap year correction)
}

export const FULL_URL_REGEX: RegExp = /^(https?:\/\/[\da-z.-]+\.?[a-z.]{2,6}(?::\d+)?)?([\/\w -.]*)*\/?$/
export const EXCLUDE_REGEX: RegExp = /exclude:\s*([^\n]+)/

export const VALID_EXCLUDES: string[] = [
	'pipelines',
	'merge-requests',
	'branches',
	'releases',
	'tags',
]

export const CONTENT_BLOCK_MAPPING: any = {
	branches: {
		titleKey: 'name',
		date: {
			title: 'Last update',
			key: 'commit.committed_date',
		}
	},
	tags: {
		titleKey: 'name',
		date: {
			title: 'Created',
			key: 'commit.created_at',
		}
	},
	mergeRequests: {
		titleKey: 'title',
		date: {
			title: 'Last update',
			key: 'updated_at',
		},
		additionalFields: [
			{ title: 'Author', key: 'author.name' },
			{ title: 'Target Branch', key: 'target_branch' },
			{ title: 'Reviewers', key: 'reviewers.length' },
			{ title: 'Unresolved reviews', key: 'reviewThreads.length' },
		]
	},
	pipelines: {
		titleKey: 'ref',
		date: {
			title: 'Pipeline ran',
			key: 'updated_at',
		},
		additionalFields: [
			{ title: 'Status', key: 'status' },
			{ title: 'Sha', key: 'sha' },
		]
	},
	releases: {
		titleKey: 'name',
		date: {
			title: 'Released',
			key: 'released_at',
		},
		additionalFields: [
			{ title: 'Title', key: 'commit.title' },
			{ title: 'Author', key: 'commit.author_name' },
		]
	},
}
