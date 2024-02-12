import { readFileSync, writeFileSync } from 'fs'

const packageJsonFile = 'package.json'
const manifestJsonFile = 'manifest.json'
const versionsFile = 'versions.json'

const writeFile = (filename, data) => {
	writeFileSync(filename, JSON.stringify(data, null, 4))
}

const readFile = (filename) => {
	return JSON.parse(readFileSync(filename, 'utf8'))
}

let targetVersion

if (process.argv.length === 3) {
    targetVersion = process.argv[2]
	let packageJSON = readFile(packageJsonFile)

	if (packageJSON.version === targetVersion) {
		console.error('ERROR: Target version matches the existing version in `package.json`!')
		process.exit(0)
	}

	packageJSON.version = targetVersion
    writeFile(packageJsonFile, packageJSON)
} else if (process.env?.npm_package_version) {
    targetVersion = process.env.npm_package_version
} else {
	console.error('ERROR: No `package.json` target version specified! (e.g., npm run version 1.2.3)')
	process.exit(0)
}

// read minAppVersion from manifest.json and bump version to target version
let manifestJSON = readFile(manifestJsonFile)
const { minAppVersion } = manifestJSON
manifestJSON.version = targetVersion
writeFile(manifestJsonFile, manifestJSON)

// update versions.json with target version and minAppVersion from manifest.json
let versions = readFile(versionsFile)
versions[targetVersion] = minAppVersion
writeFile(versionsFile, versions)
