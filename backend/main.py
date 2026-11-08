
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

from db import get_connection


# Initialize FastAPI
app = FastAPI(title="AI Vector Search API")


# React frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load embedding model once
model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


# Request schemas
class DocumentRequest(BaseModel):
    content: str = Field(min_length=1)
    category: str = "General"


class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    limit: int = Field(default=5, ge=1, le=50)


# Health API
@app.get("/api/health")
def health():

    return {
        "status": "success",
        "message": "Vector Search API is running"
    }


# Insert document API
@app.post("/api/documents")
def insert_document(request: DocumentRequest):

    content = request.content.strip()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Content cannot be empty"
        )

    try:

        # Generate embedding
        embedding = model.encode(
            content,
            normalize_embeddings=True
        )

        conn = get_connection()

        try:
            cursor = conn.execute(
                """
                INSERT INTO documents
                (content, category, embedding)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (
                    content,
                    request.category,
                    embedding
                )
            )

            document_id = cursor.fetchone()[0]

            conn.commit()

        finally:
            conn.close()

        return {
            "status": "success",
            "message": "Document inserted successfully",
            "document_id": document_id
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# Get all documents API
@app.get("/api/documents")
def get_documents():
    try:
        conn = get_connection()

        try:
            cursor = conn.execute(
                """
                SELECT id, content, category
                FROM documents
                ORDER BY id DESC
                """
            )

            rows = cursor.fetchall()

            documents = []

            for row in rows:
                documents.append({
                    "id": row[0],
                    "content": row[1],
                    "category": row[2]
                })

        finally:
            conn.close()

        return {
            "status": "success",
            "total_documents": len(documents),
            "documents": documents
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    

# Semantic search API
@app.post("/api/search")
def search_documents(request: SearchRequest):

    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )

    try:

        # Convert user query into embedding
        query_embedding = model.encode(
            query,
            normalize_embeddings=True
        )

        conn = get_connection()

        try:

            results = conn.execute(
                """
                SELECT
                    id,
                    content,
                    category,
                    embedding <=> %s AS distance

                FROM documents
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> %s
                LIMIT %s
                """,
                (
                    query_embedding,
                    query_embedding,
                    request.limit
                )
            ).fetchall()

        finally:
            conn.close()

        documents = []

        for row in results:

            distance = float(row[3])

            # Cosine distance to similarity percentage
            similarity = (1 - distance) * 100

            documents.append({
                "id": row[0],
                "content": row[1],
                "category": row[2],
                "similarity": round(similarity, 2),
                "distance": round(distance, 4)
            })

        return {
            "status": "success",
            "query": query,
            "total_results": len(documents),
            "results": documents
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
