# Analisador Léxico

Repositório contendo a implementação de um analisador léxico em JavaScript.

---

## Pré-requisitos

Antes de começar, certifique-se de ter:

- Node.js (versão 14+ recomendada)
- npm ou yarn instalado
- Terminal / prompt de comando

---

## Estrutura do Projeto

| Pasta / Arquivo | Descrição                                                                           |
| --------------- | ----------------------------------------------------------------------------------- |
| `main.js`       | Arquivo principal que realiza a execução da análise léxica.                         |
| `package.json`  | Dependências e scripts do projeto.                                                  |
| `AFND/`         | Contém os Autômatos Finitos Não Determinísticos definidos para os tokens/gramática. |
| `inputs/`       | Entradas de exemplo a serem analisadas.                                             |
| `utils/`        | Funções utilitárias auxiliares.                                                     |

---

## Uso

Você pode rodar o analisador léxico com uma entrada de exemplo:

```bash
node Lexico/main.js
```

- `inputs/example.in` é o arquivo com código-fonte de exemplo que será analisado.
- A saída será exibida no console com:
  - **Fita de saída** (os tokens identificados)
  - **Tabela de Símbolos** no formato especificado
