-- Add demo activities with valid categories
INSERT INTO activities (
  tour_guide_id, 
  tourist_id, 
  activity_name, 
  category, 
  location_name, 
  scheduled_date, 
  scheduled_time, 
  duration_minutes, 
  status, 
  notes,
  description
) VALUES 
(
  'cc78629a-2f4d-4339-8441-9dc00e736937',
  'd8eab175-77bc-4208-9bb4-178709a9e033',
  'Hegra Archaeological Site Visit',
  'heritage',
  'Hegra Archaeological Site',
  '2025-08-08',
  '09:00:00',
  180,
  'planned',
  'Guided tour of the ancient Nabataean tombs',
  'Explore the UNESCO World Heritage site with detailed explanations of Nabataean culture and architecture'
),
(
  'cc78629a-2f4d-4339-8441-9dc00e736937',
  'd8eab175-77bc-4208-9bb4-178709a9e033',
  'AlUla Old Town Walking Tour',
  'heritage',
  'AlUla Old Town',
  '2025-08-08',
  '14:00:00',
  120,
  'planned',
  'Historical walking tour through traditional mud-brick buildings',
  'Discover the heritage of AlUla through its ancient streets and traditional architecture'
),
(
  'cc78629a-2f4d-4339-8441-9dc00e736937',
  'edd88479-4699-40a7-a675-3ca6aba45017',
  'Elephant Rock Sunset Visit',
  'attraction',
  'Elephant Rock (Jabal AlFil)',
  '2025-08-09',
  '17:30:00',
  90,
  'planned',
  'Sunset photography at the iconic rock formation',
  'Experience the magical sunset at one of AlUlas most famous landmarks'
);