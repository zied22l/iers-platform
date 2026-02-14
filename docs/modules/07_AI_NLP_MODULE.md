# Module 7: AI/NLP Recommendation Module

## Overview
Uses Natural Language Processing and Machine Learning to analyze activity descriptions and match with employee profiles.

## Architecture

### Python Microservice (FastAPI)

#### Directory Structure
```
ai-service/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── models/
│   │   ├── skill_extractor.py
│   │   ├── text_embedder.py
│   │   ├── activity_classifier.py
│   │   └── matcher.py
│   ├── services/
│   │   ├── nlp_service.py
│   │   ├── recommendation_service.py
│   │   ├── training_service.py
│   │   └── feedback_service.py
│   ├── api/
│   │   ├── routes.py
│   │   └── schemas.py
│   ├── utils/
│   │   ├── preprocessing.py
│   │   └── vectorization.py
│   └── data/
│       ├── models/
│       └── embeddings/
├── requirements.txt
├── Dockerfile
└── tests/
```

### Key Components

#### 1. Skill Extraction

```python
# skill_extractor.py
import spacy
from transformers import pipeline

class SkillExtractor:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_lg")
        self.ner_pipeline = pipeline("ner", model="dslim/bert-base-NER")
        self.skill_database = self.load_skill_database()
    
    def extract_skills(self, text):
        # 1. Named Entity Recognition
        entities = self.ner_pipeline(text)
        
        # 2. Pattern matching
        doc = self.nlp(text)
        patterns = self.match_skill_patterns(doc)
        
        # 3. Semantic similarity with known skills
        candidates = entities + patterns
        matched_skills = self.match_to_database(candidates)
        
        return {
            'skills': matched_skills,
            'confidence': self.calculate_confidence(matched_skills),
            'raw_entities': entities
        }
    
    def match_to_database(self, candidates):
        matched = []
        for candidate in candidates:
            # Use semantic similarity
            similarities = self.calculate_similarities(
                candidate, 
                self.skill_database
            )
            
            best_match = max(similarities, key=lambda x: x['score'])
            if best_match['score'] > 0.7:
                matched.append(best_match)
        
        return matched
```

#### 2. Text Embedding

```python
# text_embedder.py
from sentence_transformers import SentenceTransformer

class TextEmbedder:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def embed_activity(self, activity):
        # Combine relevant fields
        text = f"{activity['title']} {activity['description']}"
        
        # Generate embedding
        embedding = self.model.encode(text)
        
        return embedding
    
    def embed_employee_profile(self, employee):
        # Combine job description and skills
        skills_text = " ".join([s['name'] for s in employee['skills']])
        text = f"{employee['jobDescription']} {skills_text}"
        
        embedding = self.model.encode(text)
        
        return embedding
    
    def calculate_similarity(self, embedding1, embedding2):
        # Cosine similarity
        from sklearn.metrics.pairwise import cosine_similarity
        return cosine_similarity([embedding1], [embedding2])[0][0]
```

#### 3. Activity Classification

```python
# activity_classifier.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class ActivityClassifier:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
        self.model = AutoModelForSequenceClassification.from_pretrained(
            "./models/activity_classifier"
        )
        
        self.categories = [
            "TECHNICAL",
            "MANAGEMENT",
            "SOFT_SKILLS",
            "CERTIFICATION",
            "MIXED"
        ]
    
    def classify(self, activity_description):
        inputs = self.tokenizer(
            activity_description,
            return_tensors="pt",
            truncation=True,
            max_length=512
        )
        
        outputs = self.model(**inputs)
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        category_idx = torch.argmax(predictions).item()
        confidence = predictions[0][category_idx].item()
        
        return {
            'category': self.categories[category_idx],
            'confidence': confidence,
            'all_scores': dict(zip(self.categories, predictions[0].tolist()))
        }
```

#### 4. Intelligent Matcher

```python
# matcher.py
import numpy as np

class IntelligentMatcher:
    def __init__(self, embedder, skill_extractor, classifier):
        self.embedder = embedder
        self.skill_extractor = skill_extractor
        self.classifier = classifier
    
    def match_employees(self, activity, employees, context):
        # 1. Extract skills from activity description
        extracted_skills = self.skill_extractor.extract_skills(
            activity['description']
        )
        
        # 2. Classify activity
        classification = self.classifier.classify(activity['description'])
        
        # 3. Generate activity embedding
        activity_embedding = self.embedder.embed_activity(activity)
        
        # 4. Score each employee
        scores = []
        for employee in employees:
            score = self.calculate_match_score(
                employee,
                activity,
                activity_embedding,
                extracted_skills,
                classification,
                context
            )
            scores.append({
                'employeeId': employee['id'],
                'score': score['total'],
                'breakdown': score['breakdown'],
                'reasoning': score['reasoning']
            })
        
        # 5. Sort and return top matches
        scores.sort(key=lambda x: x['score'], reverse=True)
        return scores
    
    def calculate_match_score(self, employee, activity, 
                             activity_embedding, extracted_skills,
                             classification, context):
        # Semantic similarity
        employee_embedding = self.embedder.embed_employee_profile(employee)
        semantic_score = self.embedder.calculate_similarity(
            activity_embedding,
            employee_embedding
        ) * 100
        
        # Skill match score
        skill_score = self.calculate_skill_match(
            employee['skills'],
            extracted_skills['skills']
        )
        
        # Experience relevance
        experience_score = self.calculate_experience_relevance(
            employee,
            classification['category']
        )
        
        # Context adjustment
        context_multiplier = self.get_context_multiplier(
            employee,
            context
        )
        
        # Weighted combination
        total_score = (
            semantic_score * 0.3 +
            skill_score * 0.4 +
            experience_score * 0.3
        ) * context_multiplier
        
        return {
            'total': total_score,
            'breakdown': {
                'semantic': semantic_score,
                'skills': skill_score,
                'experience': experience_score,
                'context_multiplier': context_multiplier
            },
            'reasoning': self.generate_reasoning(
                semantic_score, skill_score, experience_score
            )
        }
```

