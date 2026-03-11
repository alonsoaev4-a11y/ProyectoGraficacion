-- ═══════════════════════════════════════════════════════════════
-- Soft-Evolved — Database Init Script
-- MySQL 8.x · charset utf8mb4
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS soft_evolved
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE soft_evolved;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(150) NOT NULL,
  avatar_url    VARCHAR(500) DEFAULT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 2. projects
CREATE TABLE IF NOT EXISTS projects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id    INT NOT NULL,
  status      ENUM('active','archived','deleted') DEFAULT 'active',
  settings    JSON DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_projects_owner (owner_id)
) ENGINE=InnoDB;

-- 3. project_members
CREATE TABLE IF NOT EXISTS project_members (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id    INT NOT NULL,
  role       ENUM('owner','admin','editor','viewer') DEFAULT 'editor',
  joined_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  UNIQUE KEY uq_project_user (project_id, user_id)
) ENGINE=InnoDB;

-- 4. project_metadatos
CREATE TABLE IF NOT EXISTS project_metadatos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL UNIQUE,
  data       JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. requirements
CREATE TABLE IF NOT EXISTS requirements (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  project_id          INT NOT NULL,
  title               VARCHAR(500) NOT NULL,
  description         TEXT,
  type                ENUM('funcional','no-funcional','tecnico','negocio') DEFAULT 'funcional',
  priority            ENUM('alta','media','baja') DEFAULT 'media',
  status              ENUM('borrador','en-revision','aprobado','rechazado','implementado') DEFAULT 'borrador',
  acceptance_criteria JSON DEFAULT NULL,
  dependencies        JSON DEFAULT NULL,
  comments            JSON DEFAULT NULL,
  order_index         INT DEFAULT 0,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_req_project (project_id)
) ENGINE=InnoDB;

-- 6. catalogs
CREATE TABLE IF NOT EXISTS catalogs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  project_id  INT NOT NULL,
  type        ENUM('role','actor','businessRule','precondition','postcondition','exception') NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_cat_project_type (project_id, type)
) ENGINE=InnoDB;

-- 7. use_cases
CREATE TABLE IF NOT EXISTS use_cases (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  project_id     INT NOT NULL,
  title          VARCHAR(500) NOT NULL,
  description    TEXT,
  actor          VARCHAR(255),
  preconditions  JSON DEFAULT NULL,
  postconditions JSON DEFAULT NULL,
  triggers       JSON DEFAULT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_uc_project (project_id)
) ENGINE=InnoDB;

-- 8. use_case_steps
CREATE TABLE IF NOT EXISTS use_case_steps (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  use_case_id INT NOT NULL,
  order_index INT DEFAULT 0,
  action      TEXT NOT NULL,
  type        VARCHAR(50) DEFAULT 'USER_ACTION',
  semantics   JSON DEFAULT NULL,
  FOREIGN KEY (use_case_id) REFERENCES use_cases(id) ON DELETE CASCADE,
  INDEX idx_steps_uc (use_case_id)
) ENGINE=InnoDB;

-- 9. use_case_alt_flows
CREATE TABLE IF NOT EXISTS use_case_alt_flows (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  use_case_id INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  `condition` TEXT,
  steps       JSON DEFAULT NULL,
  FOREIGN KEY (use_case_id) REFERENCES use_cases(id) ON DELETE CASCADE,
  INDEX idx_altflows_uc (use_case_id)
) ENGINE=InnoDB;

-- 10. data_tables
CREATE TABLE IF NOT EXISTS data_tables (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  name       VARCHAR(255) NOT NULL,
  position_x FLOAT DEFAULT 100,
  position_y FLOAT DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_dt_project (project_id)
) ENGINE=InnoDB;

-- 11. data_columns
CREATE TABLE IF NOT EXISTS data_columns (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  table_id      INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  type          VARCHAR(100) NOT NULL DEFAULT 'VARCHAR(255)',
  is_pk         TINYINT(1) DEFAULT 0,
  is_fk         TINYINT(1) DEFAULT 0,
  is_nullable   TINYINT(1) DEFAULT 1,
  default_value VARCHAR(255) DEFAULT NULL,
  ref_table_id  INT DEFAULT NULL,
  ref_column_id INT DEFAULT NULL,
  order_index   INT DEFAULT 0,
  FOREIGN KEY (table_id)     REFERENCES data_tables(id) ON DELETE CASCADE,
  FOREIGN KEY (ref_table_id) REFERENCES data_tables(id) ON DELETE SET NULL,
  INDEX idx_dc_table (table_id)
) ENGINE=InnoDB;

-- 12. data_relationships
CREATE TABLE IF NOT EXISTS data_relationships (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  project_id    INT NOT NULL,
  from_table_id INT NOT NULL,
  to_table_id   INT NOT NULL,
  type          ENUM('1:1','1:N','N:M') DEFAULT '1:N',
  FOREIGN KEY (project_id)    REFERENCES projects(id)    ON DELETE CASCADE,
  FOREIGN KEY (from_table_id) REFERENCES data_tables(id) ON DELETE CASCADE,
  FOREIGN KEY (to_table_id)   REFERENCES data_tables(id) ON DELETE CASCADE,
  INDEX idx_dr_project (project_id)
) ENGINE=InnoDB;

-- 13. diagrams
CREATE TABLE IF NOT EXISTS diagrams (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  type       VARCHAR(50) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  data       JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_diag_project (project_id)
) ENGINE=InnoDB;

-- 14. generated_docs
CREATE TABLE IF NOT EXISTS generated_docs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  project_id   INT NOT NULL,
  filename     VARCHAR(255) NOT NULL,
  title        VARCHAR(255) NOT NULL,
  layer        ENUM('bd','backend','frontend','contexto') NOT NULL,
  content      LONGTEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_gd_project (project_id)
) ENGINE=InnoDB;

-- 15. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  project_id  INT NOT NULL,
  user_id     INT DEFAULT NULL,
  action      VARCHAR(255) NOT NULL,
  description TEXT,
  entity      VARCHAR(100),
  type        ENUM('system','user','database','business') DEFAULT 'system',
  status      ENUM('success','warning','error','info') DEFAULT 'success',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_al_project (project_id),
  INDEX idx_al_created (created_at)
) ENGINE=InnoDB;

-- 16. ai_sessions
CREATE TABLE IF NOT EXISTS ai_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  project_id    INT NOT NULL,
  user_id       INT NOT NULL,
  status        ENUM('pending','running','paused','completed','error') DEFAULT 'pending',
  current_phase INT DEFAULT 1,
  context       JSON DEFAULT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_ais_project (project_id)
) ENGINE=InnoDB;

-- 17. ai_messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  phase      INT NOT NULL,
  role       ENUM('system','ai','user') NOT NULL,
  content    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES ai_sessions(id) ON DELETE CASCADE,
  INDEX idx_aim_session (session_id)
) ENGINE=InnoDB;
