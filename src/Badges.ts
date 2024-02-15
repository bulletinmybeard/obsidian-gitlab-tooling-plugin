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
 *
 * @param {CustomBadgeFormat} format The format object to customize the badge.
 * @returns {string} The generated SVG string for the badge.
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
 *
 * @param {CustomBadgeFormat} format The format object to customize the badge, can include a link.
 * @param {any} containerEl The container element to append the badge image to.
 * @returns {HTMLImageElement|undefined} The badge image element.
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
 * @param {CustomBadgeFormat[]} badges An array of format objects to customize each badge in the group.
 * @param {HTMLElement} containerEl The container element to append the badge images to.
 * @returns {void}
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
