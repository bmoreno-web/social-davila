<?php
/**
 * Database Handler & Auto-Migration / Seeder with Real Davila PM Metricool Brands
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                if (DB_TYPE === 'sqlite') {
                    $dir = dirname(DB_FILE);
                    if (!is_dir($dir)) {
                        mkdir($dir, 0755, true);
                    }
                    $isNew = !file_exists(DB_FILE);
                    self::$instance = new PDO('sqlite:' . DB_FILE);
                    self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                    if ($isNew || filesize(DB_FILE) === 0) {
                        self::initSchema(self::$instance);
                        self::seedDatabase(self::$instance);
                    } else {
                        self::initSchema(self::$instance);
                    }
                } else {
                    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                    self::$instance = new PDO($dsn, DB_USER, DB_PASS);
                    self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                    self::initSchema(self::$instance);
                    
                    // Auto-seed if MySQL database is freshly created and empty
                    try {
                        $userCount = (int)self::$instance->query("SELECT count(*) FROM users")->fetchColumn();
                        if ($userCount === 0) {
                            self::seedDatabase(self::$instance);
                        }
                    } catch (Exception $e) {
                        self::seedDatabase(self::$instance);
                    }
                }
            } catch (PDOException $e) {
                die("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }
        return self::$instance;
    }

    public static function getSetting(string $key, string $default = ''): string {
        try {
            $db = self::getConnection();
            $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
            $stmt->execute([$key]);
            $val = $stmt->fetchColumn();
            if ($val !== false && $val !== null && $val !== '') {
                return $val;
            }
        } catch (Exception $e) {}

        // Dual fallback: data/settings.json
        $jsonFile = dirname(DB_FILE) . '/settings.json';
        if (file_exists($jsonFile)) {
            $json = json_decode(file_get_contents($jsonFile), true);
            if (isset($json[$key]) && !empty($json[$key])) {
                return $json[$key];
            }
        }
        return $default;
    }

    public static function setSetting(string $key, string $value): bool {
        $saved = false;
        try {
            $db = self::getConnection();
            if (defined('DB_TYPE') && DB_TYPE === 'mysql') {
                $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) 
                    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP");
            } else {
                $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) 
                    ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP");
            }
            $saved = $stmt->execute([$key, $value]);
        } catch (Exception $e) {}

        // Also persist in JSON file for 100% redundancy
        try {
            $dir = dirname(DB_FILE);
            if (!is_dir($dir)) mkdir($dir, 0755, true);
            $jsonFile = $dir . '/settings.json';
            $data = file_exists($jsonFile) ? (json_decode(file_get_contents($jsonFile), true) ?: []) : [];
            $data[$key] = $value;
            $data['updated_at'] = date('Y-m-d H:i:s');
            file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT));
            $saved = true;
        } catch (Exception $e2) {}

        return $saved;
    }

    public static function resetAndSeed(): void {
        $db = self::getConnection();
        self::initSchema($db);
        self::seedDatabase($db);
    }

    public static function initSchema(PDO $db): void {
        $isMysql = (defined('DB_TYPE') && DB_TYPE === 'mysql');
        
        $tableQueries = [
            "CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(191) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'TEAM',
                client_id VARCHAR(191),
                avatar VARCHAR(500),
                active INT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            "CREATE TABLE IF NOT EXISTS clients (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(191) UNIQUE NOT NULL,
                logo VARCHAR(500),
                industry VARCHAR(255),
                contact_name VARCHAR(255),
                contact_email VARCHAR(255),
                metricool_blog_id VARCHAR(100),
                metricool_user_id VARCHAR(100),
                metricool_hash VARCHAR(255),
                last_sync_at DATETIME,
                active INT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            "CREATE TABLE IF NOT EXISTS social_connections (
                id VARCHAR(191) PRIMARY KEY,
                client_id VARCHAR(191) NOT NULL,
                platform VARCHAR(50) NOT NULL,
                account_name VARCHAR(255),
                account_username VARCHAR(255),
                account_picture VARCHAR(500),
                external_id VARCHAR(191),
                active INT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            "CREATE TABLE IF NOT EXISTS reports (
                id VARCHAR(191) PRIMARY KEY,
                client_id VARCHAR(191) NOT NULL,
                title VARCHAR(255) NOT NULL,
                period_start DATE NOT NULL,
                period_end DATE NOT NULL,
                status VARCHAR(50) DEFAULT 'DRAFT',
                executive_summary TEXT,
                editorial_analysis LONGTEXT,
                created_by_id VARCHAR(191),
                published_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            "CREATE TABLE IF NOT EXISTS report_metrics (
                id VARCHAR(191) PRIMARY KEY,
                report_id VARCHAR(191) NOT NULL,
                platform VARCHAR(50) NOT NULL,
                metric_key VARCHAR(100) NOT NULL,
                current_value DOUBLE NOT NULL,
                previous_value DOUBLE,
                percentage_change DOUBLE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            "CREATE TABLE IF NOT EXISTS report_posts (
                id VARCHAR(191) PRIMARY KEY,
                report_id VARCHAR(191),
                client_id VARCHAR(191) NOT NULL,
                platform VARCHAR(50) NOT NULL,
                external_post_id VARCHAR(191),
                published_at DATETIME NOT NULL,
                media_url TEXT,
                thumbnail_url TEXT,
                caption TEXT,
                post_type VARCHAR(50),
                likes INT DEFAULT 0,
                comments INT DEFAULT 0,
                shares INT DEFAULT 0,
                saves INT DEFAULT 0,
                reach INT DEFAULT 0,
                impressions INT DEFAULT 0,
                engagement_rate DOUBLE DEFAULT 0,
                permalink TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            "CREATE TABLE IF NOT EXISTS recommendations (
                id VARCHAR(191) PRIMARY KEY,
                client_id VARCHAR(191) NOT NULL,
                report_id VARCHAR(191),
                category VARCHAR(100) NOT NULL,
                priority VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDIENTE',
                sort_order INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            "CREATE TABLE IF NOT EXISTS audit_logs (
                id VARCHAR(191) PRIMARY KEY,
                user_id VARCHAR(191),
                user_name VARCHAR(255),
                user_email VARCHAR(255),
                action VARCHAR(100) NOT NULL,
                resource_type VARCHAR(100) NOT NULL,
                resource_id VARCHAR(191),
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            "CREATE TABLE IF NOT EXISTS settings (
                setting_key VARCHAR(191) PRIMARY KEY,
                setting_value LONGTEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )"
        ];

        foreach ($tableQueries as $q) {
            $db->exec($q);
        }
    }
    }

    public static function seedDatabase(PDO $db): void {
        // Clear previous seed data
        $db->exec("DELETE FROM audit_logs; DELETE FROM recommendations; DELETE FROM report_posts; DELETE FROM report_metrics; DELETE FROM reports; DELETE FROM social_connections; DELETE FROM users; DELETE FROM clients;");

        $defaultPwHash = password_hash('davila2026!', PASSWORD_BCRYPT);

        // 1. Exact 7 Real Brands Discovered in Davila PM Metricool
        $brands = [
            [
                'id' => 'cli_acesco',
                'name' => 'Acesco Colombia',
                'slug' => 'acesco-colombia',
                'industry' => 'Construcción e Ingeniería',
                'contact_name' => 'Carlos Mendoza',
                'contact_email' => 'cliente@acesco.com',
                'metricool_blog_id' => '2930665',
                'metricool_user_id' => '1395490',
                'logo' => 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'id' => 'cli_davila',
                'name' => 'Dávila P&M',
                'slug' => 'davila-pm',
                'industry' => 'Agencia de Publicidad & Marketing',
                'contact_name' => 'Dirección General',
                'contact_email' => 'ddigital@davilaweb.com',
                'metricool_blog_id' => '4056236',
                'metricool_user_id' => '1395490',
                'logo' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'id' => 'cli_serena',
                'name' => 'Hospital Serena del Mar',
                'slug' => 'hospital-serena-del-mar',
                'industry' => 'Salud & Medicina',
                'contact_name' => 'Comunicaciones HSDM',
                'contact_email' => 'comms@serenadelmar.com',
                'metricool_blog_id' => '3996019',
                'metricool_user_id' => '1395490',
                'logo' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'id' => 'cli_zfbaq',
                'name' => 'Zona Franca B/quilla',
                'slug' => 'zona-franca-barranquilla',
                'industry' => 'Comercio Exterior & Logística',
                'contact_name' => 'Mercadeo ZFB',
                'contact_email' => 'mercadeo@zfbaq.com',
                'metricool_blog_id' => '4058165',
                'metricool_user_id' => '1395490',
                'logo' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'id' => 'cli_verano',
                'name' => 'Eduardo Verano De la Rosa',
                'slug' => 'eduardo-verano',
                'industry' => 'Sector Público & Liderazgo',
                'contact_name' => 'Prensa Oficial',
                'contact_email' => 'prensa@eduardoverano.com',
                'metricool_blog_id' => '4058776',
                'metricool_user_id' => '1395490',
                'logo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'id' => 'cli_chapman',
                'name' => 'Charles Chapman',
                'slug' => 'charles-chapman',
                'industry' => 'Legal & Corporativo',
                'contact_name' => 'Charles Chapman',
                'contact_email' => 'contacto@chapman.com',
                'metricool_blog_id' => '4588040',
                'metricool_user_id' => '1395490',
                'logo' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'id' => 'cli_ogrealty',
                'name' => 'OG Realty Partners',
                'slug' => 'og-realty-partners',
                'industry' => 'Bienes Raíces & Inversión',
                'contact_name' => 'Gerencia Inmobiliaria',
                'contact_email' => 'info@ogrealty.com',
                'metricool_blog_id' => '4559324',
                'metricool_user_id' => '1395490',
                'logo' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
            ]
        ];

        $stmtClient = $db->prepare("INSERT INTO clients (id, name, slug, industry, contact_name, contact_email, metricool_blog_id, metricool_user_id, logo, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        foreach ($brands as $b) {
            $stmtClient->execute([$b['id'], $b['name'], $b['slug'], $b['industry'], $b['contact_name'], $b['contact_email'], $b['metricool_blog_id'], $b['metricool_user_id'], $b['logo']]);
        }

        // 2. Official Users
        $stmtUser = $db->prepare("INSERT INTO users (id, name, email, password_hash, role, client_id, active) VALUES (?, ?, ?, ?, ?, ?, 1)");
        $stmtUser->execute(['usr_admin', 'Administrador Davila PM', 'admin@davilapm.com', $defaultPwHash, 'ADMIN', null]);
        $stmtUser->execute(['usr_team', 'Analista Social Media', 'team@davilapm.com', $defaultPwHash, 'TEAM', null]);
        $stmtUser->execute(['usr_cliente_acesco', 'Carlos Mendoza (Acesco)', 'cliente@acesco.com', $defaultPwHash, 'CLIENT', 'cli_acesco']);
        // Also support admin@davila.com for quick login
        $stmtUser->execute(['usr_admin_alt', 'Administrador Davila PM', 'admin@davila.com', $defaultPwHash, 'ADMIN', null]);

        // 3. Realistic Posts for Acesco & Davila PM
        $samplePosts = [
            [
                'id' => 'post_ac_1',
                'client_id' => 'cli_acesco',
                'platform' => 'INSTAGRAM',
                'published_at' => date('Y-m-d H:i:s', strtotime('-2 days')),
                'media_url' => 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
                'caption' => '¡Seguimos transformando la infraestructura del país! 🏗️🔩 Conoce nuestra nueva línea de perfiles estructurales de alta resistencia y durabilidad.',
                'post_type' => 'reel',
                'likes' => 1840,
                'comments' => 112,
                'shares' => 240,
                'saves' => 310,
                'reach' => 34200,
                'impressions' => 41800,
                'engagement_rate' => 7.31,
                'permalink' => 'https://instagram.com/acescocol'
            ],
            [
                'id' => 'post_ac_2',
                'client_id' => 'cli_acesco',
                'platform' => 'INSTAGRAM',
                'published_at' => date('Y-m-d H:i:s', strtotime('-5 days')),
                'media_url' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Innovación que protege: Descubre cómo la Teja Toledo combina diseño arquitectónico colonial con frescura térmica superior.',
                'post_type' => 'carousel',
                'likes' => 1250,
                'comments' => 64,
                'shares' => 115,
                'saves' => 182,
                'reach' => 22600,
                'impressions' => 28400,
                'engagement_rate' => 7.12,
                'permalink' => 'https://instagram.com/acescocol'
            ],
            [
                'id' => 'post_ac_3',
                'client_id' => 'cli_acesco',
                'platform' => 'FACEBOOK',
                'published_at' => date('Y-m-d H:i:s', strtotime('-8 days')),
                'media_url' => 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Consejos técnicos de instalación para contratistas y maestros de obra. Asegura máxima garantía en tus proyectos.',
                'post_type' => 'video',
                'likes' => 920,
                'comments' => 48,
                'shares' => 160,
                'saves' => 85,
                'reach' => 18900,
                'impressions' => 23100,
                'engagement_rate' => 6.42,
                'permalink' => 'https://facebook.com/104754815752767'
            ],
            // 3. Real Verified Metricool Posts for Dávila P&M (July 2026) & Acesco
            [
                'id' => 'post_dav_reel_1',
                'client_id' => 'cli_davila',
                'platform' => 'INSTAGRAM',
                'published_at' => '2026-07-29 11:59:00',
                'media_url' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Porque detrás de cada idea, cada toma y cada contenido, hay un equipo dispuesto a resolver y aprender... 🎬✨ #DavilaPM #Creatividad #DetrasDeCamaras',
                'post_type' => 'reel',
                'likes' => 168,
                'comments' => 3,
                'shares' => 36,
                'saves' => 12,
                'reach' => 3702,
                'impressions' => 5552,
                'engagement_rate' => 5.92,
                'permalink' => 'https://instagram.com/davilapublicidad'
            ],
            [
                'id' => 'post_dav_img_1',
                'client_id' => 'cli_davila',
                'platform' => 'INSTAGRAM',
                'published_at' => '2026-07-31 10:00:00',
                'media_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Una marca no necesita superpoderes para destacar. Necesita una estrategia que le dé dirección, una propuesta de valor clara y un equipo que haga que las cosas pasen. 🚀📌 #EstrategiaDeMarca #Branding',
                'post_type' => 'post',
                'likes' => 17,
                'comments' => 1,
                'shares' => 1,
                'saves' => 1,
                'reach' => 261,
                'impressions' => 620,
                'engagement_rate' => 7.66,
                'permalink' => 'https://instagram.com/davilapublicidad'
            ],
            [
                'id' => 'post_dav_story_1',
                'client_id' => 'cli_davila',
                'platform' => 'INSTAGRAM',
                'published_at' => '2026-07-01 17:04:00',
                'media_url' => 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Lanzamiento de nuevas tendencias en marketing digital y analítica de datos en Davila Publicidad.',
                'post_type' => 'story',
                'likes' => 0,
                'comments' => 0,
                'shares' => 0,
                'saves' => 0,
                'reach' => 221,
                'impressions' => 223,
                'engagement_rate' => 0.0,
                'permalink' => 'https://instagram.com/davilapublicidad'
            ],
            [
                'id' => 'post_dav_story_2',
                'client_id' => 'cli_davila',
                'platform' => 'INSTAGRAM',
                'published_at' => '2026-07-06 17:26:00',
                'media_url' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Conectando marcas con audiencias reales: consulta nuestro último caso de estudio en davilapublicidad.com',
                'post_type' => 'story',
                'likes' => 0,
                'comments' => 1,
                'shares' => 0,
                'saves' => 0,
                'reach' => 206,
                'impressions' => 209,
                'engagement_rate' => 0.48,
                'permalink' => 'https://instagram.com/davilapublicidad'
            ],
            [
                'id' => 'post_dav_fb_1',
                'client_id' => 'cli_davila',
                'platform' => 'FACEBOOK',
                'published_at' => '2026-07-29 11:59:00',
                'media_url' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Porque detrás de cada idea, cada toma y cada contenido, hay un equipo dispuesto a resolver y aprender...',
                'post_type' => 'reel',
                'likes' => 2,
                'comments' => 0,
                'shares' => 1,
                'saves' => 0,
                'reach' => 10,
                'impressions' => 214,
                'engagement_rate' => 1.40,
                'permalink' => 'https://facebook.com/davilapublicidad'
            ],
            [
                'id' => 'post_dav_fb_2',
                'client_id' => 'cli_davila',
                'platform' => 'FACEBOOK',
                'published_at' => '2026-07-31 10:00:00',
                'media_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Una marca no necesita superpoderes para destacar. Necesita una estrategia que le dé dirección, una...',
                'post_type' => 'post',
                'likes' => 0,
                'comments' => 0,
                'shares' => 1,
                'saves' => 0,
                'reach' => 10,
                'impressions' => 16,
                'engagement_rate' => 10.0,
                'permalink' => 'https://facebook.com/davilapublicidad'
            ]
        ];

        $stmtPost = $db->prepare("INSERT INTO report_posts 
            (id, client_id, platform, published_at, media_url, thumbnail_url, caption, post_type, likes, comments, shares, saves, reach, impressions, engagement_rate, permalink) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        foreach ($samplePosts as $p) {
            $stmtPost->execute([$p['id'], $p['client_id'], $p['platform'], $p['published_at'], $p['media_url'], $p['thumbnail_url'], $p['caption'], $p['post_type'], $p['likes'], $p['comments'], $p['shares'], $p['saves'], $p['reach'], $p['impressions'], $p['engagement_rate'], $p['permalink']]);
        }

        // 4. Recommendations for Davila PM Brands
        $recs = [
            ['cli_davila', 'FORMATO', 'ALTA', 'Duplicar frecuencia de Reels detrás de cámaras', 'El Reel de equipo generó el 90% de las interacciones totales de Instagram (219 interacciones, 5.55K vistas y 5.92% ER). Es el formato de mayor tracción.'],
            ['cli_davila', 'PAUTA', 'MEDIA', 'Optimizar pauta en Facebook Reels y retargeting web', 'El tráfico web creció un +41.85% (383 visitas). Activar píxel para convertir visitantes en prospectos de consultoría.'],
            ['cli_davila', 'AUDIENCIA', 'ALTA', 'Foco de contenido en Barranquilla (43.3%) y Bogotá (8.7%)', 'El 81.5% de la audiencia es de Colombia con fuerte concentración en el Atlántico y mujeres de 35 a 44 años.'],
            ['cli_acesco', 'CONTENIDO', 'ALTA', 'Incrementar frecuencia de Reels técnicos en obra', 'Producir cápsulas de 20-30 segundos donde instaladores certificados muestren la rapidez y seguridad del armado en proyectos reales.']
        ];

        $stmtRec = $db->prepare("INSERT INTO recommendations (id, client_id, category, priority, title, description, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')");
        foreach ($recs as $r) {
            $stmtRec->execute([uniqid('rec_', true), $r[0], $r[1], $r[2], $r[3], $r[4]]);
        }

        // 5. Official Real Metricool Monthly Reports
        $stmtRep = $db->prepare("INSERT INTO reports (id, client_id, title, period_start, period_end, status, executive_summary, editorial_analysis, created_by_id, published_at) 
            VALUES (?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, CURRENT_TIMESTAMP)");

        $stmtRep->execute([
            'rep_davila_jul26',
            'cli_davila',
            'Informe Oficial Metricool Social Media Insights — Julio 2026',
            '2026-07-01',
            '2026-07-31',
            'Durante el período de julio 2026, Dávila P&M registró un crecimiento extraordinario del +85.65% en impresiones totales (9,732 impactos) y un aumento del +417.02% en interacciones consolidadas (243 interacciones en Instagram y Facebook). La comunidad total alcanzó 5,427 seguidores (+0.43%). El formato con mayor retorno fue el Reel "Detrás de cámaras", que acumuló 5,552 visualizaciones y 219 interacciones.',
            "### 1. Balance de Formatos y Rendimiento Audiovisual\nEl formato **Reel** se consolidó como el motor principal de visibilidad y engagement en Instagram, generando 5,552 visualizaciones, 3,702 de alcance neto y 219 interacciones con un ER de **5.92%**. Las publicaciones estáticas alcanzaron un excelente ER de **7.66%** con 620 impresiones.\n\n### 2. Calidad de Interacción y Tráfico Web\nLa interacción en Instagram experimentó un salto del **+469.05%** (168 likes, 36 compartidos y 12 guardados). De forma paralela, el sitio web **davilapublicidad.com** creció un **+41.85% en visitas (383)** y un **+34.55% en visualizaciones (666)**, liderado por búsquedas orgánicas en Google (42.6%) y tráfico directo (27.6%).\n\n### 3. Plan Táctico de Optimización Davila PM\n1. **Escalar frecuencia de Reels:** Producir 2 cápsulas semanales de equipo y casos de éxito para mantener el ritmo de 5.5K+ impresiones por video.\n2. **Activar Campañas de Retargeting Web:** Aprovechar las 383 visitas mensuales en davilapublicidad.com para captar leads en servicios de marketing político y branding.\n3. **Segmentación Geográfica:** Concentrar la pauta en Barranquilla (43.35%) y Bogotá (8.71%) para maximizar el retorno de inversión.",
            'usr_admin'
        ]);

        // Audit Log
        $db->prepare("INSERT INTO audit_logs (id, user_name, user_email, action, resource_type, details) VALUES (?, ?, ?, ?, ?, ?)")
           ->execute([uniqid('log_', true), 'Sistema Davila PM', 'system@davilapm.com', 'INITIALIZE', 'DATABASE', 'Base de datos inicializada con las 7 marcas oficiales de Metricool']);
    }
}
