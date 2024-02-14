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

export const PLUGIN_SETTINGS: any = [
	{
		name: 'GitLab Host URL',
		desc: `Specify the URL of your GitLab instance if you're using a self-hosted version. Default is GitLab.com.`,
		type: 'text',
		placeholder: 'https://gitlab.com',
		settingKey: 'gitlabUrl',
		validationPattern: '^https?:\\/\\/[^ "]+$',
		defaultValue: 'https://gitlab.com',
	},
	{
		name: 'Personal Access Token',
		desc: 'Enter your GitLab Personal Access Token for authentication. Required for accessing private projects or for increased rate limits.',
		type: 'text',
		placeholder: 'Your Personal Access Token',
		settingKey: 'gitlabToken',
		validationPattern: '^[a-zA-Z0-9_-]+$',
		defaultValue: '',
	},
	// {
	// 	name: 'Custom API Headers',
	// 	desc: 'Define custom headers for API requests for advanced use cases.',
	// 	placeholder: 'e.g., X-Custom-Header: Value',
	// 	type: 'text',
	// 	settingKey: 'customApiHeaders',
	// 	defaultValue: '',
	// },
	{
		name: 'Only pull Open Merge Requests',
		desc: 'Enable to only include open merge requests in the fetched data.',
		type: 'toggle',
		settingKey: 'openMergeRequestsOnly',
		defaultValue: true
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
			},
			{
				text: 'Compact (Badges only)',
				value: 'compact-badges'
			}
		],
		defaultValue: 'detailed',
	},
	{
		name: 'Enable Auto-Polling',
		desc: `Automatically poll GitLab for updates at specified intervals. Helps keep data up-to-date without manual refresh.`,
		type: 'toggle',
		settingKey: 'enableDebugLogging',
		defaultValue: true,
	},
	{
		name: 'Cache API Responses',
		desc: 'Enable caching of GitLab API responses to minimize rate limiting issues and improve performance.',
		type: 'toggle',
		settingKey: 'cacheRestApiResponses',
		defaultValue: false,
	},
	{
		name: 'Maximum Display Items',
		desc: 'Limit the number of items (merge requests, issues, etc.) displayed at once.',
		placeholder: 'e.g., 10',
		type: 'text',
		settingKey: 'maxDisplayItems',
		validationPattern: '^(1?[0-9]|20)$',
		defaultValue: 10,
	},
	{
		name: 'Custom Date Format',
		desc: 'Specify the date format used for displaying dates within the plugin.',
		placeholder: 'e.g., YYYY-MM-DD',
		type: 'text',
		settingKey: 'customDateFormat',
		// validationPattern: '[a-zA-Z0-9\\/\\-.]{1,15}$',
		defaultValue: 'YYYY-MM-DD',
	},
]

export const DEFAULT_SETTINGS: GitLabToolingPluginSettings = PLUGIN_SETTINGS.reduce((acc: any, setting: any) => {
	acc[setting.settingKey] = setting.defaultValue
	return acc
}, {})

