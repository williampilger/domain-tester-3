import { getCurrentUser } from '@/lib/auth';
import { saveStressTest } from '@/lib/database';
import { performStressTest } from '@/lib/domain-utils';
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

    const { domain, port, concurrentUsers, durationSeconds } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domínio é obrigatório' },
        { status: 400 }
      );
    }

    if (!concurrentUsers || concurrentUsers < 1 || concurrentUsers > 100) {
      return NextResponse.json(
        { error: 'Usuários concorrentes deve estar entre 1 e 100' },
        { status: 400 }
      );
    }

    if (!durationSeconds || durationSeconds < 5 || durationSeconds > 300) {
      return NextResponse.json(
        { error: 'Duração deve estar entre 5 e 300 segundos' },
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

    console.log(`Iniciando teste de stress: ${domain}${portNumber ? `:${portNumber}` : ''} - ${concurrentUsers} usuários por ${durationSeconds}s`);
    
    const results = await performStressTest(domain, portNumber, concurrentUsers, durationSeconds);
    
    // Salvar no banco de dados
    await saveStressTest(user.id, domain, portNumber || null, concurrentUsers, durationSeconds, results, 'completed');

    return NextResponse.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    console.error('Erro no teste de stress:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
