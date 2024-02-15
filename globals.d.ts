interface GitLabToolingPluginSettings {
	gitlabUrl: string;
	gitlabToken: string;
	openMergeRequestsOnly: boolean;
	displayMode: string;
	enableDebugLogging: boolean;
	enableAutoPolling: boolean;
	autoPollingInterval: string;
	cacheRestApiResponses: boolean;
	customDateFormat: string;
	gitlabApiUrl: () => string
}

interface SettingItem {
	name?: string;
	desc?: string;
	type: string;
	options?: any[];
	placeholder?: string;
	settingKey?: string;
	dependsOn?: string;
	disabled?: boolean;
}

interface EndpointConfig {
	path: string;
	params: EndpointParams;
}

interface EndpointParams {
	[key: string]: string | undefined;
}

type TimeUnit = 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'

type AnyObject = { [key: string]: any };
