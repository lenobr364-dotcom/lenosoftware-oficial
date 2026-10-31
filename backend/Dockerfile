# Imagem oficial leve do Python
FROM python:3.11-slim
# Diretório de trabalho no contêiner
WORKDIR /app
# Instalação de dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copia o código-fonte da Fábrica de Agentes
COPY . .
# Expõe a porta que o Uvicorn utiliza
EXPOSE 8000
# Inicializa a API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
