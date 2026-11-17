// BreachVault Database Controller & Multi-Dialect Engine
import crypto from 'crypto';
import {
  initialUsers,
  initialDataClasses,
  initialThreatActors,
  initialOrganizations,
  initialDomains,
  initialBreaches,
  initialCompromisedCredentials,
  initialWatchlist,
  initialRemediationActions,
  initialAuditLogs
} from './seedData';
import { generateEmbedding } from './vector';

// Global state container for in-memory / fallback relational data
let globalState = globalThis.__breachVaultDb;

if (!globalState) {
  // Precompute embeddings for initial breaches
  const breachesWithEmbeddings = initialBreaches.map(b => ({
    ...b,
    embedding: generateEmbedding(b.breach_name + ' ' + b.description)
  }));

  globalState = {
    users: [...initialUsers],
    dataClasses: [...initialDataClasses],
    threatActors: [...initialThreatActors],
    organizations: [...initialOrganizations],
    domains: [...initialDomains],
    breaches: breachesWithEmbeddings,
    compromisedCredentials: [...initialCompromisedCredentials],
    watchlist: [...initialWatchlist],
    remediationActions: [...initialRemediationActions],
    auditLogs: [...initialAuditLogs],
    currentUser: { user_id: 1, username: 'admin_raven', role: 'admin' }
  };
  globalThis.__breachVaultDb = globalState;
}

function hashEmail(str) {
  if (!str) return '';
  return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
}

