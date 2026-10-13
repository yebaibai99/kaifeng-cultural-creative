CREATE TABLE IF NOT EXISTS refund_status_enum (
    val VARCHAR(16) PRIMARY KEY
    );

INSERT IGNORE INTO refund_status_enum VALUES ('NONE'), ('PENDING'), ('APPROVED'), ('REJECTED');

ALTER TABLE orders
    ADD COLUMN refund_status VARCHAR(16) NOT NULL DEFAULT 'NONE',
    ADD COLUMN refund_reason TEXT,
    ADD COLUMN refund_amount_cents INT,
    ADD COLUMN refund_applied_at TIMESTAMP NULL,
    ADD COLUMN refund_processed_at TIMESTAMP NULL,
    ADD COLUMN refund_remark TEXT;