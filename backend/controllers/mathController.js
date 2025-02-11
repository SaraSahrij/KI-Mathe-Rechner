const UserInteraction = require('../models/userInteraction');
const axios = require('axios');

// Function to categorize the problem
function categorizeProblem(problem) {
    if (/[xyz]/i.test(problem)) return 'Algebra';  // Prioritize algebra if variables are present
    if (/x\^2|quadratisch|gleichung/i.test(problem)) return 'Quadratische Gleichung';
    if (/(\*|mal|multiplikation)/i.test(problem)) return 'Multiplikation';
    if (/(÷|\/|geteilt)/i.test(problem)) return 'Division';
    if (/(\+|plus|addieren)/i.test(problem)) return 'Addition';
    if (/(-|minus|subtrahieren)/i.test(problem)) return 'Subtraktion';
    if (/(\^|hoch|potenzieren)/i.test(problem)) return 'Potenzierung';
    if (/wurzel|sqrt|radizieren/i.test(problem)) return 'Quadratwurzel';
    if (/log|logarithmus/i.test(problem)) return 'Logarithmen';
    if (/sin|cos|tan|trigonometrie/i.test(problem)) return 'Trigonometrie';
    if (/matrix|determinante|inverse/i.test(problem)) return 'Lineare Algebra';
    if (/funktion|funktionale/i.test(problem)) return 'Funktionen';
    if (/integration|integral/i.test(problem)) return 'Integration';
    if (/differential|ableitung|derivative/i.test(problem)) return 'Differenzierung';
    if (/wahrscheinlichkeit|wahrscheinlichkeitsrechnung/i.test(problem)) return 'Wahrscheinlichkeit';
    if (/statistik|statistic/i.test(problem)) return 'Statistiken';
    if (/vektor|vektorprodukt|skalar/i.test(problem)) return 'Vektoren';
    if (/geometrie|flache|winkel/i.test(problem)) return 'Geometrie';
    if (/zahlentheorie|primzahlen/i.test(problem)) return 'Zahlentheorie';
    if (/komplexe zahl|imaginary|komplex/i.test(problem)) return 'komplexe Zahlen';
    if (/reihe|folge|serien/i.test(problem)) return 'Serie';
    if (/ungleichung|inequality/i.test(problem)) return 'Ungleichheiten';
    if (/graph|graphentheorie/i.test(problem)) return 'Graphentheorie';

    return 'null';
}

// Funktion zur Analyse der Benutzerfragen und zur Rückgabe kategoriebasierter Statistiken
async function analyzeUserPerformance(userId) {
    try {
        const userInteractions = await UserInteraction.findOne({userId});
        if (!userInteractions || userInteractions.interactions.length === 0) {
            return {categories: []};
        }

        const categoryCounts = {};
        userInteractions.interactions.forEach(interaction => {
            const category = interaction.category || 'unknown';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        const totalInteractions = userInteractions.interactions.length;

        const categories = Object.keys(categoryCounts).map(category => {
            return {
                name: category,
                percentage: Math.round((categoryCounts[category] / totalInteractions) * 100)
            };
        });

        return {categories};
    } catch (error) {
        console.error('Error analyzing user performance:', error);
        return {error: "An error occurred during user analysis"};
    }
}

// Generiere Empfehlungen basierend auf Kategorien
async function generateRecommendations(categories) {
    try {
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful assistant that suggests books based on mathematical topics.'
            },
            {
                role: 'user',
                content: `Please provide a JSON array of book recommendations for each of the following mathematical topics: ${categories.map(c => c.name).join(', ')}. 
                Use Google Scholar to find the books!
                Each object in the array should contain the category, book title, and link, in the format: 
                {"category": "Category Name", "title": "Book Title"}`
            }
        ];

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        let recommendationsText = response.data.choices[0].message.content.trim();
        recommendationsText = recommendationsText.replace(/```json/g, '').replace(/```/g, '').trim();

        const recommendationsArray = JSON.parse(recommendationsText);

        // Group recommendations by category
        return recommendationsArray.reduce((acc, recommendation) => {
            let categoryGroup = acc.find(c => c.category === recommendation.category);
            if (!categoryGroup) {
                categoryGroup = {category: recommendation.category, links: []};
                acc.push(categoryGroup);
            }
            categoryGroup.links.push({title: recommendation.title, link: recommendation.link});
            return acc;
        }, []);

    } catch (error) {
        return [];
    }
}

// Solving the math problem and storing the interaction
exports.solveMathProblem = async (req, res) => {
    const { problem, context } = req.body;
    const userId = req.user.id;

    if (!problem) {
        return res.status(400).json({ error: 'Bitte geben Sie eine mathematische Frage ein.' });
    }

    const problemCategory = categorizeProblem(problem);

    const messages = [
        {
            role: 'system',
            content: 'Du bist ein Mathematik-Assistent. Gib klare, gut strukturierte und sauber formatierte Schritt-für-Schritt-Lösungen zu mathematischen Problemen an.'
        },
        ...(context || []),
        { role: 'user', content: `Bitte löse dieses mathematische Problem Schritt für Schritt: ${problem}` }
    ];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        const solution = response.data.choices[0].message.content.trim();

        // Interaktion mit Kategorie speichern
        const userInteraction = await UserInteraction.findOne({ userId });
        if (userInteraction) {
            userInteraction.interactions.push({ problem, solution, category: problemCategory });
            await userInteraction.save();
        } else {
            await new UserInteraction({ userId, interactions: [{ problem, solution, category: problemCategory }] }).save();
        }

        // Leistung analysieren und Empfehlungen generieren
        const { categories } = await analyzeUserPerformance(userId);
        const recommendations = await generateRecommendations(categories);

        res.json({
            solution,
            context: [...messages, { role: 'assistant', content: solution }],
            categories,
            recommendations
        });

    } catch (error) {
        console.error('Fehler bei der OpenAI-API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Beim Lösen des Problems ist ein Fehler aufgetreten.' });
    }
};

