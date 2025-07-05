-- Insert sample data (replace with your actual image URLs after upload)
INSERT INTO images (url, category, tags, alt) VALUES
  ('your-supabase-storage-url/image1.jpg', 'before-wedding', ARRAY['John', 'Sarah', 'engagement'], 'Engagement photo'),
  ('your-supabase-storage-url/image2.jpg', 'wedding', ARRAY['John', 'Sarah', 'ceremony'], 'Wedding ceremony'),
  ('your-supabase-storage-url/image3.jpg', 'group-photos', ARRAY['John', 'Sarah', 'Mike', 'Lisa', 'family'], 'Family photo'),
  ('your-supabase-storage-url/image4.jpg', 'party', ARRAY['Mike', 'Lisa', 'dancing'], 'Party dancing'),
  ('your-supabase-storage-url/image5.jpg', 'other', ARRAY['venue', 'decoration'], 'Venue decoration');
