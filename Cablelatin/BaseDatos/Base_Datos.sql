
-- ============================================================
-- TABLA: roles
-- Define los tipos de usuarios del sistema
-- ============================================================
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL,
    descripcion TEXT
);

INSERT INTO roles (nombre_rol, descripcion) VALUES
('Administrador', 'Control total del sistema'),
('Supervisor', 'Control intermedio y revisión de reportes'),
('Vendedor', 'Encargado del registro de clientes y ventas');

-- ============================================================
-- TABLA: usuarios
-- Usuarios internos del sistema (empleados)
-- ============================================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(120) UNIQUE NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- ============================================================
-- TABLA: clientes
-- Registro de clientes que contratan servicios
-- ============================================================
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    correo VARCHAR(120),
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: planes
-- Catálogo de planes de internet o TV
-- ============================================================
CREATE TABLE planes (
    id_plan INT AUTO_INCREMENT PRIMARY KEY,
    nombre_plan VARCHAR(100) NOT NULL,
    descripcion TEXT,
    velocidad VARCHAR(50),
    precio DECIMAL(10,2) NOT NULL,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

-- ============================================================
-- TABLA: servicios_clientes
-- Relación entre clientes y planes contratados
-- ============================================================
CREATE TABLE servicios_clientes (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_plan INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE,
    estado ENUM('Activo', 'Suspendido', 'Finalizado') DEFAULT 'Activo',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_plan) REFERENCES planes(id_plan)
);

-- ============================================================
-- TABLA: facturas
-- Facturación generada para cada servicio
-- ============================================================
CREATE TABLE facturas (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    fecha_emision DATE NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    estado ENUM('Pendiente', 'Pagada', 'Anulada') DEFAULT 'Pendiente',
    FOREIGN KEY (id_servicio) REFERENCES servicios_clientes(id_servicio)
);

-- ============================================================
-- TABLA: pagos
-- Pagos asociados a las facturas
-- ============================================================
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT NOT NULL,
    fecha_pago DATE NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('Efectivo', 'Transferencia', 'Tarjeta') NOT NULL,
    observacion TEXT,
    FOREIGN KEY (id_factura) REFERENCES facturas(id_factura)
);
