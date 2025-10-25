<?php

return [
    'per_event' => [
        'view'     => 1.0,
        'add'      => 3.0,
        'purchase' => 6.0,
    ],

    'beta_prod' => 0.05,
    'cap_prod'  => 50,

    'lambda_desc' => 0.03,
    'cap_desc'    => 20,

    'descriptor_from_search' => 0.8,

    'descriptor_update' => [
        'view'     => 0.5,
        'add'      => 1.0,
        'purchase' => 2.0,
    ],

    'top_k'            => 5,
    'top_min_score'    => 1.2,
    'gamma_core'       => 0.15,
    'cap_core'         => 30,
    'name_hit_bonus'   => 0.25,
];
