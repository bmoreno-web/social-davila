<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../auth.php';

$currentUser = Auth::user();
$pageTitle = $pageTitle ?? APP_NAME;
?>
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?> | <?= APP_NAME ?></title>
    
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#f5f3ff',
                            100: '#ede9fe',
                            500: '#8b5cf6',
                            600: '#7c3aed',
                            700: '#6d28d9',
                            900: '#4c1d95',
                        },
                        dark: {
                            bg: '#0b0f19',
                            card: '#111827',
                            border: '#1f2937',
                            hover: '#1e293b'
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Chart.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Custom Styles & Theme Script -->
    <link rel="stylesheet" href="assets/css/custom.css">
    <script src="assets/js/theme.js"></script>
</head>
<body class="bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 min-h-screen flex antialiased">
