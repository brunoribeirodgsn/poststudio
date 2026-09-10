# PostStudio BR — como executar no VSCode

## Requisitos

- Windows 10 ou superior
- Node.js 22 ou superior
- Visual Studio Code

## Instalação

1. Extraia o arquivo ZIP.
2. Abra a pasta extraída no Visual Studio Code.
3. Abra o terminal integrado (`Ctrl + '`).
4. Execute:

```bash
npm install
npm run dev
```

5. Abra no navegador o endereço mostrado pelo terminal.

## Comandos disponíveis

```bash
npm run dev
npm run build
npm run start
```

## Estrutura principal

- `app/page.tsx`: telas, funções e conteúdo do sistema.
- `app/globals.css`: identidade visual e responsividade.
- `app/layout.tsx`: título e informações gerais.
- `public`: arquivos públicos, ícones e imagens.

## Observação

A geração de carrosséis funciona em modo demonstrativo. Para usar inteligência artificial real, pagamentos, contas de clientes e banco de dados compartilhado, será necessário conectar as respectivas APIs e cadastrar as chaves em variáveis de ambiente.
