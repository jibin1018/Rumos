-- Create user roles enum
CREATE TYPE user_role AS ENUM ('user', 'agent', 'admin');

-- Create verification status enum
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create property type enum
CREATE TYPE property_type AS ENUM ('apartment', 'officetel', 'house', 'studio');

-- Create heating type enum
CREATE TYPE heating_type AS ENUM ('central', 'individual', 'district');

-- Create Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Agents table (extends Users)
CREATE TABLE agents (
    agent_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    license_image VARCHAR(255) NOT NULL, -- Path to the uploaded license image
    verification_status verification_status NOT NULL DEFAULT 'pending',
    company_name VARCHAR(100),
    office_address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Properties table
CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    deposit INTEGER NOT NULL, -- 보증금
    monthly_rent INTEGER NOT NULL, -- 월세
    maintenance_fee INTEGER DEFAULT 0, -- 관리비
    construction_date DATE, -- 건축일자
    available_from DATE, -- 입주 가능 날짜
    room_size FLOAT, -- 방 크기 (평방미터)
    room_count INTEGER DEFAULT 1, -- 방 개수
    bathroom_count INTEGER DEFAULT 1, -- 화장실 개수
    floor INTEGER, -- 층수
    total_floors INTEGER, -- 총 건물 층수
    heating_type heating_type, -- 난방 방식
    property_type property_type, -- 집 유형
    min_stay_months INTEGER DEFAULT 6, -- 최소 거주 기간 (월)
    has_bed BOOLEAN DEFAULT FALSE,
    has_washing_machine BOOLEAN DEFAULT FALSE,
    has_refrigerator BOOLEAN DEFAULT FALSE,
    has_microwave BOOLEAN DEFAULT FALSE,
    has_desk BOOLEAN DEFAULT FALSE,
    has_closet BOOLEAN DEFAULT FALSE,
    has_air_conditioner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    city VARCHAR(50) NOT NULL, -- 도시명
    district VARCHAR(50), -- 구/군 
    is_active BOOLEAN DEFAULT TRUE -- 활성 상태 여부
);

-- Create Property Images table
CREATE TABLE property_images (
    image_id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL, -- Path to the uploaded image
    is_thumbnail BOOLEAN DEFAULT FALSE, -- Whether this image is the main thumbnail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Favorites table
CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id) -- Prevent duplicates
);

-- Create Contact Requests table
CREATE TABLE contact_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Board Categories table
CREATE TABLE board_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Board Posts table
CREATE TABLE board_posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES board_categories(category_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Board Comments table
CREATE TABLE board_comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES board_posts(post_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (username, password, email, phone_number, role) 
VALUES ('admin', '$2b$10$rNCLTPUcysmyG.0USXJMXeO1ZKON0zmRSGdJUNwqFayBc9xAwJ46y', 'admin@rumos.com', '010-0000-0000', 'admin');
-- Note: Password is hashed version of 'admin123' - you should change this in production

-- Insert default board categories
INSERT INTO board_categories (name, description) 
VALUES 
('General', 'General discussions about housing in Korea'),
('Questions', 'Questions about using the platform or finding housing'),
('Reviews', 'Reviews of properties or neighborhoods'),
('Tips', 'Tips for living in Korea as a foreigner');

-- Create indexes for frequent queries
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_deposit ON properties(deposit);
CREATE INDEX idx_properties_monthly_rent ON properties(monthly_rent);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
