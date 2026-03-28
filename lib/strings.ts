// Strings do app Luna — UTF-8 correto
export const STRINGS = {
  welcomeMsg: (name?: string) => {
    const base = 'Ola' + (name ? ', ' + name : '') + '! Pressione o botao do microfone ou Espaco para falar.'
    return base
  },
  statusIdle:      'Pronto - pressione Espaco ou o botao',
  statusListening: 'Ouvindo - fale agora...',
  statusThinking:  'Processando...',
  statusSpeaking:  'LUNA falando...',
  errConexao:      'Erro de conexao.',
  errMicrofone:    'Permita o microfone: clique no cadeado na barra de endereco.',
  tagSalvo:        '[OK] Salvo!',
  tagEvento:       '[OK] Evento criado!',
}
