import { LocalRAGService } from '../src/services/localRagService';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Sample documents to index
const sampleDocuments = [
  {
    id: 1,
    title: 'Vacation Policy',
    content: 'Employees receive 15 days of paid vacation per year. Vacation must be requested at least 2 weeks in advance through the HR portal. Unused vacation days can be carried over to the next year, up to a maximum of 5 days. Vacation requests are subject to manager approval and business needs.'
  },
  {
    id: 2,
    title: 'Expense Reimbursement Policy',
    content: 'To submit expense reimbursements, use the Finance Portal within 30 days of incurring the expense. Attach all receipts for expenses over $25. Provide business justification for each expense. Manager approval is required before submission. Approved expenses will be reimbursed within 10 business days via direct deposit.'
  },
  {
    id: 3,
    title: 'IT Security Best Practices',
    content: 'Information security is everyone\'s responsibility. Use strong, unique passwords for each system. Enable multi-factor authentication (MFA) wherever possible. Never share your credentials. Change passwords every 90 days. Be cautious of phishing attempts. Report suspicious emails to security@company.com. Lock your screen when away from your desk.'
  },
  {
    id: 4,
    title: 'Remote Work Policy',
    content: 'Employees may work remotely up to 3 days per week with manager approval. Remote work arrangements must be documented and reviewed quarterly. Ensure you have a secure home office setup with reliable internet. Maintain regular communication with your team. Be available during core business hours (10 AM - 3 PM). Use company-provided VPN for accessing internal systems.'
  },
  {
    id: 5,
    title: 'Employee Onboarding Guide',
    content: 'Welcome to the company! During your first week, you\'ll meet with your manager to discuss your role, responsibilities, and goals. You\'ll also attend orientation sessions covering company policies, benefits, IT setup, and workplace safety. Your IT equipment will be provided on day one. Complete all required training modules in the Learning Management System within 30 days.'
  }
];

async function loadSampleData() {
  try {
    console.log('🚀 Starting data loading process...\n');
    
    const ragService = new LocalRAGService();
    
    // Wait for service to initialize
    console.log('⏳ Waiting for services to initialize...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Services ready!\n');
    console.log('📚 Loading sample documents...\n');
    
    for (const doc of sampleDocuments) {
      console.log(`  📄 Indexing: ${doc.title}`);
      await ragService.indexDocument(doc.id, doc.content, doc.title);
      console.log(`  ✅ Indexed successfully\n`);
    }
    
    console.log('=' .repeat(60));
    console.log('✅ All sample data loaded successfully!');
    console.log('=' .repeat(60));
    console.log(`\nIndexed ${sampleDocuments.length} documents:\n`);
    sampleDocuments.forEach((doc, idx) => {
      console.log(`  ${idx + 1}. ${doc.title}`);
    });
    
    console.log('\n🎉 Ready to use! Try asking questions like:');
    console.log('   - "What is the vacation policy?"');
    console.log('   - "How do I submit expenses?"');
    console.log('   - "What are IT security best practices?"');
    console.log('   - "Tell me about remote work policy"');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    process.exit(1);
  }
}

loadSampleData();

