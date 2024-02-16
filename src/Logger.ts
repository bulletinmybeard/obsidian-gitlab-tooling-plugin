export enum LogLevel {
	None = 0,
	Error = 1,
	Warn = 2,
	Info = 3,
	Debug = 4
}

export class Logger {
	isEnabled: boolean
	logLevel: LogLevel

	constructor(isEnabled: boolean = false, logLevel: LogLevel = LogLevel.Warn) {
		this.isEnabled = isEnabled
		this.logLevel = logLevel
	}

	/**
	 * Determine if the log message should be shown.
	 */
	private shouldLog(level: LogLevel): boolean {
		return this.isEnabled && level <= this.logLevel
	}

	/**
     * Log an error message.
     */
	log(level: LogLevel, ...messages: any[]): void {
		if (this.shouldLog(level)) {
			switch (level) {
				case LogLevel.Debug:
					console.debug(...messages)
					break
				case LogLevel.Info:
					console.info(...messages)
					break
				case LogLevel.Warn:
					console.warn(...messages)
					break
				case LogLevel.Error:
					console.error(...messages)
					break
			}
		}
	}

	/**
	 * Debug log message.
	 */
	debug(...messages: any[]): void {
		this.log(LogLevel.Debug, ...messages)
	}

	/**
	 * Info log message.
	 */
	info(...messages: any[]): void {
		this.log(LogLevel.Info, ...messages)
	}

	/**
	 * Warn log message.
	 */
	warn(...messages: any[]): void {
		this.log(LogLevel.Warn, ...messages)
	}

	/**
	 * Error log message.
	 */
	error(...messages: any[]): void {
		this.log(LogLevel.Error, ...messages)
	}
}
