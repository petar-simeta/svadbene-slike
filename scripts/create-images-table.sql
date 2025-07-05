-- Create the images table
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('before-wedding', 'wedding', 'group-photos', 'party', 'other')),
  tags TEXT[] DEFAULT '{}',
  alt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_tags ON images USING GIN(tags);

-- Enable Row Level Security (optional)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access" ON images
  FOR SELECT USING (true);
