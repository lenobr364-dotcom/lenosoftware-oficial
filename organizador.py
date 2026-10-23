def organizar_estudo(texto):
    print("--- PROCESSANDO CONTEÚDO ---")
    # Simulação da inteligência de triagem
    palavras_chave = ["SaaS", "API", "Python", "Manutenção"]
    resumo = f"O texto foca em: {', '.join([p for p in palavras_chave if p in texto])}"

    print(f"Resumo: {resumo}")
    print("\n--- QUESTIONÁRIO DE FIXAÇÃO ---")
    print("1. Como este tema se aplica na prática?")
    print("2. Qual o principal desafio citado no texto?")
    print("--------------------------------")


# Teste agora: Cole qualquer texto aqui na variável 'meu_texto'
meu_texto = "SaaS é um modelo de software que usa API para integração, muito útil em processos de manutenção industrial."
organizar_estudo(meu_texto)
