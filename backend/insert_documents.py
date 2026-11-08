import psycopg
from pgvector.psycopg import register_vector
from sentence_transformers import SentenceTransformer

# Load local embedding model
model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


# Connect to PostgreSQL
conn = psycopg.connect(
      host="localhost", port=5432, user="postgres", password="postgres", dbname="vectordb"
  )

register_vector(conn)



documents = [
    ("Python is used for machine learning.", "AI"),
    ("FastAPI is used to build backend APIs.", "Backend"),
    ("PostgreSQL is a relational database.", "Database"),
    ("React is used to build frontend applications.", "Frontend"),
    ("Docker packages applications into containers.", "DevOps"),
    ("Java is popular for enterprise applications.", "Backend"),
    ("Machine learning uses data to train models.", "AI")
]

for content, category in documents:

    # Generate embedding locally
    embedding = model.encode(content)

    # Insert into PostgreSQL
    conn.execute(
        """
        INSERT INTO documents (content, category, embedding)
        VALUES (%s, %s, %s)
        """,
        (content, category, embedding)
    )

conn.commit()
conn.close()

print("Documents inserted successfully!")