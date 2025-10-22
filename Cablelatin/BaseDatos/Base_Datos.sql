CREATE DATABASE CABLELATIN

-- Crear tabla de Roles
CREATE TABLE Roles (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(255) UNIQUE NOT NULL,
    Permisos NVARCHAR(255) 
);

-- Crear tabla de Usuarios
CREATE TABLE Usuarios (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Usuario NVARCHAR(255) UNIQUE NOT NULL,
    Contrasena NVARCHAR(255) NOT NULL,
    Rol_Id BIGINT FOREIGN KEY REFERENCES Roles(Id),
    DNI NVARCHAR(20) UNIQUE,
    Telefono NVARCHAR(20),
    Suscripcion NVARCHAR(100),
    Estado NVARCHAR(20) CHECK (Estado IN ('activo', 'inactivo')),
    Deuda DECIMAL(10,2) DEFAULT 0,
    Vencimiento DATE,
    Tipo NVARCHAR(50),
    Fecha_Registro DATETIME DEFAULT GETDATE()
);

-- Crear tabla de Clientes
CREATE TABLE Clientes (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(255) NOT NULL,
    Direccion NVARCHAR(255),
    Telefono NVARCHAR(20),
    Email NVARCHAR(255) UNIQUE
);

-- Crear tabla de Facturas
CREATE TABLE Facturas (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Cliente_Id BIGINT FOREIGN KEY REFERENCES Clientes(Id),
    Fecha DATETIME DEFAULT GETDATE(),
    Monto DECIMAL(10,2) NOT NULL,
    Estado_Pago NVARCHAR(20) CHECK (Estado_Pago IN ('pendiente', 'pagado')) NOT NULL
);
