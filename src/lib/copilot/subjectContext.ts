import { PageContext, SubjectContext } from './types';

export const subjects: Record<string, SubjectContext> = {
    laws: { slug: 'laws', title: 'Business Laws', description: '', color: '', availableResources: [] },
    economics: { slug: 'economics', title: 'Economics', description: '', color: '', availableResources: [] },
    accounting: { slug: 'accounting', title: 'Accounting', description: '', color: '', availableResources: [] },
    qa: { slug: 'qa', title: 'Quantitative Aptitude', description: '', color: '', availableResources: [] },
};

export function resolveSubjectContext(pathname: string): SubjectContext | null {
    const parts = pathname.split('/');
    if (parts.length >= 3 && parts[1] === 'subjects') {
        const slug = parts[2];
        return subjects[slug] || null;
    }
    return null;
}

export function getSuggestions(context: SubjectContext | null, pageContext?: PageContext | null): string[] {
    if (pageContext) {
        return [
            `Summarize ${pageContext.activeResource?.title || 'this page'}`,
            `Quiz me on this chapter`,
            `Explain the key concepts here`,
            `Create flashcards for this material`
        ];
    }
    if (context) {
        return [
            `Quiz me on ${context.title}`,
            `Summarize ${context.title}`,
            `Create a study plan for ${context.title}`,
            `What are the most important topics?`
        ];
    }
    return [
        "What subjects are available?",
        "How should I start studying for CA Foundation?",
        "Create a study plan for this week",
        "What are the most important topics?"
    ];
}
