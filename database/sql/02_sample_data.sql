-- ===========================================================
-- 02_sample_data.sql
-- Datos de ejemplo para Pixel Retro Store
-- ===========================================================

-- Opcional: asegurarse de estar en la BD correcta
-- USE pixel_retro_store;

-- ===========================================================
-- CATEGORIES
-- ===========================================================
INSERT INTO categories (id, name, slug, created_at, updated_at) VALUES
(1, 'Consolas Retro',            'consolas-retro',          NOW(), NOW()),
(2, 'Juegos 8-bit y 16-bit',     'juegos-8-16-bit',         NOW(), NOW()),
(3, 'Accesorios Retro',          'accesorios-retro',        NOW(), NOW()),
(4, 'Coleccionables y Merch',    'coleccionables-merch',    NOW(), NOW());

-- ===========================================================
-- PRODUCTS
-- ===========================================================
INSERT INTO products (
    id,
    category_id,
    name,
    slug,
    sku,
    description,
    price,
    stock,
    `condition`,
    is_unique,
    is_service,
    image_url,
    status,
    searches_count,
    preferences_count,
    created_at,
    updated_at
) VALUES
(1, 1,
 'Super Nintendo (SNES)',
 'super-nintendo-snes',
 'CON-SNES-001',
 'Consola Super Nintendo original con 2 mandos.',
 750.00,
 3,
 'used',
 0,
 0,
 '/uploads/products/snes.png',
 'active',
 0,
 0,
 NOW(),
 NOW()
),
(2, 1,
 'Sega Mega Drive',
 'sega-mega-drive',
 'CON-MD-001',
 'Consola Sega Mega Drive en buen estado, 1 mando incluido.',
 680.00,
 2,
 'used',
 0,
 0,
 '/uploads/products/megadrive.png',
 'active',
 0,
 0,
 NOW(),
 NOW()
),
(3, 2,
 'The Legend of Zelda: A Link to the Past',
 'zelda-a-link-to-the-past',
 'GME-SNES-ZELDA',
 'Cartucho original de SNES, probado y funcionando.',
 350.00,
 5,
 'used',
 0,
 0,
 '/uploads/products/zelda-alttp.png',
 'active',
 0,
 0,
 NOW(),
 NOW()
),
(4, 2,
 'Super Mario World',
 'super-mario-world',
 'GME-SNES-MARIO-WORLD',
 'Cartucho clásico de Super Mario World para SNES.',
 300.00,
 4,
 'used',
 0,
 0,
 '/uploads/products/smw.png',
 'active',
 0,
 0,
 NOW(),
 NOW()
),
(5, 3,
 'Pack 2 Mandos SNES (réplica)',
 'pack-mandos-snes',
 'ACC-SNES-PAD2',
 'Pack de 2 mandos tipo SNES compatibles con consolas originales.',
 180.00,
 10,
 'new',
 0,
 0,
 '/uploads/products/snes-controllers.png',
 'active',
 0,
 0,
 NOW(),
 NOW()
),
(6, 3,
 'Servicio limpieza de cartuchos retro',
 'servicio-limpieza-cartuchos',
 'SRV-CLEAN-001',
 'Servicio de limpieza y mantenimiento de cartuchos y contactos.',
 60.00,
 999,
 'new',
 0,
 1,
 NULL,
 'active',
 0,
 0,
 NOW(),
 NOW()
),
(7, 4,
 'Figura coleccionable Mario Pixel',
 'figura-mario-pixel',
 'COL-MARIO-PIXEL',
 'Figura coleccionable edición limitada con diseño pixel retro.',
 220.00,
 1,
 'new',
 1,
 0,
 '/uploads/products/mario-pixel-figure.png',
 'active',
 0,
 0,
 NOW(),
 NOW()
);

-- ===========================================================
-- USERS  (roles base: admin, seller, tech, customer)
-- Las contraseñas están hasheadas con bcrypt para que funcionen en Laravel.
--  Admin123* / Vendedor123* / Tecnico123* / Cliente123*
-- ===========================================================
INSERT INTO users (
    id,
    name,
    email,
    role,
    password,
    created_at,
    updated_at
) VALUES
(1,
 'Administrador Pixel Retro',
 'admin@pixelretrostore.test',
 'admin',
 '$2b$12$/O4BQ.aQ8y6w9L8SJFOtjuD3Cj0Fm8HpwJmKpeJXHBIke2E1Ruxr.',
 NOW(),
 NOW()
),
(2,
 'Vendedor Demo',
 'vendedor01@pixelretrostore.test',
 'seller',
 '$2b$12$qLDUcTVpoqyT2EIz1p69W.fch.kH6.yDkWLxoi6aTyl4O9RQcNR.q',
 NOW(),
 NOW()
),
(3,
 'Técnico Demo',
 'tecnico01@pixelretrostore.test',
 'technician',
 '$2b$12$XJrEU2Leh1i/vuPD9hgd4.mW0TGfIpzl7CiZgDG7xHSWgLYXENr4.',
 NOW(),
 NOW()
),
(4,
 'Cliente Demo',
 'cliente.demo@pixelretrostore.test',
 'customer',
 '$2b$12$8830RJNBOldQ37//99IBrufraVxejspSz55k5ali/VNb9X2i7GLBO',
 NOW(),
 NOW()
);

