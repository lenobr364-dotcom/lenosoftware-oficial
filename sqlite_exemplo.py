import sqlite3
from datetime import datetime

# 1. Conecta ao banco de dados (cria o arquivo se não existir)
conn = sqlite3.connect('laboratorio_digital.db')
cursor = conn.cursor()

# 2. Cria a estrutura da tabela
cursor.execute('''
    CREATE TABLE IF NOT EXISTS manutencao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipamento TEXT NOT NULL,
        data_registro TEXT,
        status TEXT
    )
''')

# 3. Função para registrar nova manutenção
def registrar_manutencao(nome_equipamento, status):
    data_agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT INTO manutencao (equipamento, data_registro, status) VALUES (?, ?, ?)",
                   (nome_equipamento, data_agora, status))
    conn.commit()
    print(f"Sucesso: {nome_equipamento} registrado com status '{status}'.")

# 4. Executando um teste prático
if __name__ == "__main__":
    registrar_manutencao("Filtro de Óleo - Fábrica Biju", "Em Manutenção")
    registrar_manutencao("Motor de Compressão", "Operacional")

    # 5. Listando tudo que foi gravado
    print("\n--- REGISTROS ATUAIS NO BANCO ---")
    for row in cursor.execute("SELECT * FROM manutencao"):
        print(row)

    conn.close()
