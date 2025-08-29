import { getCurrentUser } from '@/lib/auth';
import { saveDomainTest } from '@/lib/database';
import { getDomainInfo } from '@/lib/domain-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { domain, port } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domínio é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato do domínio
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!domainRegex.test(domain) && !ipRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Formato de domínio ou IP inválido' },
        { status: 400 }
      );
    }

    const portNumber = port ? parseInt(port) : undefined;
    if (portNumber && (portNumber < 1 || portNumber > 65535)) {
      return NextResponse.json(
        { error: 'Porta deve estar entre 1 e 65535' },
        { status: 400 }
      );
    }

    console.log(`Analisando domínio: ${domain}${portNumber ? `:${portNumber}` : ''}`);
    
    const domainInfo = await getDomainInfo(domain, portNumber);
    
    // Salvar no banco de dados
    await saveDomainTest(user.id, domain, portNumber || null, 'full_analysis', domainInfo);

    return NextResponse.json({ 
      success: true, 
      data: domainInfo 
    });
  } catch (error) {
    console.error('Erro na análise do domínio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
