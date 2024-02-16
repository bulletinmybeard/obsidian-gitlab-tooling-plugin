import { TIME_UNIT_MAPPING, EXCLUDE_REGEX, VALID_EXCLUDES } from './Constants'

/**
 * Get the type of the value.
 *
 * @examples
 * getType(123) → number
 * getType('123') → string
 * getType(true) → boolean
 * getType({}) → object
 */
export const getType = (value: any): string | undefined => {
	const match = Object.prototype.toString.call(value).match(/^\[object (\w+)]$/)
	if (match && match.length === 2) {
		return `${match[1]}`.toLowerCase()
	}
	return
}

/**
 * Checks whether the given value is an object, string, array, etc.
 */
export const isType = (value: AnyObject, expectedType: string): boolean => {
	return getType(value) === expectedType
}

/**
 * Deep merge two or more objects.
 */
export const deepMerge = (target: any, ...sources: any[]): any => {
	if (!sources.length) {
		return target
	}
	const source = sources.shift()
	if (getType(target) === 'object' && getType(source) === 'object') {
		for (const key in source) {
			if (getType(source[key]) === 'object') {
				if (!target[key]) {
					Object.assign(target, { [key]: {} })
				}
				deepMerge(target[key], source[key])
			} else {
				Object.assign(target, { [key]: source[key] })
			}
		}
	}
	return deepMerge(target, ...sources)
}

/**
 * Converts a time string to a number of seconds.
 *
 * @examples
 * convertToSeconds('10s') → 10
 * convertToSeconds('1m') → 60
 * convertToSeconds('1h') → 3600
 * convertToSeconds('1d') → 86400
 */
export const convertToSeconds = (timeString: string): number => {
	const match: RegExpMatchArray | null = timeString.match(/^(\d+)([smhdwMy])$/)
	if (match && match.length === 3) {
		return parseInt(match[1], 10) * TIME_UNIT_MAPPING[match[2]]
	}
	throw Error(`Invalid time string: ${timeString}`)
}

/**
 * Converts a host to a regular expression.
 */
export const hostToRegex = (host: string): RegExp => {
	const escapedUrl = host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	return new RegExp(`^${escapedUrl}\/?(.*)`, 'g')
}

/**
 * Capitalizes the first letter of a string.
 */
