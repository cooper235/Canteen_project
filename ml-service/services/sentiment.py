from textblob import TextBlob
import re
from collections import defaultdict
from datetime import datetime

class SentimentService:
    """
    Sentiment Analysis using:
    1. TextBlob for sentiment scoring
    2. Keyword extraction for insights
    3. Aggregated sentiment metrics
    """
    
    def __init__(self):
        self.sentiment_cache = {}  # Cache for canteen insights
        
        # Common food-related positive/negative keywords
        self.positive_keywords = [
            'delicious', 'tasty', 'fresh', 'good', 'excellent', 'amazing',
            'love', 'great', 'perfect', 'wonderful', 'fantastic', 'yummy',
            'best', 'awesome', 'nice', 'quality', 'recommended'
        ]
        
        self.negative_keywords = [
            'bad', 'terrible', 'awful', 'poor', 'horrible', 'disgusting',
            'cold', 'stale', 'tasteless', 'overpriced', 'slow', 'rude',
            'worst', 'disappointed', 'bland', 'soggy', 'burnt'
        ]
    
    def analyze(self, text):
        """
        Analyze sentiment of a single review
        
        Returns: {
            "sentiment": "positive|neutral|negative",
            "score": 0.75,  # -1 to 1
            "confidence": 0.85,
            "keywords": ["delicious", "fresh"],
            "aspects": {
                "food_quality": 0.8,
                "service": 0.6,
                "value": 0.7
            }
        }
        """
        if not text or len(text.strip()) < 3:
            return {
                "sentiment": "neutral",
                "score": 0,
                "confidence": 0,
                "keywords": [],
                "aspects": {}
            }
        
        # Clean text
        text = self._clean_text(text)
        
        # Get sentiment using TextBlob
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # Determine sentiment category
        if polarity > 0.1:
            sentiment = "positive"
        elif polarity < -0.1:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        # Extract keywords
        keywords = self._extract_keywords(text)
        
        # Analyze aspects (food quality, service, value)
        aspects = self._analyze_aspects(text, blob)
        
        return {
            "sentiment": sentiment,
            "score": round(polarity, 2),
            "confidence": round(subjectivity, 2),
            "keywords": keywords,
            "aspects": aspects
        }
    
    def analyze_batch(self, reviews):
        """
        Analyze multiple reviews
        
        reviews format: [
            {"review_id": "...", "text": "...", "dish_id": "..."},
            ...
        ]
        
        Returns: [
            {"review_id": "...", "sentiment": {...}},
            ...
        ]
        """
        results = []
        
        for review in reviews:
            review_id = review.get('review_id', review.get('_id'))
            text = review.get('comment', review.get('text', ''))
            
            sentiment = self.analyze(text)
            
            results.append({
                "review_id": str(review_id),
                "dish_id": review.get('dish'),
                "sentiment": sentiment
            })
        
        return results
    
    def get_insights(self, canteen_id, reviews=None):
        """
        Get aggregated sentiment insights for a canteen
        
        Returns: {
            "overall_sentiment": "positive",
            "average_score": 0.65,
            "sentiment_distribution": {
                "positive": 75,
                "neutral": 15,
                "negative": 10
            },
            "top_positive_keywords": ["delicious", "fresh", "great"],
            "top_negative_keywords": ["slow", "cold"],
            "trending": "improving",
            "aspects_scores": {
                "food_quality": 0.8,
                "service": 0.6,
                "value": 0.7
            }
        }
        """
        if not reviews:
            return self._get_cached_insights(canteen_id)
        
        # Analyze all reviews
        sentiments = []
        all_keywords = {"positive": [], "negative": []}
        aspects_scores = defaultdict(list)
        
        for review in reviews:
            text = review.get('comment', review.get('text', ''))
            if not text:
                continue
            
            result = self.analyze(text)
            sentiments.append(result)
            
            # Collect keywords
            for kw in result['keywords']:
                if kw in self.positive_keywords:
                    all_keywords['positive'].append(kw)
                elif kw in self.negative_keywords:
                    all_keywords['negative'].append(kw)
            
            # Collect aspect scores
            for aspect, score in result['aspects'].items():
                aspects_scores[aspect].append(score)
        
        if not sentiments:
            return {
                "overall_sentiment": "neutral",
                "average_score": 0,
                "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                "top_positive_keywords": [],
                "top_negative_keywords": [],
                "trending": "stable",
                "aspects_scores": {}
            }
        
        # Calculate distribution
        distribution = {
            "positive": sum(1 for s in sentiments if s['sentiment'] == 'positive'),
            "neutral": sum(1 for s in sentiments if s['sentiment'] == 'neutral'),
            "negative": sum(1 for s in sentiments if s['sentiment'] == 'negative')
        }
        
        # Overall sentiment
        avg_score = sum(s['score'] for s in sentiments) / len(sentiments)
        if avg_score > 0.1:
            overall = "positive"
        elif avg_score < -0.1:
            overall = "negative"
        else:
            overall = "neutral"
        
        # Top keywords
        from collections import Counter
        top_positive = [kw for kw, _ in Counter(all_keywords['positive']).most_common(5)]
        top_negative = [kw for kw, _ in Counter(all_keywords['negative']).most_common(5)]
        
        # Average aspect scores
        avg_aspects = {}
        for aspect, scores in aspects_scores.items():
            avg_aspects[aspect] = round(sum(scores) / len(scores), 2)
        
        # Trending (compare recent vs older reviews)
        trending = "stable"
        if len(sentiments) >= 10:
            recent_avg = sum(s['score'] for s in sentiments[-5:]) / 5
            older_avg = sum(s['score'] for s in sentiments[:5]) / 5
            
            if recent_avg > older_avg + 0.2:
                trending = "improving"
            elif recent_avg < older_avg - 0.2:
                trending = "declining"
        
        insights = {
            "overall_sentiment": overall,
            "average_score": round(avg_score, 2),
            "sentiment_distribution": distribution,
            "top_positive_keywords": top_positive,
            "top_negative_keywords": top_negative,
            "trending": trending,
            "aspects_scores": avg_aspects,
            "total_reviews": len(sentiments)
        }
        
        # Cache insights
        self.sentiment_cache[canteen_id] = insights
        
        return insights
    
    def _clean_text(self, text):
        """Clean and normalize text"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def _extract_keywords(self, text):
        """Extract relevant keywords from text"""
        keywords = []
        text_lower = text.lower()
        
        # Check for positive keywords
        for kw in self.positive_keywords:
            if kw in text_lower:
                keywords.append(kw)
        
        # Check for negative keywords
        for kw in self.negative_keywords:
            if kw in text_lower:
                keywords.append(kw)
        
        return keywords[:5]  # Return top 5
    
    def _analyze_aspects(self, text, blob):
        """Analyze specific aspects of the review"""
        aspects = {}
        text_lower = text.lower()
        
        # Food quality indicators
        food_terms = ['food', 'dish', 'taste', 'tasty', 'delicious', 'fresh', 'quality']
        if any(term in text_lower for term in food_terms):
            aspects['food_quality'] = blob.sentiment.polarity
        
        # Service indicators
        service_terms = ['service', 'staff', 'waiter', 'serve', 'quick', 'fast', 'slow']
        if any(term in text_lower for term in service_terms):
            aspects['service'] = blob.sentiment.polarity
        
        # Value/price indicators
        value_terms = ['price', 'value', 'worth', 'cheap', 'expensive', 'affordable']
        if any(term in text_lower for term in value_terms):
            aspects['value'] = blob.sentiment.polarity
        
        return aspects
    
    def _get_cached_insights(self, canteen_id):
        """Get cached insights if available"""
        return self.sentiment_cache.get(canteen_id, {
            "overall_sentiment": "neutral",
            "average_score": 0,
            "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
            "top_positive_keywords": [],
            "top_negative_keywords": [],
            "trending": "stable",
            "aspects_scores": {},
            "note": "No cached data available"
        })
