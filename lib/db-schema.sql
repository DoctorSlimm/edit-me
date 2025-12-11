-- Color Variants Design System Schema
-- This schema supports storing and managing color variants for the design system

-- Create color_palettes table to store color palette definitions
CREATE TABLE IF NOT EXISTS color_palettes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create color_variants table to store individual color variants
CREATE TABLE IF NOT EXISTS color_variants (
  id SERIAL PRIMARY KEY,
  palette_id INTEGER NOT NULL REFERENCES color_palettes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  tonal_level VARCHAR(50) NOT NULL, -- 'light', 'standard', 'dark'
  hex_value VARCHAR(7) NOT NULL,
  description TEXT,
  usage_context VARCHAR(255), -- 'error', 'warning', 'destructive', etc.
  contrast_ratio DECIMAL(3,2), -- WCAG contrast ratio for accessibility
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(palette_id, name, tonal_level)
);

-- Create user_color_preferences table to store user-specific color preferences
CREATE TABLE IF NOT EXISTS user_color_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  preferred_palette_id INTEGER REFERENCES color_palettes(id),
  theme_settings JSONB DEFAULT '{}'::jsonb,
  background_inverted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_log table to track color configuration changes
CREATE TABLE IF NOT EXISTS color_audit_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  entity_type VARCHAR(50) NOT NULL, -- 'color_palette', 'color_variant'
  entity_id INTEGER,
  user_id VARCHAR(255),
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_color_variants_palette_id ON color_variants(palette_id);
CREATE INDEX idx_color_variants_name ON color_variants(name);
CREATE INDEX idx_user_preferences_user_id ON user_color_preferences(user_id);
CREATE INDEX idx_audit_log_created_at ON color_audit_log(created_at);
CREATE INDEX idx_audit_log_entity ON color_audit_log(entity_type, entity_id);

-- Insert default red color palette
INSERT INTO color_palettes (name, description) VALUES
('red-variants', 'Red color variants for error states, warnings, and destructive actions')
ON CONFLICT (name) DO NOTHING;

-- Insert red color variants (light, standard, dark)
INSERT INTO color_variants (palette_id, name, tonal_level, hex_value, description, usage_context, contrast_ratio)
SELECT
  p.id,
  'red',
  tonal_level,
  hex_value,
  description,
  usage_context,
  contrast_ratio
FROM (
  VALUES
    ('light', '#FECACA', 'Light red for subtle backgrounds or hover states', 'error-background', 4.5),
    ('standard', '#EF4444', 'Standard red for primary error messages and warnings', 'error-state', 7.0),
    ('dark', '#7F1D1D', 'Dark red for destructive actions and critical alerts', 'destructive', 11.0)
) AS colors(tonal_level, hex_value, description, usage_context, contrast_ratio)
CROSS JOIN color_palettes p
WHERE p.name = 'red-variants'
ON CONFLICT (palette_id, name, tonal_level) DO NOTHING;

-- Insert green color palette (for reference/existing colors)
INSERT INTO color_palettes (name, description) VALUES
('green-variants', 'Green color variants for success states and primary branding')
ON CONFLICT (name) DO NOTHING;

INSERT INTO color_variants (palette_id, name, tonal_level, hex_value, description, usage_context, contrast_ratio)
SELECT
  p.id,
  'green',
  tonal_level,
  hex_value,
  description,
  usage_context,
  contrast_ratio
FROM (
  VALUES
    ('light', '#DCFCE7', 'Light green for success backgrounds', 'success-background', 4.0),
    ('standard', '#22C55E', 'Standard green for primary branding and success states', 'success-state', 8.0),
    ('dark', '#15803D', 'Dark green for emphasis and dark mode accents', 'success-emphasis', 10.0)
) AS colors(tonal_level, hex_value, description, usage_context, contrast_ratio)
CROSS JOIN color_palettes p
WHERE p.name = 'green-variants'
ON CONFLICT (palette_id, name, tonal_level) DO NOTHING;

-- ============================================================================
-- REAL-TIME COLLABORATION TABLES
-- ============================================================================

-- Collaborative Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  version INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
  visibility VARCHAR(50) DEFAULT 'private', -- private, shared, public
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Document Sharing & Permissions
CREATE TABLE IF NOT EXISTS document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  permission_level VARCHAR(50) NOT NULL, -- viewer, editor, admin
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, user_id)
);

-- Operational Transform Operations Log
CREATE TABLE IF NOT EXISTS document_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  operation_type VARCHAR(50) NOT NULL, -- insert, delete, replace
  position INTEGER NOT NULL,
  content VARCHAR(10000),
  client_version INTEGER NOT NULL,
  server_version INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Presence & Cursor Tracking
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  cursor_position INTEGER DEFAULT 0,
  selection_start INTEGER DEFAULT NULL,
  selection_end INTEGER DEFAULT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  connection_id VARCHAR(255) UNIQUE NOT NULL
);

-- Document Change History
CREATE TABLE IF NOT EXISTS document_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL,
  snapshot TEXT NOT NULL,
  operation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_document_id ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_operations_document_id ON document_operations(document_id);
CREATE INDEX IF NOT EXISTS idx_operations_version ON document_operations(server_version);
CREATE INDEX IF NOT EXISTS idx_sessions_document_id ON active_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_history_document_id ON document_history(document_id);
