CREATE DATABASE CABLELATIN

-- ============================================
-- CREACIÓN DE TABLAS EN SQL SERVER
-- ============================================

CREATE TABLE roles (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    permisos VARCHAR(MAX)
);

CREATE TABLE usuarios (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol_id BIGINT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE clientes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    plan VARCHAR(100),
    tipo_cliente VARCHAR(100)  -- 👈 Nueva columna agregada
);

CREATE TABLE facturas (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ultimo_pago DATE,
    ultimo_vencimiento DATE,
    fecha_suspendido DATE,
    dia_pago INT,
    estado VARCHAR(50),
    deuda DECIMAL(10,2),
    plan VARCHAR(100),
    cliente_id BIGINT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
