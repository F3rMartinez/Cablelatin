-- ============================================
-- CREACIÓN DE TABLAS EN MySQL (NOSIRVE)
-- ============================================

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    permisos TEXT
);

CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol_id BIGINT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE clientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    direccion VARCHAR(255),
    telefono VARCHAR(50) UNIQUE, 
    email VARCHAR(255) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    plan VARCHAR(100),
    tipo_cliente VARCHAR(100)
);

CREATE TABLE facturas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
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