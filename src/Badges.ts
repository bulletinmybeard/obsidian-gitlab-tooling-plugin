import { makeBadge, ValidationError, Format } from 'badge-maker'

import { deepMerge, pick } from './Utils'

interface CustomBadgeFormat extends Format {
	link?: string;
	alt?: string;
}

const BADGE_FORMAT: CustomBadgeFormat = {
	label: 'build',
	message: 'passed',
	style: 'flat',
	labelColor: 'grey',
	color: '#4c1',
}

/**
 * Generates an SVG string for a badge based on the provided format.
 * The format can include any properties to override the default badge format.
 * Properties not specified will use default values.
 */
const genSvgString = (format: AnyObject): string => {
	format = pick(format, Object.keys(BADGE_FORMAT))
	format.label = `${format.label}`.toLowerCase()
	format.message = `${format.message}`.toLowerCase()
	return makeBadge(deepMerge(BADGE_FORMAT, format))
}

/**
 * Creates a badge image element and appends it to a specified container element.
 * If a link is provided in the format, the badge will be wrapped in an anchor (<a>) element.
 */
export const createBadgeImage = (format: CustomBadgeFormat, containerEl: HTMLElement): HTMLImageElement | undefined => {
	try {
		if (format?.link) {
			containerEl = createEl('a', {
				attr: {
					href: format.link,
					target: '_blank',
					rel: 'noopener noreferrer',
					class: 'gt-badge-link',
					title: `${format.label} ${format.message}`,
				},
				parent: containerEl
			})
		}
		return createEl('img', {
			cls: 'gt-badge',
			attr: {
				src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(genSvgString(format))}`,
				alt: (format?.alt ?? 'Badge'),
			},
			parent: containerEl
		})
	} catch (err) {
		if (err instanceof ValidationError) {
			console.error('Badge Validation error:', err.message);
		} else {
			console.error('Badge Unexpected error:', err);
		}
	}
}

/**
 * Creates a group of badge images based on an array of formats and appends them to a specified container.
 */
export const createBadgeImageGroup = (badges: CustomBadgeFormat[], containerEl: HTMLElement): void => {
	try {
		const badgeContainer = createDiv({
			cls: '.gt-badge-container',
			parent: containerEl
		})
		for (const badge of badges) {
			createBadgeImage(badge, badgeContainer)
		}
	} catch (err) {
		if (err instanceof ValidationError) {
			console.error('Badge Validation error:', err.message);
		} else {
			console.error('Badge Unexpected error:', err);
		}
	}
}
