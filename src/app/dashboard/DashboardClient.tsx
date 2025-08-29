'use client';

import { User } from '@/lib/auth';
import Link from 'next/link';
import { useState } from 'react';

interface DashboardClientProps {
  user: User;
}

interface DomainResult {
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
    ttfb: number;
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

interface StressTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'stress'>('analyze');
  const [domain, setDomain] = useState('');
  const [port, setPort] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainResult | null>(null);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);
  const [error, setError] = useState('');

  // Parâmetros do teste de stress
  const [concurrentUsers, setConcurrentUsers] = useState('10');
  const [durationSeconds, setDurationSeconds] = useState('30');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/domain/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain, port: port || undefined }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao analisar domínio');
      }
    } catch (error) {
      setError('Erro de conexão');
    }

    setLoading(false);
  };

  const handleStressTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStressResult(null);

    try {
      const response = await fetch('/api/domain/stress-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          domain, 
          port: port || undefined,
          concurrentUsers: parseInt(concurrentUsers),
          durationSeconds: parseInt(durationSeconds)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStressResult(data.data);
      } else {
        const data = await response.json();
        setError(data.error || 'Erro no teste de stress');
      }
    } catch (error) {
      setError('Erro de conexão');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Domain Tester
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {user.username}</span>
              <Link
                href="/api/auth/logout"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Teste e analise domínios, sites e servidores
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analyze'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Análise de Domínio
              </button>
              <button
                onClick={() => setActiveTab('stress')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Teste de Stress
              </button>
            </nav>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={activeTab === 'analyze' ? handleAnalyze : handleStressTest}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Domínio ou IP
                </label>
                <input
                  type="text"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="exemplo.com ou 192.168.1.1"
                  required
                />
              </div>
              <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                  Porta (opcional)
                </label>
                <input
                  type="number"
                  id="port"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="80, 443, 8080..."
                  min="1"
                  max="65535"
                />
              </div>
              {activeTab === 'stress' && (
                <>
                  <div>
                    <label htmlFor="users" className="block text-sm font-medium text-gray-700">
                      Usuários Concorrentes
                    </label>
                    <input
                      type="number"
                      id="users"
                      value={concurrentUsers}
                      onChange={(e) => setConcurrentUsers(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      Duração (segundos)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="5"
                      max="300"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading 
                  ? (activeTab === 'analyze' ? 'Analisando...' : 'Testando...')
                  : (activeTab === 'analyze' ? 'Analisar Domínio' : 'Iniciar Teste de Stress')
                }
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400">
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </div>

        {/* Resultados da Análise */}
        {result && activeTab === 'analyze' && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Domínio</dt>
                  <dd className="mt-1 text-sm text-gray-900">{result.domain}</dd>
                </div>
                {result.port && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Porta</dt>
                    <dd className="mt-1 text-sm text-gray-900">{result.port}</dd>
                  </div>
                )}
                {result.ip && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">IP</dt>
                    <dd className="mt-1 text-sm text-gray-900">{result.ip}</dd>
                  </div>
                )}
              </div>
            </div>

            {/* DNS Records */}
            {result.dnsRecords && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Registros DNS</h3>
                <div className="space-y-4">
                  {Object.entries(result.dnsRecords).map(([type, records]) => (
                    records && records.length > 0 && (
                      <div key={type}>
                        <dt className="text-sm font-medium text-gray-500">{type}</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {Array.isArray(records) ? (
                            <ul className="list-disc list-inside">
                              {records.map((record: any, index: number) => (
                                <li key={index}>
                                  {typeof record === 'string' ? record : JSON.stringify(record)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <pre className="text-xs">{JSON.stringify(records, null, 2)}</pre>
                          )}
                        </dd>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* SSL Certificate */}
            {result.sslCertificate && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Certificado SSL</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className={`mt-1 text-sm ${result.sslCertificate.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {result.sslCertificate.valid ? 'Válido' : 'Inválido'}
                    </dd>
                  </div>
                  {result.sslCertificate.issuer && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Emissor</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.sslCertificate.issuer}</dd>
                    </div>
                  )}
                  {result.sslCertificate.validFrom && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Válido desde</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.sslCertificate.validFrom}</dd>
                    </div>
                  )}
                  {result.sslCertificate.validTo && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Válido até</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.sslCertificate.validTo}</dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Speed Test */}
            {result.speedTest && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Teste de Velocidade</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tempo de Resposta</dt>
                    <dd className="mt-1 text-sm text-gray-900">{result.speedTest.responseTime}ms</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">TTFB</dt>
                    <dd className="mt-1 text-sm text-gray-900">{result.speedTest.ttfb}ms</dd>
                  </div>
                  {result.speedTest.downloadSpeed && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Velocidade de Download</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.speedTest.downloadSpeed.toFixed(2)} bytes/s</dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security */}
            {result.security && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Segurança</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">HSTS</dt>
                    <dd className={`mt-1 text-sm ${result.security.hsts ? 'text-green-600' : 'text-red-600'}`}>
                      {result.security.hsts ? 'Ativo' : 'Inativo'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CSP</dt>
                    <dd className={`mt-1 text-sm ${result.security.csp ? 'text-green-600' : 'text-red-600'}`}>
                      {result.security.csp ? 'Ativo' : 'Inativo'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">X-Frame-Options</dt>
                    <dd className={`mt-1 text-sm ${result.security.xFrame ? 'text-green-600' : 'text-red-600'}`}>
                      {result.security.xFrame ? 'Ativo' : 'Inativo'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Headers de Segurança</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {result.security.securityHeaders.length > 0 
                        ? result.security.securityHeaders.join(', ')
                        : 'Nenhum'
                      }
                    </dd>
                  </div>
                </div>
              </div>
            )}

            {/* Hosting */}
            {result.hosting && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hospedagem</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {result.hosting.server && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Servidor</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.hosting.server}</dd>
                    </div>
                  )}
                  {result.hosting.provider && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Provedor</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.hosting.provider}</dd>
                    </div>
                  )}
                  {result.hosting.technologies && result.hosting.technologies.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tecnologias</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {result.hosting.technologies.join(', ')}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resultados do Teste de Stress */}
        {stressResult && activeTab === 'stress' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resultados do Teste de Stress</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total de Requisições</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{stressResult.totalRequests}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Sucessos</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-600">{stressResult.successfulRequests}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Falhas</dt>
                <dd className="mt-1 text-2xl font-semibold text-red-600">{stressResult.failedRequests}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Req/s</dt>
                <dd className="mt-1 text-2xl font-semibold text-blue-600">{stressResult.requestsPerSecond.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tempo Médio</dt>
                <dd className="mt-1 text-sm text-gray-900">{stressResult.averageResponseTime.toFixed(2)}ms</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tempo Mínimo</dt>
                <dd className="mt-1 text-sm text-gray-900">{stressResult.minResponseTime.toFixed(2)}ms</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tempo Máximo</dt>
                <dd className="mt-1 text-sm text-gray-900">{stressResult.maxResponseTime.toFixed(2)}ms</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Taxa de Sucesso</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {((stressResult.successfulRequests / stressResult.totalRequests) * 100).toFixed(1)}%
                </dd>
              </div>
            </div>
            
            {stressResult.errors.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Erros Encontrados</h4>
                <div className="bg-red-50 p-3 rounded-md">
                  <ul className="text-sm text-red-700 space-y-1">
                    {stressResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {stressResult.errors.length > 10 && (
                      <li>... e mais {stressResult.errors.length - 10} erros</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
