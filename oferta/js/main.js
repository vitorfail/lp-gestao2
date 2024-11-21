document.addEventListener('DOMContentLoaded', () => {

  // Unix timestamp (in seconds) to count down to
  var twoDaysFromNow = (new Date().getTime() / 1000) + (86400 * 2) + 1;
  const dataAtual = new Date();

// Data específica (28 de novembro de 2024)
  const dataFutura = new Date(2024, 10, 23); 

// Convertendo a diferença para segundos
  // Set up FlipDown
  console.log(twoDaysFromNow)
  var flipdown = new FlipDown(dataFutura.getTime()/1000)

    // Start the countdown
    .start()

    // Do something when the countdown ends
    .ifEnded(() => {
      console.log('The countdown has ended!');
    });

  // Toggle theme
  document.body.querySelector('#flipdown').classList.toggle('flipdown__theme-light');


  // Show version number
  var ver = document.getElementById('ver');
  ver.innerHTML = flipdown.version;
});
