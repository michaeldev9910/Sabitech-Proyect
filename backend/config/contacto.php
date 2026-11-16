<?php

return [

    /*
    | Buzón que recibe los mensajes del formulario de contacto.
    | Con Resend sin dominio verificado tiene que ser el correo de la cuenta de Resend.
    */
    'destino' => env('CONTACTO_DESTINO', env('MAIL_FROM_ADDRESS')),

];
