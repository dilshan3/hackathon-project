-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(100),
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('NEW', 'GOOD', 'FAIR', 'POOR')),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LENT', 'NOT_AVAILABLE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Book requests table
CREATE TABLE IF NOT EXISTS book_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DECLINED', 'COMPLETED')),
    note TEXT,
    start_date DATE,
    duration_days INTEGER CHECK (duration_days > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES book_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table for MVP 1.1
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    notification_frequency VARCHAR(20) DEFAULT 'IMMEDIATE' CHECK (notification_frequency IN ('IMMEDIATE', 'DAILY', 'WEEKLY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email notification log table for MVP 1.1
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Recommendation tables for MVP 1.2
CREATE TABLE IF NOT EXISTS user_reading_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    genres TEXT[] DEFAULT '{}',
    authors TEXT[] DEFAULT '{}',
    reading_goals VARCHAR(50),
    book_length VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
    reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    liked BOOLEAN NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS available_genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS available_authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default genres
INSERT INTO available_genres (name, description) VALUES
('Fiction', 'Novels, short stories, and fictional narratives'),
('Non-Fiction', 'True stories, biographies, and factual content'),
('Mystery', 'Suspense, detective stories, and crime fiction'),
('Romance', 'Love stories and romantic fiction'),
('Science Fiction', 'Futuristic and speculative fiction'),
('Fantasy', 'Magical and fantastical stories'),
('Biography', 'Life stories of real people'),
('History', 'Historical events and periods'),
('Self-Help', 'Personal development and improvement'),
('Business', 'Business strategy, entrepreneurship, and professional development'),
('Technology', 'Technical books and computer science'),
('Travel', 'Travel guides and adventure stories'),
('Cooking', 'Recipes and culinary arts'),
('Art', 'Visual arts, design, and creativity'),
('Sports', 'Sports stories and athletic achievements'),
('Health', 'Wellness, fitness, and medical topics'),
('Religion', 'Religious texts and spiritual content'),
('Politics', 'Political theory and current affairs'),
('Science', 'Scientific discoveries and research'),
('Education', 'Learning materials and academic content')
ON CONFLICT (name) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_books_owner_id ON books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_title_author ON books(title, author);
CREATE INDEX IF NOT EXISTS idx_book_requests_requester_id ON book_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_book_requests_owner_id ON book_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_book_requests_status ON book_requests(status);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_user ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status, created_at);

-- AI Recommendation indexes
CREATE INDEX IF NOT EXISTS idx_user_reading_preferences_user ON user_reading_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_book_recommendations_user ON book_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_book_recommendations_book ON book_recommendations(book_id);
CREATE INDEX IF NOT EXISTS idx_book_recommendations_score ON book_recommendations(score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_book ON recommendation_feedback(book_id);
CREATE INDEX IF NOT EXISTS idx_available_genres_name ON available_genres(name);
CREATE INDEX IF NOT EXISTS idx_available_authors_name ON available_authors(name);

-- Full-text search index for books
CREATE INDEX IF NOT EXISTS idx_books_search ON books USING gin(to_tsvector('english', title || ' ' || COALESCE(author, '') || ' ' || COALESCE(genre, '')));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_requests_updated_at BEFORE UPDATE ON book_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reading_preferences_updated_at BEFORE UPDATE ON user_reading_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
