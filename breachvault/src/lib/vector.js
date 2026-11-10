// BreachVault Vector Search & pgvector Cosine Similarity Engine
// Simulates 384-dimensional dense vectors (sentence-transformers/all-MiniLM-L6-v2)

// Compute cosine similarity between two vector arrays
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate normalized 384-dim pseudo-dense vector from text
export function generateEmbedding(text) {
  const DIM = 384;
  const vec = new Float32Array(DIM);
  const clean = text.toLowerCase();
  
  // Semantic term weights
  const vocabulary = {
    'credential': 12, 'dump': 14, 'dark web': 20, 'sqli': 25, 'injection': 25,
    'password': 18, 'credit card': 22, 'database': 15, 'phishing': 24,
    'insider': 22, 'cloud': 16, 's3': 20, 'aws': 18, 'bucket': 16,
    'misconfiguration': 22, 'rce': 28, 'remote code': 28, 'execution': 22,
    'zero day': 30, 'zero-day': 30, 'cryptocurrency': 25, 'wallet': 24,
    'exchange': 20, 'skimmer': 26, 'magecart': 28, 'retail': 16,
    'healthcare': 20, 'patient': 20, 'ssn': 25, 'social security': 25,
    'apt': 28, 'espionage': 26, 'defense': 22, 'supply chain': 26,
    'token': 18, 'api key': 22, 'leak': 14, 'breach': 12, 'exfiltration': 20
  };

  for (const [term, weight] of Object.entries(vocabulary)) {
    if (clean.includes(term)) {
      // hash term to dimensions
      let hash = 0;
      for (let i = 0; i < term.length; i++) {
        hash = ((hash << 5) - hash) + term.charCodeAt(i);
        hash |= 0;
      }
      for (let k = 0; k < 8; k++) {
        const idx = Math.abs((hash + k * 37) % DIM);
        vec[idx] += weight * (1.0 + (k * 0.1));
      }
    }
  }

  // General character n-gram distribution for linguistic density
  for (let i = 0; i < clean.length - 2; i++) {
    const gram = clean.substring(i, i + 3);
    let h = 0;
    for (let j = 0; j < gram.length; j++) {
      h = (h * 31 + gram.charCodeAt(j)) & 0xffffffff;
    }
    const idx = Math.abs(h % DIM);
    vec[idx] += 0.5;
  }

  // L2 Normalize vector
  let norm = 0.0;
  for (let i = 0; i < DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1.0;
  const result = [];
  for (let i = 0; i < DIM; i++) result.push(Number((vec[i] / norm).toFixed(5)));
  return result;
}

// Find top-k similar breaches based on pgvector cosine similarity
export function findSimilarBreaches(queryText, breachesList, topK = 5, targetBreachId = null) {
  const queryEmbedding = generateEmbedding(queryText);

  const scored = breachesList
    .filter(b => targetBreachId ? b.breach_id !== targetBreachId : true)
    .map(b => {
      const bEmbedding = b.embedding || generateEmbedding(b.breach_name + ' ' + b.description);
      const similarity = cosineSimilarity(queryEmbedding, bEmbedding);
      const cosineDistance = Math.max(0, 1 - similarity);
      
      // Determine containment / remediation recommendation based on similarity and attack vector
      let recommendation = 'Standard credential reset & user notification.';
      if (b.attack_vector === 'sqli') {
        recommendation = 'Parameterize SQL queries, review ORM inputs, and audit exposed endpoints.';
      } else if (b.attack_vector === 'rce') {
        recommendation = 'Isolate vulnerable server hosts immediately, patch runtime CVEs, and rotate database master credentials.';
      } else if (b.attack_vector === 'zero_day') {
        recommendation = 'Deploy emergency WAF virtual patch, monitor outbound C2 traffic, and engage vendor IR team.';
      } else if (b.attack_vector === 'misconfiguration') {
        recommendation = 'Restrict public cloud bucket policies, enforce IAM MFA, and rotate all exposed API/OAuth tokens.';
      } else if (b.attack_vector === 'phishing') {
        recommendation = 'Revoke active employee session tokens, mandate hardware FIDO2 MFA, and conduct domain spoofing review.';
      }

      return {
        ...b,
        similarity_score: Number((similarity * 100).toFixed(2)),
        cosine_distance: Number(cosineDistance.toFixed(4)),
        recommended_action: recommendation
      };
    });

  // Sort descending by similarity
  scored.sort((a, b) => b.similarity_score - a.similarity_score);
  return scored.slice(0, topK);
}

