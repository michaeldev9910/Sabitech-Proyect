<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AsistenciaController extends Controller
{
    public function index() {
        return response()->json([
            'mensaje' => 'Listado de asistencias'
        ]);
    }
}
