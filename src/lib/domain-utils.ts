import axios from 'axios';
import { exec } from 'child_process';
import dns from 'dns/promises';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DomainInfo {
  domain: string;
  port?: number;
  ip?: string;
  whoisInfo?: any;
  dnsRecords?: {
    A?: string[];
    AAAA?: string[];
    MX?: any[];
    NS?: string[];
    TXT?: string[];
    CNAME?: string[];
    SOA?: any;
  };
  sslCertificate?: {
    valid: boolean;
    issuer?: string;
    validFrom?: string;
    validTo?: string;
    subject?: string;
    altNames?: string[];
  };
  httpHeaders?: any;
  speedTest?: {
    responseTime: number;
    downloadSpeed?: number;
    ttfb: number; // Time to First Byte
  };
  hosting?: {
    provider?: string;
    server?: string;
    technologies?: string[];
  };
  security?: {
    hsts: boolean;
    csp: boolean;
    xFrame: boolean;
    securityHeaders: string[];
  };
}

export async function getDomainInfo(domain: string, port?: number): Promise<DomainInfo> {
  const info: DomainInfo = { domain, port };

  try {
    // Resolver IP
    try {
      const addresses = await dns.resolve4(domain);
      info.ip = addresses[0];
    } catch (error) {
      console.error('Erro ao resolver IP:', error);
    }

    // DNS Records
    info.dnsRecords = await getDNSRecords(domain);

    // WHOIS Info
    info.whoisInfo = await getWhoisInfo(domain);

    // SSL Certificate
    info.sslCertificate = await getSSLCertificate(domain, port || 443);

    // HTTP Headers e Speed Test
    const httpInfo = await getHTTPInfo(domain, port);
    info.httpHeaders = httpInfo.headers;
    info.speedTest = httpInfo.speedTest;
    info.hosting = httpInfo.hosting;
    info.security = httpInfo.security;

  } catch (error) {
    console.error('Erro ao obter informações do domínio:', error);
  }

  return info;
}

async function getDNSRecords(domain: string) {
  const records: any = {};

  try {
    records.A = await dns.resolve4(domain);
  } catch (e) {}

  try {
    records.AAAA = await dns.resolve6(domain);
  } catch (e) {}

  try {
    records.MX = await dns.resolveMx(domain);
  } catch (e) {}

  try {
    records.NS = await dns.resolveNs(domain);
  } catch (e) {}

  try {
    records.TXT = await dns.resolveTxt(domain);
  } catch (e) {}

  try {
    records.CNAME = await dns.resolveCname(domain);
  } catch (e) {}

  try {
    records.SOA = await dns.resolveSoa(domain);
  } catch (e) {}

  return records;
}

async function getWhoisInfo(domain: string) {
  try {
    const { stdout } = await execAsync(`whois ${domain}`);
    return parseWhoisData(stdout);
  } catch (error) {
    console.error('Erro ao obter WHOIS:', error);
    return null;
  }
}

function parseWhoisData(whoisData: string) {
  const lines = whoisData.split('\n');
  const info: any = {};

  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (value) {
        const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
        info[cleanKey] = value;
      }
    }
  }

  return info;
}

async function getSSLCertificate(domain: string, port: number) {
  try {
    const { stdout } = await execAsync(
      `echo | timeout 10 openssl s_client -servername ${domain} -connect ${domain}:${port} 2>/dev/null | openssl x509 -noout -text`
    );
    
    return parseSSLCertificate(stdout);
  } catch (error) {
    console.error('Erro ao obter certificado SSL:', error);
    return { valid: false };
  }
}

function parseSSLCertificate(certData: string) {
  const cert: any = { valid: true };

  // Extrair informações básicas do certificado
  const issuerMatch = certData.match(/Issuer: (.+)/);
  if (issuerMatch) cert.issuer = issuerMatch[1];

  const subjectMatch = certData.match(/Subject: (.+)/);
  if (subjectMatch) cert.subject = subjectMatch[1];

  const validFromMatch = certData.match(/Not Before: (.+)/);
  if (validFromMatch) cert.validFrom = validFromMatch[1];

  const validToMatch = certData.match(/Not After : (.+)/);
  if (validToMatch) cert.validTo = validToMatch[1];

  // Extrair Subject Alternative Names
  const sanMatch = certData.match(/DNS:([^,\s]+)/g);
  if (sanMatch) {
    cert.altNames = sanMatch.map((san: string) => san.replace('DNS:', ''));
  }

  return cert;
}

