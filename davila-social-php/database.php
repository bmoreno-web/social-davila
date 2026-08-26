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

    public static function resetAndSeed(): void {
        $db = self::getConnection();
        self::initSchema($db);
        self::seedDatabase($db);
    }

    public static function initSchema(PDO $db): void {
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
            [
                'id' => 'post_dav_1',
                'client_id' => 'cli_davila',
                'platform' => 'INSTAGRAM',
                'published_at' => date('Y-m-d H:i:s', strtotime('-3 days')),
                'media_url' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
                'caption' => 'Estrategia, creatividad y datos que mueven marcas. Detrás de cámaras de nuestra última campaña nacional 🚀✨ #DavilaPM',
                'post_type' => 'reel',
                'likes' => 2150,
                'comments' => 142,
                'shares' => 310,
                'saves' => 420,
                'reach' => 42500,
                'impressions' => 56800,
                'engagement_rate' => 7.11,
                'permalink' => 'https://instagram.com/davilapublicidad'
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
            ['cli_acesco', 'CONTENIDO', 'ALTA', 'Incrementar frecuencia de Reels técnicos en obra', 'Producir cápsulas de 20-30 segundos donde instaladores certificados muestren la rapidez y seguridad del armado en proyectos reales.'],
            ['cli_acesco', 'ESTRATEGIA', 'ALTA', 'Campañas de retargeting a distribuidores oficiales', 'Vincular llamadas a la acción con enlaces dinámicos por ciudad al mapa de distribuidores autorizados en www.acesco.com.co.'],
            ['cli_acesco', 'FORMATO', 'MEDIA', 'Carrouseles educativos de especificaciones técnicas', 'Diseñar infografías visuales de resistencia climática y durabilidad para arquitectos y diseñadores estructurales.'],
            ['cli_davila', 'ESTRATEGIA', 'ALTA', 'Potenciar casos de éxito y métricas de retorno de inversión', 'El contenido que muestra resultados cuantitativos de campañas genera 3x más leads calificados en LinkedIn.'],
            ['cli_serena', 'CONTENIDO', 'ALTA', 'Serie de testimonios de especialistas y tecnología médica', 'Humanizar la atención médica destacando el equipamiento de vanguardia del hospital.'],
            ['cli_zfbaq', 'PAUTA', 'MEDIA', 'Segmentación para directores de logística y comercio exterior', 'Campañas de generación de leads con descargables de beneficios tributarios y aduaneros.'],
            ['cli_verano', 'FORMATO', 'ALTA', 'Cápsulas dinámicas en TikTok sobre obras e impacto regional', 'Formato conversacional y dinámico para conectar con audiencias jóvenes en el departamento.'],
            ['cli_chapman', 'CONTENIDO', 'MEDIA', 'Análisis de reformas laborales y jurisprudencia empresarial', 'Infografías y resúmenes ejecutivos en LinkedIn para directores de talento humano y directivos.']
        ];

        $stmtRec = $db->prepare("INSERT INTO recommendations (id, client_id, category, priority, title, description, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')");
        foreach ($recs as $r) {
            $stmtRec->execute([uniqid('rec_', true), $r[0], $r[1], $r[2], $r[3], $r[4]]);
        }

        // 5. Monthly Reports
        $stmtRep = $db->prepare("INSERT INTO reports (id, client_id, title, period_start, period_end, status, executive_summary, editorial_analysis, created_by_id, published_at) 
            VALUES (?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, CURRENT_TIMESTAMP)");

        $stmtRep->execute([
            'rep_acesco_ago',
            'cli_acesco',
            'Informe Ejecutivo de Rendimiento Digital — Agosto 2026',
            '2026-08-01',
            '2026-08-26',
            'Durante el ciclo de agosto se consolidó un incremento del 24.8% en alcance orgánico neto y una optimización del engagement rate que alcanzó 6.8%. Los formatos de video corto (Reels) generaron más del 52% del total de interacciones del mes.',
            "### Balance Estratégico Davila PM — Agosto 2026\n\nDurante el período evaluado, la presencia digital de Acesco Colombia experimentó una aceleración notable en sus indicadores de comunidad y relevancia de marca.",
            'usr_admin'
        ]);

        // Audit Log
        $db->prepare("INSERT INTO audit_logs (id, user_name, user_email, action, resource_type, details) VALUES (?, ?, ?, ?, ?, ?)")
           ->execute([uniqid('log_', true), 'Sistema Davila PM', 'system@davilapm.com', 'INITIALIZE', 'DATABASE', 'Base de datos inicializada con las 7 marcas oficiales de Metricool']);
    }
}
