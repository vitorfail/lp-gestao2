document.addEventListener('DOMContentLoaded', () => {

  // Unix timestamp (in seconds) to count down to
  var twoDaysFromNow = (new Date().getTime() / 1000) + (3850) + 1;
  const dataAtual = new Date();

// Data específica (28 de novembro de 2024)
  const dataFutura = new Date(2024, 11, 4); 

// Convertendo a diferença para segundos
  // Set up FlipDown
  var flipdown = new FlipDown(twoDaysFromNow)

    // Start the countdown
    .start()

    // Do something when the countdown ends
    .ifEnded(() => {
    });

  // Toggle theme
  document.body.querySelector('#flipdown').classList.toggle('flipdown__theme-light');


  // Show version number
  var ver = document.getElementById('ver');
  ver.innerHTML = flipdown.version;
});
