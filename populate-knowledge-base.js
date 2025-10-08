/**
 * Script to populate Qdrant with initial knowledge base documents
 * Run with: node populate-knowledge-base.js
 */

const API_URL = 'https://knowledge-base-assistant-kedarrpandyas-projects.vercel.app';

const documents = [
  {
    title: "Employee Leave Policy",
    content: `Our comprehensive leave policy ensures work-life balance for all employees.

ANNUAL VACATION LEAVE:
- 0-2 years of service: 15 days per year
- 3-5 years of service: 20 days per year
- 6+ years of service: 25 days per year
- Vacation days accrue monthly and can be carried over (max 5 days)
- Must be requested at least 2 weeks in advance for leaves over 3 days

SICK LEAVE:
- 12 days of paid sick leave per year
- No doctor's note required for absences under 3 consecutive days
- Doctor's note required for 3+ consecutive days
- Unused sick days do not roll over

PERSONAL DAYS:
- 3 personal days per year for urgent personal matters
- Can be used with 24 hours notice
- Non-cumulative

PARENTAL LEAVE:
- 16 weeks paid maternity leave
- 8 weeks paid paternity leave
- Additional 12 weeks unpaid leave available
- Must notify HR at least 4 weeks before expected leave date

BEREAVEMENT LEAVE:
- 5 days for immediate family members
- 3 days for extended family members
- Additional unpaid leave can be requested

PUBLIC HOLIDAYS:
- All federal holidays are paid time off
- If required to work on a holiday, receive 2x pay plus compensatory day off`,
    category: "HR Policy",
    author: "HR Department",
    source: "Employee Handbook 2025"
  },
  {
    title: "How to Request Time Off",
    content: `Follow these steps to request time off from work:

STEP 1: PLAN AHEAD
- Check team calendar for conflicts
- Review project deadlines
- Ensure adequate coverage during your absence

STEP 2: SUBMIT REQUEST
- Log into HR Portal (portal.company.com/hr)
- Navigate to "Time Off" → "New Request"
- Select leave type (Vacation, Sick, Personal, etc.)
- Choose dates and enter reason
- Click "Submit for Approval"

STEP 3: MANAGER APPROVAL
- Your direct manager will receive notification
- Approval typically within 2 business days
- You'll receive email confirmation once approved

STEP 4: HANDOVER PREPARATION
- Create handover document for ongoing tasks
- Brief team members on urgent items
- Set up email auto-reply
- Update calendar with out-of-office status

EMERGENCY TIME OFF:
- Call your manager directly
- Send email to hr@company.com
- Submit formal request in portal when able

APPROVAL TIMELINE:
- Vacation (1-3 days): 24 hours notice
- Vacation (4+ days): 2 weeks notice
- Sick leave: Same day notification acceptable
- Personal days: 24 hours notice preferred

CANCELLATION:
- Can cancel approved time off up to 48 hours before start date
- Go to HR Portal → "My Requests" → "Cancel"

Contact HR at ext. 1234 or hr@company.com for any questions.`,
    category: "HR Policy",
    author: "HR Department",
    source: "Employee Handbook 2025"
  },
  {
    title: "Employee Benefits Package",
    content: `We offer a comprehensive benefits package to support employee wellbeing:

HEALTH INSURANCE:
- Premium medical coverage (80% employer paid)
- Choice of 3 plan options: PPO, HMO, or High Deductible
- Dental insurance (100% employer paid for employee)
- Vision insurance included
- Coverage effective from day one of employment
- Spouse and dependents eligible (employee contributes 30%)

RETIREMENT BENEFITS:
- 401(k) with 6% employer match
- Immediate vesting on employer contributions
- Financial planning services available free
- Option for Roth 401(k) contributions

LIFE INSURANCE:
- Basic life insurance: 2x annual salary (employer paid)
- Optional supplemental coverage available
- Accidental death and dismemberment coverage included

DISABILITY INSURANCE:
- Short-term disability: 60% salary replacement
- Long-term disability: 60% salary replacement
- Both fully employer paid

WELLNESS PROGRAMS:
- $500 annual wellness allowance
- Free gym membership or fitness class reimbursement
- Mental health support through Employee Assistance Program (EAP)
- Annual health screenings
- Meditation and mindfulness app subscriptions

PROFESSIONAL DEVELOPMENT:
- $2,000 annual learning budget per employee
- Conference attendance support
- LinkedIn Learning access
- Tuition reimbursement up to $5,000/year

WORK-LIFE BALANCE:
- Flexible work hours
- Remote work options (hybrid model)
- Sabbatical program (after 5 years)
- Free snacks and beverages in office

ADDITIONAL PERKS:
- Commuter benefits (pre-tax transit/parking)
- Employee referral bonuses ($2,000 per hire)
- Company phone and laptop
- Home office setup stipend ($1,000)

For benefits enrollment, contact benefits@company.com or visit portal.company.com/benefits`,
    category: "HR Policy",
    author: "HR Department",
    source: "Employee Handbook 2025"
  },
  {
    title: "Remote Work Policy",
    content: `Our hybrid work model supports flexibility while maintaining collaboration:

ELIGIBILITY:
- All full-time employees eligible after 3 months
- Must maintain home office meeting security standards
- Manager approval required

HYBRID SCHEDULE OPTIONS:
- Minimum 2 days in office per week (usually Tue/Thu)
- Core hours: 10 AM - 3 PM (required availability)
- Flexible start time: 7 AM - 10 AM
- Team days: Tuesdays and Thursdays are in-office collaboration days

HOME OFFICE REQUIREMENTS:
- Dedicated workspace with door for privacy
- High-speed internet (minimum 50 Mbps download)
- Ergonomic chair and desk setup
- Quiet environment for meetings
- Company will provide monitor, keyboard, mouse

EQUIPMENT:
- Company laptop (MacBook or Dell XPS)
- External monitor and accessories
- $1,000 home office setup allowance
- IT support available 7 AM - 7 PM

COMMUNICATION EXPECTATIONS:
- Respond to Slack messages within 1 hour during work hours
- Keep calendar updated with availability
- Video on for all team meetings
- Daily standup attendance (remote or in-person)

SECURITY REQUIREMENTS:
- Use company VPN when accessing internal systems
- Lock computer when away from desk
- No public WiFi for work activities
- Encrypted hard drive mandatory
- 2FA enabled on all accounts

FULL REMOTE OPTIONS:
- Available for specific roles with VP approval
- May require quarterly in-person visits
- Time zone restrictions apply (max 3 hours difference)

TEMPORARY REMOTE WORK:
- Can request fully remote for up to 4 weeks/year
- Useful for travel, family situations, etc.
- Submit request 1 week in advance

Contact it-support@company.com for equipment or vpn-help@company.com for access issues.`,
    category: "HR Policy",
    author: "HR & IT Departments",
    source: "Employee Handbook 2025"
  },
  {
    title: "Performance Review Process",
    content: `Our performance review process supports employee growth and development:

REVIEW SCHEDULE:
- Annual reviews conducted in January each year
- Mid-year check-ins in July
- New employees: 90-day review after start date
- Quarterly one-on-ones with manager (ongoing)

REVIEW COMPONENTS:
1. Self-Assessment (employee completes first)
2. Manager Evaluation
3. Peer Feedback (360° review for senior roles)
4. Goal Setting for next period

EVALUATION CRITERIA:
- Job Performance (40%): Achievement of role responsibilities
- Goals Achievement (30%): OKR completion rate
- Core Values Alignment (15%): Living company values
- Collaboration & Teamwork (15%): Cross-functional work

RATING SCALE:
- 5 - Exceptional: Consistently exceeds expectations
- 4 - Strong: Frequently exceeds expectations
- 3 - Meets Expectations: Solid, reliable performance
- 2 - Needs Improvement: Some areas require development
- 1 - Unsatisfactory: Performance concerns

COMPENSATION REVIEWS:
- Merit increases based on performance ratings
- Typical range: 3-7% for strong performers
- Promotions considered during annual review
- Bonus eligibility: Ratings of 3 or higher

PREPARATION TIPS:
- Document achievements throughout the year
- Gather metrics and concrete examples
- List key projects and impact
- Identify areas for growth
- Prepare questions for your manager

TIMELINE:
- Week 1: Self-assessment due
- Week 2-3: Manager completes evaluation
- Week 4: Review meeting scheduled
- Week 5: Goals for next year finalized

GROWTH OPPORTUNITIES:
- Individual Development Plan (IDP) created
- Training and course recommendations
- Mentorship program matching
- Stretch projects and new responsibilities

PIP (Performance Improvement Plan):
- Issued for rating of 2 or below
- 90-day structured improvement period
- Weekly check-ins with manager
- HR support and resources provided

Access review portal at reviews.company.com
Questions? Contact your manager or hr@company.com`,
    category: "HR Policy",
    author: "HR Department",
    source: "Employee Handbook 2025"
  },
  {
    title: "New Employee Onboarding Guide",
    content: `Welcome! Here's everything you need to know for your first weeks:

BEFORE DAY ONE:
- Complete I-9 and tax forms online
- Submit emergency contact information
- Review and sign employee handbook
- Choose benefits plan (deadline: 7 days after start)
- Set up direct deposit

DAY ONE CHECKLIST:
- Arrive at 9 AM, report to reception
- Receive employee badge and building access
- IT will provide laptop, phone, and credentials
- HR orientation: 9:30 AM - 11:30 AM
- Team lunch: 12:00 PM
- Meet your onboarding buddy
- Manager 1:1 at 2:00 PM

FIRST WEEK:
- Complete mandatory compliance training
- Set up all accounts (email, Slack, GitHub, etc.)
- Schedule 1:1s with team members
- Review team documentation and processes
- Attend weekly team meeting
- Complete security training

REQUIRED TRAINING (complete within 30 days):
- Information Security Basics (2 hours)
- Code of Conduct & Ethics (1 hour)
- Anti-Harassment Policy (1 hour)
- Data Privacy & GDPR (1.5 hours)
- Industry-specific compliance (if applicable)

30-DAY GOALS:
- Understand team structure and responsibilities
- Make first code contribution or complete first project
- Complete all required training modules
- Shadow team members to learn processes
- Provide onboarding feedback

60-DAY GOALS:
- Own a small project end-to-end
- Participate actively in team meetings
- Establish regular 1:1 cadence with manager
- Begin mentorship (as mentee)

90-DAY REVIEW:
- First formal performance check-in
- Discuss progress and any challenges
- Set goals for remainder of year
- Address any questions or concerns

YOUR ONBOARDING BUDDY:
- Assigned peer to help you navigate
- Go-to person for "silly questions"
- Can introduce you to other teams
- Will check in weekly for first month

KEY CONTACTS:
- IT Support: it@company.com or ext. 5555
- HR Questions: hr@company.com or ext. 1234
- Facilities: facilities@company.com or ext. 3333
- Benefits: benefits@company.com

HELPFUL RESOURCES:
- Employee Handbook: handbook.company.com
- Internal Wiki: wiki.company.com
- Learning Platform: learn.company.com
- HR Portal: portal.company.com

Welcome to the team! We're excited to have you here.`,
    category: "HR Policy",
    author: "HR Department",
    source: "Employee Handbook 2025"
  },
  {
    title: "IT Security & Acceptable Use Policy",
    content: `All employees must follow these IT security guidelines:

PASSWORD REQUIREMENTS:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Change every 90 days
- No password reuse (last 12 passwords)
- Use password manager (1Password provided)
- Enable 2FA on all company accounts

DEVICE SECURITY:
- Enable FileVault/BitLocker encryption
- Set screen lock after 5 minutes idle
- Never leave laptop unattended and unlocked
- Report lost/stolen devices immediately
- Install security updates within 48 hours
- Only company-approved software allowed

ACCEPTABLE USE:
- Company equipment for business purposes only
- Limited personal use acceptable during breaks
- No illegal downloads or pirated software
- No offensive or inappropriate content
- No sharing credentials with anyone

PROHIBITED ACTIVITIES:
- Accessing competitor confidential information
- Installing unauthorized software
- Connecting to public WiFi without VPN
- Sharing confidential data on personal devices
- Bypassing security controls
- Cryptocurrency mining

DATA CLASSIFICATION:
- Public: Can be shared externally
- Internal: Company employees only
- Confidential: Need-to-know basis
- Restricted: Highly sensitive, encrypted storage required

EMAIL SECURITY:
- Verify sender before clicking links
- Report phishing to security@company.com
- Don't open unexpected attachments
- Use encryption for confidential data
- Include appropriate disclaimers

VPN USAGE:
- Required for all remote work
- Always on when accessing company systems
- Never share VPN credentials
- Report connection issues to IT immediately

INCIDENT REPORTING:
- Suspected security breach: Call 555-0911 immediately
- Phishing attempts: Forward to security@company.com
- Lost device: Report within 1 hour
- Data breach: Notify manager and security team immediately

BYOD (Bring Your Own Device):
- Must be enrolled in MDM (Mobile Device Management)
- Company can remotely wipe if lost/stolen
- Separate work profile required
- Must meet minimum security requirements

SOCIAL MEDIA:
- Don't share confidential company information
- Include disclaimer: "Views are my own"
- No posting on behalf of company without approval
- Respect colleagues and company reputation

CONSEQUENCES:
- First violation: Written warning
- Second violation: Probation
- Serious violations: Immediate termination
- Legal action for illegal activities

Questions? Contact:
- IT Security: security@company.com
- General IT: it-support@company.com
- Policy Questions: compliance@company.com`,
    category: "IT Policy",
    author: "IT Security Team",
    source: "Employee Handbook 2025"
  },
  {
    title: "Expense Reimbursement Policy",
    content: `Guidelines for submitting business expenses for reimbursement:

ELIGIBLE EXPENSES:
- Business travel (flights, hotels, ground transportation)
- Client meals and entertainment
- Office supplies and equipment
- Professional development and training
- Internet and phone (for remote workers)
- Mileage for personal vehicle business use

SPENDING LIMITS (without pre-approval):
- Meals: $50 per person per meal
- Hotel: $200 per night domestic, $300 international
- Ground transportation: Reasonable (prefer rideshare over taxi)
- Office supplies: $100 per transaction

TRAVEL EXPENSES:
- Book through corporate travel portal when possible
- Economy class for flights under 6 hours
- Business class allowed for flights over 6 hours
- Rental cars: Mid-size or smaller (unless 3+ passengers)
- Hotels: 3-4 star, reasonably priced

MEALS & ENTERTAINMENT:
- Business purpose required (note attendees and purpose)
- Alcohol: Limited to 2 drinks, only with clients
- Receipts required for all expenses over $25
- Tip: 15-20% for meals

EXPENSE SUBMISSION:
1. Log into Expensify: expensify.company.com
2. Upload receipts (required for all expenses $25+)
3. Categorize expenses correctly
4. Add business purpose description
5. Submit within 30 days of expense date
6. Manager approval required

REIMBURSEMENT TIMELINE:
- Submitted Mon-Wed: Paid following Friday
- Submitted Thu-Sun: Paid Friday after next
- Direct deposit to account on file

MILEAGE REIMBURSEMENT:
- Current IRS rate: $0.67 per mile
- Submit starting/ending addresses
- Purpose of trip required
- Personal commute not reimbursable

HOME OFFICE:
- Internet: Up to $50/month
- Phone: Up to $75/month
- Must submit invoice or receipt
- Only for employees working remote 3+ days/week

NON-REIMBURSABLE:
- Personal entertainment
- Traffic violations and parking tickets
- Minibar charges
- In-room movies
- First class flights (unless pre-approved)
- Spouse/family travel costs
- Personal shopping

CORPORATE CREDIT CARD:
- Available for managers and frequent travelers
- Reconcile monthly in Expensify
- Pay personal charges immediately
- Late reconciliation may result in card suspension

INTERNATIONAL TRAVEL:
- Get approval 2+ weeks in advance
- Check visa requirements
- Notify finance team for currency needs
- Keep all receipts (local currency acceptable)

QUESTIONS:
- Policy: finance@company.com
- Expensify technical: expensify-support@company.com
- Pre-approval: Your manager

Violations of expense policy may result in non-reimbursement and disciplinary action.`,
    category: "Finance Policy",
    author: "Finance Department",
    source: "Employee Handbook 2025"
  },
  {
    title: "Workplace Code of Conduct",
    content: `Our code of conduct ensures a respectful, professional workplace:

CORE VALUES:
- Integrity: Be honest and ethical in all dealings
- Respect: Value diversity and treat all with dignity
- Excellence: Strive for quality in everything we do
- Collaboration: Work together toward common goals
- Innovation: Embrace new ideas and continuous improvement

PROFESSIONAL BEHAVIOR:
- Arrive on time for meetings and commitments
- Dress appropriately (business casual standard)
- Maintain professional communication
- Respect others' time and workspace
- Take ownership of mistakes and learn from them

DIVERSITY & INCLUSION:
- Zero tolerance for discrimination
- Respect all backgrounds, identities, and perspectives
- Use inclusive language
- Speak up if you witness inappropriate behavior
- Participate in D&I initiatives

HARASSMENT PREVENTION:
- No unwelcome comments about appearance, identity, or background
- No inappropriate jokes or comments
- No unwanted physical contact
- No retaliation for reporting concerns
- Immediate reporting of any harassment

CONFLICTS OF INTEREST:
- Disclose any outside business activities
- No accepting gifts over $100 from vendors
- No hiring family members without disclosure
- No competing with company business
- No use of company resources for personal gain

CONFIDENTIALITY:
- Protect proprietary information
- No discussing confidential matters in public
- Secure physical and digital documents
- Sign NDA agreements when required
- Confidentiality extends beyond employment

INTELLECTUAL PROPERTY:
- Company owns work created during employment
- Disclose any pre-existing IP before using
- Respect others' copyrights and patents
- No unauthorized use of company trademarks
- Report any IP violations

WORKPLACE SAFETY:
- Report hazards immediately
- Keep workspace clean and organized
- No weapons on company property
- Follow emergency procedures
- Report accidents within 24 hours

SUBSTANCE POLICY:
- Zero tolerance for illegal drugs
- No working while impaired
- Alcohol only at approved company events (consume responsibly)
- Medications: Inform manager if they affect performance

SOCIAL MEDIA GUIDELINES:
- Don't speak on behalf of company without authorization
- Respect confidentiality online
- Be professional when company affiliation is visible
- Report negative posts about company to PR team
- Personal opinions should be clearly identified as such

REPORTING VIOLATIONS:
- Speak to your manager first
- Contact HR: ethics@company.com
- Anonymous hotline: 1-800-ETHICS-1
- No retaliation for good faith reports
- All reports investigated promptly

INVESTIGATION PROCESS:
- HR reviews complaint within 48 hours
- Confidential investigation conducted
- Both parties interviewed
- Decision communicated within 2 weeks
- Appeals process available

CONSEQUENCES:
- Verbal warning for minor first offense
- Written warning for repeated or serious violations
- Probation or suspension for significant violations
- Termination for severe or repeated violations
- Legal action for criminal behavior

ACKNOWLEDGMENT:
- All employees must sign code of conduct annually
- Training required within 30 days of hire
- Refresher training annually
- Updates communicated via email

Questions or concerns? Contact:
- HR: hr@company.com
- Ethics Hotline: ethics@company.com
- Legal: legal@company.com

We all share responsibility for maintaining a positive workplace culture.`,
    category: "HR Policy",
    author: "HR & Legal Departments",
    source: "Employee Handbook 2025"
  },
  {
    title: "Health and Safety Policy",
    content: `Employee health and safety is our top priority:

EMERGENCY PROCEDURES:
Fire Alarm:
- Exit immediately using nearest stairwell (never elevator)
- Gather at designated meeting point (north parking lot)
- Do not re-enter until all-clear given
- Floor wardens will ensure all evacuated

Medical Emergency:
- Call 911 immediately
- Notify security at ext. 9911
- Trained first responders on each floor
- AED locations marked on floor maps
- First aid kits in all break rooms

Active Threat:
- Run: Evacuate if safe to do so
- Hide: Lock/barricade if cannot evacuate
- Fight: Only as last resort
- Call 911 when safe
- Annual active threat training required

WORKPLACE ERGONOMICS:
- Adjustable desk and chair provided
- Monitor at eye level, arm's length away
- Keyboard and mouse at elbow height
- Feet flat on floor or footrest
- Take 5-minute break every hour
- Request ergonomic assessment: ergo@company.com

INJURY REPORTING:
- Report all injuries immediately to manager
- Complete incident report within 24 hours
- Seek medical attention if needed
- Workers compensation available for work-related injuries
- Contact: safety@company.com

COVID-19 PROTOCOLS:
- Stay home if feeling unwell
- Masks optional but available
- Hand sanitizer stations throughout office
- Enhanced cleaning procedures
- Notify HR if testing positive
- Follow local health department guidance

MENTAL HEALTH SUPPORT:
- Employee Assistance Program (EAP) free and confidential
- 24/7 crisis hotline: 1-800-EMPLOYEE
- Up to 8 free counseling sessions per year
- Mental health days encouraged (use sick leave)
- Meditation room on 5th floor

INDOOR AIR QUALITY:
- HVAC systems inspected quarterly
- Air purifiers in conference rooms
- Report air quality concerns to facilities
- Temperature controlled 68-72°F
- No smoking within 25 feet of building

BUILDING SECURITY:
- Badge required for entry 24/7
- Don't tailgate or allow tailgating
- Report suspicious activity to security
- Visitor sign-in required
- After-hours access: notify security
- Lost badge: Report immediately to security@company.com

FOOD SAFETY:
- Label all food in shared fridges
- Fridges cleaned every Friday at 5 PM
- No expired food allowed
- Clean up after yourself
- Report foodborne illness to HR

SAFETY TRAINING:
- Fire safety: Annual
- First aid/CPR: Optional, company sponsored
- Ergonomics: At hire and upon request
- Active threat: Annual
- Hazmat: For facilities staff only

SAFETY COMMITTEE:
- Meets monthly to review safety issues
- Employee representatives from each department
- Submit safety suggestions to safety@company.com
- Participate in quarterly safety drills

INCIDENT INVESTIGATION:
- All incidents investigated by safety team
- Root cause analysis conducted
- Corrective actions implemented
- Lessons learned shared company-wide
- Follow-up to prevent recurrence

PERSONAL PROTECTIVE EQUIPMENT (PPE):
- Provided when required for job duties
- Training on proper use mandatory
- Replace damaged equipment immediately
- Lab coats, gloves, safety glasses available

VEHICLE SAFETY (for drivers):
- Valid driver's license required
- No texting or phone calls while driving
- Obey all traffic laws
- Report accidents immediately
- Defensive driving course available

EMERGENCY CONTACTS:
- Fire/Medical/Police: 911
- Security: ext. 9911
- Safety Team: safety@company.com
- First Aid: Trained responders on each floor
- Building Management: facilities@company.com

Your safety is everyone's responsibility. See something, say something.`,
    category: "Safety Policy",
    author: "Safety & Security Team",
    source: "Employee Handbook 2025"
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
  console.log('   - "How do I request time off?"');
  console.log('   - "What are the company leave policies?"');
  console.log('   - "Tell me about employee benefits"');
  console.log('   - "What is the remote work policy?"');
  console.log('   - "How does the performance review process work?"');
  console.log('   - "What are the expense reimbursement limits?"');
}

// Run the script
uploadDocuments().catch(console.error);

