/**
 * Theme Switcher: Dark Mode by Default with Light/Dark toggle support
 */
(function() {
    // 1. Check saved preference or default to 'dark'
    const savedTheme = localStorage.getItem('davila_theme') || 'dark';
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.style.colorScheme = 'light';
        }
        localStorage.setItem('davila_theme', theme);
        document.cookie = "davila_theme=" + theme + "; path=/; max-age=31536000";
        
        // Update toggle icons if DOM is ready
        updateToggleButtons(theme);
        
        // Dispatch custom event for Chart.js and other components to re-render
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: theme } }));
    }

    function updateToggleButtons(theme) {
        const sunIcons = document.querySelectorAll('.theme-icon-sun');
        const moonIcons = document.querySelectorAll('.theme-icon-moon');
        const themeLabels = document.querySelectorAll('.theme-text-label');

        if (theme === 'dark') {
            sunIcons.forEach(el => el.classList.remove('hidden'));
            moonIcons.forEach(el => el.classList.add('hidden'));
            themeLabels.forEach(el => el.textContent = 'Modo Claro');
        } else {
            sunIcons.forEach(el => el.classList.add('hidden'));
            moonIcons.forEach(el => el.classList.remove('hidden'));
            themeLabels.forEach(el => el.textContent = 'Modo Oscuro');
        }
    }

    // Apply immediately to prevent flicker
    applyTheme(savedTheme);

    // Global toggle function
    window.toggleTheme = function() {
        const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    };

    // DOM Ready listener
    document.addEventListener('DOMContentLoaded', () => {
        const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        updateToggleButtons(current);
    });
})();
