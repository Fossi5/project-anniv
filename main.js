// Configuration EmailJS
// IMPORTANT: Remplacez ces valeurs par vos propres clés EmailJS
const EMAILJS_CONFIG = {
    publicKey: "0DNgOwW4lSepWRxCk", // Remplacez par votre clé publique
    serviceId: "service_0j47kxh", // Remplacez par votre service ID
    templateId: "template_bdutsdg" // Remplacez par votre template ID
};

// Initialisation EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

// Éléments DOM
const orderForm = document.getElementById('orderForm');
const submitBtn = document.getElementById('submitBtn');
const confirmation = document.getElementById('confirmation');
const loading = document.getElementById('loading');
const orderSummary = document.getElementById('orderSummary');

// Variable pour stocker les données de commande
let currentOrderData = null;

// Gestionnaire de soumission du formulaire (maintenant pour afficher le résumé)
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Récupération des données du formulaire
    const formData = new FormData(orderForm);
    const orderData = {};
    for (let [key, value] of formData.entries()) {
        orderData[key] = value;
    }
    
    // Récupération du label (nom affiché) de la table
    const tableSelect = document.getElementById('table-select');
    const selectedOption = tableSelect.options[tableSelect.selectedIndex];
    const tableName = selectedOption.textContent; // ex : "Belgique"
    
    // Validation de la table
    if (!orderData.table) {
        alert('Veuillez sélectionner votre table');
        return;
    }
    
    // Calcul du total des boissons commandées
    const drinkQuantities = [];
    let totalDrinks = 0;
    
    // Bières
    const beers = ['Mutzig', 'Castel', 'Orijin', 'Harp', '33', 'Smouth', 'Kadji', 'Isembeck', 'Gin-tonic', 'Desperados', 'jupiler', 'leffe blonde','leffe brune']; 
const beerNames = {
    'Mutzig': 'Mutzig',
    'Castel': 'Castel',
    'Orijin': 'Orijin',
    'Harp': 'Harp',
    '33': '33 Export',
    'Smouth': 'Smouth',
    'Kadji': 'Kadji',
    'Isembeck': 'Isembeck',
    'Gin-tonic': 'Gin Tonic',
    'Desperados': 'Desperados',
    'jupiler': 'Jupiler',
    'leffe blonde': 'Leffe Blonde',
    'leffe brune': 'Leffe Brune'
};

    
    const beerItems = [];
    beers.forEach(beer => {
        const quantity = parseInt(orderData[beer] || 0);
        if (quantity > 0) {
            beerItems.push({ name: beerNames[beer], quantity });
            drinkQuantities.push(`${beerNames[beer]}: ${quantity}`);
            totalDrinks += quantity;
        }
    });
    
    // Softs
    const softs = ['coca', 'sprite', 'orange-juice', 'sparkling-water', 'still-water', 'lemonade'];
    const softNames = {
        'coca': 'Coca-Cola',
        'sprite': 'Sprite',
        'orange-juice': 'Jus d\'orange',
        'sparkling-water': 'Eau pétillante',
        'still-water': 'Eau plate',
        'lemonade': 'Limonade'
    };
    
    const softItems = [];
    softs.forEach(soft => {
        const quantity = parseInt(orderData[soft] || 0);
        if (quantity > 0) {
            softItems.push({ name: softNames[soft], quantity });
            drinkQuantities.push(`${softNames[soft]}: ${quantity}`);
            totalDrinks += quantity;
        }
    });
    
    // Vérification qu'au moins une boisson a été commandée
    if (totalDrinks === 0) {
        alert('Veuillez commander au moins une boisson');
        return;
    }
    
    // Stockage des données pour l'envoi ultérieur
    currentOrderData = {
        table: tableName,
        drinks_list: drinkQuantities.join('\n'),
        total_drinks: totalDrinks,
        timestamp: new Date().toLocaleString('fr-FR'),
        to_email: 'votre-email@exemple.com' // Remplacez par votre email
    };
    
    // Affichage du résumé
    showOrderSummary(tableName, beerItems, softItems, totalDrinks);
});