async function getHTTPInfo(domain: string, port?: number) {
  const url = `http${port === 443 || !port ? 's' : ''}://${domain}${port && port !== 80 && port !== 443 ? `:${port}` : ''}`;
  
  try {
    const start = Date.now();
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true, // Aceitar qualquer status
      maxRedirects: 5
    });
    const responseTime = Date.now() - start;

    const headers = response.headers;
    
    // Análise de segurança
    const security = {
      hsts: !!headers['strict-transport-security'],
      csp: !!headers['content-security-policy'],
      xFrame: !!headers['x-frame-options'],
      securityHeaders: [] as string[]
    };

    if (headers['strict-transport-security']) security.securityHeaders.push('HSTS');
    if (headers['content-security-policy']) security.securityHeaders.push('CSP');
    if (headers['x-frame-options']) security.securityHeaders.push('X-Frame-Options');
    if (headers['x-xss-protection']) security.securityHeaders.push('X-XSS-Protection');
    if (headers['x-content-type-options']) security.securityHeaders.push('X-Content-Type-Options');

    // Informações de hosting
    const hosting = {
      server: headers.server || 'Unknown',
      provider: detectHostingProvider(headers),
      technologies: detectTechnologies(headers, response.data)
    };

    return {
      headers,
      speedTest: {
        responseTime,
        ttfb: responseTime, // Simplificado
        downloadSpeed: response.data ? (response.data.length / responseTime) * 1000 : 0
      },
      hosting,
      security
    };
  } catch (error) {
    console.error('Erro ao obter informações HTTP:', error);
    return {
      headers: {},
      speedTest: { responseTime: -1, ttfb: -1 },
      hosting: {},
      security: { hsts: false, csp: false, xFrame: false, securityHeaders: [] }
    };
  }
}

function detectHostingProvider(headers: any): string {
  const server = headers.server?.toLowerCase() || '';
  const powered = headers['x-powered-by']?.toLowerCase() || '';
  
  if (server.includes('cloudflare')) return 'Cloudflare';
  if (server.includes('nginx')) return 'Nginx';
  if (server.includes('apache')) return 'Apache';
  if (powered.includes('aws')) return 'AWS';
  if (headers['x-amz-cf-id']) return 'AWS CloudFront';
  if (headers['x-served-by']) return 'Fastly';
  
  return 'Unknown';
}

function detectTechnologies(headers: any, body: string): string[] {
  const technologies: string[] = [];
  
  if (headers['x-powered-by']) {
    technologies.push(headers['x-powered-by']);
  }
  
  if (body) {
    if (body.includes('wp-content')) technologies.push('WordPress');
    if (body.includes('_next')) technologies.push('Next.js');
    if (body.includes('react')) technologies.push('React');
    if (body.includes('vue')) technologies.push('Vue.js');
    if (body.includes('angular')) technologies.push('Angular');
  }
  
  return technologies;
}

// Teste de stress simplificado
export async function performStressTest(domain: string, port: number | undefined, concurrentUsers: number, durationSeconds: number) {
  const url = `http${port === 443 || !port ? 's' : ''}://${domain}${port && port !== 80 && port !== 443 ? `:${port}` : ''}`;
  
  const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    requestsPerSecond: 0,
    errors: [] as string[]
  };

  const startTime = Date.now();
  const endTime = startTime + (durationSeconds * 1000);
  const responseTimes: number[] = [];

  const makeRequest = async () => {
    const requestStart = Date.now();
    try {
      await axios.get(url, { timeout: 5000 });
      const responseTime = Date.now() - requestStart;
      responseTimes.push(responseTime);
      results.successfulRequests++;
      results.minResponseTime = Math.min(results.minResponseTime, responseTime);
      results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
    } catch (error: any) {
      results.failedRequests++;
      results.errors.push(error.message);
    }
    results.totalRequests++;
  };

  // Executar requisições concorrentes
  const promises: Promise<void>[] = [];
  
  while (Date.now() < endTime) {
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(makeRequest());
    }
    
    // Aguardar um pouco antes da próxima rodada
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await Promise.all(promises);

  // Calcular estatísticas finais
  const actualDuration = (Date.now() - startTime) / 1000;
  results.averageResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  results.requestsPerSecond = results.totalRequests / actualDuration;

  if (results.minResponseTime === Infinity) {
    results.minResponseTime = 0;
  }

  return results;
}
