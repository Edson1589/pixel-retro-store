-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 05-12-2025 a las 02:36:57
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pixelretro`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointments`
--

CREATE TABLE `appointments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `technician_id` bigint(20) UNSIGNED DEFAULT NULL,
  `service_type` enum('repair','maintenance','diagnostic') NOT NULL,
  `console` varchar(40) NOT NULL,
  `problem_description` text NOT NULL,
  `location` enum('shop','home') NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(40) NOT NULL,
  `preferred_at` datetime NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `duration_minutes` smallint(5) UNSIGNED NOT NULL DEFAULT 60,
  `status` enum('pending','confirmed','rejected','rescheduled','completed','cancelled') NOT NULL DEFAULT 'pending',
  `reschedule_proposed_at` datetime DEFAULT NULL,
  `reschedule_note` varchar(255) DEFAULT NULL,
  `reject_reason` varchar(255) DEFAULT NULL,
  `customer_notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `sale_id` bigint(20) UNSIGNED DEFAULT NULL,
  `service_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `parts_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `grand_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `appointments`
--

INSERT INTO `appointments` (`id`, `customer_id`, `technician_id`, `service_type`, `console`, `problem_description`, `location`, `address`, `contact_phone`, `preferred_at`, `scheduled_at`, `duration_minutes`, `status`, `reschedule_proposed_at`, `reschedule_note`, `reject_reason`, `customer_notes`, `created_at`, `updated_at`, `deleted_at`, `sale_id`, `service_amount`, `parts_total`, `discount`, `grand_total`, `completed_at`, `completed_by`) VALUES
(1, 5, 2, 'repair', 'asdasd', 'asdasdasd', 'shop', NULL, '123123', '2025-11-06 10:50:00', '2025-11-07 07:02:00', 60, 'completed', NULL, NULL, NULL, 'asdasdasd', '2025-11-04 14:50:42', '2025-11-04 15:08:12', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL),
(2, 6, 2, 'repair', 'asdas', 'dasdasd', 'home', 'asdasdasdasdasd', 'asdasdad', '2025-11-09 11:04:00', '2025-11-21 07:08:00', 60, 'cancelled', '2025-11-21 07:08:00', NULL, NULL, 'asdasdasd', '2025-11-04 15:05:06', '2025-11-04 15:11:20', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL),
(3, 4, 7, 'repair', 'asdasdasd', 'asdasasd', 'shop', NULL, 'asdasdasd', '2025-11-06 13:10:00', '2025-11-08 09:12:00', 60, 'completed', '2025-11-08 09:12:00', NULL, NULL, 'sdasdasd', '2025-11-04 17:10:51', '2025-11-04 17:13:58', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL),
(4, 5, 7, 'repair', 'asdasd', 'asdasd', 'shop', NULL, 'asdasd', '2025-11-22 12:35:00', '2025-11-29 08:36:00', 60, 'completed', '2025-11-29 08:36:00', NULL, NULL, NULL, '2025-11-16 16:35:43', '2025-11-16 16:37:22', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL),
(5, 5, 7, 'repair', 'adasd', 'asdasdad', 'shop', NULL, '123123123', '2025-11-22 01:06:00', '2025-11-22 21:10:00', 60, 'completed', NULL, NULL, NULL, 'asdasdasd', '2025-11-18 05:06:25', '2025-11-28 14:01:51', NULL, 11, 100.00, 0.00, 30.00, 70.00, '2025-11-28 14:01:51', 7),
(6, 5, 7, 'repair', 'asdasd', 'asdasdasd', 'shop', NULL, 'a213123', '2025-11-30 01:09:00', '2025-11-23 21:41:00', 60, 'completed', '2025-11-23 21:41:00', NULL, NULL, 'adasad', '2025-11-18 05:09:39', '2025-11-18 05:49:16', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL),
(7, 5, 7, 'repair', 'daasdasd', 'asdasdasd', 'shop', NULL, '123123', '2025-11-30 10:07:00', '2025-11-29 06:07:00', 60, 'completed', NULL, NULL, NULL, NULL, '2025-11-28 14:07:12', '2025-11-28 14:08:30', NULL, 12, 1000.00, 0.00, 0.42, 999.58, '2025-11-28 14:08:30', 7),
(8, 5, 7, 'repair', 'asdas', 'dasdasd', 'shop', NULL, '123123', '2025-12-27 01:56:00', '2025-12-20 21:58:00', 60, 'completed', NULL, NULL, NULL, 'asdasadasd', '2025-12-02 05:56:57', '2025-12-02 05:58:24', NULL, 13, 300.00, 0.00, 0.00, 300.00, '2025-12-02 05:58:24', 7),
(9, 5, 7, 'repair', 'asasd', 'asdasdad', 'shop', NULL, '123123', '2026-01-04 01:59:00', '2025-12-21 22:03:00', 60, 'completed', NULL, NULL, NULL, '123123', '2025-12-02 05:59:20', '2025-12-02 06:03:52', NULL, 15, 0.00, 0.00, 0.00, 0.00, '2025-12-02 06:03:52', 7),
(10, 5, 7, 'repair', 'asdas', 'dasdasd', 'shop', NULL, '213123', '2026-01-03 01:59:00', '2025-12-19 22:00:00', 60, 'completed', NULL, NULL, NULL, 'dasdasd', '2025-12-02 05:59:55', '2025-12-02 06:00:34', NULL, 14, 0.00, 0.00, 0.00, 0.00, '2025-12-02 06:00:34', 7),
(11, 5, 7, 'repair', 'asdas', 'dasdasdas', 'shop', NULL, 'dasdasd', '2025-12-29 02:17:00', '2025-12-28 22:17:00', 60, 'completed', NULL, NULL, NULL, 'asdasdasd', '2025-12-02 06:17:11', '2025-12-02 06:17:42', NULL, 16, 100.00, 0.00, 0.00, 100.00, '2025-12-02 06:17:42', 7),
(12, 5, 7, 'repair', 'asdas', 'dasdasd', 'shop', NULL, 'asdasdasd', '2025-12-29 02:23:00', '2025-12-14 22:24:00', 60, 'completed', NULL, NULL, NULL, 'dasdasd', '2025-12-02 06:24:02', '2025-12-02 06:24:35', NULL, 17, 1000.00, 0.00, 0.00, 1000.00, '2025-12-02 06:24:35', 7),
(13, 5, 7, 'repair', 'asdasd', 'asdasd', 'shop', NULL, 'asdasd', '2025-12-27 03:20:00', '2025-12-20 23:20:00', 60, 'confirmed', NULL, NULL, NULL, 'asdasd', '2025-12-02 07:20:16', '2025-12-02 07:20:41', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1764888598),
('laravel_cache_5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1764888598;', 1764888598);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(2, 4, '2025-11-04 13:09:58', '2025-11-04 13:09:58'),
(3, 5, '2025-11-04 14:50:12', '2025-11-04 14:50:12'),
(4, 6, '2025-11-04 15:04:33', '2025-11-04 15:04:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cart_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `unit_price`, `created_at`, `updated_at`) VALUES
(28, 2, 3, 1, 200.00, '2025-11-04 18:09:31', '2025-11-04 18:09:31'),
(252, 3, 4, 8, 180.00, '2025-12-05 03:00:58', '2025-12-05 03:00:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Consolas', 'consolas', '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 'Juegos', 'juegos', '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 'Accesorios', 'accesorios', '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 'Coleccionables', 'coleccionables', '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(5, 'Cartuchos', 'cartuchos', '2025-11-16 00:53:31', '2025-11-16 00:53:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `ci` varchar(30) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `customers`
--

INSERT INTO `customers` (`id`, `name`, `ci`, `email`, `phone`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Edson', NULL, 'ecayo507@gmail.com', NULL, NULL, '2025-11-04 07:29:15', '2025-11-04 07:29:15'),
(2, 'Edson', NULL, 'cayoali22@gmail.com', NULL, NULL, '2025-11-04 13:09:56', '2025-11-04 13:09:56'),
(3, 'user', NULL, 'user@gmail.com', 'asdasdasd', NULL, '2025-11-04 14:50:09', '2025-12-02 06:24:35'),
(4, 'Edson', NULL, 'edsonali03@gmail.com', NULL, NULL, '2025-11-04 15:04:30', '2025-11-04 15:04:30'),
(5, 'asdasd', 'asdasd', 'cayoaliedson@gmail.com', NULL, NULL, '2025-11-04 17:23:21', '2025-11-04 17:23:21'),
(6, 'asdasda', '123123', 'asdasd@asdsadasd', NULL, NULL, '2025-11-16 05:52:49', '2025-11-16 05:52:49'),
(7, '123123', '123123', '123123', NULL, NULL, '2025-11-16 06:45:27', '2025-11-16 06:45:27'),
(8, '123123', '123123', '123123', NULL, NULL, '2025-11-16 06:46:56', '2025-11-16 06:46:56'),
(15, 'dasdasd', '123123', 'asdasd@asdasd', NULL, NULL, '2025-11-16 07:31:23', '2025-11-16 07:31:23'),
(16, 'adasd', '12312', 'cayoali22@gmail.com', NULL, NULL, '2025-11-16 07:34:20', '2025-11-16 07:34:20'),
(17, 'user', '123123', 'user@gmail.com', NULL, NULL, '2025-11-18 06:21:13', '2025-11-18 06:21:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `descriptors`
--

CREATE TABLE `descriptors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `aliases` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`aliases`)),
  `weight` double NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `descriptors`
--

