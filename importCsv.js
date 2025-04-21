const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const fetch = require('node-fetch');

async function importarCSV(caminhoArquivo) {
  const arquivoStream = fs.createReadStream(caminhoArquivo);

  const parser = arquivoStream.pipe(parse({
    columns: true,
    skip_empty_lines: true,
    trim: true
  }));

  for await (const record of parser) {
    const { title, description } = record;

    if (!title || !description) {
      console.log('Linha ignorada por falta de title ou description:', record);
      continue;
    }

    try {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao criar task:', errorData);
      } else {
        const data = await response.json();
        console.log('Task criada:', data);
      }
    } catch (error) {
      console.error('Erro na requisição:', error.message);
    }
  }
}

const arquivoCSV = process.argv[2];
if (!arquivoCSV) {
  console.error('Por favor, informe o caminho do arquivo CSV como argumento.');
  process.exit(1);
}

const caminhoCompleto = path.resolve(arquivoCSV);
importarCSV(caminhoCompleto);
