export type Language = 'en' | 'fr';

export interface Translations {
  // Header
  title: string;
  subtitle: string;
  
  // Search
  searchPlaceholder: string;
  searchButton: string;
  searching: string;
  
  // Results
  foundResults: string;
  foundResult: string;
  noResultsTitle: string;
  noResultsMessage: string;
  recentResearchTitle: string;
  recentResearchSubtitle: string;
  refresh: string;
  loadingRecent: string;
  
  // Welcome
  welcomeTitle: string;
  welcomeMessage: string;
  noResearchYet: string;
  
  // Cards
  searchResearchTitle: string;
  searchResearchDescription: string;
  searchResearchHint: string;
  addResearchTitle: string;
  addResearchDescription: string;
  addResearchHint: string;
  
  // Suggestion
  suggestionsTitle: string;
  suggestionsDescription: string;
  suggestionPlaceholder: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  sendSuggestion: string;
  suggestionSuccess: string;
  
  // Provider filter
  allProviders: string;
  
  // Status messages
  researchAdded: string;
  
  // Footer
  madeWith: string;
  by: string;
  copyright: string;
  
  // Research card
  view: string;
  unknown: string;
  noDescription: string;
  
  // Common
  submit: string;
  cancel: string;
  close: string;
  optional: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    title: "Deep Research Archive",
    subtitle: "Share and discover AI-powered research from across the web",
    
    searchPlaceholder: "Search for research or paste a research URL to add it...",
    searchButton: "Search",
    searching: "Searching research archive...",
    
    foundResults: "research",
    foundResult: "research",
    noResultsTitle: "No research found",
    noResultsMessage: "Try different keywords or paste a research URL to add new content!",
    recentResearchTitle: "Recent Research",
    recentResearchSubtitle: "Discover the latest AI research shared by our community",
    refresh: "Refresh",
    loadingRecent: "Loading recent research...",
    
    welcomeTitle: "Welcome to Deep Research Archive",
    welcomeMessage: "Search through curated AI research or simply paste a URL to add new content to the archive.",
    noResearchYet: "No research found yet. Be the first to share valuable AI research by pasting a URL above!",
    
    searchResearchTitle: "Search Research",
    searchResearchDescription: "Find existing research by keywords, topics, or AI provider. Our archive contains curated content from Claude, ChatGPT, Gemini, and more.",
    searchResearchHint: "Just type your search terms in the bar above",
    addResearchTitle: "Add Research",
    addResearchDescription: "Share valuable AI research by pasting a URL. We'll automatically extract and index the content for others to discover.",
    addResearchHint: "Paste any research URL in the search bar and press Enter",
    
    suggestionsTitle: "Suggestions",
    suggestionsDescription: "Help us improve! Share your ideas and feedback.",
    suggestionPlaceholder: "Tell us what you think or suggest new features...",
    namePlaceholder: "Your name",
    emailPlaceholder: "Your email",
    sendSuggestion: "Send Suggestion",
    suggestionSuccess: "Thank you! Your suggestion has been sent.",
    
    allProviders: "All Providers",
    
    researchAdded: "Research added successfully!",
    
    madeWith: "Made with",
    by: "by",
    copyright: "© 2024 RITSL.COM - Empowering AI Research Discovery",
    
    view: "View",
    unknown: "Unknown",
    noDescription: "No description available",
    
    submit: "Submit",
    cancel: "Cancel",
    close: "Close",
    optional: "optional",
  },
  
  fr: {
    title: "Archive de Recherche Approfondie",
    subtitle: "Partagez et découvrez la recherche IA à travers le web",
    
    searchPlaceholder: "Recherchez une étude ou collez une URL de recherche pour l'ajouter...",
    searchButton: "Rechercher",
    searching: "Recherche dans l'archive...",
    
    foundResults: "recherches",
    foundResult: "recherche",
    noResultsTitle: "Aucune recherche trouvée",
    noResultsMessage: "Essayez des mots-clés différents ou collez une URL de recherche pour ajouter du nouveau contenu !",
    recentResearchTitle: "Recherches Récentes",
    recentResearchSubtitle: "Découvrez les dernières recherches IA partagées par notre communauté",
    refresh: "Actualiser",
    loadingRecent: "Chargement des recherches récentes...",
    
    welcomeTitle: "Bienvenue dans l'Archive de Recherche Approfondie",
    welcomeMessage: "Recherchez dans la recherche IA organisée ou collez simplement une URL pour ajouter du nouveau contenu à l'archive.",
    noResearchYet: "Aucune recherche trouvée pour le moment. Soyez le premier à partager une recherche IA précieuse en collant une URL ci-dessus !",
    
    searchResearchTitle: "Rechercher",
    searchResearchDescription: "Trouvez des recherches existantes par mots-clés, sujets ou fournisseur IA. Notre archive contient du contenu organisé de Claude, ChatGPT, Gemini, et plus.",
    searchResearchHint: "Tapez simplement vos termes de recherche dans la barre ci-dessus",
    addResearchTitle: "Ajouter une Recherche",
    addResearchDescription: "Partagez une recherche IA précieuse en collant une URL. Nous extrairons et indexerons automatiquement le contenu pour que d'autres puissent le découvrir.",
    addResearchHint: "Collez n'importe quelle URL de recherche dans la barre de recherche et appuyez sur Entrée",
    
    suggestionsTitle: "Suggestions",
    suggestionsDescription: "Aidez-nous à améliorer ! Partagez vos idées et commentaires.",
    suggestionPlaceholder: "Dites-nous ce que vous pensez ou suggérez de nouvelles fonctionnalités...",
    namePlaceholder: "Votre nom",
    emailPlaceholder: "Votre email",
    sendSuggestion: "Envoyer la Suggestion",
    suggestionSuccess: "Merci ! Votre suggestion a été envoyée.",
    
    allProviders: "Tous les Fournisseurs",
    
    researchAdded: "Recherche ajoutée avec succès !",
    
    madeWith: "Fait avec",
    by: "par",
    copyright: "© 2024 RITSL.COM - Favoriser la Découverte de Recherche IA",
    
    view: "Voir",
    unknown: "Inconnu",
    noDescription: "Aucune description disponible",
    
    submit: "Soumettre",
    cancel: "Annuler",
    close: "Fermer",
    optional: "optionnel",
  },
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
} 