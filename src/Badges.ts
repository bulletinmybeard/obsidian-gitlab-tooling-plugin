import { makeBadge, ValidationError } from 'badge-maker'
import { deepMerge, pick } from './Utils'

const BADGE_FORMAT: any = {
	label: 'build',
	message: 'passed',
	style: 'flat',
	labelColor: 'grey',
	color: '#4c1',
}

/**
 * @param {any} format
 */
const genSvgString = (format: any) => {
	return makeBadge(deepMerge(BADGE_FORMAT, pick(format, Object.keys(BADGE_FORMAT))))
}

/**
 * @param {any} format
 * @param {any} containerEl
 */
export const createBadgeImage = (format: any, containerEl: any): any => {
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
