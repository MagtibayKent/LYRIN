import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, Check, X, Trophy, Star } from 'lucide-react';

interface Question {
  id: number;
  english: string;
  correct: string;
  options: string[];
}

// Quiz data organized by level (1-6) for each language
// Level 1: Beginner - Basic greetings and common words
// Level 2: Elementary - Numbers, colors, and family
// Level 3: Intermediate - Food, animals, and body parts
// Level 4: Upper Intermediate - Actions, emotions, and time
// Level 5: Advanced - Places, professions, and travel
// Level 6: Expert - Complex phrases and expressions

const quizData: Record<string, Record<number, Question[]>> = {
  french: {
    1: [ // Beginner
      { id: 1, english: 'Hello', correct: 'Bonjour', options: ['Bonjour', 'Au revoir', 'Merci', 'Oui'] },
      { id: 2, english: 'Goodbye', correct: 'Au revoir', options: ['Bonjour', 'Au revoir', 'Merci', 'Oui'] },
      { id: 3, english: 'Thank you', correct: 'Merci', options: ['Bonjour', 'Au revoir', 'Merci', 'Oui'] },
      { id: 4, english: 'Yes', correct: 'Oui', options: ['Oui', 'Non', 'S\'il vous plaît', 'Merci'] },
      { id: 5, english: 'No', correct: 'Non', options: ['Oui', 'Non', 'S\'il vous plaît', 'Merci'] },
      { id: 6, english: 'Please', correct: 'S\'il vous plaît', options: ['Oui', 'Non', 'S\'il vous plaît', 'Merci'] },
      { id: 7, english: 'Sorry', correct: 'Désolé', options: ['Désolé', 'Merci', 'Bonjour', 'Oui'] },
      { id: 8, english: 'Excuse me', correct: 'Excusez-moi', options: ['Excusez-moi', 'Merci', 'Bonjour', 'Au revoir'] },
      { id: 9, english: 'Good morning', correct: 'Bonjour', options: ['Bonjour', 'Bonsoir', 'Bonne nuit', 'Salut'] },
      { id: 10, english: 'Good night', correct: 'Bonne nuit', options: ['Bonne nuit', 'Bonjour', 'Bonsoir', 'Au revoir'] },
    ],
    2: [ // Elementary
      { id: 1, english: 'One', correct: 'Un', options: ['Un', 'Deux', 'Trois', 'Quatre'] },
      { id: 2, english: 'Red', correct: 'Rouge', options: ['Rouge', 'Bleu', 'Vert', 'Jaune'] },
      { id: 3, english: 'Blue', correct: 'Bleu', options: ['Bleu', 'Rouge', 'Vert', 'Noir'] },
      { id: 4, english: 'Mother', correct: 'Mère', options: ['Mère', 'Père', 'Sœur', 'Frère'] },
      { id: 5, english: 'Father', correct: 'Père', options: ['Père', 'Mère', 'Fils', 'Fille'] },
      { id: 6, english: 'Brother', correct: 'Frère', options: ['Frère', 'Sœur', 'Mère', 'Père'] },
      { id: 7, english: 'Sister', correct: 'Sœur', options: ['Sœur', 'Frère', 'Mère', 'Père'] },
      { id: 8, english: 'White', correct: 'Blanc', options: ['Blanc', 'Noir', 'Rouge', 'Bleu'] },
      { id: 9, english: 'Black', correct: 'Noir', options: ['Noir', 'Blanc', 'Rouge', 'Vert'] },
      { id: 10, english: 'Green', correct: 'Vert', options: ['Vert', 'Rouge', 'Bleu', 'Jaune'] },
    ],
    3: [ // Intermediate
      { id: 1, english: 'Water', correct: 'Eau', options: ['Eau', 'Pain', 'Lait', 'Vin'] },
      { id: 2, english: 'Bread', correct: 'Pain', options: ['Pain', 'Eau', 'Fromage', 'Fruit'] },
      { id: 3, english: 'Apple', correct: 'Pomme', options: ['Pomme', 'Banane', 'Orange', 'Raisin'] },
      { id: 4, english: 'Dog', correct: 'Chien', options: ['Chien', 'Chat', 'Oiseau', 'Poisson'] },
      { id: 5, english: 'Cat', correct: 'Chat', options: ['Chat', 'Chien', 'Cheval', 'Lapin'] },
      { id: 6, english: 'Head', correct: 'Tête', options: ['Tête', 'Main', 'Pied', 'Bras'] },
      { id: 7, english: 'Hand', correct: 'Main', options: ['Main', 'Tête', 'Pied', 'Jambe'] },
      { id: 8, english: 'Eye', correct: 'Œil', options: ['Œil', 'Nez', 'Bouche', 'Oreille'] },
      { id: 9, english: 'Mouth', correct: 'Bouche', options: ['Bouche', 'Œil', 'Nez', 'Dent'] },
      { id: 10, english: 'Chicken', correct: 'Poulet', options: ['Poulet', 'Bœuf', 'Porc', 'Poisson'] },
    ],
    4: [ // Upper Intermediate
      { id: 1, english: 'To run', correct: 'Courir', options: ['Courir', 'Marcher', 'Sauter', 'Nager'] },
      { id: 2, english: 'To eat', correct: 'Manger', options: ['Manger', 'Boire', 'Dormir', 'Lire'] },
      { id: 3, english: 'Happy', correct: 'Heureux', options: ['Heureux', 'Triste', 'En colère', 'Fatigué'] },
      { id: 4, english: 'Sad', correct: 'Triste', options: ['Triste', 'Heureux', 'Content', 'Joyeux'] },
      { id: 5, english: 'Today', correct: 'Aujourd\'hui', options: ['Aujourd\'hui', 'Hier', 'Demain', 'Maintenant'] },
      { id: 6, english: 'Tomorrow', correct: 'Demain', options: ['Demain', 'Aujourd\'hui', 'Hier', 'Semaine'] },
      { id: 7, english: 'To sleep', correct: 'Dormir', options: ['Dormir', 'Manger', 'Boire', 'Lire'] },
      { id: 8, english: 'Angry', correct: 'En colère', options: ['En colère', 'Heureux', 'Triste', 'Calme'] },
      { id: 9, english: 'To write', correct: 'Écrire', options: ['Écrire', 'Lire', 'Parler', 'Écouter'] },
      { id: 10, english: 'To understand', correct: 'Comprendre', options: ['Comprendre', 'Savoir', 'Apprendre', 'Enseigner'] },
    ],
    5: [ // Advanced
      { id: 1, english: 'Hospital', correct: 'Hôpital', options: ['Hôpital', 'École', 'Banque', 'Restaurant'] },
      { id: 2, english: 'Doctor', correct: 'Médecin', options: ['Médecin', 'Enseignant', 'Avocat', 'Ingénieur'] },
      { id: 3, english: 'Teacher', correct: 'Enseignant', options: ['Enseignant', 'Médecin', 'Étudiant', 'Chef'] },
      { id: 4, english: 'Airport', correct: 'Aéroport', options: ['Aéroport', 'Gare', 'Port', 'Station'] },
      { id: 5, english: 'Passport', correct: 'Passeport', options: ['Passeport', 'Billet', 'Carte', 'Valise'] },
      { id: 6, english: 'Luggage', correct: 'Bagage', options: ['Bagage', 'Passeport', 'Billet', 'Voiture'] },
      { id: 7, english: 'Library', correct: 'Bibliothèque', options: ['Bibliothèque', 'Musée', 'Théâtre', 'Cinéma'] },
      { id: 8, english: 'Lawyer', correct: 'Avocat', options: ['Avocat', 'Médecin', 'Ingénieur', 'Architecte'] },
      { id: 9, english: 'Engineer', correct: 'Ingénieur', options: ['Ingénieur', 'Médecin', 'Avocat', 'Enseignant'] },
      { id: 10, english: 'University', correct: 'Université', options: ['Université', 'École', 'Collège', 'Lycée'] },
    ],
    6: [ // Expert
      { id: 1, english: 'How are you?', correct: 'Comment allez-vous?', options: ['Comment allez-vous?', 'Qui êtes-vous?', 'Où allez-vous?', 'Quand partez-vous?'] },
      { id: 2, english: 'What time is it?', correct: 'Quelle heure est-il?', options: ['Quelle heure est-il?', 'Quel jour est-ce?', 'Quelle date est-ce?', 'Quel mois est-ce?'] },
      { id: 3, english: 'I don\'t understand', correct: 'Je ne comprends pas', options: ['Je ne comprends pas', 'Je ne sais pas', 'Je ne peux pas', 'Je ne veux pas'] },
      { id: 4, english: 'Could you help me?', correct: 'Pouvez-vous m\'aider?', options: ['Pouvez-vous m\'aider?', 'Pouvez-vous me dire?', 'Pouvez-vous venir?', 'Pouvez-vous attendre?'] },
      { id: 5, english: 'Where is the bathroom?', correct: 'Où sont les toilettes?', options: ['Où sont les toilettes?', 'Où est la sortie?', 'Où est l\'entrée?', 'Où est la réception?'] },
      { id: 6, english: 'I would like to order', correct: 'Je voudrais commander', options: ['Je voudrais commander', 'Je voudrais payer', 'Je voudrais partir', 'Je voudrais rester'] },
      { id: 7, english: 'How much does it cost?', correct: 'Combien ça coûte?', options: ['Combien ça coûte?', 'Combien de temps?', 'Combien de personnes?', 'Combien de fois?'] },
      { id: 8, english: 'I\'m lost', correct: 'Je suis perdu', options: ['Je suis perdu', 'Je suis fatigué', 'Je suis content', 'Je suis pressé'] },
      { id: 9, english: 'What does this mean?', correct: 'Qu\'est-ce que cela signifie?', options: ['Qu\'est-ce que cela signifie?', 'Qu\'est-ce que c\'est?', 'Qu\'est-ce qui se passe?', 'Qu\'est-ce que vous voulez?'] },
      { id: 10, english: 'I need assistance', correct: 'J\'ai besoin d\'aide', options: ['J\'ai besoin d\'aide', 'J\'ai besoin de temps', 'J\'ai besoin de repos', 'J\'ai besoin d\'argent'] },
    ],
  },
  spanish: {
    1: [ // Beginner
      { id: 1, english: 'Hello', correct: 'Hola', options: ['Hola', 'Adiós', 'Gracias', 'Sí'] },
      { id: 2, english: 'Goodbye', correct: 'Adiós', options: ['Hola', 'Adiós', 'Gracias', 'Sí'] },
      { id: 3, english: 'Thank you', correct: 'Gracias', options: ['Hola', 'Adiós', 'Gracias', 'Sí'] },
      { id: 4, english: 'Yes', correct: 'Sí', options: ['Sí', 'No', 'Por favor', 'Gracias'] },
      { id: 5, english: 'No', correct: 'No', options: ['Sí', 'No', 'Por favor', 'Gracias'] },
      { id: 6, english: 'Please', correct: 'Por favor', options: ['Sí', 'No', 'Por favor', 'Gracias'] },
      { id: 7, english: 'Sorry', correct: 'Lo siento', options: ['Lo siento', 'Gracias', 'Hola', 'Adiós'] },
      { id: 8, english: 'Excuse me', correct: 'Disculpe', options: ['Disculpe', 'Gracias', 'Hola', 'Por favor'] },
      { id: 9, english: 'Good morning', correct: 'Buenos días', options: ['Buenos días', 'Buenas tardes', 'Buenas noches', 'Hola'] },
      { id: 10, english: 'Good night', correct: 'Buenas noches', options: ['Buenas noches', 'Buenos días', 'Buenas tardes', 'Adiós'] },
    ],
    2: [ // Elementary
      { id: 1, english: 'One', correct: 'Uno', options: ['Uno', 'Dos', 'Tres', 'Cuatro'] },
      { id: 2, english: 'Red', correct: 'Rojo', options: ['Rojo', 'Azul', 'Verde', 'Amarillo'] },
      { id: 3, english: 'Blue', correct: 'Azul', options: ['Azul', 'Rojo', 'Verde', 'Negro'] },
      { id: 4, english: 'Mother', correct: 'Madre', options: ['Madre', 'Padre', 'Hermana', 'Hermano'] },
      { id: 5, english: 'Father', correct: 'Padre', options: ['Padre', 'Madre', 'Hijo', 'Hija'] },
      { id: 6, english: 'Brother', correct: 'Hermano', options: ['Hermano', 'Hermana', 'Madre', 'Padre'] },
      { id: 7, english: 'Sister', correct: 'Hermana', options: ['Hermana', 'Hermano', 'Madre', 'Padre'] },
      { id: 8, english: 'White', correct: 'Blanco', options: ['Blanco', 'Negro', 'Rojo', 'Azul'] },
      { id: 9, english: 'Black', correct: 'Negro', options: ['Negro', 'Blanco', 'Rojo', 'Verde'] },
      { id: 10, english: 'Green', correct: 'Verde', options: ['Verde', 'Rojo', 'Azul', 'Amarillo'] },
    ],
    3: [ // Intermediate
      { id: 1, english: 'Water', correct: 'Agua', options: ['Agua', 'Pan', 'Leche', 'Vino'] },
      { id: 2, english: 'Bread', correct: 'Pan', options: ['Pan', 'Agua', 'Queso', 'Fruta'] },
      { id: 3, english: 'Apple', correct: 'Manzana', options: ['Manzana', 'Plátano', 'Naranja', 'Uva'] },
      { id: 4, english: 'Dog', correct: 'Perro', options: ['Perro', 'Gato', 'Pájaro', 'Pez'] },
      { id: 5, english: 'Cat', correct: 'Gato', options: ['Gato', 'Perro', 'Caballo', 'Conejo'] },
      { id: 6, english: 'Head', correct: 'Cabeza', options: ['Cabeza', 'Mano', 'Pie', 'Brazo'] },
      { id: 7, english: 'Hand', correct: 'Mano', options: ['Mano', 'Cabeza', 'Pie', 'Pierna'] },
      { id: 8, english: 'Eye', correct: 'Ojo', options: ['Ojo', 'Nariz', 'Boca', 'Oreja'] },
      { id: 9, english: 'Mouth', correct: 'Boca', options: ['Boca', 'Ojo', 'Nariz', 'Diente'] },
      { id: 10, english: 'Chicken', correct: 'Pollo', options: ['Pollo', 'Carne', 'Cerdo', 'Pescado'] },
    ],
    4: [ // Upper Intermediate
      { id: 1, english: 'To run', correct: 'Correr', options: ['Correr', 'Caminar', 'Saltar', 'Nadar'] },
      { id: 2, english: 'To eat', correct: 'Comer', options: ['Comer', 'Beber', 'Dormir', 'Leer'] },
      { id: 3, english: 'Happy', correct: 'Feliz', options: ['Feliz', 'Triste', 'Enojado', 'Cansado'] },
      { id: 4, english: 'Sad', correct: 'Triste', options: ['Triste', 'Feliz', 'Contento', 'Alegre'] },
      { id: 5, english: 'Today', correct: 'Hoy', options: ['Hoy', 'Ayer', 'Mañana', 'Ahora'] },
      { id: 6, english: 'Tomorrow', correct: 'Mañana', options: ['Mañana', 'Hoy', 'Ayer', 'Semana'] },
      { id: 7, english: 'To sleep', correct: 'Dormir', options: ['Dormir', 'Comer', 'Beber', 'Leer'] },
      { id: 8, english: 'Angry', correct: 'Enojado', options: ['Enojado', 'Feliz', 'Triste', 'Calmado'] },
      { id: 9, english: 'To write', correct: 'Escribir', options: ['Escribir', 'Leer', 'Hablar', 'Escuchar'] },
      { id: 10, english: 'To understand', correct: 'Entender', options: ['Entender', 'Saber', 'Aprender', 'Enseñar'] },
    ],
    5: [ // Advanced
      { id: 1, english: 'Hospital', correct: 'Hospital', options: ['Hospital', 'Escuela', 'Banco', 'Restaurante'] },
      { id: 2, english: 'Doctor', correct: 'Médico', options: ['Médico', 'Maestro', 'Abogado', 'Ingeniero'] },
      { id: 3, english: 'Teacher', correct: 'Maestro', options: ['Maestro', 'Médico', 'Estudiante', 'Chef'] },
      { id: 4, english: 'Airport', correct: 'Aeropuerto', options: ['Aeropuerto', 'Estación', 'Puerto', 'Parada'] },
      { id: 5, english: 'Passport', correct: 'Pasaporte', options: ['Pasaporte', 'Boleto', 'Tarjeta', 'Maleta'] },
      { id: 6, english: 'Luggage', correct: 'Equipaje', options: ['Equipaje', 'Pasaporte', 'Boleto', 'Coche'] },
      { id: 7, english: 'Library', correct: 'Biblioteca', options: ['Biblioteca', 'Museo', 'Teatro', 'Cine'] },
      { id: 8, english: 'Lawyer', correct: 'Abogado', options: ['Abogado', 'Médico', 'Ingeniero', 'Arquitecto'] },
      { id: 9, english: 'Engineer', correct: 'Ingeniero', options: ['Ingeniero', 'Médico', 'Abogado', 'Maestro'] },
      { id: 10, english: 'University', correct: 'Universidad', options: ['Universidad', 'Escuela', 'Colegio', 'Instituto'] },
    ],
    6: [ // Expert
      { id: 1, english: 'How are you?', correct: '¿Cómo estás?', options: ['¿Cómo estás?', '¿Quién eres?', '¿Dónde vas?', '¿Cuándo sales?'] },
      { id: 2, english: 'What time is it?', correct: '¿Qué hora es?', options: ['¿Qué hora es?', '¿Qué día es?', '¿Qué fecha es?', '¿Qué mes es?'] },
      { id: 3, english: 'I don\'t understand', correct: 'No entiendo', options: ['No entiendo', 'No sé', 'No puedo', 'No quiero'] },
      { id: 4, english: 'Could you help me?', correct: '¿Podrías ayudarme?', options: ['¿Podrías ayudarme?', '¿Podrías decirme?', '¿Podrías venir?', '¿Podrías esperar?'] },
      { id: 5, english: 'Where is the bathroom?', correct: '¿Dónde está el baño?', options: ['¿Dónde está el baño?', '¿Dónde está la salida?', '¿Dónde está la entrada?', '¿Dónde está la recepción?'] },
      { id: 6, english: 'I would like to order', correct: 'Me gustaría pedir', options: ['Me gustaría pedir', 'Me gustaría pagar', 'Me gustaría irme', 'Me gustaría quedarme'] },
      { id: 7, english: 'How much does it cost?', correct: '¿Cuánto cuesta?', options: ['¿Cuánto cuesta?', '¿Cuánto tiempo?', '¿Cuántas personas?', '¿Cuántas veces?'] },
      { id: 8, english: 'I\'m lost', correct: 'Estoy perdido', options: ['Estoy perdido', 'Estoy cansado', 'Estoy contento', 'Tengo prisa'] },
      { id: 9, english: 'What does this mean?', correct: '¿Qué significa esto?', options: ['¿Qué significa esto?', '¿Qué es esto?', '¿Qué pasa?', '¿Qué quieres?'] },
      { id: 10, english: 'I need assistance', correct: 'Necesito ayuda', options: ['Necesito ayuda', 'Necesito tiempo', 'Necesito descansar', 'Necesito dinero'] },
    ],
  },
  german: {
    1: [ // Beginner
      { id: 1, english: 'Hello', correct: 'Hallo', options: ['Hallo', 'Auf Wiedersehen', 'Danke', 'Ja'] },
      { id: 2, english: 'Goodbye', correct: 'Auf Wiedersehen', options: ['Hallo', 'Auf Wiedersehen', 'Danke', 'Ja'] },
      { id: 3, english: 'Thank you', correct: 'Danke', options: ['Hallo', 'Auf Wiedersehen', 'Danke', 'Ja'] },
      { id: 4, english: 'Yes', correct: 'Ja', options: ['Ja', 'Nein', 'Bitte', 'Danke'] },
      { id: 5, english: 'No', correct: 'Nein', options: ['Ja', 'Nein', 'Bitte', 'Danke'] },
      { id: 6, english: 'Please', correct: 'Bitte', options: ['Ja', 'Nein', 'Bitte', 'Danke'] },
      { id: 7, english: 'Sorry', correct: 'Entschuldigung', options: ['Entschuldigung', 'Danke', 'Hallo', 'Bitte'] },
      { id: 8, english: 'Excuse me', correct: 'Entschuldigen Sie', options: ['Entschuldigen Sie', 'Danke', 'Hallo', 'Bitte'] },
      { id: 9, english: 'Good morning', correct: 'Guten Morgen', options: ['Guten Morgen', 'Guten Abend', 'Gute Nacht', 'Hallo'] },
      { id: 10, english: 'Good night', correct: 'Gute Nacht', options: ['Gute Nacht', 'Guten Morgen', 'Guten Abend', 'Auf Wiedersehen'] },
    ],
    2: [ // Elementary
      { id: 1, english: 'One', correct: 'Eins', options: ['Eins', 'Zwei', 'Drei', 'Vier'] },
      { id: 2, english: 'Red', correct: 'Rot', options: ['Rot', 'Blau', 'Grün', 'Gelb'] },
      { id: 3, english: 'Blue', correct: 'Blau', options: ['Blau', 'Rot', 'Grün', 'Schwarz'] },
      { id: 4, english: 'Mother', correct: 'Mutter', options: ['Mutter', 'Vater', 'Schwester', 'Bruder'] },
      { id: 5, english: 'Father', correct: 'Vater', options: ['Vater', 'Mutter', 'Sohn', 'Tochter'] },
      { id: 6, english: 'Brother', correct: 'Bruder', options: ['Bruder', 'Schwester', 'Mutter', 'Vater'] },
      { id: 7, english: 'Sister', correct: 'Schwester', options: ['Schwester', 'Bruder', 'Mutter', 'Vater'] },
      { id: 8, english: 'White', correct: 'Weiß', options: ['Weiß', 'Schwarz', 'Rot', 'Blau'] },
      { id: 9, english: 'Black', correct: 'Schwarz', options: ['Schwarz', 'Weiß', 'Rot', 'Grün'] },
      { id: 10, english: 'Green', correct: 'Grün', options: ['Grün', 'Rot', 'Blau', 'Gelb'] },
    ],
    3: [ // Intermediate
      { id: 1, english: 'Water', correct: 'Wasser', options: ['Wasser', 'Brot', 'Milch', 'Wein'] },
      { id: 2, english: 'Bread', correct: 'Brot', options: ['Brot', 'Wasser', 'Käse', 'Obst'] },
      { id: 3, english: 'Apple', correct: 'Apfel', options: ['Apfel', 'Banane', 'Orange', 'Traube'] },
      { id: 4, english: 'Dog', correct: 'Hund', options: ['Hund', 'Katze', 'Vogel', 'Fisch'] },
      { id: 5, english: 'Cat', correct: 'Katze', options: ['Katze', 'Hund', 'Pferd', 'Kaninchen'] },
      { id: 6, english: 'Head', correct: 'Kopf', options: ['Kopf', 'Hand', 'Fuß', 'Arm'] },
      { id: 7, english: 'Hand', correct: 'Hand', options: ['Hand', 'Kopf', 'Fuß', 'Bein'] },
      { id: 8, english: 'Eye', correct: 'Auge', options: ['Auge', 'Nase', 'Mund', 'Ohr'] },
      { id: 9, english: 'Mouth', correct: 'Mund', options: ['Mund', 'Auge', 'Nase', 'Zahn'] },
      { id: 10, english: 'Chicken', correct: 'Huhn', options: ['Huhn', 'Rind', 'Schwein', 'Fisch'] },
    ],
    4: [ // Upper Intermediate
      { id: 1, english: 'To run', correct: 'Laufen', options: ['Laufen', 'Gehen', 'Springen', 'Schwimmen'] },
      { id: 2, english: 'To eat', correct: 'Essen', options: ['Essen', 'Trinken', 'Schlafen', 'Lesen'] },
      { id: 3, english: 'Happy', correct: 'Glücklich', options: ['Glücklich', 'Traurig', 'Wütend', 'Müde'] },
      { id: 4, english: 'Sad', correct: 'Traurig', options: ['Traurig', 'Glücklich', 'Zufrieden', 'Fröhlich'] },
      { id: 5, english: 'Today', correct: 'Heute', options: ['Heute', 'Gestern', 'Morgen', 'Jetzt'] },
      { id: 6, english: 'Tomorrow', correct: 'Morgen', options: ['Morgen', 'Heute', 'Gestern', 'Woche'] },
      { id: 7, english: 'To sleep', correct: 'Schlafen', options: ['Schlafen', 'Essen', 'Trinken', 'Lesen'] },
      { id: 8, english: 'Angry', correct: 'Wütend', options: ['Wütend', 'Glücklich', 'Traurig', 'Ruhig'] },
      { id: 9, english: 'To write', correct: 'Schreiben', options: ['Schreiben', 'Lesen', 'Sprechen', 'Hören'] },
      { id: 10, english: 'To understand', correct: 'Verstehen', options: ['Verstehen', 'Wissen', 'Lernen', 'Lehren'] },
    ],
    5: [ // Advanced
      { id: 1, english: 'Hospital', correct: 'Krankenhaus', options: ['Krankenhaus', 'Schule', 'Bank', 'Restaurant'] },
      { id: 2, english: 'Doctor', correct: 'Arzt', options: ['Arzt', 'Lehrer', 'Anwalt', 'Ingenieur'] },
      { id: 3, english: 'Teacher', correct: 'Lehrer', options: ['Lehrer', 'Arzt', 'Student', 'Koch'] },
      { id: 4, english: 'Airport', correct: 'Flughafen', options: ['Flughafen', 'Bahnhof', 'Hafen', 'Haltestelle'] },
      { id: 5, english: 'Passport', correct: 'Reisepass', options: ['Reisepass', 'Ticket', 'Karte', 'Koffer'] },
      { id: 6, english: 'Luggage', correct: 'Gepäck', options: ['Gepäck', 'Reisepass', 'Ticket', 'Auto'] },
      { id: 7, english: 'Library', correct: 'Bibliothek', options: ['Bibliothek', 'Museum', 'Theater', 'Kino'] },
      { id: 8, english: 'Lawyer', correct: 'Anwalt', options: ['Anwalt', 'Arzt', 'Ingenieur', 'Architekt'] },
      { id: 9, english: 'Engineer', correct: 'Ingenieur', options: ['Ingenieur', 'Arzt', 'Anwalt', 'Lehrer'] },
      { id: 10, english: 'University', correct: 'Universität', options: ['Universität', 'Schule', 'Kolleg', 'Gymnasium'] },
    ],
    6: [ // Expert
      { id: 1, english: 'How are you?', correct: 'Wie geht es dir?', options: ['Wie geht es dir?', 'Wer bist du?', 'Wohin gehst du?', 'Wann gehst du?'] },
      { id: 2, english: 'What time is it?', correct: 'Wie spät ist es?', options: ['Wie spät ist es?', 'Welcher Tag ist es?', 'Welches Datum ist es?', 'Welcher Monat ist es?'] },
      { id: 3, english: 'I don\'t understand', correct: 'Ich verstehe nicht', options: ['Ich verstehe nicht', 'Ich weiß nicht', 'Ich kann nicht', 'Ich will nicht'] },
      { id: 4, english: 'Could you help me?', correct: 'Könnten Sie mir helfen?', options: ['Könnten Sie mir helfen?', 'Könnten Sie mir sagen?', 'Könnten Sie kommen?', 'Könnten Sie warten?'] },
      { id: 5, english: 'Where is the bathroom?', correct: 'Wo ist die Toilette?', options: ['Wo ist die Toilette?', 'Wo ist der Ausgang?', 'Wo ist der Eingang?', 'Wo ist die Rezeption?'] },
      { id: 6, english: 'I would like to order', correct: 'Ich möchte bestellen', options: ['Ich möchte bestellen', 'Ich möchte bezahlen', 'Ich möchte gehen', 'Ich möchte bleiben'] },
      { id: 7, english: 'How much does it cost?', correct: 'Wie viel kostet es?', options: ['Wie viel kostet es?', 'Wie lange?', 'Wie viele Personen?', 'Wie oft?'] },
      { id: 8, english: 'I\'m lost', correct: 'Ich habe mich verlaufen', options: ['Ich habe mich verlaufen', 'Ich bin müde', 'Ich bin zufrieden', 'Ich habe es eilig'] },
      { id: 9, english: 'What does this mean?', correct: 'Was bedeutet das?', options: ['Was bedeutet das?', 'Was ist das?', 'Was passiert?', 'Was willst du?'] },
      { id: 10, english: 'I need assistance', correct: 'Ich brauche Hilfe', options: ['Ich brauche Hilfe', 'Ich brauche Zeit', 'Ich brauche Ruhe', 'Ich brauche Geld'] },
    ],
  },
  japanese: {
    1: [ // Beginner
      { id: 1, english: 'Hello', correct: 'こんにちは', options: ['こんにちは', 'さようなら', 'ありがとう', 'はい'] },
      { id: 2, english: 'Goodbye', correct: 'さようなら', options: ['こんにちは', 'さようなら', 'ありがとう', 'はい'] },
      { id: 3, english: 'Thank you', correct: 'ありがとう', options: ['こんにちは', 'さようなら', 'ありがとう', 'はい'] },
      { id: 4, english: 'Yes', correct: 'はい', options: ['はい', 'いいえ', 'お願いします', 'ありがとう'] },
      { id: 5, english: 'No', correct: 'いいえ', options: ['はい', 'いいえ', 'お願いします', 'ありがとう'] },
      { id: 6, english: 'Please', correct: 'お願いします', options: ['はい', 'いいえ', 'お願いします', 'ありがとう'] },
      { id: 7, english: 'Sorry', correct: 'すみません', options: ['すみません', 'ありがとう', 'こんにちは', 'お願いします'] },
      { id: 8, english: 'Excuse me', correct: '失礼します', options: ['失礼します', 'ありがとう', 'こんにちは', 'お願いします'] },
      { id: 9, english: 'Good morning', correct: 'おはようございます', options: ['おはようございます', 'こんばんは', 'おやすみなさい', 'こんにちは'] },
      { id: 10, english: 'Good night', correct: 'おやすみなさい', options: ['おやすみなさい', 'おはようございます', 'こんばんは', 'さようなら'] },
    ],
    2: [ // Elementary
      { id: 1, english: 'One', correct: '一', options: ['一', '二', '三', '四'] },
      { id: 2, english: 'Red', correct: '赤', options: ['赤', '青', '緑', '黄'] },
      { id: 3, english: 'Blue', correct: '青', options: ['青', '赤', '緑', '黒'] },
      { id: 4, english: 'Mother', correct: '母', options: ['母', '父', '姉', '兄'] },
      { id: 5, english: 'Father', correct: '父', options: ['父', '母', '息子', '娘'] },
      { id: 6, english: 'Brother', correct: '兄', options: ['兄', '姉', '母', '父'] },
      { id: 7, english: 'Sister', correct: '姉', options: ['姉', '兄', '母', '父'] },
      { id: 8, english: 'White', correct: '白', options: ['白', '黒', '赤', '青'] },
      { id: 9, english: 'Black', correct: '黒', options: ['黒', '白', '赤', '緑'] },
      { id: 10, english: 'Green', correct: '緑', options: ['緑', '赤', '青', '黄'] },
    ],
    3: [ // Intermediate
      { id: 1, english: 'Water', correct: '水', options: ['水', 'パン', '牛乳', 'ワイン'] },
      { id: 2, english: 'Bread', correct: 'パン', options: ['パン', '水', 'チーズ', '果物'] },
      { id: 3, english: 'Apple', correct: 'りんご', options: ['りんご', 'バナナ', 'オレンジ', 'ぶどう'] },
      { id: 4, english: 'Dog', correct: '犬', options: ['犬', '猫', '鳥', '魚'] },
      { id: 5, english: 'Cat', correct: '猫', options: ['猫', '犬', '馬', 'うさぎ'] },
      { id: 6, english: 'Head', correct: '頭', options: ['頭', '手', '足', '腕'] },
      { id: 7, english: 'Hand', correct: '手', options: ['手', '頭', '足', '脚'] },
      { id: 8, english: 'Eye', correct: '目', options: ['目', '鼻', '口', '耳'] },
      { id: 9, english: 'Mouth', correct: '口', options: ['口', '目', '鼻', '歯'] },
      { id: 10, english: 'Chicken', correct: '鶏', options: ['鶏', '牛肉', '豚肉', '魚'] },
    ],
    4: [ // Upper Intermediate
      { id: 1, english: 'To run', correct: '走る', options: ['走る', '歩く', '跳ぶ', '泳ぐ'] },
      { id: 2, english: 'To eat', correct: '食べる', options: ['食べる', '飲む', '寝る', '読む'] },
      { id: 3, english: 'Happy', correct: '幸せ', options: ['幸せ', '悲しい', '怒っている', '疲れた'] },
      { id: 4, english: 'Sad', correct: '悲しい', options: ['悲しい', '幸せ', '満足', '嬉しい'] },
      { id: 5, english: 'Today', correct: '今日', options: ['今日', '昨日', '明日', '今'] },
      { id: 6, english: 'Tomorrow', correct: '明日', options: ['明日', '今日', '昨日', '週'] },
      { id: 7, english: 'To sleep', correct: '寝る', options: ['寝る', '食べる', '飲む', '読む'] },
      { id: 8, english: 'Angry', correct: '怒っている', options: ['怒っている', '幸せ', '悲しい', '落ち着いた'] },
      { id: 9, english: 'To write', correct: '書く', options: ['書く', '読む', '話す', '聞く'] },
      { id: 10, english: 'To understand', correct: '理解する', options: ['理解する', '知る', '学ぶ', '教える'] },
    ],
    5: [ // Advanced
      { id: 1, english: 'Hospital', correct: '病院', options: ['病院', '学校', '銀行', 'レストラン'] },
      { id: 2, english: 'Doctor', correct: '医者', options: ['医者', '教師', '弁護士', 'エンジニア'] },
      { id: 3, english: 'Teacher', correct: '教師', options: ['教師', '医者', '学生', 'シェフ'] },
      { id: 4, english: 'Airport', correct: '空港', options: ['空港', '駅', '港', '停留所'] },
      { id: 5, english: 'Passport', correct: 'パスポート', options: ['パスポート', 'チケット', 'カード', 'スーツケース'] },
      { id: 6, english: 'Luggage', correct: '荷物', options: ['荷物', 'パスポート', 'チケット', '車'] },
      { id: 7, english: 'Library', correct: '図書館', options: ['図書館', '博物館', '劇場', '映画館'] },
      { id: 8, english: 'Lawyer', correct: '弁護士', options: ['弁護士', '医者', 'エンジニア', '建築家'] },
      { id: 9, english: 'Engineer', correct: 'エンジニア', options: ['エンジニア', '医者', '弁護士', '教師'] },
      { id: 10, english: 'University', correct: '大学', options: ['大学', '学校', '高校', '中学校'] },
    ],
    6: [ // Expert
      { id: 1, english: 'How are you?', correct: 'お元気ですか？', options: ['お元気ですか？', 'あなたは誰ですか？', 'どこへ行きますか？', 'いつ出発しますか？'] },
      { id: 2, english: 'What time is it?', correct: '今何時ですか？', options: ['今何時ですか？', '今日は何日ですか？', '今日は何日ですか？', '今月は何月ですか？'] },
      { id: 3, english: 'I don\'t understand', correct: 'わかりません', options: ['わかりません', '知りません', 'できません', 'したくありません'] },
      { id: 4, english: 'Could you help me?', correct: '手伝っていただけますか？', options: ['手伝っていただけますか？', '教えていただけますか？', '来ていただけますか？', '待っていただけますか？'] },
      { id: 5, english: 'Where is the bathroom?', correct: 'トイレはどこですか？', options: ['トイレはどこですか？', '出口はどこですか？', '入口はどこですか？', '受付はどこですか？'] },
      { id: 6, english: 'I would like to order', correct: '注文したいです', options: ['注文したいです', '支払いたいです', '行きたいです', '滞在したいです'] },
      { id: 7, english: 'How much does it cost?', correct: 'いくらですか？', options: ['いくらですか？', 'どのくらい時間がかかりますか？', '何人ですか？', '何回ですか？'] },
      { id: 8, english: 'I\'m lost', correct: '道に迷いました', options: ['道に迷いました', '疲れました', '満足しています', '急いでいます'] },
      { id: 9, english: 'What does this mean?', correct: 'これはどういう意味ですか？', options: ['これはどういう意味ですか？', 'これは何ですか？', '何が起こっていますか？', '何が欲しいですか？'] },
      { id: 10, english: 'I need assistance', correct: '助けが必要です', options: ['助けが必要です', '時間が必要です', '休息が必要です', 'お金が必要です'] },
    ],
  },
  italian: {
    1: [ // Beginner
      { id: 1, english: 'Hello', correct: 'Ciao', options: ['Ciao', 'Arrivederci', 'Grazie', 'Sì'] },
      { id: 2, english: 'Goodbye', correct: 'Arrivederci', options: ['Ciao', 'Arrivederci', 'Grazie', 'Sì'] },
      { id: 3, english: 'Thank you', correct: 'Grazie', options: ['Ciao', 'Arrivederci', 'Grazie', 'Sì'] },
      { id: 4, english: 'Yes', correct: 'Sì', options: ['Sì', 'No', 'Per favore', 'Grazie'] },
      { id: 5, english: 'No', correct: 'No', options: ['Sì', 'No', 'Per favore', 'Grazie'] },
      { id: 6, english: 'Please', correct: 'Per favore', options: ['Sì', 'No', 'Per favore', 'Grazie'] },
      { id: 7, english: 'Sorry', correct: 'Scusa', options: ['Scusa', 'Grazie', 'Ciao', 'Per favore'] },
      { id: 8, english: 'Excuse me', correct: 'Scusami', options: ['Scusami', 'Grazie', 'Ciao', 'Per favore'] },
      { id: 9, english: 'Good morning', correct: 'Buongiorno', options: ['Buongiorno', 'Buonasera', 'Buonanotte', 'Ciao'] },
      { id: 10, english: 'Good night', correct: 'Buonanotte', options: ['Buonanotte', 'Buongiorno', 'Buonasera', 'Arrivederci'] },
    ],
    2: [ // Elementary
      { id: 1, english: 'One', correct: 'Uno', options: ['Uno', 'Due', 'Tre', 'Quattro'] },
      { id: 2, english: 'Red', correct: 'Rosso', options: ['Rosso', 'Blu', 'Verde', 'Giallo'] },
      { id: 3, english: 'Blue', correct: 'Blu', options: ['Blu', 'Rosso', 'Verde', 'Nero'] },
      { id: 4, english: 'Mother', correct: 'Madre', options: ['Madre', 'Padre', 'Sorella', 'Fratello'] },
      { id: 5, english: 'Father', correct: 'Padre', options: ['Padre', 'Madre', 'Figlio', 'Figlia'] },
      { id: 6, english: 'Brother', correct: 'Fratello', options: ['Fratello', 'Sorella', 'Madre', 'Padre'] },
      { id: 7, english: 'Sister', correct: 'Sorella', options: ['Sorella', 'Fratello', 'Madre', 'Padre'] },
      { id: 8, english: 'White', correct: 'Bianco', options: ['Bianco', 'Nero', 'Rosso', 'Blu'] },
      { id: 9, english: 'Black', correct: 'Nero', options: ['Nero', 'Bianco', 'Rosso', 'Verde'] },
      { id: 10, english: 'Green', correct: 'Verde', options: ['Verde', 'Rosso', 'Blu', 'Giallo'] },
    ],
    3: [ // Intermediate
      { id: 1, english: 'Water', correct: 'Acqua', options: ['Acqua', 'Pane', 'Latte', 'Vino'] },
      { id: 2, english: 'Bread', correct: 'Pane', options: ['Pane', 'Acqua', 'Formaggio', 'Frutta'] },
      { id: 3, english: 'Apple', correct: 'Mela', options: ['Mela', 'Banana', 'Arancia', 'Uva'] },
      { id: 4, english: 'Dog', correct: 'Cane', options: ['Cane', 'Gatto', 'Uccello', 'Pesce'] },
      { id: 5, english: 'Cat', correct: 'Gatto', options: ['Gatto', 'Cane', 'Cavallo', 'Coniglio'] },
      { id: 6, english: 'Head', correct: 'Testa', options: ['Testa', 'Mano', 'Piede', 'Braccio'] },
      { id: 7, english: 'Hand', correct: 'Mano', options: ['Mano', 'Testa', 'Piede', 'Gamba'] },
      { id: 8, english: 'Eye', correct: 'Occhio', options: ['Occhio', 'Naso', 'Bocca', 'Orecchio'] },
      { id: 9, english: 'Mouth', correct: 'Bocca', options: ['Bocca', 'Occhio', 'Naso', 'Dente'] },
      { id: 10, english: 'Chicken', correct: 'Pollo', options: ['Pollo', 'Manzo', 'Maiale', 'Pesce'] },
    ],
    4: [ // Upper Intermediate
      { id: 1, english: 'To run', correct: 'Correre', options: ['Correre', 'Camminare', 'Saltare', 'Nuotare'] },
      { id: 2, english: 'To eat', correct: 'Mangiare', options: ['Mangiare', 'Bere', 'Dormire', 'Leggere'] },
      { id: 3, english: 'Happy', correct: 'Felice', options: ['Felice', 'Triste', 'Arrabbiato', 'Stanco'] },
      { id: 4, english: 'Sad', correct: 'Triste', options: ['Triste', 'Felice', 'Contento', 'Allegro'] },
      { id: 5, english: 'Today', correct: 'Oggi', options: ['Oggi', 'Ieri', 'Domani', 'Adesso'] },
      { id: 6, english: 'Tomorrow', correct: 'Domani', options: ['Domani', 'Oggi', 'Ieri', 'Settimana'] },
      { id: 7, english: 'To sleep', correct: 'Dormire', options: ['Dormire', 'Mangiare', 'Bere', 'Leggere'] },
      { id: 8, english: 'Angry', correct: 'Arrabbiato', options: ['Arrabbiato', 'Felice', 'Triste', 'Calmo'] },
      { id: 9, english: 'To write', correct: 'Scrivere', options: ['Scrivere', 'Leggere', 'Parlare', 'Ascoltare'] },
      { id: 10, english: 'To understand', correct: 'Capire', options: ['Capire', 'Sapere', 'Imparare', 'Insegnare'] },
    ],
    5: [ // Advanced
      { id: 1, english: 'Hospital', correct: 'Ospedale', options: ['Ospedale', 'Scuola', 'Banca', 'Ristorante'] },
      { id: 2, english: 'Doctor', correct: 'Dottore', options: ['Dottore', 'Insegnante', 'Avvocato', 'Ingegnere'] },
      { id: 3, english: 'Teacher', correct: 'Insegnante', options: ['Insegnante', 'Dottore', 'Studente', 'Chef'] },
      { id: 4, english: 'Airport', correct: 'Aeroporto', options: ['Aeroporto', 'Stazione', 'Porto', 'Fermata'] },
      { id: 5, english: 'Passport', correct: 'Passaporto', options: ['Passaporto', 'Biglietto', 'Carta', 'Valigia'] },
      { id: 6, english: 'Luggage', correct: 'Bagaglio', options: ['Bagaglio', 'Passaporto', 'Biglietto', 'Macchina'] },
      { id: 7, english: 'Library', correct: 'Biblioteca', options: ['Biblioteca', 'Museo', 'Teatro', 'Cinema'] },
      { id: 8, english: 'Lawyer', correct: 'Avvocato', options: ['Avvocato', 'Dottore', 'Ingegnere', 'Architetto'] },
      { id: 9, english: 'Engineer', correct: 'Ingegnere', options: ['Ingegnere', 'Dottore', 'Avvocato', 'Insegnante'] },
      { id: 10, english: 'University', correct: 'Università', options: ['Università', 'Scuola', 'Collegio', 'Liceo'] },
    ],
    6: [ // Expert
      { id: 1, english: 'How are you?', correct: 'Come stai?', options: ['Come stai?', 'Chi sei?', 'Dove vai?', 'Quando parti?'] },
      { id: 2, english: 'What time is it?', correct: 'Che ora è?', options: ['Che ora è?', 'Che giorno è?', 'Che data è?', 'Che mese è?'] },
      { id: 3, english: 'I don\'t understand', correct: 'Non capisco', options: ['Non capisco', 'Non so', 'Non posso', 'Non voglio'] },
      { id: 4, english: 'Could you help me?', correct: 'Potresti aiutarmi?', options: ['Potresti aiutarmi?', 'Potresti dirmi?', 'Potresti venire?', 'Potresti aspettare?'] },
      { id: 5, english: 'Where is the bathroom?', correct: 'Dov\'è il bagno?', options: ['Dov\'è il bagno?', 'Dov\'è l\'uscita?', 'Dov\'è l\'entrata?', 'Dov\'è la reception?'] },
      { id: 6, english: 'I would like to order', correct: 'Vorrei ordinare', options: ['Vorrei ordinare', 'Vorrei pagare', 'Vorrei andare', 'Vorrei restare'] },
      { id: 7, english: 'How much does it cost?', correct: 'Quanto costa?', options: ['Quanto costa?', 'Quanto tempo?', 'Quante persone?', 'Quante volte?'] },
      { id: 8, english: 'I\'m lost', correct: 'Mi sono perso', options: ['Mi sono perso', 'Sono stanco', 'Sono contento', 'Ho fretta'] },
      { id: 9, english: 'What does this mean?', correct: 'Cosa significa questo?', options: ['Cosa significa questo?', 'Cos\'è questo?', 'Cosa succede?', 'Cosa vuoi?'] },
      { id: 10, english: 'I need assistance', correct: 'Ho bisogno di aiuto', options: ['Ho bisogno di aiuto', 'Ho bisogno di tempo', 'Ho bisogno di riposo', 'Ho bisogno di soldi'] },
    ],
  },
  portuguese: {
    1: [ // Beginner
      { id: 1, english: 'Hello', correct: 'Olá', options: ['Olá', 'Adeus', 'Obrigado', 'Sim'] },
      { id: 2, english: 'Goodbye', correct: 'Adeus', options: ['Olá', 'Adeus', 'Obrigado', 'Sim'] },
      { id: 3, english: 'Thank you', correct: 'Obrigado', options: ['Olá', 'Adeus', 'Obrigado', 'Sim'] },
      { id: 4, english: 'Yes', correct: 'Sim', options: ['Sim', 'Não', 'Por favor', 'Obrigado'] },
      { id: 5, english: 'No', correct: 'Não', options: ['Sim', 'Não', 'Por favor', 'Obrigado'] },
      { id: 6, english: 'Please', correct: 'Por favor', options: ['Sim', 'Não', 'Por favor', 'Obrigado'] },
      { id: 7, english: 'Sorry', correct: 'Desculpe', options: ['Desculpe', 'Obrigado', 'Olá', 'Por favor'] },
      { id: 8, english: 'Excuse me', correct: 'Com licença', options: ['Com licença', 'Obrigado', 'Olá', 'Por favor'] },
      { id: 9, english: 'Good morning', correct: 'Bom dia', options: ['Bom dia', 'Boa tarde', 'Boa noite', 'Olá'] },
      { id: 10, english: 'Good night', correct: 'Boa noite', options: ['Boa noite', 'Bom dia', 'Boa tarde', 'Adeus'] },
    ],
    2: [ // Elementary
      { id: 1, english: 'One', correct: 'Um', options: ['Um', 'Dois', 'Três', 'Quatro'] },
      { id: 2, english: 'Red', correct: 'Vermelho', options: ['Vermelho', 'Azul', 'Verde', 'Amarelo'] },
      { id: 3, english: 'Blue', correct: 'Azul', options: ['Azul', 'Vermelho', 'Verde', 'Preto'] },
      { id: 4, english: 'Mother', correct: 'Mãe', options: ['Mãe', 'Pai', 'Irmã', 'Irmão'] },
      { id: 5, english: 'Father', correct: 'Pai', options: ['Pai', 'Mãe', 'Filho', 'Filha'] },
      { id: 6, english: 'Brother', correct: 'Irmão', options: ['Irmão', 'Irmã', 'Mãe', 'Pai'] },
      { id: 7, english: 'Sister', correct: 'Irmã', options: ['Irmã', 'Irmão', 'Mãe', 'Pai'] },
      { id: 8, english: 'White', correct: 'Branco', options: ['Branco', 'Preto', 'Vermelho', 'Azul'] },
      { id: 9, english: 'Black', correct: 'Preto', options: ['Preto', 'Branco', 'Vermelho', 'Verde'] },
      { id: 10, english: 'Green', correct: 'Verde', options: ['Verde', 'Vermelho', 'Azul', 'Amarelo'] },
    ],
    3: [ // Intermediate
      { id: 1, english: 'Water', correct: 'Água', options: ['Água', 'Pão', 'Leite', 'Vinho'] },
      { id: 2, english: 'Bread', correct: 'Pão', options: ['Pão', 'Água', 'Queijo', 'Fruta'] },
      { id: 3, english: 'Apple', correct: 'Maçã', options: ['Maçã', 'Banana', 'Laranja', 'Uva'] },
      { id: 4, english: 'Dog', correct: 'Cão', options: ['Cão', 'Gato', 'Pássaro', 'Peixe'] },
      { id: 5, english: 'Cat', correct: 'Gato', options: ['Gato', 'Cão', 'Cavalo', 'Coelho'] },
      { id: 6, english: 'Head', correct: 'Cabeça', options: ['Cabeça', 'Mão', 'Pé', 'Braço'] },
      { id: 7, english: 'Hand', correct: 'Mão', options: ['Mão', 'Cabeça', 'Pé', 'Perna'] },
      { id: 8, english: 'Eye', correct: 'Olho', options: ['Olho', 'Nariz', 'Boca', 'Orelha'] },
      { id: 9, english: 'Mouth', correct: 'Boca', options: ['Boca', 'Olho', 'Nariz', 'Dente'] },
      { id: 10, english: 'Chicken', correct: 'Frango', options: ['Frango', 'Carne', 'Porco', 'Peixe'] },
    ],
    4: [ // Upper Intermediate
      { id: 1, english: 'To run', correct: 'Correr', options: ['Correr', 'Caminhar', 'Saltar', 'Nadar'] },
      { id: 2, english: 'To eat', correct: 'Comer', options: ['Comer', 'Beber', 'Dormir', 'Ler'] },
      { id: 3, english: 'Happy', correct: 'Feliz', options: ['Feliz', 'Triste', 'Bravo', 'Cansado'] },
      { id: 4, english: 'Sad', correct: 'Triste', options: ['Triste', 'Feliz', 'Contente', 'Alegre'] },
      { id: 5, english: 'Today', correct: 'Hoje', options: ['Hoje', 'Ontem', 'Amanhã', 'Agora'] },
      { id: 6, english: 'Tomorrow', correct: 'Amanhã', options: ['Amanhã', 'Hoje', 'Ontem', 'Semana'] },
      { id: 7, english: 'To sleep', correct: 'Dormir', options: ['Dormir', 'Comer', 'Beber', 'Ler'] },
      { id: 8, english: 'Angry', correct: 'Bravo', options: ['Bravo', 'Feliz', 'Triste', 'Calmo'] },
      { id: 9, english: 'To write', correct: 'Escrever', options: ['Escrever', 'Ler', 'Falar', 'Ouvir'] },
      { id: 10, english: 'To understand', correct: 'Entender', options: ['Entender', 'Saber', 'Aprender', 'Ensinar'] },
    ],
    5: [ // Advanced
      { id: 1, english: 'Hospital', correct: 'Hospital', options: ['Hospital', 'Escola', 'Banco', 'Restaurante'] },
      { id: 2, english: 'Doctor', correct: 'Médico', options: ['Médico', 'Professor', 'Advogado', 'Engenheiro'] },
      { id: 3, english: 'Teacher', correct: 'Professor', options: ['Professor', 'Médico', 'Estudante', 'Chef'] },
      { id: 4, english: 'Airport', correct: 'Aeroporto', options: ['Aeroporto', 'Estação', 'Porto', 'Parada'] },
      { id: 5, english: 'Passport', correct: 'Passaporte', options: ['Passaporte', 'Bilhete', 'Cartão', 'Mala'] },
      { id: 6, english: 'Luggage', correct: 'Bagagem', options: ['Bagagem', 'Passaporte', 'Bilhete', 'Carro'] },
      { id: 7, english: 'Library', correct: 'Biblioteca', options: ['Biblioteca', 'Museu', 'Teatro', 'Cinema'] },
      { id: 8, english: 'Lawyer', correct: 'Advogado', options: ['Advogado', 'Médico', 'Engenheiro', 'Arquiteto'] },
      { id: 9, english: 'Engineer', correct: 'Engenheiro', options: ['Engenheiro', 'Médico', 'Advogado', 'Professor'] },
      { id: 10, english: 'University', correct: 'Universidade', options: ['Universidade', 'Escola', 'Colégio', 'Instituto'] },
    ],
    6: [ // Expert
      { id: 1, english: 'How are you?', correct: 'Como você está?', options: ['Como você está?', 'Quem é você?', 'Para onde você vai?', 'Quando você parte?'] },
      { id: 2, english: 'What time is it?', correct: 'Que horas são?', options: ['Que horas são?', 'Que dia é hoje?', 'Qual é a data?', 'Qual é o mês?'] },
      { id: 3, english: 'I don\'t understand', correct: 'Não entendo', options: ['Não entendo', 'Não sei', 'Não posso', 'Não quero'] },
      { id: 4, english: 'Could you help me?', correct: 'Você poderia me ajudar?', options: ['Você poderia me ajudar?', 'Você poderia me dizer?', 'Você poderia vir?', 'Você poderia esperar?'] },
      { id: 5, english: 'Where is the bathroom?', correct: 'Onde fica o banheiro?', options: ['Onde fica o banheiro?', 'Onde fica a saída?', 'Onde fica a entrada?', 'Onde fica a recepção?'] },
      { id: 6, english: 'I would like to order', correct: 'Gostaria de pedir', options: ['Gostaria de pedir', 'Gostaria de pagar', 'Gostaria de ir', 'Gostaria de ficar'] },
      { id: 7, english: 'How much does it cost?', correct: 'Quanto custa?', options: ['Quanto custa?', 'Quanto tempo?', 'Quantas pessoas?', 'Quantas vezes?'] },
      { id: 8, english: 'I\'m lost', correct: 'Estou perdido', options: ['Estou perdido', 'Estou cansado', 'Estou contente', 'Estou com pressa'] },
      { id: 9, english: 'What does this mean?', correct: 'O que isso significa?', options: ['O que isso significa?', 'O que é isso?', 'O que está acontecendo?', 'O que você quer?'] },
      { id: 10, english: 'I need assistance', correct: 'Preciso de ajuda', options: ['Preciso de ajuda', 'Preciso de tempo', 'Preciso descansar', 'Preciso de dinheiro'] },
    ],
  },
};

