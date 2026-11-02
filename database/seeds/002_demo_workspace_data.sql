-- ==============================================================================
-- CarbonIQ Demo Data: 002_demo_workspace_data.sql
-- Description: Clearly labelled sample data for individual & organization workspaces
-- Note: All sample passwords default to 'Password@123' (bcrypt hash)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DEMO USERS
-- ------------------------------------------------------------------------------
-- Bcrypt hash for 'Password@123': $2b$12$K8qf4yQn9z1mCj9w.2xKaeB1/4d.rV5R.JqfO1s1yZfE8/vK.Gf7O
INSERT INTO users (id, email, password_hash, full_name, system_role, default_workspace_type)
VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'demo.individual@carboniq.local',
        '$2b$12$e/hF1nL9Nq2eH2A9i3k5QOTfN6lq9vK0H4vQ6J1f2E3.K5x7g8h9O',
        'Piyush Sharma (Individual)',
        'user',
        'personal'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'demo.admin@carboniq.local',
        '$2b$12$e/hF1nL9Nq2eH2A9i3k5QOTfN6lq9vK0H4vQ6J1f2E3.K5x7g8h9O',
        'Aarav Mehta (Org Owner)',
        'user',
        'organization'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'demo.member@carboniq.local',
        '$2b$12$e/hF1nL9Nq2eH2A9i3k5QOTfN6lq9vK0H4vQ6J1f2E3.K5x7g8h9O',
        'Ananya Sen (Org Member)',
        'user',
        'organization'
    )
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. DEMO ORGANIZATION & DEPARTMENTS
-- ------------------------------------------------------------------------------
INSERT INTO organizations (id, name, slug, description, industry, country, created_by)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'EcoTech Innovations Pvt Ltd (DEMO)',
        'ecotech-innovations-demo',
        'Sample clean-tech software and hardware engineering company.',
        'Information Technology',
        'India',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO organization_members (id, organization_id, user_id, role)
VALUES 
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'owner'),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'member')
ON CONFLICT (organization_id, user_id) DO NOTHING;

INSERT INTO departments (id, organization_id, name, code, description)
VALUES 
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Data Center & Engineering', 'ENG-DC', 'Cloud compute nodes, development workstations, and on-premise servers'),
    ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Operations & Logistics', 'OPS-LOG', 'Dispatch fleet, facilities maintenance, and warehousing'),
    ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Corporate Headquarters', 'HQ', 'Executive suites, customer relations, and cafeteria')
