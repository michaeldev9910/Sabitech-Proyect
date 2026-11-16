{{-- Usa la plantilla resources/views/layouts/app.blade.php --}}
@extends('layouts.app')

@section('titulo', 'Programa')

@section('estilos')
    <style>
        .charlas { display: grid; gap: 1rem; margin-top: 2rem; list-style: none; }
        .charla {
            padding: 1.25rem 1.4rem;
            background: #fff;
            border: 1px solid var(--linea);
            border-radius: 14px;
        }
        .charla__fecha { color: var(--teal); font-size: 0.85rem; font-weight: 700; }
        .charla h2 { margin-top: 0.2rem; font-size: 1.15rem; }
        .charla__datos { margin-top: 0.3rem; color: var(--suave); font-size: 0.92rem; }
        .plazas {
            display: inline-block;
            margin-top: 0.75rem;
            padding: 0.2rem 0.7rem;
            background: #E3F4F2;
            border-radius: 999px;
            color: var(--teal);
            font-size: 0.8rem;
            font-weight: 700;
        }
        .plazas--agotadas { background: #FBE9E7; color: var(--error); }
        .vacio { margin-top: 2rem; color: var(--suave); }
    </style>
@endsection

@section('contenido')
    <h1>Programa de charlas</h1>
    <p class="intro">Charlas publicadas, ordenadas por fecha.</p>

    @if ($charlas->isEmpty())
        <p class="vacio">Todavía no hay charlas publicadas.</p>
    @else
        <ul class="charlas">
            @foreach ($charlas as $charla)
                <li class="charla">
                    {{-- fecha_charla() es un helper propio (app/helpers.php) --}}
                    <p class="charla__fecha">{{ fecha_charla($charla->inicio) }}</p>
                    <h2>{{ $charla->titulo }}</h2>
                    <p class="charla__datos">
                        {{ $charla->ponente?->nombre }} {{ $charla->ponente?->apellidos }}
                        · {{ $charla->sala?->nombre }}
                    </p>

                    @if ($charla->plazas_libres > 0)
                        <span class="plazas">{{ $charla->plazas_libres }} plazas libres</span>
                    @else
                        <span class="plazas plazas--agotadas">Completa</span>
                    @endif
                </li>
            @endforeach
        </ul>
    @endif
@endsection
