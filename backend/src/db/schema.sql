CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','analyst','viewer') NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  url VARCHAR(255) NOT NULL,
  owner VARCHAR(120) NULL,
  environment ENUM('prod','dev','staging') NOT NULL DEFAULT 'prod',
  criticality ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  status ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS findings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  site_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  severity ENUM('critical','high','medium','low') NOT NULL DEFAULT 'low',
  status ENUM('open','in_progress','fixed','accepted','false_positive') NOT NULL DEFAULT 'open',
  owasp VARCHAR(10) NULL,
  cwe VARCHAR(20) NULL,
  cvss_score DECIMAL(3,1) NULL,
  description TEXT NULL,
  evidence TEXT NULL,
  recommendation TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_findings_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);