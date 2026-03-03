ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles visible" ON users FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active businesses visible" ON businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Claimed owners edit" ON businesses FOR UPDATE USING (auth.uid() = claimed_by);

ALTER TABLE trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active trails visible" ON trails FOR SELECT USING (is_active = true);

ALTER TABLE trail_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conditions visible" ON trail_conditions FOR SELECT USING (true);
CREATE POLICY "Authenticated report" ON trail_conditions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews visible" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated review" ON reviews FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Own review editable" ON reviews FOR UPDATE USING (auth.uid() = author_id);

ALTER TABLE activity_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts visible" ON activity_posts FOR SELECT USING (is_public = true);
CREATE POLICY "Own posts manageable" ON activity_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated create" ON activity_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE activity_post_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post owner + self sees" ON activity_post_participants FOR SELECT USING (
  auth.uid() = user_id OR
  auth.uid() = (SELECT user_id FROM activity_posts WHERE id = post_id)
);
CREATE POLICY "Authenticated join" ON activity_post_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public activities visible" ON user_activities FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Own activities" ON user_activities FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own integrations" ON user_integrations FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own saved items" ON user_saved_items FOR ALL USING (auth.uid() = user_id);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public or own trips" ON trips FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Own trips manageable" ON trips FOR ALL USING (auth.uid() = user_id);

ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business owner reads analytics" ON business_analytics FOR SELECT USING (
  auth.uid() = (SELECT claimed_by FROM businesses WHERE id = business_id)
);
