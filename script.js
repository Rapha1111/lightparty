let audioContext;
let analyser;
let dataArray;
let source;
let lowpassFilter;
let level = 0;

var nbrep = 0;
var total = 0;
var color="white";
var lastval=[]
var maxfz=21000
var colors=["white", "violet", "red", "blue"]
var actcolo = -1;
var lastclap=0

// Fonction pour initialiser le microphone et les composants audio
async function initializeMicrophone() {
    try {
        // Demande l'accès au microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Crée un contexte audio
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Crée une source audio depuis le flux du microphone
        source = audioContext.createMediaStreamSource(stream);

        // Crée un filtre passe-bas pour les fréquences inférieures à 600Hz
        if (maxfz == 21000){
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            source.connect(analyser);
        } else {
            lowpassFilter = audioContext.createBiquadFilter();
            lowpassFilter.type = 'lowpass';
            lowpassFilter.frequency.value = maxfz;

            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            source.connect(lowpassFilter);
            lowpassFilter.connect(analyser);
        }
        

        // Crée un tableau pour stocker les données de fréquence
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        setInterval(()=>{
            const level = getMicrophoneLevel();
            main(level)
            //console.log('Niveau sonore actuel:', level);
        }, 1)
        console.log('Microphone initialisé avec filtre passe-bas');
        
        // Démarre la mise à jour du niveau sonore en temps réel
        //updateLevel();
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

function updateLevel() {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    // Calcule le niveau moyen
    level = sum / dataArray.length;
    main(level)
    // Met à jour le niveau sonore continuellement
    requestAnimationFrame(updateLevel);
}

function main(lvl){
    flashDiv=document.getElementById("flash")
    flashDiv.hidden=false
    lastval.push(lvl)
    if (lastval.length>1000){
        lastval.shift()
    }
    let somme = lastval.reduce((accumulateur, valeurCourante) => accumulateur + valeurCourante, 0);
    let moyenne = somme / lastval.length;
    if (lvl>(moyenne*1.1)){
        flashDiv.classList.remove('black');
        flashDiv.classList.add(color);
        if (lastval.length>250){
            lastval.splice(0, 50);
        }
        lastclap=Date.now()
    } else {
        if (lvl<(moyenne*0.9)){
            if (lastval.length>250){
                lastval.splice(0, 50);
            }
        }

        flashDiv.classList.remove(color);
        flashDiv.classList.add('black');
        if (actcolo!=-1 && Date.now()>lastclap+1000){
            actcolo++
            actcolo%=4
            color=colors[actcolo]
            lastclap=Date.now()
        }

    }
}
function changeColor(col, element) {
    color = col;
    actcolo=-1;
    let buttons = document.querySelectorAll('.color-buttons button');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function autocolo(element){
    actcolo=0
    let buttons = document.querySelectorAll('.color-buttons button');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function updateSliderValue(value) {
    document.getElementById('slider-value').textContent = value;
    maxfz=value
}