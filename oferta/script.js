window.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash) {
        history.replaceState(null, null, ' ');
    }
    contadores()
});

const direcoes = ["aparecer","esquerda", "direita", "cima", "baixo", "solucao-letra", "listra", "money", "pergunta", "cifrao", "numero1", "numero2", "numero3"];

direcoes.forEach(function(direcao) {
    window.addEventListener('DOMContentLoaded', function() {
        detectarScroll(direcao);
    });
});

const target = document.getElementById('problemas');


const solucoes = document.getElementById('solucoes');


var index_comentario= 0
function passar(index){
    var comentarios = document.getElementById("container_comentarios")
    if (index_comentario<=0){
        if(index_comentario==0 && index>0){

        }
        else{
            index_comentario =index_comentario+index
            comentarios.style.transform = `translateX(${index_comentario}vw)`
        }
    }
}
function subir(){
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // faz o scroll de forma suave
        });
}
function detectarScroll(el) {
    var elements = document.querySelectorAll("."+el);
    if (elements){
        elements.forEach(function (element) {
            var position = element.getBoundingClientRect();

            // Verifica se o elemento está visível no viewport
            if (position.top < window.innerHeight && position.bottom >= 20) {
                element.id = el; // Adiciona a classe
            }
        });

    }
}

window.addEventListener("scroll",function() {
    detectarScroll("listra")
    detectarScroll("solucao-letra")
    detectarScroll("destaque_linha")
    detectarScroll("money")
    detectarScroll("cima");
    detectarScroll("esquerda");
    detectarScroll("direita");
    detectarScroll("baixo");
    detectarScroll("cifrao");
    detectarScroll("numero1");
    detectarScroll("numero2");
    detectarScroll("numero3");
    detectarScroll("cifrao");
    detectarScroll("aparecer");
    contadores()

});
const numeros = [1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2,4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2, 3, 4, 5,1, 2];
const quadrados = numeros.map(num => num * num);
const classes = [
    "fa-solid fa-money-bill",
    "fa-solid fa-dollar-sign",
    "fa-solid fa-sack-xmark",
    "fa-solid fa-piggy-bank"
];
// Seleciona a lista no HTML
const lista = document.querySelector('.money');


const total = 1370; // Defina o número total que você deseja contar
let count = 0;

const total_feedbacks = 810; // Defina o número total que você deseja contar
let count_feedbacks = 0;

const total_satisfeitos = 82; // Defina o número total que você deseja contar
let count_satisfeitos = 0;

function contadores(){
    const numero = document.getElementById('numero1');

    if (numero !== null){
        const intervalo = setInterval(() => {
                if (count < total) {
                    count=count+1;
                    numero.textContent ='+'+ count;
                } else {
                    clearInterval(intervalo);
                }    
            
        }, 30);
    }
    const numero_feedbacks = document.getElementById('numero2');
    if(numero_feedbacks !== null){
        const intervalo_feedbacks = setInterval(() => {
            if (count_feedbacks < total_feedbacks) {
                count_feedbacks=count_feedbacks+1;
                numero_feedbacks.textContent ='+'+ count_feedbacks;
            } else {
                clearInterval(intervalo_feedbacks);
            }    
        }, 40);
    }
    const numero_satisfeitos = document.getElementById('numero3');

    if(numero_satisfeitos !== null){
        const intervalo_satisfeitos = setInterval(() => {
            if (count_satisfeitos < total_satisfeitos) {
                count_satisfeitos=count_satisfeitos+1;
                numero_satisfeitos.textContent =count_satisfeitos+ "%";
            } else {
                clearInterval(intervalo_satisfeitos);
            }    
        }, 300);
    }
}


function show_resposta(r) {
    var resposta = document.getElementById(r);
    resposta.style.maxHeight = "200px"; // Exibe a resposta ao clicar
}

const comentario = document.getElementById('container_comentarios');
comentario.style.scrollBehavior= "smooth"
let isDown = false;
let startX;
let scrollLeft;

// Inicia o arrasto
const startDragging = (e) => {
    isDown = true;
    comentario.style.cursor = 'grabbing'; // Muda o cursor ao arrastar
    startX = e.pageX || e.touches[0].pageX; // Posição inicial do mouse ou toque
    scrollLeft = comentario.scrollLeft; // Posição inicial do scroll
};

// Para o arrasto
const stopDragging = () => {
    isDown = false;
    comentario.style.cursor = 'grab'; // Restaura o cursor
};

