-- Users table for temporary profiles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read all users
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Anyone can create a user profile" ON users
  FOR INSERT WITH CHECK (true);

-- Messages table for the chat
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read messages
CREATE POLICY "Messages are viewable by everyone" ON messages
  FOR SELECT USING (true);

-- Create policy to allow users to insert their own messages
CREATE POLICY "Users can insert their own messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Notes table for collaborative notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read notes
CREATE POLICY "Notes are viewable by everyone" ON notes
  FOR SELECT USING (true);

-- Create policy to allow anyone to create, update notes
CREATE POLICY "Anyone can create notes" ON notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update notes" ON notes
  FOR UPDATE USING (true);

-- Table to track which users are editing which notes
CREATE TABLE note_editors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE note_editors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read note editors
CREATE POLICY "Note editors are viewable by everyone" ON note_editors
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert note editors
CREATE POLICY "Anyone can register as a note editor" ON note_editors
  FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to delete note editors
CREATE POLICY "Anyone can unregister as a note editor" ON note_editors
  FOR DELETE USING (true);