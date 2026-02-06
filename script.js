document.addEventListener('DOMContentLoaded', function() {
    const schoolSelect = document.getElementById('school');
    const calculateBtn = document.getElementById('calculate-btn');
    const calculateBtnGrenoble = document.getElementById('calculate-btn-grenoble');
    const resultDiv = document.getElementById('result');
    const resultDivGrenoble = document.getElementById('result-grenoble');
    const finalScoreSpan = document.getElementById('final-score');
    const finalScoreSpanGrenoble = document.getElementById('final-score-grenoble');
    const detailsDiv = document.getElementById('details');
    const detailsDivGrenoble = document.getElementById('details-grenoble');
    const emlyonCalculator = document.getElementById('emlyon-calculator');
    const grenobleCalculator = document.getElementById('grenoble-calculator');
    
    let chartInstance = null;

    // Fonction pour calculer le score emlyon
    function calculateEmlyon() {
        const tagemage = parseFloat(document.getElementById('tagemage').value);
        const dossier = parseFloat(document.getElementById('dossier').value);
        
        // Coefficients fixes pour emlyon
        const coefTagemage = 4;
        const coefDossier = 6;

        // Validation
        if (isNaN(tagemage) || isNaN(dossier)) {
            alert('Veuillez remplir tous les champs avec des valeurs numériques valides.');
            return;
        }

        if (tagemage < 0 || tagemage > 600) {
            alert('Le score TAGE MAGE doit être entre 0 et 600.');
            return;
        }

        if (dossier < 0 || dossier > 20) {
            alert('La note de dossier doit être entre 0 et 20.');
            return;
        }

        // Formule : TAGE/600 * 4 * 20 + Dossier * 6
        // Simplifié : (TAGE * 80) / 600 + Dossier * 6
        const scoreFinal = (tagemage / 600) * 4 * 20 + dossier * 6;

        // Vérification de l'admissibilité (seuil : 124)
        const seuilAdmissibilite2025 = 124;
        const seuilAdmissibilite2026 = 126;
        const seuilAdmissibilite2026bis = 128;
        const estAdmissible2025 = scoreFinal >= seuilAdmissibilite2025;
        const estAdmissible2026 = scoreFinal >= seuilAdmissibilite2026;
        const estAdmissible2026bis = scoreFInal >= seuilAdmissibilite2026bis;

        // Affichage du résultat
        finalScoreSpan.textContent = scoreFinal.toFixed(2);
        
        // Style pour l'admissibilité
        finalScoreSpan.className = estAdmissible2025 ? 'score-value admissible' : 'score-value non-admissible';
        
        // Calculs pour l'affichage détaillé
        const contributionTagemage = (tagemage / 600) * 4 * 20;
        const contributionDossier = dossier * 6;
        
        detailsDiv.innerHTML = `
            <p><strong>TAGE MAGE :</strong> ${tagemage}/600 × 4 × 20 = ${contributionTagemage.toFixed(2)}</p>
            <p><strong>Dossier :</strong> ${dossier}/20 × 6 = ${contributionDossier.toFixed(2)}</p>
            <p><strong>Score final :</strong> ${scoreFinal.toFixed(2)}</p>
            <p class="admissibilite ${estAdmissible2025 ? 'admissible' : 'non-admissible'}">
                <strong>2025 : ${estAdmissible2025 ? '✓ Admissible' : '✗ Non admissible'}</strong> (seuil : ${seuilAdmissibilite2025})
            </p>
            <p class="admissibilite ${estAdmissible2026 ? 'admissible' : 'non-admissible'}">
                <strong>2026 (prévisionnel) : ${estAdmissible2026 ? '✓ Admissible' : '✗ Non admissible'}</strong> (seuil : ${seuilAdmissibilite2026})
            </p>
                        <p class="admissibilite ${estAdmissible2026bis ? 'admissible' : 'non-admissible'}">
                <strong>2026 (prévisionnel) : ${estAdmissible2026bis ? '✓ Admissible' : '✗ Non admissible'}</strong> (seuil : ${seuilAdmissibilite2026bis})
            </p>
        `;

        resultDiv.style.display = 'block';
    }

    // Fonction pour calculer le score Grenoble
    function calculateGrenoble() {
        const tagemage = parseFloat(document.getElementById('tagemage-grenoble').value);
        const toeic = parseFloat(document.getElementById('toeic').value);
        
        // Coefficients fixes pour Grenoble
        const coefTagemage = 8;
        const coefToeic = 12;

        // Validation
        if (isNaN(tagemage) || isNaN(toeic)) {
            alert('Veuillez remplir tous les champs avec des valeurs numériques valides.');
            return;
        }

        if (tagemage < 0 || tagemage > 600) {
            alert('Le score TAGE MAGE doit être entre 0 et 600.');
            return;
        }

        if (toeic < 0 || toeic > 990) {
            alert('Le score TOEIC doit être entre 0 et 990.');
            return;
        }

        // Normalisation des notes
        const tagemageNormalized = tagemage / 600;
        const toeicNormalized = toeic / 990;

        // Calcul de la moyenne pondérée
        const totalCoef = coefTagemage + coefToeic;
        const moyennePonderee = (tagemageNormalized * coefTagemage + toeicNormalized * coefToeic) / totalCoef;

        // Score final sur 20
        const scoreFinal = moyennePonderee * 20;

        // Vérification de l'admissibilité (seuil : 10/20)
        const seuilAdmissibilite = 10;
        const estAdmissible = scoreFinal >= seuilAdmissibilite;

        // Affichage du résultat
        finalScoreSpanGrenoble.textContent = scoreFinal.toFixed(2);
        
        // Style pour l'admissibilité
        finalScoreSpanGrenoble.className = estAdmissible ? 'score-value admissible' : 'score-value non-admissible';
        
        // Calculs pour l'affichage détaillé
        const contributionTagemage = (tagemageNormalized * coefTagemage / totalCoef) * 20;
        const contributionToeic = (toeicNormalized * coefToeic / totalCoef) * 20;
        
        detailsDivGrenoble.innerHTML = `
            <p><strong>TAGE MAGE :</strong> ${tagemage}/600 (${(tagemageNormalized * 100).toFixed(2)}%) - Coeff. ${coefTagemage}</p>
            <p><strong>TOEIC :</strong> ${toeic}/990 (${(toeicNormalized * 100).toFixed(2)}%) - Coeff. ${coefToeic}</p>
            <p><strong>Moyenne pondérée :</strong> ${moyennePonderee.toFixed(4)}</p>
            <p><strong>Score final :</strong> ${scoreFinal.toFixed(2)}/20</p>
            <p class="admissibilite ${estAdmissible ? 'admissible' : 'non-admissible'}">
                <strong>${estAdmissible ? '✓ Admissible' : '✗ Non admissible'}</strong> (seuil : ${seuilAdmissibilite}/20)
            </p>
        `;

        // Création/mise à jour du graphique
        updateChart(tagemage, toeic, estAdmissible);

        resultDivGrenoble.style.display = 'block';
    }

    // Fonction pour créer/mettre à jour le graphique
    function updateChart(tagemage, toeic, estAdmissible) {
        const ctx = document.getElementById('admissibility-chart').getContext('2d');
        
        // Destruction du graphique précédent s'il existe
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Calcul de la ligne de seuil (10/20)
        // Moyenne pondérée >= 10/20 = 0.5
        // (TAGE/600 * 8 + TOEIC/990 * 12) / 20 >= 0.5
        // TAGE/600 * 8 + TOEIC/990 * 12 >= 10
        // TAGE >= (10 - TOEIC/990 * 12) * 600 / 8
        // TAGE >= (10 - TOEIC/990 * 12) * 75
        // TAGE >= 750 - TOEIC * 900/990
        // TAGE >= 750 - TOEIC * 0.90909...
        const seuilPoints = [];
        const zoneAdmissibleHaut = [];
        const zoneAdmissibleBas = [];
        
        for (let t = 0; t <= 990; t += 5) {
            // Calcul du TAGE minimum requis pour être admissible
            let tagemageSeuil = (10 - (t / 990) * 12) * 75;
            // Limiter entre 0 et 600
            tagemageSeuil = Math.max(0, Math.min(600, tagemageSeuil));
            seuilPoints.push({ x: t, y: tagemageSeuil });
            zoneAdmissibleHaut.push({ x: t, y: 600 });
            zoneAdmissibleBas.push({ x: t, y: tagemageSeuil });
        }

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Zone non admissible',
                        data: zoneAdmissibleBas,
                        backgroundColor: 'rgba(220, 53, 69, 0.2)',
                        borderColor: 'transparent',
                        pointRadius: 0,
                        fill: 'origin',
                        tension: 0,
                        order: 0
                    },
                    {
                        label: 'Zone admissible',
                        data: zoneAdmissibleHaut,
                        backgroundColor: 'rgba(40, 167, 69, 0.3)',
                        borderColor: 'transparent',
                        pointRadius: 0,
                        fill: '-1',
                        tension: 0,
                        order: 1
                    },
                    {
                        label: 'Seuil 10/20',
                        data: seuilPoints,
                        borderColor: '#764ba2',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false,
                        tension: 0,
                        order: 2
                    },
                    {
                        label: 'Votre score',
                        data: [{ x: toeic, y: tagemage }],
                        type: 'scatter',
                        backgroundColor: estAdmissible ? '#28a745' : '#dc3545',
                        borderColor: estAdmissible ? '#155724' : '#721c24',
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        borderWidth: 2,
                        order: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Aire d\'admissibilité - Grenoble École de Management',
                        font: {
                            family: 'Lato',
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Lato'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 3) {
                                    return `TAGE MAGE: ${context.parsed.y.toFixed(0)}/600, TOEIC: ${context.parsed.x.toFixed(0)}/990`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Score TOEIC (sur 990)',
                            font: {
                                family: 'Lato',
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        min: 0,
                        max: 990,
                        ticks: {
                            stepSize: 100,
                            font: {
                                family: 'Lato'
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Score TAGE MAGE (sur 600)',
                            font: {
                                family: 'Lato',
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        min: 0,
                        max: 600,
                        ticks: {
                            stepSize: 100,
                            font: {
                                family: 'Lato'
                            }
                        }
                    }
                }
            }
        });
    }

    // Gestion du changement d'école
    schoolSelect.addEventListener('change', function() {
        const selectedSchool = schoolSelect.value;
        
        if (selectedSchool === 'emlyon') {
            emlyonCalculator.style.display = 'block';
            grenobleCalculator.style.display = 'none';
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        } else if (selectedSchool === 'grenoble') {
            emlyonCalculator.style.display = 'none';
            grenobleCalculator.style.display = 'block';
        }
    });

    // Gestion du bouton de calcul
    calculateBtn.addEventListener('click', function() {
        calculateEmlyon();
    });

    calculateBtnGrenoble.addEventListener('click', function() {
        calculateGrenoble();
    });

    // Permettre le calcul avec la touche Entrée
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const selectedSchool = schoolSelect.value;
            if (selectedSchool === 'emlyon') {
                calculateBtn.click();
            } else if (selectedSchool === 'grenoble') {
                calculateBtnGrenoble.click();
            }
        }
    });

    // Afficher emlyon par défaut
    emlyonCalculator.style.display = 'block';
});


