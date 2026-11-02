-- ==============================================================================
-- CarbonIQ Seed Data: 001_taxonomies_and_factors.sql
-- Description: Authoritative Activity Categories, Activity Types, and Emission Factors
-- Citations: Central Electricity Authority (Govt of India), UK DEFRA/DESNZ 2023, US EPA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ACTIVITY CATEGORIES
-- ------------------------------------------------------------------------------
INSERT INTO activity_categories (id, code, name, description, icon_name, display_order)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'electricity', 'Electricity', 'Grid and renewable power consumption for households and facilities', 'Zap', 1),
    ('11111111-1111-1111-1111-111111111102', 'transportation', 'Transportation', 'Personal commutes, company fleet, public transit, and air travel', 'Car', 2),
    ('11111111-1111-1111-1111-111111111103', 'fuel', 'Fuel & Combustion', 'Direct liquid fuels including petrol and diesel for stationary engines/generators', 'Flame', 3),
    ('11111111-1111-1111-1111-111111111104', 'lpg', 'LPG & Cooking Gas', 'Liquefied petroleum gas used in domestic and cafeteria cooking', 'Container', 4),
    ('11111111-1111-1111-1111-111111111105', 'waste', 'Waste Management', 'Solid waste disposal to landfill, recycling, and composting', 'Trash2', 5)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, icon_name = EXCLUDED.icon_name;

-- ------------------------------------------------------------------------------
-- 2. EMISSION FACTOR SOURCES (PROVENANCE CITATIONS)
-- ------------------------------------------------------------------------------
INSERT INTO emission_factor_sources (id, short_name, publisher, source_title, reference_url, publication_year, notes)
VALUES 
    (
        '22222222-2222-2222-2222-222222222201',
        'CEA India 2023',
        'Central Electricity Authority, Ministry of Power, Govt of India',
        'CO2 Baseline Database for the Indian Power Sector, User Guide Version 19.0',
        'https://cea.nic.in/cdm-co2-baseline-database/',
        2023,
        'National grid average emission factor (weighted combined margin across Indian regional grids).'
    ),
    (
        '22222222-2222-2222-2222-222222222202',
        'UK DEFRA 2023',
        'UK Department for Environment, Food & Rural Affairs / DESNZ',
        'Government Greenhouse Gas Conversion Factors for Company Reporting (2023)',
        'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
        2023,
        'Internationally cited conversion factors covering transport modes, vehicle fuels, and waste streams.'
    ),
    (
        '22222222-2222-2222-2222-222222222203',
        'US EPA 2023',
        'United States Environmental Protection Agency',
        'GHG Emission Factors Hub for Greenhouse Gas Inventories',
        'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
        2023,
        'Standard mobile combustion and stationary combustion benchmarks.'
    )
ON CONFLICT (short_name) DO UPDATE 
SET publisher = EXCLUDED.publisher, source_title = EXCLUDED.source_title, reference_url = EXCLUDED.reference_url;

-- ------------------------------------------------------------------------------
-- 3. ACTIVITY TYPES
-- ------------------------------------------------------------------------------
INSERT INTO activity_types (id, category_id, code, name, standard_unit, description)
VALUES 
    -- Electricity
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'grid_electricity', 'Grid Electricity Consumed', 'kWh', 'Metered electricity consumption from the utility power grid'),
    
    -- Transportation
    ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', 'petrol_car', 'Passenger Car (Petrol)', 'km', 'Travel by standard petrol internal combustion engine passenger car'),
    ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111102', 'diesel_car', 'Passenger Car (Diesel)', 'km', 'Travel by diesel passenger car or SUV'),
    ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111102', 'motorcycle', 'Motorcycle / Scooter', 'km', 'Commute via two-wheeler petrol motorcycle or scooter'),
    ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111102', 'bus_transit', 'Bus Transit', 'km', 'Public bus transit per passenger kilometre'),
    ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111102', 'metro_train', 'Metro / Train Transit', 'km', 'Urban metro rail or regional electric train travel'),
    ('33333333-3333-3333-3333-333333333307', '11111111-1111-1111-1111-111111111102', 'domestic_flight', 'Domestic Air Travel', 'km', 'Domestic scheduled airline flight per passenger kilometre'),

    -- Fuel & Combustion
    ('33333333-3333-3333-3333-333333333308', '11111111-1111-1111-1111-111111111103', 'diesel_fuel', 'Diesel Fuel (Stationary/Machinery)', 'litres', 'Direct consumption of diesel fuel for generators and machinery'),
    ('33333333-3333-3333-3333-333333333309', '11111111-1111-1111-1111-111111111103', 'petrol_fuel', 'Petrol Fuel (Direct Combustion)', 'litres', 'Direct consumption of motor spirit / petrol'),

    -- LPG
    ('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111104', 'lpg_cylinder', 'LPG Cylinder / Cooking Gas', 'kg', 'Bottled or piped liquefied petroleum gas for cooking and heating'),

    -- Waste
    ('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111105', 'waste_landfill', 'Mixed Solid Waste to Landfill', 'kg', 'Unsorted municipal or commercial solid waste sent to landfill'),
    ('33333333-3333-3333-3333-333333333312', '11111111-1111-1111-1111-111111111105', 'waste_composted', 'Organic Waste Composted', 'kg', 'Biodegradable food and organic green waste diverted to composting')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, standard_unit = EXCLUDED.standard_unit, description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 4. VERSIONED EMISSION FACTORS (WITH STRICT SOURCE CITATIONS)
-- ------------------------------------------------------------------------------
INSERT INTO emission_factors (
    id, activity_type_id, source_id, factor_value, unit, geography, valid_from, valid_to, version_tag, is_verified
)
VALUES 
    -- Grid Electricity (India - CEA weighted average grid)
    ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 0.716000, 'kg CO2e/kWh', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Passenger Car (Petrol)
    ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', 0.170480, 'kg CO2e/km', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Passenger Car (Diesel)
    ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222202', 0.171120, 'kg CO2e/km', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Motorcycle
    ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222202', 0.113550, 'kg CO2e/km', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Bus Transit
    ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222202', 0.096500, 'kg CO2e/km', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Metro / Train
    ('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222202', 0.035490, 'kg CO2e/km', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Domestic Flight
    ('44444444-4444-4444-4444-444444444407', '33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222202', 0.245870, 'kg CO2e/km', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Diesel Fuel (Direct litres)
    ('44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222202', 2.686500, 'kg CO2e/litre', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Petrol Fuel (Direct litres)
    ('44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222202', 2.339600, 'kg CO2e/litre', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- LPG (Cooking gas)
    ('44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333310', '22222222-2222-2222-2222-222222222202', 2.939200, 'kg CO2e/kg', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Mixed Waste to Landfill
    ('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222202', 0.446200, 'kg CO2e/kg', 'India', '2023-01-01', NULL, 'v2023.1', TRUE),

    -- Waste Composted
    ('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222202', 0.010200, 'kg CO2e/kg', 'India', '2023-01-01', NULL, 'v2023.1', TRUE)
ON CONFLICT (activity_type_id, geography, version_tag) DO UPDATE 
SET factor_value = EXCLUDED.factor_value, is_verified = EXCLUDED.is_verified;

