let audioContext;
let analyser;
let dataArray;
let source;
var nbrep = 0;
var total = 0;
var color="white";
var lastval=[]


// Fonction pour initialiser le microphone et les composants audio
async function initializeMicrophone() {
    try {
        // Demande l'accès au microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Crée un contexte audio
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Crée une source audio depuis le flux du microphone
        source = audioContext.createMediaStreamSource(stream);

        // Crée un analyseur pour analyser les données audio
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        // Connecte la source audio à l'analyseur
        source.connect(analyser);

        // Crée un tableau pour stocker les données de fréquence
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        setInterval(()=>{
            const level = getMicrophoneLevel();
            main(level)
            //console.log('Niveau sonore actuel:', level);
        }, 1)
        console.log('Microphone initialisé');
    } catch (err) {
        console.error('Erreur lors de l\'accès au microphone:', err);
    }
}

// Fonction pour récupérer le niveau sonore actuel
function getMicrophoneLevel() {
    if (!analyser || !dataArray) {
        console.error('Le microphone n\'est pas initialisé. Appelez initializeMicrophone() d\'abord.');
        return null;
    }

    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    // Calcule le niveau moyen
    const average = sum / dataArray.length;
    return average;
}

function main(level){
    flashDiv=document.getElementById("flash")
    flashDiv.hidden=false
    lastval.push(level)
    if (lastval.length>1000){
        lastval.shift()
    }
    let somme = lastval.reduce((accumulateur, valeurCourante) => accumulateur + valeurCourante, 0);
    let moyenne = somme / lastval.length;
    if (level>(moyenne*1.1)){
        flashDiv.classList.remove('black');
        flashDiv.classList.add(color);
        if (lastval.length>250){
            lastval.splice(0, 50);
        }
    } else {
        flashDiv.classList.remove(color);
        flashDiv.classList.add('black');

    }
}
function changeColor(col, element) {
    color = col;
    let buttons = document.querySelectorAll('.color-buttons button');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}