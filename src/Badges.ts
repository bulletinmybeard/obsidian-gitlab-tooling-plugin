import { makeBadge, ValidationError } from 'badge-maker'

const BADGE_ATTRIBUTES: any = {
	width: 80,
	height: 20,
}

const BADGE_FORMAT: any = {
	style: 'flat',
}

/**
 * @param {any} format
 */
const genSvgString = (format: any) => {
	try {
		delete format.link
	} catch (_) { /** ignore me for now **/ }
	return makeBadge({...BADGE_FORMAT, ...format})
}

/**
 * @param {any} format
 * @param {any} containerEl
 */
export const createBadgeImage = (format: any, containerEl: any): any => {
	try {
		return createEl('img', {
			cls: 'gt-badge',
			attr: {...BADGE_ATTRIBUTES, ...{
				src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(genSvgString(format))}`,
				alt: 'Badge',
			}},
			parent: containerEl
		})
	} catch (err) {
		// TODO: Utilize `ValidationError`
		console.error(err)
	}
}

/**
 * @param {any} format
 * @param {any} containerEl
 */
export const createBadgeImageWithLink = (format: any, containerEl: any): any => {
	if (format?.link) {
		containerEl = createEl('a', {
			attr: {
				href: format.link,
				target: '_blank',
				rel: 'noopener noreferrer',
				class: 'gt-badge-link',
				title: format.label,
			},
			parent: containerEl
		})
	}
	return createBadgeImage(format, containerEl)
}