INSERT INTO `descriptors` (`id`, `key`, `label`, `aliases`, `weight`, `created_at`, `updated_at`) VALUES
(1, 'consola', 'Consola', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 'nes', 'Nes', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 'original', 'Original', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 'ajyryfsj', 'Ajyryfsj', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(5, 'art', 'Art', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(6, 'iculo', 'Iculo', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(7, 'retro', 'Retro', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(8, 'coleccionistas', 'Coleccionistas', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(9, 'super', 'Super', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(10, 'nintendo', 'Nintendo', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(11, 'snes', 'Snes', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(12, '7w4jzgiq', '7w4jzgiq', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(13, 'cartucho', 'Cartucho', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(14, 'mario', 'Mario', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(15, 'bros', 'Bros', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(16, 'wpwatufd', 'Wpwatufd', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(17, 'control', 'Control', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(18, '2v3ek9fm', '2v3ek9fm', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(19, 'figura', 'Figura', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(20, 'link', 'Link', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(21, '8', '8', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(22, 'bit', 'Bit', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(23, 'tbag4hgm', 'Tbag4hgm', NULL, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(24, 'ybqmryxr', 'Ybqmryxr', NULL, 1, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(25, 'servicios', 'Servicios', NULL, 1, '2025-11-28 14:01:51', '2025-11-28 14:01:51'),
(26, 'serv', 'Serv', NULL, 1, '2025-11-28 14:01:51', '2025-11-28 14:01:51'),
(27, '001', '001', NULL, 1, '2025-11-28 14:01:51', '2025-11-28 14:01:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `events`
--

CREATE TABLE `events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `type` enum('event','tournament') NOT NULL DEFAULT 'event',
  `description` text DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `start_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_at` timestamp NULL DEFAULT NULL,
  `capacity` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `searches_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `preferences_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `banner_url` varchar(255) DEFAULT NULL,
  `registration_open_at` timestamp NULL DEFAULT NULL,
  `registration_close_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_descriptors`
--

CREATE TABLE `event_descriptors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `aliases` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`aliases`)),
  `weight` double NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `event_descriptors`
--

INSERT INTO `event_descriptors` (`id`, `key`, `label`, `aliases`, `weight`, `created_at`, `updated_at`) VALUES
(1, 'torneo', 'Torneo', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(2, 'super', 'Super', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(3, 'mario', 'Mario', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(4, 'bros', 'Bros', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(5, 'nes', 'Nes', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(6, 'pixel', 'Pixel', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(7, 'retro', 'Retro', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(8, 'store', 'Store', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(9, 'sala', 'Sala', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(10, '1', '1', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(11, 'formato', 'Formato', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(12, '1v1', '1v1', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(13, 'bracket', 'Bracket', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(14, 'simple', 'Simple', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(15, 'premios', 'Premios', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(16, 'meetup', 'Meetup', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(17, 'cultura', 'Cultura', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(18, 'trueque', 'Trueque', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(19, 'patio', 'Patio', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(20, 'charla', 'Charla', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(21, 'intercambio', 'Intercambio', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(22, 'cartuchos', 'Cartuchos', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(23, 'showcase', 'Showcase', NULL, 1, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(24, 'asdasd', 'Asdasd', NULL, 1, '2025-11-16 15:35:55', '2025-11-16 15:35:55'),
(25, 'dasdasd', 'Dasdasd', NULL, 1, '2025-11-16 15:35:55', '2025-11-16 15:35:55'),
(26, 'daasdasd', 'Daasdasd', NULL, 1, '2025-11-16 15:35:55', '2025-11-16 15:35:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_descriptors_map`
--

CREATE TABLE `event_descriptors_map` (
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `descriptor_id` bigint(20) UNSIGNED NOT NULL,
  `score` double NOT NULL DEFAULT 0,
  `source` varchar(255) NOT NULL DEFAULT 'auto',
  `indexed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gamer_tag` varchar(80) DEFAULT NULL,
  `team` varchar(120) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `source` varchar(20) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `ticket_code` varchar(40) DEFAULT NULL,
  `ticket_issued_at` timestamp NULL DEFAULT NULL,
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by_admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `checked_in_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_search_meta`
--

CREATE TABLE `event_search_meta` (
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `clicks` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `last_clicked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event_terms`
--

CREATE TABLE `event_terms` (
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `term_id` bigint(20) UNSIGNED NOT NULL,
  `in_title` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `in_description` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `in_location` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_30_190744_create_categories_table', 1),
(5, '2025_08_30_190747_create_products_table', 1),
(6, '2025_08_30_190749_create_customers_table', 1),
(7, '2025_08_30_190751_create_sales_table', 1),
(8, '2025_08_30_190754_create_sale_details_table', 1),
(9, '2025_08_30_203855_create_personal_access_tokens_table', 1),
(10, '2025_08_30_204135_add_role_to_users_table', 1),
(11, '2025_08_31_120138_create_events_table', 1),
(12, '2025_08_31_120139_create_event_registrations_table', 1),
(13, '2025_09_07_002612_create_payments_table', 1),
(14, '2025_09_07_002625_create_payment_events_table', 1),
(15, '2025_09_07_234437_add_role_to_users_table', 1),
(16, '2025_09_09_000018_create_carts_table', 1),
(17, '2025_09_09_000026_create_cart_items_table', 1),
(18, '2025_09_09_002223_add_user_id_to_sales_table', 1),
(19, '2025_10_02_002612_create_search_tables', 1),
(20, '2025_10_02_013313_create_event_search_tables', 1),
(21, '2025_10_02_023158_add_product_search_meta_and_clicks', 1),
(22, '2025_10_02_031207_add_event_search_meta_and_clicks', 1),
(23, '2025_10_02_125516_add_popularity_columns_to_products', 1),
(24, '2025_10_02_125546_create_descriptors_tables', 1),
(25, '2025_10_02_194646_add_counts_to_events', 1),
(26, '2025_10_02_194715_create_event_descriptors_tables', 1),
(27, '2025_10_02_202349_create_user_product_signals', 1),
(28, '2025_10_02_202410_create_user_descriptors', 1),
(29, '2025_10_03_073315_add_idx_user_descriptors_score_to_user_descriptors_table', 1),
(30, '2025_10_28_014223_add_fulfillment_and_cancel_to_sales', 1),
(31, '2025_10_28_060201_add_ci_to_customers_table', 1),
(32, '2025_10_28_060244_add_pickup_doc_to_sales_table', 1),
(33, '2025_11_03_133327_add_user_to_event_registrations_table', 1),
(34, '2025_11_03_145128_add-ticket_to_event_registrations', 1),
(35, '2025_11_03_213538_add_admin_fields_to_event_registrations', 1),
(36, '2025_11_04_012623_harden_users_for_roles_and_force_change', 1),
(37, '2025_11_04_101052_create_appointments_table', 2),
(38, '2025_11_28_084817_add_delivery_meta_to_sales_table', 3),
(39, '2025_11_28_094804_add_billing_fields_to_appointments', 4),
(40, '2025_11_28_094827_add_is_service_to_products', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `provider` varchar(255) NOT NULL DEFAULT 'simulator',
  `intent_id` varchar(255) NOT NULL,
  `client_secret` varchar(255) NOT NULL,
  `amount` int(10) UNSIGNED NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'BOB',
  `status` varchar(40) NOT NULL DEFAULT 'requires_confirmation',
  `failure_reason` varchar(255) DEFAULT NULL,
  `method` varchar(20) NOT NULL DEFAULT 'card',
  `brand` varchar(20) DEFAULT NULL,
  `last4` varchar(4) DEFAULT NULL,
  `requires_action` tinyint(1) NOT NULL DEFAULT 0,
  `next_action` varchar(20) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `sale_id` bigint(20) UNSIGNED DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `payments`
--

INSERT INTO `payments` (`id`, `provider`, `intent_id`, `client_secret`, `amount`, `currency`, `status`, `failure_reason`, `method`, `brand`, `last4`, `requires_action`, `next_action`, `expires_at`, `sale_id`, `metadata`, `created_at`, `updated_at`) VALUES
(1, 'simulator', 'pi_IUGjulDOPGeplnyjiQXmslBx', 'sec_34h8PQlF2McbiRRs0vMGM2YjF7Tfb2rJ', 20000, 'BOB', 'succeeded', NULL, 'card', 'visa', '4242', 0, NULL, NULL, 1, '{\"customer\":{\"name\":\"asdasd\",\"email\":\"cayoaliedson@gmail.com\",\"ci\":\"asdasd\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-04 17:23:17', '2025-11-04 17:23:21'),
(2, 'simulator', 'pi_oZZZTY1AglIjxOYyB1yAPvgr', 'sec_fzvIuwxT1eTjP3YhbFmYcCz4W76J6nLT', 20000, 'BOB', 'requires_confirmation', NULL, 'card', NULL, NULL, 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"asdasd\",\"email\":\"asdasd@sdasd\",\"ci\":\"q213123\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-04 18:09:44', '2025-11-04 18:09:44'),
(3, 'simulator', 'pi_UtlhMRr7Sr2rO6DqBBWsHyfy', 'sec_rHbaQPaYSmp0VScOnYj1yuoZHOWgnXEb', 20000, 'BOB', 'requires_confirmation', NULL, 'card', NULL, NULL, 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"asdasd\",\"email\":\"asdasd@sdasd\",\"ci\":\"q213123\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-04 18:10:19', '2025-11-04 18:10:19'),
(4, 'simulator', 'pi_l8umaDbUwDnU7Q5GswVNzKYQ', 'sec_S71wQzG48Wd0bQzUgqqbZkeBtNpHfoeV', 20000, 'BOB', 'requires_confirmation', NULL, 'card', NULL, NULL, 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"asdasd\",\"email\":\"asdasd@sdasd\",\"ci\":\"q213123\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-04 18:10:24', '2025-11-04 18:10:24'),
(5, 'simulator', 'pi_UD1QeQszZ9wUpu5PuNvieTIl', 'sec_9yau1SdbF5SpdYhM4PyL1reUd0d9gaqg', 120000, 'BOB', 'succeeded', NULL, 'card', 'visa', '4242', 0, NULL, NULL, 2, '{\"customer\":{\"name\":\"asdasda\",\"email\":\"asdasd@asdsadasd\",\"ci\":\"123123\"},\"items\":[{\"product_id\":3,\"qty\":6}],\"pickup_doc_path\":null}', '2025-11-16 05:52:46', '2025-11-16 05:52:49'),
(6, 'simulator', 'pi_dpbERNDFrTritB8bmB7TN4Cr', 'sec_9YKjwfXxeGOelBwjjqGLtVPp4ZcjTdZt', 20000, 'BOB', 'succeeded', NULL, 'card', 'visa', '4242', 0, NULL, NULL, 3, '{\"customer\":{\"name\":null,\"email\":null},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:21:27', '2025-11-16 06:22:56'),
(7, 'simulator', 'pi_lvBaxsqlqAVVww5APf9A5JcY', 'sec_zDWALkkvloiivS787LrZEvP4MSALgooJ', 120000, 'BOB', 'succeeded', NULL, 'card', 'visa', '4242', 0, NULL, NULL, 4, '{\"customer\":{\"name\":null,\"email\":null},\"items\":[{\"product_id\":1,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:23:24', '2025-11-16 06:24:18'),
(8, 'simulator', 'pi_GvKAF3ut24X6FjHEAYN6R5Jy', 'sec_4PF2tiQeHANCYNAgWNGEjRO9v8Q2d9jc', 20000, 'BOB', 'failed', 'otp_invalid', 'card', 'visa', '3220', 0, NULL, NULL, NULL, '{\"customer\":{\"name\":null,\"email\":null},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:25:15', '2025-11-16 06:28:21'),
(9, 'simulator', 'pi_8BVUktonRT3QAQybjSfIh7In', 'sec_YcKV85WrutSFJKoKb23sren8p9PDjc2N', 20000, 'BOB', 'requires_action', NULL, 'card', 'visa', '3220', 1, 'otp', NULL, NULL, '{\"customer\":{\"name\":\"asdasd\",\"email\":\"asdasd\",\"ci\":\"asdasd\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:28:30', '2025-11-16 06:28:46'),
(10, 'simulator', 'pi_vgnZH4SYtdrRrDcYfSZ6OwUG', 'sec_56pEF53Tcb4hasWDPW5iub4P7SSOgvqV', 20000, 'BOB', 'requires_confirmation', NULL, 'card', NULL, NULL, 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"asdasd\",\"email\":\"asdasd\",\"ci\":\"asdasd\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:30:28', '2025-11-16 06:30:28'),
(11, 'simulator', 'pi_I6HiW3KptPSzmIb4yvxBoPW6', 'sec_Jhlj7Mp3ipen0bVVEtlC46cDLI9zbQa0', 20000, 'BOB', 'requires_action', NULL, 'card', 'visa', '3220', 1, 'otp', NULL, NULL, '{\"customer\":{\"name\":\"asdasd\",\"email\":\"asdasd\",\"ci\":\"asdasd\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:31:09', '2025-11-16 06:31:14'),
(12, 'simulator', 'pi_5YduIgew1Gb8CTXnfkFK8D5y', 'sec_t5dDMMP2YdEjbXmXOMEiFA2ZEQYGUZYR', 20000, 'BOB', 'requires_action', NULL, 'card', 'visa', '3220', 1, 'otp', NULL, NULL, '{\"customer\":{\"name\":null,\"email\":null},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:32:01', '2025-11-16 06:32:28'),
(13, 'simulator', 'pi_wrd7l7LEe6X5t5OP4kUYVu9k', 'sec_0jVOKkEng20wuKLGp9b0Mr6FWGJhQqK0', 20000, 'BOB', 'requires_action', NULL, 'card', 'visa', '3220', 1, 'otp', NULL, NULL, '{\"customer\":{\"name\":null,\"email\":null},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:34:21', '2025-11-16 06:34:36'),
(14, 'simulator', 'pi_G1aS4SiXFNQzykspJ3k7ILZI', 'sec_AWUGBC3HpsJU60EL9rd3Qe2xFnocWXxn', 20000, 'BOB', 'requires_confirmation', NULL, 'card', NULL, NULL, 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"dasdasd\",\"email\":\"asdasd\",\"ci\":\"asdasd\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:35:44', '2025-11-16 06:35:44'),
(15, 'simulator', 'pi_Qy603CeSfY8VE9pasKZACV9Z', 'sec_yrvKHFm8ykQEcWbx3SOjfhKO7S75ThlA', 20000, 'BOB', 'requires_confirmation', NULL, 'card', NULL, NULL, 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"dasdasd\",\"email\":\"asdasd\",\"ci\":\"asdasd\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:36:29', '2025-11-16 06:36:29'),
(16, 'simulator', 'pi_dH19EfCoH5Mz16tklzERupGE', 'sec_XdF0aQljMvvKI2ZXRwKTAX9NYWMWyP6x', 20000, 'BOB', 'requires_confirmation', NULL, 'card', NULL, NULL, 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"dasdasd\",\"email\":\"asdasd\",\"ci\":\"asdasd\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:38:59', '2025-11-16 06:38:59'),
(17, 'simulator', 'pi_TQRd1bKRgh9y0QkBBHco4ohz', 'sec_deKnCu3Jx7ZYiBySEEojSyTA6UV98KTZ', 20000, 'BOB', 'requires_confirmation', NULL, 'card', NULL, NULL, 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"dasdasd\",\"email\":\"asdasd\",\"ci\":\"asdasd\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:39:52', '2025-11-16 06:39:52'),
(18, 'simulator', 'pi_7M3DSBnwCZl2kzV6y0hVf62q', 'sec_metgcb3eqz5f6cNf8apLGrpVV58tbCeW', 20000, 'BOB', 'requires_action', NULL, 'card', 'visa', '3220', 1, 'otp', NULL, NULL, '{\"customer\":{\"name\":\"123123\",\"email\":\"123123\",\"ci\":\"123123\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:45:00', '2025-11-16 06:45:16'),
(19, 'simulator', 'pi_XCv3gadR818EOLQKYDxad8pr', 'sec_ooAD6pJv74gA8XLvr0JI1jhWo5kWxxwu', 20000, 'BOB', 'failed', 'stock_or_transaction', 'card', 'visa', '3220', 0, NULL, NULL, 5, '{\"customer\":{\"name\":\"123123\",\"email\":\"123123\",\"ci\":\"123123\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:45:21', '2025-11-16 06:45:27'),
(20, 'simulator', 'pi_R4CGku69Sv5dTFdJXIyoA9A7', 'sec_Sdj356iVjznU6Hn1bo5qo7x7wEMvMuS8', 20000, 'BOB', 'failed', 'stock_or_transaction', 'card', 'visa', '3220', 0, NULL, NULL, 6, '{\"customer\":{\"name\":\"123123\",\"email\":\"123123\",\"ci\":\"123123\"},\"items\":[{\"product_id\":3,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:46:45', '2025-11-16 06:46:56'),
(21, 'simulator', 'pi_qdRXTqy6zxmwYDWKsdCyoGcP', 'sec_neUXWuMBJ0G41Qwhjk9xyMuSX8bCAOCv', 40000, 'BOB', 'requires_action', NULL, 'card', 'visa', '3220', 1, 'otp', NULL, NULL, '{\"customer\":{\"name\":\"123123\",\"email\":\"123123\",\"ci\":\"123123\"},\"items\":[{\"product_id\":3,\"qty\":2}],\"pickup_doc_path\":null}', '2025-11-16 06:51:39', '2025-11-16 06:51:43'),
(22, 'simulator', 'pi_h07FaLIBtMmA5CsRlObXOBqg', 'sec_uB0MAPuzk5yXqOX30HOjfBWS33tpmweh', 40000, 'BOB', 'failed', 'stock_or_transaction', 'card', 'visa', '3220', 1, 'otp', NULL, NULL, '{\"customer\":{\"name\":\"123123\",\"email\":\"123123\",\"ci\":\"123123\"},\"items\":[{\"product_id\":3,\"qty\":2}],\"pickup_doc_path\":null}', '2025-11-16 06:51:47', '2025-11-16 06:51:59'),
(23, 'simulator', 'pi_6sfVwLZngcxPj2Cb55aYM5DD', 'sec_n6PWIPhSe8KYFIkvxm8neeA7EekTQsQU', 40000, 'BOB', 'failed', 'stock_or_transaction', 'card', 'visa', '4242', 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"123123\",\"email\":\"asd@sdasdasd\",\"ci\":\"123123\"},\"items\":[{\"product_id\":3,\"qty\":2}],\"pickup_doc_path\":null}', '2025-11-16 06:53:41', '2025-11-16 06:53:51'),
(24, 'simulator', 'pi_epCQuAfoxSmD0mFCg496w72X', 'sec_n1gShIY25coG7pyFwZTbVaNXutjOw7CN', 120000, 'BOB', 'succeeded', NULL, 'card', 'visa', '3220', 0, NULL, NULL, 7, '{\"customer\":{\"name\":null,\"email\":null},\"items\":[{\"product_id\":1,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 06:58:51', '2025-11-16 06:59:10'),
(25, 'simulator', 'pi_ds0ODK0ELfGLYnPpccWwdNVf', 'sec_M9flaPNEdkWIKW2zNkK9SFZEaOOM9wPs', 150000, 'BOB', 'succeeded', NULL, 'card', 'visa', '4242', 0, NULL, NULL, 8, '{\"customer\":{\"name\":\"dasdasd\",\"email\":\"asdasd@asdasd\",\"ci\":\"123123\"},\"items\":[{\"product_id\":2,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 07:31:22', '2025-11-16 07:31:23'),
(26, 'simulator', 'pi_BMs5l3tO8Nq06hTtsA0y8Dn1', 'sec_TkRRrP6X7VpFOabrDN0E59p0N0SGew6t', 18000, 'BOB', 'requires_action', NULL, 'card', 'visa', '3220', 1, 'otp', NULL, NULL, '{\"customer\":{\"name\":\"adasd\",\"email\":\"cayoali22@gmail.com\",\"ci\":\"12312\"},\"items\":[{\"product_id\":4,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 07:33:46', '2025-11-16 07:33:47'),
(27, 'simulator', 'pi_pFBNR02KguLb6oBquxMfsu8B', 'sec_h0t77gcSYgYjM3MSisqGbn4ZLhOBUnjx', 18000, 'BOB', 'failed', 'otp_invalid', 'card', 'visa', '3220', 0, NULL, NULL, NULL, '{\"customer\":{\"name\":\"adasd\",\"email\":\"cayoali22@gmail.com\",\"ci\":\"12312\"},\"items\":[{\"product_id\":4,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 07:33:55', '2025-11-16 07:34:02'),
(28, 'simulator', 'pi_8ZvHRRJNepTptXYqewAMfF02', 'sec_x1tW3XrGnl5tMAsUZQfHcyfCvvh2pnUh', 18000, 'BOB', 'succeeded', NULL, 'card', 'visa', '3220', 0, NULL, NULL, 9, '{\"customer\":{\"name\":\"adasd\",\"email\":\"cayoali22@gmail.com\",\"ci\":\"12312\"},\"items\":[{\"product_id\":4,\"qty\":1}],\"pickup_doc_path\":null}', '2025-11-16 07:34:13', '2025-11-16 07:34:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payment_events`
--

CREATE TABLE `payment_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(40) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `payment_events`
--

INSERT INTO `payment_events` (`id`, `payment_id`, `type`, `data`, `created_at`, `updated_at`) VALUES
(1, 1, 'intent.created', '[]', '2025-11-04 17:23:17', '2025-11-04 17:23:17'),
(2, 1, 'payment.succeeded', '{\"sale_id\":1}', '2025-11-04 17:23:21', '2025-11-04 17:23:21'),
(3, 2, 'intent.created', '[]', '2025-11-04 18:09:44', '2025-11-04 18:09:44'),
(4, 3, 'intent.created', '[]', '2025-11-04 18:10:19', '2025-11-04 18:10:19'),
(5, 4, 'intent.created', '[]', '2025-11-04 18:10:24', '2025-11-04 18:10:24'),
(6, 5, 'intent.created', '[]', '2025-11-16 05:52:46', '2025-11-16 05:52:46'),
(7, 5, 'payment.succeeded', '{\"sale_id\":2}', '2025-11-16 05:52:49', '2025-11-16 05:52:49'),
(8, 6, 'intent.created', '[]', '2025-11-16 06:21:27', '2025-11-16 06:21:27'),
(9, 6, 'payment.succeeded', '{\"sale_id\":3}', '2025-11-16 06:22:56', '2025-11-16 06:22:56'),
(10, 7, 'intent.created', '[]', '2025-11-16 06:23:24', '2025-11-16 06:23:24'),
(11, 7, 'payment.succeeded', '{\"sale_id\":4}', '2025-11-16 06:24:18', '2025-11-16 06:24:18'),
(12, 8, 'intent.created', '[]', '2025-11-16 06:25:15', '2025-11-16 06:25:15'),
(13, 8, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:28:13', '2025-11-16 06:28:13'),
(14, 8, 'payment.failed', '{\"reason\":\"otp_invalid\"}', '2025-11-16 06:28:21', '2025-11-16 06:28:21'),
(15, 9, 'intent.created', '[]', '2025-11-16 06:28:30', '2025-11-16 06:28:30'),
(16, 9, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:28:46', '2025-11-16 06:28:46'),
(17, 10, 'intent.created', '[]', '2025-11-16 06:30:28', '2025-11-16 06:30:28'),
(18, 11, 'intent.created', '[]', '2025-11-16 06:31:09', '2025-11-16 06:31:09'),
(19, 11, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:31:14', '2025-11-16 06:31:14'),
(20, 12, 'intent.created', '[]', '2025-11-16 06:32:01', '2025-11-16 06:32:01'),
(21, 12, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:32:28', '2025-11-16 06:32:28'),
(22, 13, 'intent.created', '[]', '2025-11-16 06:34:21', '2025-11-16 06:34:21'),
(23, 13, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:34:36', '2025-11-16 06:34:36'),
(24, 14, 'intent.created', '[]', '2025-11-16 06:35:44', '2025-11-16 06:35:44'),
(25, 15, 'intent.created', '[]', '2025-11-16 06:36:29', '2025-11-16 06:36:29'),
(26, 16, 'intent.created', '[]', '2025-11-16 06:38:59', '2025-11-16 06:38:59'),
(27, 17, 'intent.created', '[]', '2025-11-16 06:39:52', '2025-11-16 06:39:52'),
(28, 18, 'intent.created', '[]', '2025-11-16 06:45:00', '2025-11-16 06:45:00'),
(29, 18, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:45:16', '2025-11-16 06:45:16'),
(30, 19, 'intent.created', '[]', '2025-11-16 06:45:21', '2025-11-16 06:45:21'),
(31, 19, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:45:25', '2025-11-16 06:45:25'),
(32, 19, 'payment.succeeded', '{\"sale_id\":5}', '2025-11-16 06:45:27', '2025-11-16 06:45:27'),
(33, 19, 'payment.failed', '{\"reason\":\"stock_or_transaction\"}', '2025-11-16 06:45:27', '2025-11-16 06:45:27'),
(34, 20, 'intent.created', '[]', '2025-11-16 06:46:45', '2025-11-16 06:46:45'),
(35, 20, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:46:53', '2025-11-16 06:46:53'),
(36, 20, 'payment.succeeded', '{\"sale_id\":6}', '2025-11-16 06:46:56', '2025-11-16 06:46:56'),
(37, 20, 'payment.failed', '{\"reason\":\"stock_or_transaction\"}', '2025-11-16 06:46:56', '2025-11-16 06:46:56'),
(38, 21, 'intent.created', '[]', '2025-11-16 06:51:39', '2025-11-16 06:51:39'),
(39, 21, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:51:43', '2025-11-16 06:51:43'),
(40, 22, 'intent.created', '[]', '2025-11-16 06:51:47', '2025-11-16 06:51:47'),
(41, 22, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:51:57', '2025-11-16 06:51:57'),
(42, 22, 'payment.failed', '{\"reason\":\"stock_or_transaction\"}', '2025-11-16 06:51:59', '2025-11-16 06:51:59'),
(43, 23, 'intent.created', '[]', '2025-11-16 06:53:41', '2025-11-16 06:53:41'),
(44, 23, 'payment.failed', '{\"reason\":\"stock_or_transaction\"}', '2025-11-16 06:53:51', '2025-11-16 06:53:51'),
(45, 23, 'payment.failed', '{\"reason\":\"stock_or_transaction\"}', '2025-11-16 06:54:03', '2025-11-16 06:54:03'),
(46, 23, 'payment.failed', '{\"reason\":\"stock_or_transaction\"}', '2025-11-16 06:54:29', '2025-11-16 06:54:29'),
(47, 23, 'payment.failed', '{\"reason\":\"stock_or_transaction\"}', '2025-11-16 06:54:34', '2025-11-16 06:54:34'),
(48, 23, 'payment.failed', '{\"reason\":\"stock_or_transaction\"}', '2025-11-16 06:54:50', '2025-11-16 06:54:50'),
(49, 24, 'intent.created', '[]', '2025-11-16 06:58:51', '2025-11-16 06:58:51'),
(50, 24, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 06:59:06', '2025-11-16 06:59:06'),
(51, 24, 'payment.succeeded', '{\"sale_id\":7}', '2025-11-16 06:59:10', '2025-11-16 06:59:10'),
(52, 25, 'intent.created', '[]', '2025-11-16 07:31:22', '2025-11-16 07:31:22'),
(53, 25, 'payment.succeeded', '{\"sale_id\":8}', '2025-11-16 07:31:23', '2025-11-16 07:31:23'),
(54, 26, 'intent.created', '[]', '2025-11-16 07:33:46', '2025-11-16 07:33:46'),
(55, 26, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 07:33:47', '2025-11-16 07:33:47'),
(56, 27, 'intent.created', '[]', '2025-11-16 07:33:55', '2025-11-16 07:33:55'),
(57, 27, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 07:33:56', '2025-11-16 07:33:56'),
(58, 27, 'payment.failed', '{\"reason\":\"otp_invalid\"}', '2025-11-16 07:34:02', '2025-11-16 07:34:02'),
(59, 28, 'intent.created', '[]', '2025-11-16 07:34:13', '2025-11-16 07:34:13'),
(60, 28, 'payment.requires_action', '{\"action\":\"otp\"}', '2025-11-16 07:34:14', '2025-11-16 07:34:14'),
(61, 28, 'payment.succeeded', '{\"sale_id\":9}', '2025-11-16 07:34:20', '2025-11-16 07:34:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(4, 'App\\Models\\User', 2, 'admin', '22b040e31f481790ede70dba16bb9a4e15af2d484d77ddd71d6f1db44c410ed4', '[\"*\"]', '2025-11-04 06:30:26', NULL, '2025-11-04 06:30:09', '2025-11-04 06:30:26'),
(8, 'App\\Models\\User', 3, 'customer', '78f832da9fae7b61b7cfdb1d8a618bf8f0ee9e3a782b1c7576ae57d60d8d70ee', '[\"*\"]', '2025-11-04 12:57:50', NULL, '2025-11-04 07:29:15', '2025-11-04 12:57:50'),
(12, 'App\\Models\\User', 4, 'customer', '57e346aa4c34c607a4089d91e2a29c6857be453febddf60be4dc73afb5384331', '[\"*\"]', '2025-11-04 13:28:12', NULL, '2025-11-04 13:25:45', '2025-11-04 13:28:12'),
(13, 'App\\Models\\User', 2, 'admin', '8805d8ecf770b2494f0a8a4369a77b3a8dd1d898d42775d1b346e899f3317aa2', '[\"*\"]', '2025-11-04 15:23:29', NULL, '2025-11-04 14:49:37', '2025-11-04 15:23:29'),
(18, 'App\\Models\\User', 4, 'customer', '1ec0f1647cfd26655f285091f886d20803d68f10a3a705caa262251b5511181a', '[\"*\"]', '2025-11-04 18:11:31', NULL, '2025-11-04 16:55:13', '2025-11-04 18:11:31'),
(19, 'App\\Models\\User', 7, 'admin', 'e4609fa614c7439ed2df3603d4bedcf3e964ab2e2174ba417995ae2b277d7e38', '[\"*\"]', '2025-11-04 17:10:20', NULL, '2025-11-04 16:57:11', '2025-11-04 17:10:20'),
(22, 'App\\Models\\User', 7, 'admin', '066ade7301a61afe99afea9d24bfc64ec0a26086312c9479d61b0191a73c3b8b', '[\"*\"]', '2025-11-04 18:11:42', NULL, '2025-11-04 17:53:37', '2025-11-04 18:11:42'),
(23, 'App\\Models\\User', 5, 'customer', '2c032523985e9e12aab97695debae83d6e3ab200153a18a1a317a1ef6f1cff4e', '[\"*\"]', '2025-11-11 04:42:26', NULL, '2025-11-11 04:42:13', '2025-11-11 04:42:26'),
(24, 'App\\Models\\User', 5, 'customer', '3529ac56329a43051be38cef1462de91411059791f991e40f191fbc6c7d4693c', '[\"*\"]', '2025-11-15 17:04:28', NULL, '2025-11-15 17:04:24', '2025-11-15 17:04:28'),
(26, 'App\\Models\\User', 1, 'admin', '404580953499e5e56af45d03353a5f889764a5f49f5d5dafcfeb44941b0f2b94', '[\"*\"]', '2025-11-15 17:55:31', NULL, '2025-11-15 17:32:39', '2025-11-15 17:55:31'),
(33, 'App\\Models\\User', 5, 'customer', 'bb17d871fe108b87f33e1ea9a33f8be10116edb3a3def63b1f722ce487bb102e', '[\"*\"]', '2025-11-16 03:45:00', NULL, '2025-11-16 02:55:51', '2025-11-16 03:45:00'),
(39, 'App\\Models\\User', 7, 'admin', '31a34156431c6628d0d0b24ee0f45ed41b91092a0a7d805ffdb816f784dc18b4', '[\"*\"]', '2025-11-16 16:55:41', NULL, '2025-11-16 16:35:14', '2025-11-16 16:55:41'),
(41, 'App\\Models\\User', 5, 'customer', '9e0c1f8741f9171ce6c3a930878676144d1fc0ebd00ee0308ed06398f9df73c0', '[\"*\"]', '2025-11-17 05:22:26', NULL, '2025-11-16 18:33:39', '2025-11-17 05:22:26'),
(43, 'App\\Models\\User', 1, 'admin', '9c7b147d90e8240ecc789adf79b1621c3abe4d90323e355823e4481789137b6d', '[\"*\"]', '2025-11-17 07:26:46', NULL, '2025-11-17 05:16:09', '2025-11-17 07:26:46'),
(46, 'App\\Models\\User', 5, 'customer', '725dbeee9dd9ddca931b65187439b77e935db8c4f16ca92f1bd98d6e012750a6', '[\"*\"]', '2025-12-05 03:00:58', NULL, '2025-11-18 05:06:08', '2025-12-05 03:00:58'),
(48, 'App\\Models\\User', 7, 'admin', 'da138955dab99ff0b9ae53a1119304edb99490501854a83f757ad433d2711099', '[\"*\"]', '2025-11-18 15:14:33', NULL, '2025-11-18 14:00:06', '2025-11-18 15:14:33'),
(50, 'App\\Models\\User', 7, 'admin', '2c8b0bb0be09817f527299c621ac7b4791e2bc92c65f1ee5518a3b359ce00143', '[\"*\"]', '2025-11-28 14:06:30', NULL, '2025-11-28 13:33:44', '2025-11-28 14:06:30'),
(51, 'App\\Models\\User', 5, 'customer', 'cfd179c17b874cae869fdd48d9f194d879829a0246ebf3553a6ad77b45f1f7a5', '[\"*\"]', '2025-12-02 14:52:10', NULL, '2025-11-28 14:06:53', '2025-12-02 14:52:10'),
(52, 'App\\Models\\User', 7, 'admin', '10612688510acbac03412629e5ac853a2201934fa9ee35b1625a3b2d9bb8287c', '[\"*\"]', '2025-11-28 14:08:48', NULL, '2025-11-28 14:07:49', '2025-11-28 14:08:48'),
(54, 'App\\Models\\User', 7, 'admin', 'a0a25a7787ae1e4cd7770109c6fd9b7864d665734fc6cc4ee6561f4047656d8a', '[\"*\"]', '2025-12-02 15:11:20', NULL, '2025-12-02 05:57:53', '2025-12-02 15:11:20'),
(55, 'App\\Models\\User', 1, 'admin', '7e8d81dd7dc82ccf2ec1e692ecebd47b8ef86c6c7db32f93c9af6ba4a6312bb8', '[\"*\"]', '2025-12-05 02:48:54', NULL, '2025-12-05 02:46:54', '2025-12-05 02:48:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `sku` varchar(80) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `condition` enum('new','used','refurbished') NOT NULL DEFAULT 'new',
  `is_unique` tinyint(1) NOT NULL DEFAULT 0,
  `is_service` tinyint(1) NOT NULL DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('active','draft') NOT NULL DEFAULT 'active',
  `searches_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `preferences_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `sku`, `description`, `price`, `stock`, `condition`, `is_unique`, `is_service`, `image_url`, `status`, `searches_count`, `preferences_count`, `created_at`, `updated_at`) VALUES
(2, 1, 'Super Nintendo SNES', 'super-nintendo-snes', '7W4JZGIQ', 'Artículo retro para coleccionistas.', 1500.00, 0, 'used', 1, 0, NULL, 'active', 0, 1, '2025-11-04 06:18:54', '2025-11-16 07:31:23'),
(3, 2, 'Cartucho Mario Bros (NES)', 'cartucho-mario-bros-nes', 'WPWATUFD', 'Artículo retro para coleccionistas.', 200.00, 0, 'used', 0, 0, NULL, 'active', 2, 6, '2025-11-04 06:18:54', '2025-11-16 06:46:56'),
(4, 3, 'Control SNES original', 'control-snes-original', '2V3EK9FM', 'Artículo retro para coleccionistas.', 180.00, 8, 'used', 0, 0, NULL, 'active', 0, 2, '2025-11-04 06:18:54', '2025-11-16 07:53:45'),
(5, 5, 'Figura Link 8-bit', 'figura-link-8-bit', 'TBAG4HGM', 'Artículo retro para coleccionistas.', 250.00, 4, 'refurbished', 0, 0, NULL, 'active', 0, 0, '2025-11-04 06:18:54', '2025-11-18 06:21:13'),
(6, 1, 'Consola NES (Original)', 'consola-nes-original', 'YBQMRYXR', 'Artículo retro para coleccionistas.', 1200.00, 2, 'used', 1, 0, NULL, 'active', 0, 0, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(7, NULL, 'Servicios', 'servicios', 'SERV-001', NULL, 0.00, 7, 'new', 0, 1, NULL, 'active', 0, 0, '2025-11-28 14:01:51', '2025-12-05 02:47:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_descriptors`
--

CREATE TABLE `product_descriptors` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `descriptor_id` bigint(20) UNSIGNED NOT NULL,
  `score` double NOT NULL DEFAULT 0,
  `source` varchar(255) NOT NULL DEFAULT 'auto',
  `indexed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `product_descriptors`
--

INSERT INTO `product_descriptors` (`product_id`, `descriptor_id`, `score`, `source`, `indexed_at`) VALUES
(2, 5, 1, 'auto', '2025-11-04 06:18:54'),
(2, 6, 1, 'auto', '2025-11-04 06:18:54'),
(2, 7, 1, 'auto', '2025-11-04 06:18:54'),
(2, 8, 1, 'auto', '2025-11-04 06:18:54'),
(2, 9, 3, 'auto', '2025-11-04 06:18:54'),
(2, 10, 3, 'auto', '2025-11-04 06:18:54'),
(2, 11, 3, 'auto', '2025-11-04 06:18:54'),
(2, 12, 2, 'auto', '2025-11-04 06:18:54'),
(3, 2, 3, 'auto', '2025-11-04 06:18:54'),
(3, 5, 1, 'auto', '2025-11-04 06:18:54'),
(3, 6, 1, 'auto', '2025-11-04 06:18:54'),
(3, 7, 1, 'auto', '2025-11-04 06:18:54'),
(3, 8, 1, 'auto', '2025-11-04 06:18:54'),
(3, 13, 3, 'auto', '2025-11-04 06:18:54'),
(3, 14, 3, 'auto', '2025-11-04 06:18:54'),
(3, 15, 3, 'auto', '2025-11-04 06:18:54'),
(3, 16, 2, 'auto', '2025-11-04 06:18:54'),
(4, 3, 3, 'auto', '2025-11-04 06:18:54'),
(4, 5, 1, 'auto', '2025-11-04 06:18:54'),
(4, 6, 1, 'auto', '2025-11-04 06:18:54'),
(4, 7, 1, 'auto', '2025-11-04 06:18:54'),
(4, 8, 1, 'auto', '2025-11-04 06:18:54'),
(4, 11, 3, 'auto', '2025-11-04 06:18:54'),
(4, 17, 3, 'auto', '2025-11-04 06:18:54'),
(4, 18, 2, 'auto', '2025-11-04 06:18:54'),
(5, 5, 1, 'auto', '2025-11-16 16:55:39'),
(5, 6, 1, 'auto', '2025-11-16 16:55:39'),
(5, 7, 1, 'auto', '2025-11-16 16:55:39'),
(5, 8, 1, 'auto', '2025-11-16 16:55:39'),
(5, 19, 3, 'auto', '2025-11-16 16:55:39'),
(5, 20, 3, 'auto', '2025-11-16 16:55:39'),
(5, 21, 3, 'auto', '2025-11-16 16:55:39'),
(5, 22, 3, 'auto', '2025-11-16 16:55:39'),
(5, 23, 2, 'auto', '2025-11-16 16:55:39'),
(6, 1, 3, 'auto', '2025-11-28 13:49:59'),
(6, 2, 3, 'auto', '2025-11-28 13:49:59'),
(6, 3, 3, 'auto', '2025-11-28 13:49:59'),
(6, 5, 1, 'auto', '2025-11-28 13:49:59'),
(6, 6, 1, 'auto', '2025-11-28 13:49:59'),
(6, 7, 1, 'auto', '2025-11-28 13:49:59'),
(6, 8, 1, 'auto', '2025-11-28 13:49:59'),
(6, 24, 2, 'auto', '2025-11-28 13:49:59'),
(7, 25, 3, 'auto', '2025-11-28 14:01:51'),
(7, 26, 2, 'auto', '2025-11-28 14:01:51'),
(7, 27, 2, 'auto', '2025-11-28 14:01:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_search_meta`
--

CREATE TABLE `product_search_meta` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `clicks` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `last_clicked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_terms`
--

CREATE TABLE `product_terms` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `term_id` bigint(20) UNSIGNED NOT NULL,
  `in_name` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `in_description` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `in_sku` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `product_terms`
--

INSERT INTO `product_terms` (`product_id`, `term_id`, `in_name`, `in_description`, `in_sku`, `created_at`, `updated_at`) VALUES
(2, 4, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 5, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 6, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 7, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 9, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 10, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 11, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 12, 0, 0, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 2, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 4, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 5, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 6, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 7, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 13, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 14, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 15, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 16, 0, 0, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 3, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 4, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 5, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 6, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 7, 0, 1, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 11, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 17, 1, 0, 0, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 18, 0, 0, 1, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(5, 4, 0, 1, 0, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(5, 5, 0, 1, 0, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(5, 6, 0, 1, 0, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(5, 7, 0, 1, 0, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(5, 19, 1, 0, 0, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(5, 20, 1, 0, 0, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(5, 21, 1, 0, 0, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(5, 22, 1, 0, 0, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(5, 23, 0, 0, 1, '2025-11-16 16:55:39', '2025-11-16 16:55:39'),
(6, 1, 1, 0, 0, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(6, 2, 1, 0, 0, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(6, 3, 1, 0, 0, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(6, 4, 0, 1, 0, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(6, 5, 0, 1, 0, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(6, 6, 0, 1, 0, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(6, 7, 0, 1, 0, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(6, 24, 0, 0, 1, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(7, 25, 1, 0, 0, '2025-11-28 14:01:51', '2025-11-28 14:01:51'),
(7, 26, 0, 0, 1, '2025-11-28 14:01:51', '2025-11-28 14:01:51'),
(7, 27, 0, 0, 1, '2025-11-28 14:01:51', '2025-11-28 14:01:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `delivery_status` enum('to_deliver','delivered') NOT NULL DEFAULT 'to_deliver',
  `delivered_at` timestamp NULL DEFAULT NULL,
  `payment_ref` varchar(255) DEFAULT NULL,
  `pickup_doc_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `delivered_by` bigint(20) UNSIGNED DEFAULT NULL,
  `delivered_to_ci` varchar(50) DEFAULT NULL,
  `delivered_to_name` varchar(150) DEFAULT NULL,
  `delivery_notes` varchar(500) DEFAULT NULL,
  `is_canceled` tinyint(1) NOT NULL DEFAULT 0,
  `canceled_at` timestamp NULL DEFAULT NULL,
  `canceled_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sales`
--

INSERT INTO `sales` (`id`, `user_id`, `customer_id`, `total`, `status`, `delivery_status`, `delivered_at`, `payment_ref`, `pickup_doc_path`, `created_at`, `updated_at`, `delivered_by`, `delivered_to_ci`, `delivered_to_name`, `delivery_notes`, `is_canceled`, `canceled_at`, `canceled_by`, `cancel_reason`) VALUES
(1, 4, 5, 200.00, 'paid', 'delivered', '2025-11-28 12:57:57', 'pi_IUGjulDOPGeplnyjiQXmslBx', NULL, '2025-11-04 17:23:21', '2025-11-28 12:57:57', 1, 'asdasd', 'asdasd', NULL, 0, NULL, NULL, NULL),
(2, 5, 6, 1200.00, 'paid', 'to_deliver', NULL, 'pi_UD1QeQszZ9wUpu5PuNvieTIl', NULL, '2025-11-16 05:52:49', '2025-11-16 05:52:49', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(3, 5, NULL, 200.00, 'paid', 'to_deliver', NULL, 'pi_dpbERNDFrTritB8bmB7TN4Cr', NULL, '2025-11-16 06:22:56', '2025-11-16 06:22:56', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(4, 5, NULL, 1200.00, 'paid', 'to_deliver', NULL, 'pi_lvBaxsqlqAVVww5APf9A5JcY', NULL, '2025-11-16 06:24:18', '2025-11-16 06:24:18', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(5, 5, 7, 200.00, 'paid', 'delivered', '2025-11-28 12:27:29', 'pi_XCv3gadR818EOLQKYDxad8pr', NULL, '2025-11-16 06:45:27', '2025-11-28 12:27:29', 1, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(6, 5, 8, 200.00, 'paid', 'to_deliver', NULL, 'pi_R4CGku69Sv5dTFdJXIyoA9A7', NULL, '2025-11-16 06:46:56', '2025-11-16 06:46:56', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(7, 5, NULL, 1200.00, 'paid', 'to_deliver', NULL, 'pi_epCQuAfoxSmD0mFCg496w72X', NULL, '2025-11-16 06:59:10', '2025-11-16 06:59:10', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(8, 5, 15, 1500.00, 'paid', 'to_deliver', NULL, 'pi_ds0ODK0ELfGLYnPpccWwdNVf', NULL, '2025-11-16 07:31:23', '2025-11-16 07:31:23', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(9, 5, 16, 180.00, 'paid', 'to_deliver', NULL, 'pi_8ZvHRRJNepTptXYqewAMfF02', NULL, '2025-11-16 07:34:20', '2025-11-16 07:48:06', NULL, NULL, NULL, NULL, 1, '2025-11-16 07:48:06', 1, 'ssaDASD'),
(10, 7, 17, 250.00, 'paid', 'delivered', '2025-11-28 12:26:36', 'POS-3OALCE5P', NULL, '2025-11-18 06:21:13', '2025-11-28 12:26:36', 1, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(11, 7, NULL, 70.00, 'paid', 'to_deliver', NULL, NULL, NULL, '2025-11-28 14:01:51', '2025-12-05 02:47:38', NULL, NULL, NULL, NULL, 1, '2025-12-05 02:47:38', 1, 'ddsdsd'),
(12, 7, NULL, 999.58, 'paid', 'to_deliver', NULL, NULL, NULL, '2025-11-28 14:08:30', '2025-12-02 15:11:20', NULL, NULL, NULL, NULL, 1, '2025-12-02 15:11:20', 7, 'asdasdasdasd'),
(13, 7, NULL, 300.00, 'paid', 'to_deliver', NULL, NULL, NULL, '2025-12-02 05:58:24', '2025-12-02 14:59:09', NULL, NULL, NULL, NULL, 1, '2025-12-02 14:59:09', 7, NULL),
(14, 7, NULL, 0.00, 'paid', 'to_deliver', NULL, NULL, NULL, '2025-12-02 06:00:34', '2025-12-02 14:58:50', NULL, NULL, NULL, NULL, 1, '2025-12-02 14:58:50', 7, NULL),
(15, 7, NULL, 0.00, 'paid', 'to_deliver', NULL, NULL, NULL, '2025-12-02 06:03:52', '2025-12-02 14:52:33', NULL, NULL, NULL, NULL, 1, '2025-12-02 14:52:33', 7, NULL),
(16, 7, NULL, 100.00, 'paid', 'to_deliver', NULL, NULL, NULL, '2025-12-02 06:17:42', '2025-12-02 15:04:47', NULL, NULL, NULL, NULL, 1, '2025-12-02 15:04:47', 7, NULL),
(17, 7, 3, 1000.00, 'paid', 'to_deliver', NULL, NULL, NULL, '2025-12-02 06:24:35', '2025-12-02 15:05:08', NULL, NULL, NULL, NULL, 1, '2025-12-02 15:05:08', 7, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sale_details`
--

CREATE TABLE `sale_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sale_details`
--

INSERT INTO `sale_details` (`id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 1, 200.00, 200.00, '2025-11-04 17:23:21', '2025-11-04 17:23:21'),
(2, 2, 3, 6, 200.00, 1200.00, '2025-11-16 05:52:49', '2025-11-16 05:52:49'),
(3, 3, 3, 1, 200.00, 200.00, '2025-11-16 06:22:56', '2025-11-16 06:22:56'),
(5, 5, 3, 1, 200.00, 200.00, '2025-11-16 06:45:27', '2025-11-16 06:45:27'),
(6, 6, 3, 1, 200.00, 200.00, '2025-11-16 06:46:56', '2025-11-16 06:46:56'),
(8, 8, 2, 1, 1500.00, 1500.00, '2025-11-16 07:31:23', '2025-11-16 07:31:23'),
(9, 9, 4, 1, 180.00, 180.00, '2025-11-16 07:34:20', '2025-11-16 07:34:20'),
(10, 10, 5, 1, 250.00, 250.00, '2025-11-18 06:21:13', '2025-11-18 06:21:13'),
(11, 11, 7, 1, 100.00, 100.00, '2025-11-28 14:01:51', '2025-11-28 14:01:51'),
(12, 12, 7, 1, 1000.00, 1000.00, '2025-11-28 14:08:30', '2025-11-28 14:08:30'),
(13, 13, 7, 1, 300.00, 300.00, '2025-12-02 05:58:24', '2025-12-02 05:58:24'),
(14, 14, 7, 1, 0.00, 0.00, '2025-12-02 06:00:34', '2025-12-02 06:00:34'),
(15, 15, 7, 1, 0.00, 0.00, '2025-12-02 06:03:52', '2025-12-02 06:03:52'),
(16, 16, 7, 1, 100.00, 100.00, '2025-12-02 06:17:42', '2025-12-02 06:17:42'),
(17, 17, 7, 1, 1000.00, 1000.00, '2025-12-02 06:24:35', '2025-12-02 06:24:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `search_clicks`
--

CREATE TABLE `search_clicks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `q` varchar(255) NOT NULL,
  `terms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`terms`)),
  `source` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `search_clicks_events`
--

CREATE TABLE `search_clicks_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `q` varchar(255) NOT NULL,
  `terms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`terms`)),
  `source` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `search_queries`
--

CREATE TABLE `search_queries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `q` varchar(255) NOT NULL,
  `terms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`terms`)),
  `results_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `clicked_product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `search_queries`
--

INSERT INTO `search_queries` (`id`, `q`, `terms`, `results_count`, `clicked_product_id`, `created_at`, `updated_at`) VALUES
(1, 'consola bros', '[\"consola\",\"bros\"]', 2, NULL, '2025-11-04 18:01:05', '2025-11-04 18:01:05'),
(2, 'nes', '[\"nes\"]', 2, NULL, '2025-11-04 18:01:33', '2025-11-04 18:01:33'),
(3, 'asdasd', '[\"asdasd\"]', 0, NULL, '2025-11-16 05:42:16', '2025-11-16 05:42:16'),
(4, 'as', '[\"as\"]', 0, NULL, '2025-11-16 05:59:26', '2025-11-16 05:59:26'),
(5, 'sadasd', '[\"sadasd\"]', 0, NULL, '2025-12-02 06:56:19', '2025-12-02 06:56:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `search_queries_events`
--

CREATE TABLE `search_queries_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `q` varchar(255) NOT NULL,
  `terms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`terms`)),
  `results_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `clicked_event_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `search_queries_events`
--

INSERT INTO `search_queries_events` (`id`, `q`, `terms`, `results_count`, `clicked_event_id`, `created_at`, `updated_at`) VALUES
(1, 'zxc', '[\"zxc\"]', 0, NULL, '2025-11-16 05:59:32', '2025-11-16 05:59:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `search_terms`
--

CREATE TABLE `search_terms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `term` varchar(255) NOT NULL,
  `df` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `search_weight` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `last_searched_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `search_terms`
--

INSERT INTO `search_terms` (`id`, `term`, `df`, `search_weight`, `last_searched_at`, `created_at`, `updated_at`) VALUES
(1, 'consola', 3, 1, '2025-11-04 18:01:05', '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(2, 'nes', 4, 1, '2025-11-04 18:01:33', '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(3, 'original', 4, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(4, 'art', 9, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(5, 'iculo', 9, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(6, 'retro', 9, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(7, 'coleccionistas', 9, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(8, 'ajyryfsj', 2, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(9, 'super', 1, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(10, 'nintendo', 1, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(11, 'snes', 2, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(12, '7w4jzgiq', 1, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(13, 'cartucho', 1, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(14, 'mario', 1, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(15, 'bros', 1, 1, '2025-11-04 18:01:05', '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(16, 'wpwatufd', 1, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(17, 'control', 1, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(18, '2v3ek9fm', 1, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(19, 'figura', 3, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(20, 'link', 3, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(21, '8', 3, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(22, 'bit', 3, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(23, 'tbag4hgm', 3, 0, NULL, '2025-11-04 06:18:54', '2025-11-04 06:18:54'),
(24, 'ybqmryxr', 1, 0, NULL, '2025-11-28 13:49:59', '2025-11-28 13:49:59'),
(25, 'servicios', 1, 0, NULL, '2025-11-28 14:01:51', '2025-11-28 14:01:51'),
(26, 'serv', 1, 0, NULL, '2025-11-28 14:01:51', '2025-11-28 14:01:51'),
(27, '001', 1, 0, NULL, '2025-11-28 14:01:51', '2025-11-28 14:01:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `search_terms_events`
--

CREATE TABLE `search_terms_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `term` varchar(255) NOT NULL,
  `df` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `search_weight` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `last_searched_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `search_terms_events`
--

INSERT INTO `search_terms_events` (`id`, `term`, `df`, `search_weight`, `last_searched_at`, `created_at`, `updated_at`) VALUES
(1, 'torneo', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(2, 'super', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(3, 'mario', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(4, 'bros', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(5, 'nes', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(6, 'formato', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(7, '1v1', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(8, 'bracket', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(9, 'simple', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(10, 'premios', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(11, 'retro', 9, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(12, 'pixel', 9, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(13, 'store', 9, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(14, 'sala', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(15, '1', 5, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(16, 'meetup', 4, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(17, 'cultura', 4, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(18, 'trueque', 4, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(19, 'charla', 4, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(20, 'intercambio', 4, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(21, 'cartuchos', 4, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(22, 'showcase', 4, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(23, 'patio', 4, 0, NULL, '2025-11-04 06:18:55', '2025-11-04 06:18:55'),
(24, 'asdasd', 1, 0, NULL, '2025-11-16 15:35:55', '2025-11-16 15:35:55'),
(25, 'daasdasd', 1, 0, NULL, '2025-11-16 15:35:55', '2025-11-16 15:35:55'),
(26, 'dasdasd', 1, 0, NULL, '2025-11-16 15:35:55', '2025-11-16 15:35:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('LJgvsYJnEycUTt80EeAG6hQiP7BD8rGnzvNQZPU0', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTmNRbTh2bzhmZFdHT1BuaEFjZ1g3eFVuUmw5NUtOb3dTdkhlZXRqVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1762821539);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'customer',
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `temp_password_expires_at` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by_admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `must_change_password`, `temp_password_expires_at`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `created_by_admin_id`, `last_login_at`, `deleted_at`) VALUES
(1, 'Edson', 'admin@example.com', 'admin', 0, NULL, NULL, '$2y$12$WkZevWmprRtuvSflnIL/suSEV59W88sfPy2.4L46jyl90ept.zIje', NULL, '2025-11-04 06:18:55', '2025-12-05 02:46:54', NULL, '2025-12-05 02:46:54', NULL),
(2, 'marcelo1', 'cayoaliedson@gmail.com', 'admin', 0, NULL, NULL, '$2y$12$SIzeP9YM9x4nZYGDd7Hs0O8oXoZodSwDmgj9r4NN5Xnwf7m/ZkzHO', NULL, '2025-11-04 06:25:17', '2025-11-04 17:11:33', 1, '2025-11-04 17:11:33', NULL),
(4, 'Edson', 'cayoali22@gmail.com', 'customer', 0, NULL, NULL, '$2y$12$nBSLe5xofdnNnosbL/oLIeQwiaHh3hxq37Z9OeFLdKar7ZqFuGytC', NULL, '2025-11-04 13:09:56', '2025-11-04 16:55:26', NULL, '2025-11-04 16:55:13', NULL),
(5, 'user', 'user@gmail.com', 'customer', 0, NULL, NULL, '$2y$12$lTEx/fQeIiYaU6Uc0oI3YutMY5jsQ.FJ61floQAoBhcIRz5.wZwVa', NULL, '2025-11-04 14:50:09', '2025-11-28 14:06:53', NULL, '2025-11-28 14:06:53', NULL),
(6, 'Edson', 'edsonali03@gmail.com', 'customer', 0, NULL, NULL, '$2y$12$UJcBZ1Ja6zDkAr3nfW/yKe9D04QM9RiIVaXI38ooIzb7faj.5U9Oa', NULL, '2025-11-04 15:04:30', '2025-11-04 15:04:30', NULL, NULL, NULL),
(7, 'Tecnico', 'ecayo507@gmail.com', 'technician', 0, NULL, NULL, '$2y$12$VCMqWtZc8Grvo/OSHM9b/O8JtjFi/Oczzua.jIc3cUfpkeLcDRPF6', NULL, '2025-11-04 16:56:39', '2025-12-02 05:57:53', 2, '2025-12-02 05:57:53', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_descriptors`
--

CREATE TABLE `user_descriptors` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `score` double NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `user_descriptors`
--

INSERT INTO `user_descriptors` (`user_id`, `key`, `score`, `created_at`, `updated_at`) VALUES
(4, 'bros', 0.8, '2025-11-04 18:01:05', '2025-11-04 18:01:05'),
(4, 'consola', 0.8, '2025-11-04 18:01:05', '2025-11-04 18:01:05'),
(4, 'nes', 0.8, '2025-11-04 18:01:34', '2025-11-04 18:01:34'),
(5, 'ajyryfsj', 2, '2025-11-11 04:42:26', '2025-11-11 04:42:26'),
(5, 'art', 1, '2025-11-11 04:42:26', '2025-11-11 04:42:26'),
(5, 'coleccionistas', 1, '2025-11-11 04:42:26', '2025-11-11 04:42:26'),
(5, 'consola', 3, '2025-11-11 04:42:26', '2025-11-11 04:42:26'),
(5, 'iculo', 1, '2025-11-11 04:42:26', '2025-11-11 04:42:26'),
(5, 'nes', 3, '2025-11-11 04:42:26', '2025-11-11 04:42:26'),
(5, 'original', 3, '2025-11-11 04:42:26', '2025-11-11 04:42:26'),
(5, 'retro', 1, '2025-11-11 04:42:26', '2025-11-11 04:42:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_product_signals`
--

CREATE TABLE `user_product_signals` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `impressions` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `views` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `adds` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `purchases` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `last_interacted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `user_product_signals`
--

INSERT INTO `user_product_signals` (`user_id`, `product_id`, `impressions`, `views`, `adds`, `purchases`, `last_interacted_at`, `created_at`, `updated_at`) VALUES
(4, 3, 2, 0, 0, 0, '2025-11-04 18:01:05', '2025-11-04 18:01:05', '2025-11-04 18:01:34');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointments_customer_id_foreign` (`customer_id`),
  ADD KEY `appointments_technician_id_scheduled_at_index` (`technician_id`,`scheduled_at`),
  ADD KEY `appointments_status_preferred_at_index` (`status`,`preferred_at`),
  ADD KEY `appointments_sale_id_foreign` (`sale_id`),
  ADD KEY `appointments_completed_by_foreign` (`completed_by`);

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indices de la tabla `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `carts_user_id_unique` (`user_id`);

--
-- Indices de la tabla `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_items_cart_id_product_id_unique` (`cart_id`,`product_id`),
  ADD KEY `cart_items_product_id_foreign` (`product_id`);

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- Indices de la tabla `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `descriptors`
--
ALTER TABLE `descriptors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descriptors_key_unique` (`key`);

--
-- Indices de la tabla `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `events_slug_unique` (`slug`),
  ADD KEY `events_status_start_at_index` (`status`,`start_at`),
  ADD KEY `events_type_start_at_index` (`type`,`start_at`);
ALTER TABLE `events` ADD FULLTEXT KEY `ft_events_all` (`title`,`description`,`location`);

--
-- Indices de la tabla `event_descriptors`
--
ALTER TABLE `event_descriptors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_descriptors_key_unique` (`key`);

--
-- Indices de la tabla `event_descriptors_map`
--
ALTER TABLE `event_descriptors_map`
  ADD PRIMARY KEY (`event_id`,`descriptor_id`),
  ADD KEY `event_descriptors_map_descriptor_id_score_index` (`descriptor_id`,`score`);

--
-- Indices de la tabla `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_registrations_event_id_email_unique` (`event_id`,`email`),
  ADD UNIQUE KEY `event_registrations_event_id_user_id_unique` (`event_id`,`user_id`),
  ADD UNIQUE KEY `event_registrations_ticket_code_unique` (`ticket_code`),
  ADD KEY `event_registrations_user_id_foreign` (`user_id`),
  ADD KEY `event_registrations_created_by_admin_id_foreign` (`created_by_admin_id`),
  ADD KEY `event_registrations_checked_in_by_foreign` (`checked_in_by`),
  ADD KEY `event_registrations_event_id_status_index` (`event_id`,`status`),
  ADD KEY `event_registrations_email_index` (`email`),
  ADD KEY `event_registrations_gamer_tag_index` (`gamer_tag`);

--
-- Indices de la tabla `event_search_meta`
--
ALTER TABLE `event_search_meta`
  ADD PRIMARY KEY (`event_id`);

--
-- Indices de la tabla `event_terms`
--
ALTER TABLE `event_terms`
  ADD PRIMARY KEY (`event_id`,`term_id`),
  ADD KEY `event_terms_term_id_foreign` (`term_id`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_intent_id_unique` (`intent_id`),
  ADD UNIQUE KEY `payments_client_secret_unique` (`client_secret`),
  ADD KEY `payments_sale_id_foreign` (`sale_id`);

--
-- Indices de la tabla `payment_events`
--
ALTER TABLE `payment_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_events_payment_id_foreign` (`payment_id`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD KEY `products_category_id_foreign` (`category_id`);
ALTER TABLE `products` ADD FULLTEXT KEY `ft_products_name_desc` (`name`,`description`);
ALTER TABLE `products` ADD FULLTEXT KEY `ft_products_sku` (`sku`);

--
-- Indices de la tabla `product_descriptors`
--
ALTER TABLE `product_descriptors`
  ADD PRIMARY KEY (`product_id`,`descriptor_id`),
  ADD KEY `product_descriptors_descriptor_id_foreign` (`descriptor_id`);

--
-- Indices de la tabla `product_search_meta`
--
ALTER TABLE `product_search_meta`
  ADD PRIMARY KEY (`product_id`);

--
-- Indices de la tabla `product_terms`
--
ALTER TABLE `product_terms`
  ADD PRIMARY KEY (`product_id`,`term_id`),
  ADD KEY `product_terms_term_id_foreign` (`term_id`);

--
-- Indices de la tabla `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_customer_id_foreign` (`customer_id`),
  ADD KEY `sales_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `sales_delivered_by_foreign` (`delivered_by`),
  ADD KEY `sales_canceled_by_foreign` (`canceled_by`),
  ADD KEY `sales_delivery_status_index` (`delivery_status`),
  ADD KEY `sales_is_canceled_index` (`is_canceled`);

--
-- Indices de la tabla `sale_details`
--
ALTER TABLE `sale_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_details_sale_id_foreign` (`sale_id`),
  ADD KEY `sale_details_product_id_foreign` (`product_id`);

--
-- Indices de la tabla `search_clicks`
--
ALTER TABLE `search_clicks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `search_clicks_product_id_index` (`product_id`),
  ADD KEY `search_clicks_created_at_index` (`created_at`);

--
-- Indices de la tabla `search_clicks_events`
--
ALTER TABLE `search_clicks_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `search_clicks_events_event_id_index` (`event_id`),
  ADD KEY `search_clicks_events_created_at_index` (`created_at`);

--
-- Indices de la tabla `search_queries`
--
ALTER TABLE `search_queries`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `search_queries_events`
--
ALTER TABLE `search_queries_events`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `search_terms`
--
ALTER TABLE `search_terms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `search_terms_term_unique` (`term`);

--
-- Indices de la tabla `search_terms_events`
--
ALTER TABLE `search_terms_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `search_terms_events_term_unique` (`term`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_created_by_admin_id_foreign` (`created_by_admin_id`);

--
-- Indices de la tabla `user_descriptors`
--
ALTER TABLE `user_descriptors`
  ADD PRIMARY KEY (`user_id`,`key`),
  ADD KEY `user_descriptors_user_id_score_index` (`user_id`,`score`);

--
-- Indices de la tabla `user_product_signals`
--
ALTER TABLE `user_product_signals`
  ADD PRIMARY KEY (`user_id`,`product_id`),
  ADD KEY `user_product_signals_product_id_foreign` (`product_id`),
  ADD KEY `user_product_signals_last_interacted_at_index` (`last_interacted_at`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=253;

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `descriptors`
--
ALTER TABLE `descriptors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `event_descriptors`
--
ALTER TABLE `event_descriptors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `event_registrations`
--
ALTER TABLE `event_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `payment_events`
--
ALTER TABLE `payment_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `sale_details`
--
ALTER TABLE `sale_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `search_clicks`
--
ALTER TABLE `search_clicks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `search_clicks_events`
--
ALTER TABLE `search_clicks_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `search_queries`
--
ALTER TABLE `search_queries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `search_queries_events`
--
ALTER TABLE `search_queries_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `search_terms`
--
ALTER TABLE `search_terms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `search_terms_events`
--
ALTER TABLE `search_terms_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_completed_by_foreign` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_technician_id_foreign` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `event_descriptors_map`
--
ALTER TABLE `event_descriptors_map`
  ADD CONSTRAINT `event_descriptors_map_descriptor_id_foreign` FOREIGN KEY (`descriptor_id`) REFERENCES `event_descriptors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_descriptors_map_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_checked_in_by_foreign` FOREIGN KEY (`checked_in_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `event_registrations_created_by_admin_id_foreign` FOREIGN KEY (`created_by_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `event_registrations_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_registrations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `event_search_meta`
--
ALTER TABLE `event_search_meta`
  ADD CONSTRAINT `event_search_meta_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `event_terms`
--
ALTER TABLE `event_terms`
  ADD CONSTRAINT `event_terms_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_terms_term_id_foreign` FOREIGN KEY (`term_id`) REFERENCES `search_terms_events` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `payment_events`
--
ALTER TABLE `payment_events`
  ADD CONSTRAINT `payment_events_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `product_descriptors`
--
ALTER TABLE `product_descriptors`
  ADD CONSTRAINT `product_descriptors_descriptor_id_foreign` FOREIGN KEY (`descriptor_id`) REFERENCES `descriptors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_descriptors_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `product_search_meta`
--
ALTER TABLE `product_search_meta`
  ADD CONSTRAINT `product_search_meta_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `product_terms`
--
ALTER TABLE `product_terms`
  ADD CONSTRAINT `product_terms_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_terms_term_id_foreign` FOREIGN KEY (`term_id`) REFERENCES `search_terms` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_canceled_by_foreign` FOREIGN KEY (`canceled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sales_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sales_delivered_by_foreign` FOREIGN KEY (`delivered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sales_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `sale_details`
--
ALTER TABLE `sale_details`
  ADD CONSTRAINT `sale_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_details_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `search_clicks`
--
ALTER TABLE `search_clicks`
  ADD CONSTRAINT `search_clicks_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `search_clicks_events`
--
ALTER TABLE `search_clicks_events`
  ADD CONSTRAINT `search_clicks_events_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_created_by_admin_id_foreign` FOREIGN KEY (`created_by_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `user_descriptors`
--
ALTER TABLE `user_descriptors`
  ADD CONSTRAINT `user_descriptors_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_product_signals`
--
ALTER TABLE `user_product_signals`
  ADD CONSTRAINT `user_product_signals_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_product_signals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
