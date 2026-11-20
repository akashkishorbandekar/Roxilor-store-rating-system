CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role ENUM('admin', 'user', 'store_owner')
        NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CHECK (rating BETWEEN 1 AND 5),

    UNIQUE (user_id, store_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (store_id)
        REFERENCES stores(id)
);

SHOW TABLES;

SELECT 1;

USE store_rating_db;
SELECT DATABASE();

SHOW VARIABLES
WHERE Variable_name IN (
    'port',
    'bind_address',
    'skip_networking'
);

SELECT CURRENT_USER();


CREATE USER IF NOT EXISTS 'store_app'@'localhost'
IDENTIFIED BY 'StoreApp2026Secure';

ALTER USER 'store_app'@'localhost'
IDENTIFIED BY 'StoreApp2026Secure';

GRANT ALL PRIVILEGES ON store_rating_db.*
TO 'store_app'@'localhost';

FLUSH PRIVILEGES;

SELECT User, Host, plugin
FROM mysql.user
WHERE User = 'store_app';


GRANT ALL PRIVILEGES ON store_rating_db.*
TO 'store_app'@'localhost';

FLUSH PRIVILEGES;

ALTER USER 'store_app'@'localhost'
IDENTIFIED BY 'StoreApp2026Secure';

GRANT ALL PRIVILEGES ON store_rating_db.*
TO 'store_app'@'localhost';



SELECT CURRENT_USER(), @@port;

ALTER USER 'store_app'@'localhost'
IDENTIFIED BY 'StoreApp2026Secure';

GRANT ALL PRIVILEGES
ON store_rating_db.*
TO 'store_app'@'localhost';

FLUSH PRIVILEGES;

ALTER USER 'store_app'@'localhost'
IDENTIFIED WITH caching_sha2_password
BY 'StoreApp2026Secure';


GRANT ALL PRIVILEGES
ON store_rating_db.*
TO 'store_app'@'localhost';

FLUSH PRIVILEGES;

ALTER USER 'store_app'@'localhost'
IDENTIFIED BY 'StoreApp2026Secure';

ALTER USER 'store_app'@'localhost'
IDENTIFIED BY 'StoreApp2026Secure';