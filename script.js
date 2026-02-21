document.addEventListener('DOMContentLoaded', function() {

    // ===== Popup custom =====
    const popupOverlay = document.getElementById('popup-overlay');
    const popupTitle   = document.getElementById('popup-title');
    const popupIcon    = document.getElementById('popup-icon');
    const popupClose   = document.getElementById('popup-close');

    function showPopup(message, icon) {
        popupTitle.textContent = message;
        popupIcon.textContent  = icon || '⚠️';
        popupOverlay.setAttribute('aria-hidden', 'false');
        popupOverlay.classList.add('active');
        popupClose.focus();
    }

    function closePopup() {
        popupOverlay.classList.remove('active');
        popupOverlay.setAttribute('aria-hidden', 'true');
    }

    if (popupClose) popupClose.addEventListener('click', closePopup);
    if (popupOverlay) popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) closePopup();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closePopup();
    });

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
    let chartInstanceEmlyon = null;

    // Fonction pour calculer le score emlyon
    function calculateEmlyon() {
        const tagemage = parseFloat(document.getElementById('tagemage').value);
        const dossier = parseFloat(document.getElementById('dossier').value);
        
        // Coefficients fixes pour emlyon
        const coefTagemage = 4;
        const coefDossier = 6;

        // Validation
        if (isNaN(tagemage) || isNaN(dossier)) {
            showPopup('Veuillez remplir tous les champs avec des valeurs numériques valides.');
            return;
        }

        if (tagemage < 0 || tagemage > 600) {
            showPopup('Le score TAGE MAGE doit être entre 0 et 600.');
            return;
        }

        if (dossier < 0 || dossier > 20) {
            showPopup('La note de dossier doit être entre 0 et 20.');
            return;
        }

        // Formule : TAGE/600 * 4 * 20 + Dossier * 6
        const scoreFinal = (tagemage / 600) * 4 * 20 + dossier * 6;

        var seuilSlider = document.getElementById('emlyon-seuil-slider');
        var seuil = seuilSlider ? parseInt(seuilSlider.value, 10) : 124;
        var estAdmissible = scoreFinal >= seuil;

        // Affichage du résultat
        finalScoreSpan.textContent = scoreFinal.toFixed(2);
        finalScoreSpan.className = estAdmissible ? 'score-value admissible' : 'score-value non-admissible';

        var contributionTagemage = (tagemage / 600) * 4 * 20;
        var contributionDossier = dossier * 6;

        detailsDiv.innerHTML = `
            <p><strong>TAGE MAGE :</strong> ${tagemage}/600 × 4 × 20 = ${contributionTagemage.toFixed(2)}</p>
            <p><strong>Dossier :</strong> ${dossier}/20 × 6 = ${contributionDossier.toFixed(2)}</p>
            <p><strong>Score final :</strong> ${scoreFinal.toFixed(2)}</p>
            <p class="admissibilite ${estAdmissible ? 'admissible' : 'non-admissible'}">
                <strong>${estAdmissible ? '✓ Admissible' : '✗ Non admissible'}</strong> (seuil choisi : ${seuil})
            </p>
        `;

        resultDiv.style.display = 'block';
        resultDivGrenoble.style.display = 'none';
        document.getElementById('result-section').style.display = 'block';

        updateChartEmlyon(tagemage, dossier, seuil, estAdmissible);
    }

    // Graphique emlyon : frontière TAGE min = f(dossier) pour un seuil donné
    function updateChartEmlyon(tagemage, dossier, seuil, estAdmissible) {
        var canvas = document.getElementById('admissibility-chart-emlyon');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (chartInstanceEmlyon) {
            chartInstanceEmlyon.destroy();
            chartInstanceEmlyon = null;
        }

        var seuilPoints = [];
        var zoneAdmissibleBas = [];
        var zoneAdmissibleHaut = [];
        for (var d = 8; d <= 20; d += 0.25) {
            var tagemageMin = (seuil - 6 * d) * 7.5;
            if (tagemageMin < 0) tagemageMin = 0;
            if (tagemageMin > 600) tagemageMin = 600;
            seuilPoints.push({ x: d, y: tagemageMin });
            zoneAdmissibleBas.push({ x: d, y: tagemageMin });
            zoneAdmissibleHaut.push({ x: d, y: 600 });
        }

        chartInstanceEmlyon = new Chart(ctx, {
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
                        label: 'Seuil ' + seuil,
                        data: seuilPoints,
                        borderColor: '#c084fc',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false,
                        tension: 0,
                        order: 2
                    },
                    {
                        label: 'Votre score',
                        data: [{ x: dossier, y: tagemage }],
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
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    title: {
                        display: true,
                        text: 'Aire d\'admissibilité - emlyon Business School (seuil ' + seuil + ')',
                        font: { family: 'Outfit', size: 16, weight: 'bold' },
                        color: 'rgba(255,255,255,0.9)',
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { font: { family: 'Outfit' }, color: 'rgba(255,255,255,0.85)' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 3) {
                                    return 'Dossier: ' + context.parsed.x.toFixed(2) + '/20, TAGE MAGE: ' + context.parsed.y.toFixed(0) + '/600';
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
                            text: 'Note de dossier (sur 20)',
                            font: { family: 'Outfit', size: 14, weight: 'bold' },
                            color: 'rgba(255,255,255,0.85)'
                        },
                        min: 8,
                        max: 20,
                        ticks: { stepSize: 2, font: { family: 'Outfit' }, color: 'rgba(255,255,255,0.7)' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Score TAGE MAGE (sur 600)',
                            font: { family: 'Outfit', size: 14, weight: 'bold' },
                            color: 'rgba(255,255,255,0.85)'
                        },
                        min: 0,
                        max: 600,
                        ticks: { stepSize: 100, font: { family: 'Outfit' }, color: 'rgba(255,255,255,0.7)' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
        setTimeout(function() {
            if (chartInstanceEmlyon) chartInstanceEmlyon.resize();
        }, 50);
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
            showPopup('Veuillez remplir tous les champs avec des valeurs numériques valides.');
            return;
        }

        if (tagemage < 0 || tagemage > 600) {
            showPopup('Le score TAGE MAGE doit être entre 0 et 600.');
            return;
        }

        if (toeic < 0 || toeic > 990) {
            showPopup('Le score TOEIC doit être entre 0 et 990.');
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

        resultDiv.style.display = 'none';
        resultDivGrenoble.style.display = 'block';
        document.getElementById('result-section').style.display = 'block';
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
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Aire d\'admissibilité - Grenoble École de Management',
                        font: { family: 'Outfit', size: 16, weight: 'bold' },
                        color: 'rgba(255,255,255,0.9)',
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { font: { family: 'Outfit' }, color: 'rgba(255,255,255,0.85)' }
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
                            font: { family: 'Outfit', size: 14, weight: 'bold' },
                            color: 'rgba(255,255,255,0.85)'
                        },
                        min: 0,
                        max: 990,
                        ticks: { stepSize: 100, font: { family: 'Outfit' }, color: 'rgba(255,255,255,0.7)' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Score TAGE MAGE (sur 600)',
                            font: { family: 'Outfit', size: 14, weight: 'bold' },
                            color: 'rgba(255,255,255,0.85)'
                        },
                        min: 0,
                        max: 600,
                        ticks: { stepSize: 100, font: { family: 'Outfit' }, color: 'rgba(255,255,255,0.7)' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
        // Redimensionner le graphique une fois le conteneur visible (fix affichage)
        setTimeout(function() {
            if (chartInstance) chartInstance.resize();
        }, 50);
    }

    const homePage = document.getElementById('home-page');
    const calculatorView = document.getElementById('calculator-view');
    const pageTitle = document.getElementById('page-title');

    function showHome() {
        homePage.style.display = 'block';
        calculatorView.style.display = 'none';
        pageTitle.textContent = 'Accueil';
        document.querySelectorAll('.nav-item').forEach(function(b) {
            b.classList.remove('active');
            if (b.getAttribute('data-page') === 'home') b.classList.add('active');
        });
    }

    function showCalculator(school) {
        homePage.style.display = 'none';
        calculatorView.style.display = 'grid';
        pageTitle.textContent = 'Tableau de bord';
        schoolSelect.value = school;
        schoolSelect.dispatchEvent(new Event('change'));
        document.querySelectorAll('.nav-item').forEach(function(b) {
            b.classList.remove('active');
            if (b.getAttribute('data-school') === school) b.classList.add('active');
        });
    }

    // Sidebar nav
    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.getAttribute('data-page') === 'home') {
                showHome();
            } else {
                showCalculator(this.getAttribute('data-school'));
            }
        });
    });

    // Cartes d'accueil : clic ouvre le calculateur
    document.querySelectorAll('.home-card[data-goto]').forEach(function(card) {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            showCalculator(this.getAttribute('data-goto'));
        });
    });

    // Gestion du changement d'école (dans la vue calculateur)
    const cardInfoEmlyon = document.getElementById('card-info-emlyon');
    const cardInfoGem = document.getElementById('card-info-gem');
    const resultSection = document.getElementById('result-section');

    schoolSelect.addEventListener('change', function() {
        const selectedSchool = schoolSelect.value;
        document.querySelectorAll('.nav-item').forEach(function(b) {
            b.classList.toggle('active', b.getAttribute('data-school') === selectedSchool);
        });
        // Masquer et réinitialiser la carte résultat lors du changement d'école
        if (resultSection) resultSection.style.display = 'none';
        resultDiv.style.display = 'none';
        resultDivGrenoble.style.display = 'none';
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        if (chartInstanceEmlyon) {
            chartInstanceEmlyon.destroy();
            chartInstanceEmlyon = null;
        }
        if (selectedSchool === 'emlyon') {
            emlyonCalculator.style.display = 'block';
            grenobleCalculator.style.display = 'none';
            if (cardInfoEmlyon) cardInfoEmlyon.style.display = 'block';
            if (cardInfoGem) cardInfoGem.style.display = 'none';
        } else if (selectedSchool === 'grenoble') {
            emlyonCalculator.style.display = 'none';
            grenobleCalculator.style.display = 'block';
            if (cardInfoEmlyon) cardInfoEmlyon.style.display = 'none';
            if (cardInfoGem) cardInfoGem.style.display = 'block';
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

    // emlyon : tableau TAGE min selon note de dossier + seuil ajustable
    const emlyonSeuilSlider = document.getElementById('emlyon-seuil-slider');
    const emlyonSeuilValue = document.getElementById('emlyon-seuil-value');
    const emlyonTagemageTbody = document.getElementById('emlyon-tagemage-tbody');

    function updateEmlyonTagemageTable() {
        if (!emlyonTagemageTbody) return;
        const seuil = parseInt(emlyonSeuilSlider ? emlyonSeuilSlider.value : 124, 10);
        if (emlyonSeuilValue) emlyonSeuilValue.textContent = seuil;
        var rows = '';
        for (var d = 8; d <= 20; d++) {
            var tagemageMin = (seuil - 6 * d) * 7.5;
            if (tagemageMin < 0) tagemageMin = 0;
            if (tagemageMin > 600) tagemageMin = 600;
            tagemageMin = Math.ceil(tagemageMin);
            rows += '<tr><td>' + d + '</td><td>' + tagemageMin + '</td></tr>';
        }
        emlyonTagemageTbody.innerHTML = rows;
    }

    if (emlyonSeuilSlider) {
        emlyonSeuilSlider.addEventListener('input', updateEmlyonTagemageTable);
    }
    updateEmlyonTagemageTable();

    // Icône "défiler" : afficher quand le contenu est scrollable, masquer en bas de scroll
    const scrollHintCalc = document.getElementById('scroll-hint-calc');
    const scrollHintInfo = document.getElementById('scroll-hint-info');

    function updateScrollHint(scrollEl, hintEl) {
        if (!scrollEl || !hintEl) return;
        var canScroll = scrollEl.scrollHeight > scrollEl.clientHeight;
        var atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 8;
        hintEl.classList.toggle('visible', canScroll && !atBottom);
        hintEl.setAttribute('aria-hidden', !(canScroll && !atBottom));
    }

    function updateAllScrollHints() {
        var calcEl = schoolSelect.value === 'emlyon' ? emlyonCalculator : grenobleCalculator;
        var infoEl = schoolSelect.value === 'emlyon' ? cardInfoEmlyon : cardInfoGem;
        if (calcEl && scrollHintCalc) updateScrollHint(calcEl, scrollHintCalc);
        if (infoEl && scrollHintInfo) updateScrollHint(infoEl, scrollHintInfo);
    }

    function setupScrollListeners() {
        var calcEl = schoolSelect.value === 'emlyon' ? emlyonCalculator : grenobleCalculator;
        var infoEl = schoolSelect.value === 'emlyon' ? cardInfoEmlyon : cardInfoGem;
        function onScroll() { updateAllScrollHints(); }
        if (calcEl) { calcEl.removeEventListener('scroll', onScroll); calcEl.addEventListener('scroll', onScroll); }
        if (infoEl) { infoEl.removeEventListener('scroll', onScroll); infoEl.addEventListener('scroll', onScroll); }
        updateAllScrollHints();
    }

    if (scrollHintCalc && scrollHintInfo) {
        setupScrollListeners();
        window.addEventListener('resize', function() {
            setTimeout(updateAllScrollHints, 100);
        });
        schoolSelect.addEventListener('change', function() {
            setTimeout(setupScrollListeners, 50);
        });
    }

    // Page d'accueil par défaut
    showHome();
});



