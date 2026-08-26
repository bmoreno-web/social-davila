<?php
/**
 * Database Handler & Auto-Migration / Seeder
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
                    }
                } else {
                    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                    self::$instance = new PDO($dsn, DB_USER, DB_PASS);
                    self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                }
            } catch (PDOException $e) {
                die("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }
        return self::$instance;
    }

    private static function initSchema(PDO $db): void {
        $queries = "
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'TEAM',
            client_id TEXT,
            avatar TEXT,
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            logo TEXT,
            industry TEXT,
            contact_name TEXT,
            contact_email TEXT,
            metricool_blog_id TEXT,
            metricool_user_id TEXT,
            metricool_hash TEXT,
            last_sync_at DATETIME,
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS social_connections (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            account_name TEXT,
            account_username TEXT,
            account_picture TEXT,
            external_id TEXT,
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL,
            title TEXT NOT NULL,
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            status TEXT DEFAULT 'DRAFT',
            executive_summary TEXT,
            editorial_analysis TEXT,
            created_by_id TEXT,
            published_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS report_metrics (
            id TEXT PRIMARY KEY,
            report_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            metric_key TEXT NOT NULL,
            current_value REAL NOT NULL,
            previous_value REAL,
            percentage_change REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS report_posts (
            id TEXT PRIMARY KEY,
            report_id TEXT,
            client_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            external_post_id TEXT,
            published_at DATETIME NOT NULL,
            media_url TEXT,
            thumbnail_url TEXT,
            caption TEXT,
            post_type TEXT,
            likes INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            shares INTEGER DEFAULT 0,
            saves INTEGER DEFAULT 0,
            reach INTEGER DEFAULT 0,
            impressions INTEGER DEFAULT 0,
            engagement_rate REAL DEFAULT 0,
            permalink TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS recommendations (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL,
            report_id TEXT,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'PENDIENTE',
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            user_name TEXT,
            user_email TEXT,
            action TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            resource_id TEXT,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        ";

        $db->exec($queries);
    }

    private static function seedDatabase(PDO $db): void {
        // Admin User
        $adminId = uniqid('usr_', true);
        $passwordHash = password_hash(DEFAULT_ADMIN_PASSWORD, PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (id, name, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?, 1)");
        $stmt->execute([$adminId, 'Administrador Davila PM', DEFAULT_ADMIN_EMAIL, $passwordHash, 'ADMIN']);

        // Demo Clients
        $clients = [
            [
                'id' => 'cli_acesco',
                'name' => 'Acesco Colombia',
                'slug' => 'acesco',
                'logo' => 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=150&auto=format&fit=crop&q=60',
                'industry' => 'Construcción y Acero',
                'contact_name' => 'Marcela Gómez',
                'contact_email' => 'marcela@acesco.com',
                'metricool_blog_id' => '1284901',
                'metricool_user_id' => '94821',
            ],
            [
                'id' => 'cli_oleoflores',
                'name' => 'Oleoflores',
                'slug' => 'oleoflores',
                'logo' => 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=150&auto=format&fit=crop&q=60',
                'industry' => 'Agroindustria y Palma',
                'contact_name' => 'Carlos Dávila',
                'contact_email' => 'carlos@oleoflores.com',
                'metricool_blog_id' => '1395810',
                'metricool_user_id' => '94821',
            ],
            [
                'id' => 'cli_sachi',
                'name' => 'Sachi Nuts',
                'slug' => 'sachinuts',
                'logo' => 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=150&auto=format&fit=crop&q=60',
                'industry' => 'Alimentos y Superfoods',
                'contact_name' => 'Andrea Ruiz',
                'contact_email' => 'andrea@sachinuts.com',
                'metricool_blog_id' => '1420958',
                'metricool_user_id' => '94821',
            ]
        ];

        $stmtClient = $db->prepare("INSERT INTO clients (id, name, slug, logo, industry, contact_name, contact_email, metricool_blog_id, metricool_user_id, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        foreach ($clients as $c) {
            $stmtClient->execute([$c['id'], $c['name'], $c['slug'], $c['logo'], $c['industry'], $c['contact_name'], $c['contact_email'], $c['metricool_blog_id'], $c['metricool_user_id']]);
        }

        // Demo Client User (Portal Access for Acesco)
        $clientUserId = uniqid('usr_', true);
        $clientPw = password_hash('cliente123', PASSWORD_BCRYPT);
        $stmt->execute([$clientUserId, 'Marcela Gómez (Acesco)', 'cliente@acesco.com', $clientPw, 'CLIENT']);
        $db->prepare("UPDATE users SET client_id = 'cli_acesco' WHERE id = ?")->execute([$clientUserId]);

        // Demo Recommendations
        $recs = [
            ['cli_acesco', 'CONTENIDO', 'ALTA', 'Aumentar formato Reels y Video Vertical educativo', 'Los videos cortos sobre especificaciones de tejas y perfiles obtuvieron un 45% más de alcance orgánico.'],
            ['cli_acesco', 'PAUTA', 'MEDIA', 'Optimizar segmentación para arquitectos e ingenieros en LinkedIn', 'La campaña en LinkedIn tiene un CTR de 2.8%, superior al benchmark de la industria.'],
            ['cli_oleoflores', 'ESTRATEGIA', 'ALTA', 'Potenciar comunicación sobre sostenibilidad y huella de carbono', 'El contenido de impacto social y ambiental genera el 60% del engagement total de la marca.'],
            ['cli_sachi', 'FORMATO', 'MEDIA', 'Publicar carruseles con recetas de Sacha Inchi los fines de semana', 'Los carruseles tienen una tasa de guardados 3.2x más alta que imágenes individuales.']
        ];

        $stmtRec = $db->prepare("INSERT INTO recommendations (id, client_id, category, priority, title, description, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')");
        foreach ($recs as $r) {
            $stmtRec->execute([uniqid('rec_', true), $r[0], $r[1], $r[2], $r[3], $r[4]]);
        }

        // Initial Audit Log
        $db->prepare("INSERT INTO audit_logs (id, user_name, user_email, action, resource_type, details) VALUES (?, ?, ?, ?, ?, ?)")
           ->execute([uniqid('log_', true), 'Sistema', 'system@davila.com', 'INSTALL', 'DATABASE', 'Base de datos y datos de inicio creados con éxito']);
    }
}
