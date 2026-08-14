namespace FibonacciApp;

/// <summary>
/// Gera a sequência de Fibonacci de forma iterativa (O(n), sem overflow de pilha).
/// </summary>
public static class FibonacciGenerator
{
    /// <summary>
    /// Gera os <paramref name="quantidade"/> primeiros termos da sequência de Fibonacci.
    /// Convenção: F(1) = 0, F(2) = 1, F(n) = F(n-1) + F(n-2).
    /// </summary>
    /// <param name="quantidade">Número de termos desejados (mínimo 1).</param>
    /// <returns>Lista imutável com os termos gerados.</returns>
    /// <exception cref="ArgumentOutOfRangeException">Quando a quantidade é menor que 1.</exception>
    public static IReadOnlyList<long> Gerar(int quantidade)
    {
        if (quantidade < 1)
        {
            throw new ArgumentOutOfRangeException(
                nameof(quantidade),
                quantidade,
                "A quantidade de termos deve ser no mínimo 1.");
        }

        var termos = new long[quantidade];
        termos[0] = 0;

        if (quantidade == 1)
        {
            return termos;
        }

        termos[1] = 1;

        for (var i = 2; i < quantidade; i++)
        {
            termos[i] = termos[i - 1] + termos[i - 2];
        }

        return termos;
    }
}