#### 5. Continuous Learning

```python
# training_service.py
class TrainingService:
    def __init__(self):
        self.feedback_data = []
    
    def collect_feedback(self, recommendation_id, feedback):
        """Collect feedback on recommendations"""
        self.feedback_data.append({
            'recommendation_id': recommendation_id,
            'predicted_score': feedback['predicted_score'],
            'actual_performance': feedback['actual_performance'],
            'manager_rating': feedback['manager_rating'],
            'timestamp': datetime.now()
        })
    
    def retrain_model(self):
        """Retrain model with collected feedback"""
        if len(self.feedback_data) < 100:
            return {"status": "insufficient_data"}
        
        # Prepare training data
        X, y = self.prepare_training_data(self.feedback_data)
        
        # Retrain model
        self.model.fit(X, y)
        
        # Evaluate
        metrics = self.evaluate_model(X, y)
        
        # Save updated model
        self.save_model()
        
        return {
            "status": "success",
            "metrics": metrics,
            "samples_used": len(self.feedback_data)
        }
    
    def adjust_weights(self):
        """Dynamically adjust scoring weights based on feedback"""
        # Analyze which factors correlate best with success
        correlations = self.analyze_correlations(self.feedback_data)
        
        # Adjust weights
        new_weights = self.optimize_weights(correlations)
        
        return new_weights
```

### API Endpoints

```python
# routes.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

@app.post("/ai/extract-skills")
async def extract_skills(request: SkillExtractionRequest):
    """Extract skills from activity description"""
    result = skill_extractor.extract_skills(request.text)
    return result

@app.post("/ai/match-employees")
async def match_employees(request: MatchRequest):
    """Match employees to activity using AI"""
    matches = matcher.match_employees(
        request.activity,
        request.employees,
        request.context
    )
    return matches

@app.post("/ai/classify-activity")
async def classify_activity(request: ClassificationRequest):
    """Classify activity type"""
    classification = classifier.classify(request.description)
    return classification

@app.post("/ai/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """Submit feedback for continuous learning"""
    training_service.collect_feedback(
        feedback.recommendation_id,
        feedback.data
    )
    return {"status": "success"}

@app.post("/ai/retrain")
async def retrain_model():
    """Trigger model retraining"""
    result = training_service.retrain_model()
    return result

@app.get("/ai/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}
```

## NestJS Integration

### Directory Structure
```
src/modules/ai-integration/
├── dto/
│   ├── ai-request.dto.ts
│   ├── skill-extraction.dto.ts
│   └── match-request.dto.ts
├── ai-integration.controller.ts
├── ai-integration.service.ts
└── ai-integration.module.ts
```

### Integration Service

```typescript
// ai-integration.service.ts
@Injectable()
export class AIIntegrationService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL;
  
  async extractSkills(text: string) {
    const response = await axios.post(
      `${this.aiServiceUrl}/ai/extract-skills`,
      { text }
    );
    return response.data;
  }
  
  async matchEmployees(activity, employees, context) {
    const response = await axios.post(
      `${this.aiServiceUrl}/ai/match-employees`,
      { activity, employees, context }
    );
    return response.data;
  }
  
  async submitFeedback(recommendationId, feedback) {
    await axios.post(
      `${this.aiServiceUrl}/ai/feedback`,
      { recommendation_id: recommendationId, data: feedback }
    );
  }
}
```

## Frontend (React)

### Directory Structure
```
src/modules/ai-recommendations/
├── components/
│   ├── AIMatchResults.tsx
│   ├── SkillExtractionView.tsx
│   ├── ConfidenceIndicator.tsx
│   ├── ReasoningDisplay.tsx
│   └── FeedbackForm.tsx
├── hooks/
│   └── useAIRecommendations.ts
├── services/
│   └── aiService.ts
└── types/
    └── ai.types.ts
```

### Key Components

#### AIMatchResults.tsx
- Display AI-generated matches
- Show confidence scores
- Explain reasoning
- Compare with traditional scoring

#### SkillExtractionView.tsx
- Show extracted skills
- Confidence indicators
- Manual correction interface
- Skill mapping

## Deployment

### Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_lg

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Requirements
```txt
fastapi==0.104.1
uvicorn==0.24.0
spacy==3.7.2
transformers==4.35.2
sentence-transformers==2.2.2
torch==2.1.0
scikit-learn==1.3.2
numpy==1.24.3
pandas==2.1.3
```

## Integration Points
- Integrates with Activity Management
- Integrates with Employee Management
- Integrates with Skill Management
- Feeds into Optimization Module
