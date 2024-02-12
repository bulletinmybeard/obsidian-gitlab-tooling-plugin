interface GitLabToolingPluginSettings {
	mySetting: string
	gitlabUrl: string
	gitlabToken: string
	showIcon: boolean
	purgeIssues: boolean
	enableDebugLogging: boolean
	openMergeRequestsOnly: boolean
	gitlabApiUrl: () => string
}

interface SettingItem {
	name?: string;
	desc?: string;
	type: string;
	placeholder?: string;
	settingKey?: string;
	dependsOn?: string;
}

interface EndpointConfig {
	path: string;
	params: EndpointParams;
}

interface EndpointParams {
	[key: string]: string | undefined;
}

type TimeUnit = 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'
