import numpy as np
import pandas as pd
from collections import defaultdict, Counter
from datetime import datetime
import pickle
import os

class RecommendationService:
    """
    Smart Order Recommendations using:
    1. Collaborative Filtering (User-based)
    2. Association Rules (Frequently bought together)
    3. Popularity-based recommendations (fallback)
    """
    
    def __init__(self):
        self.user_item_matrix = None
        self.item_similarity = None
        self.popular_items = []
        self.association_rules = {}
        self.model_path = 'models/recommendation_model.pkl'
        self.load_model()
    
    def train_model(self, orders_data):
        """
        Train recommendation model from orders data
        
        orders_data format: [
            {
                "student": "user_id",
                "items": [{"dish": "dish_id", "quantity": 1}],
                "createdAt": "timestamp"
            }
        ]
        """
        if not orders_data or len(orders_data) < 10:
            return {"message": "Insufficient data for training", "orders_count": len(orders_data)}
        
        # Convert to DataFrame
        df = pd.DataFrame(orders_data)
        
        # Flatten items
        rows = []
        for _, order in df.iterrows():
            user_id = str(order['student'])
            for item in order['items']:
                rows.append({
                    'user_id': user_id,
                    'dish_id': str(item['dish']),
                    'quantity': item.get('quantity', 1)
                })
        
        interactions_df = pd.DataFrame(rows)
        
        # 1. Build User-Item Matrix (for collaborative filtering)
        self.user_item_matrix = interactions_df.pivot_table(
            index='user_id',
            columns='dish_id',
            values='quantity',
            aggfunc='sum',
            fill_value=0
        )
        
        # 2. Calculate Item Similarity (Cosine similarity)
        from sklearn.metrics.pairwise import cosine_similarity
        item_matrix = self.user_item_matrix.T
        self.item_similarity = cosine_similarity(item_matrix)
        
        # 3. Find Popular Items
        item_counts = interactions_df.groupby('dish_id')['quantity'].sum()
        self.popular_items = item_counts.nlargest(20).index.tolist()
        
        # 4. Mine Association Rules (items frequently bought together)
        self._mine_association_rules(interactions_df)
        
        # Save model
        self._save_model()
        
        return {
            "users_count": len(self.user_item_matrix),
            "items_count": len(self.user_item_matrix.columns),
            "popular_items_count": len(self.popular_items),
            "association_rules_count": len(self.association_rules)
        }
    
    def get_recommendations(self, user_id, limit=10, canteen_id=None):
        """
        Get personalized recommendations for a user
        
        Returns: [
            {
                "dish_id": "...",
                "score": 0.95,
                "reason": "Based on your previous orders"
            }
        ]
        """
        recommendations = []
        
        # Strategy 1: Collaborative Filtering (if user has order history)
        if self.user_item_matrix is not None and user_id in self.user_item_matrix.index:
            collab_recs = self._get_collaborative_recommendations(user_id, limit * 2)
            recommendations.extend(collab_recs)
        
        # Strategy 2: Association Rules (based on user's recent items)
        if user_id in self.user_item_matrix.index:
            user_items = self.user_item_matrix.loc[user_id]
            recent_items = user_items[user_items > 0].index.tolist()
            if recent_items:
                assoc_recs = self._get_association_recommendations(recent_items[:3], limit)
                recommendations.extend(assoc_recs)
        
        # Strategy 3: Popular Items (fallback)
        if len(recommendations) < limit:
            popular_recs = [
                {"dish_id": dish_id, "score": 0.5, "reason": "Popular choice"}
                for dish_id in self.popular_items[:limit]
            ]
            recommendations.extend(popular_recs)
        
        # Deduplicate and sort by score
        seen = set()
        unique_recs = []
        for rec in recommendations:
            if rec['dish_id'] not in seen:
                seen.add(rec['dish_id'])
                unique_recs.append(rec)
        
        unique_recs.sort(key=lambda x: x['score'], reverse=True)
        
        return unique_recs[:limit]
    
    def _get_collaborative_recommendations(self, user_id, limit):
        """User-based collaborative filtering"""
        recommendations = []
        
        try:
            user_vector = self.user_item_matrix.loc[user_id]
            already_ordered = set(user_vector[user_vector > 0].index)
            
            # Find similar users
            from sklearn.metrics.pairwise import cosine_similarity
            user_similarities = cosine_similarity(
                user_vector.values.reshape(1, -1),
                self.user_item_matrix.values
            )[0]
            
            # Get top 10 similar users
            similar_user_indices = np.argsort(user_similarities)[-11:-1][::-1]
            
            # Aggregate their preferences
            item_scores = defaultdict(float)
            for idx in similar_user_indices:
                similar_user = self.user_item_matrix.iloc[idx]
                similarity_score = user_similarities[idx]
                
                for dish_id, count in similar_user.items():
                    if count > 0 and dish_id not in already_ordered:
                        item_scores[dish_id] += count * similarity_score
            
            # Convert to recommendations
            for dish_id, score in sorted(item_scores.items(), key=lambda x: x[1], reverse=True)[:limit]:
                recommendations.append({
                    "dish_id": dish_id,
                    "score": min(score / 10, 1.0),  # Normalize
                    "reason": "Based on your previous orders"
                })
        
        except Exception as e:
            print(f"Collaborative filtering error: {e}")
        
        return recommendations
    
    def _get_association_recommendations(self, recent_items, limit):
        """Recommendations based on association rules"""
        recommendations = []
        
        for item in recent_items:
            if item in self.association_rules:
                for associated_item, confidence in self.association_rules[item][:limit]:
                    recommendations.append({
                        "dish_id": associated_item,
                        "score": confidence,
                        "reason": "Frequently ordered together"
                    })
        
        return recommendations
    
    def _mine_association_rules(self, interactions_df):
        """Mine association rules (items frequently bought together)"""
        # Group by user to get baskets
        baskets = interactions_df.groupby('user_id')['dish_id'].apply(list).tolist()
        
        # Count item pairs
        pair_counts = defaultdict(int)
        item_counts = Counter()
        
        for basket in baskets:
            unique_items = list(set(basket))
            item_counts.update(unique_items)
            
            # Count pairs
            for i, item1 in enumerate(unique_items):
                for item2 in unique_items[i+1:]:
                    pair = tuple(sorted([item1, item2]))
                    pair_counts[pair] += 1
        
        # Calculate confidence (support(A,B) / support(A))
        min_support = 3  # Minimum times items must appear together
        
        for (item1, item2), count in pair_counts.items():
            if count >= min_support:
                conf1 = count / item_counts[item1] if item_counts[item1] > 0 else 0
                conf2 = count / item_counts[item2] if item_counts[item2] > 0 else 0
                
                if item1 not in self.association_rules:
                    self.association_rules[item1] = []
                if item2 not in self.association_rules:
                    self.association_rules[item2] = []
                
                self.association_rules[item1].append((item2, conf1))
                self.association_rules[item2].append((item1, conf2))
        
        # Sort by confidence
        for item in self.association_rules:
            self.association_rules[item].sort(key=lambda x: x[1], reverse=True)
    
    def _save_model(self):
        """Save trained model to disk"""
        os.makedirs('models', exist_ok=True)
        model_data = {
            'user_item_matrix': self.user_item_matrix,
            'item_similarity': self.item_similarity,
            'popular_items': self.popular_items,
            'association_rules': self.association_rules
        }
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load trained model from disk"""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                self.user_item_matrix = model_data.get('user_item_matrix')
                self.item_similarity = model_data.get('item_similarity')
                self.popular_items = model_data.get('popular_items', [])
                self.association_rules = model_data.get('association_rules', {})
                print(f"Model loaded from {self.model_path}")
            except Exception as e:
                print(f"Error loading model: {e}")
