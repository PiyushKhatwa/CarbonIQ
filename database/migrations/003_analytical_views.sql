-- ==============================================================================
-- CarbonIQ Database Migration: 003_analytical_views.sql
-- Description: Analytical views for monthly trends, category breakdown & departments
-- ADBMS Objective: Demonstrates relational views, aggregation, window functions & abstraction
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DETAILED ACTIVITY & EMISSION VIEW
-- Convenient flattened representation for history screens and exports
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_activities_detailed AS
SELECT 
    a.id AS activity_id,
    a.user_id,
    a.organization_id,
    a.department_id,
    d.name AS department_name,
    a.activity_date,
    TO_CHAR(a.activity_date, 'YYYY-MM') AS year_month,
    EXTRACT(YEAR FROM a.activity_date)::INT AS activity_year,
    EXTRACT(MONTH FROM a.activity_date)::INT AS activity_month,
    c.id AS category_id,
    c.code AS category_code,
    c.name AS category_name,
    c.icon_name AS category_icon,
    t.id AS activity_type_id,
    t.code AS activity_type_code,
    t.name AS activity_type_name,
    a.quantity,
    a.unit,
    a.notes,
    a.created_by,
    u.full_name AS recorded_by_name,
    er.id AS emission_record_id,
    er.emission_factor_id,
    er.emission_factor_snapshot,
    er.factor_source_snapshot,
    er.calculated_co2e_kg,
    a.created_at
FROM activities a
JOIN activity_types t ON a.activity_type_id = t.id
JOIN activity_categories c ON t.category_id = c.id
JOIN users u ON a.created_by = u.id
LEFT JOIN departments d ON a.department_id = d.id
LEFT JOIN emission_records er ON a.id = er.activity_id;

-- ------------------------------------------------------------------------------
-- 2. MONTHLY EMISSIONS TREND VIEW
-- Provides time-series aggregations for charts
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_monthly_emissions AS
SELECT 
    a.user_id,
    a.organization_id,
    TO_CHAR(a.activity_date, 'YYYY-MM') AS year_month,
    EXTRACT(YEAR FROM a.activity_date)::INT AS activity_year,
    EXTRACT(MONTH FROM a.activity_date)::INT AS activity_month,
    COUNT(a.id) AS total_activities,
    ROUND(SUM(er.calculated_co2e_kg), 4) AS total_co2e_kg,
    ROUND(AVG(er.calculated_co2e_kg), 4) AS avg_co2e_kg_per_activity
FROM activities a
JOIN emission_records er ON a.id = er.activity_id
GROUP BY 
    a.user_id, 
    a.organization_id, 
    TO_CHAR(a.activity_date, 'YYYY-MM'),
    EXTRACT(YEAR FROM a.activity_date),
    EXTRACT(MONTH FROM a.activity_date)
ORDER BY year_month DESC;

-- ------------------------------------------------------------------------------
-- 3. CATEGORY-WISE EMISSIONS BREAKDOWN VIEW
-- Provides categorical percentage distribution for donut/pie charts
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_category_emissions AS
SELECT 
    a.user_id,
    a.organization_id,
    c.id AS category_id,
    c.code AS category_code,
    c.name AS category_name,
    c.icon_name AS category_icon,
    COUNT(a.id) AS activity_count,
    ROUND(SUM(a.quantity), 2) AS total_quantity,
    a.unit,
    ROUND(SUM(er.calculated_co2e_kg), 4) AS total_co2e_kg
FROM activities a
JOIN activity_types t ON a.activity_type_id = t.id
JOIN activity_categories c ON t.category_id = c.id
JOIN emission_records er ON a.id = er.activity_id
GROUP BY 
    a.user_id, 
    a.organization_id, 
    c.id, 
    c.code, 
    c.name, 
    c.icon_name, 
    a.unit;

-- ------------------------------------------------------------------------------
-- 4. DEPARTMENT-WISE EMISSIONS VIEW (FOR ORGANIZATIONS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_department_emissions AS
SELECT 
    a.organization_id,
    COALESCE(d.id, '00000000-0000-0000-0000-000000000000'::UUID) AS department_id,
    COALESCE(d.name, 'Unassigned') AS department_name,
    COUNT(a.id) AS activity_count,
    ROUND(SUM(er.calculated_co2e_kg), 4) AS total_co2e_kg
FROM activities a
JOIN emission_records er ON a.id = er.activity_id
LEFT JOIN departments d ON a.department_id = d.id
WHERE a.organization_id IS NOT NULL
GROUP BY a.organization_id, d.id, d.name;

