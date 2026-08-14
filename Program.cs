using FibonacciApp.Services;

const int quantidadeTermos = 20;

var sequencia = FibonacciCalculator.Gerar(quantidadeTermos);

Console.WriteLine($"Sequência de Fibonacci com {quantidadeTermos} termos:");
Console.WriteLine();

for (var i = 0; i < sequencia.Count; i++)
{
    Console.WriteLine($"F({i,2}) = {sequencia[i]}");
}

Console.WriteLine();
Console.WriteLine("Série: " + string.Join(", ", sequencia));