<?php
/**
 * DAVILA PM SOCIAL - Configuration File
 * SaaS Platform for Social Media Analytics & Management
 */

// Error reporting for production/development
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

// Application Constants
define('APP_NAME', 'DAVILA PM SOCIAL');
define('APP_VERSION', '1.0.0');
define('APP_URL', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
define('BASE_PATH', __DIR__);

// Database Configuration (Default: SQLite for 0-configuration on SiteGround)
define('DB_TYPE', 'sqlite'); // 'sqlite' or 'mysql'
define('DB_FILE', BASE_PATH . '/data/database.sqlite');

// Optional MySQL credentials if DB_TYPE is set to 'mysql'
define('DB_HOST', 'localhost');
define('DB_NAME', 'davila_social');
define('DB_USER', 'root');
define('DB_PASS', '');

// Metricool API Default Configuration
define('METRICOOL_API_KEY', getenv('METRICOOL_API_KEY') ?: '');
define('METRICOOL_API_BASE_URL', 'https://app.metricool.com/api');

// Optional AI Synthesis API Key (Google Gemini)
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: '');

// Security & Auth
define('JWT_SECRET', 'davila_pm_social_secret_key_2026_sg_secure');
define('DEFAULT_ADMIN_EMAIL', 'admin@davila.com');
define('DEFAULT_ADMIN_PASSWORD', 'admin123456');

// Timezone
date_default_timezone_set('America/Bogota');
