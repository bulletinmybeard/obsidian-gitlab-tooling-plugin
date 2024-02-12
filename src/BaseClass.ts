import { Logger, LogLevel } from './Logger'
import { deepMerge } from './Utils'

interface BaseClassOptions {
	environment?: 'development' | 'production';
	logLevel?: LogLevel;
	logEnabled?: boolean;
}

export class BaseClass {
	public logger: Logger

	public options: BaseClassOptions = {
		environment: 'development',
		logLevel: LogLevel.Warn,
		logEnabled: true,
	}

	// constructor(options: Partial<BaseClassOptions> = {}) {
	constructor(options: any = {}) {
		this.options = deepMerge(this.options, options)

		if (this.options.environment === 'development') {
			this.options.logLevel = LogLevel.Debug;
		}

		this.logger = new Logger(this.options.logEnabled, this.options.logLevel)
	}
}