ON CONFLICT (organization_id, name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. DEMO ACTIVITIES & EMISSION RECORDS (PERSONAL WORKSPACE)
-- ------------------------------------------------------------------------------
-- Activity 1: Individual Home Electricity (Current month)
INSERT INTO activities (id, user_id, organization_id, department_id, activity_type_id, created_by, quantity, unit, activity_date, notes)
VALUES (
    '55555555-5555-5555-5555-555555555501',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NULL,
    NULL,
    '33333333-3333-3333-3333-333333333301', -- grid_electricity
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    320.00,
    'kWh',
    CURRENT_DATE - INTERVAL '3 days',
    'Monthly home residential electricity utility bill'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO emission_records (activity_id, emission_factor_id, emission_factor_snapshot, factor_source_snapshot, calculated_co2e_kg)
VALUES (
    '55555555-5555-5555-5555-555555555501',
    '44444444-4444-4444-4444-444444444401',
    0.716000,
    'CEA India 2023',
    229.1200 -- 320 * 0.716
) ON CONFLICT (activity_id) DO NOTHING;

-- Activity 2: Individual Petrol Car Commute
INSERT INTO activities (id, user_id, organization_id, department_id, activity_type_id, created_by, quantity, unit, activity_date, notes)
VALUES (
    '55555555-5555-5555-5555-555555555502',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NULL,
    NULL,
    '33333333-3333-3333-3333-333333333302', -- petrol_car
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    180.00,
    'km',
    CURRENT_DATE - INTERVAL '5 days',
    'Weekly office commute via personal sedan'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO emission_records (activity_id, emission_factor_id, emission_factor_snapshot, factor_source_snapshot, calculated_co2e_kg)
VALUES (
    '55555555-5555-5555-5555-555555555502',
    '44444444-4444-4444-4444-444444444402',
    0.170480,
    'UK DEFRA 2023',
    30.6864 -- 180 * 0.170480
) ON CONFLICT (activity_id) DO NOTHING;

-- Activity 3: Individual LPG cylinder refill
INSERT INTO activities (id, user_id, organization_id, department_id, activity_type_id, created_by, quantity, unit, activity_date, notes)
VALUES (
    '55555555-5555-5555-5555-555555555503',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NULL,
    NULL,
    '33333333-3333-3333-3333-333333333310', -- lpg_cylinder
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    14.20,
    'kg',
    CURRENT_DATE - INTERVAL '15 days',
    '14.2kg standard domestic LPG cylinder refill'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO emission_records (activity_id, emission_factor_id, emission_factor_snapshot, factor_source_snapshot, calculated_co2e_kg)
VALUES (
    '55555555-5555-5555-5555-555555555503',
    '44444444-4444-4444-4444-444444444410',
    2.939200,
    'UK DEFRA 2023',
    41.7366 -- 14.2 * 2.9392
) ON CONFLICT (activity_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. DEMO ACTIVITIES & EMISSION RECORDS (ORGANIZATION WORKSPACE)
-- ------------------------------------------------------------------------------
-- Org Activity 1: Data Center Electricity (Engineering Dept)
INSERT INTO activities (id, user_id, organization_id, department_id, activity_type_id, created_by, quantity, unit, activity_date, notes)
VALUES (
    '55555555-5555-5555-5555-555555555511',
    NULL,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000021',
    '33333333-3333-3333-3333-333333333301', -- grid_electricity
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    4500.00,
    'kWh',
    CURRENT_DATE - INTERVAL '4 days',
    'Main server farm & network switchgear primary meter'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO emission_records (activity_id, emission_factor_id, emission_factor_snapshot, factor_source_snapshot, calculated_co2e_kg)
VALUES (
    '55555555-5555-5555-5555-555555555511',
    '44444444-4444-4444-4444-444444444401',
    0.716000,
    'CEA India 2023',
    3222.0000 -- 4500 * 0.716
) ON CONFLICT (activity_id) DO NOTHING;

-- Org Activity 2: Backup Diesel Generator (Operations Dept)
INSERT INTO activities (id, user_id, organization_id, department_id, activity_type_id, created_by, quantity, unit, activity_date, notes)
VALUES (
    '55555555-5555-5555-5555-555555555512',
    NULL,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000022',
    '33333333-3333-3333-3333-333333333308', -- diesel_fuel
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    250.00,
    'litres',
    CURRENT_DATE - INTERVAL '8 days',
    'Scheduled routine testing of 250kVA standby diesel generator'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO emission_records (activity_id, emission_factor_id, emission_factor_snapshot, factor_source_snapshot, calculated_co2e_kg)
VALUES (
    '55555555-5555-5555-5555-555555555512',
    '44444444-4444-4444-4444-444444444408',
    2.686500,
    'UK DEFRA 2023',
    671.6250 -- 250 * 2.6865
) ON CONFLICT (activity_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. DEMO GOALS
-- ------------------------------------------------------------------------------
INSERT INTO goals (id, user_id, organization_id, title, description, baseline_co2e_kg, target_co2e_kg, target_reduction_pct, start_date, target_date, status)
VALUES 
    (
        '66666666-6666-6666-6666-666666666601',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        'Reduce Household Electricity by 15%',
        'Shift high-draw appliances to solar hours and turn off standby devices.',
        350.0000,
        297.5000,
        15.00,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '60 days',
        'active'
    ),
    (
        '66666666-6666-6666-6666-666666666602',
        NULL,
        '00000000-0000-0000-0000-000000000001',
        'Company-wide Q4 Carbon Reduction',
        'Optimize HVAC setpoints in HQ and optimize server load balancing.',
        5000.0000,
        4250.0000,
        15.00,
        CURRENT_DATE - INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '75 days',
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. DEMO RECOMMENDATIONS
-- ------------------------------------------------------------------------------
INSERT INTO recommendations (user_id, organization_id, category_code, title, explanation, action_text, priority, potential_reduction_co2e_kg, source_type, supporting_metric)
VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        'electricity',
        'Optimize Air Conditioning & Standby Loads',
        'Grid electricity contributes over 70% of your current monthly footprint.',
        'Increase thermostat setting to 24°C and utilize smart power strips to cut phantom power drain.',
        'high',
        35.00,
        'rule_based',
        '229.1 kg CO2e electricity recorded'
    ),
    (
        NULL,
        '00000000-0000-0000-0000-000000000001',
        'fuel',
        'Evaluate Backup Generator Run Times',
        'Standby diesel generation generated 671 kg CO2e during routine weekly testing.',
        'Review generator maintenance scheduling or evaluate battery energy storage (BESS) for peak shaving.',
        'medium',
        150.00,
        'ai_gemini',
        '671.6 kg CO2e from diesel combustion'
    );