// Realiza o arrasto
const doDragging = (e) => {
    if (!isDown) return; // Sai se não estiver arrastando
    e.preventDefault(); // Previne o comportamento padrão
    const x = e.pageX || e.touches[0].pageX; // Posição atual do mouse ou toque
    const walk = (x - startX) * 3; // Aumenta a velocidade do arrasto
    comentario.scrollLeft = scrollLeft - walk; // Ajusta a posição do scroll
};

function mover_direita(){
    const sfcrollAmount = window.innerWidth *0.88 ; // Quantidade a mover
    const maxScrollLeft = comentario.scrollWidth - comentario.clientWidth; // Máximo scroll possível

    // Verifica se ainda é possível mover para a esquerda
    if (comentario.scrollLeft < maxScrollLeft) {
        comentario.scrollLeft += scrollAmount; // Move para a esquerda
    } else {
        comentario.scrollLeft = 0; // Reseta para o início, se atingir o fim
    }
}
function mover_esquerda(){
    const scrollAmount = window.innerWidth *0.88 ; // Quantidade a mover
    const maxScrollLeft = comentario.scrollWidth - comentario.clientWidth; // Máximo scroll possível

    // Verifica se ainda é possível mover para a esquerda
    if (comentario.scrollLeft < maxScrollLeft) {
        comentario.scrollLeft += -1*scrollAmount; // Move para a esquerda
    } else {
        comentario.scrollLeft = 0; // Reseta para o início, se atingir o fim
    }
}
// Auto-movimento
let direction = 1; // 1 para direita, -1 para esquerda
const speed = 10; // Pixels a mover
/*const moveInterval = setInterval(() => {
const maxScrollLeft = comentario.scrollWidth - comentario.clientWidth; // Máximo scroll possível

    // Move a barra
    comentario.scrollLeft += direction * speed;

    // Verifica se chegou ao final ou início
    if (comentario.scrollLeft >= maxScrollLeft || comentario.scrollLeft <= 0) {
        direction *= -1; // Inverte a direção
    }
}, 1000); // Mover a cada 2 segundos
*/
// Eventos para mouse
comentario.addEventListener('mousedown', startDragging);
comentario.addEventListener('mouseleave', stopDragging);
comentario.addEventListener('mouseup', stopDragging);
comentario.addEventListener('mousemove', doDragging);

// Eventos para toque
comentario.addEventListener('touchstart', startDragging);
comentario.addEventListener('touchend', stopDragging);
comentario.addEventListener('touchmove', doDragging);
const planilhasEl = document.querySelector(".planilhas");
const ladoEls = document.querySelectorAll(".lado");

planilhasEl.addEventListener("pointermove", (ev) => {
  ladoEls.forEach((ladoEl) => {
    const rect = ladoEl.getBoundingClientRect();
    
    // Calculando a posição do mouse dentro do elemento
    ladoEl.style.setProperty("--x", (ev.clientX - rect.left) / rect.width * 100 + "%");
    ladoEl.style.setProperty("--y", (ev.clientY - rect.top) / rect.height * 100 + "%");
  });
});
document.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const renderer2 = new THREE.WebGLRenderer({ alpha: true });
    const container = document.getElementById('espaco_esfera');
    console.log(container.offsetWidth)
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    const esfera = document.getElementById('esfera');
    esfera.appendChild(renderer.domElement);

    const particlesCount = 400;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const radius = 5;

    function updateParticlePositions() {
        for (let i = 0; i < particlesCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const theta = Math.acos(Math.random() * 2 - 1);
            positions[i * 3] = radius * Math.sin(theta) * Math.cos(angle);
            positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(angle);
            positions[i * 3 + 2] = radius * Math.cos(theta);
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    updateParticlePositions();

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffa500,
        size: 0.03,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = radius * 2.0;

    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.x += 0.01;
        particles.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const renderer2 = new THREE.WebGLRenderer({ alpha: true });
    const container = document.getElementById('header-suspenso');
    console.log(container.offsetWidth)
    renderer.setSize(container.offsetWidth+500, container.offsetWidth+300);
    container.appendChild(renderer.domElement);

    const particlesCount = 480;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const radius = 5;

    function updateParticlePositions() {
        for (let i = 0; i < particlesCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const theta = Math.acos(Math.random() * 2 - 1);
            positions[i * 3] = radius * Math.sin(theta) * Math.cos(angle);
            positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(angle);
            positions[i * 3 + 2] = radius * Math.cos(theta);
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    updateParticlePositions();

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffa500,
        size: 0.01,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = radius * 2.0;

    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.x += 0.001;
        particles.rotation.y +=0.001;
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const width = container.offsetWidth+500;
        const height = container.offsetWidth+500;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
});