export const capitalizeFirstLetter = (value: string): string => {
	return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Converts a string into a slug.
 */
export const slugifyString = (value: string): string => {
	return value
		// Replace all non-letter characters with '-'
		.replace(/[^a-zA-Z]/g, '-')
		// Replace multiple '-' with a single '-'
		.replace(/-+/g, '-')
		// Trim '-' from start and end of the string
		.replace(/^-+|-+$/g, '')
		// Optional: convert to lowercase
		.toLowerCase()
}

/**
 * Validate the given source.
 */
export const validateSourceInput = (plugin: any, source: string): AnyObject | undefined => {
	source = `${source}`.trim()

	if (source.length === 0 || source.length > 200) {
		return
	}

	const instanceUrl = plugin.settings.gitlabUrl
	const apiString = 'api/v4/projects'

	const getGroupPath = (url: string): string => {
		try {
			return new URL(url).pathname.replace(/^\//, '')
		} catch (err) {
			return url.replace(/^\//, '')
		}
	}

	const normalizeUrl = (url: string) => {
		try {
			const parsedUrl = new URL(url)
			return `${parsedUrl.hostname}${parsedUrl.port && parsedUrl.port !== '80' && parsedUrl.port !== '443' ? ':' + parsedUrl.port : ''}`
		} catch (err) {
			return url
		}
	}

	const verifyGitUrl = (instanceUrl: string, gitUrl: string): AnyObject | undefined => {
		const normalizedInstanceUrl = normalizeUrl(instanceUrl)

		let normalizedGitUrl = normalizeUrl(gitUrl)
		if (!gitUrl.startsWith('http')) {
			normalizedGitUrl = normalizeUrl(`${instanceUrl}/${gitUrl}`)
		}

		const instanceHostname = normalizedInstanceUrl.split('/')[0]
		const gitHostname = normalizedGitUrl.split('/')[0]
		const isValid = (instanceHostname === gitHostname)

		if (isValid) {
			const groupPath = getGroupPath(gitUrl).replace(/(\r\n|\n|\r)/gm, '')
			return {
				apiRepoUrl: [instanceUrl, apiString, encodeURIComponent(groupPath)].join('/'),
                groupPath: groupPath,
				groupPathSlug: slugifyString(groupPath),
				repoSlug: slugifyString(groupPath.split('/').pop() || ''),
			}
		}
	}
	return verifyGitUrl(instanceUrl, source)
}

export const captureExcludes = (source: string): string[] => {
	const match = source.match(EXCLUDE_REGEX)
	if (match) {
		return match[1]
			.split(',')
			.reduce((acc: string[], item: string) => {
				item = item.trim()
				if (VALID_EXCLUDES.includes(item)) {
					acc.push(item)
				}
				return acc
			}, [])
	}
	return []
}

export const parseMarkdownBlock = (plugin: any, source: string): AnyObject => {
	return source
		.split('\n')
		.filter(Boolean)
		.reduce((acc: any, line: string) => {
			if (line.indexOf('exclude:') > -1) {
				const excludeItems = captureExcludes(line)
				if (getType(excludeItems) === 'array') {
					acc.exclude = excludeItems
				}
			} else {
				acc.sourceInfo = validateSourceInput(plugin, line)
			}
			return acc
		}, {
			exclude: [],
			sourceInfo: undefined,
		})
}

export const pick = (value: any, keys: string[]): AnyObject => {
	return Object.keys(value).reduce((acc: any, key: string) => {
		if (keys.includes(key)) {
			acc[key] = value[key]
		}
		return acc
	}, {})
}

export const omit = (value: any, keys: string[]): AnyObject => {
	return Object.keys(value).reduce((acc: any, key: string) => {
		if (!keys.includes(key)) {
			acc[key] = value[key]
		}
		return acc
	}, {})
}

export const sortArray = (array: AnyObject[], nestedKey: string, order: string = 'desc'): AnyObject[] => {
	return array.sort((a, b) => {
		const keys = nestedKey.split('.')
		let aValue = a, bValue = b
		for (const key of keys) {
			aValue = aValue[key]
			bValue = bValue[key]
		}
		if (aValue < bValue) return order === 'asc' ? -1 : 1
		if (aValue > bValue) return order === 'asc' ? 1 : -1
		return 0
	})
}

export const formatDate = (
	datetimeString: string,
	formatOptions: any = {},
	locales: string = 'en-US'
): string => {
	try {
		return new Date(datetimeString)
			.toLocaleDateString(locales, deepMerge({
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			}, formatOptions))
			.replace(/\//g, '.')
			.replace(',', ' at')
	} catch (err) {
		return datetimeString
	}
}

export const getElapsedTime = (datetimeString: string): string => {
	const date: any = new Date(datetimeString)
	const now: any = new Date()
	const seconds = Math.round((now - date) / 1000)
	const minutes = Math.round(seconds / 60)
	const hours = Math.round(minutes / 60)
	const days = Math.round(hours / 24)
	const weeks = Math.round(days / 7)
	const months = Math.round(weeks / 4.35)
	const years = Math.round(months / 12)

	if (seconds < 60) {
		return 'just now'
	} else if (minutes < 60) {
		return `${minutes} minutes ago`
	} else if (hours < 24) {
		return `${hours} hours ago`
	} else if (days < 7) {
		return `${days} days ago`
	} else if (weeks < 5) {
		return `${weeks} weeks ago`
	} else if (months < 12) {
		return `${months} months ago`
	} else {
		return `${years} years ago`
	}
}

export const limitArrayItems = (array: any[], limit: number = 5): AnyObject[] => {
	if (array.length <= limit) {
		return array
	}
	return array.slice(0, limit)
}
