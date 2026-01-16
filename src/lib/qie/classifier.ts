import { NewsEvent, Source } from '@/types';

interface ExternalNewsItem {
    headline: string;
    url: string;
    source: string;
    timestamp: string;
}

export class EventClassifier {
    // Confidence threshold
    private readonly THRESHOLD = 0.7;

    async validateEvent(items: ExternalNewsItem[]): Promise<{ isValid: boolean; confidence: number; category?: string }> {
        // 1. Check if multiple sources reported it (simulated)
        if (items.length < 2) {
            return { isValid: false, confidence: 0.3 };
        }

        // 2. AI Analysis (Mocked)
        // In real system: call Gemini to check newsworthiness vs noise
        return {
            isValid: true,
            confidence: 0.85,
            category: 'Technology' // Mocked classification
        };
    }

    async extractFacts(items: ExternalNewsItem[]): Promise<string[]> {
        // Extract key facts without opinion
        return [
            `Reported by ${items[0].source}`,
            `Topic: ${items[0].headline}`,
            'Confirmed by multiple outlets'
        ];
    }
}
