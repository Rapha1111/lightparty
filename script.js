let audioContext;
let analyser;
let dataArray;
let source;
var nbrep = 0;
var total = 0;

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
    nbrep++
    total+=level
    moyenne=total/nbrep
    console.log(moyenne)
    if (level>moyenne+10){
        flashDiv.classList.remove('black');
        flashDiv.classList.add('white');
        setTimeout(()=>{
            flashDiv.classList.remove('white');
            flashDiv.classList.add('black');
        }, 10)
    }
}


