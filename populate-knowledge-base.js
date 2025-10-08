/**
 * Script to populate Qdrant with initial knowledge base documents
 * Run with: node populate-knowledge-base.js
 */

const API_URL = 'https://knowledge-base-assistant-kedarrpandyas-projects.vercel.app';

const documents = [
  {
    title: "Introduction to Machine Learning",
    content: `Machine Learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. 
    
    Key concepts include:
    - Supervised Learning: Training models with labeled data
    - Unsupervised Learning: Finding patterns in unlabeled data
    - Reinforcement Learning: Learning through trial and error
    - Neural Networks: Computational models inspired by the human brain
    
    Common applications include image recognition, natural language processing, recommendation systems, and predictive analytics.`,
    category: "Technology",
    author: "Knowledge Assistant",
    source: "Initial Dataset"
  },
  {
    title: "JavaScript Fundamentals",
    content: `JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web.
    
    Key features:
    - Dynamic typing and first-class functions
    - Prototype-based object orientation
    - Event-driven programming
    - Asynchronous programming with Promises and async/await
    
    JavaScript runs on both client-side (browsers) and server-side (Node.js), making it a versatile language for full-stack development.`,
    category: "Programming",
    author: "Knowledge Assistant",
    source: "Initial Dataset"
  },
  {
    title: "Understanding RAG Systems",
    content: `Retrieval-Augmented Generation (RAG) is an AI framework that combines information retrieval with text generation.
    
    How it works:
    1. Document Indexing: Documents are converted to embeddings and stored in a vector database
    2. Query Processing: User queries are converted to embeddings
    3. Semantic Search: Similar documents are retrieved based on vector similarity
    4. Context Enhancement: Retrieved documents provide context to the language model
    5. Answer Generation: LLM generates responses using the retrieved context
    
    Benefits include reduced hallucinations, up-to-date information, and domain-specific knowledge integration.`,
    category: "AI",
    author: "Knowledge Assistant",
    source: "Initial Dataset"
  },
  {
    title: "React Best Practices",
    content: `React is a JavaScript library for building user interfaces, particularly single-page applications.
    
    Best practices include:
    - Component Composition: Break UI into reusable components
    - State Management: Use hooks like useState and useEffect appropriately
    - Performance Optimization: Implement React.memo, useMemo, and useCallback
    - Code Organization: Follow consistent folder structure and naming conventions
    - Testing: Write unit and integration tests for components
    
    Modern React development often includes TypeScript for type safety and tools like Vite for faster builds.`,
    category: "Web Development",
    author: "Knowledge Assistant",
    source: "Initial Dataset"
  },
  {
    title: "Vector Databases Explained",
    content: `Vector databases are specialized databases designed to store and query high-dimensional vectors efficiently.
    
    Key concepts:
    - Embeddings: Numerical representations of data (text, images, etc.)
    - Similarity Search: Finding vectors closest to a query vector
    - Distance Metrics: Cosine similarity, Euclidean distance, dot product
    - Indexing: HNSW, IVF, and other algorithms for fast retrieval
    
    Popular vector databases include Qdrant, Pinecone, Weaviate, and Milvus. They're essential for modern AI applications like semantic search and recommendation systems.`,
    category: "Databases",
    author: "Knowledge Assistant",
    source: "Initial Dataset"
  },
  {
    title: "TypeScript Benefits",
    content: `TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript.
    
    Advantages:
    - Static Type Checking: Catch errors during development
    - Better IDE Support: Enhanced autocomplete and refactoring
    - Code Documentation: Types serve as inline documentation
    - Improved Maintainability: Easier to understand and refactor large codebases
    - Modern JavaScript Features: Use latest ECMAScript features with backwards compatibility
    
    TypeScript is widely adopted in enterprise applications and popular frameworks like Angular, React, and Vue.`,
    category: "Programming",
    author: "Knowledge Assistant",
    source: "Initial Dataset"
  },
  {
    title: "Cloud Computing Overview",
    content: `Cloud computing delivers computing services over the internet, enabling on-demand access to resources.
    
    Service models:
    - IaaS (Infrastructure as a Service): Virtual machines, storage, networks
    - PaaS (Platform as a Service): Development platforms and tools
    - SaaS (Software as a Service): Ready-to-use applications
    
    Major providers include AWS, Google Cloud, Azure, and Vercel for web applications. Benefits include scalability, cost-efficiency, and reduced infrastructure management.`,
    category: "Technology",
    author: "Knowledge Assistant",
    source: "Initial Dataset"
  },
  {
    title: "API Design Principles",
    content: `RESTful API design follows architectural constraints for building web services.
    
    Best practices:
    - Use proper HTTP methods (GET, POST, PUT, DELETE)
    - Implement consistent URL structure and naming conventions
    - Version your APIs appropriately
    - Return meaningful HTTP status codes
    - Include pagination for large datasets
    - Implement rate limiting and authentication
    - Provide comprehensive documentation
    
    Modern alternatives include GraphQL for flexible data queries and gRPC for high-performance communication.`,
    category: "Web Development",
    author: "Knowledge Assistant",
    source: "Initial Dataset"
  }
];

async function uploadDocuments() {
  console.log('🚀 Starting to populate knowledge base...\n');

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    try {
      console.log(`📄 Uploading ${i + 1}/${documents.length}: "${doc.title}"...`);
      
      const response = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doc)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ Failed: ${response.status} - ${errorText}`);
        continue;
      }

      const result = await response.json();
      console.log(`   ✅ ${result.message || 'Success'}`);
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ Knowledge base population complete!');
  console.log('🔍 Try asking questions like:');
  console.log('   - "What is machine learning?"');
  console.log('   - "Explain RAG systems"');
  console.log('   - "What are React best practices?"');
}

// Run the script
uploadDocuments().catch(console.error);