// Fonction pour afficher le résumé de commande
function showOrderSummary(tableName, beerItems, softItems, totalDrinks) {
    // Mise à jour de la table
    document.getElementById('summaryTable').textContent = tableName;
    
    // Mise à jour des bières
    const beersSection = document.getElementById('beersSummary');
    const beersItemsContainer = document.getElementById('beersItems');
    beersItemsContainer.innerHTML = '';
    
    if (beerItems.length > 0) {
        beersSection.style.display = 'block';
        beerItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            itemElement.innerHTML = `
                <span class="summary-label">${item.name} :</span>
                <span class="summary-quantity">${item.quantity}</span>
            `;
            beersItemsContainer.appendChild(itemElement);
        });
    } else {
        beersSection.style.display = 'none';
    }
    
    // Mise à jour des softs
    const softsSection = document.getElementById('softsSummary');
    const softsItemsContainer = document.getElementById('softsItems');
    softsItemsContainer.innerHTML = '';
    
    if (softItems.length > 0) {
        softsSection.style.display = 'block';
        softItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            itemElement.innerHTML = `
                <span class="summary-label">${item.name} :</span>
                <span class="summary-quantity">${item.quantity}</span>
            `;
            softsItemsContainer.appendChild(itemElement);
        });
    } else {
        softsSection.style.display = 'none';
    }
    
    // Mise à jour du total
    document.getElementById('totalDrinks').textContent = totalDrinks;
    
    // Affichage de la modal
    orderSummary.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Empêche le scroll en arrière-plan
}

// Fonction pour fermer le résumé
function closeOrderSummary() {
    orderSummary.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Fonction pour confirmer et envoyer la commande
async function confirmOrder() {
    if (!currentOrderData) {
        alert('Erreur: données de commande manquantes');
        return;
    }
    
    // Fermer la modal de résumé
    closeOrderSummary();
    
    // Affichage du loading
    loading.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        // Envoi de l'email via EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            currentOrderData
        );
        
        console.log('Email envoyé avec succès:', response);
        
        // Masquer le loading
        loading.classList.add('hidden');
        
        // Afficher la confirmation
        confirmation.classList.remove('hidden');
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        
        // Masquer le loading
        loading.classList.add('hidden');
        submitBtn.disabled = false;
        
        // Afficher l'erreur
        alert('Erreur lors de l\'envoi de la commande. Veuillez réessayer.');
    }
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
    orderForm.reset();
    confirmation.classList.add('hidden');
    submitBtn.disabled = false;
    currentOrderData = null;
    
    // Réinitialiser les styles des inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.style.borderColor = 'var(--border-light)';
        input.style.backgroundColor = 'var(--white)';
    });
    
    document.getElementById('table-select').style.borderColor = 'var(--border-light)';
    document.getElementById('table-select').style.backgroundColor = 'var(--white)';
}

// Animation pour les inputs de quantité
document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
        if (this.value > 0) {
            this.style.borderColor = 'var(--gold)';
            this.style.backgroundColor = '#fffbf0';
        } else {
            this.style.borderColor = 'var(--border-light)';
            this.style.backgroundColor = 'var(--white)';
        }
    });
});

// Animation pour le select de table
document.getElementById('table-select').addEventListener('change', function() {
    if (this.value) {
        this.style.borderColor = 'var(--primary-blue)';
        this.style.backgroundColor = '#f0f9ff';
    } else {
        this.style.borderColor = 'var(--border-light)';
        this.style.backgroundColor = 'var(--white)';
    }
});

// Fermer la modal en cliquant à l'extérieur
orderSummary.addEventListener('click', function(e) {
    if (e.target === orderSummary) {
        closeOrderSummary();
    }
});

// Fermer la modal avec la touche Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !orderSummary.classList.contains('hidden')) {
        closeOrderSummary();
    }
});

// Message d'instructions pour EmailJS
console.log(`
🎉 Site de commande pour votre événement configuré !

📧 Pour activer l'envoi d'emails :
1. Créez un compte sur https://www.emailjs.com/
2. Configurez un service email (Gmail, Outlook, etc.)
3. Créez un template avec ces variables :
   - {{table}} : Table sélectionnée
   - {{drinks_list}} : Liste des boissons
   - {{total_drinks}} : Nombre total de boissons
   - {{timestamp}} : Date/heure de la commande

4. Remplacez les valeurs dans EMAILJS_CONFIG (main.js) :
   - publicKey : Votre clé publique EmailJS
   - serviceId : ID de votre service
   - templateId : ID de votre template

🚀 Le site est prêt pour être hébergé sur GitHub Pages !
`);

// Vérification de la configuration EmailJS
if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
    console.warn('⚠️ N\'oubliez pas de configurer EmailJS dans main.js !');
}