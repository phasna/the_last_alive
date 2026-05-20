export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(32) PRIMARY KEY,
    label VARCHAR(128) NOT NULL,
    icon VARCHAR(16) NOT NULL DEFAULT '',
    description VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_virtual TINYINT(1) NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(16) PRIMARY KEY,
    question TEXT NOT NULL,
    options JSON NOT NULL,
    correct_index INT NOT NULL,
    category_id VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE INDEX idx_quiz_questions_category ON quiz_questions(category_id)`,

  `CREATE TABLE IF NOT EXISTS memory_sequences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbols JSON NOT NULL,
    correct_order JSON NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS fake_answer_prompts (
    id VARCHAR(16) PRIMARY KEY,
    question TEXT NOT NULL,
    correct_answer VARCHAR(128) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];
