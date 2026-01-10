-- ORBITNET-MESH Testing Database Schema
-- Comprehensive tracking of data transmission, link performance, and system metrics

-- Test Sessions Table
CREATE TABLE IF NOT EXISTS test_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    test_name TEXT NOT NULL,
    test_type TEXT NOT NULL, -- 'manual', 'automated', 'replay', 'stress_test'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    orbitnet_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    test_description TEXT,
    test_parameters JSON, -- Store test configuration as JSON
    status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'aborted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Transmission Metrics Table
CREATE TABLE IF NOT EXISTS transmission_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    mission_time REAL NOT NULL,
    
    -- Packet Counts
    packets_generated INTEGER NOT NULL DEFAULT 0,
    packets_transmitted INTEGER NOT NULL DEFAULT 0,
    packets_stored INTEGER NOT NULL DEFAULT 0,
    packets_forwarded INTEGER NOT NULL DEFAULT 0,
    packets_lost INTEGER NOT NULL DEFAULT 0,
    
    -- Performance Metrics
    data_loss_percentage REAL NOT NULL DEFAULT 0.0,
    transmission_rate_pps REAL DEFAULT 0.0, -- packets per second
    buffer_utilization_percent REAL DEFAULT 0.0,
    average_latency_ms REAL DEFAULT 0.0,
    
    -- Link Status
    link_available BOOLEAN NOT NULL DEFAULT FALSE,
    link_type TEXT, -- 'ground', 'satellite', 'none'
    link_name TEXT,
    signal_strength REAL DEFAULT 0.0,
    link_latency_ms REAL DEFAULT 0.0,
    
    -- Satellite Position
    satellite_lat REAL,
    satellite_lng REAL,
    satellite_altitude REAL,
    satellite_velocity REAL,
    
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Link Events Table (Track link establishment/loss events)
CREATE TABLE IF NOT EXISTS link_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    mission_time REAL NOT NULL,
    event_type TEXT NOT NULL, -- 'link_established', 'link_lost', 'link_changed'
    
    -- Link Details
    link_type TEXT NOT NULL,
    link_name TEXT NOT NULL,
    signal_strength REAL,
    latency_ms REAL,
    elevation_angle REAL,
    distance_km REAL,
    link_margin_db REAL,
    frequency_band TEXT,
    data_rate_mbps REAL,
    
    -- Position at event
    satellite_lat REAL,
    satellite_lng REAL,
    satellite_altitude REAL,
    
    -- Additional metadata
    weather_quality TEXT,
    weather_attenuation_db REAL DEFAULT 0.0,
    data_source TEXT, -- 'physics', 'simulation'
    
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Packet Transmission Log (Detailed packet-level tracking)
CREATE TABLE IF NOT EXISTS packet_transmissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    packet_id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    mission_time REAL NOT NULL,
    
    -- Packet Details
    packet_type TEXT DEFAULT 'telemetry', -- 'telemetry', 'command', 'data'
    packet_size_bytes INTEGER,
    generation_time TIMESTAMP,
    transmission_time TIMESTAMP,
    reception_time TIMESTAMP,
    
    -- Transmission Path
    transmission_method TEXT, -- 'direct', 'store_forward', 'relay'
    link_type TEXT,
    link_name TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Performance
    end_to_end_latency_ms REAL,
    transmission_success BOOLEAN DEFAULT TRUE,
    error_reason TEXT,
    
    -- Telemetry Data (if applicable)
    telemetry_data JSON,
    
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- System Performance Metrics
CREATE TABLE IF NOT EXISTS system_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    mission_time REAL NOT NULL,
    
    -- CPU and Memory
    cpu_usage_percent REAL,
    memory_usage_mb REAL,
    
    -- Queue Performance
    queue_size INTEGER,
    queue_processing_rate_pps REAL,
    queue_max_size INTEGER,
    
    -- Network Performance
    api_response_time_ms REAL,
    database_query_time_ms REAL,
    
    -- Error Counts
    api_errors INTEGER DEFAULT 0,
    database_errors INTEGER DEFAULT 0,
    link_calculation_errors INTEGER DEFAULT 0,
    
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Test Results Summary
CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    
    -- Overall Metrics
    total_duration_seconds INTEGER,
    total_packets_generated INTEGER,
    total_packets_transmitted INTEGER,
    total_packets_stored INTEGER,
    overall_data_loss_percentage REAL,
    
    -- Link Performance
    total_link_events INTEGER,
    total_link_time_seconds INTEGER,
    average_signal_strength REAL,
    average_link_latency_ms REAL,
    link_availability_percentage REAL,
    
    -- Transmission Performance
    peak_transmission_rate_pps REAL,
    average_transmission_rate_pps REAL,
    total_transmission_time_seconds INTEGER,
    
    -- Store-and-Forward Performance
    max_buffer_size INTEGER,
    average_buffer_utilization REAL,
    buffer_overflow_events INTEGER,
    
    -- Quality Metrics
    end_to_end_success_rate REAL,
    average_end_to_end_latency_ms REAL,
    
    -- Test Outcome
    test_passed BOOLEAN,
    test_score REAL, -- Overall performance score 0-100
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Ground Station Coverage Analysis
CREATE TABLE IF NOT EXISTS coverage_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    ground_station_id TEXT NOT NULL,
    ground_station_name TEXT NOT NULL,
    
    -- Coverage Statistics
    total_passes INTEGER DEFAULT 0,
    total_coverage_time_seconds INTEGER DEFAULT 0,
    average_pass_duration_seconds REAL DEFAULT 0.0,
    max_elevation_angle REAL DEFAULT 0.0,
    min_distance_km REAL,
    
    -- Transmission Statistics
    packets_transmitted INTEGER DEFAULT 0,
    transmission_success_rate REAL DEFAULT 0.0,
    average_signal_strength REAL DEFAULT 0.0,
    
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transmission_metrics_session_time ON transmission_metrics(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_link_events_session_time ON link_events(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_packet_transmissions_session_time ON packet_transmissions(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_system_performance_session_time ON system_performance(session_id, timestamp);

-- Create views for common queries
CREATE VIEW IF NOT EXISTS session_summary AS
SELECT 
    ts.session_id,
    ts.test_name,
    ts.test_type,
    ts.start_time,
    ts.end_time,
    ts.duration_seconds,
    ts.orbitnet_enabled,
    tr.total_packets_generated,
    tr.total_packets_transmitted,
    tr.overall_data_loss_percentage,
    tr.link_availability_percentage,
    tr.test_passed,
    tr.test_score
FROM test_sessions ts
LEFT JOIN test_results tr ON ts.session_id = tr.session_id;

CREATE VIEW IF NOT EXISTS latest_metrics AS
SELECT 
    session_id,
    timestamp,
    packets_generated,
    packets_transmitted,
    packets_stored,
    data_loss_percentage,
    link_available,
    link_type,
    signal_strength,
    satellite_lat,
    satellite_lng
FROM transmission_metrics
WHERE timestamp = (
    SELECT MAX(timestamp) 
    FROM transmission_metrics tm2 
    WHERE tm2.session_id = transmission_metrics.session_id
);