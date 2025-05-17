const axios = require('axios');
const logger = require('../utils/logger');

// Security headers that should be present
const RECOMMENDED_SECURITY_HEADERS = {
  'Strict-Transport-Security': {
    required: true,
    description: 'Ensures the browser only connects via HTTPS',
    validate: value => value.includes('max-age=')
  },
  'Content-Security-Policy': {
    required: true,
    description: 'Controls which resources the browser is allowed to load',
    validate: value => value.length > 0
  },
  'X-Content-Type-Options': {
    required: true,
    description: 'Prevents MIME type sniffing',
    validate: value => value === 'nosniff'
  },
  'X-Frame-Options': {
    required: true,
    description: 'Prevents clickjacking attacks',
    validate: value => ['DENY', 'SAMEORIGIN'].includes(value.toUpperCase())
  },
  'X-XSS-Protection': {
    required: false,
    description: 'Enables browser XSS filtering',
    validate: value => value.startsWith('1')
  },
  'Referrer-Policy': {
    required: true,
    description: 'Controls how much referrer information is included with requests',
    validate: value => value.length > 0
  },
  'Permissions-Policy': {
    required: false,
    description: 'Controls which features and APIs can be used',
    validate: value => value.length > 0
  }
};

// Cache headers that should be properly configured
const CACHE_HEADERS = {
  'Cache-Control': {
    required: true,
    description: 'Directives for caching mechanisms in both requests and responses',
    validate: value => value.length > 0
  },
  'ETag': {
    required: false,
    description: 'Validator for conditional requests',
    validate: value => value.length > 0
  }
};

/**
 * Run HTTP header tests
 * @param {string} url - URL to test
 * @returns {Promise<Object>} Test results
 */
async function runHeaderTests(url) {
  logger.info(`Running header tests for: ${url}`);
  
  try {
    // Make request and get headers
    const response = await axios.get(url, {
      validateStatus: null, // Accept all status codes
      maxRedirects: 5
    });

    const headers = response.headers;
    const results = {
      security: checkSecurityHeaders(headers),
      cache: checkCacheHeaders(headers),
      other: checkOtherHeaders(headers)
    };

    // Calculate overall score
    const score = calculateScore(results);

    return {
      url,
      timestamp: new Date().toISOString(),
      score,
      statusCode: response.status,
      summary: {
        security: {
          total: Object.keys(RECOMMENDED_SECURITY_HEADERS).length,
          present: results.security.present.length,
          missing: results.security.missing.length,
          invalid: results.security.invalid.length
        },
        cache: {
          total: Object.keys(CACHE_HEADERS).length,
          present: results.cache.present.length,
          missing: results.cache.missing.length,
          invalid: results.cache.invalid.length
        }
      },
      details: results
    };
  } catch (error) {
    logger.error(`Header test failed for ${url}:`, error);
    return {
      url,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Check security headers
 * @param {Object} headers - Response headers
 * @returns {Object} Security headers analysis
 */
function checkSecurityHeaders(headers) {
  const results = {
    present: [],
    missing: [],
    invalid: []
  };

  for (const [header, config] of Object.entries(RECOMMENDED_SECURITY_HEADERS)) {
    const headerValue = headers[header.toLowerCase()];
    
    if (!headerValue) {
      if (config.required) {
        results.missing.push({
          header,
          description: config.description
        });
      }
      continue;
    }

    if (config.validate(headerValue)) {
      results.present.push({
        header,
        value: headerValue,
        description: config.description
      });
    } else {
      results.invalid.push({
        header,
        value: headerValue,
        description: config.description
      });
    }
  }

  return results;
}

/**
 * Check cache headers
 * @param {Object} headers - Response headers
 * @returns {Object} Cache headers analysis
 */
function checkCacheHeaders(headers) {
  const results = {
    present: [],
    missing: [],
    invalid: []
  };

  for (const [header, config] of Object.entries(CACHE_HEADERS)) {
    const headerValue = headers[header.toLowerCase()];
    
    if (!headerValue) {
      if (config.required) {
        results.missing.push({
          header,
          description: config.description
        });
      }
      continue;
    }

    if (config.validate(headerValue)) {
      results.present.push({
        header,
        value: headerValue,
        description: config.description
      });
    } else {
      results.invalid.push({
        header,
        value: headerValue,
        description: config.description
      });
    }
  }

  return results;
}

/**
 * Check other relevant headers
 * @param {Object} headers - Response headers
 * @returns {Object} Other headers analysis
 */
function checkOtherHeaders(headers) {
  return {
    server: headers.server,
    poweredBy: headers['x-powered-by'],
    compression: headers['content-encoding'],
    contentType: headers['content-type']
  };
}

/**
 * Calculate overall score based on header presence and validity
 * @param {Object} results - Test results
 * @returns {number} Score from 0-100
 */
function calculateScore(results) {
  const weights = {
    security: 0.6,  // 60% of total score
    cache: 0.4      // 40% of total score
  };

  const securityScore = calculateCategoryScore(
    results.security,
    Object.keys(RECOMMENDED_SECURITY_HEADERS).length
  );

  const cacheScore = calculateCategoryScore(
    results.cache,
    Object.keys(CACHE_HEADERS).length
  );

  return Math.round(
    (securityScore * weights.security + cacheScore * weights.cache) * 100
  );
}

/**
 * Calculate score for a category of headers
 * @param {Object} results - Category results
 * @param {number} total - Total number of headers in category
 * @returns {number} Score from 0-1
 */
function calculateCategoryScore(results, total) {
  const presentScore = results.present.length / total;
  const invalidPenalty = (results.invalid.length / total) * 0.5;
  return Math.max(0, presentScore - invalidPenalty);
}

module.exports = {
  runHeaderTests
};
