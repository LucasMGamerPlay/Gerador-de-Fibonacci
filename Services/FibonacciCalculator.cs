namespace FibonacciApp.Services;

/// <summary>
/// Gera a sequência de Fibonacci de forma iterativa (O(n) tempo, O(n) espaço).
/// F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) para n >= 2.
/// </summary>
public static class FibonacciCalculator
{
    /// <summary>
    /// Gera os primeiros <paramref name="quantidadeTermos"/> termos da sequência.
    /// </summary>
    /// <param name="quantidadeTermos">Quantidade de termos (deve ser maior que zero).</param>
    /// <returns>Lista somente leitura com os termos gerados.</returns>
    /// <exception cref="ArgumentOutOfRangeException">
    /// Lançada quando <paramref name="quantidadeTermos"/> é menor ou igual a zero.
    /// </exception>
    public static IReadOnlyList<long> Gerar(int quantidadeTermos)
    {
        if (quantidadeTermos <= 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(quantidadeTermos),
                "A quantidade de termos deve ser um número positivo.");
        }

        var sequencia = new List<long>(quantidadeTermos);
        long anterior = 0;
        long atual = 1;

        for (var i = 0; i < quantidadeTermos; i++)
        {
            sequencia.Add(anterior);
            var proximo = anterior + atual;
            anterior = atual;
            atual = proximo;
        }

        return sequencia;
    }
}