interface QuizPageProps {
  language: string;
  level?: number;
}

export default function QuizPage({ language, level = 1 }: QuizPageProps) {
  const page = usePage();
  const auth = (page.props as any).auth as { user: { name: string; email: string | null } | null };
  const flash = (page.props as any).flash as { message?: string; error?: string } | undefined;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Get questions for the specific language and level
  const questions = language && level ? (quizData[language]?.[level] || []) : [];

  useEffect(() => {
    if (questions.length === 0) {
      router.visit('/quizme');
    }
  }, [questions]);

  if (questions.length === 0) {
    return null;
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === question.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
      const finalScore = score + (selectedAnswer === question.correct ? 1 : 0);
      // Submit quiz results - preserve state so completion screen stays visible
      router.post(`/quiz/${language}/${level}`, {
        score: finalScore,
        totalQuestions: questions.length,
      }, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          // Quiz results saved, completion screen will remain visible
        }
      });
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const finalScore = score;
    const percentage = (finalScore / questions.length) * 100;

    return (
      <AuthenticatedLayout user={auth.user!}>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 rounded-[2rem] shadow-2xl bg-white border-4 border-gray-800">
          {flash?.message && (
            <div className="mb-6 p-4 bg-blue-100 border-[3px] border-blue-400 rounded-2xl text-blue-800 logo-font text-lg text-center">
              {flash.message}
            </div>
          )}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto border-4 border-gray-800 animate-bounce">
                <Trophy className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 text-4xl">✨</div>
              <div className="absolute -bottom-2 -left-2 text-4xl">🎉</div>
            </div>

            <div>
              <h1 className="text-5xl text-black logo-font mb-3">Quiz Complete! 🎊</h1>
              <p className="text-gray-600 text-lg">Great job on finishing the {language} quiz!</p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 border-3 border-blue-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl opacity-20">⭐</div>
              <div className="absolute bottom-4 left-4 text-5xl opacity-20">🌟</div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-7xl text-black logo-font mb-2">
                  {finalScore}/{questions.length}
                </div>
                <p className="text-gray-700 text-xl">
                  You scored {percentage.toFixed(0)}% 🎯
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleRetry}
                className="flex-1 py-7 text-lg rounded-3xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-4 border-blue-800 hover:scale-105 transition-all"
              >
                Try Again 🔄
              </Button>
              <Button
                variant="outline"
                onClick={() => router.visit('/quizme')}
                className="flex-1 py-7 text-lg rounded-3xl border-3 border-gray-800 hover:bg-yellow-100 hover:scale-105 transition-all"
              >
                Choose Another Quiz 📚
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout user={auth.user!}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.visit('/quizme')}
            className="rounded-3xl hover:bg-yellow-100 py-6 px-6 border-3 border-transparent hover:border-gray-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Quizzes
          </Button>
        </div>

      <Card className="p-8 rounded-[2rem] shadow-2xl bg-white border-4 border-gray-800">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-gray-700">
              Score: <span className="logo-font text-xl text-blue-600">{score}/{questions.length}</span>
            </span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl text-black logo-font mb-4 text-center">
            What is the {language} word for:
          </h2>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 border-3 border-blue-300 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-5xl opacity-20">💭</div>
            <p className="text-4xl lg:text-5xl text-black logo-font text-center relative z-10">
              "{question.english}"
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correct;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`p-6 rounded-2xl border-3 transition-all text-left ${
                  showCorrect
                    ? 'border-green-500 bg-green-100 scale-105'
                    : showIncorrect
                    ? 'border-red-500 bg-red-100'
                    : isSelected
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-800 hover:border-blue-500 hover:bg-blue-50 hover:scale-105'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl text-gray-900">{option}</span>
                  {showCorrect && (
                    <div className="flex items-center gap-1">
                      <Check className="w-7 h-7 text-green-600" />
                      <span className="text-2xl">✅</span>
                    </div>
                  )}
                  {showIncorrect && (
                    <div className="flex items-center gap-1">
                      <X className="w-7 h-7 text-red-600" />
                      <span className="text-2xl">❌</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {showResult && (
          <Button
            onClick={handleNext}
            className="w-full py-7 text-lg rounded-3xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-4 border-blue-800 hover:scale-105 transition-all"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
          </Button>
        )}
      </Card>
    </div>
    </AuthenticatedLayout>
  );
}
