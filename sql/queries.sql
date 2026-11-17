-- ============================================================
-- COMPLEX QUERIES — Dark Web Data Breach Intelligence System
-- ============================================================


-- ============================================================
-- QUERY 1: Top 10 Most Targeted Organizations
-- Techniques: JOIN, GROUP BY, ORDER BY, aggregate functions
-- ============================================================

-- Purpose: Identifies which organizations have been most frequently
-- and severely targeted across all recorded breaches.

SELECT
    o.org_name,
    o.industry,
    COUNT(DISTINCT cc.breach_id) AS times_breached,
    COUNT(cc.cred_id) AS credentials_exposed,
    SUM(CASE WHEN cc.is_reused THEN 1 ELSE 0 END) AS reused_credentials,
    MAX(b.breach_date) AS most_recent_breach
FROM organizations o
JOIN domains d ON o.org_id = d.org_id
JOIN compromised_credentials cc ON d.domain_id = cc.domain_id
JOIN breaches b ON cc.breach_id = b.breach_id
GROUP BY o.org_id, o.org_name, o.industry
ORDER BY times_breached DESC, credentials_exposed DESC
LIMIT 10;


-- ============================================================
-- QUERY 2: Semantically Similar Breaches (pgvector)
-- Techniques: pgvector cosine distance (<=>), subquery, ORDER BY
-- ============================================================

-- Purpose: Given breach_id = 1, find the 5 most similar breaches
-- based on the semantic meaning of their descriptions.
-- This enables analysts to discover related incidents that may
-- share the same attack methodology or threat actor patterns.

SELECT
    b.breach_id,
    b.breach_name,
    b.severity,
    b.breach_date,
    b.records_exposed,
    ROUND((1 - (b.description_embedding <=> target.emb))::NUMERIC, 4) AS similarity_score
FROM breaches b,
     (SELECT description_embedding AS emb
      FROM breaches WHERE breach_id = 1) AS target
WHERE b.breach_id != 1
  AND b.description_embedding IS NOT NULL
ORDER BY b.description_embedding <=> target.emb ASC
LIMIT 5;


-- ============================================================
-- QUERY 3: Threat Actors Targeting the Finance Industry
-- Techniques: Multi-table JOIN, subquery, HAVING, DISTINCT
-- ============================================================

-- Purpose: Identifies which threat actors have specifically targeted
-- organizations in the finance sector, ranked by breach count.
-- Useful for sector-specific threat intelligence reporting.

SELECT
    ta.name AS threat_actor,
    ta.risk_level,
    ta.motivation,
    COUNT(DISTINCT b.breach_id) AS finance_breaches,
    SUM(b.records_exposed) AS total_records_exposed
FROM threat_actors ta
JOIN breach_threat_actors bta ON ta.actor_id = bta.actor_id
JOIN breaches b ON bta.breach_id = b.breach_id
WHERE b.breach_id IN (
    SELECT DISTINCT cc.breach_id
    FROM compromised_credentials cc
    JOIN domains d ON cc.domain_id = d.domain_id
    JOIN organizations o ON d.org_id = o.org_id
    WHERE o.industry = 'Finance'
)
GROUP BY ta.actor_id, ta.name, ta.risk_level, ta.motivation
HAVING COUNT(DISTINCT b.breach_id) >= 1
ORDER BY finance_breaches DESC;


-- ============================================================
-- QUERY 4: Credential Reuse Across Breaches for a Specific Domain
-- Techniques: Self-JOIN, comparison to avoid duplicates
-- ============================================================

-- Purpose: For a specific domain (e.g., 'globalbank.co.uk'), finds
-- all credentials that appear in multiple breaches. This reveals
-- password reuse patterns — a critical security vulnerability.

SELECT
    cc1.email_hash,
    b1.breach_name AS breach_1,
    b1.breach_date AS breach_1_date,
    b2.breach_name AS breach_2,
    b2.breach_date AS breach_2_date
FROM compromised_credentials cc1
JOIN compromised_credentials cc2
    ON cc1.email_hash = cc2.email_hash
    AND cc1.breach_id < cc2.breach_id
JOIN breaches b1 ON cc1.breach_id = b1.breach_id
JOIN breaches b2 ON cc2.breach_id = b2.breach_id
JOIN domains d ON cc1.domain_id = d.domain_id
WHERE d.domain_name = 'globalbank.co.uk'
ORDER BY cc1.email_hash, b1.breach_date;


-- ============================================================
-- QUERY 5: Monthly Breach Severity Trend with Moving Average
-- Techniques: Window functions (AVG OVER), DATE_TRUNC, CTE
-- ============================================================

-- Purpose: Shows monthly breach trends with a 3-month moving average
-- of CVSS scores and cumulative breach count. This enables analysts
-- to spot escalating threat patterns and seasonal attack waves.

WITH monthly_stats AS (
    SELECT
        DATE_TRUNC('month', breach_date) AS month,
        COUNT(*) AS breach_count,
        ROUND(AVG(cvss_score), 2) AS avg_cvss,
        SUM(records_exposed) AS total_records
    FROM breaches
    WHERE breach_date IS NOT NULL
    GROUP BY DATE_TRUNC('month', breach_date)
)
SELECT
    month,
    breach_count,
    avg_cvss,
    total_records,
    ROUND(AVG(avg_cvss) OVER (
        ORDER BY month
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS moving_avg_cvss_3mo,
    SUM(breach_count) OVER (
        ORDER BY month
    ) AS cumulative_breaches
FROM monthly_stats
ORDER BY month;
