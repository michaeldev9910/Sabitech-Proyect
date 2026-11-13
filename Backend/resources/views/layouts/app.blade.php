<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    {{-- Cada página rellena su título con @section('titulo', '...') --}}
    <title>@yield('titulo') · SaBiTech</title>
    <style>
        :root {
            --abismo: #0A1726;
            --navy: #1C354B;
            --teal: #168C8C;
            --light-teal: #42B8B0;
            --texto: #1E2B37;
            --suave: #5B6B7A;
            --linea: #DCE3EA;
            --fondo: #F5F8FA;
            --error: #C0392B;
            --exito: #1E8449;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: var(--fondo);
            color: var(--texto);
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            line-height: 1.55;
        }
        a { color: inherit; }

        .cabecera {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 1rem 1.5rem;
            background: var(--abismo);
            color: #fff;
        }
        .logo { font-size: 1.3rem; font-weight: 800; text-decoration: none; }
        .logo span { color: var(--light-teal); }
        .cabecera nav { display: flex; gap: 1.25rem; }
        .cabecera nav a { color: rgba(255, 255, 255, 0.75); font-weight: 600; text-decoration: none; }
        .cabecera nav a:hover, .cabecera nav a.activo { color: #fff; }
        .cabecera nav a.activo { border-bottom: 2px solid var(--light-teal); }

        .contenido { flex: 1; width: 100%; max-width: 860px; margin: 0 auto; padding: 2.5rem 1rem; }
        h1 { font-size: clamp(1.7rem, 4vw, 2.3rem); letter-spacing: -0.02em; line-height: 1.15; }
        .intro { margin-top: 0.5rem; color: var(--suave); }

        .pie { padding: 1.25rem; color: var(--suave); font-size: 0.85rem; text-align: center; }
    </style>
    {{-- Estilos propios de cada página (opcional) --}}
    @yield('estilos')
</head>
<body>
    <header class="cabecera">
        {{-- route() genera la URL a partir del nombre de la ruta --}}
        <a href="{{ route('programa.index') }}" class="logo">SaBi<span>Tech</span></a>
        <nav>
            {{-- request()->routeIs() comprueba en qué página estamos para marcarla --}}
            <a href="{{ route('programa.index') }}"
               class="{{ request()->routeIs('programa.*') ? 'activo' : '' }}">Programa</a>
        </nav>
    </header>

    <main class="contenido">
        {{-- Aquí se inserta el @section('contenido') de cada página --}}
        @yield('contenido')
    </main>

    <footer class="pie">© {{ date('Y') }} SaBiTech</footer>
</body>
</html>
