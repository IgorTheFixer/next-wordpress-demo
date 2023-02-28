const path = require('path');

// Load the .env file for local development
// .env.development.local by default
require('dotenv').config({
	path: path.resolve(process.cwd(), '.env.development.local'),
});

if (
	process.env.WPGRAPHQL_URL === undefined &&
	process.env.PANTHEON_CMS_ENDPOINT === undefined
) {
	let message;
	if (process.env.NODE_ENV === 'development') {
		message = `No WPGRAPHQL_URL found.\nSee the README.md for information on setting this variable locally.`;
	} else if (process.env.NODE_ENV === 'production') {
		message = `No CMS Endpoint found.\nLink a CMS or set the WPGRAPHQL_URL environment variable in the settings tab in the dashboard\nIf your site does not require a backend to build, remove this check from the next.config.js.`;
	}
	throw new Error(message);
}

let backendUrl, imageDomain;
if (process.env.WPGRAPHQL_URL === undefined) {
	backendUrl = `https://${process.env.PANTHEON_CMS_ENDPOINT}/wp/graphql`;
	imageDomain = process.env.IMAGE_DOMAIN || process.env.PANTHEON_CMS_ENDPOINT;

	// populate WPGRAPHQL_URL as a fallback and for build scripts
	process.env.WPGRAPHQL_URL = `https://${process.env.PANTHEON_CMS_ENDPOINT}/wp/graphql`;
} else {
	backendUrl = process.env.WPGRAPHQL_URL;
	imageDomain =
		process.env.IMAGE_DOMAIN ||
		process.env.WPGRAPHQL_URL.replace(/\/wp\/graphql$/, '').replace(
			/^https?:\/\//,
			'',
		);
}
// remove trailing slash if it exists
imageDomain = imageDomain.replace(/\/$/, '');

const injectedOptions = {};
if (process.env.PANTHEON_UPLOAD_PATH) {
	injectedOptions['basePath'] = process.env.PANTHEON_UPLOAD_PATH;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	...(injectedOptions && injectedOptions),
	reactStrictMode: true,
	env: {
		backendUrl: backendUrl,
		imageUrl: `https://${imageDomain}`,
	},
	images: {
		// limit of 25 deviceSizes values
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		// limit of 25 imageSizes values
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		// limit of 50 domains values
		domains: [],
		// path prefix for Image Optimization API, useful with `loader`
		path: '/_next/image',
		// loader can be 'default', 'imgix', 'cloudinary', 'akamai', or 'custom'
		loader: 'default',
		// file with `export default function loader({src, width, quality})`
		loaderFile: '',
		// disable static imports for image files
		disableStaticImages: false,
		// minimumCacheTTL is in seconds, must be integer 0 or more
		minimumCacheTTL: 60,
		// ordered list of acceptable optimized image formats (mime types)
		formats: ['image/webp'],
		// enable dangerous use of SVG images
		dangerouslyAllowSVG: false,
		// set the Content-Security-Policy header
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		// sets the Content-Disposition header (inline or attachment)
		contentDispositionType: 'inline',
		// limit of 50 objects
		remotePatterns: [],
		// when true, every image will be unoptimized
		unoptimized: false,
	  },
	output: 'standalone',
};

module.exports = nextConfig;