-- ===========================================================
-- CUSTOMERS
-- ===========================================================
INSERT INTO customers (
    id,
    name,
    ci,
    email,
    phone,
    address,
    created_at,
    updated_at
) VALUES
(1,
 'Juan Gamer Retro',
 '1234567',
 'juan.gamer@example.com',
 '70000001',
 'Calle Retro 123, Ciudad Gamer',
 NOW(),
 NOW()
),
(2,
 'Ana Coleccionista',
 '2345678',
 'ana.coleccionista@example.com',
 '70000002',
 'Av. Consolas 456, Zona Central',
 NOW(),
 NOW()
),
(3,
 'Carlos Torneos',
 '3456789',
 'carlos.torneos@example.com',
 '70000003',
 'Boulevard 8-bit 789, Barrio Arcade',
 NOW(),
 NOW()
);

-- ===========================================================
-- EVENTS
-- ===========================================================
INSERT INTO events (
    id,
    title,
    slug,
    `type`,
    description,
    location,
    start_at,
    end_at,
    capacity,
    status,
    banner_url,
    registration_open_at,
    registration_close_at,
    created_at,
    updated_at
) VALUES
(1,
 'Torneo SNES Championship',
 'torneo-snes-championship',
 'tournament',
 'Torneo de Super Nintendo con juegos clásicos y premios para los mejores jugadores.',
 'Pixel Retro Store - Sala Principal',
 '2025-01-15 18:00:00',
 '2025-01-15 22:00:00',
 16,
 'published',
 '/uploads/banners/torneo-snes.png',
 '2025-01-01 00:00:00',
 '2025-01-14 23:59:59',
 NOW(),
 NOW()
),
(2,
 'Noche Retro 8-bit',
 'noche-retro-8-bit',
 'event',
 'Evento social para jugar títulos 8-bit, intercambio de cartuchos y zona libre de juego.',
 'Pixel Retro Store - Lounge Retro',
 '2025-02-20 19:00:00',
 '2025-02-21 00:00:00',
 30,
 'published',
 '/uploads/banners/noche-8bit.png',
 '2025-02-01 00:00:00',
 '2025-02-20 18:00:00',
 NOW(),
 NOW()
);

-- ===========================================================
-- SALES (ventas de ejemplo)
-- ===========================================================
INSERT INTO sales (
    id,
    user_id,
    customer_id,
    total,
    status,
    delivery_status,
    created_at,
    updated_at
) VALUES
(1,
 2,           -- Vendedor Demo
 1,           -- Juan Gamer Retro
 1100.00,     -- SNES + Zelda
 'paid',
 'to_deliver',
 '2025-01-10 10:00:00',
 '2025-01-10 10:00:00'
),
(2,
 2,           -- Vendedor Demo
 2,           -- Ana Coleccionista
 520.00,      -- Pack mandos + limpieza + figura
 'paid',
 'delivered',
 '2025-01-12 16:30:00',
 '2025-01-12 18:00:00'
);

-- ===========================================================
-- SALE_DETAILS (detalle de ventas)
-- ===========================================================
INSERT INTO sale_details (
    id,
    sale_id,
    product_id,
    quantity,
    unit_price,
    subtotal,
    created_at,
    updated_at
) VALUES
-- Venta 1: SNES + Zelda
(1,
 1,
 1,           -- Super Nintendo (SNES)
 1,
 750.00,
 750.00,
 '2025-01-10 10:00:00',
 '2025-01-10 10:00:00'
),
(2,
 1,
 3,           -- Zelda ALTTP
 1,
 350.00,
 350.00,
 '2025-01-10 10:00:00',
 '2025-01-10 10:00:00'
),

-- Venta 2: Pack mandos + limpieza + figura coleccionable
(3,
 2,
 5,           -- Pack 2 mandos SNES
 1,
 180.00,
 180.00,
 '2025-01-12 16:30:00',
 '2025-01-12 16:30:00'
),
(4,
 2,
 6,           -- Servicio limpieza cartuchos
 2,
 60.00,
 120.00,
 '2025-01-12 16:30:00',
 '2025-01-12 16:30:00'
),
(5,
 2,
 7,           -- Figura Mario Pixel
 1,
 220.00,
 220.00,
 '2025-01-12 16:30:00',
 '2025-01-12 16:30:00'
);

-- Fin de 02_sample_data.sql
