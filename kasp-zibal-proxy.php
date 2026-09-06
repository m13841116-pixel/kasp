<?php
declare(strict_types=1);

/**
 * KASP - Dedicated Zibal Fixed-IP Relay (Proxy)
 * File: kasp-zibal-proxy.php
 * 
 * Purpose:
 * Runs on a standalone server/host with a fixed public IPv4 address registered in Zibal.
 * Acts as a secure, server-to-server gateway forwarder for Cloud Run instances.
 * 
 * Strict Security Rules Enforced:
 * 1. Merchant ID is strictly read from relay server environment variables; client/request override is forbidden.
 * 2. Mandatory Bearer / X-Proxy-Token authentication with constant-time string comparison (hash_equals).
 * 3. No open CORS (*). Server-to-server API only.
 * 4. Only POST /v1/request and POST /v1/verify are permitted.
 * 5. Strict payload sanitization: only explicitly allowed fields are forwarded to Zibal.
 * 6. Destination endpoint is hardcoded to official HTTPS Zibal gateway (https://gateway.zibal.ir).
 * 7. Enforces strict SSL certificate verification (CURLOPT_SSL_VERIFYPEER, CURLOPT_SSL_VERIFYHOST).
 * 8. Connection & execution timeouts strictly enforced.
 * 9. Zero fake, mock, bypass, or simulation logic.
 */

// Block all non-POST methods immediately without disclosing system information
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    header('Allow: POST');
    echo json_encode(['result' => -1, 'message' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

// -----------------------------------------------------------------------------
// 1. Load Server-Side Secrets & Configuration
// -----------------------------------------------------------------------------
$merchant = getenv('KASP_ZIBAL_MERCHANT') ?: ($_ENV['KASP_ZIBAL_MERCHANT'] ?? '');
$authToken = getenv('KASP_RELAY_TOKEN') ?: ($_ENV['KASP_RELAY_TOKEN'] ?? '');

// Ensure critical secrets are configured on this relay server
if (empty($merchant) || empty($authToken)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'result' => -1,
        'message' => 'Relay server configuration incomplete. Required environment variables are missing.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -----------------------------------------------------------------------------
// 2. Strict Authentication Verification (KASP -> Relay)
// -----------------------------------------------------------------------------
$providedToken = '';

// Check Authorization: Bearer <TOKEN>
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
    $providedToken = $matches[1];
}

// Fallback to X-Proxy-Token if Authorization header was stripped by web server
if (empty($providedToken)) {
    $providedToken = $_SERVER['HTTP_X_PROXY_TOKEN'] ?? '';
}

if (empty($providedToken) || !hash_equals($authToken, $providedToken)) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['result' => -1, 'message' => 'Unauthorized request to relay server.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// -----------------------------------------------------------------------------
// 3. Resolve Target Action (/v1/request or /v1/verify)
// -----------------------------------------------------------------------------
// Resolves action from query parameter (?action=v1/request) or PATH_INFO
$action = $_GET['action'] ?? '';
if (empty($action)) {
    $pathInfo = $_SERVER['PATH_INFO'] ?? '';
    if (!empty($pathInfo)) {
        $action = trim($pathInfo, '/');
    }
}
$action = trim($action, '/');

// Official Zibal Base Endpoint (Strictly Hardcoded HTTPS)
$zibalOfficialBase = 'https://gateway.zibal.ir';

$targetUrl = '';
$allowedFields = [];

if ($action === 'v1/request' || $action === 'request') {
    $targetUrl = $zibalOfficialBase . '/v1/request';
    $allowedFields = ['amount', 'callbackUrl', 'description', 'orderId', 'mobile', 'nationalCode', 'checkMobileWithCard'];
} elseif ($action === 'v1/verify' || $action === 'verify') {
    $targetUrl = $zibalOfficialBase . '/v1/verify';
    $allowedFields = ['trackId'];
} else {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['result' => -1, 'message' => 'Unsupported relay endpoint.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// -----------------------------------------------------------------------------
// 4. Read & Sanitize Request Payload
// -----------------------------------------------------------------------------
$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true);

if (!is_array($inputData)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['result' => -1, 'message' => 'Invalid JSON payload received.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Construct clean payload:
// CRITICAL: Force merchant from relay server environment variable. Client cannot override.
$sanitizedPayload = [
    'merchant' => $merchant
];

foreach ($allowedFields as $field) {
    if (isset($inputData[$field])) {
        $sanitizedPayload[$field] = $inputData[$field];
    }
}

// -----------------------------------------------------------------------------
// 5. Forward Request to Official Zibal API via cURL
// -----------------------------------------------------------------------------
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $targetUrl,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($sanitizedPayload, JSON_UNESCAPED_UNICODE),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
        'User-Agent: KASP-FixedIP-Relay/1.0'
    ],
    // Enforce strict SSL verification
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    // Timeouts
    CURLOPT_CONNECTTIMEOUT => 7,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HEADER => false
]);

$responseBody = curl_exec($ch);
$curlError = curl_error($ch);
$httpStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// -----------------------------------------------------------------------------
// 6. Return Response to KASP
// -----------------------------------------------------------------------------
header('Content-Type: application/json; charset=utf-8');

if ($responseBody === false || !empty($curlError)) {
    http_response_code(502);
    echo json_encode([
        'result' => -1,
        'message' => 'Relay failed to reach Zibal gateway service.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Pass Zibal's exact response code & content back to KASP
if ($httpStatusCode >= 200 && $httpStatusCode < 300) {
    http_response_code(200);
} else {
    http_response_code($httpStatusCode ?: 500);
}

echo $responseBody;
