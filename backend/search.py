import psycopg
from pgvector.psycopg import register_vector
from sentence_transformers import SentenceTransformer

model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

conn = psycopg.connect(
    host="127.0.0.1",
    port=5432,
    user="postgres",
    password="postgres",
    dbname="vectordb"
)

register_vector(conn)

query = "How can I create a backend API?"

# Convert query into embedding
query_embedding = model.encode(query)

# Search using cosine distance
results = conn.execute(
    """
    SELECT
        id,
        content,
        category,
        embedding <=> %s AS distance
    FROM documents
    ORDER BY embedding <=> %s
    LIMIT 3
    """,
    (query_embedding, query_embedding)
).fetchall()

for row in results:
    print("\nDocument:", row[1])
    print("Category:", row[2])
    print("Distance:", row[3])

conn.close()