export const db = {
  // Get all breaches with enriched metadata
  getBreaches: async () => {
    return globalState.breaches;
  },

  getBreachById: async (id) => {
    return globalState.breaches.find(b => b.breach_id === Number(id));
  },

  // Stored Procedure: sp_ingest_breach with full multi-table trigger correlation
  ingestBreach: async (data, userId = 1) => {
    const newId = globalState.breaches.length + 1;
    const actorsList = Array.isArray(data.attributed_actors)
      ? data.attributed_actors
      : [data.attributed_actors || 'ShadowSyndicate'];

    const newBreach = {
      breach_id: newId,
      breach_name: data.breach_name,
      description: data.description,
      breach_date: data.breach_date || new Date().toISOString().split('T')[0],
      discovery_date: new Date().toISOString().split('T')[0],
      source_type: data.source_type || 'dark_web',
      severity: data.severity || 'high',
      cvss_score: parseFloat(data.cvss_score) || 7.5,
      records_exposed: parseInt(data.records_exposed) || 100000,
      attack_vector: data.attack_vector || 'sqli',
      data_classes: data.data_classes || ['Email Addresses', 'Passwords'],
      attributed_actors: actorsList,
      keywords: (data.description + ' ' + data.breach_name).toLowerCase().split(/\W+/).filter(w => w.length > 4),
      embedding: generateEmbedding(data.breach_name + ' ' + data.description)
    };

    globalState.breaches.unshift(newBreach);

    // TRIGGER 1: trg_breach_audit — Auto-log breach ingestion to audit_logs
    const breachLogId = globalState.auditLogs.length + 1;
    globalState.auditLogs.unshift({
      log_id: breachLogId,
      user_id: userId,
      action: 'BREACH_INGESTED',
      target_table: 'breaches',
      target_id: newId,
      details: `New breach ingested: ${newBreach.breach_name} | Severity: ${newBreach.severity} | Records: ${newBreach.records_exposed.toLocaleString()}`,
      performed_at: new Date().toISOString()
    });

    // TRIGGER 3: trg_update_actor_last_seen — Update threat actor dossiers
    for (const actorRaw of actorsList) {
      const cleanActor = actorRaw.replace(/\s*\(.*\)/, '').trim();
      if (!cleanActor || cleanActor.toLowerCase() === 'unknown') continue;

      let foundActor = globalState.threatActors.find(a =>
        a.name.toLowerCase() === cleanActor.toLowerCase() ||
        (a.aliases && a.aliases.some(al => al.toLowerCase().includes(cleanActor.toLowerCase())))
      );

      if (foundActor) {
        foundActor.last_seen = newBreach.breach_date;
        globalState.auditLogs.unshift({
          log_id: globalState.auditLogs.length + 1,
          user_id: userId,
          action: 'ACTOR_LAST_SEEN_UPDATED',
          target_table: 'threat_actors',
          target_id: foundActor.actor_id,
          details: `Trigger trg_update_actor_last_seen: Updated ${foundActor.name} last_seen to ${newBreach.breach_date} for breach #${newId}`,
          performed_at: new Date().toISOString()
        });
      } else {
        // Register new threat actor dossier dynamically
        const newActorId = globalState.threatActors.length + 1;
        foundActor = {
          actor_id: newActorId,
          name: cleanActor,
          risk_level: newBreach.severity === 'critical' ? 'critical' : 'high',
          motivation: newBreach.attack_vector === 'zero_day' ? 'espionage' : 'financial',
          origin_country: 'Unknown',
          first_seen: newBreach.breach_date,
          last_seen: newBreach.breach_date,
          description: `Threat actor group attributed to ${newBreach.breach_name}. Discovered via automated incident correlation.`,
          aliases: [`${cleanActor.replace(/\s+/g, '_')}_C2`, `${cleanActor}_DarkOps`]
        };
        globalState.threatActors.push(foundActor);
        globalState.auditLogs.unshift({
          log_id: globalState.auditLogs.length + 1,
          user_id: userId,
          action: 'ACTOR_IDENTIFIED',
          target_table: 'threat_actors',
          target_id: newActorId,
          details: `Registered new threat actor profile: ${cleanActor} attributed to breach #${newId}`,
          performed_at: new Date().toISOString()
        });
      }
    }

    // Resolve Target Organization & Domain
    let targetOrgId = data.target_org_id ? Number(data.target_org_id) : null;
    let targetDomain = null;
    if (targetOrgId) {
      targetDomain = globalState.domains.find(d => d.org_id === targetOrgId);
    } else {
      const matchedOrg = globalState.organizations.find(o =>
        newBreach.breach_name.toLowerCase().includes(o.org_name.toLowerCase()) ||
        newBreach.description.toLowerCase().includes(o.org_name.toLowerCase())
      ) || globalState.organizations[0];
      targetOrgId = matchedOrg.org_id;
      targetDomain = globalState.domains.find(d => d.org_id === targetOrgId);
    }
    const domainId = targetDomain ? targetDomain.domain_id : 1;
    const domainName = targetDomain ? targetDomain.domain_name : 'nexacorp.com';
    const org = globalState.organizations.find(o => o.org_id === targetOrgId) || globalState.organizations[0];

    // Generate Compromised Credential Record
    const emailToUse = data.sample_email && data.sample_email.trim()
      ? data.sample_email.trim()
      : `sec_admin@${domainName}`;

    let calculatedHash = hashEmail(emailToUse);
    const knownSeed = initialCompromisedCredentials.find(k => k.plain_preview && k.plain_preview.toLowerCase() === emailToUse.toLowerCase());
    if (knownSeed) {
      calculatedHash = knownSeed.email_hash;
    }

    // TRIGGER 2: trg_credential_reuse_check — Detect credential reuse across breaches
    const priorMatch = globalState.compromisedCredentials.some(c =>
      (c.email_hash.toLowerCase() === calculatedHash.toLowerCase() ||
       (c.plain_preview && c.plain_preview.toLowerCase() === emailToUse.toLowerCase())) &&
      c.breach_id !== newId
    );

    const isReused = priorMatch;

    if (isReused) {
      globalState.compromisedCredentials.forEach(c => {
        if (c.email_hash.toLowerCase() === calculatedHash.toLowerCase() ||
            (c.plain_preview && c.plain_preview.toLowerCase() === emailToUse.toLowerCase())) {
          c.is_reused = true;
        }
      });
    }

    const newCredId = globalState.compromisedCredentials.length + 1;
    const newCred = {
      cred_id: newCredId,
      breach_id: newId,
      domain_id: domainId,
      email_hash: calculatedHash,
      credential_type: data.attack_vector === 'misconfiguration' ? 'api_key' : 'password',
      is_reused: isReused,
      plain_preview: emailToUse,
      discovered_at: new Date().toISOString()
    };
    globalState.compromisedCredentials.unshift(newCred);

    if (isReused) {
      globalState.auditLogs.unshift({
        log_id: globalState.auditLogs.length + 1,
        user_id: userId,
        action: 'CREDENTIAL_REUSE_DETECTED',
        target_table: 'compromised_credentials',
        target_id: newCredId,
        details: `Trigger trg_credential_reuse_check: Email hash ${calculatedHash.slice(0, 8)}... (${emailToUse}) reused across breaches!`,
        performed_at: new Date().toISOString()
      });
    }

    // TRIGGER 4: trg_watchlist_alert — Notify analysts monitoring victim enterprise
    const watchers = globalState.watchlist.filter(w => w.org_id === targetOrgId && w.alert_enabled);
    for (const watcher of watchers) {
      globalState.auditLogs.unshift({
        log_id: globalState.auditLogs.length + 1,
        user_id: watcher.user_id,
        action: 'WATCHLIST_ALERT',
        target_table: 'compromised_credentials',
        target_id: newCredId,
        details: `Trigger trg_watchlist_alert: Watched organization ${org.org_name} credential leaked in breach: ${newBreach.breach_name}`,
        performed_at: new Date().toISOString()
      });
    }

    // AUTOMATED REMEDIATION STAGING
    let actionType = 'password_reset';
    let remediationDesc = `Force password reset & credential rotation for accounts leaked in ${newBreach.breach_name}`;
    if (newBreach.attack_vector === 'sqli') {
      actionType = 'patch';
      remediationDesc = `Apply emergency SQL query parameterization patch & WAF rule for ${newBreach.breach_name}`;
    } else if (newBreach.attack_vector === 'misconfiguration') {
      actionType = 'key_rotation';
      remediationDesc = `Revoke and rotate exposed API keys and S3 IAM credentials from ${newBreach.breach_name}`;
    } else if (newBreach.attack_vector === 'zero_day' || newBreach.attack_vector === 'rce') {
      actionType = 'patch';
      remediationDesc = `Isolate exposed hosts and deploy vendor security patch for ${newBreach.breach_name}`;
    } else if (newBreach.attack_vector === 'phishing') {
      actionType = 'account_lock';
      remediationDesc = `Lock compromised user accounts and revoke session tokens for ${newBreach.breach_name}`;
    }

    const actionId = globalState.remediationActions.length + 1;
    globalState.remediationActions.unshift({
      action_id: actionId,
      breach_id: newId,
      breach_name: newBreach.breach_name,
      user_id: userId,
      action_type: actionType,
      description: remediationDesc,
      status: 'pending',
      created_at: new Date().toISOString(),
      resolved_at: null
    });

    globalState.auditLogs.unshift({
      log_id: globalState.auditLogs.length + 1,
      user_id: userId,
      action: 'REMEDIATION_STAGED',
      target_table: 'remediation_actions',
      target_id: actionId,
      details: `Incident containment protocol staged: ${actionType.replace('_', ' ')} (${remediationDesc})`,
      performed_at: new Date().toISOString()
    });

    return {
      ...newBreach,
      target_organization: org.org_name,
      target_domain: domainName,
      compromised_credential: newCred,
      is_reused: isReused,
      watchlist_alerts_count: watchers.length
    };
  },

  // Get all compromised credentials enriched with domain, org & breach metadata
  getCompromisedCredentials: async () => {
    return globalState.compromisedCredentials.map(c => {
      const breach = globalState.breaches.find(b => b.breach_id === c.breach_id) || {};
      const domain = globalState.domains.find(d => d.domain_id === c.domain_id) || {};
      const org = globalState.organizations.find(o => o.org_id === domain.org_id) || {};
      return {
        cred_id: c.cred_id,
        email_hash: c.email_hash,
        plain_preview: c.plain_preview || 'user@domain.com',
        credential_type: c.credential_type,
        is_reused: c.is_reused,
        discovered_at: c.discovered_at,
        breach_id: c.breach_id,
        breach_name: breach.breach_name || 'Unknown Breach',
        breach_date: breach.breach_date,
        severity: breach.severity || 'high',
        cvss_score: breach.cvss_score || 7.0,
        domain_name: domain.domain_name || 'unknown.com',
        organization: org.org_name || 'Unknown Org'
      };
    });
  },

  // Function: fn_check_credential_exposure
  checkCredentialExposure: async (emailOrHash) => {
    const query = emailOrHash.trim().toLowerCase();
    
    // Look up directly by SHA-256 hash or plaintext preview
    const matches = globalState.compromisedCredentials.filter(c => 
      c.email_hash.toLowerCase() === query || 
      (c.plain_preview && c.plain_preview.toLowerCase().includes(query))
    );

    const enriched = matches.map(c => {
      const breach = globalState.breaches.find(b => b.breach_id === c.breach_id) || {};
      const domain = globalState.domains.find(d => d.domain_id === c.domain_id) || {};
      const org = globalState.organizations.find(o => o.org_id === domain.org_id) || {};
      return {
        cred_id: c.cred_id,
        email_hash: c.email_hash,
        plain_preview: c.plain_preview,
        credential_type: c.credential_type,
        is_reused: c.is_reused,
        discovered_at: c.discovered_at,
        breach_name: breach.breach_name,
        breach_date: breach.breach_date,
        severity: breach.severity,
        cvss_score: breach.cvss_score,
        domain_name: domain.domain_name,
        organization: org.org_name
      };
    });

    return enriched;
  },

  // Function: fn_calculate_org_risk_score
  calculateOrgRiskScores: async () => {
    return globalState.organizations.map(org => {
      const orgDomains = globalState.domains.filter(d => d.org_id === org.org_id).map(d => d.domain_id);
      const exposedCreds = globalState.compromisedCredentials.filter(c => orgDomains.includes(c.domain_id));
      const breachIds = [...new Set(exposedCreds.map(c => c.breach_id))];
      const reusedCreds = exposedCreds.filter(c => c.is_reused).length;
      
      const relatedBreaches = globalState.breaches.filter(b => breachIds.includes(b.breach_id));
      const severitySum = relatedBreaches.reduce((acc, b) => {
        const weights = { critical: 4, high: 3, medium: 2, low: 1 };
        return acc + (weights[b.severity] || 0);
      }, 0);

      // Algorithmic risk score from stored procedure:
      // score = min(100, (breach_count * 10) + (severity_sum * 5) + (reused_count * 15) + cred_factor)
      let credFactor = 5;
      if (exposedCreds.length > 10000) credFactor = 20;
      else if (exposedCreds.length > 1000) credFactor = 10;

      const score = Math.min(100, (breachIds.length * 10) + (severitySum * 5) + (reusedCreds * 15) + credFactor);

      let computedTier = 'low';
      if (score >= 75) computedTier = 'critical';
      else if (score >= 50) computedTier = 'high';
      else if (score >= 25) computedTier = 'medium';

      return {
        ...org,
        domains: globalState.domains.filter(d => d.org_id === org.org_id).map(d => d.domain_name),
        calculated_score: score,
        risk_tier: computedTier,
        times_breached: breachIds.length,
        credentials_exposed: exposedCreds.length,
        reused_count: reusedCreds,
        recent_breaches: relatedBreaches.map(b => b.breach_name)
      };
    });
  },

  // Get Threat Actors with dynamically correlated breach dossiers
  getThreatActors: async () => {
    return globalState.threatActors.map(actor => {
      const actorKeywords = [actor.name, ...(actor.aliases || [])].map(a => a.toLowerCase());
      
      const matchingBreaches = globalState.breaches.filter(b => {
        const attributed = (b.attributed_actors || []).map(a => a.toLowerCase());
        return attributed.some(attr => actorKeywords.some(kw => attr.includes(kw) || kw.includes(attr))) ||
               (b.description && actorKeywords.some(kw => b.description.toLowerCase().includes(kw)));
      });

      return {
        ...actor,
        breach_count: matchingBreaches.length,
        attributed_breaches: matchingBreaches.map(b => ({
          breach_id: b.breach_id,
          breach_name: b.breach_name,
          breach_date: b.breach_date,
          severity: b.severity
        }))
      };
    });
  },

  getOrganizations: async () => {
    return globalState.organizations;
  },

  getDomains: async () => {
    return globalState.domains;
  },

  getWatchlist: async () => {
    return globalState.watchlist;
  },

  toggleWatchlist: async (orgId, userId = 1) => {
    const existingIdx = globalState.watchlist.findIndex(w => w.org_id === orgId && w.user_id === userId);
    if (existingIdx >= 0) {
      globalState.watchlist[existingIdx].alert_enabled = !globalState.watchlist[existingIdx].alert_enabled;
      return globalState.watchlist[existingIdx];
    } else {
      const org = globalState.organizations.find(o => o.org_id === orgId);
      const newWatch = {
        watch_id: globalState.watchlist.length + 1,
        user_id: userId,
        org_id: orgId,
        org_name: org ? org.org_name : 'Unknown Org',
        watch_type: 'domain',
        alert_enabled: true,
        created_at: new Date().toISOString()
      };
      globalState.watchlist.push(newWatch);
      return newWatch;
    }
  },

  getRemediationActions: async () => {
    return globalState.remediationActions;
  },

  updateRemediationStatus: async (actionId, newStatus) => {
    const action = globalState.remediationActions.find(a => a.action_id === Number(actionId));
    if (action) {
      action.status = newStatus;
      if (newStatus === 'completed') {
        action.resolved_at = new Date().toISOString().split('T')[0];
      }
    }
    return action;
  },

  getAuditLogs: async () => {
    return globalState.auditLogs;
  },

  getStats: async () => {
    const totalBreaches = globalState.breaches.length;
    const totalRecords = globalState.breaches.reduce((acc, b) => acc + (b.records_exposed || 0), 0);
    const totalCredentials = globalState.compromisedCredentials.length;
    const reusedCreds = globalState.compromisedCredentials.filter(c => c.is_reused).length;
    const criticalBreaches = globalState.breaches.filter(b => b.severity === 'critical').length;
    const activeThreatActors = globalState.threatActors.length;
    const monitoredOrgs = globalState.organizations.length;
    
    return {
      totalBreaches,
      totalRecords,
      totalCredentials,
      reusedCreds,
      reuseRate: Math.round((reusedCreds / (totalCredentials || 1)) * 100),
      criticalBreaches,
      activeThreatActors,
      monitoredOrgs
    };
  }
};

